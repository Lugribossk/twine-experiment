import React from "react";
import {Passage, Story} from "./twee/TweeParser";
import Store from "./flux/Store";
import {createStoreContext} from "./flux/StoreContext";

const [StoryStoreProvider, useStoryStore] = createStoreContext<StoryStore>();
export {StoryStoreProvider};

export const useStory = () => useStoryStore().getStory();
export const usePassage = () => useStoryStore().getCurrentPassage();

type State = {
    story: Story;
    currentPassage: Passage;
    previousPassages: {passage: string}[];
    components: Map<string, React.ComponentType<any>>;
};

export default class StoryStore extends Store<State> {
    constructor(story: Story) {
        super();
        this.state = {
            story: undefined as any,
            currentPassage: undefined as any,
            previousPassages: [],
            components: undefined as any
        };
        this.setStory(story);
    }

    getStory(): Story {
        return this.state.story;
    }

    getCurrentPassage(): Passage {
        return this.state.currentPassage;
    }

    getCurrentComponent(): React.ComponentType<any> {
        if (!this.state.components.has(this.state.currentPassage.name)) {
            throw new Error("Missing component for passage");
        }
        return this.state.components.get(this.state.currentPassage.name)!;
    }

    setStory(story: Story) {
        const components = new Map<string, React.ComponentType<any>>();
        story.passages.forEach(p => components.set(p.name, (p as any).createComponent()));

        let currentPassage = this.state.currentPassage;
        if (!this.state.currentPassage) {
            currentPassage = story.passages.find(p => p.name === (story.metadata.startName || "Start"))!;
        }

        this.setState({
            story: story,
            currentPassage: currentPassage,
            components: components
        });
    }

    private goToPassage(name: string) {
        const passage = this.state.story.passages.find(p => p.name === name);
        if (!passage) {
            throw new Error(`Passage '${name} not found.`);
        }
        this.setState({
            currentPassage: passage,
            previousPassages: this.state.previousPassages.concat({passage: this.state.currentPassage.name})
        });
    }
}
