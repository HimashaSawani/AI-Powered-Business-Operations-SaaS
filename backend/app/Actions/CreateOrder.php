<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\Order;
use App\Events\OrderCreated as OrderCreatedEvent;
use App\Services\OrderService;
use Illuminate\Support\Facades\Request;

/**
 * Section 32 — Action: Create Order
 *
 * Single-purpose action that orchestrates order creation:
 * 1. Calls OrderService for the atomic DB transaction
 * 2. Fires the OrderCreated domain event
 * 3. Writes an immutable audit log entry
 */
class CreateOrder
{
    public function __construct(private OrderService $orderService)
    {
    }

    public function execute(array $payload, int $organizationId, ?int $userId = null): Order
    {
        // 1. Atomic order creation via service (inventory deduction, payments, LTV update)
        $order = $this->orderService->createOrderWithTransaction($payload, $organizationId, $userId);

        // 2. Raise domain event (triggers UpdateCustomerMetrics listener)
        event(new OrderCreatedEvent($order));

        // 3. Write immutable audit trail
        AuditLog::create([
            'organization_id' => $organizationId,
            'user_id'         => $userId,
            'action'          => 'order_create',
            'entity_type'     => 'Order',
            'entity_id'       => $order->order_number,
            'summary'         => "Order {$order->order_number} created for customer #{$order->customer_id}. Total: \${$order->total_amount}",
            'old_values'      => [],
            'new_values'      => [
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'status'       => $order->status,
            ],
            'ip_address'      => Request::ip(),
        ]);

        return $order;
    }
}
