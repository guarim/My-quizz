document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('users.json')
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('quiz-section').style.display = 'block';
                loadQuiz();
            } else {
                alert('Identifiant ou mot de passe incorrect');
            }
        });
});

function loadQuiz() {
    fetch('questions.json')
        .then(response => response.json())
        .then(questions => {
            const container = document.getElementById('questions-container');
            questions.forEach((question, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.innerHTML = `
                    <p>${question.question}</p>
                    ${question.image ? `<img src="${question.image}" alt="Question image">` : ''}
                    ${question.choices.map((choice, i) => `
                        <label>
                            <input type="radio" name="question${index}" value="${i}">
                            ${choice}
                        </label><br>
                    `).join('')}
                `;
                container.appendChild(questionDiv);
            });
        });
}

document.getElementById('quiz-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const answers = [];
    const questions = document.querySelectorAll('.question');
    questions.forEach((question, index) => {
        const selected = question.querySelector('input[type="radio"]:checked');
        answers.push(selected ? parseInt(selected.value) : null);
    });

    fetch('questions.json')
        .then(response => response.json())
        .then(questions => {
            let score = 0;
            const results = [];
            questions.forEach((question, index) => {
                if (answers[index] === question.correctAnswer) {
                    score += question.points;
                    results.push({ question: question.question, correct: true });
                } else {
                    results.push({ question: question.question, correct: false });
                }
            });

            document.getElementById('quiz-section').style.display = 'none';
            document.getElementById('results-section').style.display = 'block';
            document.getElementById('final-score').textContent = `Votre score est de ${score} points.`;

            const resultsContainer = document.getElementById('results-container');
            results.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.className = result.correct ? 'correct' : 'incorrect';
                resultDiv.textContent = result.question;
                resultsContainer.appendChild(resultDiv);
            });

            saveResults(score, results);
        });
});

function saveResults(score, results) {
    const username = document.getElementById('username').value;
    const resultData = {
        username: username,
        score: score,
        results: results
    };

    fetch('results.json')
        .then(response => response.json())
        .then(existingResults => {
            existingResults.push(resultData);
            return fetch('results.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(existingResults)
            });
        })
        .then(response => {
            if (response.ok) {
                console.log('Résultats enregistrés avec succès');
            } else {
                console.error('Erreur lors de l\'enregistrement des résultats');
            }
        });
}