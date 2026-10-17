<p align="center"><img src="docs/assets/logo.svg" width="96" alt="CDKit"></p>

<h1 align="center">CDKit</h1>
<p align="center"><b>The modding toolkit for Crimson Desert</b><br>
Edit the world, sculpt terrain, write quests, add characters – and install it all into the game with one click.</p>

<p align="center">
  <a href="https://moon-yungg.github.io/CDKit-Releases/">Website</a> ·
  <a href="https://github.com/Moon-yungg/CDKit-Releases/releases/latest">Download</a> ·
  <a href="https://github.com/Moon-yungg/CDKit-Releases/wiki">Guide</a> ·
  <a href="https://discord.gg/HfkShRJZU">Discord</a>
</p>

![CDKit world editor](docs/assets/shots/world-view.webp)

## Get started

1. Download `CDKit.zip` from the [latest release](https://github.com/Moon-yungg/CDKit-Releases/releases/latest).
2. Unpack it into a folder of your own (not the game folder, not `Program Files`).
3. Start `CDkit.exe` and follow the [getting started guide](https://github.com/Moon-yungg/CDKit-Releases/wiki/Getting-Started).

CDKit updates itself. **No original game file is changed:** your mods are built into CDKit's own folder, and its small
runtime `cdkit.asi` (loaded by an ASI loader such as Ultimate ASI Loader in `bin64`) shows them to the game while it
runs, with the game's package list, texture headers and pack index entries the mods need. Several mods load together
in a load order; where two of them change the same thing, CDKit lists the conflict and who wins. **Uninstall** takes
everything out at once, and game updates or Steam's "Verify integrity of game files" no longer remove your mods.

---

<sub>CDKit is a free, fan-made modding tool, not affiliated with or endorsed by Pearl Abyss. Crimson Desert is a
trademark of its respective owner.</sub>
