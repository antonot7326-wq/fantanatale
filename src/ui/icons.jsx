import React from 'react'

function Icon({ children, size = 24 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconHome() {
  return (
    <Icon>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </Icon>
  )
}

export function IconTeams() {
  return (
    <Icon>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.2 20c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4" />
      <circle cx="17.2" cy="9" r="2.4" />
      <path d="M17.7 14.8c2.1.4 3.3 2 3.3 4.2" />
    </Icon>
  )
}

export function IconAuction() {
  return (
    <Icon>
      <path d="M20.6 13.4 11.2 4H4v7.2l9.4 9.4a2 2 0 0 0 2.8 0l4.4-4.4a2 2 0 0 0 0-2.8Z" />
      <circle cx="7.8" cy="7.8" r="1.4" />
    </Icon>
  )
}

export function IconCalendar() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8 3v4M16 3v4" />
      <path d="M7.5 13.5h3M7.5 16.8h3M13.5 13.5h3M13.5 16.8h3" />
    </Icon>
  )
}

export function IconTrophy() {
  return (
    <Icon>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.7 4.4M17 6h2.5a2.5 2.5 0 0 1-2.7 4.4" />
    </Icon>
  )
}

export function IconGear() {
  return (
    <Icon size={22}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </Icon>
  )
}

export function IconBack() {
  return (
    <Icon size={20}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Icon>
  )
}
