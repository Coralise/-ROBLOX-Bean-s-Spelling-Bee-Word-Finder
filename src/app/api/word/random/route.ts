import { NextRequest } from "next/server";
import { RandomWordRequestBody } from "../../../../../types/global";
import fetchData from "../../../../../data/fetcher";

export async function POST(req: NextRequest) {
    
    const body: RandomWordRequestBody = await req.json();

    const difficulty = body.Difficulty;
    const recaptchaToken = body.recaptchaToken;

    // Verify reCAPTCHA with Google
    const googleRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=6LfVyuAqAAAAACyrAAe1HnqAZzpUapSUjvnSazIg&response=${recaptchaToken}`,
    });
  
    const verification = await googleRes.json();
  
    if (!verification.success || verification.score < 0.5) {
        return Response.json({ error: "reCAPTCHA verification failed" }, { status: 403 });
    }

    const wordDatas = await fetchData(difficulty);
    if (!wordDatas) return new Response(JSON.stringify({ error: "No words found for the given difficulty" }), { status: 404 });

    const randomWord = wordDatas[Math.floor(Math.random() * wordDatas.length)];
    return Response.json({ word: randomWord }, { status: 200 });
}