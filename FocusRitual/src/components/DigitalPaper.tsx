import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Stage, Layer, Line, Text, Image, Group } from 'react-konva';
import Konva from 'konva';
import { useHotkeys } from 'react-hotkeys-hook';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DigitalPaperProps {
    pdfUrl: string;
    onSave?: (data: { drawings: Drawing[]; annotations: string[]; highlights: Highlight[]; shapes: Shape[] }) => void;
    isCollaborative?: boolean;
    sessionId?: string;
}

interface Drawing {
    points: number[];
    color: string;
    strokeWidth: number;
    type: 'pen' | 'highlighter' | 'eraser' | 'text' | 'highlight';
    userId?: string;
    timestamp: number;
}

interface Highlight {
    id: string;
    text: string;
    page: number;
    rect: { x: number; y: number; width: number; height: number };
    color: string;
    userId?: string;
    timestamp: number;
}

interface Shape {
    id: string;
    type: 'rectangle' | 'circle' | 'arrow' | 'text';
    points: number[];
    color: string;
    strokeWidth: number;
    text?: string;
    userId?: string;
    timestamp: number;
}

interface AIInsight {
    type: 'summary' | 'key-point' | 'question' | 'connection';
    content: string;
    page: number;
    confidence: number;
}

type DrawingTool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'highlight' | 'shape';

const COLORS = {
    black: '#000000',
    red: '#FF0000',
    blue: '#0000FF',
    green: '#00FF00',
    yellow: '#FFFF00',
    purple: '#800080',
    orange: '#FFA500',
    pink: '#FFC0CB',
};

const STROKE_WIDTHS = [1, 2, 4, 8, 12, 16];

const SHAPES = ['rectangle', 'circle', 'arrow', 'text'] as const;

const DigitalPaper: React.FC<DigitalPaperProps> = ({ pdfUrl, onSave, isCollaborative, sessionId }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
    const [currentShape, setCurrentShape] = useState<Shape | null>(null);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [selectedColor, setSelectedColor] = useState(COLORS.black);
    const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(2);
    const [selectedTool, setSelectedTool] = useState<DrawingTool>('pen');
    const [selectedShape, setSelectedShape] = useState<typeof SHAPES[number]>('rectangle');
    const [annotations, setAnnotations] = useState<string[]>([]);
    const [zoom, setZoom] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const stageRef = useRef<Konva.Stage>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Keyboard shortcuts
    useHotkeys('ctrl+z', () => handleUndo());
    useHotkeys('ctrl+y', () => handleRedo());
    useHotkeys('ctrl+s', () => handleSave());
    useHotkeys('ctrl+f', () => handleSearch());
    useHotkeys('ctrl+h', () => setSelectedTool('highlighter'));
    useHotkeys('ctrl+p', () => setSelectedTool('pen'));
    useHotkeys('ctrl+e', () => setSelectedTool('eraser'));

    // WebSocket connection for collaborative editing
    useEffect(() => {
        if (isCollaborative && sessionId) {
            wsRef.current = new WebSocket(`ws://your-server/ws/${sessionId}`);
            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleCollaborativeUpdate(data);
            };
            return () => wsRef.current?.close();
        }
    }, [isCollaborative, sessionId]);

    // Auto-save and AI insights generation
    useEffect(() => {
        const saveInterval = setInterval(() => {
            if (onSave) {
                onSave({ drawings, annotations, highlights, shapes });
            }
        }, 30000);

        const insightsInterval = setInterval(() => {
            generateAIInsights();
        }, 60000);

        return () => {
            clearInterval(saveInterval);
            clearInterval(insightsInterval);
        };
    }, [drawings, annotations, highlights, shapes, onSave]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        generateAIInsights();
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        setIsDrawing(true);
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        if (selectedTool === 'shape') {
            setCurrentShape({
                id: Date.now().toString(),
                type: selectedShape,
                points: [pos.x, pos.y],
                color: selectedColor,
                strokeWidth: selectedStrokeWidth,
                timestamp: Date.now(),
            });
        } else {
            setCurrentDrawing({
                points: [pos.x, pos.y],
                color: selectedTool === 'eraser' ? '#FFFFFF' : selectedColor,
                strokeWidth: selectedTool === 'highlighter' ? 20 : selectedStrokeWidth,
                type: selectedTool,
                timestamp: Date.now(),
            });
        }
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        if (selectedTool === 'shape' && currentShape) {
            setCurrentShape({
                ...currentShape,
                points: [...currentShape.points.slice(0, 2), pos.x, pos.y],
            });
        } else if (currentDrawing) {
            setCurrentDrawing({
                ...currentDrawing,
                points: [...currentDrawing.points, pos.x, pos.y],
            });
        }
    };

    const handleMouseUp = () => {
        if (currentDrawing) {
            const newDrawing = { ...currentDrawing };
            setDrawings([...drawings, newDrawing]);
            if (isCollaborative) {
                wsRef.current?.send(JSON.stringify({
                    type: 'drawing',
                    data: newDrawing,
                }));
            }
        }
        if (currentShape) {
            const newShape = { ...currentShape };
            setShapes([...shapes, newShape]);
            if (isCollaborative) {
                wsRef.current?.send(JSON.stringify({
                    type: 'shape',
                    data: newShape,
                }));
            }
        }
        setIsDrawing(false);
        setCurrentDrawing(null);
        setCurrentShape(null);
    };

    const handleTextAdd = (text: string, x: number, y: number) => {
        const newShape: Shape = {
            id: Date.now().toString(),
            type: 'text',
            points: [x, y],
            color: selectedColor,
            strokeWidth: selectedStrokeWidth,
            text,
            timestamp: Date.now(),
        };
        setShapes([...shapes, newShape]);
    };

    const handleHighlight = (rect: { x: number; y: number; width: number; height: number }) => {
        const newHighlight: Highlight = {
            id: Date.now().toString(),
            text: '', // Will be populated by OCR
            page: pageNumber,
            rect,
            color: selectedColor,
            timestamp: Date.now(),
        };
        setHighlights([...highlights, newHighlight]);
        // Perform OCR on the highlighted area
        performOCR(rect);
    };

    const performOCR = async (rect: { x: number; y: number; width: number; height: number }) => {
        try {
            const response = await fetch('/api/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rect, page: pageNumber }),
            });
            const { text } = await response.json();
            // Update highlight with OCR text
            setHighlights(prev => prev.map(h =>
                h.id === Date.now().toString() ? { ...h, text } : h
            ));
        } catch (error) {
            console.error('Error performing OCR:', error);
        }
    };

    const generateAIInsights = async () => {
        if (isGeneratingInsights) return;
        setIsGeneratingInsights(true);
        try {
            const response = await fetch('/api/ai/generate-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: pageNumber,
                    annotations: annotations[pageNumber - 1] || '',
                    highlights: highlights.filter(h => h.page === pageNumber),
                }),
            });
            const data = await response.json();
            setAiInsights(data.insights);
        } catch (error) {
            console.error('Error generating insights:', error);
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    const handleAiQuestion = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: aiQuestion,
                    context: {
                        pageNumber,
                        annotations: annotations[pageNumber - 1] || '',
                        highlights: highlights.filter(h => h.page === pageNumber),
                        drawings: drawings.filter(d => d.timestamp > Date.now() - 300000), // Last 5 minutes
                    },
                }),
            });
            const data = await response.json();
            setAiResponse(data.response);
        } catch (error) {
            console.error('Error asking AI:', error);
            setAiResponse('Sorry, there was an error processing your question.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUndo = () => {
        setDrawings(prev => prev.slice(0, -1));
        setShapes(prev => prev.slice(0, -1));
        setHighlights(prev => prev.slice(0, -1));
    };

    const handleRedo = () => {
        // Implement redo functionality
    };

    const handleSave = () => {
        if (onSave) {
            onSave({ drawings, annotations, highlights, shapes });
        }
    };

    const handleSearch = () => {
        // Implement search functionality
    };

    const handleCollaborativeUpdate = (data: any) => {
        switch (data.type) {
            case 'drawing':
                setDrawings(prev => [...prev, data.data]);
                break;
            case 'shape':
                setShapes(prev => [...prev, data.data]);
                break;
            case 'highlight':
                setHighlights(prev => [...prev, data.data]);
                break;
            case 'annotation':
                setAnnotations(prev => {
                    const newAnnotations = [...prev];
                    newAnnotations[data.data.page - 1] = data.data.text;
                    return newAnnotations;
                });
                break;
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 flex">
                <div className="w-2/3 relative">
                    <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow">
                        <div className="flex space-x-2 mb-2">
                            {Object.entries(COLORS).map(([name, color]) => (
                                <button
                                    key={name}
                                    className={`w-6 h-6 rounded-full ${selectedColor === color ? 'ring-2 ring-blue-500' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                        <div className="flex space-x-2 mb-2">
                            {STROKE_WIDTHS.map((width) => (
                                <button
                                    key={width}
                                    className={`px-2 py-1 rounded ${selectedStrokeWidth === width ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                    onClick={() => setSelectedStrokeWidth(width)}
                                >
                                    {width}px
                                </button>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className={`px-2 py-1 rounded ${selectedTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTool('pen')}
                            >
                                Pen
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${selectedTool === 'highlighter' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTool('highlighter')}
                            >
                                Highlighter
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${selectedTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTool('eraser')}
                            >
                                Eraser
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${selectedTool === 'shape' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTool('shape')}
                            >
                                Shape
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${selectedTool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTool('text')}
                            >
                                Text
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${selectedTool === 'highlight' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTool('highlight')}
                            >
                                Highlight
                            </button>
                        </div>
                        {selectedTool === 'shape' && (
                            <div className="flex space-x-2 mt-2">
                                {SHAPES.map((shape) => (
                                    <button
                                        key={shape}
                                        className={`px-2 py-1 rounded ${selectedShape === shape ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                        onClick={() => setSelectedShape(shape)}
                                    >
                                        {shape}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
                            className="px-2 py-1 bg-white rounded shadow mr-2"
                        >
                            +
                        </button>
                        <button
                            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                            className="px-2 py-1 bg-white rounded shadow"
                        >
                            -
                        </button>
                    </div>
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="h-full"
                    >
                        <Page pageNumber={pageNumber} scale={zoom} />
                    </Document>
                    <Stage
                        ref={stageRef}
                        width={window.innerWidth * 0.66}
                        height={window.innerHeight}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        className="absolute top-0 left-0"
                        scale={{ x: zoom, y: zoom }}
                    >
                        <Layer>
                            {drawings.map((drawing, i) => (
                                <Line
                                    key={i}
                                    points={drawing.points}
                                    stroke={drawing.color}
                                    strokeWidth={drawing.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    globalCompositeOperation={drawing.type === 'eraser' ? 'destination-out' : 'source-over'}
                                />
                            ))}
                            {currentDrawing && (
                                <Line
                                    points={currentDrawing.points}
                                    stroke={currentDrawing.color}
                                    strokeWidth={currentDrawing.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    globalCompositeOperation={currentDrawing.type === 'eraser' ? 'destination-out' : 'source-over'}
                                />
                            )}
                            {shapes.map((shape, i) => (
                                <Group key={i}>
                                    {shape.type === 'rectangle' && (
                                        <Line
                                            points={shape.points}
                                            stroke={shape.color}
                                            strokeWidth={shape.strokeWidth}
                                            closed
                                        />
                                    )}
                                    {shape.type === 'circle' && (
                                        <Line
                                            points={shape.points}
                                            stroke={shape.color}
                                            strokeWidth={shape.strokeWidth}
                                            closed
                                        />
                                    )}
                                    {shape.type === 'arrow' && (
                                        <Line
                                            points={shape.points}
                                            stroke={shape.color}
                                            strokeWidth={shape.strokeWidth}
                                            pointerLength={10}
                                            pointerWidth={10}
                                        />
                                    )}
                                    {shape.type === 'text' && (
                                        <Text
                                            x={shape.points[0]}
                                            y={shape.points[1]}
                                            text={shape.text || ''}
                                            fill={shape.color}
                                            fontSize={shape.strokeWidth * 4}
                                        />
                                    )}
                                </Group>
                            ))}
                            {currentShape && (
                                <Group>
                                    {currentShape.type === 'rectangle' && (
                                        <Line
                                            points={currentShape.points}
                                            stroke={currentShape.color}
                                            strokeWidth={currentShape.strokeWidth}
                                            closed
                                        />
                                    )}
                                    {currentShape.type === 'circle' && (
                                        <Line
                                            points={currentShape.points}
                                            stroke={currentShape.color}
                                            strokeWidth={currentShape.strokeWidth}
                                            closed
                                        />
                                    )}
                                    {currentShape.type === 'arrow' && (
                                        <Line
                                            points={currentShape.points}
                                            stroke={currentShape.color}
                                            strokeWidth={currentShape.strokeWidth}
                                            pointerLength={10}
                                            pointerWidth={10}
                                        />
                                    )}
                                </Group>
                            )}
                        </Layer>
                    </Stage>
                </div>
                <div className="w-1/3 p-4 bg-gray-100 overflow-y-auto">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Ask AI</h3>
                        <textarea
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Ask a question about the document..."
                        />
                        <button
                            onClick={handleAiQuestion}
                            disabled={isLoading}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                        >
                            {isLoading ? 'Thinking...' : 'Ask'}
                        </button>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">AI Response</h3>
                        <div className="p-4 bg-white rounded border">
                            {aiResponse}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                        <div className="space-y-2">
                            {aiInsights.map((insight, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-white rounded border"
                                    style={{
                                        borderLeft: `4px solid ${insight.type === 'summary' ? 'blue' :
                                            insight.type === 'key-point' ? 'green' :
                                                insight.type === 'question' ? 'orange' :
                                                    'purple'
                                            }`,
                                    }}
                                >
                                    <div className="text-sm text-gray-500 mb-1">
                                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                                    </div>
                                    <div>{insight.content}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Confidence: {Math.round(insight.confidence * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Page Annotations</h3>
                        <div className="p-4 bg-white rounded border">
                            {annotations[pageNumber - 1] || 'No annotations for this page'}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Highlights</h3>
                        <div className="space-y-2">
                            {highlights
                                .filter(h => h.page === pageNumber)
                                .map((highlight, i) => (
                                    <div key={i} className="p-2 bg-white rounded border">
                                        <div className="text-sm">{highlight.text}</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-200">
                <button
                    onClick={() => setPageNumber(pageNumber > 1 ? pageNumber - 1 : 1)}
                    disabled={pageNumber <= 1}
                    className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPageNumber(pageNumber < (numPages || 1) ? pageNumber + 1 : pageNumber)}
                    disabled={pageNumber >= (numPages || 1)}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                    Next
                </button>
                <span className="ml-4">
                    Page {pageNumber} of {numPages || '--'}
                </span>
                <button
                    onClick={handleSave}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Save to Cloud
                </button>
                <button
                    onClick={handleUndo}
                    className="ml-4 px-4 py-2 bg-gray-500 text-white rounded"
                >
                    Undo
                </button>
                <button
                    onClick={handleRedo}
                    className="ml-4 px-4 py-2 bg-gray-500 text-white rounded"
                >
                    Redo
                </button>
                <button
                    onClick={handleSearch}
                    className="ml-4 px-4 py-2 bg-gray-500 text-white rounded"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default DigitalPaper; 