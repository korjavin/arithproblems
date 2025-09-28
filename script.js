import * as i18n from './i18n.js';
import * as controls from './ui/controls.js';
import { generateMultiplicationTableData } from './generators/multiplication-table.js';
import { generateAdditionSubtractionData } from './generators/addition-subtraction.js';
import { generateMultiplicationDivisionData } from './generators/multiplication-division.js';
import { generateRationalCanonicalData } from './generators/rational-canonical.js';
import { generateRationalOperationsData } from './generators/rational-operations.js';
import { generateRationalMultDivData } from './generators/rational-mult-div.js';
import { generateProportionData } from './generators/proportion.js';
import { generateDecimalRationalData } from './generators/decimal-rational.js';
import { generatePercentageData } from './generators/percentage.js';
import { generateGeometryData } from './generators/geometry.js';
import { generateLinearEquationsNVarsData } from './generators/linear-equations-n-vars.js';
import { generateWordProblemsData } from './generators/word-problems.js';
import { generateHouseProblemsData } from './generators/house-problems.js';
import { generatePyramidProblemsData } from './generators/pyramid-problems.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed");

    const DOM = {
        topicCards: document.querySelectorAll(".topic-card"),
        topicSpecificControlsContainer: document.getElementById("topic-specific-controls"),
        numProblemsInput: document.getElementById("num-problems"),
        generateButton: document.getElementById("generate-button"),
        printButton: document.getElementById("print-button"),
        problemsContainer: document.getElementById("problems-container"),
        languageSwitcher: document.getElementById("language-switcher"),
    };

    let currentTopic = "multiplication-table";

    const topicControlsRenderers = {
        "multiplication-table": controls.renderMultiplicationTableControls,
        "addition-subtraction": controls.renderAdditionSubtractionControls,
        "multiplication-division": controls.renderMultiplicationDivisionControls,
        "rational-canonical": controls.renderRationalCanonicalControls,
        "rational-operations": controls.renderRationalOperationsControls,
        "rational-mult-div": controls.renderRationalMultDivControls,
        "proportion": controls.renderProportionControls,
        "decimal-rational": controls.renderDecimalRationalControls,
        "percentage": controls.renderPercentageControls,
        "geometry": controls.renderGeometryControls,
        "linear-equations": controls.renderLinearEquationsControls,
        "word-problems": controls.renderWordProblemsControls,
        "house-problems": controls.renderHouseProblemsControls,
        "pyramid-problems": controls.renderPyramidProblemsControls,
    };

    const problemRenderers = {
        "multiplication-table": renderMultiplicationTableProblems,
        "addition-subtraction": renderAdditionSubtractionProblems,
        "multiplication-division": renderMultiplicationDivisionProblems,
        "rational-canonical": renderRationalCanonicalProblems,
        "rational-operations": renderRationalOperationsProblems,
        "rational-mult-div": renderRationalMultDivProblems,
        "proportion": renderProportionProblems,
        "decimal-rational": renderDecimalRationalProblems,
        "percentage": renderPercentageProblems,
        "geometry": renderGeometryProblems,
        "linear-equations": renderLinearEquationsProblems,
        "word-problems": renderWordProblemsProblems,
        "house-problems": renderHouseProblems,
        "pyramid-problems": renderPyramidProblems,
    };

    function renderCurrentTopicControls() {
        const translations = i18n.getTranslations();
        DOM.topicSpecificControlsContainer.innerHTML = "";
        const renderer = topicControlsRenderers[currentTopic];
        if (renderer && translations.script) {
            const topicKey = currentTopic.replace(/-/g, '_');
            if (translations.script[topicKey]) {
                renderer(DOM.topicSpecificControlsContainer, translations.script[topicKey]);
            } else {
                // Fallback: render with empty translations object
                renderer(DOM.topicSpecificControlsContainer, {});
            }
        }
    }

    function handleTopicChange(event) {
        currentTopic = event.currentTarget.dataset.topic;
        DOM.topicCards.forEach(c => c.classList.remove("selected"));
        event.currentTarget.classList.add("selected");
        DOM.problemsContainer.innerHTML = "";
        renderCurrentTopicControls();
    }

    function handleGenerateClick() {
        const renderer = problemRenderers[currentTopic];
        if (renderer) {
            renderer(i18n.getTranslations());
        } else {
            console.error("Unknown topic for generation:", currentTopic);
        }
    }

    function renderMultiplicationTableProblems(translations) {
        const t = translations.script.multiplication_table;
        const fromFactor = parseInt(document.getElementById('mt-from-factor').value, 10);
        const toFactor = parseInt(document.getElementById('mt-to-factor').value, 10);
        const percentHints = parseInt(document.getElementById('mt-percent-hints').value, 10);
        const tableData = generateMultiplicationTableData({ fromFactor, toFactor, percentHints });
        let html = `<h3>${t.chart_title.replace('{fromFactor}', fromFactor).replace('{toFactor}', toFactor)}</h3><table class="multiplication-chart"><thead><tr><th>&times;</th>`;
        tableData.headers.forEach(h => { html += `<th>${h}</th>`; });
        html += '</tr></thead><tbody>';
        tableData.rows.forEach(row => {
            html += `<tr><th>${row.header}</th>`;
            row.cells.forEach(cell => {
                html += `<td class="${cell.isPrefilled ? 'prefilled' : ''}">${cell.isPrefilled ? cell.value : ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        DOM.problemsContainer.innerHTML = html;
    }

    function renderAdditionSubtractionProblems(translations) {
        const t = translations.script.addition_subtraction;
        DOM.problemsContainer.innerHTML = '';
        const digits1 = parseInt(document.getElementById('as-digits-num1').value, 10);
        const digits2 = parseInt(document.getElementById('as-digits-num2').value, 10);
        const numberOfProblems = parseInt(DOM.numProblemsInput.value, 10);
        try {
            const { problems, answerRoots } = generateAdditionSubtractionData({ digits1, digits2, numberOfProblems });
            DOM.problemsContainer.innerHTML = `<h3>${t.problems_title}</h3><div class="arithmetic-grid">${problems.map(p => `<div class="arith-problem"><div class="operand-1">${p.num1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.num2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>`).join('')}</div>`;
            if (answerRoots.length > 0) {
                DOM.problemsContainer.innerHTML += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title}</h4><div class="digital-root-check-grid">${answerRoots.map(item => `<div class="dr-cell">${item.root}</div>`).join('')}</div></div>`;
            }
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_invalid_digits || error.message}</p>`;
        }
    }

    function renderMultiplicationDivisionProblems(translations) {
        const t = translations.script.multiplication_division;
        DOM.problemsContainer.innerHTML = '';
        try {
            const { problems, answerRoots } = generateMultiplicationDivisionData({
                digitsF1: parseInt(document.getElementById('md-digits-factor1').value, 10),
                digitsF2: parseInt(document.getElementById('md-digits-factor2').value, 10),
                digitsDiv: parseInt(document.getElementById('md-digits-divisor').value, 10),
                digitsQuo: parseInt(document.getElementById('md-digits-quotient').value, 10),
                noRemainder: document.getElementById('md-no-remainder').checked,
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
            });
            DOM.problemsContainer.innerHTML = `<h3>${t.problems_title}</h3><div class="arithmetic-grid problem-list-grid">${problems.map(p => p.type === 'multiplication' ? `<div class="arith-problem multiplication-problem"><div class="operand-1">${p.factor1}</div><div class="operator-operand2"><span class="operator">${p.operator}</span><span class="operand-2">${p.factor2}</span></div><div class="problem-line"></div><div class="answer-space"></div></div>` : `<div class="arith-problem division-problem-user"><div class="dividend">${p.dividend}</div><div class="divisor-container"><div class="divisor">${p.divisor}</div><div class="answer-line"></div><div class="answer-space"></div></div></div>`).join('')}</div>`;
            if (answerRoots.length > 0) {
                DOM.problemsContainer.innerHTML += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p><div class="digital-root-check-grid">${answerRoots.map(item => `<div class="dr-cell">${item.root}</div>`).join('')}</div></div>`;
            }
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_mult_digits || error.message}</p>`;
        }
    }

    function renderRationalCanonicalProblems(translations) {
        const t = translations.script.rational_canonical;
        DOM.problemsContainer.innerHTML = '';
        try {
            const numberOfProblems = parseInt(DOM.numProblemsInput.value, 10);
            const { problems, simplifiedAnswers } = generateRationalCanonicalData({
                maxVal: parseInt(document.getElementById('rc-max-val').value, 10),
                ensureReducible: document.getElementById('rc-ensure-reducible').checked,
                numberOfProblems,
            });
            let html = `<h3>${t.problems_title}</h3>`;
            if (problems.length < numberOfProblems) {
                html += `<p class="warning-message">${t.warning_generation.replace('{generatedCount}', problems.length).replace('{numberOfProblems}', numberOfProblems)}</p>`;
            }
            html += `<div class="arithmetic-grid fraction-problem-grid">${problems.map(p => `<div class="fraction-problem-item"><div class="problem-content"><span class="fraction"><span class="numerator">${p.numerator}</span><span class="denominator">${p.denominator}</span></span> =</div><div class="calculation-space"></div></div>`).join('')}</div>`;
            if (simplifiedAnswers.length > 0) {
                html += `<div class="digital-root-check-grid-container"><h4>${t.control_sum_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.control_sum_grid_subtitle}</p><div class="digital-root-check-grid">${simplifiedAnswers.map(a => `<div class="dr-cell">${isNaN(a.controlSum) ? "Err" : a.controlSum}</div>`).join('')}</div></div>`;
            }
            DOM.problemsContainer.innerHTML = html;
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_max_val || error.message}</p>`;
        }
    }

    function renderRationalOperationsProblems(translations) {
        const t = translations.script.rational_operations;
        DOM.problemsContainer.innerHTML = '';
        try {
            const { problems, controlSumsArray } = generateRationalOperationsData({
                numTerms: parseInt(document.getElementById('ro-num-terms').value, 10),
                maxVal: parseInt(document.getElementById('ro-max-val').value, 10),
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
            });
            let html = `<h3>${t.problems_title}</h3><div class="arithmetic-grid fraction-problem-grid">${problems.map(p => {
                let problemHTML = '<div class="fraction-operation-item"><div class="problem-content">';
                p.fractions.forEach((frac, j) => {
                    problemHTML += `<span class="fraction"><span class="numerator">${frac.numerator}</span><span class="denominator">${frac.denominator}</span></span>`;
                    if (j < p.operations.length) {
                        problemHTML += `<span class="operation-symbol">${p.operations[j] === 'add' ? '+' : '&ndash;'}</span>`;
                    }
                });
                return problemHTML + ' =</div><div class="calculation-space"></div></div>';
            }).join('')}</div>`;
            if (controlSumsArray.length > 0) {
                html += `<div class="digital-root-check-grid-container"><h4>${t.control_sum_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.control_sum_grid_subtitle}</p><div class="digital-root-check-grid">${controlSumsArray.map(a => `<div class="dr-cell">${isNaN(a.controlSum) ? "Err" : a.controlSum}</div>`).join('')}</div></div>`;
            }
            DOM.problemsContainer.innerHTML = html;
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_max_val || error.message}</p>`;
        }
    }

    function renderRationalMultDivProblems(translations) {
        const t = translations.script.rational_mult_div;
        DOM.problemsContainer.innerHTML = '';
        try {
            const numberOfProblems = parseInt(DOM.numProblemsInput.value, 10);
            const avoidWholeNums = document.getElementById('rmd-avoid-whole-nums').checked;
            const { problems, controlSumsArray } = generateRationalMultDivData({
                maxVal: parseInt(document.getElementById('rmd-max-val').value, 10),
                avoidWholeNums,
                numberOfProblems,
            });
            let html = `<h3>${t.problems_title}</h3>`;
            if (problems.length < numberOfProblems && avoidWholeNums) {
                 html += `<p class="warning-message">${t.warning_generation.replace('{generatedCount}', problems.length).replace('{numberOfProblems}', numberOfProblems)}</p>`;
            }
            html += `<div class="arithmetic-grid fraction-problem-grid">${problems.map(p => `<div class="fraction-operation-item"><div class="problem-content"><span class="fraction"><span class="numerator">${p.n1}</span><span class="denominator">${p.d1}</span></span><span class="operation-symbol">${p.operation === 'multiply' ? '&times;' : '&divide;'}</span><span class="fraction"><span class="numerator">${p.n2}</span><span class="denominator">${p.d2}</span></span> =</div><div class="calculation-space"></div></div>`).join('')}</div>`;
            if (controlSumsArray.length > 0) {
                html += `<div class="digital-root-check-grid-container"><h4>${t.control_sum_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.control_sum_grid_subtitle}</p><div class="digital-root-check-grid">${controlSumsArray.map(a => `<div class="dr-cell">${isNaN(a.controlSum) ? "Err" : a.controlSum}</div>`).join('')}</div></div>`;
            }
            DOM.problemsContainer.innerHTML = html;
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_max_val || error.message}</p>`;
        }
    }

    function renderProportionProblems(translations) {
        const t = translations.script.proportion;
        DOM.problemsContainer.innerHTML = '';
        try {
            const numberOfProblems = parseInt(DOM.numProblemsInput.value, 10);
            const { problems, digitalRoots } = generateProportionData({
                maxBase: parseInt(document.getElementById('prop-max-base').value, 10),
                maxMultiplier: parseInt(document.getElementById('prop-max-multiplier').value, 10),
                simplifyRatios: document.getElementById('prop-simplify-ratios').checked,
                numberOfProblems,
            });
            let html = `<h3>${t.problems_title}</h3>`;
            if (problems.length < numberOfProblems) {
                html += `<p class="warning-message">${t.warning_generation.replace('{generatedCount}', problems.length).replace('{numberOfProblems}', numberOfProblems)}</p>`;
            }
            html += `<div class="arithmetic-grid proportion-problem-grid">${problems.map(p => {
                let dA = p.a, dB = p.b, dC = p.c, dD = p.d;
                switch (p.hiddenPosition) {
                    case 'a': dA = 'x'; break;
                    case 'b': dB = 'x'; break;
                    case 'c': dC = 'x'; break;
                    case 'd': dD = 'x'; break;
                }
                return `<div class="proportion-problem-item"><div class="problem-content"><div class="proportion-equation"><div class="proportion"><span class="fraction"><span class="numerator">${dA}</span><span class="denominator">${dB}</span></span><span class="equals">=</span><span class="fraction"><span class="numerator">${dC}</span><span class="denominator">${dD}</span></span></div></div></div></div>`;
            }).join('')}</div>`;
            if (digitalRoots.length > 0) {
                html += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p><div class="digital-root-check-grid">${digitalRoots.map(a => `<div class="dr-cell">${a.digitalRoot}</div>`).join('')}</div></div>`;
            }
            DOM.problemsContainer.innerHTML = html;
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_max_base || error.message}</p>`;
        }
    }

    function renderDecimalRationalProblems(translations) {
        const t = translations.script.decimal_rational;
        DOM.problemsContainer.innerHTML = '';
        try {
            const numberOfProblems = parseInt(DOM.numProblemsInput.value, 10);
            const { problems, digitalRoots } = generateDecimalRationalData({
                problemMix: document.getElementById('dr-problem-mix').value,
                maxDecimalPlaces: parseInt(document.getElementById('dr-decimal-places').value, 10),
                terminatingOnly: document.getElementById('dr-terminating-only').checked,
                numberOfProblems,
            });
            let html = `<h3>${t.problems_title}</h3>`;
            if (problems.length < numberOfProblems) {
                html += `<p class="warning-message">${t.warning_generation.replace('{generatedCount}', problems.length).replace('{numberOfProblems}', numberOfProblems)}</p>`;
            }
            html += `<div class="arithmetic-grid decimal-rational-problem-grid">${problems.map(p => p.type === 'fraction-to-decimal' ? `<div class="decimal-rational-problem-item"><div class="problem-content"><div class="fraction-display"><span class="fraction"><span class="numerator">${p.numerator}</span><span class="denominator">${p.denominator}</span></span><span class="equals"> = </span><div class="answer-space"></div></div></div></div>` : `<div class="decimal-rational-problem-item"><div class="problem-content"><div class="decimal-display"><span class="decimal-number">${p.decimal}</span><span class="equals"> = </span><div class="answer-space"></div></div></div></div>`).join('')}</div>`;
            if (digitalRoots.length > 0) {
                html += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p><div class="digital-root-check-grid">${digitalRoots.map(a => `<div class="dr-cell">${a.digitalRoot}</div>`).join('')}</div></div>`;
            }
            DOM.problemsContainer.innerHTML = html;
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_max_decimal_places || error.message}</p>`;
        }
    }

    function renderPercentageProblems(translations) {
        const t = translations.script.percentage;
        DOM.problemsContainer.innerHTML = '';
        try {
            const { problems, digitalRoots } = generatePercentageData({
                problemType: document.getElementById('pct-problem-type').value,
                maxNumber: parseInt(document.getElementById('pct-max-number').value, 10),
                wholePercentsOnly: document.getElementById('pct-whole-percents-only').checked,
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
            });
            DOM.problemsContainer.innerHTML = `<h3>${t.problems_title}</h3><div class="arithmetic-grid percentage-problem-grid">${problems.map(p => {
                if (p.type === 'find-percent') return `<div class="percentage-problem-item"><div class="problem-content"><span class="percentage-text">${p.percentage}% ${t.of_text} ${p.number} = </span><div class="answer-space"></div></div></div>`;
                if (p.type === 'find-what-percent') return `<div class="percentage-problem-item"><div class="problem-content"><span class="percentage-text">${p.part} ${t.is_text} ${t.what_percent_text} ${t.of_text} ${p.whole}?</span><div class="answer-space"></div></div></div>`;
                return `<div class="percentage-problem-item"><div class="problem-content"><span class="percentage-text">${p.percentage}% ${t.of_text} ${t.what_number_text} ${t.is_text} ${p.part}?</span><div class="answer-space"></div></div></div>`;
            }).join('')}</div>`;
            if (digitalRoots.length > 0) {
                DOM.problemsContainer.innerHTML += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p><div class="digital-root-check-grid">${digitalRoots.map(a => `<div class="dr-cell">${a.digitalRoot}</div>`).join('')}</div></div>`;
            }
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_max_number || error.message}</p>`;
        }
    }

    function renderGeometryProblems(translations) {
        const t = translations.script.geometry;
        DOM.problemsContainer.innerHTML = '';
        try {
            const { problems, digitalRoots } = generateGeometryData({
                shapeMix: document.getElementById('geo-shape-mix').value,
                calculationType: document.getElementById('geo-calculation-type').value,
                maxDimension: parseInt(document.getElementById('geo-max-dimension').value, 10),
                wholeNumbersOnly: document.getElementById('geo-whole-numbers-only').checked,
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
            });
            DOM.problemsContainer.innerHTML = `<h3>${t.problems_title}</h3><div class="arithmetic-grid geometry-problem-grid">${problems.map(p => {
                if (p.type === 'rectangles') return p.calculation === 'area' ? `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.rectangle_text}: ${t.length_text} = ${p.length}, ${t.width_text} = ${p.width}</span><br><span class="calculation-text">${t.area_text} = </span><div class="answer-space"></div></div></div>` : `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.rectangle_text}: ${t.length_text} = ${p.length}, ${t.width_text} = ${p.width}</span><br><span class="calculation-text">${t.perimeter_text} = </span><div class="answer-space"></div></div></div>`;
                if (p.type === 'squares') return p.calculation === 'area' ? `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.square_text}: ${t.side_text} = ${p.side}</span><br><span class="calculation-text">${t.area_text} = </span><div class="answer-space"></div></div></div>` : `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.square_text}: ${t.side_text} = ${p.side}</span><br><span class="calculation-text">${t.perimeter_text} = </span><div class="answer-space"></div></div></div>`;
                if (p.type === 'triangles') return p.calculation === 'area' ? `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.triangle_text}: ${t.base_text} = ${p.base}, ${t.height_text} = ${p.height}</span><br><span class="calculation-text">${t.area_text} = </span><div class="answer-space"></div></div></div>` : `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.triangle_text}: ${t.sides_text} = ${p.side1}, ${p.side2}, ${p.side3}</span><br><span class="calculation-text">${t.perimeter_text} = </span><div class="answer-space"></div></div></div>`;
                if (p.type === 'circles') return p.calculation === 'area' ? `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.circle_text}: ${t.radius_text} = ${p.radius}</span><br><span class="calculation-text">${t.area_text} = πr² = </span><div class="answer-space"></div></div></div>` : `<div class="geometry-problem-item"><div class="problem-content"><span class="shape-text">${t.circle_text}: ${t.radius_text} = ${p.radius}</span><br><span class="calculation-text">${t.circumference_text} = 2πr = </span><div class="answer-space"></div></div></div>`;
                return '';
            }).join('')}</div>`;
            if (digitalRoots.length > 0) {
                DOM.problemsContainer.innerHTML += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p><div class="digital-root-check-grid">${digitalRoots.map(a => `<div class="dr-cell">${a.digitalRoot}</div>`).join('')}</div></div>`;
            }
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_max_dimension || error.message}</p>`;
        }
    }

    function renderLinearEquationsProblems(translations) {
        const t = translations.script.linear_equations;
        DOM.problemsContainer.innerHTML = '';
        try {
            const variableCount = parseInt(document.getElementById('eq-variable-count').value);

            // Prepare parameters based on variable count
            const params = {
                variableCount,
                coefficientRange: parseInt(document.getElementById('eq-coefficient-range').value, 10),
                solutionRange: parseInt(document.getElementById('eq-solution-range').value, 10),
                allowNegativeSolutions: document.getElementById('eq-allow-negative-solutions').checked,
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
            };

            if (variableCount === 1) {
                // Single variable parameters
                params.equationType = document.getElementById('eq-equation-type').value;
                params.includeBrackets = document.getElementById('eq-include-brackets').checked;
            } else {
                // Multi-variable parameters
                params.systemType = document.getElementById('eq-system-type').value;
                params.integerSolutionsOnly = document.getElementById('eq-integer-solutions-only').checked;
            }

            const { problems, digitalRoots } = generateLinearEquationsNVarsData(params);

            // Render problems based on variable count
            if (variableCount === 1) {
                // Single variable equations
                DOM.problemsContainer.innerHTML = `<h3>${t.problems_title || 'Linear Equations'}</h3><div class="arithmetic-grid linear-equations-problem-grid">${problems.map(p => `<div class="linear-equation-item"><div class="problem-content"><span class="equation-text">${t.solve_for_x_text || 'Solve for x:'}</span><br><span class="equation">${p.text}</span><div class="answer-space"></div></div></div>`).join('')}</div>`;
            } else {
                // Multi-variable systems
                const variableNames = ['x', 'y', 'z', 'w'].slice(0, variableCount);
                const solveText = `Solve for ${variableNames.join(', ')}:`;

                DOM.problemsContainer.innerHTML = `<h3>${t.problems_title || 'Systems of Linear Equations'}</h3><div class="arithmetic-grid linear-equations-problem-grid">${problems.map(p => `<div class="linear-equation-system"><div class="problem-content"><span class="equation-text">${solveText}</span><br><div class="system-equations">${p.equations.map(eq => `<div class="equation">${eq}</div>`).join('')}</div><div class="answer-space">${'<br>'.repeat(variableCount-1)}</div></div></div>`).join('')}</div>`;
            }

            if (digitalRoots.length > 0) {
                const subtitle = variableCount === 1 ?
                    (t.digital_root_grid_subtitle || 'Digital roots for verification') :
                    `Sum of |${['x', 'y', 'z', 'w'].slice(0, variableCount).join('| + |')}| digital roots for verification`;

                DOM.problemsContainer.innerHTML += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title || 'Digital Root Check'}</h4><p style="font-size:0.85em; margin-bottom:10px;">${subtitle}</p><div class="digital-root-check-grid">${digitalRoots.map(a => `<div class="dr-cell">${a.digitalRoot}</div>`).join('')}</div></div>`;
            }
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }

    function renderWordProblemsProblems(translations) {
        const t = translations.script.word_problems;
        DOM.problemsContainer.innerHTML = '';
        try {
            const { problems, digitalRoots } = generateWordProblemsData({
                problemCategory: document.getElementById('wp-problem-category').value,
                difficultyLevel: document.getElementById('wp-difficulty-level').value,
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
                translations: t,
            });
            DOM.problemsContainer.innerHTML = `<h3>${t.problems_title}</h3><div class="word-problems-grid problems-grid">${problems.map(p => `<div class="word-problem-item"><div class="problem-content"><div class="problem-text">${p.text}</div><div class="answer-space">Answer: </div></div></div>`).join('')}</div>`;
            if (digitalRoots.length > 0) {
                DOM.problemsContainer.innerHTML += `<div class="digital-root-check-grid-container"><h4>${t.digital_root_grid_title}</h4><p style="font-size:0.85em; margin-bottom:10px;">${t.digital_root_grid_subtitle}</p><div class="digital-root-check-grid">${digitalRoots.map(a => `<div class="dr-cell">${a.digitalRoot}</div>`).join('')}</div></div>`;
            }
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_num_problems || error.message}</p>`;
        }
    }

    function renderHouseProblems(translations) {
        const t = translations.script.house_problems;
        DOM.problemsContainer.innerHTML = '';
        try {
            const { problems } = generateHouseProblemsData({
                range: document.getElementById('hp-range').value,
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
            });
            const gridContainer = document.createElement('div');
            gridContainer.className = 'house-problems-grid';
            problems.forEach(p => {
                const houseDiv = document.createElement('div');
                houseDiv.className = 'house-problem';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 200 170');
                svg.setAttribute('width', '200');
                svg.setAttribute('height', '170');
                svg.innerHTML = `<rect x="40" y="60" width="120" height="100" fill="#e8f4f8" stroke="#333" stroke-width="2"></rect><polygon points="30,60 100,10 170,60" fill="#d4a574" stroke="#333" stroke-width="2"></polygon><text x="55" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${p.missingPosition === 0 ? '?' : p.num1}</text><text x="100" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#d4a574" stroke="#333" stroke-width="0.5">${p.missingPosition === 1 ? '?' : p.sum}</text><text x="145" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${p.missingPosition === 2 ? '?' : p.num2}</text>`;
                houseDiv.appendChild(svg);
                gridContainer.appendChild(houseDiv);
            });
            DOM.problemsContainer.innerHTML = `<h3>${t.problems_title}</h3>`;
            DOM.problemsContainer.appendChild(gridContainer);
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_invalid_num_problems || error.message}</p>`;
        }
    }

    function renderPyramidProblems(translations) {
        const t = translations.script.pyramid_problems;
        DOM.problemsContainer.innerHTML = '';
        try {
            const { problems } = generatePyramidProblemsData({
                pyramidSize: parseInt(document.getElementById('pp-size').value, 10),
                range: document.getElementById('pp-range').value,
                missingType: document.getElementById('pp-missing').value,
                numberOfProblems: parseInt(DOM.numProblemsInput.value, 10),
            });
            const gridContainer = document.createElement('div');
            gridContainer.className = 'pyramid-problems-grid';
            problems.forEach(p => {
                const pyramidDiv = document.createElement('div');
                pyramidDiv.className = 'pyramid-problem';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 300 200');
                svg.setAttribute('width', '300');
                svg.setAttribute('height', '200');
                let svgContent = '<rect x="0" y="190" width="300" height="10" fill="#90EE90"></rect>';
                const stoneSize = 40;
                const stoneSpacing = 45;
                p.pyramid.forEach((layer, layerIndex) => {
                    const y = 180 - layerIndex * 35;
                    const startX = 150 - (layer.length * stoneSpacing) / 2 + stoneSpacing / 2;
                    layer.forEach((stoneValue, stoneIndex) => {
                        const x = startX + stoneIndex * stoneSpacing;
                        svgContent += `<ellipse cx="${x}" cy="${y}" rx="${stoneSize/2}" ry="${stoneSize/2.5}" fill="#D2B48C" stroke="#8B7355" stroke-width="2"></ellipse>`;
                        if (stoneValue !== '?') {
                            svgContent += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">${stoneValue}</text>`;
                        }
                    });
                });
                svg.innerHTML = svgContent;
                pyramidDiv.appendChild(svg);
                gridContainer.appendChild(pyramidDiv);
            });
            DOM.problemsContainer.innerHTML = `<h3>${t.problems_title}</h3>`;
            DOM.problemsContainer.appendChild(gridContainer);
        } catch (error) {
            DOM.problemsContainer.innerHTML = `<p class="error-message">${t.error_invalid_num_problems || error.message}</p>`;
        }
    }


    async function initialize() {
        DOM.topicCards.forEach(card => card.addEventListener("click", handleTopicChange));
        DOM.generateButton.addEventListener("click", handleGenerateClick);
        DOM.printButton.addEventListener("click", () => window.print());

        DOM.languageSwitcher.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            if (lang) {
                i18n.setLanguage(lang, renderCurrentTopicControls);
            }
        });

        const firstCard = document.querySelector(`[data-topic="${currentTopic}"]`);
        if (firstCard) {
            firstCard.classList.add("selected");
        }

        await i18n.setLanguage(i18n.getInitialLang(), renderCurrentTopicControls);
        console.log("App initialized.");
    }

    initialize();
});