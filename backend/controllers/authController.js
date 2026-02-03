const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, password, gender,
            originCountry, originState, originLga,
            residenceCountry, residenceState, residenceCity, residenceAddress,
            occupation, interests, church, matchPreference
        } = req.body;

        // 1. Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert user
        const newUser = await db.query(
            `INSERT INTO users (
                firstName, lastName, email, phone, password, gender,
                originCountry, originState, originLga,
                residenceCountry, residenceState, residenceCity, residenceAddress,
                occupation, interests, church, matchPreference
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
            RETURNING id, firstName, email`,
            [
                firstName, lastName, email, phone, hashedPassword, gender,
                originCountry, originState, originLga,
                residenceCountry, residenceState, residenceCity, residenceAddress,
                occupation, JSON.stringify(interests), church, matchPreference
            ]
        );

        // 4. Create JWT
        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check for user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Create JWT
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Update user subscription tier
// @route   PUT /api/auth/subscription
// @access  Private
exports.updateSubscription = async (req, res) => {
    try {
        const { tier } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!['free', 'premium'].includes(tier)) {
            return res.status(400).json({ message: 'Invalid subscription tier' });
        }

        const result = await db.query(
            'UPDATE users SET subscription_tier = $1 WHERE id = $2 RETURNING id, subscription_tier',
            [tier, userId]
        );

        res.json({
            message: `Subscription updated to ${tier}`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Subscription update error:', error);
        res.status(500).json({ message: 'Server error during subscription update' });
    }
};
