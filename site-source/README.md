# GitHub Pages source

`index.html` is the maintained source template for the CDKit landing page. Its copy and existing layout are kept here;
`scripts/build_pages.py` renders the available translations into standalone pages under `docs/<locale>/`, extracts the
shared stylesheet and creates one fixed-locale interaction bundle per page. The language menu is ordinary links, so
changing a language navigates to a separate static HTML document. `docs/index.html` only detects the browser language
once and redirects to the matching route; a language can also be selected without JavaScript.

The generated pages use the Fluent System Icons regular font. `fluent-icons.json` lists only the glyphs used by the page;
`scripts/subset_fluent_icons.py` crops the upstream TTF to those codepoints and writes the WOFF2 served from
`docs/assets/fluent-icons.woff2`. Install `scripts/requirements-site.txt` before regenerating that asset. Keep the font
license beside the published subset.

From the repository root:

```powershell
python scripts/build_pages.py
python -m pip install -r scripts/requirements-site.txt
python scripts/subset_fluent_icons.py --source path/to/FluentSystemIcons-Regular.ttf
python scripts/build_pages.py
```
