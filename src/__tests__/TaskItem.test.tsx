import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Une description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

const completedTask: Task = { ...mockTask, completed: true };

describe('TaskItem', () => {
	it('renders task title and description', () => {
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Une description')).toBeInTheDocument();
	});

	it('does not render description when null', () => {
		const task = { ...mockTask, description: null };
		render(
			<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
	});

	it('applies completed class when task is completed', () => {
		render(
			<TaskItem task={completedTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
	});

	it('calls onToggle when checkbox is changed', () => {
		const onToggle = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		fireEvent.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('enters edit mode when edit button is clicked', () => {
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
		expect(screen.getByLabelText('Modifier la description')).toBeInTheDocument();
	});

	it('calls onEdit with updated values on save', () => {
		const onEdit = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);
		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

		const titleInput = screen.getByLabelText('Modifier le titre');
		fireEvent.change(titleInput, { target: { value: 'Titre modifié' } });
		fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Une description',
		});
	});

	it('does not call onEdit if title is empty on save', () => {
		const onEdit = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);
		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

		const titleInput = screen.getByLabelText('Modifier le titre');
		fireEvent.change(titleInput, { target: { value: '  ' } });
		fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels edit and restores original values', () => {
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));

		const titleInput = screen.getByLabelText('Modifier le titre');
		fireEvent.change(titleInput, { target: { value: 'Changement temporaire' } });
		fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
	});

	it('requires double click to delete (confirmation)', () => {
		const onDelete = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />
		);
		const deleteBtn = screen.getByRole('button', { name: 'Supprimer' });
		fireEvent.click(deleteBtn);
		expect(onDelete).not.toHaveBeenCalled();

		fireEvent.click(deleteBtn);
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('resets confirmation state after timeout', async () => {
		vi.useFakeTimers();
		const onDelete = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />
		);
		const deleteBtn = screen.getByRole('button', { name: 'Supprimer' });
		fireEvent.click(deleteBtn);

		await act(async () => {
			vi.advanceTimersByTime(3000);
		});

		fireEvent.click(deleteBtn);
		expect(onDelete).not.toHaveBeenCalled();
		vi.useRealTimers();
	});

	it('sends undefined description when empty on save', () => {
		const onEdit = vi.fn();
		const task = { ...mockTask, description: null };
		render(
			<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);
		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Ma tâche',
			description: undefined,
		});
	});
});
