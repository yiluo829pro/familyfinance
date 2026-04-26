import { useReducer } from 'react'
import type { Liability, LiabilityCategory } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const CATEGORY_OPTIONS = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
]

interface FormState {
  name: string
  category: LiabilityCategory
  balance: string
  interestRate: string
  monthlyPayment: string
}

type FormAction = { field: keyof FormState; value: string }

function reducer(state: FormState, action: FormAction): FormState {
  return { ...state, [action.field]: action.value }
}

function init(liability?: Liability): FormState {
  return {
    name: liability?.name ?? '',
    category: liability?.category ?? 'mortgage',
    balance: liability ? String(liability.balance) : '',
    interestRate: liability?.interestRate != null ? String(liability.interestRate) : '',
    monthlyPayment: liability?.monthlyPayment != null ? String(liability.monthlyPayment) : '',
  }
}

interface LiabilityFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Liability, 'id' | 'lastUpdated'>) => void
  existing?: Liability
}

export function LiabilityForm({ open, onClose, onSave, existing }: LiabilityFormProps) {
  const [form, dispatch] = useReducer(reducer, existing, init)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    dispatch({ field, value: e.target.value })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const bal = parseFloat(form.balance.replace(/,/g, ''))
    if (!form.name.trim() || isNaN(bal) || bal < 0) return
    onSave({
      name: form.name.trim(),
      category: form.category,
      balance: bal,
      interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
      monthlyPayment: form.monthlyPayment ? parseFloat(form.monthlyPayment) : undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Liability' : 'Add Liability'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={form.name} onChange={set('name')} placeholder="e.g. Home Mortgage" required />
        <Select label="Category" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
        <Input label="Outstanding Balance ($)" value={form.balance} onChange={set('balance')} type="number" min="0" step="1" prefix="$" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Interest Rate (%)" value={form.interestRate} onChange={set('interestRate')} type="number" min="0" step="0.01" suffix="%" />
          <Input label="Monthly Payment ($)" value={form.monthlyPayment} onChange={set('monthlyPayment')} type="number" min="0" step="1" prefix="$" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{existing ? 'Save Changes' : 'Add Liability'}</Button>
        </div>
      </form>
    </Modal>
  )
}
