<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Recharge;
use App\Models\Agent;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class RechargeController extends Controller
{
    /**
     * =====================================================
     * AGENT RECHARGE LIST
     * =====================================================
     *
     * Logged-in agent can see ONLY their own recharge requests.
     */
    public function index(Request $request)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $recharges = Recharge::where(
            'agent_id',
            $agent->id
        )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'recharges' => $recharges
        ]);
    }


    /**
     * =====================================================
     * SUBMIT RECHARGE REQUEST
     * =====================================================
     *
     * Agent ID is taken from authenticated user.
     * Frontend cannot choose another agent ID.
     */
    public function store(Request $request)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $request->validate([
            'amount' => [
                'required',
                'numeric',
                'min:1'
            ],

            'payment_method' => [
                'required',
                'string',
                'max:255'
            ],

            'transaction_id' => [
                'required',
                'string',
                'max:255'
            ],

            'slip' => [
                'nullable',
                'string',
                'max:255'
            ],
        ]);


        /*
         * Create recharge request
         */
        $recharge = Recharge::create([
            'agent_id' => $agent->id,

            'amount' => $request->amount,

            'payment_method' =>
                $request->payment_method,

            'transaction_id' =>
                $request->transaction_id,

            'slip' =>
                $request->slip,

            'status' => 'Pending',
        ]);


        return response()->json([
            'success' => true,

            'message' =>
                'Recharge Request Submitted Successfully',

            'recharge' => $recharge
        ], 201);
    }


    /**
     * =====================================================
     * SINGLE AGENT RECHARGE
     * =====================================================
     *
     * Agent can only view their own recharge.
     */
    public function show(Request $request, $id)
    {
        $agent = $request->user();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }


        $recharge = Recharge::where(
            'id',
            $id
        )
            ->where(
                'agent_id',
                $agent->id
            )
            ->first();


        if (!$recharge) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Recharge not found or unauthorized'
            ], 404);
        }


        return response()->json([
            'success' => true,
            'recharge' => $recharge
        ]);
    }


    /**
     * =====================================================
     * ADMIN RECHARGE LIST
     * =====================================================
     *
     * IMPORTANT:
     * This route should later be protected
     * with admin authorization middleware.
     */
    public function all()
    {
        $recharges = Recharge::with('agent')
            ->latest()
            ->get();


        return response()->json([
            'success' => true,
            'recharges' => $recharges
        ]);
    }


    /**
     * =====================================================
     * APPROVE RECHARGE
     * =====================================================
     *
     * When admin approves:
     *
     * Recharge:
     * Pending -> Approved
     *
     * Agent wallet:
     * wallet + recharge amount
     *
     * Wallet transaction:
     * Credit transaction created
     *
     * Database transaction + row locking prevents
     * double approval.
     */
    public function approve($id)
    {
        return DB::transaction(function () use ($id) {


            /*
             * Lock recharge row.
             *
             * This prevents two admins from approving
             * the same recharge simultaneously.
             */
            $recharge = Recharge::where(
                'id',
                $id
            )
                ->lockForUpdate()
                ->first();


            if (!$recharge) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Recharge request not found'
                ], 404);
            }


            /*
             * Only Pending recharge can be approved.
             */
            if ($recharge->status !== 'Pending') {

                return response()->json([
                    'success' => false,

                    'message' =>
                        'Only Pending recharge can be approved.',

                    'current_status' =>
                        $recharge->status

                ], 422);
            }


            /*
             * Lock agent wallet row.
             */
            $agent = Agent::where(
                'id',
                $recharge->agent_id
            )
                ->lockForUpdate()
                ->first();


            if (!$agent) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Agent not found'
                ], 404);
            }


            /*
             * Add recharge amount to wallet.
             */
            $agent->wallet =
                (float) $agent->wallet
                +
                (float) $recharge->amount;


            $agent->save();


            /*
             * Update recharge status.
             */
            $recharge->status = 'Approved';

            $recharge->save();


            /*
             * Create wallet transaction.
             */
            WalletTransaction::create([

                'agent_id' =>
                    $agent->id,

                'type' =>
                    'Credit',

                'amount' =>
                    $recharge->amount,

                'balance_after' =>
                    $agent->wallet,

                'reference' =>
                    'Recharge-' .
                    $recharge->id,

                'remarks' =>
                    'Wallet Recharge Approved',
            ]);


            /*
             * Return success response.
             */
            return response()->json([

                'success' => true,

                'message' =>
                    'Recharge Approved Successfully',

                'recharge' =>
                    $recharge,

                'wallet_balance' =>
                    $agent->wallet,

            ]);
        });
    }


    /**
     * =====================================================
     * REJECT RECHARGE
     * =====================================================
     *
     * Only Pending recharge can be rejected.
     */
    public function reject($id)
    {
        return DB::transaction(function () use ($id) {


            /*
             * Lock recharge row.
             */
            $recharge = Recharge::where(
                'id',
                $id
            )
                ->lockForUpdate()
                ->first();


            if (!$recharge) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Recharge request not found'
                ], 404);
            }


            /*
             * Only Pending recharge can be rejected.
             */
            if ($recharge->status !== 'Pending') {

                return response()->json([
                    'success' => false,

                    'message' =>
                        'Only Pending recharge can be rejected.',

                    'current_status' =>
                        $recharge->status

                ], 422);
            }


            /*
             * Change status.
             */
            $recharge->status =
                'Rejected';

            $recharge->save();


            /*
             * No wallet transaction is created
             * for rejected recharge.
             */
            return response()->json([

                'success' => true,

                'message' =>
                    'Recharge Rejected Successfully',

                'recharge' =>
                    $recharge,

            ]);
        });
    }
}