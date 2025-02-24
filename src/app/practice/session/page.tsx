"use client";

import { Geist_Mono } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CorrectWordData, WordData } from "../../../../types/global";

const geistMono = Geist_Mono({variable: "--font-geist-mono",subsets: ["latin"],});

const parseInput = (input: string): string => {
    if (!input) return "";
    const lettersOnly = input.replace(/[^a-zA-Z]/g, "");
    return lettersOnly.charAt(0).toUpperCase() + lettersOnly.slice(1).toLowerCase();
}

const getRandomWord = async (difficulty: string | undefined): Promise<WordData> => {
    const response = await fetch('/api/word/random', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Difficulty: difficulty }),
    });

    const data = await response.json();
    return data.word;
}

async function wait(seconds: number) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export default function Game() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [word, setWord] = useState<WordData | undefined>();
    const [canType, setCanType] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [startTime, setStartTime] = useState<number>();
    const [isCorrect, setIsCorrect] = useState<boolean>();
    const [wpm, setWpm] = useState<number>();
    const [correctWords, setCorrectWords] = useState<CorrectWordData[]>([]);
    
    const searchParams = useSearchParams();
    const difficulty = searchParams.get("difficulty") === "random" ? undefined : searchParams.get("difficulty") ?? undefined;

    const calculateWpm = (startTime: number, endTime: number, wordLength: number): number => {
        const time = endTime - startTime;
        const timeInMinutes = time / 60000;
        return Math.round((wordLength / 4) / timeInMinutes);
    }

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement> & React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (e.target.value.length < 3) return;

            const correct = word?.Word.split("/").some(part => part.toLowerCase() == e.target.value.toLowerCase());
            setIsCorrect(correct);
            setCanType(false);
            if (correct) {
                const wpm = calculateWpm(startTime!, Date.now(), e.target.value.length);
                setWpm(wpm);
                setCorrectWords(prev => [...prev, { WordData: word!, WPM: wpm }]);
            }
            await wait(2);
            if (correct) {
                start();
            } else {
                stop();
            }
        } else {
            setInputValue(parseInput(e.target.value));
        }
    };

    const stop = () => {
        sessionStorage.setItem('gameData', JSON.stringify({ correctWords, difficulty }));
        router.push("/practice")
    }
    
    const start = useCallback(async () => {
        setWord(undefined);
        setStartTime(undefined);
        setIsCorrect(undefined);
        setInputValue("");
        setWpm(undefined);

        setCanType(false);
        await wait(1);
        setWord(await getRandomWord(difficulty));
        await wait(1);
        setCanType(true);
        await wait(.1);
        setStartTime(Date.now());
        inputRef.current!.focus();
    }, [difficulty]);
    
    useEffect(() => {
        start();
    }, [start]);

    const getStatusMessage = (): string => {
        if (isCorrect === undefined) return "Type...";
        else if (isCorrect) return "Correct!";
        else return "Incorrect!";
    };

    return (
        <div className={`${geistMono.className} flex flex-col items-center justify-center h-screen w-full select-none`}>
            <span className={`text-2xl`}>{getStatusMessage()}</span>

            <span className={`mt-12 text-2xl ${word ? "opacity-100 transition-opacity duration-300" : "opacity-0"}`}>{word?.Word.split("/")[0] ?? "Placeholder"}</span>

            <div className={`textInputWrapper mt-16`}>
                <input
                    disabled={!canType}
                    type="text"
                    ref={inputRef}
                    className={`textInput text-center py-2 px-4 w-[36ch] box-content text-2xl opacity-1 transition-opacity duration-150`}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputChange} // Add onKeyDown event listener
                />
            </div>

            <span className={`text-2xl mt-4 ${wpm ? "opacity-100 transition-opacity duration-300" : "opacity-0"}`}>{wpm} WPM</span>

            {
                correctWords.length > 0 && <div className="mt-32 flex flex-col min-w-[25rem]">
                    <span className="self-center text-3xl mb-4">Current Statistics</span>
                    <span>Difficulty: {difficulty ?? "Random"}</span>
                    <span>Correct Words: {correctWords.length}</span>
                    <span>Average WPM: {(correctWords.reduce((acc, word) => acc + word.WPM, 0) / correctWords.length).toFixed(2)}</span>
                    <span>
                        { 
                            `Highest WPM: ${correctWords.reduce((prev, current) => (prev.WPM > current.WPM) ? prev : current, correctWords[0]).WPM}`
                        }
                    </span>
                    <span>
                        { 
                            `Lowest WPM: ${correctWords.reduce((prev, current) => (prev.WPM < current.WPM) ? prev : current, correctWords[0]).WPM}`
                        }
                    </span>
                </div>
            }
        </div>
    );
}