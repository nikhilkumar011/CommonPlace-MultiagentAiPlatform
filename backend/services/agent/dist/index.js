import express from 'express';
import './config.js';
import agentRoutes from './routes/agentRoutes.js';
const app = express();
app.use(express.json({ limit: '12mb' }));
app.use('/invoke', (req, res, next) => {
    const startedAt = Date.now();
    console.info(`[agent] ${req.method} ${req.originalUrl} started`);
    res.on('finish', () => {
        console.info(`[agent] ${req.method} ${req.originalUrl} completed with ${res.statusCode} in ${Date.now() - startedAt}ms`);
    });
    res.on('close', () => {
        if (!res.writableFinished) {
            console.warn(`[agent] ${req.method} ${req.originalUrl} closed before completion after ${Date.now() - startedAt}ms`);
        }
    });
    next();
});
app.get('/', (req, res) => {
    res.send('Hello from the agent service!');
});
app.use('/', agentRoutes);
const errorHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }
    const status = typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof error.statusCode === 'number' &&
        [400, 401, 403, 404, 429].includes(error.statusCode)
        ? error.statusCode
        : typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            error.status === 429
            ? 429
            : 500;
    if (status !== 500) {
        const message = typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string'
            ? error.message
            : status === 429
                ? 'The selected model has reached its API quota. Check your provider plan and model limits.'
                : 'The upstream AI provider rejected the request.';
        if (status === 429 &&
            typeof error === 'object' &&
            error !== null &&
            'retryAfterSeconds' in error &&
            typeof error.retryAfterSeconds === 'number') {
            res.setHeader('Retry-After', String(error.retryAfterSeconds));
        }
        console.error(`Agent request failed with HTTP ${status}.`);
        res.status(status).json({ message });
        return;
    }
    console.error('Agent request failed:', error);
    res.status(500).json({
        message: 'The agent could not complete the request. Check the agent service logs.',
    });
};
app.use(errorHandler);
const PORT = Number(process.env.AGENT_SERVICE_PORT || 3003);
app.listen(PORT, () => {
    console.log(`Agent service is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map