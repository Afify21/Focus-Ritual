import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Fix PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';

interface SimplePDFViewerProps {
    onClose?: () => void;
}

interface Annotation {
    text: string;
    color: string;
    page: number;
    rect: { x: number; y: number; width: number; height: number };
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [scale, setScale] = useState<number>(1.0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
    const [highlightColor, setHighlightColor] = useState<string>('#ffeb3b');
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const highlightColors = [
        { color: '#ffeb3b', name: 'Yellow' },
        { color: '#4caf50', name: 'Green' },
        { color: '#2196f3', name: 'Blue' },
        { color: '#f44336', name: 'Red' },
        { color: '#9c27b0', name: 'Purple' },
        { color: '#ff9800', name: 'Orange' },
    ];

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setIsLoading(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            setPdfFile(file);
            setAnnotations([]); // Clear annotations when loading new file
        }
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPageNumber = prevPageNumber + offset;
            return Math.max(1, Math.min(numPages, newPageNumber));
        });
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    const handleClosePDF = () => {
        setPdfFile(null);
        if (onClose) {
            onClose();
        }
    };

    const handleCloseCurrentPDF = () => {
        setPdfFile(null);
        setNumPages(0);
        setPageNumber(1);
        setScale(1.0);
        setIsHighlightMode(false);
        setHighlightColor('#ffeb3b');
        setAnnotations([]);
    };

    const toggleHighlightMode = () => {
        setIsHighlightMode(prev => !prev);
    };

    const handleTextSelection = () => {
        if (!isHighlightMode) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const text = selection.toString();

        // Get the PDF container's position
        const pdfContainer = document.querySelector('.react-pdf__Document');
        if (!pdfContainer) return;

        const containerRect = pdfContainer.getBoundingClientRect();

        // Calculate position relative to the PDF container
        const x = (rect.left - containerRect.left) / scale;
        const y = (containerRect.height - (rect.top - containerRect.top)) / scale; // Invert Y coordinate
        const width = rect.width / scale;
        const height = rect.height / scale;

        // Add the annotation
        const newAnnotation: Annotation = {
            text,
            color: highlightColor,
            page: pageNumber,
            rect: { x, y, width, height }
        };

        setAnnotations(prev => [...prev, newAnnotation]);
    };

    const handleSavePDF = async () => {
        if (!pdfFile) return;

        try {
            setIsLoading(true);

            // Read the PDF file
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Add annotations to each page
            annotations.forEach(annotation => {
                const page = pdfDoc.getPage(annotation.page - 1);
                const { x, y, width, height } = annotation.rect;

                // Convert hex color to RGB
                const color = hexToRgb(annotation.color);
                if (!color) return;

                // Add highlight annotation
                page.drawRectangle({
                    x,
                    y,
                    width,
                    height,
                    color: rgb(color.r / 255, color.g / 255, color.b / 255),
                    opacity: 0.3
                });
            });

            // Save the modified PDF
            const modifiedPdfBytes = await pdfDoc.save();

            // Create a download link
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `annotated_${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setIsLoading(false);
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Error saving PDF. Please try again.');
            setIsLoading(false);
        }
    };

    // Helper function to convert hex color to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    return (
        <div className="h-full w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">PDF Reader</h2>
                <div className="flex items-center space-x-2">
                    {/* Color Picker Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            title="Select Highlight Color"
                        >
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: highlightColor }} />
                        </button>
                        {showColorPicker && (
                            <div className="absolute right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 w-48">
                                <div className="grid grid-cols-2 gap-3">
                                    {highlightColors.map(({ color, name }) => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setHighlightColor(color);
                                                setShowColorPicker(false);
                                            }}
                                            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                            title={name}
                                        >
                                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Highlight Button */}
                    <button
                        onClick={toggleHighlightMode}
                        className={`p-2 rounded-md transition-colors ${isHighlightMode
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        title={isHighlightMode ? "Disable Highlight Mode" : "Enable Highlight Mode"}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={handleSavePDF}
                        disabled={isLoading}
                        className={`p-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Save PDF with Annotations"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                />
                            </svg>
                        )}
                    </button>

                    {/* Close Current PDF Button */}
                    {pdfFile && (
                        <button
                            onClick={handleCloseCurrentPDF}
                            className="p-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                            title="Close Current PDF"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}

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
                                Upload your PDF document to view and read.
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
                    {/* Toolbar */}
                    <div className="py-2 px-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={previousPage}
                                disabled={pageNumber <= 1}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
                            >
                                <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex items-center space-x-1">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={pageNumber}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow empty input for backspace
                                        if (value === '') {
                                            setPageNumber(0);
                                            return;
                                        }
                                        const newPage = parseInt(value);
                                        if (!isNaN(newPage)) {
                                            setPageNumber(newPage);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const newPage = parseInt(e.currentTarget.value);
                                            if (newPage >= 1 && newPage <= numPages) {
                                                setPageNumber(newPage);
                                            } else {
                                                // Reset to current page if invalid
                                                setPageNumber(pageNumber);
                                            }
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const newPage = parseInt(e.target.value);
                                        if (newPage < 1 || newPage > numPages || isNaN(newPage)) {
                                            // Reset to current page if invalid
                                            setPageNumber(pageNumber);
                                        }
                                    }}
                                    className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    of {numPages}
                                </span>
                            </div>
                            <button
                                onClick={nextPage}
                                disabled={pageNumber >= numPages}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
                            >
                                <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={zoomOut}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={zoomIn}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* PDF Document */}
                    <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-700 p-4">
                        <div className="mx-auto" style={{ width: 'fit-content' }}>
                            <Document
                                file={pdfFile}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="text-center p-4">Loading PDF...</div>}
                                error={<div className="text-center text-red-500 p-4">Failed to load PDF. Please try again.</div>}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className={`${isHighlightMode ? 'cursor-text' : ''}`}
                                    onMouseUp={handleTextSelection}
                                />
                            </Document>
                            {/* Render highlights */}
                            {annotations
                                .filter(annotation => annotation.page === pageNumber)
                                .map((annotation, index) => (
                                    <div
                                        key={index}
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: annotation.rect.x * scale,
                                            top: annotation.rect.y * scale,
                                            width: annotation.rect.width * scale,
                                            height: annotation.rect.height * scale,
                                            backgroundColor: annotation.color,
                                            opacity: 0.3,
                                            mixBlendMode: 'multiply'
                                        }}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimplePDFViewer; 