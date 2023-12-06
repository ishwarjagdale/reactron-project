import React from "react";
import {createRoot} from "react-dom/client";
import {createMemoryRouter, RouterProvider, Outlet, Link, useNavigate, useLocation} from "react-router-dom";
import "./static/fonts/material-icons.css"; // material icons stylesheet
import "./static/fonts/open-sans.css"; // open sans font stylesheet
import "./static/css/main.css"; // base stylesheet
import "./static/css/tailwind.css"; // tailwind stylesheet

import electronIcon from "./static/img/electron.png";


// importing views
import WelcomePage from "./views/WelcomePage.jsx";
import Dashboard from "./views/dashboard/Dashboard.jsx";
import Overview from "./views/dashboard/pages/Overview.jsx";
import Settings from "./views/dashboard/pages/Settings.jsx";
import Blinker from "./views/dashboard/pages/Blinker.jsx";
import Reminders from "./views/dashboard/pages/Reminders.jsx";
import Startup from "./views/Startup.jsx";
import Focus from "./views/dashboard/pages/Focus.jsx";

function WindowLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const closeWindow = () => {
        navigate("/");
        window.electronAPI.closeWindow()
    };
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

                <div className={"flex items-center"}>
                    {
                        !(["/", "/startup"].includes(location.pathname)) && <Link to={"/"} className={"mx-3 material-icons hover:text-blue-400 rounded-full"}>keyboard_double_arrow_left</Link>
                    }
                    <div className={"hidden items-center"}>
                        {/*  Window Icon  */}
                        <img src={electronIcon} className={"m-1 ml-2"} width={'20px'} height={'20px'} id={"window-icon"} alt={""} />
                        {/*  Window Title  */}
                        <span className={"dark:text-gray-300 text-sm m-2"}>{ window.document.title }</span>
                    </div>
                </div>
                <div className={"flex items-center"}>
                    {/*  Buttons for window control  */}
                    <button onClick={minimizeWindow} className={"p-[.4rem] bg-blue-400 rounded-full m-2"} title={"Minimize"} />
                    <button onClick={maximizeWindow} className={"p-[.4rem] bg-yellow-400 rounded-full m-2"} title={"Maximize"} />
                    <button onClick={closeWindow} className={"p-[.4rem] bg-red-400 rounded-full m-2"} title={"Close"} />
                </div>
            </div>
            {/* Content */}
            <div className={"flex overflow-hidden overflow-y-auto"} style={{height: "calc(100% - 50px)", padding: "0.5rem 0.5rem 0.6rem"}}>
                <Outlet/>
            </div>
        </>
    )
}

const body = document.getElementById("root");
const root = createRoot(body);

const router = createMemoryRouter([
    {
        path: "/",
        element: <WindowLayout />,
        children: [
            {
                path: "",
                element: <WelcomePage />
            },
            {
                path: "/focus",
                element: <WelcomePage />
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
                children: [
                    {
                        path: "/dashboard/overview",
                        element: <Overview />
                    },
                    {
                        path: "/dashboard/blinker",
                        element: <Blinker />
                    },
                    {
                        path: "/dashboard/reminders",
                        element: <Reminders />
                    },
                    {
                        path: "/dashboard/focus",
                        element: <Focus />
                    },
                    {
                        path: "/dashboard/settings",
                        element: <Settings />
                    }
                ]
            },
            {
                path: "/startup",
                element: <Startup />
            }
        ]
    }
]);

root.render(<RouterProvider router={router} />)
