import { useEffect, useRef } from "react";

/**
 * Lightweight rich-text editor (no react-quill — incompatible with React 19).
 */
export default function RichTextEditor({ value = "", onChange, placeholder }) {
  const ref = useRef(null);
  const lastHtml = useRef(value);

  useEffect(() => {
    if (!ref.current) return;
    if (value !== lastHtml.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
      lastHtml.current = value;
    }
  }, [value]);

  const exec = (command, arg = null) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const emit = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastHtml.current = html;
    onChange?.(html);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
        {[
          { label: "B", title: "Bold", cmd: "bold", className: "font-bold" },
          { label: "I", title: "Italic", cmd: "italic", className: "italic" },
          { label: "U", title: "Underline", cmd: "underline", className: "underline" },
          { label: "• List", title: "Bullet list", cmd: "insertUnorderedList" },
          { label: "1. List", title: "Numbered list", cmd: "insertOrderedList" },
        ].map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={(e) => {
              e.preventDefault();
              exec(btn.cmd);
            }}
            className={`rounded-md px-2.5 py-1 text-xs text-slate-700 hover:bg-white hover:shadow-sm ${btn.className || ""}`}
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          title="Link"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("Enter URL");
            if (url) exec("createLink", url);
          }}
          className="rounded-md px-2.5 py-1 text-xs text-slate-700 hover:bg-white hover:shadow-sm"
        >
          Link
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder || "Write the job description…"}
        className="rich-text-editor min-h-[200px] px-3 py-2.5 text-sm text-slate-800 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
        onInput={emit}
        onBlur={emit}
        suppressContentEditableWarning
      />
    </div>
  );
}
