export function info(message: string, meta?: Record<string, unknown>) {
  try {
    console.log(JSON.stringify({ level: 'info', message, ...meta }))
  } catch {
    /* ignore logging errors */
  }
}

export function error(message: string, meta?: Record<string, unknown>) {
  try {
    console.error(JSON.stringify({ level: 'error', message, ...meta }))
  } catch {
    /* ignore logging errors */
  }
}

export function warn(message: string, meta?: Record<string, unknown>) {
  try {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta }))
  } catch {
    /* ignore logging errors */
  }
}
