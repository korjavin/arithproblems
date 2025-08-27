document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // --- I18N ---
  let translations = {};
  const supportedLangs = ['en', 'de', 'ru'];
  let currentLang = 'en'; // default

  async function applyTranslations() {
      document.querySelectorAll('[data-translate-key]').forEach(element => {
          const key = element.getAttribute('data-translate-key');
          const translation = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
          if (translation) {
              element.innerHTML = translation;
          }
      });
      // also update title
      const titleElement = document.querySelector('title');
      const titleKey = titleElement ? titleElement.dataset.translateKey : null;
      if(titleKey) {
          const translation = titleKey.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
          if(translation) {
              document.title = translation;
          }
      }
  }

  async function setLanguage(lang) {
      if (!supportedLangs.includes(lang)) {
          lang = 'en';
      }
      currentLang = lang;
      localStorage.setItem('lang', lang);

      try {
          const response = await fetch(`locales/${lang}.json`);
          translations = await response.json();
          await applyTranslations();
          // After applying translations, we need to re-render the controls
          // because their content is generated dynamically.
          handleTopicChange();
      } catch (error) {
          console.error(`Could not load language file: ${lang}.json`, error);
      }
  }

  function getInitialLang() {
      let lang = localStorage.getItem('lang');
      if (lang && supportedLangs.includes(lang)) {
          return lang;
      }
      lang = navigator.language.split('-')[0];
      if (supportedLangs.includes(lang)) {
          return lang;
      }
      return 'en';
  }

  // --- DOM Element References ---
  const topicGrid = document.getElementById("topic-grid");
  const topicCards = document.querySelectorAll(".topic-card");
  const controlsPanel = document.getElementById("controls-panel");
  const topicSpecificControlsContainer = document.getElementById(
    "topic-specific-controls",
  );
  const numProblemsInput = document.getElementById("num-problems");
  const generateButton = document.getElementById("generate-button");
  const printButton = document.getElementById("print-button");
  const problemsContainer = document.getElementById("problems-container");
  const languageSwitcher = document.getElementById("language-switcher");


  // --- State ---
  let currentTopic = "multiplication-table"; // Default to first topic

  // --- Topic-Specific Control Generators ---
  // These functions will create and append input elements to topicSpecificControlsContainer

  function renderMultiplicationTableControls() {
    const t = translations.script.multiplication_table;
    topicSpecificControlsContainer.innerHTML = `
        <div class="range-inputs">
            <label>${t.range_label}</label>
            <div>
                <label for="mt-from-factor">${t.from_label}</label>
                <input type="number" id="mt-from-factor" value="1" min="1" max="100">
                <label for="mt-to-factor">${t.to_label}</label>
                <input type="number" id="mt-to-factor" value="10" min="1" max="100">
            </div>
        </div>
        <div>
            <label for="mt-percent-hints">${t.percent_hints_label}</label>
            <input type="number" id="mt-percent-hints" value="5" min="0" max="100">
        </div>
        <p style="font-size:0.9em; color:#555;">${t.chart_description}</p>
    `;
  }

  function renderAdditionSubtractionControls() {
      const t = translations.script.addition_subtraction;
      topicSpecificControlsContainer.innerHTML = `
          <div>
              <label for="as-digits-num1">${t.digits_num1_label}</label>
              <input type="number" id="as-digits-num1" value="3" min="1" max="7">
          </div>
          <div>
              <label for="as-digits-num2">${t.digits_num2_label}</label>
              <input type="number" id="as-digits-num2" value="3" min="1" max="7">
          </div>
          <p style="font-size:0.9em; color:#555;">${t.digital_root_description}</p>
      `;
  }

  function renderMultiplicationDivisionControls() {
      const t = translations.script.multiplication_division;
      topicSpecificControlsContainer.innerHTML = `
          <p><strong>${t.multiplication_title}</strong></p>
          <div>
              <label for="md-digits-factor1">${t.digits_factor1_label}</label>
              <input type="number" id="md-digits-factor1" value="2" min="1" max="4">
          </div>
          <div>
              <label for="md-digits-factor2">${t.digits_factor2_label}</label>
              <input type="number" id="md-digits-factor2" value="2" min="1" max="4">
          </div>
          <hr>
          <p><strong>${t.division_title}</strong></p>
          <div>
              <label for="md-digits-divisor">${t.digits_divisor_label}</label>
              <input type="number" id="md-digits-divisor" value="2" min="1" max="4">
          </div>
          <div>
              <label for="md-digits-quotient">${t.digits_quotient_label}</label>
              <input type="number" id="md-digits-quotient" value="1" min="1" max="3">
          </div>
          <div>
              <input type="checkbox" id="md-no-remainder" checked>
              <label for="md-no-remainder">${t.no_remainder_label}</label>
          </div>
          <p style="font-size:0.9em; color:#555;">${t.digital_root_description}</p>
      `;
  }

  function renderRationalCanonicalControls() {
    const t = translations.script.rational_canonical;
    topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="rc-max-val">${t.max_val_label}</label>
            <input type="number" id="rc-max-val" value="30" min="2"> 
        </div>
        <div>
            <input type="checkbox" id="rc-ensure-reducible" checked>
            <label for="rc-ensure-reducible">${t.ensure_reducible_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderRationalOperationsControls() {
      const t = translations.script.rational_operations;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="ro-num-terms">${t.num_terms_label}</label>
            <input type="number" id="ro-num-terms" value="2" min="2" max="5">
        </div>
        <div>
            <label for="ro-max-val">${t.max_val_label}</label>
            <input type="number" id="ro-max-val" value="15" min="1">
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderRationalMultDivControls() {
      const t = translations.script.rational_mult_div;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="rmd-max-val">${t.max_val_label}</label>
            <input type="number" id="rmd-max-val" value="12" min="1">
        </div>
        <div>
            <input type="checkbox" id="rmd-avoid-whole-nums" checked>
            <label for="rmd-avoid-whole-nums">${t.avoid_whole_nums_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderProportionControls() {
      const t = translations.script.proportion;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="prop-max-base">${t.max_base_label}</label>
            <input type="number" id="prop-max-base" value="10" min="1" max="15">
        </div>
        <div>
            <label for="prop-max-multiplier">${t.max_multiplier_label}</label>
            <input type="number" id="prop-max-multiplier" value="8" min="2" max="12">
        </div>
        <div>
            <input type="checkbox" id="prop-simplify-ratios" checked>
            <label for="prop-simplify-ratios">${t.simplify_ratios_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderDecimalRationalControls() {
      const t = translations.script.decimal_rational;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="dr-problem-mix">${t.problem_mix_label}</label>
            <select id="dr-problem-mix">
                <option value="mixed">${t.mixed_option}</option>
                <option value="fraction-to-decimal">${t.fraction_to_decimal_option}</option>
                <option value="decimal-to-fraction">${t.decimal_to_fraction_option}</option>
            </select>
        </div>
        <div>
            <label for="dr-decimal-places">${t.max_decimal_places_label}</label>
            <input type="number" id="dr-decimal-places" value="3" min="1" max="4">
        </div>
        <div>
            <input type="checkbox" id="dr-terminating-only" checked>
            <label for="dr-terminating-only">${t.terminating_only_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderPercentageControls() {
      const t = translations.script.percentage;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="pct-problem-type">${t.problem_type_label}</label>
            <select id="pct-problem-type">
                <option value="mixed">${t.mixed_option}</option>
                <option value="find-percent">${t.find_percent_option}</option>
                <option value="find-what-percent">${t.find_what_percent_option}</option>
                <option value="find-whole">${t.find_whole_option}</option>
            </select>
        </div>
        <div>
            <label for="pct-max-number">${t.max_number_label}</label>
            <input type="number" id="pct-max-number" value="100" min="10" max="1000">
        </div>
        <div>
            <input type="checkbox" id="pct-whole-percents-only" checked>
            <label for="pct-whole-percents-only">${t.whole_percents_only_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderGeometryControls() {
      const t = translations.script.geometry;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="geo-shape-mix">${t.shape_mix_label}</label>
            <select id="geo-shape-mix">
                <option value="mixed">${t.mixed_shapes_option}</option>
                <option value="rectangles">${t.rectangles_only_option}</option>
                <option value="squares">${t.squares_only_option}</option>
                <option value="triangles">${t.triangles_only_option}</option>
                <option value="circles">${t.circles_only_option}</option>
            </select>
        </div>
        <div>
            <label for="geo-calculation-type">${t.calculation_type_label}</label>
            <select id="geo-calculation-type">
                <option value="mixed">${t.mixed_calculations_option}</option>
                <option value="area">${t.area_only_option}</option>
                <option value="perimeter">${t.perimeter_only_option}</option>
            </select>
        </div>
        <div>
            <label for="geo-max-dimension">${t.max_dimension_label}</label>
            <input type="number" id="geo-max-dimension" value="12" min="2" max="20">
        </div>
        <div>
            <input type="checkbox" id="geo-whole-numbers-only" checked>
            <label for="geo-whole-numbers-only">${t.whole_numbers_only_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderLinearEquationsControls() {
      const t = translations.script.linear_equations;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="eq-equation-type">${t.equation_type_label}</label>
            <select id="eq-equation-type">
                <option value="mixed">${t.mixed_equations_option}</option>
                <option value="one-step">${t.one_step_option}</option>
                <option value="two-step">${t.two_step_option}</option>
                <option value="with-fractions">${t.with_fractions_option}</option>
            </select>
        </div>
        <div>
            <label for="eq-coefficient-range">${t.coefficient_range_label}</label>
            <input type="number" id="eq-coefficient-range" value="5" min="1" max="10">
        </div>
        <div>
            <label for="eq-solution-range">${t.solution_range_label}</label>
            <input type="number" id="eq-solution-range" value="12" min="1" max="50">
        </div>
        <div>
            <input type="checkbox" id="eq-allow-negative-solutions">
            <label for="eq-allow-negative-solutions">${t.allow_negative_solutions_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
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
  function generateMultiplicationTableProblems() {
    const t = translations.script.multiplication_table;
    // ... (rest of the function uses `t` for strings)
    const fromFactorInput = document.getElementById('mt-from-factor');
    const toFactorInput = document.getElementById('mt-to-factor');
    const percentHintsInput = document.getElementById('mt-percent-hints');
    let fromFactor = parseInt(fromFactorInput.value, 10);
    let toFactor = parseInt(toFactorInput.value, 10);
    let percentHints = parseInt(percentHintsInput.value, 10);

    if (isNaN(fromFactor) || fromFactor < 1) { fromFactor = 1; fromFactorInput.value = "1"; }
    if (isNaN(toFactor) || toFactor < fromFactor) { toFactor = fromFactor; toFactorInput.value = fromFactor.toString(); }
    if (isNaN(percentHints) || percentHints < 0 || percentHints > 100) { percentHints = 5; percentHintsInput.value = "5"; }

    let htmlOutput = '';
    const title = t.chart_title.replace(/{fromFactor}/g, fromFactor).replace(/{toFactor}/g, toFactor);
    htmlOutput += `<h3>${title}</h3>`;
    htmlOutput += '<table class="multiplication-chart">';
    htmlOutput += '<thead><tr><th>&times;</th>';
    for (let i = fromFactor; i <= toFactor; i++) { htmlOutput += `<th>${i}</th>`; }
    htmlOutput += '</tr></thead>';
    htmlOutput += '<tbody>';

    const range = toFactor - fromFactor + 1;
    const totalCells = range * range;
    const cellsToFillCount = Math.floor(totalCells * (percentHints / 100));
    const allCellCoordinates = [];
    for (let r = fromFactor; r <= toFactor; r++) { for (let c = fromFactor; c <= toFactor; c++) { allCellCoordinates.push([r, c]); } }
    const cellsToPreFill = new Set();
    for (let i = allCellCoordinates.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[allCellCoordinates[i], allCellCoordinates[j]] = [allCellCoordinates[j], allCellCoordinates[i]]; }
    for (let i = 0; i < cellsToFillCount && i < allCellCoordinates.length; i++) { cellsToPreFill.add(`${allCellCoordinates[i][0]}-${allCellCoordinates[i][1]}`); }
    for (let i = fromFactor; i <= toFactor; i++) { htmlOutput += `<tr><th>${i}</th>`; for (let j = fromFactor; j <= toFactor; j++) { if (cellsToPreFill.has(`${i}-${j}`)) { htmlOutput += `<td class="prefilled">${i * j}</td>`; } else { htmlOutput += '<td> </td>'; } } htmlOutput += '</tr>'; }
    htmlOutput += '</tbody></table>';
    problemsContainer.innerHTML = htmlOutput;
  }

  function generateAdditionSubtractionProblems() {
      const t = translations.script.addition_subtraction;
      problemsContainer.innerHTML = '';
      const digitsNum1Input = document.getElementById('as-digits-num1');
      const digitsNum2Input = document.getElementById('as-digits-num2');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const digits1 = parseInt(digitsNum1Input.value, 10);
      const digits2 = parseInt(digitsNum2Input.value, 10);
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(digits1) || digits1 < 1 || digits1 > 7 || isNaN(digits2) || digits2 < 1 || digits2 > 7) { problemsContainer.innerHTML = `<p class="error-message">${t.error_invalid_digits}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1) { problemsContainer.innerHTML = `<p class="error-message">${t.error_invalid_num_problems}</p>`; return; }
      if (numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_problems}</p>`; return; }

      function getRandomNumber(numDigits) { if (numDigits <= 0) return 0; const min = Math.pow(10, numDigits - 1); const max = Math.pow(10, numDigits) - 1; return Math.floor(Math.random() * (max - min + 1)) + min; }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid';
      const problemsHtmlArray = [];
      const answerRoots = [];
      let generatedCount = 0;

      while (generatedCount < numberOfProblems) {
          let num1 = getRandomNumber(digits1);
          let num2 = getRandomNumber(digits2);
          const isAddition = Math.random() < 0.5;
          let actualResult;
          let problemHTML;
          if (isAddition) {
              actualResult = num1 + num2;
              problemHTML = `<div class="arith-problem"><div class="operand-1">${num1}</div><div class="operator-operand2"><span class="operator">+</span><span class="operand-2">${num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`;
          } else {
              if (num1 < num2) { [num1, num2] = [num2, num1]; }
              actualResult = num1 - num2;
              problemHTML = `<div class="arith-problem"><div class="operand-1">${num1}</div><div class="operator-operand2"><span class="operator">&ndash;</span><span class="operand-2">${num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`;
          }
          problemsHtmlArray.push(problemHTML);
          answerRoots.push({ root: digitalRoot(actualResult) });
          generatedCount++;
      }
      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (answerRoots.length > 0) {
          const rootKeyGridContainer = document.createElement('div');
          rootKeyGridContainer.className = 'digital-root-check-grid-container';
          rootKeyGridContainer.innerHTML = `<h4>${t.digital_root_grid_title}</h4>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          answerRoots.forEach(item => { drGrid.innerHTML += `<div class="dr-cell">${item.root}</div>`; });
          rootKeyGridContainer.appendChild(drGrid);
          problemsContainer.appendChild(rootKeyGridContainer);
      }
  }

  function generateMultiplicationDivisionProblems() {
      const t = translations.script.multiplication_division;
      problemsContainer.innerHTML = '';
      const digitsFactor1Input = document.getElementById('md-digits-factor1');
      const digitsFactor2Input = document.getElementById('md-digits-factor2');
      const digitsDivisorInput = document.getElementById('md-digits-divisor');
      const digitsQuotientInput = document.getElementById('md-digits-quotient');
      const noRemainderInput = document.getElementById('md-no-remainder');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const digitsF1 = parseInt(digitsFactor1Input.value, 10);
      const digitsF2 = parseInt(digitsFactor2Input.value, 10);
      const digitsDiv = parseInt(digitsDivisorInput.value, 10);
      const digitsQuo = parseInt(digitsQuotientInput.value, 10);
      const noRemainder = noRemainderInput.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(digitsF1) || digitsF1 < 1 || digitsF1 > 4 || isNaN(digitsF2) || digitsF2 < 1 || digitsF2 > 4) { problemsContainer.innerHTML = `<p class="error-message">${t.error_mult_digits}</p>`; return; }
      if (isNaN(digitsDiv) || digitsDiv < 1 || digitsDiv > 4 || isNaN(digitsQuo) || digitsQuo < 1 || digitsQuo > 3) { problemsContainer.innerHTML = `<p class="error-message">${t.error_div_digits}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomNumber(numDigits) { if (numDigits <= 0) return 1; const min = Math.pow(10, numDigits - 1); const max = Math.pow(10, numDigits) - 1; if (min === 0 && numDigits === 1) return Math.floor(Math.random() * 9) + 1; return Math.floor(Math.random() * (max - min + 1)) + min; }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid problem-list-grid';
      const problemsHtmlArray = [];
      const answerRoots = [];
      let generatedCount = 0;

      for (let i = 0; i < numberOfProblems; i++) {
          let problemHTML;
          let actualResult;
          if (Math.random() < 0.5) {
              // Generate multiplication problem
              const factor1 = getRandomNumber(digitsF1);
              const factor2 = getRandomNumber(digitsF2);
              actualResult = factor1 * factor2;
              problemHTML = `<div class="arith-problem multiplication-problem"><div class="operand-1">${factor1}</div><div class="operator-operand2"><span class="operator">&times;</span><span class="operand-2">${factor2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`;
          } else {
              // Generate division problem
              let divisor = getRandomNumber(digitsDiv);
              let quotient = getRandomNumber(digitsQuo);
              
              // Ensure non-zero values
              if (divisor === 0) divisor = 1;
              if (quotient === 0) quotient = 1;
              
              let dividend, remainder;
              if (noRemainder) {
                  // For exact division, dividend = divisor × quotient
                  dividend = divisor * quotient;
                  remainder = 0;
                  actualResult = quotient;
              } else {
                  // For division with remainder, add a small remainder
                  remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
                  dividend = divisor * quotient + remainder;
                  actualResult = quotient; // We still track quotient for digital root
              }
              
              problemHTML = `<div class="arith-problem division-problem-user"><div class="dividend">${dividend}</div><div class="divisor-container"><div class="divisor">${divisor}</div><div class="answer-line"></div><div class="answer-space"></div></div></div>`;
          }
          problemsHtmlArray.push(problemHTML);
          answerRoots.push({ root: digitalRoot(actualResult) });
          generatedCount++;
      }
      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (answerRoots.length > 0) {
          const rootKeyGridContainer = document.createElement('div');
          rootKeyGridContainer.className = 'digital-root-check-grid-container';
          let rootKeyTitleHTML = `<h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p>`;
          rootKeyGridContainer.innerHTML = rootKeyTitleHTML;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          answerRoots.forEach(item => { drGrid.innerHTML += `<div class="dr-cell">${item.root}</div>`; });
          rootKeyGridContainer.appendChild(drGrid);
          problemsContainer.appendChild(rootKeyGridContainer);
      }
  }

  function generateRationalCanonicalProblems() {
      const t = translations.script.rational_canonical;
      problemsContainer.innerHTML = '';
      const maxValInput = document.getElementById('rc-max-val');
      const ensureReducibleCheckbox = document.getElementById('rc-ensure-reducible');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const maxVal = parseInt(maxValInput.value, 10);
      const ensureReducible = ensureReducibleCheckbox.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(maxVal) || maxVal < 2) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_val}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid fraction-problem-grid';
      const problemsHtmlArray = [];
      const simplifiedAnswers = [];
      let generatedCount = 0;
      let generationAttempts = 0;
      const MAX_ATTEMPTS_PER_PROBLEM = 50;

      while (generatedCount < numberOfProblems && generationAttempts < numberOfProblems * MAX_ATTEMPTS_PER_PROBLEM) {
          generationAttempts++;
          let numerator = getRandomInt(1, maxVal);
          let denominator = getRandomInt(1, maxVal);
          if (denominator === 1 && numerator !== 1) { if (ensureReducible) { if (maxVal > 1) denominator = getRandomInt(2, maxVal); else continue; } }
          else if (denominator === 1 && numerator === 1) { continue; }
          if (denominator === 0) continue;
          if (numerator === 0 && denominator !== 0) { if (ensureReducible) continue; }

          if (ensureReducible) {
              const commonDivisor = gcd(numerator, denominator);
              if (commonDivisor <= 1 || denominator === 0) { continue; }
              if (numerator % denominator === 0 && denominator !== 1) { continue; }
          }

          const commonDivisorForKey = gcd(numerator, denominator);
          let sn = numerator / commonDivisorForKey;
          let sd = denominator / commonDivisorForKey;
          let controlSum;
          if (sd === 0) { controlSum = NaN; }
          else if (sn === 0) { controlSum = 0 + sd; }
          else if (sd === 1) { controlSum = 1; }
          else if (sn < sd) { controlSum = sn + sd; }
          else { const remainderNum = sn % sd; controlSum = remainderNum + sd; }
          simplifiedAnswers.push({ controlSum: controlSum });

          const problemHTML = `<div class="fraction-problem-item"><div class="problem-content"><span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span> =</div><div class="calculation-space"></div></div>`;
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }

      if (generatedCount < numberOfProblems && ensureReducible) {
          const warningP = document.createElement('p');
          warningP.className = 'warning-message';
          const warningText = t.warning_generation.replace('{generatedCount}', generatedCount).replace('{numberOfProblems}', numberOfProblems);
          warningP.textContent = warningText;
          if (gridContainer.parentNode) { problemsContainer.insertBefore(warningP, gridContainer); }
          else { problemsContainer.appendChild(warningP); }
      }
      gridContainer.innerHTML = problemsHtmlArray.join('');
      if (generatedCount > 0 || !ensureReducible) { problemsContainer.appendChild(gridContainer); }

      if (simplifiedAnswers.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.control_sum_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.control_sum_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          simplifiedAnswers.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${isNaN(answer.controlSum) ? "Err" : answer.controlSum}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  function generateRationalOperationsProblems() {
      const t = translations.script.rational_operations;
      problemsContainer.innerHTML = '';
      const numTermsInput = document.getElementById('ro-num-terms');
      const maxValInput = document.getElementById('ro-max-val');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const numTerms = parseInt(numTermsInput.value, 10);
      const maxVal = parseInt(maxValInput.value, 10);
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(numTerms) || numTerms < 2 || numTerms > 5) { problemsContainer.innerHTML = `<p class="error-message">Number of fractions must be between 2 and 5.</p>`; return; }
      if (isNaN(maxVal) || maxVal < 1) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_val}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid fraction-problem-grid';
      const problemsHtmlArray = [];
      const controlSumsArray = [];
      let generatedCount = 0;

      for (let i = 0; i < numberOfProblems; i++) {
          // Generate fractions and operations
          const fractions = [];
          const operations = [];
          
          for (let j = 0; j < numTerms; j++) {
              fractions.push({
                  numerator: getRandomInt(1, maxVal),
                  denominator: getRandomInt(1, maxVal)
              });
              if (j < numTerms - 1) {
                  operations.push(Math.random() < 0.5 ? 'add' : 'subtract');
              }
          }

          // Calculate the result step by step
          let resultN = fractions[0].numerator;
          let resultD = fractions[0].denominator;

          for (let j = 1; j < numTerms; j++) {
              const n2 = fractions[j].numerator;
              const d2 = fractions[j].denominator;
              const operation = operations[j - 1];

              if (operation === 'add') {
                  resultN = (resultN * d2) + (n2 * resultD);
                  resultD = resultD * d2;
              } else {
                  resultN = (resultN * d2) - (n2 * resultD);
                  resultD = resultD * d2;
              }
          }

          if (resultD === 0) { i--; continue; }

          const commonDivisor = gcd(resultN, resultD);
          let finalN = resultN / commonDivisor;
          let finalD = resultD / commonDivisor;
          if (finalD < 0) { finalN = -finalN; finalD = -finalD; }

          let controlSum;
          if (finalD === 0) { controlSum = NaN; }
          else if (finalN === 0) { controlSum = 0 + finalD; }
          else if (finalD === 1) { controlSum = 1; }
          else if (Math.abs(finalN) < finalD) { controlSum = Math.abs(finalN) + finalD; }
          else { const remainderNum = Math.abs(finalN) % finalD; controlSum = remainderNum + finalD; }
          controlSumsArray.push({ controlSum: controlSum });

          // Build the problem HTML
          let problemHTML = '<div class="fraction-operation-item"><div class="problem-content">';
          for (let j = 0; j < numTerms; j++) {
              problemHTML += `<span class="fraction"><span class="numerator">${fractions[j].numerator}</span><span class="denominator">${fractions[j].denominator}</span></span>`;
              if (j < numTerms - 1) {
                  const opSymbol = operations[j] === 'add' ? '+' : '&ndash;';
                  problemHTML += `<span class="operation-symbol">${opSymbol}</span>`;
              }
          }
          problemHTML += ' =</div><div class="calculation-space"></div></div>';
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }
      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (controlSumsArray.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.control_sum_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.control_sum_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          controlSumsArray.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${isNaN(answer.controlSum) ? "Err" : answer.controlSum}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  function generateRationalMultDivProblems() {
      const t = translations.script.rational_mult_div;
      problemsContainer.innerHTML = '';
      const maxValInput = document.getElementById('rmd-max-val');
      const avoidWholeNumsInput = document.getElementById('rmd-avoid-whole-nums');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const maxVal = parseInt(maxValInput.value, 10);
      const avoidWholeNums = avoidWholeNumsInput.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(maxVal) || maxVal < 1) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_val}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid fraction-problem-grid';
      const problemsHtmlArray = [];
      const controlSumsArray = [];
      let generatedCount = 0;
      let attempts = 0;
      const maxAttempts = numberOfProblems * 50;

      while (generatedCount < numberOfProblems && attempts < maxAttempts) {
          attempts++;
          let n1 = getRandomInt(1, maxVal);
          let d1 = getRandomInt(1, maxVal);
          let n2 = getRandomInt(1, maxVal);
          let d2 = getRandomInt(1, maxVal);
          const currentOperation = Math.random() < 0.5 ? 'multiply' : 'divide';
          let resultN, resultD, opSymbol;

          if (currentOperation === 'multiply') { opSymbol = '&times;'; resultN = n1 * n2; resultD = d1 * d2; }
          else { opSymbol = '&divide;'; if (n2 === 0) continue; resultN = n1 * d2; resultD = d1 * n2; }

          if (resultD === 0) { continue; }

          const commonDivisor = gcd(resultN, resultD);
          let finalN = resultN / commonDivisor;
          let finalD = resultD / commonDivisor;
          if (finalD < 0) { finalN = -finalN; finalD = -finalD; }
          if (avoidWholeNums && finalD === 1) { continue; }

          let controlSum;
          if (finalD === 0) { controlSum = NaN; }
          else if (finalN === 0) { controlSum = 0 + finalD; }
          else if (finalD === 1) { controlSum = 1; }
          else if (Math.abs(finalN) < finalD) { controlSum = Math.abs(finalN) + finalD; }
          else { const remainderNum = Math.abs(finalN) % finalD; controlSum = remainderNum + finalD; }
          controlSumsArray.push({ controlSum: controlSum });

          const problemHTML = `<div class="fraction-operation-item"><div class="problem-content"><span class="fraction"><span class="numerator">${n1}</span><span class="denominator">${d1}</span></span><span class="operation-symbol">${opSymbol}</span><span class="fraction"><span class="numerator">${n2}</span><span class="denominator">${d2}</span></span> =</div><div class="calculation-space"></div></div>`;
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }

      if (generatedCount < numberOfProblems && avoidWholeNums) {
          const warningP = document.createElement('p');
          warningP.className = 'warning-message';
          const warningText = t.warning_generation.replace('{generatedCount}', generatedCount).replace('{numberOfProblems}', numberOfProblems);
          warningP.textContent = warningText;
          problemsContainer.appendChild(warningP);
      }
      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (controlSumsArray.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.control_sum_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.control_sum_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          controlSumsArray.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${isNaN(answer.controlSum) ? "Err" : answer.controlSum}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  function generateProportionProblems() {
      const t = translations.script.proportion;
      problemsContainer.innerHTML = '';
      const maxBaseInput = document.getElementById('prop-max-base');
      const maxMultiplierInput = document.getElementById('prop-max-multiplier');
      const simplifyRatiosInput = document.getElementById('prop-simplify-ratios');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const maxBase = parseInt(maxBaseInput.value, 10);
      const maxMultiplier = parseInt(maxMultiplierInput.value, 10);
      const simplifyRatios = simplifyRatiosInput.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(maxBase) || maxBase < 1 || maxBase > 15) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_base}</p>`; return; }
      if (isNaN(maxMultiplier) || maxMultiplier < 2 || maxMultiplier > 12) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_multiplier}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid proportion-problem-grid';
      const problemsHtmlArray = [];
      const digitalRoots = [];
      let generatedCount = 0;
      let attempts = 0;
      const maxAttempts = numberOfProblems * 100;

      while (generatedCount < numberOfProblems && attempts < maxAttempts) {
          attempts++;
          let a = getRandomInt(1, maxBase);
          let b = getRandomInt(1, maxBase);
          if (simplifyRatios) { const baseGcd = gcd(a, b); if (baseGcd > 1) { a = a / baseGcd; b = b / baseGcd; } }
          if (a === b && a === 1) { continue; }
          const k = getRandomInt(2, maxMultiplier);
          const c = a * k;
          const d = b * k;
          const positions = ['a', 'b', 'c', 'd'];
          const hiddenPosition = positions[Math.floor(Math.random() * 4)];
          let displayA = a, displayB = b, displayC = c, displayD = d;
          let solution = 0;
          switch (hiddenPosition) {
              case 'a': solution = a; displayA = 'x'; break;
              case 'b': solution = b; displayB = 'x'; break;
              case 'c': solution = c; displayC = 'x'; break;
              case 'd': solution = d; displayD = 'x'; break;
          }
          const solutionDigitalRoot = digitalRoot(solution);
          digitalRoots.push({ digitalRoot: solutionDigitalRoot });
          const problemHTML = `<div class="proportion-problem-item"><div class="problem-content"><div class="proportion-equation"><div class="proportion"><span class="fraction"><span class="numerator">${displayA}</span><span class="denominator">${displayB}</span></span><span class="equals">=</span><span class="fraction"><span class="numerator">${displayC}</span><span class="denominator">${displayD}</span></span></div></div></div></div>`;
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }

      if (generatedCount < numberOfProblems) {
          const warningP = document.createElement('p');
          warningP.className = 'warning-message';
          const warningText = t.warning_generation.replace('{generatedCount}', generatedCount).replace('{numberOfProblems}', numberOfProblems);
          warningP.textContent = warningText;
          problemsContainer.appendChild(warningP);
      }

      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (digitalRoots.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          digitalRoots.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${answer.digitalRoot}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  function generateDecimalRationalProblems() {
      const t = translations.script.decimal_rational;
      problemsContainer.innerHTML = '';
      const problemMixInput = document.getElementById('dr-problem-mix');
      const decimalPlacesInput = document.getElementById('dr-decimal-places');
      const terminatingOnlyInput = document.getElementById('dr-terminating-only');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const problemMix = problemMixInput.value;
      const maxDecimalPlaces = parseInt(decimalPlacesInput.value, 10);
      const terminatingOnly = terminatingOnlyInput.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(maxDecimalPlaces) || maxDecimalPlaces < 1 || maxDecimalPlaces > 4) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_decimal_places}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
      const terminatingDenominators = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50, 100, 125, 200, 250, 400, 500, 1000];
      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid decimal-rational-problem-grid';
      const problemsHtmlArray = [];
      const digitalRoots = [];
      let generatedCount = 0;
      let attempts = 0;
      const maxAttempts = numberOfProblems * 100;

      while (generatedCount < numberOfProblems && attempts < maxAttempts) {
          attempts++;
          let problemType = (problemMix === 'mixed') ? (Math.random() < 0.5 ? 'fraction-to-decimal' : 'decimal-to-fraction') : problemMix;
          let problemHTML = '';
          let checkNumber = 0;

          if (problemType === 'fraction-to-decimal') {
              let denominator, numerator;
              if (terminatingOnly) { denominator = terminatingDenominators[getRandomInt(0, terminatingDenominators.length - 1)]; numerator = getRandomInt(1, denominator - 1); }
              else { denominator = getRandomInt(2, 20); numerator = getRandomInt(1, denominator - 1); }
              const commonFactor = gcd(numerator, denominator);
              numerator /= commonFactor;
              denominator /= commonFactor;
              const decimalAnswer = numerator / denominator;
              const decimalStr = decimalAnswer.toString();
              const decimalPlaces = decimalStr.includes('.') ? decimalStr.split('.')[1].length : 0;
              if (terminatingOnly && (decimalPlaces > maxDecimalPlaces || !isFinite(decimalAnswer))) { continue; }
              const decimalWithoutPoint = decimalStr.replace('.', '');
              checkNumber = digitalRoot(parseInt(decimalWithoutPoint, 10));
              problemHTML = `<div class="decimal-rational-problem-item"><div class="problem-content"><div class="fraction-display"><span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span><span class="equals"> = </span><div class="answer-space"></div></div></div></div>`;
          } else {
              let decimalAnswer, numerator, denominator;
              if (terminatingOnly) { const places = getRandomInt(1, maxDecimalPlaces); const multiplier = Math.pow(10, places); numerator = getRandomInt(1, multiplier - 1); denominator = multiplier; decimalAnswer = numerator / denominator; }
              else { decimalAnswer = getRandomInt(1, 999) / Math.pow(10, getRandomInt(1, maxDecimalPlaces)); const decimalStr = decimalAnswer.toString(); const parts = decimalStr.split('.'); numerator = parseInt(parts[0] + parts[1], 10); denominator = Math.pow(10, parts[1].length); }
              const commonFactor = gcd(numerator, denominator);
              numerator /= commonFactor;
              denominator /= commonFactor;
              checkNumber = digitalRoot(numerator + denominator);
              problemHTML = `<div class="decimal-rational-problem-item"><div class="problem-content"><div class="decimal-display"><span class="decimal-number">${decimalAnswer}</span><span class="equals"> = </span><div class="answer-space"></div></div></div></div>`;
          }
          digitalRoots.push({ digitalRoot: checkNumber });
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }

      if (generatedCount < numberOfProblems) {
          const warningP = document.createElement('p');
          warningP.className = 'warning-message';
          const warningText = t.warning_generation.replace('{generatedCount}', generatedCount).replace('{numberOfProblems}', numberOfProblems);
          warningP.textContent = warningText;
          problemsContainer.appendChild(warningP);
      }
      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (digitalRoots.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          digitalRoots.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${answer.digitalRoot}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  function generatePercentageProblems() {
      const t = translations.script.percentage;
      problemsContainer.innerHTML = '';
      const problemTypeInput = document.getElementById('pct-problem-type');
      const maxNumberInput = document.getElementById('pct-max-number');
      const wholePercentsOnlyInput = document.getElementById('pct-whole-percents-only');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const problemType = problemTypeInput.value;
      const maxNumber = parseInt(maxNumberInput.value, 10);
      const wholePercentsOnly = wholePercentsOnlyInput.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(maxNumber) || maxNumber < 10) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_number}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
      function getRandomPercentage() {
          if (wholePercentsOnly) {
              return getRandomInt(1, 99);
          } else {
              return Math.round((Math.random() * 99 + 1) * 10) / 10; // 1 decimal place
          }
      }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid percentage-problem-grid';
      const problemsHtmlArray = [];
      const digitalRoots = [];
      let generatedCount = 0;

      for (let i = 0; i < numberOfProblems; i++) {
          let currentProblemType;
          if (problemType === 'mixed') {
              const types = ['find-percent', 'find-what-percent', 'find-whole'];
              currentProblemType = types[Math.floor(Math.random() * types.length)];
          } else {
              currentProblemType = problemType;
          }

          let problemHTML = '';
          let answer = 0;

          if (currentProblemType === 'find-percent') {
              // Find X% of Y (e.g., "25% of 80 = ?")
              const percentage = getRandomPercentage();
              const number = getRandomInt(10, maxNumber);
              answer = Math.round((percentage / 100) * number);
              problemHTML = `<div class="percentage-problem-item"><div class="problem-content"><span class="percentage-text">${percentage}% ${t.of_text} ${number} = </span><div class="answer-space"></div></div></div>`;
          } else if (currentProblemType === 'find-what-percent') {
              // Find what percent X is of Y (e.g., "15 is what % of 60?")
              const whole = getRandomInt(20, maxNumber);
              const percentage = getRandomPercentage();
              const part = Math.round((percentage / 100) * whole);
              answer = Math.round(percentage);
              problemHTML = `<div class="percentage-problem-item"><div class="problem-content"><span class="percentage-text">${part} ${t.is_text} ${t.what_percent_text} ${t.of_text} ${whole}?</span><div class="answer-space"></div></div></div>`;
          } else if (currentProblemType === 'find-whole') {
              // Find the whole when given part and percentage (e.g., "25% of what number is 20?")
              const percentage = getRandomPercentage();
              const part = getRandomInt(5, Math.floor(maxNumber * 0.6));
              answer = Math.round(part / (percentage / 100));
              problemHTML = `<div class="percentage-problem-item"><div class="problem-content"><span class="percentage-text">${percentage}% ${t.of_text} ${t.what_number_text} ${t.is_text} ${part}?</span><div class="answer-space"></div></div></div>`;
          }

          const answerDigitalRoot = digitalRoot(answer);
          digitalRoots.push({ digitalRoot: answerDigitalRoot });
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }

      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (digitalRoots.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          digitalRoots.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${answer.digitalRoot}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  function generateGeometryProblems() {
      const t = translations.script.geometry;
      problemsContainer.innerHTML = '';
      const shapeMixInput = document.getElementById('geo-shape-mix');
      const calculationTypeInput = document.getElementById('geo-calculation-type');
      const maxDimensionInput = document.getElementById('geo-max-dimension');
      const wholeNumbersOnlyInput = document.getElementById('geo-whole-numbers-only');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const shapeMix = shapeMixInput.value;
      const calculationType = calculationTypeInput.value;
      const maxDimension = parseInt(maxDimensionInput.value, 10);
      const wholeNumbersOnly = wholeNumbersOnlyInput.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(maxDimension) || maxDimension < 2) { problemsContainer.innerHTML = `<p class="error-message">${t.error_max_dimension}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
      function getRandomDimension() {
          if (wholeNumbersOnly) {
              return getRandomInt(2, maxDimension);
          } else {
              return Math.round((Math.random() * (maxDimension - 2) + 2) * 2) / 2; // 0.5 increments
          }
      }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid geometry-problem-grid';
      const problemsHtmlArray = [];
      const digitalRoots = [];
      let generatedCount = 0;

      for (let i = 0; i < numberOfProblems; i++) {
          let currentShape;
          if (shapeMix === 'mixed') {
              const shapes = ['rectangles', 'squares', 'triangles', 'circles'];
              currentShape = shapes[Math.floor(Math.random() * shapes.length)];
          } else {
              currentShape = shapeMix;
          }

          let currentCalculation;
          if (calculationType === 'mixed') {
              currentCalculation = Math.random() < 0.5 ? 'area' : 'perimeter';
          } else {
              currentCalculation = calculationType;
          }

          let problemHTML = '';
          let answer = 0;

          if (currentShape === 'rectangles') {
              const length = getRandomDimension();
              const width = getRandomDimension();
              if (currentCalculation === 'area') {
                  answer = length * width;
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.rectangle_text}: ${t.length_text} = ${length}, ${t.width_text} = ${width}</span><br><span class="calculation-text">${t.area_text} = </span><div class="answer-space"></div></div></div>`;
              } else {
                  answer = 2 * (length + width);
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.rectangle_text}: ${t.length_text} = ${length}, ${t.width_text} = ${width}</span><br><span class="calculation-text">${t.perimeter_text} = </span><div class="answer-space"></div></div></div>`;
              }
          } else if (currentShape === 'squares') {
              const side = getRandomDimension();
              if (currentCalculation === 'area') {
                  answer = side * side;
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.square_text}: ${t.side_text} = ${side}</span><br><span class="calculation-text">${t.area_text} = </span><div class="answer-space"></div></div></div>`;
              } else {
                  answer = 4 * side;
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.square_text}: ${t.side_text} = ${side}</span><br><span class="calculation-text">${t.perimeter_text} = </span><div class="answer-space"></div></div></div>`;
              }
          } else if (currentShape === 'triangles') {
              if (currentCalculation === 'area') {
                  const base = getRandomDimension();
                  const height = getRandomDimension();
                  answer = 0.5 * base * height;
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.triangle_text}: ${t.base_text} = ${base}, ${t.height_text} = ${height}</span><br><span class="calculation-text">${t.area_text} = </span><div class="answer-space"></div></div></div>`;
              } else {
                  // For perimeter, generate three sides of a triangle
                  const side1 = getRandomDimension();
                  const side2 = getRandomDimension();
                  const side3 = getRandomDimension();
                  answer = side1 + side2 + side3;
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.triangle_text}: ${t.sides_text} = ${side1}, ${side2}, ${side3}</span><br><span class="calculation-text">${t.perimeter_text} = </span><div class="answer-space"></div></div></div>`;
              }
          } else if (currentShape === 'circles') {
              const radius = getRandomDimension();
              const pi = 3.14;
              if (currentCalculation === 'area') {
                  answer = pi * radius * radius;
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.circle_text}: ${t.radius_text} = ${radius}</span><br><span class="calculation-text">${t.area_text} = πr² = </span><div class="answer-space"></div></div></div>`;
              } else {
                  answer = 2 * pi * radius;
                  problemHTML = `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.circle_text}: ${t.radius_text} = ${radius}</span><br><span class="calculation-text">${t.circumference_text} = 2πr = </span><div class="answer-space"></div></div></div>`;
              }
          }

          const roundedAnswer = Math.round(answer);
          const answerDigitalRoot = digitalRoot(roundedAnswer);
          digitalRoots.push({ digitalRoot: answerDigitalRoot });
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }

      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (digitalRoots.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          digitalRoots.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${answer.digitalRoot}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  function generateLinearEquationsProblems() {
      const t = translations.script.linear_equations;
      problemsContainer.innerHTML = '';
      const equationTypeInput = document.getElementById('eq-equation-type');
      const coefficientRangeInput = document.getElementById('eq-coefficient-range');
      const solutionRangeInput = document.getElementById('eq-solution-range');
      const allowNegativeSolutionsInput = document.getElementById('eq-allow-negative-solutions');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const equationType = equationTypeInput.value;
      const coefficientRange = parseInt(coefficientRangeInput.value, 10);
      const solutionRange = parseInt(solutionRangeInput.value, 10);
      const allowNegativeSolutions = allowNegativeSolutionsInput.checked;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(coefficientRange) || coefficientRange < 1 || coefficientRange > 10) { problemsContainer.innerHTML = `<p class="error-message">${t.error_coefficient_range}</p>`; return; }
      if (isNaN(solutionRange) || solutionRange < 1 || solutionRange > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_solution_range}</p>`; return; }
      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; return; }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
      function getRandomCoefficient() { return getRandomInt(1, coefficientRange); }
      function getRandomSolution() { 
          const sol = getRandomInt(1, solutionRange);
          return allowNegativeSolutions && Math.random() < 0.3 ? -sol : sol;
      }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);
      const gridContainer = document.createElement('div');
      gridContainer.className = 'arithmetic-grid linear-equations-problem-grid';
      const problemsHtmlArray = [];
      const digitalRoots = [];
      let generatedCount = 0;

      for (let i = 0; i < numberOfProblems; i++) {
          let currentEquationType;
          if (equationType === 'mixed') {
              const types = ['one-step', 'two-step', 'with-fractions'];
              currentEquationType = types[Math.floor(Math.random() * types.length)];
          } else {
              currentEquationType = equationType;
          }

          let problemHTML = '';
          let solution = getRandomSolution();

          if (currentEquationType === 'one-step') {
              // Generate equations like: x + a = b, x - a = b, a - x = b
              const operationType = Math.floor(Math.random() * 3);
              if (operationType === 0) {
                  // x + a = b
                  const a = getRandomCoefficient();
                  const b = solution + a;
                  problemHTML = `<div class="linear-equation-item"><div class="problem-content"><span class="equation-text">${t.solve_for_x_text}</span><br><span class="equation">x + ${a} = ${b}</span><div class="answer-space">x = </div></div></div>`;
              } else if (operationType === 1) {
                  // x - a = b  
                  const a = getRandomCoefficient();
                  const b = solution - a;
                  problemHTML = `<div class="linear-equation-item"><div class="problem-content"><span class="equation-text">${t.solve_for_x_text}</span><br><span class="equation">x - ${a} = ${b}</span><div class="answer-space">x = </div></div></div>`;
              } else {
                  // a - x = b, so x = a - b
                  const a = Math.abs(solution) + getRandomCoefficient();
                  const b = a - solution;
                  problemHTML = `<div class="linear-equation-item"><div class="problem-content"><span class="equation-text">${t.solve_for_x_text}</span><br><span class="equation">${a} - x = ${b}</span><div class="answer-space">x = </div></div></div>`;
              }
          } else if (currentEquationType === 'two-step') {
              // Generate equations like: ax + b = c, ax - b = c
              const a = getRandomCoefficient();
              const b = getRandomCoefficient();
              if (Math.random() < 0.5) {
                  // ax + b = c
                  const c = a * solution + b;
                  problemHTML = `<div class="linear-equation-item"><div class="problem-content"><span class="equation-text">${t.solve_for_x_text}</span><br><span class="equation">${a}x + ${b} = ${c}</span><div class="answer-space">x = </div></div></div>`;
              } else {
                  // ax - b = c
                  const c = a * solution - b;
                  problemHTML = `<div class="linear-equation-item"><div class="problem-content"><span class="equation-text">${t.solve_for_x_text}</span><br><span class="equation">${a}x - ${b} = ${c}</span><div class="answer-space">x = </div></div></div>`;
              }
          } else if (currentEquationType === 'with-fractions') {
              // Generate equations like: x/a + b = c
              const a = getRandomInt(2, Math.min(coefficientRange, 5)); // Keep denominators reasonable
              const b = getRandomCoefficient();
              const c = Math.round(solution / a) + b;
              solution = a * (c - b); // Adjust solution to be integer
              problemHTML = `<div class="linear-equation-item"><div class="problem-content"><span class="equation-text">${t.solve_for_x_text}</span><br><span class="equation">x/${a} + ${b} = ${c}</span><div class="answer-space">x = </div></div></div>`;
          }

          const solutionDigitalRoot = digitalRoot(Math.abs(solution));
          digitalRoots.push({ digitalRoot: solutionDigitalRoot });
          problemsHtmlArray.push(problemHTML);
          generatedCount++;
      }

      gridContainer.innerHTML = problemsHtmlArray.join('');
      problemsContainer.appendChild(gridContainer);

      if (digitalRoots.length > 0) {
          const digitalRootContainer = document.createElement('div');
          digitalRootContainer.className = 'digital-root-check-grid-container';
          digitalRootContainer.innerHTML = `<h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p>`;
          const drGrid = document.createElement('div');
          drGrid.className = 'digital-root-check-grid';
          digitalRoots.forEach(answer => { drGrid.innerHTML += `<div class="dr-cell">${answer.digitalRoot}</div>`; });
          digitalRootContainer.appendChild(drGrid);
          problemsContainer.appendChild(digitalRootContainer);
      }
  }

  // --- Event Handlers ---
  function handleTopicCardClick(event) {
    const card = event.currentTarget;
    const newTopic = card.dataset.topic;
    if (newTopic === currentTopic) return;
    topicCards.forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    currentTopic = newTopic;
    topicSpecificControlsContainer.innerHTML = "";
    problemsContainer.innerHTML = "";
    handleTopicChange();
  }

  function handleTopicChange() {
    // This function is now used for initialization and language change
    topicSpecificControlsContainer.innerHTML = "";
    problemsContainer.innerHTML = "";
    switch (currentTopic) {
      case "multiplication-table": renderMultiplicationTableControls(); break;
      case "addition-subtraction": renderAdditionSubtractionControls(); break;
      case "multiplication-division": renderMultiplicationDivisionControls(); break;
      case "rational-canonical": renderRationalCanonicalControls(); break;
      case "rational-operations": renderRationalOperationsControls(); break;
      case "rational-mult-div": renderRationalMultDivControls(); break;
      case "proportion": renderProportionControls(); break;
      case "decimal-rational": renderDecimalRationalControls(); break;
      case "percentage": renderPercentageControls(); break;
      case "geometry": renderGeometryControls(); break;
      case "linear-equations": renderLinearEquationsControls(); break;
      default: console.error(translations.script.unknown_topic_error, currentTopic);
    }
  }

  function handleGenerateClick() {
    console.log(translations.script.generate_button_clicked_for_topic, currentTopic);
    problemsContainer.innerHTML = "";
    const numberOfProblems = parseInt(numProblemsInput.value, 10);
    if (isNaN(numberOfProblems) || numberOfProblems < 1) {
      alert(translations.script.invalid_num_problems_alert);
      return;
    }

    switch (currentTopic) {
      case "multiplication-table": generateMultiplicationTableProblems(); break;
      case "addition-subtraction": generateAdditionSubtractionProblems(); break;
      case "multiplication-division": generateMultiplicationDivisionProblems(); break;
      case "rational-canonical": generateRationalCanonicalProblems(); break;
      case "rational-operations": generateRationalOperationsProblems(); break;
      case "rational-mult-div": generateRationalMultDivProblems(); break;
      case "proportion": generateProportionProblems(); break;
      case "decimal-rational": generateDecimalRationalProblems(); break;
      case "percentage": generatePercentageProblems(); break;
      case "geometry": generateGeometryProblems(); break;
      case "linear-equations": generateLinearEquationsProblems(); break;
      default: console.error("Unknown topic for generation:", currentTopic); problemsContainer.innerHTML = `<p>${translations.script.unknown_topic_generation_error}</p>`;
    }
  }

  function handlePrintClick() {
    console.log("Print button clicked");
    window.print();
  }

  // --- Initialization ---
  topicCards.forEach(card => {
    card.addEventListener("click", handleTopicCardClick);
  });
  
  const firstCard = document.querySelector(`[data-topic="${currentTopic}"]`);
  if (firstCard) {
    firstCard.classList.add("selected");
  }
  
  if (generateButton) {
    generateButton.addEventListener("click", handleGenerateClick);
  }
  if (printButton) {
    printButton.addEventListener("click", handlePrintClick);
  }

  languageSwitcher.addEventListener('click', (e) => {
      const lang = e.target.dataset.lang;
      if (lang) {
          setLanguage(lang);
      }
  });

  const initialLang = getInitialLang();
  setLanguage(initialLang);

  console.log("App initialized.");
});
