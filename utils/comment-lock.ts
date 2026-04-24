export const COMMENT_LOCK_START = '<!-- comment-lock:start -->';
export const COMMENT_LOCK_END = '<!-- comment-lock:end -->';

type CommentLockSegment = {
  kind: 'public' | 'hidden';
  content: string;
};

export type CommentLockPreviewMode = 'unlock' | 'disabled';

function normalizeMarkdown(markdown: string) {
  return markdown.replace(/\r\n/g, '\n');
}

function collectSegments(markdown: string) {
  const source = normalizeMarkdown(typeof markdown === 'string' ? markdown : '');
  const lines = source.split('\n');
  const segments: CommentLockSegment[] = [];
  let currentKind: CommentLockSegment['kind'] = 'public';
  let currentContent = '';

  const flush = () => {
    if (!currentContent) {
      return;
    }

    segments.push({
      kind: currentKind,
      content: currentContent,
    });
    currentContent = '';
  };

  lines.forEach((line, index) => {
    const lineWithBreak = index < lines.length - 1 ? `${line}\n` : line;
    const trimmed = line.trim();

    if (trimmed === COMMENT_LOCK_START) {
      flush();
      currentKind = 'hidden';
      return;
    }

    if (trimmed === COMMENT_LOCK_END) {
      flush();
      currentKind = 'public';
      return;
    }

    currentContent += lineWithBreak;
  });

  flush();

  return segments;
}

export function splitCommentLockedMarkdown(markdown: string) {
  const segments = collectSegments(markdown);
  const publicContent = segments
    .filter((segment) => segment.kind === 'public')
    .map((segment) => segment.content)
    .join('');
  const hiddenContent = segments
    .filter((segment) => segment.kind === 'hidden')
    .map((segment) => segment.content)
    .join('');

  return {
    publicContent,
    hiddenContent,
    hasHiddenContent: hiddenContent.trim().length > 0,
  };
}

export function stripCommentLockBlocks(markdown: string) {
  return splitCommentLockedMarkdown(markdown).publicContent;
}

export function replaceCommentLockBlocks(
  markdown: string,
  replacer: (hiddenContent: string, index: number) => string,
) {
  const segments = collectSegments(markdown);
  let hiddenIndex = 0;

  return segments
    .map((segment) => {
      if (segment.kind === 'public') {
        return segment.content;
      }

      const replacement = replacer(segment.content, hiddenIndex);
      hiddenIndex += 1;
      return replacement;
    })
    .join('');
}

export function buildCommentLockPreviewMarkdown(
  markdown: string,
  mode: CommentLockPreviewMode = 'unlock',
) {
  return replaceCommentLockBlocks(markdown, () => {
    if (mode === 'disabled') {
      return '\n> [评论锁定区块已隐藏]\n> 独立页不支持“评论后可见”，这段内容不会在公开页面展示。\n';
    }

    return '\n> [评论后可见]\n> 这段内容会在公开页面默认隐藏，读者提交评论后会立即解锁。\n';
  });
}
