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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('colorway_id')->constrained('product_colorways')->cascadeOnDelete();
            $table->string('size_val', 20);
            $table->string('sku', 100)->unique();
            $table->string('upc', 50)->nullable()->unique();
            $table->decimal('additional_price', 10, 2)->default(0);

            $table->unique(['colorway_id', 'size_val']);
            $table->index('colorway_id');
        });

        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->unique()->constrained('product_variants')->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(0);
            $table->unsignedInteger('reserved_quantity')->default(0);
            $table->string('warehouse_location', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('product_variants');
    }
};
