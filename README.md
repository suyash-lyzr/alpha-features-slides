# Alpha — an introduction

A short presentation website introducing Alpha by Lyzr: why teams need it, what it builds, and how a company stays in control. It is self-contained (HTML, CSS and JavaScript, no build step), made for clients to click through on their own.

## Open it

```bash
cd alpha-features-slides
python3 -m http.server 8643
```

Then open http://localhost:8643.

| Key | Does |
| --- | --- |
| → / Space | Next slide |
| ← | Previous slide |
| M | Menu: outline and full screen |
| F | Full screen |
| Esc | Close the menu |

## Edit it

- Slides are the `<section class="slide">` elements in `index.html`, in order.
- `data-part` and `data-title` on a slide drive the outline and the progress bar.
- The slide counts on the cover agenda are typed by hand; update them if you add or remove a slide.
- Brand colours and type live at the top of `styles.css`. Aeonik is the brand face; Inter stands in until its licensed file is added.
- The page asks search engines not to list it (`noindex` in `index.html`), since Alpha isn't released yet. Remove that line at launch.
