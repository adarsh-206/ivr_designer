export type NodeType = "playback" | "menu" | "bridge" | "hangup";

export interface Connection {
    id: string;
    source: string;
    target: string;
    label?: string;
}

export interface IVRNode {
    id: string;
    type: NodeType;
    label: string;
    x: number;
    y: number;
    data: {
        audioFile?: string;
        destinationNumber?: string;
    };
}