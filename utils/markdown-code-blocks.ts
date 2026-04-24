const COPY_ICON = `
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M0 6.75C0 5.784 0.784 5 1.75 5h6.5C9.216 5 10 5.784 10 6.75v6.5A1.75 1.75 0 0 1 8.25 15h-6.5A1.75 1.75 0 0 1 0 13.25Z"></path>
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

function inferCodeBlockLanguage(code: HTMLElement) {
  const match = code.className.match(/language-([\w-]+)/i);
  if (!match) {
    return 'TEXT';
  }

  return match[1].replace(/[-_]+/g, ' ').toUpperCase();
}

function setButtonState(button: HTMLButtonElement, label: string, iconMarkup: string, state?: string) {
  const labelElement = button.querySelector<HTMLElement>('.markdown-copy-button__label');
  const iconElement = button.querySelector<HTMLElement>('.markdown-copy-button__icon');

  if (labelElement) {
    labelElement.textContent = label;
  }

  if (iconElement) {
    iconElement.innerHTML = iconMarkup;
  }

  if (state) {
    button.dataset.state = state;
    return;
  }

  delete button.dataset.state;
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

  try {
    document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}

export function enhanceMarkdownCodeBlocks(root: HTMLElement) {
  const blocks = root.querySelectorAll<HTMLElement>('pre');

  for (const block of blocks) {
    if (block.dataset.copyEnhanced === 'true') {
      continue;
    }

    const code = block.querySelector<HTMLElement>('code');
    if (!code) {
      continue;
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'markdown-code-toolbar';

    const language = document.createElement('span');
    language.className = 'markdown-code-language';
    language.textContent = inferCodeBlockLanguage(code);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'markdown-copy-button';
    button.setAttribute('aria-label', 'Copy code');
    button.innerHTML = `
      <span class="markdown-copy-button__icon">${COPY_ICON}</span>
      <span class="markdown-copy-button__label">Copy</span>
    `;

    button.addEventListener('click', async () => {
      try {
        await copyTextToClipboard(code.textContent || '');
        setButtonState(button, 'Copied!', CHECK_ICON, 'success');
      } catch {
        setButtonState(button, 'Failed', ERROR_ICON, 'error');
      }

      window.setTimeout(() => {
        setButtonState(button, 'Copy', COPY_ICON);
      }, 1500);
    });

    toolbar.append(language, button);
    block.prepend(toolbar);
    block.dataset.copyEnhanced = 'true';
  }
}
