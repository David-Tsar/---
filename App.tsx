import React, { useState } from 'react';
import { SearchParams, SearchResult, LoadingState } from './types';
import { findBuyers } from './services/geminiService';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import { TrendingUp, ShieldCheck, Users, PlusCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentParams, setCurrentParams] = useState<SearchParams | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setLoadingState(LoadingState.LOADING);
    setError(null);
    setResults([]); // Clear previous results on new search
    setCurrentParams(params);

    try {
      const data = await findBuyers(params.product, params.region);
      setResults([data]);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Произошла ошибка при поиске.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleLoadMore = async () => {
    if (!currentParams) return;
    
    setLoadingState(LoadingState.LOADING);
    const context = results.map(r => r.text).join(" ");
    
    try {
      const data = await findBuyers(currentParams.product, currentParams.region, context);
      setResults(prev => [...prev, data]);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      // Don't clear results on load more error, just show error
      setError(err.message || "Не удалось загрузить больше объявлений.");
      setLoadingState(LoadingState.ERROR); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Помощник Продавца
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-green-600"/> Проверенные источники</span>
            <span className="flex items-center"><Users className="w-4 h-4 mr-1 text-blue-600"/> B2B & B2C</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center space-y-10">
          
          {/* Form Section - Hide if results exist to save space, or keep to refine? Let's keep it but make it smaller? No, standard is fine. */}
          <SearchForm 
            onSearch={handleSearch} 
            isLoading={loadingState === LoadingState.LOADING && results.length === 0} 
          />

          {/* Error Message */}
          {loadingState === LoadingState.ERROR && error && (
            <div className="w-full max-w-2xl bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm animate-in fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="w-full max-w-4xl space-y-8">
            {results.map((res, index) => (
               <ResultsDisplay key={index} data={res} />
            ))}
          </div>

          {/* Load More Button */}
          {results.length > 0 && (
            <div className="pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingState === LoadingState.LOADING}
                className="flex items-center px-6 py-3 bg-white border border-indigo-200 text-indigo-700 font-semibold rounded-full shadow-sm hover:bg-indigo-50 hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingState === LoadingState.LOADING ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Поиск дополнительных объявлений...
                  </>
                ) : (
                  <>
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                    Найти ещё объявления
                  </>
                )}
              </button>
            </div>
          )}

          {/* Initial/Idle State Instructions */}
          {loadingState === LoadingState.IDLE && results.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Глобальный поиск</h3>
                <p className="text-sm text-gray-500">Мы сканируем доски объявлений, форумы и бизнес-площадки.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Целевые покупатели</h3>
                <p className="text-sm text-gray-500">Фильтрация "продам" от "куплю", чтобы вы не тратили время.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Прямые ссылки</h3>
                <p className="text-sm text-gray-500">Мгновенный переход к оригинальным объявлениям.</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Помощник Продавца. Powered by Gemini API.
        </div>
      </footer>
    </div>
  );
};

// Helper components for icons to keep file count low if not reused, 
// but we imported them from lucide-react, so this is just for the placeholder content above.
import { Search, ExternalLink } from 'lucide-react';

export default App;