# React/TSX Ready UI Blueprint

## 1. Suggested file structure
- src/mobile/MobileAppShell.tsx
- src/mobile/MobileHomeHero.tsx
- src/mobile/MobileHomeSections.tsx
- src/mobile/MobileBottomNav.tsx
- src/index.css

## 2. Reusable component ideas
```tsx
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={variant === 'primary'
        ? 'rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 font-bold text-white'
        : 'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white'}
    >
      {label}
    </button>
  );
}
```

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      {children}
    </div>
  );
}
```

## 3. Main layout skeleton
```tsx
export default function MobileHomePage() {
  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <header className="sticky top-0 z-10 px-3 py-3">
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-3 backdrop-blur">
          Header
        </div>
      </header>

      <main className="space-y-4 px-3 pb-24">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 p-4">
          Hero
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Card>Stat 1</Card>
          <Card>Stat 2</Card>
          <Card>Stat 3</Card>
        </section>

        <section className="space-y-2">
          <Card>Services</Card>
          <Card>Why Us</Card>
          <Card>Process</Card>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#060816]/90 p-3 backdrop-blur">
        Bottom Nav
      </nav>
    </div>
  );
}
```

## 4. Styling notes
- Use Tailwind classes for layout and spacing
- Add a reusable glass class in index.css
- Use `mobile-justified-text` for long paragraphs

## 5. Ready-to-implement direction
This structure matches the current mobile UI and can be used as the implementation blueprint for the next iteration.
