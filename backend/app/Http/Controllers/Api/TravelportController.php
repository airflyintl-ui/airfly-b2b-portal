<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TravelportService;
use Illuminate\Support\Facades\Validator;
use Exception;

class TravelportController extends Controller
{
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',

            'departure_date' =>
                'required|date_format:Y-m-d',

            'return_date' =>
                'nullable|date_format:Y-m-d',

            'trip_type' =>
                'required|in:oneway,roundtrip',

            'adults' =>
                'required|integer|min:1|max:9',

            'children' =>
                'nullable|integer|min:0|max:9',

            'infants' =>
                'nullable|integer|min:0|max:9',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {

            $service = new TravelportService();

            $result = $service->searchFlights(
                $request->all()
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}