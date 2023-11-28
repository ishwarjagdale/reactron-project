import React, {useEffect, useState} from "react";

function Focus() {

    const [config, setConfig] = useState({
        apps: [],
        duration: 1000,
    });
    const [status, setStatus] = useState(false);
    const [timer, setTimer] = useState(0);
    const [password, setPassword] = useState(null);
    const [askPass, setAskPass] = useState(false);
    const [inpPass, setInPass] = useState("");
    const [wrongPass, setWrongPass] = useState(false);

    useEffect(() => {
        window.electronAPI.getConfig('Focus').then(load);
    }, []);

    useEffect(() => {
        window.electronAPI.fromStore('password').then(res => {
            if(res) setPassword(res.value);
        })
    }, []);

    const onChange = (evt) => {
        config.apps.push({name: evt.target.files[0].name, path: evt.target.files[0].path})
        window.electronAPI.toConfig('Focus', status, JSON.stringify(config)).then(load)
    }

    const onClick = (evt) => {
        const id = evt.target.id;
        config.apps = config?.apps.filter((a) => a.path.replace(`\\\\`, '\\') !== id
        ) || [];
        window.electronAPI.toConfig('Focus', false, JSON.stringify(config)).then(load)
    }

    const load = (res) => {
        let config;
        if (res) {
            setStatus(JSON.parse(res).status);
            config = JSON.parse(JSON.parse(res).config);
            config.duration = config.duration || 6e5;
            setConfig(config);
        }
        if (config && config.apps) {
            config.apps.forEach((app, k) => {
                window.electronAPI.getFileIcon(app.path).then(res => {
                    config.apps[k] = {...config.apps[k], icon: res}

                    let img = document.getElementById(`image-${app.path}`);
                    img.src = res;

                    console.log(config.apps);
                    setConfig(config);
                });
            })
        }
        if (config && config.duration) {
            setTimer(config.duration);
        }
    }

    useEffect(() => {
        if(timer && status) {
            const interval = setInterval(() => {
                setTimer(timer - 1000);
            }, 1000);

            return () => {
                clearInterval(interval);
            }
        }
    }, [timer, status]);

    const start = (override = false) => {
        if(status) {
            if (!override)
                return setAskPass(true);
        }
        console.log(!status)
        setConfig({ ...config, duration: 6e5 });
        window.electronAPI.toConfig('Focus', !status, JSON.stringify(config)).then(load)
    }

    const handleSubmit = (evt) => {
        evt.preventDefault();
        console.log(inpPass, password, inpPass === password)
        if(inpPass === password) return start(true);
        else {
            setWrongPass(true);
        }
        setInPass("");
    }

    console.log(config.duration, timer);

    return (
        <>
            <div className={"flex flex-col w-full"}>
                <section className={"w-full h-full mb-2"}>
                    <div className={"flex flex-col w-full h-full flex-1 mb-4"}>

                        <div className={"flex items-center mb-3 pb-2"}>

                            <div className={"flex flex-col items-start justify-between w-full"}>
								<span
                                    className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Focus</span>
                                <span className={"text-sm text-lightSecondary dark:text-darkSecondary"}>Locks your UI to specific apps only</span>
                            </div>

                        </div>

                        <div className={"flex w-full h-full py-2 flex-1 relative"}>

                            <div className={"flex-[3] h-full flex items-center justify-center relative"}>
                                {
                                    askPass ?
                                        <form className={"z-10 absolute"} onSubmit={handleSubmit}>
                                            <input className={"bg-transparent border-b text-center p-2"} placeholder={"Enter Password"}  onChange={(evt) => setInPass(evt.target.value)} />
                                            { wrongPass ? <span className={"text-sm"}>Wrong Password</span> : <></> }
                                        </form>
                                        :
                                        <button onClick={start}
                                                className={"px-4 z-10 py-3 bg-darkSecBG h-fit rounded-md absolute"}>
                                            {
                                                status ? "Stop" : "Start for 30 minute"
                                            }
                                        </button>
                                }

                                <svg className={"h-full w-full relative"}>
                                    <circle cx={"50%"} cy={"50%"} r={`30%`} fill={"none"} className={"donut-back"}
                                            strokeWidth={'2%'}/>
                                    <circle cx={"50%"} cy={"50%"} r={`30%`} stroke={"dodgerblue"} fill={"none"} pathLength={100} strokeDasharray={`${(timer / config.duration) * 100} 100`}
                                            strokeLinecap={"round"} strokeLinejoin={"round"}
                                            strokeWidth={'2%'}/>
                                    <circle cx={"50%"} cy={"50%"} r={`30%`} stroke={"black"} fill={"none"} pathLength={100} strokeDasharray={`0 100`}
                                            strokeLinecap={"square"} strokeLinejoin={"round"}
                                            strokeWidth={'2%'} />
                                    <rect width={10} height={2} fill={"gray"} x={"80%"} y={"50%"}  />
                                </svg>

                            </div>

                            <div
                                className={"flex flex-col overflow-hidden justify-between items-start px-4 flex-1 border-l border-gray-800 h-full"}>
                                <span className={"font-bold text-darkSecondary text-sm flex items-center"}>
                                    <span className={"material-icons text-lg"}>apps</span>
                                    Allowed Applications
                                </span>
                                <ul className={"w-full flex items-start flex-col flex-1 my-4"}>
                                    {
                                        config?.apps.map((app) => {
                                                return <li onClick={onClick} key={app.path}
                                                           className={"flex items-center relative w-full py-2 text-sm"}>
                                                    <div className={"mr-2 flex items-center flex-1"}>
                                                        <img alt={app.path} id={'image-' + app.path}/>
                                                    </div>
                                                    <div
                                                        className={"flex flex-[6] flex-col items-start overflow-hidden overflow-ellipsis"}>
                                                        <span id={app.path}
                                                              className={"font-bold cursor-pointer"}>{app.name}</span>
                                                        <span title={app.path}
                                                              className={"text-darkSecondary whitespace-nowrap italic opacity-75 mt-1"}>
                                                    {app.path}
                                                </span>
                                                    </div>
                                                </li>
                                            }
                                        )
                                    }

                                </ul>
                                <div className={"flex w-full mt-4"}>
                                    <button onClick={() => document.querySelector(`input[name=add-app]`).click()}
                                            className={"flex items-center relative w-full py-2 text-sm rounded-lg bg-darkSecBG"}>
                                        <span className={"material-icons text-lg mx-2"}>add</span>Add application
                                    </button>
                                    <input multiple={false} onChange={onChange} type={"file"} name={"add-app"}
                                           className={""} hidden/>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </>
    )
}

export default Focus;