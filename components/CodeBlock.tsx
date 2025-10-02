import React, { useState } from 'react';
import { useLocale, TranslationKey } from '../context/LocaleContext';

interface CodeBlockProps {
  code: string;
  language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const { t } = useLocale();
  const [copyTextKey, setCopyTextKey] = useState<TranslationKey>('copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyTextKey('copied');
      setTimeout(() => setCopyTextKey('copy'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyTextKey('copyError');
      setTimeout(() => setCopyTextKey('copy'), 2000);
    });
  };

  return (
    <div className="bg-slate-950 rounded-lg my-4 relative text-start" dir="ltr">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 rounded-t-lg">
        <span className="text-sm font-semibold text-slate-400">{language}</span>
        <button
          onClick={handleCopy}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold py-1 px-3 rounded-md transition-colors"
        >
          {t(copyTextKey)}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};
