<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * API Metrics Middleware
 *
 * Captures per-request performance telemetry:
 * - Response time in milliseconds
 * - Endpoint, method, status code
 * - User ID and organization ID (for tenant-scoped analytics)
 *
 * Adds X-Response-Time header to every response.
 * Logs slow requests (>500ms) to the api_requests channel.
 */
class ApiMetricsMiddleware
{
    /**
     * Threshold in milliseconds above which a request is logged as "slow".
     */
    private const SLOW_REQUEST_THRESHOLD_MS = 500;

    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        /** @var Response $response */
        $response = $next($request);

        $durationMs  = (int) round((microtime(true) - $startTime) * 1000);
        $statusCode  = $response->getStatusCode();
        $userId      = optional($request->user())->id;
        $orgId       = optional($request->user())->current_organization_id;
        $endpoint    = $request->path();
        $method      = $request->method();

        // Add performance header to every response
        $response->headers->set('X-Response-Time', "{$durationMs}ms");

        // Log all API calls at debug level
        Log::channel('api_requests')->debug('API Request', [
            'method'      => $method,
            'endpoint'    => $endpoint,
            'status'      => $statusCode,
            'duration_ms' => $durationMs,
            'user_id'     => $userId,
            'org_id'      => $orgId,
            'ip'          => $request->ip(),
        ]);

        // Alert on slow requests
        if ($durationMs > self::SLOW_REQUEST_THRESHOLD_MS) {
            Log::channel('api_requests')->warning('Slow API Request detected', [
                'method'      => $method,
                'endpoint'    => $endpoint,
                'duration_ms' => $durationMs,
                'status'      => $statusCode,
                'user_id'     => $userId,
                'org_id'      => $orgId,
            ]);
        }

        // Log 5xx errors to a dedicated error channel
        if ($statusCode >= 500) {
            Log::channel('api_requests')->error('API 5xx Error', [
                'method'      => $method,
                'endpoint'    => $endpoint,
                'status'      => $statusCode,
                'duration_ms' => $durationMs,
                'user_id'     => $userId,
            ]);
        }

        return $response;
    }
}
