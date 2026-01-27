import { Pool } from 'pg';

const connectionString = "postgresql://cloudtelephony_user:9TGtFLqLFkfJF66x32disIQIicZZhwXR@dpg-d5l4i375r7bs73cr2vog-a.oregon-postgres.render.com/cloudtelephony";

const globalForPg = global as unknown as { pool: Pool };

export const pool = globalForPg.pool || new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;