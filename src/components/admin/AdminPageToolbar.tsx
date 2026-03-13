type Props = {
  children: React.ReactNode
}

export function AdminPageToolbar({ children }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[28px] border border-stone-200 bg-white/80 p-3 shadow-[0_18px_60px_rgba(28,25,23,0.06)] backdrop-blur">
      {children}
    </div>
  )
}
