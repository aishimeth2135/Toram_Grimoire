# Contributing to Cy's Grimoire

Thanks for your interest in contributing. This guide covers two main contribution paths: **UI translations** (the app's interface strings) and **game data translations** (in-game names for equipment, skills, crystals, etc.).

## Setup

You need **Node.js** and **Yarn v4**.

```bash
# Install dependencies
yarn install

# Start the dev server (http://localhost:9039)
yarn dev
```

Use Yarn — not npm.

## Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `zh-TW` | Traditional Chinese | Source language (complete) |
| `en` | English | In progress |
| `zh-CN` | Simplified Chinese | In progress |
| `ja` | Japanese | Partial |

Traditional Chinese (`zh-TW`) is the base language. All other languages are translated from it.

---

## 1. UI Translations (`src/locales/`)

These are the strings that appear in the app's interface — button labels, page titles, form fields, notifications, and so on.

### File structure

```
src/locales/
├── zh-TW/        ← source of truth
├── en/
├── zh-CN/
└── ja/
```

Each language folder contains the same set of YAML files:

| File | Contents |
|------|----------|
| `app.yaml` | Page titles, settings panel, notices, loading messages |
| `common.yaml` | Equipment slots, stat names, shared component strings |
| `global.yaml` | Generic UI labels (buttons, actions) |
| `skill-query.yaml` | Skill browser |
| `skill-simulator.yaml` | Skill simulator |
| `character-simulator.yaml` | Character builder |
| `enchant-simulator.yaml` | Enchantment simulator |
| `enchant-doll.yaml` | Enchant doll feature |
| `crystal-query.yaml` | Crystal browser |
| `item-query.yaml` | Item browser |
| `registlet-query.yaml` | Registlet browser |
| `damage-calculation.yaml` | Damage calculator |
| `main-quest-calc.yaml` | Main quest calculator |
| `book-template.yaml` | Book/guide templates |

### Format

YAML with hierarchical keys. The key structure must match the source file exactly.

**`src/locales/zh-TW/global.yaml` (source):**
```yaml
confirm: 確認
cancel: 取消
close: 關閉
search: 搜尋
```

**`src/locales/en/global.yaml` (translation):**
```yaml
confirm: Confirm
cancel: Cancel
close: Close
search: Search
```

Some strings contain interpolation placeholders — keep them as-is:

```yaml
# zh-TW source:
remove-character-success: 已刪除「{name}」

# en translation — preserve {name}:
remove-character-success: Deleted "{name}"
```

### How to contribute

1. Compare the `zh-TW` file against the corresponding file in your target language.
2. Add or correct any missing or inaccurate entries. Keep the same key hierarchy.
3. Do not add or remove keys — only translate values.
4. Run `yarn pretty` before submitting to format the files.

If a string in `zh-TW` doesn't have a direct equivalent in your language, translate the meaning, not the characters literally.

---

## 2. Game Data Translations (`src/data/`)

In-game item names, skill names, and other game-specific terms are stored separately from UI strings. The base data files contain Traditional Chinese names; language overlays provide translated names on top.

### File naming

```
src/data/
├── equipment.json          ← base data (zh-TW names)
├── equipment.en.json       ← English names overlay
├── equipment.zh_cn.json    ← Simplified Chinese overlay
├── equipment.ja.json       ← Japanese overlay
├── skill.json
├── skill.en.json
...
```

Not every data type has all language overlays — check what exists before starting.

### Overlay format by data type

#### Equipment, crystals, potions, registlets

The key is the **original Traditional Chinese item name** from the base file. The value is an object with a `name` field.

**`equipment.en.json`:**
```json
{
  "1周年寶劍": { "name": "1st Anniv Sword" },
  "1周年寶劍 II": { "name": "1st Anniv Sword II" },
  "黑暗之翼": { "name": "Wings of Darkness" }
}
```

To find the Chinese key, look at the corresponding `.json` base file and use the `name` field as the key.

#### Skills

Keys follow an ID-based pattern: `category:id`, `tree:catId:treeId`, `skill:catId:treeId:skillId`.

**`skill.en.json`:**
```json
{
  "category:0": { "name": "Weapon Skills" },
  "tree:0:0": { "name": "Sword Skills" },
  "skill:0:0:0": { "name": "Power Attack" },
  "skill:0:0:1": { "name": "Swift Attack" }
}
```

Match the numeric IDs from `skill.json` exactly.

#### Stats and glossary

**`stats.en.json`** and **`glossary.en.json`** also use the zh-TW name as key:
```json
{
  "有效ATK與有效MATK": { "tagName": "Valid ATK and Valid MATK" }
}
```

### How to contribute

1. Open the base `.json` file to find items that need translation.
2. Open (or create) the corresponding language overlay file (e.g., `equipment.en.json`).
3. Add entries for items that are missing or incorrect. You do not need to include every item — the app falls back to the zh-TW name for anything not in the overlay.
4. Keep entries in the same order as the base file where possible.
5. Run `yarn pretty` before submitting.

**You only need to add entries that differ from the zh-TW name.** If an item has no official localized name, use the commonly accepted community translation or romanization.

---

## 3. Submitting Changes

1. Fork the repository and create a branch (`translation/en-skills`, `data/en-equipment`, etc.).
2. Make your changes following the guidelines above.
3. Run `yarn pretty` and `yarn lint` — fix any issues before opening a PR.
4. Open a pull request describing what was translated and any translation decisions you made.

For large data contributions (e.g., translating all equipment), it's fine to split the PR by category or data file to keep reviews manageable.

---

## Notes

- **Do not edit `zh-TW` files** unless correcting a genuine error in the source — all translations derive from them.
- **Do not rename keys** in any YAML or JSON file. Key names are referenced in code.
- If you're unsure about a translation, open a PR anyway and note the uncertainty — a discussion in the PR is better than nothing being translated at all.
