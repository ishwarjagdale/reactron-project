import {createRoot} from "react-dom/client";

export function render() {
    const body = document.getElementById("root");
    const root = createRoot(body);

    root.render(<h1>Hello World!</h1>);
}
