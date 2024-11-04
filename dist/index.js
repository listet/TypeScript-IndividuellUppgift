"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//Laddar upp sidan
window.addEventListener('load', () => {
    setupTrivia();
    // setupNavigation();
});
//Array för att lagra triviafrågor
let triviaQuestions = [];
//Håller koll på nuvarande frågeindex
let currentQuestionIndex = 0;
//Räknar antalet korrekta svar
let correctAnswersCount = 0;
//Array för användarens resultat
let userAnswers = [];
//Funktion som sätter upp triviafrågor 
function setupTrivia() {
    //Här används NodeListOf  eftersom querySelectorAll returnerar en NodeList av element och är mer 
    // effektiv när man inte behöver fullständig array-funktionalitet
    const categoryButtons = document.querySelectorAll(".category-button");
    const firstPageSection = document.querySelector(".firstPage");
    //Ger en lyssnare för varje kategori-knapp och kallas på funktionen fetchTriviaAPI
    // med selectedCategory samt tar bort firstPageSection
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedCategory = button.dataset.category;
            if (selectedCategory) {
                fetchTriviaAPI(selectedCategory);
                firstPageSection.style.display = "none";
            }
        });
    });
}
//Funktion som hämtar API
function fetchTriviaAPI(category) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=medium&type=multiple`);
            if (!response.ok)
                throw new Error("Någonting gick snett!");
            const data = yield response.json();
            triviaQuestions = data.results;
            currentQuestionIndex = 0;
            //Kallar på funktionen displayQuestion med de hämtade frågorna samt håller koll på index med start från 0
            displayQuestion(triviaQuestions[currentQuestionIndex]);
        }
        catch (error) {
            console.error(error);
        }
    });
}
//Funktion som visar triviaFrågorna
function displayQuestion(trivia) {
    const questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";
    //Skapar HTML-element för att visa upp frågor och svar
    const questionElement = document.createElement("h2");
    questionElement.textContent = decodeHtmlEntities(trivia.question);
    questionElement.classList.add("question");
    questionContainer.appendChild(questionElement);
    //Skapar svarsalternativ och blandar som med hjälp av funktion ShuffleArray
    const answers = [...trivia.incorrect_answers, trivia.correct_answer];
    shuffleArray(answers);
    //Skapar en knapp för varje svarsalternativ
    answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = decodeHtmlEntities(answer);
        button.classList.add("answer-button");
        button.addEventListener("click", () => checkAnswer(answer, trivia.correct_answer));
        questionContainer.appendChild(button);
    });
}
//Kontrollerar svar samt sparar i userAnswers-array
function checkAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect)
        correctAnswersCount++;
    userAnswers.push({
        question: triviaQuestions[currentQuestionIndex].question,
        selectedAnswer,
        correctAnswer,
        isCorrect,
    });
    //Går vidare till nästa fråga alt. visar resultat
    currentQuestionIndex++;
    if (currentQuestionIndex < triviaQuestions.length) {
        displayQuestion(triviaQuestions[currentQuestionIndex]);
    }
    else {
        displayResult();
    }
}
//Visar resultat
function displayResult() {
    const questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";
    const resultElement = document.createElement("h2");
    resultElement.classList.add("result-header");
    resultElement.textContent = `Du fick ${correctAnswersCount} av ${triviaQuestions.length} rätt!`;
    questionContainer.appendChild(resultElement);
    //Visar detaljer för varje fråga
    userAnswers.forEach(answer => {
        const questionSummary = document.createElement("section");
        questionSummary.classList.add("question-summary");
        const questionText = document.createElement("p");
        questionText.textContent = `Fråga: ${decodeHtmlEntities(answer.question)}`;
        questionSummary.appendChild(questionText);
        const userAnswerText = document.createElement("p");
        userAnswerText.classList.add("result-question");
        userAnswerText.textContent = `Ditt svar: ${decodeHtmlEntities(answer.selectedAnswer)}`;
        userAnswerText.style.color = answer.isCorrect ? "lightgreen" : "red";
        questionSummary.appendChild(userAnswerText);
        const correctAnswerText = document.createElement("p");
        correctAnswerText.classList.add("result-question");
        correctAnswerText.textContent = `Rätt svar: ${decodeHtmlEntities(answer.correctAnswer)}`;
        questionSummary.appendChild(correctAnswerText);
        questionContainer.appendChild(questionSummary);
    });
    //Skapar och visar restart-knapp
    const restartButton = document.createElement("button");
    restartButton.classList.add("restart-button");
    restartButton.textContent = "Starta om";
    restartButton.addEventListener("click", resetQuiz);
    questionContainer.appendChild(restartButton);
}
//Funktion för att starta om Quiz
function resetQuiz() {
    const questionContainer = document.getElementById("questionContainer");
    const firstPageSection = document.querySelector(".firstPage");
    sessionStorage.clear();
    correctAnswersCount = 0;
    userAnswers = [];
    currentQuestionIndex = 0;
    firstPageSection.style.display = "block";
    questionContainer.innerHTML = "";
}
//Funktion för att shuffla Array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
//Funktion för att dekoda HTML-entiteter i text
function decodeHtmlEntities(text) {
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html").documentElement.textContent || text;
}
// function setupNavigation(): void {
//     const navItemRefs = document.querySelectorAll(".nav-item") as NodeListOf<HTMLElement>;
//     navItemRefs.forEach(navItem => {
//         navItem.addEventListener("click", (event) => {
//             const target = (event.target as HTMLElement).dataset.id;
//             toggleSectionDisplay(target);
//         });
//     });
// }
// function toggleSectionDisplay(section: string | undefined): void {
//     const questionSection = document.getElementById("questionSection") as HTMLElement;
//     const resultSection = document.getElementById("resultSection") as HTMLElement;
//     if (section === "questions") {
//         questionSection.classList.remove("d-none");
//         resultSection.classList.add("d-none");
//     } else if (section === "results") {
//         questionSection.classList.add("d-none");
//         resultSection.classList.remove("d-none");
//     }
// }
// async function initializeTrivia() : Promise<void> {
//     triviaQuestions = [];
//     currentQuestionIndex = 0;
//     correctAnswersCount = 0;
//     userAnswers = [];
// }
// function renderResults() : void {
//     questionContainer.innerHTML = '';
//     const resultElement = document.createElement("h2");
//     resultElement.classList.add("result-header");
//     resultElement.textContent = `Du fick ${correctAnswersCount} av ${triviaQuestions.length} rätt!`;
//     questionContainer.appendChild(resultElement);
//     userAnswers.forEach(answer => {
//         const questionSummary = createQuestionSummary(answer);
//         questionContainer.appendChild(questionSummary);
//     });
//     const restartButton = createRestartButton();
//     questionContainer.appendChild(restartButton);
// }
// function createQuestionSummary(answer: AnswerInfo): HTMLElement {
//     const questionSummary = document.createElement("section");
//     questionSummary.classList.add("question-summary");
//     const questionText = document.createElement("p");
//     questionText.textContent = `Fråga: ${decodeHtmlEntities(answer.question)}`;
//     questionSummary.appendChild(questionText);
//     const userAnswerText = document.createElement("p");
//     userAnswerText.classList.add("result-question");
//     userAnswerText.textContent = `Ditt svar: ${decodeHtmlEntities(answer.selectedAnswer)}`;
//     userAnswerText.style.color = answer.isCorrect ? "lightgreen" : "red";
//     questionSummary.appendChild(userAnswerText);
//     const correctAnswerText = document.createElement("p");
//     correctAnswerText.classList.add("result-question");
//     correctAnswerText.textContent = `Rätt svar: ${decodeHtmlEntities(answer.correctAnswer)}`;
//     questionSummary.appendChild(correctAnswerText);
//     return questionSummary;
// }
// function createRestartButton(): HTMLElement {
//     const restartButton = document.createElement("button");
//     restartButton.classList.add("restart-button");
//     restartButton.textContent = "Starta om";
//     restartButton.addEventListener("click", initializeTrivia);
//     return restartButton;
// }
// const questionContainer = document.getElementById("questionContainer") as HTMLElement;
// const firstPageSection = document.querySelector(".firstPage") as HTMLElement;
// const categoryButtons = document.querySelectorAll(".category-button");
// let triviaQuestions: TriviaInfo[] = []; // Håller alla frågor för den valda kategorin
// let currentQuestionIndex = 0;           // Håller reda på vilken fråga vi är på
// let correctAnswersCount = 0;
// let userAnswers: AnswerInfo[] = [];
// categoryButtons.forEach(button => {
//     button.addEventListener("click", () => {
//         const selectedCategory = (button as HTMLElement).dataset.category;
//         if (selectedCategory) {
//             fetchTriviaAPI(selectedCategory);
//             firstPageSection.style.display = "none";
//         }
//     });
// });
// async function fetchTriviaAPI(category: string): Promise<void> {
//     try {
//         const response: Response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=medium&type=multiple`);
//         if (!response.ok) {
//             throw new Error("Någonting gick snett!");
//         }
//         const data = await response.json();
//         triviaQuestions = data.results; // Lagra alla frågor
//         currentQuestionIndex = 0;
//         displayQuestion(data.results[0]);
//     } catch (error) {
//         console.log(error);
//     }
// }
// function displayQuestion(trivia: TriviaInfo): void {
//     questionContainer.innerHTML = '';
//     // Visa frågan
//     const questionElement = document.createElement("h2");
//     questionElement.textContent = decodeHtmlEntities(trivia.question);
//     questionElement.classList.add("question");
//     questionContainer.appendChild(questionElement);
//     // Kombinera och blanda svaren
//     const answers = [...trivia.incorrect_answers, trivia.correct_answer];
//     shuffleArray(answers);
//     // Visa svarsalternativen
//     answers.forEach(answer => {
//         const button = document.createElement("button");
//         button.textContent = decodeHtmlEntities(answer); button.classList.add("answer-button");
//         button.classList.add("answer-button");
//         button.addEventListener("click", () => checkAnswer(answer, trivia.correct_answer));
//         questionContainer.appendChild(button);
//     });
// }
// // Funktionen för att kontrollera svaret
// function checkAnswer(selectedAnswer: string, correctAnswer: string): void {
//     const isCorrect = selectedAnswer === correctAnswer;
//     if (isCorrect) {
//         correctAnswersCount++;
//         sessionStorage.setItem('correctAnswers', correctAnswersCount.toString());
//     }
//     userAnswers.push({
//         question: triviaQuestions[currentQuestionIndex].question,
//         selectedAnswer,
//         correctAnswer,
//         isCorrect,
//     });
//     currentQuestionIndex++;
//     if (currentQuestionIndex < triviaQuestions.length) {
//         displayQuestion(triviaQuestions[currentQuestionIndex]);
//     } else {
//         displayResult();
//     }
// }
// // Funktion för att blanda alternativen
// function shuffleArray(array: any[]): void {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
// }
// function decodeHtmlEntities(text: string): string {
//     const parser = new DOMParser();
//     const decodedString = parser.parseFromString(text, "text/html").documentElement.textContent;
//     return decodedString || text;
// }
// function displayResult(): void {
//     questionContainer.innerHTML = '';
//     const resultElement = document.createElement("h2");
//     resultElement.classList.add("result-header");
//     resultElement.textContent = `Du fick ${correctAnswersCount} av ${triviaQuestions.length} rätt!`;
//     questionContainer.appendChild(resultElement);
//     userAnswers.forEach(answer => {
//         const questionSummary = document.createElement("section");
//         questionSummary.classList.add("question-summary");
//         const questionText = document.createElement("p");
//         questionText.textContent = `Fråga: ${decodeHtmlEntities(answer.question)}`; // Dekodera frågan
//         questionSummary.appendChild(questionText);
//         const userAnswerText = document.createElement("p");
//         userAnswerText.classList.add("result-question");
//         userAnswerText.textContent = `Ditt svar: ${decodeHtmlEntities(answer.selectedAnswer)}`; // Dekodera användarens svar
//         userAnswerText.style.color = answer.isCorrect ? "lightgreen" : "red";
//         questionSummary.appendChild(userAnswerText);
//         const correctAnswerText = document.createElement("p");
//         correctAnswerText.classList.add("result-question");
//         correctAnswerText.textContent = `Rätt svar: ${decodeHtmlEntities(answer.correctAnswer)}`; // Dekodera rätt svar
//         questionSummary.appendChild(correctAnswerText);
//         questionContainer.appendChild(questionSummary);
//     });
//     const restartButton = document.createElement("button");
//     restartButton.classList.add("restart-button")
//     restartButton.textContent = "Starta om";
//     restartButton.addEventListener("click", () => {
//         sessionStorage.clear();
//         correctAnswersCount = 0;
//         userAnswers = [];
//         firstPageSection.style.display = "block"; // Visa första sidan igen
//         questionContainer.innerHTML = ''; // Töm quiz-sektionen
//     });
//     questionContainer.appendChild(restartButton);
// }
