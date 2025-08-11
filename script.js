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
        <div class="range-inputs">
            <label>Multiplicators range:</label>
            <div>
                <label for="mt-from-factor">From:</label>
                <input type="number" id="mt-from-factor" value="1" min="1" max="100">
                <label for="mt-to-factor">To:</label>
                <input type="number" id="mt-to-factor" value="10" min="1" max="100">
            </div>
        </div>
        <div>
            <label for="mt-percent-hints">Percent of hints (%):</label>
            <input type="number" id="mt-percent-hints" value="5" min="0" max="100">
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
            <label for="rc-max-val">Max Value for Numerator/Denominator:</label>
            <input type="number" id="rc-max-val" value="30" min="2"> 
        </div>
        <div>
            <input type="checkbox" id="rc-ensure-reducible" checked>
            <label for="rc-ensure-reducible">Ensure Fraction is Reducible</label>
        </div>
        <p style="font-size:0.9em; color:#555;">Students should simplify the fraction to its lowest terms.</p>
        <!-- No DR key for this section for now -->
    `;
  }

  function renderRationalOperationsControls() {
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="ro-num-terms">Number of Fractions (2 recommended):</label>
            <input type="number" id="ro-num-terms" value="2" min="2" max="2"> <!-- Forcing 2 for now -->
        </div>
        <div>
            <label for="ro-max-val">Max Value for Numerators/Denominators:</label>
            <input type="number" id="ro-max-val" value="15" min="1">
        </div>
        <p style="font-size:0.9em; color:#555;">Operations will be a mix of addition and subtraction. Result should be simplified. Control sums will be shown for self-checking.</p>
    `;
  }

  // --- Helper Functions ---
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

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
    const fromFactorInput = document.getElementById('mt-from-factor');
    const toFactorInput = document.getElementById('mt-to-factor');
    const percentHintsInput = document.getElementById('mt-percent-hints');

    // --- Read input values and parse them ---
    let fromFactor = parseInt(fromFactorInput.value, 10);
    let toFactor = parseInt(toFactorInput.value, 10);
    let percentHints = parseInt(percentHintsInput.value, 10);

    // --- Validation ---
    if (isNaN(fromFactor) || fromFactor < 1) {
        fromFactor = 1;
        fromFactorInput.value = "1";
    }
    if (isNaN(toFactor) || toFactor < fromFactor) {
        toFactor = fromFactor;
        toFactorInput.value = fromFactor.toString();
    }
    if (isNaN(percentHints) || percentHints < 0 || percentHints > 100) {
        percentHints = 5;
        percentHintsInput.value = "5";
    }

    let htmlOutput = '';

    // --- Generate Partially Pre-filled Multiplication Chart ---
    htmlOutput += `<h3>Multiplication Chart (${fromFactor} &times; ${fromFactor} to ${toFactor} &times; ${toFactor})</h3>`;
    htmlOutput += '<table class="multiplication-chart">';

    // Header row
    htmlOutput += '<thead><tr><th>&times;</th>';
    for (let i = fromFactor; i <= toFactor; i++) {
        htmlOutput += `<th>${i}</th>`;
    }
    htmlOutput += '</tr></thead>';

    // Table body
    htmlOutput += '<tbody>';

    const range = toFactor - fromFactor + 1;
    const totalCells = range * range;
    const cellsToFillCount = Math.floor(totalCells * (percentHints / 100));

    const allCellCoordinates = [];
    for (let r = fromFactor; r <= toFactor; r++) {
        for (let c = fromFactor; c <= toFactor; c++) {
            allCellCoordinates.push([r, c]);
        }
    }

    const cellsToPreFill = new Set();
    // Fisher-Yates shuffle
    for (let i = allCellCoordinates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCellCoordinates[i], allCellCoordinates[j]] = [allCellCoordinates[j], allCellCoordinates[i]];
    }
    for (let i = 0; i < cellsToFillCount && i < allCellCoordinates.length; i++) {
        cellsToPreFill.add(`${allCellCoordinates[i][0]}-${allCellCoordinates[i][1]}`);
    }

    for (let i = fromFactor; i <= toFactor; i++) { // Row iterator
        htmlOutput += `<tr><th>${i}</th>`; // Row header
        for (let j = fromFactor; j <= toFactor; j++) { // Column iterator
            if (cellsToPreFill.has(`${i}-${j}`)) {
                htmlOutput += `<td class="prefilled">${i * j}</td>`;
            } else {
                htmlOutput += '<td> </td>';
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
            
            // New HTML for the user-requested division format
            problemHTML = `
                <div class="arith-problem division-problem-user">
                    <div class="dividend">${dividend}</div>
                    <div class="divisor-container">
                        <div class="divisor">${divisor}</div>
                        <div class="answer-line"></div>
                        <div class="answer-space"></div>
                    </div>
                </div>`;
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
   console.log("Generating Canonical Rational Number problems with Answer Key...");
   problemsContainer.innerHTML = ''; // Clear previous

   // --- Get DOM elements for inputs ---
   const maxValInput = document.getElementById('rc-max-val');
   const ensureReducibleCheckbox = document.getElementById('rc-ensure-reducible');
   const numberOfProblemsInput = document.getElementById('num-problems');

   // --- Read input values ---
   const maxVal = parseInt(maxValInput.value, 10);
   const ensureReducible = ensureReducibleCheckbox.checked;
   const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

   // --- Basic Validation ---
   if (isNaN(maxVal) || maxVal < 2) {
       problemsContainer.innerHTML = '<p class="error-message">Max value for numerator/denominator must be at least 2.</p>';
       return;
   }

   if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
       problemsContainer.innerHTML = '<p class="error-message">Please enter a valid Number of Problems (1-50).</p>';
       return;
   }

   // Helper to get a random integer between min and max (inclusive)
   function getRandomInt(min, max) {
       return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   const h3Title = document.createElement('h3');
   h3Title.textContent = 'Simplify Fractions (to Canonical Form)';
   problemsContainer.appendChild(h3Title);

   const gridContainer = document.createElement('div');
   gridContainer.className = 'arithmetic-grid fraction-problem-grid'; // New class for specific styling if needed

   const problemsHtmlArray = [];
   const simplifiedAnswers = []; // For the answer key
   let generatedCount = 0;
   let generationAttempts = 0;
   const MAX_ATTEMPTS_PER_PROBLEM = 50; // To prevent infinite loops

   while (generatedCount < numberOfProblems && generationAttempts < numberOfProblems * MAX_ATTEMPTS_PER_PROBLEM) {
       generationAttempts++;
       let numerator = getRandomInt(1, maxVal);
       let denominator = getRandomInt(1, maxVal); // Denominator can be 1 initially

       // Ensure denominator is not 1 if numerator is also 1 (1/1 is trivial)
       // and for more interesting problems, ensure denominator isn't 1 in general unless it's e.g. 5/1.
       // A common case is d > 1.
       if (denominator === 1 && numerator !== 1) {
           // If X/1, it's already "simplified" to X.
           // If ensureReducible is true, we want something like 6/2, not 6/1.
           // So, if ensureReducible, try to get a denominator > 1.
           if (ensureReducible) {
                if (maxVal > 1) denominator = getRandomInt(2, maxVal);
                else continue; // Cannot make it reducible if maxVal is 1
           } else {
               // Allow X/1 if not ensuring reducibility, though they are simple.
           }
       } else if (denominator === 1 && numerator === 1) { // Avoid 1/1
           continue;
       }
        
       if (denominator === 0) continue; // Should not happen with getRandomInt(1, maxVal)
       if (numerator === 0 && denominator !== 0) { // 0/d simplifies to 0
            // If ensureReducible, this might be too simple. Skip if ensureReducible.
           if (ensureReducible) continue;
       }


       // Check for reducibility if required
       if (ensureReducible) {
           const commonDivisor = gcd(numerator, denominator);
           // A fraction is reducible if gcd > 1.
           // Also, it's not "interesting" if it's a whole number (e.g. 6/2=3) or if num is 0.
           // We want fractions like 6/4, not 6/2 or 0/5.
           if (commonDivisor <= 1 || denominator === 0 ) { 
                continue; // Not reducible or invalid denominator
           }
           // If it is a whole number like 6/3 (gcd=3), it simplifies to 2/1.
           // If ensureReducible is true, we prefer fractions that don't simplify to whole numbers.
           if (numerator % denominator === 0 && denominator !== 1) { // It's a whole number like 4/2 or 6/3 but not X/1
               continue; // Try for a non-whole number reducible fraction
           }
            // At this point, if ensureReducible, gcd(num,den) > 1 and it's not a whole number (unless it simplifies to X/1)
       }
        
       // Ensure n/d != d/n for variety if they are not equal, simple swap to make num < den if preferred for initial display
       // For simplification tasks, this isn't strictly necessary.

       // Calculate simplified form and then the Control Sum
       const commonDivisorForKey = gcd(numerator, denominator);
       let sn = numerator / commonDivisorForKey; // simplified numerator
       let sd = denominator / commonDivisorForKey; // simplified denominator

       let controlSum;

       if (sd === 0) { 
           controlSum = NaN; // Error indicator
       } else if (sn === 0) { // Fraction is 0 (e.g. 0/5)
           // Remainder fraction is 0/sd. Control sum is 0 + sd.
           controlSum = 0 + sd;
       } else if (sd === 1) { // Simplified to a whole number (sn/1)
           // Remainder fraction is 0/1. Control sum is 0 + 1.
           controlSum = 1; 
       } else if (sn < sd) { // Proper fraction (sn/sd)
           // Remainder fraction is sn/sd. Control sum is sn + sd.
           controlSum = sn + sd;
       } else { // Improper fraction (sn/sd, sn >= sd)
           // const wholePart = Math.floor(sn / sd); // Not needed for control sum
           const remainderNum = sn % sd;
           // Remainder fraction is remainderNum/sd. Control sum is remainderNum + sd.
           // This covers cases like 6/3 -> remainderNum 0 -> control sum 0+3=3.
           controlSum = remainderNum + sd;
       }
       simplifiedAnswers.push({ controlSum: controlSum });

       // Format fraction problem (removed "Simplify:", added calculation space structure)
       const problemHTML = `
           <div class="fraction-problem-item">
               <div class="problem-content">
                   <span class="fraction">
                       <span class="numerator">${numerator}</span>
                       <span class="denominator">${denominator}</span>
                   </span> =
               </div>
               <div class="calculation-space"></div>
           </div>`;
        
       problemsHtmlArray.push(problemHTML);
       generatedCount++;
   }

   if (generatedCount < numberOfProblems && ensureReducible) { // Only show warning if ensureReducible was on
       const warningP = document.createElement('p');
       warningP.className = 'warning-message';
       warningP.textContent = `Note: Could only generate ${generatedCount} of ${numberOfProblems} requested problems with the "Ensure Reducible" constraint. Try increasing Max Value or unchecking the option.`;
       // Insert warning before the grid container if it exists, or just append
       if (gridContainer.parentNode) {
            problemsContainer.insertBefore(warningP, gridContainer);
       } else {
           problemsContainer.appendChild(warningP);
       }
   }

   gridContainer.innerHTML = problemsHtmlArray.join('');
   if (generatedCount > 0 || !ensureReducible) { // Only append grid if problems were made or reducibility wasn't required
       problemsContainer.appendChild(gridContainer);
   } else if (generatedCount === 0 && ensureReducible) {
       // If ensureReducible was on and NO problems could be made, the warning message already covers it.
       // We might not want to show an empty grid container.
   }

    // --- Add Control Sum Key Line ---
    if (simplifiedAnswers.length > 0) {
        const answerKeyContainer = document.createElement('div');
        answerKeyContainer.className = 'control-sum-key-container rational-canonical-key'; // Added specific class
        
        let titleHTML = '<h4>Control Sums (Self-Check)</h4><p style="font-size:0.85em; margin-bottom:5px;">(For mixed numbers like A B/C, sum B+C. For proper fractions N/D, sum N+D. For whole numbers W, sum is 1 (from W and 0/1). If fraction is 0 (0/D), sum is D.)</p>';
        
        const sums = simplifiedAnswers.map(ans => isNaN(ans.controlSum) ? "Err" : ans.controlSum).join(', ');
        titleHTML += `<p class="control-sum-line">Sums: ${sums}</p>`; // New class for the line of sums
        
        answerKeyContainer.innerHTML = titleHTML;
        problemsContainer.appendChild(answerKeyContainer);
    }
    
   console.log(`Canonical Rational Number problems generated: ${generatedCount}`);
}

function generateRationalOperationsProblems() {
    console.log("Generating Rational Operations problems with Control Sum key...");
    problemsContainer.innerHTML = ''; // Clear previous

    // --- Get DOM elements for inputs ---
    // const numTermsInput = document.getElementById('ro-num-terms'); // Fixed to 2 for now
    const maxValInput = document.getElementById('ro-max-val');
    // const operationTypeInput = document.getElementById('ro-operation'); // Removed
    const numberOfProblemsInput = document.getElementById('num-problems');

    // --- Read input values ---
    const maxVal = parseInt(maxValInput.value, 10);
    // let operationType = operationTypeInput.value; // Removed, will always be mixed
    const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

    // --- Basic Validation ---
    if (isNaN(maxVal) || maxVal < 1) {
        problemsContainer.innerHTML = '<p class="error-message">Max value for N/D must be at least 1.</p>';
        return;
    }
    // Removed maxVal > 50 constraint
    if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) {
        problemsContainer.innerHTML = '<p class="error-message">Please enter a valid Number of Problems (1-50).</p>';
        return;
    }

    function getRandomInt(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const h3Title = document.createElement('h3');
    h3Title.textContent = 'Operations on Rational Numbers';
    problemsContainer.appendChild(h3Title);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'arithmetic-grid fraction-problem-grid'; // Reuse existing grid style

    const problemsHtmlArray = [];
    const controlSumsArray = []; 
    let generatedCount = 0;

    for (let i = 0; i < numberOfProblems; i++) {
        let n1 = getRandomInt(1, maxVal);
        let d1 = getRandomInt(1, maxVal);
        let n2 = getRandomInt(1, maxVal);
        let d2 = getRandomInt(1, maxVal);

        // Operations are now always mixed
        const currentOperation = Math.random() < 0.5 ? 'add' : 'subtract';
        
        let resultN, resultD;
        let opSymbol = '';

        if (currentOperation === 'add') {
            opSymbol = '+';
            resultN = (n1 * d2) + (n2 * d1);
            resultD = d1 * d2;
        } else { // subtract
            opSymbol = '&ndash;';
            resultN = (n1 * d2) - (n2 * d1);
            resultD = d1 * d2;
        }

        if (resultD === 0) { 
            i--; continue; 
        }
        
        const commonDivisor = gcd(resultN, resultD);
        let finalN = resultN / commonDivisor;
        let finalD = resultD / commonDivisor;

        if (finalD < 0) {
            finalN = -finalN;
            finalD = -finalD;
        }

        let controlSum;
        if (finalD === 0) { controlSum = NaN; }
        else if (finalN === 0) { controlSum = 0 + finalD; }
        else if (finalD === 1) { controlSum = 1; } 
        else if (Math.abs(finalN) < finalD) { 
            controlSum = Math.abs(finalN) + finalD;
        } else { 
            const remainderNum = Math.abs(finalN) % finalD;
            controlSum = remainderNum + finalD;
        }
        controlSumsArray.push({ controlSum: controlSum });

        const problemHTML = `
            <div class="fraction-operation-item">
                <div class="problem-content">
                    <span class="fraction">
                        <span class="numerator">${n1}</span>
                        <span class="denominator">${d1}</span>
                    </span>
                    <span class="operation-symbol">${opSymbol}</span>
                    <span class="fraction">
                        <span class="numerator">${n2}</span>
                        <span class="denominator">${d2}</span>
                    </span> =
                </div>
                <div class="calculation-space"></div>
            </div>`;
        
        problemsHtmlArray.push(problemHTML);
        generatedCount++;
    }

    gridContainer.innerHTML = problemsHtmlArray.join('');
    problemsContainer.appendChild(gridContainer);
    
    if (controlSumsArray.length > 0) {
        const answerKeyContainer = document.createElement('div');
        answerKeyContainer.className = 'control-sum-key-container rational-operations-key'; // Added specific class
        
        let titleHTML = '<h4>Control Sums (Self-Check)</h4><p style="font-size:0.85em; margin-bottom:5px;">(Simplify result to A B/C or N/D. Sum B+C or N+D. For whole numbers W, sum is 1. For 0/D, sum is D. For negative results, use absolute value of numerator for sum, e.g. -2/5 means sum is 2+5=7)</p>';
        
        const sums = controlSumsArray.map(ans => isNaN(ans.controlSum) ? "Err" : ans.controlSum).join(', ');
        titleHTML += `<p class="control-sum-line">Sums: ${sums}</p>`; // New class for the line of sums

        answerKeyContainer.innerHTML = titleHTML;
        problemsContainer.appendChild(answerKeyContainer);
    }
    
    console.log(`Rational Operations problems generated: ${generatedCount}`);
}

  // --- Event Handlers ---
  function handleTopicChange() {
    currentTopic = topicSelector.value;
    console.log("Topic changed to:", currentTopic);
    // Clear previous topic-specific controls
    topicSpecificControlsContainer.innerHTML = "";
    problemsContainer.innerHTML = "";
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
