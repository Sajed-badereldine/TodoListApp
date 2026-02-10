    const express = require('express');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const { v4: uuidv4 } = require('uuid');
    const { db, saveDb } = require('./db');
    const authenticateToken = require('./auth');

    const app = express();
    app.use(express.json());

    /* ---------- SIGN UP ---------- */
    app.post('/api/sign-up', async (req, res) => {
    const { email, password } = req.body;

    if (db.users.find(u => u.email === email)) {
        return res.sendStatus(409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.users.push({
        id,
        email,
        passwordHash,
        isVerified: false,
    });

    saveDb();

    jwt.sign(
        { id, email, isVerified: false },
        process.env.JWT_SECRET,
        { expiresIn: '2d' },
        (err, token) => {
        if (err) return res.sendStatus(500);
        res.json({ token });
        }
    );
    });

    /* ---------- LOG IN ---------- */
    app.post('/api/log-in', async (req, res) => {
    const { email, password } = req.body;

    const user = db.users.find(u => u.email === email);
    if (!user) return res.sendStatus(401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.sendStatus(401);

    jwt.sign(
        { id: user.id, email: user.email, isVerified: user.isVerified },
        process.env.JWT_SECRET,
        { expiresIn: '2d' },
        (err, token) => {
        if (err) return res.sendStatus(500);
        res.json({ token });
        }
    );
    });

    /* ---------- TODOS ---------- */

    // get todos
    app.get('/api/todos', authenticateToken, (req, res) => {
    const todos = db.todos.filter(t => t.userId === req.user.id);
    res.json(todos);
    });

    // add todo
    app.post('/api/todos', authenticateToken, (req, res) => {
    const { text } = req.body;
    if (!text) return res.sendStatus(400);

    const todo = {
        id: uuidv4(),
        userId: req.user.id,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
    };

    db.todos.push(todo);
    saveDb();

    res.status(201).json(todo);
    });

    // delete todo
    app.delete('/api/todos/:id', authenticateToken, (req, res) => {
    const index = db.todos.findIndex(
        t => t.id === req.params.id && t.userId === req.user.id
    );

    if (index === -1) return res.sendStatus(404);

    db.todos.splice(index, 1);
    saveDb();

    res.sendStatus(204);
    });

    app.listen(3000, () => console.log('Server running on 3000'));
