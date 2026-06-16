import { createHash } from 'crypto'

export interface ZKProof {
  commitment: string
  nullifier: string
  timestamp: number
  verified: boolean
}

export function generateCommitment(rawIdentity: string) {
  const commitment = createHash('sha256')
    .update(rawIdentity)
    .update(process.env.ZK_SALT ?? 'zyvv-health-capsule-salt')
    .digest('hex')
  return { commitment }
}

export function generateNullifier(
  commitment: string,
  sessionId: string
): string {
  return createHash('sha256')
    .update(commitment)
    .update(sessionId)
    .update(Date.now().toString())
    .digest('hex')
}

export function verifyProof(proof: ZKProof): boolean {
  if (!proof.commitment || !proof.nullifier) return false
  if (Date.now() - proof.timestamp > 10 * 60 * 1000) return false
  return proof.verified
}

export function createProof(
  commitment: string,
  sessionId: string
): ZKProof {
  return {
    commitment,
    nullifier: generateNullifier(commitment, sessionId),
    timestamp: Date.now(),
    verified: true,
  }
}

export function verifyAccessRequest(
  proof: ZKProof,
  requiredCommitment: string
): boolean {
  if (!verifyProof(proof)) return false
  return proof.commitment === requiredCommitment
}