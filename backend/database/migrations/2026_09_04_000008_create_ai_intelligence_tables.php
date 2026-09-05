<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_customer_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->decimal('churn_risk_score', 5, 2); // 0.00 to 1.00 or 0 to 100
            $table->string('risk_level'); // LOW, MEDIUM, HIGH, CRITICAL
            $table->json('key_drivers')->nullable();
            $table->text('suggested_action')->nullable();
            $table->timestamp('calculated_at');
            $table->timestamps();

            $table->index(['organization_id', 'customer_id']);
            $table->index(['organization_id', 'risk_level']);
        });

        Schema::create('ai_insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('insight_code')->nullable();
            $table->string('category'); // INVENTORY, CUSTOMER_RETENTION, HELPDESK, REVENUE
            $table->string('title');
            $table->text('description');
            $table->string('severity'); // CRITICAL, WARNING, INFO, OPPORTUNITY
            $table->string('impact_metric');
            $table->text('recommended_action');
            $table->string('status')->default('active'); // active, dismissed, applied
            $table->decimal('confidence_score', 4, 2)->default(0.90);
            $table->timestamps();

            $table->index(['organization_id', 'category']);
            $table->index(['organization_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_insights');
        Schema::dropIfExists('ai_customer_scores');
    }
};
