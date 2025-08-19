# Printable Math Worksheet Generator

## Overview

This static web application is designed for teachers, parents, and students to quickly generate customized math worksheets. It covers comprehensive math topics from basic arithmetic to advanced rational number operations, allowing users to specify difficulty and problem parameters. Each worksheet is generated client-side (no backend needed) with integrated self-checking mechanisms using digital roots and control sums. The goal is to provide an offline-friendly tool that produces endless random problem sets with built-in verification for independent learning.

## Features

- **Randomized Problems**: Generate fresh math problems with each click, ensuring wide variety of practice.
- **Visual Topic Selection**: Interactive card-based interface for easy topic browsing with descriptions.
- **Custom Difficulty**: Adjust numeric ranges, digit counts, and enable/disable features to set precise difficulty levels.
- **Self-Checking System**: Digital root and control sum grids for student self-verification without answer keys.
- **Optimized Print Layout**: Professional print formatting with improved page utilization and space efficiency.
- **Comprehensive Coverage**: 8 different math topics from basic arithmetic to advanced rational operations.
- **Self-Contained**: Pure client-side application - no server required, works offline.

## Recent Enhancements

- **Redesigned Topic Selection**: Replaced dropdown with interactive card grid featuring topic descriptions and hover effects.
- **Unified Self-Check System**: Standardized digital root and control sum presentation across all topics using grid layouts.
- **Print Optimization**: Enhanced print layouts with better space utilization and page-aware formatting.
- **Streamlined Problem Design**: Removed redundant elements from problems to maximize page efficiency.
- **Enhanced Multiplication Table**: Percentage-based hints and customizable factor ranges for targeted practice.

## Available Topics

### 1. Multiplication Table
Pre-filled multiplication charts with customizable factor ranges and hint percentages. Students complete missing products to reinforce multiplication facts.

### 2. Addition/Subtraction
Multi-digit columnar addition and subtraction problems with configurable digit counts. Includes digital root self-checking for immediate verification.

### 3. Multiplication/Division
Mixed multiplication and division problems with customizable digit parameters. Features columnar multiplication format and specialized division layout with digital root verification.

### 4. Canonical Rational Numbers
Fraction simplification exercises where students reduce fractions to lowest terms. Control sum system allows self-verification of answers.

### 5. Rational Operations
Addition and subtraction of fractions with different denominators. Students find common denominators and simplify results using control sum verification.

### 6. Rational Multiplication/Division
Multiplication and division of fractions with options to avoid whole number results. Features control sum grids for answer verification.

### 7. Proportion
Clean proportion problems in the form a/b = c/d where students solve for the missing variable. Includes digital root verification grid.

### 8. Decimal/Rational Conversion
Bidirectional conversion between decimals and fractions with support for terminating decimals. Features digital root checking for both formats.

## User Interface

The interface prioritizes simplicity and educational effectiveness:

- **Visual Topic Selection**: Interactive card grid with topic descriptions and hover effects for easy browsing
- **Dynamic Controls**: Context-sensitive controls that appear based on selected topic with intuitive parameter settings
- **Problem Generation**: Single-click generation with automatic clearing and formatting
- **Self-Check Integration**: Built-in verification grids that appear with each problem set
- **Professional Print Layout**: Optimized print styles with proper spacing, page breaks, and clean formatting

## Self-Checking System

The application includes innovative self-verification features:

- **Digital Roots**: Mathematical technique using repeated digit summation for arithmetic problem verification
- **Control Sums**: Specialized checking method for fraction problems using numerator/denominator relationships  
- **Grid Layout**: Visual presentation of check values aligned with problem layout for easy comparison
- **Independent Learning**: Students can verify answers without requiring teacher intervention or answer keys

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, and ES6+ JavaScript
- **Styling**: Modern CSS with Grid, Flexbox, and print media queries
- **Mathematics**: Client-side algorithms for digital roots, GCD calculation, and random number generation
- **Containerization**: Lightweight Nginx Docker container for easy deployment
- **CI/CD**: GitHub Actions workflow for automated builds and GHCR publishing
- **Performance**: Zero dependencies, pure static files for optimal loading and offline capability

## Deployment

The project includes a `Dockerfile` for easy deployment. The following command can be used to build the Docker image:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

A GitHub Actions workflow is set up to automate the build and push process to GHCR, ensuring that the latest version of the application is always available for deployment.
