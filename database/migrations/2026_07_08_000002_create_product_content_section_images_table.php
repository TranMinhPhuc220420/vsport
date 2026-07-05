<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_content_section_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_section_id')
                ->constrained('product_content_sections')
                ->cascadeOnDelete();
            $table->string('image_url');
            $table->string('storage_path')->nullable();
            $table->string('image_alt_tag')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['content_section_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_content_section_images');
    }
};
