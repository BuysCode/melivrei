// Generates outlined wordmarks from the locally installed Noto Sans Bold font.
// The resulting SVGs have no live text or font dependency.
const fs = require('fs');
const path = require('path');
const fontkit = require('../frontend/node_modules/next/dist/compiled/@next/font/dist/fontkit').default;
const font = fontkit(fs.readFileSync('/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf'));
const base = path.join(__dirname, 'final');
fs.mkdirSync(base, { recursive: true });
const ink = '#173D38';
const paper = '#F7F3E9';
const symbolPath = 'M48 184V83c0-14 17-21 27-11l53 53 53-53c10-10 27-3 27 11v60 M208 143c0 36-29 65-65 65-18 0-35-8-47-21';
function svg(viewBox, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
}
function symbol(color) {
  return `<path d="${symbolPath}" fill="none" stroke="${color}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const run = font.layout('MeLivrei');
const units = font.unitsPerEm;
let x = 0;
const paths = run.glyphs.map((glyph, i) => {
  const pos = run.positions[i];
  const part = `<path d="${glyph.path.toSVG()}" transform="translate(${x + pos.xOffset} ${pos.yOffset})"/>`;
  x += pos.xAdvance;
  return part;
}).join('');
// Font outlines are scaled uniformly. The dot and counters remain original glyph contours.
const word = (color, scale, tx, baseline) => `<g fill="${color}" transform="translate(${tx} ${baseline}) scale(${scale} ${-scale})">${paths}</g>`;
fs.writeFileSync(path.join(base, 'melivrei-symbol.svg'), svg('0 0 256 256', 'Símbolo MeLivrei', symbol(ink)));
fs.writeFileSync(path.join(base, 'melivrei-symbol-white.svg'), svg('0 0 256 256', 'Símbolo MeLivrei branco', symbol('#FFFFFF')));
fs.writeFileSync(path.join(base, 'melivrei-horizontal.svg'), svg('0 0 820 256', 'MeLivrei', symbol(ink) + word(ink, 0.105, 276, 170)));
fs.writeFileSync(path.join(base, 'melivrei-horizontal-white.svg'), svg('0 0 820 256', 'MeLivrei branco', symbol('#FFFFFF') + word('#FFFFFF', 0.105, 276, 170)));
fs.writeFileSync(path.join(base, 'melivrei-stacked.svg'), svg('0 0 640 420', 'MeLivrei empilhado', `<g transform="translate(192 0)">${symbol(ink)}</g>` + word(ink, 0.105, 58, 358)));
fs.writeFileSync(path.join(base, 'melivrei-wordmark.svg'), svg('0 0 560 140', 'MeLivrei logotipo', word(ink, 0.105, 4, 106)));
fs.writeFileSync(path.join(base, 'melivrei-symbol-small.svg'), svg('0 0 256 256', 'Símbolo MeLivrei simplificado', `<path d="M42 185V80c0-18 21-26 34-13l52 52 52-52c13-13 34-5 34 13v62c0 43-35 78-78 78-16 0-29-5-38-14" fill="none" stroke="${ink}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>`));
