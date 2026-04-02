import * as PIXI from "pixi.js";
import { useEffect, useRef, useState } from "react";
type Pos = { x: number; y: number };
const usePixitoDOMBridge = () => {
  const PixiMap = useRef<Record<string, Pos>>({});
  const [domMap, setDomMap] = useState<Record<string, Pos>>({});

  const write = (id: string, container: PIXI.Container, yOffset: number) => {
    const p = container.toGlobal(new PIXI.Point());

    const x = p.x;
    const y = p.y - yOffset;

    let prev = PixiMap.current;
    if (!prev || prev[id].x !== x || prev[id].y !== y) {
      PixiMap.current[id] = { x, y };
    }
  };

  useEffect(() => {
    let raf: number;

    const loop = () => {
      setDomMap({ ...PixiMap.current });
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return { write, domMap };
};

export default usePixitoDOMBridge;
