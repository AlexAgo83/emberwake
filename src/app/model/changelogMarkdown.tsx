import type { ReactNode } from "react";

type MarkdownBlock =
  | {
      kind: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      kind: "list";
      items: string[];
    }
  | {
      kind: "paragraph";
      text: string;
    };

const inlineTokenPattern =
  /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

const parseInlineMarkdown = (value: string): ReactNode[] => {
  if (value.length === 0) {
    return [];
  }

  const segments = value.split(inlineTokenPattern).filter((segment) => segment.length > 0);

  return segments.map((segment, index) => {
    if (segment.startsWith("[") && segment.includes("](") && segment.endsWith(")")) {
      const labelEnd = segment.indexOf("](");
      const label = segment.slice(1, labelEnd);
      const href = segment.slice(labelEnd + 2, -1);

      return (
        <a
          className="app-meta-scene__markdown-link"
          href={href}
          key={`${segment}-${index}`}
          rel="noreferrer"
          target="_blank"
        >
          {label}
        </a>
      );
    }

    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={`${segment}-${index}`}>{segment.slice(2, -2)}</strong>;
    }

    if (segment.startsWith("*") && segment.endsWith("*")) {
      return <em key={`${segment}-${index}`}>{segment.slice(1, -1)}</em>;
    }

    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <code className="app-meta-scene__markdown-code" key={`${segment}-${index}`}>
          {segment.slice(1, -1)}
        </code>
      );
    }

    return segment;
  });
};

const parseMarkdownBlocks = (content: string): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = [];
  const lines = content
    .replace(/^#\s+.+$/m, "")
    .split("\n")
    .map((line) => line.trim());
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push({
      kind: "paragraph",
      text: paragraphLines.join(" ")
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({
      items: [...listItems],
      kind: "list"
    });
    listItems = [];
  };

  for (const line of lines) {
    if (line.length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "heading",
        level: 2,
        text: line.slice(3).trim()
      });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "heading",
        level: 3,
        text: line.slice(4).trim()
      });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
};

export const renderChangelogMarkdown = (content: string) =>
  parseMarkdownBlocks(content.trim()).map((block, index) => {
    if (block.kind === "heading") {
      const HeadingTag = block.level === 2 ? "h4" : "h5";

      return (
        <HeadingTag className="app-meta-scene__markdown-heading" key={`${block.kind}-${index}`}>
          {parseInlineMarkdown(block.text)}
        </HeadingTag>
      );
    }

    if (block.kind === "list") {
      return (
        <ul className="app-meta-scene__markdown-list" key={`${block.kind}-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li className="app-meta-scene__markdown-list-item" key={`${item}-${itemIndex}`}>
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p className="app-meta-scene__markdown-paragraph" key={`${block.kind}-${index}`}>
        {parseInlineMarkdown(block.text)}
      </p>
    );
  });
