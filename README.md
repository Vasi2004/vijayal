# Vasi & Vijayal's Kutty House

The site, split into readable files. Every file starts with a comment saying
what it holds and what it controls.

## Where to change things

| I want to... | Open |
|---|---|
| Add or change songs | `music.jsx` (the `PLAYLIST` at the top) |
| Move something in the scene | `scene/scene.jsx` |
| Change the sky colours or the mountains | `scene/scene.jsx` (top of the file) |
| Redraw a house, tree, bush or the sun/moon | `scene/pixeldata.js` |
| Change how walking / jumping / hugging works | `scene/couple.jsx` |
| Change the falling petals, hearts, stars, fireworks | `scene/weather.jsx` |
| Change the stream, its shimmer or the paths | `scene/river.jsx` |
| Change colours, fonts or button styles | `styles.jsx` |
| Change the password | `sections/login.jsx` |
| Change a tab's contents | `sections/timeline.jsx`, `sections/gallery.jsx`, `sections/mailbox.jsx`, `sections/about.jsx` |
| Change how things save | `store.jsx` (what to save) or `storage.js` (where) |

## Layout

    App.jsx        ties the tabs together
    main.jsx       starts the app
    styles.jsx     all the CSS
    store.jsx      what gets saved
    storage.js     where it gets saved (your Supabase project)
    music.jsx      the CD player and playlist
    gsap.js        loads the animation library

    sections/      the four tabs and the login screen
    scene/         everything that draws the world

Supporting files inside `scene/`: `scene.jsx` decides where everything sits,
`pixelcore.jsx` is the pixel-drawing engine, `pixeldata.js` holds the artwork,
`pixelart.jsx` places it, `couple.jsx` is the two of you walking about,
`river.jsx` the stream, `weather.jsx` the petals and stars, `doodles.jsx` the
small drawings, `sprites.js` the character images, and `carousel.jsx` the
floating photo fan.

## Putting it online

1. Unzip this folder
2. Upload everything to your GitHub repo, keeping `sections` and `scene` as
   folders. GitHub's web uploader flattens folders if you drag the files
   inside them, so drag the **folders themselves**. Easier still: use GitHub
   Desktop, or drag the whole unzipped folder onto the upload page.
3. Vercel redeploys by itself

If you are setting up fresh: run `supabase-setup.sql` once in Supabase
(SQL Editor -> New query -> paste -> Run), then deploy the repo on Vercel with
the **Vite** preset.

To run it on your own laptop first:

```bash
npm install
npm run dev
```

## Notes

- Nothing about how the site looks or behaves changed in this split; the built
  result is byte-for-byte the same size as before.
- The password is checked in the browser. It keeps the page private from
  anyone who stumbles on the link, but it is not strong security.
- Music streams from your Dropbox links, so those need to stay shared with
  "anyone with the link".
- Free Supabase projects sleep after long inactivity. If the site ever loads
  empty, open your Supabase dashboard once to wake it.
