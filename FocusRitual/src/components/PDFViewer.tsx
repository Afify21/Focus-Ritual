import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import PDFAnnotations from './PDFAnnotations';
import { XMarkIcon } from '@heroicons/react/24/solid';
import 'pdfjs-dist/web/pdf_viewer.css';

// Set up PDF.js worker with more robust path handling
const workerSrc = `${window.location.origin}/workers/pdf.worker.mjs`;
const workerSrcFallback = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;

try {
    if (typeof window !== 'undefined') {
        console.log('Setting PDF.js worker source to:', workerSrc);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    }
} catch (error) {
    console.error('Error setting up PDF.js worker:', error);
    // Fall back to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcFallback;
}

interface PDFViewerProps {
    onClose?: () => void;
}

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

const PDFViewer: React.FC<PDFViewerProps> = ({ onClose }) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pdfLibDoc, setPdfLibDoc] = useState<PDFDocument | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.2);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();
    const [scrollPosition, setScrollPosition] = useState(0);
    const [totalHeight, setTotalHeight] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#ffeb3b');
    const [horizontalScroll, setHorizontalScroll] = useState(0);
    const [showHorizontalNav, setShowHorizontalNav] = useState(false);

    // State and handlers for text selection/highlighting
    const [isSelecting, setIsSelecting] = useState(false);
    const [selection, setSelection] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

    // Add new state for text selection
    const [selectedText, setSelectedText] = useState<{ text: string; rect: DOMRect } | null>(null);

    // Add a new state for tracking text selection
    const [selectedTextRanges, setSelectedTextRanges] = useState<Range[]>([]);

    // Add new state for drawing mode
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawBox, setDrawBox] = useState<{ startX: number; startY: number; endX: number; endY: number; page: number } | null>(null);
    const [isUnderlineMode, setIsUnderlineMode] = useState(false);
    const [isNoteMode, setIsNoteMode] = useState(false);
    const [showNoteInputModal, setShowNoteInputModal] = useState(false);
    const [currentNoteText, setCurrentNoteText] = useState('');
    const [notePosition, setNotePosition] = useState<{ x: number; y: number; page: number } | null>(null);

    const [pdfText, setPdfText] = useState<string>('');
    const [rotation, setRotation] = useState<number>(0);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
    const [showTextExtractModal, setShowTextExtractModal] = useState<boolean>(false);
    const [extractedTextContent, setExtractedTextContent] = useState<string>('');

    const debouncedSetCurrentPage = useRef<((page: number) => void) | null>(null);

    const handleAnnotationAdd = useCallback((annotation: Annotation) => {
        setAnnotations(prev => [...prev, annotation]);
    }, []);

    const handleAnnotationRemove = useCallback((id: string) => {
        setAnnotations(prev => prev.filter(a => a.id !== id));
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (!textLayerRef.current) return;
        const rect = textLayerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        if (isNoteMode) {
            e.preventDefault();
            setNotePosition({ x, y, page: currentPage });
            setCurrentNoteText('');
            setShowNoteInputModal(true);
            setIsNoteMode(false);
            return;
        }

        if (isDrawingMode) {
            setDrawBox({ startX: x, startY: y, endX: x, endY: y, page: currentPage });
        } else if (isHighlightMode) {
            e.preventDefault();
            setIsSelecting(true);
            setSelection({ startX: x, startY: y, endX: x, endY: y });
        } else if (isUnderlineMode) {
            e.preventDefault();
            setIsSelecting(true);
            setSelection({ startX: x, startY: y, endX: x, endY: y });
        }
    }, [isDrawingMode, drawBox, isHighlightMode, currentPage, scale, selectedColor, handleAnnotationAdd, isUnderlineMode, isNoteMode]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!textLayerRef.current) return;
        const rect = textLayerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        if (isDrawingMode && drawBox) {
            setDrawBox({ ...drawBox, endX: x, endY: y });
        } else if (isSelecting && selection) {
            e.preventDefault();
            setSelection({ ...selection, endX: x, endY: y });
        }
    }, [isDrawingMode, drawBox, isSelecting, selection, scale]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (isDrawingMode && drawBox) {
            const { startX, startY, endX, endY, page } = drawBox;
            const newAnnotation: Annotation = {
                id: Date.now().toString(),
                type: 'rectangle',
                page: page,
                x: Math.min(startX, endX),
                y: Math.min(startY, endY),
                width: Math.abs(endX - startX),
                height: Math.abs(endY - startY),
                color: selectedColor
            };
            handleAnnotationAdd(newAnnotation);
            setDrawBox(null);
        } else if (isHighlightMode || isUnderlineMode) {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
                try {
                    const ranges: Range[] = [];
                    for (let i = 0; i < selection.rangeCount; i++) {
                        ranges.push(selection.getRangeAt(i));
                    }

                    if (!textLayerRef.current) {
                        console.error('Text layer ref is not available');
                        return;
                    }

                    const textLayerRect = textLayerRef.current.getBoundingClientRect();

                    ranges.forEach(range => {
                        const rects = range.getClientRects();
                        if (!rects.length) {
                            console.log('No client rects in range');
                            return;
                        }

                        console.log(`Creating ${isHighlightMode ? 'highlight' : 'underline'} for range with ${rects.length} rects`);

                        for (let i = 0; i < rects.length; i++) {
                            const rect = rects[i];
                            const x = (rect.left - textLayerRect.left) / scale;
                            const y = isHighlightMode
                                ? (rect.top - textLayerRect.top) / scale
                                : (rect.top - textLayerRect.top + rect.height - 2) / scale;

                            const width = rect.width / scale;
                            const height = isHighlightMode ? rect.height / scale : 2 / scale;

                            console.log(`Creating annotation at x:${x}, y:${y}, w:${width}, h:${height}`);

                            const newAnnotation: Annotation = {
                                id: Date.now().toString() + "-" + (isHighlightMode ? "highlight" : "underline") + "-" + i,
                                type: isHighlightMode ? 'highlight' : 'underline',
                                page: currentPage,
                                x,
                                y,
                                width,
                                height,
                                color: selectedColor,
                                text: range.toString()
                            };
                            handleAnnotationAdd(newAnnotation);
                        }
                    });

                    setTimeout(() => {
                        selection.removeAllRanges();
                    }, 300);
                } catch (error) {
                    console.error('Error creating annotation:', error);
                }
            } else {
                console.log('No text selected or selection collapsed');
            }
        }

        setIsSelecting(false);
        setSelection(null);
    }, [isDrawingMode, drawBox, isHighlightMode, isUnderlineMode, currentPage, scale, selectedColor, handleAnnotationAdd]);

    const renderPage = useCallback(async (pageNum: number) => {
        console.log('Attempting to render page:', pageNum, 'with rotation:', rotation);
        if (!pdfDoc || !canvasRef.current || !pageContainerRef.current || !textLayerRef.current) {
            console.log('Rendering skipped: pdfDoc, canvasRef, pageContainerRef, or textLayerRef not available');
            return;
        }
        setIsPageLoading(true);
        try {
            const page = await pdfDoc.getPage(pageNum);
            console.log('Page retrieved successfully:', pageNum);
            const viewport = page.getViewport({ scale, rotation });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) {
                console.error('Could not get canvas context');
                return;
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            setPageHeight(viewport.height);

            pageContainerRef.current.style.width = `${viewport.width}px`;
            pageContainerRef.current.style.height = `${viewport.height}px`;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            context.clearRect(0, 0, canvas.width, canvas.height);

            console.log('Beginning page render operation for page:', pageNum);
            await page.render(renderContext).promise.catch(err => {
                console.error(`Render error for page ${pageNum}:`, err);
                throw err;
            });
            console.log('Page rendered successfully:', pageNum);

            if (rotation === 0 || rotation === 180) {
                setPageHeight(viewport.height);
                setTotalHeight(viewport.height * totalPages);
            } else {
                setPageHeight(viewport.width);
                setTotalHeight(viewport.width * totalPages);
            }

            const textLayer = textLayerRef.current;

            textLayer.innerHTML = '';
            textLayer.style.setProperty('--scale-factor', scale.toString());

            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.style.width = `${viewport.width}px`;
            textLayerDiv.style.height = `${viewport.height}px`;
            textLayerDiv.style.position = 'absolute';
            textLayerDiv.style.left = '0';
            textLayerDiv.style.top = '0';
            textLayerDiv.style.right = '0';
            textLayerDiv.style.bottom = '0';
            textLayerDiv.style.overflow = 'hidden';
            textLayerDiv.style.opacity = '1.0';
            textLayerDiv.style.pointerEvents = 'all';
            textLayerDiv.style.userSelect = isHighlightMode || isUnderlineMode ? 'text' : 'none';
            textLayerDiv.style.lineHeight = '1.0';

            textLayer.appendChild(textLayerDiv);

            // Render text content
            try {
                console.log('Retrieving text content for page:', pageNum);
                const textContent = await page.getTextContent().catch(err => {
                    console.error(`Text content error for page ${pageNum}:`, err);
                    throw err;
                });
                console.log('Text content retrieved for page:', pageNum);

                // Clear previous text layer
                textLayer.innerHTML = '';

                // Create a new text layer container with proper scaling
                const textLayerDiv = document.createElement('div');
                textLayerDiv.className = 'textLayer';
                textLayerDiv.style.width = `${viewport.width}px`;
                textLayerDiv.style.height = `${viewport.height}px`;
                textLayerDiv.style.position = 'absolute';
                textLayerDiv.style.left = '0';
                textLayerDiv.style.top = '0';
                textLayerDiv.style.right = '0';
                textLayerDiv.style.bottom = '0';
                textLayerDiv.style.overflow = 'hidden';
                textLayerDiv.style.opacity = '1.0';
                textLayerDiv.style.pointerEvents = 'all';
                textLayerDiv.style.userSelect = isHighlightMode || isUnderlineMode ? 'text' : 'none';
                textLayerDiv.style.lineHeight = '1.0';
                textLayer.appendChild(textLayerDiv);

                // Render text content using our improved algorithm
                renderTextLayer(textContent, textLayerDiv, viewport, scale);
            } catch (textError) {
                console.error('Failed to render text layer:', textError);
                // Add a fallback message to the text layer
                const errorMsg = document.createElement('div');
                errorMsg.className = 'text-red-500 p-4 text-center';
                errorMsg.textContent = 'Error loading text layer. Text selection may not work correctly.';
                textLayerRef.current.appendChild(errorMsg);
            }
        } catch (error) {
            console.error('Error rendering page:', pageNum, error);
            if (error instanceof Error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
        } finally {
            setIsPageLoading(false);
        }
    }, [pdfDoc, scale, totalPages, isHighlightMode, isUnderlineMode, rotation]);

    // Helper function for manual text rendering with improved positioning
    const renderTextLayer = (
        textContent: any,
        textLayerDiv: HTMLDivElement,
        viewport: any,
        scale: number
    ) => {
        const textItems = textContent.items;
        const textStyles = textContent.styles || {};

        // Sort text items by vertical position for better layout
        const sortedItems = [...textItems].sort((a, b) => {
            const yDiff = a.transform[5] - b.transform[5];
            if (Math.abs(yDiff) > 5) return yDiff;
            return a.transform[4] - b.transform[4]; // Sort by x if y is similar
        });

        // Track lines for better text positioning
        const lineMap: { [key: number]: Array<{ x: number, width: number, item: any }> } = {};

        // First pass: group by lines
        sortedItems.forEach((item: any) => {
            const ty = Math.round(item.transform[5]);
            if (!lineMap[ty]) {
                lineMap[ty] = [];
            }

            const x = item.transform[4];
            const width = item.width || 5; // Default width if none provided

            lineMap[ty].push({
                x,
                width,
                item
            });
        });

        // Second pass: create spans with proper positioning
        Object.keys(lineMap).forEach((yPos) => {
            const lineItems = lineMap[Number(yPos)].sort((a, b) => a.x - b.x);

            lineItems.forEach((lineItem) => {
                try {
                    // Transform PDF coordinates to page coordinates
                    const tx = pdfjsLib.Util.transform(
                        pdfjsLib.Util.transform(viewport.transform, lineItem.item.transform),
                        [1, 0, 0, -1, 0, 0]
                    );

                    // Get style information
                    const styleKey = lineItem.item.fontName;
                    const style = textStyles[styleKey] || {};
                    const fontSize = Math.sqrt((tx[0] * tx[0]) + (tx[1] * tx[1]));

                    // Skip empty or whitespace-only strings
                    if (!lineItem.item.str.trim()) return;

                    // Create and position the text span
                    const textSpan = document.createElement('span');
                    textSpan.textContent = lineItem.item.str;

                    // Apply styles with better positioning
                    textSpan.style.position = 'absolute';
                    textSpan.style.left = `${tx[4]}px`;
                    textSpan.style.top = `${tx[5]}px`;
                    textSpan.style.fontSize = `${fontSize}px`;
                    textSpan.style.fontFamily = style.fontFamily || 'sans-serif';
                    textSpan.style.transform = `scaleX(${tx[0] / fontSize})`;
                    textSpan.style.transformOrigin = 'left';
                    textSpan.style.whiteSpace = 'pre';
                    textSpan.style.letterSpacing = '0px';
                    textSpan.style.display = 'inline-block';
                    textSpan.style.color = 'rgba(0, 0, 0, 1)';
                    textSpan.style.userSelect = 'text';

                    // Add the span to the text layer
                    textLayerDiv.appendChild(textSpan);
                } catch (err) {
                    console.error('Error creating text span:', err);
                }
            });
        });
    };

    useEffect(() => {
        console.log('pdfDoc or currentPage or scale changed. Running useEffect.');
        if (pdfDoc) {
            console.log('pdfDoc is available. Calling renderPage.', currentPage);
            renderPage(currentPage);
        } else {
            console.log('pdfDoc is not available.');
        }
    }, [pdfDoc, currentPage, scale, renderPage]);

    useEffect(() => {
        const textLayer = textLayerRef.current;
        if (textLayer) {
            textLayer.addEventListener('mousedown', handleMouseDown as EventListener);
            textLayer.addEventListener('mousemove', handleMouseMove as EventListener);
            textLayer.addEventListener('mouseup', handleMouseUp as EventListener);

            window.addEventListener('mouseup', handleMouseUp as EventListener);

            return () => {
                textLayer.removeEventListener('mousedown', handleMouseDown as EventListener);
                textLayer.removeEventListener('mousemove', handleMouseMove as EventListener);
                textLayer.removeEventListener('mouseup', handleMouseUp as EventListener);
                window.removeEventListener('mouseup', handleMouseUp as EventListener);
            };
        }
    }, [handleMouseDown, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const textLayer = textLayerRef.current;
        if (textLayer) {
            const textLayerDivs = textLayer.querySelectorAll('.textLayer');
            textLayerDivs.forEach(div => {
                const htmlDiv = div as HTMLElement;
                htmlDiv.style.userSelect = isHighlightMode || isUnderlineMode ? 'text' : 'none';
                htmlDiv.style.cursor = isHighlightMode || isUnderlineMode ? 'text' :
                    isDrawingMode ? 'crosshair' : 'default';
            });
        }
    }, [isHighlightMode, isUnderlineMode, isDrawingMode]);

    const extractTextFromPDF = async () => {
        if (!pdfDoc) return;

        try {
            let fullText = '';
            console.log(`Extracting text from ${totalPages} pages.`);

            // Show loading state or progress
            setIsPageLoading(true);

            for (let i = 1; i <= totalPages; i++) {
                try {
                    const page = await pdfDoc.getPage(i);
                    // Fix linter errors by removing incompatible options
                    const textContent = await page.getTextContent();

                    // Process text items
                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(' ')
                        .replace(/\s+/g, ' ') // Normalize spacing
                        .trim();

                    fullText += pageText + '\n\n';
                    console.log(`Extracted text from page ${i}/${totalPages}.`);
                } catch (pageError) {
                    console.error(`Error extracting text from page ${i}:`, pageError);
                    fullText += `[Error extracting text from page ${i}]\n\n`;
                }
            }

            setPdfText(fullText);
            console.log(`PDF text extraction complete. Total length: ${fullText.length}`);

            // Dispatch event with PDF text
            window.dispatchEvent(new CustomEvent('pdfTextUpdated', { detail: fullText }));

            // Set extracted text for the modal if needed
            setExtractedTextContent(fullText);

            // Hide loading state
            setIsPageLoading(false);

            return fullText;
        } catch (error) {
            console.error('Error during PDF text extraction:', error);
            setIsPageLoading(false);
            return '';
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPdfFile(file);
        let arrayBuffer;

        try {
            arrayBuffer = await file.arrayBuffer();
        } catch (error) {
            console.error('Error reading file as array buffer:', error);
            alert('Error reading the PDF file. Please try again with a different file.');
            setPdfFile(null);
            return;
        }

        try {
            console.log('Initializing PDF.js with worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                cMapUrl: 'https://unpkg.com/pdfjs-dist@5.3.31/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.3.31/standard_fonts/'
            });

            const pdf = await loadingTask.promise;
            console.log('PDF loaded successfully:', pdf);
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);

            await extractTextFromPDF();

            const arrayBufferForPdfLib = await file.arrayBuffer();
            const pdfLibDocument = await PDFDocument.load(arrayBufferForPdfLib);
            console.log('pdf-lib document loaded:', pdfLibDocument);
            setPdfLibDoc(pdfLibDocument);

        } catch (error) {
            console.error('Error loading PDF:', error);
            if (error instanceof Error) {
                alert(`Error loading PDF: ${error.name} - ${error.message}`);
            } else {
                alert('Error loading PDF. Please ensure it is a valid PDF file.');
            }
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
        setScale(prev => {
            const newScale = Math.min(prev + 0.2, 3);
            setShowHorizontalNav(newScale > 1);
            return newScale;
        });
    };

    const zoomOut = () => {
        setScale(prev => {
            const newScale = Math.max(prev - 0.2, 0.5);
            setShowHorizontalNav(newScale > 1);
            return newScale;
        });
    };

    const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(event.target.value);
        setScale(newScale);
    };

    const saveAnnotatedPDF = async () => {
        if (!pdfLibDoc || !pdfFile) return;

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            const newPdfDoc = await PDFDocument.load(pdfBytes);

            for (const annotation of annotations) {
                const pageIndex = annotation.page - 1;
                if (pageIndex >= newPdfDoc.getPages().length) continue;

                const page = newPdfDoc.getPage(pageIndex);
                const { x, y, width, height, color, text, type } = annotation;

                const r = parseInt(color.slice(1, 3), 16) / 255;
                const g = parseInt(color.slice(3, 5), 16) / 255;
                const b = parseInt(color.slice(5, 7), 16) / 255;
                const pageHeight = page.getHeight();

                if (type === 'highlight' || type === 'rectangle') {
                    page.drawRectangle({
                        x,
                        y: pageHeight - y - height,
                        width,
                        height,
                        color: rgb(r, g, b),
                        opacity: 0.3,
                    });
                } else if (type === 'underline') {
                    page.drawLine({
                        start: { x: x, y: pageHeight - y - (height / 2) },
                        end: { x: x + width, y: pageHeight - y - (height / 2) },
                        thickness: height,
                        color: rgb(r, g, b),
                        opacity: 1,
                    });
                }

                if (type === 'note') {
                    page.drawRectangle({
                        x: x,
                        y: pageHeight - y - height,
                        width: width,
                        height: height,
                        color: rgb(r, g, b),
                        opacity: 0.5,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 0.5,
                    });
                    if (text) {
                        page.drawText(text, {
                            x: x + width + 5,
                            y: pageHeight - y - height,
                            size: 10,
                            color: rgb(0, 0, 0),
                        });
                    }
                } else if (text && type === 'highlight') {
                    page.drawText(text, {
                        x: x,
                        y: pageHeight - y - height - 10,
                        size: 12,
                        color: rgb(0, 0, 0),
                    });
                }
            }

            const modifiedPdfBytes = await newPdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `annotated_${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Error saving annotated PDF:', error);
            console.error('Error details:', error.message, error.stack);
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
        setCurrentPage(Math.max(1, Number(event.target.value)));
    };

    const handleWheel = useCallback((event: WheelEvent) => {
        if (!pageContainerRef.current || !totalHeight || !pdfDoc) return;

        const container = pageContainerRef.current;
        const { deltaY, deltaX } = event;

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            const newScrollTop = container.scrollTop + deltaY;
            const newCurrentPageNum = Math.floor(newScrollTop / pageHeight) + 1;

            if (newCurrentPageNum !== currentPage && newCurrentPageNum >= 1 && newCurrentPageNum <= totalPages) {
                if (debouncedSetCurrentPage.current) {
                    debouncedSetCurrentPage.current(newCurrentPageNum);
                } else {
                    setCurrentPage(Math.max(1, Math.min(newCurrentPageNum, totalPages)));
                }
            }
        } else {
        }
    }, [currentPage, pageHeight, totalPages, pdfDoc]);

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
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    setTimeout(() => setIsScrolling(false), 300);
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (pageContainerRef.current) {
                    pageContainerRef.current.scrollLeft -= 100;
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (pageContainerRef.current) {
                    pageContainerRef.current.scrollLeft += 100;
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

    useEffect(() => {
        const checkPdfWorker = async () => {
            try {
                const response = await fetch(workerSrc, { method: 'HEAD' });
                if (response.ok) {
                    console.log('PDF.js worker is available at the expected path:', workerSrc);
                } else {
                    console.warn('PDF.js worker not found at expected path. Status:', response.status);
                    console.log('Attempting to use fallback worker from CDN...');
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcFallback;
                }
            } catch (error) {
                console.error('Error checking PDF.js worker availability:', error);
                console.log('Falling back to CDN worker source...');
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcFallback;
            }
        };
        checkPdfWorker();
    }, []);

    useEffect(() => {
        const debounce = (func: (pageNumber: number) => void, delay: number) => {
            let timeoutId: NodeJS.Timeout;
            return (pageNumber: number) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func(pageNumber), delay);
            };
        };

        if (totalPages > 0) {
            debouncedSetCurrentPage.current = debounce((pageNumber) => {
                setCurrentPage(prevPage => {
                    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
                    if (newPage !== prevPage) {
                        return newPage;
                    }
                    return prevPage;
                });
            }, 250);
        }
    }, [totalPages]);

    const handleSaveNote = () => {
        if (notePosition && currentNoteText.trim() !== '') {
            const newAnnotation: Annotation = {
                id: Date.now().toString() + "-note",
                type: 'note',
                page: notePosition.page,
                x: notePosition.x,
                y: notePosition.y,
                width: 20,
                height: 20,
                color: selectedColor,
                text: currentNoteText
            };
            handleAnnotationAdd(newAnnotation);
        }
        setShowNoteInputModal(false);
        setCurrentNoteText('');
        setNotePosition(null);
    };

    // Add new functions for fit-to-width, fit-to-page, and rotation
    const fitToWidth = useCallback(async () => {
        if (!pdfDoc || !pageContainerRef.current) return;

        try {
            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1, rotation });
            const containerWidth = pageContainerRef.current.clientWidth - 40; // Subtract padding
            const newScale = containerWidth / viewport.width;
            setScale(newScale);
        } catch (error) {
            console.error('Error in fitToWidth:', error);
        }
    }, [pdfDoc, currentPage, rotation]);

    const fitToPage = useCallback(async () => {
        if (!pdfDoc || !pageContainerRef.current) return;

        try {
            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1, rotation });
            const containerWidth = pageContainerRef.current.clientWidth - 40; // Subtract padding
            const containerHeight = pageContainerRef.current.clientHeight - 40;

            const widthScale = containerWidth / viewport.width;
            const heightScale = containerHeight / viewport.height;

            // Use the smaller scale to ensure the entire page fits
            const newScale = Math.min(widthScale, heightScale);
            setScale(newScale);
        } catch (error) {
            console.error('Error in fitToPage:', error);
        }
    }, [pdfDoc, currentPage, rotation]);

    const rotateLeft = () => {
        setRotation(prev => (prev - 90 + 360) % 360);
    };

    const rotateRight = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    useEffect(() => {
        // Auto fit to page on initial load or rotation change
        if (pdfDoc && totalPages > 0) {
            fitToPage();
        }
    }, [pdfDoc, totalPages, rotation, fitToPage]);

    return (
        <div className="relative h-full w-full">
            {showNoteInputModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl dark:bg-slate-700">
                        <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">Add Note</h3>
                        <textarea
                            className="w-full h-32 p-2 border rounded dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500"
                            value={currentNoteText}
                            onChange={(e) => setCurrentNoteText(e.target.value)}
                            placeholder="Enter your note..."
                        />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowNoteInputModal(false);
                                    setCurrentNoteText('');
                                    setNotePosition(null);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-slate-500 dark:hover:bg-slate-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNote}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                        <div className="py-2 px-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between">
                            {/* Left side controls */}
                            <div className="flex items-center space-x-2">
                                {/* Navigation controls */}
                                <div className="flex items-center space-x-1">
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
                                            max={totalPages}
                                            className="w-12 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-1 text-sm"
                                        />
                                        <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
                                            / {totalPages}
                                        </span>
                                    </div>

                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage >= totalPages}
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
                                <div className="flex items-center space-x-1">
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
                                </div>
                            </div>

                            {/* Right side controls */}
                            <div className="flex items-center space-x-2">
                                {/* Highlight button */}
                                <button
                                    onClick={() => {
                                        setIsHighlightMode(!isHighlightMode);
                                        setIsUnderlineMode(false);
                                        setIsDrawingMode(false);
                                        setIsNoteMode(false);
                                    }}
                                    className={`p-2 rounded flex items-center space-x-2 ${isHighlightMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                                    title="Highlight text"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M15.5 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3A.75.75 0 0112 2.25zM8.5 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM4.5 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM2.25 4.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM2.25 8.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM2.25 12.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM2.25 16.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM2.25 20.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM6.5 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM10.5 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM14.5 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM18.5 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM21.75 4.5a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM21.75 8.5a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM21.75 12.5a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM21.75 16.5a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM21.75 20.5a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75z" />
                                    </svg>
                                    <span>Highlight</span>
                                </button>

                                {isHighlightMode && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="color"
                                            value={selectedColor}
                                            onChange={(e) => setSelectedColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer"
                                            title="Select highlight color"
                                        />
                                    </div>
                                )}

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
                        </div>

                        {/* PDF content area */}
                        <div className="flex-1 overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                            <div
                                ref={pageContainerRef}
                                className="h-full overflow-auto bg-gray-200 dark:bg-gray-700 flex items-start justify-start p-4 transition-all duration-300 ease-in-out"
                                style={{
                                    WebkitOverflowScrolling: 'touch',
                                }}
                            >
                                <div
                                    className="relative shadow-lg transition-transform duration-300 ease-in-out"
                                    style={{
                                        transform: `scale(${scale})`,
                                        transformOrigin: 'top left',
                                        height: totalHeight,
                                        minWidth: '100%'
                                    }}
                                >
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <div key={pageNum} style={{ height: pageHeight }} className="relative">
                                            <canvas
                                                ref={pageNum === currentPage ? canvasRef : undefined}
                                                className="block"
                                            />
                                            <div
                                                ref={pageNum === currentPage ? textLayerRef : undefined}
                                                className="textLayer absolute top-0 left-0 right-0 bottom-0 overflow-hidden"
                                                style={{
                                                    userSelect: isHighlightMode || isUnderlineMode ? 'text' : 'none',
                                                    cursor: isHighlightMode || isUnderlineMode ? 'text' : isDrawingMode ? 'crosshair' : 'default',
                                                    pointerEvents: 'all'
                                                }}
                                                onMouseDown={isDrawingMode ? (e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const containerRect = pageContainerRef.current?.getBoundingClientRect();
                                                    if (!containerRect || !pageContainerRef.current) return;

                                                    const x = (e.clientX - containerRect.left) / scale;
                                                    const y = (e.clientY - containerRect.top) / scale;

                                                    setDrawBox({
                                                        startX: x,
                                                        startY: y,
                                                        endX: x,
                                                        endY: y,
                                                        page: currentPage
                                                    });
                                                } : undefined}
                                                onMouseMove={isDrawingMode ? (e) => {
                                                    if (!drawBox) return;
                                                    const containerRect = pageContainerRef.current?.getBoundingClientRect();
                                                    if (!containerRect || !pageContainerRef.current) return;

                                                    const x = (e.clientX - containerRect.left) / scale;
                                                    const y = (e.clientY - containerRect.top) / scale;

                                                    if (currentPage === drawBox.page) {
                                                        setDrawBox({ ...drawBox, endX: x, endY: y });
                                                    }
                                                } : undefined}
                                                onMouseUp={isDrawingMode ? (e) => {
                                                    if (!drawBox) return;
                                                    const { startX, startY, endX, endY, page } = drawBox;

                                                    handleAnnotationAdd({
                                                        id: Date.now().toString(),
                                                        type: 'rectangle',
                                                        page: page,
                                                        x: Math.min(startX, endX),
                                                        y: Math.min(startY, endY),
                                                        width: Math.abs(endX - startX),
                                                        height: Math.abs(endY - startY),
                                                        color: selectedColor
                                                    });
                                                    setDrawBox(null);
                                                } : undefined}
                                            >
                                                {isDrawingMode && drawBox && drawBox.page === currentPage && (
                                                    <div
                                                        className="absolute pointer-events-none"
                                                        style={{
                                                            left: Math.min(drawBox.startX, drawBox.endX) * scale,
                                                            top: Math.min(drawBox.startY, drawBox.endY) * scale,
                                                            width: Math.abs(drawBox.endX - drawBox.startX) * scale,
                                                            height: Math.abs(drawBox.endY - drawBox.startY) * scale,
                                                            backgroundColor: selectedColor + '40',
                                                            border: `2px solid ${selectedColor}`,
                                                            zIndex: 10
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <PDFAnnotations
                                                pdfDoc={pdfLibDoc}
                                                currentPage={pageNum}
                                                scale={scale}
                                                annotations={annotations.filter(a => a.page === pageNum)}
                                                onAnnotationRemove={handleAnnotationRemove}
                                            />
                                            {pageNum < totalPages && (
                                                <div
                                                    className="w-full h-px bg-black opacity-30"
                                                    style={{ marginTop: '1px' }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add loading spinner overlay */}
                                {isPageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 z-50">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">Loading...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Text Extract Modal */}
            {showTextExtractModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl dark:bg-slate-700 max-w-4xl w-full max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-slate-200">Extracted Text</h3>
                            <button
                                onClick={() => setShowTextExtractModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-auto flex-1 p-4 bg-gray-100 dark:bg-slate-800 rounded">
                            <pre className="whitespace-pre-wrap font-mono text-sm dark:text-slate-200">
                                {extractedTextContent || "No text extracted yet."}
                            </pre>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(extractedTextContent).then(() => {
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
                                onClick={() => setShowTextExtractModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-slate-500 dark:hover:bg-slate-400"
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

export default PDFViewer; 
