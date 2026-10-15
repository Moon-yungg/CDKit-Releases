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

CDKit updates itself. Mods are separate packages next to the game's own. To load one, CDKit changes a few small game
files: it adds the mod to the game's package list (`meta\0.papgt`), and only where the mod needs it, it adjusts the
texture header list (`meta\0.pathc`, for replaced textures) or one letter in a base pack index (for example
`0015\0.pamt`, for an edited sector level, so the game loads the mod's copy instead of both). The previous package list is
backed up to `%LOCALAPPDATA%\CDKit\backups`, the other changes are recorded in the mod's folder, and **Uninstall** puts
everything back. After a game update CDKit checks these files when it starts and offers to reinstall or remove the mods;
Steam's "Verify integrity of game files" restores the original game at any time.

---

<sub>CDKit is a free, fan-made modding tool, not affiliated with or endorsed by Pearl Abyss. Crimson Desert is a
trademark of its respective owner.</sub>
