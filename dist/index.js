var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
window.addEventListener('load', () => {
    setupTrivia();
});
let triviaQuestions = []; //Array för att lagra triviafrågor
let currentQuestionIndex = 0; //Håller koll på nuvarande frågeindex
let correctAnswersCount = 0; //Räknar antalet korrekta svar
let userAnswers = []; //Array för användarens resultat
let areResultsVisible = false; // Flagga för att hålla reda på om resultaten är synliga
//Funktion som sätter upp triviafrågor 
function setupTrivia() {
    //Här används NodeListOf eftersom querySelectorAll returnerar en NodeList av element och är mer effektiv när man inte behöver fullständig array-funktionalitet
    const categoryButtons = document.querySelectorAll(".category-button");
    const firstPageSection = document.querySelector(".firstPage");
    //Ger en lyssnare för varje kategori-knapp och kallas på funktionen fetchTriviaAPI med selectedCategory samt döljer firstPageSection
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedCategory = button.dataset.category;
            if (selectedCategory) {
                fetchTriviaAPI(selectedCategory);
                categoryButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
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
                throw new Error("Something went wrong!");
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
    //Skapar HTML-element för att visa upp index samt fråga
    const questionIndexElement = document.createElement("h2");
    questionIndexElement.textContent = ` Question ${currentQuestionIndex + 1} of ${triviaQuestions.length}`;
    questionIndexElement.classList.add("question");
    questionContainer.appendChild(questionIndexElement);
    const questionElement = document.createElement("h3");
    questionElement.textContent = decodeHtmlEntities(trivia.question);
    questionElement.classList.add("question");
    questionContainer.appendChild(questionElement);
    //Skapar svarsalternativ och blandar som med hjälp av funktion ShuffleArray
    const answers = [...trivia.incorrect_answers, trivia.correct_answer];
    shuffleArray(answers);
    //Skapar en knapp för varje svarsalternativ
    answers.forEach(answer => {
        const answerButton = document.createElement("button");
        answerButton.textContent = decodeHtmlEntities(answer);
        answerButton.classList.add("answer-button");
        answerButton.addEventListener("click", () => checkAnswer(answer, trivia.correct_answer));
        questionContainer.appendChild(answerButton);
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
    resultElement.textContent = `You got ${correctAnswersCount} out of ${triviaQuestions.length} correct answers!`;
    questionContainer.appendChild(resultElement);
    //Visar detaljer för varje fråga
    userAnswers.forEach((answer) => {
        const questionSummary = document.createElement("section");
        questionSummary.classList.add("question-summary");
        const questionText = document.createElement("p");
        questionText.textContent = `Question: ${decodeHtmlEntities(answer.question)}`;
        questionSummary.appendChild(questionText);
        const userAnswerText = document.createElement("p");
        userAnswerText.classList.add("result-question");
        userAnswerText.textContent = `Your answer: ${decodeHtmlEntities(answer.selectedAnswer)}`;
        userAnswerText.style.color = answer.isCorrect ? "lightgreen" : "red";
        questionSummary.appendChild(userAnswerText);
        const correctAnswerText = document.createElement("p");
        correctAnswerText.classList.add("result-question");
        correctAnswerText.textContent = `Correct answer: ${decodeHtmlEntities(answer.correctAnswer)}`;
        questionSummary.appendChild(correctAnswerText);
        questionContainer.appendChild(questionSummary);
    });
    //Skapar och visar restart-knapp
    const restartButton = document.createElement("button");
    restartButton.classList.add("restart-button");
    restartButton.textContent = "Start again";
    restartButton.addEventListener("click", resetQuiz);
    questionContainer.appendChild(restartButton);
    //Skapar knapp som kan toggla för att visa tidigare resultat
    const showPreviousResultsButton = document.createElement("button");
    showPreviousResultsButton.id = "showResultsButton";
    showPreviousResultsButton.textContent = "Show previous results";
    showPreviousResultsButton.addEventListener("click", showPreviousResults);
    questionContainer.appendChild(showPreviousResultsButton);
    //Tar fram vald kategori som ska lagras i sessionstorage
    const selectedCategoryButton = document.querySelector(".category-button.active");
    const selectedCategoryName = selectedCategoryButton ? selectedCategoryButton.textContent || "no category" : "no category";
    // Spara användarens resultat i sessionStorage (kategori och antal rätt svar)
    const previousResults = JSON.parse(sessionStorage.getItem('triviaResults') || '[]');
    previousResults.push({ category: selectedCategoryName, correctAnswersCount });
    sessionStorage.setItem('triviaResults', JSON.stringify(previousResults));
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
    const questionContainer = document.getElementById("questionContainer");
    // Om resultaten redan visas, dölja dem
    if (areResultsVisible) {
        const previousResultsContainer = document.querySelector(".previousResultsContainer");
        if (previousResultsContainer) {
            previousResultsContainer.remove();
        }
        areResultsVisible = false;
        return;
    }
    const previousResultsContainer = document.createElement("section");
    previousResultsContainer.classList.add("previousResultsContainer");
    previousResultsContainer.innerHTML = "<h3>Previous results:</h3>";
    const previousResults = JSON.parse(sessionStorage.getItem('triviaResults') || '[]');
    previousResults.forEach((result, index) => {
        const resultSummary = document.createElement("section");
        resultSummary.classList.add("result-summary");
        resultSummary.innerHTML = `<h4>Result ${index + 1}</h4>`;
        const categoryText = document.createElement("p");
        categoryText.textContent = `Category: ${result.category}`;
        resultSummary.appendChild(categoryText);
        const correctAnswersText = document.createElement("p");
        correctAnswersText.textContent = `Number of correct answers: ${result.correctAnswersCount}`;
        resultSummary.appendChild(correctAnswersText);
        previousResultsContainer.appendChild(resultSummary);
    });
    questionContainer.appendChild(previousResultsContainer);
    areResultsVisible = true;
}
