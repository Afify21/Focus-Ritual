import React, { useRef, useState, useEffect } from 'react';

interface PaintProps {
    onSave?: (dataUrl: string) => void;
}

const Paint: React.FC<PaintProps> = ({ onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [isEraser, setIsEraser] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 800;
        canvas.height = 600;
        canvas.style.width = '800px';
        canvas.style.height = '600px';

        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;

        // Set white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    useEffect(() => {
        if (!contextRef.current) return;
        contextRef.current.strokeStyle = isEraser ? '#FFFFFF' : color;
        contextRef.current.lineWidth = brushSize;
    }, [color, brushSize, isEraser]);

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || !contextRef.current) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !contextRef.current || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (!contextRef.current) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const toggleEraser = () => {
        setIsEraser(!isEraser);
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        if (onSave) {
            onSave(dataUrl);
        } else {
            const link = document.createElement('a');
            link.download = 'drawing.png';
            link.href = dataUrl;
            link.click();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Controls Row */}
            <div className="flex items-center gap-4 p-3 bg-slate-700/50">
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
            <div className="flex-1 overflow-hidden bg-white rounded-lg">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
};

export default Paint; 