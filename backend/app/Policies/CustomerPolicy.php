<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

/**
 * Section 32 — Policy: Customer
 *
 * Enforces that authenticated users can only access customers
 * within their own organization (tenant isolation).
 */
class CustomerPolicy
{
    /**
     * Viewing a customer profile — must belong to same organization.
     */
    public function view(User $user, Customer $customer): bool
    {
        return $user->current_organization_id === $customer->organization_id;
    }

    /**
     * Updating customer details — must belong to same organization.
     */
    public function update(User $user, Customer $customer): bool
    {
        return $user->current_organization_id === $customer->organization_id;
    }

    /**
     * Deleting a customer — owner/manager only within same organization.
     */
    public function delete(User $user, Customer $customer): bool
    {
        return $user->isManager()
            && $user->current_organization_id === $customer->organization_id;
    }
}
