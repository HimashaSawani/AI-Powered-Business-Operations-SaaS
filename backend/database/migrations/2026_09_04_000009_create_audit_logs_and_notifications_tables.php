<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Audit Logs Table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('action'); // price_change, inventory_adjust, order_cancel, role_change, etc.
            $table->string('entity_type'); // Product, Order, Customer, User
            $table->string('entity_id')->nullable();
            $table->string('summary');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'action']);
            $table->index(['organization_id', 'created_at']);
        });

        // 2. System Notifications Table
        Schema::create('system_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type'); // inventory_alert, churn_warning, billing_surge, order_placed
            $table->string('severity')->default('info'); // critical, warning, info, success
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'severity']);
        });

        // 3. Add AI sentiment and classification to tickets
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('sentiment')->default('neutral')->after('priority'); // negative, neutral, positive
            $table->decimal('ai_confidence', 4, 2)->nullable()->after('sentiment');
            $table->string('assigned_team')->nullable()->after('assigned_user_id');
        });

        // 4. Add health scores & timeline to customers
        Schema::table('customers', function (Blueprint $table) {
            $table->integer('health_score')->default(85)->after('status');
            $table->json('health_factors')->nullable()->after('health_score');
            $table->json('timeline')->nullable()->after('health_factors');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['health_score', 'health_factors', 'timeline']);
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['sentiment', 'ai_confidence', 'assigned_team']);
        });

        Schema::dropIfExists('system_notifications');
        Schema::dropIfExists('audit_logs');
    }
};
