<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('agents', function (Blueprint $table) {
    $table->id();

    $table->string('agency_name');
    $table->string('owner_name');
    $table->string('email')->unique();
    $table->string('phone');
    $table->string('password');

    $table->decimal('wallet',12,2)->default(0);

    $table->enum('status',['active','inactive'])->default('active');

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('agents');
    }
};
