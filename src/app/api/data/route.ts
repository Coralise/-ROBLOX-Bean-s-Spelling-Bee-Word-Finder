import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'words.json'); // ✅ Read from root-level "data"
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonData);
    
        return Response.json(data);
    } catch (error) {
        console.error("Error reading JSON:", error);
        return Response.json({ error: "Failed to load data" });
    }
}