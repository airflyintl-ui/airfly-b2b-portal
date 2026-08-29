<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Flight;
use App\Models\Airline;
use App\Services\TravelportService;

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

            'flight_no' =>
                strtoupper($request->flight_no),

            'from' =>
                strtoupper($request->from),

            'to' =>
                strtoupper($request->to),

            'departure_time' =>
                $request->departure_time,

            'arrival_time' =>
                $request->arrival_time,

            'economy_fare' =>
                $request->economy_fare,

            'business_fare' =>
                $request->business_fare,

            'available_seats' =>
                $request->available_seats,

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
     *
     * This endpoint searches LIVE flights
     * from Travelport GDS.
     *
     * Route:
     * POST /api/search-flight
     */
    public function search(
        Request $request,
        TravelportService $travelport
    ) {
        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $request->validate([

            'from' =>
                'required|string|size:3',

            'to' =>
                'required|string|size:3',

            /*
            | Frontend can send either:
            | date
            | OR
            | departure_date
            */

            'date' =>
                'nullable|date_format:Y-m-d',

            'departure_date' =>
                'nullable|date_format:Y-m-d',

            'return_date' =>
                'nullable|date_format:Y-m-d',

            'trip_type' =>
                'nullable|in:oneway,roundtrip',

            'adults' =>
                'nullable|integer|min:1|max:9',

            'children' =>
                'nullable|integer|min:0|max:9',

            'infants' =>
                'nullable|integer|min:0|max:9',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Departure Date
        |--------------------------------------------------------------------------
        */

        $departureDate =
            $request->departure_date
            ?? $request->date;


        if (!$departureDate) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Departure date is required.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Trip Type
        |--------------------------------------------------------------------------
        */

        $tripType =
            $request->trip_type ?? 'oneway';


        /*
        |--------------------------------------------------------------------------
        | Round Trip Validation
        |--------------------------------------------------------------------------
        */

        if (
            $tripType === 'roundtrip'
            &&
            !$request->return_date
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Return date is required for round trip.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Airport Codes
        |--------------------------------------------------------------------------
        */

        $from =
            strtoupper(trim($request->from));

        $to =
            strtoupper(trim($request->to));


        /*
        |--------------------------------------------------------------------------
        | Prevent same airport search
        |--------------------------------------------------------------------------
        */

        if ($from === $to) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Origin and destination cannot be the same.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Passenger Counts
        |--------------------------------------------------------------------------
        */

        $adults =
            (int)($request->adults ?? 1);

        $children =
            (int)($request->children ?? 0);

        $infants =
            (int)($request->infants ?? 0);


        /*
        |--------------------------------------------------------------------------
        | Infant cannot exceed adult
        |--------------------------------------------------------------------------
        */

        if ($infants > $adults) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Number of infants cannot exceed number of adults.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Search Travelport
        |--------------------------------------------------------------------------
        */

        try {

            $result =
                $travelport->searchFlights([

                    'from' =>
                        $from,

                    'to' =>
                        $to,

                    'departure_date' =>
                        $departureDate,

                    'return_date' =>
                        $request->return_date,

                    'trip_type' =>
                        $tripType,

                    'adults' =>
                        $adults,

                    'children' =>
                        $children,

                    'infants' =>
                        $infants,
                ]);


            /*
            |--------------------------------------------------------------------------
            | Successful Response
            |--------------------------------------------------------------------------
            */

            return response()->json([

                'success' => true,

                'source' =>
                    'Travelport GDS',

                'search' => [

                    'from' =>
                        $from,

                    'to' =>
                        $to,

                    'departure_date' =>
                        $departureDate,

                    'return_date' =>
                        $request->return_date,

                    'trip_type' =>
                        $tripType,

                    'adults' =>
                        $adults,

                    'children' =>
                        $children,

                    'infants' =>
                        $infants,
                ],

                'data' =>
                    $result,
            ]);


        } catch (\Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | Log Error
            |--------------------------------------------------------------------------
            */

            \Log::error(
                'Travelport Flight Search Error',
                [

                    'message' =>
                        $e->getMessage(),

                    'from' =>
                        $from,

                    'to' =>
                        $to,

                    'departure_date' =>
                        $departureDate,

                    'return_date' =>
                        $request->return_date,

                    'trip_type' =>
                        $tripType,

                    'adults' =>
                        $adults,

                    'children' =>
                        $children,

                    'infants' =>
                        $infants,
                ]
            );


            /*
            |--------------------------------------------------------------------------
            | Error Response
            |--------------------------------------------------------------------------
            */

            return response()->json([

                'success' => false,

                'source' =>
                    'Travelport GDS',

                'message' =>
                    'Unable to search flights from Travelport GDS.',

                /*
                |--------------------------------------------------------------------------
                | Show actual error only when APP_DEBUG=true
                |--------------------------------------------------------------------------
                */

                'error' =>
                    config('app.debug')
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

            'flight' =>
                Flight::with('airline')
                    ->findOrFail($id)
        ]);
    }


    /**
     * Update Flight
     */
    public function update(
        Request $request,
        $id
    ) {
        $flight =
            Flight::findOrFail($id);


        $flight->update([

            'airline_id' =>
                $request->airline_id,

            'flight_no' =>
                $request->flight_no,

            'from' =>
                strtoupper($request->from),

            'to' =>
                strtoupper($request->to),

            'departure_time' =>
                $request->departure_time,

            'arrival_time' =>
                $request->arrival_time,

            'economy_fare' =>
                $request->economy_fare,

            'business_fare' =>
                $request->business_fare,

            'available_seats' =>
                $request->available_seats,

            'status' =>
                $request->status ?? 1,
        ]);


        return response()->json([

            'success' => true,

            'message' =>
                'Flight Updated Successfully',

            'flight' =>
                $flight
        ]);
    }


    /**
     * Delete Flight
     */
    public function destroy($id)
    {
        $flight =
            Flight::findOrFail($id);


        $flight->delete();


        return response()->json([

            'success' => true,

            'message' =>
                'Flight Deleted Successfully'
        ]);
    }
}