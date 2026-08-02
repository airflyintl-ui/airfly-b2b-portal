<?php

return [

    'defaults' => [
        'guard' => 'web',
        'passwords' => 'agents',
    ],

    'guards' => [

        'web' => [
            'driver' => 'session',
            'provider' => 'agents',
        ],

        'sanctum' => [
            'driver' => 'sanctum',
            'provider' => 'agents',
        ],

    ],

    'providers' => [

        'agents' => [
            'driver' => 'eloquent',
            'model' => App\Models\Agent::class,
        ],

    ],

    'passwords' => [

        'agents' => [
            'provider' => 'agents',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],

    ],

    'password_timeout' => 10800,

];