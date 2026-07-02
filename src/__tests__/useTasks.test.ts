import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.tasks).toEqual([mockTask]);
		expect(result.current.error).toBeNull();
	});

	it('sets error when getTasks fails', async () => {
		vi.spyOn(taskApi, 'getTasks').mockRejectedValue(new Error('Erreur réseau'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe('Erreur réseau');
		expect(result.current.tasks).toEqual([]);
	});

	it('sets generic error for non-Error rejection', async () => {
		vi.spyOn(taskApi, 'getTasks').mockRejectedValue('something');

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.error).toBe('Une erreur est survenue');
	});

	it('addTask prepends new task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);
		const newTask = { ...mockTask, id: 2, title: 'Nouvelle' };
		vi.spyOn(taskApi, 'createTask').mockResolvedValue(newTask);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Nouvelle' });
		});

		expect(result.current.tasks).toEqual([newTask]);
	});

	it('editTask updates task in list', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const updated = { ...mockTask, title: 'Modifié' };
		vi.spyOn(taskApi, 'updateTask').mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Modifié' });
		});

		expect(result.current.tasks[0].title).toBe('Modifié');
	});

	it('removeTask removes task from list', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		vi.spyOn(taskApi, 'deleteTask').mockResolvedValue();

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toEqual([]);
	});

	it('toggleComplete flips completed status', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const toggled = { ...mockTask, completed: true };
		vi.spyOn(taskApi, 'updateTask').mockResolvedValue(toggled);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(result.current.tasks[0].completed).toBe(true);
		expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
	});

	it('toggleComplete does nothing if task not found', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const updateSpy = vi.spyOn(taskApi, 'updateTask');

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(updateSpy).not.toHaveBeenCalled();
	});
});
