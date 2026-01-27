"use client";

import React, { memo, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { useXarrow } from "react-xarrows";
import { Music, PhoneForwarded, Hash, PhoneOff, Settings2, Plus } from "lucide-react";
import { NodeType, IVRNode } from "../types";

export const SidebarItem = memo(({ type, label, icon: Icon }: { type: NodeType; label: string; icon: any }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: "NEW_NODE",
            item: { type, label },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }),
        []
    );

    if (!ready) {
        return (
            <div className="flex items-center gap-3 p-4 mb-3 bg-slate-50 border border-slate-100 rounded-xl opacity-50">
                <div className="p-2 bg-slate-100 text-slate-400 rounded-lg">
                    <Icon size={18} />
                </div>
                <span className="text-sm font-semibold text-slate-400">{label}</span>
            </div>
        );
    }

    return (
        <div
            ref={drag as any}
            className={`flex items-center gap-3 p-4 mb-3 bg-white border border-slate-200 rounded-xl cursor-grab hover:border-indigo-500 hover:shadow-lg transition-all duration-200 ${isDragging ? "opacity-40 scale-95" : "opacity-100"
                }`}
        >
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Icon size={18} />
            </div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
    );
});

SidebarItem.displayName = "SidebarItem";

export const CanvasNode = memo(
    ({
        node,
        isSelected,
        onSelect,
        onConnect,
        zoom,
    }: {
        node: IVRNode;
        isSelected: boolean;
        onSelect: (id: string) => void;
        onConnect: (sourceId: string) => void;
        zoom: number;
    }) => {
        const [ready, setReady] = useState(false);
        const updateXarrow = useXarrow();

        useEffect(() => {
            setReady(true);
        }, []);

        const [{ isDragging }, drag] = useDrag(
            () => ({
                type: "MOVE_NODE",
                item: { id: node.id },
                collect: (monitor) => ({
                    isDragging: !!monitor.isDragging(),
                }),
            }),
            [node.id]
        );

        useEffect(() => {
            if (!ready) return;
            const id = requestAnimationFrame(() => {
                updateXarrow();
            });
            return () => cancelAnimationFrame(id);
        }, [node.x, node.y, isDragging, ready, zoom, updateXarrow]);

        const getIcon = () => {
            switch (node.type) {
                case "playback": return <Music size={14} />;
                case "bridge": return <PhoneForwarded size={14} />;
                case "menu": return <Hash size={14} />;
                case "hangup": return <PhoneOff size={14} />;
                default: return <Settings2 size={14} />;
            }
        };

        if (!ready) return null;

        return (
            <div
                id={node.id}
                ref={drag as any}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.id);
                }}
                style={{
                    left: node.x,
                    top: node.y,
                    position: "absolute",
                    transform: "translate3d(0,0,0)",
                }}
                className={`w-64 bg-white border-2 rounded-2xl shadow-xl z-10 transition-all ${isSelected ? "border-indigo-500 ring-4 ring-indigo-50" : "border-slate-200 shadow-slate-200/50"
                    } ${isDragging ? "opacity-50 cursor-grabbing" : "opacity-100 cursor-grab"}`}
            >
                <div className="flex items-center justify-between p-3 border-b bg-slate-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white text-indigo-600 rounded-md shadow-sm border border-slate-100">
                            {getIcon()}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {node.type}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConnect(node.id);
                        }}
                        className="p-1.5 bg-indigo-600 text-white rounded-full hover:scale-110 active:scale-95 transition-transform shadow-md shadow-indigo-200"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <div className="p-4">
                    <p className="text-sm font-bold text-slate-800 truncate">{node.label}</p>
                </div>
            </div>
        );
    }
);

CanvasNode.displayName = "CanvasNode";