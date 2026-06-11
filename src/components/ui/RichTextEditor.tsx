import React, { useRef } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function RichTextEditor({ value, onChange, placeholder, rows = 4 }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (tag: string, endTag?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    let newText = '';
    let newCursorPos = 0;

    if (endTag) {
      // Wrap selected text
      newText = `${before}${tag}${selectedText}${endTag}${after}`;
      newCursorPos = start + tag.length + selectedText.length + endTag.length;
    } else {
      // Insert tag before selected text (or per line for lists)
      if (tag === '<ul>' || tag === '<ol>') {
        const lines = selectedText ? selectedText.split('\n') : ['List Item'];
        const listItems = lines.map(line => `  <li>${line}</li>`).join('\n');
        const listWrapper = `${tag}\n${listItems}\n${tag.replace('<', '</')}`;
        newText = `${before}${listWrapper}${after}`;
        newCursorPos = start + listWrapper.length;
      } else {
        newText = `${before}${tag}${after}`;
        newCursorPos = start + tag.length;
      }
    }

    onChange(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-surface-secondary">
      <div className="flex items-center gap-1 border-b border-border p-2 bg-surface">
        <button
          type="button"
          onClick={() => insertTag('<b>', '</b>')}
          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-surface-secondary rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<i>', '</i>')}
          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-surface-secondary rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button
          type="button"
          onClick={() => insertTag('<ul>')}
          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-surface-secondary rounded transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<ol>')}
          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-surface-secondary rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent p-3 text-foreground focus:outline-none resize-y min-h-[100px] font-mono text-sm"
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}
