<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * =====================================================
     * AGENT REGISTER
     * =====================================================
     */
    public function register(Request $request)
    {
        // Validate registration data
        $validated = $request->validate([
            'agency_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:agents,email',
            'phone' => 'required|string|max:30',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Create new agent
        $agent = Agent::create([
            'agency_name' => $validated['agency_name'],
            'owner_name' => $validated['owner_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'wallet' => 0,
            'status' => 'active',
        ]);

        // Create Sanctum token
        $token = $agent
            ->createToken('agent-token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Agency Registered Successfully',
            'token' => $token,
            'agent' => $agent,
        ], 201);
    }


    /**
     * =====================================================
     * AGENT LOGIN
     * =====================================================
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Find agent by email
        $agent = Agent::where('email', $request->email)->first();

        // Check email/password
        if (
            !$agent ||
            !Hash::check($request->password, $agent->password)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        // Check agent status
        if ($agent->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your agency account is not active.',
            ], 403);
        }

        // Delete old tokens
        $agent->tokens()->delete();

        // Create new token
        $token = $agent
            ->createToken('agent-token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login Successful',
            'token' => $token,
            'agent' => $agent,
        ]);
    }


    /**
     * =====================================================
     * LOGOUT
     * =====================================================
     */
    public function logout(Request $request)
    {
        $agent = $request->user();

        if ($agent) {
            $agent->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout Successful',
        ]);
    }
}