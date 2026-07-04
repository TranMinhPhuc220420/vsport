<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_option_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name', 100);
            $table->unsignedInteger('position')->default(0);
            $table->string('display_type', 20)->default('button');
            $table->boolean('is_required')->default(true);
            $table->boolean('drives_gallery')->default(false);
            $table->json('default_values')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['category_id', 'position']);
        });

        Schema::create('product_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('name', 100);
            $table->unsignedInteger('position')->default(0);
            $table->string('display_type', 20)->default('button');
            $table->boolean('is_required')->default(true);
            $table->boolean('drives_gallery')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'position']);
        });

        Schema::create('product_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('option_id')->constrained('product_options')->cascadeOnDelete();
            $table->string('value', 150);
            $table->string('slug', 150);
            $table->string('swatch_hex', 7)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['option_id', 'slug']);
            $table->index('option_id');
        });

        Schema::create('variant_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->foreignId('option_value_id')->constrained('product_option_values')->cascadeOnDelete();

            $table->unique(['variant_id', 'option_value_id']);
            $table->index('option_value_id');
        });

        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('group', 50);
            $table->string('key', 100);
            $table->string('label', 150);
            $table->text('value');
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('option_value_id')->nullable()->constrained('product_option_values')->nullOnDelete();
            $table->timestamps();

            $table->index(['product_id', 'group', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('variant_option_values');
        Schema::dropIfExists('product_option_values');
        Schema::dropIfExists('product_options');
        Schema::dropIfExists('category_option_templates');
    }
};
