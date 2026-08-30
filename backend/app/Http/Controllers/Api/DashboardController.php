<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Recharge;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Logged-in agent
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // ==========================================
        // AGENT BOOKINGS
        // ==========================================

        $totalBookings = Booking::where(
            'agent_id',
            $agent->id
        )->count();

        // ==========================================
        // PENDING RECHARGES
        // ==========================================

        $pendingRecharges = Recharge::where(
            'agent_id',
            $agent->id
        )
        ->where('status', 'Pending')
        ->count();

        // ==========================================
        // APPROVED RECHARGES
        // ==========================================

        $approvedRecharges = Recharge::where(
            'agent_id',
            $agent->id
        )
        ->where('status', 'Approved')
        ->count();

        // ==========================================
        // LATEST BOOKINGS
        // ==========================================

        $latestBookings = Booking::where(
            'agent_id',
            $agent->id
        )
        ->latest()
        ->take(5)
        ->get();

        // ==========================================
        // LATEST RECHARGES
        // ==========================================

        $latestRecharges = Recharge::where(
            'agent_id',
            $agent->id
        )
        ->latest()
        ->take(5)
        ->get();

        // ==========================================
        // RESPONSE
        // ==========================================

        return response()->json([
            'success' => true,

            'agent' => $agent,

            'cards' => [
                'wallet_balance' => $agent->wallet,

                'total_bookings' => $totalBookings,

                'pending_recharges' => $pendingRecharges,

                'approved_recharges' => $approvedRecharges,
            ],

            'latest_bookings' => $latestBookings,

            'latest_recharges' => $latestRecharges,
        ]);
    }
}