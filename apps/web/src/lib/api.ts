import { toast } from '@/hooks/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const HEALTH_MAX_RETRIES = 10
const HEALTH_RETRY_DELAY = 5000

async function waitForServer(attempt = 1): Promise<boolean> {
  const healthUrl = API_URL.replace('/api', '/health')

  try {
    const res = await fetch(healthUrl, { method: 'GET' })
    if (res.ok) return true
  } catch {
    // Server not ready yet
  }

  if (attempt < HEALTH_MAX_RETRIES) {
    await new Promise(resolve => setTimeout(resolve, HEALTH_RETRY_DELAY))
    return waitForServer(attempt + 1)
  }

  return false
}

async function request<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res: Response

  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Network error — server is likely sleeping
    const { dismiss } = toast({
      title: 'SERVER_WAKEUP',
      description: 'Server is waking up, please wait...',
    })

    const awake = await waitForServer()
    dismiss()

    if (!awake) {
      throw new Error('Server is still waking up. Please try again in a moment.')
    }

    // Replay the original request
    const retryRes = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!retryRes.ok) {
      if (retryRes.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      const err = await retryRes.json()
      throw new Error(err.error || 'Request failed')
    }

    return retryRes.json()
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    const err = await res.json()
    throw new Error(err.error || 'Request failed')
  }

  return res.json()
}

export const api = {
  get: <T>(url: string) => request<T>(url, 'GET'),
  post: <T>(url: string, body: unknown) => request<T>(url, 'POST', body),
  put: <T>(url: string, body: unknown) => request<T>(url, 'PUT', body),
  delete: <T>(url: string) => request<T>(url, 'DELETE'),
}
