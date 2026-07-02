import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders create mode by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
	});

	it('renders edit mode', () => {
		render(
			<TaskForm
				onSubmit={vi.fn()}
				mode="edit"
				initialValues={{ title: 'Mon titre', description: 'Ma desc' }}
			/>
		);
		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
		expect(screen.getByDisplayValue('Mon titre')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Ma desc')).toBeInTheDocument();
	});

	it('shows validation error when title is empty', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
	});

	it('calls onSubmit with trimmed values', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), { target: { value: '  Ma tâche  ' } });
		fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Ma description' } });
		fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Ma tâche', description: 'Ma description' });
	});

	it('calls onSubmit without description when empty', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Ma tâche' } });
		fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Ma tâche', description: undefined });
	});

	it('clears form after create submit', () => {
		render(<TaskForm onSubmit={vi.fn()} />);

		const titleInput = screen.getByLabelText('Titre');
		fireEvent.change(titleInput, { target: { value: 'Ma tâche' } });
		fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(titleInput).toHaveValue('');
	});

	it('does not clear form after edit submit', () => {
		render(
			<TaskForm
				onSubmit={vi.fn()}
				mode="edit"
				initialValues={{ title: 'Mon titre' }}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		expect(screen.getByDisplayValue('Mon titre')).toBeInTheDocument();
	});

	it('calls onCancel when cancel button is clicked', () => {
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

		fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(onCancel).toHaveBeenCalled();
	});

	it('does not render cancel button without onCancel', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument();
	});

	it('clears validation error when user types', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(screen.getByRole('alert')).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'a' } });
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});
});
