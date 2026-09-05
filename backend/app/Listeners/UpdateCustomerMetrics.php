<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Models\Customer;

/**
 * Listener: Update Customer Metrics
 *
 * Listens to OrderCreated event.
 * Updates customer lifetime value, order count, and last order date.
 * Decoupled from the action — runs synchronously by default,
 * but can be made async via ShouldQueue for high-volume tenants.
 */
class UpdateCustomerMetrics
{
    public function handle(OrderCreated $event): void
    {
        $order    = $event->order;
        $customer = Customer::withoutGlobalScopes()->find($order->customer_id);

        if (!$customer) {
            return;
        }

        $customer->increment('total_orders');
        $customer->increment('lifetime_value', $order->total_amount);
        $customer->last_order_at = $order->created_at ?? now();
        $customer->status        = 'active';
        $customer->save();
    }
}
