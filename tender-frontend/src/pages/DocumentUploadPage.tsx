import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { FileText, Upload, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/common';
import { filesApi, documentApi } from '../api';
import { ParsedDataReview } from '../components/profile/ParsedDataReview';
import { ParseResult } from '../types/document';

export function DocumentUploadPage() {
    const navigate = useNavigate();
    const [resume, setResume] = useState<File | null>(null);
    const [transcript, setTranscript] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'transcript') => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'resume') setResume(e.target.files[0]);
            else setTranscript(e.target.files[0]);
            setError(null);
        }
    };

    const handleContinue = async () => {
        if (!resume) return;

        setIsUploading(true);
        setError(null);

        try {
            // 1. Upload Resume
            await filesApi.uploadResume(resume);

            // 2. Upload Transcript (if present)
            if (transcript) {
                await filesApi.uploadTranscript(transcript);
            }

            // 3. Trigger Resume Parsing
            setIsUploading(false);
            setIsParsing(true);
            const result = await documentApi.parseResume();
            setParseResult(result);
            setIsParsing(false);

        } catch (err) {
            console.error(err);
            setIsUploading(false);
            setIsParsing(false);
            setError("Failed to upload or parse documents. Please try again.");
        }
    };

    const handleParseConfirmed = () => {
        // Parse applied, navigate to feed
        navigate('/feed');
    };

    const handleParseCancelled = () => {
        setParseResult(null);
        // Maybe clear file selection or just let them try again?
    };

    return (
        <AppLayout showNav={false}>
            <div className="max-w-3xl mx-auto px-6 py-12">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">Upload Your Documents</h1>
                    <p className="text-gray-600">Upload your resume and transcript. Our AI will automatically build your profile.</p>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                {parseResult ? (
                    // Review Mode
                    <div className="animate-fade-in">
                        <ParsedDataReview
                            parseResult={parseResult}
                            onConfirm={handleParseConfirmed}
                            onCancel={handleParseCancelled}
                        />
                    </div>
                ) : (
                    // Upload Mode
                    <div className="space-y-6">
                        {/* Resume Upload */}
                        <div className={`border-2 border-dashed rounded-2xl p-8 transition-colors ${resume ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${resume ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {resume ? <CheckCircle2 /> : <FileText />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">Resume <span className="text-red-500">*</span></h3>
                                    <p className="text-gray-500 text-sm mb-4">Drop your resume here or click to browse (PDF, DOC, DOCX)</p>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => handleFileChange(e, 'resume')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isUploading || isParsing}
                                        />
                                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                                            <Upload size={16} />
                                            {resume ? resume.name : 'Select File'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transcript Upload */}
                        <div className={`border-2 border-dashed rounded-2xl p-8 transition-colors ${transcript ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${transcript ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {transcript ? <CheckCircle2 /> : <FileText />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">Transcript</h3>
                                    <p className="text-gray-500 text-sm mb-4">Optional — required for scholarships & some internships</p>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => handleFileChange(e, 'transcript')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isUploading || isParsing}
                                        />
                                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                                            <Upload size={16} />
                                            {transcript ? transcript.name : 'Select File'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end">
                            <Button
                                size="lg"
                                onClick={handleContinue}
                                disabled={!resume || isUploading || isParsing}
                                className="rounded-full px-8 py-3 shadow-lg shadow-primary-500/30 min-w-[160px]"
                            >
                                {isUploading ? (
                                    <>Uploading...</>
                                ) : isParsing ? (
                                    <><Loader2 className="animate-spin mr-2" size={18} /> Parsing...</>
                                ) : (
                                    <>Continue <ArrowRight size={18} className="ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
