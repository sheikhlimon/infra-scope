'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface SSEMessage<T = unknown> {
  event: string
  data: T
  timestamp: string
}

const EVENT_NAMES = [
  'system.status_changed',
  'system.created',
  'system.updated',
  'system.deleted',
  'activity.new',
  'stats.updated',
] as const

export function useSSE() {
  const listenersRef = useRef<Map<string, Set<(data: SSEMessage) => void>>>(new Map())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const es = new EventSource(`${API_URL}/events?token=${token}`)

    const handleConnected = () => setConnected(true)

    const handlers = EVENT_NAMES.map((eventName) => {
      const handler = (e: MessageEvent) => {
        try {
          const parsed: SSEMessage = JSON.parse(e.data)
          listenersRef.current.get(eventName)?.forEach((fn) => fn(parsed))
        } catch {
          // malformed payload, ignore
        }
      }
      es.addEventListener(eventName, handler)
      return { eventName, handler }
    })

    es.addEventListener('connected', handleConnected)

    es.onerror = () => setConnected(false)

    return () => {
      es.removeEventListener('connected', handleConnected)
      handlers.forEach(({ eventName, handler }) => es.removeEventListener(eventName, handler))
      es.close()
    }
  }, [])

  const subscribe = useCallback(
    (event: string, callback: (data: SSEMessage) => void) => {
      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set())
      }
      listenersRef.current.get(event)!.add(callback)

      return () => {
        listenersRef.current.get(event)?.delete(callback)
      }
    },
    []
  )

  return { subscribe, connected }
}
