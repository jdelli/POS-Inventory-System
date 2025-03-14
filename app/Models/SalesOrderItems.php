<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrderItems extends Model
{
    use HasFactory;

    protected $fillable = [
    'product_code',
    'sales_order_id', 
    'product_name', 
    'quantity', 
    'price', 
    'total'
];

    // Relationship with SalesOrder
    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class);
    }

    // Define the relationship with Product
    public function product()
    {
        return $this->belongsTo(Products::class);
    }
}