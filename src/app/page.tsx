"use client";

import { useState } from "react";
import { FaLink } from "react-icons/fa";

export default function Home() {
  const [nearestWords, setNearestWords] = useState<string[]>([]);

  const search = async (inputValue: string): Promise<string[]> => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputValue }),
    });

    const data = await response.json();
    return data.words;
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.trim();
    
    if (inputValue.length == 0) {
      setNearestWords([]);
    } else {
      const words = await search(inputValue);
      if (event.target.value.trim() === inputValue) {
        setNearestWords(words);
      }
    }
    
  };

  return (
    <div className="min-h-screen w-screen flex justify-center p-4">
      <div className="h-fit flex flex-col w-full md:w-3/4 mt-24">
        <a target="_blank" href="https://www.roblox.com/games/17590362521/Spelling-Bee" className="self-center w-fit text-4xl flex items-center justify-center gap-4 group">
          <span>[ROBLOX] Spelling Bee Spell Checker</span>
          <FaLink className="size-4 text-zinc-700 group-hover:text-blue-400 transition-all duration-300 group-hover:animate-pulse" />
        </a>
        <span className="text-zinc-700 mt-16">Last updated: February 22, 2025 • 540 words</span>
        <div className="form-control w-full">
          <input
            className="input input-alt"
            placeholder="Type your word (even if it's the wrong spelling)"
            type="text"
            onChange={handleInputChange}
          />
          <span className="input-border input-border-alt"></span>
        </div>
        <div className="w-full mt-4">
          <ul>
            {nearestWords.length > 0 && (
              <div className="select-none hover:bg-zinc-900 transition-all duration-300">
                <li className="p-2 text-lg">
                  {
                    nearestWords.map((word, index) => (
                      <span key={word}>
                        {word}
                        {index < nearestWords.length - 1 && <span className="text-base text-zinc-500"> or </span>}
                      </span>
                    ))
                  }
                </li>
                <div className="border-t-solid border-t-gray-700 border-t-[.5px]" />
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}