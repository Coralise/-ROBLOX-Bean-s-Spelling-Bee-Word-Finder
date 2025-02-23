"use client";

import { Geist_Mono } from "next/font/google";
import { ReactNode, useState } from "react";
import { FaLink } from "react-icons/fa";

const geistMono = Geist_Mono({variable: "--font-geist-mono",subsets: ["latin"],});

export default function Home() {
  const [nearestWords, setNearestWords] = useState<string[]>();

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

  async function wait(seconds: number) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.trim();
    
    if (inputValue.length == 0) {
      setNearestWords(undefined);
    } else {
      setNearestWords([]);
      await wait(1);
      if (event.target.value.trim() !== inputValue) return;
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
          {nearestWords != undefined && (
            <div className={`w-full mt-16 h-fit select-none flex flex-col items-center ${geistMono.className}`}>
              {nearestWords.length == 0 && (
                <div className="animation">Searching...</div>
              )}
              {
                nearestWords.map((word, index) => (
                  <>
                    {index != 0 && <div className="mt-4 text-2xl text-zinc-700">or</div>}
                    <span key={word} className={`${index != 0 ? "mt-4" : ""} text-4xl`}>
                      {word}
                    </span>
                  </>
                ))
              }
            </div>
          )}
      </div>
    </div>
  );
}