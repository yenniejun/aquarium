"""Shared helpers for the names-experiment notebooks (one notebook per gallery).

Loads the answers that `npm run names` saved under experiments/names/<exhibit>/, cleans the names,
and builds the tables the notebooks show. Uses only pandas, so the "charts" are shaded tables.
"""
import json
import math
import re
from collections import Counter
from itertools import combinations
from pathlib import Path

import pandas as pd

# The experiment folder: wherever the notebook is opened from (it, or the repo root).
ROOT = next(p for p in [Path.cwd(), Path.cwd() / 'experiments' / 'names'] if any(p.glob('*/prompt.md')))

STOP = set('''a an and the of who that which in on to with for at by from s as is are was were be been it its
into onto over under through between across about after before again once than then there their them they
this these those his her he she him you your we our us i my me one each every any all some no not only
just still so but or if when where what how why can could would will may might must do does did has have had
say says said also very more most much many such own same other another off out up down back away
never ever always every whose while until upon'''.split())


def normalize(title):
    """Lowercase, no leading "the", hyphens and apostrophes folded: "The Lantern-Owl" → "lantern owl"."""
    t = title.lower().replace('’', "'")
    t = re.sub(r"'s\b", '', t)
    t = re.sub(r'[^a-z0-9 ]+', ' ', t)
    t = re.sub(r'^\s*the\s+', '', t)
    return re.sub(r'\s+', ' ', t).strip()


def words(text):
    """A name's or description's words, minus filler."""
    return [w for w in normalize(text).split() if w not in STOP]


def figure(name):
    """The thing a name is about: its last word, or the last one before "of", "who" or "that"
    ("kite of questions" → kite, "blubbering blobfish" → blobfish). A rough but useful heuristic."""
    return re.split(r' (?:of|who|that|which) ', name)[0].split()[-1]


def load(exhibit):
    """All answers for one gallery: (raw, df, failed). df has only answers with a name, plus the
    columns name, words, figure and desc_words; failed has the ones without."""
    rows = []
    for f in sorted((ROOT / exhibit).glob('*/*.json')):
        a = json.loads(f.read_text())
        a['failed'] = f.name.endswith('.failed.json')
        rows.append(a)
    raw = pd.DataFrame(rows)
    failed = raw[raw.failed | raw.title.isna()]
    df = raw[~raw.index.isin(failed.index)].copy()
    df['name'] = df.title.map(normalize)
    df['words'] = df.title.map(words)
    df['figure'] = df.name.map(figure)
    df['desc_words'] = df.statement.fillna('').map(words)
    return raw, df, failed


def models_by_answers(df):
    return df.groupby('model').size().sort_values(ascending=False).index.tolist()


def overview(raw):
    """Answers, failures, tokens, time and cost per model."""
    return (
        raw.groupby('model')
        .agg(
            answers=('run', 'size'),
            no_name=('failed', 'sum'),
            out_tokens_avg=('usage', lambda u: round(sum(x['out'] for x in u) / len(u))),
            seconds_avg=('seconds', 'mean'),
            cost_total=('cost', 'sum'),
        )
        .round({'seconds_avg': 1, 'cost_total': 4})
        .sort_values('cost_total', ascending=False)
    )


def every_name(df):
    """One column per model, one row per answer."""
    wide = df.sort_values('run').groupby('model').title.apply(list).apply(pd.Series).T
    wide.index = wide.index + 1
    return wide[models_by_answers(df)]


def entropy(values):
    counts = Counter(values)
    n = sum(counts.values())
    return -sum(c / n * math.log2(c / n) for c in counts.values())


def jaccard(a, b):
    a, b = set(a), set(b)
    return len(a & b) / len(a | b) if a | b else 0


def mean_overlap(word_lists):
    pairs = list(combinations(word_lists, 2))
    return sum(jaccard(a, b) for a, b in pairs) / len(pairs) if pairs else float('nan')


def repeats(df):
    """How much each model repeats itself."""
    rows = []
    for m, g in df.groupby('model'):
        top, top_n = Counter(g.name).most_common(1)[0]
        rows.append({
            'model': m,
            'answers': len(g),
            'distinct names': g.name.nunique(),
            'top name': top,
            'top name ×': top_n,
            'distinct figures': g.figure.nunique(),
            'top figure': Counter(g.figure).most_common(1)[0][0],
            'figure entropy': round(entropy(g.figure), 2),
            'name overlap': round(mean_overlap(g.words.tolist()), 2),
        })
    return pd.DataFrame(rows).set_index('model').sort_values('name overlap', ascending=False)


def within_and_across(df):
    """Average word overlap between two answers from the same model, and from different models."""
    pairs = list(combinations(zip(df.model, df.words), 2))
    within = [jaccard(a, b) for (ma, a), (mb, b) in pairs if ma == mb]
    across = [jaccard(a, b) for (ma, a), (mb, b) in pairs if ma != mb]
    return sum(within) / len(within), sum(across) / len(across)


def shared_names(df):
    """Names more than one model came up with."""
    g = df.groupby('name').agg(times=('model', 'size'), models=('model', lambda s: ', '.join(sorted(set(s)))))
    g['by how many models'] = df.groupby('name').model.nunique()
    return g[g['by how many models'] > 1].sort_values(['by how many models', 'times'], ascending=False)


def shade(v, vmax, rgb='231, 111, 81'):
    a = 0 if pd.isna(v) or vmax == 0 else v / vmax
    return f'background-color: rgba({rgb}, {a:.2f})'


def word_share(df, top=25):
    """Share of each model's answers (and everyone's) whose name contains each of the top words."""
    top_words = [w for w, _ in Counter(w for ws in df.words for w in set(ws)).most_common(top)]
    has = df[['model']].copy()
    for w in top_words:
        has[w] = df.words.map(lambda ws, w=w: w in ws)
    share = has.groupby('model')[top_words].mean().loc[models_by_answers(df)]
    share.loc['ALL MODELS'] = has[top_words].mean()
    return share


def figures(df, top=15):
    """How often each model's names are about each of the most common figures."""
    top_figs = [f for f, _ in Counter(df.figure).most_common(top)]
    t = pd.crosstab(df.model, df.figure)[top_figs].loc[models_by_answers(df)]
    t.loc['ALL MODELS'] = t.sum()
    return t


def description_words(df, top=30):
    c = Counter(w for ws in df.desc_words for w in set(ws))
    return (
        pd.DataFrame(c.most_common(top), columns=['word', 'answers'])
        .assign(share=lambda d: (d.answers / len(df) * 100).round().astype(int).astype(str) + '%')
        .set_index('word')
        .T
    )


def vs_gallery(df, exhibit, repeat_table):
    """Each model's actual gallery piece, and whether it came up again among its answers."""
    rows = []
    for f in (ROOT.parents[1] / 'exhibits' / exhibit / 'entries').glob('*/meta.json'):
        m = json.loads(f.read_text())
        if m.get('title'):
            rows.append({'model': m['artist'], 'gallery piece': m['title']})
    g = pd.DataFrame(rows).set_index('model')
    g = g.loc[[m for m in models_by_answers(df) if m in g.index]]
    g['among its answers?'] = [normalize(t) in set(df[df.model == m].name) for m, t in g['gallery piece'].items()]
    g['its most common name here'] = repeat_table['top name'].reindex(g.index)
    return g


def growth(df):
    """Distinct names among each model's first k answers, as k grows."""
    ks = [k for k in (3, 5, 10, 20, 30, 50) if k <= df.groupby('model').size().min()]
    curve = pd.DataFrame({f'first {k}': df[df.run <= k].groupby('model').name.nunique() for k in ks}).loc[
        models_by_answers(df)
    ]
    curve.loc['ALL MODELS'] = [df[df.run <= k].name.nunique() for k in ks]
    return curve


def alliterative(name):
    """At least two of a name's words start with the same letter ("blubbering blobfish")."""
    initials = [w[0] for w in name.split() if w not in STOP and w[0].isalpha()]
    return len(initials) != len(set(initials))


def failures(failed):
    if not len(failed):
        return 'none'
    return failed[['model', 'run', 'stop']].assign(reply_start=failed.reply.str[:120])
