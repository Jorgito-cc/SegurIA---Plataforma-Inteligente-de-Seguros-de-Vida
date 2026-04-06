import {toast} from 'react-toastify';
export const notify = {
  success: (msg) => toast.success(msg, { position: 'top-right' }),
  error: (msg) => toast.error(msg, { position: 'top-right' }),
  info: (msg) => toast.info(msg, { position: 'top-right' }),
  warn: (msg) => toast.warn(msg, { position: 'top-right' }),
};