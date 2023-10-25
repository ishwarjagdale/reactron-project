import React, {useEffect, useState} from "react";

function Reminders() {
	const [ft2020, setFt2020] = useState(false);

	const handleState = () => {
		window.electronAPI.toConfig('20-20-20', !ft2020, null).then(r => {
			setFt2020(Boolean(JSON.parse(r).status));
		});
	}

	useEffect(() => {
		window.electronAPI.getConfig('20-20-20').then(r => {
			if (r) {
				setFt2020(Boolean(JSON.parse(r).status));
			}
		})
	}, []);


	return (
		<>
			<div className={"flex flex-col w-full"}>
				<section className={"flex items-center mb-5 pb-2 w-full h-fit"}>
					<div className={"flex flex-col items-start justify-between w-full"}>
						<span className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Reminders</span>
						<span className={"text-sm text-lightSecondary dark:text-darkSecondary"}>Never forget again, maintain your lifestyle</span>
					</div>
				</section>
				<section className={"w-full h-fit mb-2"}>
				<div className={"flex items-start justify-between w-full mb-4 bg-gray-300 dark:bg-darkSecBG p-6 pl-4 pr-0 rounded-lg"}>
					<div className={"flex flex-col items-start justify-between w-full"}>
								<span className={"text-xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>
									The 20-20-20
								</span>
						<div className={"flex items-start py-2 justify-between"}>
							<span className={"text-sm block text-lightSecondary dark:text-darkSecondary"}>
								Take regular breaks using the “20-20-20” rule: every 20 minutes, shift your eyes to look at an object at least 20 feet away, for at least 20 seconds.<br/>
								Enable to get notified every 20 minutes.
							</span>
						</div>
					</div>
					<button onClick={() => handleState('20-20-20')}
							className={`m-4 flex items-center ${ft2020 ? 'justify-end' : 'justify-start'} duration-300 transition-all ease-in p-1 border-2 ${ft2020 ? 'border-gray-600 dark:border-[#8fbc8f]' : 'border-gray-600'} rounded-full`}
							style={{aspectRatio: "2/1", height: "1.75rem"}}>
						<div
							className={`aspect-square h-full rounded-full ${ft2020 ? 'bg-blue-500 dark:bg-darkComp' : 'bg-gray-600'}`}></div>
					</button>
				</div>
			</section>
			</div>
		</>
	)
}

export default Reminders;