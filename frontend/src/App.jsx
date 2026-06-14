import React, { useEffect } from 'react'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { Helmet } from 'react-helmet-async'

import { Provider } from 'react-redux'

import { useDispatch, useSelector } from 'react-redux'

import { getCurrentUser } from './store/slices/authSlice'



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

import AdminShippingCompanies from './pages/Admin/ShippingCompanies'

import AdminPaymentMethods from './pages/Admin/PaymentMethods'

import AdminPaymentRequests from './pages/Admin/PaymentRequests'

import AdminAboutUs from './pages/Admin/AboutUs'

import AdminContactUs from './pages/Admin/ContactUs'

import AdminSellers from './pages/Admin/Sellers'

import AdminChat from './pages/Admin/Chat'

import AdminOffers from './pages/Admin/Offers'

import AdminOfferForm from './pages/Admin/OfferForm'

import AdminPolicies from './pages/Admin/Policies'

import AdminTestPage from './pages/Admin/TestPage'

import ContactUs from './pages/ContactUs'

import CustomerChat from './pages/Customer/Chat'

import AboutUs from './pages/AboutUs'

import AboutUsPublic from './pages/AboutUsPublic'

import ShippingInfo from './pages/ShippingInfo'

import Coupons from './pages/user/Coupons'

import Offers from './pages/Offers'

import OfferDetails from './pages/OfferDetails'

import Seller from './pages/Seller'

import Sellers from './pages/Sellers'

import Policy from './pages/Policy'

import NotFound from './pages/Errors/NotFound'

import ServerError from './pages/Errors/ServerError'



// Store

import store from './store/store'

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {

  return (
    <>
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

      <ScrollToTop />

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

          <Route path="offers" element={<Offers />} />

          <Route path="offers/:id" element={<OfferDetails />} />

          <Route path="seller/:id" element={<Seller />} />

          <Route path="sellers" element={<Sellers />} />



          {/* Info Pages */}

          <Route path="contact-us" element={<ContactUs />} />

          <Route path="about-us" element={<AboutUsPublic />} />

          <Route path="shipping-info" element={<ShippingInfo />} />

          <Route path="policy/:type" element={<Policy />} />

          

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

          <Route path="chat/:sellerId" element={<CustomerChat />} />

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

          <Route path="sellers" element={<AdminSellers />} />

          <Route path="chat" element={<AdminChat />} />

          <Route path="banners" element={<AdminBanners />} />

          <Route path="categories" element={<AdminCategories />} />

          <Route path="coupons" element={<AdminCoupons />} />

          <Route path="shipping-companies" element={<AdminShippingCompanies />} />

          <Route path="payment-methods" element={<AdminPaymentMethods />} />

          <Route path="payment-requests" element={<AdminPaymentRequests />} />

          <Route path="about-us" element={<AdminAboutUs />} />

          <Route path="contact-us" element={<AdminContactUs />} />

          <Route path="settings" element={<AdminSettings />} />

          <Route path="offers" element={<AdminOffers />} />

          <Route path="offers/new" element={<AdminOfferForm />} />

          <Route path="offers/:id/edit" element={<AdminOfferForm />} />

          <Route path="policies" element={<AdminPolicies />} />

        </Route>



        {/* Admin Test Route */}

        <Route path="/admin-test" element={<AdminTestPage />} />



        {/* Error Routes */}

        <Route path="/500" element={<ServerError />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  )

}



function AppWrapper() {

  const dispatch = useDispatch()

  const token = useSelector((state) => state.auth.token)

  const user = useSelector((state) => state.auth.user)



  useEffect(() => {

    // Fetch user data if token exists but user data is missing

    if (token && !user) {

      dispatch(getCurrentUser())

    }

  }, [dispatch, token, user])



  return (

    <Provider store={store}>

      <App />

    </Provider>

  )

}



export default AppWrapper

