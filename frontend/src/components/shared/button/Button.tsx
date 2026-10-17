import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?:  'icon' | 'sm' | 'md'
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:brightness-110',
  secondary: 'border border-slate-300 bg-white text-navy hover:bg-canvas',
  danger: 'bg-brand text-white hover:brightness-110',
  success: 'bg-emerald-600 text-white hover:brightness-110',
  warning: 'bg-amber-500 text-navy hover:brightness-110',
}

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  icon: 'p-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg font-medium disabled:opacity-50 ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]}`}
      {...rest}
    >
      {children}
    </button>
  )
}
