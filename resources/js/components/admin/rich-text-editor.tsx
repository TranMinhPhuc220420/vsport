import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Typography } from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useId, useRef, useState } from 'react';
import ResizableImage from 'tiptap-extension-resize-image';

import { uploadRichtextImage } from '@/lib/admin-upload';
import { plainTextFromHtml, sanitizeHtml } from '@/lib/richtext';
import { cn } from '@/lib/utils';

import './rich-text-editor.css';

const COLORS = [
    '#000000',
    '#374151',
    '#6B7280',
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#ffffff',
];

const HIGHLIGHTS = [
    '#FEF08A',
    '#BBF7D0',
    '#BAE6FD',
    '#DDD6FE',
    '#FCA5A5',
    '#FED7AA',
    '#E5E7EB',
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type RichTextEditorProps = {
    id?: string;
    label?: string;
    value: string | null;
    onChange: (html: string | null) => void;
    onTextChange?: (text: string) => void;
    placeholder?: string;
    error?: string;
    readOnly?: boolean;
    minHeight?: string;
};

type HeadingLevel = 1 | 2 | 3 | 4;

function htmlForCompare(html: string): string {
    return sanitizeHtml(html);
}

export function RichTextEditor({
    id,
    label,
    value,
    onChange,
    onTextChange,
    placeholder = 'Start writing…',
    error,
    readOnly = false,
    minHeight = '12rem',
}: RichTextEditorProps) {
    const fallbackId = useId();
    const resolvedId = id ?? fallbackId;
    const errorId = `${resolvedId}-error`;
    const emitTimerRef = useRef<number | null>(null);
    const [showColors, setShowColors] = useState(false);
    const [showHighlights, setShowHighlights] = useState(false);
    const [tablePopover, setTablePopover] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [imageUploading, setImageUploading] = useState(false);

    const scheduleEmit = (html: string) => {
        if (emitTimerRef.current) {
            window.clearTimeout(emitTimerRef.current);
        }

        emitTimerRef.current = window.setTimeout(() => {
            const safe = sanitizeHtml(html);
            onChange(safe || null);
            onTextChange?.(plainTextFromHtml(safe));
        }, 150);
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Typography,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            ResizableImage.configure({ inline: false, allowBase64: false }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: 'rt-content',
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            scheduleEmit(currentEditor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const next = String(value || '');

        if (htmlForCompare(editor.getHTML()) !== htmlForCompare(next)) {
            editor.commands.setContent(next || '', { emitUpdate: false });
        }
    }, [editor, value]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.setEditable(!readOnly);
    }, [editor, readOnly]);

    const insertImageFile = async () => {
        if (!editor || readOnly || imageUploading) {
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/gif,image/webp';
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];

            if (!file) {
                return;
            }

            if (file.size > MAX_IMAGE_BYTES) {
                window.alert('Image must be 2 MB or smaller.');

                return;
            }

            setImageUploading(true);

            try {
                const url = await uploadRichtextImage(file);
                editor.chain().focus().setImage({ src: url }).run();
            } catch (uploadError) {
                const message =
                    uploadError instanceof Error
                        ? uploadError.message
                        : 'Image upload failed.';
                window.alert(message);
            } finally {
                setImageUploading(false);
            }
        };
    };

    const insertImageUrl = () => {
        if (!editor || readOnly) {
            return;
        }

        const src = window.prompt('Image URL');

        if (!src?.trim()) {
            return;
        }

        editor.chain().focus().setImage({ src: src.trim() }).run();
    };

    const toggleLink = () => {
        if (!editor) {
            return;
        }

        const previous = editor.getAttributes('link')?.href || '';
        const href = window.prompt('Link URL', previous);

        if (href === null) {
            return;
        }

        if (href.trim() === '') {
            editor.chain().focus().unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: href.trim() })
            .run();
    };

    const insertTable = () => {
        editor
            ?.chain()
            .focus()
            .insertTable({
                rows: tableRows,
                cols: tableCols,
                withHeaderRow: true,
            })
            .run();
        setTablePopover(false);
    };

    const setColor = (color: string) => {
        editor?.chain().focus().setColor(color).run();
        setShowColors(false);
    };

    const setHighlight = (color: string) => {
        editor?.chain().focus().toggleHighlight({ color }).run();
        setShowHighlights(false);
    };

    return (
        <div className="rt-wrapper space-y-1">
            {label ? (
                <label
                    htmlFor={resolvedId}
                    className="text-admin-secondary block text-sm font-medium"
                >
                    {label}
                </label>
            ) : null}

            <div
                className={cn('rt-shell', {
                    'rt-shell--error': Boolean(error),
                    'rt-shell--readonly': readOnly,
                })}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? errorId : undefined}
            >
                {!readOnly && editor ? (
                    <div className="rt-toolbar">
                        <div className="rt-group">
                            <button
                                type="button"
                                title="Undo"
                                onClick={() =>
                                    editor.chain().focus().undo().run()
                                }
                            >
                                ↩
                            </button>
                            <button
                                type="button"
                                title="Redo"
                                onClick={() =>
                                    editor.chain().focus().redo().run()
                                }
                            >
                                ↪
                            </button>
                        </div>

                        <div className="rt-group">
                            <select
                                className="rt-select"
                                defaultValue="p"
                                onChange={(event) => {
                                    const level = event.target.value;

                                    if (level === 'p') {
                                        editor
                                            .chain()
                                            .focus()
                                            .setParagraph()
                                            .run();
                                    } else {
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleHeading({
                                                level: Number(
                                                    level,
                                                ) as HeadingLevel,
                                            })
                                            .run();
                                    }
                                }}
                            >
                                <option value="p">Paragraph</option>
                                <option value="1">Heading 1</option>
                                <option value="2">Heading 2</option>
                                <option value="3">Heading 3</option>
                                <option value="4">Heading 4</option>
                            </select>
                        </div>

                        <div className="rt-group">
                            <button
                                type="button"
                                title="Bold"
                                className={
                                    editor.isActive('bold') ? 'active' : ''
                                }
                                onClick={() =>
                                    editor.chain().focus().toggleBold().run()
                                }
                            >
                                <b>B</b>
                            </button>
                            <button
                                type="button"
                                title="Italic"
                                className={
                                    editor.isActive('italic') ? 'active' : ''
                                }
                                onClick={() =>
                                    editor.chain().focus().toggleItalic().run()
                                }
                            >
                                <i>I</i>
                            </button>
                            <button
                                type="button"
                                title="Underline"
                                className={
                                    editor.isActive('underline') ? 'active' : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleUnderline()
                                        .run()
                                }
                            >
                                <u>U</u>
                            </button>
                            <button
                                type="button"
                                title="Strike"
                                className={
                                    editor.isActive('strike') ? 'active' : ''
                                }
                                onClick={() =>
                                    editor.chain().focus().toggleStrike().run()
                                }
                            >
                                <s>S</s>
                            </button>
                            <button
                                type="button"
                                title="Code"
                                className={
                                    editor.isActive('code') ? 'active' : ''
                                }
                                onClick={() =>
                                    editor.chain().focus().toggleCode().run()
                                }
                            >
                                {'{ }'}
                            </button>
                        </div>

                        <div className="rt-group rt-popover-anchor">
                            <button
                                type="button"
                                title="Text color"
                                className="rt-color-btn"
                                style={{
                                    borderBottom: `3px solid ${
                                        editor.getAttributes('textStyle')
                                            ?.color || '#000'
                                    }`,
                                }}
                                onClick={() => {
                                    setShowColors((current) => !current);
                                    setShowHighlights(false);
                                }}
                            >
                                A
                            </button>
                            {showColors ? (
                                <div className="rt-color-palette">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="rt-swatch"
                                            style={{ background: color }}
                                            onClick={() => setColor(color)}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        className="rt-unset"
                                        onClick={() => {
                                            editor
                                                .chain()
                                                .focus()
                                                .unsetColor()
                                                .run();
                                            setShowColors(false);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="rt-group rt-popover-anchor">
                            <button
                                type="button"
                                title="Highlight"
                                className="rt-color-btn"
                                style={{ borderBottom: '3px solid #FEF08A' }}
                                onClick={() => {
                                    setShowHighlights((current) => !current);
                                    setShowColors(false);
                                }}
                            >
                                ✦
                            </button>
                            {showHighlights ? (
                                <div className="rt-color-palette">
                                    {HIGHLIGHTS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="rt-swatch"
                                            style={{ background: color }}
                                            onClick={() => setHighlight(color)}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        className="rt-unset"
                                        onClick={() => {
                                            editor
                                                .chain()
                                                .focus()
                                                .unsetHighlight()
                                                .run();
                                            setShowHighlights(false);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="rt-group">
                            <button
                                type="button"
                                title="Align left"
                                className={
                                    editor.isActive({ textAlign: 'left' })
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('left')
                                        .run()
                                }
                            >
                                ⬤⬤
                            </button>
                            <button
                                type="button"
                                title="Align center"
                                className={
                                    editor.isActive({ textAlign: 'center' })
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('center')
                                        .run()
                                }
                            >
                                ◉
                            </button>
                            <button
                                type="button"
                                title="Align right"
                                className={
                                    editor.isActive({ textAlign: 'right' })
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('right')
                                        .run()
                                }
                            >
                                ⬤⬤
                            </button>
                            <button
                                type="button"
                                title="Justify"
                                className={
                                    editor.isActive({ textAlign: 'justify' })
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('justify')
                                        .run()
                                }
                            >
                                ☰
                            </button>
                        </div>

                        <div className="rt-group">
                            <button
                                type="button"
                                title="Bullet list"
                                className={
                                    editor.isActive('bulletList')
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleBulletList()
                                        .run()
                                }
                            >
                                • ≡
                            </button>
                            <button
                                type="button"
                                title="Ordered list"
                                className={
                                    editor.isActive('orderedList')
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleOrderedList()
                                        .run()
                                }
                            >
                                1.≡
                            </button>
                            <button
                                type="button"
                                title="Blockquote"
                                className={
                                    editor.isActive('blockquote')
                                        ? 'active'
                                        : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleBlockquote()
                                        .run()
                                }
                            >
                                &quot; &quot;
                            </button>
                            <button
                                type="button"
                                title="Code block"
                                className={
                                    editor.isActive('codeBlock') ? 'active' : ''
                                }
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleCodeBlock()
                                        .run()
                                }
                            >
                                ⌨
                            </button>
                        </div>

                        <div className="rt-group rt-popover-anchor">
                            <button
                                type="button"
                                title="Insert table"
                                onClick={() =>
                                    setTablePopover((current) => !current)
                                }
                            >
                                ⊞ Table
                            </button>
                            {tablePopover ? (
                                <div className="rt-table-popover">
                                    <p className="mb-2 text-xs text-gray-500">
                                        Insert table
                                    </p>
                                    <div className="mb-2 flex gap-2">
                                        <label className="text-xs">
                                            Rows
                                            <input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={tableRows}
                                                className="rt-num-input"
                                                onChange={(event) =>
                                                    setTableRows(
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </label>
                                        <label className="text-xs">
                                            Cols
                                            <input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={tableCols}
                                                className="rt-num-input"
                                                onChange={(event) =>
                                                    setTableCols(
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        className="rt-insert-btn"
                                        onClick={insertTable}
                                    >
                                        Insert
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {editor.isActive('table') ? (
                            <div className="rt-group">
                                <button
                                    type="button"
                                    title="Add column after"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .addColumnAfter()
                                            .run()
                                    }
                                >
                                    +Col
                                </button>
                                <button
                                    type="button"
                                    title="Delete column"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .deleteColumn()
                                            .run()
                                    }
                                >
                                    -Col
                                </button>
                                <button
                                    type="button"
                                    title="Add row after"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .addRowAfter()
                                            .run()
                                    }
                                >
                                    +Row
                                </button>
                                <button
                                    type="button"
                                    title="Delete row"
                                    onClick={() =>
                                        editor.chain().focus().deleteRow().run()
                                    }
                                >
                                    -Row
                                </button>
                                <button
                                    type="button"
                                    title="Delete table"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .deleteTable()
                                            .run()
                                    }
                                >
                                    ✕ Tbl
                                </button>
                            </div>
                        ) : null}

                        <div className="rt-group">
                            <button
                                type="button"
                                title="Insert image from file"
                                disabled={imageUploading}
                                onClick={() => void insertImageFile()}
                            >
                                {imageUploading ? '…' : '🖼 File'}
                            </button>
                            <button
                                type="button"
                                title="Insert image from URL"
                                onClick={insertImageUrl}
                            >
                                🔗 URL
                            </button>
                        </div>

                        <div className="rt-group">
                            <button
                                type="button"
                                title="Link"
                                className={
                                    editor.isActive('link') ? 'active' : ''
                                }
                                onClick={toggleLink}
                            >
                                🔗 Link
                            </button>
                            <button
                                type="button"
                                title="Horizontal rule"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setHorizontalRule()
                                        .run()
                                }
                            >
                                ― HR
                            </button>
                        </div>

                        <div className="rt-group">
                            <button
                                type="button"
                                title="Clear formatting"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .clearNodes()
                                        .unsetAllMarks()
                                        .run()
                                }
                            >
                                ✕ Clear
                            </button>
                        </div>
                    </div>
                ) : null}

                <EditorContent
                    id={resolvedId}
                    editor={editor}
                    className="rt-editor"
                    style={{ minHeight }}
                />
            </div>

            {error ? (
                <p id={errorId} className="text-sm text-red-500">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
