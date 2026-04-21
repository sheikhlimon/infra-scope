'use client'

import { useState, useEffect, useCallback } from 'react'

const MAX_RETRIES = 10
const RETRY_DELAY = 5000

export type WarmupStatus = 'checking' | 'warming' | 'ready' | 'error'

export function useServerWarmup() {
  const [status, setStatus] = useState<WarmupStatus>('checking')
  const [attempt, setAttempt] = useState(0)

  const checkHealth = useCallback(async (retry = 1) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    const healthUrl = apiUrl.replace('/api', '/health')

    try {
      const res = await fetch(healthUrl, { method: 'GET' })
      if (res.ok) {
        setStatus('ready')
        return true
      }
    } catch {
      // Server not ready yet
    }

    if (retry < MAX_RETRIES) {
      setStatus('warming')
      setAttempt(retry)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return checkHealth(retry + 1)
    }

    setStatus('error')
    return false
  }, [])

  const retry = useCallback(() => {
    setStatus('checking')
    setAttempt(0)
    return checkHealth(1)
  }, [checkHealth])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return { status, attempt, totalAttempts: MAX_RETRIES, retry }
}
