type Props = {
  children: React.ReactNode
}

export function AdminPageToolbar({ children }: Props) {
  return <div className="mb-6 flex flex-wrap items-center gap-3">{children}</div>
}
