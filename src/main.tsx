import React from "react";
import ReactDOM from "react-dom";
import {MDXProvider} from "@mdx-js/react";
import story from "../test/test.twee";
import "./style.css";

console.log(story);

const Link: React.FunctionComponent<{to: string}> = ({to, children}) => <a href={`#${to}`}>{children}</a>;
const Blah: React.FunctionComponent = ({children}) => <span style={{color: "red"}}>{children}</span>;
const components = {
    Link,
    Blah
};

const Component = story.passages[0].createComponent();

ReactDOM.render(
    <MDXProvider components={components as any}>
        <Component />
    </MDXProvider>,
    document.getElementById("root")
);
