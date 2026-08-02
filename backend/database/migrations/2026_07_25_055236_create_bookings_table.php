<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {

            $table->id();

            $table->foreignId('agent_id')
                ->constrained('agents')
                ->cascadeOnDelete();

            $table->foreignId('flight_id')
                ->constrained('flights')
                ->cascadeOnDelete();

            $table->string('pnr')->unique();

            $table->string('passenger_name');

            $table->string('passport');

            $table->string('nationality')->nullable();

            $table->date('date_of_birth')->nullable();

            $table->enum('gender', [
                'Male',
                'Female',
                'Other'
            ])->nullable();

            $table->string('phone')->nullable();

            $table->string('email')->nullable();

            $table->enum('journey_type', [
                'One Way',
                'Round Trip'
            ])->default('One Way');

            $table->enum('travel_class', [
                'Economy',
                'Business'
            ])->default('Economy');

            $table->integer('adults')->default(1);

            $table->integer('children')->default(0);

            $table->integer('infants')->default(0);

            $table->decimal('total_amount', 10, 2);

            $table->string('ticket_number')->nullable();

            $table->enum('payment_status', [
                'Pending',
                'Paid',
                'Refunded'
            ])->default('Pending');

            $table->enum('booking_status', [
                'Pending',
                'Confirmed',
                'Cancelled'
            ])->default('Pending');

            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};