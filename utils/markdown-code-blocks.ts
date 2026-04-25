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
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'LESS',
  json: 'JSON',
  md: 'Markdown',
  markdown: 'Markdown',
  py: 'Python',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  csharp: 'C#',
  'c#': 'C#',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  sql: 'SQL',
  shell: 'Shell',
  bash: 'Bash',
  sh: 'Shell',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  git: 'Git',
  diff: 'Diff',
  lua: 'Lua',
  r: 'R',
  swift: 'Swift',
  kotlin: 'Kotlin',
  dart: 'Dart',
};

function getLanguageFromClass(className: string): string {
  const match = className.match(/language-([\w+#]+)/i);
  if (!match) return '';
  const lang = match[1].toLowerCase();
  return LANG_DISPLAY_NAMES[lang] || lang.toUpperCase();
}

function getFileName(block: HTMLElement, code: HTMLElement): string {
  return block.dataset.file || code.dataset.file || block.title || code.title || '';
}

function countLines(code: HTMLElement): number {
  const text = code.textContent || '';
  return text ? text.replace(/\n$/, '').split('\n').length : 0;
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  return Promise.resolve();
}

function setButtonState(button: HTMLButtonElement, label: string, icon: string, state?: string): void {
  const labelEl = button.querySelector('.markdown-code-label');
  const iconEl = button.querySelector('.markdown-code-icon');
  if (labelEl) labelEl.textContent = label;
  if (iconEl) iconEl.innerHTML = icon;
  if (state) {
    button.dataset.state = state;
  } else {
    delete button.dataset.state;
  }
}

export function enhanceMarkdownCodeBlocks(container: HTMLElement): void {
  if (!container || typeof document === 'undefined') return;

  const preBlocks = container.querySelectorAll('pre');
  if (preBlocks.length === 0) return;

  preBlocks.forEach((pre) => {
    const preEl = pre as HTMLElement;

    if (preEl.dataset.enhanced === 'true') return;
    if (preEl.closest('.markdown-code-wrapper')) {
      preEl.dataset.enhanced = 'true';
      return;
    }

    const code = preEl.querySelector('code');
    if (!code) return;

    preEl.dataset.enhanced = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'markdown-code-wrapper';

    const toolbar = document.createElement('div');
    toolbar.className = 'markdown-code-toolbar';

    const info = document.createElement('div');
    info.className = 'markdown-code-info';

    const fileName = getFileName(preEl, code);
    if (fileName) {
      const fileTag = document.createElement('span');
      fileTag.className = 'markdown-code-filename';
      fileTag.textContent = fileName;
      info.appendChild(fileTag);
    } else {
      const lang = getLanguageFromClass(code.className);
      if (lang) {
        const langTag = document.createElement('span');
        langTag.className = 'markdown-code-lang';
        langTag.textContent = lang;
        info.appendChild(langTag);
      }
    }

    const lineCount = countLines(code as HTMLElement);
    const linesTag = document.createElement('span');
    linesTag.className = 'markdown-code-lines';
    linesTag.textContent = `${lineCount} 行`;
    info.appendChild(linesTag);

    const actions = document.createElement('div');
    actions.className = 'markdown-code-actions';

    let isWrapped = false;
    const wrapBtn = document.createElement('button');
    wrapBtn.type = 'button';
    wrapBtn.className = 'markdown-code-btn markdown-code-wrap';
    wrapBtn.title = '切换换行';
    wrapBtn.innerHTML = `<span class="markdown-code-icon">${WRAP_ICON_OFF}</span>`;
    wrapBtn.addEventListener('click', () => {
      isWrapped = !isWrapped;
      preEl.style.whiteSpace = isWrapped ? 'pre-wrap' : 'pre';
      preEl.style.overflowX = isWrapped ? 'hidden' : 'auto';
      const iconEl = wrapBtn.querySelector('.markdown-code-icon');
      if (iconEl) iconEl.innerHTML = isWrapped ? WRAP_ICON_ON : WRAP_ICON_OFF;
      wrapBtn.dataset.active = isWrapped ? 'true' : '';
    });

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'markdown-code-btn markdown-code-copy';
    copyBtn.title = '复制代码';
    copyBtn.innerHTML = `<span class="markdown-code-icon">${COPY_ICON}</span><span class="markdown-code-label">复制</span>`;
    copyBtn.addEventListener('click', async () => {
      try {
        await copyToClipboard(code.textContent || '');
        setButtonState(copyBtn, '已复制', CHECK_ICON, 'success');
        copyBtn.classList.add('markdown-code-copied');
        setTimeout(() => copyBtn.classList.remove('markdown-code-copied'), 400);
      } catch {
        setButtonState(copyBtn, '失败', WRAP_ICON_ON, 'error');
      }
      setTimeout(() => setButtonState(copyBtn, '复制', COPY_ICON), 1500);
    });

    actions.appendChild(wrapBtn);
    actions.appendChild(copyBtn);

    toolbar.appendChild(info);
    toolbar.appendChild(actions);

    preEl.parentNode?.insertBefore(wrapper, preEl);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(preEl);
  });
}
