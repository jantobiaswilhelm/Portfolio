export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div
      className="overflow-hidden border-y border-border py-6 mt-16"
      style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)' }}
    >
      <div className="flex gap-11 w-max animate-[marquee_26s_linear_infinite]">
        {doubled.map((t, i) => (
          <span
            key={i}
            className={`font-head text-[22px] whitespace-nowrap ${i % 4 === 0 ? 'text-accent' : 'text-tm'}`}
          >
            {t} —
          </span>
        ))}
      </div>
    </div>
  )
}
