import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { createWorker } from 'tesseract.js';
import { XMarkIcon } from '@heroicons/react/24/solid';
import PDFAnnotationLayer from './PDFAnnotationLayer';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Fix PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';

interface EnhancedPDFViewerProps {
    onClose?: () => void;
}

// Annotation type definitions
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

const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({ onClose }) => {
    // File and document state
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // View state
    const [scale, setScale] = useState<number>(1.0);
    const [rotation, setRotation] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Annotation states
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
    const [isUnderlineMode, setIsUnderlineMode] = useState<boolean>(false);
    const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
    const [isNoteMode, setIsNoteMode] = useState<boolean>(false);
    const [selectedColor, setSelectedColor] = useState<string>('#ffeb3b');

    // Drawing state
    const [drawBox, setDrawBox] = useState<{ startX: number; startY: number; endX: number; endY: number; page: number } | null>(null);

    // Note state
    const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
    const [noteText, setNoteText] = useState<string>('');
    const [notePosition, setNotePosition] = useState<{ x: number; y: number; page: number } | null>(null);

    // OCR state
    const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
    const [ocrText, setOcrText] = useState<string>('');
    const [showOcrModal, setShowOcrModal] = useState<boolean>(false);

    // Drawing functionality
    const [isDrawing, setIsDrawing] = useState<boolean>(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const documentRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wrap addAnnotation in useCallback to prevent dependency issues
    const addAnnotation = useCallback((annotation: Annotation) => {
        setAnnotations(prev => [...prev, annotation]);
    }, []);

    const removeAnnotation = useCallback((id: string) => {
        setAnnotations(prev => prev.filter(a => a.id !== id));
    }, []);

    // Handle file upload with error handling
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true); // Show loading indicator
            setPdfFile(file);
            setAnnotations([]);
        }
    };

    // Improve document load success handling
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setCurrentPage(1);
        setIsLoading(false); // Hide loading indicator
        console.log(`Document loaded with ${numPages} pages`);
    };

    // Add document load error handling
    const onDocumentLoadError = (error: Error) => {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
        alert(`Failed to load PDF: ${error.message}`);
    };

    // Zoom controls
    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    // Fit to width
    const fitToWidth = () => {
        if (containerRef.current && documentRef.current) {
            const containerWidth = containerRef.current.clientWidth - 40; // Account for padding
            const docWidth = documentRef.current.scrollWidth;
            setScale(containerWidth / docWidth);
        }
    };

    // Fit to page
    const fitToPage = () => {
        if (containerRef.current && documentRef.current) {
            const containerWidth = containerRef.current.clientWidth - 40;
            const containerHeight = containerRef.current.clientHeight - 40;
            const docWidth = documentRef.current.scrollWidth;
            const docHeight = documentRef.current.scrollHeight;

            const widthScale = containerWidth / docWidth;
            const heightScale = containerHeight / docHeight;

            setScale(Math.min(widthScale, heightScale));
        }
    };

    // Rotation controls
    const rotateLeft = () => setRotation(prev => (prev - 90 + 360) % 360);
    const rotateRight = () => setRotation(prev => (prev + 90) % 360);

    // Page navigation
    const nextPage = () => {
        if (currentPage < numPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Handle page change
    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pageNum = parseInt(e.target.value);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
            setCurrentPage(pageNum);
        }
    };

    // Handle closing PDF viewer
    const handleClosePDF = () => {
        setPdfFile(null);
        setAnnotations([]);
        if (onClose) {
            onClose();
        }
    };

    // OCR functionality
    const performOCR = async () => {
        if (!pdfFile) return;

        setIsOcrLoading(true);
        setOcrText('');

        try {
            // Find the PDF canvas
            const pageCanvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
            if (!pageCanvas) {
                throw new Error('Could not find PDF page canvas');
            }

            // Create a new canvas to capture the PDF content
            const canvas = document.createElement('canvas');
            canvas.width = pageCanvas.width;
            canvas.height = pageCanvas.height;

            // Draw the PDF page on our canvas
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get canvas context');
            context.drawImage(pageCanvas, 0, 0);

            // Get the image data for OCR as a data URL
            const imageData = canvas.toDataURL('image/png');

            // Initialize OCR with a simpler approach
            const worker = await createWorker('eng');

            // Perform OCR
            try {
                const { data } = await worker.recognize(imageData);
                setOcrText(data.text || 'No text detected');
                setShowOcrModal(true);
            } finally {
                // Always terminate worker when done
                await worker.terminate();
            }
        } catch (error) {
            console.error('OCR Error:', error);
            setOcrText(`Error performing OCR: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setShowOcrModal(true); // Still show modal with error message
        } finally {
            setIsOcrLoading(false);
        }
    };

    // Handle note creation
    const handleNoteClick = (event: React.MouseEvent, pageNumber: number) => {
        if (!isNoteMode) return;

        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / scale;
        const y = (event.clientY - rect.top) / scale;

        setNotePosition({ x, y, page: pageNumber });
        setNoteText('');
        setShowNoteModal(true);
    };

    const saveNote = () => {
        if (notePosition && noteText.trim() !== '') {
            addAnnotation({
                id: Date.now().toString(),
                type: 'note',
                page: notePosition.page,
                x: notePosition.x,
                y: notePosition.y,
                width: 20,
                height: 20,
                color: selectedColor,
                text: noteText
            });
        }
        setShowNoteModal(false);
        setNotePosition(null);
    };

    // Handle mouse events for drawing
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingMode && !isHighlightMode && !isUnderlineMode && !isNoteMode) return;

        if (isNoteMode) {
            // Note mode is handled by handleNoteClick
            return;
        }

        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        if (isDrawingMode) {
            setIsDrawing(true);
            setDrawBox({
                startX: x,
                startY: y,
                endX: x,
                endY: y,
                page: currentPage
            });
        }

        // For highlight and underline modes, we'll use the browser's built-in text selection
        // The selection will be processed in handleTextSelection
    }, [isDrawingMode, isHighlightMode, isUnderlineMode, isNoteMode, scale, currentPage]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !drawBox || !isDrawingMode) return;

        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setDrawBox({
            ...drawBox,
            endX: x,
            endY: y
        });
    }, [isDrawing, drawBox, isDrawingMode, scale]);

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (isDrawing && drawBox && isDrawingMode) {
            const { startX, startY, endX, endY } = drawBox;

            // Only create annotation if there's a meaningful size
            if (Math.abs(endX - startX) > 5 && Math.abs(endY - startY) > 5) {
                addAnnotation({
                    id: Date.now().toString(),
                    type: 'rectangle',
                    page: currentPage,
                    x: Math.min(startX, endX),
                    y: Math.min(startY, endY),
                    width: Math.abs(endX - startX),
                    height: Math.abs(endY - startY),
                    color: selectedColor
                });
            }

            setIsDrawing(false);
            setDrawBox(null);
        }
    }, [isDrawing, drawBox, isDrawingMode, currentPage, selectedColor, addAnnotation]);

    // Handle text selection for highlighting and underlining
    const handleTextSelection = useCallback(() => {
        if (!isHighlightMode && !isUnderlineMode) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount) return;

        const pageContainer = documentRef.current?.querySelector('.react-pdf__Page');
        if (!pageContainer) return;

        const pageRect = pageContainer.getBoundingClientRect();

        for (let i = 0; i < selection.rangeCount; i++) {
            const range = selection.getRangeAt(i);
            const rects = range.getClientRects();

            for (let j = 0; j < rects.length; j++) {
                const rect = rects[j];
                const x = (rect.left - pageRect.left) / scale;
                const y = (rect.top - pageRect.top) / scale;
                const width = rect.width / scale;
                const height = rect.height / scale;

                // Skip very small selections (likely between words)
                if (width < 5 || height < 5) continue;

                addAnnotation({
                    id: Date.now().toString() + `-${i}-${j}`,
                    type: isHighlightMode ? 'highlight' : 'underline',
                    page: currentPage,
                    x,
                    y: isHighlightMode ? y : y + height - 2, // Position underline at bottom of selection
                    width,
                    height: isHighlightMode ? height : 2, // Make underline 2px high
                    color: selectedColor,
                    text: range.toString()
                });
            }
        }

        // Clear selection after small delay
        setTimeout(() => {
            selection.removeAllRanges();
        }, 200);
    }, [isHighlightMode, isUnderlineMode, scale, currentPage, selectedColor, addAnnotation]);

    // Set up text selection event
    useEffect(() => {
        if (isHighlightMode || isUnderlineMode) {
            document.addEventListener('mouseup', handleTextSelection);
            return () => {
                document.removeEventListener('mouseup', handleTextSelection);
            };
        }
    }, [isHighlightMode, isUnderlineMode, handleTextSelection]);

    return (
        <div className="relative h-full w-full">
            <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                {/* Header with title and close button */}
                <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">PDF Reader</h2>
                    {onClose && (
                        <button
                            onClick={handleClosePDF}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Close PDF"
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                </div>

                {!pdfFile ? (
                    /* Upload area */
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-8">
                        <div className="max-w-md w-full bg-white dark:bg-gray-700 rounded-lg shadow-md p-8">
                            <div className="flex flex-col items-center text-center">
                                <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-semibold mb-2 dark:text-white">Upload a PDF</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Upload your PDF document to view, annotate and highlight your content.
                                </p>
                                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center transition-colors">
                                    <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                                    </svg>
                                    <span>Select PDF File</span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* PDF Viewer area */
                    <div className="flex-1 flex flex-col">
                        {/* Toolbar area */}
                        <div className="py-2 px-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
                            {/* Navigation controls */}
                            <div className="flex items-center space-x-1 mr-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage <= 1}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
                                    aria-label="Previous Page"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <div className="flex items-center space-x-1">
                                    <input
                                        type="number"
                                        value={currentPage}
                                        onChange={handlePageChange}
                                        min={1}
                                        max={numPages}
                                        className="w-12 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm"
                                    />
                                    <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
                                        / {numPages}
                                    </span>
                                </div>

                                <button
                                    onClick={nextPage}
                                    disabled={currentPage >= numPages}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
                                    aria-label="Next Page"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="h-6 border-r border-gray-300 dark:border-gray-600"></div>

                            {/* Zoom controls */}
                            <div className="flex items-center space-x-1 mr-2">
                                <button
                                    onClick={zoomOut}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                    aria-label="Zoom Out"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>

                                <span className="text-gray-700 dark:text-gray-300 text-sm w-14 text-center">
                                    {Math.round(scale * 100)}%
                                </span>

                                <button
                                    onClick={zoomIn}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                    aria-label="Zoom In"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>

                                <button
                                    onClick={fitToWidth}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                    title="Fit to width"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                                    </svg>
                                </button>

                                <button
                                    onClick={fitToPage}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                    title="Fit to page"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M9 12h6" />
                                    </svg>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="h-6 border-r border-gray-300 dark:border-gray-600"></div>

                            {/* Rotation controls */}
                            <div className="flex items-center space-x-1 mr-2">
                                <button
                                    onClick={rotateLeft}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                    title="Rotate left"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>

                                <button
                                    onClick={rotateRight}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                    title="Rotate right"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="h-6 border-r border-gray-300 dark:border-gray-600"></div>

                            {/* OCR Button */}
                            <div className="flex items-center space-x-1 mr-2">
                                <button
                                    onClick={performOCR}
                                    disabled={isOcrLoading}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 relative"
                                    title="Extract Text (OCR)"
                                >
                                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                    {isOcrLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Annotation tools */}
                            <div className="flex items-center space-x-1 mr-2">
                                <button
                                    onClick={() => {
                                        setIsHighlightMode(!isHighlightMode);
                                        setIsUnderlineMode(false);
                                        setIsDrawingMode(false);
                                        setIsNoteMode(false);
                                    }}
                                    className={`p-1 rounded ${isHighlightMode
                                            ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    title="Highlight text"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsUnderlineMode(!isUnderlineMode);
                                        setIsHighlightMode(false);
                                        setIsDrawingMode(false);
                                        setIsNoteMode(false);
                                    }}
                                    className={`p-1 rounded ${isUnderlineMode
                                            ? 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-200'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    title="Underline text"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsDrawingMode(!isDrawingMode);
                                        setIsHighlightMode(false);
                                        setIsUnderlineMode(false);
                                        setIsNoteMode(false);
                                    }}
                                    className={`p-1 rounded ${isDrawingMode
                                            ? 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    title="Draw rectangles"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsNoteMode(!isNoteMode);
                                        setIsHighlightMode(false);
                                        setIsUnderlineMode(false);
                                        setIsDrawingMode(false);
                                    }}
                                    className={`p-1 rounded ${isNoteMode
                                            ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    title="Add notes"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </button>

                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-6 h-6 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                                    title="Select color"
                                />
                            </div>

                            <div className="flex-grow"></div>

                            {/* Mode indicator */}
                            {(isHighlightMode || isUnderlineMode || isDrawingMode || isNoteMode) && (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {isHighlightMode && "Highlight Mode"}
                                    {isUnderlineMode && "Underline Mode"}
                                    {isDrawingMode && "Rectangle Mode"}
                                    {isNoteMode && "Note Mode"}
                                </span>
                            )}
                        </div>

                        {/* PDF content area */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-700 relative p-4"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                        >
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-800/60 z-50">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">Loading PDF...</p>
                                    </div>
                                </div>
                            )}

                            <div
                                ref={documentRef}
                                className="mx-auto relative"
                                style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top center',
                                    height: '100%',
                                    width: 'fit-content'
                                }}
                            >
                                {pdfFile && (
                                    <Document
                                        file={pdfFile}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        onLoadError={onDocumentLoadError}
                                        loading={<div className="text-center p-4">Loading PDF...</div>}
                                        error={<div className="text-center text-red-500 p-4">Failed to load PDF. Please try again.</div>}
                                    >
                                        <div className="relative">
                                            <Page
                                                pageNumber={currentPage}
                                                width={600}
                                                scale={1}
                                                rotate={rotation}
                                                renderTextLayer={true}
                                                renderAnnotationLayer={true}
                                                loading={<div className="flex justify-center py-5"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                                error={<div className="text-center text-red-500 p-4">Error loading page {currentPage}.</div>}
                                                className="shadow-lg mb-4"
                                                onClick={(e: React.MouseEvent<HTMLDivElement>) => handleNoteClick(e, currentPage)}
                                            />

                                            {/* Annotation Layer */}
                                            <PDFAnnotationLayer
                                                annotations={annotations}
                                                currentPage={currentPage}
                                                scale={scale}
                                                onRemoveAnnotation={removeAnnotation}
                                            />

                                            {/* Drawing Preview */}
                                            {isDrawing && drawBox && (
                                                <div
                                                    className="absolute pointer-events-none"
                                                    style={{
                                                        left: `${Math.min(drawBox.startX, drawBox.endX) * scale}px`,
                                                        top: `${Math.min(drawBox.startY, drawBox.endY) * scale}px`,
                                                        width: `${Math.abs(drawBox.endX - drawBox.startX) * scale}px`,
                                                        height: `${Math.abs(drawBox.endY - drawBox.startY) * scale}px`,
                                                        border: `2px solid ${selectedColor}`,
                                                        backgroundColor: `${selectedColor}40`,
                                                        zIndex: 10
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </Document>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl dark:bg-gray-800 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Add Note</h3>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full h-32 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Enter your note..."
                        />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveNote}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OCR Modal */}
            {showOcrModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl dark:bg-gray-800 max-w-3xl w-full max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-gray-200">Extracted Text (OCR)</h3>
                            <button
                                onClick={() => setShowOcrModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-auto flex-1 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                            <pre className="whitespace-pre-wrap font-mono text-sm dark:text-gray-200">
                                {ocrText || "No text could be extracted. Try adjusting the zoom or rotation."}
                            </pre>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(ocrText).then(() => {
                                        alert("Text copied to clipboard!");
                                    }).catch(err => {
                                        console.error("Failed to copy text: ", err);
                                    });
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShowOcrModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedPDFViewer; 