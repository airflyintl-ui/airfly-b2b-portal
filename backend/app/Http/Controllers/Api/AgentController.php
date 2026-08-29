<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AgentController extends Controller
{
    /**
     * POST /api/register
     *
     * Register a new agency.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'agency_name' => 'required|string|max:255',
            'owner_name'  => 'required|string|max:255',
            'email'       => 'required|email|max:255|unique:agents,email',
            'phone'       => 'required|string|max:30',
            'password'    => 'required|string|min:6',
        ]);

        $agent = Agent::create([
            'agency_name' => $validated['agency_name'],
            'owner_name'  => $validated['owner_name'],
            'email'       => $validated['email'],
            'phone'       => $validated['phone'],
            'password'    => Hash::make($validated['password']),
            'wallet'      => 0,
            'status'      => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agency registration submitted successfully. Please wait for approval.',
            'agent' => $agent,
        ], 201);
    }

    /**
     * POST /api/login
     *
     * Login agent.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $agent = Agent::where('email', $request->email)->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!Hash::check($request->password, $agent->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if ($agent->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your agency account is not active yet.',
                'status' => $agent->status,
            ], 403);
        }

        // Delete previous tokens
        $agent->tokens()->delete();

        // Create new Sanctum token
        $token = $agent->createToken('agent-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $token,
            'agent' => $agent,
        ]);
    }

    /**
     * GET /api/agents
     *
     * Get all agents.
     */
    public function index()
    {
        $agents = Agent::latest()->get();

        return response()->json([
            'success' => true,
            'agents' => $agents,
        ]);
    }

    /**
     * GET /api/agents/{id}
     *
     * Get one agent.
     */
    public function show($id)
    {
        $agent = Agent::find($id);

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'agent' => $agent,
        ]);
    }

    /**
     * PUT /api/agents/{id}
     *
     * Update agent.
     */
    public function update(Request $request, $id)
    {
        $agent = Agent::find($id);

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent not found.',
            ], 404);
        }

        $validated = $request->validate([
            'agency_name' => 'sometimes|string|max:255',
            'owner_name'  => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|max:255|unique:agents,email,' . $agent->id,
            'phone'       => 'sometimes|string|max:30',
            'status'      => 'sometimes|in:pending,active,inactive,rejected',
        ]);

        $agent->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Agent updated successfully.',
            'agent' => $agent,
        ]);
    }

    /**
     * POST /api/logout
     *
     * Logout current agent.
     */
    public function logout(Request $request)
    {
        $agent = $request->user();

        if ($agent) {
            $agent->currentAccessToken()?->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}