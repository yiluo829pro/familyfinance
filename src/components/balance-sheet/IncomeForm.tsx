import { useReducer } from 'react'
import type { IncomeSource, IncomeCategory, IncomeFrequency } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const CATEGORY_OPTIONS = [
  { value: 'salary', label: 'Salary' },
  { value: 'bonus', label: 'Bonus / Commission' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'side_income', label: 'Side Income' },
  { value: 'investment_income', label: 'Investment Income' },
  { value: 'other', label: 'Other' },
]

const FREQUENCY_OPTIONS = [
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
]

interface FormState {
  name: string
  category: IncomeCategory
  amount: string
  frequency: IncomeFrequency
  isActive: boolean
}

type FormAction = { field: keyof FormState; value: string | boolean }

function reducer(state: FormState, action: FormAction): FormState {
  return { ...state, [action.field]: action.value }
}

function init(source?: IncomeSource): FormState {
  return {
    name: source?.name ?? '',
    category: source?.category ?? 'salary',
    amount: source ? String(source.amount) : '',
    frequency: source?.frequency ?? 'annual',
    isActive: source?.isActive ?? true,
  }
}

interface IncomeFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<IncomeSource, 'id' | 'lastUpdated'>) => void
  existing?: IncomeSource
}

export function IncomeForm({ open, onClose, onSave, existing }: IncomeFormProps) {
  const [form, dispatch] = useReducer(reducer, existing, init)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    dispatch({ field, value: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount.replace(/,/g, ''))
    if (!form.name.trim() || isNaN(amount) || amount < 0) return
    onSave({
      name: form.name.trim(),
      category: form.category,
      amount,
      frequency: form.frequency,
      isActive: form.isActive,
    })
    onClose()
  }

  const annualPreview =
    form.amount && !isNaN(parseFloat(form.amount))
      ? form.frequency === 'monthly'
        ? parseFloat(form.amount) * 12
        : parseFloat(form.amount)
      : null

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Income Source' : 'Add Income Source'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={form.name}
          onChange={set('name')}
          placeholder="e.g. Primary Salary"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
          <Select label="Frequency" value={form.frequency} onChange={set('frequency')} options={FREQUENCY_OPTIONS} />
        </div>
        <Input
          label={`Amount (${form.frequency === 'monthly' ? 'per month' : 'per year'})`}
          type="number"
          min="0"
          step="1"
          value={form.amount}
          onChange={set('amount')}
          prefix="$"
          required
        />
        {annualPreview !== null && form.frequency === 'monthly' && (
          <p className="text-xs text-slate-500">
            Annual equivalent:{' '}
            <strong className="text-slate-700">
              ${annualPreview.toLocaleString()}
            </strong>
          </p>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={set('isActive')}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">Active income source</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{existing ? 'Save Changes' : 'Add Income'}</Button>
        </div>
      </form>
    </Modal>
  )
}
