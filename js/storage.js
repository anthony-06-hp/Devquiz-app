"use strict";

const QUIZZES_KEY = "devquiz_quizzes";
const HISTORY_KEY = "devquiz_history";
const THEME_KEY = "devquiz_theme";


/* =========================================
   HELPERS
========================================= */

function generateId() {
    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================
   QUIZZES
========================================= */

export function getQuizzes() {

    try {

        const data =
            localStorage.getItem(QUIZZES_KEY);

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        console.error(
            "No se pudieron cargar los cuestionarios:",
            error
        );

        return [];
    }
}


export function saveQuiz(quiz) {

    const quizzes = getQuizzes();

    const quizToSave = {
        ...quiz,

        id:
            quiz.id ||
            generateId(),

        updatedAt:
            new Date().toISOString()
    };


    const existingIndex =
        quizzes.findIndex(
            item => item.id === quizToSave.id
        );


    if (existingIndex >= 0) {

        quizzes[existingIndex] =
            quizToSave;

    } else {

        quizzes.push(quizToSave);
    }


    localStorage.setItem(
        QUIZZES_KEY,
        JSON.stringify(quizzes)
    );


    return quizToSave;
}


export function deleteQuiz(id) {

    const quizzes =
        getQuizzes()
            .filter(
                quiz => quiz.id !== id
            );

    localStorage.setItem(
        QUIZZES_KEY,
        JSON.stringify(quizzes)
    );
}


export function getQuizById(id) {

    return getQuizzes()
        .find(
            quiz => quiz.id === id
        );
}


/* =========================================
   HISTORIAL
========================================= */

export function getHistory() {

    try {

        const data =
            localStorage.getItem(HISTORY_KEY);

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        console.error(
            "No se pudo cargar el historial:",
            error
        );

        return [];
    }
}


export function saveAttempt(attempt) {

    const history =
        getHistory();

    history.unshift({
        id: generateId(),
        ...attempt,
        date:
            new Date().toISOString()
    });


    const limitedHistory =
        history.slice(0, 100);


    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(limitedHistory)
    );
}


/* =========================================
   TEMA
========================================= */

export function getTheme() {

    return localStorage.getItem(
        THEME_KEY
    );
}


export function saveTheme(theme) {

    localStorage.setItem(
        THEME_KEY,
        theme
    );
}