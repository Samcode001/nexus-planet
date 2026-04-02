import nipplejs from "nipplejs";
import { useCallback, useEffect, useRef } from "react";
import type { Direction } from "../types/common";

const useJoyStick = (
  enable: boolean,
  onMove: (direction: Direction) => void
) => {
  const managerRef = useRef<any>(null);
  const directionRef = useRef<any>(null);
  // const [direction, setDirection] = useState<Direction>(undefined);

  function joyStickDirection(x: number, y: number): Direction | null {
    const DEAD_ZONE = 0.2;
    const X = Math.abs(x);
    const Y = Math.abs(y);
    if (X < DEAD_ZONE && Y < DEAD_ZONE) {
      return undefined;
    }

    if (X > Y) {
      return x > 0 ? "RIGHT" : "LEFT";
    } else {
      return y > 0 ? "UP" : "DOWN";
    }
  }

  useEffect(() => {
    if (!enable) return;
    const zone = document.getElementById("joystick-zone")!;
    if (managerRef.current) return;
    if (!zone) return;

    managerRef.current = nipplejs.create({
      zone,
      mode: "static",
      position: { right: "160px", bottom: "100px" },
      color: "white",
      size: 120,
      threshold: 0.5,
    });

    managerRef.current.on("move", (_: any, data: any) => {
      let x = data.vector.x;
      let y = data.vector.y;
      const direction = joyStickDirection(x, y);
      if (!direction) return;
      directionRef.current = direction;
      onMove(direction);
    });

    managerRef.current.on("end", () => {
      directionRef.current = undefined;
      onMove(undefined);
      console.log("no move");
    });

    return () => {
      managerRef.current.destroy();
      managerRef.current = null;
    };
  }, [onMove]);

  useEffect(() => {
    if (!enable) return;
    // const zone = document.getElementById("joystick-zone")!;
    // if (managerRef.current) return;
    // if (!zone) return;
    const stop = () => {
      directionRef.current = undefined;
      onMove(undefined);
    };

    window.addEventListener("touchend", stop);
    window.addEventListener("mouseup", stop);
    window.addEventListener("blur", stop);

    return () => {
      window.removeEventListener("touchend", stop);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("blur", stop);
    };
  }, [onMove]);

  const getJoystickDirection = useCallback(
    (): { currentJoyKey: Direction } => ({
      currentJoyKey: directionRef.current,
    }),
    []
  );

  return { getJoystickDirection };
};

export default useJoyStick;
