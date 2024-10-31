var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const startButton = document.getElementById("startButton");
const questionContainer = document.getElementById("questionContainer");
const firstPageSection = document.querySelector(".firstPage");
startButton.addEventListener("click", () => {
    fetchTriviaAPI();
    firstPageSection.style.display = "none";
    // firstPageSection.classList.add("d-none");
});
function fetchTriviaAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('https://opentdb.com/api.php?amount=10&category=11&difficulty=medium&type=multiple');
            if (!response.ok) {
                throw ('Någonting gick snett!');
            }
            const data = yield response.json();
            console.log(data);
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
    questionElement.textContent = trivia.question;
    questionContainer.appendChild(questionElement);
    // Kombinera och blanda svaren
    const answers = [...trivia.incorrect_answers, trivia.correct_answer];
    shuffleArray(answers);
    // Visa svarsalternativen
    answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.classList.add("answer-button");
        button.addEventListener("click", () => checkAnswer(answer, trivia.correct_answer));
        questionContainer.appendChild(button);
    });
}
// Funktionen för att kontrollera svaret
function checkAnswer(selectedAnswer, correctAnswer) {
    if (selectedAnswer === correctAnswer) {
        alert("Rätt svar!");
    }
    else {
        alert("Fel svar, försök igen!");
    }
}
// Funktion för att blanda alternativen
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
