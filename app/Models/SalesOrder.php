<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    use HasFactory;


    protected $fillable = ['receipt_number', 'customer_name', 'date'];

    // Relationship with SalesOrderItem
    public function items()
    {
        return $this->hasMany(SalesOrderItems::class);
    }
}
