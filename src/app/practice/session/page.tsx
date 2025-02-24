"use client";

import { Geist_Mono } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { CorrectWordData, WordData } from "../../../../types/global";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const geistMono = Geist_Mono({variable: "--font-geist-mono",subsets: ["latin"],});

const parseInput = (input: string): string => {
    if (!input) return "";
    const lettersOnly = input.replace(/[^a-zA-Z]/g, "");
    return lettersOnly.charAt(0).toUpperCase() + lettersOnly.slice(1).toLowerCase();
}

const getRandomWord = async (recaptchaToken: string, difficulty: string | undefined): Promise<WordData> => {
    const response = await fetch('/api/word/random', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Difficulty: difficulty, recaptchaToken }),
    });

    const data = await response.json();
    if (response.status != 200) {
        return { Word: data.error, Difficulty: response.status + "" };
    } else return data.word;
}

async function wait(seconds: number) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function GameComponent({ difficulty }: Readonly<{ difficulty: string | undefined }>) {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [word, setWord] = useState<WordData | undefined>();
    const [canType, setCanType] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [startTime, setStartTime] = useState<number>();
    const [isCorrect, setIsCorrect] = useState<boolean>();
    const [wpm, setWpm] = useState<number>();
    const [correctWords, setCorrectWords] = useState<CorrectWordData[]>([]);

    const calculateWpm = (startTime: number, endTime: number, wordLength: number): number => {
        const time = endTime - startTime;
        const timeInMinutes = time / 60000;
        return Math.round((wordLength / 4) / timeInMinutes);
    }

    const handleKeyDown = async (e: React.ChangeEvent<HTMLInputElement> & React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') new Audio('/sounds/enter.mp3').play();
        else new Audio('/sounds/type.mp3').play();
        handleInputChange(e);
    }

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement> & React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (e.target.value.length < 3) return;

            const correct = word?.Word.split("/").some(part => part.toLowerCase() == e.target.value.toLowerCase());
            setIsCorrect(correct);
            setCanType(false);
            if (correct) {
                const correctSound = new Audio('/sounds/correct.mp3');
                correctSound.play();
                const wpm = calculateWpm(startTime!, Date.now(), e.target.value.length);
                setWpm(wpm);
                setCorrectWords(prev => [...prev, { WordData: word!, WPM: wpm }]);
            } else {
                new Audio('/sounds/incorrect.mp3').play();
            }
            await wait(2);
            if (correct) {
                start(executeRecaptcha);
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

    const start = useCallback(async (recaptcha: ((action?: string) => Promise<string>) | undefined) => {
        if (!recaptcha) return;
        const recaptchaToken = await recaptcha("submit");
        setWord(undefined);
        setStartTime(undefined);
        setIsCorrect(undefined);
        setInputValue("");
        setWpm(undefined);

        setCanType(false);
        await wait(0.6);
        setWord(await getRandomWord(recaptchaToken, difficulty));
        await wait(0.7);
        setCanType(true);
        await wait(.1);
        setStartTime(Date.now());
        inputRef.current!.focus();
    }, [difficulty]);

    useEffect(() => {
        if (!executeRecaptcha) return;
        start(executeRecaptcha);
    }, [start, executeRecaptcha]);

    const getStatusMessage = (): ReactNode => {
        if (isCorrect === undefined) return <span className={`text-2xl transition-all duration-500`}>Type...</span>;
        else if (isCorrect) return <span className={`text-2xl text-green-400 transition-all duration-500`}>Correct!</span>;
        else return <span className={`text-2xl text-red-500 transition-all duration-500`}>Incorrect!</span>;
    };

    return (
        <div className={`${geistMono.className} flex flex-col items-center justify-center h-screen w-full select-none`}>
            {getStatusMessage()}

            <span className={`mt-12 text-2xl ${word ? "opacity-100 transition-opacity duration-300" : "opacity-0"}`}>{word?.Word.split("/")[0] ?? "Placeholder"}</span>

            <div className={`textInputWrapper mt-16`}>
                <input
                    disabled={!canType}
                    type="text"
                    ref={inputRef}
                    className={`textInput text-center py-2 px-4 w-[36ch] box-content text-2xl opacity-1 transition-opacity duration-150`}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown} // Add onKeyDown event listener
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

export default function Game() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GameWithSearchParams />
        </Suspense>
    );
}

function GameWithSearchParams() {
    const searchParams = useSearchParams();
    const difficulty = searchParams.get("difficulty") === "random" ? undefined : searchParams.get("difficulty") ?? undefined;

    return <GameComponent difficulty={difficulty} />;
}