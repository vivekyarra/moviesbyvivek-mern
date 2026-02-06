import { Gift } from "lucide-react";
import PageShell from "../components/common/PageShell";

export default function Vouchers() {
  return (
    <PageShell title="Collected Vouchers">
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] flex items-center justify-center">
          <Gift className="text-[var(--accent)]" size={20} />
        </div>
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            You have no vouchers collected yet.
          </p>
          <p className="text-xs text-[var(--text-subtle)] mt-1">
            Book more movies to unlock rewards and discounts.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
