import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for Vite
// Note: We use the standard worker script from the package
// If this fails in production, copy the worker to public/
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Simple regex patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

// Likely name candidates (lines with 2-3 words, distinct casing)
// This is very heuristic
const extractName = (textLines) => {
    // Try first few non-empty lines
    for (let i = 0; i < Math.min(textLines.length, 10); i++) {
        const line = textLines[i].trim();
        if (!line) continue;
        // Check if line looks like a name (2-4 words, no numbers, title case)
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
            const hasNumber = /\d/.test(line);
            if (!hasNumber) return line;
        }
    }
    return '';
};

export default function useResumeParser() {
    const [parsing, setParsing] = useState(false);
    const [parseError, setParseError] = useState(null);

    const parseFile = useCallback(async (file) => {
        setParsing(true);
        setParseError(null);

        try {
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let fullText = '';

                // Extract text from first 2 pages (sufficient for contact info)
                const maxPages = Math.min(pdf.numPages, 2);
                for (let i = 1; i <= maxPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item) => item.str).join(' ');
                    fullText += pageText + '\n';
                }

                const lines = fullText.split('\n');

                const emailMatch = fullText.match(EMAIL_REGEX);
                const phoneMatch = fullText.match(PHONE_REGEX);
                const name = extractName(lines);

                return {
                    name: name || '',
                    email: emailMatch ? emailMatch[0] : '',
                    phone: phoneMatch ? phoneMatch[0] : '',
                    text: fullText.substring(0, 1000) // snippet
                };
            } else {
                // Fallback for non-PDF (doc/docx - tough in browser without mammoth.js)
                // Just return empty for now or simulate
                return { name: '', email: '', phone: '', text: '' };
            }
        } catch (err) {
            console.error('Parsing error:', err);
            setParseError('Could not auto-parse document. Please fill details manually.');
            return null;
        } finally {
            setParsing(false);
        }
    }, []);

    return { parseFile, parsing, parseError };
}
