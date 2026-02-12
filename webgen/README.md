# Webgen

Welcome! This repo has not been initialized with git or npm. Feel free to run:

```
git init
npm init
```

Or add to existing repo!

## Config

Set some simple configs to tweak footer links and set the index page. This is completely customizable as this data get injected into `.ejs` and can be accessed using `<% key %>` to render `value`.

```js
{
  "name": string, // Site name - Appears in page title
  "links": [ // Array of link objects for footer
    {
      "name": string, // link name
      "href": string, // link href
    }
  ]
}

```

## Build

`npm run build` - build `.ejs` templates and markdown (`.md`) and `.html` files from `pages/` directory into the `docs/` or whichever root directory, It will also copy over all files in `static/` directory.

**You can change the root directory in config.json > root**. If you do not want a specific directory to build to, you can change root to `"."`. It will compile to your project root. It **will not** copy over all files in `static/` directory, nor styles.

## Development

`npm run serve` - runs `npm run build` and along with watch via `nodemon`. The build folder is served on `localhost:8080` via `http-server`

## Clean

`npm run clean` - cleans out example files for a fresh start.

## Directories

`pages`

Markdown and HTML files go here. Use `01_` prefix for indexing and `_` for spacing. If this convention is not followed, the build will break! Don't worry, we strip the numbers out on build.

```
📂 pages
 L  01_welcome.md
 L  02_what_we_offer.md
 L  03_about_us.html

```

`static`

Static images and files go here. This can include anything, we just copy over the directory on build. Link using `/static/<filename>`.

`styles`

CSS files go here. This is also just copied so be sure to add your own preprocessor if needed.

`views`

Add `.ejs` templates here. See <a href="https://ejs.co/#pages" target="_blank">EJS Docs</a> for more info on how to use this robust templating language.
