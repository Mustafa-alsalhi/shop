import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Provider } from 'react-redux'

// Layout Components
import Layout from './components/Layout/Layout'
import ProtectedLayout from './components/Layout/ProtectedLayout'
import AdminLayout from './components/Layout/AdminLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import Categories from './pages/Categories'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import Account from './pages/Account'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ForgotPasswordEmail from './pages/Auth/ForgotPasswordEmail'
import ResetPassword from './pages/Auth/ResetPassword'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products'
import AdminProductForm from './pages/Admin/ProductForm'
import AdminOrders from './pages/Admin/Orders'
import AdminUsers from './pages/Admin/Users'
import AddUser from './pages/Admin/AddUser'
import EditUser from './pages/Admin/EditUser'
import AdminBanners from './pages/Admin/Banners'
import AdminCategories from './pages/Admin/Categories'
import AdminCoupons from './pages/Admin/Coupons'
import AdminSettings from './pages/Admin/Settings'
import AdminTestPage from './pages/Admin/TestPage'
import ContactUs from './pages/ContactUs'
import AboutUs from './pages/AboutUs'
import ShippingInfo from './pages/ShippingInfo'
import Coupons from './pages/user/Coupons'
import NotFound from './pages/Errors/NotFound'
import ServerError from './pages/Errors/ServerError'

// Store
import store from './store/store'

function App() {
  return (
    <Provider store={store}>
      <Helmet>
        <title>متجر أصالة - تسوق عالي الجودة بأسعار ممتازة</title>
        <meta name="description" content="متجر أصالة - وجهتك الأولى للتسوق الموثوقة للمنتجات عالية الجودة بأسعار تنافسية وخدمة عملاء ممتازة" />
        <meta name="keywords" content="متجر أصالة، تسوق، منتجات عالية الجودة، متجر إلكتروني، أسعار ممتازة، خدمة عملاء" />
        <meta property="og:title" content="متجر أصالة - تجربة تسوق فريدة" />
        <meta property="og:description" content="اكتشف أفضل المنتجات عالية الجودة بأسعار تنافسية في متجر أصالة" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#f59e0b" />
      </Helmet>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="coupons" element={<Coupons />} />
          
          {/* Info Pages */}
          <Route path="contact-us" element={<ContactUs />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="shipping-info" element={<ShippingInfo />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="forgot-password-email" element={<ForgotPasswordEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route path="account" element={<Account />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/:id/edit" element={<EditUser />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Admin Test Route */}
        <Route path="/admin-test" element={<AdminTestPage />} />

        {/* Error Routes */}
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Provider>
  )
}

export default App
