import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document type="xml/freeswitch-httapi">
    <work><hangup/></work>
</document>`;
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let formData: FormData;

        if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
            formData = await req.formData();
        } else {
            return generateXmlResponse('<hangup/>');
        }

        const digits = formData.get('digits') as string;
        const exNodeId = formData.get('node_id') as string;

        const result = await pool.query(
            "SELECT nodes, connections FROM ivr_flows ORDER BY updated_at DESC LIMIT 1"
        );

        if (!result.rows[0]) return generateXmlResponse('<hangup/>');

        const { nodes, connections } = result.rows[0];

        let activeNode = exNodeId
            ? nodes.find((n: any) => n.id === exNodeId)
            : nodes[0];

        if (!activeNode) return generateXmlResponse('<hangup/>');

        if (activeNode.type === "menu" && digits) {
            const conn = connections.find((c: any) =>
                c.source === activeNode.id && String(c.label) === String(digits)
            );
            if (conn) {
                const targetNode = nodes.find((n: any) => n.id === conn.target);
                if (targetNode) activeNode = targetNode;
            }
        }

        return processNodeToHttApi(activeNode, nodes, connections);

    } catch (error) {
        return generateXmlResponse('<hangup/>');
    }
}

function processNodeToHttApi(node: any, nodes: any[], connections: any[]) {
    const connection = connections.find((c: any) => c.source === node.id);
    const nextNodeId = connection?.target || "";
    const audioPath = node.data?.audioFile || "silence_stream://1000";

    let workXml = "";
    let paramsXml = "";

    switch (node.type) {
        case "playback":
            paramsXml = `<node_id>${nextNodeId}</node_id>`;
            workXml = `<playback file="${audioPath}"/>`;
            break;

        case "menu":
            paramsXml = `<node_id>${node.id}</node_id>`;
            workXml = `
                <playback file="${audioPath}" name="digits" input-timeout="5000">
                    <bind>~\\d</bind>
                </playback>`.trim();
            break;

        case "bridge":
            workXml = `<execute application="bridge" data="${node.data?.destinationNumber}"/>`;
            break;

        case "hangup":
        default:
            workXml = `<hangup/>`;
    }

    return generateXmlResponse(workXml, paramsXml);
}

function generateXmlResponse(work: string, params: string = "") {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document type="xml/freeswitch-httapi">
    <params>${params}</params>
    <work>${work}</work>
</document>`;

    return new NextResponse(xml, {
        headers: { 'Content-Type': 'text/xml' },
    });
}