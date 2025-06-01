# Printable Math Worksheet Generator

# Idea

This static web app is designed for teachers, parents, and students to quickly generate customized math worksheets for practice. It focuses on core elementary topics – multiplication tables, multi-digit arithmetic, and working with fractions – allowing users to specify difficulty and problem parameters. Each worksheet is generated on the client side (no backend needed) and rendered in a clean, printable format. The goal is to provide an offline-friendly tool that produces endless random problem sets, supporting traditional practice (e.g. fill-in-the-blank equations) and reinforcing concepts like carrying and simplification. For example, it can create a sheet of multiplication table problems (e.g. “6 × 7 = ___”) or multi-digit addition problems (e.g. “324 + 478 = ___”) which are printed directly from the browser.

# Features

- Randomized problems: Generate a fresh set of math problems on each click, ensuring ample practice variety.
- Topic selection: Choose from multiple topics (see below), each with tailored problem generators.
- Custom difficulty: Adjust numeric ranges and enabling/disabling features (e.g. carrying in addition, exact division) to set difficulty.
- Control options: Use special constraints per topic – for instance, a “digital root” check for addition/subtraction to influence carry, or enforcing fractions reduce to canonical form.
- Print-ready layout: A “Print” button opens the browser print dialog. The app uses CSS @media print rules to hide buttons/controls and format problems cleanly on paper. Large fonts and margins ensure legibility.
- Self-contained and static: Built with plain HTML/CSS/JavaScript (no frameworks or server). All generation and formatting is done client-side.

# Topics

- Multiplication Table: Generate exercises from multiplication (times) tables. Users can specify the range of factors (e.g. 1–12) and number of problems. The app can output a blank multiplication chart for the student to fill in, or a list of random multiplication equations like “12 × 3 = ___” or “7 × 8 = ___”. This reinforces basic multiplication facts, which form a foundation of arithmetic. Controls may include choosing a fixed base number (e.g. practice only the 6-times table) or random pairs, and whether to display answers or leave blanks.
- Multi-digit Addition/Subtraction: Create problems that add or subtract larger numbers (e.g. 2- or 3-digit). The generator picks random addends/subtrahends. Users can toggle options like “no carrying” (to practice column addition without carryovers) or “allow borrow” for subtraction. The app can also incorporate digital root logic: it calculates the digital root (recursive digit sum) of the numbers to ensure a particular property or to check the sum. For example, setting a digital-root constraint can make some sums easier or harder (digit sums that avoid carrying). An example problem looks like “ 324 + 478 = ___ ” or “1005 – 789 = ___”.
- Multiplication/Division: Generate multi-digit multiplication or division problems. For multiplication, random factors (of specified digit lengths) are chosen to form problems like “ 23 × 47 = ___ ”. Options control whether to allow carry operations and the maximum number of digits. For division, the generator ensures integer results (if desired) by first choosing a divisor and a quotient, then forming the dividend (e.g. make 144 ÷ 12 = ___, ensuring 12×12=144). Controls include setting a maximum divisor, enforcing exact division, or including remainders. This supports practicing facts from the multiplication table in the reverse direction.
- Canonical Forms of Rational Numbers: Exercises focus on simplifying fractions. Each problem presents a fraction (e.g. “18/24”) and asks the student to reduce it to lowest terms. The generator creates fractions whose numerator and denominator share a common factor (so reduction is non-trivial). The goal is to teach canonical (irreducible) form: “Every rational number may be expressed in a unique way as an irreducible fraction where the numerator and denominator are coprime; this is called the canonical form of the rational number”. For example, the app might generate “Simplify 18/24” with the answer “3/4” after dividing both by their GCD. Controls can adjust the size of numbers and number of reduction steps (e.g. larger GCD for bigger numbers).
- Operations on Rational Numbers: These problems involve adding, subtracting (or optionally multiplying/dividing) fractions. For example: “ 3/4 + 5/6 = ___ ” or “ 7/9 – 2/5 = ___”. The generator creates pairs (or more) of random fractions and an operation. Often the denominators differ, so the student must find a common denominator and simplify. The resulting answer should again be given in canonical form. Controls include how many fractions to combine, whether to use improper fractions vs. mixed numbers, and limiting denominator size. This reinforces cross-multiplication and simplification skills.

Each topic’s output is a neatly formatted list or grid of problems (with blank answer lines). No solutions are shown on the worksheet (to allow it to serve as a test sheet). The user simply prints the page and provides it to students for practice.

# UX/UI Expectations

The user interface should be simple and intuitive:

- Topic selection: Provide a dropdown menu or tabs for the five topics above. When a topic is selected, display its specific options (e.g. number of digits, enabling carries).
- Controls: For each topic, have input fields (text/number inputs, sliders) or checkboxes to set parameters (e.g. “Number of Problems: 10”, “Digits per number: 3”, “Allow carry: Yes/No”). For fractions, an option could be “Ensure simplifiable fraction.”
- Generate button: A prominent button that, when clicked, calls the generator for the selected topic and displays the problems.
- Output area: A styled container (e.g. a bordered box or light background) where the problems appear. Use a clear, legible font and enough spacing. For arithmetic, problems might be shown one per line or in a table. For multiplication charts, a grid layout can be used.
- Print button: Opens the print dialog (`window.print()`). Implement print-specific CSS so that all controls, headers, and footers are hidden during printing. For example, using:
  ```css
  @media print { 
    button, .controls, nav { 
      display: none !important; 
    } 
  }
  ```
  to only show the problem list. Ensure the printed page has margins and consistent font sizes.

Overall, the UX should feel like filling out a form to get a worksheet. The style should be clean and uncluttered, emphasizing usability for educators and students.

# Control Mechanisms

Each topic will have special controls to adjust problem generation and difficulty:

- Multiplication Table: Option to select the maximum factor (e.g. up to 10 or 12), or a specific table (e.g. only 7s). Can include a “blank chart” mode versus randomized question mode. A possible control is the digital root of products (rarely used, but you could, for example, generate only products whose digit sum meets certain criteria).
- Addition/Subtraction: A key control is Digital Root (the repeated sum of digits). For instance, the user could choose sums that result in a given digital root, or simply use digital root internally to check addition for correctness. Another control is “no carry”: ensure each column of addition is below 10, or “no borrow” for subtraction. These shape the difficulty. You can also limit the maximum sum or difference (e.g. all sums under 1000).
- Multiplication/Division: Controls include the number of digits per factor/divisor, and whether to allow carrying in multiplication. For division, options include forcing exact division (so the quotient is an integer) versus allowing remainders. You might also allow a “long division style” format.
- Canonical Rational Forms: Control the size of numerator/denominator and how reducible they are. For instance, choose fractions that reduce by a large prime factor, or limit to only one step of simplification. Another idea is to ensure the denominator is positive.
- Rational Operations: Control the number of terms (two-term vs multi-term), whether negative fractions appear, or whether to display as proper fractions or mixed numbers. Also, require that the final result is simplified (already in canonical form).

In general, these mechanisms let the teacher fine-tune each worksheet’s difficulty and focus. The use of digital roots is one example control: the digital root of a sum or difference can be used as a built-in “checksum” for the problem, or as a way to limit which problems are generated. Other controls (like carrying) are implemented by conditioning the random number generation logic when assembling each problem.

# Tech Stack

- Frontend: Vanilla HTML/CSS/JavaScript. No frameworks are needed for this simple static app. ES6+ JavaScript can handle random problem generation and DOM updates.
- Styling: Modern CSS for layout (flexbox or grid) and responsive design. Use `@media print` rules for print-specific styling (hiding buttons, adjusting layout).
- Math logic: Custom JS functions for each topic generator. Optionally a small library (or just utility functions) for greatest common divisor (to simplify fractions) and computing digital roots.
- Container: A `Dockerfile` will bundle the static files into a container. We can use an official Nginx lightweight image and copy our site into it. This serves the HTML/CSS/JS via HTTP.
- CI/CD: GitHub Actions for automation. On each commit or tag, run a workflow that builds the Docker image and publishes it to GitHub Container Registry (GHCR). We will use the `docker/build-push-action` (v4) for building and pushing images. GHCR credentials (via GitHub token or PAT) are handled by the Actions environment.
- Registry: Host Docker images on GHCR (GitHub’s Container Registry). This keeps the project self-contained in GitHub’s ecosystem.

Overall, the stack is minimal: just static assets in a container. No databases or server-side code are required.

# Deployment

The project repository includes a `Dockerfile` that packages the app into a container. A simple example `Dockerfile` using Nginx is:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

This uses the Nginx base image to serve our static content.

We set up a GitHub Actions workflow (e.g. `.github/workflows/deploy.yml`) that triggers on pushes to the main branch. The workflow does the following:

- Check out code: Uses `actions/checkout` to get the repo.
- Log in to GHCR: Uses `docker/login-action` with `registry: ghcr.io` and GitHub-provided token.
- Build & Push image: Uses `docker/build-push-action` (v4) with `context: .` and tags like `ghcr.io/<owner>/<repo>:latest`. This builds the image from our `Dockerfile` and pushes it to GHCR.

With this setup, every time we update the code, a new Docker image is built and stored in GHCR. From there, the image can be deployed anywhere (for example, to a cloud provider or on GitHub Pages via a container). If not serving through a container, the static files could also be served via GitHub Pages directly, but using Docker/GHCR provides flexibility and versioning of the build.

Summary: This static app can be hosted on any web server. Users simply visit the page (or run the container) to access the generator. The Docker/GHCR pipeline automates building and makes sharing the final product easy.
