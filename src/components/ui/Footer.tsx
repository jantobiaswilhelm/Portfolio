export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-text-muted text-sm">
          © {new Date().getFullYear()} <span className="text-accent">Jan Wilhelm</span>. Built with React, TypeScript & Tailwind.
        </p>
      </div>
    </footer>
  )
}
