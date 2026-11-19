<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !$user->currentAccessToken()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        if (!$user->currentAccessToken()->can('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Admin access only',
            ], 403);
        }

        return $next($request);
    }
}
