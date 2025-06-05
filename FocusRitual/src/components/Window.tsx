import React from 'react';
import { Rnd } from 'react-rnd';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  disableDragResize?: boolean;
  onlyCloseButton?: boolean;
  locked?: boolean;
  onLock?: (id: string) => void;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  x,
  y,
  width,
  height,
  zIndex,
  isMinimized,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
  onFocus,
  onMove,
  onResize,
  disableDragResize = false,
  onlyCloseButton = false,
  locked = false,
  onLock,
}) => {
  // Debug output
  console.log('Window props:', { id, onlyCloseButton, locked, disableDragResize });
  if (isMinimized) return null;

  return (
    // @ts-ignore
    <Rnd
      size={{
        width: isMaximized ? '100vw' : `${width}px`,
        height: isMaximized ? '100vh' : `${height}px`,
      }}
      position={isMaximized ? { x: 0, y: 0 } : { x, y }}
      minWidth={320}
      minHeight={200}
      style={{
        zIndex,
        position: 'absolute',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--window-bg, rgba(30,41,59,0.95))',
        border: '1px solid var(--window-border, #334155)',
      }}
      onDragStart={() => onFocus(id)}
      onDragStop={(_e: any, d: { x: number; y: number }) => onMove(id, d.x, d.y)}
      onResizeStop={(
        _e: MouseEvent | TouchEvent,
        _dir: any,
        ref: HTMLElement,
        _delta: { width: number; height: number },
        position: { x: number; y: number }
      ) => {
        onResize(id, ref.offsetWidth, ref.offsetHeight);
        onMove(id, position.x, position.y);
      }}
      disableDragging={disableDragResize || isMaximized || locked}
      enableResizing={!(disableDragResize || isMaximized || locked) ? {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true
      } : false}
      children={
        <>
          <div className="window-header flex items-center justify-between px-3 py-2 cursor-move select-none" style={{ background: 'var(--window-header-bg, #334155)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--window-header-text, #fff)' }}>
              {title}
            </span>
            <div className="flex gap-2 items-center">
              {onLock && !onlyCloseButton && (
                <button onClick={() => onLock(id)} title={locked ? 'Unlock window' : 'Lock window'} className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
                  {locked ? <LockClosedIcon className="w-4 h-4 text-yellow-400" /> : <LockOpenIcon className="w-4 h-4 text-slate-300" />}
                </button>
              )}
              {!onlyCloseButton && <button onClick={() => onMinimize(id)} title="Minimize" className="w-3 h-3 bg-yellow-400 rounded-full" />}
              {!onlyCloseButton && <button onClick={() => onMaximize(id)} title="Maximize" className="w-3 h-3 bg-green-400 rounded-full" />}
              <button onClick={() => onClose(id)} title="Close" className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
          </div>
          <div className="window-content p-3 overflow-auto h-full flex flex-col flex-1 min-h-0" style={{ background: 'var(--window-bg, #1e293b)', color: 'var(--window-text, #fff)' }}>
            {children}
          </div>
        </>
      }
    />
  );
};

export default Window; 