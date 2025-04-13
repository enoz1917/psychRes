"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  }, []);

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
  }, []);

  // Timer effect
  useEffect(() => {
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
  }, [currentWordGroup, isTimeUp]); // Keep dependencies minimal

  // Save questionnaire data to localStorage when updated
  useEffect(() => {
    if (questionnaireData) {
      localStorage.setItem('questionnaireData', JSON.stringify(questionnaireData));
      console.log('Saved questionnaire data to localStorage:', questionnaireData);
    }
  }, [questionnaireData]);

  // Load questionnaire data from localStorage on mount
  useEffect(() => {
    const storedQuestionnaireData = localStorage.getItem('questionnaireData');
    if (storedQuestionnaireData) {
      try {
        const parsedData = JSON.parse(storedQuestionnaireData);
        setQuestionnaireData(parsedData);
        console.log('Loaded questionnaire data from localStorage:', parsedData);
      } catch (error) {
        console.error('Error loading questionnaire data from localStorage:', error);
      }
    }
  }, []);

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
    if (!currentWordGroup) {
      console.warn("nextGroup called with no current word group");
      return;
    }

    console.log("NextGroup function called", {
      currentGroupIndex,
      isPractice,
      selectedWords,
      selectedWordsCount: selectedWords.length,
      finalWordsProvided: !!finalWords,
      practiceGroupsTotal: practiceGroups.length,
      mainGroupsTotal: mainGroups.length,
      currentWordGroup: currentWordGroup.words
    });

    const wordsToSave = finalWords || [...selectedWords];
    console.log("Words to save:", wordsToSave, "Count:", wordsToSave.length);

    // Ensure proper data formatting for results
    const newResult = {
      taskType: isPractice ? 'Practice' : 'Main',
      groupIndex: currentGroupIndex,
      selectedWords: wordsToSave,
      isTimeUp: isTimeUp,
      participantId: databaseParticipantId
    };

    // Validate the result before saving
    console.log("New result to add:", newResult);
    if (!newResult.taskType || newResult.groupIndex === undefined || !newResult.selectedWords) {
      console.error("Invalid result data detected before saving:", newResult);
    }

    setResults(prev => {
      const updatedResults = [...prev, newResult];
      console.log("Updated results array:", updatedResults);
      // Save to localStorage
      localStorage.setItem('results', JSON.stringify(updatedResults));
      return updatedResults;
    });

    // Calculate next state
    const nextIndex = currentGroupIndex + 1;
    const groups = isPractice ? practiceGroups : mainGroups;

    console.log(`Calculating next state: current index ${currentGroupIndex}, next index ${nextIndex}, total groups ${groups.length}`);

    // Reset states
    setSelectedWords([]);
    setTimeLeft(12);
    setIsTimeUp(false);

    // Then update group/mode
    if (nextIndex >= groups.length) {
      if (isPractice) {
        console.log(`Moving from practice (${practiceGroups.length} groups) to main task (${mainGroups.length} groups)`);
        // First save the current result before switching modes
        setIsPractice(false);
        setCurrentGroupIndex(0);

        // Force update the currentWordGroup to the first main group
        const firstMainGroup = mainGroups.length > 0 ? mainGroups[0] : null;
        setCurrentWordGroup(firstMainGroup);
        console.log('Switched to main task - first main group set to:', firstMainGroup);
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

      setCurrentWordGroup(nextGroup);
      console.log('Next group set to:', nextGroup);
    }
  };

  const resetTask = () => {
    console.log('Resetting task - setting currentGroupIndex to 0');
    setSelectedWords([]);
    setTimeLeft(12);
    setIsPractice(true);
    setCurrentGroupIndex(0);
    setIsTimeUp(false);
    setIsCompleted(false);
    setResults([]);
    setQuestionnaireData(null);
    
    // Clear results and questionnaire data from localStorage
    localStorage.removeItem('results');
    localStorage.removeItem('questionnaireData');

    // Force update the currentWordGroup to the first practice group
    const initialWordGroup = practiceGroups.length > 0 ? practiceGroups[0] : null;
    setCurrentWordGroup(initialWordGroup);
    console.log('Reset task - initial word group set to:', initialWordGroup);
  };

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