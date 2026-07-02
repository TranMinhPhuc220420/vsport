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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 150)->unique();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();

            $table->index('parent_id');
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('style_code', 50)->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('sub_title')->nullable();
            $table->decimal('base_price', 10, 2);
            $table->string('gender', 20);
            $table->string('warranty_info')->nullable();
            $table->text('care_instructions')->nullable();
            $table->text('return_policy')->nullable();
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->timestamps();

            $table->index('category_id');
        });

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

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('colorway_id')->constrained('product_colorways')->cascadeOnDelete();
            $table->string('image_url', 500);
            $table->string('image_alt_tag')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->unsignedInteger('sort_order')->default(0);

            $table->index('colorway_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_colorways');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
