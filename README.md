# Sky Grace website

## Adding photos to a project's gallery carousel

Each project on the Portfolio page can show a single photo (the default) or a full carousel of multiple photos. This is controlled by folders, not by editing HTML.

1. Find the project's folder under `assets/images/gallery/<project-slug>/`. One folder already exists per project, e.g.:
   - `assets/images/gallery/beam-house/`
   - `assets/images/gallery/the-nalukettu/`
   - `assets/images/gallery/rubble-house/`
   - `assets/images/gallery/suite-president/`
   - `assets/images/gallery/curia-room/`
   - `assets/images/gallery/bishop-house/`
   - `assets/images/gallery/mar-aprem-seminary/`
   - `assets/images/gallery/suresh-gopi-residence/`
   - `assets/images/gallery/mar-sleeva-convention-centre/`
   - `assets/images/gallery/st-marys-knanaya-church/`
2. Drop the photo(s) for that project into its folder. Name them so alphabetical order matches the order you want them to appear in, e.g. `01.jpg`, `02.jpg`, `03.jpg`.
3. Double-click `update-gallery.bat` in this folder. It scans every gallery folder and regenerates `assets/js/gallery-manifest.js`, which is what the site actually reads — dropping a photo into a folder alone does nothing until this step runs.
4. Refresh the page. Any project with 2+ photos now shows a "N photos" badge on its thumbnail, and its Gallery button opens a carousel with arrows, dots, keyboard arrow-key navigation, and swipe-to-navigate on mobile. Projects still at 0 or 1 photo behave exactly as before (single image, no carousel controls).

Supported file types: `.jpg`, `.jpeg`, `.png`, `.webp`,  `.mp4`.
Youtube also.
