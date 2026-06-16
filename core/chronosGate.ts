export const CHRONOS_GATE_MS = 10_000

export const LOADING_LINES = [
  'Your input is being held. Not processed. Held.',
  'The system is pausing. This is not a bug.',
  'Automated requests cannot survive this delay.',
  'Ten seconds of silence before the signal moves.',
  'The gate exists to protect the integrity of your data.',
]

export async function chronosGate(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, CHRONOS_GATE_MS))
}

export function getLoadingLine(): string {
  return LOADING_LINES[
    Math.floor(Date.now() / 10_000) % LOADING_LINES.length
  ]
}