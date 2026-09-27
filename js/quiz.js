"use strict";


import {
    saveAttempt
} from "./storage.js";


let currentQuiz = null;

let currentQuestion = 0;

let correctAnswers = 0;

let answered = false;


/* =========================================
   INICIAR QUIZ
========================================= */

export function startQuiz(
    quiz,
    callbacks
) {

    currentQuiz = quiz;

    currentQuestion = 0;

    correctAnswers = 0;

    answered = false;


    renderQuestion(
        callbacks
    );
}


/* =========================================
   RENDERIZAR PREGUNTA
========================================= */

function renderQuestion(callbacks) {

    if (!currentQuiz) {
        return;
    }


    const question =
        currentQuiz.questions[
            currentQuestion
        ];


    answered = false;


    const questionElement =
        document.getElementById(
            "play-question"
        );


    const counterElement =
        document.getElementById(
            "play-counter"
        );


    const titleElement =
        document.getElementById(
            "play-title"
        );


    const categoryElement =
        document.getElementById(
            "playing-category"
        );


    const optionsContainer =
        document.getElementById(
            "play-options"
        );


    const feedback =
        document.getElementById(
            "play-feedback"
        );


    const checkButton =
        document.getElementById(
            "check-answer-button"
        );


    const nextButton =
        document.getElementById(
            "next-question-button"
        );


    titleElement.textContent =
        currentQuiz.title;


    categoryElement.textContent =
        currentQuiz.category ||
        "General";


    counterElement.textContent =
        `Pregunta ${
            currentQuestion + 1
        } de ${
            currentQuiz.questions.length
        }`;


    questionElement.textContent =
        question.question;


    optionsContainer.innerHTML = "";


    feedback.hidden = true;

    feedback.textContent = "";

    feedback.className =
        "play-feedback";


    checkButton.hidden = false;

    nextButton.hidden = true;


    renderImage(
        question,
        optionsContainer
    );


    renderOptions(
        question,
        optionsContainer
    );


    updateProgress();


    callbacks?.onQuestionRendered?.();
}


/* =========================================
   IMAGEN
========================================= */

function renderImage(
    question,
    container
) {

    if (!question.image) {
        return;
    }


    const image =
        document.createElement("img");


    image.src =
        question.image;


    image.alt =
        "Imagen de la pregunta";


    image.style.cssText = `
        width: 100%;
        max-height: 300px;
        object-fit: contain;
        border-radius: 12px;
        margin-bottom: 20px;
        border: 1px solid var(--border);
    `;


    image.addEventListener(
        "error",
        () => {

            image.remove();

        }
    );


    container.before(image);
}


/* =========================================
   OPCIONES
========================================= */

function renderOptions(
    question,
    container
) {

    const isMultiple =
        question.type === "multiple";


    const entries =
        Object.entries(
            question.options
        );


    entries.forEach(
        ([key, text]) => {

            if (!text) {
                return;
            }


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                `play-option ${
                    isMultiple
                        ? "multiple"
                        : ""
                }`;


            const input =
                document.createElement(
                    "input"
                );


            input.type =
                isMultiple
                    ? "checkbox"
                    : "radio";


            input.name =
                isMultiple
                    ? "quiz-answer[]"
                    : "quiz-answer";


            input.value =
                key;


            input.id =
                `play-${key}`;


            const label =
                document.createElement(
                    "label"
                );


            label.htmlFor =
                input.id;


            if (isMultiple) {

                const mark =
                    document.createElement(
                        "span"
                    );

                mark.className =
                    "checkbox-mark";

                mark.setAttribute(
                    "aria-hidden",
                    "true"
                );

                label.appendChild(
                    mark
                );

            } else {

                const letter =
                    document.createElement(
                        "span"
                    );

                letter.className =
                    "option-letter";

                letter.textContent =
                    key.toUpperCase();

                label.appendChild(
                    letter
                );
            }


            const textElement =
                document.createElement(
                    "span"
                );


            textElement.textContent =
                text;


            label.appendChild(
                textElement
            );


            wrapper.appendChild(
                input
            );

            wrapper.appendChild(
                label
            );


            container.appendChild(
                wrapper
            );
        }
    );
}


/* =========================================
   OBTENER RESPUESTA
========================================= */

function getSelectedAnswers() {

    const selected =
        document.querySelectorAll(
            "#play-options input:checked"
        );


    return Array.from(
        selected
    ).map(
        input => input.value
    );
}


/* =========================================
   COMPROBAR
========================================= */

export function checkCurrentAnswer() {

    if (
        !currentQuiz ||
        answered
    ) {

        return {
            valid: false
        };
    }


    const question =
        currentQuiz.questions[
            currentQuestion
        ];


    const selected =
        getSelectedAnswers();


    if (selected.length === 0) {

        showFeedback(
            "Selecciona una respuesta antes de continuar.",
            "error"
        );


        return {
            valid: false
        };
    }


    const isCorrect =
        evaluateAnswer(
            question,
            selected
        );


    if (isCorrect) {

        correctAnswers++;

    }


    answered = true;


    showAnswerResult(
        question,
        isCorrect
    );


    return {
        valid: true,
        correct: isCorrect
    };
}


/* =========================================
   EVALUAR
========================================= */

function evaluateAnswer(
    question,
    selected
) {

    if (
        question.type ===
        "multiple"
    ) {

        const expected =
            Array.isArray(
                question.correct
            )
                ? [...question.correct]
                : [];


        const actual =
            [...selected];


        expected.sort();
        actual.sort();


        return (
            expected.length ===
                actual.length &&
            expected.every(
                (value, index) =>
                    value === actual[index]
            )
        );
    }


    return (
        selected[0] ===
        question.correct
    );
}


/* =========================================
   RESULTADO DE RESPUESTA
========================================= */

function showAnswerResult(
    question,
    isCorrect
) {

    const feedback =
        document.getElementById(
            "play-feedback"
        );


    const correctText =
        getCorrectAnswerText(
            question
        );


    if (isCorrect) {

        feedback.textContent =
            "✓ ¡Respuesta correcta!";

        feedback.className =
            "play-feedback success";

    } else {

        feedback.textContent =
            `✕ Respuesta incorrecta. ${
                correctText
            }`;

        feedback.className =
            "play-feedback error";
    }


    feedback.hidden = false;


    markAnswerOptions(
        question,
        isCorrect
    );


    document.getElementById(
        "check-answer-button"
    ).hidden = true;


    document.getElementById(
        "next-question-button"
    ).hidden = false;
}


/* =========================================
   MARCAR OPCIONES
========================================= */

function markAnswerOptions(
    question,
    isCorrect
) {

    const selected =
        getSelectedAnswers();


    const correct =
        Array.isArray(
            question.correct
        )
            ? question.correct
            : [question.correct];


    document
        .querySelectorAll(
            "#play-options .play-option"
        )
        .forEach(
            option => {

                const input =
                    option.querySelector(
                        "input"
                    );


                const value =
                    input.value;


                if (
                    correct.includes(
                        value
                    )
                ) {

                    option.classList.add(
                        "correct"
                    );
                }


                if (
                    selected.includes(
                        value
                    ) &&
                    !correct.includes(
                        value
                    )
                ) {

                    option.classList.add(
                        "incorrect"
                    );
                }


                option.classList.add(
                    "disabled"
                );


                input.disabled = true;
            }
        );
}


/* =========================================
   TEXTO DE RESPUESTA
========================================= */

function getCorrectAnswerText(
    question
) {

    const correct =
        Array.isArray(
            question.correct
        )
            ? question.correct
            : [question.correct];


    const texts =
        correct.map(
            key =>
                question.options[key]
        );


    return `Respuesta correcta: ${texts.join(
        ", "
    )}.`;
}


/* =========================================
   FEEDBACK
========================================= */

function showFeedback(
    message,
    type
) {

    const feedback =
        document.getElementById(
            "play-feedback"
        );


    feedback.textContent =
        message;


    feedback.className =
        `play-feedback ${type}`;


    feedback.hidden = false;
}


/* =========================================
   SIGUIENTE
========================================= */

export function nextQuestion(
    callbacks
) {

    if (!answered) {
        return;
    }


    currentQuestion++;


    if (
        currentQuestion >=
        currentQuiz.questions.length
    ) {

        finishQuiz(
            callbacks
        );

        return;
    }


    renderQuestion(
        callbacks
    );
}


/* =========================================
   FINALIZAR
========================================= */

function finishQuiz(
    callbacks
) {

    const total =
        currentQuiz.questions.length;


    const percentage =
        Math.round(
            (correctAnswers / total) *
                100
        );


    saveAttempt({

        quizId:
            currentQuiz.id,

        quizTitle:
            currentQuiz.title,

        correct:
            correctAnswers,

        incorrect:
            total - correctAnswers,

        total,

        percentage
    });


    callbacks?.onFinished?.({

        quiz:
            currentQuiz,

        correct:
            correctAnswers,

        incorrect:
            total - correctAnswers,

        total,

        percentage
    });
}


/* =========================================
   PROGRESO
========================================= */

function updateProgress() {

    const total =
        currentQuiz.questions.length;


    const percentage =
        ((currentQuestion + 1) /
            total) *
        100;


    const progress =
        document.getElementById(
            "quiz-progress"
        );


    progress.style.width =
        `${percentage}%`;


    const container =
        document.querySelector(
            ".progress-container"
        );


    container.setAttribute(
        "aria-valuenow",
        Math.round(percentage)
    );
}