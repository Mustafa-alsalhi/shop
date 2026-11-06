import React, { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import { fetchSettings } from './store/slices/settingsSlice'
import { SettingsProvider } from './contexts/SettingsContext'
import Layout from './components/Layout/Layout'
import ProtectedLayout from './components/Layout/ProtectedLayout'
import AdminLayout from './components/Layout/AdminLayout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import SellerLayout from './components/Layout/SellerLayout'
import DriverLayout from './components/Layout/DriverLayout'
import store from './store/store'







// Layout Components




const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const Categories = lazy(() => import('./pages/Categories'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Account = lazy(() => import('./pages/Account'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'))
const ForgotPasswordEmail = lazy(() => import('./pages/Auth/ForgotPasswordEmail'))
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/Admin/Products'))
const AdminProductForm = lazy(() => import('./pages/Admin/ProductForm'))
const AdminOrders = lazy(() => import('./pages/Admin/Orders'))
const AdminUsers = lazy(() => import('./pages/Admin/Users'))
const AddUser = lazy(() => import('./pages/Admin/AddUser'))
const EditUser = lazy(() => import('./pages/Admin/EditUser'))
const AdminBanners = lazy(() => import('./pages/Admin/Banners'))
const AdminCategories = lazy(() => import('./pages/Admin/Categories'))
const AdminActivities = lazy(() => import('./pages/Admin/Activities'))
const AdminCoupons = lazy(() => import('./pages/Admin/Coupons'))
const AdminSettings = lazy(() => import('./pages/Admin/Settings'))
const AdminShippingCompanies = lazy(() => import('./pages/Admin/ShippingCompanies'))
const AdminPaymentMethods = lazy(() => import('./pages/Admin/PaymentMethods'))
const AdminPaymentRequests = lazy(() => import('./pages/Admin/PaymentRequests'))
const AdminAboutUs = lazy(() => import('./pages/Admin/AboutUs'))
const AdminContactUs = lazy(() => import('./pages/Admin/ContactUs'))
const AdminSellers = lazy(() => import('./pages/Admin/Sellers'))
const AdminDrivers = lazy(() => import('./pages/Admin/Drivers'))
const AdminAddDriver = lazy(() => import('./pages/Admin/AddDriver'))
const AdminChat = lazy(() => import('./pages/Admin/Chat'))
const AdminOffers = lazy(() => import('./pages/Admin/Offers'))
const AdminOfferForm = lazy(() => import('./pages/Admin/OfferForm'))
const AdminPolicies = lazy(() => import('./pages/Admin/Policies'))
const Taxes = lazy(() => import('./pages/Admin/Taxes'))
const AdminTestPage = lazy(() => import('./pages/Admin/TestPage'))
const SellerDashboard = lazy(() => import('./pages/Seller/Dashboard'))
const SellerProducts = lazy(() => import('./pages/Seller/Products'))
const SellerProductForm = lazy(() => import('./pages/Seller/ProductForm'))
const SellerCategories = lazy(() => import('./pages/Seller/Categories'))
const SellerOrders = lazy(() => import('./pages/Seller/Orders'))
const SellerPaymentRequests = lazy(() => import('./pages/Seller/PaymentRequests'))
const SellerSettings = lazy(() => import('./pages/Seller/Settings'))
const SellerOffers = lazy(() => import('./pages/Seller/Offers'))
const SellerOfferForm = lazy(() => import('./pages/Seller/OfferForm'))
const SellerCoupons = lazy(() => import('./pages/Seller/Coupons'))
const SellerChat = lazy(() => import('./pages/Seller/Chat'))
const SellerReports = lazy(() => import('./pages/Seller/Reports'))
const DriverOrders = lazy(() => import('./pages/Driver/Orders'))
const DriverOrderDetails = lazy(() => import('./pages/Driver/OrderDetails'))
const DriverDashboard = lazy(() => import('./pages/Driver/Dashboard'))
const DriverSettings = lazy(() => import('./pages/Driver/Settings'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const CustomerChat = lazy(() => import('./pages/Customer/Chat'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const AboutUsPublic = lazy(() => import('./pages/AboutUsPublic'))
const ShippingInfo = lazy(() => import('./pages/ShippingInfo'))
const Coupons = lazy(() => import('./pages/user/Coupons'))
const Offers = lazy(() => import('./pages/Offers'))
const OfferDetails = lazy(() => import('./pages/OfferDetails'))
const Seller = lazy(() => import('./pages/Seller'))
const Sellers = lazy(() => import('./pages/Sellers'))
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'))
const Policy = lazy(() => import('./pages/Policy'))
const BecomeSeller = lazy(() => import('./pages/BecomeSeller'))
const NotFound = lazy(() => import('./pages/Errors/NotFound'))
const ServerError = lazy(() => import('./pages/Errors/ServerError'))



// Store


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

        <title>منصة أصالة - تسوق عالي الجودة بأسعار ممتازة</title>

        <meta name="description" content="منصة أصالة - وجهتك الأولى للتسوق الموثوقة للمنتجات عالية الجودة بأسعار تنافسية وخدمة عملاء ممتازة" />

        <meta name="keywords" content="منصة أصالة، تسوق، منتجات عالية الجودة، متجر إلكتروني، أسعار ممتازة، خدمة عملاء" />

        <meta property="og:title" content="منصة أصالة - تجربة تسوق فريدة" />

        <meta property="og:description" content="اكتشف أفضل المنتجات عالية الجودة بأسعار تنافسية في منصة أصالة" />

        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="theme-color" content="#f59e0b" />

      </Helmet>

      <ScrollToTop />

      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}>
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
          <Route path="orders/:id/track" element={<OrderTracking />} />

          <Route path="wishlist" element={<Wishlist />} />

          <Route path="coupons" element={<Coupons />} />

          <Route path="offers" element={<Offers />} />

          <Route path="offers/:id" element={<OfferDetails />} />

          <Route path="seller/:id" element={<Seller />} />

          <Route path="sellers" element={<Sellers />} />

          <Route path="restaurant/:id" element={<RestaurantDetail />} />
          <Route path="place/:id" element={<RestaurantDetail />} />
          <Route path="restaurants" element={<Navigate to="/?tab=restaurants" replace />} />



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

          <Route path="become-seller" element={<BecomeSeller />} />

        </Route>



        {/* Protected Routes */}

        <Route path="/" element={<ProtectedLayout />}>

          <Route path="account" element={<Account />} />

          <Route path="chat/:sellerId" element={<CustomerChat />} />

        </Route>



        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>

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

          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="drivers/new" element={<AdminAddDriver />} />

          <Route path="chat" element={<AdminChat />} />

          <Route path="banners" element={<AdminBanners />} />

          <Route path="categories" element={<AdminCategories />} />
          <Route path="activities" element={<AdminActivities />} />
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

          <Route path="taxes" element={<Taxes />} />

          <Route path="test" element={<AdminTestPage />} />

        </Route>



        {/* Seller Routes */}
        <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller']}><SellerLayout /></ProtectedRoute>}>

          <Route index element={<Navigate to="/seller/dashboard" replace />} />

          <Route path="dashboard" element={<SellerDashboard />} />

          <Route path="products" element={<SellerProducts />} />

          <Route path="products/new" element={<SellerProductForm />} />

          <Route path="products/:id/edit" element={<SellerProductForm />} />

          <Route path="orders" element={<SellerOrders />} />

          <Route path="payment-requests" element={<SellerPaymentRequests />} />

          <Route path="categories" element={<SellerCategories />} />

          <Route path="settings" element={<SellerSettings />} />

          <Route path="chat" element={<SellerChat />} />

          <Route path="reports" element={<SellerReports />} />

          <Route path="offers" element={<SellerOffers />} />

          <Route path="offers/new" element={<SellerOfferForm />} />

          <Route path="offers/:id/edit" element={<SellerOfferForm />} />

          <Route path="coupons" element={<SellerCoupons />} />

        </Route>



        {/* Driver Routes */}
        <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverLayout /></ProtectedRoute>}>

          <Route index element={<Navigate to="/driver/dashboard" replace />} />

          <Route path="dashboard" element={<DriverDashboard />} />

          <Route path="orders" element={<DriverOrders />} />

          <Route path="orders/:id" element={<DriverOrderDetails />} />
          
          <Route path="settings" element={<DriverSettings />} />

        </Route>



        {/* Admin Test Route */}

        <Route path="/admin-test" element={<AdminTestPage />} />



        {/* Error Routes */}

        <Route path="/500" element={<ServerError />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
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

    // Fetch settings on app load
    dispatch(fetchSettings())

  }, [dispatch, token, user])



  return (

    <Provider store={store}>

      <SettingsProvider>

        <App />

      </SettingsProvider>

    </Provider>

  )

}



export default AppWrapper

