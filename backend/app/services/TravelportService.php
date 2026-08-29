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

                return $response->json('access_token');
            }
        );
    }

    /**
     * Search Flights
     */
    public function searchFlights(array $data): array
    {
        $token = $this->getToken();

        $passengers = [];

        $adults = (int)($data['adults'] ?? 1);
        $children = (int)($data['children'] ?? 0);
        $infants = (int)($data['infants'] ?? 0);

        if ($adults > 0) {
            $passengers[] = [
                'number' => $adults,
                'passengerTypeCode' => 'ADT'
            ];
        }

        if ($children > 0) {
            $passengers[] = [
                'number' => $children,
                'passengerTypeCode' => 'CHD'
            ];
        }

        if ($infants > 0) {
            $passengers[] = [
                'number' => $infants,
                'passengerTypeCode' => 'INF'
            ];
        }

        $segments = [
            [
                '@type' => 'SearchCriteriaFlight',
                'departureDate' => $data['departure_date'],
                'From' => [
                    'value' => strtoupper($data['from'])
                ],
                'To' => [
                    'value' => strtoupper($data['to'])
                ]
            ]
        ];

        // Round trip
        if (
            ($data['trip_type'] ?? 'oneway') === 'roundtrip'
            && !empty($data['return_date'])
        ) {
            $segments[] = [
                '@type' => 'SearchCriteriaFlight',
                'departureDate' => $data['return_date'],
                'From' => [
                    'value' => strtoupper($data['to'])
                ],
                'To' => [
                    'value' => strtoupper($data['from'])
                ]
            ];
        }

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