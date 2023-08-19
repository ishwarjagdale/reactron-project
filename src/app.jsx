import React from "react";
import {createRoot} from "react-dom/client";
import {createMemoryRouter, RouterProvider, Outlet, Link} from "react-router-dom";
import "./static/fonts/material-icons.css"; // material icons stylesheet
import "./static/fonts/open-sans.css"; // open sans font stylesheet
import "./static/css/main.css"; // base stylesheet
import "./static/css/tailwind.css"; // tailwind stylesheet

import electronIcon from "./static/img/electron.png";


// importing views
import WelcomePage from "./views/WelcomePage.jsx";

function WindowLayout() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const closeWindow = window.electronAPI.closeWindow;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const minimizeWindow = window.electronAPI.minimizeWindow;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const maximizeWindow = window.electronAPI.maximizeWindow;

    // Returns a React component for the window/frame of the application
    return (
        <>
            {/* Title Bar */}
            <div id={"title-bar"} className={"flex p-2 pb-0 items-center justify-between draggable"} style={{height: '42px'}}>
                <div className={"flex items-center invisible"}>
                    {/*  Window Icon  */}
                    <img src={electronIcon} className={"m-1 ml-2"} width={'20px'} height={'20px'} id={"window-icon"} alt={""} />
                    {/*  Window Title  */}
                    <span className={"dark:text-gray-300 text-sm m-2"}>{ window.document.title }</span>
                </div>
                <div className={"flex items-center"}>
                    {/*  Buttons for window control  */}
                    <button onClick={minimizeWindow} className={"p-[.4rem] bg-blue-400 rounded-full m-2"} title={"Minimize"} />
                    <button onClick={maximizeWindow} className={"p-[.4rem] bg-yellow-400 rounded-full m-2"} title={"Maximize"} />
                    <button onClick={closeWindow} className={"p-[.4rem] bg-red-400 rounded-full m-2"} title={"Close"} />
                </div>
            </div>
            {/* Content */}
            <div className={"p-4 flex"} style={{height: "calc(100% - 50px)", padding: "1rem 1rem 0.6rem"}}>
                <Outlet/>
            </div>
        </>
    )
}

export function render() {
    const body = document.getElementById("root");
    const root = createRoot(body);

    const router = createMemoryRouter([
        {
            path: "/",
            element: <WindowLayout/>,
            children: [
                {
                    path: "",
                    element: <WelcomePage/>
                }, {
                    path: "/dashboard",
                    element: <Link to={"/"}>Dashboard</Link>
                }
            ]
        }
    ]);

    root.render(<RouterProvider router={router} />);
}
