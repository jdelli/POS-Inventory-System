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
        Schema::create('remittances', function (Blueprint $table) {
            $table->id();
            $table->date('date_start');
            $table->date('date_end');
            $table->string('branch_id');
            $table->decimal('total_sales', 15, 2)->default(0);
            $table->json('cash_breakdown'); // Stores denominations and their counts
            $table->decimal('total_cash', 15, 2)->default(0);
            $table->json('expenses'); // Stores expenses as JSON
            $table->decimal('total_expenses', 15, 2)->default(0);
            $table->decimal('remaining_cash', 15, 2)->default(0);
            $table->boolean('status')->default(false); // false = Pending, true = Received
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('remittances');
    }
};
