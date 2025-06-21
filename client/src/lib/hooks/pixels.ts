import { useEffect, useState } from "react";
import { useAppContext } from "../context/app";
import type { Pixel } from "../../module_bindings";

export function usePixels() {
  const { conn } = useAppContext();
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    if (!conn) return;

    const onInsert = (_ctx: any, pixel: Pixel) => {
      setPixels((prev) => [...prev, pixel]);
    };
    conn.db.pixel.onInsert(onInsert);

    const onUpdate = (_ctx: any, oldPixel: Pixel, newPixel: Pixel) => {
      setPixels((prev) =>
        prev.map((p) => (p.id === oldPixel.id ? newPixel : p))
      );
    };
    conn.db.pixel.onUpdate(onUpdate);

    const onDelete = (_ctx: any, pixel: Pixel) => {
      setPixels((prev) => prev.filter((p) => p.id !== pixel.id));
    };
    conn.db.pixel.onDelete(onDelete);

    return () => {
      conn.db.pixel.removeOnInsert(onInsert);
      conn.db.pixel.removeOnUpdate(onUpdate);
      conn.db.pixel.removeOnDelete(onDelete);
    };
  }, [conn]);

  return pixels;
}
