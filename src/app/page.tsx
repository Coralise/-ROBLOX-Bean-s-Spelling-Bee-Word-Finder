"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [words, setWords] = useState<string[]>([]);
  const [nearestWords, setNearestWords] = useState<string[]>([]);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.trim();
    
    if (inputValue.length == 0) {
      setNearestWords([]);
    } else {
      const distances = words.map(word => {
        let validWords: string[] = word.split("/");
        const minDistance = Math.min(...validWords.map(vWord => levenshteinDistance(inputValue, inputValue.length < vWord.length ? vWord.substring(0, inputValue.length) : vWord)));
        return {
          word: validWords.join(" • "),
          levenshteinDistance: minDistance,
          containsWord: word.toLowerCase().includes(inputValue.toLowerCase())
        };
      });
      distances.sort((a, b) => a.containsWord ? -1 : b.containsWord ? 1 : a.levenshteinDistance - b.levenshteinDistance);
      setNearestWords(distances.slice(0, 10).map(d => d.word));
    }
    
  };

  return (
    <div className="min-h-screen w-screen flex justify-center p-4">
      <div className="h-fit flex flex-col w-full md:w-3/4 mt-24">
        <span className="text-4xl flex justify-center">Bean's Spelling Bee Word Finder</span>
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
              nearestWords.map((word, index) => (
                <li key={word}>{word}</li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
}