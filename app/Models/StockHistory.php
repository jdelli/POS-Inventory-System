<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockHistory extends Model
{
    use HasFactory;

     protected $fillable = ['product_id', 'quantity_changed', 'remaining_stock', 'action', 'date', 'name', 'receipt_number'];



     public function product()
    {
        return $this->belongsTo(Products::class);
    }
}
