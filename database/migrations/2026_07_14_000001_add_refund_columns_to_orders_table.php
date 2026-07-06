<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('refund_id')->nullable()->after('payment_intent_id');
            $table->string('refund_status')->nullable()->after('refund_id');
            $table->timestamp('refunded_at')->nullable()->after('refund_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['refund_id', 'refund_status', 'refunded_at']);
        });
    }
};
