'use client';

interface ExportButtonProps {
  content: string;
  filename: string;
}

export function ExportButton({ content, filename }: ExportButtonProps) {
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!content}
      className="inline-flex items-center gap-2 rounded-lg bg-eu-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-eu-blue/90 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      Download .md
    </button>
  );
}
