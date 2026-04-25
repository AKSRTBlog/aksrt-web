const COPY_ICON = `
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h6.5C9.216 5 10 5.784 10 6.75v6.5A1.75 1.75 0 0 1 8.25 15h-6.5A1.75 1.75 0 0 1 0 13.25Z"></path>
    <path d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5C14.216 1 15 1.784 15 2.75v6.5A1.75 1.75 0 0 1 13.25 11H11V6.75A2.75 2.75 0 0 0 8.25 4H5Z"></path>
  </svg>
`;

const CHECK_ICON = `
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L2.22 7.28a.75.75 0 1 1 1.06-1.06L7 9.94l5.72-5.72a.75.75 0 0 1 1.06 0Z"></path>
  </svg>
`;

const ERROR_ICON = `
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
  </svg>
`;

const WRAP_ICON_ON = `
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M13.23 3.57a.75.75 0 0 1 0 1.06 1.06L4.56 14.36a.75.75 0 0 1-1.06-1.06zM2.75 5.5a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-4.5v-1.5a.75.75 0 0 0-.75-.75zm0 4a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-4.5v-1.5a.75.75 0 0 0-.75-.75z"></path>
  </svg>
`;

const WRAP_ICON_OFF = `
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M1.75 5.5a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5zm0 4a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5z"></path>
  </svg>
`;

const LANG_DISPLAY_NAMES: Record<string, string> = {
  abap: 'ABAP',
  apex: 'Apex',
  azcli: 'Azure CLI',
  bat: 'Batch',
  bicep: 'Bicep',
  c: 'C',
  clike: 'C-style',
  clojure: 'Clojure',
  coffeescript: 'CoffeeScript',
  cpp: 'C++',
  csharp: 'C#',
  css: 'CSS',
  dart: 'Dart',
  dockerfile: 'Dockerfile',
  ebnf: 'EBNF',
  elixir: 'Elixir',
  flow: 'Flow',
  fs: 'F#',
  go: 'Go',
  graphql: 'GraphQL',
  handlebars: 'Handlebars',
  hcl: 'HCL',
  html: 'HTML',
  ini: 'INI',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  jssm: 'JSSM',
  jsx: 'JSX',
  julia: 'Julia',
  kotlin: 'Kotlin',
  latex: 'LaTeX',
  less: 'LESS',
  lisp: 'Lisp',
  lua: 'Lua',
  m: 'M',
  makefile: 'Makefile',
  markdown: 'Markdown',
  md: 'Markdown',
  mermaid: 'Mermaid',
  mizar: 'Mizar',
  objective: 'Objective-C',
  objectivec: 'Objective-C',
  ocaml: 'OCaml',
  pascal: 'Pascal',
  perl: 'Perl',
  php: 'PHP',
  postiisscript: 'PostScript',
  powerquery: 'Power Query',
  powershell: 'PowerShell',
  pug: 'Pug',
  python: 'Python',
  r: 'R',
  razor: 'Razor',
  redis: 'Redis',
  redlock: 'Redlock',
  rest: 'REST',
  ruby: 'Ruby',
  rust: 'Rust',
  sb: 'SB',
  scala: 'Scala',
  scheme: 'Scheme',
  scss: 'SCSS',
  sh: 'Shell',
  shell: 'Shell',
  sql: 'SQL',
  st: 'Structured Text',
  swift: 'Swift',
  systemverilog: 'SystemVerilog',
  tcl: 'Tcl',
  toml: 'TOML',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  vb: 'VB.NET',
  xml: 'XML',
  xquery: 'XQuery',
  yaml: 'YAML',
  yml: 'YAML',
};

function getCodeBlockFileName(block: HTMLElement, code: HTMLElement): string | null {
  const fromData = block.dataset.file ?? code.dataset.file ?? null;
  if (fromData) return fromData;
  const fromTitle = (block.title || code.title || '').trim();
  return fromTitle || null;
}

function inferCodeBlockLanguage(code: HTMLElement): string {
  const match = code.className.match(/language-([\w-]+)/i);
  if (!match) return 'TEXT';
  const raw = match[1].toLowerCase();
  return LANG_DISPLAY_NAMES[raw] ?? raw.replace(/[-_]+/g, ' ').toUpperCase();
}

function countCodeLines(code: HTMLElement): number {
  const text = code.textContent || '';
  if (!text.trim()) return 0;
  return text.replace(/\n$/, '').split('\n').length;
}

function setButtonState(button: HTMLButtonElement, label: string, iconMarkup: string, state?: string) {
  const labelElement = button.querySelector<HTMLElement>('.markdown-copy-button__label');
  const iconElement = button.querySelector<HTMLElement>('.markdown-copy-button__icon');
  if (labelElement) labelElement.textContent = label;
  if (iconElement) iconElement.innerHTML = iconMarkup;
  if (state) {
    button.dataset.state = state;
  } else {
    delete button.dataset.state;
  }
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); }
  finally { textarea.remove(); }
}

export function enhanceMarkdownCodeBlocks(root: HTMLElement) {
  const blocks = root.querySelectorAll<HTMLElement>('pre');

  for (const block of blocks) {
    if (block.dataset.copyEnhanced === 'true') continue;
    if (block.closest('.markdown-code-block')) {
      block.dataset.copyEnhanced = 'true';
      continue;
    }

    const code = block.querySelector<HTMLElement>('code');
    if (!code) continue;

    const toolbar = document.createElement('div');
    toolbar.className = 'markdown-code-toolbar';

    /* ---- left: dots + file name / language + lines ---- */
    const meta = document.createElement('div');
    meta.className = 'markdown-code-meta';

    const dots = document.createElement('span');
    dots.className = 'markdown-code-dots';
    dots.setAttribute('aria-hidden', 'true');

    const fileName = getCodeBlockFileName(block, code);
    if (fileName) {
      const fileTag = document.createElement('span');
      fileTag.className = 'markdown-code-filename';
      fileTag.textContent = fileName;
      meta.append(dots, fileTag);
    } else {
      const language = document.createElement('span');
      language.className = 'markdown-code-language';
      language.textContent = inferCodeBlockLanguage(code);
      meta.append(dots, language);
    }

    const lineCount = countCodeLines(code);
    const lines = document.createElement('span');
    lines.className = 'markdown-code-lines';
    lines.textContent = lineCount <= 1 ? '1 line' : `${lineCount} lines`;
    meta.appendChild(lines);

    /* ---- right: wrap toggle + copy ---- */
    const actions = document.createElement('div');
    actions.className = 'markdown-code-actions';

    const wrapBtn = document.createElement('button');
    wrapBtn.type = 'button';
    wrapBtn.className = 'markdown-wrap-button';
    wrapBtn.setAttribute('aria-label', 'Toggle line wrapping');
    wrapBtn.innerHTML = `
      <span class="markdown-wrap-button__icon">${WRAP_ICON_OFF}</span>
      <span class="markdown-wrap-button__label">Wrap</span>
    `;

    let isWrapped = false;
    wrapBtn.addEventListener('click', () => {
      isWrapped = !isWrapped;
      block.style.whiteSpace = isWrapped ? 'pre-wrap' : 'pre';
      block.style.overflowX = isWrapped ? 'hidden' : 'auto';
      const iconEl = wrapBtn.querySelector('.markdown-wrap-button__icon');
      if (iconEl) iconEl.innerHTML = isWrapped ? WRAP_ICON_ON : WRAP_ICON_OFF;
      wrapBtn.dataset.active = isWrapped ? 'true' : '';
    });

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'markdown-copy-button';
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.innerHTML = `
      <span class="markdown-copy-button__icon">${COPY_ICON}</span>
      <span class="markdown-copy-button__label">Copy</span>
    `;

    copyBtn.addEventListener('click', async () => {
      try {
        await copyTextToClipboard(code.textContent || '');
        setButtonState(copyBtn, 'Copied!', CHECK_ICON, 'success');
        copyBtn.classList.add('markdown-copy-button--pop');
        setTimeout(() => copyBtn.classList.remove('markdown-copy-button--pop'), 400);
      } catch {
        setButtonState(copyBtn, 'Failed', ERROR_ICON, 'error');
      }
      setTimeout(() => setButtonState(copyBtn, 'Copy', COPY_ICON), 1500);
    });

    actions.append(wrapBtn, copyBtn);
    toolbar.append(meta, actions);

    const wrapper = document.createElement('div');
    wrapper.className = 'markdown-code-block';
    block.parentNode?.insertBefore(wrapper, block);
    wrapper.append(toolbar, block);
    block.dataset.copyEnhanced = 'true';
  }
}
