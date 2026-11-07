// Starts the real Next.js app for the E2E suite against a throwaway in-memory MongoDB, seeded
// with backend/seed.js. It never touches the database configured in .env.
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const ROOT = path.resolve(__dirname, '..', '..');
const NEXT_BIN = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
const PORT = process.env.E2E_PORT || '3100';

function runOrExit(args, env) {
    const result = spawnSync(process.execPath, args, { cwd: ROOT, env, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
}

(async () => {
    const mongo = await MongoMemoryServer.create();
    const env = {
        ...process.env,
        MONGO_URI: mongo.getUri('jibli_e2e'),
        JWT_SECRET: require('crypto').randomBytes(48).toString('hex'),
    };

    runOrExit(['backend/seed.js'], env);
    runOrExit([NEXT_BIN, 'build'], env);

    const app = spawn(process.execPath, [NEXT_BIN, 'start', '-p', PORT], { cwd: ROOT, env, stdio: 'inherit' });

    const shutdown = async () => {
        app.kill();
        await mongo.stop();
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    app.on('exit', (code) => process.exit(code ?? 0));
})();
