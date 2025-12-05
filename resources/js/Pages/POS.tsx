import React, { useState, useEffect } from "react";
import apiService from "./Services/ApiService";
import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { 
  ShoppingCart, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Shield, 
  Camera, 
  Wifi, 
  HardDrive,
  Radio,
  Bell,
  Settings,
  Fingerprint,
  ChevronRight,
  Phone,
  MapPin,
  User,
  Send,
  CheckCircle,
  Star,
  Zap,
  Clock,
  Truck
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
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
  const { auth } = usePage().props;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categoryOptions = [
    { name: 'Analog/IP Cameras', icon: Camera },
    { name: 'WIFI Cameras', icon: Wifi },
    { name: 'DVR/NVR', icon: HardDrive },
    { name: 'HDD', icon: HardDrive },
    { name: 'Home Alarms', icon: Bell },
    { name: 'Accessories', icon: Settings },
    { name: 'Radios', icon: Radio },
    { name: 'Biometrics', icon: Fingerprint },
  ];

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
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = async () => {
    if (!customerName || !contactNumber || !address) {
      alert('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    const payload = {
      name: customerName,
      phone: contactNumber,
      address,
      branch: selectedBranch,
      orders: cart.map((item) => ({
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
    };

    try {
      await apiService.post('/add-customer-order', payload);
      setCart([]);
      setCustomerName("");
      setContactNumber("");
      setAddress("");
      setSelectedBranch("");
      setCartOpen(false);
      alert('Your Order is Submitted! Our Sales Representative will call you shortly.');
    } catch (error) {
      console.error(error);
      alert('Error submitting the customer order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-container">
          <div className="nav-brand">
            <Shield className="brand-icon" />
            <span className="brand-text">SecureTech</span>
          </div>
          
          <div className="nav-actions">
            {auth?.user ? (
              <Link
                href={route(auth.user.usertype === 'admin' ? 'admin-dashboard' : 'user-dashboard')}
                className="nav-link dashboard-link"
              >
                {auth.user.usertype === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link href={route('login')} className="nav-link">Log in</Link>
                <Link href={route('register')} className="nav-link register-link">
                  Get Started
                </Link>
              </>
            )}
            <button className="cart-button" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={20} />
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Trusted by 10,000+ Customers</span>
          </div>
          <h1 className="hero-title">
            Professional Security<br />
            <span className="gradient-text">Solutions</span>
          </h1>
          <p className="hero-subtitle">
            Protect what matters most with our premium CCTV cameras, surveillance systems, 
            and security equipment. Industry-leading technology at competitive prices.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <CheckCircle size={18} />
              <span>Free Consultation</span>
            </div>
            <div className="hero-feature">
              <Truck size={18} />
              <span>Fast Delivery</span>
            </div>
            <div className="hero-feature">
              <Clock size={18} />
              <span>24/7 Support</span>
            </div>
          </div>
          <a href="#products" className="hero-cta">
            Browse Products
            <ChevronRight size={18} />
          </a>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <Camera size={48} />
            <span>HD Cameras</span>
          </div>
          <div className="hero-card">
            <Shield size={48} />
            <span>24/7 Protection</span>
          </div>
          <div className="hero-card">
            <Wifi size={48} />
            <span>Smart Connect</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <span className="stat-number">10K+</span>
          <span className="stat-label">Happy Customers</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">500+</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">5</span>
          <span className="stat-label">Branches</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">4.9</span>
          <span className="stat-label">Rating <Star size={14} style={{ display: 'inline', color: '#FBBF24' }} /></span>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="products-section">
        <div className="section-header">
          <h2 className="section-title">Our Products</h2>
          <p className="section-subtitle">Browse our extensive collection of security equipment</p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categoryOptions.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveTab(cat.name)}
                className={`category-tab ${activeTab === cat.name ? 'active' : ''}`}
              >
                <IconComponent size={16} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="products-grid">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Loading products...</span>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.image ? `/storage/${product.image}` : '/images/placeholder.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{formatCurrency(product.price)}</span>
                    <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Camera size={48} />
              <p>No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>
                <ShoppingCart size={20} />
                Your Cart
              </h3>
              <button className="close-cart" onClick={() => setCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-body">
              {cart.length > 0 ? (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <span className="cart-item-name">{item.name}</span>
                          <span className="cart-item-price">{formatCurrency(item.price)}</span>
                        </div>
                        <div className="cart-item-actions">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus size={14} />
                          </button>
                          <span className="cart-item-qty">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus size={14} />
                          </button>
                          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-divider"></div>

                  {/* Customer Form */}
                  <div className="customer-form">
                    <h4>Customer Details</h4>
                    <div className="form-group">
                      <User size={16} className="form-icon" />
                      <input
                        type="text"
                        placeholder="Your Name *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <Phone size={16} className="form-icon" />
                      <input
                        type="text"
                        placeholder="Contact Number *"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <MapPin size={16} className="form-icon" />
                      <input
                        type="text"
                        placeholder="Delivery Address *"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <select
                        value={selectedBranch || ''}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                      >
                        <option value="" disabled>Select Nearest Branch</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.name}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="cart-empty">
                  <ShoppingCart size={48} />
                  <p>Your cart is empty</p>
                  <span>Add some products to get started</span>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="total-amount">{formatCurrency(calculateTotal())}</span>
                </div>
                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Shield size={24} />
            <span>SecureTech</span>
          </div>
          <p className="footer-text">
            Your trusted partner in security solutions. Quality products, expert service.
          </p>
          <p className="footer-copyright">
            © {new Date().getFullYear()} SecureTech. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .landing-page {
          min-height: 100vh;
          background: #FAFBFC;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1E293B;
        }

        /* Navigation */
        .nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #E2E8F0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.875rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .brand-icon {
          color: #0F766E;
          width: 28px;
          height: 28px;
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0F172A;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: #0F766E;
          background: #F0FDFA;
        }

        .dashboard-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .register-link {
          background: #0F766E;
          color: white !important;
          padding: 0.5rem 1rem;
        }

        .register-link:hover {
          background: #0D9488;
        }

        .cart-button {
          position: relative;
          background: #F1F5F9;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s;
        }

        .cart-button:hover {
          background: #E2E8F0;
          color: #0F766E;
        }

        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #0F766E;
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Hero Section */
        .hero-section {
          padding: 8rem 1.5rem 4rem;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        @media (max-width: 968px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 6rem;
          }
          .hero-visual {
            justify-content: center;
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #F0FDFA;
          color: #0F766E;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 1.5rem;
          color: #0F172A;
        }

        .gradient-text {
          background: linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: #64748B;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 540px;
        }

        .hero-features {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        @media (max-width: 968px) {
          .hero-features {
            justify-content: center;
          }
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .hero-feature svg {
          color: #0F766E;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #0F766E 0%, #0D9488 100%);
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          box-shadow: 0 4px 14px rgba(15, 118, 110, 0.4);
        }

        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(15, 118, 110, 0.5);
        }

        .hero-visual {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 140px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .hero-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: #0F766E;
        }

        .hero-card svg {
          color: #0F766E;
        }

        .hero-card span {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1E293B;
        }

        /* Stats Section */
        .stats-section {
          background: white;
          border-top: 1px solid #E2E8F0;
          border-bottom: 1px solid #E2E8F0;
          padding: 3rem 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4rem;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 800;
          color: #0F766E;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748B;
          font-weight: 500;
        }

        .stat-divider {
          width: 1px;
          height: 50px;
          background: #E2E8F0;
        }

        @media (max-width: 768px) {
          .stat-divider { display: none; }
          .stats-section { gap: 2rem; }
        }

        /* Products Section */
        .products-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 4rem 1.5rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.5rem;
        }

        .section-subtitle {
          color: #64748B;
          font-size: 1rem;
        }

        .search-container {
          position: relative;
          max-width: 480px;
          margin: 0 auto 2rem;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 48px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 0.9375rem;
          background: white;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #0F766E;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
        }

        .category-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border: 1px solid #E2E8F0;
          border-radius: 100px;
          background: white;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-tab:hover {
          border-color: #0F766E;
          color: #0F766E;
        }

        .category-tab.active {
          background: #0F766E;
          border-color: #0F766E;
          color: white;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .product-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .product-image {
          aspect-ratio: 4/3;
          background: #F8FAFC;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-info {
          padding: 1.25rem;
        }

        .product-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1E293B;
          margin: 0 0 0.5rem;
          line-height: 1.4;
        }

        .product-description {
          font-size: 0.8125rem;
          color: #64748B;
          margin: 0 0 1rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-price {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0F766E;
        }

        .add-to-cart-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: #0F766E;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover {
          background: #0D9488;
        }

        .loading-state, .error-state, .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: #64748B;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #E2E8F0;
          border-top-color: #0F766E;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state svg {
          color: #CBD5E1;
          margin-bottom: 1rem;
        }

        /* Cart Drawer */
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 200;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          max-width: 100%;
          background: white;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .cart-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
          color: #0F172A;
        }

        .close-cart {
          background: #F1F5F9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s;
        }

        .close-cart:hover {
          background: #E2E8F0;
        }

        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.5rem;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cart-item {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 0.875rem;
        }

        .cart-item-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .cart-item-name {
          font-weight: 500;
          color: #1E293B;
          font-size: 0.875rem;
        }

        .cart-item-price {
          font-weight: 600;
          color: #0F766E;
          font-size: 0.875rem;
        }

        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cart-item-actions button {
          background: white;
          border: 1px solid #E2E8F0;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s;
        }

        .cart-item-actions button:hover {
          border-color: #0F766E;
          color: #0F766E;
        }

        .cart-item-qty {
          font-weight: 600;
          min-width: 28px;
          text-align: center;
          font-size: 0.875rem;
        }

        .remove-btn:hover {
          border-color: #DC2626 !important;
          color: #DC2626 !important;
        }

        .cart-divider {
          height: 1px;
          background: #E2E8F0;
          margin: 1.25rem 0;
        }

        .customer-form h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1E293B;
          margin: 0 0 0.75rem;
        }

        .customer-form .form-group {
          position: relative;
          margin-bottom: 0.75rem;
        }

        .customer-form .form-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }

        .customer-form input,
        .customer-form select {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 40px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s;
        }

        .customer-form select {
          padding-left: 0.75rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25rem 1.25rem;
        }

        .customer-form input:focus,
        .customer-form select:focus {
          outline: none;
          border-color: #0F766E;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
        }

        .cart-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #64748B;
        }

        .cart-empty svg {
          color: #CBD5E1;
          margin-bottom: 1rem;
        }

        .cart-empty p {
          font-weight: 500;
          margin: 0 0 0.25rem;
          color: #475569;
        }

        .cart-empty span {
          font-size: 0.8125rem;
        }

        .cart-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #E2E8F0;
          background: #F8FAFC;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .cart-total span {
          color: #64748B;
          font-size: 0.875rem;
        }

        .total-amount {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #0F172A !important;
        }

        .checkout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #0F766E 0%, #0D9488 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .checkout-btn:hover {
          opacity: 0.9;
        }

        .checkout-btn:disabled {
          background: #94A3B8;
          cursor: not-allowed;
        }

        /* Footer */
        .footer {
          background: #0F172A;
          color: white;
          padding: 3rem 1.5rem;
          margin-top: 4rem;
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .footer-brand svg {
          color: #14B8A6;
        }

        .footer-text {
          color: #94A3B8;
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
        }

        .footer-copyright {
          color: #64748B;
          font-size: 0.8125rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default POSSystem;
