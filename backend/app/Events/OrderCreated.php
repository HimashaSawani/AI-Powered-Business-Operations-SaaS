<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Domain Event: Order Created
 *
 * Fired after an order is successfully committed to the database.
 * Triggers: UpdateCustomerMetrics listener.
 */
class OrderCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Order $order)
    {
    }
}
