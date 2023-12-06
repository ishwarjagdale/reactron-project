import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

function Startup() {

    const navigate = useNavigate();
    const [name, setName] = useState("");

    const handleName = (evt) => {
        setName(evt.target.value);
    }

    const handleSubmit = () => {
        if (window.electronAPI.toStore('username', name)) {
            navigate("/");
        }
    }

    useEffect(() => {
        window.electronAPI.fromStore('username').then((res) => {
            if(res && res.value) navigate("/");
        })
    }, []);


    return (
        <>
            <div className={"flex items-center justify-center w-full flex-col"}>
                <div className={"flex items-center"}>
                    <span className={"text-4xl font-bold mr-2 w-full"}>Digital Wellbeing & Desktop Companion</span>
                </div>
                <div className={"flex items-center flex-col font-bold text-2xl my-20 relative"}>
                    <span className={"font-normal mb-4"}>Hi!</span>
                    <input onChange={handleName} autoFocus type={"text"} maxLength={20} placeholder={"name..."} className={"font-bold bg-transparent mx-2 pb-0 outline-none text-center w-full"}/>
                    { name && name.length < 3 && <span className={"absolute -bottom-8 font-normal text-xs text-gray-500"}>{3 - name.length} more</span> }
                </div>
                {
                    name && name.length >= 3
                    && <button onClick={handleSubmit} className={"flex items-center justify-between px-9 py-3 rounded-3xl text-black font-medium text-lg bg-[#95ff95]"}>
                        <span>Next</span><span className={"material-icons m-0"}>chevron_right</span>
                    </button>
                }
            </div>
        </>
    );
}

export default Startup;