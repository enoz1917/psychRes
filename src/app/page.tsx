"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import ParticipantForm from '@/components/ParticipantForm';
import DemographicForm from '@/components/DemographicForm';
import WordSelection from '@/components/WordSelection';
import Results from '@/components/Results';
import Questionnaire from '@/components/Questionnaire';

interface DemographicData {
  gender: string;
  age: string;
  education: string;
  year: string;
  maritalStatus: string;
  employmentStatus: string;
  livingWith: string[];
  longestResidence: string;
  currentSocialStatus: string;
  childhoodSocialStatus: string;
  monthlyIncome: string;
}

interface ParticipantData {
  school: string;
  studentNumber: string;
  course: string;
  department: string;
}

interface QuestionnaireData {
  section1: number[];
  section2: number[];
  section3: number[];
  section4: number[];
}

function AppWrapper() {
  return (
    <div className="min-h-screen bg-gray-100">
      <App />
    </div>
  );
}

function App() {
  const { 
    isCompleted, 
    setDemographicData, 
    setParticipantData, 
    setDatabaseParticipantId,
    results,
    questionnaireData,
    setQuestionnaireData,
    resetTask,
    setIsCompleted
  } = useAppContext();
  
  const [showParticipantForm, setShowParticipantForm] = useState(true);
  const [showDemographicForm, setShowDemographicForm] = useState(false);
  const [showInstructions2, setShowInstructions2] = useState(false);
  const [showInstructions3, setShowInstructions3] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);

  // Add debug logging
  useEffect(() => {
    console.log("App rendering state:", {
      isCompleted,
      showParticipantForm,
      showDemographicForm,
      showInstructions2,
      showInstructions3,
      showQuestionnaire,
      questionnaireCompleted,
      resultsLength: results.length
    });
  }, [
    isCompleted, 
    showParticipantForm, 
    showDemographicForm, 
    showInstructions2, 
    showInstructions3, 
    showQuestionnaire, 
    questionnaireCompleted,
    results.length
  ]);

  // Check if questionnaire is already completed
  useEffect(() => {
    if (questionnaireData && isCompleted) {
      const section1Complete = questionnaireData.section1.every(val => val !== 0);
      const section2Complete = questionnaireData.section2.every(val => val !== 0);
      const section3Complete = questionnaireData.section3.every(val => val !== 0);
      const section4Complete = questionnaireData.section4.every(val => val !== 0);
      
      if (section1Complete && section2Complete && section3Complete && section4Complete) {
        setQuestionnaireCompleted(true);
      }
    }
  }, [questionnaireData, isCompleted]);

  // Log results when the task is completed
  useEffect(() => {
    if (isCompleted) {
      console.log('Task completed, all results:', JSON.stringify(results, null, 2));
      
      // Validate each result to check for potential issues
      results.forEach((result, index) => {
        console.log(`Validating result ${index}:`, {
          hasTaskType: !!result.taskType,
          taskTypeValue: result.taskType,
          hasGroupIndex: result.groupIndex !== undefined,
          groupIndexValue: result.groupIndex,
          hasSelectedWords: !!result.selectedWords,
          selectedWordsLength: result.selectedWords ? result.selectedWords.length : 0,
          isTimeUp: result.isTimeUp
        });
      });
    }
  }, [isCompleted, results]);

  // Make sure Results component isn't shown prematurely when no results exist
  const hasValidResults = results.length > 0;

  const handleParticipantSubmit = (data: ParticipantData, participantId: number) => {
    setParticipantData(data);
    setDatabaseParticipantId(participantId);
    setShowParticipantForm(false);
    setShowDemographicForm(true);
  };

  const handleDemographicSubmit = (data: DemographicData) => {
    setDemographicData(data);
    setShowDemographicForm(false);
    setShowInstructions2(true);
    
    // Reset any previous task data to ensure fresh start
    resetTask();
    
    // Make sure isCompleted is false so the word selection will show
    setIsCompleted(false);
    
    // Clear any old results from localStorage to ensure fresh start
    localStorage.removeItem('results');
    localStorage.removeItem('questionnaireData');
    
    console.log("Demographic form submitted, resetting task state for fresh word selection");
  };

  const handleInstructions2Continue = () => {
    setShowInstructions2(false);
    setShowInstructions3(true);
  };

  const handleInstructions3Continue = () => {
    setShowInstructions3(false);
    
    // Reset the task to ensure a clean state for the word selection
    resetTask();
    
    // Make sure isCompleted is false
    setIsCompleted(false);
    
    console.log("Instructions 3 complete, starting word selection task");
  };

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    console.log('Questionnaire completed:', data);
    setQuestionnaireData(data);
    setQuestionnaireCompleted(true);
    setShowQuestionnaire(false);
  };

  if (showParticipantForm) {
    return <ParticipantForm onSubmit={handleParticipantSubmit} />;
  }

  if (showDemographicForm) {
    return <DemographicForm onSubmit={handleDemographicSubmit} />;
  }

  if (showInstructions2) {
    return (
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Yönerge</h2>
          <p className="text-lg text-gray-700">
            Bu çalışmada size bazı kelimeler gösterilecektir. Sizden istenen, bu kelimelerden anlamlı bir cümle oluşturmanızdır.
          </p>
          <p className="text-lg text-gray-700">
            Her bir kelime grubu için 13 saniye süreniz olacaktır. Bu süre içinde kelimeleri seçerek anlamlı bir cümle oluşturmaya çalışın.
          </p>
          <p className="text-lg text-gray-700">
            Süre dolmadan da &quot;Devam Et&quot; butonuna basarak bir sonraki kelime grubuna geçebilirsiniz.
          </p>
          <button
            onClick={handleInstructions2Continue}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Devam Et
          </button>
        </div>
      </div>
    );
  }

  if (showInstructions3) {
    return (
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Örnek</h2>
          <p className="text-lg text-gray-700">
            Örneğin, aşağıdaki kelimelerle karşılaştığınızda:
          </p>
          <div className="flex flex-wrap gap-2 my-4">
            {['kitap', 'okudum', 'ben', 'bir'].map((word) => (
              <span
                key={word}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-lg"
              >
                {word}
              </span>
            ))}
          </div>
          <p className="text-lg text-gray-700">
            &quot;Ben bir kitap okudum&quot; şeklinde anlamlı bir cümle oluşturabilirsiniz.
          </p>
          <p className="text-lg text-gray-700">
            Kelimeleri istediğiniz sırada seçebilirsiniz. Seçtiğiniz kelimeler otomatik olarak cümle haline getirilecektir.
          </p>
          <button
            onClick={handleInstructions3Continue}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Başla
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted && !showQuestionnaire && !questionnaireCompleted) {
    // Show a transition screen before the questionnaire
    console.log("Showing transition to questionnaire screen");
    return (
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Tebrikler!</h2>
          <p className="text-lg text-gray-700">
            Kelime seçim uygulamasını tamamladınız. Şimdi sizden bir anket doldurmanızı rica ediyoruz.
          </p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ankete Başla
          </button>
        </div>
      </div>
    );
  }

  if (showQuestionnaire) {
    return <Questionnaire onSubmit={handleQuestionnaireSubmit} />;
  }

  if (isCompleted && questionnaireCompleted && hasValidResults) {
    return <Results />;
  }

  // Only show WordSelection if none of the forms or special screens should be shown
  if (!showParticipantForm && !showDemographicForm && !showInstructions2 && !showInstructions3) {
    console.log("Showing WordSelection component");
    return <WordSelection />;
  }
  
  // This should never be reached as one of the above conditions should always be true
  console.warn("Fallback return reached - this should not happen");
  return <WordSelection />;
}

export default AppWrapper;
