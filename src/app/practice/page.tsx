"use client";
import { useEffect, useState } from "react";

export default function Practice() {
    const [words, setWords] = useState<string[]>([]);
    
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

    return (
        <div className="w-screen h-screen p-4 flex items-center justify-center">
            Test
        </div>
    );
}