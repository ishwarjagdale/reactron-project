import React from "react";
import {useEffect, useState} from "react";
import "../static/fonts/material-icons.css"; // material icons stylesheet
import "../static/fonts/open-sans.css"; // open sans font stylesheet
import "../static/css/main.css"; // base stylesheet
import "../static/css/tailwind.css"; // tailwind stylesheet


function WelcomePage() {

	const [screenTime, setScreenTime] = useState({
		hour: 0, minutes: 0, seconds: 0
	});

	const updateScreenTIme = (_event, value) => {
		console.log(value);
		setScreenTime(value);
	}

	useEffect(() => {
		window.electronAPI.getScreenTime(updateScreenTIme);
	}, [])

	useEffect(() => {
		const timer = setInterval(() => {
			let {hour, minutes, seconds} = screenTime;
			seconds += 1;
			if(seconds === 60) {
				minutes += 1;
				seconds = 0;
			}
			if(minutes === 60) {
				hour += 1;
				minutes = 0;
			}
			hour %= 24;

			setScreenTime({hour: hour, minutes: minutes, seconds: seconds});
		}, 1000);

		return () => {
			clearInterval(timer);
		}

	}, [screenTime]);



	return (
		<div className={"flex items-center justify-center p-12 w-full h-full"}>
			<div className={"flex flex-col items-center justify-between h-full"}>
				<div className={"flex flex-col items-center justify-center flex-1"}>
					<div className={"flex items-center p-2 pb-0"}>
						<span className={"material-icons px-2 text-2xl"}>devices</span>
						{/*<h1 className={"text-2xl"}>Screen Time</h1>*/}
					</div>
					<div className={"flex items-start font-[500] px-2 leading-[1]"} style={{fontSize: "9rem"}}>
						<span className={""}>{ screenTime.hour >= 10 ? Number.parseInt(screenTime.hour / 10) : 0 }</span>
						<span className={""}>{ screenTime.hour >= 0 ? screenTime.hour % 10 : screenTime.hour }</span>
						<span className={"font-normal leading-[0.8] px-2"}>:</span>
						<span className={""}>{ screenTime.minutes >= 10 ? Number.parseInt(screenTime.minutes / 10) : 0 }</span>
						<span className={""}>{ screenTime.minutes >= 0 ? screenTime.minutes % 10 : screenTime.minutes }</span>
						<span className={"font-normal leading-[0.8] px-2"}>:</span>
						<span className={"text-gray-600"}>{ screenTime.seconds >= 10 ? Number.parseInt(screenTime.seconds / 10) : 0 }</span>
						<span className={"text-gray-600"}>{ screenTime.seconds >= 0 ? screenTime.seconds % 10 : screenTime.seconds }</span>
					</div>
					<span className={"p-2 text-md text-gray-400"}>Total screen time tracked today</span>
				</div>
				<div className={"flex flex-col items-center p-4"}>
					<span className={"text-2xl p-1"}>Good morning, <b>Ishwar</b></span>
					<span className={"text-gray-400 text-sm"}>Let's see how you're doing</span>
					<button className="material-icons pt-8 text-gray-400 hover:text-white pb-2">keyboard_double_arrow_down</button>
				</div>
			</div>
		</div>
	)
}

export default WelcomePage;