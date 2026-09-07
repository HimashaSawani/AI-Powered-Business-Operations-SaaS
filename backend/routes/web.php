<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'OpsMind AI — Autonomous Business Operations API',
        'status' => 'operational',
        'version' => 'v1.0.0',
        'environment' => config('app.env'),
        'api_base_url' => url('/api/v1'),
        'endpoints' => [
            'auth' => [
                'login' => url('/api/v1/auth/login'),
                'register' => url('/api/v1/auth/register'),
                'forgot_password' => url('/api/v1/auth/forgot-password'),
                'session' => url('/api/v1/auth/me'),
            ],
            'customers' => url('/api/v1/customers'),
            'products' => url('/api/v1/products'),
            'orders' => url('/api/v1/orders'),
            'tickets' => url('/api/v1/tickets'),
            'analytics' => url('/api/v1/analytics/dashboard'),
            'ai_insights' => url('/api/v1/ai/insights'),
        ],
        'timestamp' => now()->toIso8601String(),
    ]);
});
