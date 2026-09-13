import { Check } from 'lucide-react'
import { THEME_LIST } from '../data/themes.js'

export function ThemePicker({ value, onChange, compact }) {
  return (
    <div className={`theme-picker ${compact ? 'theme-compact' : ''}`}>
      {THEME_LIST.map((t) => {
        const active = value === t.id
        return (
          <button
            key={t.id}
            type="button"
            className={`theme-swatch ${active ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
            aria-pressed={active}
          >
            <span
              className="theme-swatch-dot"
              style={{ background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})` }}
            >
              {active && <Check size={13} strokeWidth={3} />}
            </span>
            <span className="theme-swatch-name">{t.label}</span>
            <span className="theme-swatch-tag">{t.tagline}</span>
          </button>
        )
      })}
    </div>
  )
}
