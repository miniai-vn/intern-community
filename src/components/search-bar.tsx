'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react'; 

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  
  const queryFromUrl = searchParams.get('q') ?? '';// Take initial query value from URL

 
  const [inputValue, setInputValue] = useState(queryFromUrl);// Local state to control the input value

  
  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);// Update input value if URL query changes 

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (inputValue.trim()) {
      params.set('q', inputValue.trim());
    } else {
      params.delete('q');
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/', { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        name="q"
        value={inputValue} // Bind input value to state
        onChange={(e) => setInputValue(e.target.value)} 
        placeholder="Search modules…"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <button 
        type="submit" 
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}