import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import ConfirmModal from './ConfirmModal'

// Sin los globals de Vitest, Testing Library no desmonta sola entre tests:
// sin esto, el modal de un test seguiría en el DOM del siguiente.
afterEach(cleanup)

function renderModal(open = true) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmModal
      open={open}
      message="¿Eliminar el club?"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmModal', () => {
  it('no renderiza nada cuando está cerrado', () => {
    renderModal(false)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('el botón Confirmar llama a onConfirm', () => {
    const { onConfirm, onCancel } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('el botón Cancelar llama a onCancel', () => {
    const { onConfirm, onCancel } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('cancela con un click en el fondo, pero no dentro de la tarjeta', () => {
    const { onCancel } = renderModal()
    const dialog = screen.getByRole('dialog')

    fireEvent.click(dialog)
    expect(onCancel).not.toHaveBeenCalled()

    // El fondo no tiene rol propio: es el contenedor del dialog.
    fireEvent.click(dialog.parentElement!)
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
