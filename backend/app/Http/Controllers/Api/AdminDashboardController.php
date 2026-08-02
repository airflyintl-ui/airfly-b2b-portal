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
        $wallet = Agent::sum('wallet');

        $totalAgents = Agent::count();

        $totalBookings = Booking::count();

        $confirmedBookings = Booking::where('status', 'Confirmed')->count();

        $cancelledBookings = Booking::where('status', 'Cancelled')->count();

        $pendingRecharge = Recharge::where('status', 'Pending')->count();

        $recentBookings = Booking::latest()->take(5)->get();

        return response()->json([
            'success' => true,

            'wallet' => $wallet,

            'total_agents' => $totalAgents,

            'total_bookings' => $totalBookings,

            'confirmed_bookings' => $confirmedBookings,

            'cancelled_bookings' => $cancelledBookings,

            'pending_recharge' => $pendingRecharge,

            'recent_bookings' => $recentBookings,
        ]);
    }
}