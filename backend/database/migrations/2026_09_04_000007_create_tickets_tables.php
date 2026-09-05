<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ticket_number');
            $table->string('subject');
            $table->string('status')->default('open'); // open, in_progress, waiting_on_customer, resolved, closed
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->string('category')->default('General Inquiry');
            $table->timestamps();

            $table->unique(['organization_id', 'ticket_number']);
            $table->index(['organization_id', 'customer_id']);
            $table->index(['organization_id', 'status']);
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sender_type')->default('staff'); // staff, customer
            $table->string('sender_name');
            $table->text('message');
            $table->timestamps();

            $table->index('ticket_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('tickets');
    }
};
