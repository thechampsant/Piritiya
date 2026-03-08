import React from 'react';
import { colors, spacing, typography, radii, animation } from '@ds/tokens';

const SECTION_HEADER_REGEX = /^(\s*)([\p{Emoji}\p{Emoji_Presentation}\s]+)\s*\*\*(.+?)\*\*\s*$/u;
const NUMBERED_STEP_REGEX = /^(\d+)\.\s+(.+)$/;
const BULLET_PREFIXES = ['- ', '• '];
const WARNING_PREFIX = '⚠️';

const PRICE_REGEX = /(₹[\d,]+|[\d,]+\s*INR)/gi;
const BOLD_REGEX = /\*\*(.+?)\*\*/g;

const GREEN_DOT = '#0d5c0d';
const ARROW_UP = '↑';
const ARROW_DOWN = '↓';
const ARROW_FLAT = '→';
const WARNING_BG = 'rgba(255,193,7,0.15)';

/**
 * Parse inline formatting: bold **text**, price (₹/INR), trend arrows (↑↓→).
 * Returns array of React nodes (strings and elements).
 */
function parseInline(line, keyPrefix = 'inline') {
  if (!line || typeof line !== 'string') return [line];

  const parts = [];
  let lastIndex = 0;
  const re = /\*\*(.+?)\*\*|(₹[\d,]+|[\d,]+\s*INR)|(↑|↓|→)/gi;
  let match;
  let key = 0;

  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`${keyPrefix}-${key++}`}>{line.slice(lastIndex, match.index)}</span>
      );
    }
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`${keyPrefix}-${key++}`} style={{ fontWeight: 600 }}>
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <span
          key={`${keyPrefix}-${key++}`}
          style={{
            display: 'inline-block',
            background: GREEN_DOT,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 9999,
            fontSize: typography.size.sm,
            fontWeight: 600,
            margin: '0 2px',
          }}
        >
          {match[2].trim()}
        </span>
      );
    } else if (match[3] !== undefined) {
      const arrow = match[3];
      const arrowColor =
        arrow === ARROW_UP ? GREEN_DOT : arrow === ARROW_DOWN ? '#b91c1c' : 'rgba(0,0,0,0.5)';
      parts.push(
        <span key={`${keyPrefix}-${key++}`} style={{ color: arrowColor, fontWeight: 600 }}>
          {arrow}
        </span>
      );
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < line.length) {
    parts.push(<span key={`${keyPrefix}-${key++}`}>{line.slice(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : [line];
}

// Only treat as section header if line *starts* with emoji(s) then **title** (avoids swallowing content)
function isSectionHeader(line) {
  const t = line.trim();
  return SECTION_HEADER_REGEX.test(t);
}

function parseSectionHeader(line) {
  const t = line.trim();
  const m = t.match(SECTION_HEADER_REGEX);
  if (m) return { emoji: m[2].trim(), title: m[3].trim() };
  const boldMatch = t.match(/([\p{Emoji}\p{Emoji_Presentation}\s]+)\s*\*\*(.+?)\*\*/u);
  if (boldMatch) return { emoji: boldMatch[1].trim(), title: boldMatch[2].trim() };
  return null;
}

function isBullet(line) {
  const t = line.trim();
  return BULLET_PREFIXES.some((p) => t.startsWith(p));
}

function getBulletText(line) {
  const t = line.trim();
  for (const p of BULLET_PREFIXES) {
    if (t.startsWith(p)) return t.slice(p.length).trim();
  }
  return t;
}

function isNumberedStep(line) {
  return NUMBERED_STEP_REGEX.test(line.trim());
}

function getNumberedStep(line) {
  const m = line.trim().match(NUMBERED_STEP_REGEX);
  return m ? { num: m[1], text: m[2] } : null;
}

function isWarning(line) {
  return line.trim().startsWith(WARNING_PREFIX);
}

/**
 * Split text into blocks: [ { type: 'summary', lines }, { type: 'section', header, lines }, ... ]
 */
function parseBlocks(text) {
  const blocks = [];
  const lines = (text || '').split('\n').map((l) => l.trimEnd());
  let i = 0;

  const summaryLines = [];
  while (i < lines.length && !isSectionHeader(lines[i])) {
    if (lines[i] !== '') summaryLines.push(lines[i]);
    i++;
  }
  if (summaryLines.length > 0) {
    blocks.push({ type: 'summary', lines: summaryLines });
  }

  while (i < lines.length) {
    const line = lines[i];
    if (isSectionHeader(line)) {
      const header = parseSectionHeader(line);
      if (header) {
        const sectionLines = [];
        i++;
        while (i < lines.length && !isSectionHeader(lines[i])) {
          sectionLines.push(lines[i]);
          i++;
        }
        blocks.push({ type: 'section', header, lines: sectionLines });
        continue;
      }
    }
    i++;
  }

  if (blocks.length === 0 && text.trim()) {
    blocks.push({ type: 'summary', lines: lines.filter((l) => l !== '') });
  }
  return blocks;
}

export default function AIResponseBubble({ text }) {
  const blocks = parseBlocks(text || '');

  const containerStyle = {
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderRadius: radii.md || 12,
    padding: spacing['2'] || '10px',
    paddingLeft: spacing['3'] || '12px',
    paddingRight: spacing['3'] || '12px',
    fontFamily: typography.fonts.serif,
    fontSize: '13px',
    lineHeight: 1.5,
    color: colors.text?.primary || '#1a1a1a',
    maxWidth: '100%',
  };

  const sectionHeaderStyle = {
    fontWeight: 600,
    color: colors.text?.primary || '#1a1a1a',
    marginBottom: spacing['1'],
    paddingBottom: spacing['1'],
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    fontSize: '13px',
  };

  const bulletItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing['1'],
    marginBottom: 2,
  };

  const stepItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing['1'],
    marginBottom: spacing['1'],
  };

  const stepBadgeStyle = {
    flexShrink: 0,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: GREEN_DOT,
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const warningBlockStyle = {
    background: WARNING_BG,
    padding: spacing['1'],
    borderRadius: radii.sm || 6,
    marginTop: spacing['1'],
    marginBottom: spacing['1'],
  };

  const renderLine = (line, lineKey) => {
    if (!line.trim()) return null;

    if (isWarning(line)) {
      return (
        <div key={lineKey} style={warningBlockStyle}>
          {parseInline(line)}
        </div>
      );
    }

    const step = getNumberedStep(line);
    if (step) {
      return (
        <div key={lineKey} style={stepItemStyle}>
          <span style={stepBadgeStyle}>{step.num}</span>
          <span style={{ flex: 1 }}>{parseInline(step.text, lineKey)}</span>
        </div>
      );
    }

    if (isBullet(line)) {
      const bulletText = getBulletText(line);
      return (
        <div key={lineKey} style={bulletItemStyle}>
          <span style={{ color: GREEN_DOT, flexShrink: 0, marginTop: 2 }}>•</span>
          <span style={{ flex: 1 }}>{parseInline(bulletText, lineKey)}</span>
        </div>
      );
    }

    return (
      <p key={lineKey} style={{ margin: '0 0 4px', fontSize: '13px' }}>
        {parseInline(line, lineKey)}
      </p>
    );
  };

  const renderBlock = (block, blockIndex) => {
    const delayMs = blockIndex * 100;
    const animationStyle = {
      opacity: 0,
      animation: 'fadeInSection 0.25s ease-out forwards',
      animationDelay: `${delayMs}ms`,
    };

    if (block.type === 'summary') {
      return (
        <div key={blockIndex} style={animationStyle}>
          <div style={{ marginBottom: spacing['2'] }}>
            {block.lines.map((line, i) => (
              <p key={i} style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '13px' }}>
                {parseInline(line, `sum-${i}`)}
              </p>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'section') {
      const { header, lines } = block;
      const bodyLines = lines.filter((l) => l !== '');
      return (
        <div key={blockIndex} style={{ ...animationStyle, marginTop: spacing['2'] }}>
          <div style={sectionHeaderStyle}>
            {header.emoji} <strong>{header.title}</strong>
          </div>
          <div>
            {bodyLines.map((line, i) => renderLine(line, `sec-${blockIndex}-${i}`))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={containerStyle}>
        {blocks.length > 0 ? (
          blocks.map((block, i) => renderBlock(block, i))
        ) : (
          <p style={{ margin: 0 }}>{text}</p>
        )}
      </div>
  );
}
