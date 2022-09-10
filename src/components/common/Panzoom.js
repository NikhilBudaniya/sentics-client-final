import { useEffect, useRef } from "react";
import PPanzoom from "@panzoom/panzoom";

export function Panzoom({ children }) {
  const panzoomRef = useRef();

  useEffect(() => {
    const panzoom = PPanzoom(panzoomRef.current, {
      canvas: true,
      cursor: undefined,
    });

    panzoomRef.current.addEventListener("wheel", panzoom.zoomWithWheel);

    return () => panzoom.destroy();
  }, []);

  return (
    <div className="h-100" ref={panzoomRef}>
      {children}
    </div>
  );
}
