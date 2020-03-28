import {Asset} from "parcel";
import {parse} from "./TweeParser";
import {stringifyStory} from "./TweeMdx";

module.exports = class TweeAsset extends Asset {
    constructor(name: any, pkg: any, options: any) {
        super(name, pkg, options);
        this.type = "js";
    }

    async generate() {
        const story = parse(this.contents);
        const stringified = await stringifyStory(story);
        return [
            {
                type: "js",
                value: stringified
            }
        ];
    }
};
