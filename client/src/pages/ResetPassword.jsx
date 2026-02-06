import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./Home";
import { resetPassword } from "../services/auth.service";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || { pathname: "/" };

  const params = new URLSearchParams(location.search);
  const tokenParam = params.get("token") || "";
  const emailParam = params.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setEmail(emailParam);
    setToken(tokenParam);
  }, [emailParam, tokenParam]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setMessage("");

    if (!email || !token) {
      setError("Reset link is missing required data.");
      setStatus("error");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      const data = await resetPassword({ email, token, password });
      setMessage(data?.message || "Password updated.");
      setStatus("success");
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            from,
            message: "Password reset successful. Please login.",
            messageType: "success",
          },
        });
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
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
          <h2 className="text-2xl font-bold mb-2">Reset password</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Set a new password for your account.
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

            <input
              type="text"
              placeholder="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              required
            />

            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <button
              disabled={status === "loading"}
              className="w-full bg-[var(--text-main)] text-[var(--text-invert)] py-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "loading" ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-[var(--text-muted)]">
            Go back to{" "}
            <Link
              className="text-[var(--text-main)] font-semibold hover:underline"
              to="/login"
              state={{ from }}
            >
              login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
