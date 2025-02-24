import fs from 'fs';
import path from 'path';

interface WordData {
    Word: string,
    Difficulty: string
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

const processWordData = (wordDatas: WordData[]) => {
    const cleanWordDatas: WordData[] = [];
    const cleanWordsIndex: { [key: string]: number } = {};
    
    for (const wordData of wordDatas) {
        const wordParts = wordData.Word.toLowerCase().split("/");
        if (!wordParts.some(part => part in cleanWordsIndex)) {
            cleanWordDatas.push(wordData);
            for (const part of wordParts) {
                cleanWordsIndex[part] = cleanWordDatas.length-1;
            }
        } else {
            const existingIndex = wordParts.map(part => cleanWordsIndex[part]).find(index => index !== undefined);
            if (existingIndex !== undefined) {
                updateExistingWordData(wordData, cleanWordDatas, existingIndex);
            }
        }
    }
    console.log(cleanWordsIndex);

    return cleanWordDatas;
}

const updateExistingWordData = (wordData: WordData, cleanWordDatas: WordData[], index: number) => {
    const existingWordData = cleanWordDatas[index];
    existingWordData.Difficulty = wordData.Difficulty;
    console.log("Updating wordData: " + existingWordData.Word + " : " + existingWordData.Difficulty);
    cleanWordDatas[index] = existingWordData;
}

const logCleanWordData = (cleanWordDatas: WordData[]) => {
    console.log("-- Cleaned Word Data --");
    let content = "";
    for (const cleanWordData of cleanWordDatas) {
        content += "{\n";
        content += "    \"Word\": \"" + cleanWordData.Word + "\",\n";
        content += "    \"Difficulty\": " + cleanWordData.Difficulty + "\"\n";
        content += "}" + (cleanWordDatas.indexOf(cleanWordData) == cleanWordDatas.length-1 ? "\n" : ",\n");
    }

    fs.writeFileSync("words-cleaner/clean-words.txt", content);
    console.log("File Written successfully.");
}

const start = async () => {
    const wordDatas = await fetchData();
    if (wordDatas == undefined) return;

    const cleanWordDatas = processWordData(wordDatas);

    logCleanWordData(cleanWordDatas);
}

start();