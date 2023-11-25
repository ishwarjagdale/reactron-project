import React, {useEffect, useState} from "react";

function Focus() {

    const [config, setConfig] = useState({
        apps: []
    });
    const [status, setStatus] = useState(false);


    useEffect(() => {
        window.electronAPI.getConfig('focus-apps').then(load);
    }, []);

    const onChange = (evt) => {
        config.apps.push({name: evt.target.files[0].name, path: evt.target.files[0].path})
        window.electronAPI.toConfig('focus-apps', false, JSON.stringify(config)).then(load)
    }

    const onClick = (evt) => {
        const id = evt.target.id;
        config.apps = config?.apps.filter((a) => a.path.replace(`\\\\`, '\\') !== id
        ) || [];
        window.electronAPI.toConfig('focus-apps', false, JSON.stringify(config)).then(load)
    }

    const load = (res) => {
        let config;
        if(res) {
            setStatus(JSON.parse(res).status);
            config = JSON.parse(JSON.parse(res).config);
            setConfig(config);
        }
        if(config && config.apps) {
            config.apps.forEach((app, k) => {
                window.electronAPI.getFileIcon(app.path).then(res => {
                    config.apps[k] = {...config.apps[k], icon: res}

                    let img = document.getElementById(`image${app.path}`);
                    img.src = res;

                    console.log(config.apps);
                    setConfig(config);
                });
            })
        }
    }

    useEffect(() => {
        config.apps.forEach(app => {
            let img = document.getElementById(`image${app.path}`);
            img.src = app.icon;
        })
    }, [config]);

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

                        <div className={"flex w-full h-full py-2 flex-1"}>
                            <div className={"flex-[3] h-full px-4 flex items-center justify-center"}>

                            </div>
                            <div className={"flex flex-col overflow-hidden justify-between items-start px-4 flex-1 border-l border-gray-800 h-full"}>
                                <span className={"font-bold text-darkSecondary text-sm flex items-center"}>
                                    <span className={"material-icons text-lg"}>apps</span>
                                    Allowed Applications
                                </span>
                                <ul className={"w-full flex items-start flex-col flex-1 my-4"}>
                                    {
                                        config?.apps.map((app) => {
                                            return <li onClick={onClick} key={app.path} className={"flex items-center relative w-full py-2 text-sm"}>
                                            <img id={'image' + app.path} width={'50px'} className={"mr-2"} />
                                            <div className={"flex flex-col items-start overflow-hidden overflow-ellipsis"}>
                                                <span id={app.path} className={"font-bold cursor-pointer"}>{app.name}</span>
                                                <span title={app.path} className={"text-darkSecondary whitespace-nowrap italic opacity-75 mt-1"}>
                                                    {app.path}
                                                </span>
                                            </div>
                                        </li>}
                                        )
                                    }

                                </ul>
                                <div className={"flex w-full mt-4"}>
                                    <button onClick={() => document.querySelector(`input[name=add-app]`).click()} className={"flex items-center relative w-full py-2 text-sm rounded-lg bg-darkSecBG"}>
                                        <span className={"material-icons text-lg mx-2"}>add</span>Add application</button>
                                    <input multiple={false} onChange={onChange} type={"file"} name={"add-app"} className={""} hidden />
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