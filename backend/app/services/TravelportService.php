<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Exception;

class TravelportService
{
    private string $authUrl;
    private string $apiUrl;

    public function __construct()
    {
        $production = env('TRAVELPORT_ENV', 'production') === 'production';

        $this->authUrl = $production
            ? 'https://auth.travelport.net/oauth/token'
            : 'https://auth.pp.travelport.net/oauth/token';

        $this->apiUrl = $production
            ? 'https://api.travelport.net/11/air'
            : 'https://api.pp.travelport.net/11/air';
    }

    /**
     * Get Travelport OAuth Token
     */
    private function getToken(): string
    {
        return Cache::remember(
            'travelport_access_token',
            now()->addHours(23),
            function () {

                $response = Http::asForm()
                    ->post($this->authUrl, [
                        'grant_type' => 'password',
                        'username' => env('TRAVELPORT_USERNAME'),
                        'password' => env('TRAVELPORT_PASSWORD'),
                        'client_id' => env('TRAVELPORT_CLIENT_ID'),
                        'client_secret' => env('TRAVELPORT_CLIENT_SECRET'),
                    ]);

                if (!$response->successful()) {
                    throw new Exception(
                        'Travelport authentication failed: ' .
                        $response->body()
                    );
                }

                $token = $response->json('access_token');

                if (!$token) {
                    throw new Exception(
                        'Travelport access token was not received.'
                    );
                }

                return $token;
            }
        );
    }

    /**
     * Search Flights: One Way, Round Trip and Multi-City
     */
    public function searchFlights(array $data): array
    {
        $token = $this->getToken();

        /*
        |--------------------------------------------------------------------------
        | Passenger Criteria
        |--------------------------------------------------------------------------
        */

        $passengers = [];

        $adults = (int)($data['adults'] ?? 1);
        $children = (int)($data['children'] ?? 0);
        $infants = (int)($data['infants'] ?? 0);

        if ($adults > 0) {
            $passengers[] = [
                '@type' => 'PassengerCriteria',
                'number' => $adults,
                'passengerTypeCode' => 'ADT'
            ];
        }

        if ($children > 0) {
            $passengers[] = [
                '@type' => 'PassengerCriteria',
                'number' => $children,
                'passengerTypeCode' => 'CHD'
            ];
        }

        if ($infants > 0) {
            $passengers[] = [
                '@type' => 'PassengerCriteria',
                'number' => $infants,
                'passengerTypeCode' => 'INF'
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Build Flight Segments
        |--------------------------------------------------------------------------
        */

        $tripType = $data['trip_type'] ?? 'oneway';

        $segments = [];

        // Multi-City
        if ($tripType === 'multicity') {

            if (
                empty($data['segments']) ||
                !is_array($data['segments'])
            ) {
                throw new Exception(
                    'Multi-City flight segments are required.'
                );
            }

            if (
                count($data['segments']) < 2 ||
                count($data['segments']) > 6
            ) {
                throw new Exception(
                    'Multi-City search requires 2 to 6 segments.'
                );
            }

            foreach ($data['segments'] as $segment) {

                $from = strtoupper(trim($segment['from'] ?? ''));
                $to = strtoupper(trim($segment['to'] ?? ''));
                $date = $segment['departure_date'] ?? '';

                if (
                    !preg_match('/^[A-Z]{3}$/', $from) ||
                    !preg_match('/^[A-Z]{3}$/', $to)
                ) {
                    throw new Exception(
                        'Invalid airport code in Multi-City segment.'
                    );
                }

                if ($from === $to) {
                    throw new Exception(
                        'Origin and destination cannot be the same.'
                    );
                }

                if (
                    !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ||
                    !checkdate(
                        (int)substr($date, 5, 2),
                        (int)substr($date, 8, 2),
                        (int)substr($date, 0, 4)
                    )
                ) {
                    throw new Exception(
                        'Invalid departure date in Multi-City segment.'
                    );
                }

                $segments[] = [
                    '@type' => 'SearchCriteriaFlight',
                    'departureDate' => $date,
                    'From' => [
                        'value' => $from
                    ],
                    'To' => [
                        'value' => $to
                    ]
                ];
            }
        }

        // One Way and Round Trip
        else {

            $from = strtoupper(trim($data['from'] ?? ''));
            $to = strtoupper(trim($data['to'] ?? ''));
            $departureDate = $data['departure_date'] ?? '';

            if ($from === $to) {
                throw new Exception(
                    'Origin and destination cannot be the same.'
                );
            }

            $segments[] = [
                '@type' => 'SearchCriteriaFlight',
                'departureDate' => $departureDate,
                'From' => [
                    'value' => $from
                ],
                'To' => [
                    'value' => $to
                ]
            ];

            if (
                $tripType === 'roundtrip' &&
                !empty($data['return_date'])
            ) {
                $segments[] = [
                    '@type' => 'SearchCriteriaFlight',
                    'departureDate' => $data['return_date'],
                    'From' => [
                        'value' => $to
                    ],
                    'To' => [
                        'value' => $from
                    ]
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Travelport Request Payload
        |--------------------------------------------------------------------------
        */

        $payload = [
            'CatalogProductOfferingsQueryRequest' => [

                '@type' => 'CatalogProductOfferingsQueryRequest',

                'CatalogProductOfferingsRequest' => [

                    '@type' => 'CatalogProductOfferingsRequestAir',

                    'offersPerPage' => 50,

                    'PassengerCriteria' => $passengers,

                    'SearchCriteriaFlight' => $segments,
                ]
            ]
        ];

        /*
        |--------------------------------------------------------------------------
        | Send Request to Travelport
        |--------------------------------------------------------------------------
        */

        $response = Http::withHeaders([

            'Accept' => 'application/json',

            'Content-Type' => 'application/json',

            'Authorization' => 'Bearer ' . $token,

            'XAUTH_TRAVELPORT_ACCESSGROUP' =>
                env('TRAVELPORT_ACCESS_GROUP'),

            'TVP-PCC-CORE' =>
                env('TRAVELPORT_PCC') . '_' .
                env('TRAVELPORT_GDS'),

            'Accept-Version' => '11',

            'Content-Version' => '11',

            'Cache-Control' => 'no-cache',

            'Accept-Encoding' => 'gzip, deflate',

        ])
        ->timeout(60)
        ->post(
            $this->apiUrl .
            '/catalog/search/catalogproductofferings',
            $payload
        );

        if (!$response->successful()) {
            throw new Exception(
                'Travelport search failed: ' .
                $response->body()
            );
        }

        return $response->json();
    }
}
