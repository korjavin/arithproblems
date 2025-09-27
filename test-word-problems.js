import assert from 'assert';
import { generateWordProblemsData } from './generators/word-problems.js';

// Mock translations object for testing purposes
const mockTranslations = {
    names: {
        neutral: ["Alex", "Jordan", "Taylor", "Casey", "Jamie", "Riley", "Jessie", "Morgan"],
        items: ["apples", "books", "chairs", "pencils", "toys", "shirts", "hats"],
        food: ["pizzas", "cookies", "sandwiches", "cupcakes", "oranges", "bananas"]
    },
    objects: {
        items: ["pens", "notebooks", "balloons", "marbles"],
        food: ["apples", "oranges", "bananas", "grapes"]
    },
    templates: {
        "age1": "{name1} is {multiplier} times as old as {name2}. The sum of their ages is {sum}. How old is {name1}?",
        "age2": "{name1} is {diff} years older than {name2}. In {years} years, {name1} will be twice as old as {name2}. How old is {name1} now?",
        "age3": "The sum of the ages of two people is {sum}. One person is {diff} years older than the other. What is the age of the older person?",
        "age4": "The product of the ages of {name1} and {name2} is {product}. {name1} is {diff} years older than {name2}. What is {name1}'s age?",
        "age5": "{name1} was {age1} years old {years} years ago. How old is {name1} now?",
        "distance1": "A train travels at a speed of {speed} km/h for {time} hours. What is the total distance covered?",
        "distance2": "Two cars start from the same point and travel in opposite directions. One travels at {speed1} km/h and the other at {speed2} km/h. How far apart will they be after {time} hours?",
        "distance3": "A cyclist covers a distance of {distance} km in {time} hours. What is the average speed of the cyclist in km/h?",
        "distance4": "{name1} walked {distance} km at an average speed of {speed} km/h. How long did the journey take?",
        "distance5": "Two cities are {distance} km apart. A car travels from one city to another at an average speed of {speed1} km/h. Another car travels from the other city at {speed2} km/h. When will they meet?",
        "money1": "A shop sells {item1} for ${price1} each and {item2} for ${price2} each. If {name1} buys {item1_count} of {item1} and {item2_count} of {item2}, how much does {name1} spend in total?",
        "money2": "{name1} has ${amount} in savings. {name1} spends ${spent} on a {item1} and ${spent2} on a {item2}. How much money is left?",
        "money3": "A ticket to a concert costs ${price}. If {count} people attend, what is the total revenue from ticket sales?",
        "money4": "The price of a {item1} is ${price}. If the price increases by {percent}%, what is the new price?",
        "money5": "{name1} earns ${salary} per month. If {name1} saves {percent}% of the salary each month, how much will be saved in a year?",
        "work1": "Printer A can print a batch of documents in {time1} minutes. Printer B can do it in {time2} minutes. How long will it take to print the batch if both printers work together?",
        "work2": "{name1} can paint a house in {time1} days, and {name2} can do it in {time2} days. How many days will it take them to paint the house together?",
        "work3": "It takes {workers} workers {time} hours to complete a task. How long would it take {new_workers} workers to complete the same task?",
        "work4": "A factory produces {items} items in {hours} hours. What is the average production rate per hour?",
        "mixture1": "A chemist has a {percent1}% acid solution and a {percent2}% acid solution. How many liters of the {percent1}% solution must be mixed with {liters} liters of the {percent2}% solution to get a {target_percent}% solution?",
        "mixture2": "A coffee blend contains {percent1}% of Arabica beans and the rest is Robusta. How much Arabica is in a {weight} kg bag of this blend?",
        "mixture3": "A fruit punch is made by mixing {liters1} liters of apple juice with {liters2} liters of orange juice. What is the percentage of apple juice in the mixture?",
        "mixture4": "A metal alloy is {percent1}% copper. How much copper is in a {weight} gram bar of this alloy?",
        "geometry1": "A rectangular garden has a length of {length} meters and a width of {width} meters. What is its perimeter?",
        "geometry2": "The area of a square is {area} square cm. What is the length of one side?",
        "geometry3": "A triangle has a base of {base} cm and a height of {height} cm. What is its area?",
        "geometry4": "A circle has a radius of {radius} cm. What is its circumference? (Use π = 3.14)",
        "number1": "The sum of two consecutive integers is {sum}. What are the integers?",
        "number2": "Find a number that when multiplied by {multiplier} and then increased by {add}, results in {result}.",
        "number3": "The difference between two numbers is {diff}. The larger number is {multiplier} times the smaller number. Find the numbers.",
        "number4": "If you subtract {sub} from a number and then divide by {div}, you get {result}. What is the number?",
        "percent1": "A school has {total_students} students. If {percent}% of them are boys, how many girls are there?",
        "percent2": "{part} is what percent of {whole}?",
        "percent3": "{part} is {percent}% of what number?",
        "percent4": "A T-shirt originally costing ${price} is on sale for {percent}% off. What is the sale price?"
    }
};

function testProblemGeneration() {
    const options = {
        problemCategory: 'mixed',
        difficultyLevel: 'medium',
        numberOfProblems: 10,
        translations: mockTranslations
    };
    const data = generateWordProblemsData(options);

    assert.strictEqual(data.problems.length, 10, 'Test Case 1 Failed: Incorrect number of problems generated.');
    assert.strictEqual(data.digitalRoots.length, 10, 'Test Case 2 Failed: Incorrect number of digital roots generated.');
    assert(data.problems[0].text.length > 10, 'Test Case 3 Failed: Problem text seems to be empty or too short.');
    console.log('All problem generation tests passed!');
}

function testProblemCategory() {
    const options = {
        problemCategory: 'age',
        difficultyLevel: 'easy',
        numberOfProblems: 5,
        translations: mockTranslations
    };
    const data = generateWordProblemsData(options);

    // This test is probabilistic, but we can check if the generated text includes keywords.
    // A more robust test would require inspecting the template keys used, which are not exposed.
    assert(data.problems.every(p => p.text.toLowerCase().includes('age') || p.text.toLowerCase().includes('older')), 'Test Case 4 Failed: Not all problems seem to be from the "age" category.');

    console.log('All problem category tests passed!');
}

function testInputValidation() {
    assert.throws(() => {
        generateWordProblemsData({ problemCategory: 'mixed', difficultyLevel: 'easy', numberOfProblems: 0, translations: mockTranslations });
    }, Error, 'Test Case 5 Failed: Did not throw for numberOfProblems < 1.');

    assert.throws(() => {
        generateWordProblemsData({ problemCategory: 'mixed', difficultyLevel: 'easy', numberOfProblems: 51, translations: mockTranslations });
    }, Error, 'Test Case 6 Failed: Did not throw for numberOfProblems > 50.');

    assert.throws(() => {
        generateWordProblemsData({ problemCategory: 'nonexistent', difficultyLevel: 'easy', numberOfProblems: 10, translations: mockTranslations });
    }, Error, 'Test Case 7 Failed: Did not throw for a nonexistent category.');

    console.log('All input validation tests passed!');
}

try {
    testProblemGeneration();
    testProblemCategory();
    testInputValidation();
    console.log('All word problems tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}