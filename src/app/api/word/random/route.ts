import { NextRequest } from "next/server";
import { RandomWordRequestBody } from "../../../../../types/global";
import fetchData from "../../../../../data/fetcher";
import { LRUCache } from "lru-cache";

const rateLimit = new LRUCache<string, { count: number; lastRequest: number }>({
  max: 500, // Store up to 500 unique IPs
  ttl: 60 * 1000, // Reset counts every 60 seconds
});

const MAX_REQUESTS = 30; // Allow 30 requests per minute

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  
    const requestInfo = rateLimit.get(ip) || { count: 0, lastRequest: Date.now() };
  
    if (requestInfo.count >= MAX_REQUESTS) {
      return Response.json({ error: "Too many requests, slow down!" }, { status: 429 });
    }
  
    // Increment request count
    requestInfo.count++;
    rateLimit.set(ip, requestInfo);
    
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