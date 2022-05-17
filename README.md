# Webgen

<p align="center">
    <img src="./webgen-logo.png" alt="Image" width="256"/>
</p>

Build websites like it's 2004. Create super simple web pages using [Markdown](https://www.markdownguide.org/) and/or HTML. Comes with templating via `ejs`. Built with node and typescript, it's perfect for github pages or simple resume sites!

This is pretty bare-bones and does _yet_ not include:

- typescript support
- CSS preprocessing

So keep it simple! Or expand this! You can use Javascript directly in `.ejs` files. You can also dig into the `build.ts` and hijack the `copyDir` to add any preprocess stuff. Hack away 🤓!!

## Demo

Check out [these cool pages](https://petergrillot.github.io/webgen) built with just `Markdown` and some `html`.

### Config

Set some simple configs to tweak footer links and set the index page. This is completely customizable as this data get injected into `.ejs` and can be accessed using `<% key %>` to render `value`.

```js
{
  "name": string, // Site name - Appears in page title
  "root": string // Root folder to serve on
  "links": [ // Array of link objects for footer
    {
      "name": string, // link name
      "href": string, // link href
    }
  ]
}
```

### Build

`npm run build` - build `.ejs` templates and markdown (`.md`) and `.html` files from `pages/` directory into the `docs/` or whichever root directory. It will also copy over all files in `static/` directory.

### Development

`npm run dev` - runs `npm run build` and serves on `localhost:8080` via `http-server`

### Clean

`npm run clean` - cleans out example files for a fresh start.

### Directories

`pages`

Markdown and HTML files go here. Use `01_` prefix for indexing and `_` for spacing. If this convention is not followed, the build will break! Don't worry, we strip the numbers out on build.

```
📂 pages
 L  01_welcome.md
 L  02_what_we_offer.md
 L  03_about_us.html

```

#### Subdirectories

You can also nest one level in a directory with the same numbered prefix naming.

> **Important** Nested directories can only exist after an index file `01_<name>.html` or `01_<name>.md`. This makes it easier to handle index pages.

Consider the following:

```
📂 pages
 L 01_welcome.md
 L 📂 02_what_we_offer
    L 01_products.html
    L 02_services.md
 L 03_about_us.html
```

`static`

Static images and files go here. This can include anything, we just copy over the directory on build. Link using `/static/<filename>`.

`styles`

CSS files go here. This is also just copied so be sure to add your own preprocessor if needed.

`views`

Add `.ejs` templates here. See <a href="https://ejs.co/#pages" target="_blank">EJS Docs</a> for more info on how to use this robust templating language.
