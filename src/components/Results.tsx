"use client";

import { useAppContext } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';

interface Result {
  taskType: string;
  groupIndex: number;
  selectedWords: string[];
  isTimeUp: boolean;
  participantId?: string | number | null;
}

export default function Results() {
  const { databaseParticipantId, results: contextResults } = useAppContext();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [debugResults, setDebugResults] = useState<Record<string, unknown> | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [noResultsError, setNoResultsError] = useState<boolean>(false);

  // Save results to database
  useEffect(() => {
    // Skip if no results or we're in testing mode
    if (!contextResults || contextResults.length === 0) {
      return;
    }

    // Helper function to save results
    const saveResults = async () => {
      try {
        // Parse the results
        let parsedResults: Result[] = [];
        
        try {
          parsedResults = contextResults;
        } catch (parseError) {
          console.error('Error parsing results from context:', parseError);
          setNoResultsError(true);
          return;
        }
        
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

        // Save results to database with retry logic
        try {
          await saveResultsWithRetry(resultsWithParticipantId);
          console.log('Results saved successfully with retry mechanism');
        } catch (error) {
          console.error('Final error saving results:', error);
          setSaveError(error instanceof Error ? error.message : 'Failed to save results. Please try again.');
        }
      } catch (error) {
        console.error('Error in saveResults function:', error);
        setSaveError(error instanceof Error ? error.message : 'Failed to save results. Please try again.');
      }
    };

    // Helper function to save results to database
    const saveResultsToDatabase = async (resultsToSave: Result[]) => {
      try {
        console.log(`Attempting to save ${resultsToSave.length} results to database...`);
        
        const response = await fetch('/api/save-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ results: resultsToSave }),
          // Add a longer timeout
          signal: AbortSignal.timeout(30000), // 30 seconds timeout
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage: string;
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`;
          } else {
            const text = await response.text();
            errorMessage = `Server error: ${response.status} ${response.statusText} - ${text.substring(0, 100)}...`;
          }
          
          console.error('Error saving results:', errorMessage);
          throw new Error(errorMessage);
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
        
        return data;
      } catch (error) {
        console.error('Error in saveResultsToDatabase:', error);
        // Throw the error to be handled by the caller
        throw error;
      }
    };

    // Function to save results with retries
    const saveResultsWithRetry = async (resultsToSave: Result[], retries = 3, delay = 1000) => {
      try {
        return await saveResultsToDatabase(resultsToSave);
      } catch (error) {
        if (retries > 0) {
          console.log(`Retrying save... (${retries} attempts left)`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry with exponential backoff
          return saveResultsWithRetry(resultsToSave, retries - 1, delay * 2);
        } else {
          console.error('All retry attempts failed');
          setSaveError(error instanceof Error ? error.message : 'Failed to save results after multiple attempts.');
          throw error;
        }
      }
    };

    // Add a small delay to ensure results are populated, then save with retry
    const timeoutId = setTimeout(async () => {
      try {
        await saveResults();
      } catch (error) {
        console.error('Failed to save results after retries:', error);
      }
    }, 1000);
    
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
          <p className="text-lg text-gray-700 text-center">
            Katılımınız için teşekkür ederiz.
          </p>
        )}
      </div>
    </div>
  );
} 