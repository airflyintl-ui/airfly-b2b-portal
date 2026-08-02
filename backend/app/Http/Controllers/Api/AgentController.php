<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Agent;
use Illuminate\Support\Facades\Hash;

class AgentController extends Controller
{
    // GET /api/agents
    public function index()
    {
        return response()->json([
            "success" => true,
            "agents" => Agent::latest()->get()
        ]);
    }

    // POST /api/agents
    public function store(Request $request)
    {
        $request->validate([
            'agency_name' => 'required',
            'owner_name' => 'required',
            'email' => 'required|email|unique:agents,email',
            'phone' => 'required',
            'password' => 'required|min:6',
        ]);

        $agent = Agent::create([
            'agency_name' => $request->agency_name,
            'owner_name' => $request->owner_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'wallet' => 0,
            'status' => 'active',
        ]);

        return response()->json([
            "success" => true,
            "message" => "Agent Created Successfully",
            "agent" => $agent
        ]);
    }

    // GET /api/agents/{id}
    public function show($id)
    {
        return response()->json([
            "success" => true,
            "agent" => Agent::findOrFail($id)
        ]);
    }

    // PUT /api/agents/{id}
    public function update(Request $request, $id)
    {
        $agent = Agent::findOrFail($id);

        $request->validate([
            'agency_name' => 'required',
            'owner_name' => 'required',
            'email' => 'required|email|unique:agents,email,' . $id,
            'phone' => 'required',
        ]);

        $agent->update([
            'agency_name' => $request->agency_name,
            'owner_name' => $request->owner_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => $request->status,
        ]);

        return response()->json([
            "success" => true,
            "message" => "Agent Updated Successfully",
            "agent" => $agent
        ]);
    }

    // DELETE /api/agents/{id}
    public function destroy($id)
    {
        Agent::findOrFail($id)->delete();

        return response()->json([
            "success" => true,
            "message" => "Agent Deleted Successfully"
        ]);
    }
}