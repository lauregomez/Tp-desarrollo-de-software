import { toast } from 'react-toastify'
import type { ToastOptions } from 'react-toastify'

// Config por defecto compartida por todos los avisos, para que no haya
// que repetirla en cada llamada. El config opcional la pisa por caso.
const DEFAULT_CONFIG: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export function successToast(message: string, config?: ToastOptions) {
  toast.success(message, { ...DEFAULT_CONFIG, ...config })
}

export function errorToast(message: string, config?: ToastOptions) {
  toast.error(message, { ...DEFAULT_CONFIG, ...config })
}
