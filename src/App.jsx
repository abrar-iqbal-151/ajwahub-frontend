import Premium from './pages/Premium'
import { Routes, Route } from 'react-router-dom'
import Description from './pages/Description'
import Home from './pages/Home'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TwoFactorAuth from './pages/TwoFactorAuth'
import ResetPassword from './pages/ResetPassword'
import Products from './pages/Products'
import Contact from './pages/Contact'
import Rating from './pages/Rating'
import AI from './pages/AI'
import Gifting from './pages/Gifting'
import Wishlist from './pages/Wishlist'
import GymAI from './pages/GymAI'
import Tracking from './pages/Tracking'
import Payment from './pages/Payment'
import Warehouse from './pages/Warehouse'
import Shipping from './pages/Shipping'
import Delivered from './pages/Delivered'
import Terms from './pages/Terms'
import AboutUs from './pages/AboutUs'
import OrderHistory from './pages/OrderHistory'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Description />} />
        <Route path="/description" element={<Description />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/gifting" element={<Gifting />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/gymai" element={<GymAI />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/checkout" element={<Tracking />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/delivered" element={<Delivered />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Terms />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/contact" element={<Contact />} />

      </Routes>
    </div>
  )
}

export default App