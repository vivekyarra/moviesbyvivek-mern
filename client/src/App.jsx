import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Payment from "./pages/Payment";
import BookingSuccess from "./pages/BookingSuccess";
import SeatSelection from "./pages/SeatSelection";
import SeatSelect from "./pages/SeatSelect";
import MyBookings from "./pages/MyBookings";
import AuthOverlay from "./pages/AuthOverlay";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Profile from "./pages/Profile";
import Vouchers from "./pages/Vouchers";
import Payments from "./pages/Payments";
import Appearance from "./pages/Appearance";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
      <Route
        path="/payment"
        element={
          <ProtectedRoute message="Please login to continue payment.">
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/success"
        element={
          <ProtectedRoute message="Please login to continue payment.">
            <BookingSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute message="Please login to view your bookings.">
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute message="Please login to edit your profile.">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vouchers"
        element={
          <ProtectedRoute message="Please login to view vouchers.">
            <Vouchers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute message="Please login to view payments.">
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appearance"
        element={
          <ProtectedRoute message="Please login to customize appearance.">
            <Appearance />
          </ProtectedRoute>
        }
      />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute message="Please login to access admin tools.">
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route path="/seats" element={<SeatSelect />} />
      <Route path="/login" element={<AuthOverlay mode="login" />} />
      <Route path="/signup" element={<AuthOverlay mode="signup" />} />
    </Routes>
  );
}
