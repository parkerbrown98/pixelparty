import { useCallback, useRef, useState } from "react";
import { Application, extend } from "@pixi/react";
import {
  Container,
  FederatedPointerEvent,
  FederatedWheelEvent,
  Graphics,
} from "pixi.js";
import { usePixels } from "../../lib/hooks/pixels";
import { useAppContext } from "../../lib/context/app";

extend({
  Container,
  Graphics,
});

export default function Canvas() {
  const pixels = usePixels();
  const { conn } = useAppContext();
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
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
      gfx.rect(0, 0, width, height).fill(0xf9f9f9);

      // Grid
      const gridSize = 1;
      for (let x = 0; x < width; x += gridSize) {
        gfx
          .moveTo(x, 0)
          .lineTo(x, height)
          .stroke({ width: 0.2, color: 0xcccccc });
      }

      for (let y = 0; y < height; y += gridSize) {
        gfx
          .moveTo(0, y)
          .lineTo(width, y)
          .stroke({ width: 0.2, color: 0xcccccc });
      }

      // Pixels
      for (const pixel of pixels) {
        gfx.rect(pixel.x, pixel.y, 1, 1).fill(pixel.color);
      }

      // Mouse position
      if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        gfx
          .rect(mouseX, mouseY, 1, 1)
          .stroke({ width: 0.2, color: 0x050505 })
          .fill(0xff0000);
      }
    },
    [width, height, zoom, mouseX, mouseY, pixels]
  );

  const handlePaint = (x: number, y: number) => {
    if (!conn) return;
    // Convert color to string if needed (e.g. '#RRGGBB')
    conn.reducers.addPixel(
      x,
      y,
      `#${DEFAULT_COLOR.toString(16).padStart(6, "0")}`
    );
  };

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
        (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)
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
      // Paint pixel if mouse was not dragged
      handlePaint(mouseX, mouseY);
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
