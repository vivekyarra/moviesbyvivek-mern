import PageShell from "../components/common/PageShell";

export default function About() {
  return (
    <PageShell title="About Us">
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 text-sm text-[var(--text-muted)]">
        <p>
          Movies by Vivek is a simple ticketing experience built for cinema
          lovers. Discover films, pick theatres, and book seats in a few
          clicks.
        </p>
        <p>
          We focus on clean design, easy navigation, and a smooth checkout flow
          so you can spend more time enjoying movies.
        </p>
      </div>
    </PageShell>
  );
}
