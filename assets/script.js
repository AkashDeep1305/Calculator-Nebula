let currentMode = 'cal';

const display = document.getElementById('display');
const calc = document.getElementById('calc');
const buttons = document.getElementById('buttons');
const history = document.getElementById('history');
const value = document.getElementById('value');

let currentInput = '0';
let justCalc = false;
let inverseMode = false;

const expressionHistory = [];

// Matrix state
let matrixSize = 3;
let editTarget = "A";
let matrixA = createEmptyMatrix(matrixSize);
let matrixB = createEmptyMatrix(matrixSize);
let editingCell = null;
let editMatrix = null;
let lastMatrixOperation = null;


/* ------------------ DISPLAY ------------------ */
function updateDisplay() { display.textContent = currentInput; }


function init() {
    updateDisplay();
    renderButtons();
    renderModeToggle();
}

/* ------------------ SWITCH MODE ------------------ */
function switchMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');


    renderButtons();
    renderModeToggle();

    if (currentMode === "matrix") {
        const Shistory = document.querySelector('.history');

        Shistory.style.display = "none";
        calc.style.width = "35rem";
        buttons.style.left = "";
        buttons.style.gap = "";
        value.style.left = ""
    }

    currentInput = '0';
    updateDisplay();
}

function renderButtons() {
    const config = modes[currentMode];
    buttons.className = `buttons ${currentMode === 'matrix' ? 'mode-g mode-grid' : ''}`;
    buttons.innerHTML = config.buttons.flat().map((btn, i) => {
        const displayLabel = (currentMode === 'cal' && btn.endsWith('(') && btn.length > 1) ? btn.slice(0, -1) : btn;
        return `<button onclick="${getButtonAction(btn)}" class="${config.classes?.[i] || getButtonClass(btn)}" id="${config.id?.[i]}">${displayLabel}</button>`;
    }).join('');
}

function renderModeToggle() {
    const modeDiv = document.getElementById('mode');

    if (currentMode === 'cal') {
        modeDiv.innerHTML = `<button onclick="Showhistory()" class="clock">
        <svg class="clock-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v6l4 2"/>
        </svg>
        </button>
        <button onclick="renderInv()" class="clock">Inv</button>`;

        calc.style.width = '';
        value.style.visibility = "";
        value.style.opacity = "";
        return;
    }

    matrixSize = 3;
    editTarget = "A";

    modeDiv.innerHTML = `
        <button class="mode-btn" data-type="size" data-value="2">2×2</button>
        <button class="mode-btn" data-type="size" data-value="3">3×3</button>
        <button class="mode-btn" data-type="edit" data-value="A">EditA</button>
        <button class="mode-btn" data-type="edit" data-value="B">EditB</button>
    `;
    calc.style.width = '35rem';
    value.style.visibility = "hidden";
    value.style.opacity = "0";

    updateActiveModeButtons();
}

function getButtonClass(btn) {
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'].includes(btn)) return 'num';
    if (['+', '-', '×', '÷', '^', '%'].includes(btn)) return 'op';
    if (btn.match(/^[a-z]/i)) return 'func';
    return 'clear';
}

function getButtonAction(btn) {
    const actions = {
        cal: {
            'C': 'clearAll()',
            'CE': 'clearEntry()',
            '⌫': 'backspace()',
            'π': "appendToDisplay('" + Math.PI.toFixed(10) + "')",
            'e': "appendToDisplay('" + Math.E.toFixed(10) + "')",
            '=': 'calculate()',
            'xʸ': 'insertPower()',
            '=': 'calculate()',
            'n!': 'fact()'
        },
        matrix: {
            'C': 'clearAllM()',
            'Clear': 'clearEntryM()',
            '⌫': 'backspace()',
            '=': 'matrixEquals()',
            'det': 'setMatrixOp(\'det\')',
            'inv': 'setMatrixOp(\'inv\')',
            '×': 'setMatrixOp(\'×\')',
            '+': 'setMatrixOp(\'+\')',
            '-': 'setMatrixOp(\'-\')',
            'Random': 'matrixRandom()',
            'Identity Matrix': 'matrixIdentity()',
            'Trace': 'setMatrixOp("Tr")',
            'Mode': 'modeToggle()'
        }
    };

    return actions[currentMode]?.[btn] || `appendToDisplay('${btn}')`;

}

function renderInv() {
    inverseMode = !inverseMode;
    updateButtons();
}

function updateButtons() {
    if (inverseMode) {
        // Show inverse functions
        document.getElementById("sinBtn").innerText = "sin⁻¹";
        document.getElementById("cosBtn").innerText = "cos⁻¹";
        document.getElementById("tanBtn").innerText = "tan⁻¹";
        document.getElementById("logBtn").innerText = "10ˣ";
        document.getElementById("root").innerText = "x²";
        document.getElementById("pwrBtn").innerText = "ʸ√x";
    } else {
        // Show normal functions
        document.getElementById("sinBtn").innerText = "sin";
        document.getElementById("cosBtn").innerText = "cos";
        document.getElementById("tanBtn").innerText = "tan";
        document.getElementById("logBtn").innerText = "log";
        document.getElementById("root").innerText = "√";
        document.getElementById("pwrBtn").innerText = "xʸ";
    }
}

// Mode configurations
const modes = {
    cal: {
        buttons: [
            ['C', 'CE', '(', ')', '÷'], ['sin(', 'cos(', 'tan(', 'log(', 'xʸ'],
            ['7', '8', '9', '×', 'exp('], ['4', '5', '6', '-', '√('],
            ['1', '2', '3', '+', 'n!'], ['0', '.', '⌫', '%', 'ln(', '='],
            ['π', 'e']
        ],
        classes: ['clear', 'clear', 'func', 'func', 'op', 'func', 'func', 'func', 'func', 'op', 'num', 'num', 'num', 'op', 'func', 'num', 'num', 'num', 'op', 'func', 'num', 'num', 'num', 'op', 'func', 'num', 'num', 'clear', 'op', 'func', 'equals', 'func', 'func'],
        id: ['cl', 'cle', 'pb', 'pa', 'div', 'sinBtn', 'cosBtn', 'tanBtn', 'logBtn', 'pwrBtn', 'svn', 'egh', 'nin', 'xbtn', 'expBtn', 'fr', 'fv', 'sx', 'minus', 'root', 'one', 'two', 'tre', 'add', 'fact', 'zro', 'dot', 'bksp', 'prct', 'lnBtn', 'eql', 'pi', 'eBtn']
    },
    matrix: {
        buttons: [
            ['C', 'det', 'inv', '×', '⌫'],
            ['a11', 'a12', 'a13', 'b11', 'b12', 'b13'],
            ['a21', 'a22', 'a23', 'b21', 'b22', 'b23'],
            ['a31', 'a32', 'a33', 'b31', 'b32', 'b33'],
            ['Random', 'Identity Matrix', 'Trace', 'Clear', 'Mode'], ['+', '-', '=']
        ],
        classes: ['clear', 'op', 'op', 'op', 'back', 'Ma', 'Ma', 'Ma', 'Mb', 'Mb', 'Mb', 'Ma', 'Ma', 'Ma', 'Mb', 'Mb', 'Mb', 'Ma', 'Ma', 'Ma', 'Mb', 'Mb', 'Mb', 'op', 'op', 'op', 'clear', 'mod', 'Ad', 'Ad', 'clear']
    }
};

/* ------------------ CALCULATOR ENGINE ------------------ */

function clearAll() { currentInput = '0'; updateDisplay(); display.classList.remove('error'); value.innerHTML = ""; }
function clearEntry() { currentInput = '0'; updateDisplay(); display.classList.remove('error'); value.innerHTML = ""; }
function backspace() {
    currentInput = currentInput.slice(0, -1) || '0';
    updateDisplay();
}

function percent(expr) {
    if (!expr || expr.trim() === '') return expr;
    return expr.replaceAll('%', '* 0.01');
}

function Showhistory() {
    const Shistory = document.querySelector('.history');

    if (Shistory.style.display === "block") {
        // Hide history
        Shistory.style.display = "none";
        calc.style.width = "";
        buttons.style.left = "";
        buttons.style.gap = "";
        value.style.left = ""
    } else {
        // Show history
        Shistory.style.display = "block";
        calc.style.width = "50rem";
        buttons.style.left = "40%";
        buttons.style.gap = "12px";
        value.style.left = "5%"
    }
}

function normalizeOperators(expression) {
    return expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
}

function safeEval(expression) {
    const expr = normalizeOperators(expression);
    try {
        const fn = new Function('calculateTrig', 'Math', 'return ' + expr);
        return fn(calculateTrig, Math);
    } catch (e) {
        console.error('safeEval error:', e, 'expr:', expr);
        throw new Error('Invalid expression');
    }
}

// Trig in degrees
function calculateTrig(func, x) {
    const radians = Math.PI * x / 180;
    if (func === 'sin') return Math.sin(radians);
    if (func === 'cos') return Math.cos(radians);
    if (func === 'tan') return Math.tan(radians);

    // Inverse trig: input is ratio, output in degrees
    const v = typeof x === "string" ? eval(x) : Number(x);

    if (func === 'asin') return Math.asin(v) * (180 / Math.PI);
    if (func === 'acos') return Math.acos(v) * (180 / Math.PI);
    if (func === 'atan') return Math.atan(v) * (180 / Math.PI);

    throw new Error('Unknown trig function');
}

function safeFactorial(n) {
    n = Math.round(n);
    if (n < 0) throw new Error('Factorial undefined for negative');
    if (n > 170) throw new Error('Overflow');
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// Find operand before '!' supporting numbers and balanced parentheses
function findOperandBeforeBang(expr, i) {
    let end = i - 1;
    if (end < 0) return null;

    if (expr[end] === ')') {
        let depth = 1, start = end - 1;
        while (start >= 0 && depth > 0) {
            if (expr[start] === ')') depth++;
            else if (expr[start] === '(') depth--;
            start--;
        }
        if (depth !== 0) return null;
        return { start: start + 1, end, type: 'paren' };
    }

    let start = end, seenDot = false;
    while (start >= 0) {
        const ch = expr[start];
        if (ch >= '0' && ch <= '9') { start--; continue; }
        if (ch === '.' && !seenDot) { seenDot = true; start--; continue; }
        break;
    }
    if (start === end) return null;
    return { start: start + 1, end, type: 'number' };
}

// Apply factorial to nested cases like ((2+3)*(1+1))!
function applyFactorial(expr) {
    let s = expr;
    while (true) {
        const bangIndex = s.indexOf('!');
        if (bangIndex === -1) break;

        const operand = findOperandBeforeBang(s, bangIndex);
        if (!operand) throw new Error('Invalid factorial syntax');

        const before = s.slice(0, operand.start);
        const target = s.slice(operand.start, operand.end + 1);
        const after = s.slice(bangIndex + 1);

        let value;
        if (operand.type === 'paren') {
            const inner = target.slice(1, -1);
            value = safeEval(inner);
        } else {
            value = parseFloat(target);
        }

        const factVal = safeFactorial(value);
        s = before + String(factVal) + after;
    }
    return s;
}

function transformFunctions(expr) {

    expr = expr.replace(/\s+/g, '');

    // STEP 1: protect y√x
    expr = expr.replace(
        /\(([\d.]+)\)√\(([^()]+)\)/g,
        'Math.pow($2,1/$1)'
    );

    // STEP 2: normal replacements
    expr = expr

        // forward trig
        .replace(/(^|[^a])sin\(/g, '$1calculateTrig("sin",')
        .replace(/(^|[^a])cos\(/g, '$1calculateTrig("cos",')
        .replace(/(^|[^a])tan\(/g, '$1calculateTrig("tan",')

        .replace(/asin\(/g, 'calculateTrig("asin",')
        .replace(/acos\(/g, 'calculateTrig("acos",')
        .replace(/atan\(/g, 'calculateTrig("atan",')

        .replace(/log\(/g, 'Math.log10(')
        .replace(/10\^\(/g, 'Math.pow(10,')

        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')

        // normal square root LAST
        .replace(/√\(/g, 'Math.sqrt(');

    return expr;
}

function insertImplicitMultiplication(expr) {
    return expr
        // number before function: 20log(6), 5sin(30)
        .replace(/(\d+)(?=(sin|cos|tan|asin|acos|atan|log|exp)\()/g, '$1*')

        // number before (
        .replace(/(\d+)\(/g, '$1*(')

        // ) before number → (2+3)4
        .replace(/\)(?=\d)/g, ')*')

        // ) before function → (2+3)sin(30)
        .replace(/\)(?=(sin|cos|tan|asin|acos|atan|log|exp)\()/g, ')*');
}

function calculate() {
    try {
        let expr = currentInput;

        expr = applyFactorial(expr);
        expr = insertImplicitMultiplication(expr);
        expr = transformFunctions(expr);
        expr = percent(expr);

        // Evaluate
        const result = safeEval(expr);
        if (!isFinite(result)) throw new Error('Result too large');

        expressionHistory.unshift(`${currentInput} = ${result.toLocaleString()}`);
        if (expressionHistory.length > 100) expressionHistory.pop();
        history.innerHTML = expressionHistory.join('<p>');

        value.innerHTML = `${currentInput} = `;

        currentInput = result.toString();
        updateDisplay();
        display.classList.remove('error');

        value.style.display = "block";
        justCalc = true;
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
        display.classList.add('error');
        setTimeout(clearAll, 1500);
    }
}

function fact() {
    if (currentInput === "" || currentInput.endsWith("!")) return;
    currentInput += "!";
    updateDisplay();
}

function insertPower() {
    if (!currentInput || currentInput === '0') return;

    const end = currentInput.length - 1;

    // Determine base boundaries
    let baseStart = null;
    let baseEnd = end;

    if (currentInput[end] === ')') {
        // Find matching '('
        let depth = 1;
        let i = end - 1;
        while (i >= 0 && depth > 0) {
            if (currentInput[i] === ')') depth++;
            else if (currentInput[i] === '(') depth--;
            i--;
        }
        if (depth === 0) baseStart = i + 1;
    } else {
        // Consume number backward
        let i = end;
        let seenDot = false;
        while (i >= 0) {
            const ch = currentInput[i];
            if (ch >= '0' && ch <= '9') { i--; continue; }
            if (ch === '.' && !seenDot) { seenDot = true; i--; continue; }
            break;
        }
        if (i < end) baseStart = i + 1;
    }

    if (baseStart == null) return;

    const base = currentInput.slice(baseStart, baseEnd + 1);

    const wrappedBase = (base.startsWith('(') && base.endsWith(')')) ? base : `(${base})`;
    const before = currentInput.slice(0, baseStart);

    if (!inverseMode) {
        currentInput = `${before}${wrappedBase}^(`;
    } else {
        currentInput = `${before}(__Y__)√${wrappedBase}`;
    }

    updateDisplay();
}

/* ------------------------------
     MATRIX CALCULATOR ENGINE
--------------------------------*/

function updateActiveModeButtons() {
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    const sizeBtn = document.querySelector(`.mode-btn[data-type="size"][data-value="${matrixSize}"]`);
    if (sizeBtn) sizeBtn.classList.add("active");

    const editBtn = document.querySelector(`.mode-btn[data-type="edit"][data-value="${editTarget}"]`);
    if (editBtn) editBtn.classList.add("active");
}

function createEmptyMatrix(n) {
    return Array.from({ length: n }, () => Array(n).fill(0));
}

function updateButtonLabels() {
    const positions = [];
    for (let r = 1; r <= matrixSize; r++) for (let c = 1; c <= matrixSize; c++) positions.push(`a${r}${c}`);
    for (let r = 1; r <= matrixSize; r++) for (let c = 1; c <= matrixSize; c++) positions.push(`b${r}${c}`);

    // Hide unused rows/columns (for 2×2 mode)
    document.querySelectorAll("button").forEach(btn => {
        const id = btn.textContent.trim();
        if (/^[ab]\d\d$/i.test(id)) {
            btn.style.display = positions.includes(id) ? "block" : "none";
        }
    });
}

function setMatrixValue(code) {
    const num = prompt(`Enter value for ${editTarget}${code.slice(1)}`);
    if (num === null || num === "" || isNaN(num)) return;

    const r = parseInt(code.charAt(1)) - 1;
    const c = parseInt(code.charAt(2)) - 1;

    if (editTarget === "A") matrixA[r][c] = Number(num);
    else matrixB[r][c] = Number(num);
}

// Toggle via grid "Mode" button: cycle 2×2 <-> 3×3
function modeToggle() {
    matrixSize = (matrixSize === 2) ? 3 : 2;
    matrixA = createEmptyMatrix(matrixSize);
    matrixB = createEmptyMatrix(matrixSize);
    updateButtonLabels();
    updateActiveModeButtons();

    // add your style logic here
    if (matrixSize === 2) {
        calc.style.width = '30rem';
        document.querySelector('.buttons').classList.remove('mode-grid');
        document.querySelector('.back').style.gridColumn = "auto";
        document.querySelector('.mod').style.gridColumn = "auto";

        const mbButtons = document.querySelectorAll('.Mb');
        if (mbButtons[1]) mbButtons[1].style.gridColumn = "span 2";
        if (mbButtons[4]) mbButtons[4].style.gridColumn = "span 2";
    } else {
        // reset or apply 3×3 styles here
        calc.style.width = '35rem';
        document.querySelector('.buttons').classList.add('mode-grid');
        document.querySelector('.back').style.gridColumn = "span 2";
        document.querySelector('.mod').style.gridColumn = "span 2";
        // clear overrides
        const mbButtons = document.querySelectorAll('.Mb');
        mbButtons.forEach(btn => btn.style.gridColumn = "auto");
    }
}

/* ------------------------------
      MATRIX TOGGLE BUTTONS
--------------------------------*/

document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("mode-btn")) return;

    const type = e.target.textContent.trim();

    switch (type) {
        case "2×2":
            matrixSize = 2;
            matrixA = createEmptyMatrix(2);
            matrixB = createEmptyMatrix(2);
            updateButtonLabels();
            updateActiveModeButtons();
            calc.style.width = '30rem';
            document.querySelector('.buttons').classList.remove('mode-grid');
            document.querySelector('.back').style.gridColumn = "auto";
            document.querySelector('.mod').style.gridColumn = "auto";
            const mbButtons = document.querySelectorAll('.Mb');

            // 2nd button (index 1)
            mbButtons[1].style.gridColumn = "span 2";

            // 4th button (index 3)
            mbButtons[4].style.gridColumn = "span 2";

            break;

        case "3×3":
            matrixSize = 3;
            matrixA = createEmptyMatrix(3);
            matrixB = createEmptyMatrix(3);
            updateButtonLabels();
            updateActiveModeButtons();

            calc.style.width = '35rem';
            document.querySelector('.buttons').classList.add('mode-grid');
            document.querySelector('.back').style.gridColumn = "span 2";
            document.querySelector('.mod').style.gridColumn = "span 2";

            const mbuttons = document.querySelectorAll('.Mb');
            // 2nd button (index 1)
            mbuttons[1].style.gridColumn = "auto";

            // 4th button (index 3)
            mbuttons[4].style.gridColumn = "auto";

            break;

        case "EditA":
            editTarget = "A";
            // alert("Editing Matrix A");
            updateActiveModeButtons();
            break;

        case "EditB":
            editTarget = "B";
            // alert("Editing Matrix B");
            updateActiveModeButtons();
            break;
    }
});

/* ------------------------------
      CORE OPERATIONS
--------------------------------*/

function getActiveMatrix() {
    return editTarget === "A" ? matrixA : matrixB;
}

function setMatrixOp(op) {
    lastMatrixOperation = op;
    // Immediate feedback on display
    display.textContent = `Operation set: ${op}`;
}

function matrixEquals() {
    // If editing a cell, "=" confirms value
    if (editingCell) {
        confirmMatrixValue();
        return;
    }
    // Otherwise execute last selected operation
    if (!lastMatrixOperation) {
        display.textContent = "No operation selected";
        return;
    }
    switch (lastMatrixOperation) {
        case 'det': return matrixDet();
        case 'inv': return matrixInverse();
        case '×': return matrixMultiply();
        case '+': return matrixAdd();
        case '-': return matrixSub();
        case 'Tr': return matrixTrace();
        default: display.textContent = "Unknown operation";
    }
}

function matrixAdd() {
    const n = matrixSize;
    const result = createEmptyMatrix(n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i][j] = matrixA[i][j] + matrixB[i][j];
        }
    }
    displayMatrix(result, "A + B");
}

function matrixSub() {
    const n = matrixSize;
    const result = createEmptyMatrix(n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i][j] = matrixA[i][j] - matrixB[i][j];
        }
    }
    displayMatrix(result, "A - B");
}

function matrixDet() {
    const M = getActiveMatrix();
    const det = determinant(M);

    display.textContent = `det(${editTarget}) = ${det}`;
}

function matrixInverse() {
    const M = getActiveMatrix();
    const inv = inverse(M);

    if (!inv) {
        display.textContent = `${editTarget} is not invertible`;
        return;
    }

    displayMatrix(inv, `${editTarget}⁻¹`);
}

function matrixMultiply() {
    const result = multiply(matrixA, matrixB);
    displayMatrix(result, "A × B");
}

function matrixIdentity() {
    const I = createEmptyMatrix(matrixSize);
    for (let i = 0; i < matrixSize; i++) I[i][i] = 1;

    if (editTarget === "A") matrixA = structuredClone(I);
    else matrixB = structuredClone(I);

    displayMatrix(I, `${editTarget}(Identity)`);
}

function matrixRandom() {
    const R = createEmptyMatrix(matrixSize).map(row =>
        row.map(() => Math.floor(Math.random() * 10))
    );

    if (editTarget === "A") matrixA = structuredClone(R);
    else matrixB = structuredClone(R);

    displayMatrix(R, `${editTarget}(Random)`);
}

function matrixTrace() {
    const M = getActiveMatrix();
    let trace = 0;

    for (let i = 0; i < matrixSize; i++) {
        trace += M[i][i];
    }

    display.textContent = `Tr(${editTarget}) = ${trace}`;
}

let messageTimer = null;

function showMessage(msg) {
    display.textContent = msg;

    // Clear old timer if exists
    if (messageTimer) clearTimeout(messageTimer);

    // Auto-remove message
    messageTimer = setTimeout(() => {
        // Only clear if display still shows the same message
        if (display.textContent === msg) {
            display.textContent = "";
        }
    }, 800);
}


function clearAllM() {
    matrixA = createEmptyMatrix(matrixSize);
    matrixB = createEmptyMatrix(matrixSize);
    lastMatrixOperation = null;
    editingCell = null;
    editMatrix = null;
    showMessage("Cleared");

    const btns = document.querySelectorAll('.mode-grid button');
    btns.forEach(b => b.classList.remove("editing"));

    const btns_g = document.querySelectorAll('.mode-g button');
    btns_g.forEach(b => b.classList.remove("editing"));

}

function clearEntryM() {
    if (editTarget === "A") matrixA = createEmptyMatrix(matrixSize);
    else matrixB = createEmptyMatrix(matrixSize);
    showMessage(`${editTarget} cleared`);

    const btns = document.querySelectorAll('.mode-grid button');
    btns.forEach(b => b.classList.remove("editing"));

    const btns_g = document.querySelectorAll('.mode-g button');
    btns_g.forEach(b => b.classList.remove("editing"));

}

/* ------------------------------
      MATRIX MATH FUNCTIONS
--------------------------------*/

function determinant(m) {
    if (m.length === 2) {
        return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    }
    // 3×3 determinant
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

function inverse(m) {
    const n = m.length;
    const det = determinant(m);
    if (det === 0) return null;

    if (n === 2) {
        return [
            [m[1][1] / det, -m[0][1] / det],
            [-m[1][0] / det, m[0][0] / det]
        ];
    }

    // 3×3 adjugate / det
    const cof = [
        [
            (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
            -(m[1][0] * m[2][2] - m[1][2] * m[2][0]),
            (m[1][0] * m[2][1] - m[1][1] * m[2][0])
        ],
        [
            -(m[0][1] * m[2][2] - m[0][2] * m[2][1]),
            (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
            -(m[0][0] * m[2][1] - m[0][1] * m[2][0])
        ],
        [
            (m[0][1] * m[1][2] - m[0][2] * m[1][1]),
            -(m[0][0] * m[1][2] - m[0][2] * m[1][0]),
            (m[0][0] * m[1][1] - m[0][1] * m[1][0])
        ]
    ];
    // Adjugate = transpose of cofactor matrix
    const adj = [
        [cof[0][0], cof[1][0], cof[2][0]],
        [cof[0][1], cof[1][1], cof[2][1]],
        [cof[0][2], cof[1][2], cof[2][2]]
    ];
    return adj.map(row => row.map(v => v / det));
}

function multiply(A, B) {
    const n = A.length;
    const C = createEmptyMatrix(n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) sum += A[i][k] * B[k][j];
            C[i][j] = sum;
        }
    }
    return C;
}

/* ------------------------------
      DISPLAY MATRIX
--------------------------------*/

function displayMatrix(m, label) {
    let s = `${label} = `;
    m.forEach(row => s += "[" + row.join(" ") + "]\n");
    display.textContent = s;
}

/* ------------------ MATRIX INPUT / EDIT ------------------ */
function appendToDisplay(code) {
    const valu = document.getElementById('value');
    const isNumber = !isNaN(code);

    // =========================
    // MATRIX MODE
    // =========================
    if (currentMode === "matrix") {
        if (editingCell) {
            if (/[\d\.\-]/.test(code)) {
                currentInput += code;
                display.textContent = currentInput;
                return;
            }
            if (code === "⌫") {
                currentInput = currentInput.slice(0, -1);
                display.textContent = currentInput || `Enter value for ${editTarget}${editingCell.slice(1)}`;
                return;
            }
            if (code === "=") {
                confirmMatrixValue();
                return;
            }
            return;
        }
        // detect cell direct typing like "a12"
        if (/^[ab][1-3][1-3]$/i.test(code)) {
            startMatrixEdit(code.toLowerCase());
            return;
        }
        return; // ignore other inputs in matrix mode
    }

    // =========================
    // NORMAL CALCULATOR MODE
    // =========================
    if (!inverseMode) {
        if (justCalc) {
            if (isNumber) {
                currentInput = code;           // replace result with new number
                valu.style.display = "none";
            } else {
                if (['+', '-', '×', '÷', '^', '%'].includes(code)) {
                    if (currentInput === "0") {
                        currentInput = "0" + code;
                    } else {
                        currentInput += code;
                    }
                } else {
                    // For functions like sin(, log(, etc.
                    if (currentInput === "0") {
                        currentInput = code;
                    } else {
                        currentInput += code;
                    }
                }
            }
            justCalc = false;
            updateDisplay();
            return;
        }

        if (currentInput === "0" && code !== ".") currentInput = "";
        if (['+', '-', '×', '÷', '^', '%'].includes(code) && currentInput === '') {
            // Instead of returning, force "0+"
            currentInput = "0" + code;
            updateDisplay();
            return;
        }

        currentInput += code;
        updateDisplay();
        return;
    }

    // =========================
    // INVERSE MODE
    // =========================
    let transformed = code;
    switch (code) {
        case "sin(":
            transformed = "asin(";
            break;
        case "cos(":
            transformed = "acos(";
            break;
        case "tan(":
            transformed = "atan(";
            break;
        case "log(":
            transformed = "10^(";      // inverse of log10 = 10^x
            break;
        case "√(":
            // inverse = x²
            if (currentInput) {
                currentInput = `(${currentInput})^2`;
                updateDisplay();
                return;
            }
            break;

    }

    // Fill y in y√x
    if (inverseMode && isNumber && currentInput.includes("__Y__")) {
        currentInput = currentInput.replace("__Y__", code);
        updateDisplay();
        return;
    }

    if (currentInput === "0" && code !== ".") currentInput = "";
    if (['+', '-', '×', '÷', '^', '%'].includes(code) && currentInput === '') return;

    currentInput += transformed;
    updateDisplay();
}

// Start editing a cell
function startMatrixEdit(cellCode) {
    const prefix = cellCode.charAt(0).toUpperCase(); // 'A' or 'B' 

    // If user clicked the wrong matrix cell
    if (prefix !== editTarget) {

        display.textContent = ''
        document.querySelector('.display #span').textContent = `Error: You are in Edit${editTarget}. Please select ${editTarget} cells only.`;

        setTimeout(() => {
            document.querySelector('.display #span').textContent = ''
        }, 1800);

        return;
    }

    editingCell = cellCode;
    editMatrix = (prefix === "A") ? matrixA : matrixB;
    currentInput = "";

    highlightEditingCell();

    display.textContent = `Enter value for ${editTarget}${cellCode.slice(1)} and press =`;
}

// Highlight current editing cell in grid
function highlightEditingCell() {
    document.querySelectorAll(".mode-grid button").forEach(btn => btn.classList.remove("editing"));
    document.querySelectorAll(".mode-g button").forEach(btn => btn.classList.remove("editing"));

    const btn = document.querySelector(`[onclick*='${editingCell}']`);
    if (btn) btn.classList.add("editing");
}

// Confirm input and save value
function confirmMatrixValue() {
    if (!editingCell) return;

    const r = parseInt(editingCell.charAt(1)) - 1;
    const c = parseInt(editingCell.charAt(2)) - 1;
    const val = Number(currentInput);

    if (!isNaN(val)) editMatrix[r][c] = val;

    // Update display with the edited matrix
    displayMatrix(editMatrix, editTarget);

    // Move to next cell automatically
    const nextCell = getNextMatrixCell(editingCell);
    if (nextCell) {
        startMatrixEdit(nextCell);
    } else {
        // Finished editing
        editingCell = null;
        editMatrix = null;
        currentInput = "";
    }
}

// Get the next cell in the matrix for auto-switch
function getNextMatrixCell(current) {
    const size = (editTarget === "A" ? matrixA : matrixB).length;
    let r = parseInt(current.charAt(1)) - 1;
    let c = parseInt(current.charAt(2)) - 1;

    c++;
    if (c >= size) { c = 0; r++; }
    if (r >= size) return null;

    return current.charAt(0) + (r + 1) + (c + 1);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (currentMode === 'matrix') {
        // Allow numeric typing during cell edit
        if (editingCell) {
            if ((key >= '0' && key <= '9') || key === '.' || key === '-') appendToDisplay(key);
            else if (key === 'Backspace') appendToDisplay('⌫');
            else if (key === 'Enter' || key === '=') appendToDisplay('=');
            else if (key === 'Escape') { editingCell = null; editMatrix = null; display.textContent = ""; }
            return;
        }
    }

    if ((key >= '0' && key <= '9') || key === '.') appendToDisplay(key);
    else if (key === '+' || key === '-') appendToDisplay(key);
    else if (key === '*') appendToDisplay('×');
    else if (key === '/') appendToDisplay('÷');
    else if (key === '(' || key === ')') appendToDisplay(key);
    else if (key === '%') appendToDisplay('%');
    else if (key === '^') appendToDisplay('^');
    else if (key.toLowerCase() === 's') appendToDisplay('sin(');
    else if (key.toLowerCase() === 'c') appendToDisplay('cos(');
    else if (key.toLowerCase() === 't') appendToDisplay('tan(');
    else if (key === 'Enter' || key === '=') {
        if (currentMode === 'cal') calculate();
        else matrixEquals();
    }
    else if (key === 'Escape') { clearAll(); editingCell = null; clearAllM(); }
    else if (key === 'Backspace') backspace();
});


init();
