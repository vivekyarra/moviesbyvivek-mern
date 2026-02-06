import PageShell from "../components/common/PageShell";
import { useTheme } from "../components/context/ThemeContext";

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <PageShell title="Appearance">
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6">
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Choose how the app looks. Your preference is saved on this device.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <button
            onClick={() => setTheme("dark")}
            className={`rounded-xl border px-4 py-6 text-left transition ${
              theme === "dark"
                ? "border-[var(--accent)] bg-[var(--surface-alt)]"
                : "border-[var(--border-color)] hover:bg-[var(--surface-alt)]"
            }`}
          >
            <div className="text-sm font-semibold">Dark</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Cinematic look
            </div>
          </button>

          <button
            onClick={() => setTheme("light")}
            className={`rounded-xl border px-4 py-6 text-left transition ${
              theme === "light"
                ? "border-[var(--accent)] bg-[var(--surface-alt)]"
                : "border-[var(--border-color)] hover:bg-[var(--surface-alt)]"
            }`}
          >
            <div className="text-sm font-semibold">Light</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Clean & bright
            </div>
          </button>
        </div>
      </div>
    </PageShell>
  );
}
