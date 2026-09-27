"use strict";


import {
    getQuizzes,
    saveQuiz,
    deleteQuiz,
    getQuizById,
    getHistory,
    getTheme,
    saveTheme
} from "./storage.js";


import {
    initEditor,
    addQuestion,
    getEditorQuestions,
    loadQuestions,
    clearEditor
} from "./quiz-editor.js";


import {
    startQuiz,
    checkCurrentAnswer,
    nextQuestion
} from "./quiz.js";


/* =========================================
   ESTADO
========================================= */

const state = {

    currentView: "home",

    editingQuizId: null,

    playingQuizId: null,

    lastFinishedQuiz: null
};


/* =========================================
   ELEMENTOS
========================================= */

const elements = {

    views: document.querySelectorAll(
        ".view"
    ),

    navButtons: document.querySelectorAll(
        ".nav-button"
    ),

    homeView:
        document.getElementById(
            "home-view"
        ),

    createView:
        document.getElementById(
            "create-view"
        ),

    quizView:
        document.getElementById(
            "quiz-view"
        ),

    resultView:
        document.getElementById(
            "result-view"
        ),

    historyView:
        document.getElementById(
            "history-view"
        ),

    quizList:
        document.getElementById(
            "quiz-list"
        ),

    emptyState:
        document.getElementById(
            "empty-state"
        ),

    totalQuizzes:
        document.getElementById(
            "total-quizzes"
        ),

    totalQuestions:
        document.getElementById(
            "total-questions"
        ),

    totalAttempts:
        document.getElementById(
            "total-attempts"
        ),

    averageScore:
        document.getElementById(
            "average-score"
        ),

    createQuizButton:
        document.getElementById(
            "create-quiz-button"
        ),

    createFirstButton:
        document.getElementById(
            "create-first-button"
        ),

    emptyCreateButton:
        document.getElementById(
            "empty-create-button"
        ),

    brandLink:
        document.getElementById(
            "brand-link"
        ),

    editorForm:
        document.getElementById(
            "quiz-editor-form"
        ),

    quizId:
        document.getElementById(
            "quiz-id"
        ),

    quizTitle:
        document.getElementById(
            "quiz-title"
        ),

    quizCategory:
        document.getElementById(
            "quiz-category"
        ),

    quizDescription:
        document.getElementById(
            "quiz-description"
        ),

    editorTitle:
        document.getElementById(
            "editor-title"
        ),

    cancelEditor:
        document.getElementById(
            "cancel-editor-button"
        ),

    backHomeEditor:
        document.getElementById(
            "back-home-from-editor"
        ),

    exitQuiz:
        document.getElementById(
            "exit-quiz-button"
        ),

    checkAnswer:
        document.getElementById(
            "check-answer-button"
        ),

    nextQuestion:
        document.getElementById(
            "next-question-button"
        ),

    retryQuiz:
        document.getElementById(
            "retry-quiz-button"
        ),

    resultHome:
        document.getElementById(
            "result-home-button"
        ),

    historyList:
        document.getElementById(
            "history-list"
        ),

    emptyHistory:
        document.getElementById(
            "empty-history"
        ),

    historyHome:
        document.getElementById(
            "history-home-button"
        ),

    themeToggle:
        document.getElementById(
            "theme-toggle"
        ),

    toast:
        document.getElementById(
            "toast"
        )
};


/* =========================================
   INICIALIZAR
========================================= */

function init() {

    initEditor();

    bindEvents();

    loadSavedTheme();

    renderHome();

    showView("home");
}


function bindEvents() {

    /* Navegación */

    elements.navButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showView(
                        button.dataset.view
                    );

                }
            );
        }
    );


    /* Inicio */

    elements.brandLink.addEventListener(
        "click",
        event => {

            event.preventDefault();

            showView("home");
        }
    );


    elements.createQuizButton.addEventListener(
        "click",
        () => {

            openCreateView();
        }
    );


    elements.createFirstButton.addEventListener(
        "click",
        () => {

            openCreateView();
        }
    );


    elements.emptyCreateButton.addEventListener(
        "click",
        () => {

            openCreateView();
        }
    );


    /* Editor */

    elements.editorForm.addEventListener(
        "submit",
        handleEditorSubmit
    );


    elements.cancelEditor.addEventListener(
        "click",
        () => {

            showView("home");
        }
    );


    elements.backHomeEditor.addEventListener(
        "click",
        () => {

            showView("home");
        }
    );


    /* Quiz */

    elements.checkAnswer.addEventListener(
        "click",
        () => {

            checkCurrentAnswer();
        }
    );


    elements.nextQuestion.addEventListener(
        "click",
        () => {

            nextQuestion({

                onFinished:
                    showResults
            });
        }
    );


    elements.exitQuiz.addEventListener(
        "click",
        () => {

            if (
                confirm(
                    "¿Seguro que deseas salir del cuestionario?"
                )
            ) {

                showView("home");
            }
        }
    );


    /* Resultados */

    elements.retryQuiz.addEventListener(
        "click",
        () => {

            const quiz =
                getQuizById(
                    state.playingQuizId
                );


            if (quiz) {

                startPlayingQuiz(
                    quiz
                );
            }
        }
    );


    elements.resultHome.addEventListener(
        "click",
        () => {

            renderHome();

            showView("home");
        }
    );


    /* Historial */

    elements.historyHome.addEventListener(
        "click",
        () => {

            showView("home");
        }
    );


    /* Tema */

    elements.themeToggle.addEventListener(
        "click",
        toggleTheme
    );


    /* Acciones dinámicas */

    elements.quizList.addEventListener(
        "click",
        handleQuizListClick
    );
}


/* =========================================
   CAMBIAR VISTA
========================================= */

function showView(viewName) {

    state.currentView =
        viewName;


    elements.views.forEach(
        view => {

            const shouldShow =
                view.id ===
                `${viewName}-view`;


            view.hidden =
                !shouldShow;


            view.classList.toggle(
                "active-view",
                shouldShow
            );
        }
    );


    elements.navButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.view ===
                    viewName
            );
        }
    );


    if (viewName === "home") {

        renderHome();
    }


    if (viewName === "history") {

        renderHistory();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   HOME
========================================= */

function renderHome() {

    const quizzes =
        getQuizzes();


    const history =
        getHistory();


    renderQuizList(
        quizzes
    );


    updateDashboardStats(
        quizzes,
        history
    );
}


/* =========================================
   LISTA DE QUIZZES
========================================= */

function renderQuizList(
    quizzes
) {

    elements.quizList.innerHTML = "";


    if (quizzes.length === 0) {

        elements.emptyState.hidden =
            false;

        return;
    }


    elements.emptyState.hidden =
        true;


    quizzes.forEach(
        quiz => {

            const card =
                createQuizCard(
                    quiz
                );


            elements.quizList.appendChild(
                card
            );
        }
    );
}


/* =========================================
   TARJETA
========================================= */

function createQuizCard(
    quiz
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "quiz-list-card";


    article.dataset.quizId =
        quiz.id;


    const category =
        quiz.category ||
        "General";


    const description =
        quiz.description ||
        "Cuestionario personalizado.";


    const questionCount =
        quiz.questions?.length ||
        0;


    article.innerHTML = `

        <div class="quiz-card-top">

            <span class="quiz-category">
                ${escapeHTML(category)}
            </span>

            <button
                class="delete-button"
                type="button"
                data-action="delete"
                aria-label="Eliminar ${escapeHTML(
                    quiz.title
                )}"
            >
                🗑
            </button>

        </div>


        <h3>
            ${escapeHTML(quiz.title)}
        </h3>


        <p class="quiz-description">
            ${escapeHTML(description)}
        </p>


        <div class="quiz-meta">

            <span>
                ❓ ${questionCount}
                ${
                    questionCount === 1
                        ? "pregunta"
                        : "preguntas"
                }
            </span>

            <span>
                📝 Personalizado
            </span>

        </div>


        <div class="quiz-card-actions">

            <button
                class="button button-primary"
                type="button"
                data-action="play"
            >
                ▶ Jugar
            </button>

            <button
                class="button button-secondary"
                type="button"
                data-action="edit"
            >
                Editar
            </button>

        </div>
    `;


    return article;
}


/* =========================================
   ACCIONES DE QUIZ
========================================= */

function handleQuizListClick(
    event
) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const card =
        button.closest(
            ".quiz-list-card"
        );


    const quizId =
        card.dataset.quizId;


    const action =
        button.dataset.action;


    if (action === "play") {

        const quiz =
            getQuizById(
                quizId
            );


        if (quiz) {

            startPlayingQuiz(
                quiz
            );
        }
    }


    if (action === "edit") {

        openEditView(
            quizId
        );
    }


    if (action === "delete") {

        handleDeleteQuiz(
            quizId
        );
    }
}


/* =========================================
   CREAR
========================================= */

function openCreateView() {

    state.editingQuizId =
        null;


    elements.editorTitle.textContent =
        "Crear cuestionario";


    elements.quizId.value =
        "";


    elements.quizTitle.value =
        "";


    elements.quizCategory.value =
        "";


    elements.quizDescription.value =
        "";


    clearEditor();


    addQuestion();


    showView("create");


    elements.quizTitle.focus();
}


/* =========================================
   EDITAR
========================================= */

function openEditView(
    quizId
) {

    const quiz =
        getQuizById(
            quizId
        );


    if (!quiz) {
        return;
    }


    state.editingQuizId =
        quizId;


    elements.editorTitle.textContent =
        "Editar cuestionario";


    elements.quizId.value =
        quiz.id;


    elements.quizTitle.value =
        quiz.title;


    elements.quizCategory.value =
        quiz.category || "";


    elements.quizDescription.value =
        quiz.description || "";


    loadQuestions(
        quiz.questions
    );


    showView("create");


    elements.quizTitle.focus();
}


/* =========================================
   GUARDAR
========================================= */

function handleEditorSubmit(
    event
) {

    event.preventDefault();


    const title =
        elements.quizTitle.value.trim();


    if (!title) {

        showToast(
            "Escribe un título para el cuestionario.",
            "error"
        );


        elements.quizTitle.focus();

        return;
    }


    const questions =
        getEditorQuestions();


    if (questions.length === 0) {

        showToast(
            "Agrega al menos una pregunta.",
            "error"
        );

        return;
    }


    const valid =
        validateQuestions(
            questions
        );


    if (!valid) {
        return;
    }


    const existingQuiz =
        state.editingQuizId
            ? getQuizById(
                state.editingQuizId
            )
            : null;


    const quiz = {

        id:
            state.editingQuizId ||
            undefined,

        title,

        category:
            elements.quizCategory
                .value
                .trim() ||
            "General",

        description:
            elements.quizDescription
                .value
                .trim(),

        questions,

        createdAt:
            existingQuiz?.createdAt ||
            new Date().toISOString()
    };


    saveQuiz(
        quiz
    );


    showToast(
        state.editingQuizId
            ? "Cuestionario actualizado."
            : "Cuestionario creado.",
        "success"
    );


    renderHome();

    showView("home");
}


/* =========================================
   VALIDAR PREGUNTAS
========================================= */

function validateQuestions(
    questions
) {

    for (
        let index = 0;
        index < questions.length;
        index++
    ) {

        const question =
            questions[index];


        if (!question.question) {

            showToast(
                `La pregunta ${
                    index + 1
                } no tiene texto.`,
                "error"
            );

            return false;
        }


        const options =
            Object.values(
                question.options
            )
            .filter(
                value =>
                    value.trim()
            );


        if (
            options.length < 2
        ) {

            showToast(
                `La pregunta ${
                    index + 1
                } necesita al menos 2 respuestas.`,
                "error"
            );

            return false;
        }


        if (
            question.type ===
            "multiple"
        ) {

            if (
                !Array.isArray(
                    question.correct
                ) ||
                question.correct.length ===
                    0
            ) {

                showToast(
                    `Selecciona al menos una respuesta correcta en la pregunta ${
                        index + 1
                    }.`,
                    "error"
                );

                return false;
            }

        } else {

            if (!question.correct) {

                showToast(
                    `Selecciona la respuesta correcta en la pregunta ${
                        index + 1
                    }.`,
                    "error"
                );

                return false;
            }
        }
    }


    return true;
}


/* =========================================
   ELIMINAR
========================================= */

function handleDeleteQuiz(
    quizId
) {

    const quiz =
        getQuizById(
            quizId
        );


    if (!quiz) {
        return;
    }


    const confirmed =
        confirm(
            `¿Quieres eliminar "${quiz.title}"?`
        );


    if (!confirmed) {
        return;
    }


    deleteQuiz(
        quizId
    );


    renderHome();


    showToast(
        "Cuestionario eliminado.",
        "success"
    );
}


/* =========================================
   JUGAR
========================================= */

function startPlayingQuiz(
    quiz
) {

    if (
        !quiz.questions ||
        quiz.questions.length === 0
    ) {

        showToast(
            "Este cuestionario no tiene preguntas.",
            "error"
        );

        return;
    }


    state.playingQuizId =
        quiz.id;


    showView("quiz");


    startQuiz(
        quiz,
        {
            onQuestionRendered: () => {

                document
                    .getElementById(
                        "play-question"
                    )
                    .focus?.();
            }
        }
    );
}


/* =========================================
   RESULTADOS
========================================= */

function showResults(
    result
) {

    state.lastFinishedQuiz =
        result;


    document.getElementById(
        "final-percentage"
    ).textContent =
        `${result.percentage}%`;


    document.getElementById(
        "result-correct"
    ).textContent =
        result.correct;


    document.getElementById(
        "result-incorrect"
    ).textContent =
        result.incorrect;


    document.getElementById(
        "result-total"
    ).textContent =
        result.total;


    document.getElementById(
        "result-message"
    ).textContent =
        getResultMessage(
            result.percentage
        );


    showView("result");


    setTimeout(
        () => {

            elements.resultView.focus();

        },
        0
    );
}


/* =========================================
   MENSAJE RESULTADO
========================================= */

function getResultMessage(
    percentage
) {

    if (percentage === 100) {

        return "¡Excelente! Respondiste correctamente todas las preguntas.";

    }


    if (percentage >= 80) {

        return "¡Muy buen resultado! Tienes un buen dominio del tema.";

    }


    if (percentage >= 60) {

        return "Buen trabajo. Sigue practicando para mejorar.";

    }


    return "Puedes volver a intentarlo y reforzar los temas que necesitas practicar.";
}


/* =========================================
   HISTORIAL
========================================= */

function renderHistory() {

    const history =
        getHistory();


    elements.historyList.innerHTML =
        "";


    if (history.length === 0) {

        elements.emptyHistory.hidden =
            false;

        return;
    }


    elements.emptyHistory.hidden =
        true;


    history.forEach(
        attempt => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "quiz-list-card";


            const date =
                new Date(
                    attempt.date
                ).toLocaleString(
                    "es-EC",
                    {
                        dateStyle: "medium",
                        timeStyle: "short"
                    }
                );


            article.innerHTML = `

                <div class="quiz-card-top">

                    <span class="quiz-category">
                        ${attempt.percentage}%
                    </span>

                    <span class="quiz-meta">
                        ${escapeHTML(date)}
                    </span>

                </div>


                <h3>
                    ${escapeHTML(
                        attempt.quizTitle
                    )}
                </h3>


                <div class="quiz-meta">

                    <span>
                        ✓ ${attempt.correct}
                        correctas
                    </span>

                    <span>
                        ✕ ${attempt.incorrect}
                        incorrectas
                    </span>

                    <span>
                        ${attempt.total}
                        preguntas
                    </span>

                </div>
            `;


            elements.historyList.appendChild(
                article
            );
        }
    );
}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboardStats(
    quizzes,
    history
) {

    const totalQuestions =
        quizzes.reduce(
            (
                total,
                quiz
            ) =>
                total +
                (
                    quiz.questions?.length ||
                    0
                ),
            0
        );


    const average =
        history.length
            ? Math.round(
                history.reduce(
                    (
                        total,
                        attempt
                    ) =>
                        total +
                        attempt.percentage,
                    0
                ) /
                history.length
            )
            : 0;


    elements.totalQuizzes.textContent =
        quizzes.length;


    elements.totalQuestions.textContent =
        totalQuestions;


    elements.totalAttempts.textContent =
        history.length;


    elements.averageScore.textContent =
        `${average}%`;
}


/* =========================================
   TEMA
========================================= */

function loadSavedTheme() {

    const theme =
        getTheme();


    if (theme === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

        elements.themeToggle.textContent =
            "☀️";

    } else {

        elements.themeToggle.textContent =
            "🌙";
    }
}


function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark-theme"
        );


    saveTheme(
        isDark
            ? "dark"
            : "light"
    );


    elements.themeToggle.textContent =
        isDark
            ? "☀️"
            : "🌙";
}


/* =========================================
   TOAST
========================================= */

let toastTimeout;


function showToast(
    message,
    type = ""
) {

    clearTimeout(
        toastTimeout
    );


    elements.toast.textContent =
        message;


    elements.toast.className =
        `toast ${type}`;


    elements.toast.hidden =
        false;


    toastTimeout =
        setTimeout(
            () => {

                elements.toast.hidden =
                    true;

            },
            3000
        );
}


/* =========================================
   SEGURIDAD
========================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================
   START
========================================= */

init();