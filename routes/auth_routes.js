const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Assuming a separate database configuration file
const pool = require('../config/db'); 
const isAuthenticated = require('../middleware/auth'); // Import the auth middleware

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }

    try {
        // Check if username or email already exists
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (rows.length > 0) {
            return res.status(400).json({ message: "Username or email already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Successful registration response
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        // Log the error for debugging
        console.error(err);
        res.status(500).json({ message: "An error occurred during registration." });
    }
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Fetch user from database (explicitly select user_id)
        const [user] = await pool.query('SELECT user_id, username, role, password FROM users WHERE username = ?', [username]);

        if (user.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user[0].password);

        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        // Store user ID in session (use user_id)
        req.session.user = {
            id: user[0].user_id,  // ✅ Correcting ID field
            username: user[0].username,
            role: user[0].role
        };

        // Save session and respond
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Session save error' });
            }
            res.status(200).json({ message: 'Login successful!', user: req.session.user });
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Logout route
router.get('/logout', async (req, res) => {
    try {
        const sessionId = req.sessionID; // Get session ID

        if (!sessionId) {
            return res.status(400).json({ error: 'No active session found. Please log in.' });
        }

        // Delete session from database
        await pool.execute('DELETE FROM sessions WHERE session_id = ?', [sessionId]);

        // Destroy Express session
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err.message);
                return res.status(500).json({ error: 'An error occurred during logout. Please try again.' });
            }

            // Clear session cookie
            res.clearCookie('connect.sid');

            // Redirect or send JSON response
            res.status(200).json({ message: 'Logout successful. Redirecting to login...' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.put('/api/user/change-password', isAuthenticated, async (req, res) => {
    const { newPassword } = req.body;
    const user_id = req.session.user_id;

    if (!newPassword || newPassword.trim().length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Assuming bcrypt is used for hashing
        await pool.execute(
            `UPDATE users SET password = ? WHERE user_id = ?`,
            [hashedPassword, user_id]
        );
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.put('/api/user/change-email', isAuthenticated, async (req, res) => {
    const { newEmail } = req.body;
    const user_id = req.session.user_id;

    if (!newEmail || !newEmail.includes('@')) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    try {
        await pool.execute(
            `UPDATE users SET email = ? WHERE user_id = ?`,
            [newEmail, user_id]
        );
        res.json({ success: true, message: 'Email updated successfully.' });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.delete('/api/user/delete-account', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;

    try {
        await pool.execute(`DELETE FROM users WHERE user_id = ?`, [user_id]);
        req.session.destroy(); // End user session after deletion
        res.json({ success: true, message: 'Account deleted successfully.' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router;