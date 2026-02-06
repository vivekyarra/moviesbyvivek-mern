import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./Home";
import { requestPasswordReset } from "../services/auth.service";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || { pathname: "/" };

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setMessage("");
    try {
      const data = await requestPasswordReset(email);
      setMessage(data?.message || "If the account exists, a reset link was sent.");
      setStatus("success");
    } catch (err) {
      setError(err.message || "Failed to request reset link.");
      setStatus("error");
    }
  };

  return (
    <>
      <Home />
      <div className="fixed inset-0 z-[200] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => navigate(from.pathname || "/", { replace: true })}
        />
        <div className="relative z-[201] w-[420px] rounded-2xl bg-[var(--surface)] text-[var(--text-main)] p-6 shadow-2xl border border-[var(--border-color)]">
          <h2 className="text-2xl font-bold mb-2">Forgot password</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Enter your email to receive a password reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <button
              disabled={status === "loading"}
              className="w-full bg-[var(--text-main)] text-[var(--text-invert)] py-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-[var(--text-muted)]">
            Remembered your password?{" "}
            <Link
              className="text-[var(--text-main)] font-semibold hover:underline"
              to="/login"
              state={{ from }}
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
