'use client';

import { useState, useEffect } from 'react';

export function VoteButton({ moduleId, initialCount, initialVoted = false }: { moduleId: string, initialCount: number, initialVoted?: boolean }) {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem('my_votes') || '{}');
    if (savedVotes[moduleId]) {
      setHasVoted(true);
      setCount(initialCount + 1);
    }
  }, [moduleId, initialCount]);

  const handleVote = (e: React.MouseEvent) => {
e.preventDefault(); 
  e.stopPropagation();

  const savedVotes = JSON.parse(localStorage.getItem('my_votes') || '{}');

    if (hasVoted) {
      delete savedVotes[moduleId];
      setCount(prev => prev - 1);
      setHasVoted(false);
    } else {
      savedVotes[moduleId] = true;
      setCount(prev => prev + 1);
      setHasVoted(true);
    }
    localStorage.setItem('my_votes', JSON.stringify(savedVotes));
  };

  return (
    <button onClick={handleVote} className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-all ${hasVoted ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'}`}>
      <span>▲</span> <span>{count}</span>
    </button>
  );
}