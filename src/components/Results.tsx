"use client";

import { useAppContext } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';
import { getDemographicByParticipantId } from '@/lib/db';

interface Result {
  taskType: string;
  groupIndex: number;
  selectedWords: string[];
  isTimeUp: boolean;
  participantId?: string | number | null;
}

export default function Results() {
  const { demographicData, participantData, databaseParticipantId, questionnaireData, results: contextResults } = useAppContext();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [databaseDemographicData, setDatabaseDemographicData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [noResultsError, setNoResultsError] = useState<boolean>(false);

  // Save results to database when component mounts
  useEffect(() => {
    const saveResults = async () => {
      try {
        // First try to use results from context
        if (contextResults && contextResults.length > 0) {
          setResults(contextResults);
          // Continue with database save using context results
          const resultsWithParticipantId = contextResults.map(result => ({
            ...result,
            participantId: result.participantId || databaseParticipantId
          }));
          
          // Save results to database
          await saveResultsToDatabase(resultsWithParticipantId);
          return;
        }
        
        // If no context results, try localStorage
        const storedResults = localStorage.getItem('results');
        if (!storedResults) {
          console.error('No results found in localStorage');
          setNoResultsError(true);
          return;
        }

        const parsedResults = JSON.parse(storedResults) as Result[];
        setResults(parsedResults);

        // Validate results
        if (!parsedResults.length) {
          console.error('No results found');
          setNoResultsError(true);
          return;
        }

        // Add participantId to results if missing
        const resultsWithParticipantId = parsedResults.map(result => ({
          ...result,
          participantId: result.participantId || databaseParticipantId
        }));

        // Save results to database
        await saveResultsToDatabase(resultsWithParticipantId);
      } catch (error) {
        console.error('Error saving results:', error);
        setSaveError(error instanceof Error ? error.message : 'Failed to save results. Please try again.');
      }
    };

    // Helper function to save results to database
    const saveResultsToDatabase = async (resultsToSave: Result[]) => {
      const response = await fetch('/api/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results: resultsToSave }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save results');
      }

      const data = await response.json();
      console.log('Results saved successfully:', data);
      
      // Set debug results if in debug mode
      if (debugMode) {
        setDebugResults(data);
      }
      
      // Check if there were any errors
      if (data.errorCount && data.errorCount > 0) {
        console.warn(`Some results could not be saved: ${data.errorCount} errors`);
        setSaveError(`Some results could not be saved. ${data.savedCount} results saved successfully, ${data.errorCount} errors.`);
      } else {
        console.log(`All results saved successfully: ${data.savedCount} results`);
      }
    };

    // Add a small delay to ensure results are populated
    const timeoutId = setTimeout(saveResults, 1000);
    return () => clearTimeout(timeoutId);
  }, [databaseParticipantId, debugMode, contextResults]);

  // Fetch demographic data from database if we have a valid participant ID
  useEffect(() => {
    const fetchDemographicData = async () => {
      if (databaseParticipantId && databaseParticipantId > 0) {
        try {
          setIsLoading(true);
          // Call our API endpoint to get demographic data
          const response = await fetch(`/api/demographic?participantId=${databaseParticipantId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.demographic) {
              setDatabaseDemographicData(data.demographic);
              console.log('Fetched demographic data from database:', data.demographic);
            }
          }
        } catch (error) {
          console.error('Error fetching demographic data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsOfflineMode(true);
      }
    };

    fetchDemographicData();
  }, [databaseParticipantId]);

  const handleDownload = () => {
    // Use database demographic data if available, otherwise use context data
    const finalDemographicData = databaseDemographicData || demographicData;
    
    const data = {
      participantId: databaseParticipantId,
      participantData,
      demographicData: finalDemographicData,
      results: results.map(result => ({
        taskType: result.taskType,
        groupIndex: result.groupIndex,
        selectedWords: result.selectedWords,
        isTimeUp: result.isTimeUp
      })),
      questionnaire: questionnaireData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${databaseParticipantId || 'offline'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadClicked(true);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Çalışma Tamamlandı</h2>
        
        {noResultsError && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg mb-6">
            <p className="font-medium">Uyarı: Kelime seçim sonuçları bulunamadı</p>
            <p className="text-sm">Kelime seçim aşamasını tamamlamamış olabilirsiniz veya sonuçlar kaydedilmemiş olabilir.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded"
            >
              Yeniden Başlat
            </button>
          </div>
        )}
        
        {isOfflineMode && (
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-6">
            <p className="font-medium">Çevrimdışı Mod</p>
            <p className="text-sm">Veritabanı bağlantısı olmadan çalışıyorsunuz. Tüm verileriniz sadece bu tarayıcıda saklanmaktadır.</p>
          </div>
        )}
        
        {saveError && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg mb-6">
            <p className="font-medium">Veritabanı Hatası</p>
            <p className="text-sm">{saveError}</p>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded"
            >
              {debugMode ? 'Çalışma Moduna Dön' : 'Tanılama Modunu Aç'}
            </button>
          </div>
        )}
        
        {debugMode && debugResults && (
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg mb-6 overflow-auto" style={{ maxHeight: '400px' }}>
            <p className="font-medium">Tanılama Sonuçları</p>
            <pre className="text-xs mt-2">{JSON.stringify(debugResults, null, 2)}</pre>
          </div>
        )}
        
        {isLoading ? (
          <p className="text-lg text-gray-700 text-center">
            Veriler yükleniyor...
          </p>
        ) : (
          <p className="text-lg text-gray-700">
            Katılımınız için teşekkür ederiz. Sonuçlarınızı indirmek için aşağıdaki butona tıklayabilirsiniz.
          </p>
        )}
        
        <button
          onClick={handleDownload}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={downloadClicked || isLoading}
        >
          {downloadClicked ? 'İndirildi' : 'Sonuçları İndir'}
        </button>
      </div>
    </div>
  );
} 