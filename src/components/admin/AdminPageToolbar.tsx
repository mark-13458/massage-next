type Props = {
  children: React.ReactNode
}

export function AdminPageToolbar({ children }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[28px] border border-stone-200/80 bg-white/90 p-3 shadow-[0_4px_24px_rgba(28,25,23,0.06)] backdrop-blur-sm">
      {children}
    </div>
  )
}
