"use client"
import React from "react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
