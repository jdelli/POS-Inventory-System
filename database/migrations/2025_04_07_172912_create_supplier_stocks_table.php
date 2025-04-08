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
        Schema::create('supplier_stocks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('supplier_id')->constrained()->onDelete('cascade'); // foreign key to suppliers table
        $table->string('product_code');
        $table->string('product_name');
        $table->integer('quantity');
        $table->decimal('price', 8, 2);
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_stocks');
    }
};
