import { NextRequest } from "next/server";
// @ts-expect-error: package does not support typescript
import dldist from 'weighted-damerau-levenshtein';
import fetchData from "../../../../../data/fetcher";

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

export async function POST(req: NextRequest) {
    const body = await req.json();
    const inputValue: string = body.inputValue;
    
    const wordDatas = await fetchData();
    if (!wordDatas) return Response.json({ words: [] });

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