<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_customizable')->default(false)->after('is_featured');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->after('id')->constrained('products')->cascadeOnDelete();
            $table->decimal('sale_price', 10, 2)->nullable()->after('additional_price');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->foreignId('option_value_id')->nullable()->after('colorway_id')->constrained('product_option_values')->cascadeOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->json('options_snapshot')->nullable()->after('size_val');
        });

        Schema::table('product_sustainability_materials', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->after('id')->constrained('products')->cascadeOnDelete();
        });

        Schema::table('nike_by_you_options', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->after('id')->constrained('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('nike_by_you_options', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
        });

        Schema::table('product_sustainability_materials', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('options_snapshot');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropConstrainedForeignId('option_value_id');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
            $table->dropColumn('sale_price');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_customizable');
        });
    }
};
