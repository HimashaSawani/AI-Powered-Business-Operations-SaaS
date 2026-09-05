<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

/**
 * Section 32 — Policy: Order
 *
 * Enforces multi-tenant isolation: users can only access orders
 * belonging to their current organization.
 */
class OrderPolicy
{
    /**
     * View an order — must be in the same organization.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->current_organization_id === $order->organization_id;
    }

    /**
     * Cancelling or modifying an order — manager level minimum.
     */
    public function update(User $user, Order $order): bool
    {
        return $user->isManager()
            && $user->current_organization_id === $order->organization_id;
    }
}
