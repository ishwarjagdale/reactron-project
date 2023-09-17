import React from "react";
import {useEffect, useState} from "react";
import "../static/fonts/material-icons.css"; // material icons stylesheet
import "../static/fonts/open-sans.css"; // open sans font stylesheet
import "../static/css/main.css"; // base stylesheet
import "../static/css/tailwind.css";
import {Link} from "react-router-dom"; // tailwind stylesheet


function WelcomePage() {

	const [screenTime, setScreenTime] = useState({
		hours: 0, minutes: 0, seconds: 0
	});

	const updateScreenTIme = (_event, value) => {
		setScreenTime(JSON.parse(value));
	}

	useEffect(() => {
		window.electronAPI.getScreenTime(updateScreenTIme).then(r => {
			setScreenTime(JSON.parse(r));
		});
	}, [])

	useEffect(() => {
		const timer = setInterval(() => {
			let {hours, minutes, seconds} = screenTime;
			seconds += 1;
			if(seconds === 60) {
				minutes += 1;
				seconds = 0;
			}
			if(minutes === 60) {
				hours += 1;
				minutes = 0;
			}
			hours %= 24;

			setScreenTime({hours: hours, minutes: minutes, seconds: seconds});
		}, 1000);

		return () => {
			clearInterval(timer);
		}

	}, [screenTime]);

	let greet;
	const hour = new Date().getHours();
	if(hour >= 5 && hour < 12) {
		greet = "Good morning";
	} else if(hour >= 12 && hour < 18) {
		greet = "Good afternoon";
	} else if(hour >= 18) {
		greet = "Good evening";
	} else {
		greet = "You should sleep";
	}

	return (
		<div className={"flex items-center justify-center p-12 w-full h-full"}>
			<div className={"flex flex-col items-center justify-between h-full"}>
				<div className={"flex flex-col items-center justify-center flex-1"}>
					<div className={"flex items-center p-2 pb-0"}>
						<span className={"material-icons px-2 text-2xl"}>devices</span>
						{/*<h1 className={"text-2xl"}>Screen Time</h1>*/}
					</div>
					<div className={"flex items-start font-bold px-2 leading-[1]"} style={{fontSize: "9rem", width: "calc(590px + 0.5rem)"}}>
						<span className={"digit"}>{ Number.parseInt((screenTime.hours / 10).toString()) }</span>
						<span className={"digit"}>{ screenTime.hours % 10 }</span>
						<span className={"font-normal leading-[0.8] px-2"}>:</span>
						<span className={"digit"}>{ Number.parseInt((screenTime.minutes / 10).toString()) }</span>
						<span className={"digit"}>{ screenTime.minutes % 10 }</span>
						<span className={"font-normal leading-[0.8] px-2"}>:</span>
						<span className={"digit text-gray-600"}>{ Number.parseInt((screenTime.seconds / 10).toString()) }</span>
						<span className={"digit text-gray-600"}>{ screenTime.seconds % 10 }</span>
					</div>
					<span className={"p-2 text-md text-lightSecondary dark:text-darkSecondary"}>Total screen time tracked today</span>
				</div>
				<div className={"flex flex-col items-center p-4"}>
					<span className={"text-lightPrimary dark:text-darkPrimary text-xl p-1"}>{ greet }, <b className={"font-bold"}>Ishwar</b></span>
					<span className={"text-lightSecondary dark:text-darkSecondary text-sm"}>Let's see how you're doing</span>
					<Link to={"/dashboard"} className="material-icons pt-8 text-lightSecondary dark:text-darkSecondary hover:text-black hover:dark:text-blue-400 pb-2">keyboard_double_arrow_down</Link>
				</div>
			</div>
		</div>
	)
}

export default WelcomePage;