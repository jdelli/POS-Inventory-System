import React, { useState, useEffect } from "react";
import apiService from "./Services/ApiService";
import { Link } from "@inertiajs/react"; // Assuming you're using Inertia.js for routing
import { usePage } from "@inertiajs/react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}


interface Branch {
  id: number;
  name: string;
}



const POSSystem: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Analog/IP Cameras');
  const { auth } = usePage().props; // Get the `auth` object from the page props
  const [branches, setBranches] = useState<Branch[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  // New state for user details
  const [customerName, setCustomerName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  const branchOptions = ["San Mateo", "Cainta", "Zabarte", "Quezon City", "Makati"];

  const categoryOptions = [
    'Analog/IP Cameras',
    'WIFI Cameras',
    'DVR/NVR',
    'HDD',
    'Home Alarms',
    'Accessories',
    'Radios',
    'Biometrics',
  ];



  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiService.get('/get-branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  const fetchProductsByCategory = async (category: string, page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get(
        `/fetch-products?category=${encodeURIComponent(category)}&page=${page}&per_page=${limit}`
      );
      if (response?.data?.success) {
        setProducts(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
      } else {
        throw new Error(response?.data?.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsByCategory(activeTab);
  }, [activeTab]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    // Check if the required fields are filled
    if (!customerName || !contactNumber || !address) {
      alert('Please fill in all required fields.');
      return;
    }

    // Prepare the payload to be sent to the API
    const payload = {
      name: customerName,
      phone: contactNumber,
      address,
      branch: selectedBranch,
      orders: cart.map((item) => ({
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,  // Calculate total for each item
      })),
    };

    try {
      // Send the POST request to create the customer order
      const response = await apiService.post('/add-customer-order', payload);

      // If the request is successful, reset the cart and input fields
      setCart([]);
      setCustomerName("");
      setContactNumber("");
      setAddress("");
      setSelectedBranch("");

      alert('Your Order is Submitted, Our Sales Representative will call you');
    } catch (error) {
      // Log any errors during the API request
      console.error(error);
      alert('Error submitting the customer order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="absolute top-0 right-0 p-4 z-10">
        <nav className="-mx-3 flex flex-1 justify-end">
          {auth?.user ? (
              <>
                {auth.user.usertype === 'admin' ? (
                  // Render the Admin Dashboard link
                  <Link
                    href={route('admin-dashboard')}
                    className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  // Render the User Dashboard link
                  <Link
                    href={route('user-dashboard')}
                    className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                  >
                    User Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href={route('login')}
                  className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                >
                  Log in
                </Link>
                <Link
                  href={route('register')}
                  className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                >
                  Register
                </Link>
              </>
            )}
        </nav>
      </div>

      <header className="bg-blue-700 text-white py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-0">
        <h1 className="text-2xl font-bold">CCTV PRODUCTS</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {categoryOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActiveTab(option)}
                className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                  activeTab === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border rounded-lg focus:ring focus:border-blue-500 w-80 placeholder-gray-400 text-gray-800"
          />
        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product List */}
        <section className="bg-white p-6 rounded shadow-lg col-span-2">
          <h2 className="text-lg font-bold mb-4">Products</h2>
          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border p-4 rounded-lg shadow-lg hover:shadow-2xl transition">
                  <img
                    src={product.image ? `/storage/${product.image}` : 'default-image-url.jpg'}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-gray-600 mb-3">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 w-full mt-3"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </section>

        {/* Cart */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4">Cart</h2>
          {cart.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.id} className="py-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">{item.name}</span>
                    <span className="text-gray-600 text-sm">x {item.quantity}</span>
                  </div>
                  <span className="text-gray-800 font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <button
                      className="bg-gray-400 text-white py-1 px-3 rounded-md hover:bg-gray-500"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Your cart is empty.</p>
          )}

          {/* Customer Details Form */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Customer Details</h3>
            <input
              type="text"
              placeholder="Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mb-3 w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="mb-3 w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mb-3 w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <select
            value={selectedBranch|| ''}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setCurrentPage(1); // Reset to first page when branch changes
            }}
            className="border rounded-md py-2 px-3 w-full sm:w-auto"
          >
            <option value="" disabled>
              Select Branch Near You
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>

          {/* Checkout Button */}
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 w-full"
              onClick={handleCheckout}
            >
              Checkout (₱{calculateTotal().toFixed(2)})
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default POSSystem;
