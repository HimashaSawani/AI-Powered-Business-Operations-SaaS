<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Exception;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request)
    {
        $query = Order::with(['customer', 'items.product', 'payments'])->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|integer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $orgId = $request->user()->current_organization_id ?? 1;
        $userId = $request->user()->id ?? null;

        try {
            $order = $this->orderService->createOrderWithTransaction($validated, $orgId, $userId);
            // Return flat order object directly so tests and frontend can access order_number, total_amount etc.
            return response()->json($order->load(['customer', 'items.product', 'payments']), 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Order processing failed and was rolled back.',
                'details' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(Request $request, $id)
    {
        // Use withoutGlobalScopes to bypass BelongsToTenant scope,
        // then manually enforce the tenant check to return 403 (not 404) for cross-tenant access.
        $order = Order::withoutGlobalScopes()->with(['customer', 'items.product', 'payments', 'user'])->findOrFail($id);

        $orgId = $request->user()->current_organization_id;
        if ($order->organization_id !== $orgId) {
            return response()->json(['message' => 'Forbidden. This order does not belong to your organization.'], 403);
        }

        return response()->json($order);
    }
}
