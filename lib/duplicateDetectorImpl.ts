// Duplicate detector implementation

export { findDuplicates, findInternalDuplicates } from "./dedupe";

// Default export for backward compatibility
import { findDuplicates } from "./dedupe";
export default {
  findDuplicates,
};
