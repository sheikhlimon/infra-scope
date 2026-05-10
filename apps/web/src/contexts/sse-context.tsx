'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSSE, type SSEMessage } from '@/hooks/use-sse'

interface SSEContextValue {
  subscribe: (event: string, callback: (data: SSEMessage) => void) => () => void
  connected: boolean
}

const SSEContext = createContext<SSEContextValue | null>(null)

export function SSEProvider({ children }: { children: ReactNode }) {
  const sse = useSSE()
  return <SSEContext.Provider value={sse}>{children}</SSEContext.Provider>
}

export function useSSEEvents() {
  const ctx = useContext(SSEContext)
  if (!ctx) throw new Error('useSSEEvents must be used within SSEProvider')
  return ctx
}
