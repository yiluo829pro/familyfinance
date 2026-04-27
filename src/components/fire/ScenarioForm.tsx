import { useState } from 'react'
import type { Scenario, IncomeSource } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SCENARIO_COLORS } from '@/constants'
import { annualizeIncome } from '@/lib/calculations'
import { formatCurrency } from '@/lib/utils'

interface ScenarioFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Scenario, 'id'>) => void
  income: IncomeSource[]
  existing?: Scenario
}

function buildToggles(income: IncomeSource[], existing?: Scenario): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  income.forEach((src) => {
    const adj = existing?.incomeAdjustments.find((a) => a.sourceId === src.id)
    result[src.id] = adj !== undefined ? adj.active : src.isActive
  })
  return result
}

export function ScenarioForm({ open, onClose, onSave, income, existing }: ScenarioFormProps) {
  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [color, setColor] = useState(existing?.color ?? SCENARIO_COLORS[3])
  const [extraExpense, setExtraExpense] = useState(String(existing?.additionalAnnualExpense ?? 0))
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => buildToggles(income, existing))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      incomeAdjustments: income.map((src) => ({
        sourceId: src.id,
        active: toggles[src.id] ?? src.isActive,
      })),
      additionalAnnualExpense: parseFloat(extraExpense) || 0,
    })
    onClose()
  }

  const scenarioIncome = income.reduce((sum, src) => {
    return sum + (toggles[src.id] ?? src.isActive ? annualizeIncome(src) : 0)
  }, 0)

  const baseIncome = income.filter((s) => s.isActive).reduce((sum, s) => sum + annualizeIncome(s), 0)
  const incomeDelta = scenarioIncome - baseIncome

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Scenario' : 'New Scenario'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Scenario Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Partner Laid Off"
          required
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this scenario represent?"
        />

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {SCENARIO_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-slate-800 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {income.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Income Sources</p>
            <p className="text-xs text-slate-400 mb-2">Uncheck to simulate income loss (e.g. layoff, career break)</p>
            <div className="space-y-1 max-h-52 overflow-y-auto rounded-lg border border-slate-100 p-1">
              {income.map((src) => (
                <label
                  key={src.id}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={toggles[src.id] ?? src.isActive}
                    onChange={(e) => setToggles((prev) => ({ ...prev, [src.id]: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 flex-1">{src.name}</span>
                  <span className={`text-xs font-medium ${toggles[src.id] ?? src.isActive ? 'text-emerald-600' : 'text-slate-300 line-through'}`}>
                    {formatCurrency(annualizeIncome(src))}/yr
                  </span>
                </label>
              ))}
            </div>
            {incomeDelta !== 0 && (
              <p className={`text-xs mt-1 font-medium ${incomeDelta < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Income change: {incomeDelta < 0 ? '-' : '+'}{formatCurrency(Math.abs(incomeDelta))}/yr
                &nbsp;→ Scenario total: {formatCurrency(scenarioIncome)}/yr
              </p>
            )}
          </div>
        )}

        <div>
          <Input
            label="Additional Annual Expense"
            type="number"
            min={0}
            step={1000}
            value={extraExpense}
            onChange={(e) => setExtraExpense(e.target.value)}
            prefix="$"
          />
          <p className="text-xs text-slate-400 mt-1">Extra spending vs. baseline (healthcare, COBRA, moving, etc.)</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{existing ? 'Save Changes' : 'Add Scenario'}</Button>
        </div>
      </form>
    </Modal>
  )
}
