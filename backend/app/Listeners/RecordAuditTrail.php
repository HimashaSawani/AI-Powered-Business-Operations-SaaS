<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\AuditLogService;

class RecordAuditTrail
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function handle(OrderCreated $event): void
    {
        $order = $event->order;
        
        $this->auditLogService->log(
            action: 'ORDER_CREATED',
            entity: $order,
            summary: "Order {$order->order_number} created with total \${$order->total_amount}",
            oldValues: null,
            newValues: [
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
            ],
            organizationId: $order->organization_id,
            userId: $event->userId
        );
    }
}
