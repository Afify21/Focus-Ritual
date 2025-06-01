import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

interface Annotation {
    id: string;
    type: 'highlight' | 'note';
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    text?: string;
}

interface PDFAnnotationsProps {
    pdfDoc: PDFDocument | null;
    currentPage: number;
    scale: number;
    onAnnotationAdd: (annotation: Annotation) => void;
    onAnnotationRemove: (id: string) => void;
}

const PDFAnnotations: React.FC<PDFAnnotationsProps> = ({
    pdfDoc,
    currentPage,
    scale,
    onAnnotationAdd,
    onAnnotationRemove,
}) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selection, setSelection] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [selectedColor, setSelectedColor] = useState('#ffeb3b');
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        setIsSelecting(true);
        setSelection({ startX: x, startY: y, endX: x, endY: y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || !containerRef.current || !selection) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        setSelection({ ...selection, endX: x, endY: y });
    };

    const handleMouseUp = () => {
        if (!isSelecting || !selection) return;
        setIsSelecting(false);

        const width = Math.abs(selection.endX - selection.startX);
        const height = Math.abs(selection.endY - selection.startY);
        const x = Math.min(selection.startX, selection.endX);
        const y = Math.min(selection.startY, selection.endY);

        if (width > 10 && height > 10) {
            const newAnnotation: Annotation = {
                id: Date.now().toString(),
                type: 'highlight',
                page: currentPage,
                x,
                y,
                width,
                height,
                color: selectedColor,
            };
            setAnnotations([...annotations, newAnnotation]);
            onAnnotationAdd(newAnnotation);
        }
        setSelection(null);
    };

    const handleAnnotationClick = (id: string) => {
        const annotation = annotations.find(a => a.id === id);
        if (annotation) {
            const newText = prompt('Add a note:', annotation.text);
            if (newText !== null) {
                const updatedAnnotations = annotations.map(a =>
                    a.id === id ? { ...a, text: newText } : a
                );
                setAnnotations(updatedAnnotations);
            }
        }
    };

    const handleAnnotationDelete = (id: string) => {
        setAnnotations(annotations.filter(a => a.id !== id));
        onAnnotationRemove(id);
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Color picker */}
            <div className="absolute top-4 right-4 z-10 flex space-x-2 pointer-events-auto">
                <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                />
            </div>

            {/* Selection rectangle */}
            {selection && (
                <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                    style={{
                        left: Math.min(selection.startX, selection.endX) * scale,
                        top: Math.min(selection.startY, selection.endY) * scale,
                        width: Math.abs(selection.endX - selection.startX) * scale,
                        height: Math.abs(selection.endY - selection.startY) * scale,
                    }}
                />
            )}

            {/* Annotations */}
            {annotations
                .filter(a => a.page === currentPage)
                .map(annotation => (
                    <div
                        key={annotation.id}
                        className="absolute cursor-pointer group pointer-events-auto"
                        style={{
                            left: annotation.x * scale,
                            top: annotation.y * scale,
                            width: annotation.width * scale,
                            height: annotation.height * scale,
                            backgroundColor: annotation.color + '40',
                        }}
                        onClick={() => handleAnnotationClick(annotation.id)}
                    >
                        <button
                            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAnnotationDelete(annotation.id);
                            }}
                        >
                            ×
                        </button>
                        {annotation.text && (
                            <div className="absolute -top-8 left-0 bg-white text-black p-1 rounded text-sm whitespace-nowrap pointer-events-auto">
                                {annotation.text}
                            </div>
                        )}
                    </div>
                ))}
        </div>
    );
};

export default PDFAnnotations; 