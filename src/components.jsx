import React from 'react'

export function Section({ title, right, children }) {
  return (
    <section className="card">
      {title && (
        <div className="card-head">
          <h2>{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

export function Pill({ tone = 'muted', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function EmptyHint({ icon = '🎄', children }) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <p>{children}</p>
    </div>
  )
}

export function NumInput({ value, onChange, min, max, step = 1, width = '5.5rem', ...rest }) {
  return (
    <input
      type="number"
      className="input num"
      style={{ width }}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}
