<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Order;

/**
 * Section 30 — Security Test: Multi-Tenant Isolation
 *
 * The most critical test in the entire test suite.
 * Proves that:
 *   - Company A user → Request Company B order → 403
 *   - Company A user → Request Company B customer → 403
 *   - Staff cannot access admin functions
 *   - Staff cannot modify other organizations' data
 *   - Unauthenticated users cannot access any API
 *
 * If any of these tests fail, there is a serious security vulnerability.
 */
class TenantIsolationTest extends TestCase
{
    // ══════════════════════════════════════════════════════════════════════════
    // CRITICAL: Cross-Tenant Data Access Prevention
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Company A user MUST NOT be able to access Company B's orders.
     * This is the canonical multi-tenancy security test.
     */
    public function test_company_a_user_cannot_access_company_b_order(): void
    {
        // Set up Company A
        [$userA, $orgA] = $this->createUserWithOrg('owner');

        // Set up Company B with its own customer and order
        [$userB, $orgB] = $this->createUserWithOrg('owner');
        $customerB = Customer::create([
            'organization_id' => $orgB->id,
            'name'            => 'Company B Customer',
            'email'           => 'companyb-' . uniqid() . '@test.com',
            'status'          => 'active',
            'total_orders'    => 1,
            'lifetime_value'  => 200.00,
        ]);
        $orderB = Order::create([
            'organization_id' => $orgB->id,
            'customer_id'     => $customerB->id,
            'order_number'    => 'ORD-COMPANYB-001',
            'status'          => 'completed',
            'subtotal'        => 100.00,
            'tax_amount'      => 10.00,
            'discount_amount' => 0.00,
            'total_amount'    => 110.00,
            'payment_status'  => 'paid',
        ]);

        // Authenticate AS Company A's user
        $this->actingAsUser($userA);

        // Attempt to access Company B's order
        $response = $this->getJson("/api/v1/orders/{$orderB->id}");

        // MUST be 403 Forbidden — not 200, not 404
        $response->assertStatus(403);
    }

    /**
     * Company A user MUST NOT be able to access Company B's customer data.
     */
    public function test_company_a_user_cannot_access_company_b_customer(): void
    {
        [$userA, $orgA] = $this->createUserWithOrg('owner');
        [$userB, $orgB] = $this->createUserWithOrg('owner');

        $customerB = Customer::create([
            'organization_id' => $orgB->id,
            'name'            => 'Confidential Customer',
            'email'           => 'secret-' . uniqid() . '@companyb.com',
            'status'          => 'active',
            'total_orders'    => 3,
            'lifetime_value'  => 950.00,
        ]);

        $this->actingAsUser($userA);

        $response = $this->getJson("/api/v1/customers/{$customerB->id}");

        $this->assertContains($response->status(), [403, 404]);
    }

    /**
     * Company A user MUST NOT be able to modify Company B's products.
     */
    public function test_company_a_user_cannot_modify_company_b_inventory(): void
    {
        [$userA, $orgA] = $this->createUserWithOrg('owner');
        [$userB, $orgB] = $this->createUserWithOrg('owner');

        $productB = Product::create([
            'organization_id' => $orgB->id,
            'name'            => 'Company B Product',
            'sku'             => 'COMPANYB-' . uniqid(),
            'price'           => 75.00,
            'current_stock'   => 100,
            'reorder_level'   => 10,
            'status'          => 'in_stock',
        ]);

        $this->actingAsUser($userA);

        $response = $this->postJson("/api/v1/inventory/{$productB->id}/adjust", [
            'type'     => 'PURCHASE',
            'quantity' => 500,
            'notes'    => 'Cross-tenant manipulation attempt',
        ]);

        $this->assertContains($response->status(), [403, 404]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Role-Based Access Control (RBAC)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Staff members MUST NOT access admin-only organization management endpoints.
     */
    public function test_staff_cannot_access_organization_admin_functions(): void
    {
        [$staffUser] = $this->actingAsRole('staff');

        $response = $this->getJson('/api/v1/organizations');

        $response->assertStatus(403);
    }

    /**
     * Staff members MUST NOT be able to switch to other organizations.
     */
    public function test_staff_cannot_switch_to_different_organization(): void
    {
        [$staffUser, $staffOrg] = $this->actingAsRole('staff');
        [, $otherOrg] = $this->createUserWithOrg('owner');

        $response = $this->postJson('/api/v1/auth/switch-tenant', [
            'organization_id' => $otherOrg->id,
        ]);

        // Either 403 (policy) or 422 (validation that user doesn't belong to that org)
        $this->assertContains($response->status(), [403, 422]);
    }

    /**
     * Staff members MUST NOT access audit logs (owner/manager only).
     */
    public function test_staff_cannot_access_audit_logs(): void
    {
        [$staffUser] = $this->actingAsRole('staff');

        $response = $this->getJson('/api/v1/analytics/audit-logs');

        $response->assertStatus(403);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Unauthenticated Access Prevention
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Every protected endpoint MUST return 401 when no token is provided.
     */
    public function test_unauthenticated_user_cannot_access_customers(): void
    {
        $response = $this->getJson('/api/v1/customers');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_products(): void
    {
        $response = $this->getJson('/api/v1/products');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_orders(): void
    {
        $response = $this->getJson('/api/v1/orders');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_tickets(): void
    {
        $response = $this->getJson('/api/v1/tickets');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_ai_insights(): void
    {
        $response = $this->getJson('/api/v1/ai/insights');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_create_orders(): void
    {
        $response = $this->postJson('/api/v1/orders', ['customer_id' => 1]);
        $response->assertStatus(401);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Data Listing Isolation
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * The customer list endpoint MUST only return customers from the authenticated
     * user's organization — never from other tenants.
     */
    public function test_customer_list_only_returns_own_tenant_data(): void
    {
        [$userA, $orgA] = $this->createUserWithOrg('owner');
        [$userB, $orgB] = $this->createUserWithOrg('owner');

        // Seed a customer for Org A
        Customer::create([
            'organization_id' => $orgA->id,
            'name'            => 'Org A Customer',
            'email'           => 'orga-' . uniqid() . '@test.com',
            'status'          => 'active',
            'total_orders'    => 1,
            'lifetime_value'  => 100.00,
        ]);

        // Seed a customer for Org B
        Customer::create([
            'organization_id' => $orgB->id,
            'name'            => 'Org B Secret Customer',
            'email'           => 'orgb-secret-' . uniqid() . '@test.com',
            'status'          => 'active',
            'total_orders'    => 1,
            'lifetime_value'  => 100.00,
        ]);

        // Authenticate as Org A's user
        $this->actingAsUser($userA);

        $response = $this->getJson('/api/v1/customers');
        $response->assertStatus(200);

        $names = collect($response->json('data') ?? $response->json())->pluck('name')->toArray();

        // Org B's secret customer must NOT appear in Org A's response
        $this->assertNotContains('Org B Secret Customer', $names);
        $this->assertContains('Org A Customer', $names);
    }
}
