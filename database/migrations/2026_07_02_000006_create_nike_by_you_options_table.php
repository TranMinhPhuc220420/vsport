<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nike_by_you_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('colorway_id')->constrained('product_colorways')->cascadeOnDelete();
            $table->string('component_name', 100);
            $table->json('allowed_materials');
            $table->json('allowed_colors');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nike_by_you_options');
    }
};
