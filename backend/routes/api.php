<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\OrganizationController;

/*
|--------------------------------------------------------------------------
| OpsMind AI — Versioned REST API (v1)
|--------------------------------------------------------------------------
| All routes follow /api/v1/ prefix with proper RESTful conventions.
| Authenticated via Laravel Sanctum tokens.
| Multi-tenant isolation enforced via BelongsToTenant global scope.
|--------------------------------------------------------------------------
*/

// ── Public Routes ──────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('/login',  [AuthController::class, 'login']);
    });

    // ── Protected Routes (Sanctum Auth Required) ──────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth & Session Management
        Route::prefix('auth')->group(function () {
            Route::get('/me',             [AuthController::class, 'me']);
            Route::post('/logout',        [AuthController::class, 'logout']);
            Route::post('/switch-tenant', [AuthController::class, 'switchTenant']);
        });

        // Organizations (Owner / Super Admin only)
        Route::prefix('organizations')->group(function () {
            Route::get('/',    [OrganizationController::class, 'index']);
            Route::post('/',   [OrganizationController::class, 'store']);
            Route::get('/{id}',  [OrganizationController::class, 'show']);
            Route::put('/{id}',  [OrganizationController::class, 'update']);
        });

        // CRM — Customers
        Route::prefix('customers')->group(function () {
            Route::get('/',           [CustomerController::class, 'index']);
            Route::post('/',          [CustomerController::class, 'store']);
            Route::get('/{id}',       [CustomerController::class, 'show']);
            Route::put('/{id}',       [CustomerController::class, 'update']);
            Route::delete('/{id}',    [CustomerController::class, 'destroy']);
            Route::post('/{id}/notes',[CustomerController::class, 'addNote']);
        });

        // Inventory — Products & Catalog
        Route::prefix('products')->group(function () {
            Route::get('/',        [ProductController::class, 'index']);
            Route::post('/',       [ProductController::class, 'store']);
            Route::get('/{id}',    [ProductController::class, 'show']);
            Route::put('/{id}',    [ProductController::class, 'update']);
            Route::delete('/{id}', [ProductController::class, 'destroy']);
        });

        // Inventory — Movements & Adjustments
        Route::prefix('inventory')->group(function () {
            Route::get('/movements',       [ProductController::class, 'movements']);
            Route::post('/{id}/adjust',    [ProductController::class, 'adjustStock']);
        });

        // Sales — Orders
        Route::prefix('orders')->group(function () {
            Route::get('/',       [OrderController::class, 'index']);
            Route::post('/',      [OrderController::class, 'store']);
            Route::get('/{id}',   [OrderController::class, 'show']);
        });

        // Helpdesk — Support Tickets
        Route::prefix('tickets')->group(function () {
            Route::get('/',              [TicketController::class, 'index']);
            Route::post('/',             [TicketController::class, 'store']);
            Route::get('/{id}',          [TicketController::class, 'show']);
            Route::post('/{id}/reply',   [TicketController::class, 'reply']);
        });

        // Analytics & Reporting
        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard',            [DashboardController::class, 'overview']);
            Route::get('/audit-logs',           [DashboardController::class, 'auditLogs']);
            Route::get('/notifications',        [DashboardController::class, 'notifications']);
            Route::post('/notifications/{id}/read', [DashboardController::class, 'markNotificationRead']);
            Route::get('/performance',          [DashboardController::class, 'performanceMetrics']);
        });

        // AI Intelligence Layer — FastAPI Microservice Integration
        Route::prefix('ai')->group(function () {
            Route::get('/churn-overview',        [AiController::class, 'churnOverview']);
            Route::get('/forecast/{productId}',  [AiController::class, 'productForecast']);
            Route::get('/insights',              [AiController::class, 'insights']);
            Route::post('/insights/{id}/status', [AiController::class, 'updateInsightStatus']);
        });
    });
});
