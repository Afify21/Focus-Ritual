import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Fix PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';

interface SimplePDFViewerProps {
    onClose?: () => void;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [scale, setScale] = useState<number>(1.0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="h-full w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
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
                    {/* Controls */}
                    <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={previousPage}
                            disabled={pageNumber <= 1}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-2 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <p className="text-sm">
                            Page <span className="font-medium">{pageNumber}</span> of{' '}
                            <span className="font-medium">{numPages}</span>
                        </p>
                        <button
                            onClick={nextPage}
                            disabled={pageNumber >= numPages}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded ml-2 disabled:opacity-50"
                        >
                            Next
                        </button>
                        <div className="ml-4 flex items-center">
                            <button
                                onClick={zoomOut}
                                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-1"
                            >
                                -
                            </button>
                            <span className="text-sm mx-1">{Math.round(scale * 100)}%</span>
                            <button
                                onClick={zoomIn}
                                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded ml-1"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* PDF content */}
                    <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-700 p-4 flex justify-center">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-800/60 z-50">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                            <Document
                                file={pdfFile}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="text-center p-4">Loading PDF...</div>}
                                error={<div className="text-center text-red-500 p-4">Failed to load PDF. Please try again.</div>}
                            >
                                <Page 
                                    pageNumber={pageNumber} 
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    loading={<div className="flex justify-center py-5"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                    width={600}
                                />
                            </Document>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimplePDFViewer; 