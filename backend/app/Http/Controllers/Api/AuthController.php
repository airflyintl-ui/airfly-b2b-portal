<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $agent = Agent::create([
            'agency_name' => $request->agency_name,
            'owner_name' => $request->owner_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'wallet' => 0,
            'status' => 'active',
        ]);

        $token = $agent->createToken('agent-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'agent' => $agent
        ]);
    }

    public function login(Request $request)
    {
        $agent = Agent::where('email',$request->email)->first();

        if(!$agent || !Hash::check($request->password,$agent->password)){
            return response()->json([
                'success'=>false,
                'message'=>'Invalid Login'
            ],401);
        }

        $token = $agent->createToken('agent-token')->plainTextToken;

        return response()->json([
            'success'=>true,
            'token'=>$token,
            'agent'=>$agent
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success'=>true,
            'message'=>'Logout Successful'
        ]);
    }
}