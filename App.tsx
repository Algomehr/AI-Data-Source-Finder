import React, { useState, useCallback } from 'react';
import type { DataSource } from './types';
import { findDataSources } from './services/geminiService';
import { Loader } from './components/Loader';
import { DataSourceCard } from './components/DataSourceCard';
import { useLocale, TranslationKey } from './context/LocaleContext';

const App: React.FC = () => {
  const { locale, setLocale, t } = useLocale();
  const [projectDescription, setProjectDescription] = useState('');
  const [dataSources, setDataSources] = useState<DataSource[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);

  const handleToggleLanguage = () => {
    setLocale(locale === 'en' ? 'fa' : 'en');
  };

  const handleSearch = useCallback(async () => {
    if (!projectDescription.trim()) {
      setErrorKey('errorPrompt');
      return;
    }
    setIsLoading(true);
    setErrorKey(null);
    setDataSources(null);
    try {
      const sources = await findDataSources(projectDescription);
      setDataSources(sources);
    } catch (err) {
      setErrorKey('errorAI');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectDescription]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-8">
      <main className="max-w-4xl mx-auto">
        <nav className="flex justify-end mb-4">
            <button
            onClick={handleToggleLanguage}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold py-2 px-4 rounded-md transition-colors"
            >
            {t('toggleLanguage')}
            </button>
        </nav>

        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">
            {t('appTitle')}
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            {t('appDescription')}
          </p>
        </header>

        <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <label htmlFor="project-description" className="text-lg font-semibold text-slate-300">
              {t('projectDescriptionLabel')}
            </label>
            <textarea
              id="project-description"
              rows={5}
              className="w-full p-4 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-slate-500 text-start"
              placeholder={t('projectDescriptionPlaceholder')}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            ></textarea>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full sm:w-auto self-end bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader size="sm" />
                  <span className="ms-2">{t('searchingButton')}</span>
                </>
              ) : (
                t('findDataSourcesButton')
              )}
            </button>
          </div>
        </section>

        {errorKey && (
          <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {t(errorKey)}
          </div>
        )}

        {dataSources && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-300">
              {t('suggestedDataSources')}
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {dataSources.map((source) => (
                <DataSourceCard key={source.name} source={source} projectDescription={projectDescription} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
