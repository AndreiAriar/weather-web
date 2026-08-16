import { CloudWarning } from '@phosphor-icons/react'

export function StatusMessage({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-white/10 px-8 py-16 text-center backdrop-blur-xl">
      <CloudWarning size={36} weight="duotone" className="text-white/70" />
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-white/60">{detail}</p>
      </div>
    </div>
  )
}
