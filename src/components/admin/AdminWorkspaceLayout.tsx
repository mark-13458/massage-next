type Props = {
  main: React.ReactNode
  aside?: React.ReactNode
  ratio?: 'balanced' | 'content-heavy'
}

export function AdminWorkspaceLayout({ main, aside, ratio = 'balanced' }: Props) {
  const className = ratio === 'content-heavy' ? 'grid gap-6 lg:grid-cols-[1.1fr_0.9fr]' : 'grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'

  return (
    <div className={className}>
      <div className="space-y-6">{main}</div>
      {aside ? <div className="space-y-6">{aside}</div> : null}
    </div>
  )
}
