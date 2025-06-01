document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // --- DOM Element References ---
  const topicSelector = document.getElementById("topic-selector");
  const controlsPanel = document.getElementById("controls-panel");
  const topicSpecificControlsContainer = document.getElementById(
    "topic-specific-controls",
  );
  const numProblemsInput = document.getElementById("num-problems");
  const generateButton = document.getElementById("generate-button");
  const printButton = document.getElementById("print-button");
  const problemsContainer = document.getElementById("problems-container");

  // --- State ---
  let currentTopic = topicSelector.value;

  // --- Topic-Specific Control Generators ---
  // These functions will create and append input elements to topicSpecificControlsContainer

  function renderMultiplicationTableControls() {
      topicSpecificControlsContainer.innerHTML = `
          <div>
              <label for="mt-max-factor">Table Size (Max 10x10):</label>
              <input type="number" id="mt-max-factor" value="10" min="1" max="10">
          </div>
          <p style="font-size:0.9em; color:#555;">The chart will be partially pre-filled to help learning.</p>
      `;
  }

  function renderAdditionSubtractionControls() {
      topicSpecificControlsContainer.innerHTML = `
          <div>
              <label for="as-digits-num1">Digits in Number 1:</label>
              <input type="number" id="as-digits-num1" value="3" min="1" max="7">
          </div>
          <div>
              <label for="as-digits-num2">Digits in Number 2:</label>
              <input type="number" id="as-digits-num2" value="3" min="1" max="7">
          </div>
          <p style="font-size:0.9em; color:#555;">Digital roots of the answers will be shown below the problems for self-checking.</p>
      `;
  }

  function renderMultiplicationDivisionControls() {
      topicSpecificControlsContainer.innerHTML = `
          <p><strong>Multiplication:</strong></p>
          <div>
              <label for="md-digits-factor1">Digits in Factor 1:</label>
              <input type="number" id="md-digits-factor1" value="2" min="1" max="4">
          </div>
          <div>
              <label for="md-digits-factor2">Digits in Factor 2:</label>
              <input type="number" id="md-digits-factor2" value="2" min="1" max="4">
          </div>
          <!-- <div>
              <input type="checkbox" id="md-allow-carry-multiplication" checked>
              <label for="md-allow-carry-multiplication">Allow Carry (Multiplication)</label>
          </div> -->
          <hr>
          <p><strong>Division:</strong></p>
          <div>
              <label for="md-digits-divisor">Digits in Divisor:</label>
              <input type="number" id="md-digits-divisor" value="2" min="1" max="4">
          </div>
          <div>
              <label for="md-digits-quotient">Digits in Quotient:</label>
              <input type="number" id="md-digits-quotient" value="1" min="1" max="3">
          </div>
          <div>
              <input type="checkbox" id="md-no-remainder" checked>
              <label for="md-no-remainder">Require Integer Result (No Remainder)</label>
          </div>
          <p style="font-size:0.9em; color:#555;">Digital roots of products/quotients will be shown for self-checking.</p>
      `;
  }

  function renderRationalCanonicalControls() {
    topicSpecificControlsContainer.innerHTML = `
            <div>
                <label for="rc-max-numerator">Max Numerator Value:</label>
                <input type="number" id="rc-max-numerator" value="50" min="1">
            </div>
            <div>
                <label for="rc-max-denominator">Max Denominator Value:</label>
                <input type="number" id="rc-max-denominator" value="50" min="2">
            </div>
             <div>
                <input type="checkbox" id="rc-ensure-reducible" checked>
                <label for="rc-ensure-reducible">Ensure Fraction is Reducible</label>
            </div>
        `;
  }

  function renderRationalOperationsControls() {
    topicSpecificControlsContainer.innerHTML = `
            <div>
                <label for="ro-num-terms">Number of Fractions (e.g., 2 for a/b + c/d):</label>
                <input type="number" id="ro-num-terms" value="2" min="2">
            </div>
            <div>
                <label for="ro-max-value">Max value for Numerators/Denominators:</label>
                <input type="number" id="ro-max-value" value="20" min="1">
            </div>
            <div>
                <label for="ro-operation">Operation:</label>
                <select id="ro-operation">
                    <option value="add">Addition (+)</option>
                    <option value="subtract">Subtraction (-)</option>
                    <!-- <option value="multiply">Multiplication (*)</option> -->
                    <!-- <option value="divide">Division (/)</option> -->
                </select>
            </div>
        `;
  }

  // --- Helper Functions ---
  function digitalRoot(n) {
      let num = Math.abs(n); // Ensure positive for the digit summing process
      let sum = num;
      while (sum >= 10) {
          sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
      }
      return sum;
  }

  // --- Problem Generator Functions ---
  // getRandomNumber helper might be duplicated if not careful; ensure it's defined once or passed if needed.
  // For simplicity here, assuming it's available in scope, or each generator re-defines it if necessary.
  // These will be filled in later based on your plan

  function generateMultiplicationTableProblems() {
      console.log("Generating partially pre-filled Multiplication Table...");
      // --- Get DOM elements for inputs ---
      const maxFactorInput = document.getElementById('mt-max-factor');
      // numProblemsInput is available but not used for this chart-only mode.

      // --- Read input values and parse them ---
      let maxFactor = parseInt(maxFactorInput.value, 10);

      // --- Validation and Capping ---
      if (isNaN(maxFactor) || maxFactor < 1) {
          maxFactor = 1; // Default to a minimal valid value if input is bad
          maxFactorInput.value = "1"; // Correct the input field
          console.warn("Invalid Max Factor, defaulted to 1.");
      }
      if (maxFactor > 10) {
          maxFactor = 10; // Cap at 10
          maxFactorInput.value = "10"; // Correct the input field
          console.warn("Max Factor capped at 10.");
      }

      let htmlOutput = '';

      // --- Generate Partially Pre-filled Multiplication Chart ---
      htmlOutput += `<h3>Multiplication Chart (up to ${maxFactor} &times; ${maxFactor})</h3>`;
      htmlOutput += '<table class="multiplication-chart">';
        
      // Header row
      htmlOutput += '<thead><tr><th>&times;</th>';
      for (let i = 1; i <= maxFactor; i++) {
          htmlOutput += `<th>${i}</th>`;
      }
      htmlOutput += '</tr></thead>';
        
      // Table body
      htmlOutput += '<tbody>';

      const totalCells = maxFactor * maxFactor;
      const cellsToFillCount = Math.floor(totalCells * 0.20); // Approximately 20%
        
      // Create a flat list of all possible cell coordinates [row, col]
      const allCellCoordinates = [];
      for (let r = 1; r <= maxFactor; r++) {
          for (let c = 1; c <= maxFactor; c++) {
              allCellCoordinates.push([r, c]);
          }
      }

      // Shuffle the coordinates and pick the first `cellsToFillCount` to pre-fill
      // This creates a Set of strings like "row-col" for easy lookup
      const cellsToPreFill = new Set();
      // Fisher-Yates shuffle
      for (let i = allCellCoordinates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allCellCoordinates[i], allCellCoordinates[j]] = [allCellCoordinates[j], allCellCoordinates[i]];
      }
      for (let i = 0; i < cellsToFillCount && i < allCellCoordinates.length; i++) {
          cellsToPreFill.add(`${allCellCoordinates[i][0]}-${allCellCoordinates[i][1]}`);
      }

      for (let i = 1; i <= maxFactor; i++) { // Row iterator
          htmlOutput += `<tr><th>${i}</th>`; // Row header
          for (let j = 1; j <= maxFactor; j++) { // Column iterator
              if (cellsToPreFill.has(`${i}-${j}`)) {
                  htmlOutput += `<td class="prefilled">${i * j}</td>`; // Filled cell with class
              } else {
                  htmlOutput += '<td> </td>'; // Empty cell for student to fill
              }
          }
          htmlOutput += '</tr>';
      }
      htmlOutput += '</tbody></table>';

      problemsContainer.innerHTML = htmlOutput;
      console.log("Partially pre-filled Multiplication Table problems generated.");
  }

  function generateAdditionSubtractionProblems() {
      console.log("Generating Add/Sub problems with digital root answer key...");
      problemsContainer.innerHTML = ''; // Clear previous problems

      // --- Get DOM elements for inputs ---
      const digitsNum1Input = document.getElementById('as-digits-num1');
      const digitsNum2Input = document.getElementById('as-digits-num2');
      const numberOfProblemsInput = document.getElementById('num-problems'); // Global control

      // --- Read input values and parse them ---
      const digits1 = parseInt(digitsNum1Input.value, 10);
      const digits2 = parseInt(digitsNum2Input.value, 10);
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      // --- Basic Validation ---
      if (isNaN(digits1) || digits1 < 1 || digits1 > 7 || isNaN(digits2) || digits2 < 1 || digits2 > 7) {
          problemsContainer.innerHTML = '<p class="error-message">Please enter valid digit counts (1-7) for both numbers.</p>';
          return;
      }
      // Removed Max 7 digits validation here as it's covered above for as-digits-num1/2.
      if (isNaN(numberOfProblems) || numberOfProblems < 1) {
          problemsContainer.innerHTML = '<p class="error-message">Please enter a valid Number of Problems (>= 1).</p>';
          return;
      }
      if (numberOfProblems > 50) { // Adjust safety limit for grid display
          problemsContainer.innerHTML = '<p class="error-message">Max 50 problems for this format. Please choose a smaller number.</p>';
          return;
      }
      // Removed Digital Root validation as it's no longer an input for Add/Sub

    // Helper to generate a random number
    function getRandomNumber(numDigits) {
        if (numDigits <= 0) return 0;
        const min = Math.pow(10, numDigits - 1);
        const max = Math.pow(10, numDigits) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const h3Title = document.createElement('h3');
    h3Title.textContent = 'Addition & Subtraction Problems';
    problemsContainer.appendChild(h3Title);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'arithmetic-grid';

    const problemsHtmlArray = [];
    const answerRoots = []; // To store digital roots of answers
    let generatedCount = 0;
    // Removed 'attempts' variable

    while (generatedCount < numberOfProblems) { // Loop until numberOfProblems is met
        let num1 = getRandomNumber(digits1);
        let num2 = getRandomNumber(digits2);
        const isAddition = Math.random() < 0.5;
        let actualResult; 
        let problemHTML;

        if (isAddition) {
            actualResult = num1 + num2;
            problemHTML = `
                <div class="arith-problem">
                    <div class="operand-1">${num1}</div>
                    <div class="operator-operand2">
                        <span class="operator">+</span>
                        <span class="operand-2">${num2}</span>
                    </div>
                    <div class="problem-line"></div>
                    <div class="answer-space"></div>
                </div>`;
        } else { // Subtraction
            if (num1 < num2) { // Ensure num1 is greater for standard layout
                [num1, num2] = [num2, num1];
            }
            actualResult = num1 - num2;
            problemHTML = `
                <div class="arith-problem">
                    <div class="operand-1">${num1}</div>
                    <div class="operator-operand2">
                        <span class="operator">&ndash;</span>
                        <span class="operand-2">${num2}</span>
                    </div>
                    <div class="problem-line"></div>
                    <div class="answer-space"></div>
                </div>`;
        }
        
        problemsHtmlArray.push(problemHTML);
        answerRoots.push({ root: digitalRoot(actualResult) }); // Simplified
        generatedCount++;
    }

    // No specific error/warning needed here for not meeting count, as we always generate numberOfProblems

    gridContainer.innerHTML = problemsHtmlArray.join('');
    problemsContainer.appendChild(gridContainer); // Always append the grid container

    // --- Add Digital Root Self-Check Grid ---
    if (answerRoots.length > 0) {
        const rootKeyGridContainer = document.createElement('div');
        rootKeyGridContainer.className = 'digital-root-check-grid-container';
        
        rootKeyGridContainer.innerHTML = '<h4>Digital Root Self-Check Grid</h4>';

        const drGrid = document.createElement('div');
        drGrid.className = 'digital-root-check-grid'; // This will be the actual grid

        answerRoots.forEach(item => {
            drGrid.innerHTML += `<div class="dr-cell">${item.root}</div>`;
        });
        rootKeyGridContainer.appendChild(drGrid);
        problemsContainer.appendChild(rootKeyGridContainer);
    }
    
    console.log(`Addition/Subtraction problems with DR key generated: ${generatedCount}`);
}

  function generateMultiplicationDivisionProblems() {
    console.log("Generating Multiplication/Division problems with digital root key...");
    problemsContainer.innerHTML = ''; // Clear previous

    // --- Get DOM elements for inputs ---
    const digitsFactor1Input = document.getElementById('md-digits-factor1');
    const digitsFactor2Input = document.getElementById('md-digits-factor2');
    // const allowCarryMulInput = document.getElementById('md-allow-carry-multiplication'); // Not actively used

    const digitsDivisorInput = document.getElementById('md-digits-divisor');
    const digitsQuotientInput = document.getElementById('md-digits-quotient');
    const noRemainderInput = document.getElementById('md-no-remainder'); // Still useful for clarity

    const numberOfProblemsInput = document.getElementById('num-problems');

    // --- Read input values ---
    const digitsF1 = parseInt(digitsFactor1Input.value, 10);
    const digitsF2 = parseInt(digitsFactor2Input.value, 10);

    const digitsDiv = parseInt(digitsDivisorInput.value, 10);
    const digitsQuo = parseInt(digitsQuotientInput.value, 10);
    // const requireNoRemainder = noRemainderInput.checked; // Logic will always produce no remainder

    const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

    // --- Basic Validation ---
    if (isNaN(digitsF1) || digitsF1 < 1 || digitsF1 > 4 || isNaN(digitsF2) || digitsF2 < 1 || digitsF2 > 4) {
        problemsContainer.innerHTML = '<p class="error-message">Multiplication: Enter valid digit counts (1-4) for factors.</p>';
        return;
    }
    if (isNaN(digitsDiv) || digitsDiv < 1 || digitsDiv > 4 || isNaN(digitsQuo) || digitsQuo < 1 || digitsQuo > 3) {
        problemsContainer.innerHTML = '<p class="error-message">Division: Enter valid digit counts (Divisor: 1-4, Quotient: 1-3).</p>';
        return;
    }
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        problemsContainer.innerHTML = '<p class="error-message">Please enter a valid Number of Problems (1-50).</p>';
        return;
    }

    // getRandomNumber helper (ensure it's accessible)
    function getRandomNumber(numDigits) {
        if (numDigits <= 0) return 1; 
        const min = Math.pow(10, numDigits - 1);
        const max = Math.pow(10, numDigits) - 1;
        // Ensure min is at least 1 for single digit numbers (10^0 = 1)
        // For numDigits=1, min=1, max=9. For numDigits=2, min=10, max=99.
        if (min === 0 && numDigits === 1) return Math.floor(Math.random() * 9) + 1; // 1-9
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    const h3Title = document.createElement('h3');
    h3Title.textContent = 'Multiplication & Division Problems';
    problemsContainer.appendChild(h3Title);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'arithmetic-grid problem-list-grid'; 

    const problemsHtmlArray = [];
    const answerRoots = [];
    let generatedCount = 0;

    for (let i = 0; i < numberOfProblems; i++) {
        let problemHTML = '';
        let actualResult;
        let problemType = '';

        if (Math.random() < 0.5 || digitsDiv === 0 || digitsQuo === 0) { // Prioritize multiplication if division inputs are problematic (though validation should catch it)
            problemType = "Multiplication";
            const factor1 = getRandomNumber(digitsF1);
            const factor2 = getRandomNumber(digitsF2);
            actualResult = factor1 * factor2;
            // New HTML for columnar multiplication
            problemHTML = `
                <div class="arith-problem multiplication-problem">
                    <div class="operand-1">${factor1}</div>
                    <div class="operator-operand2">
                        <span class="operator">&times;</span>
                        <span class="operand-2">${factor2}</span>
                    </div>
                    <div class="problem-line"></div>
                    <div class="answer-space"></div>
                </div>`;
        } else { // Division
            problemType = "Division";
            let divisor = getRandomNumber(digitsDiv);
            let quotient = getRandomNumber(digitsQuo);

            // Avoid division by zero or by one if quotient is large, or too simple problems.
            if (divisor === 0) divisor = 1; // Safeguard, though getRandomNumber(1+) prevents this
            if (quotient === 0) quotient = 1; // Safeguard

            // For very small divisors/quotients, result might not match digit expectations
            // e.g. 1-digit divisor, 1-digit quotient => 1-digit dividend (e.g. 2 / 1 = 2)
            // This is generally fine.

            const dividend = divisor * quotient; 
            actualResult = quotient; 
            
            // Linear HTML for division, wrapped in its own div for grid consistency
            let divisionProblemStr = `${dividend} &divide; ${divisor} = <span class="blank">___</span>`;
            // Add problem number to linear division problems for clarity, columnar problems get it implicitly by position
            problemHTML = `<div class="problem division-problem">${i + 1}. ${divisionProblemStr}</div>`; 
        }
        
        problemsHtmlArray.push(problemHTML); // Push the generated HTML (either columnar or linear wrapped)
        answerRoots.push({ root: digitalRoot(actualResult) }); // Simplified for later grid display
        generatedCount++;
    }

    gridContainer.innerHTML = problemsHtmlArray.join('');
    problemsContainer.appendChild(gridContainer);

    // --- Add Digital Root Self-Check Grid ---
    if (answerRoots.length > 0) {
        const rootKeyGridContainer = document.createElement('div');
        rootKeyGridContainer.className = 'digital-root-check-grid-container';
        
        let rootKeyTitleHTML = `<h4>Digital Root Self-Check Grid</h4>
                                <p style="font-size:0.85em; margin-bottom:10px;">
                                (Product DR for &times;, Quotient DR for &divide;)
                                </p>`;
        rootKeyGridContainer.innerHTML = rootKeyTitleHTML;

        const drGrid = document.createElement('div');
        drGrid.className = 'digital-root-check-grid';

        answerRoots.forEach(item => {
            // item is { root: X }
            drGrid.innerHTML += `<div class="dr-cell">${item.root}</div>`;
        });
        rootKeyGridContainer.appendChild(drGrid);
        problemsContainer.appendChild(rootKeyGridContainer);
    }
    
    console.log(`Multiplication/Division problems with DR key generated: ${generatedCount}`);
}

  function generateRationalCanonicalProblems() {
    console.log("Generating Canonical Rational Number problems...");
    problemsContainer.innerHTML =
      "<p>Canonical Rational Number problems will appear here.</p>";
    // TODO: Implement logic based on inputs:
    // document.getElementById('rc-max-numerator').value
    // document.getElementById('rc-max-denominator').value
    // document.getElementById('rc-ensure-reducible').checked
    // numProblemsInput.value
  }

  function generateRationalOperationsProblems() {
    console.log("Generating Rational Operations problems...");
    problemsContainer.innerHTML =
      "<p>Rational Operations problems will appear here.</p>";
    // TODO: Implement logic based on inputs from renderRationalOperationsControls()
    // numProblemsInput.value
  }

  // --- Event Handlers ---
  function handleTopicChange() {
    currentTopic = topicSelector.value;
    console.log("Topic changed to:", currentTopic);
    // Clear previous topic-specific controls
    topicSpecificControlsContainer.innerHTML = "";
    // Render new controls based on selected topic
    switch (currentTopic) {
      case "multiplication-table":
        renderMultiplicationTableControls();
        break;
      case "addition-subtraction":
        renderAdditionSubtractionControls();
        break;
      case "multiplication-division":
        renderMultiplicationDivisionControls();
        break;
      case "rational-canonical":
        renderRationalCanonicalControls();
        break;
      case "rational-operations":
        renderRationalOperationsControls();
        break;
      default:
        console.error("Unknown topic selected:", currentTopic);
    }
  }

  function handleGenerateClick() {
    console.log("Generate button clicked for topic:", currentTopic);
    problemsContainer.innerHTML = ""; // Clear previous problems

    const numberOfProblems = parseInt(numProblemsInput.value, 10);
    if (isNaN(numberOfProblems) || numberOfProblems < 1) {
      alert("Please enter a valid number of problems.");
      return;
    }

    switch (currentTopic) {
      case "multiplication-table":
        generateMultiplicationTableProblems();
        break;
      case "addition-subtraction":
        generateAdditionSubtractionProblems();
        break;
      case "multiplication-division":
        generateMultiplicationDivisionProblems();
        break;
      case "rational-canonical":
        generateRationalCanonicalProblems();
        break;
      case "rational-operations":
        generateRationalOperationsProblems();
        break;
      default:
        console.error("Unknown topic for generation:", currentTopic);
        problemsContainer.innerHTML = "<p>Error: Unknown topic selected.</p>";
    }
  }

  function handlePrintClick() {
    console.log("Print button clicked");
    window.print();
  }

  // --- Initialization ---
  if (topicSelector) {
    topicSelector.addEventListener("change", handleTopicChange);
  }
  if (generateButton) {
    generateButton.addEventListener("click", handleGenerateClick);
  }
  if (printButton) {
    printButton.addEventListener("click", handlePrintClick);
  }

  // Initial rendering of controls for the default selected topic
  handleTopicChange();

  console.log("App initialized.");
});
