import { NextRequest } from "next/server";
import { RandomWordRequestBody } from "../../../../../types/global";
import fetchData from "../../../../../data/fetcher";

export async function POST(req: NextRequest) {
    const body: RandomWordRequestBody = await req.json();

    const difficulty = body.Difficulty;
    const wordDatas = await fetchData(difficulty);
    if (!wordDatas) return new Response(JSON.stringify({ error: "No words found for the given difficulty" }), { status: 404 });

    const randomWord = wordDatas[Math.floor(Math.random() * wordDatas.length)];
    return Response.json({ word: randomWord });
}