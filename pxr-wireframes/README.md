# PXR 2.0 wireframes

A clickable draft of the PXR 2.0 dossier review tool, built as plain HTML, CSS and JavaScript. There's no build step and nothing to install.

## Opening it

1. Unzip the folder. Keep all the files together, including the `assets` folder.
2. Open `index.html` in a browser (double-click it, or drag it into a browser window).
3. Start at **Sign in** to walk through the weekly flow, or jump to any screen from the list. On the sign-in screen, any email and password work.

The Public Sans font loads from Google Fonts when you're online. Offline, the pages fall back to your system font and everything else still works.

## Screens

| File | Screen | What it shows |
|---|---|---|
| `signin.html` | Sign in | Email and password sign-in |
| `this-week.html` | This week | New proposals with alignment flags, filters and status |
| `dossier.html` | Dossier review | Dossier sections, editing, citations, source document, notes, approval |
| `weekly-email.html` | Weekly email | Approved dossiers assembled into one email, recipients, send |
| `archive.html` | Archive | Search and filter past dossiers |
| `priorities.html` | Priorities and sources (admin) | Policy sources, priority weights, Intervene threshold |
| `weekly-run.html` | Weekly run (admin) | Schedule, EUR-Lex search settings, run history, analyze one proposal |

## The weekly flow

1. **This week:** open a proposal.
2. **Dossier review:** edit if needed, check citations against the source, add notes, then **Approve**.
3. **Weekly email:** confirm the recipients and the list of approved dossiers, then **Send weekly email**.

## Color themes

Every screen has a **Color theme** menu: Blue, EU, American, Dark, and Grayscale wireframe. The choice carries across screens. Use Grayscale wireframe when reviewing layout only.

The eagle and star marks are simple original shapes, not the Great Seal of the United States or the official EU emblem, which have usage restrictions.

## Notes for the team

- All content in [brackets] is placeholder text. Nothing here is real data.
- Buttons only simulate their result. Nothing is saved, sent or uploaded, and state resets when you reload a page.
- The **Legislative stage** strip on the dossier page is a bonus feature, shown dashed on purpose.
- Out of scope per the partner kickoff: version history, State Department single sign-on, and SharePoint integration.
- Open items to confirm with the partner: Intervene and Monitor thresholds, whether priority weights change ratings or only sorting, who can approve and send, and whether one weekly email is the right delivery format.

## Editing

- `assets/styles.css` holds all colors and themes. Each theme is a block of CSS variables near the top.
- `assets/app.js` builds the sidebar, handles themes, and holds the sample proposal data.
- Each screen's own behavior is in a short script at the bottom of its HTML file.
