<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestStocksItems extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_stocks_id',
        'product_id',
        'product_code',
        'product_name',
        'quantity',
    ];

    public function requestStocks()
    {
        return $this->belongsTo(RequestStocks::class,);
    }
}
