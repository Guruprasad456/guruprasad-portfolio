# Guruprasad Portfolio - GitHub Pages Package

This folder is a separate static package for publishing the portfolio on GitHub Pages.

It does not change the main project folder.

## What works in this package

- homepage and all main pages
- themed UI and animations
- case-study pages
- results and research pages
- static chatbot portfolio knowledge mode
- static demo previews for heart disease, study mood, diet planner, and playlist generator
- downloadable proof assets linked from the case studies

## What is replaced from the main project

- `server.py` is not included
- the live Flask HDD app is replaced by the static heart demo and case-study flow
- server APIs are replaced by built-in static preview behavior on GitHub Pages

## Files to upload

Upload the full contents of this folder to the GitHub repository root.

Keep the `pngm` folder because it contains:

- the notebook file
- the training script
- the dataset CSV
- the HDD video asset

## GitHub Pages URL

This package is prepared for:

`https://guruprasad456.github.io/guruprasad-portfolio/`

## Publish steps

1. Create or open the GitHub repository `guruprasad-portfolio`
2. Upload all files from this folder
3. Go to `Settings -> Pages`
4. Set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
5. Save

## Notes

- The GitHub Pages version is the permanent free static portfolio
- The full Python and Flask version still stays in the main project folder for local demos
