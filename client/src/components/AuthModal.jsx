import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  loginUser,
  loginWithGoogle,
  requestOtp,
  verifyOtp,
} from "../services/auth.service";
import CountryCodeSelect from "./common/CountryCodeSelect";
import { useAuth } from "./context/AuthContext";

export default function AuthModal({
  open,
  onClose,
  onSuccess,
  initialMode = "login",
  bannerText = "",
  bannerTone = "info",
}) {
  const [mode, setMode] = useState("login"); // login | signup
  const [loginMethod, setLoginMethod] = useState("password"); // password | otp
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [channel, setChannel] = useState("email");
  const [step, setStep] = useState("request");
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const navigate = useNavigate();

  if (!open) return null;

  const inferChannel = (value) => (value.includes("@") ? "email" : "phone");

  const resetOtpState = () => {
    setStep("request");
    setOtp("");
    setCooldown(0);
  };

  const resetStatus = () => {
    setStatus("idle");
    setError("");
    resetOtpState();
  };

  const startCooldown = () => {
    setCooldown(30);
  };

  const canResend = cooldown <= 0;

  const resendLabel =
    cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP";

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setLoginMethod("password");
    resetStatus();
  }, [open, initialMode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      if (mode === "login") {
        if (!identifier) {
          setError("Please enter email or phone.");
          setStatus("error");
          return;
        }

        if (loginMethod === "password") {
          const data = await loginUser({ identifier, password });
          setUser(data.user);
          if (onSuccess) {
            onSuccess(data.user);
          } else {
            onClose();
          }
          return;
        }

        if (step === "request") {
          await requestOtp({
            identifier,
            channel: inferChannel(identifier),
            purpose: "login",
          });
          setStep("verify");
          startCooldown();
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
        if (onSuccess) {
          onSuccess(data.user);
        } else {
          onClose();
        }
        return;
      }

      // signup
      const otpIdentifier =
        channel === "email" ? email : `${countryCode}${phone}`;
      if (!name || !password) {
        setError("Name and password are required.");
        setStatus("error");
        return;
      }
      if (!otpIdentifier) {
        setError(`Please enter your ${channel}.`);
        setStatus("error");
        return;
      }

      if (step === "request") {
        await requestOtp({
          identifier: otpIdentifier,
          channel,
          name,
          email,
          phone: `${countryCode}${phone}`,
          password,
          purpose: "signup",
        });
        setStep("verify");
        startCooldown();
        setStatus("idle");
        return;
      }

      const data = await verifyOtp({
        identifier: otpIdentifier,
        channel,
        code: otp,
        purpose: "signup",
      });
      setUser(data.user);
      if (onSuccess) {
        onSuccess(data.user);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setStatus("loading");
    setError("");
    try {
      if (mode === "login") {
        await requestOtp({
          identifier,
          channel: inferChannel(identifier),
          purpose: "login",
        });
        startCooldown();
      } else {
        const otpIdentifier =
          channel === "email" ? email : `${countryCode}${phone}`;
        await requestOtp({
          identifier: otpIdentifier,
          channel,
          name,
          email,
          phone: `${countryCode}${phone}`,
          password,
          purpose: "signup",
        });
        startCooldown();
      }
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
      if (onSuccess) {
        onSuccess(data.user);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Google login failed.");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-[201] w-[420px] rounded-2xl bg-[var(--surface)] text-[var(--text-main)] p-6 shadow-2xl border border-[var(--border-color)]">
        <h2 className="text-2xl font-bold mb-2">
          {mode === "login" ? "Login" : "Create account"}
        </h2>

        {bannerText && (
          <div
            className={`mb-3 rounded-lg px-3 py-2 text-xs font-semibold border ${
              bannerTone === "success"
                ? "text-green-400 border-green-500/40 bg-green-500/10"
                : "text-yellow-300 border-yellow-400/30 bg-yellow-400/10"
            }`}
          >
            {bannerText}
          </div>
        )}

        <p className="text-sm text-[var(--text-muted)] mb-6">
          {mode === "login"
            ? "Welcome back. Login to continue."
            : "Create an account to book tickets and manage bookings."}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "login" ? (
            <>
              <input
                type="text"
                placeholder="Email or Phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />

              {loginMethod === "password" ? (
                <>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <div className="text-right text-xs">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
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
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />

              <div className="flex gap-3">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />

              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                <span>Send OTP to:</span>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="otpChannelModal"
                    checked={channel === "email"}
                    onChange={() => setChannel("email")}
                  />
                  Email
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="otpChannelModal"
                    checked={channel === "phone"}
                    onChange={() => setChannel("phone")}
                  />
                  Phone
                </label>
              </div>

              {step === "verify" && (
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] tracking-[0.35em] text-center"
                />
              )}
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={status === "loading"}
            className="w-full bg-[var(--text-main)] text-[var(--text-invert)] py-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "loading"
              ? "Please wait..."
              : mode === "login"
                ? loginMethod === "password"
                  ? "Login"
                  : step === "request"
                    ? "Send OTP"
                    : "Verify & Login"
                : step === "request"
                  ? "Send OTP"
                  : "Verify & Create"}
          </button>

          {((mode === "login" && loginMethod === "otp" && step === "verify") ||
            (mode === "signup" && step === "verify")) && (
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline disabled:opacity-60"
            >
              {resendLabel}
            </button>
          )}
        </form>

        {mode === "login" && (
          <div className="mt-3 text-xs text-[var(--text-muted)] text-center">
            {loginMethod === "password" ? (
              <button
                className="hover:text-[var(--text-main)] underline"
                onClick={() => {
                  setLoginMethod("otp");
                  resetOtpState();
                }}
              >
                Login with OTP?
              </button>
            ) : (
              <button
                className="hover:text-[var(--text-main)] underline"
                onClick={() => {
                  setLoginMethod("password");
                  resetOtpState();
                }}
              >
                Back to password login
              </button>
            )}
          </div>
        )}

        <div className="mt-4">
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

        <p className="mt-5 text-sm text-center text-[var(--text-muted)]">
          {mode === "login" ? (
            <>
              New customer?{" "}
              <button
                className="text-[var(--text-main)] font-semibold hover:underline"
                onClick={() => {
                  setMode("signup");
                  setLoginMethod("password");
                  resetStatus();
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-[var(--text-main)] font-semibold hover:underline"
                onClick={() => {
                  setMode("login");
                  resetStatus();
                }}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
