<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'OpsMind AI — Autonomous Business Operations API',
        'status' => 'operational',
        'version' => 'v1.0.0',
        'environment' => 'production',
        'api_base_url' => 'https://ai-powered-business-operations-saas-production.up.railway.app/api/v1',
        'endpoints' => [
            'auth' => [
                'login' => 'POST /api/v1/auth/login',
                'register' => 'POST /api/v1/auth/register',
                'logout' => 'POST /api/v1/auth/logout',
                'me' => 'GET /api/v1/auth/me'
            ],
            'customers' => 'GET /api/v1/customers',
            'products' => 'GET /api/v1/products',
            'orders' => 'GET /api/v1/orders',
            'tickets' => 'GET /api/v1/tickets',
            'analytics' => 'GET /api/v1/analytics/dashboard',
            'ai_insights' => 'GET /api/v1/ai/insights'
        ],
        'timestamp' => now()->toIso8601String()
    ]);
});
