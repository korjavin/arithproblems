# Printable Math Worksheet Generator

## Overview

This static web application is designed for teachers, parents, and students to quickly generate customized math worksheets. It focuses on core elementary topics such as multiplication tables, multi-digit arithmetic, and fractions, allowing users to specify the difficulty and problem parameters. Each worksheet is generated on the client-side (no backend needed) and rendered in a clean, printable format. The goal is to provide an offline-friendly tool that produces endless random problem sets, supporting traditional practice and reinforcing key mathematical concepts.

## Features

- **Randomized Problems**: Generate a fresh set of math problems with each click, ensuring a wide variety of practice.
- **Topic Selection**: Choose from multiple topics, each with its own tailored problem generator.
- **Custom Difficulty**: Adjust numeric ranges and enable or disable features (e.g., carrying in addition, exact division) to set the difficulty level.
- **Print-Ready Layout**: A "Print" button opens the browser's print dialog. The app uses CSS `@media print` rules to hide buttons and controls, formatting problems cleanly for printing on paper.
- **Self-Contained and Static**: Built with plain HTML, CSS, and JavaScript. All generation and formatting are done on the client-side.

## Recent Enhancements

- **Dynamic Problem Clearing**: The problem area is now automatically cleared when a new topic is selected, providing a cleaner user experience.
- **Enhanced Multiplication Table Controls**:
    - **Percent of Hints**: Instead of a fixed number of pre-filled answers, you can now specify the percentage of hints to be shown on the multiplication table.
    - **Customizable Range**: You can now define a custom range for the multiplicators (e.g., from 6 to 12), allowing for more targeted practice.

## Topics

### Multiplication Table
Generate exercises from multiplication tables. Users can specify a range of factors (e.g., 1–12) and the percentage of hints to display. The app can output a partially-filled multiplication chart for the student to complete.

### Multi-digit Addition/Subtraction
Create problems that involve adding or subtracting large numbers (e.g., 2- or 3-digit). The generator picks random numbers, and users can toggle options like "no carrying" or "allow borrow."

### Multiplication/Division
Generate multi-digit multiplication or division problems. For multiplication, users can set the number of digits for the factors. For division, the generator can ensure integer results.

### Canonical Forms of Rational Numbers
These exercises focus on simplifying fractions. Each problem presents a fraction (e.g., "18/24") and asks the student to reduce it to its lowest terms.

### Operations on Rational Numbers
These problems involve adding, subtracting, multiplying, or dividing fractions. The generator creates pairs of random fractions and an operation, often requiring students to find a common denominator and simplify the result.

## UX/UI Expectations

The user interface is designed to be simple and intuitive:
- **Topic Selection**: A dropdown menu allows users to select from the available topics.
- **Controls**: Each topic has its own set of controls, such as number inputs and checkboxes, to set parameters.
- **Generate Button**: A prominent button that generates and displays the problems for the selected topic.
- **Output Area**: A styled container where the generated problems appear.
- **Print Button**: A button that opens the print dialog, with print-specific CSS to ensure a clean, paper-friendly layout.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, and JavaScript.
- **Styling**: Modern CSS for layout and responsive design.
- **Containerization**: A `Dockerfile` is provided to bundle the static files into a lightweight Nginx container.
- **CI/CD**: GitHub Actions are used for automation, building and publishing the Docker image to the GitHub Container Registry (GHCR) on each commit.

## Deployment

The project includes a `Dockerfile` for easy deployment. The following command can be used to build the Docker image:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

A GitHub Actions workflow is set up to automate the build and push process to GHCR, ensuring that the latest version of the application is always available for deployment.
