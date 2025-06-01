# Implementation Plan

1. Project Setup
	1.	Repository structure: Create the repository and add initial files: index.html, style.css, script.js, and an assets/ folder for any images or fonts.
	2.	HTML boilerplate: In index.html, set up a basic HTML structure with <head> (linking style.css) and <body>. Include placeholder elements: a header/title, a topic selector, a control panel (div) for inputs, an output area (div) for problems, and Generate/Print buttons.
	3.	CSS reset and layout: In style.css, include a reset or basic styles to ensure consistency. Define font families and base sizes. Create classes or IDs for .controls, .problems, .button, etc., to style the UI. Use a grid or flex layout for aligning form elements.
	4.	JavaScript scaffolding: In script.js, set up an event listener for DOMContentLoaded to initialize the app. Prepare empty functions for each topic generator (e.g. generateMultiplicationTable(), generateAdditionProblems(), etc.). Also handle reading form inputs and binding button clicks (e.g. on “Generate” button click, call the right generator based on current selection).

2. UI Layout and Interactivity
	1.	Topic selector: Implement a <select> element (or tabs/buttons) with options for each topic (“Multiplication Table”, “Add/Subtract”, etc.). Add an event listener so when the topic changes, the controls panel updates to show relevant inputs.
	2.	Topic-specific controls: For each topic, create form inputs. For example, for addition: two number inputs for “Digits in Number 1” and “Digits in Number 2”, a checkbox for “Allow carry”. Show these controls only when the topic is selected (hide others). Do this by changing the visibility of sections or using JavaScript to populate the controls dynamically.
	3.	Global controls: Also include a field “Number of Problems” (common to all topics) and a slider or dropdown for “Font size” or “Layout columns” if desired. Add a “Generate” button and a “Print” button.
	4.	Buttons behavior:
	•	Generate: On click, clear the .problems output area, read current settings, and call the appropriate topic generator function.
	•	Print: On click, trigger window.print(). Implement @media print CSS so that the controls and buttons are hidden in print view. For example:

@media print {
  .controls, .button, header { display: none !important; }
}

Reference MDN docs on print media queries for guidance ￼ ￼.

3. Multiplication Table Generator
	1.	Input parameters: Determine which inputs are needed: e.g., “Up to N×N table” or “Specific base number”. Extract values from controls.
	2.	Generation logic: If generating random problems, loop to create the specified number of problems. Each problem could be “a × b = ___” where a and b are random integers within the selected range. If generating a blank chart, create a table (HTML <table>) with rows and columns (but that’s optional).
	3.	Output format: Append each problem to the .problems container. You can use a consistent HTML snippet like <div class="problem">7 × 8 = <span class="blank">___</span></div>. Style with CSS to align the multiplication sign and equals sign.

4. Addition/Subtraction Generator
	1.	Inputs: Read number of digits for each addend/subtrahend, total problems, and toggles (carry allowed, digital root constraint).
	2.	Digital root logic: Implement a helper function digitalRoot(n) that repeatedly sums digits until one digit remains ￼. This can be used to enforce a constraint (e.g. only generate problems where the sum’s digital root equals a target) or to check correctness.
	3.	No-carry implementation: If “no carry” is selected, generate digits column by column ensuring that in each column the sum is <10. For example, for two 3-digit numbers, pick random d1 + d2 < 10 for each column. Similarly for subtraction “no borrow”, ensure minuend digits ≥ subtrahend digits.
	4.	Problem assembly: For each problem, randomly generate two numbers respecting the above. Randomly choose addition or subtraction based on topic. Then output as “123 + 456 = ___” or “789 – 234 = ___” in the problems div.
	5.	Control checks: If digital root constraint is used, compute the root of the generated sum (or difference) and if it doesn’t match the desired property, regenerate or adjust numbers.

5. Multiplication/Division Generator
	1.	Multiplication: Inputs: number of digits per factor, number of problems, allow carry checkbox. To allow/disallow carry, use a similar per-column check: ensure product of digits in positions (with any carry) remains within limits. Actually handling multi-digit multiplication no-carry is complex; one strategy is to pick one factor and find another such that each partial multiplication plus carry is <10, but for simplicity we can skip precise control.
	2.	Division: Inputs: divisor digit count, quotient digit count, require no remainder checkbox. To ensure integer results, do: pick a random divisor and quotient, then compute the dividend = divisor × quotient. This guarantees an integer problem “(dividend) ÷ (divisor) = ___”. If remainders are allowed, you can pick dividend and divisor randomly and optionally compute quotient + remainder.
	3.	Output: Format multiplication problems as “23 × 47 = ___”. For division, display as “144 ÷ 12 = ___”. If desired, use &times; and ÷ symbols or images for clarity.

6. Canonical Rational Number Generator
	1.	Inputs: maximum numerator/denominator size, number of problems.
	2.	Generate fractions: Randomly generate numerator and denominator. Ensure the fraction is reducible by checking gcd(n, d) > 1 (greatest common divisor > 1). Implement a gcd function (Euclidean algorithm). If gcd=1, regenerate or retry until we get a reducible fraction. Also enforce denominator ≠ 0. For negative numbers, you could allow negative numerator or denominator.
	3.	Simplification note: The student is expected to divide numerator and denominator by gcd to get the canonical form ￼.
	4.	Output: Render each problem as “Simplify: 18/24 = ___”. Use horizontal fraction bars if desired (<span class="frac"><span class="num">18</span>/<span class="den">24</span></span> = ___) or just inline “18/24”. Ensure it’s clear.

7. Rational Operations Generator
	1.	Inputs: number of terms (usually 2 for simplicity), operation type (add/subtract), max size of fractions.
	2.	Generate expressions: For each problem, generate the specified number of fractions (ensuring denominators ≠ 0) and a random sign. For addition/subtraction, pick two fractions. Example: a/b + c/d. Ensure a/b and c/d are in simplest or not (doesn’t matter, result will be simplified anyway).
	3.	Compute answer (optional): The app might compute the resulting fraction (for an answer key or to ensure correctness), but on the worksheet only the expression is shown. When computing, find common denominator, sum/subtract numerators, then simplify the result by gcd. This step ensures the final answer is in canonical form ￼.
	4.	Output: Display “a/b + c/d = ___” using inline fraction format. For better readability, consider using smaller fonts for numerator/denominator or <sup>/<sub>.

8. Problem Display and Styling
	1.	HTML formatting: For uniform look, wrap each problem in a container element, e.g. <div class="problem"> ... </div>. Use CSS to add margins and align symbols. For example, use a fixed-width or monospaced font if vertical alignment is needed.
	2.	Layout grid: If many problems, consider laying them out in multiple columns or a grid for efficiency. CSS grid or flexbox can make two-column worksheets. Alternatively, just one problem per line is fine if not too many.
	3.	Footer/Header: Optionally include a small header/footer on the worksheet with title or date; ensure it’s printable.
	4.	Print view: Test by clicking Print. Adjust CSS so that only the .problems content is visible (hide all .controls or .button elements). See MDN on print styles for examples ￼ ￼.

9. Docker Container Configuration
	1.	Dockerfile creation: In the project root, create a Dockerfile (no extension). Use a simple base, for example:

FROM nginx:alpine
COPY . /usr/share/nginx/html

This uses the official Nginx image and copies all files into its web root ￼.

	2.	Port exposure: Nginx listens on port 80 by default. In the Dockerfile or at runtime, expose or publish port 80 so it can be accessed. (No need to explicitly EXPOSE in the Dockerfile unless desired.)
	3.	Testing image locally: Optionally, build the Docker image with docker build -t math-generator . and run with docker run -p 8080:80 math-generator. Then visit localhost:8080 to check the site works in a container.

10. GitHub Actions CI/CD
	1.	Workflow file: Create .github/workflows/deploy.yml. Use YAML to define a workflow triggered on push to main branch.
	2.	Steps:
	•	actions/checkout@v3 to get the code.
	•	docker/login-action@v2 with registry: ghcr.io, username: ${{ github.actor }}, and password: ${{ secrets.GITHUB_TOKEN }} to authenticate to GHCR.
	•	docker/build-push-action@v4 with context: . and push: true. Set tags: ghcr.io/${{ github.repository_owner }}/<repo-name>:latest. This builds the image using our Dockerfile and pushes it to GHCR ￼.
Example snippet:

steps:
  - uses: actions/checkout@v3
  - uses: docker/login-action@v2
    with:
      registry: ghcr.io
      username: ${{ github.repository_owner }}
      password: ${{ secrets.GITHUB_TOKEN }}
  - name: Build and push Docker image
    uses: docker/build-push-action@v4
    with:
      context: .
      push: true
      tags: ghcr.io/${{ github.repository_owner }}/math-worksheet-generator:latest


	3.	GHCR configuration: In your GitHub repository settings, ensure GitHub Packages (GHCR) is enabled. The ${{ secrets.GITHUB_TOKEN }} has write access to GHCR by default when used in Actions.
	4.	Versioning: You can extend the workflow to tag images on Git tags or versions, e.g. adding ${{ github.sha }} or version number to tags.

11. Final Testing and Validation
	1.	End-to-end test: After pushing code, verify that GitHub Actions runs successfully and the image appears under the repository’s Packages (GHCR).
	2.	Container run: Pull the image from GHCR (docker pull ghcr.io/<owner>/math-worksheet-generator:latest) and run it to ensure the app works as expected.
	3.	Cross-browser check: Test the web app in different browsers (Chrome, Firefox, Edge) to ensure print styling and dynamic behavior is consistent.
	4.	Print to PDF: Use the browser’s “Save as PDF” print option to check that the layout remains neat (no cutoff elements) and that multiple pages break appropriately.
