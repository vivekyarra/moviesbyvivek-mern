import Navbar from "../Navbar";

export default function PageShell({ title, children }) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        {title && <h1 className="text-2xl font-semibold mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  );
}
