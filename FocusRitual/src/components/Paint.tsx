import React, { useRef, useState, useEffect } from 'react';

type ResizeDirection = 'right' | 'left' | 'bottom' | 'top' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
interface ResizeStart {
    x: number;
    y: number;
    width: number;
    height: number;
    direction?: ResizeDirection;
}

interface PaintProps {
    width: number;
    height: number;
}

const Paint: React.FC<PaintProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [isEraser, setIsEraser] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - width / 2, y: window.innerHeight / 2 - height / 2 });
    const [size, setSize] = useState({ width, height });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [originalSize, setOriginalSize] = useState({ width, height });
    const [originalPosition, setOriginalPosition] = useState({ x: window.innerWidth / 2 - width / 2, y: window.innerHeight / 2 - height / 2 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = size.width;
        canvas.height = size.height;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size.width, size.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [size.width, size.height]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = isEraser ? 'white' : color;
        ctx.lineWidth = brushSize;
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || isDragging) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size.width, size.height);
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const toggleEraser = () => {
        setIsEraser(!isEraser);
    };

    const navBarRef = useRef<HTMLDivElement>(null);
    const [isNavDragging, setIsNavDragging] = useState(false);
    const [navDragStart, setNavDragStart] = useState({ x: 0, y: 0 });

    const handleNavMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsNavDragging(true);
        setNavDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleNavMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isNavDragging) {
            const newX = e.clientX - navDragStart.x;
            const newY = e.clientY - navDragStart.y;
            setPosition({
                x: Math.max(0, Math.min(window.innerWidth - size.width, newX)),
                y: Math.max(0, Math.min(window.innerHeight - size.height, newY))
            });
        }
    };

    const handleNavMouseUp = () => setIsNavDragging(false);

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsNavDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const handleExpand = () => {
        if (!isExpanded) {
            setOriginalSize(size);
            setOriginalPosition(position);
            setSize({
                width: Math.min(window.innerWidth - 64, size.width * 1.5),
                height: Math.min(window.innerHeight - 200, size.height * 1.5)
            });
            // Center the expanded window
            setPosition({
                x: window.innerWidth / 2 - (size.width * 1.5) / 2,
                y: window.innerHeight / 2 - (size.height * 1.5) / 2
            });
        } else {
            setSize(originalSize);
            setPosition(originalPosition);
        }
        setIsExpanded(!isExpanded);
    };

    const handleMaximize = () => {
        if (!isMaximized) {
            setOriginalSize(size);
            setOriginalPosition(position);
            setSize({
                width: window.innerWidth - 32, // Leave some padding
                height: window.innerHeight - 200 // Leave space for controls
            });
            setPosition({ x: 16, y: 16 });
        } else {
            setSize(originalSize);
            setPosition(originalPosition);
        }
        setIsMaximized(!isMaximized);
    };

    // Calculate total height: nav bar (32px) + controls row (min 64px) + canvas (size.height) + padding (16px top + 16px bottom)
    const controlsHeight = 64; // px, adjust as needed
    const navBarHeight = 32; // px
    const verticalPadding = 32; // px (16px top + 16px bottom)
    const totalHeight = navBarHeight + controlsHeight + size.height + verticalPadding;

    return (
        <div
            ref={containerRef}
            className="fixed bg-white/40 dark:bg-slate-800/40 rounded-lg shadow-lg z-[999999] overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: totalHeight,
                minWidth: 320,
                minHeight: 400,
            }}
        >
            {/* Draggable Nav Bar */}
            <div
                ref={navBarRef}
                className="h-8 bg-slate-600 rounded-t-lg cursor-move flex items-center px-4 select-none"
                onMouseDown={handleNavMouseDown}
                onMouseMove={handleNavMouseMove}
                onMouseUp={handleNavMouseUp}
                onMouseLeave={handleNavMouseUp}
            >
                <div className="text-white text-sm font-medium flex-grow">Paint</div>
                <button
                    onClick={handleMaximize}
                    className="ml-2 px-2 py-1 text-xs font-medium text-white bg-slate-500 rounded-md hover:bg-slate-700"
                >
                    {isMaximized ? 'Minimize' : 'Maximize'}
                </button>
                <button
                    onClick={handleExpand}
                    className="ml-2 px-2 py-1 text-xs font-medium text-white bg-slate-500 rounded-md hover:bg-slate-700"
                >
                    {isExpanded ? 'Shrink' : 'Expand'}
                </button>
            </div>
            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60" style={{ minHeight: controlsHeight }}>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                    disabled={isEraser}
                />
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24"
                />
                <button
                    onClick={toggleEraser}
                    className={`px-3 py-1 text-xs font-medium text-white rounded-md ${isEraser ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                >
                    {isEraser ? 'Drawing Mode' : 'Eraser'}
                </button>
                <button
                    onClick={clearCanvas}
                    className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                    Clear
                </button>
                <button
                    onClick={saveDrawing}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Save
                </button>
            </div>
            {/* Canvas Area */}
            <div className="p-2">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="border border-gray-300 rounded-lg cursor-crosshair bg-white"
                    style={{
                        width: size.width - 16, // Account for padding
                        height: size.height - 16 // Account for padding
                    }}
                />
            </div>
        </div>
    );
};

export default Paint; 