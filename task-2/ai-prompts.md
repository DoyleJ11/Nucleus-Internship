# Prompts used to build this project

## Prompt 1

Can you write a simple regex expression for my calculator app that checks for: "0-9, (, ), +, -, /, \*"

## Response:

Here's a regex that matches only those characters:

```
/^[0-9()+\-/*]+$/
```

This breaks down as:

- `^` and `$` anchor to the full string, ensuring nothing else sneaks in
- `[0-9()+\-/*]` is the character class allowing digits, parentheses, and the four operators
- `\-` is escaped inside the character class to avoid being interpreted as a range
- `+` outside the brackets means "one or more characters"

If you also want to allow spaces and decimal points (common in calculator inputs), you can expand it to:

```
/^[0-9()+\-/*.\s]+$/
```

Let me know if you need it adapted for a specific language or context!

## Prompt 2

Review my project (task-2 folder) for any security vulnerabilities or concerns before pushing to a github repository. Make sure there aren't any unnecessary files left over from the vite template or any misconfigured config files.

If everything looks good, remind me how to push this typescript project to github pages with the gh-pages npm package.

## Response:

Project looks solid overall. Here's my review:

## Security

**No vulnerabilities found.** Key positives:

- Input sanitization in `sanitize.ts` is well done — strict regex whitelist (`/^[0-9+\-*/().]+$/`), length cap, balanced parentheses check, all before passing to `mathjs.evaluate()`
- CSP meta tag in `index.html` restricts script/style sources
- No `dangerouslySetInnerHTML`, no external API calls, no secrets/env files
- localStorage parsing has proper try/catch

## Cleanup Items

**1. Unused type** — `ConversionCategory` in `src/types/calculator.ts:7` is never used anywhere in the project.

**2. Missing favicon** — `index.html:5` references `/favicon.svg` but no `public/` folder or favicon file exists. This will 404.

**3. `ai-prompts.md`** — Nearly empty (just a heading). Decide if you want to keep or remove it.

No leftover Vite template files (`vite.svg`, `react.svg`, `App.css`) — those are already cleaned up.

## Config

Everything is properly configured:

- `vite.config.ts` has `base: "/nucleus-internship/"` set correctly for GitHub Pages
- `package.json` has `predeploy` and `deploy` scripts ready
- `.gitignore` covers `node_modules` and `dist`
- TypeScript and ESLint configs are clean

---

## Deploying to GitHub Pages with gh-pages

You already have `gh-pages` installed and the deploy scripts configured. After pushing your code to GitHub:

```bash
# 1. Build and deploy to GitHub Pages
npm run deploy
```

That's it — `predeploy` runs the build automatically, then `gh-pages` pushes the `dist/` folder to a `gh-pages` branch.

Then in your GitHub repo settings, go to **Settings > Pages** and set the source to **Deploy from a branch** with the `gh-pages` branch and `/ (root)`.

Your site will be live at `https://<your-username>.github.io/nucleus-internship/`.
