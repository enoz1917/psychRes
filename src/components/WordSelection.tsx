"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';

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
    isPractice
  } = useAppContext();

  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const nextGroupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Shuffle words when a new word group is loaded
  useEffect(() => {
    console.log("Current word group changed:", currentWordGroup);

    if (currentWordGroup) {
      // Clear any pending next group timers
      if (nextGroupTimerRef.current) {
        clearTimeout(nextGroupTimerRef.current);
        nextGroupTimerRef.current = null;
      }

      // Create a copy and shuffle the words
      const words = [...currentWordGroup.words];
      console.log("Shuffling words for group:", words);

      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      setShuffledWords(words);
      setIsTransitioning(false); // Reset transitioning state on new group
      startTimeRef.current = Date.now(); // Reset start time for the new group

      // Log the shuffled words for debugging
      console.log("Shuffled words:", words);
    } else {
      console.warn("No current word group available");
    }
  }, [currentWordGroup]);

  // Initialize the component with the first word group
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

      // Reset time left to ensure the timer starts correctly
      setTimeLeft(12);
      setIsTimeUp(false);
      setIsTransitioning(false);

      console.log("First word group initialized with shuffled words:", words);
    }
  }, [currentWordGroup, shuffledWords.length, setTimeLeft, setIsTimeUp]);

  const isWordSelected = (word: string) => selectedWords.includes(word);

  const toggleWordSelection = (word: string) => {
    // Prevent toggling if we're in the transition period
    if (isTransitioning) {
      console.log("Word selection attempted during transition - ignoring");
      return;
    }

    if (isWordSelected(word)) {
      removeSelectedWord(word);
    } else if (selectedWords.length < 5) {
      // This is crucial - if this is the 5th word, we need to handle it specially
      if (selectedWords.length === 4) {
        // This is the 5th word - we need to create the complete list
        const allFiveWords = [...selectedWords, word];
        console.log("5th word selected, all five words:", allFiveWords);

        // Update the UI to show the selection
        setIsTransitioning(true);

        // Add the 5th word to context for UI display
        addSelectedWord(word);

        // Directly pass all 5 words to nextGroup
        console.log("Moving to next group with all five words:", allFiveWords);
        nextGroup(allFiveWords);
      } else {
        // Not the 5th word, just add it normally
        addSelectedWord(word);
      }
    }
  };

  // Handle time-up transition separately
  useEffect(() => {
    if (isTimeUp && !isTransitioning && currentWordGroup) {
      console.log("Time is up, transitioning immediately with words:", selectedWords);

      // Add a small delay before transitioning to ensure the UI updates
      const transitionDelay = setTimeout(() => {
        setIsTransitioning(true);
        // Pass the current selectedWords directly to ensure they're all captured
        nextGroup([...selectedWords]);
      }, 1000); // 1 second delay before transitioning to next group

      return () => {
        clearTimeout(transitionDelay);
      };
    }
  }, [isTimeUp, currentWordGroup, isTransitioning, nextGroup, selectedWords]);

  // Set up an independent timer that uses timestamps for accurate timing
  useEffect(() => {
    // Clear any existing timer when the component unmounts or when changing groups
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only start the timer if we have a word group and time hasn't run out
    if (currentWordGroup && !isTimeUp && timeLeft > 0) {
      // Initialize start time if not set
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      console.log("Starting WordSelection timer");
      // Add a small delay before starting the timer to ensure the UI is ready
      const timerStartDelay = setTimeout(() => {
        timerRef.current = setInterval(() => {
          // Only update if we still have a valid timer reference
          if (!timerRef.current) return;

          const now = Date.now();
          const elapsedMs = now - startTimeRef.current!;
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          const newTimeLeft = Math.max(12 - elapsedSeconds, 0);

          // Only update if the time has actually changed
          if (newTimeLeft !== timeLeft) {
            setTimeLeft(newTimeLeft);

            // Check for time up condition
            if (newTimeLeft === 0) {
              setIsTimeUp(true);
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }
          }
        }, 250); // Update every 250ms for smooth countdown
      }, 100); // 100ms delay before starting the timer

      return () => {
        console.log("Clearing WordSelection timer");
        clearTimeout(timerStartDelay);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentWordGroup, isTimeUp, timeLeft, setTimeLeft]);

  // Stop the timer when 5 words are selected
  useEffect(() => {
    if (selectedWords.length >= 5 && timerRef.current) {
      console.log("5 words selected, stopping timer");
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [selectedWords.length]);

  if (!currentWordGroup) return null;

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-100 px-6 py-8 sm:px-10 md:px-16">
      <div className="w-full max-w-2xl mx-auto space-y-16">
        {/* Header with task type and timer */}
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

        {/* Word selection buttons */}
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

          {/* Word selection progress indicator */}

        </div>

        {/* Selected sentence display */}
        <div className="bg-white p-7 rounded-xl shadow-sm my-[20px]">

          {selectedWords.length > 0 ? (
            <p className="text-gray-800 text-[18px] font-medium p-4 bg-gray-50 rounded-lg">
              {selectedWords.join(' ')}
            </p>
          ) : (
            <p className="text-gray-400 italic p-4 bg-gray-50 rounded-lg">Henüz kelime seçilmedi...</p>
          )}
        </div>

        {/* Next group message and button */}
        {isTransitioning && (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              Yeni kelime grubuna geçiliyor... ({timeLeft === 0 ? "Süre bitti" : "5 kelime seçildi"})
            </div>

            <button
              onClick={() => {
                console.log("Manual transition triggered with words:", selectedWords);
                nextGroup([...selectedWords]);
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Manuel Geçiş
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 