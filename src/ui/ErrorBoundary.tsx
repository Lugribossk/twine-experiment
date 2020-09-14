import React from "react";

type State = {
    error: Error | undefined;
};

export default class ErrorBoundary extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            error: undefined
        };
    }

    static getDerivedStateFromError(error: Error) {
        return {
            error: error
        };
    }

    render() {
        if (!this.state.error) {
            return this.props.children;
        }
        return <p>Error: {this.state.error?.message || "Unknown"}</p>;
    }
}
