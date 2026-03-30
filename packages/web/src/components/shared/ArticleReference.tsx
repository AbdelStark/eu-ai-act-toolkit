/**
 * Renders a reference to an EU AI Act article as a link to EUR-Lex.
 *
 * EUR-Lex deep-link format for Regulation (EU) 2024/1689:
 * https://eur-lex.europa.eu/eli/reg/2024/1689/oj#art_N
 */

const EUR_LEX_BASE =
  'https://eur-lex.europa.eu/eli/reg/2024/1689/oj';

interface ArticleReferenceProps {
  /** Article number (e.g. 5, 6, 51) */
  article: number;
  /** Optional paragraph number (e.g. 1 for Article 5(1)) */
  paragraph?: number;
  /** Optional subparagraph letter (e.g. "c" for Article 5(1)(c)) */
  subparagraph?: string;
  /** Additional CSS classes */
  className?: string;
}

function formatArticleLabel(
  article: number,
  paragraph?: number,
  subparagraph?: string,
): string {
  let label = `Article ${article}`;
  if (paragraph != null) {
    label += `(${paragraph})`;
  }
  if (subparagraph) {
    label += `(${subparagraph})`;
  }
  return label;
}

function buildEurLexUrl(article: number): string {
  return `${EUR_LEX_BASE}#art_${article}`;
}

export function ArticleReference({
  article,
  paragraph,
  subparagraph,
  className,
}: ArticleReferenceProps) {
  const label = formatArticleLabel(article, paragraph, subparagraph);
  const url = buildEurLexUrl(article);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`View ${label} on EUR-Lex`}
      className={`inline-flex items-center gap-1 text-sm font-medium text-eu-blue underline decoration-eu-blue/30 underline-offset-2 transition-colors hover:text-eu-blue/80 hover:decoration-eu-blue/60 ${className ?? ''}`}
    >
      {label}
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm7.25-.75a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47H12.25a.75.75 0 01-.75-.75z"
          clipRule="evenodd"
        />
      </svg>
    </a>
  );
}
