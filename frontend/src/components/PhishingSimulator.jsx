// frontend/src/components/PhishingSimulator.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const PhishingSimulator = () => {
  const [phishingExamples, setPhishingExamples] = useState([]);
  const [currentExample, setCurrentExample] = useState(null);
  const [revealedClues, setRevealedClues] = useState([]);
  const [userGuess, setUserGuess] = useState(null);
  const [score, setScore] = useState(0);
  const [completedExamples, setCompletedExamples] = useState([]);
  const [trainingMode, setTrainingMode] = useState('test'); // 'test' or 'learn'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch phishing examples from the backend
  useEffect(() => {
    const fetchPhishingExamples = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/phishing-examples`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch phishing examples');
        }
        
        const data = await response.json();
        setPhishingExamples(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching phishing examples:', err);
        setError('Failed to load phishing examples. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPhishingExamples();
  }, []);
  useEffect(() => {
    // Select a random example that hasn't been completed yet
    if (phishingExamples.length === 0) return;
    
    const availableExamples = phishingExamples.filter(
      ex => !completedExamples.includes(ex.id)
    );
    
    if (availableExamples.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableExamples.length);
      setCurrentExample(availableExamples[randomIndex]);
      setRevealedClues([]);
      setUserGuess(null);
    } else if (phishingExamples.length > 0) {
      // All examples completed, reset
      setCompletedExamples([]);
      setCurrentExample(phishingExamples[0]);
      setRevealedClues([]);
      setUserGuess(null);
    }
  }, [completedExamples, phishingExamples]);

  const handleClueReveal = () => {
    if (!currentExample || revealedClues.length >= currentExample.clues.length) return;
    
    // Reveal the next clue
    const nextClueId = currentExample.clues[revealedClues.length].id;
    setRevealedClues([...revealedClues, nextClueId]);
    
    // Deduct points for revealing clues in test mode
    if (trainingMode === 'test') {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const handleSubmitGuess = (isPhishing) => {
    if (!currentExample || userGuess !== null) return;
    
    // Always phishing in our examples, but this could be expanded
    const isCorrect = isPhishing === true;
    
    setUserGuess(isPhishing);
    
    if (isCorrect) {
      // Award points based on how many clues they needed
      const basePoints = 30;
      const clueDeduction = revealedClues.length * 5;
      const pointsEarned = Math.max(10, basePoints - clueDeduction);
      
      setScore(prev => prev + pointsEarned);
    }
    
    // Mark this example as completed
    setCompletedExamples([...completedExamples, currentExample.id]);
  };

  const handleNextExample = () => {
    // This will trigger the useEffect to load a new example
    setCompletedExamples([...completedExamples, currentExample.id]);
  };

  const renderExampleContent = () => {
    if (!currentExample) return null;
    
    switch (currentExample.type) {
      case 'email':
        return (
          <div className="email-preview border rounded-md p-4 bg-white dark:bg-slate-800">
            <div className="email-header border-b pb-2 mb-3">
              <div><strong>From:</strong> {currentExample.content.sender}</div>
              <div><strong>Subject:</strong> {currentExample.content.subject}</div>
            </div>
            <div className="email-body">
              {currentExample.content.body}
            </div>
            <div className="email-link mt-3 text-blue-600 dark:text-blue-400 underline">
              {currentExample.content.url}
            </div>
          </div>
        );
      
      case 'website':
        return (
          <div className="website-preview border rounded-md p-4 bg-white dark:bg-slate-800">
            <div className="browser-bar bg-slate-100 dark:bg-slate-700 p-2 rounded-t-md flex items-center">
              <div className="address-bar flex-1 bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs">
                {currentExample.content.url}
              </div>
            </div>
            <div className="website-content p-3">
              <div className="website-header flex items-center justify-between border-b pb-3 mb-3">
                <div className="logo-placeholder h-8 w-32 bg-slate-200 dark:bg-slate-600 rounded">
                  {/* Logo would be here */}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{currentExample.content.title}</h3>
              <p>{currentExample.content.body}</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Confirm Information</button>
            </div>
          </div>
        );
      
      case 'sms':
        return (
          <div className="sms-preview border rounded-md p-4 max-w-xs mx-auto bg-white dark:bg-slate-800">
            <div className="sms-header border-b pb-2 mb-3">
              <div><strong>From:</strong> {currentExample.content.sender}</div>
            </div>
            <div className="sms-body">
              {currentExample.content.body}
            </div>
            <div className="sms-link mt-2 text-blue-600 dark:text-blue-400 underline text-sm">
              {currentExample.content.url}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!currentExample) {
    return <div className="text-center p-8">Loading examples...</div>;
  }

  return (
    <div className="phishing-simulator bg-slate-100 dark:bg-slate-800/50 rounded-lg shadow-md p-6 mb-8">
      <div className="simulator-header flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Phishing Simulator
        </h2>
        <div className="score-display flex items-center">
          <span className="text-lg font-medium mr-2">Score:</span>
          <span className="bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-100 px-3 py-1 rounded-full font-bold">
            {score}
          </span>
        </div>
      </div>
      
      <div className="training-mode-selector flex justify-center mb-6">
        <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-full inline-flex">
          <button 
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              trainingMode === 'learn' 
                ? 'bg-white dark:bg-slate-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setTrainingMode('learn')}
          >
            Learning Mode
          </button>
          <button 
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              trainingMode === 'test' 
                ? 'bg-white dark:bg-slate-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setTrainingMode('test')}
          >
            Test Your Skills
          </button>
        </div>
      </div>
      
      <div className="simulator-content grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="example-display bg-white/60 dark:bg-slate-700/60 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-slate-700 dark:text-slate-200">
            Is this {currentExample.type} legitimate or phishing?
          </h3>
          {renderExampleContent()}
        </div>
        
        <div className="clues-and-actions flex flex-col">
          <div className="clues-section bg-white/60 dark:bg-slate-700/60 p-4 rounded-lg shadow-sm mb-4 flex-grow">
            <h3 className="text-lg font-medium mb-3 text-slate-700 dark:text-slate-200">
              Clues {revealedClues.length > 0 && `(${revealedClues.length}/${currentExample.clues.length})`}
            </h3>
            
            {revealedClues.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-400 italic">
                No clues revealed yet. Try to identify if this is a phishing attempt first!
              </div>
            ) : (
              <ul className="space-y-2">
                {currentExample.clues
                  .filter(clue => revealedClues.includes(clue.id))
                  .map(clue => (
                    <li key={clue.id} className="flex items-start">
                      <span className={`inline-block w-3 h-3 rounded-full mt-1 mr-2 ${
                        clue.severity === 'high' ? 'bg-red-500' : 
                        clue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></span>
                      <span>{clue.text}</span>
                    </li>
                  ))
                }
              </ul>
            )}
            
            {revealedClues.length < currentExample.clues.length && userGuess === null && (
              <button 
                onClick={handleClueReveal}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                Reveal a clue {trainingMode === 'test' && '(-5 points)'}
              </button>
            )}
          </div>
          
          <div className="actions-section">
            {userGuess === null ? (
              <div className="guess-buttons flex space-x-3">
                <button 
                  onClick={() => handleSubmitGuess(false)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Legitimate
                </button>
                <button 
                  onClick={() => handleSubmitGuess(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Phishing
                </button>
              </div>
            ) : (
              <div className="result-display">
                <div className={`p-4 rounded-lg mb-4 ${
                  userGuess === true 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <div className="font-bold text-lg mb-1">
                    {userGuess === true 
                      ? 'Correct! This is a phishing attempt.' 
                      : 'Incorrect. This is a phishing attempt.'}
                  </div>
                  <p>
                    {userGuess === true 
                      ? 'Great job identifying this threat!' 
                      : 'Always be vigilant for the warning signs of phishing.'}
                  </p>
                </div>
                
                {/* Show all clues after answering */}
                <div className="all-clues mb-4">
                  <h4 className="font-medium mb-2">All Warning Signs:</h4>
                  <ul className="space-y-2">
                    {currentExample.clues.map(clue => (
                      <li key={clue.id} className="flex items-start">
                        <span className={`inline-block w-3 h-3 rounded-full mt-1 mr-2 ${
                          clue.severity === 'high' ? 'bg-red-500' : 
                          clue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></span>
                        <span>{clue.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={handleNextExample}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Next Example
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhishingSimulator;
