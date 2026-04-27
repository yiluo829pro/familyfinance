import { useReducer } from 'react'
import type { Asset, AssetCategory } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { INVESTMENT_SUBCATEGORIES, RETIREMENT_SUBCATEGORIES } from '@/constants'

const CATEGORY_OPTIONS = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'investments', label: 'Investments' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'cash_alternatives', label: 'Cash & Alternatives' },
]

const LIQUID_DEFAULTS: Record<AssetCategory, boolean> = {
  real_estate: false,
  investments: true,
  retirement: false,
  cash_alternatives: true,
}

function subcategoryOptions(category: AssetCategory) {
  if (category === 'investments') return [{ value: '', label: '— Select type —' }, ...INVESTMENT_SUBCATEGORIES]
  if (category === 'retirement') return [{ value: '', label: '— Select type —' }, ...RETIREMENT_SUBCATEGORIES]
  return null
}

interface FormState {
  name: string
  category: AssetCategory
  subcategory: string
  value: string
  isLiquid: boolean
  notes: string
}

type FormAction = { field: keyof FormState; value: string | boolean }

function reducer(state: FormState, action: FormAction): FormState {
  if (action.field === 'category') {
    const cat = action.value as AssetCategory
    return { ...state, category: cat, subcategory: '', isLiquid: LIQUID_DEFAULTS[cat] }
  }
  return { ...state, [action.field]: action.value }
}

function init(asset?: Asset): FormState {
  return {
    name: asset?.name ?? '',
    category: asset?.category ?? 'investments',
    subcategory: asset?.subcategory ?? '',
    value: asset ? String(asset.value) : '',
    isLiquid: asset?.isLiquid ?? true,
    notes: asset?.notes ?? '',
  }
}

interface AssetFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Asset, 'id' | 'lastUpdated'>) => void
  existing?: Asset
}

export function AssetForm({ open, onClose, onSave, existing }: AssetFormProps) {
  const [form, dispatch] = useReducer(reducer, existing, init)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    dispatch({ field, value: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(form.value.replace(/,/g, ''))
    if (!form.name.trim() || isNaN(val) || val < 0) return
    onSave({
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory.trim() || undefined,
      value: val,
      isLiquid: form.isLiquid,
      notes: form.notes.trim() || undefined,
    })
    onClose()
  }

  const subOpts = subcategoryOptions(form.category)

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Asset' : 'Add Asset'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Asset Name" value={form.name} onChange={set('name')} placeholder="e.g. Fidelity Brokerage" required />
        <Select label="Category" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
        {subOpts ? (
          <Select label="Type / Sub-category" value={form.subcategory} onChange={set('subcategory')} options={subOpts} />
        ) : (
          <Input label="Sub-category (optional)" value={form.subcategory} onChange={set('subcategory')} placeholder="e.g. Vacation Property" />
        )}
        <Input label="Current Value" type="number" min="0" step="1" value={form.value} onChange={set('value')} prefix="$" required />
        <Input label="Notes (optional)" value={form.notes} onChange={set('notes')} placeholder="Any notes" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isLiquid}
            onChange={set('isLiquid')}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">Count as investable (for FIRE calculation)</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{existing ? 'Save Changes' : 'Add Asset'}</Button>
        </div>
      </form>
    </Modal>
  )
}
