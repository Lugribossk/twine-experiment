import fs from "fs";
import mdx from "@mdx-js/mdx";
import {Passage, Story} from "./TweeParser";

const parseLink = (link: string) => {
    if (link.includes("|")) {
        const parts = link.split("|");
        return {
            text: parts[0],
            target: parts[1]
        };
    }
    if (link.includes("->")) {
        const parts = link.split("->");
        return {
            text: parts[0],
            target: parts[1]
        };
    }
    if (link.includes("<-")) {
        const parts = link.split("<-");
        return {
            text: parts[1],
            target: parts[0]
        };
    }
    return {
        text: link,
        target: link
    };
};

const stringifyPassage = async (passage: Passage) => {
    let code = "";
    let content = "";
    if (passage.content.includes("\r\n---\r\n")) {
        const parts = passage.content.split("\r\n---\r\n");
        code = parts[0];
        content = parts[1];
    } else {
        content = passage.content;
    }

    const imports: string[] = [];

    // Convert [[blah]] passage links to <Link> components.
    const linksAsComponents = content.replace(/\[\[([^\]]+)\]\]/g, (match, link) => {
        const {text, target} = parseLink(link);
        return `<Link to="${target}">${text}</Link>`;
    });

    let component = await mdx(linksAsComponents);
    // Fix the component being export default'ed which we can't use.
    component = component.replace("export default ", "")
        // Fix MDX variables being declared as exports in the content section.
        .replace(/export const/g, "const")
        // Try to fix {} in JSX children on lines with plain text.
        // TODO This forces it to be a string, but what if it's another JSX element?
        .replace(/({`.*)({[^}]+}().*`})/g, (match, before, js, after) => `${before}\$${js}${after}`)
        // Insert code block inside the component render function.
        .replace("return <MDXLayout", `${code};\r\nreturn <MDXLayout`)
        // Remove imports so we can insert them at the top of createComponent() as require.
        .replace(/import (.+?) from (.+?);\r\n/g, (match, vars, file) => {
            imports.push(`const ${vars} = require(${file});\r\n`);
            return "";
        });
    // Remove makeShortcode declaration.
    component = component.substr(227);

    const text = JSON.stringify(passage, undefined, 4);

    return `${text.slice(0, -1)},createComponent() {
${imports.join("")}
${component}
return MDXContent;
}}`;
};

export const stringifyStory = async (story: Story) => {
    const passageTexts = await Promise.all(story.passages.map(stringifyPassage));
    const {passages, ...rest} = story;
    const storyText = JSON.stringify(rest, undefined, 4);

    const file = `/* @jsx mdx */
import React from "react";
import {mdx} from "@mdx-js/react";
const makeShortcode = name => function MDXDefaultShortcode(props) {
    throw new Error("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
};
module.exports = ${storyText.slice(0, -1)},"passages": [${passageTexts.join(",")}]}
`;
    await fs.promises.writeFile("target/temp.js", file, "utf8");
    return file;
};
