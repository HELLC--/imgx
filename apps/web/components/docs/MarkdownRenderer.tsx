import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export function MarkdownRenderer({ children }: { children: string }) {
  return (
    <article
      className={[
        "docs-prose prose prose-neutral max-w-none",
        // Headings
        "prose-headings:font-mono prose-headings:tracking-tight prose-headings:text-foreground prose-headings:font-semibold",
        "prose-h1:text-[22px] prose-h1:leading-tight prose-h1:mt-0 prose-h1:mb-5",
        "prose-h2:text-[17px] prose-h2:leading-snug prose-h2:mt-10 prose-h2:mb-3 prose-h2:scroll-mt-24",
        "prose-h3:text-[15px] prose-h3:leading-snug prose-h3:mt-8 prose-h3:mb-2 prose-h3:scroll-mt-24",
        "prose-h4:text-sm prose-h4:mt-6 prose-h4:mb-2",
        // Body copy — aligned with sidebar text-sm (14px)
        "prose-p:text-sm prose-p:leading-6 prose-p:text-foreground prose-p:my-3",
        "prose-li:text-sm prose-li:leading-6 prose-li:text-foreground prose-li:my-1",
        "prose-ul:my-3 prose-ul:pl-6 prose-ul:marker:text-(--muted)",
        "prose-ol:my-3 prose-ol:pl-6 prose-ol:marker:text-(--muted)",
        // Links
        "prose-a:text-foreground prose-a:font-normal prose-a:underline prose-a:underline-offset-4 prose-a:decoration-(--border-strong) hover:prose-a:decoration-accent",
        "prose-strong:text-foreground prose-strong:font-medium",
        // Inline code
        "prose-code:font-mono prose-code:text-[13px] prose-code:font-normal",
        "prose-code:before:content-none prose-code:after:content-none",
        // Code blocks
        "prose-pre:font-mono prose-pre:text-[13px] prose-pre:leading-relaxed",
        "prose-pre:bg-(--code-bg) prose-pre:text-(--code-fg) prose-pre:rounded-lg",
        "prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:my-4",
        // Tables
        "prose-table:text-[13px] prose-th:font-semibold prose-th:text-foreground",
        "prose-thead:border-b prose-thead:border-border",
        // Blockquote
        "prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-(--muted-strong) prose-blockquote:text-sm",
        "prose-blockquote:border-l-2 prose-blockquote:border-(--border-strong)",
        "prose-hr:border-border prose-hr:my-8",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["heading-anchor"] },
            },
          ],
          rehypeHighlight,
        ]}
      >
        {children}
      </ReactMarkdown>
    </article>
  );
}
