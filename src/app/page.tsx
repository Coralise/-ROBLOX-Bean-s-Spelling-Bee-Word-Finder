"use client";

import { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";

export default function Home() {
  const [words, setWords] = useState<string[]>([]);
  const [nearestWords, setNearestWords] = useState<string[][]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data'); // Fetch JSON from API route
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const jsonData: { words: string[] } = await res.json();
        setWords(jsonData.words);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) {
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) {
          matrix[i][j] = j;
        } else if (j === 0) {
          matrix[i][j] = i;
        } else if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          );
        }
      }
    }

    return matrix[a.length][b.length];
  };

  const getMinDistance = (inputValue: string, word: string): number => {

    inputValue = inputValue.toLowerCase();
    word = word.toLowerCase();

    if (word.includes(inputValue)) return 0;
    if (inputValue.length+1 >= word.length) return levenshteinDistance(inputValue, word);

    const diff: number = word.length - inputValue.length+1;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0;i < diff+2;i++) {
      const distance = levenshteinDistance(inputValue, word.substring(i, inputValue.length+i));
      minDistance = Math.min(distance, minDistance);
    }

    return minDistance;
  } 

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.trim();
    
    if (inputValue.length == 0) {
      setNearestWords([]);
    } else {
      const distances = words.map(word => {
        const validWords: string[] = word.split("/");
        const minDistance = Math.min(...validWords.map(vWord => getMinDistance(inputValue, vWord)));
        return {
          words: validWords,
          distance: minDistance,
        };
      });
      distances.sort((a, b) => a.distance - b.distance);
      setNearestWords(distances.slice(0, 1).map(d => d.words));
    }
    
  };

  return (
    <div className="min-h-screen w-screen flex justify-center p-4">
      <div className="h-fit flex flex-col w-full md:w-3/4 mt-24">
        <a target="_blank" href="https://www.roblox.com/games/17590362521/Spelling-Bee" className="self-center w-fit text-4xl flex items-center justify-center gap-4 group">
          <span>[ROBLOX] Spelling Bee Word Finder</span>
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
        {words.length == 0 ? <div>Loading words...</div> : <></>}
        <div className="w-full mt-4">
          <ul>
            {
              nearestWords.map((words, index) => (
                <div className="select-none hover:bg-zinc-900 transition-all duration-300" key={index + ""}>
                  <li className="p-2 text-lg">
                    {
                      words.map((word, index) => (
                      <span key={word}>
                        {word}
                        {index < words.length - 1 && <span className="text-base text-zinc-500"> or </span>}
                      </span>
                      ))
                    }
                  </li>
                  <div className="border-t-solid border-t-gray-700 border-t-[.5px]" />
                </div>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
}