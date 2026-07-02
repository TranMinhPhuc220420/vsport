<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_sustainability_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('colorway_id')->constrained('product_colorways')->cascadeOnDelete();
            $table->string('component_name', 100);
            $table->string('material_type', 100);
            $table->unsignedInteger('component_weight_g');
            $table->unsignedTinyInteger('recycled_content_pct');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_sustainability_materials');
    }
};
