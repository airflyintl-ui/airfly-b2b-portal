<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    /**
     * =====================================================
     * WALLET STATEMENT
     * =====================================================
     *
     * Logged-in agent can see ONLY their own
     * wallet transactions.
     */
    public function statement(Request $request)
    {
        $agent = $request->user();

        if (!$agent) {

            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }


        /*
         * Get only logged-in agent transactions.
         */
        $statement = WalletTransaction::where(
            'agent_id',
            $agent->id
        )
            ->latest()
            ->get();


        return response()->json([

            'success' => true,

            'agent_id' =>
                $agent->id,

            'wallet' =>
                $agent->wallet,

            'statement' =>
                $statement

        ]);
    }
}