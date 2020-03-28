import {Passage, Story} from "./TweeParser";
import mdx from "@mdx-js/mdx";

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
    const content = passage.content.replace(/\[\[([^\]]+)\]\]/g, (match, link) => {
        const {text, target} = parseLink(link);
        return `<Link to="${target}">${text}</Link>`;
    });

    let code = await mdx(content);
    code = code.replace("export default ", "")
        .replace(/export const/g, "const");
    code += "return MDXContent;";

    const text = JSON.stringify(passage);

    return `${text.slice(0, -1)},createComponent() {${code}}}`;
};

export const stringifyStory = async (story: Story) => {
    const passageTexts = await Promise.all(story.passages.map(stringifyPassage));
    const {passages, ...rest} = story;
    const storyText = JSON.stringify(rest);

    return `/* @jsx mdx */
import React from "react";
import {mdx} from "@mdx-js/react";
module.exports = ${storyText.slice(0, -1)},"passages": [${passageTexts.join(",")}]}
`;
};
