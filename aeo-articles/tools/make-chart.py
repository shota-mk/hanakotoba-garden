"""記事用のグラフ（図）を作る。片岡さんの記事「スカウト編」（2026-10-26）の図と同じ見た目にそろえる。

使い方:
  python3 aeo-articles/tools/make-chart.py spec.json out.png

spec.json の例は aeo-articles/tools/chart-specs/ にある。type は hbar（横棒）・vbar（縦棒）・timeline（時期の帯）。
見た目のきまり:
  - 白地、2000×1125px（16:9）。左端をそろえ、上から 見出し（結論の文）→ 小見出し（何のデータか）→ グラフ → 太字の一言 → 補足 → 出典。
  - 色はオレンジ #e2571e を1か所だけ（言いたい数字）。ほかの棒はグレー #b5b2ab。
  - 数値は棒の先に太字で単位つき。凡例は付けない。軸は0の線だけ。
フォントは Noto Sans JP（Regular / Bold / Black）。VOCO_FONT_DIR に置くか、無ければ npm から取ってくる。
"""
import json
import os
import subprocess
import sys
import tempfile

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
from matplotlib.patches import FancyBboxPatch, Rectangle

ACCENT = '#e2571e'
BAR = '#b5b2ab'
LIGHT = '#e6e4df'
BOX = '#f6f5f2'
INK = '#111111'
SUB = '#55534f'
FAINT = '#8a8782'
GRID = '#e0deda'
AXIS = '#a6a4a0'

W, H = 2000, 1125
LEFT = 0.055

FONT_DIR = os.environ.get('VOCO_FONT_DIR', os.path.expanduser('~/.cache/voco-fonts'))
WEIGHTS = {'regular': '400Regular', 'bold': '700Bold', 'black': '900Black'}


def ensure_fonts():
    names = {k: os.path.join(FONT_DIR, f'NotoSansJP_{v}.ttf') for k, v in WEIGHTS.items()}
    if all(os.path.exists(p) for p in names.values()):
        return names
    os.makedirs(FONT_DIR, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['npm', 'pack', '@expo-google-fonts/noto-sans-jp@0.4.4'], cwd=tmp, check=True, capture_output=True)
        subprocess.run(['tar', 'xzf', 'expo-google-fonts-noto-sans-jp-0.4.4.tgz'], cwd=tmp, check=True)
        for k, v in WEIGHTS.items():
            os.replace(os.path.join(tmp, 'package', v, f'NotoSansJP_{v}.ttf'), names[k])
    return names


FONTS = ensure_fonts()


def fp(weight, size):
    return FontProperties(fname=FONTS[weight], size=size)


def y_of(px):
    """上からのピクセル位置を figure 座標に直す。"""
    return 1 - px / H


def header_footer(fig, spec, low=False):
    fig.text(LEFT, y_of(115), spec['headline'], fontproperties=fp('black', 21), color=INK, va='center')
    if spec.get('subtitle'):
        fig.text(LEFT, y_of(183), spec['subtitle'], fontproperties=fp('regular', 11.5), color=SUB, va='center')
    if spec.get('takeaway'):
        fig.text(LEFT, y_of(800), spec['takeaway'], fontproperties=fp('bold', 13), color=INK, va='center')
    if spec.get('note'):
        fig.text(LEFT, y_of(858), spec['note'], fontproperties=fp('regular', 11), color=SUB, va='center')
    if spec.get('source'):
        fig.text(LEFT, y_of(1052), spec['source'], fontproperties=fp('regular', 9), color=FAINT, va='center')


def plot_bottom(spec):
    """太字の一言・補足があればグラフはその上まで、無ければ下の方まで使う。"""
    return y_of(705) if (spec.get('takeaway') or spec.get('note')) else y_of(935)


def fmt(spec, v):
    return spec.get('axis', {}).get('fmt', '{:g}').format(v)


def ticks(spec):
    a = spec['axis']
    n = int(round(a['max'] / a['step']))
    return [a['step'] * i for i in range(n + 1)]


def text_width(fig, s, prop):
    r = fig.canvas.get_renderer()
    t = fig.text(0, 0, s, fontproperties=prop)
    w = t.get_window_extent(renderer=r).width / W
    t.remove()
    return w


def callout(fig, spec, x0, x1, top, bottom):
    c = spec.get('callout')
    if not c:
        return
    if c.get('box', True):
        fig.patches.append(FancyBboxPatch((x0, bottom), x1 - x0, top - bottom, transform=fig.transFigure,
                                          boxstyle='round,pad=0,rounding_size=0.012', fc=BOX, ec='none'))
    sizes = {'small': 9.5, 'normal': 11.5, 'big': 27}
    lines = c['lines']
    gap = {'small': 0.045, 'normal': 0.05, 'big': 0.1}
    total = sum(gap[l.get('size', 'normal')] for l in lines)
    y = (top + bottom) / 2 + total / 2
    for l in lines:
        s = l.get('size', 'normal')
        y -= gap[s] / 2
        color = ACCENT if l.get('accent') else (INK if l.get('bold') else SUB)
        weight = 'black' if s == 'big' else ('bold' if l.get('bold') else 'regular')
        fig.text((x0 + x1) / 2, y, l['text'], fontproperties=fp(weight, sizes[s]), color=color, ha='center', va='center')
        y -= gap[s] / 2


def hbar(fig, spec):
    items = spec['items']
    has_side = bool(spec.get('callout'))
    label_prop = fp('bold', 14)
    lw = max(text_width(fig, it['label'], label_prop) for it in items)
    sw = max([text_width(fig, it['sub'], fp('regular', 9.5)) for it in items if it.get('sub')] or [0])
    x0 = LEFT + max(lw, sw) + 0.02
    x1 = 0.76 if has_side else 0.87
    top, bottom = y_of(260), plot_bottom(spec)
    ax = fig.add_axes([x0, bottom, x1 - x0, top - bottom])
    n = len(items)
    ys = list(range(n))[::-1]
    a = spec['axis']
    height = spec.get('bar_height', 0.22 if n <= 5 else 0.2)
    for y, it in zip(ys, items):
        color = ACCENT if it.get('highlight') else BAR
        ax.barh(y, it['value'], height=height, color=color, zorder=3)
        label = it.get('text', fmt(spec, it['value']))
        ax.text(it['value'] + a['max'] * 0.015, y, label, fontproperties=fp('bold', spec.get('value_size', 18)),
                color=INK, va='center', ha='left', zorder=4)
        if it.get('inner'):
            ax.text(it['value'] / 2, y, it['inner'], fontproperties=fp('bold', 13), color='white', va='center', ha='center', zorder=4)
        dy = 0.13 if it.get('sub') else 0
        ax.text(-a['max'] * 0.02, y + dy, it['label'], fontproperties=label_prop, color=INK, va='center', ha='right')
        if it.get('sub'):
            ax.text(-a['max'] * 0.02, y - 0.2, it['sub'], fontproperties=fp('regular', 9.5), color=SUB, va='center', ha='right')
    ax.set_xlim(0, a['max'])
    ax.set_ylim(-0.6, n - 0.4)
    ax.set_xticks(ticks(spec))
    ax.set_xticklabels([fmt(spec, t) for t in ticks(spec)], fontproperties=fp('regular', 10), color=FAINT)
    ax.set_yticks([])
    ax.grid(axis='x', color=GRID, linewidth=1, zorder=0)
    for s in ('top', 'right', 'bottom'):
        ax.spines[s].set_visible(False)
    ax.spines['left'].set_color(AXIS)
    ax.tick_params(length=0, pad=8)
    if spec.get('unit_label'):
        ax.text(1, 0.0, spec['unit_label'], transform=ax.transAxes, fontproperties=fp('regular', 9.5), color=FAINT, ha='right', va='bottom')
    if has_side:
        callout(fig, spec, 0.8, 0.96, y_of(315), y_of(785) if bottom < y_of(800) else bottom + 0.02)


def vbar(fig, spec):
    items = spec['items']
    has_panel = bool(spec.get('panel'))
    x0, x1 = 0.08, (0.6 if has_panel else 0.9)
    top, bottom = y_of(270), plot_bottom(spec) + 0.05
    ax = fig.add_axes([x0, bottom, x1 - x0, top - bottom])
    a = spec['axis']
    for i, it in enumerate(items):
        color = ACCENT if it.get('highlight') else BAR
        ax.bar(i, it['value'], width=0.56, color=color, zorder=3)
        ax.text(i, it['value'] + a['max'] * 0.025, it.get('text', fmt(spec, it['value'])), fontproperties=fp('bold', 18),
                color=INK, ha='center', va='bottom', zorder=4)
    ax.set_xticks(range(len(items)))
    ax.set_xticklabels([it['label'] for it in items], fontproperties=fp('bold', 14), color=INK)
    ax.set_ylim(0, a['max'])
    ax.set_yticks(ticks(spec))
    ax.set_yticklabels([fmt(spec, t) for t in ticks(spec)], fontproperties=fp('regular', 10), color=FAINT)
    ax.grid(axis='y', color=GRID, linewidth=1, zorder=0)
    for s in ('top', 'right', 'left'):
        ax.spines[s].set_visible(False)
    ax.spines['bottom'].set_color(GRID)
    ax.tick_params(length=0, pad=8)
    if has_panel:
        p = spec['panel']
        px = 0.65
        fig.text(px, top - 0.02, p['title'], fontproperties=fp('bold', 14), color=INK, va='top')
        y = top - 0.1
        for para in p['paras']:
            fig.text(px, y, para, fontproperties=fp('regular', 11), color=SUB, va='top', linespacing=1.6, wrap=False)
            y -= 0.046 * (para.count('\n') + 1) + 0.045


def timeline(fig, spec):
    phases = spec['phases']
    start, end = spec['range']
    xa, xb = LEFT, 0.944
    band_top, band_bottom = y_of(483), y_of(603)
    gap = 0.0035

    def X(v):
        return xa + (xb - xa) * (v - start) / (end - start)

    for i, ph in enumerate(phases):
        l, r = X(ph['start']) + (gap if i else 0), X(ph['end']) - (gap if i < len(phases) - 1 else 0)
        hi = ph.get('highlight')
        fig.patches.append(Rectangle((l, band_bottom), r - l, band_top - band_bottom, transform=fig.transFigure,
                                     fc=ACCENT if hi else LIGHT, ec='none'))
        cx, cy = (l + r) / 2, (band_top + band_bottom) / 2
        fig.text(cx, cy + 0.017, ph['name'], fontproperties=fp('bold', 14), color='white' if hi else INK, ha='center', va='center')
        if ph.get('sub'):
            fig.text(cx, cy - 0.027, ph['sub'], fontproperties=fp('regular', 10), color='white' if hi else SUB, ha='center', va='center')
        if ph.get('note'):
            ny = y_of(330) if ph.get('note_high') else y_of(400)
            fig.text(cx, ny, ph['note'], fontproperties=fp('regular', 11), color=SUB, ha='center', va='bottom')
            fig.lines.append(plt.Line2D([cx, cx], [band_top + 0.005, ny - 0.008], transform=fig.transFigure, color='#8e8c87', lw=1))
    for t in spec.get('ticks', []):
        x = X(t['pos'])
        fig.lines.append(plt.Line2D([x, x], [band_bottom - 0.005, band_bottom - 0.02], transform=fig.transFigure, color=FAINT, lw=1))
        fig.text(x, band_bottom - 0.03, t['label'], fontproperties=fp('regular', 10), color=FAINT, ha='center', va='top', linespacing=1.3)


def main():
    spec = json.load(open(sys.argv[1], encoding='utf-8'))
    out = sys.argv[2]
    fig = plt.figure(figsize=(W / 200, H / 200), dpi=200, facecolor='white')
    {'hbar': hbar, 'vbar': vbar, 'timeline': timeline}[spec['type']](fig, spec)
    header_footer(fig, spec)
    fig.savefig(out, dpi=200, facecolor='white')
    print(out)


if __name__ == '__main__':
    main()
