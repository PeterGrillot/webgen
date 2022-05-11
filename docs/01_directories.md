# Webgen

![Webgen Logo](/static/webgen-logo.png 'Webgen logo')

Build websites like it's 2004. Create super simple web pages using `Markdown`. Also comes with templating via `ejs`. Build with node and typescript, it's perfect for github pages or simple resume sites!

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

Add `.ejs` templates here. See [EJS Docs](https://ejs.co/#docs) for more info on how to use.
