"use client";

import { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";

export default function Home() {
  const [words, setWords] = useState<string[]>([]);
  const [nearestWords, setNearestWords] = useState<string[][]>([]);

  useEffect(() => {
    fetch("words.json")
      .then((response) => response.json())
      .then((data) => setWords(data.words))
      .catch((error) => console.error("Error loading words:", error));
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

    if (inputValue.length >= word.length) return levenshteinDistance(inputValue, word);

    const diff: number = word.length - inputValue.length;
    const distances: number[] = [];

    for (let i = 0;i < diff+1;i++) {
      distances.push(levenshteinDistance(inputValue, word.substring(i, inputValue.length+i)));
    }

    return Math.min(...distances);
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
          levenshteinDistance: minDistance,
          containsWord: word.toLowerCase().includes(inputValue.toLowerCase())
        };
      });
      distances.sort((a, b) => {
        if (a.containsWord) return -1;
        if (b.containsWord) return 1;
        return a.levenshteinDistance - b.levenshteinDistance;
      });
      setNearestWords(distances.slice(0, 10).map(d => d.words));
    }
    
  };

  return (
    <div className="min-h-screen w-screen flex justify-center p-4">
      <div className="h-fit flex flex-col w-full md:w-3/4 mt-24">
        <a target="_blank" href="https://www.roblox.com/games/17590362521/Spelling-Bee" className="text-4xl flex items-center justify-center gap-4 group">
          <span>[ROBLOX] Spelling Bee Word Finder</span>
          <FaLink className="size-4 text-zinc-700 group-hover:text-blue-400 transition-all duration-300 group-hover:animate-pulse" />
        </a>
        <span className="text-zinc-700 mt-16">Last updated: February 22, 2025</span>
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