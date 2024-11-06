//Interfaces
interface TriviaResponseType {
    results: TriviaInfo[];
}

interface TriviaInfo {
    question: string,
    correct_answer: string;
    incorrect_answers: string[];
}

interface AnswerInfo {
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

interface PreviousResult {
    category: string;
    correctAnswersCount: number;
}

export { TriviaResponseType, TriviaInfo, AnswerInfo, PreviousResult }