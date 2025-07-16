import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import RestaurantRegistration from './pages/RestaurantRegistration';
import RestaurantDashboard from './pages/RestaurantDashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import RestaurantDetails from './pages/RestaurantDetails';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route 
              path="/restaurant-registration" 
              element={
                <ProtectedRoute requiredRole="restaurant_owner">
                  <RestaurantRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurant-dashboard" 
              element={
                <ProtectedRoute requiredRole="restaurant_owner">
                  <RestaurantDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/menu-management" 
              element={
                <ProtectedRoute requiredRole="restaurant_owner">
                  <MenuManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-management" 
              element={
                <ProtectedRoute requiredRole="restaurant_owner">
                  <OrderManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-history" 
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-tracking/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<div className="p-8 text-center">About page coming soon...</div>} />
            <Route path="/contact" element={<div className="p-8 text-center">Contact page coming soon...</div>} />
            <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;