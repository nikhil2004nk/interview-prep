import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
  Minus,
  Palette,
  Highlighter,
  ChevronDown,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  disabled,
  title,
  children,
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    title={title}
    className={`p-1 rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-850/60 border border-transparent'
    }`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-5 bg-slate-800/80 mx-0.5 shrink-0" />
);

// Curated colors for the palette
const TEXT_COLORS = [
  { name: 'Default', color: '' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Teal', color: '#14b8a6' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'White', color: '#f1f5f9' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: '' },
  { name: 'Purple', color: '#7c3aed30' },
  { name: 'Pink', color: '#ec489930' },
  { name: 'Red', color: '#ef444430' },
  { name: 'Yellow', color: '#eab30830' },
  { name: 'Green', color: '#22c55e30' },
  { name: 'Blue', color: '#3b82f630' },
];

interface ColorPickerProps {
  colors: { name: string; color: string }[];
  activeColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
  label: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, activeColor, onSelect, onClose, label }) => (
  <div
    className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-60 p-2 min-w-[160px] backdrop-blur-md"
    onMouseDown={(e) => e.preventDefault()}
  >
    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1 pb-1.5">{label}</div>
    <div className="grid grid-cols-6 gap-1">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(c.color);
            onClose();
          }}
          title={c.name}
          className={`w-6 h-6 rounded-md border transition-all cursor-pointer hover:scale-110 ${
            activeColor === c.color
              ? 'border-primary-400 ring-1 ring-primary-400/50'
              : 'border-slate-700 hover:border-slate-500'
          }`}
          style={{
            backgroundColor: c.color || 'transparent',
            ...((!c.color) ? { background: 'linear-gradient(135deg, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%)' } : {}),
          }}
        />
      ))}
    </div>
  </div>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing...',
}) => {
  const isInternalUpdate = useRef(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (textColorRef.current && !textColorRef.current.contains(e.target as Node)) {
        setShowTextColor(false);
      }
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        setShowHighlight(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-editor-content focus:outline-none',
        style: 'min-height: 120px;',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, content]);

  const forceUpdate = useCallback(() => {}, []);
  useEffect(() => {
    if (!editor) return;
    editor.on('selectionUpdate', forceUpdate);
    editor.on('transaction', forceUpdate);
    return () => {
      editor.off('selectionUpdate', forceUpdate);
      editor.off('transaction', forceUpdate);
    };
  }, [editor, forceUpdate]);

  if (!editor) return null;

  const currentTextColor = editor.getAttributes('textStyle').color || '';
  const currentHighlight = editor.getAttributes('highlight').color || '';

  return (
    <div className="flex-1 flex flex-col min-h-0 border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/30">
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-slate-800/60 bg-slate-900/40 shrink-0">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text Color */}
          <div className="relative" ref={textColorRef}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={() => { setShowTextColor(!showTextColor); setShowHighlight(false); }}
              title="Text Color"
              className={`flex items-center gap-0.5 p-1 rounded-md transition-all cursor-pointer border ${
                currentTextColor
                  ? 'border-primary-500/30 bg-primary-600/10'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-850/60'
              }`}
            >
              <Palette size={14} style={{ color: currentTextColor || undefined }} />
              <ChevronDown size={10} className="text-slate-600" />
            </button>
            {showTextColor && (
              <ColorPicker
                colors={TEXT_COLORS}
                activeColor={currentTextColor}
                onSelect={(color) => {
                  if (color) {
                    editor.chain().focus().setColor(color).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
                onClose={() => setShowTextColor(false)}
                label="Text Color"
              />
            )}
          </div>

          {/* Highlight */}
          <div className="relative" ref={highlightRef}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={() => { setShowHighlight(!showHighlight); setShowTextColor(false); }}
              title="Highlight"
              className={`flex items-center gap-0.5 p-1 rounded-md transition-all cursor-pointer border ${
                currentHighlight
                  ? 'border-primary-500/30 bg-primary-600/10'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-850/60'
              }`}
            >
              <Highlighter size={14} style={{ color: currentHighlight ? currentHighlight.replace('30', 'ff') : undefined }} />
              <ChevronDown size={10} className="text-slate-600" />
            </button>
            {showHighlight && (
              <ColorPicker
                colors={HIGHLIGHT_COLORS}
                activeColor={currentHighlight}
                onSelect={(color) => {
                  if (color) {
                    editor.chain().focus().toggleHighlight({ color }).run();
                  } else {
                    editor.chain().focus().unsetHighlight().run();
                  }
                }}
                onClose={() => setShowHighlight(false)}
                label="Highlight"
              />
            )}
          </div>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo size={14} />
          </ToolbarButton>
        </div>
      )}

      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[120px] px-3 py-2 custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
