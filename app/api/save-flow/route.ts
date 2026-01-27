import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { flowId, nodes, connections } = await req.json();
        const id = flowId || "main-ivr";

        const query = `
      INSERT INTO ivr_flows (id, nodes, connections, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET 
        nodes = EXCLUDED.nodes, 
        connections = EXCLUDED.connections, 
        updated_at = CURRENT_TIMESTAMP;
    `;

        await pool.query(query, [
            id,
            JSON.stringify(nodes),
            JSON.stringify(connections)
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Database Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}