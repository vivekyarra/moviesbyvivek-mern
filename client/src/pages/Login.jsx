import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  loginUser,
  loginWithGoogle,
  requestOtp,
  verifyOtp,
} from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState("password"); // password | otp
  const [step, setStep] = useState("request"); // request | verify
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const from = location.state?.from || { pathname: "/" };

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const inferChannel = (value) => (value.includes("@") ? "email" : "phone");

  const resetOtpState = () => {
    setStep("request");
    setOtp("");
    setCooldown(0);
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    if (!identifier) {
      setError("Please enter email or phone.");
      setStatus("error");
      return;
    }

    try {
      if (mode === "password") {
        const data = await loginUser({ identifier, password });
        setUser(data.user);
        navigate(from, { replace: true });
        return;
      }

      if (step === "request") {
        await requestOtp({
          identifier,
          channel: inferChannel(identifier),
          purpose: "login",
        });
        setStep("verify");
        setCooldown(30);
        setStatus("idle");
        return;
      }

      const data = await verifyOtp({
        identifier,
        channel: inferChannel(identifier),
        code: otp,
        purpose: "login",
      });
      setUser(data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setStatus("loading");
    setError("");
    try {
      await requestOtp({
        identifier,
        channel: inferChannel(identifier),
        purpose: "login",
      });
      setCooldown(30);
      setStatus("idle");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
      setStatus("error");
    }
  };

  const handleGoogle = async (credential) => {
    setStatus("loading");
    setError("");
    try {
      const data = await loginWithGoogle(credential);
      setUser(data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Google login failed.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)]">
        <h1 className="text-2xl font-semibold mb-2">Login</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Welcome back. Login to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Email or Phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />

          {mode === "password" ? (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          ) : (
            step === "verify" && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] tracking-[0.35em] text-center"
              />
            )
          )}

          {mode === "password" && (
            <div className="text-right text-xs">
              <Link
                to="/forgot-password"
                state={{ from }}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={status === "loading"}
            className="w-full bg-[var(--text-main)] text-[var(--text-invert)] py-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "loading"
              ? "Please wait..."
              : mode === "password"
                ? "Login"
                : step === "request"
                  ? "Send OTP"
                  : "Verify & Login"}
          </button>

          {mode === "otp" && step === "verify" && (
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline disabled:opacity-60"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          )}
        </form>

        <div className="mt-3 text-xs text-[var(--text-muted)] text-center">
          {mode === "password" ? (
            <button
              className="hover:text-[var(--text-main)] underline"
              onClick={() => {
                setMode("otp");
                resetOtpState();
              }}
            >
              Login with OTP?
            </button>
          ) : (
            <button
              className="hover:text-[var(--text-main)] underline"
              onClick={() => {
                setMode("password");
                resetOtpState();
              }}
            >
              Back to password login
            </button>
          )}
        </div>

        <div className="mt-5">
          {googleEnabled ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) =>
                  handleGoogle(credentialResponse.credential)
                }
                onError={() => setError("Google login failed.")}
              />
            </div>
          ) : (
            <p className="text-xs text-[var(--text-subtle)] text-center">
              Google login is not configured.
            </p>
          )}
        </div>

        <p className="mt-6 text-sm text-center text-[var(--text-muted)]">
          New here?{" "}
          <Link
            className="text-[var(--text-main)] font-semibold hover:underline"
            to="/signup"
            state={{ from }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
