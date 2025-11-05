// Re-export from validation.ts

export { 
  ClaimantSchema, 
  ClaimantSchema as claimantSchema,  // Alias for legacy code
  validateClaimant, 
  type ClaimantInput 
} from "../validation";
