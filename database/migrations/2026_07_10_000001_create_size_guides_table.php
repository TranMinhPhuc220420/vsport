<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('size_guides', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->boolean('is_default')->default(false);
            $table->json('columns');
            $table->longText('measure_content')->nullable();
            $table->string('measure_image_path', 500)->nullable();
            $table->string('measure_image_alt', 150)->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['category_id']);
            $table->index(['is_default']);
        });

        Schema::create('size_guide_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('size_guide_id')->constrained('size_guides')->cascadeOnDelete();
            $table->json('values');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['size_guide_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('size_guide_rows');
        Schema::dropIfExists('size_guides');
    }
};
