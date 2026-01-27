"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import Xarrow, { Xwrapper } from "react-xarrows";
import {
    Play, PhoneOff, Settings2, Landmark, Trash2,
    Hash, PhoneForwarded, X, ZoomIn, ZoomOut, Maximize
} from "lucide-react";
import { SidebarItem, CanvasNode } from "./IVRComponents";
import { IVRNode, Connection } from "../types";

export const DesignerCanvas = () => {
    const [hasMounted, setHasMounted] = useState(false);
    const [nodes, setNodes] = useState<IVRNode[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [pendingConnection, setPendingConnection] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    const canvasRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const handleZoom = (delta: number) => {
        setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 1.5));
    };

    const handleNodeClick = useCallback(
        (id: string) => {
            if (pendingConnection && pendingConnection !== id) {
                const newConnId = `c_${Date.now()}`;
                const sourceNode = nodes.find((n) => n.id === pendingConnection);
                const label = sourceNode?.type === "menu" ? "Digit 1" : "Next";

                setConnections((prev) => [
                    ...prev,
                    { id: newConnId, source: pendingConnection, target: id, label },
                ]);
                setPendingConnection(null);
            } else {
                setSelectedNodeId(id);
            }
        },
        [pendingConnection, nodes]
    );

    const [, drop] = useDrop(
        () => ({
            accept: ["NEW_NODE", "MOVE_NODE"],
            drop: (item: any, monitor) => {
                const offset = monitor.getClientOffset();
                const canvasRect = canvasRef.current?.getBoundingClientRect();

                if (!offset || !canvasRect) return;

                const x = (offset.x - canvasRect.left) / zoom;
                const y = (offset.y - canvasRect.top) / zoom;

                if (item.id) {
                    setNodes((prev) =>
                        prev.map((n) => (n.id === item.id ? { ...n, x: x - 120, y: y - 40 } : n))
                    );
                } else {
                    const newNodeId = `node_${Date.now()}`;
                    setNodes((prev) => [
                        ...prev,
                        { id: newNodeId, type: item.type, label: item.label, x: x - 120, y: y - 40, data: {} },
                    ]);
                }
            },
        }),
        [zoom]
    );

    if (!hasMounted) return null;

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden select-none font-sans text-slate-900">
            <aside className="w-72 bg-white border-r border-slate-200 z-30 flex flex-col shadow-xl">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                        <Landmark size={22} className="text-white" />
                    </div>
                    <h1 className="font-bold text-slate-900 text-xl tracking-tight">
                        Claritel Flow
                    </h1>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-1">
                    <p className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Components
                    </p>
                    <SidebarItem type="playback" label="Play Audio" icon={Play} />
                    <SidebarItem type="menu" label="IVR Menu" icon={Hash} />
                    <SidebarItem type="bridge" label="Call Transfer" icon={PhoneForwarded} />
                    <SidebarItem type="hangup" label="Hang Up" icon={PhoneOff} />
                </div>
            </aside>

            <main className="flex-1 relative bg-slate-50 overflow-hidden">
                <div className="absolute top-6 left-6 z-40 flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-xl border border-slate-200">
                    <button
                        onClick={() => handleZoom(0.1)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <button
                        onClick={() => handleZoom(-0.1)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <button
                        onClick={() => setZoom(1)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <Maximize size={18} />
                    </button>
                    <span className="px-3 text-xs font-black text-slate-500 min-w-[60px] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                </div>

                <div
                    ref={(el) => {
                        drop(el);
                        canvasRef.current = el;
                    }}
                    className="h-full w-full relative transition-transform duration-75 origin-top-left"
                    style={{
                        transform: `scale(${zoom})`,
                        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                    onClick={() => {
                        setSelectedNodeId(null);
                        setPendingConnection(null);
                    }}
                >
                    <Xwrapper>
                        {nodes.map((n) => (
                            <CanvasNode
                                key={n.id}
                                node={n}
                                zoom={zoom}
                                isSelected={selectedNodeId === n.id}
                                onSelect={handleNodeClick}
                                onConnect={setPendingConnection}
                            />
                        ))}

                        {connections.map((conn) => (
                            <Xarrow
                                key={conn.id}
                                start={conn.source}
                                end={conn.target}
                                color={selectedNodeId === conn.source ? "#6366f1" : "#cbd5e1"}
                                strokeWidth={2}
                                headSize={6}
                                path="smooth"
                                labels={{
                                    middle: (
                                        <div
                                            className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-[10px] font-bold text-indigo-600 cursor-pointer hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConnections((prev) =>
                                                    prev.filter((c) => c.id !== conn.id)
                                                );
                                            }}
                                        >
                                            {conn.label}
                                        </div>
                                    ),
                                }}
                            />
                        ))}
                    </Xwrapper>
                </div>
            </main>

            {selectedNode && (
                <aside className="w-80 bg-white border-l border-slate-200 shadow-2xl z-30 p-6 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Settings2 size={18} className="text-indigo-600" />
                            <h3 className="font-bold text-slate-800">Node Properties</h3>
                        </div>
                        <button
                            onClick={() => setSelectedNodeId(null)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                Display Label
                            </label>
                            <input
                                type="text"
                                value={selectedNode.label}
                                onChange={(e) =>
                                    setNodes((prev) =>
                                        prev.map((n) =>
                                            n.id === selectedNode.id
                                                ? { ...n, label: e.target.value }
                                                : n
                                        )
                                    )
                                }
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                placeholder="Enter step name..."
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setNodes((prev) =>
                                prev.filter((n) => n.id !== selectedNodeId)
                            );
                            setConnections((prev) =>
                                prev.filter((c) => c.source !== selectedNodeId && c.target !== selectedNodeId)
                            );
                            setSelectedNodeId(null);
                        }}
                        className="mt-6 p-4 text-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group"
                    >
                        <Trash2 size={18} className="group-hover:shake" />
                        Delete Step
                    </button>
                </aside>
            )}
        </div>
    );
};