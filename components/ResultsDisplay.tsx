import React from 'react';
import { ExternalLink, Info, AlertCircle, FileText, Link as LinkIcon } from 'lucide-react';
import { SearchResult } from '../types';

interface ResultsDisplayProps {
  data: SearchResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  // Simple function to convert plain text with Markdown-like features to React elements
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold handling: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      const formattedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Headers (simple check for lines starting with # or caps with colon)
      if (line.trim().startsWith('##') || line.trim().startsWith('###')) {
         return <h3 key={index} className="text-lg font-bold text-indigo-900 mt-5 mb-2 border-b border-indigo-50 pb-1">{formattedLine}</h3>
      }
      
      // List items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={index} className="flex items-start mb-2 ml-2">
            <span className="text-indigo-500 mr-2 mt-1.5 min-w-[6px]">•</span>
            <span className="text-gray-700 leading-relaxed">{formattedLine}</span>
          </div>
        );
      }
      
      // Numbered lists
      if (/^\d+\./.test(line.trim())) {
         return (
          <div key={index} className="flex items-start mb-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-indigo-600 font-bold mr-3 mt-0.5 min-w-[1.5rem]">{line.trim().split('.')[0]}.</span>
            <span className="text-gray-700 leading-relaxed w-full">{line.trim().substring(line.trim().indexOf('.') + 1)}</span>
          </div>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2"></div>;
      }

      return <p key={index} className="text-gray-700 mb-1 leading-relaxed">{formattedLine}</p>;
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="font-semibold text-indigo-900">Результаты поиска</h3>
        </div>
        <div className="text-xs text-indigo-400 font-mono">AI GENERATED</div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Main Content */}
        <div className="p-6 md:p-8 flex-1">
          <div className="prose prose-indigo max-w-none text-sm md:text-base">
            {formatText(data.text)}
          </div>
          
          <div className="mt-8 flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="ml-3 text-xs md:text-sm text-yellow-800">
              Результаты сгенерированы ИИ. Проверяйте актуальность даты и контактов на сайте-источнике.
            </p>
          </div>
        </div>

        {/* Sidebar / Bottom section for Sources */}
        {data.sources && data.sources.length > 0 && (
          <div className="bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 md:w-80 flex-shrink-0 p-4">
            <div className="flex items-center mb-4 text-gray-700">
              <LinkIcon className="h-4 w-4 mr-2" />
              <h4 className="font-semibold text-sm uppercase tracking-wider">Ссылки на источники</h4>
            </div>
            <div className="space-y-3">
              {data.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group relative"
                >
                  <div className="flex items-start justify-between">
                     <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mr-2 mb-1">
                        {idx + 1}
                     </span>
                     <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-indigo-500" />
                  </div>
                  <p className="text-sm font-medium text-indigo-600 group-hover:text-indigo-800 line-clamp-2 leading-snug mb-1">
                    {source.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate font-mono">
                    {new URL(source.uri).hostname}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;