import { Root, RootContent, Heading, Text } from "mdast";
import remarkStringify from "remark-stringify";
import { validate } from "schema-utils";
import { LoaderContext } from "webpack";
import remarkParse from "remark-parse";
import { unified } from "unified";

const debug = await import("debug").then((d) => d.default("rc:md-loader"));

interface LoaderProperties {}

const schema = {
  type: "object" as "object",
  properties: {}
};

export default function (
  this: LoaderContext<LoaderProperties>,
  source: string
): string {
  // Get options from webpack loader & validate
  const options = this.getOptions();
  validate(schema, options, {
    name: "md-loader",
    baseDataPath: "options"
  });

  
  const { resourceFragment, resourcePath, mode } = this;
  const parser = unified().use(remarkParse);
  const ast = parser().parse(source);

  let result = { ast, fragment: source };

  if (resourceFragment.trim().length > 0) {
    const frag = resourceFragment.trim();
    let rootElm: RootContent | Root = ast;
    let searchStack: (RootContent | Root)[] = [];

    console.assert(rootElm.type == "root");

    searchStack.push(rootElm);

    let nodesExamined = 0;

    for (;;) {
      const c = searchStack.shift();
      if (c === undefined) {
        debug(`FRAG SEARCH: examined ${nodesExamined}; did not find.`);
        return "export default undefined";
      }

      nodesExamined += 1;

      if (
        c.type === "heading" &&
        c.children.length == 1 &&
        c.children[0]!.type === "text"
      ) {
        const hding = c.children.at(0)!;
        if (
          hding.type === "text" &&
          "#" +
            hding.value
              .split(/\s+/)
              .map((w) => w.toLowerCase())
              .join("-") ===
            frag
        ) {
          const sectionNodes = [c as RootContent];
          while (searchStack.length > 0) {
            const stackNode = searchStack.shift();
            nodesExamined++;
            if (
              stackNode === undefined ||
              (stackNode.type === "heading" && stackNode.depth <= c.depth)
            )
              break;
            sectionNodes.push(stackNode as any);
          }

          const strFrag = unified()
            .use(remarkStringify)
            .stringify({ type: "root", children: sectionNodes });
          result = {
            ast: { type: "root", children: sectionNodes },
            fragment: strFrag
          };
           debug(
            `FRAG SEARCH: examined ${nodesExamined}: found fragment: ${strFrag.substring(
              0,
              32
            )}`
          );
          break;
        }
      }
      if (Array.isArray((c as any).children)) {
        searchStack.push(...(c as any).children);
      }
    }
  }

  return `export default ${JSON.stringify(result)};`;
}
