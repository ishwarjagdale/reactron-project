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
				<span className={"mb-8 py-2 text-2xl font-OpenSans"}>Summary</span>
				<Timeline range={timelineRange} data={screenTime} epoch={getEpoch()} />
			</div>
		</>
	)
}

export default Overview;