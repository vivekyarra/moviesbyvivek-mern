export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-4 gap-8 text-sm text-[var(--text-muted)]">
        <div>
          <h4 className="font-semibold text-[var(--text-main)] mb-3">
            movies by vivek
          </h4>
          <p>
            Your trusted platform for discovering movies, booking tickets, and
            exploring cinema across India.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-[var(--text-main)] mb-3">
            Explore
          </h4>
          <ul className="space-y-2">
            <li>Now Showing</li>
            <li>Upcoming Movies</li>
            <li>Award Winners</li>
            <li>Top Rated</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[var(--text-main)] mb-3">
            Support
          </h4>
          <ul className="space-y-2">
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[var(--text-main)] mb-3">
            Follow
          </h4>
          <ul className="space-y-2">
            <li>Instagram</li>
            <li>Twitter</li>
            <li>Facebook</li>
            <li>YouTube</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border-color)] text-center py-4 text-xs text-[var(--text-subtle)]">
        {"\u00A9"} {new Date().getFullYear()} movies by vivek. All rights
        reserved.
      </div>
    </footer>
  );
}
