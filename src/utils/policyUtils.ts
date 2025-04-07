
/**
 * Generate a unique policy ID using timestamp and random number
 */
export function generatePolicyId(): string {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000);
  return `sm-policy-${timestamp}-${randomPart}`;
}

/**
 * Calculate a revalidation time (24 hours from now)
 */
export function getRevalidationTime(): string {
  const revalidationDate = new Date();
  revalidationDate.setHours(revalidationDate.getHours() + 24);
  return revalidationDate.toISOString();
}
