"use client";

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MainInstructions } from '@/components/Instructions';

export default function WordSelection() {
  const {
    currentWordGroup,
    selectedWords,
    addSelectedWord,
    removeSelectedWord,
    timeLeft,
    setTimeLeft,
    nextGroup,
    isTimeUp,
    setIsTimeUp,
    isPractice,
    currentGroupIndex
  } = useAppContext();

  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const nextGroupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [showMainInstructions, setShowMainInstructions] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const instructionsShownRef = useRef(false);

  useEffect(() => {
    if (practiceComplete && isPractice === false && !showMainInstructions && !instructionsShownRef.current) {
      console.log("Showing main instructions");
      instructionsShownRef.current = true;
      setShowMainInstructions(true);
    }
  }, [practiceComplete, isPractice, showMainInstructions]);

  useEffect(() => {
    console.log("Current word group changed:", currentWordGroup);

    if (currentWordGroup) {
      if (isPractice === false && !practiceComplete) {
        setPracticeComplete(true);
      }

      if (nextGroupTimerRef.current) {
        clearTimeout(nextGroupTimerRef.current);
        nextGroupTimerRef.current = null;
      }

      const words = [...currentWordGroup.words];
      console.log("Shuffling words for group:", words);

      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      setShuffledWords(words);
      setIsTransitioning(false);
      startTimeRef.current = Date.now();

      // Force reset any lingering state
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Ensure timer is running with the correct initial value
      setTimeLeft(12);
      setIsTimeUp(false);
      
      console.log("Shuffled words:", words);
    } else {
      console.warn("No current word group available");
    }
  }, [currentWordGroup, isPractice, practiceComplete, setTimeLeft, setIsTimeUp]);

  useEffect(() => {
    if (currentWordGroup && shuffledWords.length === 0) {
      console.log("Initializing with first word group:", currentWordGroup.words);
      const words = [...currentWordGroup.words];
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      setShuffledWords(words);
      startTimeRef.current = Date.now();

      setTimeLeft(12);
      setIsTimeUp(false);
      setIsTransitioning(false);

      console.log("First word group initialized with shuffled words:", words);
    }
  }, [currentWordGroup, shuffledWords.length, setTimeLeft, setIsTimeUp]);

  const isWordSelected = (word: string) => selectedWords.includes(word);

  const toggleWordSelection = (word: string) => {
    if (isTransitioning) {
      console.log("Word selection attempted during transition - ignoring");
      return;
    }

    if (isWordSelected(word)) {
      removeSelectedWord(word);
    } else if (selectedWords.length < 5) {
      if (selectedWords.length === 4) {
        const allFiveWords = [...selectedWords, word];
        console.log("5th word selected, all five words:", allFiveWords);

        setIsTransitioning(true);

        addSelectedWord(word);

        console.log("Moving to next group with all five words:", allFiveWords);
        nextGroup(allFiveWords);
      } else {
        addSelectedWord(word);
      }
    }
  };

  useEffect(() => {
    if (isTimeUp && !isTransitioning && currentWordGroup) {
      console.log("Time is up, transitioning immediately with words:", selectedWords);

      // Set transitioning state immediately to prevent multiple transitions
      setIsTransitioning(true);
      
      // IMPORTANT: Ensure the transition happens by forcing it with a direct call
      // This guarantees that even if the timeout is interrupted, the transition will occur
      console.log("Initiating force transition to next group");
      
      // Execute transition immediately and also schedule a backup
      nextGroup([...selectedWords]);
      
      // Backup transition in case the immediate call has issues
      const transitionDelay = setTimeout(() => {
        console.log("Backup transition triggered");
        // Only call if we're still on the same word group (transition didn't happen yet)
        if (isTimeUp) {
          nextGroup([...selectedWords]);
        }
      }, 1000);

      return () => {
        clearTimeout(transitionDelay);
      };
    }
  }, [isTimeUp, currentWordGroup, isTransitioning, nextGroup, selectedWords]);

  // Additional effect to force transition if we get stuck
  useEffect(() => {
    // If we're in transitioning state for too long, force the next group
    if (isTransitioning && timeLeft === 0) {
      const forceTransitionTimer = setTimeout(() => {
        console.log("Force transition timer triggered - ensuring transition completes");
        nextGroup([...selectedWords]);
      }, 2000); // 2 second backup timer
      
      return () => {
        clearTimeout(forceTransitionTimer);
      };
    }
  }, [isTransitioning, timeLeft, nextGroup, selectedWords]);

  // Improved timer effect for more consistent experience
  useEffect(() => {
    // Always clear existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Don't start the timer if instructions are showing
    if (showMainInstructions) {
      console.log("Timer paused: MainInstructions are showing");
      return;
    }

    // Don't start timer if transitioning between groups
    if (isTransitioning) {
      console.log("Timer paused: Transitioning between groups");
      return;
    }

    // Only start timer if we have a valid word group and time hasn't run out
    if (currentWordGroup && !isTimeUp && timeLeft > 0) {
      // Reset the start time whenever we start a new timer
      // This ensures accurate timing for each group
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      
      console.log(`Starting timer for ${isPractice ? "PRACTICE" : "MAIN"} task, group ${currentGroupIndex}, time left: ${timeLeft}s`);
      
      // Create a simple countdown timer that updates every 1 second
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newValue = prev - 1;
          console.log(`Timer tick: ${prev}s -> ${newValue}s (${isPractice ? "practice" : "main"})`);
          
          if (newValue <= 0) {
            console.log("Time up! Auto-transitioning to next group");
            setIsTimeUp(true);
            
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return newValue;
        });
      }, 1000);
    } else if (!currentWordGroup) {
      console.log("Timer not started: No current word group");
    } else if (isTimeUp) {
      console.log("Timer not started: Time is already up");
    } else if (timeLeft <= 0) {
      console.log("Timer not started: No time left");
    }
    
    // Cleanup function to ensure timer is always cleared
    return () => {
      console.log("Cleaning up timer effect");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentWordGroup, currentGroupIndex, isPractice, timeLeft, isTimeUp, isTransitioning, showMainInstructions]);

  useEffect(() => {
    if (selectedWords.length >= 5 && timerRef.current) {
      console.log("5 words selected, stopping timer");
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [selectedWords.length]);

  const handleMainInstructionsContinue = () => {
    console.log("Main instructions completed, showing main application");
    setShowMainInstructions(false);
    instructionsShownRef.current = true;
    
    // Reset timer and start time for main application
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset UI state for main application
    setTimeLeft(12);
    setIsTimeUp(false);
    setIsTransitioning(false);
    startTimeRef.current = Date.now();
    
    // Force re-shuffle words if current word group exists
    if (currentWordGroup) {
      console.log("Resetting shuffled words for main application:", currentWordGroup.words);
      const words = [...currentWordGroup.words];
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      setShuffledWords(words);
    } else {
      console.warn("No current word group available after main instructions");
    }
  };

  // Add a defensive transition check
  useEffect(() => {
    // If we've just reached isTimeUp, ensure the transition useEffect is triggered
    if (isTimeUp && !isTransitioning && timeLeft === 0) {
      console.log("Time up detected, ensuring transition is triggered");
      setIsTransitioning(true);
      
      const emergencyTransition = setTimeout(() => {
        if (isTimeUp && currentWordGroup) {
          console.log("Emergency transition triggered");
          nextGroup([...selectedWords]);
        }
      }, 300);
      
      return () => clearTimeout(emergencyTransition);
    }
  }, [isTimeUp, timeLeft, isTransitioning, currentWordGroup, selectedWords, nextGroup, setIsTimeUp, setTimeLeft]);

  if (showMainInstructions) {
    console.log("Rendering MainInstructions component");
    return <MainInstructions onContinue={handleMainInstructionsContinue} />;
  }

  if (!currentWordGroup) {
    console.warn("No currentWordGroup available, returning null");
    return null;
  }
  
  console.log("Rendering WordSelection UI with:", {
    isPractice,
    shuffledWordsCount: shuffledWords.length,
    selectedWordsCount: selectedWords.length,
    timeLeft,
    isTimeUp,
    isTransitioning
  });

  return (
    <div className="mt-[200px] min-h-screen bg-gray-100 px-6 py-8 sm:px-10 md:px-16">
      <div className="w-full max-w-2xl mx-auto space-y-16">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-[20px] font-bold text-center text-gray-800 mb-5">
            {isPractice ? 'Deneme Uygulaması' : 'Ana Uygulama'}
          </h2>
          <div className="flex justify-center">
            <div className="px-5 py-3 bg-blue-50 rounded-lg text-blue-700 font-medium inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Kalan Süre: {timeLeft} saniye
            </div>
          </div>
        </div>

        <div className="bg-white p-7 rounded-xl shadow-sm">
          <div className="max-w-3xl mx-auto mb-8">
            <div className="w-[700px] h-[130px] grid grid-cols-3 gap-x-10 gap-y-8 place-items-center">
              {shuffledWords.map((word, index) => (
                <div key={index} >
                  <button
                    onClick={() => toggleWordSelection(word)}
                    className={`min-w-[200px] py-6 px-4 rounded-lg text-center text-[24px] font-medium transition-all duration-200 ${isWordSelected(word)
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      } ${isTransitioning ? 'opacity-80 cursor-not-allowed' : ''}`}
                    disabled={isTransitioning || (selectedWords.length >= 5 && !isWordSelected(word))}
                  >
                    {word}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-7 rounded-xl shadow-sm my-[20px]">
          {selectedWords.length > 0 ? (
            <p className="text-gray-800 text-[18px] font-medium p-4 bg-gray-50 rounded-lg">
              {selectedWords.join(' ')}
            </p>
          ) : (
            <p className="text-gray-400 italic p-4 bg-gray-50 rounded-lg">Henüz kelime seçilmedi...</p>
          )}
        </div>

        {isTransitioning && (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              Yeni kelime grubuna geçiliyor... ({timeLeft === 0 ? "Süre bitti" : "5 kelime seçildi"})
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 