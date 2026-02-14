    import { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import axios from 'axios';
    import { useToken } from './usetoken';

    function Todo() {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState('');
    const [token, setToken] = useToken();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
        navigate('/log-in');
        return;
        }

        axios.get('/api/todos', {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => setTodos(res.data))
        .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            setToken(null);
            navigate('/log-in');
        } else {
            console.error('Server error:', err);
        }
        });
    }, [token, navigate]);

    const addTodo = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
        const res = await axios.post(
            '/api/todos',
            { text },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setTodos(prev => [...prev, res.data]);
        setText('');
        } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            setToken(null);
            navigate('/log-in');
        } else {
            console.error('Add todo failed:', err);
        }
        }
    };

    const deleteTodo = async (id) => {
        try {
        await axios.delete(`/api/todos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setTodos(prev => prev.filter(t => t.id !== id));
        } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            setToken(null);
            navigate('/log-in');
        } else {
            console.error('Delete failed:', err);
        }
        }
    };

    const handleLogout = () => {
        setToken(null);
        navigate('/log-in');
    };

    function moveTaskUp(index) {
        if (index > 0) {
        const updatedTasks = [...todos];
        [updatedTasks[index], updatedTasks[index - 1]] = [
            updatedTasks[index - 1],
            updatedTasks[index],
        ];
        setTodos(updatedTasks);
        }
    }

    function moveTaskDown(index) {
        if (index < todos.length - 1) {
        const updatedTasks = [...todos];
        [updatedTasks[index], updatedTasks[index + 1]] = [
            updatedTasks[index + 1],
            updatedTasks[index],
        ];
        setTodos(updatedTasks);
        }
    
    }



    return (
        <div style={{
        maxWidth: 500,
        margin: '40px auto',
        fontFamily: 'Segoe UI, sans-serif',
        background: '#f7f7f7',
        padding: 20,
        borderRadius: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, color: '#333' }}>Todo List</h1>
            <button 
            onClick={handleLogout} 
            style={{
                background: '#ff4d4f',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 5,
                cursor: 'pointer'
            }}
            >
            Logout
            </button>
        </div>

        <form onSubmit={addTodo} style={{ margin: '20px 0', display: 'flex', gap: 10 }}>
            <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a new task..."
            style={{
                flex: 1,
                padding: 10,
                borderRadius: 5,
                border: '1px solid #ccc',
                fontSize: 16
            }}
            />
            <button
            type="submit"
            style={{
                padding: '10px 16px',
                background: '#1890ff',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer'
            }}
            >
            Add
            </button>
        </form>

        {todos.length === 0 && <p style={{ color: '#666' }}>No tasks yet.</p>}

    <ul style={{ listStyle: 'none', padding: 0 }}>
    {todos.map((todo, index) => (
        <li
        key={todo.id}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            marginBottom: 8,
            background: '#fff',
            borderRadius: 5,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
            onClick={() => moveTaskUp(index)}
            disabled={index === 0}
            style={{ cursor: 'pointer' }}
            >
            ⬆
            </button>

            <button
            
            onClick={() => moveTaskDown(index)}
            disabled={index === todos.length - 1}
            style={{ cursor: 'pointer' }}
            >
            ⬇
            </button>

            <span>{todo.text}</span>
        </div>

        <button
            type='buttom'
            onClick={() => deleteTodo(todo.id)}
            style={{
            background: '#ff4d4f',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: 5,
            cursor: 'pointer'
            }}
        >
            Delete
        </button>
        </li>
    ))}
    </ul>
        </div>
    );
    }

    export default Todo;
