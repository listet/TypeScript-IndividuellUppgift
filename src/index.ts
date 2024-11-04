//Interfaces
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

//Laddar upp sidan
window.addEventListener('load', (): void => {
    setupTrivia();
});

//Array för att lagra triviafrågor
let triviaQuestions: TriviaInfo[] = [];
//Håller koll på nuvarande frågeindex
let currentQuestionIndex = 0;
//Räknar antalet korrekta svar
let correctAnswersCount = 0;
//Array för användarens resultat
let userAnswers: AnswerInfo[] = [];

//Funktion som sätter upp triviafrågor 
function setupTrivia(): void {
    //Här används NodeListOf eftersom querySelectorAll returnerar en NodeList av element och är mer 
    // effektiv när man inte behöver fullständig array-funktionalitet
    const categoryButtons = document.querySelectorAll(".category-button") as NodeListOf<HTMLElement>;
    const firstPageSection = document.querySelector(".firstPage") as HTMLElement;

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
async function fetchTriviaAPI(category: string): Promise<void> {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=medium&type=multiple`);
        if (!response.ok) throw new Error("Någonting gick snett!");
        const data = await response.json();
        triviaQuestions = data.results;
        currentQuestionIndex = 0;
        //Kallar på funktionen displayQuestion med de hämtade frågorna samt håller koll på index med start från 0
        displayQuestion(triviaQuestions[currentQuestionIndex]);
    } catch (error) {
        console.error(error);
    }
}

//Funktion som visar triviaFrågorna
function displayQuestion(trivia: TriviaInfo): void {
    const questionContainer = document.getElementById("questionContainer") as HTMLElement;
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
function checkAnswer(selectedAnswer: string, correctAnswer: string): void {
    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) correctAnswersCount++;

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
    } else {
        displayResult();
    }
}

//Visar resultat
function displayResult(): void {
    const questionContainer = document.getElementById("questionContainer") as HTMLElement;
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
function resetQuiz(): void {
    const questionContainer = document.getElementById("questionContainer") as HTMLElement;
    const firstPageSection = document.querySelector(".firstPage") as HTMLElement;

    sessionStorage.clear();
    correctAnswersCount = 0;
    userAnswers = [];
    currentQuestionIndex = 0;

    firstPageSection.style.display = "block";
    questionContainer.innerHTML = "";
}

//Funktion för att shuffla Array
function shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//Funktion för att dekoda HTML-entiteter i text
function decodeHtmlEntities(text: string): string {
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html").documentElement.textContent || text;
}