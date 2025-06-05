import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LockClosedIcon, LockOpenIcon, MinusIcon } from '@heroicons/react/24/solid';

interface FloatingWrapperProps {
  id: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  zIndex?: number;
  locked?: boolean;
  onLock?: (id: string) => void;
  onMinimize?: (id: string) => void;
  onFocus?: (id: string) => void;
  isMinimized?: boolean;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

const FloatingWrapper: React.FC<FloatingWrapperProps> = ({
  id,
  children,
  initialX = 100,
  initialY = 100,
  initialWidth = 400,
  initialHeight = 400,
  zIndex = 10,
  locked = false,
  onLock,
  onMinimize,
  onFocus,
  isMinimized = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<'right' | 'bottom' | 'corner' | 'left' | 'top' | 'corner-left' | 'corner-top' | 'corner-top-left' | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Drag logic
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (locked) return;
    // Only start dragging if the click is on the header
    if (!(e.target as HTMLElement).closest('.window-header')) return;
    e.preventDefault();
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    if (onFocus) onFocus(id);
  }, [locked, position.x, position.y, onFocus, id]);

  const onDrag = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    requestAnimationFrame(() => {
      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;
      // Clamp to viewport
      newX = Math.max(0, Math.min(window.innerWidth - size.width, newX));
      newY = Math.max(0, Math.min(window.innerHeight - size.height, newY));
      setPosition({ x: newX, y: newY });
    });
  }, [dragging, size.width, size.height]);

  const onDragEnd = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
  }, [dragging]);

  // Resize logic
  const onResizeStart = useCallback((dir: 'right' | 'bottom' | 'corner' | 'left' | 'top' | 'corner-left' | 'corner-top' | 'corner-top-left') => (e: React.MouseEvent) => {
    if (locked) return;
    console.log('Resize start:', dir); // Debug log
    setResizing(true);
    setResizeDir(dir);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
    if (onFocus) onFocus(id);
    e.stopPropagation();
  }, [locked, size.width, size.height, onFocus, id]);

  const onResize = useCallback((e: MouseEvent) => {
    if (!resizing || !resizeDir) return;
    console.log('Resizing:', resizeDir); // Debug log
    
    let newWidth = size.width;
    let newHeight = size.height;
    let newX = position.x;
    let newY = position.y;

    const deltaX = e.clientX - resizeStart.current.x;
    const deltaY = e.clientY - resizeStart.current.y;

    // Handle horizontal resizing
    if (resizeDir === 'right' || resizeDir === 'corner') {
      newWidth = Math.max(MIN_WIDTH, resizeStart.current.width + deltaX);
      newWidth = Math.min(newWidth, window.innerWidth - position.x);
    } else if (resizeDir === 'left' || resizeDir === 'corner-left') {
      const possibleWidth = resizeStart.current.width - deltaX;
      if (possibleWidth >= MIN_WIDTH) {
        newWidth = possibleWidth;
        newX = resizeStart.current.x + deltaX;
      }
    }

    // Handle vertical resizing
    if (resizeDir === 'bottom' || resizeDir === 'corner' || resizeDir === 'corner-left') {
      newHeight = Math.max(MIN_HEIGHT, resizeStart.current.height + deltaY);
      newHeight = Math.min(newHeight, window.innerHeight - position.y);
    } else if (resizeDir === 'top' || resizeDir === 'corner-top' || resizeDir === 'corner-top-left') {
      const possibleHeight = resizeStart.current.height - deltaY;
      if (possibleHeight >= MIN_HEIGHT) {
        newHeight = possibleHeight;
        newY = resizeStart.current.y + deltaY;
      }
    }

    // Update position and size
    setPosition({ x: newX, y: newY });
    setSize({ width: newWidth, height: newHeight });
  }, [resizing, resizeDir, position.x, position.y, size.width, size.height]);

  const onResizeEnd = useCallback(() => {
    console.log('Resize end'); // Debug log
    setResizing(false);
    setResizeDir(null);
  }, []);

  // Event listeners for drag/resize
  useEffect(() => {
    if (!dragging && !resizing) return; // Only add listeners when needed

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        onDrag(e);
      }
      if (resizing) {
        onResize(e);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (dragging) {
        onDragEnd(e);
      }
      if (resizing) {
        onResizeEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, onDrag, onResize, onDragEnd, onResizeEnd]);

  if (isMinimized) return null;

  return (
    <div
      ref={wrapperRef}
      className="fixed bg-slate-800/90 rounded-xl shadow-xl border border-slate-700 flex flex-col select-none"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
      }}
    >
      {/* Header for drag/minimize/lock */}
      <div
        className="window-header flex items-center justify-between px-3 py-2 cursor-move bg-slate-900/80 rounded-t-xl"
        onMouseDown={onDragStart}
        style={{ userSelect: 'none' }}
      >
        <div className="flex items-center gap-2 relative z-[60]">
          {onLock && (
            <button
              onClick={e => { e.stopPropagation(); onLock(id); }}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors"
              title={locked ? 'Unlock' : 'Lock'}
            >
              {locked ? <LockClosedIcon className="w-5 h-5 text-yellow-400" /> : <LockOpenIcon className="w-5 h-5 text-slate-300" />}
            </button>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onMinimize && onMinimize(id); }}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors relative z-[60]"
          title="Minimize"
        >
          <MinusIcon className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {children}
      </div>

      {/* Resize handles container */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Edges */}
        <div
          className="absolute top-0 right-0 w-0.5 h-full cursor-e-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('right')}
        />
        <div
          className="absolute top-0 left-0 w-0.5 h-full cursor-w-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('left')}
        />
        <div
          className="absolute top-0 left-0 w-full h-0.5 cursor-n-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('top')}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-0.5 cursor-s-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('bottom')}
        />

        {/* Corners */}
        <div
          className="absolute right-0 bottom-0 w-1 h-1 cursor-se-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('corner')}
        />
        <div
          className="absolute left-0 bottom-0 w-1 h-1 cursor-sw-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('corner-left')}
        />
        <div
          className="absolute right-0 top-0 w-1 h-1 cursor-ne-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('corner-top')}
        />
        <div
          className="absolute left-0 top-0 w-1 h-1 cursor-nw-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20 pointer-events-auto"
          onMouseDown={onResizeStart('corner-top-left')}
        />
      </div>
    </div>
  );
};

export default FloatingWrapper; 