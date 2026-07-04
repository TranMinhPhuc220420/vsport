<?php

use App\Services\Catalog\CatalogToOptionsMigrator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        app(CatalogToOptionsMigrator::class)->migrate();

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropForeign(['colorway_id']);
            $table->dropUnique(['colorway_id', 'size_val']);
            $table->dropIndex(['colorway_id']);
            $table->dropColumn(['colorway_id', 'size_val']);
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropForeign(['colorway_id']);
            $table->dropIndex(['colorway_id']);
            $table->dropColumn('colorway_id');
        });

        Schema::table('product_sustainability_materials', function (Blueprint $table) {
            $table->dropForeign(['colorway_id']);
            $table->dropColumn('colorway_id');
        });

        Schema::table('nike_by_you_options', function (Blueprint $table) {
            $table->dropForeign(['colorway_id']);
            $table->dropColumn('colorway_id');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });

        Schema::dropIfExists('product_colorways');
    }

    public function down(): void
    {
        Schema::create('product_colorways', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('colorway_code', 10);
            $table->string('full_style_code', 50)->unique();
            $table->string('color_name', 150);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->boolean('is_customizable')->default(false);
            $table->boolean('is_active')->default(true);

            $table->index(['product_id', 'is_active']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreignId('colorway_id')->nullable()->constrained('product_colorways')->cascadeOnDelete();
            $table->string('size_val', 20)->nullable();
            $table->unique(['colorway_id', 'size_val']);
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->foreignId('colorway_id')->nullable()->constrained('product_colorways')->cascadeOnDelete();
        });

        Schema::table('product_sustainability_materials', function (Blueprint $table) {
            $table->foreignId('colorway_id')->nullable()->constrained('product_colorways')->cascadeOnDelete();
        });

        Schema::table('nike_by_you_options', function (Blueprint $table) {
            $table->foreignId('colorway_id')->nullable()->constrained('product_colorways')->cascadeOnDelete();
        });
    }
};
