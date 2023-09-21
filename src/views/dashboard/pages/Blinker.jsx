import React, {useEffect, useState} from "react";

function Blinker() {

	const [status, setStatus] = useState(false);
	const [ft2020, setFt2020] = useState(false);

	const handleState = (ft = 'blinker') => {
		window.electronAPI.toConfig(ft, ft === 'blinker' ? !status :  !ft2020, null).then(r => {
			if(ft === "blinker") {
				setStatus(Boolean(JSON.parse(r).status));
			} else {
				setFt2020(Boolean(JSON.parse(r).status));
			}
		});
	}

	useEffect(() => {
		window.electronAPI.getConfig('blinker').then((r) => {
			if (r) {
				setStatus(Boolean(JSON.parse(r).status));
			}
		});
		window.electronAPI.getConfig('20-20-20').then(r => {
			if (r) {
				setFt2020(Boolean(JSON.parse(r).status));
			}
		})
	}, []);

	return (
		<>
			<div className={"flex flex-col w-full"}>
				{/* girlfriend said no */}
				{/*<span className={"absolute bottom-0 right-16 text-gray-800 text-9xl material-icons"}>visibility</span>*/}

				<section className={"w-full h-fit mb-2"}>
					<div className={"flex flex-col w-full mb-4"}>

						<div className={"flex items-center mb-3 pb-2"}>

							<div className={"flex flex-col items-start justify-between w-full"}>
								<span
									className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Blinker</span>
								<span className={"text-sm text-lightSecondary dark:text-darkSecondary"}>Helps regulate blinking of eyes</span>
							</div>

						</div>

						<div
							className={"w-full h-fit p-4 text-sm bg-gray-300 dark:bg-darkSecBG rounded-md text-lightSecondary dark:text-darkSecondary"}>
							<span
								className={"block"}>Humans normally blink about 15 times in one minute. However, studies show that we only blink about 5 to 7 times in a minute while using computers and other digital screen devices.<br/>Blinking is the eye’s way of getting the moisture it needs on its surface.
								<br/><b className={"pt-2 block text-sm"}><i>~ American Academy of Opthamology</i></b>
							</span>
						</div>

						<div className={"flex items-start justify-between"}>
							<span className={"text-sm py-4 block text-lightSecondary dark:text-darkSecondary"}>
								Blinker helps you keep your eyes moisturized and reduce strain. Blinker will remind you to blink periodically<br/>
								to maintain the natural eye blinking rate.<br/>
								Blinker uses visual cues such as showing an eye emoji at the center of your screen (default).
							</span>
							<button onClick={handleState}
									className={`m-4 flex items-center ${status ? 'justify-end' : 'justify-start'} duration-300 transition-all ease-in p-1 border-2 ${status ? 'border-gray-600 dark:border-[#8fbc8f]' : 'border-gray-600'} rounded-full`}
									style={{aspectRatio: "2/1", height: "1.75rem"}}>
								<div
									className={`aspect-square h-full rounded-full ${status ? 'bg-blue-500 dark:bg-darkComp' : 'bg-gray-600'}`}></div>
							</button>
						</div>

					</div>
				</section>

				{/*<hr className={"border-gray-500 mb-8 dark:border-gray-800"}/>*/}

				<section className={"w-full h-fit mb-2"}>
					<div className={"flex items-start justify-between w-full mb-4 bg-darkSecBG p-6 pl-4 pr-0 rounded-lg"}>
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

export default Blinker;