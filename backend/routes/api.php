<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\RechargeController;
use App\Http\Controllers\Api\AirlineController;
use App\Http\Controllers\Api\WalletController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ======================================================
// API TEST
// ======================================================

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'AirFly API Working Successfully'
    ]);
});

// ======================================================
// AUTH
// ======================================================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ======================================================
// ADMIN DASHBOARD
// ======================================================

Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);

// ======================================================
// AGENTS
// ======================================================

Route::get('/agents', [AgentController::class, 'index']);
Route::post('/agents', [AgentController::class, 'store']);
Route::get('/agents/{id}', [AgentController::class, 'show']);
Route::put('/agents/{id}', [AgentController::class, 'update']);
Route::delete('/agents/{id}', [AgentController::class, 'destroy']);

// ======================================================
// AIRLINES
// ======================================================

Route::get('/airlines', [AirlineController::class, 'index']);
Route::post('/airlines', [AirlineController::class, 'store']);
Route::get('/airlines/{id}', [AirlineController::class, 'show']);
Route::put('/airlines/{id}', [AirlineController::class, 'update']);
Route::delete('/airlines/{id}', [AirlineController::class, 'destroy']);

// ======================================================
// FLIGHTS
// ======================================================

Route::get('/flights', [FlightController::class, 'index']);
Route::post('/flights', [FlightController::class, 'store']);
Route::get('/flights/{id}', [FlightController::class, 'show']);
Route::put('/flights/{id}', [FlightController::class, 'update']);
Route::delete('/flights/{id}', [FlightController::class, 'destroy']);

Route::post('/search-flight', [FlightController::class, 'search']);

// ======================================================
// BOOKINGS
// ======================================================

Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/{id}', [BookingController::class, 'show']);
Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
Route::get('/bookings/{id}/invoice', [BookingController::class, 'invoice']);

// ======================================================
// RECHARGES
// ======================================================

Route::get('/recharges', [RechargeController::class, 'index']);
Route::post('/recharges', [RechargeController::class, 'store']);
Route::get('/recharges/{id}', [RechargeController::class, 'show']);

Route::get('/admin/recharges', [RechargeController::class, 'all']);
Route::post('/recharges/{id}/approve', [RechargeController::class, 'approve']);
Route::post('/recharges/{id}/reject', [RechargeController::class, 'reject']);

// ======================================================
// WALLET (Public for Development)
// ======================================================

Route::get('/wallet/statement', [WalletController::class, 'statement']);

// ======================================================
// PROTECTED ROUTES
// ======================================================

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

});