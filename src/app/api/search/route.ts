import { NextRequest } from "next/server";
import fs from 'fs';
import path from 'path';
const dldist = require('weighted-damerau-levenshtein');

const getMinDistance = (inputValue: string, word: string): number => {

    inputValue = inputValue.toLowerCase();
    word = word.toLowerCase();

    if (word.includes(inputValue)) return 0;
    if (inputValue.length+1 >= word.length) return dldist(inputValue, word);

    const diff: number = word.length - inputValue.length+1;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0;i < diff+2;i++) {
        const distance = dldist(inputValue, word.substring(i, inputValue.length+i));
        minDistance = Math.min(distance, minDistance);
    }

    return minDistance;
}

interface WordData {
    Word: string,
    Difficulties: string[]
}

const fetchData = async (): Promise<WordData[] | undefined> => {
    try {
        const filePath = path.join(process.cwd(), 'data', 'words.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonData);
        return data.words;
    } catch (error) {
        console.error("Fetch error:", error);
    }
};

export async function POST(req: NextRequest) {
    const body = await req.json();
    const inputValue: string = body.inputValue;
    
    const wordDatas = await fetchData();
    if (wordDatas == undefined) return Response.json({ words: [] });

    const distances = wordDatas.map(wordData => {
        const validWords: string[] = wordData.Word.split("/");
        const minDistance = Math.min(...validWords.map(vWord => getMinDistance(inputValue, vWord)));
        return {
            words: validWords,
            distance: minDistance,
        };
    });
    distances.sort((a, b) => a.distance - b.distance);
    const nearestWords = distances.slice(0, 1).map(d => d.words)[0];

    return Response.json({ words: nearestWords});
}