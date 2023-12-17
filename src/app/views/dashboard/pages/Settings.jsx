import React, {useEffect, useState} from "react";

function Settings() {

	const [username, setUsername] = useState("");
	const [sudoPass, setSudoPass] = useState("");
	const [saved, setSaved] = useState(null);

	useEffect(() => {
		window.electronAPI.fromStore("username").then((res) => {
			if(res) setUsername(res.value)
		});
		window.electronAPI.fromStore("sudoPass").then((res) => {
			if(res) setSudoPass(res.value)
		});
	}, []);

	const handleSubmit = (evt) => {
		evt.preventDefault();

		setSaved(false);

		window.electronAPI.toStore("username", username).then((res) => {
			if(res) setUsername(res.value.trim().length ? res.value.trim() : null)
		});

		window.electronAPI.toStore("sudoPass", sudoPass).then((res) => {
			if(res) setSudoPass(res.value.trim().length ? res.value.trim() : null)
		});

		setSaved(true);
		setTimeout(() => setSaved(null), 1000);
	}

	return (
		<>
			<div className={"flex flex-col w-full"}>
				<section className={"w-full h-fit mb-2"}>
					<div className={"flex flex-col w-full mb-4"}>

						<div className={"flex items-center mb-3 pb-2"}>

							<div className={"flex flex-col items-start justify-between w-full"}>
								<span
									className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Settings</span>
								<span className={"text-sm text-lightSecondary dark:text-darkSecondary"}></span>
							</div>

						</div>

						<form onSubmit={handleSubmit} className={"flex flex-col items-start text-darkSecondary my-4"}>
							<div className={"flex items-start w-full mb-8"}>
								<span className={"flex-1 mb-1"}>Name</span>
								<div className={"flex-[4]"}>
									<input className={"bg-darkSecBG placeholder:text-sm outline-none p-2 px-4 rounded-md"}
										   onChange={(evt) => setUsername(evt.target.value)}
										   type={"text"} placeholder={"your name"} defaultValue={username} minLength={3} maxLength={20} />
								</div>
							</div>
							<div className={"flex items-start w-full mb-8"}>
								<span className={"flex-1 mb-1"}>Sudo Password</span>
								<div className={"flex-[4]"}>
									<input className={"bg-darkSecBG placeholder:text-sm outline-none p-2 px-4 rounded-md"}
										   onChange={(evt) => setSudoPass(evt.target.value)}
										   type={"password"} placeholder={"just don't forget it"} defaultValue={sudoPass} minLength={3} maxLength={20} />
								</div>
							</div>
							<div className={"flex items-center w-full mb-8"}>
								<button type={"submit"} onClick={handleSubmit}
										className={"px-8 py-3 rounded-md bg-darkSecBG text-sm font-bold"}>
									Submit</button>
								<span className={"italic mx-4 text-sm text-darkSecondary"}>{ saved === null ? <></> : saved ? "Saved!" : "Saving..." }</span>
							</div>
						</form>

					</div>
				</section>
			</div>
		</>
	)
}

export default Settings;