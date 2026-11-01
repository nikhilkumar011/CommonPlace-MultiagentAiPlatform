import bcrypt from 'bcrypt';
import validator from 'validator';
import { clearAuthCookie, createToken, setAuthCookie } from '../lib/utils/jwt.js';
import { createUserSession, deleteUserSession } from '../lib/utils/session.js';
import User from '../models/User.js';
const BCRYPT_ROUNDS = 12;
function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profilePic: user.profilePic ?? '',
    };
}
export async function register(req, res, next) {
    try {
        const { name, email, password, profilePic } = req.body;
        if (typeof name !== 'string' ||
            !name.trim() ||
            typeof email !== 'string' ||
            !validator.isEmail(email) ||
            typeof password !== 'string' ||
            password.length < 8 ||
            (profilePic !== undefined && typeof profilePic !== 'string')) {
            res.status(400).json({
                message: 'Provide a name, valid email, password of at least 8 characters, and optional profilePic.',
            });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.exists({ email: normalizedEmail });
        if (existingUser) {
            res.status(409).json({ message: 'An account with this email already exists.' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            profilePic: profilePic ?? '',
        });
        const sessionUser = publicUser(user);
        const sessionId = await createUserSession(sessionUser);
        setAuthCookie(res, createToken(sessionUser.id, sessionId));
        res.status(201).json({ user: publicUser(user) });
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 11000) {
            res.status(409).json({ message: 'An account with this email already exists.' });
            return;
        }
        next(error);
    }
}
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (typeof email !== 'string' ||
            !validator.isEmail(email) ||
            typeof password !== 'string' ||
            !password) {
            res.status(400).json({ message: 'Provide a valid email and password.' });
            return;
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }
        const sessionUser = publicUser(user);
        const sessionId = await createUserSession(sessionUser);
        setAuthCookie(res, createToken(sessionUser.id, sessionId));
        res.status(200).json({ user: publicUser(user) });
    }
    catch (error) {
        next(error);
    }
}
export async function logout(_req, res, next) {
    try {
        await deleteUserSession(res.locals.sessionId);
        clearAuthCookie(res);
        res.status(200).json({ message: 'Logged out successfully.' });
    }
    catch (error) {
        next(error);
    }
}
export async function getCurrentUser(_req, res, next) {
    try {
        const user = res.locals.sessionUser;
        res.status(200).json({ user });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=authController.js.map