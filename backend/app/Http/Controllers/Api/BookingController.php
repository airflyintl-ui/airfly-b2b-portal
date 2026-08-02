<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\Agent;
use App\Models\WalletTransaction;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Booking List
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'bookings' => Booking::with(['agent', 'flight'])
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Create Booking
     */
    public function store(Request $request)
    {
        $request->validate([
            'agent_id'       => 'required|exists:agents,id',
            'flight_id'      => 'required|exists:flights,id',
            'passenger_name' => 'required|string|max:255',
            'passport'       => 'required|string|max:100',
            'travel_class'   => 'required|in:Economy,Business',
            'adults'         => 'required|integer|min:1',
        ]);

        $agent = Agent::findOrFail($request->agent_id);

        $flight = Flight::findOrFail($request->flight_id);

        // Seat Check
        if ($flight->available_seats < $request->adults) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough seats available.'
            ], 422);
        }

        // Fare Calculation
        $fare = $request->travel_class == 'Business'
            ? $flight->business_fare
            : $flight->economy_fare;

        $total = $fare * $request->adults;

        // Wallet Check
        if ($agent->wallet < $total) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient Wallet Balance'
            ], 422);
        }

        // Create Booking
        $booking = Booking::create([
            'agent_id' => $agent->id,
            'flight_id' => $flight->id,

            'pnr' => strtoupper(Str::random(6)),

            'passenger_name' => $request->passenger_name,
            'passport' => $request->passport,
            'nationality' => $request->nationality,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,

            'phone' => $request->phone,
            'email' => $request->email,

            'journey_type' => $request->journey_type ?? 'One Way',
            'travel_class' => $request->travel_class,

            'adults' => $request->adults,
            'children' => $request->children ?? 0,
            'infants' => $request->infants ?? 0,

            'total_amount' => $total,

            'ticket_number' => '997-' . rand(1000000000, 9999999999),

            'payment_status' => 'Paid',
            'booking_status' => 'Confirmed',
        ]);

        // Deduct Seat
        $flight->decrement('available_seats', $request->adults);

        // Deduct Wallet
        $agent->wallet -= $total;
        $agent->save();

        // Wallet Transaction
        WalletTransaction::create([
            'agent_id' => $agent->id,
            'type' => 'Debit',
            'amount' => $total,
            'balance_after' => $agent->wallet,
            'reference' => 'BOOK-' . $booking->id,
            'remarks' => 'Flight Booking',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking Created Successfully',
            'wallet_balance' => $agent->wallet,
            'booking' => $booking->load(['agent', 'flight']),
        ]);
    }

    /**
     * Show Booking
     */
    public function show($id)
    {
        return response()->json([
            'success' => true,
            'booking' => Booking::with(['agent', 'flight'])->findOrFail($id),
        ]);
    }

    /**
     * Cancel Booking
     */
    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->booking_status == 'Cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Booking already cancelled.'
            ], 422);
        }

        $agent = Agent::findOrFail($booking->agent_id);

        // Refund Wallet
        $agent->wallet += $booking->total_amount;
        $agent->save();

        WalletTransaction::create([
            'agent_id' => $agent->id,
            'type' => 'Credit',
            'amount' => $booking->total_amount,
            'balance_after' => $agent->wallet,
            'reference' => 'REFUND-' . $booking->id,
            'remarks' => 'Booking Cancel Refund',
        ]);

        // Return Seat
        $booking->flight->increment('available_seats', $booking->adults);

        $booking->booking_status = 'Cancelled';
        $booking->payment_status = 'Refunded';
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking Cancelled Successfully',
            'wallet_balance' => $agent->wallet,
        ]);
    }

    /**
     * Invoice
     */
    public function invoice($id)
    {
        return response()->json([
            'success' => true,
            'booking' => Booking::with(['agent', 'flight'])->findOrFail($id),
        ]);
    }
}