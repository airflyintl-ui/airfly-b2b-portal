<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Flight;
use App\Services\TravelportService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class FlightController extends Controller
{
    /**
     * Flight List
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'flights' => Flight::with('airline')
                ->latest()
                ->get()
        ]);
    }

    /**
     * Add Flight
     */
    public function store(Request $request)
    {
        $request->validate([
            'airline_id' => 'required|exists:airlines,id',
            'flight_no' => 'required',
            'from' => 'required',
            'to' => 'required',
            'departure_time' => 'required',
            'arrival_time' => 'required',
            'economy_fare' => 'required|numeric',
            'business_fare' => 'required|numeric',
            'available_seats' => 'required|integer',
        ]);

        $flight = Flight::create([
            'airline_id' => $request->airline_id,
            'flight_no' => strtoupper($request->flight_no),
            'from' => strtoupper($request->from),
            'to' => strtoupper($request->to),
            'departure_time' => $request->departure_time,
            'arrival_time' => $request->arrival_time,
            'economy_fare' => $request->economy_fare,
            'business_fare' => $request->business_fare,
            'available_seats' => $request->available_seats,
            'status' => 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Flight Added Successfully',
            'flight' => $flight
        ]);
    }

    /**
     * Flight Search
     * One Way, Round Trip and Multi-City
     */
    public function search(
        Request $request,
        TravelportService $travelport
    ) {
        /*
        |--------------------------------------------------------------------------
        | Basic Validation
        |--------------------------------------------------------------------------
        */

        $validator = Validator::make($request->all(), [

            'trip_type' => 'required|in:oneway,roundtrip,multicity',

            'adults' => 'nullable|integer|min:1|max:9',

            'children' => 'nullable|integer|min:0|max:9',

            'infants' => 'nullable|integer|min:0|max:9',

            // One Way and Round Trip
            'from' => 'required_unless:trip_type,multicity|string|size:3',

            'to' => 'required_unless:trip_type,multicity|string|size:3',

            'departure_date' => 'required_unless:trip_type,multicity|date_format:Y-m-d',

            'return_date' => 'required_if:trip_type,roundtrip|nullable|date_format:Y-m-d',

            // Multi-City
            'segments' => 'required_if:trip_type,multicity|array|min:2|max:6',

            'segments.*.from' => 'required_if:trip_type,multicity|string|size:3',

            'segments.*.to' => 'required_if:trip_type,multicity|string|size:3',

            'segments.*.departure_date' => 'required_if:trip_type,multicity|date_format:Y-m-d',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check your flight search information.',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        /*
        |--------------------------------------------------------------------------
        | Passenger Counts
        |--------------------------------------------------------------------------
        */

        $adults = (int)($data['adults'] ?? 1);
        $children = (int)($data['children'] ?? 0);
        $infants = (int)($data['infants'] ?? 0);

        if ($infants > $adults) {
            return response()->json([
                'success' => false,
                'message' => 'Infants cannot exceed adults.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Normalize and Validate Segments
        |--------------------------------------------------------------------------
        */

        $tripType = $data['trip_type'];

        if ($tripType === 'multicity') {

            $segments = [];

            foreach ($data['segments'] as $index => $segment) {

                $from = strtoupper(trim($segment['from']));
                $to = strtoupper(trim($segment['to']));
                $date = $segment['departure_date'];

                if ($from === $to) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Origin and destination cannot be the same in segment ' . ($index + 1) . '.'
                    ], 422);
                }

                $segments[] = [
                    'from' => $from,
                    'to' => $to,
                    'departure_date' => $date,
                ];
            }

            // Check chronological order of segment dates
            for ($i = 1; $i < count($segments); $i++) {

                if (
                    $segments[$i]['departure_date'] <
                    $segments[$i - 1]['departure_date']
                ) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Multi-City departure dates must be in chronological order.'
                    ], 422);
                }
            }

            $data['segments'] = $segments;

        } else {

            $from = strtoupper(trim($data['from']));
            $to = strtoupper(trim($data['to']));

            if ($from === $to) {
                return response()->json([
                    'success' => false,
                    'message' => 'Origin and destination cannot be the same.'
                ], 422);
            }

            $data['from'] = $from;
            $data['to'] = $to;
        }

        /*
        |--------------------------------------------------------------------------
        | Search Travelport
        |--------------------------------------------------------------------------
        */

        try {

            $searchData = array_merge($data, [
                'adults' => $adults,
                'children' => $children,
                'infants' => $infants,
            ]);

            $result = $travelport->searchFlights($searchData);

            return response()->json([

                'success' => true,

                'source' => 'Travelport GDS',

                'search' => $searchData,

                'data' => $result,

            ]);

        } catch (\Throwable $e) {

            Log::error('Travelport Flight Search Error', [

                'message' => $e->getMessage(),

                'trip_type' => $tripType,

                'search' => $data,

            ]);

            return response()->json([

                'success' => false,

                'source' => 'Travelport GDS',

                'message' => 'Unable to search flights from Travelport GDS.',

                'error' => config('app.debug')
                    ? $e->getMessage()
                    : null,

            ], 500);
        }
    }

    /**
     * Single Flight
     */
    public function show($id)
    {
        return response()->json([
            'success' => true,
            'flight' => Flight::with('airline')->findOrFail($id)
        ]);
    }

    /**
     * Update Flight
     */
    public function update(Request $request, $id)
    {
        $flight = Flight::findOrFail($id);

        $flight->update([
            'airline_id' => $request->airline_id,
            'flight_no' => $request->flight_no,
            'from' => strtoupper($request->from),
            'to' => strtoupper($request->to),
            'departure_time' => $request->departure_time,
            'arrival_time' => $request->arrival_time,
            'economy_fare' => $request->economy_fare,
            'business_fare' => $request->business_fare,
            'available_seats' => $request->available_seats,
            'status' => $request->status ?? 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Flight Updated Successfully',
            'flight' => $flight
        ]);
    }

    /**
     * Delete Flight
     */
    public function destroy($id)
    {
        $flight = Flight::findOrFail($id);

        $flight->delete();

        return response()->json([
            'success' => true,
            'message' => 'Flight Deleted Successfully'
        ]);
    }
}
