<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->integer('lead_time_days')->default(7);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('sku');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->integer('current_stock')->default(0);
            $table->integer('reorder_level')->default(10);
            $table->string('status')->default('in_stock'); // in_stock, low_stock, out_of_stock
            $table->timestamps();

            $table->unique(['organization_id', 'sku']);
            $table->index(['organization_id', 'status']);
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type'); // PURCHASE, SALE, RETURN, DAMAGE, ADJUSTMENT, TRANSFER
            $table->integer('quantity'); // e.g. -5 for sale, +20 for purchase
            $table->integer('balance_after');
            $table->string('reference_type')->nullable(); // e.g. Order, SupplierPO, ManualAudit
            $table->string('reference_id')->nullable(); // e.g. 5001
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'product_id']);
            $table->index(['organization_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('products');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('categories');
    }
};
