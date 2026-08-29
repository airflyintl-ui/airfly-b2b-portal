<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Booking;
use App\Models\Recharge;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Total wallet balance of all agents
        $wallet = Agent::sum('wallet');

        // Total agents
        $totalAgents = Agent::count();

        // Total bookings
        $totalBookings = Booking::count();

        // Confirmed bookings
        $confirmedBookings = Booking::where(
            'booking_status',
            'Confirmed'
        )->count();

        // Cancelled bookings
        $cancelledBookings = Booking::where(
            'booking_status',
            'Cancelled'
        )->count();

        // Pending recharge
        $pendingRecharge = Recharge::where(
            'status',
            'Pending'
        )->count();

        // Latest 5 bookings
        $recentBookings = Booking::latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,

            'wallet' => (float) $wallet,

            'total_agents' => $totalAgents,

            'total_bookings' => $totalBookings,

            'confirmed_bookings' => $confirmedBookings,

            'cancelled_bookings' => $cancelledBookings,

            'pending_recharge' => $pendingRecharge,

            'recent_bookings' => $recentBookings,
        ]);
    }
}