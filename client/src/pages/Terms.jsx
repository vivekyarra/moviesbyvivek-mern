import PageShell from "../components/common/PageShell";

export default function Terms() {
  return (
    <PageShell title="Terms & Conditions">
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 text-sm text-[var(--text-muted)]">
        <p>
          By using this app, you agree to provide accurate information and
          follow theatre policies for bookings, refunds, and cancellations.
        </p>
        <p>
          Ticket availability, show timings, and seat layouts are provided by
          theatres and may change without notice.
        </p>
        <p>
          We are not responsible for third‑party disruptions such as payment
          failures or theatre schedule changes.
        </p>
      </div>
    </PageShell>
  );
}
