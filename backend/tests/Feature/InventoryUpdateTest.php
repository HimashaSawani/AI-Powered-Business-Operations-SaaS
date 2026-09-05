<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;

/**
 * Section 30 — Feature Test: Inventory Updates
 *
 * Tests stock adjustment via API: increase, decrease, negative-stock rejection.
 */
class InventoryUpdateTest extends TestCase
{
    private function createProduct(int $orgId, int $stock = 30): Product
    {
        return Product::create([
            'organization_id' => $orgId,
            'name'            => 'Inventory Test Product',
            'sku'             => 'INV-TEST-' . uniqid(),
            'price'           => 49.99,
            'current_stock'   => $stock,
            'reorder_level'   => 5,
            'status'          => 'in_stock',
        ]);
    }

    public function test_stock_adjustment_increases_inventory(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $product = $this->createProduct($org->id, 30);

        $response = $this->postJson("/api/v1/inventory/{$product->id}/adjust", [
            'type'     => 'PURCHASE',
            'quantity' => 20,
            'notes'    => 'Received shipment from supplier',
        ]);

        $response->assertStatus(200);

        $product->refresh();
        $this->assertEquals(50, $product->current_stock);
    }

    public function test_stock_adjustment_decreases_inventory(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $product = $this->createProduct($org->id, 30);

        $response = $this->postJson("/api/v1/inventory/{$product->id}/adjust", [
            'type'     => 'DAMAGE',
            'quantity' => -5,
            'notes'    => 'Damaged in warehouse',
        ]);

        $response->assertStatus(200);

        $product->refresh();
        $this->assertEquals(25, $product->current_stock);
    }

    public function test_movement_that_causes_negative_stock_is_rejected_with_422(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $product = $this->createProduct($org->id, 5); // Only 5 in stock

        $response = $this->postJson("/api/v1/inventory/{$product->id}/adjust", [
            'type'     => 'DAMAGE',
            'quantity' => -10, // Would result in -5
            'notes'    => 'Massive damage write-off',
        ]);

        $response->assertStatus(422);

        // Stock should remain unchanged
        $product->refresh();
        $this->assertEquals(5, $product->current_stock);
    }

    public function test_adjustment_requires_type_field(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $product = $this->createProduct($org->id);

        $response = $this->postJson("/api/v1/inventory/{$product->id}/adjust", [
            'quantity' => 10,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['type']);
    }

    public function test_adjustment_requires_quantity_field(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $product = $this->createProduct($org->id);

        $response = $this->postJson("/api/v1/inventory/{$product->id}/adjust", [
            'type' => 'PURCHASE',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['quantity']);
    }

    public function test_adjustment_creates_movement_record_in_database(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $product = $this->createProduct($org->id, 40);

        $this->postJson("/api/v1/inventory/{$product->id}/adjust", [
            'type'     => 'RETURN',
            'quantity' => 5,
            'notes'    => 'Customer return processed',
        ])->assertStatus(200);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type'       => 'RETURN',
            'quantity'   => 5,
        ]);
    }

    public function test_unauthenticated_user_cannot_adjust_inventory(): void
    {
        [$user, $org] = $this->createUserWithOrg('owner');
        $product = $this->createProduct($org->id);

        // No actingAs - no authentication
        $response = $this->postJson("/api/v1/inventory/{$product->id}/adjust", [
            'type'     => 'PURCHASE',
            'quantity' => 10,
        ]);

        $response->assertStatus(401);
    }
}
