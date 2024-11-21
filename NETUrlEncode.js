const symbols = [
  '-',
  '_',
  '.',
  '!',
  '~',
  '*',
  '(',
  ')',
  ' ',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '=',
  '+',
  ';',
  '?',
  '/',
  '\\',
  '>',
  '<',
  '`',
  '[',
  ']',
  '{',
  '}',
  ':',
  "'",
  '"',
  ',',
  '|'
]
symbols.forEach(symbol => {
  console.log(encodeURIComponent(symbol))
})
