
import React, { useState } from 'react';
import { generateScrapingCode } from '../services/geminiService';
import { Loader } from './Loader';
import { CodeBlock } from './CodeBlock';
import { useLocale, TranslationKey } from '../context/LocaleContext';

export const WebScraper: React.FC = () => {
    const { t } = useLocale();
    const [url, setUrl] = useState('');
    const [dataDescription, setDataDescription] = useState('');
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);

    const handleGenerate = async () => {
        if (!url.trim() || !dataDescription.trim()) {
            setErrorKey('errorScrapingPrompt');
            return;
        }
        setIsGenerating(true);
        setErrorKey(null);
        setGeneratedCode(null);
        try {
            const code = await generateScrapingCode(url, dataDescription);
            setGeneratedCode(code);
        } catch (err) {
            setErrorKey('errorCodeGeneration'); 
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-300">
                {t('webScraperTitle')}
            </h2>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-2xl backdrop-blur-sm">
                <p className="mt-1 mb-6 text-slate-400">{t('webScraperDescription')}</p>
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="scrape-url" className="text-lg font-semibold text-slate-300 mb-2 block">{t('webScraperUrlLabel')}</label>
                        <input
                            id="scrape-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={t('webScraperUrlPlaceholder')}
                            className="w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-slate-500"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label htmlFor="scrape-desc" className="text-lg font-semibold text-slate-300 mb-2 block">{t('webScraperDataLabel')}</label>
                        <textarea
                            id="scrape-desc"
                            rows={3}
                            value={dataDescription}
                            onChange={(e) => setDataDescription(e.target.value)}
                            placeholder={t('webScraperDataPlaceholder')}
                            className="w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-slate-500"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full sm:w-auto self-end bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center"
                    >
                        {isGenerating ? (
                            <>
                                <Loader size="sm" />
                                <span className="ms-2">{t('generatingCodeButton')}</span>
                            </>
                        ) : (
                            t('generateScrapingCodeButton')
                        )}
                    </button>
                </div>

                {errorKey && (
                    <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                        {t(errorKey)}
                    </div>
                )}
                {generatedCode && (
                    <div className="mt-6">
                        <CodeBlock code={generatedCode} language="Python" />
                    </div>
                )}
            </div>
        </section>
    );
};
