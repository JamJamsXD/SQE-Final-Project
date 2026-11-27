import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const INPUT_PLACEHOLDER = 'What needs to be done?'

// Reads the number shown on a statistics card such as "Total Tasks".
function getStat(label) {
  const card = Array.from(document.querySelectorAll('.stat-card')).find(
    (el) => el.querySelector('span').textContent === label
  )
  return card.querySelector('h2').textContent
}

async function addTask(user, title) {
  await user.type(screen.getByPlaceholderText(INPUT_PLACEHOLDER), title)
  await user.click(screen.getByRole('button', { name: 'Add Task' }))
}

afterEach(() => {
  cleanup()
})

describe('TaskFlow Application', () => {
  beforeEach(() => {
    render(<App />)
  })

  describe('adding tasks', () => {
    // Valid input
    it('adds a valid task, clears the input and updates the total', async () => {
      const user = userEvent.setup()

      await addTask(user, 'Study React testing')

      expect(screen.getByText('Study React testing')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(INPUT_PLACEHOLDER)).toHaveValue('')
      expect(getStat('Total Tasks')).toBe('4')
      expect(getStat('Pending')).toBe('3')
    })

    // Boundary: surrounding spaces are trimmed
    it('trims whitespace around a new task title', async () => {
      const user = userEvent.setup()

      await addTask(user, '   Write report   ')

      expect(screen.getByRole('checkbox', { name: 'Write report' })).toBeInTheDocument()
    })

    // Invalid input: empty
    it('does not add an empty task', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: 'Add Task' }))

      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
      expect(getStat('Total Tasks')).toBe('3')
    })

    // Invalid input: whitespace only
    it('does not add a task made only of spaces', async () => {
      const user = userEvent.setup()

      await addTask(user, '     ')

      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    })
  })

  describe('completing and deleting tasks', () => {
    // Alternative outcome: pending -> completed
    it('marks a pending task as completed and updates the statistics', async () => {
      const user = userEvent.setup()
      const checkbox = screen.getByRole('checkbox', { name: 'Complete SQE Final Project' })

      await user.click(checkbox)

      expect(checkbox).toBeChecked()
      expect(getStat('Completed')).toBe('2')
      expect(getStat('Pending')).toBe('1')
    })

    // Alternative outcome: completed -> pending
    it('marks a completed task as pending again', async () => {
      const user = userEvent.setup()
      const checkbox = screen.getByRole('checkbox', { name: 'Review React fundamentals' })

      expect(checkbox).toBeChecked()
      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
      expect(getStat('Completed')).toBe('0')
      expect(getStat('Pending')).toBe('3')
    })

    it('deletes only the selected task', async () => {
      const user = userEvent.setup()

      await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])

      expect(screen.queryByText('Complete SQE Final Project')).not.toBeInTheDocument()
      expect(screen.getByText('Review React fundamentals')).toBeInTheDocument()
      expect(getStat('Total Tasks')).toBe('2')
    })
  })

  describe('filtering tasks', () => {
    it('shows only completed tasks with the Completed filter', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: 'Completed' }))

      expect(screen.getByText('Review React fundamentals')).toBeInTheDocument()
      expect(screen.queryByText('Complete SQE Final Project')).not.toBeInTheDocument()
    })

    it('shows only pending tasks with the Pending filter', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: 'Pending' }))

      expect(screen.getByText('Complete SQE Final Project')).toBeInTheDocument()
      expect(screen.getByText('Prepare project documentation')).toBeInTheDocument()
      expect(screen.queryByText('Review React fundamentals')).not.toBeInTheDocument()
    })

    it('shows every task again when All is selected', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: 'Completed' }))
      await user.click(screen.getByRole('button', { name: 'All' }))

      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    })

    // Boundary: a filter that matches nothing
    it('shows the empty-state message when no task matches the filter', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: 'Completed' }))
      await user.click(screen.getByRole('checkbox', { name: 'Review React fundamentals' }))

      expect(screen.getByText(/No tasks found/)).toBeInTheDocument()
    })
  })

  describe('statistics', () => {
    it('shows the correct initial totals', () => {
      expect(getStat('Total Tasks')).toBe('3')
      expect(getStat('Completed')).toBe('1')
      expect(getStat('Pending')).toBe('2')
    })
  })

  it('should demonstrate a failing test', () => {
  expect(true).toBe(false)
})
})
