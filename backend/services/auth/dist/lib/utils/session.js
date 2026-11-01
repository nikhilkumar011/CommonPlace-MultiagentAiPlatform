import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const SESSION_PREFIX = 'auth:session:';
const SESSION_TTL_SECONDS = 60 * 60;
const redisModuleUrl = pathToFileURL(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../shared/redis.js')).href;
let redisClientPromise;
async function getRedisClient() {
    redisClientPromise ??= import(redisModuleUrl).then((loaded) => {
        const redisClient = loaded.ioRedis ?? loaded.default?.ioRedis;
        if (!redisClient) {
            throw new Error('The shared Redis module does not export ioRedis');
        }
        return redisClient;
    });
    return redisClientPromise;
}
function isSessionUser(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const user = value;
    return (typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        typeof user.profilePic === 'string');
}
function parseUserSession(value) {
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null) {
        return null;
    }
    const session = parsed;
    if (typeof session.userId !== 'string' ||
        !isSessionUser(session.user) ||
        session.user.id !== session.userId) {
        return null;
    }
    return { userId: session.userId, user: session.user };
}
export async function createUserSession(user) {
    const sessionId = randomUUID();
    const session = { userId: user.id, user };
    const result = await (await getRedisClient()).set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(session), 'EX', SESSION_TTL_SECONDS);
    if (result !== 'OK') {
        throw new Error('Redis did not confirm the user session was stored');
    }
    return sessionId;
}
export async function getUserSession(sessionId) {
    const value = await (await getRedisClient()).get(`${SESSION_PREFIX}${sessionId}`);
    if (!value) {
        return null;
    }
    return parseUserSession(value);
}
export async function deleteUserSession(sessionId) {
    await (await getRedisClient()).del(`${SESSION_PREFIX}${sessionId}`);
}
//# sourceMappingURL=session.js.map