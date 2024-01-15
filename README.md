# What?
Webpack Loader for Markdown
Load Content and Abstract Syntax Tree as imports in Webpack bundled code.

# Why
Extract fragments of .MD files as both Markdown content and corresponding
parsed structure. Can be rendered or further processed. Present loaders
are buggy or totally inoperable and otherwise not readily menable for use
to convenient extract a portion of markdown.

# Use
* Extracted fragments arre also wrapped in a 'root' node

* ```typescript
  import mkdnFile from "./README.md";
  console.assert(typeof mkdnFile.fragment === "string");
  console.assert(typeof mkdnFile.ast === Object && mkdnFile.ast.type === "root");
  
  import mkdnFrag from "./README.md#use";
  console.assert(typeof mkdnFrag.fragment === "string");
  console.assert(typeof mkdnFrag.ast === Object && mkdnFrag.ast.type === "root");
  ```

* `mkdown.ast` is serializable to JSON.