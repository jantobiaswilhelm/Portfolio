export function SectionHeading({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-5 mb-14">
      <span className="font-head text-accent text-sm font-medium">{num}</span>
      <h2 className="font-head font-bold text-[clamp(34px,6vw,64px)]">{title}</h2>
      <div className="flex-1 h-px bg-border self-center" />
    </div>
  )
}
