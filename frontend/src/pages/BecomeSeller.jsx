import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, loginUser, updateUser, setToken } from '../store/slices/authSlice';
import { showSuccessNotification, showErrorNotification } from '../store/slices/uiSlice';
import { BuildingStorefrontIcon, CloudArrowUpIcon, DocumentCheckIcon, MapPinIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LocationPicker from '../components/LocationPicker';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // User fields (only used if !user)
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirmation: '',
    
    // Store fields
    store_name: '',
    description: '',
    address: '',
    city: '',
    kuraimi_account_name: '',
    kuraimi_account_number: '',
    latitude: '',
    longitude: '',
  });

  const [files, setFiles] = useState({
    avatar_file: null,
    id_card_image_file: null,
    commercial_register_image_file: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.formatted_address || prev.address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user && formData.password !== formData.password_confirmation) {
        dispatch(showErrorNotification("كلمة المرور غير متطابقة"));
        return;
    }

    if (!formData.latitude || !formData.longitude) {
        dispatch(showErrorNotification("الرجاء تحديد موقع المتجر على الخريطة أولاً"));
        return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      Object.keys(files).forEach(key => {
        if (files[key]) data.append(key, files[key]);
      });

      const token = localStorage.getItem('token');
      const headers = {
          'Accept': 'application/json'
      };
      if (token && user) {
          headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/seller/register`, {
        method: 'POST',
        headers,
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        dispatch(showSuccessNotification(result.message));
        
        if (!user) {
            // New user registration - log them in properly!
            dispatch(loginUser.fulfilled({ user: result.user, token: result.token }));
        } else {
            // Existing user role upgraded
            dispatch(updateUser(result.user));
            // Trigger a silent profile refresh to confirm role
            setTimeout(() => window.location.reload(), 1500);
        }

        navigate('/seller/dashboard');
      } else {
        // Handle validation errors from backend
        if (result.errors) {
            const firstError = Object.values(result.errors)[0][0];
            throw new Error(firstError);
        }
        throw new Error(result.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error) {
      dispatch(showErrorNotification(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <BuildingStorefrontIcon className="mx-auto h-16 w-16 text-amber-600" />
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900">انضم إلينا كبائع</h2>
          <p className="mt-2 text-lg text-gray-600">
            أكمل النموذج التالي لإنشاء حسابك وتأسيس متجرك في وقت واحد!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* User Registration Form (Only for guests) */}
            {!user && (
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 border-b pb-4">
                  <UserIcon className="h-6 w-6 text-amber-500" />
                  معلومات الحساب الشخصي
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">الاسم الأول *</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">الاسم الأخير *</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">رقم الجوال اليمني *</label>
                    <input
                      type="tel"
                      name="phone"
                      dir="ltr"
                      required
                      placeholder="771234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-right focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-1 border relative">
                    <label className="block text-sm font-medium text-gray-700 border-0 bg-white">كلمة المرور *</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        minLength="8"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">تأكيد كلمة المرور *</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password_confirmation"
                      required
                      minLength="8"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Store Information */}
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 border-b pb-4 mt-8">
                <BuildingStorefrontIcon className="h-6 w-6 text-amber-500" />
                معلومات المتجر
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">اسم المتجر *</label>
                  <input
                    type="text"
                    name="store_name"
                    required
                    value={formData.store_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">شعار المتجر</label>
                  <input
                    type="file"
                    name="avatar_file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">وصف المتجر والتفاصيل التنفيذية (اختياري)</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="اكتب وصفاً جذاباً لمتجرك ومحتواه..."
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Map & Location */}
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 border-b pb-4 mt-8">
                <MapPinIcon className="h-6 w-6 text-amber-500" />
                تحديد موقع المتجر بدقة
              </h3>
              <p className="mt-2 text-sm text-gray-500 mb-4">اختيار موقع متجرك سيساعد المندوبين في الوصول إليك بسهولة تامة.</p>
              
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
              />

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">المدينة / المنطقة *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="مثال: صنعاء - حدة"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">العنوان التفصيلي (اسم الشارع والمبنى) *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 border-b pb-4 mt-8">
                <DocumentCheckIcon className="h-6 w-6 text-amber-500" />
                الوثائق الرسمية
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <label className="block text-sm font-bold text-gray-700 mb-2">صورة الهوية الوطنية *</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-amber-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-8 h-8 mb-2 text-amber-500" />
                        <p className="text-sm text-gray-500"><span className="font-semibold">اضغط للرفع</span></p>
                      </div>
                      <input type="file" name="id_card_image_file" required onChange={handleFileChange} className="hidden" accept="image/*" />
                    </label>
                  </div>
                  {files.id_card_image_file && <p className="mt-2 text-sm text-green-600 font-semibold">{files.id_card_image_file.name}</p>}
                </div>

                <div className="col-span-1 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <label className="block text-sm font-bold text-gray-700 mb-2">صورة السجل التجاري (إن وجد)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-amber-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-8 h-8 mb-2 text-amber-500" />
                        <p className="text-sm text-gray-500"><span className="font-semibold">اضغط للرفع</span></p>
                      </div>
                      <input type="file" name="commercial_register_image_file" onChange={handleFileChange} className="hidden" accept="image/*" />
                    </label>
                  </div>
                  {files.commercial_register_image_file && <p className="mt-2 text-sm text-green-600 font-semibold">{files.commercial_register_image_file.name}</p>}
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
             <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 border-b pb-4 mt-8">
                <span className="text-2xl">💰</span>
                بيانات الدفع (اختياري)
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">اسم حساب الكريمي</label>
                  <input
                    type="text"
                    name="kuraimi_account_name"
                    value={formData.kuraimi_account_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700">رقم حساب الكريمي</label>
                  <input
                    type="text"
                    name="kuraimi_account_number"
                    value={formData.kuraimi_account_number}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex justify-center items-center px-10 py-4 border border-transparent text-lg font-bold rounded-xl shadow-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                  تأسيس المتجر...
                </>
              ) : (
                'تأسيس متجري الآن وانتقال للوحة التحكم'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeSeller;
