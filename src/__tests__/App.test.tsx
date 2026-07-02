import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as taskApi from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Ma tâche',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('App', () => {
	it('renders header and form', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);

		render(<App />);

		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();
		expect(screen.getByTestId('task-form')).toBeInTheDocument();
	});

	it('shows stats when tasks are loaded', async () => {
		const completedTask = { ...mockTask, id: 2, completed: true };
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask, completedTask]);

		render(<App />);

		await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());

		expect(screen.getByText('Total')).toBeInTheDocument();
		expect(screen.getByText('Terminées')).toBeInTheDocument();
		expect(screen.getByText('En cours')).toBeInTheDocument();
	});

	it('does not show stats when no tasks', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);

		render(<App />);

		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());

		expect(screen.queryByText('Total')).not.toBeInTheDocument();
	});
});
