import assert from 'assert';

// Mock DOM
globalThis.document = {
    getElementById: (id) => {
        return {
            addEventListener: () => {},
            value: '1',
            textContent: ''
        };
    },
    createElement: (tag) => {
        return {
            setAttribute: () => {},
            innerHTML: '',
            appendChild: () => {},
            addEventListener: () => {}
        };
    }
};

class MockElement {
    constructor() {
        this.innerHTML = '';
        this.style = {};
    }
    querySelector(selector) {
        return new MockElement();
    }
    querySelectorAll(selector) {
        return [new MockElement()];
    }
    addEventListener(event, callback) {}
}

import * as controls from './ui/controls.js';

const mockTranslations = {
    range_label: 'Range Label',
    from_label: 'From Label',
    to_label: 'To Label',
    percent_hints_label: 'Hints Label',
    chart_description: 'Chart Description',
    digits_num1_label: 'Digits 1',
    digits_num2_label: 'Digits 2',
    digital_root_description: 'DR Description',
    multiplication_title: 'Mult Title',
    digits_factor1_label: 'Digits F1',
    digits_factor2_label: 'Digits F2',
    division_title: 'Div Title',
    digits_divisor_label: 'Digits Divisor',
    digits_quotient_label: 'Digits Quotient',
    no_remainder_label: 'No Remainder',
    max_val_label: 'Max Val',
    ensure_reducible_label: 'Ensure Reducible',
    description: 'Description',
    complexity_label: 'Complexity',
    num_terms_label: 'Num Terms',
    avoid_whole_nums_label: 'Avoid Whole',
    max_base_label: 'Max Base',
    max_multiplier_label: 'Max Mult',
    simplify_ratios_label: 'Simplify Ratios',
    problem_mix_label: 'Problem Mix',
    mixed_option: 'Mixed',
    fraction_to_decimal_option: 'F to D',
    decimal_to_fraction_option: 'D to F',
    max_decimal_places_label: 'Max Dec',
    terminating_only_label: 'Terminating',
    problem_type_label: 'Problem Type',
    find_percent_option: 'Find %',
    find_what_percent_option: 'Find What %',
    find_whole_option: 'Find Whole',
    max_number_label: 'Max Num',
    whole_percents_only_label: 'Whole % Only',
    shape_mix_label: 'Shape Mix',
    mixed_shapes_option: 'Mixed Shapes',
    rectangles_only_option: 'Rectangles',
    squares_only_option: 'Squares',
    triangles_only_option: 'Triangles',
    circles_only_option: 'Circles',
    calculation_type_label: 'Calc Type',
    mixed_calculations_option: 'Mixed Calc',
    area_only_option: 'Area Only',
    perimeter_only_option: 'Perim Only',
    max_dimension_label: 'Max Dim',
    whole_numbers_only_label: 'Whole Num Only',
    variable_count_label: 'Var Count',
    equation_type_label: 'Eq Type',
    system_type_label: 'Sys Type',
    integer_solutions_only_label: 'Int Sol Only',
    include_brackets_label: 'Brackets',
    coefficient_range_label: 'Coeff Range',
    solution_range_label: 'Sol Range',
    allow_negative_solutions_label: 'Neg Sol',
    problem_category_label: 'Category',
    mixed_categories_option: 'Mixed Cat',
    age_problems_option: 'Age',
    distance_problems_option: 'Distance',
    money_problems_option: 'Money',
    work_rate_problems_option: 'Work',
    mixture_problems_option: 'Mixture',
    geometry_word_problems_option: 'Geo Word',
    number_problems_option: 'Number',
    percentage_word_problems_option: 'Percent Word',
    difficulty_level_label: 'Difficulty',
    mixed_difficulty_option: 'Mixed Diff',
    easy_level_option: 'Easy',
    medium_level_option: 'Medium',
    hard_level_option: 'Hard',
    range_1_10: '1-10',
    range_1_20: '1-20',
    range_1_50: '1-50',
    range_1_100: '1-100',
    pyramid_size_label: 'Pyramid Size',
    size_3: 'Size 3',
    size_4: 'Size 4',
    size_5: 'Size 5',
    missing_label: 'Missing',
    missing_random: 'Random',
    missing_top: 'Top',
    missing_middle: 'Middle',
    missing_bottom: 'Bottom',
    num_operations_label: 'Num Ops',
    allow_negative_label: 'Allow Neg',
    bracket_depth_label: 'Bracket Depth'
};

function testControls() {
    const testCases = [
        { name: 'renderMultiplicationTableControls', func: controls.renderMultiplicationTableControls, expected: ['mt-from-factor', 'mt-to-factor', 'mt-percent-hints'] },
        { name: 'renderAdditionSubtractionControls', func: controls.renderAdditionSubtractionControls, expected: ['as-digits-num1', 'as-digits-num2'] },
        { name: 'renderMultiplicationDivisionControls', func: controls.renderMultiplicationDivisionControls, expected: ['md-digits-factor1', 'md-digits-factor2', 'md-digits-divisor', 'md-digits-quotient', 'md-no-remainder'] },
        { name: 'renderRationalCanonicalControls', func: controls.renderRationalCanonicalControls, expected: ['rc-max-val', 'rc-ensure-reducible'] },
        { name: 'renderSimplifyEquationsControls', func: controls.renderSimplifyEquationsControls, expected: ['se-num-operations', 'se-include-brackets', 'se-bracket-depth', 'se-coefficient-range'] },
        { name: 'renderRationalOperationsControls', func: controls.renderRationalOperationsControls, expected: ['ro-num-terms', 'ro-max-val'] },
        { name: 'renderRationalMultDivControls', func: controls.renderRationalMultDivControls, expected: ['rmd-max-val', 'rmd-avoid-whole-nums'] },
        { name: 'renderProportionControls', func: controls.renderProportionControls, expected: ['prop-max-base', 'prop-max-multiplier', 'prop-simplify-ratios'] },
        { name: 'renderDecimalRationalControls', func: controls.renderDecimalRationalControls, expected: ['dr-problem-mix', 'dr-decimal-places', 'dr-terminating-only'] },
        { name: 'renderPercentageControls', func: controls.renderPercentageControls, expected: ['pct-problem-type', 'pct-max-number', 'pct-whole-percents-only'] },
        { name: 'renderGeometryControls', func: controls.renderGeometryControls, expected: ['geo-shape-mix', 'geo-calculation-type', 'geo-max-dimension', 'geo-whole-numbers-only'] },
        { name: 'renderLinearEquationsControls', func: controls.renderLinearEquationsControls, expected: ['eq-variable-count', 'eq-equation-type', 'eq-system-type', 'eq-coefficient-range'] },
        { name: 'renderLinearEquationsTwoVarsControls', func: controls.renderLinearEquationsTwoVarsControls, expected: ['eq2-system-type', 'eq2-integer-solutions-only', 'eq2-coefficient-range', 'eq2-solution-range'] },
        { name: 'renderWordProblemsControls', func: controls.renderWordProblemsControls, expected: ['wp-problem-category', 'wp-difficulty-level'] },
        { name: 'renderHouseProblemsControls', func: controls.renderHouseProblemsControls, expected: ['hp-range'] },
        { name: 'renderPyramidProblemsControls', func: controls.renderPyramidProblemsControls, expected: ['pp-size', 'pp-range', 'pp-missing'] },
        { name: 'renderSimplifyRationalsControls', func: controls.renderSimplifyRationalsControls, expected: ['sr-include-monomials', 'sr-include-binomials', 'sr-include-quadratics', 'sr-coefficient-range'] },
        { name: 'renderMixedOperationsControls', func: controls.renderMixedOperationsControls, expected: ['mo-num-operations', 'mo-coefficient-range', 'mo-allow-negative'] },
        { name: 'renderUnitConversionControls', func: controls.renderUnitConversionControls, expected: ['uc-family-length', 'uc-family-mass', 'uc-family-volume', 'uc-family-time', 'uc-family-money', 'uc-difficulty', 'uc-allow-decimals', 'uc-include-unsolvable'] },
        { name: 'renderTimeCalendarControls', func: controls.renderTimeCalendarControls, expected: ['tc-type-clock', 'tc-type-timeline', 'tc-type-periodic', 'tc-type-calendar', 'tc-type-age', 'tc-type-faulty', 'tc-difficulty'] },
        { name: 'renderFindTheNumberControls', func: controls.renderFindTheNumberControls, expected: ['ftn-type-describe', 'ftn-type-inverse', 'ftn-type-halving', 'ftn-type-letters', 'ftn-chain-length', 'ftn-max-value', 'ftn-allow-halving'] },
        { name: 'renderCombinatoricsControls', func: controls.renderCombinatoricsControls, expected: ['cb-type-product', 'cb-type-choose', 'cb-type-arrange', 'cb-type-handshakes', 'cb-type-halftime', 'cb-type-dominoes', 'cb-max-count'] },
        { name: 'renderIntegerSolutionsControls', func: controls.renderIntegerSolutionsControls, expected: ['is-type-legs', 'is-type-vertices', 'is-type-market', 'is-type-money', 'is-type-subset', 'is-type-matches', 'is-type-parity'] },
        { name: 'renderNumberPropertiesControls', func: controls.renderNumberPropertiesControls, expected: ['np-type-remainder', 'np-type-digits', 'np-type-count', 'np-type-consecutive', 'np-type-extremes', 'np-type-primes', 'np-max-value'] },
        { name: 'renderGridFiguresControls', func: controls.renderGridFiguresControls, expected: ['gf-type-perimeter', 'gf-type-area', 'gf-type-corners', 'gf-type-staircase', 'gf-type-glued', 'gf-type-compare', 'gf-size', 'gf-halves'] },
        { name: 'renderCubeBuildingsControls', func: controls.renderCubeBuildingsControls, expected: ['cu-type-count', 'cu-type-complete', 'cu-type-faces', 'cu-type-glued', 'cu-type-views', 'cu-type-stairs', 'cu-type-pyramid', 'cu-type-painted', 'cu-type-edges', 'cu-grid-size', 'cu-max-height'] },
        { name: 'renderMagicSquaresControls', func: controls.renderMagicSquaresControls, expected: ['ms-size', 'ms-hidden', 'ms-sum'] },
        { name: 'renderPageNumbersControls', func: controls.renderPageNumbersControls, expected: ['pn-type-digit_count', 'pn-type-kth_digit', 'pn-type-occurrences', 'pn-type-sum', 'pn-type-triples', 'pn-max-pages'] },
        { name: 'renderMoneyProblemsControls', func: controls.renderMoneyProblemsControls, expected: ['mp-type-pay', 'mp-type-affordable', 'mp-type-tariff', 'mp-type-group', 'mp-type-saving', 'mp-type-riddle'] },
        { name: 'renderDiceControls', func: controls.renderDiceControls, expected: ['dc-type-net', 'dc-type-tower', 'dc-type-glued', 'dc-type-table_row'] },
        { name: 'renderCornerSumsControls', func: controls.renderCornerSumsControls, expected: ['cs-figure', 'cs-numbers', 'cs-hidden'] }
    ];

    testCases.forEach(tc => {
        const container = new MockElement();
        tc.func(container, mockTranslations);
        tc.expected.forEach(id => {
            assert(container.innerHTML.includes(`id="${id}"`), `${tc.name} should contain element with id="${id}"`);
        });
        console.log(`✓ ${tc.name} passed`);
    });
}

try {
    testControls();
    console.log('All UI control tests passed!');
} catch (error) {
    console.error(error);
    process.exit(1);
}
