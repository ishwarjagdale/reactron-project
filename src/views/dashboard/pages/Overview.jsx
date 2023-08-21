import React, {useEffect, useState} from "react";
import Timeline from "../../../components/Timeline.jsx";

function getEpoch() {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}


function Overview() {

	const [screenTime, setScreenTime] = useState([]);
	const [timelineRange, setTimelineRange] = useState('day');

	useEffect(() => {
		window.electronAPI.getScreenLogs(0).then(r => {
			setScreenTime(JSON.parse(r))
		});
	}, [])


	return (
		<>
			<div className={"flex flex-col w-full"}>
				<div className={"flex flex-col items-start mb-4 py-2"}>
					<span className={"mb-2 pb-1 text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Summary</span>
					<span className={"text-sm font-medium text-lightSecondary dark:text-darkSecondary"}>Your today's active sessions</span>
				</div>
				<Timeline range={timelineRange} data={screenTime} epoch={getEpoch()} />
			</div>
		</>
	)
}

export default Overview;