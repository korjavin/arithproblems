1.  **Analyze current code**: `script.js` has multiple places where `DOM.problemsContainer.innerHTML` is updated twice in succession:
    `DOM.problemsContainer.innerHTML = ...` followed by `if (...) { DOM.problemsContainer.innerHTML += ... }`.
    This causes the browser to parse the HTML string and construct the DOM twice, which is inefficient.
2.  **Plan modification**:
    Change the code to use a temporary `html` variable.
    ```javascript
    let html = `...`;
    if (...) {
        html += `...`;
    }
    DOM.problemsContainer.innerHTML = html;
    ```
3.  **Files to modify**: `script.js`.
4.  **Verification**:
    - Verify with `grep` that `innerHTML +=` usage in `script.js` is replaced.
    - Run `npm test` to ensure we haven't broken any UI logic tests.
5.  **Pre-commit steps**:
    - "Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done."
6.  **Submit PR**
