export interface RandomWordRequestBody {
    Difficulty?: string
}

export interface WordData {
    Word: string,
    Difficulty: string
}

export interface CorrectWordData {
    WPM: number
}