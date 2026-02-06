import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { requestOtp, verifyOtp } from "../services/auth.service";
import CountryCodeSelect from "../components/common/CountryCodeSelect";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useAuth();

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

  const from = location.state?.from || { pathname: "/" };

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const getIdentifier = () =>
    channel === "email" ? email : `${countryCode}${phone}`;

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
      if (!name || !password) {
        setError("Name and password are required.");
        setStatus("error");
        return;
      }

      const identifier = getIdentifier();
      if (!identifier) {
        setError(`Please enter your ${channel}.`);
        setStatus("error");
        return;
      }

      if (step === "request") {
        await requestOtp({
          identifier,
          channel,
          name,
          email,
          phone: `${countryCode}${phone}`,
          password,
          purpose: "signup",
        });
        setStep("verify");
        setCooldown(30);
        setStatus("idle");
        return;
      }

      const data = await verifyOtp({
        identifier,
        channel,
        code: otp,
        purpose: "signup",
      });
      setUser(data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed.");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setStatus("loading");
    setError("");
    try {
      const identifier = getIdentifier();
      await requestOtp({
        identifier,
        channel,
        name,
        email,
        phone: `${countryCode}${phone}`,
        password,
        purpose: "signup",
      });
      setCooldown(30);
      setStatus("idle");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)]">
        <h1 className="text-2xl font-semibold mb-2">Create Account</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Create an account to book tickets and manage bookings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
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
                name="otpChannel"
                checked={channel === "email"}
                onChange={() => setChannel("email")}
              />
              Email
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="otpChannel"
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={status === "loading"}
            className="w-full bg-[var(--text-main)] text-[var(--text-invert)] py-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "loading"
              ? "Please wait..."
              : step === "request"
                ? "Send OTP"
                : "Verify & Create"}
          </button>

          {step === "verify" && (
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

        <p className="mt-6 text-sm text-center text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            className="text-[var(--text-main)] font-semibold hover:underline"
            to="/login"
            state={{ from }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
