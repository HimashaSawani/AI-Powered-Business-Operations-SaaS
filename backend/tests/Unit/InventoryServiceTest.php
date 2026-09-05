<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Organization;
use App\Services\InventoryService;

/**
 * Section 30 — Unit Test: InventoryService
 *
 * Tests stock increase (PURCHASE), negative-stock rejection, and movement record creation.
 */
class InventoryServiceTest extends TestCase
{
    private InventoryService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new InventoryService();
    }

    // ── PURCHASE Movement (Stock Increase) ───────────────────────────────────

    public function test_purchase_movement_increases_stock(): void
    {
        [$user, $org] = $this->createUserWithOrg('owner');

        $product = Product::create([
            'organization_id' => $org->id,
            'name'            => 'Wireless Mouse',
            'sku'             => 'WM-TEST-' . uniqid(),
            'price'           => 29.99,
            'current_stock'   => 50,
            'reorder_level'   => 10,
            'status'          => 'in_stock',
        ]);

        $movement = $this->service->recordMovement(
            productId:      $product->id,
            type:           'PURCHASE',
            quantity:       20,
            organizationId: $org->id,
            userId:         $user->id,
            notes:          'Restocking order received'
        );

        $product->refresh();

        $this->assertEquals(70, $product->current_stock);
        $this->assertEquals(70, $movement->balance_after);
        $this->assertEquals('PURCHASE', $movement->type);
    }

    // ── Negative Stock Rejection ──────────────────────────────────────────────

    public function test_sale_movement_that_exceeds_stock_is_rejected(): void
    {
        [$user, $org] = $this->createUserWithOrg('owner');

        $product = Product::create([
            'organization_id' => $org->id,
            'name'            => 'Keyboard',
            'sku'             => 'KB-TEST-' . uniqid(),
            'price'           => 89.99,
            'current_stock'   => 5,
            'reorder_level'   => 2,
            'status'          => 'in_stock',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/negative stock/');

        $this->service->recordMovement(
            productId:      $product->id,
            type:           'SALE',
            quantity:       -10, // Would result in 5 - 10 = -5
            organizationId: $org->id,
            userId:         $user->id,
        );
    }

    // ── Movement Record Creation ──────────────────────────────────────────────

    public function test_movement_record_is_persisted_to_database(): void
    {
        [$user, $org] = $this->createUserWithOrg('owner');

        $product = Product::create([
            'organization_id' => $org->id,
            'name'            => 'USB Hub',
            'sku'             => 'HUB-TEST-' . uniqid(),
            'price'           => 39.99,
            'current_stock'   => 30,
            'reorder_level'   => 5,
            'status'          => 'in_stock',
        ]);

        $movement = $this->service->recordMovement(
            productId:      $product->id,
            type:           'ADJUSTMENT',
            quantity:       -5,
            organizationId: $org->id,
            userId:         $user->id,
            referenceType:  'ManualAudit',
            referenceId:    'AUD-001',
            notes:          'Shrinkage adjustment'
        );

        $this->assertDatabaseHas('inventory_movements', [
            'id'         => $movement->id,
            'product_id' => $product->id,
            'type'       => 'ADJUSTMENT',
            'quantity'   => -5,
        ]);
    }

    // ── Status Auto-Update ────────────────────────────────────────────────────

    public function test_product_status_updates_to_low_stock_when_stock_drops_below_reorder_level(): void
    {
        [$user, $org] = $this->createUserWithOrg('owner');

        $product = Product::create([
            'organization_id' => $org->id,
            'name'            => 'Headset',
            'sku'             => 'HS-TEST-' . uniqid(),
            'price'           => 79.99,
            'current_stock'   => 15,
            'reorder_level'   => 10,
            'status'          => 'in_stock',
        ]);

        $this->service->recordMovement(
            productId:      $product->id,
            type:           'SALE',
            quantity:       -8, // 15 - 8 = 7, below reorder_level of 10
            organizationId: $org->id,
            userId:         $user->id,
        );

        $product->refresh();

        $this->assertContains($product->status, ['low_stock', 'out_of_stock']);
    }
}
