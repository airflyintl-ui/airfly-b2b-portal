<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {

            $table->id();

            $table->foreignId('airline_id')
                ->constrained('airlines')
                ->cascadeOnDelete();

            $table->string('flight_no');

            $table->string('from');

            $table->string('to');

            $table->dateTime('departure_time');

            $table->dateTime('arrival_time');

            $table->decimal('economy_fare', 10, 2);

            $table->decimal('business_fare', 10, 2);

            $table->integer('available_seats')->default(0);

            $table->boolean('status')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};