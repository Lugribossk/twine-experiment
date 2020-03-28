// https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md
import fs from "fs";

type Json = null | boolean | number | string | Json[] | {[prop: string]: Json};

export type Story = {
    name: string;
    metadata: StoryMetadata;
    passages: Passage[];
};

export type StoryMetadata = {
    ifid: string;
    [prop: string]: Json;
};

export type Passage = {
    name: string;
    tags: string[];
    metadata: {[prop: string]: Json};
    linksTo: string[];
    content: string;
};

const parseHeader = (input: string): Passage => {
    const match = input.match(/:: ([^[{]+)(?:\[([^\]]+)\])? ?(?:({.+$))?/);
    if (!match) {
        throw new Error("Malformed passage header");
    }
    const name = match[1];
    const tags = match[2];
    const metadata = match[3];

    return {
        name: name,
        tags: tags ? tags.split(" ") : [],
        metadata: metadata ? JSON.parse(metadata) : {},
        linksTo: [],
        content: ""
    };
};

const parseStoryMetadata = (input: string): StoryMetadata => {
    if (!input) {
        throw new Error("StoryData passage must not be empty.");
    }
    if (input[0] !== "{") {
        throw new Error("StoryData passage content must be a JSON object.");
    }

    let metadata;
    try {
        metadata = JSON.parse(input);
    } catch (e) {
        throw new Error(`StoryData must be valid JSON: ${e.message}`);
    }
    if (!metadata.ifid || typeof metadata.ifid !== "string") {
        throw new Error("StoryData must have an 'ifid' property.");
    }

    return metadata;
};

export const parse = (input: string): Story => {
    try {
        let name: string | undefined = undefined;
        let metadata: StoryMetadata | undefined = undefined;
        const passages: Passage[] = [];
        let currentPassage: Passage | undefined;
        const finalizeCurrentPassage = () => {
            if (!currentPassage) {
                return;
            }
            currentPassage.content = currentPassage.content.trim();
            if (currentPassage.name === "StoryTitle") {
                name = currentPassage.content;
            } else if (currentPassage.name === "StoryData") {
                metadata = parseStoryMetadata(currentPassage.content)
            } else {
                passages.push(currentPassage);
            }
        };

        input.split("\r\n").forEach((line, i) => {
            try {
                if (line.startsWith("::")) {
                    finalizeCurrentPassage();
                    currentPassage = parseHeader(line);
                    return;
                }

                if (!currentPassage) {
                    if (line) {
                        throw new Error("Content outside passage.");
                    }
                    return;
                }

                currentPassage.content += line + "\r\n";
            } catch (e) {
                throw new Error(`Line ${i + 1}: ${e.message}`);
            }
        });
        finalizeCurrentPassage();

        if (!name) {
            throw new Error("StoryTitle passage not found.")
        }
        if (!metadata) {
            throw new Error("StoryData passage not found.");
        }

        return {
            name: name,
            metadata: metadata,
            passages: passages
        };
    } catch (e) {
        throw new Error(`Error while parsing story: ${e.message}`);
    }
};
//
// const blah = parse(fs.readFileSync("test/test.twee", "utf8"));
//
// console.log(blah);
