import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import PDFAnnotations from './PDFAnnotations';
import { XMarkIcon } from '@heroicons/react/24/solid';
import 'pdfjs-dist/web/pdf_viewer.css';

// Set up PDF.js worker
// We assume the worker file is copied to the public directory at /workers/
pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.mjs';

interface PDFViewerProps {
    onClose?: () => void;
}

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

const PDFViewer: React.FC<PDFViewerProps> = ({ onClose }) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pdfLibDoc, setPdfLibDoc] = useState<PDFDocument | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();
    const [scrollPosition, setScrollPosition] = useState(0);
    const [totalHeight, setTotalHeight] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);

    const renderPage = useCallback(async (pageNum: number) => {
        console.log('Attempting to render page:', pageNum);
        if (!pdfDoc || !canvasRef.current || !pageContainerRef.current || !textLayerRef.current) {
            console.log('Rendering skipped: pdfDoc, canvasRef, pageContainerRef, or textLayerRef not available');
            return;
        }

        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) {
                console.error('Could not get canvas context');
                return;
            }

            // Set canvas dimensions to match viewport
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Update page height for scroll calculations
            setPageHeight(viewport.height);

            // Set the container dimensions to match the canvas for correct annotation and text layer positioning
            pageContainerRef.current.style.width = `${viewport.width}px`;
            pageContainerRef.current.style.height = `${viewport.height}px`;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            // Clear the canvas before rendering
            context.clearRect(0, 0, canvas.width, canvas.height);
            await page.render(renderContext).promise;
            console.log('Page rendered successfully:', pageNum);

            // Update total height for scroll calculations
            setTotalHeight(viewport.height * totalPages);

            // Render text layer
            const textContentSource = await page.getTextContent();
            const textLayer = textLayerRef.current;

            // Clear previous text layer
            textLayer.innerHTML = '';
            textLayer.style.setProperty('--scale-factor', scale.toString());

            // Create text layer div
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.style.width = `${viewport.width}px`;
            textLayerDiv.style.height = `${viewport.height}px`;
            textLayer.appendChild(textLayerDiv);

            // Render text content
            const textContent = await page.getTextContent();
            const textItems = textContent.items;

            // Create text spans for each text item
            textItems.forEach((item: any) => {
                const tx = pdfjsLib.Util.transform(
                    pdfjsLib.Util.transform(viewport.transform, item.transform),
                    [1, 0, 0, -1, 0, 0]
                );

                const style = textContent.styles[item.fontName];
                const fontSize = Math.sqrt((tx[0] * tx[0]) + (tx[1] * tx[1]));

                const textSpan = document.createElement('span');
                textSpan.textContent = item.str;
                textSpan.style.left = `${tx[4]}px`;
                textSpan.style.top = `${tx[5]}px`;
                textSpan.style.fontSize = `${fontSize}px`;
                textSpan.style.fontFamily = style.fontFamily;
                textSpan.style.transform = `scaleX(${tx[0] / fontSize})`;
                textSpan.style.transformOrigin = 'left';

                textLayerDiv.appendChild(textSpan);
            });

        } catch (error) {
            console.error('Error rendering page:', pageNum, error);
        }

    }, [pdfDoc, scale, totalPages]);

    useEffect(() => {
        console.log('pdfDoc or currentPage or scale changed. Running useEffect.');
        if (pdfDoc) {
            console.log('pdfDoc is available. Calling renderPage.', currentPage);
            renderPage(currentPage);
        } else {
            console.log('pdfDoc is not available.');
        }
    }, [pdfDoc, currentPage, scale, renderPage]); // Add renderPage as a dependency

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log('File selected:', file?.name);
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);

            try {
                // Load PDF for viewing (using pdfjsLib)
                console.log('Attempting to load PDF for viewing with pdfjsLib.');
                const arrayBufferForPdfjs = await file.arrayBuffer(); // Get a fresh buffer
                const pdf = await pdfjsLib.getDocument(arrayBufferForPdfjs).promise;
                console.log('pdfjsLib document loaded:', pdf);
                setPdfDoc(pdf);
                setTotalPages(pdf.numPages);
                console.log('Total pages:', pdf.numPages);
                setCurrentPage(1);

                // Load PDF for annotations (using pdf-lib)
                console.log('Attempting to load PDF for annotations with pdf-lib.');
                const arrayBufferForPdfLib = await file.arrayBuffer(); // Get another fresh buffer
                const pdfLibDocument = await PDFDocument.load(arrayBufferForPdfLib);
                console.log('pdf-lib document loaded:', pdfLibDocument);
                setPdfLibDoc(pdfLibDocument);

            } catch (error) {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF. Please ensure it is a valid PDF file.');
                setPdfFile(null);
                setPdfDoc(null);
                setPdfLibDoc(null);
                setTotalPages(0);
                setCurrentPage(1);
            }
        } else {
            console.log('No file selected or not a PDF.');
            setPdfFile(null);
            setPdfDoc(null);
            setPdfLibDoc(null);
            setTotalPages(0);
            setCurrentPage(1);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 3));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    };

    const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(event.target.value);
        setScale(newScale);
    };

    const handleAnnotationAdd = (annotation: Annotation) => {
        setAnnotations(prev => [...prev, annotation]);
    };

    const handleAnnotationRemove = (id: string) => {
        setAnnotations(prev => prev.filter(a => a.id !== id));
    };

    const saveAnnotatedPDF = async () => {
        if (!pdfLibDoc || !pdfFile) return;

        try {
            // Create a new PDF document from the original
            const pdfBytes = await pdfFile.arrayBuffer();
            const newPdfDoc = await PDFDocument.load(pdfBytes);

            // Add annotations to the PDF
            for (const annotation of annotations) {
                const pageIndex = annotation.page - 1;
                if (pageIndex >= newPdfDoc.getPages().length) continue; // Skip if page index is out of bounds

                const page = newPdfDoc.getPage(pageIndex);
                const { x, y, width, height, color, text } = annotation;

                // Convert hex color to RGB
                const r = parseInt(color.slice(1, 3), 16) / 255;
                const g = parseInt(color.slice(3, 5), 16) / 255;
                const b = parseInt(color.slice(5, 7), 16) / 255;

                // Draw highlight
                page.drawRectangle({
                    x,
                    y: page.getHeight() - y - height, // Adjust y-coordinate for PDF-LIB
                    width,
                    height,
                    color: rgb(r, g, b),
                    opacity: 0.3,
                });

                // Add note if exists
                if (text) {
                    page.drawText(text, {
                        x: x + width,
                        y: page.getHeight() - y - height - 10, // Adjust y-coordinate for PDF-LIB
                        size: 12,
                        color: rgb(0, 0, 0),
                    });
                }
            }

            // Save the PDF
            const modifiedPdfBytes = await newPdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = `annotated_${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving annotated PDF:', error);
            alert('Error saving annotated PDF. Please try again.');
        }
    };

    const handleClosePDF = () => {
        setPdfFile(null);
        setPdfDoc(null);
        setPdfLibDoc(null);
        setTotalPages(0);
        setCurrentPage(1);
        setAnnotations([]);
        if (onClose) {
            onClose();
        }
    };

    const handlePageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentPage(Number(event.target.value));
    };

    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();

        if (!pageContainerRef.current || !totalHeight) return;

        const delta = event.deltaY; // Removed the negative sign to reverse direction
        const container = pageContainerRef.current;
        const newPosition = container.scrollTop + delta;

        // Calculate which page we're on based on scroll position
        const currentPageNum = Math.floor(newPosition / pageHeight) + 1;
        if (currentPageNum !== currentPage) {
            setCurrentPage(currentPageNum);
        }

        // Update scroll position
        container.scrollTop = newPosition;
    }, [currentPage, pageHeight, totalHeight]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (isScrolling) return;

        switch (event.key) {
            case 'ArrowDown':
            case 'PageDown':
                event.preventDefault();
                if (currentPage < totalPages) {
                    setIsScrolling(true);
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    setTimeout(() => setIsScrolling(false), 300);
                }
                break;
            case 'ArrowUp':
            case 'PageUp':
                event.preventDefault();
                if (currentPage > 1) {
                    setIsScrolling(true);
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    setTimeout(() => setIsScrolling(false), 300);
                }
                break;
        }
    }, [currentPage, totalPages, isScrolling]);

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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">PDF Viewer</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={zoomOut}
                            className="px-3 py-1 rounded bg-slate-600 hover:bg-slate-700"
                        >
                            -
                        </button>
                        <span className="text-sm w-12 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            className="px-3 py-1 rounded bg-slate-600 hover:bg-slate-700"
                        >
                            +
                        </button>
                    </div>
                    {pdfFile && (
                        <>
                            <button
                                onClick={saveAnnotatedPDF}
                                className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
                            >
                                Save PDF
                            </button>
                            <button
                                onClick={handleClosePDF}
                                className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
                                aria-label="Close PDF"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!pdfFile ? (
                <div className="flex-1 flex items-center justify-center">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                        <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M13 10V3a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1h8a1 1 0 001-1v-7h3l-4-4z" />
                        </svg>
                        <span>Upload PDF</span>
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                </div>
            ) : (
                <div className="flex-1 flex">
                    <div
                        ref={pageContainerRef}
                        className="flex-1 overflow-auto bg-gray-200 rounded-lg relative flex items-start justify-center p-4 transition-all duration-300 ease-in-out cursor-default"
                        style={{
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch',
                            height: '100%'
                        }}
                    >
                        <div
                            className="relative shadow-lg transition-transform duration-300 ease-in-out"
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top center',
                                height: totalHeight
                            }}
                        >
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <div key={pageNum} style={{ height: pageHeight }}>
                                    <canvas
                                        ref={pageNum === currentPage ? canvasRef : undefined}
                                        className="block"
                                    />
                                    <div
                                        ref={pageNum === currentPage ? textLayerRef : undefined}
                                        className="textLayer absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-auto"
                                    />
                                    <PDFAnnotations
                                        pdfDoc={pdfLibDoc}
                                        currentPage={pageNum}
                                        scale={scale}
                                        onAnnotationAdd={handleAnnotationAdd}
                                        onAnnotationRemove={handleAnnotationRemove}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-8 flex flex-col items-center justify-center bg-gray-100 rounded-r-lg">
                        <span className="text-sm font-medium text-gray-700">
                            {currentPage}/{totalPages}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDFViewer; 