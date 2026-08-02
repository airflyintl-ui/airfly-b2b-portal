<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Recharge;
use App\Models\Agent;
use App\Models\WalletTransaction;

class RechargeController extends Controller
{
    /**
     * Agent Recharge List
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'recharges' => Recharge::with('agent')->latest()->get()
        ]);
    }

    /**
     * Submit Recharge Request
     */
    public function store(Request $request)
    {
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|max:255',
            'transaction_id' => 'required|string|max:255',
        ]);

        $recharge = Recharge::create([
            'agent_id' => $request->agent_id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'transaction_id' => $request->transaction_id,
            'status' => 'Pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Recharge Request Submitted Successfully',
            'recharge' => $recharge
        ], 201);
    }

    /**
     * Single Recharge
     */
    public function show($id)
    {
        return response()->json([
            'success' => true,
            'recharge' => Recharge::with('agent')->findOrFail($id)
        ]);
    }

    /**
     * Admin Recharge List
     */
    public function all()
    {
        return response()->json([
            'success' => true,
            'recharges' => Recharge::with('agent')->latest()->get()
        ]);
    }

    /**
     * Approve Recharge
     */
    public function approve($id)
    {
        $recharge = Recharge::findOrFail($id);

        if ($recharge->status == 'Approved') {
            return response()->json([
                'success' => false,
                'message' => 'Recharge already approved.'
            ], 422);
        }

        $agent = Agent::findOrFail($recharge->agent_id);

        $agent->wallet += $recharge->amount;
        $agent->save();

        $recharge->status = 'Approved';
        $recharge->save();

        WalletTransaction::create([
            'agent_id' => $agent->id,
            'type' => 'Credit',
            'amount' => $recharge->amount,
            'balance_after' => $agent->wallet,
            'reference' => 'Recharge-' . $recharge->id,
            'remarks' => 'Wallet Recharge'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Recharge Approved Successfully',
            'wallet_balance' => $agent->wallet
        ]);
    }

    /**
     * Reject Recharge
     */
    public function reject($id)
    {
        $recharge = Recharge::findOrFail($id);

        if ($recharge->status == 'Approved') {
            return response()->json([
                'success' => false,
                'message' => 'Approved recharge cannot be rejected.'
            ], 422);
        }

        $recharge->status = 'Rejected';
        $recharge->save();

        return response()->json([
            'success' => true,
            'message' => 'Recharge Rejected Successfully'
        ]);
    }
}