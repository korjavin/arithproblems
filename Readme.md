## Idea

I need a way to generate simple math problems for selected topics as:
- multiplication table
- addition and substraction of multiple digits numbers
- multiplication and division
- canonical forms of rational numbers, like   15/7= 2(1/7)
- addition of rational numbers
- multiplication of rational numbers
- more to be added

## UX

I expect that I have a separate html/js page for each topic listed above. Those pages should be listed in menu or combobox in the page header, so I can switch easily.

Generator page should start with a html form that allows to specify parameters, and button to generate problems sheet.
For example:
 Topic: Addition/substraction of multiple digits numbers
 - Number of max digits : 5
 - Number of exercises: 10
 - Button: generate

 Or
  Topic: canonical forms for rationals
  - Number of exercises: 10
  - Button: generate

  After providing parameters and clicking on button "generate" i expect that print-friendly page be generated with math problem sheets and controls (see below about controls).
  By print-friendly I mean, that I am going to print this page on paper and distribute them to students, so there are some requirements:
  - Content should fit exactly one A4 page, that should be enforced by css
  - It shouldn't containt parameters form or anything else, just topic, exercises, and controls
  - exercises should be evenly distributed on the page
  - there must be enough space under or on the right of exercises that students can use this space for writing answers and making calculations


  ## Controls

  For every generated exercise page there must be control implemented.
  Some mechanizm that can give the student a way to self-check.

  For example, for addition or substraction there should be a calculated digital root control sum. So student can calculate and compare it and be sure that all the exercises were solved correctly.
  
  Control area on printed page should contain very brief explanation of that.
  
  
  ## Tech stack
  
  App should be done purely in html,css and js, and should have no backend at all. 
  Usage of any libs or frameworks is acceptable.
  
  There should be github actions script that 
