interface TriviaInfo {
    question: string,
    correct_answer: string;
    incorrect_answers: string[];
}

const startButton = document.getElementById("startButton") as HTMLButtonElement;
const questionContainer = document.getElementById("questionContainer") as HTMLElement;
const firstPageSection = document.querySelector(".firstPage") as HTMLElement;

startButton.addEventListener("click", () => {
    fetchTriviaAPI();
    firstPageSection.style.display = "none";
    // firstPageSection.classList.add("d-none");
});

async function fetchTriviaAPI(): Promise<void> {
    try {
        const response: Response = await fetch('https://opentdb.com/api.php?amount=10&category=11&difficulty=medium&type=multiple');
        if (!response.ok) {
            throw ('Någonting gick snett!');
        }
        const data = await response.json();
        console.log(data)
        displayQuestion(data.results[0]);
    } catch (error) {
        console.log(error);
    }
}

function displayQuestion(trivia: TriviaInfo): void {
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
function checkAnswer(selectedAnswer: string, correctAnswer: string): void {
    if (selectedAnswer === correctAnswer) {
        alert("Rätt svar!");
    } else {
        alert("Fel svar, försök igen!");
    }
}

// Funktion för att blanda alternativen
function shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}