var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const questionContainer = document.getElementById("questionContainer");
const firstPageSection = document.querySelector(".firstPage");
const categoryButtons = document.querySelectorAll(".category-button");
let triviaQuestions = []; // Håller alla frågor för den valda kategorin
let currentQuestionIndex = 0; // Håller reda på vilken fråga vi är på
let correctAnswersCount = 0;
let userAnswers = [];
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.category;
        if (selectedCategory) {
            fetchTriviaAPI(selectedCategory);
            firstPageSection.style.display = "none";
        }
    });
});
// async function fetchCategories() {
//     try {
//         const response = await fetch('https://opentdb.com/api_category.php');
//         if (!response.ok) {
//             throw new Error("Någonting gick snett!");
//         }
//         const data = await response.json();
//         console.log(data); // Logga hela data-objektet för att se strukturen
//         // Logga varje kategori med dess ID
//         data.trivia_categories.forEach(category => {
//             console.log(`ID: ${category.id}, Namn: ${category.name}`);
//         });
//     } catch (error) {
//         console.error(error);
//     }
// }
// // Kalla funktionen för att hämta och logga kategorier
// fetchCategories();
function fetchTriviaAPI(category) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=medium&type=multiple`);
            if (!response.ok) {
                throw new Error("Någonting gick snett!");
            }
            const data = yield response.json();
            triviaQuestions = data.results; // Lagra alla frågor
            currentQuestionIndex = 0;
            displayQuestion(data.results[0]);
        }
        catch (error) {
            console.log(error);
        }
    });
}
function displayQuestion(trivia) {
    questionContainer.innerHTML = '';
    // Visa frågan
    const questionElement = document.createElement("h2");
    questionElement.textContent = decodeHtmlEntities(trivia.question);
    questionElement.classList.add("question");
    questionContainer.appendChild(questionElement);
    // Kombinera och blanda svaren
    const answers = [...trivia.incorrect_answers, trivia.correct_answer];
    shuffleArray(answers);
    // Visa svarsalternativen
    answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = decodeHtmlEntities(answer);
        button.classList.add("answer-button");
        button.classList.add("answer-button");
        button.addEventListener("click", () => checkAnswer(answer, trivia.correct_answer));
        questionContainer.appendChild(button);
    });
}
// Funktionen för att kontrollera svaret
function checkAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) {
        correctAnswersCount++;
        sessionStorage.setItem('correctAnswers', correctAnswersCount.toString());
    }
    userAnswers.push({
        question: triviaQuestions[currentQuestionIndex].question,
        selectedAnswer,
        correctAnswer,
        isCorrect,
    });
    currentQuestionIndex++;
    if (currentQuestionIndex < triviaQuestions.length) {
        displayQuestion(triviaQuestions[currentQuestionIndex]);
    }
    else {
        displayResult();
    }
}
// Funktion för att blanda alternativen
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function decodeHtmlEntities(text) {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(text, "text/html").documentElement.textContent;
    return decodedString || text;
}
function displayResult() {
    questionContainer.innerHTML = '';
    const resultElement = document.createElement("h2");
    resultElement.classList.add("result-header");
    resultElement.textContent = `Du fick ${correctAnswersCount} av ${triviaQuestions.length} rätt!`;
    questionContainer.appendChild(resultElement);
    userAnswers.forEach(answer => {
        const questionSummary = document.createElement("section");
        questionSummary.classList.add("question-summary");
        const questionText = document.createElement("p");
        questionText.classList.add("result-question");
        questionText.textContent = `Fråga: ${decodeHtmlEntities(answer.question)}`; // Dekodera frågan
        questionSummary.appendChild(questionText);
        const userAnswerText = document.createElement("p");
        userAnswerText.classList.add("result-question");
        userAnswerText.textContent = `Ditt svar: ${decodeHtmlEntities(answer.selectedAnswer)}`; // Dekodera användarens svar
        userAnswerText.style.color = answer.isCorrect ? "green" : "red";
        questionSummary.appendChild(userAnswerText);
        const correctAnswerText = document.createElement("p");
        correctAnswerText.classList.add("result-question");
        correctAnswerText.textContent = `Rätt svar: ${decodeHtmlEntities(answer.correctAnswer)}`; // Dekodera rätt svar
        questionSummary.appendChild(correctAnswerText);
        questionContainer.appendChild(questionSummary);
    });
    const restartButton = document.createElement("button");
    restartButton.classList.add("restart-button");
    restartButton.textContent = "Starta om";
    restartButton.addEventListener("click", () => {
        sessionStorage.clear();
        correctAnswersCount = 0;
        userAnswers = [];
        firstPageSection.style.display = "block"; // Visa första sidan igen
        questionContainer.innerHTML = ''; // Töm quiz-sektionen
    });
    questionContainer.appendChild(restartButton);
}
