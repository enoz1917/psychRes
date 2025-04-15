"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WordGroup, practiceGroups, mainGroups } from '../data/wordGroups';

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

interface AppContextType {
  selectedWords: string[];
  addSelectedWord: (word: string) => void;
  removeSelectedWord: (word: string) => void;
  resetSelectedWords: () => void;
  timeLeft: number;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  isPractice: boolean;
  setIsPractice: (isPractice: boolean) => void;
  currentGroupIndex: number;
  currentWordGroup: WordGroup | null;
  nextGroup: (finalWords?: string[]) => void;
  resetTask: () => void;
  isTimeUp: boolean;
  setIsTimeUp: (value: boolean) => void;
  isCompleted: boolean;
  setIsCompleted: (value: boolean) => void;
  results: Array<{
    taskType: string;
    groupIndex: number;
    selectedWords: string[];
    isTimeUp: boolean;
    participantId: number | null;
  }>;
  questionnaireData: {
    section1: number[];
    section2: number[];
    section3: number[];
    section4: number[];
  } | null;
  setQuestionnaireData: (data: {
    section1: number[];
    section2: number[];
    section3: number[];
    section4: number[];
  }) => void;
  demographicData: DemographicData | null;
  setDemographicData: (data: DemographicData) => void;
  participantData: ParticipantData | null;
  setParticipantData: (data: ParticipantData) => void;
  databaseParticipantId: number | null;
  setDatabaseParticipantId: (id: number) => void;
}

interface AppProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};

export function AppProvider({ children }: AppProviderProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const [isPractice, setIsPractice] = useState<boolean>(true);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [demographicData, setDemographicData] = useState<DemographicData | null>(null);
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);
  const [databaseParticipantId, setDatabaseParticipantId] = useState<number | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<{
    section1: number[];
    section2: number[];
    section3: number[];
    section4: number[];
  } | null>(null);
  const [results, setResults] = useState<Array<{
    taskType: string;
    groupIndex: number;
    selectedWords: string[];
    isTimeUp: boolean;
    participantId: number | null;
  }>>([]);

  // Define currentWordGroup as a state to make it reactive
  const [currentWordGroup, setCurrentWordGroup] = useState<WordGroup | null>(null);

  // Initialize currentWordGroup on mount
  useEffect(() => {
    // Force currentGroupIndex to be 0 on initialization
    setCurrentGroupIndex(0);

    // Set the initial word group
    const initialWordGroup = isPractice
      ? (0 < practiceGroups.length ? practiceGroups[0] : null)
      : (0 < mainGroups.length ? mainGroups[0] : null);

    setCurrentWordGroup(initialWordGroup);
    console.log('Initial word group set:', initialWordGroup);
    console.log('Initial currentGroupIndex set to 0');

    // Reset time left and isTimeUp to ensure the timer starts correctly
    setTimeLeft(12);
    setIsTimeUp(false);

    // Load results from localStorage if they exist
    const storedResults = localStorage.getItem('results');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        console.log('Loaded results from localStorage:', parsedResults);
      } catch (error) {
        console.error('Error loading results from localStorage:', error);
      }
    }
  }, [isPractice, setTimeLeft, setIsTimeUp, setResults, setCurrentWordGroup, setCurrentGroupIndex]);

  // Update currentWordGroup whenever currentGroupIndex or isPractice changes
  useEffect(() => {
    const newWordGroup = isPractice
      ? (currentGroupIndex < practiceGroups.length ? practiceGroups[currentGroupIndex] : null)
      : (currentGroupIndex < mainGroups.length ? mainGroups[currentGroupIndex] : null);

    setCurrentWordGroup(newWordGroup);

    // Log word group information
    console.log('Current word group updated:');
    console.log(`isPractice: ${isPractice}`);
    console.log(`currentGroupIndex: ${currentGroupIndex}`);
    console.log(`New word group:`, newWordGroup);
  }, [currentGroupIndex, isPractice]);

  // Log word group information on mount
  useEffect(() => {
    console.log('AppContext initialized with:');
    console.log(`Practice groups: ${practiceGroups.length}`);
    console.log(`Main groups: ${mainGroups.length}`);
    console.log('Current settings:');
    console.log(`isPractice: ${isPractice}`);
    console.log(`currentGroupIndex: ${currentGroupIndex}`);
  }, [currentGroupIndex, isPractice]);

  // Timer is now disabled in AppContext and handled in WordSelection component
  // This prevents conflicts between multiple timers
  useEffect(() => {
    // Timer disabled - now handled in WordSelection component
    /* Original timer code:
    // Check conditions to start/stop timer
    if (!currentWordGroup || isTimeUp) return;

    // Stop timer if 5 words selected, but don't include in dependency array
    if (selectedWords.length >= 5) return;

    console.log("Starting main timer");
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);  // 1000ms (1 second) interval for the timer

    return () => {
      console.log("Clearing main timer");
      clearInterval(timer);
    };
    */
  }, [currentWordGroup, isTimeUp]); // Keep dependencies minimal

  // Save questionnaire data to localStorage when updated
  useEffect(() => {
    if (questionnaireData) {
      // Avoid constant re-saving of the same data
      const storedData = localStorage.getItem('questionnaireData');
      if (storedData) {
        try {
          const existingData = JSON.parse(storedData);
          if (JSON.stringify(existingData) === JSON.stringify(questionnaireData)) {
            // Data hasn't changed, skip saving
            return;
          }
        } catch (error) {
          // Error parsing, proceed with save
          console.error('Error comparing questionnaire data:', error);
        }
      }
      
      localStorage.setItem('questionnaireData', JSON.stringify(questionnaireData));
      console.log('Saved questionnaire data to localStorage');
    }
  }, [questionnaireData]);

  // Load questionnaire data from localStorage on mount
  useEffect(() => {
    const storedQuestionnaireData = localStorage.getItem('questionnaireData');
    if (storedQuestionnaireData) {
      try {
        const parsedData = JSON.parse(storedQuestionnaireData);
        
        // Validate the stored data to ensure it's not filled with only 1s
        // This prevents the debug test data from being used in production
        const allOnes = 
          (parsedData.section1 && parsedData.section1.every((val: number) => val === 1)) &&
          (parsedData.section2 && parsedData.section2.every((val: number) => val === 1)) &&
          (parsedData.section3 && parsedData.section3.every((val: number) => val === 1)) &&
          (parsedData.section4 && parsedData.section4.every((val: number) => val === 1));
          
        if (allOnes) {
          console.log('Found debug data in localStorage (all 1s), ignoring it');
          localStorage.removeItem('questionnaireData');
          return;
        }
        
        // Check if all sections are present
        if (parsedData.section1 && parsedData.section2 && 
            parsedData.section3 && parsedData.section4) {
          setQuestionnaireData(parsedData);
          console.log('Loaded questionnaire data from localStorage');
        } else {
          console.warn('Invalid questionnaire data structure in localStorage, ignoring it');
          localStorage.removeItem('questionnaireData');
        }
      } catch (error) {
        console.error('Error loading questionnaire data from localStorage:', error);
        localStorage.removeItem('questionnaireData');
      }
    }
  }, [setQuestionnaireData]);

  const addSelectedWord = (word: string) => {
    if (selectedWords.length < 5 && !selectedWords.includes(word)) {
      console.log("Adding word:", word, "Current count:", selectedWords.length);
      setSelectedWords(prev => {
        const newWords = [...prev, word];
        console.log("New selected words:", newWords, "New count:", newWords.length);
        return newWords;
      });
    }
  };

  const removeSelectedWord = (word: string) => {
    setSelectedWords(prev => prev.filter(w => w !== word));
  };

  const resetSelectedWords = () => {
    setSelectedWords([]);
  };

  const nextGroup = (finalWords?: string[]) => {
    console.log('nextGroup called with finalWords:', finalWords);
    
    // If finalWords is provided, save the result
    if (finalWords) {
      const newResult = {
        taskType: isPractice ? 'Practice' : 'Main',
        groupIndex: currentGroupIndex,
        selectedWords: finalWords,
        isTimeUp: isTimeUp,
        participantId: databaseParticipantId
      };
  
      console.log('Adding result:', newResult);
      
      const updatedResults = [...results, newResult];
      setResults(updatedResults);
      
      // Save results to localStorage
      localStorage.setItem('results', JSON.stringify(updatedResults));
      console.log('Saved results to localStorage');
    }
    
    // Reset selected words and timer immediately to avoid race conditions
    setSelectedWords([]);
    setTimeLeft(12);
    setIsTimeUp(false);
    
    const groups = isPractice ? practiceGroups : mainGroups;
    const nextIndex = currentGroupIndex + 1;
    
    // Check if we've reached the end of the current task type
    if (nextIndex >= groups.length) {
      if (isPractice) {
        // Switch from practice to main task
        console.log('Practice task completed, switching to main task');
        setIsPractice(false);
        setCurrentGroupIndex(0);
        
        // Force update the currentWordGroup to the first main group
        const firstMainGroup = mainGroups.length > 0 ? mainGroups[0] : null;
        setCurrentWordGroup(firstMainGroup);
        
        console.log('Switched to main task - first main group set to:', firstMainGroup);
        
        // DO NOT automatically move to the next group if we just switched to main
        // This allows the MainInstructions to show first
        return;
      } else {
        console.log("End of test reached - all groups completed");
        setIsCompleted(true);
      }
    } else {
      console.log(`Moving to next group: ${nextIndex} of ${groups.length}`);
      setCurrentGroupIndex(nextIndex);

      // Force update the currentWordGroup to the next group
      const nextGroup = isPractice
        ? (nextIndex < practiceGroups.length ? practiceGroups[nextIndex] : null)
        : (nextIndex < mainGroups.length ? mainGroups[nextIndex] : null);

      // Add a small delay to ensure state updates are processed in the correct order
      // This helps prevent race conditions with isTimeUp and other state changes
      setTimeout(() => {
        setCurrentWordGroup(nextGroup);
        console.log('Next group set to:', nextGroup);
      }, 50);
    }
  };

  const resetTask = useCallback(() => {
    console.log("Resetting task - clearing selections and setting up practice");
    setSelectedWords([]);
    setCurrentGroupIndex(0);
    setIsTimeUp(false);
    console.log("Resetting timeLeft to", 12);
    setTimeLeft(12); // Reset the timer
    setIsPractice(true); // Start with practice
    setCurrentWordGroup(practiceGroups[0]);
    console.log("New state: isPractice=true, groupIndex=0");
  }, []);

  const value = {
    selectedWords,
    addSelectedWord,
    removeSelectedWord,
    resetSelectedWords,
    timeLeft,
    setTimeLeft,
    isPractice,
    setIsPractice,
    currentGroupIndex,
    currentWordGroup,
    nextGroup,
    resetTask,
    isTimeUp,
    setIsTimeUp,
    isCompleted,
    setIsCompleted,
    results,
    questionnaireData,
    setQuestionnaireData,
    demographicData,
    setDemographicData,
    participantData,
    setParticipantData,
    databaseParticipantId,
    setDatabaseParticipantId,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
} 