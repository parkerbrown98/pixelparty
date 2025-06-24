import { useCallback, useRef, useState } from "react";
import { Application, extend } from "@pixi/react";
import {
    Container,
    FederatedPointerEvent,
    FederatedWheelEvent,
    Graphics,
} from "pixi.js";
import { useCanvas } from "../../lib/context/canvas";
import { useUsers } from "../../lib/context/user";

extend({
    Container,
    Graphics,
});

export default function Canvas() {
    const { ourUser } = useUsers();
    const { pixels, paint, erase, gridEnabled } = useCanvas();
    const [width, _setWidth] = useState(500);
    const [height, _setHeight] = useState(500);
    const [zoom, setZoom] = useState(5);
    const [xOffset, setXOffset] = useState(0);
    const [yOffset, setYOffset] = useState(0);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStarted, setDragStarted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const pixiContainer = useRef<Graphics>(null);

    // Movement threshold in pixels
    const DRAG_THRESHOLD = 5;
    // Default color for painting
    const DEFAULT_COLOR = 0xff00ff;

    const handleDraw = useCallback(
        (gfx: Graphics) => {
            gfx.clear();

            // Background
            gfx.rect(0, 0, width, height).fill(0xffffff);

            // Grid
            if (gridEnabled) {
                const gridSize = 1;
                for (let x = 0; x < width; x += gridSize) {
                    gfx.moveTo(x, 0)
                        .lineTo(x, height)
                        .stroke({ width: 0.2, color: 0xcccccc, alpha: 0.5 });
                }

                for (let y = 0; y < height; y += gridSize) {
                    gfx.moveTo(0, y)
                        .lineTo(width, y)
                        .stroke({ width: 0.2, color: 0xcccccc, alpha: 0.5 });
                }
            }

            // Pixels
            for (const [key, pixel] of pixels.entries()) {
                if (!pixel.color) continue; // Skip empty pixels

                const [x, y] = key.split(",").map(Number);
                gfx.rect(x, y, 1, 1).fill(pixel.color);
            }

            // Mouse position
            if (
                mouseX >= 0 &&
                mouseX < width &&
                mouseY >= 0 &&
                mouseY < height
            ) {
                if (ourUser?.currentTool.tag === "Brush") {
                    gfx.rect(mouseX, mouseY, 1, 1)
                        .stroke({ width: 0.2, color: 0x050505 })
                        .fill(ourUser?.currentColor || DEFAULT_COLOR);
                } else if (ourUser?.currentTool.tag === "Eraser") {
                    // Draw box with red border for eraser
                    gfx.rect(mouseX, mouseY, 1, 1)
                        .stroke({ width: 0.2, color: 0xff0000 })
                        .fill(0xffffff);
                }
            }
        },
        [
            width,
            height,
            zoom,
            mouseX,
            mouseY,
            pixels,
            gridEnabled,
            ourUser?.currentTool,
            ourUser?.currentColor,
        ]
    );

    const handleMouseDown = (event: FederatedPointerEvent) => {
        setStartX(event.x);
        setStartY(event.y);
        setIsDragging(true);
        setDragStarted(false);
    };

    const handleMouseMove = (event: FederatedPointerEvent) => {
        if (isDragging) {
            const currentX = event.x;
            const currentY = event.y;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            if (
                !dragStarted &&
                (Math.abs(deltaX) > DRAG_THRESHOLD ||
                    Math.abs(deltaY) > DRAG_THRESHOLD)
            ) {
                setDragStarted(true);
            }
            if (dragStarted) {
                setXOffset((prev) => prev + deltaX / zoom);
                setYOffset((prev) => prev + deltaY / zoom);
                setStartX(currentX);
                setStartY(currentY);
            }
        }
        const local = event.getLocalPosition(pixiContainer.current!);
        setMouseX(Math.floor(local.x));
        setMouseY(Math.floor(local.y));
    };

    const handleMouseUp = () => {
        if (isDragging && !dragStarted) {
            if (ourUser?.currentTool.tag === "Brush") {
                // Paint pixel if mouse was not dragged
                paint(mouseX, mouseY);
            } else if (ourUser?.currentTool.tag === "Eraser") {
                // Erase pixel if mouse was not dragged
                erase(mouseX, mouseY);
            }
        }
        setIsDragging(false);
        setDragStarted(false);
        setStartX(0);
        setStartY(0);
    };

    const handleWheel = (event: FederatedWheelEvent) => {
        event.stopPropagation();
        event.preventDefault();

        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(1, zoom + delta);
        setZoom(newZoom);
    };

    return (
        <div ref={containerRef} className="w-full h-full absolute top-0 left-0">
            <Application
                resizeTo={containerRef}
                antialias={false}
                background={0xf6f6f6}
            >
                <pixiContainer
                    width={width}
                    height={height}
                    eventMode="dynamic"
                    onPointerDown={handleMouseDown}
                    onPointerMove={handleMouseMove}
                    onPointerUp={handleMouseUp}
                    onPointerUpOutside={handleMouseUp}
                    onWheel={handleWheel}
                    anchor={{ x: 0.5, y: 0.5 }}
                    scale={{ x: zoom, y: zoom }}
                >
                    <pixiGraphics
                        ref={pixiContainer}
                        x={xOffset}
                        y={yOffset}
                        scale={zoom}
                        draw={handleDraw}
                    />
                </pixiContainer>
            </Application>
        </div>
    );
}
