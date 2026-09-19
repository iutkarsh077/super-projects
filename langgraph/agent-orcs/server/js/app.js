document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('markdownInput');
  const preview = document.getElementById('preview');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveStatus = document.getElementById('saveStatus');
  const toolbarButtons = document.querySelectorAll('.toolbar-btn');

  const STORAGE_KEY = 'markdown-editor-content';
  const DEFAULT_CONTENT = `# Markdown Editor\n\nStart writing **Markdown** here.\n\n## Features\n- Live preview\n- Autosave\n- Toolbar shortcuts\n\n> This is a blockquote.\n\n\
\
\
\
\
\
\
\
\
\
\
\
\
\
\
\
\
\
\
`; 

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  function renderMarkdown() {
    preview.innerHTML = marked.parse(editor.value || '');
  }

  function updateStats() {
    const text = editor.value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = editor.value.length;
    wordCount.textContent = words;
    charCount.textContent = chars;
  }

  function saveContent() {
    localStorage.setItem(STORAGE_KEY, editor.value);
    saveStatus.textContent = 'Saved locally';
  }

  function notify(message) {
    saveStatus.textContent = message;
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => {
      saveStatus.textContent = 'Saved locally';
    }, 1800);
  }

  function updateAll() {
    renderMarkdown();
    updateStats();
    saveContent();
  }

  function insertText(before, after = '', placeholder = 'text') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || placeholder;
    const insertion = `${before}${selected}${after}`;
    editor.setRangeText(insertion, start, end, 'end');
    editor.focus();
    const cursorStart = start + before.length;
    const cursorEnd = cursorStart + selected.length;
    editor.setSelectionRange(cursorStart, cursorEnd);
    updateAll();
  }

  function insertBlock(prefix, suffix = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || 'content';
    const block = `${prefix}${selected}${suffix}`;
    editor.setRangeText(block, start, end, 'end');
    editor.focus();
    editor.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    updateAll();
  }

  function insertLinePrefix(prefix) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || 'item';
    const lines = selected.split('\n').map(line => `${prefix}${line}`);
    const text = lines.join('\n');
    editor.setRangeText(text, start, end, 'end');
    editor.focus();
    editor.setSelectionRange(start, start + text.length);
    updateAll();
  }

  function applyAction(action) {
    switch (action) {
      case 'heading1':
        insertLinePrefix('# ');
        break;
      case 'heading2':
        insertLinePrefix('## ');
        break;
      case 'bold':
        insertText('**', '**', 'bold text');
        break;
      case 'italic':
        insertText('*', '*', 'italic text');
        break;
      case 'link':
        insertText('[', '](https://example.com)', 'link text');
        break;
      case 'image':
        insertText('![', '](https://picsum.photos/800/400)', 'alt text');
        break;
      case 'unordered-list':
        insertLinePrefix('- ');
        break;
      case 'ordered-list':
        insertLinePrefix('1. ');
        break;
      case 'code-block':
        insertBlock('```\n', '\n```');
        break;
      case 'blockquote':
        insertLinePrefix('> ');
        break;
      default:
        break;
    }
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(editor.value);
      notify('Markdown copied');
    } catch {
      editor.select();
      document.execCommand('copy');
      editor.setSelectionRange(editor.value.length, editor.value.length);
      notify('Markdown copied');
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([editor.value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'markdown-note.md';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify('Download started');
  }

  function clearEditor() {
    const confirmed = window.confirm('Clear the editor? This will remove all current content.');
    if (!confirmed) return;
    editor.value = '';
    updateAll();
    notify('Editor cleared');
  }

  toolbarButtons.forEach(button => {
    button.addEventListener('click', () => applyAction(button.dataset.action));
  });

  editor.addEventListener('input', updateAll);
  copyBtn.addEventListener('click', copyMarkdown);
  downloadBtn.addEventListener('click', downloadMarkdown);
  clearBtn.addEventListener('click', clearEditor);

  const savedContent = localStorage.getItem(STORAGE_KEY);
  editor.value = savedContent ?? DEFAULT_CONTENT;
  updateAll();
});
