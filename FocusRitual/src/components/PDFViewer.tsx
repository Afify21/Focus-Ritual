import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = 'http://localhost:5001/pdf.worker.min.js';

const API_URL = 'http://localhost:5001/api/pdf';

interface PDFViewerProps {
    className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ className }) => {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setLoading(true);
            setError(null);

            try {
                const formData = new FormData();
                formData.append('pdf', selectedFile);

                console.log('Uploading file:', selectedFile.name);
                const response = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to upload PDF');
                }

                const data = await response.json();
                console.log('Upload response:', data);

                const newPdfUrl = `${API_URL}/${data.file.filename}`;
                console.log('Setting PDF URL:', newPdfUrl);
                setPdfUrl(newPdfUrl);
                setFile(selectedFile);
                setPageNumber(1);
            } catch (err) {
                console.error('Upload error:', err);
                setError(err instanceof Error ? err.message : 'Error uploading PDF. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please select a valid PDF file');
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        console.log('PDF loaded successfully, pages:', numPages);
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('Error loading PDF:', error);
        setError('Error loading PDF. Please try another file.');
        setLoading(false);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPageNumber = prevPageNumber + offset;
            return Math.min(Math.max(1, newPageNumber), numPages || 1);
        });
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="mb-4">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={onFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
            </div>

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-white mb-4">
                    Loading PDF...
                </div>
            )}

            {pdfUrl && !error && (
                <div className="flex flex-col items-center">
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="text-white">
                                Loading PDF...
                            </div>
                        }
                        className="max-w-full"
                    >
                        <Page
                            pageNumber={pageNumber}
                            width={600}
                            className="shadow-lg"
                            loading={
                                <div className="text-white">
                                    Loading page...
                                </div>
                            }
                        />
                    </Document>

                    <div className="mt-4 flex items-center gap-4">
                        <button
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="text-white">
                            Page {pageNumber} of {numPages}
                        </span>
                        <button
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= (numPages || 1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
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