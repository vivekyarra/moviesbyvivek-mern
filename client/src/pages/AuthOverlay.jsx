import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../hooks/useAuth";

export default function AuthOverlay({ mode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const message = location.state?.message || "";
  const messageType = location.state?.messageType || "info";
  const from = location.state?.from || { pathname: "/" };

  useEffect(() => {
    if (user) {
      navigate(from.pathname || "/", {
        replace: true,
        state: from.state,
      });
    }
  }, [user, navigate, from]);

  return (
    <>
      <Home />
      <AuthModal
        open
        initialMode={mode}
        bannerText={message}
        bannerTone={messageType}
        onClose={() => navigate("/", { replace: true })}
        onSuccess={() =>
          navigate(from.pathname || "/", {
            replace: true,
            state: from.state,
          })
        }
      />
    </>
  );
}
