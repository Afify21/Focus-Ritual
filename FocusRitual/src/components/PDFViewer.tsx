import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import PDFAnnotations from './PDFAnnotations';

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

    const renderPage = useCallback(async (pageNum: number) => {
        console.log('Attempting to render page:', pageNum);
        if (!pdfDoc || !canvasRef.current || !pageContainerRef.current) {
            console.log('Rendering skipped: pdfDoc, canvasRef, or pageContainerRef not available');
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

            // Set the container dimensions to match the canvas for correct annotation positioning
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

        } catch (error) {
            console.error('Error rendering page:', pageNum, error);
        }

    }, [pdfDoc, scale]); // Depend on pdfDoc and scale

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

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">PDF Viewer</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={zoomOut}
                        className="px-3 py-1 rounded bg-slate-600 hover:bg-slate-700"
                    >
                        -
                    </button>
                    <button
                        onClick={zoomIn}
                        className="px-3 py-1 rounded bg-slate-600 hover:bg-slate-700"
                    >
                        +
                    </button>
                    {pdfFile && (
                        <button
                            onClick={saveAnnotatedPDF}
                            className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
                        >
                            Save PDF
                        </button>
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
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-auto bg-gray-200 rounded-lg relative flex items-start justify-center p-4">
                        <div
                            ref={pageContainerRef}
                            className="relative shadow-lg"
                        // The width and height will be set dynamically in renderPage
                        >
                            {/* Canvas element for PDF rendering */}
                            <canvas
                                ref={canvasRef}
                                className="block"
                            />
                            {/* Annotation layer */}
                            <PDFAnnotations
                                pdfDoc={pdfLibDoc}
                                currentPage={currentPage}
                                scale={scale}
                                onAnnotationAdd={handleAnnotationAdd}
                                onAnnotationRemove={handleAnnotationRemove}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-700 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDFViewer; 