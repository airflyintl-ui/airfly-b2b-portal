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
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $agentId = $agent->id;

        return response()->json([
            'success' => true,

            'agent' => [
                'id' => $agent->id,
                'agency_name' => $agent->agency_name,
                'owner_name' => $agent->owner_name,
                'email' => $agent->email,
                'phone' => $agent->phone,
                'wallet' => $agent->wallet,
                'status' => $agent->status,
            ],

            'cards' => [
                'wallet_balance' => $agent->wallet,

                'total_bookings' => Booking::where(
                    'agent_id',
                    $agentId
                )->count(),

                'pending_recharges' => Recharge::where(
                    'agent_id',
                    $agentId
                )
                    ->where('status', 'Pending')
                    ->count(),

                'approved_recharges' => Recharge::where(
                    'agent_id',
                    $agentId
                )
                    ->where('status', 'Approved')
                    ->count(),
            ],

            'latest_bookings' => Booking::where(
                'agent_id',
                $agentId
            )
                ->latest()
                ->take(5)
                ->get(),

            'latest_recharges' => Recharge::where(
                'agent_id',
                $agentId
            )
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }
}