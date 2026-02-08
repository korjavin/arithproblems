export function renderMultiplicationTableControls(container, t) {
    container.innerHTML = `
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

export function renderAdditionSubtractionControls(container, t) {
    container.innerHTML = `
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

export function renderMultiplicationDivisionControls(container, t) {
    container.innerHTML = `
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

export function renderRationalCanonicalControls(container, t) {
    container.innerHTML = `
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

export function renderSimplifyEquationsControls(container, t) {
    container.innerHTML = `
        <div>
            <label for="se-complexity">${t.complexity_label}</label>
            <input type="range" id="se-complexity" value="1" min="1" max="5">
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
}

export function renderRationalOperationsControls(container, t) {
    container.innerHTML = `
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

export function renderRationalMultDivControls(container, t) {
    container.innerHTML = `
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

export function renderProportionControls(container, t) {
    container.innerHTML = `
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

export function renderDecimalRationalControls(container, t) {
    container.innerHTML = `
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

export function renderPercentageControls(container, t) {
    container.innerHTML = `
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

export function renderGeometryControls(container, t) {
    container.innerHTML = `
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

export function renderLinearEquationsControls(container, t) {
    container.innerHTML = `
        <div>
            <label for="eq-variable-count">${t.variable_count_label || 'Number of Variables:'}</label>
            <select id="eq-variable-count">
                <option value="1">1 Variable (x)</option>
                <option value="2">2 Variables (x, y)</option>
                <option value="3">3 Variables (x, y, z)</option>
                <option value="4">4 Variables (x, y, z, w)</option>
            </select>
        </div>

        <div id="eq-single-var-controls">
            <div>
                <label for="eq-equation-type">${t.equation_type_label || 'Equation Type:'}</label>
                <select id="eq-equation-type">
                    <option value="mixed">${t.mixed_equations_option || 'Mixed'}</option>
                    <option value="one-step">${t.one_step_option || 'One Step'}</option>
                    <option value="two-step">${t.two_step_option || 'Two Step'}</option>
                    <option value="with-fractions">${t.with_fractions_option || 'With Fractions'}</option>
                    <option value="with-brackets">${t.with_brackets_option || 'With Brackets'}</option>
                </select>
            </div>
        </div>

        <div id="eq-multi-var-controls" style="display: none;">
            <div>
                <label for="eq-system-type">${t.system_type_label || 'System Type:'}</label>
                <select id="eq-system-type">
                    <option value="mixed">${t.mixed_systems_option || 'Mixed'}</option>
                    <option value="elimination-friendly">${t.elimination_friendly_option || 'Elimination Friendly'}</option>
                    <option value="substitution-friendly">${t.substitution_friendly_option || 'Substitution Friendly'}</option>
                    <option value="general">${t.general_option || 'General'}</option>
                </select>
            </div>
            <div>
                <input type="checkbox" id="eq-integer-solutions-only" checked>
                <label for="eq-integer-solutions-only">${t.integer_solutions_only_label || 'Integer Solutions Only'}</label>
            </div>
        </div>

        <div>
            <input type="checkbox" id="eq-include-brackets">
            <label for="eq-include-brackets">${t.include_brackets_label || 'Include Bracket Equations'}</label>
        </div>

        <div>
            <label for="eq-coefficient-range">${t.coefficient_range_label || 'Coefficient Range:'}</label>
            <input type="number" id="eq-coefficient-range" value="5" min="1" max="10">
        </div>
        <div>
            <label for="eq-solution-range">${t.solution_range_label || 'Solution Range:'}</label>
            <input type="number" id="eq-solution-range" value="12" min="1" max="50">
        </div>
        <div>
            <input type="checkbox" id="eq-allow-negative-solutions">
            <label for="eq-allow-negative-solutions">${t.allow_negative_solutions_label || 'Allow Negative Solutions'}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description || 'Generate linear equations with selectable number of variables (1-4).'}</p>
    `;

    // Add event listener to toggle controls based on variable count
    const variableCountSelect = container.querySelector('#eq-variable-count');
    const singleVarControls = container.querySelector('#eq-single-var-controls');
    const multiVarControls = container.querySelector('#eq-multi-var-controls');

    function updateControlsVisibility() {
        const count = parseInt(variableCountSelect.value);
        if (count === 1) {
            singleVarControls.style.display = 'block';
            multiVarControls.style.display = 'none';
        } else {
            singleVarControls.style.display = 'none';
            multiVarControls.style.display = 'block';
        }
    }

    variableCountSelect.addEventListener('change', updateControlsVisibility);
    updateControlsVisibility(); // Set initial state
}

export function renderLinearEquationsTwoVarsControls(container, t) {
    container.innerHTML = `
        <div>
            <label for="eq2-system-type">${t.system_type_label || 'System Type:'}</label>
            <select id="eq2-system-type">
                <option value="mixed">${t.mixed_systems_option || 'Mixed'}</option>
                <option value="elimination-friendly">${t.elimination_friendly_option || 'Elimination Friendly'}</option>
                <option value="substitution-friendly">${t.substitution_friendly_option || 'Substitution Friendly'}</option>
                <option value="general">${t.general_option || 'General'}</option>
            </select>
        </div>
        <div>
            <input type="checkbox" id="eq2-integer-solutions-only" checked>
            <label for="eq2-integer-solutions-only">${t.integer_solutions_only_label || 'Integer Solutions Only'}</label>
        </div>
        <div>
            <label for="eq2-coefficient-range">${t.coefficient_range_label || 'Coefficient Range:'}</label>
            <input type="number" id="eq2-coefficient-range" value="5" min="1" max="10">
        </div>
        <div>
            <label for="eq2-solution-range">${t.solution_range_label || 'Solution Range:'}</label>
            <input type="number" id="eq2-solution-range" value="12" min="1" max="20">
        </div>
        <div>
            <input type="checkbox" id="eq2-allow-negative-solutions">
            <label for="eq2-allow-negative-solutions">${t.allow_negative_solutions_label || 'Allow Negative Solutions'}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description || 'Generate systems of two linear equations with two variables (x, y).'}</p>
    `;
}

export function renderWordProblemsControls(container, t) {
    container.innerHTML = `
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

export function renderHouseProblemsControls(container, t) {
    container.innerHTML = `
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

export function renderPyramidProblemsControls(container, t) {
    container.innerHTML = `
        <div>
            <label for="pp-size">${t.pyramid_size_label}</label>
            <select id="pp-size">
                <option value="3">${t.size_3}</option>
                <option value="4">${t.size_4}</option>
                <option value="5">${t.size_5}</option>
            </select>
        </div>
        <div>
            <label for="pp-range">${t.range_label}</label>
            <select id="pp-range">
                <option value="1-10">${t.range_1_10}</option>
                <option value="1-20">${t.range_1_20}</option>
                <option value="1-50">${t.range_1_50}</option>
            </select>
        </div>
        <div>
            <label for="pp-missing">${t.missing_label}</label>
            <select id="pp-missing">
                <option value="random">${t.missing_random}</option>
                <option value="top">${t.missing_top}</option>
                <option value="middle">${t.missing_middle}</option>
                <option value="bottom">${t.missing_bottom}</option>
            </select>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
}

export function renderSimplifyRationalsControls(container, t) {
    container.innerHTML = `
        <div>
            <label for="sr-complexity">${t.complexity_label}</label>
            <input type="range" id="sr-complexity" value="1" min="1" max="5">
            <span id="sr-complexity-value">1</span>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;

    // Add event listener for dynamic updates
    const complexitySlider = document.getElementById('sr-complexity');
    const complexityValue = document.getElementById('sr-complexity-value');
    complexitySlider.addEventListener('input', () => {
        complexityValue.textContent = complexitySlider.value;
    });
}
export function renderMixedOperationsControls(container, t) {
    container.innerHTML = `
        <div>
            <label for="mo-num-operations">${t.num_operations_label}</label>
            <input type="number" id="mo-num-operations" value="3" min="1" max="10">
        </div>
        <div>
            <label for="mo-coefficient-range">${t.coefficient_range_label}</label>
            <input type="number" id="mo-coefficient-range" value="10" min="2" max="50">
        </div>
        <div>
            <input type="checkbox" id="mo-allow-negative">
            <label for="mo-allow-negative">${t.allow_negative_label}</label>
        </div>
        <p style="font-size:0.9em; color:#555;">${t.description}</p>
    `;
}
