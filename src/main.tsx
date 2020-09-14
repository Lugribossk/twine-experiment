import React from "react";
import ReactDOM from "react-dom";
import story from "../test/test.twee";
import "./style.css";
import StoryApp from "./StoryApp.";

console.log(story);

const Link: React.FunctionComponent<{to: string}> = ({to, children}) => <a href={`#${to}`}>{children}</a>;
const Blah: React.FunctionComponent = ({children}) => <span style={{color: "red"}}>{children}</span>;
const components = {
    Link,
    Blah
};

ReactDOM.render(
    <StoryApp story={story} components={components} />,
    document.getElementById("root")
);
