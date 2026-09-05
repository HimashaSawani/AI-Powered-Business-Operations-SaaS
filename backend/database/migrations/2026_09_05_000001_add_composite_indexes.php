<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_orders_org_status');
            $table->index(['organization_id', 'created_at'], 'idx_orders_org_created');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_products_org_status');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_customers_org_status');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->index(['organization_id', 'product_id'], 'idx_movements_org_product');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['organization_id', 'created_at'], 'idx_audit_org_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_org_status');
            $table->dropIndex('idx_orders_org_created');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_org_status');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('idx_customers_org_status');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropIndex('idx_movements_org_product');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_org_created');
        });
    }
};
