    const express = require('express');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const { v4: uuidv4 } = require('uuid');
    const { db, saveDb } = require('./db');
    const authenticateToken = require('./auth');
    const sendEmail = require('./mailer')

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
    const verificationToken = uuidv4() ; 

    db.users.push({
        id,
        email,
        passwordHash,
        isVerified: false,
        verificationToken , 
    });

    saveDb();

    try {
        await sendEmail({
            from : "onboarding@resend.dev" ,
            to : email , 
            subject: 'Please verify your email',
            text: `Thanks for signing up! To verify your email,
            please click here: http://localhost:5173/verify-email/${verificationToken}`,
        })
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }

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

    if (!user.isVerified) {
        return res.status(403).json({
        message: "Please verify your email first."
    });
    }


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


    // verify email 

        app.put('/api/verify-email', async (req, res) => {
    try {
        const { verificationToken } = req.body;

        const user = db.users.find(
        user => user.verificationToken === verificationToken
        );

        if (!user) {
        return res.status(401).json({
            message: 'The email verification code is incorrect'
        });
        }

        user.isVerified = true;
        saveDb();

        const { id, email, isVerified } = user;

        jwt.sign(
        { id, email, isVerified },
        process.env.JWT_SECRET,
        { expiresIn: '2d' },
        (err, token) => {
            if (err) return res.status(500).send(err);
            res.json({ token });
        }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
    });


    app.listen(3000, () => { console.log('Server running on 3000')
            console.log(process.env.RESEND_API_KEY)

    }

);
