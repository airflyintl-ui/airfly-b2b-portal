<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    /**
     * Wallet Statement
     */
    public function statement(Request $request)
    {
        $agentId = $request->agent_id;

        if (!$agentId) {

            return response()->json([
                "success"=>false,
                "message"=>"agent_id required"
            ],422);

        }

        return response()->json([

            "success"=>true,

            "statement"=>WalletTransaction::where('agent_id',$agentId)
                    ->latest()
                    ->get()

        ]);
    }
}