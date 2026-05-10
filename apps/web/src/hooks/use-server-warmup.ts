'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const MAX_RETRIES = 10
const RETRY_DELAY = 5000
const REQUEST_TIMEOUT = 4000

export type WarmupStatus = 'checking' | 'warming' | 'ready' | 'error'

export function useServerWarmup() {
  const [status, setStatus] = useState<WarmupStatus>('checking')
  const [attempt, setAttempt] = useState(0)
  const cancelledRef = useRef(false)

  const checkHealth = useCallback(async (retry = 0) => {
    if (cancelledRef.current) return false

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    const healthUrl = apiUrl.replace('/api', '/health')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const res = await fetch(healthUrl, { method: 'GET', signal: controller.signal })
      if (res.ok) {
        setStatus('ready')
        return true
      }
    } catch {
      // Server not ready or request timed out
    } finally {
      clearTimeout(timeout)
    }

    if (cancelledRef.current) return false

    if (retry + 1 < MAX_RETRIES) {
      setStatus('warming')
      setAttempt(retry + 1)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return checkHealth(retry + 1)
    }

    setStatus('error')
    return false
  }, [])

  const retry = useCallback(() => {
    cancelledRef.current = false
    setStatus('checking')
    setAttempt(0)
    return checkHealth(0)
  }, [checkHealth])

  useEffect(() => {
    cancelledRef.current = false
    checkHealth(0)
    return () => { cancelledRef.current = true }
  }, [checkHealth])

  return { status, attempt, totalAttempts: MAX_RETRIES, retry }
}
