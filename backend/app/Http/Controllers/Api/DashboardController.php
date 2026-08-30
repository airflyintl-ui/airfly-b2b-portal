<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Recharge;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Agent Dashboard
     *
     * GET /api/dashboard
     *
     * Protected by auth:sanctum
     */
    public function index(Request $request)
    {
        // ==========================================
        // GET LOGGED-IN AGENT
        // ==========================================

        $agent = $request->user();

        // ==========================================
        // AUTHENTICATION CHECK
        // ==========================================

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // ==========================================
        // TOTAL BOOKINGS FOR THIS AGENT
        // ==========================================

        $totalBookings = Booking::where(
            'agent_id',
            $agent->id
        )->count();

        // ==========================================
        // PENDING RECHARGES FOR THIS AGENT
        // ==========================================

        $pendingRecharges = Recharge::where(
            'agent_id',
            $agent->id
        )
        ->where('status', 'Pending')
        ->count();

        // ==========================================
        // APPROVED RECHARGES FOR THIS AGENT
        // ==========================================

        $approvedRecharges = Recharge::where(
            'agent_id',
            $agent->id
        )
        ->where('status', 'Approved')
        ->count();

        // ==========================================
        // LATEST 5 BOOKINGS
        // ==========================================

        $latestBookings = Booking::where(
            'agent_id',
            $agent->id
        )
        ->latest()
        ->take(5)
        ->get();

        // ==========================================
        // LATEST 5 RECHARGES
        // ==========================================

        $latestRecharges = Recharge::where(
            'agent_id',
            $agent->id
        )
        ->latest()
        ->take(5)
        ->get();

        // ==========================================
        // DASHBOARD RESPONSE
        // ==========================================

        return response()->json([
            'success' => true,

            // ======================================
            // VERSION CHECK
            // ======================================

            'api_version' => 'agent-dashboard-v2',

            // ======================================
            // LOGGED-IN AGENT
            // ======================================

            'agent' => $agent,

            // ======================================
            // DASHBOARD CARDS
            // ======================================

            'cards' => [
                'wallet_balance' => $agent->wallet,

                'total_bookings' => $totalBookings,

                'pending_recharges' => $pendingRecharges,

                'approved_recharges' => $approvedRecharges,
            ],

            // ======================================
            // LATEST BOOKINGS
            // ======================================

            'latest_bookings' => $latestBookings,

            // ======================================
            // LATEST RECHARGES
            // ======================================

            'latest_recharges' => $latestRecharges,
        ]);
    }
}