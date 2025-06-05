import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
    url: string;
    onClose?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageHeight, setPageHeight] = useState(0);
    const [totalHeight, setTotalHeight] = useState(0);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [annotations, setAnnotations] = useState<any[]>([]);

    const pageContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
    };

    const onDocumentLoadError = (error: Error) => {
        setIsLoading(false);
        setError(error.message);
    };

    const handlePageChange = (newPage: number) => {
        if (numPages && newPage >= 1 && newPage <= numPages) {
            setCurrentPage(newPage);
        }
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setScale(1);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(prev => Math.max(0.5, Math.min(prev + delta, 2)));
        }
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
            e.preventDefault();
            if (e.key === '+') handleZoomIn();
            if (e.key === '-') handleZoomOut();
            if (e.key === '0') handleResetZoom();
        }
    }, []);

    useEffect(() => {
        const container = pageContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                container.removeEventListener('wheel', handleWheel);
                window.removeEventListener('keydown', handleKeyDown);
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
            };
        }
    }, [handleWheel, handleKeyDown]);

    return (
        <div className="flex flex-col h-full">
            {/* Controls */}
            <div className="flex items-center justify-between p-3 bg-slate-700/50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-1 rounded hover:bg-slate-600 disabled:opacity-50"
                    >
                        <ArrowUpIcon className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-white">
                        Page {currentPage} of {numPages || '?'}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!numPages || currentPage >= numPages}
                        className="p-1 rounded hover:bg-slate-600 disabled:opacity-50"
                    >
                        <ArrowDownIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className="px-2 py-1 text-white bg-slate-600 rounded hover:bg-slate-500"
                        disabled={scale <= 0.5}
                    >
                        -
                    </button>
                    <span className="text-white">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={handleZoomIn}
                        className="px-2 py-1 text-white bg-slate-600 rounded hover:bg-slate-500"
                        disabled={scale >= 2}
                    >
                        +
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="px-2 py-1 text-white bg-slate-600 rounded hover:bg-slate-500"
                    >
                        Reset
                    </button>
                </div>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="px-3 py-1 pl-8 bg-slate-600 text-white placeholder-slate-400 rounded"
                    />
                    <MagnifyingGlassIcon className="absolute left-2 w-4 h-4 text-slate-400" />
                </div>
            </div>

            {/* PDF Document */}
            <div className="flex-1 overflow-auto bg-slate-800/50">
                {error ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500">Error loading PDF: {error}</p>
                    </div>
                ) : (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="flex items-center justify-center h-full">
                                <p className="text-white">Loading PDF...</p>
                            </div>
                        }
                    >
                        <div
                            ref={pageContainerRef}
                            className="flex items-center justify-center min-h-0 p-4"
                        >
                            <div
                                style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'center top',
                                }}
                            >
                                <Page
                                    pageNumber={currentPage}
                                    scale={1}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    canvasRef={canvasRef}
                                    className="shadow-lg"
                                />
                            </div>
                        </div>
                    </Document>
                )}
            </div>
        </div>
    );
};

export default PDFViewer; 
