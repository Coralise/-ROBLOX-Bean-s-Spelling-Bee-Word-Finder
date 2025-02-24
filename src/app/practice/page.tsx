"use client";

import { useEffect, useState } from "react";
import { CorrectWordData } from "../../../types/global";
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({variable: "--font-geist-mono",subsets: ["latin"],});

export default function Practice() {
    const [difficulty, setDifficulty] = useState<string | undefined>();
    const [gameData, setGameData] = useState<{correctWords: CorrectWordData[], difficulty: string}>();

    const setup = () => {
        return (
            <div className="flex flex-col items-center">
                <div>
                    <div className="flex gap-4 py-2 px-4 bg-zinc-900 rounded-2xl">
                        <div className="flex gap-2">
                            <input value="random" name="btn" type="radio" className="difficulty-input" checked={difficulty === undefined} onChange={() => setDifficulty(undefined)} />
                            <div className="btn">
                                <span className="span">Random</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input value="Easy" name="btn" type="radio" className="difficulty-input" checked={difficulty === "Easy"} onChange={() => setDifficulty("Easy")} />
                            <div className="btn">
                                <span className="span">Easy</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input value="Normal" name="btn" type="radio" className="difficulty-input" checked={difficulty === "Normal"} onChange={() => setDifficulty("Normal")} />
                            <div className="btn">
                                <span className="span">Normal</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input value="Hard" name="btn" type="radio" className="difficulty-input" checked={difficulty === "Hard"} onChange={() => setDifficulty("Hard")} />
                            <div className="btn">
                                <span className="span">Hard</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input value="Extreme" name="btn" type="radio" className="difficulty-input" checked={difficulty === "Extreme"} onChange={() => setDifficulty("Extreme")} />
                            <div className="btn">
                                <span className="span">Extreme</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input value="Impossible" name="btn" type="radio" className="difficulty-input" checked={difficulty === "Impossible"} onChange={() => setDifficulty("Impossible")} />
                            <div className="btn">
                                <span className="span">Impossible</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="animated-button mt-8" onClick={() => window.location.href = `/practice/session?difficulty=${difficulty ?? 'random'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                        <path
                            d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                        ></path>
                    </svg>
                    <span className="text">Start</span>
                    <span className="circle"></span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                        <path
                            d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                        ></path>
                    </svg>
                </button>
            </div>
        );
    }

    useEffect(() => {
        const storedGameData = sessionStorage.getItem("gameData");
        if (storedGameData) setGameData(JSON.parse(storedGameData));
    }, []);
    
    return (
        <div className="w-screen h-screen p-4 flex flex-col items-center justify-center">
            {setup()}
            {
                gameData && gameData.correctWords.length > 0 && <div className={`mt-32 flex flex-col min-w-[25rem] ${geistMono.className}`}>
                    <span className="self-center text-3xl mb-4">Previous Game Statistics</span>
                    <span>Difficulty: {gameData.difficulty ?? "Random"}</span>
                    <span>Correct Words: {gameData.correctWords.length}</span>
                    <span>Average WPM: {(gameData.correctWords.reduce((acc, word) => acc + word.WPM, 0) / gameData.correctWords.length).toFixed(2)}</span>
                    <span>
                        { 
                            `Highest WPM: ${gameData.correctWords.reduce((prev, current) => (prev.WPM > current.WPM) ? prev : current, gameData.correctWords[0]).WPM}`
                        }
                    </span>
                    <span>
                        { 
                            `Lowest WPM: ${gameData.correctWords.reduce((prev, current) => (prev.WPM < current.WPM) ? prev : current, gameData.correctWords[0]).WPM}`
                        }
                    </span>
                </div>
            }
        </div>
    );
}