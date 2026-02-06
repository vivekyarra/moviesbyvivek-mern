import PageShell from "../components/common/PageShell";

export default function Privacy() {
  return (
    <PageShell title="Privacy Policy">
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 text-sm text-[var(--text-muted)]">
        <p>
          We collect only the details needed to manage your account and
          bookings, such as name, email, and phone number.
        </p>
        <p>
          Your data is stored securely and is never sold to third parties.
          Payment information is handled by trusted payment providers.
        </p>
        <p>
          You can update or delete your profile details anytime from the Edit
          Profile page.
        </p>
      </div>
    </PageShell>
  );
}
