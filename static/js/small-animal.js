const password = localStorage.getItem("p");

const CIPHER = `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`;
let allQuestions = [];
let questions = [];

if (password) {
  const passwordCorrect = decryptCipherAndPrepareQuestions(password);
  if (passwordCorrect) {
    runGame();
  } else {
    password = null;
  }
}

if (!password) {
  document.getElementById("content").innerHTML = `
    <h3>Password:</h3>
    <input id='password-input' type='password'>
    <button id='submit-password-btn'>Enter</button>
    `;

  document
    .getElementById("submit-password-btn")
    .addEventListener("click", (_) => {
      const passwordAttempt = document.getElementById("password-input").value;
      const passwordCorrect = decryptCipherAndPrepareQuestions(passwordAttempt);
      if (passwordCorrect) {
        runGame();
      }
    });
}

function decryptCipherAndPrepareQuestions(passwordAttempt) {
  const bytes = CryptoJS.AES.decrypt(CIPHER, passwordAttempt);

  let decryptedText = "";
  let errored = false;
  try {
    decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    allQuestions = JSON.parse(decryptedText);
  } catch (err) {
    errored = true;
  }

  if (errored || decryptedText === "" || allQuestions[0] !== "bingo!") {
    window.alert("Incorrect password!");
    return false;
  }

  allQuestions = allQuestions.slice(1);
  localStorage.setItem("p", passwordAttempt);
  return true;
}

function runGame() {
  questions = [...allQuestions];
  document.getElementById("btn-area").innerHTML = `
    <button id='next-question-btn' style='width: 200px; display: block; margin: auto;'>Next</button>
    `;

  nextQuestion();
  document
    .getElementById("next-question-btn")
    .addEventListener("click", (_) => {
      nextQuestion();
    });
}

function nextQuestion() {
  const currentQuestion = questions.splice(
    Math.floor(Math.random() * questions.length),
    1
  )[0];
  if (!currentQuestion) {
    document.getElementById(
      "content"
    ).innerHTML = `<h3 style='text-align: center; display: block; margin: auto; height: 150px;'>The end.</h3>`;
    document.getElementById("btn-area").innerHTML = `
        <button id='restart-btn' style='width: 200px; display: block; margin: auto;'>Click to restart</button>
        `;
    document.getElementById("restart-btn").addEventListener("click", (_) => {
      runGame();
    });
    return;
  }
  document.getElementById(
    "content"
  ).innerHTML = `<h3 style='text-align: center; display: block; margin: auto; height: 150px;'>${currentQuestion}</h3>`;

  console.log(currentQuestion);
}
