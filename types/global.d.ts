export interface RandomWordRequestBody {
    Difficulty?: string,
    recaptchaToken: string,
    BlacklistedWord?: string
}

export interface WordData {
    Word: string,
    Difficulty: string
}

export interface CorrectWordData {
    WPM: number
}