import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

interface Annotation {
    id: string;
    type: 'highlight' | 'note' | 'rectangle' | 'underline';
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
            {annotations.map((annotation: Annotation) => {
                let style: React.CSSProperties = {
                    left: annotation.x * scale,
                    top: annotation.y * scale,
                    width: annotation.width * scale,
                    height: annotation.height * scale,
                    position: 'absolute', // Ensure position is absolute
                    cursor: 'pointer',
                };

                if (annotation.type === 'underline') {
                    style.backgroundColor = annotation.color; // Solid color for underline
                    // height is already set to the underline thickness from annotation.height
                } else if (annotation.type === 'highlight' || annotation.type === 'rectangle') {
                    style.backgroundColor = annotation.color + '40'; // Semi-transparent for highlight/rectangle
                } else if (annotation.type === 'note') {
                    // Placeholder for note styling - maybe an icon
                    style.backgroundColor = annotation.color + '40'; // Default for now
                    style.width = 20 * scale; // Example fixed size for a note icon
                    style.height = 20 * scale;
                }

                return (
                    <div
                        key={annotation.id}
                        className="group pointer-events-auto" // Removed absolute from here, it's in style object
                        style={style}
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
                        {annotation.text && (annotation.type === 'highlight' || annotation.type === 'note') && (
                            <div className="absolute -top-8 left-0 bg-white text-black p-1 rounded text-sm whitespace-nowrap pointer-events-auto z-10">
                                {annotation.text}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PDFAnnotations; 