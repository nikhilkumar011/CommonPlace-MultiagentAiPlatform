export function requireUserId(req, res, next) {
    const userId = req.get('x-user-id');
    if (!userId) {
        res.status(401).json({ message: 'Authenticated user ID is required.' });
        return;
    }
    res.locals.userId = userId;
    next();
}
//# sourceMappingURL=requireUserId.js.map