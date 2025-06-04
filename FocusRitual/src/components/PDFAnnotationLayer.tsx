import React from 'react';

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

interface PDFAnnotationLayerProps {
    annotations: Annotation[];
    currentPage: number;
    scale: number;
    onRemoveAnnotation: (id: string) => void;
}

const PDFAnnotationLayer: React.FC<PDFAnnotationLayerProps> = ({ 
    annotations, 
    currentPage, 
    scale, 
    onRemoveAnnotation 
}) => {
    // Filter annotations for current page
    const pageAnnotations = annotations.filter(annotation => annotation.page === currentPage);

    const handleAnnotationClick = (id: string) => {
        // For future expansion - could show annotation details, etc.
        console.log(`Clicked annotation: ${id}`);
    };

    return (
        <div className="absolute inset-0 pointer-events-none">
            {pageAnnotations.map(annotation => {
                // Determine styles based on annotation type
                let style: React.CSSProperties = {
                    position: 'absolute',
                    left: `${annotation.x * scale}px`,
                    top: `${annotation.y * scale}px`,
                    width: `${annotation.width * scale}px`,
                    height: `${annotation.height * scale}px`,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                };

                // Customize appearance based on annotation type
                if (annotation.type === 'highlight') {
                    style.backgroundColor = `${annotation.color}80`; // 50% opacity
                    style.mixBlendMode = 'multiply';
                    style.borderRadius = '2px';
                } else if (annotation.type === 'underline') {
                    style.height = `${2 * scale}px`; // Make it thin like an underline
                    style.backgroundColor = annotation.color;
                    style.borderRadius = '1px';
                } else if (annotation.type === 'rectangle') {
                    style.border = `2px solid ${annotation.color}`;
                    style.backgroundColor = `${annotation.color}40`; // 25% opacity
                } else if (annotation.type === 'note') {
                    style.width = `${20 * scale}px`;
                    style.height = `${20 * scale}px`;
                    style.backgroundColor = annotation.color;
                    style.borderRadius = '50%';
                    style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    style.zIndex = 10;
                }

                return (
                    <div 
                        key={annotation.id} 
                        style={style}
                        onClick={() => handleAnnotationClick(annotation.id)}
                        className="group"
                    >
                        {/* Delete button */}
                        <button
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveAnnotation(annotation.id);
                            }}
                        >
                            ×
                        </button>
                        
                        {/* Note tooltip */}
                        {annotation.text && (annotation.type === 'note' || annotation.type === 'highlight') && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-sm max-w-xs z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                {annotation.text}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PDFAnnotationLayer; 