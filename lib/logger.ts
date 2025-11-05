// Simple logger

export function logMessage(message: string, data?: any) {
  console.log(`[LOG] ${message}`, data);
}

export function logError(message: string, err?: any) {
  console.error(`[ERROR] ${message}`, err);
}

export function logWarn(message: string, data?: any) {
  console.warn(`[WARN] ${message}`, data);
}

export function logInfo(message: string, data?: any) {
  console.info(`[INFO] ${message}`, data);
}

// Backwards compatibility
export const log = logMessage;
export const error = logError;
export const warn = logWarn;
export const info = logInfo;
