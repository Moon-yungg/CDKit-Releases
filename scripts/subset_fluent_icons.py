#!/usr/bin/env python3
"""Subset the bundled Fluent icon font to glyphs used by the landing page."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from fontTools import subset


ROOT = Path(__file__).resolve().parents[1]
GLYPHS = ROOT / "site-source" / "fluent-icons.json"
DEFAULT_SOURCE = ROOT.parent / "CDKit" / "resources" / "fluent" / "FluentSystemIcons-Regular.ttf"
DEFAULT_OUTPUT = ROOT / "docs" / "assets" / "fluent-icons.woff2"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Upstream FluentSystemIcons-Regular.ttf")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Subset WOFF2 output")
    args = parser.parse_args()

    codepoints = json.loads(GLYPHS.read_text(encoding="utf-8"))
    unicode_values = sorted({int(value, 16) for value in codepoints.values()})
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6]
    options.name_legacy = True
    options.notdef_glyph = True
    options.notdef_outline = True
    options.recommended_glyphs = True

    font = subset.load_font(str(args.source), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicode_values)
    subsetter.subset(font)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(args.output), options)
    print(f"Wrote {args.output} with {len(unicode_values)} Fluent glyphs.")


if __name__ == "__main__":
    main()
