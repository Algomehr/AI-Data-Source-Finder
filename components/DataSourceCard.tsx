
import React, { useState } from 'react';
import type { DataSource, DataSourceDetails } from '../types';
import { generateCodeForSource, getDataSourceDetails, getFollowUpAnswer } from '../services/geminiService';
import { Loader } from './Loader';
import { CodeBlock } from './CodeBlock';
import { useLocale, TranslationKey } from '../context/LocaleContext';


interface DataSourceCardProps {
  source: DataSource;
  projectDescription: string;
}

const LANGUAGES = ['Python', 'JavaScript', 'R'];

export const DataSourceCard: React.FC<DataSourceCardProps> = ({ source, projectDescription }) => {
  const { t } = useLocale();

  // State for Code Generation
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeErrorKey, setCodeErrorKey] = useState<TranslationKey | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('Python');

  // State for Details Section
  const [details, setDetails] = useState<DataSourceDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsErrorKey, setDetailsErrorKey] = useState<TranslationKey | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // State for Follow-up Section
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<{q: string, a: string}[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [followUpErrorKey, setFollowUpErrorKey] = useState<TranslationKey | null>(null);


  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    setCodeErrorKey(null);
    setGeneratedCode(null);
    try {
      const code = await generateCodeForSource(source, projectDescription, selectedLanguage);
      setGeneratedCode(code);
    } catch (err) {
      setCodeErrorKey('errorCodeGeneration');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleToggleDetails = async () => {
    const isOpening = !showDetails;
    setShowDetails(isOpening);
    
    // Fetch details only the first time it's opened
    if (isOpening && !details) {
      setIsLoadingDetails(true);
      setDetailsErrorKey(null);
      try {
        const fetchedDetails = await getDataSourceDetails(source);
        setDetails(fetchedDetails);
      } catch (err) {
        setDetailsErrorKey('errorDetails');
        setShowDetails(false); // Close on error
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim()) return;

    setIsAsking(true);
    setFollowUpErrorKey(null);
    try {
      const response = await getFollowUpAnswer(source, followUpQuestion);
      setFollowUpHistory([...followUpHistory, { q: followUpQuestion, a: response.answer }]);
      setFollowUpQuestion('');
    } catch (err) {
      setFollowUpErrorKey('errorFollowUp');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg backdrop-blur-sm transition-all hover:border-slate-600">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-cyan-300">{source.name}</h3>
          <p className="mt-2 text-slate-400">{source.description}</p>
        </div>
        <button
          onClick={handleToggleDetails}
          className="ml-4 flex-shrink-0 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-300 font-bold py-2 px-4 rounded-lg transition-all text-sm"
          aria-expanded={showDetails}
        >
          {isLoadingDetails ? <Loader size="sm" /> : (showDetails ? t('hideDetailsButton') : t('getDetailsButton'))}
        </button>
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mt-4 pt-4 border-t border-slate-700">
          {detailsErrorKey && <p className="text-red-400 text-sm mb-4">{t(detailsErrorKey)}</p>}
          {details && (
            <div className="space-y-3 text-sm mb-6">
              <div>
                <strong className="font-semibold text-slate-300 block mb-1">{t('dataFormatsLabel')}:</strong>
                <div className="flex flex-wrap gap-2">
                  {details.dataFormats.map(format => (
                    <span key={format} className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">{format}</span>
                  ))}
                </div>
              </div>
              <div>
                <strong className="font-semibold text-slate-300 block mb-1">{t('updateFrequencyLabel')}:</strong>
                <p className="text-slate-400">{details.updateFrequency}</p>
              </div>
              <div>
                <strong className="font-semibold text-slate-300 block mb-1">{t('usageRestrictionsLabel')}:</strong>
                <p className="text-slate-400">{details.usageRestrictions}</p>
              </div>
              {details.documentationUrl && (
                <div>
                  <strong className="font-semibold text-slate-300 block mb-1">{t('documentationLabel')}:</strong>
                  <a href={details.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
                    {details.documentationUrl}
                  </a>
                </div>
              )}
               {/* Follow-up Section */}
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                {followUpHistory.map((item, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold text-slate-300">Q: {item.q}</p>
                    <p className="text-slate-400 mt-1">A: {item.a}</p>
                  </div>
                ))}
                <form onSubmit={handleFollowUp}>
                  <label htmlFor={`follow-up-${source.name}`} className="font-semibold text-slate-300 text-sm mb-2 block">{t('followUpPrompt')}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id={`follow-up-${source.name}`}
                      value={followUpQuestion}
                      onChange={e => setFollowUpQuestion(e.target.value)}
                      placeholder={t('followUpPlaceholder')}
                      className="flex-grow bg-slate-900/70 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    />
                    <button type="submit" disabled={isAsking} className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg px-4 flex items-center justify-center disabled:bg-slate-600">
                      {isAsking ? <Loader size="sm"/> : t('askButton')}
                    </button>
                  </div>
                   {followUpErrorKey && <p className="mt-2 text-red-400 text-xs">{t(followUpErrorKey)}</p>}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="mt-4 border-t border-slate-700 pt-4 flex flex-wrap items-center gap-4">
        <p className="mt-1 text-sm">
          <span className="font-semibold text-slate-300">{t('accessMethod')}</span>
          <span className="bg-slate-700 text-slate-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded ms-2">
            {source.accessMethod}
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex-grow">
          <label htmlFor={`lang-select-${source.name}`} className="sr-only">
            {t('programmingLanguage')}
          </label>
          <select
            id={`lang-select-${source.name}`}
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerateCode}
          disabled={isGeneratingCode}
          className="flex-grow sm:flex-grow-0 w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all flex items-center justify-center"
        >
          {isGeneratingCode ? (
            <>
              <Loader size="sm" />
              <span className="ms-2">{t('generatingCodeButton')}</span>
            </>
          ) : (
            t('generateCodeButton')
          )}
        </button>
      </div>
      
      {codeErrorKey && <p className="mt-4 text-red-400 text-sm">{t(codeErrorKey)}</p>}
      {generatedCode && <CodeBlock code={generatedCode} language={selectedLanguage} />}
    </div>
  );
};
