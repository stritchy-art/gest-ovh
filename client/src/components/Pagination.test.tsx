import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('should display total items and current page', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        onPageChange={() => {}}
      />
    )

    expect(screen.getByText('50 instance(s) — page 2 / 5')).toBeInTheDocument()
  })

  it('should disable first/prev buttons on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        onPageChange={() => {}}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled() // First
    expect(buttons[1]).toBeDisabled() // Prev
    expect(buttons[2]).not.toBeDisabled() // Next
    expect(buttons[3]).not.toBeDisabled() // Last
  })

  it('should disable next/last buttons on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalItems={50}
        onPageChange={() => {}}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).not.toBeDisabled() // First
    expect(buttons[1]).not.toBeDisabled() // Prev
    expect(buttons[2]).toBeDisabled() // Next
    expect(buttons[3]).toBeDisabled() // Last
  })

  it('should call onPageChange with correct page number', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        onPageChange={onPageChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    
    buttons[0].click() // First
    expect(onPageChange).toHaveBeenCalledWith(1)

    buttons[3].click() // Last
    expect(onPageChange).toHaveBeenCalledWith(5)
  })
})
