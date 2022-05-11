# Webgen

<p align="center">
    <img src="./webgen-logo.png" alt="Image" width="256"/>
</p>

Build websites like it's 1998. Create simple web pages using `ejs` and `Markdown`.

### Config

Set some simple configs

```json
{
  "name": string, // Site name - Appears in page title and header
  "index": string, // Which markdown page should be index.html
  "links": [ // Array of link objects for footer
    {
      "name": string, // link name
      "href": string, // link href
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

Markdown files go here.

`static`

Static images go here.

`styles`

CSS files go here, beware to add your own preprocessor.

`views`

Add `.ejs` templates here.
