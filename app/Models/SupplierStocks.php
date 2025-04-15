<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierStocks extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'product_code',
        'product_name',
        'quantity',
        'price',
        'total',
    ];
    

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

}
