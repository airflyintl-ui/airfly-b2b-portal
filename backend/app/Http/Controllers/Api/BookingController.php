<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Booking List
     * Logged-in agent can see only own bookings.
     */
    public function index(Request $request)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $bookings = Booking::with(['flight'])
            ->where('agent_id', $agent->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'agent_id' => $agent->id,
            'bookings' => $bookings,
        ]);
    }


    /**
     * Create Booking
     */
    public function store(Request $request)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $validated = $request->validate([
            'flight_id'       => 'required|exists:flights,id',
            'passenger_name'  => 'required|string|max:255',
            'passport'        => 'required|string|max:100',
            'nationality'     => 'nullable|string|max:100',
            'date_of_birth'   => 'nullable|date',
            'gender'          => 'nullable|in:Male,Female,Other',
            'phone'            => 'nullable|string|max:30',
            'email'            => 'nullable|email|max:255',
            'journey_type'    => 'nullable|in:One Way,Round Trip',
            'travel_class'    => 'required|in:Economy,Business',
            'adults'          => 'required|integer|min:1',
            'children'        => 'nullable|integer|min:0',
            'infants'         => 'nullable|integer|min:0',
            'remarks'         => 'nullable|string',
        ]);

        $booking = DB::transaction(function () use ($validated, $agent) {

            /*
             * Lock agent row
             * Prevents two simultaneous bookings
             * from spending the same wallet balance.
             */
            $agent = $agent->newQuery()
                ->where('id', $agent->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * Lock flight row
             * Prevents overselling seats.
             */
            $flight = Flight::where('id', $validated['flight_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $adults = $validated['adults'];

            /*
             * Seat Check
             */
            if ($flight->available_seats < $adults) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Not enough seats available.'
                ], 422));
            }

            /*
             * Fare Calculation
             */
            $fare = $validated['travel_class'] === 'Business'
                ? $flight->business_fare
                : $flight->economy_fare;

            $total = (float) $fare * $adults;

            /*
             * Wallet Check
             */
            if ((float) $agent->wallet < $total) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Insufficient Wallet Balance',
                    'wallet_balance' => $agent->wallet,
                    'required_amount' => number_format($total, 2, '.', ''),
                ], 422));
            }

            /*
             * Generate unique PNR
             */
            do {
                $pnr = strtoupper(Str::random(6));
            } while (Booking::where('pnr', $pnr)->exists());

            /*
             * Create Booking
             */
            $booking = Booking::create([
                'agent_id' => $agent->id,
                'flight_id' => $flight->id,

                'pnr' => $pnr,

                'passenger_name' => $validated['passenger_name'],
                'passport' => $validated['passport'],
                'nationality' => $validated['nationality'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'gender' => $validated['gender'] ?? null,

                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,

                'journey_type' => $validated['journey_type'] ?? 'One Way',
                'travel_class' => $validated['travel_class'],

                'adults' => $adults,
                'children' => $validated['children'] ?? 0,
                'infants' => $validated['infants'] ?? 0,

                'total_amount' => $total,

                'ticket_number' => '997-' . random_int(
                    1000000000,
                    9999999999
                ),

                'payment_status' => 'Paid',
                'booking_status' => 'Confirmed',

                'remarks' => $validated['remarks'] ?? null,
            ]);

            /*
             * Deduct Seats
             */
            $flight->available_seats -= $adults;
            $flight->save();

            /*
             * Deduct Wallet
             */
            $agent->wallet = (float) $agent->wallet - $total;
            $agent->save();

            /*
             * Wallet Transaction
             */
            WalletTransaction::create([
                'agent_id' => $agent->id,
                'type' => 'Debit',
                'amount' => $total,
                'balance_after' => $agent->wallet,
                'reference' => 'BOOK-' . $booking->id,
                'remarks' => 'Flight Booking - PNR ' . $pnr,
            ]);

            return $booking;
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking Created Successfully',
            'wallet_balance' => $agent->fresh()->wallet,
            'booking' => $booking->load(['flight']),
        ], 201);
    }


    /**
     * Show Booking
     */
    public function show(Request $request, $id)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $booking = Booking::with(['flight'])
            ->where('agent_id', $agent->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'booking' => $booking,
        ]);
    }


    /**
     * Cancel Booking
     */
    public function cancel(Request $request, $id)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $result = DB::transaction(function () use ($agent, $id) {

            $agent = $agent->newQuery()
                ->where('id', $agent->id)
                ->lockForUpdate()
                ->firstOrFail();

            $booking = Booking::where('agent_id', $agent->id)
                ->where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($booking->booking_status === 'Cancelled') {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Booking already cancelled.'
                ], 422));
            }

            /*
             * Refund Wallet
             */
            $agent->wallet = (float) $agent->wallet
                + (float) $booking->total_amount;

            $agent->save();

            /*
             * Refund Transaction
             */
            WalletTransaction::create([
                'agent_id' => $agent->id,
                'type' => 'Credit',
                'amount' => $booking->total_amount,
                'balance_after' => $agent->wallet,
                'reference' => 'REFUND-' . $booking->id,
                'remarks' => 'Booking Cancel Refund - PNR ' . $booking->pnr,
            ]);

            /*
             * Return Seats
             */
            $flight = Flight::where('id', $booking->flight_id)
                ->lockForUpdate()
                ->firstOrFail();

            $flight->available_seats += $booking->adults;
            $flight->save();

            /*
             * Update Booking
             */
            $booking->booking_status = 'Cancelled';
            $booking->payment_status = 'Refunded';
            $booking->save();

            return [
                'booking' => $booking,
                'wallet_balance' => $agent->wallet,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking Cancelled Successfully',
            'wallet_balance' => $result['wallet_balance'],
            'booking' => $result['booking'],
        ]);
    }


    /**
     * Invoice
     */
    public function invoice(Request $request, $id)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $booking = Booking::with(['flight'])
            ->where('agent_id', $agent->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'booking' => $booking,
        ]);
    }
}