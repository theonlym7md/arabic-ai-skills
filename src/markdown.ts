import { ArabicSkillError } from "./types.js";

export interface MarkdownSection {
  readonly heading: string;
  readonly body: string;
}

export interface ParsedMarkdown {
  readonly intro: string;
  readonly sections: readonly MarkdownSection[];
}

export function splitMarkdownSections(content: string): ParsedMarkdown {
  const lines = content.split(/\r?\n/u);
  const introLines: string[] = [];
  const sections: { heading: string; lines: string[] }[] = [];
  let current: { heading: string; lines: string[] } | null = null;
  let openFenceChar: string | null = null;
  let openFenceLen = 0;

  for (const line of lines) {
    if (openFenceChar) {
      const closeMatch = line.match(/^\s{0,3}(`{3,}|~{3,})\s*$/u);
      const closeMarker = closeMatch?.[1];
      if (closeMarker && closeMarker[0] === openFenceChar && closeMarker.length >= openFenceLen) {
        openFenceChar = null;
        openFenceLen = 0;
      }
      if (current) {
        current.lines.push(line);
      } else {
        introLines.push(line);
      }
      continue;
    }

    const openMatch = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/u);
    const marker = openMatch?.[1];
    if (marker) {
      const info = openMatch?.[2] ?? "";
      // Backtick info strings cannot contain backticks per CommonMark.
      if (!(marker[0] === "`" && info.includes("`"))) {
        openFenceChar = marker[0] ?? "`";
        openFenceLen = marker.length;
        if (current) {
          current.lines.push(line);
        } else {
          introLines.push(line);
        }
        continue;
      }
    }

    if (line.startsWith("## ")) {
      current = { heading: line.slice(3).trim(), lines: [line] };
      sections.push(current);
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else {
      introLines.push(line);
    }
  }

  return {
    intro: introLines.join("\n").trim(),
    sections: sections.map((section) => ({
      heading: section.heading,
      body: section.lines.join("\n").trim(),
    })),
  };
}

export function stripAgentOnlyBlocks(text: string): string {
  return text
    .replace(/<!--\s*agent-only:start\s*-->[\s\S]*?<!--\s*agent-only:end\s*-->/gu, "")
    .replace(/<!--\s*sdk-only:(?:start|end)\s*-->/gu, "")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

export function sanitizeMarkdownLinksForSdk(text: string): string {
  // Preserve inline code spans and fenced code blocks untouched.
  const segments = text.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/gu);
  return segments
    .map((segment, index) => {
      if (index % 2 === 1) {
        return segment;
      }
      return segment.replace(
        /\[([^\]]+)\]\((?!https?:\/\/)(?!mailto:)[^)]+\.(?:md|yaml|yml)(?:#[^)]+)?\)/giu,
        "$1",
      );
    })
    .join("");
}

const REQUIRED_CORE_HEADINGS = ["بوابة السياق", "قواعد الكتابة العربية", "أنماط المكوّنات"] as const;

export function extractCoreSdkRules(skillMarkdown: string): string {
  const { sections } = splitMarkdownSections(skillMarkdown);
  const byHeading = new Map(sections.map((section) => [section.heading, section.body]));

  const missing = REQUIRED_CORE_HEADINGS.filter((heading) => !byHeading.has(heading));
  if (missing.length > 0) {
    throw new ArabicSkillError(
      "CONFIGURATION_ERROR",
      `Bundled SKILL.md is missing required core SDK heading(s): ${missing.join(", ")}.`,
    );
  }

  return REQUIRED_CORE_HEADINGS.map((heading) => {
    const raw = byHeading.get(heading) as string;
    const stripped = stripAgentOnlyBlocks(raw)
      .split(/\r?\n/u)
      .filter((line) => !line.includes("reasoning/stage_"))
      .join("\n");
    return sanitizeMarkdownLinksForSdk(stripped);
  }).join("\n\n");
}
