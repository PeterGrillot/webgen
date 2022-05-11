# Webgen

<p align="center">
    <img src="./webgen-logo.png" alt="Image" width="256"/>
</p>

Build websites like it's 2004. Create super simple web pages using `Markdown`. Also comes with templating via `ejs`. Build with node and typescript, it's perfect for github pages or simple resume sites!

### Config

Set some simple configs to tweak footer links and set the index page.

```js
{
  "name": string, // Site name - Appears in page title
  "index": string, // Which markdown page should be index.html
  "links": [ // Array of link objects for footer
    {
      "name": string, // link name
      "href": string, // link href
    }
  ]
}
```

### Build

`npm run build` - build `.ejs` templates and markdown (`.md`) and `.html` files from `docs/` directory into the `dist/` directory. It will also copy over all files in `static/` directory.

### Development

`npm run dev` - runs `build` and serves on `localhost:8080`.build

### Clean

`npm run clean` - clears out example files.

### Directories

`docs`

Markdown files go here. Use `01_` prefix for indexing and `_` for spacing. If this convention is not followed, the build will break! Don't worry, we strip the numbers out on build.

```
📂 docs
 L  01_welcome.md
 L  02_what_we_offer.md
 L  01_about_us.md

```

`static`

Static images and files go here. This can include anything, we just copy over the directory on build. Link using `/static/<filename>`.

`styles`

CSS files go here. This is also just copied so be sure to add your own preprocessor if needed.

`views`

Add `.ejs` templates here. See <a href="https://ejs.co/#docs" target="_blank">EJS Docs</a> for more info on how to use.
