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

  function renderWordProblemsControls() {
      const t = translations.script.word_problems;
      topicSpecificControlsContainer.innerHTML = `
        <div>
            <label for="wp-problem-category">${t.problem_category_label}</label>
            <select id="wp-problem-category">
                <option value="mixed">${t.mixed_categories_option}</option>
                <option value="age">${t.age_problems_option}</option>
                <option value="distance">${t.distance_problems_option}</option>
                <option value="money">${t.money_problems_option}</option>
                <option value="work">${t.work_rate_problems_option}</option>
                <option value="mixture">${t.mixture_problems_option}</option>
                <option value="geometry">${t.geometry_word_problems_option}</option>
                <option value="number">${t.number_problems_option}</option>
                <option value="percentage">${t.percentage_word_problems_option}</option>
            </select>
        </div>
        <div>
            <label for="wp-difficulty-level">${t.difficulty_level_label}</label>
            <select id="wp-difficulty-level">
                <option value="mixed">${t.mixed_difficulty_option}</option>
                <option value="easy">${t.easy_level_option}</option>
                <option value="medium">${t.medium_level_option}</option>
                <option value="hard">${t.hard_level_option}</option>
            </select>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
  }

  function renderHouseProblemsControls() {
      const t = translations.script.house_problems;
      topicSpecificControlsContainer.innerHTML = `
          <div>
              <label for="hp-range">${t.range_label}</label>
              <select id="hp-range">
                  <option value="1-10">${t.range_1_10}</option>
                  <option value="1-20">${t.range_1_20}</option>
                  <option value="1-50">${t.range_1_50}</option>
                  <option value="1-100">${t.range_1_100}</option>
              </select>
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

  function generateWordProblemsProblems() {
      const t = translations.script.word_problems;
      problemsContainer.innerHTML = '';
      const problemCategoryInput = document.getElementById('wp-problem-category');
      const difficultyLevelInput = document.getElementById('wp-difficulty-level');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const problemCategory = problemCategoryInput.value;
      const difficultyLevel = difficultyLevelInput.value;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(numberOfProblems) || numberOfProblems < 1 || numberOfProblems > 50) { 
          problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems}</p>`; 
          return; 
      }

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
      function getRandomFromArray(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
      function shuffleArray(arr) { const newArr = [...arr]; for (let i = newArr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; } return newArr; }

      // Define all available template keys by category
      const templateCategories = {
          age: ['age1', 'age2', 'age3', 'age4', 'age5'],
          distance: ['distance1', 'distance2', 'distance3', 'distance4', 'distance5'],
          money: ['money1', 'money2', 'money3', 'money4', 'money5'],
          work: ['work1', 'work2', 'work3', 'work4'],
          mixture: ['mixture1', 'mixture2', 'mixture3', 'mixture4'],
          geometry: ['geometry1', 'geometry2', 'geometry3', 'geometry4'],
          number: ['number1', 'number2', 'number3', 'number4'],
          percentage: ['percent1', 'percent2', 'percent3', 'percent4']
      };

      let availableTemplates = [];
      if (problemCategory === 'mixed') {
          availableTemplates = Object.values(templateCategories).flat();
      } else {
          availableTemplates = templateCategories[problemCategory] || [];
      }

      if (availableTemplates.length === 0) {
          problemsContainer.innerHTML = `<p class="error-message">No templates available for selected category</p>`;
          return;
      }

      const shuffledTemplates = shuffleArray(availableTemplates);
      const problemsHtmlArray = [];
      const digitalRoots = [];

      for (let i = 0; i < numberOfProblems; i++) {
          const templateKey = shuffledTemplates[i % shuffledTemplates.length];
          const template = t.templates[templateKey];
          
          let problemData = generateProblemData(templateKey, t, difficultyLevel);
          let problemText = fillTemplate(template, problemData);
          let answer = problemData.answer;

          const answerDigitalRoot = digitalRoot(Math.round(Math.abs(answer)));
          digitalRoots.push({ digitalRoot: answerDigitalRoot });

          const problemHTML = `<div class="word-problem-item"><div class="problem-content"><div class="problem-text">${problemText}</div><div class="answer-space">Answer: </div></div></div>`;
          problemsHtmlArray.push(problemHTML);
      }

      const gridContainer = document.createElement('div');
      gridContainer.className = 'word-problems-grid problems-grid';
      gridContainer.innerHTML = `<h3>${t.problems_title}</h3>` + problemsHtmlArray.join('');
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

      function fillTemplate(template, data) {
          return template.replace(/{(\w+)}/g, (match, key) => {
              return data.hasOwnProperty(key) ? data[key] : match;
          });
      }

      function generateProblemData(templateKey, t, difficultyLevel) {
          const difficultyMultiplier = difficultyLevel === 'easy' ? 1 : difficultyLevel === 'medium' ? 1.5 : difficultyLevel === 'hard' ? 2 : 1 + Math.random();
          function roundToWhole(num) { return Math.round(num); }
          const getRandomName = (type = 'neutral') => getRandomFromArray(t.names[type]);
          const getRandomObject = (type = 'items') => getRandomFromArray(t.objects[type]);

          switch (templateKey) {
              case 'age1': {
                  const multiplier = getRandomInt(2, 4);
                  const youngerAge = roundToWhole(getRandomInt(5 * difficultyMultiplier, 15 * difficultyMultiplier));
                  const olderAge = youngerAge * multiplier;
                  const sum = youngerAge + olderAge;
                  return { name1: getRandomName(), name2: getRandomName(), multiplier, sum, answer: olderAge };
              }
              case 'age2': {
                  const diff = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
                  const years = getRandomInt(2, 8);
                  const multiplier = getRandomInt(2, 3);
                  const currentYounger = getRandomInt(8, 20);
                  const currentOlder = currentYounger + diff;
                  return { name1: getRandomName(), name2: getRandomName(), diff, years, multiplier, answer: currentOlder };
              }
              case 'age3': {
                  const smaller = roundToWhole(getRandomInt(10 * difficultyMultiplier, 30 * difficultyMultiplier));
                  const larger = smaller + 1;
                  const sum = smaller + larger;
                  return { sum, answer: larger };
              }
              case 'age4': {
                  const age1 = roundToWhole(getRandomInt(20 * difficultyMultiplier, 50 * difficultyMultiplier));
                  const diff = roundToWhole(getRandomInt(2 * difficultyMultiplier, 12 * difficultyMultiplier));
                  return { name1: getRandomName(), name2: getRandomName(), age1, diff, answer: age1 + (age1 - diff) };
              }
              case 'age5': {
                  const years = getRandomInt(3, 10);
                  const final_age = roundToWhole(getRandomInt(20 * difficultyMultiplier, 60 * difficultyMultiplier));
                  return { name1: getRandomName(), years, final_age, answer: final_age - years };
              }
              case 'distance1': {
                  const time = roundToWhole(getRandomInt(2 * difficultyMultiplier, 8 * difficultyMultiplier));
                  const speed = getRandomInt(30, 80);
                  const distance = speed * time;
                  return { distance, time, answer: speed };
              }
              case 'distance2': {
                  const speed1 = getRandomInt(40, 70);
                  const speed2 = getRandomInt(30, 60);
                  const time = roundToWhole(getRandomInt(2 * difficultyMultiplier, 6 * difficultyMultiplier));
                  return { speed1, speed2, time, answer: (speed1 + speed2) * time };
              }
              case 'distance3': {
                  const distance1 = roundToWhole(getRandomInt(100 * difficultyMultiplier, 300 * difficultyMultiplier));
                  const distance2 = roundToWhole(getRandomInt(80 * difficultyMultiplier, 250 * difficultyMultiplier));
                  const time = roundToWhole(getRandomInt(4 * difficultyMultiplier, 10 * difficultyMultiplier));
                  return { distance1, distance2, time, answer: Math.round((distance1 + distance2) / time) };
              }
              case 'distance4': {
                  const speed = getRandomInt(3, 8);
                  const distance = roundToWhole(getRandomInt(12 * difficultyMultiplier, 48 * difficultyMultiplier));
                  // Ensure clean division
                  const adjustedDistance = Math.round(distance / speed) * speed;
                  return { name: getRandomName(), speed, distance: adjustedDistance, answer: adjustedDistance / speed };
              }
              case 'distance5': {
                  const speed1 = getRandomInt(45, 70);
                  const speed2 = getRandomInt(40, 65);
                  const totalSpeed = speed1 + speed2;
                  // Create distance that divides evenly
                  const timeHours = getRandomInt(2, 8);
                  const distance = totalSpeed * timeHours;
                  return { distance, speed1, speed2, answer: timeHours };
              }
              case 'money1': {
                  const adult_price = roundToWhole(getRandomInt(8 * difficultyMultiplier, 15 * difficultyMultiplier));
                  const child_price = roundToWhole(getRandomInt(3 * difficultyMultiplier, 7 * difficultyMultiplier));
                  const adult_tickets = getRandomInt(20, 60);
                  const child_tickets = getRandomInt(15, 45);
                  const total_tickets = adult_tickets + child_tickets;
                  const total_money = adult_tickets * adult_price + child_tickets * child_price;
                  return { adult_price, child_price, total_tickets, total_money, answer: adult_tickets };
              }
              case 'money2': {
                  const price1 = roundToWhole(getRandomInt(2 * difficultyMultiplier, 8 * difficultyMultiplier));
                  const price2 = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
                  const item1_count = getRandomInt(3, 12);
                  const item2_count = getRandomInt(2, 8);
                  const total_items = item1_count + item2_count;
                  const total_cost = item1_count * price1 + item2_count * price2;
                  const item1 = getRandomObject('items');
                  const item2 = getRandomObject('food');
                  return { item1, item2, price1, price2, total_items, total_cost, answer: item1_count };
              }
              case 'money3': {
                  const quarters = getRandomInt(8, 25);
                  const dimes = getRandomInt(10, 30);
                  const amount = Math.round((quarters * 25 + dimes * 10)) / 100; // Work in cents, then convert
                  const total_coins = quarters + dimes;
                  return { name: getRandomName(), amount: amount.toFixed(2), total_coins, answer: quarters };
              }
              case 'money4': {
                  const bill = roundToWhole(getRandomInt(25 * difficultyMultiplier, 80 * difficultyMultiplier));
                  const percent = getRandomInt(15, 25);
                  return { bill, percent, answer: Math.round((bill * percent) / 100 * 100) / 100 };
              }
              case 'money5': {
                  const amount = roundToWhole(getRandomInt(10 * difficultyMultiplier, 50 * difficultyMultiplier));
                  const weeks = getRandomInt(4, 16);
                  return { name: getRandomName(), amount, weeks, answer: amount * weeks };
              }
              case 'work1': {
                  const time1 = roundToWhole(getRandomInt(3 * difficultyMultiplier, 12 * difficultyMultiplier));
                  const time2 = roundToWhole(getRandomInt(4 * difficultyMultiplier, 15 * difficultyMultiplier));
                  return { name1: getRandomName(), name2: getRandomName(), time1, time2, answer: Math.round((time1 * time2) / (time1 + time2) * 100) / 100 };
              }
              case 'work2': {
                  const time1 = roundToWhole(getRandomInt(2 * difficultyMultiplier, 8 * difficultyMultiplier));
                  const time2 = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
                  return { time1, time2, answer: Math.round((time1 * time2) / (time1 + time2) * 100) / 100 };
              }
              case 'work3': {
                  const rooms = getRandomInt(2, 6);
                  const time = roundToWhole(getRandomInt(3 * difficultyMultiplier, 10 * difficultyMultiplier));
                  const new_rooms = getRandomInt(3, 10);
                  const timePerRoom = time / rooms;
                  const totalTime = new_rooms * timePerRoom;
                  return { name: getRandomName(), rooms, time, new_rooms, answer: Math.round(totalTime * 100) / 100 };
              }
              case 'work4': {
                  const items = roundToWhole(getRandomInt(50 * difficultyMultiplier, 200 * difficultyMultiplier));
                  const time = getRandomInt(3, 12);
                  return { items, time, answer: items * time };
              }
              case 'mixture1': {
                  const percent1 = getRandomInt(10, 40);
                  const percent2 = getRandomInt(50, 90);
                  const gallons = roundToWhole(getRandomInt(5 * difficultyMultiplier, 20 * difficultyMultiplier));
                  const target_percent = getRandomInt(percent1 + 5, percent2 - 5);
                  const needed = (gallons * (target_percent - percent2)) / (percent1 - target_percent);
                  return { percent1, gallons, percent2, target_percent, answer: Math.round(Math.abs(needed) * 100) / 100 };
              }
              case 'mixture2': {
                  const percent1 = getRandomInt(15, 35);
                  const percent2 = getRandomInt(50, 80);
                  const final_percent = getRandomInt(percent1 + 10, percent2 - 5);
                  const total_volume = roundToWhole(getRandomInt(20 * difficultyMultiplier, 60 * difficultyMultiplier));
                  const volume1 = (total_volume * (final_percent - percent2)) / (percent1 - percent2);
                  return { percent1, percent2, total_volume, final_percent, answer: Math.round(Math.abs(volume1) * 100) / 100 };
              }
              case 'mixture3': {
                  const price1 = roundToWhole(getRandomInt(8 * difficultyMultiplier, 15 * difficultyMultiplier));
                  const price2 = roundToWhole(getRandomInt(12 * difficultyMultiplier, 20 * difficultyMultiplier));
                  const total_pounds = getRandomInt(10, 30);
                  const avg_price = roundToWhole(getRandomInt(price1 + 1, price2 - 1));
                  const pounds1 = (total_pounds * (avg_price - price2)) / (price1 - price2);
                  return { price1, price2, total_pounds, avg_price, answer: Math.round(Math.abs(pounds1) * 100) / 100 };
              }
              case 'mixture4': {
                  const percent = getRandomInt(15, 45);
                  const weight = roundToWhole(getRandomInt(10 * difficultyMultiplier, 50 * difficultyMultiplier));
                  return { percent, weight, answer: Math.round((weight * percent) / 100 * 100) / 100 };
              }
              case 'geometry1': {
                  const diff = roundToWhole(getRandomInt(3 * difficultyMultiplier, 12 * difficultyMultiplier));
                  const width = roundToWhole(getRandomInt(8 * difficultyMultiplier, 25 * difficultyMultiplier));
                  const length = width + diff;
                  const perimeter = 2 * (length + width);
                  return { diff, perimeter, answer: width };
              }
              case 'geometry2': {
                  const side1 = Math.round(getRandomInt(5 * difficultyMultiplier, 20 * difficultyMultiplier));
                  const side2 = Math.round(getRandomInt(6 * difficultyMultiplier, 18 * difficultyMultiplier));
                  const side3 = Math.round(getRandomInt(4 * difficultyMultiplier, 22 * difficultyMultiplier));
                  return { side1, side2, side3, answer: side1 + side2 + side3 };
              }
              case 'geometry3': {
                  const side = roundToWhole(getRandomInt(6 * difficultyMultiplier, 20 * difficultyMultiplier));
                  const perimeter = side * 4;
                  return { perimeter, answer: side };
              }
              case 'geometry4': {
                  const radius = Math.round(getRandomInt(3 * difficultyMultiplier, 12 * difficultyMultiplier));
                  const area = 3.14 * radius * radius; // Use 3.14 as stated in problem
                  return { radius, answer: Math.round(area * 100) / 100 };
              }
              case 'number1': {
                  const diff = roundToWhole(getRandomInt(3 * difficultyMultiplier, 15 * difficultyMultiplier));
                  const smaller = roundToWhole(getRandomInt(10 * difficultyMultiplier, 40 * difficultyMultiplier));
                  const larger = smaller + diff;
                  const sum = smaller + larger;
                  return { diff, sum, answer: larger };
              }
              case 'number2': {
                  const first = getRandomInt(4, 12) * 2; // Even number
                  const second = first + 2;
                  const product = first * second;
                  return { product, answer: first };
              }
              case 'number3': {
                  const middle = getRandomInt(5, 25) * 2 + 1; // Odd number
                  const first = middle - 2;
                  const third = middle + 2;
                  const sum = first + middle + third;
                  return { sum, answer: middle };
              }
              case 'number4': {
                  const result = roundToWhole(getRandomInt(20 * difficultyMultiplier, 100 * difficultyMultiplier));
                  const multiplier = getRandomInt(2, 8);
                  const addition = roundToWhole(getRandomInt(5 * difficultyMultiplier, 25 * difficultyMultiplier));
                  const answer = (result - addition) / multiplier;
                  return { multiplier, addition, result, answer: Math.round(answer) };
              }
              case 'percent1': {
                  const percent = getRandomInt(10, 95);
                  const number = roundToWhole(getRandomInt(20 * difficultyMultiplier, 200 * difficultyMultiplier));
                  return { percent, number, answer: Math.round((percent * number) / 100 * 100) / 100 };
              }
              case 'percent2': {
                  const whole = roundToWhole(getRandomInt(50 * difficultyMultiplier, 300 * difficultyMultiplier));
                  const percent = getRandomInt(15, 85);
                  const part = (percent * whole) / 100;
                  return { part: Math.round(part), whole, answer: percent };
              }
              case 'percent3': {
                  const percent = getRandomInt(20, 80);
                  const part = roundToWhole(getRandomInt(15 * difficultyMultiplier, 120 * difficultyMultiplier));
                  const whole = (part * 100) / percent;
                  return { percent, part, answer: Math.round(whole) };
              }
              case 'percent4': {
                  const original_price = roundToWhole(getRandomInt(25 * difficultyMultiplier, 100 * difficultyMultiplier));
                  const percent = getRandomInt(15, 50);
                  const discount = (original_price * percent) / 100;
                  const sale_price = original_price - discount;
                  return { original_price, percent, answer: Math.round(sale_price * 100) / 100 };
              }
              default:
                  return { answer: 0 };
          }
      }
  }

  function generateHouseProblems() {
      const t = translations.script.house_problems;
      problemsContainer.innerHTML = '';
      const rangeInput = document.getElementById('hp-range');
      const numberOfProblemsInput = document.getElementById('num-problems');
      const range = rangeInput.value;
      const numberOfProblems = parseInt(numberOfProblemsInput.value, 10);

      if (isNaN(numberOfProblems) || numberOfProblems < 1) {
          problemsContainer.innerHTML = `<p class="error-message">${t.error_invalid_num_problems}</p>`;
          return;
      }
      if (numberOfProblems > 50) {
          problemsContainer.innerHTML = `<p class="error-message">${t.error_max_problems}</p>`;
          return;
      }

      const [min, max] = range.split('-').map(n => parseInt(n, 10));

      function getRandomNumber(minVal, maxVal) {
          return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      }

      const h3Title = document.createElement('h3');
      h3Title.textContent = t.problems_title;
      problemsContainer.appendChild(h3Title);

      const gridContainer = document.createElement('div');
      gridContainer.className = 'house-problems-grid';

      for (let i = 0; i < numberOfProblems; i++) {
          let num1, num2, sum, missingPosition;

          // Generate two numbers within range that when added stay within range
          do {
              num1 = getRandomNumber(1, Math.floor(max / 2));
              num2 = getRandomNumber(1, Math.floor(max / 2));
              sum = num1 + num2;
          } while (sum > max);

          // Randomly choose which number to hide (0 = left, 1 = center/sum, 2 = right)
          missingPosition = Math.floor(Math.random() * 3);

          const houseDiv = document.createElement('div');
          houseDiv.className = 'house-problem';

          // Create SVG house
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 200 170');
          svg.setAttribute('width', '200');
          svg.setAttribute('height', '170');

          // House body (made taller for 4 lines)
          const houseBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          houseBody.setAttribute('x', '40');
          houseBody.setAttribute('y', '60');
          houseBody.setAttribute('width', '120');
          houseBody.setAttribute('height', '100');
          houseBody.setAttribute('fill', '#e8f4f8');
          houseBody.setAttribute('stroke', '#333');
          houseBody.setAttribute('stroke-width', '2');

          // Roof
          const roof = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          roof.setAttribute('points', '30,60 100,10 170,60');
          roof.setAttribute('fill', '#d4a574');
          roof.setAttribute('stroke', '#333');
          roof.setAttribute('stroke-width', '2');

          // Door (smaller and positioned at bottom)
          const door = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          door.setAttribute('x', '90');
          door.setAttribute('y', '140');
          door.setAttribute('width', '20');
          door.setAttribute('height', '20');
          door.setAttribute('fill', '#8B4513');
          door.setAttribute('stroke', '#333');
          door.setAttribute('stroke-width', '1');

          // Window
          const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          window.setAttribute('x', '60');
          window.setAttribute('y', '80');
          window.setAttribute('width', '15');
          window.setAttribute('height', '15');
          window.setAttribute('fill', '#87CEEB');
          window.setAttribute('stroke', '#333');
          window.setAttribute('stroke-width', '1');

          // Numbers on roof
          const leftNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          leftNum.setAttribute('x', '55');
          leftNum.setAttribute('y', '45');
          leftNum.setAttribute('text-anchor', 'middle');
          leftNum.setAttribute('font-family', 'Arial, sans-serif');
          leftNum.setAttribute('font-size', '16');
          leftNum.setAttribute('font-weight', 'bold');
          leftNum.textContent = missingPosition === 0 ? '?' : num1.toString();

          const centerNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          centerNum.setAttribute('x', '100');
          centerNum.setAttribute('y', '30');
          centerNum.setAttribute('text-anchor', 'middle');
          centerNum.setAttribute('font-family', 'Arial, sans-serif');
          centerNum.setAttribute('font-size', '18');
          centerNum.setAttribute('font-weight', 'bold');
          centerNum.setAttribute('fill', '#d4a574');
          centerNum.setAttribute('stroke', '#333');
          centerNum.setAttribute('stroke-width', '0.5');
          centerNum.textContent = missingPosition === 1 ? '?' : sum.toString();

          const rightNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          rightNum.setAttribute('x', '145');
          rightNum.setAttribute('y', '45');
          rightNum.setAttribute('text-anchor', 'middle');
          rightNum.setAttribute('font-family', 'Arial, sans-serif');
          rightNum.setAttribute('font-size', '16');
          rightNum.setAttribute('font-weight', 'bold');
          rightNum.textContent = missingPosition === 2 ? '?' : num2.toString();

          // Add elements to SVG first
          svg.appendChild(houseBody);
          svg.appendChild(roof);
          svg.appendChild(door);
          svg.appendChild(window);

          // Add 4 lines for writing equations inside the house rectangle (on top)
          for (let lineIndex = 0; lineIndex < 4; lineIndex++) {
              const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              line.setAttribute('x1', '45');  // Start a bit inside the house wall
              line.setAttribute('x2', '155'); // End a bit before the house wall
              line.setAttribute('y1', (102 + lineIndex * 16).toString());  // Adjusted spacing and position
              line.setAttribute('y2', (102 + lineIndex * 16).toString());
              line.setAttribute('stroke', '#666');
              line.setAttribute('stroke-width', '1');
              svg.appendChild(line);
          }

          // Add numbers last so they're on top
          svg.appendChild(leftNum);
          svg.appendChild(centerNum);
          svg.appendChild(rightNum);

          houseDiv.appendChild(svg);
          gridContainer.appendChild(houseDiv);
      }

      problemsContainer.appendChild(gridContainer);
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
      case "word-problems": renderWordProblemsControls(); break;
      case "house-problems": renderHouseProblemsControls(); break;
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
      case "word-problems": generateWordProblemsProblems(); break;
      case "house-problems": generateHouseProblems(); break;
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
