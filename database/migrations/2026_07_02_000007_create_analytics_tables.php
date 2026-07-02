<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dim_date', function (Blueprint $table) {
            $table->date('date_key')->primary();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->unsignedTinyInteger('day');
            $table->unsignedTinyInteger('quarter');
        });

        Schema::create('dim_customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('email');
            $table->timestamps();
        });

        Schema::create('dim_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->unique();
            $table->string('name');
            $table->string('slug');
            $table->timestamps();
        });

        Schema::create('fact_sales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('order_item_id')->unique();
            $table->date('date_key');
            $table->foreignId('customer_dim_id')->constrained('dim_customers');
            $table->foreignId('product_dim_id')->constrained('dim_products');
            $table->unsignedInteger('quantity');
            $table->decimal('line_revenue', 12, 2);
            $table->timestamps();

            $table->index(['date_key', 'product_dim_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fact_sales');
        Schema::dropIfExists('dim_products');
        Schema::dropIfExists('dim_customers');
        Schema::dropIfExists('dim_date');
    }
};
