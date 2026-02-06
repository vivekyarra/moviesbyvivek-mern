import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import { useAuth } from "../components/context/AuthContext";
import { updateProfile } from "../services/auth.service";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("saving");
    try {
      const { user: updatedUser } = await updateProfile(form);
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setStatus("saved");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
      setStatus("idle");
    }
  };

  return (
    <PageShell title="Edit Profile">
      <div className="max-w-2xl bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg">
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Update your basic details to personalize your bookings.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={onChange("name")}
              className="mt-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={onChange("email")}
              className="mt-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={onChange("phone")}
              className="mt-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              placeholder="Enter your phone number"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {status === "saved" && (
            <p className="text-sm text-green-500">Profile updated.</p>
          )}

          <button
            type="submit"
            className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="mt-8 border-t border-[var(--border-color)] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Security
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Reset your password any time.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-4 w-full border border-[var(--border-color)] hover:bg-[var(--surface-alt)] text-[var(--text-main)] py-2 rounded-lg font-semibold transition"
          >
            Reset Password
          </button>
        </div>
      </div>
    </PageShell>
  );
}
