import React, { useState, useEffect } from 'react';
import Window from './Window';
import TodoList from '../../FocusRitual/src/components/TodoList';
import EventCalendar from '../../FocusRitual/src/components/EventCalendar';
import ChatAssistant from '../../FocusRitual/src/components/ChatAssistant';
import QuoteGenerator from '../../FocusRitual/src/components/QuoteGenerator';
import Timer from '../../FocusRitual/src/components/Timer';

interface WindowConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  persistent: boolean;
}

const Desktop: React.FC = () => {
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [zCounter, setZCounter] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize components with error handling
    try {
      const initialWindows: WindowConfig[] = [
        {
          id: 'todo',
          title: 'Todo List',
          component: TodoList,
          x: 100,
          y: 100,
          width: 400,
          height: 400,
          zIndex: 1,
          isMinimized: false,
          isMaximized: false,
          persistent: false,
        },
        {
          id: 'calendar',
          title: 'Calendar',
          component: EventCalendar,
          x: 200,
          y: 120,
          width: 500,
          height: 500,
          zIndex: 2,
          isMinimized: false,
          isMaximized: false,
          persistent: false,
        },
        {
          id: 'chat',
          title: 'Chat Assistant',
          component: ChatAssistant,
          x: 350,
          y: 180,
          width: 400,
          height: 500,
          zIndex: 3,
          isMinimized: false,
          isMaximized: false,
          persistent: false,
        },
      ];

      setWindows(initialWindows);
      setZCounter(initialWindows.length + 1);
    } catch (error) {
      console.error('Error initializing components:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bringToFront = (id: string) => {
    setWindows(ws => {
      const maxZ = Math.max(...ws.map(w => w.zIndex));
      return ws.map(w =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      );
    });
    setZCounter(z => z + 1);
  };

  const handleMove = (id: string, x: number, y: number) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const handleResize = (id: string, width: number, height: number) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, width, height } : w));
  };

  const handleMinimize = (id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const handleMaximize = (id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const handleClose = (id: string) => {
    setWindows(ws => ws.filter(w => w.id !== id));
  };

  const handleRestore = (id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, isMinimized: false } : w));
    bringToFront(id);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Persistent Timer */}
      <div className="fixed top-4 left-4 z-[10000]">
        <Timer duration={1500} />
      </div>

      {/* Persistent Quotes */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000]">
        <QuoteGenerator />
      </div>

      {/* Windows */}
      {windows.filter(w => w.id === 'todo').map(w => (
        <Window
          key={w.id}
          id={w.id}
          title={w.title}
          x={w.x}
          y={w.y}
          width={w.width}
          height={w.height}
          zIndex={w.zIndex}
          isMinimized={w.isMinimized}
          isMaximized={w.isMaximized}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onClose={handleClose}
          onFocus={bringToFront}
          onMove={handleMove}
          onResize={handleResize}
        >
          {React.createElement(w.component, { compact: true })}
        </Window>
      ))}

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-slate-900/80 flex items-center px-4 z-[10001] gap-2">
        {windows.filter(w => w.isMinimized).map(w => (
          <button
            key={w.id}
            onClick={() => handleRestore(w.id)}
            className="px-3 py-1 rounded bg-slate-700 text-white shadow hover:bg-slate-600 transition-all"
          >
            {w.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Desktop;