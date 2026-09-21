const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

const OP_SYMBOLS = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

let firstOperand = null;
let pendingOperator = null;
let currentInput = "0";
let justEvaluated = false;
let awaitingNewInput = false;

function updateDisplay() {
  resultEl.textContent = currentInput;
  if (pendingOperator && firstOperand !== null) {
    expressionEl.textContent = `${formatNumber(firstOperand)} ${OP_SYMBOLS[pendingOperator]}`;
  } else {
    expressionEl.textContent = "";
  }
  animateDisplay(currentInput === "Error");
}

function animateDisplay(isError) {
  resultEl.classList.remove("pop", "shake");
  void resultEl.offsetWidth;
  resultEl.classList.add(isError ? "shake" : "pop");
}

function spawnRipple(button, x, y) {
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height) * 1.2;
  ripple.className = "ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - rect.left - size / 2}px`;
  ripple.style.top = `${y - rect.top - size / 2}px`;
  button.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 1e10) / 1e10);
}

function inputDigit(digit) {
  if (justEvaluated || awaitingNewInput) {
    currentInput = digit === "." ? "0." : digit;
    justEvaluated = false;
    awaitingNewInput = false;
    return;
  }
  if (digit === "." && currentInput.includes(".")) return;
  if (currentInput === "0" && digit !== ".") {
    currentInput = digit;
  } else {
    currentInput += digit;
  }
}

function clearAll() {
  firstOperand = null;
  pendingOperator = null;
  currentInput = "0";
  justEvaluated = false;
  awaitingNewInput = false;
}

function backspace() {
  if (justEvaluated) {
    clearAll();
    return;
  }
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
}

function applyPercent() {
  currentInput = formatNumber(parseFloat(currentInput) / 100);
}

function compute(a, op, b) {
  switch (op) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function chooseOperator(op) {
  const inputValue = parseFloat(currentInput);

  if (pendingOperator && !justEvaluated) {
    const result = compute(firstOperand, pendingOperator, inputValue);
    firstOperand = result;
    currentInput = formatNumber(result);
  } else {
    firstOperand = inputValue;
  }

  pendingOperator = op;
  justEvaluated = false;
  awaitingNewInput = true;
}

function evaluate() {
  if (pendingOperator === null || firstOperand === null) return;
  const inputValue = parseFloat(currentInput);
  const result = compute(firstOperand, pendingOperator, inputValue);
  currentInput = Number.isNaN(result) ? "Error" : formatNumber(result);
  firstOperand = null;
  pendingOperator = null;
  justEvaluated = true;
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  spawnRipple(button, event.clientX, event.clientY);

  const { num, action } = button.dataset;

  if (num !== undefined) {
    inputDigit(num);
  } else if (action === "clear") {
    clearAll();
  } else if (action === "backspace") {
    backspace();
  } else if (action === "percent") {
    applyPercent();
  } else if (action === "equals") {
    evaluate();
  } else if (["add", "subtract", "multiply", "divide"].includes(action)) {
    chooseOperator(action);
  }

  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === ".") {
    inputDigit(".");
  } else if (key === "+") {
    chooseOperator("add");
  } else if (key === "-") {
    chooseOperator("subtract");
  } else if (key === "*") {
    chooseOperator("multiply");
  } else if (key === "/") {
    event.preventDefault();
    chooseOperator("divide");
  } else if (key === "Enter" || key === "=") {
    evaluate();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "%") {
    applyPercent();
  } else {
    return;
  }
  updateDisplay();
});

updateDisplay();
