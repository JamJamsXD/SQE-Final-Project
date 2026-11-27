
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest';

import {
  render,
  screen,
  cleanup
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import App from './App';

afterEach(() => {
  cleanup();
});

describe('TaskFlow Application', () => {

  beforeEach(() => {
    render(<App />);
  });

  // TEST 1: Valid input
  it('should successfully add a new task', async () => {
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(
      'What needs to be done?'
    );

    await user.type(input, 'Study React testing');

    await user.click(
      screen.getByRole('button', { name: 'Add Task' })
    );

    expect(
      screen.getByText('Study React testing')
    ).toBeInTheDocument();

    expect(input).toHaveValue('');
  });

  // TEST 2: Alternative outcome
  it('should mark a task as completed', async () => {
    const user = userEvent.setup();

    const checkbox = screen.getByRole('checkbox', {
      name: 'Complete SQE Final Project'
    });

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  // TEST 3: Invalid input
  it('should not add an empty task', async () => {
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: 'Add Task' })
    );

    expect(
      screen.getByText('Complete SQE Final Project')
    ).toBeInTheDocument();

    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  // TEST 4: Delete functionality
  it('should delete an existing task', async () => {
    const user = userEvent.setup();

    const deleteButtons = screen.getAllByRole(
      'button',
      { name: 'Delete' }
    );

    await user.click(deleteButtons[0]);

    expect(
      screen.queryByText('Complete SQE Final Project')
    ).not.toBeInTheDocument();
  });

  // TEST 5: Filtering functionality
  it('should display only completed tasks when filtered', async () => {
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: 'Completed' })
    );

    expect(
      screen.getByText('Review React fundamentals')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Complete SQE Final Project')
    ).not.toBeInTheDocument();
  });


  // TEST 6: Statistics
  it( () => {
    const totalCard = screen.getByText('Total Tasks')
      .closest('.stat-card');

    const completedCard = screen.getByText('Completed')
      .closest('.stat-card');

    const pendingCard = screen.getByText('Pending')
      .closest('.stat-card');

    expect(totalCard).toHaveTextContent('3');
    expect(completedCard).toHaveTextContent('1');
    expect(pendingCard).toHaveTextContent('2');
  });


});
