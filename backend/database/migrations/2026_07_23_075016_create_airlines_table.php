<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAirlinesTable extends Migration
{
    public function up()
    {
        Schema::create('airlines', function (Blueprint $table) {

            $table->id();

            $table->string('name');

            $table->string('code',10)->unique();

            $table->string('logo')->nullable();

            $table->boolean('status')->default(true);

            $table->timestamps();

        });
    }

    public function down()
    {
        Schema::dropIfExists('airlines');
    }
}