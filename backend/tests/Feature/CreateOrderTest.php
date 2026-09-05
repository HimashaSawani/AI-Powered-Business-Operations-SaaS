<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use App\Models\Product;

/**
 * Section 30 — Feature Test: Order Creation
 *
 * Tests atomic order creation, inventory deduction, insufficient-stock rejection,
 * and total calculation accuracy.
 */
class CreateOrderTest extends TestCase
{
    private function seedProductAndCustomer(int $orgId, int $stock = 100): array
    {
        $customer = Customer::create([
            'organization_id' => $orgId,
            'name'            => 'Test Customer',
            'email'           => 'customer-' . uniqid() . '@test.com',
            'status'          => 'active',
            'total_orders'    => 0,
            'lifetime_value'  => 0.00,
        ]);

        $product = Product::create([
            'organization_id' => $orgId,
            'name'            => 'Test Product',
            'sku'             => 'TEST-' . uniqid(),
            'price'           => 50.00,
            'current_stock'   => $stock,
            'reorder_level'   => 5,
            'status'          => 'in_stock',
        ]);

        return [$customer, $product];
    }

    public function test_order_creation_returns_201_with_order_number(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        [$customer, $product] = $this->seedProductAndCustomer($org->id);

        $response = $this->postJson('/api/v1/orders', [
            'customer_id'    => $customer->id,
            'tax_rate'       => 0.10,
            'payment_method' => 'credit_card',
            'items'          => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 2,
                    'unit_price' => 50.00,
                ],
            ],
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['order_number', 'total_amount', 'status']);
    }

    public function test_order_creation_deducts_inventory(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        [$customer, $product] = $this->seedProductAndCustomer($org->id, 50);

        $this->postJson('/api/v1/orders', [
            'customer_id'    => $customer->id,
            'tax_rate'       => 0.10,
            'payment_method' => 'credit_card',
            'items'          => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 3,
                    'unit_price' => 50.00,
                ],
            ],
        ])->assertStatus(201);

        $product->refresh();

        $this->assertEquals(47, $product->current_stock);
    }

    public function test_order_total_equals_subtotal_plus_tax_minus_discount(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        [$customer, $product] = $this->seedProductAndCustomer($org->id);

        // 2 × $50 = $100 subtotal, 10% tax = $10, $5 discount → $105
        $response = $this->postJson('/api/v1/orders', [
            'customer_id'     => $customer->id,
            'tax_rate'        => 0.10,
            'discount_amount' => 5.00,
            'payment_method'  => 'credit_card',
            'items'           => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 2,
                    'unit_price' => 50.00,
                ],
            ],
        ]);

        $response->assertStatus(201);

        $data = $response->json();
        $this->assertEquals(105.00, (float) $data['total_amount']);
    }

    public function test_order_fails_with_insufficient_stock(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        [$customer, $product] = $this->seedProductAndCustomer($org->id, 5); // Only 5 in stock

        $response = $this->postJson('/api/v1/orders', [
            'customer_id'    => $customer->id,
            'tax_rate'       => 0.10,
            'payment_method' => 'credit_card',
            'items'          => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 100, // Far exceeds available stock
                    'unit_price' => 50.00,
                ],
            ],
        ]);

        $response->assertStatus(422);
    }

    public function test_order_fails_with_empty_items_array(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        [$customer] = $this->seedProductAndCustomer($org->id);

        $response = $this->postJson('/api/v1/orders', [
            'customer_id'    => $customer->id,
            'tax_rate'       => 0.10,
            'payment_method' => 'credit_card',
            'items'          => [],
        ]);

        $response->assertStatus(422);
    }

    public function test_order_creation_updates_customer_lifetime_value(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        [$customer, $product] = $this->seedProductAndCustomer($org->id);

        $this->postJson('/api/v1/orders', [
            'customer_id'    => $customer->id,
            'tax_rate'       => 0.10,
            'payment_method' => 'credit_card',
            'items'          => [
                ['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 100.00],
            ],
        ])->assertStatus(201);

        $customer->refresh();

        $this->assertGreaterThan(0, $customer->lifetime_value);
        $this->assertEquals(1, $customer->total_orders);
    }
}
