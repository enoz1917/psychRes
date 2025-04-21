"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import ParticipantForm from '@/components/ParticipantForm';
import DemographicForm from '@/components/DemographicForm';
import WordSelection from '@/components/WordSelection';
import Results from '@/components/Results';
import Questionnaire from '@/components/Questionnaire';
import { InitialInstructions, PracticeInstructions } from '@/components/Instructions';

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
  const [showInitialInstructions, setShowInitialInstructions] = useState(false);
  const [showPracticeInstructions, setShowPracticeInstructions] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);

  // Add debug logging
  useEffect(() => {
    console.log("App rendering state:", {
      isCompleted,
      showParticipantForm,
      showDemographicForm,
      showInitialInstructions,
      showPracticeInstructions,
      showQuestionnaire,
      questionnaireCompleted,
      resultsLength: results.length
    });
  }, [
    isCompleted, 
    showParticipantForm, 
    showDemographicForm, 
    showInitialInstructions, 
    showPracticeInstructions, 
    showQuestionnaire, 
    questionnaireCompleted,
    results.length
  ]);

  // Ensure scrolling to top on component transitions
  useEffect(() => {
    // Scroll to top when isCompleted becomes true
    if (isCompleted) {
      console.log("Task completed, scrolling to top");
      window.scrollTo(0, 0);
    }
  }, [isCompleted]);

  // Check if questionnaire is already completed
  useEffect(() => {
    if (questionnaireData && isCompleted) {
      // Make sure we count all questions including the new ones
      const section1Complete = questionnaireData.section1.every(val => val !== 0) && 
                              questionnaireData.section1.length === 9;
      const section2Complete = questionnaireData.section2.every(val => val !== 0) && 
                              questionnaireData.section2.length === 38;
      const section3Complete = questionnaireData.section3.every(val => val !== 0) && 
                              questionnaireData.section3.length === 15;
      const section4Complete = questionnaireData.section4.every(val => val !== 0) && 
                              questionnaireData.section4.length === 30;
      
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
    window.scrollTo(0, 0);
  };

  const handleDemographicSubmit = (data: DemographicData) => {
    setDemographicData(data);
    setShowDemographicForm(false);
    setShowInitialInstructions(true);
    window.scrollTo(0, 0);
    
    // Reset any previous task data to ensure fresh start
    resetTask();
    
    // Make sure isCompleted is false so the word selection will show
    setIsCompleted(false);
    
    // Clear any old results from localStorage to ensure fresh start
    localStorage.removeItem('results');
    localStorage.removeItem('questionnaireData');
    
    console.log("Demographic form submitted, resetting task state for fresh word selection");
  };

  const handleInitialInstructionsContinue = () => {
    setShowInitialInstructions(false);
    setShowPracticeInstructions(true);
    window.scrollTo(0, 0);
  };

  const handlePracticeInstructionsContinue = () => {
    setShowPracticeInstructions(false);
    window.scrollTo(0, 0);
    
    // Reset the task to ensure a clean state for the word selection
    resetTask();
    
    // Make sure isCompleted is false
    setIsCompleted(false);
    
    console.log("Practice instructions complete, starting word selection task");
  };

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    console.log('Questionnaire completed:', data);
    setQuestionnaireData(data);
    setQuestionnaireCompleted(true);
    setShowQuestionnaire(false);
    window.scrollTo(0, 0);
  };

  if (showParticipantForm) {
    return <ParticipantForm onSubmit={handleParticipantSubmit} />;
  }

  if (showDemographicForm) {
    return <DemographicForm onSubmit={handleDemographicSubmit} />;
  }

  if (showInitialInstructions) {
    return <InitialInstructions onContinue={handleInitialInstructionsContinue} />;
  }

  if (showPracticeInstructions) {
    return <PracticeInstructions onContinue={handlePracticeInstructionsContinue} />;
  }

  if (showQuestionnaire) {
    return <Questionnaire onSubmit={handleQuestionnaireSubmit} />;
  }

  if (isCompleted && !showQuestionnaire && !questionnaireCompleted) {
    // Skip directly to questionnaire
    console.log("Task completed, showing questionnaire");
    setShowQuestionnaire(true);
    window.scrollTo(0, 0);
  }

  if (isCompleted && questionnaireCompleted && hasValidResults) {
    return <Results />;
  }

  // Only show WordSelection if none of the forms or special screens should be shown
  if (!showParticipantForm && !showDemographicForm && !showInitialInstructions && !showPracticeInstructions) {
    console.log("Showing WordSelection component");
    return <WordSelection />;
  }
  
  // This should never be reached as one of the above conditions should always be true
  console.warn("Fallback return reached - this should not happen");
  return <WordSelection />;
}

export default AppWrapper;
