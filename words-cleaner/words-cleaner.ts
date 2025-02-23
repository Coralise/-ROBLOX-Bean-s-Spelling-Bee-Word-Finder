import fs from 'fs';
import path from 'path';

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

const processWordData = (wordDatas: WordData[]) => {
    const cleanWordDatas: WordData[] = [];
    const cleanWordsIndex: string[] = [];
    
    for (const wordData of wordDatas) {
        if (!cleanWordsIndex.includes(wordData.Word.toLowerCase())) {
            cleanWordDatas.push(wordData);
            cleanWordsIndex.push(wordData.Word.toLowerCase());
        } else {
            updateExistingWordData(wordData, cleanWordDatas);
        }
    }

    return cleanWordDatas;
}

const updateExistingWordData = (wordData: WordData, cleanWordDatas: WordData[]) => {
    for (const existingWordData of cleanWordDatas) {
        if (existingWordData.Word != wordData.Word) continue;
        for (const difficulty of wordData.Difficulties) {
            if (!existingWordData.Difficulties.includes(difficulty)) {
                existingWordData.Difficulties.push(difficulty);
            }
        }
        break;
    }
}

const logCleanWordData = (cleanWordDatas: WordData[]) => {
    console.log("-- Cleaned Word Data --");
    let content = "";
    for (const cleanWordData of cleanWordDatas) {
        content += "{\n";
        content += "    \"Word\": \"" + cleanWordData.Word + "\",\n";
        content += "    \"Difficulties\": [" + cleanWordData.Difficulties.map((difficulty) => "\"" + difficulty + "\"").join(", ") + "]\n";
        content += "}" + (cleanWordDatas.indexOf(cleanWordData) == cleanWordDatas.length-1 ? "\n" : ",\n");
    }
    console.log(content);

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