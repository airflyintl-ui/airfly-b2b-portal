<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Booking;
use App\Models\Recharge;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,

            'cards' => [
                'total_agents' => Agent::count(),
                'total_bookings' => Booking::count(),

                'wallet_balance' => Agent::sum('wallet'),

                'pending_recharges' => Recharge::where('status', 'Pending')->count(),

                'approved_recharges' => Recharge::where('status', 'Approved')->count(),
            ],

            'latest_bookings' => Booking::latest()
                ->take(5)
                ->get(),

            'latest_recharges' => Recharge::with('agent')
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }
}