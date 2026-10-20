#!/usr/bin/env python3
"""Build static, per-language GitHub Pages from the maintained landing-page source."""

from __future__ import annotations

import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "site-source" / "index.html"
DOCS = ROOT / "docs"
ASSETS = DOCS / "assets"
BASE_URL = "https://moon-yungg.github.io/CDKit-Releases"

LANGUAGES = [
    ("en", "English", "en_US"),
    ("zh-CN", "简体中文", "zh_CN"),
    ("zh-TW", "繁體中文", "zh_TW"),
    ("de", "Deutsch", "de_DE"),
    ("fr", "Français", "fr_FR"),
    ("ko", "한국어", "ko_KR"),
    ("ja", "日本語", "ja_JP"),
    ("es", "Español", "es_ES"),
    ("pt-BR", "Português (Brasil)", "pt_BR"),
    ("ru", "Русский", "ru_RU"),
    ("tr", "Türkçe", "tr_TR"),
]

# Each inline SVG in the source is an interface icon. The order follows the source document.
# The logo remains an SVG brand mark and is intentionally not converted.
SVG_GLYPHS = [
    "navigation_20_regular",
    "arrow_download_24_regular",
    "chat_20_regular",
    "globe_20_regular",
    "mountain_trail_20_regular",
    "book_open_20_regular",
    "person_20_regular",
    "tag_20_regular",
    "play_20_regular",
    "translate_20_regular",
    "table_20_regular",
    "chat_20_regular",
    "map_20_regular",
    "shield_checkmark_20_regular",
    "arrow_sync_20_regular",
    "arrow_download_24_regular",
    "arrow_download_24_regular",
    "chat_20_regular",
]
SELECT_GLYPH = "chevron_down_16_regular"
CLOSE_GLYPH = "dismiss_20_regular"
CHECK_GLYPH = "checkmark_circle_20_regular"

# Kept in the same order and with the same copy as `scenes` in the source script.
SCENES = [
    ("world", "World editor", "world-view", "Edit the world where it is",
     "The open world streams around the camera with terrain, vegetation, sky and every object – as in the game.",
     ["Fly with WASD, orbit, frame with F", "Move, rotate, scale with snapping", "Place prefabs by drag & drop", "Focus, phases, routes and roads"]),
    ("quests", "Quest designer", "quest-designer", "Quests as a flow, not a spreadsheet",
     "Read a quest like a story, from the first objective to the last. Click any underlined word to change it: the goal, the reward, what follows.",
     ["Objectives from 1,000+ game templates", "Rewards, conditions and quest chains", "Dialogue lines and your own voice files", "Every text in every language"]),
    ("characters", "New characters", "new-character", "Your model, alive in Pywel",
     "Four steps from a model file to a character standing in the world, with its own animations.",
     ["FBX, glTF, Collada, MetaHuman & Fab", "Bound to the game skeleton automatically", "Your clips mapped to idle, walk, attack …", "Placed where a game character stands"]),
    ("items", "Items", "items", "Every item at your fingertips",
     "Search 6,800+ items with pictures. Change names, stats, prices and abilities in a visual editor.",
     ["New items from existing ones", "Covers and 3D models replaceable", "Shops and loot tables included", "Bulk changes via CSV"]),
    ("files", "Game files", "model-view", "Two million files, one search box",
     "Browse every file of the game, preview models, textures and sounds, export them or replace them with your own.",
     ["3D, texture, audio, table and text viewers", "Export single files or whole folders", "Replace with your edited version", "Mount the game as a Windows drive"]),
    ("map", "World map", "world-map", "The whole map in one view",
     "The game’s 2D map with regions and spawn areas – jump the 3D view anywhere with one click.",
     ["Regions and spawn layers", "Create islands and new terrain", "Edit the playable world bounds", "Put characters into spawn areas"]),
]

VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def parse_translation_table(source: str) -> dict[str, dict[str, str]]:
    match = re.search(r"const TRANSLATIONS = (\{.*?\});\s*const SUPPORTED_LANGUAGES", source, re.S)
    if not match:
        raise ValueError("Could not find the page translation table in the source HTML.")
    return json.loads(match.group(1))


def parse_icon_catalog() -> dict[str, int]:
    catalog_path = ROOT / "site-source" / "fluent-icons.json"
    if not catalog_path.is_file():
        raise FileNotFoundError(f"Fluent icon subset map is required to rebuild site assets: {catalog_path}")
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    result: dict[str, int] = {}
    for name in [*SVG_GLYPHS, SELECT_GLYPH, CLOSE_GLYPH, CHECK_GLYPH]:
        if name not in catalog:
            raise ValueError(f"Missing Fluent glyph {name}")
        result[name] = int(catalog[name], 16)
    return result


def html_escape_attr(value: str) -> str:
    return html.escape(value, quote=True)


def language_menu(locale: str, glyphs: dict[str, int]) -> str:
    name = next(name for code, name, _ in LANGUAGES if code == locale)
    chevron = glyphs[SELECT_GLYPH]
    lines = [
        '<details class="lang-menu">',
        f'<summary class="lang-select" aria-label="Select language"><span>{html.escape(name)}</span><span class="fluent-icon lang-chevron" aria-hidden="true">&#x{chevron:X};</span></summary>',
        '<nav class="lang-options" aria-label="Select language">',
    ]
    for code, label, _ in LANGUAGES:
        current = ' aria-current="page"' if code == locale else ""
        lines.append(f'<a class="lang-option" href="../{code}/" lang="{code}" hreflang="{code}"{current}>{html.escape(label)}</a>')
    lines.extend(["</nav>", "</details>"])
    return "\n".join(lines)


class StaticPage(HTMLParser):
    def __init__(self, locale: str, translations: dict[str, str], glyphs: dict[str, int]):
        super().__init__(convert_charrefs=True)
        self.locale = locale
        self.translations = translations
        self.glyphs = glyphs
        self.output: list[str] = []
        self.svg_index = 0
        self.skip_svg = False
        self.skip_select = False
        self.head_closed = False

    def _mapped_attr(self, attrs: list[tuple[str, str | None]]) -> dict[str, str | None]:
        return dict(attrs)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.skip_svg:
            if tag == "svg":
                raise ValueError("Nested SVG elements are not expected in the source page.")
            return
        if self.skip_select:
            return
        attributes = self._mapped_attr(attrs)

        if tag == "svg":
            if self.svg_index >= len(SVG_GLYPHS):
                raise ValueError("More inline SVG icons were found than the Fluent glyph map covers.")
            glyph = self.glyphs[SVG_GLYPHS[self.svg_index]]
            self.svg_index += 1
            self.output.append(f'<span class="fluent-icon" aria-hidden="true">&#x{glyph:X};</span>')
            self.skip_svg = True
            return

        if tag == "select" and attributes.get("id") == "languageSelect":
            self.output.append(language_menu(self.locale, self.glyphs))
            self.skip_select = True
            return

        if tag == "html":
            attributes["lang"] = self.locale

        if tag == "meta":
            name = (attributes.get("name") or "").lower()
            prop = (attributes.get("property") or "").lower()
            if name == "description" or prop in {"og:title", "og:description"}:
                if attributes.get("lang") != self.locale:
                    return
                attributes.pop("lang", None)
            if (attributes.get("http-equiv") or "").lower() == "content-language":
                attributes["content"] = self.locale
            if prop == "og:locale":
                attributes["content"] = next(region for code, _, region in LANGUAGES if code == self.locale)
            if prop == "og:locale:alternate":
                locale_region = next(region for code, _, region in LANGUAGES if code == self.locale)
                if attributes.get("content") == locale_region:
                    return
            if prop in {"og:image", "twitter:image"} and (attributes.get("content") or "").startswith("assets/"):
                attributes["content"] = f"{BASE_URL}/{attributes['content']}"

        if tag == "link":
            rel = (attributes.get("rel") or "").lower()
            if rel == "alternate" and attributes.get("hreflang"):
                attributes["href"] = f"../{attributes['hreflang']}/"
            elif rel == "stylesheet" and attributes.get("href") == "__SITE_STYLESHEET__":
                attributes["href"] = "../assets/site.css"

        for name in ("href", "src"):
            value = attributes.get(name)
            if value and value.startswith("assets/"):
                attributes[name] = "../" + value
        for name in ("alt", "aria-label", "title"):
            value = attributes.get(name)
            if value:
                source = re.sub(r"\s+", " ", value).strip()
                attributes[name] = self.translations.get(source, value)

        serialized = "".join(
            f" {name}" if value is None else f' {name}="{html_escape_attr(value)}"'
            for name, value in attributes.items()
        )
        self.output.append(f"<{tag}{serialized}>")

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if not self.skip_svg and not self.skip_select and tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if self.skip_svg:
            if tag == "svg":
                self.skip_svg = False
            return
        if self.skip_select:
            if tag == "select":
                self.skip_select = False
            return
        if tag == "head" and not self.head_closed:
            self.output.append(f'<link rel="canonical" href="{BASE_URL}/{self.locale}/">')
            self.head_closed = True
        self.output.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        if self.skip_svg or self.skip_select:
            return
        if not data.strip():
            self.output.append(data)
            return
        leading = re.match(r"\s*", data).group(0)
        trailing = re.search(r"\s*$", data).group(0)
        source = re.sub(r"\s+", " ", data).strip()
        localized = self.translations.get(source, source)
        self.output.append(leading + html.escape(localized, quote=False) + trailing)

    def handle_entityref(self, name: str) -> None:
        self.output.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.output.append(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        self.output.append(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self.output.append(f"<!{decl}>")

    def unknown_decl(self, data: str) -> None:
        self.output.append(f"<![{data}]>")

    def result(self) -> str:
        if self.svg_index != len(SVG_GLYPHS):
            raise ValueError(f"Expected {len(SVG_GLYPHS)} inline icons, found {self.svg_index}.")
        if self.skip_svg or self.skip_select:
            raise ValueError("Unclosed SVG or language picker in source HTML.")
        return "".join(self.output)


def inject_static_showcase(source: str) -> str:
    tabs = []
    for index, (scene_id, label, *_rest) in enumerate(SCENES):
        selected = "true" if index == 0 else "false"
        tabindex = "0" if index == 0 else "-1"
        tabs.append(
            f'<button class="tab" type="button" role="tab" data-id="{scene_id}" id="tab-{scene_id}" '
            f'aria-controls="showcasePanel" aria-selected="{selected}" tabindex="{tabindex}">{html.escape(label)}</button>'
        )
    source, count = re.subn(
        r'<div class="tabs" role="tablist" id="tabs"></div>',
        '<div class="tabs" role="tablist" id="tabs" aria-label="Showcase">' + "".join(tabs) + "</div>",
        source,
        count=1,
    )
    if count != 1:
        raise ValueError("Could not find the empty showcase tabs container.")

    first = SCENES[0]
    _, _, image, heading, description, bullets = first
    source = source.replace(
        '<div class="stage" id="showcasePanel" role="tabpanel">',
        '<div class="stage" id="showcasePanel" role="tabpanel" aria-labelledby="tab-world">',
        1,
    )
    source = source.replace('<img id="stageImg" src="assets/shots/world-view.webp" alt="" width="1600" height="860">',
                            f'<img id="stageImg" src="assets/shots/{image}.webp" alt="{html.escape(heading, quote=True)}" width="1600" height="860">', 1)
    source = source.replace('<h3 id="stageHead"></h3>', f'<h3 id="stageHead">{html.escape(heading)}</h3>', 1)
    source = source.replace('<p id="stageText"></p>', f'<p id="stageText">{html.escape(description)}</p>', 1)
    source = source.replace('<ul class="checks" id="stageList"></ul>', '<ul class="checks" id="stageList">' + "".join(f'<li>{html.escape(line)}</li>' for line in bullets) + '</ul>', 1)
    return source


def make_runtime_script(source: str, locale: str, translations: dict[str, str]) -> str:
    script_match = re.search(r"<script>\s*(.*?)\s*</script>", source, re.S)
    if not script_match:
        raise ValueError("Could not find the inline page script.")
    script = script_match.group(1)
    locale_block = "/* ---------- localization ---------- */"
    repo_decl = "const REPO = 'Moon-yungg/CDKit-Releases';"
    start, end = script.index(locale_block), script.index(repo_decl)
    replacement = (
        "/* This bundle belongs to the static page in this locale. */\n"
        "      const currentLocale = document.documentElement.lang || 'en';\n"
        "\n"
    )
    script = script[:start] + replacement + script[end:]
    for start_marker, end_marker in (
        (
            "      onLanguageChange(() => {\n        tabs.querySelectorAll('.tab').forEach",
            "      const startAuto = () => {",
        ),
        (
            "      onLanguageChange(() => {\n        zoomable.forEach",
            "      document.addEventListener('click', e => {",
        ),
    ):
        if script.count(start_marker) != 1 or script.count(end_marker) != 1:
            raise ValueError("Could not locate a language-change callback block.")
        start = script.index(start_marker)
        end = script.index(end_marker, start)
        if end <= start:
            raise ValueError("Language-change callback markers are out of order.")
        script = script[:start] + script[end:]
    script = script.replace("      onLanguageChange(renderLatestRelease);\n", "")
    script = script.replace("next.src = `assets/shots/${s.img}.webp`;", "next.src = `../assets/shots/${s.img}.webp`;")

    scene_values = []
    for scene_id, label, image, heading, description, bullets in SCENES:
        localized_label = translations.get(label, label)
        scene_values.append({
            "id": scene_id,
            "label": localized_label,
            "title": f"CDKit — {localized_label}",
            "img": image,
            "head": translations.get(heading, heading),
            "text": translations.get(description, description),
            "list": [translations.get(line, line) for line in bullets],
        })
    scene_start = script.index("const scenes = [")
    scene_end = script.index("      const tabs = document.getElementById('tabs');", scene_start)
    script = script[:scene_start] + f"const scenes = {json.dumps(scene_values, ensure_ascii=False, separators=(',', ':'))};\n      " + script[scene_end:]

    old_create = """        const b = document.createElement('button');
        b.className = 'tab'; b.type = 'button'; b.role = 'tab'; b.dataset.id = s.id; b.id = `tab-${s.id}`;"""
    new_create = """        const b = tabs.querySelector(`[data-id=\"${s.id}\"]`) || document.createElement('button');
        b.className = 'tab'; b.type = 'button'; b.role = 'tab'; b.dataset.id = s.id; b.id = `tab-${s.id}`;"""
    if old_create not in script:
        raise ValueError("Could not locate the showcase tab creation code.")
    script = script.replace(old_create, new_create, 1)
    script = script.replace("        tabs.appendChild(b);\n", "        if (!b.isConnected) tabs.appendChild(b);\n", 1)
    script = script.replace("tr(s.head)", "s.head").replace("tr(s.text)", "s.text").replace("tr(line)", "line").replace("tr(s.label)", "s.label")
    script = re.sub(
        r"tr\('([^']*)'\)",
        lambda match: json.dumps(translations.get(match.group(1), match.group(1)), ensure_ascii=False),
        script,
    )
    if "onLanguageChange" in script or "languageSelect" in script or "applyLanguage" in script:
        raise ValueError("Runtime language switching remains in the generated script.")
    if re.search(r"\btr\s*\(", script):
        raise ValueError("Runtime translation calls remain in the generated script.")
    if "next.src = `assets/shots/${s.img}.webp`" in script:
        raise ValueError("Showcase assets were not updated for locale subdirectories.")
    return script


def make_root_redirect() -> str:
    codes = [code for code, _, _ in LANGUAGES]
    labels = "\n".join(f'<li><a href="./{code}/" lang="{code}">{html.escape(name)}</a></li>' for code, name, _ in LANGUAGES)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>CDKit — Choose a language</title>
  <script>
    (() => {{
      const supported = {json.dumps(codes)};
      const normalize = raw => {{
        if (!raw) return null;
        const value = String(raw).replace(/_/g, '-').toLowerCase();
        if (value.startsWith('zh')) return /(hant|tw|hk|mo)/.test(value) ? 'zh-TW' : 'zh-CN';
        if (value.startsWith('pt')) return 'pt-BR';
        return supported.find(code => code.toLowerCase() === value) ||
          supported.find(code => code.toLowerCase().split('-')[0] === value.split('-')[0]) || null;
      }};
      const query = normalize(new URLSearchParams(location.search).get('lang'));
      const browser = [...(navigator.languages || []), navigator.language].map(normalize).find(Boolean);
      location.replace(`./${{query || browser || 'en'}}/`);
    }})();
  </script>
  <noscript><meta http-equiv="refresh" content="0; url=./en/"></noscript>
  <style>
    :root {{ color-scheme: dark; font: 16px/1.5 Inter, system-ui, sans-serif; background: #1b1b1b; color: #fff; }}
    body {{ max-width: 40rem; margin: 8vh auto; padding: 2rem; }}
    a {{ color: #72a8ff; }} li {{ margin: .5rem 0; }}
  </style>
</head>
<body>
  <main>
    <h1>CDKit</h1>
    <p>Choose a language / 选择语言</p>
    <ul>{labels}</ul>
  </main>
</body>
</html>
"""


def main() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    translations = parse_translation_table(source)
    glyphs = parse_icon_catalog()

    style_match = re.search(r"<style>\s*(.*?)\s*</style>", source, re.S)
    if not style_match:
        raise ValueError("Could not find the source stylesheet.")
    css = style_match.group(1)
    css = css.replace(".btn svg", ".btn .fluent-icon")
    css = css.replace(".icon svg", ".icon .fluent-icon")
    css = css.replace(".pill .icon svg", ".pill .icon .fluent-icon")
    css, check_rule_count = re.subn(r"\s*\.checks li::before\s*\{.*?\n\s*\}", "", css, count=1, flags=re.S)
    if check_rule_count != 1:
        raise ValueError("Could not locate the source checkmark icon rule.")
    css = css.replace(".lang-select option {\n      background: #1b1b1b;\n      color: #fff;\n    }", "")
    css = css.replace(".lang-select {", ".lang-select {")
    css += f"""

@font-face {{
  font-family: 'CDKit Fluent Icons';
  src: url('./fluent-icons.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-display: block;
}}

.fluent-icon {{
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 1em;
  height: 1em;
  font-family: 'CDKit Fluent Icons';
  font-size: 1em;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
}}
.btn .fluent-icon {{ width: 24px; height: 24px; font-size: 24px; }}
.menu-btn .fluent-icon {{ width: 20px; height: 20px; font-size: 20px; }}
.icon .fluent-icon {{ width: 48px; height: 48px; font-size: 48px; }}
.pill .icon .fluent-icon {{ width: 40px; height: 40px; font-size: 40px; }}
.lightbox-close .fluent-icon {{ width: 24px; height: 24px; font-size: 24px; }}
.checks li::before {{
  content: '{chr(glyphs[CHECK_GLYPH])}';
  font-family: 'CDKit Fluent Icons';
  font-size: 24px;
  line-height: 24px;
  background: var(--grad);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}}

.lang-menu {{ position: relative; }}
.lang-select {{ display: flex; align-items: center; justify-content: space-between; gap: 10px; list-style: none; text-align: left; appearance: none; -webkit-appearance: none; }}
.lang-select::-webkit-details-marker {{ display: none; }}
.lang-select::marker {{ content: none; }}
.lang-chevron {{ font-size: 16px; }}
.lang-options {{
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 60;
  display: none;
  min-width: 188px;
  max-height: min(60vh, 360px);
  overflow: auto;
  padding: 6px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background: #242424f2;
  box-shadow: 0 18px 50px #0008;
  backdrop-filter: blur(16px);
}}
.lang-menu[open] .lang-options {{ display: grid; gap: 2px; }}
.lang-option {{ padding: 8px 10px; border-radius: 8px; color: var(--muted); font-size: 13px; }}
.lang-option:hover, .lang-option[aria-current='page'] {{ background: var(--surface-2); color: var(--text); }}
"""
    (ASSETS / "site.css").write_text(css.strip() + "\n", encoding="utf-8")

    body_template = source.replace(style_match.group(0), '<link rel="stylesheet" href="__SITE_STYLESHEET__">', 1)
    # The source page has a single inline script; interactions are emitted separately per fixed locale.
    body_template = re.sub(r"\s*<script>.*?</script>\s*", "\n", body_template, count=1, flags=re.S)
    body_template = body_template.replace('<button class="lightbox-close" type="button" aria-label="Close screenshot">×</button>',
                                          f'<button class="lightbox-close" type="button" aria-label="Close screenshot"><span class="fluent-icon" aria-hidden="true">&#x{glyphs[CLOSE_GLYPH]:X};</span></button>', 1)
    body_template = inject_static_showcase(body_template)

    for locale, _name, _og_locale in LANGUAGES:
        locale_translations = translations.get(locale, {})
        parser = StaticPage(locale, locale_translations, glyphs)
        parser.feed(body_template.replace("__SITE_STYLESHEET__", "../assets/site.css"))
        page = parser.result()
        runtime = make_runtime_script(source, locale, locale_translations)
        page = page.replace("</body>", f'<script src="../assets/site-{locale}.js" defer></script>\n</body>', 1)
        (DOCS / locale).mkdir(parents=True, exist_ok=True)
        (DOCS / locale / "index.html").write_text(page, encoding="utf-8")
        (ASSETS / f"site-{locale}.js").write_text(runtime.strip() + "\n", encoding="utf-8")

    (DOCS / "index.html").write_text(make_root_redirect(), encoding="utf-8")


if __name__ == "__main__":
    main()
