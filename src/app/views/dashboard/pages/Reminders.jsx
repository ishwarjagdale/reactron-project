import React, {useEffect, useState} from "react";

function Feat202020() {
	const [ft2020, setFt2020] = useState(false);
	const [config, setConfig] = useState(null);

	const handleState = () => {
		window.electronAPI.toConfig('R202020', !ft2020, config).then(r => {
			setFt2020(Boolean(JSON.parse(r).status));
		});
	}

	useEffect(() => {
		window.electronAPI.getConfig('R202020').then(r => {
			if (r) {
				setConfig(JSON.parse(r).config);
				setFt2020(Boolean(JSON.parse(r).status));
			}
		})
	}, []);

	return (
		<section className={"w-full h-fit mb-2"}>
			<div
				className={"flex items-start justify-between w-full mb-4 bg-gray-300 dark:bg-darkSecBG p-6 pl-4 pr-0 rounded-lg"}>
				<div className={"flex flex-col items-start justify-between w-full"}>
								<span
									className={"text-xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>
									The 20-20-20
								</span>
					<div className={"flex items-start py-2 justify-between"}>
							<span className={"text-sm block text-lightSecondary dark:text-darkSecondary"}>
								Take regular breaks using the “20-20-20” rule: every 20 minutes, shift your eyes to look at an object at least 20 feet away, for at least 20 seconds.<br/>
								Enable to get notified every 20 minutes.
							</span>
					</div>
				</div>
				<button onClick={handleState}
						className={`m-4 flex items-center ${ft2020 ? 'justify-end' : 'justify-start'} duration-300 transition-all ease-in p-1 border-2 ${ft2020 ? 'border-gray-600 dark:border-[#8fbc8f]' : 'border-gray-600'} rounded-full`}
						style={{aspectRatio: "2/1", height: "1.75rem"}}>
					<div
						className={`aspect-square h-full rounded-full ${ft2020 ? 'bg-blue-500 dark:bg-darkComp' : 'bg-gray-600'}`}></div>
				</button>
			</div>
		</section>
	)
}


function FeatWaterReminder() {
	const [reminderType, setReminderType] = useState('');
	const [duration, setDuration] = useState(0);
	const [status, setStatus] = useState(false);

	const handleChange = () => {
		if(Boolean(reminderType) && Boolean(duration)) {
			window.electronAPI.toConfig(
				'WaterReminder',
				!status,
				!status ? JSON.stringify({type: reminderType, duration: duration}) : null
			).then(loadConfig);
		}
	}


	const loadConfig = (r) => {
		if (r) {
			const json = JSON.parse(r);
			const config = JSON.parse(json.config);
			if(config) {
				setReminderType(config.type); setDuration(config.duration);
			} else {
				setReminderType(''); setDuration(0);
			}
			setStatus(Boolean(json.status));
		}
	}

	useEffect(() => {
		window.electronAPI.getConfig('WaterReminder').then(loadConfig)}, []);

	useEffect(() => {
		document.getElementById('waterBtn').disabled = !(Boolean(reminderType) && Boolean(duration));
	}, [reminderType, duration]);

	return (
		<section className={"w-full h-fit mb-2"}>
			<div
				className={"flex items-start justify-between w-full mb-4 bg-gray-300 dark:bg-darkSecBG p-6 pl-4 pr-0 rounded-lg relative overflow-hidden waves bg-cover bg-center"}>
				<div className={"flex flex-col items-start justify-between w-full z-10"}>
								<span
									className={"text-xl font-OpenSans accent-border font-bold text-darkPrimary"}>
									Water Reminder
								</span>

					<span className={"text-sm block text-darkPrimary py-2"}>
								Stay hydrated! Remind yourself to drink water or coffee, whatever you prefer. <br/> Set a reminder to get notified regularly or just once.
							</span>

				</div>
				<div className={"flex flex-col items-center mx-2 relative"}>
					<div className={"dark:bg-darkSecBG pr-3 w-[150px] rounded-md m-1"}>
						<select value={reminderType} onChange={(e) => setReminderType(e.target.value)} className={"dark:bg-darkSecBG rounded-md text-black dark:text-darkSecondary outline-none py-2 px-4 bg-transparent text-sm w-full"}>
							<option value={''}>Type</option>
							<option value={'o'}>Once</option>
							<option value={'r'}>Regularly</option>
						</select>
					</div>
					<div className={"dark:bg-darkSecBG pr-3 w-[150px] rounded-md m-1"}>
						<select value={duration} onChange={(e) => setDuration(e.target.value)} className={"dark:bg-darkSecBG rounded-md text-black dark:text-darkSecondary outline-none py-2 px-4 bg-transparent text-sm w-full"}>
							<option value={0}>Duration</option>
							{
								[15 * 60, 30 * 60, 60 * 60, 120 * 60].map((k, index) =>
									<option key={index.toString()} value={k * 1000}>
										{ reminderType === '' ? '' : reminderType === 'r' ? 'in' : 'after' } { k / 60 < 60 ? `${k / 60}mins` : `${k / 3600}hrs` }
									</option>
								)
							}
						</select>
					</div>
				</div>
				<button onClick={handleChange} id={'waterBtn'}
						className={`m-2 mx-4 flex items-center ${status ? 'justify-end' : 'justify-start'} duration-300 transition-all ease-in p-1 border-2 border-black rounded-full ${status ? 'bg-darkSecBG' : 'bg-transparent'}`}
						style={{aspectRatio: "2/1", height: "1.75rem"}}>
					<div
						className={`aspect-square h-full rounded-full ${status ? 'bg-darkComp' : 'bg-black'}`}></div>
				</button>

				{/* A similar button */}
				{/*<button*/}
				{/*	id={"waterBtn"}*/}
				{/*	className={"flex items-center justify-center bg-white dark:bg-darkSecBG p-4 aspect-square w-[100px] rounded-md my-1 mr-4 h-full opacity-100 disabled:opacity-80"}*/}
				{/*	disabled*/}
				{/*>*/}
				{/*	<span className={"material-icons  text-lightSecondary dark:text-darkPrimary m-0"}>{*/}
				{/*		!active ? 'play_circle' : 'stop_circle'*/}
				{/*	}</span>*/}
				{/*</button>*/}

			</div>
		</section>
	)
}


function Reminders() {



	return (
		<>
			<div className={"flex flex-col w-full"}>
				<section className={"flex items-center mb-5 pb-2 w-full h-fit"}>
					<div className={"flex flex-col items-start justify-between w-full"}>
						<span
							className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Reminders</span>
						<span className={"text-sm text-lightSecondary dark:text-darkSecondary"}>Never forget again, maintain your lifestyle</span>
					</div>
				</section>

				<Feat202020 />
				<FeatWaterReminder />

			</div>
		</>
	)
}

export default Reminders;