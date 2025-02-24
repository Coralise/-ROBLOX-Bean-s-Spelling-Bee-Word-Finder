import path from "path";
import fs from "fs";
import { WordData } from "../types/global";


export default async function fetchData(difficulty?: string): Promise<WordData[] | undefined> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'words.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonData);
        
        return difficulty ? data.words.filter((word: WordData) => word.Difficulty === difficulty) : data.words;
    } catch (error) {
        console.error("Fetch error:", error);
    }
}