import { useRef, useEffect, createContext, useContext, useCallback } from 'react';

const MousePosContext = createContext<{ getMousePos: () => { x: number; y: number } }>({
  getMousePos: () => ({ x: 0, y: 0 }),
});

/**
 * Provides a mutable ref object with the mouse's position.
 */
export function MousePosProvider({ children }: { children: React.ReactNode }) {
  const mousePos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMouseMove = (evt: MouseEvent) => {
      mousePos.current.x = evt.clientX;
      mousePos.current.y = evt.clientY;
    };
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const getMousePos = useCallback(() => {
    return mousePos.current;
  }, []);

  return (
    <MousePosContext.Provider value={{ getMousePos }}>{children}</MousePosContext.Provider>
  );
}

export function useMousePos() {
  const mousePos = useContext(MousePosContext);
  return mousePos;
}
