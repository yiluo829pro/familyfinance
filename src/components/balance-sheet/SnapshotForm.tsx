import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface SnapshotFormProps {
  open: boolean
  onClose: () => void
  onSave: (date: string, totalAssets: number, totalLiabilities: number) => void
  defaultAssets?: number
  defaultLiabilities?: number
}

export function SnapshotForm({ open, onClose, onSave, defaultAssets = 0, defaultLiabilities = 0 }: SnapshotFormProps) {
  const [date, setDate] = useState('')
  const [assets, setAssets] = useState(String(defaultAssets))
  const [liabilities, setLiabilities] = useState(String(defaultLiabilities))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const a = parseFloat(assets.replace(/,/g, ''))
    const l = parseFloat(liabilities.replace(/,/g, ''))
    if (!date || isNaN(a) || isNaN(l)) return
    onSave(date + '-01', a, l)
    onClose()
    setDate('')
    setAssets(String(defaultAssets))
    setLiabilities(String(defaultLiabilities))
  }

  const netWorth = (parseFloat(assets) || 0) - (parseFloat(liabilities) || 0)

  return (
    <Modal open={open} onClose={onClose} title="Add Historical Snapshot">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Date"
          type="month"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          label="Total Assets at that time"
          type="number"
          min={0}
          step={1}
          value={assets}
          onChange={(e) => setAssets(e.target.value)}
          prefix="$"
          required
        />
        <Input
          label="Total Liabilities at that time"
          type="number"
          min={0}
          step={1}
          value={liabilities}
          onChange={(e) => setLiabilities(e.target.value)}
          prefix="$"
          required
        />
        {assets && liabilities && (
          <div className={`text-sm font-semibold p-3 rounded-lg ${netWorth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            Net Worth: {netWorth >= 0 ? '' : '-'}${Math.abs(netWorth).toLocaleString()}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Snapshot</Button>
        </div>
      </form>
    </Modal>
  )
}
