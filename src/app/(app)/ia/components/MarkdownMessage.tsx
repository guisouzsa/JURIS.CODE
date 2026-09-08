import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed break-words">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="text-sm font-semibold text-primary mt-3 mb-1.5 first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="text-sm font-semibold text-primary mt-3 mb-1.5 first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="text-sm font-semibold text-primary mt-2 mb-1 first:mt-0">{children}</h4>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline break-all hover:text-accent-gray transition-colors"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return <code className={`font-mono text-xs ${className ?? ""}`}>{children}</code>;
    }
    return (
      <code className="bg-surface-container border border-surface-container-high px-1.5 py-0.5 rounded text-xs font-mono break-all">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-surface-container border border-surface-container-high rounded-md p-3 overflow-x-auto text-xs font-mono mb-2">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-surface-container-high my-3" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-2 border border-surface-container-high rounded-md">
      <table className="w-full text-xs border-collapse min-w-[320px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-surface-container-high">{children}</thead>,
  th: ({ children }) => (
    <th className="text-left px-3 py-2 font-label-caps text-label-caps text-outline font-normal whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 align-top border-t border-surface-container-high/60 break-words">{children}</td>
  ),
};

export default function MarkdownMessage({ text }: { text: string }) {
  return (
    <div className="min-w-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
