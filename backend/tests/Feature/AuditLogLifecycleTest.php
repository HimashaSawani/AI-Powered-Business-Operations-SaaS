<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use Tests\TestCase;

class AuditLogLifecycleTest extends TestCase
{
    public function test_order_creation_triggers_immutable_audit_log(): void
    {
        [$user, $org] = $this->actingAsRole('owner');

        $customer = Customer::create([
            'organization_id' => $org->id,
            'name' => 'Audit Test Customer',
            'email' => 'audit-customer-' . uniqid() . '@test.com',
            'status' => 'active',
            'total_orders' => 0,
            'lifetime_value' => 0.00,
        ]);

        $product = Product::create([
            'organization_id' => $org->id,
            'name' => 'Audit Test Product',
            'sku' => 'AUDIT-' . uniqid(),
            'price' => 100.00,
            'current_stock' => 50,
            'reorder_level' => 5,
            'status' => 'in_stock',
        ]);

        $payload = [
            'customer_id' => $customer->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => 100.00,
                ],
            ],
            'payment_method' => 'credit_card',
        ];

        $response = $this->postJson('/api/v1/orders', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('audit_logs', [
            'organization_id' => $org->id,
            'action' => 'ORDER_CREATED',
            'entity_type' => 'Order',
        ]);
    }
}
