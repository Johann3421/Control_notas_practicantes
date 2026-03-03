import Badge from "@/components/ui/Badge"

interface ReportSummaryProps {
  kpis: Array<{ label: string; value: string; max?: string }>
}

export default function ReportSummary({ kpis }: ReportSummaryProps) {
  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card">
      <h3 className="font-sans text-base font-medium text-text-primary mb-4">Resumen Ejecutivo</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="space-y-1">
            <span className="text-xs text-text-tertiary uppercase tracking-widest font-semibold">{kpi.label}</span>
            <p className="font-mono text-2xl font-bold text-text-primary">
              {kpi.value}
              {kpi.max && <span className="text-sm text-text-tertiary ml-1">/ {kpi.max}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
