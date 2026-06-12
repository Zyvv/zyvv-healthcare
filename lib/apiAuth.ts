import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY ?? 'placeholder'
)

const RATE_LIMIT_PER_HOUR = 100

export interface AuthResult {
  ok: boolean
  apiKeyId?: number
  error?: string
  status?: number
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, error: 'Missing or invalid Authorization header. Use: Bearer <api_key>', status: 401 }
  }
  const key = authHeader.replace('Bearer ', '').trim()
  if (!key) {
    return { ok: false, error: 'Empty API key', status: 401 }
  }
  const keyHash = hashKey(key)
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, is_active')
    .eq('key_hash', keyHash)
    .single()
  if (error || !data) {
    return { ok: false, error: 'Invalid API key', status: 401 }
  }
  if (!data.is_active) {
    return { ok: false, error: 'API key disabled', status: 403 }
  }
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('api_requests_log')
    .select('id', { count: 'exact', head: true })
    .eq('api_key_id', data.id)
    .gte('created_at', oneHourAgo)
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return { ok: false, error: 'Rate limit exceeded (100 requests/hour)', status: 429 }
  }
  return { ok: true, apiKeyId: data.id }
}

export async function logRequest(apiKeyId: number, endpoint: string, statusCode: number) {
  await supabaseAdmin.from('api_requests_log').insert({
    api_key_id: apiKeyId,
    endpoint,
    status_code: statusCode,
  })
}