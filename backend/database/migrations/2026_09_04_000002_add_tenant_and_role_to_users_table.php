<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_organization_id')->nullable()->after('id')->constrained('organizations')->nullOnDelete();
            $table->string('role')->default('staff')->after('email'); // super_admin, owner, manager, staff
            $table->string('avatar')->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_organization_id']);
            $table->dropColumn(['current_organization_id', 'role', 'avatar']);
        });
    }
};
