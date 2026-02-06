import PageShell from "../components/common/PageShell";

const FAQS = [
  {
    q: "How do I book tickets?",
    a: "Pick a movie, select a date and theatre, choose seats, and complete payment.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Cancellation depends on the theatre policy shown during booking.",
  },
  {
    q: "How do I change my location?",
    a: "Use the location selector in the navbar to pick a city or state.",
  },
  {
    q: "Where can I see my bookings?",
    a: "Open your profile menu and tap Movie Bookings.",
  },
];

export default function FAQ() {
  return (
    <PageShell title="Frequently Asked Questions">
      <div className="space-y-4">
        {FAQS.map((item) => (
          <div
            key={item.q}
            className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold mb-2">{item.q}</h3>
            <p className="text-sm text-[var(--text-muted)]">{item.a}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
