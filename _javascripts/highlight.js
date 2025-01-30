document$.subscribe(() => {
  document.querySelectorAll('.highlight').forEach((el) => {
    const code = el.querySelector('pre code');
    code.classList.add(...el.classList.value.split(' '));
  });

  // see https://highlightjs.readthedocs.io/en/latest/index.html
  hljs.configure({
    // see https://highlightjs.readthedocs.io/en/latest/supported-languages.html#supported-languages
    languages: ['js', 'ts', 'Bash'],
  });
  hljs.highlightAll();
});
