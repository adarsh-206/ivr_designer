"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DesignerCanvas } from "./components/DesignerCanvas";

export default function IVRDesigner() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <DndProvider backend={HTML5Backend}>
            <DesignerCanvas />
        </DndProvider>
    );
}