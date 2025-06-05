import React, { useState } from 'react';
import Window from './Window';
import EnhancedTodoList from './EnhancedTodoList';
import EventCalendar from './EventCalendar';
import ChatAssistant from './ChatAssistant';
import QuoteGenerator from './QuoteGenerator';
import Timer from './Timer';
import Analytics from './Analytics';
import YouTubePlayer from './YouTubePlayer';
import SpotifyPlayer from './SpotifyPlayer';
import { ThemeSelector } from './ThemeSelector';
import Soundscape from './Soundscape';
import { BackgroundManager } from './BackgroundManager';
import FocusModePage from '../pages/FocusModePage';
import { useTheme } from '../context/ThemeContext';
import FloatingWrapper from './FloatingWrapper';

const WINDOW_DEFS = [
  { id: 'tasks', title: 'Task List', width: 480, height: 520, render: () => <EnhancedTodoList /> },
  { id: 'calendar', title: 'Calendar', width: 500, height: 500, render: () => <EventCalendar /> },
  { id: 'chat', title: 'Chat Assistant', width: 400, height: 500, render: () => <ChatAssistant /> },
  { id: 'analytics', title: 'Analytics', width: 700, height: 600, render: () => <Analytics /> },
  {
    id: 'focus',
    title: 'Focus Mode',
    width: 800,
    height: 700,
    render: (props: { onClose: () => void; timerState?: any; setTimerState?: (state: any) => void; children?: React.ReactNode; }) => (
      <FocusModePage
        onExitFocusMode={props.onClose}
        duration={1500}
        onStateChange={props.setTimerState || (() => { })}
      >
        {props.children}
      </FocusModePage>
    ),
  },
  {
    id: 'youtube',
    title: 'YouTube Player',
    width: 480,
    height: 340,
    render: (props: { onClose: () => void }) => (
      <YouTubePlayer onClose={props.onClose} isFocusMode={false} />
    ),
  },
  {
    id: 'spotify',
    title: 'Spotify Player',
    width: 480,
    height: 340,
    render: (props: { onClose: () => void }) => (
      <SpotifyPlayer onClose={props.onClose} isFocusMode={false} />
    ),
  },
  { id: 'themes', title: 'Theme Selector', width: 400, height: 400, render: () => <ThemeSelector /> },
  { id: 'sounds', title: 'Ambient Sounds', width: 400, height: 300, render: () => <Soundscape /> },
];

const initialWindows = [
  { ...WINDOW_DEFS[0], x: 100, y: 100, zIndex: 1, isMinimized: false, isMaximized: false, locked: false },
  { ...WINDOW_DEFS[1], x: 200, y: 120, zIndex: 2, isMinimized: false, isMaximized: false, locked: false },
  { ...WINDOW_DEFS[2], x: 350, y: 180, zIndex: 3, isMinimized: false, isMaximized: false, locked: false },
  { ...WINDOW_DEFS[4], x: 500, y: 200, zIndex: 4, isMinimized: false, isMaximized: true, isFullscreen: true, locked: false },
];

const Desktop: React.FC = () => {
  const [windows, setWindows] = useState(initialWindows);
  const [zCounter, setZCounter] = useState(windows.length + 1);
  const [timerState, setTimerState] = useState<any>({});
  const [timerDuration, setTimerDuration] = useState(1500); // default 25m
  const { currentTheme } = useTheme();

  // Open/minimize/restore a window by id
  const openOrToggleWindow = (id: string) => {
    if (isFocusModeActive && id !== 'focus') return; // Prevent opening other windows in focus mode
    const win = windows.find(w => w.id === id);
    if (win) {
      if (win.isMinimized) {
        handleRestore(id);
      } else {
        handleMinimize(id);
      }
      bringToFront(id);
      return;
    }
    const def = WINDOW_DEFS.find(w => w.id === id);
    if (def) {
      // If opening focus mode, force maximized/fullscreen and disable drag/resize
      if (id === 'focus') {
        setWindows(ws => [
          ...ws,
          { ...def, x: 0, y: 0, zIndex: zCounter, isMinimized: false, isMaximized: true, isFullscreen: true, locked: false }
        ]);
      } else {
        setWindows(ws => [
          ...ws,
          { ...def, x: 120 + ws.length * 30, y: 120 + ws.length * 30, zIndex: zCounter, isMinimized: false, isMaximized: false, locked: false }
        ]);
      }
      setZCounter(z => z + 1);
    }
  };

  const bringToFront = (id: string) => {
    setWindows(ws => {
      const maxZ = Math.max(...ws.map(w => w.zIndex));
      return ws.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
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

  // Check if Focus Mode is open and not minimized
  const isFocusModeActive = windows.some(w => w.id === 'focus' && !w.isMinimized);

  // Lock/unlock window
  const handleLock = (id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, locked: !w.locked } : w));
  };

  // Persistent Timer (top left) and Quotes (top center)
  return (
    <div className="w-full h-full fixed inset-0 bg-main transition-colors overflow-hidden">
      {/* Background Video/Image Manager */}
      <BackgroundManager isFocusMode={true} isPlaying={true} isBreak={false} isReset={false} morePrevalent={isFocusModeActive} />
      {/* Persistent Timer */}
      {!isFocusModeActive && (
        <div className="fixed top-4 left-4 z-[10000] flex flex-col gap-2">
          <div className="flex gap-2 mb-1">
            {[{ label: '25m', value: 1500 }, { label: '50m', value: 3000 }, { label: '90m', value: 5400 }].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTimerDuration(opt.value)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${timerDuration === opt.value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Timer duration={timerDuration} onStateChange={setTimerState} {...timerState} />
        </div>
      )}
      {/* Persistent Quotes */}
      {!isFocusModeActive && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000]">
          <QuoteGenerator />
        </div>
      )}
      {/* Windows */}
      {windows.filter(w => !w.isMinimized).map(w => (
        w.id === 'focus' ? (
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
            disableDragResize={w.id === 'focus' || w.locked}
            onlyCloseButton={w.id === 'focus' ? true : undefined}
            locked={w.locked}
            onLock={handleLock}
          >
            {w.render({ onClose: () => handleClose(w.id), timerState, setTimerState, children: <div className="flex justify-center mt-2"><QuoteGenerator /></div> })}
          </Window>
        ) : (
          <FloatingWrapper
            key={w.id}
            id={w.id}
            initialX={w.x}
            initialY={w.y}
            initialWidth={w.width}
            initialHeight={w.height}
            zIndex={w.zIndex}
            locked={w.locked}
            onLock={handleLock}
            onMinimize={handleMinimize}
            onFocus={bringToFront}
            isMinimized={w.isMinimized}
          >
            {w.render({ onClose: () => handleClose(w.id) })}
          </FloatingWrapper>
        )
      ))}
      {/* Taskbar/Launcher */}
      <div
        className="fixed bottom-0 left-0 right-0 h-14 flex items-center px-4 z-[10001] gap-2 shadow-lg"
        style={{ background: 'var(--taskbar-bg, #1e293b)', color: 'var(--taskbar-text, #fff)' }}
      >
        {WINDOW_DEFS.map(def => {
          const isOpen = windows.some(w => w.id === def.id && !w.isMinimized);
          return (
            <button
              key={def.id}
              onClick={() => openOrToggleWindow(def.id)}
              className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center
                ${isOpen
                  ? 'shadow-lg scale-105 ring-2 ring-blue-400'
                  : 'shadow hover:scale-105 hover:ring-2 hover:ring-blue-300'}
                `}
              style={{
                background: isOpen
                  ? 'var(--window-header-bg, #334155)'
                  : 'var(--taskbar-bg, #1e293b)',
                color: isOpen
                  ? 'var(--window-header-text, #fff)'
                  : 'var(--taskbar-text, #fff)',
                border: isOpen ? '1.5px solid var(--window-border, #334155)' : '1.5px solid transparent',
                boxShadow: isOpen ? '0 2px 12px 0 rgba(0,0,0,0.18)' : '0 1px 4px 0 rgba(0,0,0,0.10)',
                opacity: isFocusModeActive && def.id !== 'focus' ? 0.5 : 1,
                pointerEvents: isFocusModeActive && def.id !== 'focus' ? 'none' : 'auto',
              }}
            >
              {def.title}
              {isOpen && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400 shadow" />
              )}
            </button>
          );
        })}
        {/* Remove minimized window pills */}
        <div className="flex-1" />
      </div>
    </div>
  );
};

export default Desktop; 