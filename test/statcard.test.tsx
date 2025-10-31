/* @vitest-environment jsdom */
import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import StatCard from '@/components/cards/StatCard'

describe('StatCard', () => {
  it('renders title and value and optional delta', () => {
    render(<StatCard title="Recovered" value={12345} delta="+5%" description="since last week" />)

    expect(screen.getByRole('region', { name: /Recovered/i })).toBeInTheDocument()
    expect(screen.getByText('12345')).toBeInTheDocument()
    expect(screen.getByText('+5%')).toBeInTheDocument()
    expect(screen.getByText('since last week')).toBeInTheDocument()
  })
})
