"use strict";


const OPTION_LETTERS = [
    "a",
    "b",
    "c",
    "d"
];


let questionCounter = 0;


/* =========================================
   INICIALIZAR EDITOR
========================================= */

export function initEditor() {

    const addButton =
        document.getElementById(
            "add-question-button"
        );


    addButton.addEventListener(
        "click",
        () => {
            addQuestion();
        }
    );


    updateQuestionCount();
}


/* =========================================
   AGREGAR PREGUNTA
========================================= */

export function addQuestion(question = null) {

    questionCounter++;


    const container =
        document.getElementById(
            "questions-container"
        );


    const questionId =
        `question-${questionCounter}`;


    const article =
        document.createElement("article");


    article.className =
        "question-editor";


    article.dataset.questionId =
        questionId;


    article.innerHTML = `
        <div class="question-editor-header">

            <div class="question-number">
                <span class="question-index">
                    ${container.children.length + 1}
                </span>

                <span>
                    Pregunta
                </span>
            </div>

            <button
                type="button"
                class="remove-question-button"
                data-action="remove-question"
            >
                Eliminar
            </button>

        </div>


        <div class="question-main-grid">

            <div class="question-field">

                <label>
                    Pregunta
                </label>

                <input
                    type="text"
                    class="question-text"
                    maxlength="250"
                    placeholder="Escribe la pregunta..."
                    required
                >

            </div>


            <div class="question-field">

                <label>
                    Tipo de pregunta
                </label>

                <select class="question-type">

                    <option value="single">
                        Selección única
                    </option>

                    <option value="multiple">
                        Selección múltiple
                    </option>

                    <option value="truefalse">
                        Verdadero / Falso
                    </option>

                </select>

            </div>

        </div>


        <div class="question-options">

            ${createOptionsHTML()}

        </div>


        <div class="image-url-field question-field">

            <label>
                Imagen opcional
            </label>

            <input
                type="url"
                class="question-image"
                placeholder="https://ejemplo.com/imagen.jpg"
            >

            <img
                class="image-preview"
                alt="Vista previa de la pregunta"
            >

        </div>
    `;


    container.appendChild(article);


    const typeSelect =
        article.querySelector(
            ".question-type"
        );


    typeSelect.addEventListener(
        "change",
        () => {

            updateQuestionType(
                article
            );

        }
    );


    const removeButton =
        article.querySelector(
            "[data-action='remove-question']"
        );


    removeButton.addEventListener(
        "click",
        () => {

            article.remove();

            renumberQuestions();

            updateQuestionCount();
        }
    );


    const imageInput =
        article.querySelector(
            ".question-image"
        );


    const imagePreview =
        article.querySelector(
            ".image-preview"
        );


    imageInput.addEventListener(
        "input",
        () => {

            const url =
                imageInput.value.trim();


            if (url) {

                imagePreview.src = url;

                imagePreview.classList.add(
                    "visible"
                );

            } else {

                imagePreview.classList.remove(
                    "visible"
                );
            }

        }
    );


    if (question) {

        fillQuestion(
            article,
            question
        );
    }


    updateQuestionCount();
}


/* =========================================
   OPCIONES
========================================= */

function createOptionsHTML() {

    return OPTION_LETTERS
        .map(letter => {

            return `
                <div class="option-row">

                    <span class="option-label">
                        ${letter.toUpperCase()}
                    </span>

                    <input
                        type="text"
                        class="option-text"
                        data-option="${letter}"
                        placeholder="Respuesta ${letter.toUpperCase()}"
                        required
                    >

                    <label class="correct-control">

                        <input
                            type="radio"
                            class="correct-radio"
                            name="correct-${questionCounter}"
                            value="${letter}"
                        >

                        Correcta

                    </label>

                </div>
            `;

        })
        .join("");
}


/* =========================================
   TIPO DE PREGUNTA
========================================= */

function updateQuestionType(article) {

    const type =
        article.querySelector(
            ".question-type"
        ).value;


    const options =
        article.querySelectorAll(
            ".option-row"
        );


    if (type === "truefalse") {

        options.forEach(
            (option, index) => {

                if (index === 0) {

                    option.querySelector(
                        ".option-text"
                    ).value =
                        "Verdadero";

                }

                if (index === 1) {

                    option.querySelector(
                        ".option-text"
                    ).value =
                        "Falso";

                }

                option.style.display =
                    index < 2
                        ? "grid"
                        : "none";
            }
        );

    } else {

        options.forEach(
            option => {

                option.style.display =
                    "grid";
            }
        );
    }


    const radios =
        article.querySelectorAll(
            ".correct-radio"
        );


    radios.forEach(
        radio => {

            radio.type =
                type === "multiple"
                    ? "checkbox"
                    : "radio";

        }
    );
}


/* =========================================
   RELLENAR PREGUNTA EXISTENTE
========================================= */

function fillQuestion(
    article,
    question
) {

    article.querySelector(
        ".question-text"
    ).value =
        question.question || "";


    article.querySelector(
        ".question-type"
    ).value =
        question.type || "single";


    article.querySelector(
        ".question-image"
    ).value =
        question.image || "";


    const optionInputs =
        article.querySelectorAll(
            ".option-text"
        );


    optionInputs.forEach(
        input => {

            const key =
                input.dataset.option;

            input.value =
                question.options?.[key] || "";
        }
    );


    updateQuestionType(
        article
    );


    const correct =
        question.correct;


    if (
        question.type ===
        "multiple"
    ) {

        const values =
            Array.isArray(correct)
                ? correct
                : [];


        article
            .querySelectorAll(
                ".correct-radio"
            )
            .forEach(
                input => {

                    input.checked =
                        values.includes(
                            input.value
                        );
                }
            );

    } else {

        const correctRadio =
            article.querySelector(
                `.correct-radio[value="${correct}"]`
            );


        if (correctRadio) {
            correctRadio.checked = true;
        }
    }
}


/* =========================================
   OBTENER PREGUNTAS
========================================= */

export function getEditorQuestions() {

    const articles =
        document.querySelectorAll(
            ".question-editor"
        );


    return Array.from(articles)
        .map(article => {

            const type =
                article.querySelector(
                    ".question-type"
                ).value;


            const options = {};


            article
                .querySelectorAll(
                    ".option-text"
                )
                .forEach(
                    input => {

                        options[
                            input.dataset.option
                        ] =
                            input.value.trim();

                    }
                );


            let correct;


            if (type === "multiple") {

                correct =
                    Array.from(
                        article.querySelectorAll(
                            ".correct-radio:checked"
                        )
                    )
                    .map(
                        input => input.value
                    );

            } else {

                const selected =
                    article.querySelector(
                        ".correct-radio:checked"
                    );


                correct =
                    selected
                        ? selected.value
                        : "";
            }


            return {

                id:
                    article.dataset.questionId,

                question:
                    article
                        .querySelector(
                            ".question-text"
                        )
                        .value
                        .trim(),

                type,

                options,

                correct,

                image:
                    article
                        .querySelector(
                            ".question-image"
                        )
                        .value
                        .trim()
            };

        });
}


/* =========================================
   CARGAR PREGUNTAS
========================================= */

export function loadQuestions(
    questions
) {

    const container =
        document.getElementById(
            "questions-container"
        );


    container.innerHTML = "";


    questionCounter = 0;


    questions.forEach(
        question => {

            addQuestion(
                question
            );

        }
    );


    updateQuestionCount();
}


/* =========================================
   LIMPIAR EDITOR
========================================= */

export function clearEditor() {

    document.getElementById(
        "questions-container"
    ).innerHTML = "";


    questionCounter = 0;


    updateQuestionCount();
}


/* =========================================
   NUMERACIÓN
========================================= */

function renumberQuestions() {

    const questions =
        document.querySelectorAll(
            ".question-editor"
        );


    questions.forEach(
        (article, index) => {

            const number =
                article.querySelector(
                    ".question-index"
                );

            number.textContent =
                index + 1;
        }
    );
}


/* =========================================
   CONTADOR
========================================= */

function updateQuestionCount() {

    const count =
        document.querySelectorAll(
            ".question-editor"
        ).length;


    const element =
        document.getElementById(
            "question-count"
        );


    element.textContent =
        `${count} ${
            count === 1
                ? "pregunta"
                : "preguntas"
        }`;
}