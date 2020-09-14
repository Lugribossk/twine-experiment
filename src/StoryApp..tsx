import React, {StrictMode, Suspense, useEffect, useState} from "react";
import ErrorBoundary from "./ui/ErrorBoundary";
import {Components, MDXProvider} from "@mdx-js/react";
import {Story} from "./twee/TweeParser";
import StoryStore, {StoryStoreProvider} from "./StoryStore";

interface Props {
    story: Story;
    components: Components;
}

const StoryApp: React.FunctionComponent<Props> = ({story, components}) => {
    const [storyStore] = useState(() => new StoryStore(story));

    useEffect(() => {
        storyStore.setStory(story);
    }, [story]);

    const Component = storyStore.getCurrentComponent();
    return (
        <StrictMode>
            <ErrorBoundary>
                <Suspense fallback={<p>Loading...</p>}>
                    <StoryStoreProvider value={storyStore}>
                        <MDXProvider components={components}>
                            <Component />
                        </MDXProvider>,
                    </StoryStoreProvider>
                </Suspense>
            </ErrorBoundary>
        </StrictMode>
    );
};
export default StoryApp;
