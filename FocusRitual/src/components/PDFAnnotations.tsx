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
    onAnnotationRemove: (id: string) => void;
    annotations: Annotation[];
}

const PDFAnnotations: React.FC<PDFAnnotationsProps> = ({
    pdfDoc,
    currentPage,
    scale,
    onAnnotationRemove,
    annotations,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleAnnotationClick = (id: string) => {
        const annotation = annotations.find(a => a.id === id);
        if (annotation) {
            const newText = prompt('Add a note:', annotation.text);
            if (newText !== null) {
                console.log(`Note for annotation ${id}: ${newText}`);
            }
        }
    };

    const handleAnnotationDelete = (id: string) => {
        onAnnotationRemove(id);
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none"
        >
            {/* Annotations */}
            {annotations
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