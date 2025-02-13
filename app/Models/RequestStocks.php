<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestStocks extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'date',

    ];

    public function items()
    {
        return $this->hasMany(RequestStocksItems::class,);
    }
}
