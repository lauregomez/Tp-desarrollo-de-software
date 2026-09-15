import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Extiende los props nativos de <button> para no perder nada
// (aria-*, name, form, etc.) y agrega las variantes de estilo.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
}

// Clases por variante, con los tokens definidos en index.css.
const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:brightness-110',
  secondary: 'border border-slate-300 bg-white text-navy hover:bg-canvas',
  danger: 'bg-brand text-white hover:brightness-110',
}

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  // type='button' por defecto: si no se aclara, el navegador asume
  // 'submit' y un botón cualquiera dentro de un form lo enviaría.
  type = 'button',
  disabled = false,
  onClick,
  // El resto de los props nativos se reenvía tal cual al <button>.
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
