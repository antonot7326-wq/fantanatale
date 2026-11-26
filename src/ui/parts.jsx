import React from 'react'
import { IconBack } from './icons'

export function Button({ variant = 'default', size = 'regular', className = '', ...rest }) {
  const cls = ['btn', `btn-${variant}`, size === 'big' ? 'btn-big' : '', className].filter(Boolean).join(' ')
  return <button type="button" className={cls} {...rest} />
}

export function Card({ title, actions, children }) {
  return (
    <section className="card">
      {(title || actions) && (
        <div className="card-head">
          {title && <h2>{title}</h2>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Pill({ tone = 'muted', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function Empty({ children }) {
  return (
    <div className="empty">
      <p>{children}</p>
    </div>
  )
}

export function Field({ label, help, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {help && <span className="field-help">{help}</span>}
    </label>
  )
}

export function TextInput({ value, onChange, placeholder, ...rest }) {
  return (
    <input
      className="input"
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export function DateInput({ value, onChange, ...rest }) {
  return (
    <input
      className="input"
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

const clampInt = (v, min, max) => Math.min(max ?? Infinity, Math.max(min ?? 0, Math.round(Number(v) || 0)))

export function Stepper({ value, onChange, min = 0, max = 999, step = 1, label }) {
  const set = (v) => onChange({ target: { value: v } })
  return (
    <span className="stepper" role="group" aria-label={label}>
      <button type="button" className="stepper-btn" onClick={() => set(clampInt(value - step, min, max))} aria-label="diminuisci">
        −
      </button>
      <span className="stepper-value" aria-live="polite">
        {value}
      </span>
      <button type="button" className="stepper-btn" onClick={() => set(clampInt(Number(value) + step, min, max))} aria-label="aumenta">
        +
      </button>
    </span>
  )
}

export function PageTitle({ title, subtitle, onBack }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {onBack && (
        <button type="button" className="page-back" onClick={onBack}>
          <IconBack /> Indietro
        </button>
      )}
    </div>
  )
}
