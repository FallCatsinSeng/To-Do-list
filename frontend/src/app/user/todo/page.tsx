'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import styles from './todo.module.css';

export default function UserTodoPage() {
    const [todos, setTodos] = useState<any[]>([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        try {
            const response = await api.get('/todos');
            setTodos(response.data.data || []);
        } catch (error) {
            console.error('Failed to load todos:', error);
        }
    };

    const addTodo = async () => {
        if (title.trim() === '') {
            alert('Judul tidak boleh kosong');
            return;
        }

        try {
            await api.post('/todos', { title });
            setTitle('');
            loadTodos();
        } catch (error) {
            alert('Gagal menambah todo');
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            await api.put(`/todos/${id}/status`);
            loadTodos();
        } catch (error) {
            alert('Gagal mengubah status');
        }
    };

    const deleteTodo = async (id: number) => {
        if (!confirm('Hapus tugas ini?')) return;

        try {
            await api.delete(`/todos/${id}`);
            loadTodos();
        } catch (error) {
            alert('Gagal menghapus todo');
        }
    };

    return (
        <div className={styles.container}>
            <h2 style={{ marginBottom: '10px' }}>To-do List</h2>
            <p style={{ color: '#666', marginTop: '-5px' }}>Kelola tugas kamu</p>

            <div className={styles.todoForm}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tulis tugas baru..."
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <button onClick={addTodo}>Tambah</button>
            </div>

            <div className={styles.todoList}>
                {todos.map((todo) => (
                    <div key={todo.id} className={styles.todoItem}>
                        <div className={todo.status === 'done' ? styles.done : ''}>
                            <input
                                type="checkbox"
                                checked={todo.status === 'done'}
                                onChange={() => toggleStatus(todo.id)}
                            />
                            {todo.title}
                        </div>
                        <button onClick={() => deleteTodo(todo.id)} style={{ color: 'red' }}>
                            Hapus
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
