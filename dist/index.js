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
});
let triviaQuestions = []; //Array för att lagra triviafrågor
let currentQuestionIndex = 0; //Håller koll på nuvarande frågeindex
let correctAnswersCount = 0; //Räknar antalet korrekta svar
let userAnswers = []; //Array för användarens resultat
//Funktion som sätter upp triviafrågor 
function setupTrivia() {
    //Här används NodeListOf eftersom querySelectorAll returnerar en NodeList av element och är mer 
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
                categoryButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
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
    //För att se tidigare resultat
    const selectedCategoryButton = document.querySelector(".category-button.active");
    const selectedCategoryName = selectedCategoryButton ? selectedCategoryButton.textContent || "Ingen kategori" : "Ingen kategori";
    // Spara användarens resultat i sessionStorage (kategori och antal rätt)
    const previousResults = JSON.parse(sessionStorage.getItem('triviaResults') || '[]');
    previousResults.push({ category: selectedCategoryName, correctAnswersCount, date: new Date().toLocaleString() });
    sessionStorage.setItem('triviaResults', JSON.stringify(previousResults));
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
    //Skapar knapp som kan toggla för att visa tidigare resultat
    const showPreviousResultsButton = document.createElement("button");
    showPreviousResultsButton.id = "showResultsButton"; // Ge knappen ett id för att kunna referera till den senare
    showPreviousResultsButton.textContent = "Visa tidigare resultat";
    showPreviousResultsButton.addEventListener("click", showPreviousResults);
    questionContainer.appendChild(showPreviousResultsButton);
}
//Funktion för att starta om Quiz
function resetQuiz() {
    const questionContainer = document.getElementById("questionContainer");
    const firstPageSection = document.querySelector(".firstPage");
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
//Funktion som visar tidigare resultat
function showPreviousResults() {
    const previousResultsContainer = document.createElement("section");
    previousResultsContainer.classList.add("previousResultsContainer");
    const previousResults = JSON.parse(sessionStorage.getItem('triviaResults') || '[]');
    previousResultsContainer.innerHTML = "<h2>Tidigare resultat:</h2>";
    previousResults.forEach((result, index) => {
        const resultSummary = document.createElement("div");
        resultSummary.classList.add("result-summary");
        resultSummary.innerHTML = `<h3>Resultat ${index + 1}</h3>`;
        const categoryText = document.createElement("p");
        categoryText.textContent = `Kategori: ${result.category}`;
        resultSummary.appendChild(categoryText);
        const correctAnswersText = document.createElement("p");
        correctAnswersText.textContent = `Antal rätt: ${result.correctAnswersCount}`;
        resultSummary.appendChild(correctAnswersText);
        previousResultsContainer.appendChild(resultSummary);
    });
    const questionContainer = document.getElementById("questionContainer");
    questionContainer.appendChild(previousResultsContainer);
}
