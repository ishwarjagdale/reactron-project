import React, {useEffect, useState} from "react";
import Timeline from "../../../components/Timeline.jsx";
import AppDonut from "../../../components/AppDonut.jsx";

function getEpoch() {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}


function Overview() {

	const [screenTime, setScreenTime] = useState([]);
	const [timelineRange, setTimelineRange] = useState('day');
	const [appUsages, setAppUsages] = useState([{path: "", usage: 0}]);

	useEffect(() => {
		window.electronAPI.getScreenLogs(0).then(r => {
			setScreenTime(JSON.parse(r))
		});
	}, []);

	useEffect(() => {
		window.electronAPI.getAppUsages(0).then(r => {
			setAppUsages(JSON.parse(r).sort((a, b) => a.usage > b.usage ? -1 : a.usage < b.usage ? 1 : 0));
		})
	}, []);


	return (
		<>
			<div onFocusCapture={window.location.reload} className={"flex flex-col w-full"}>

				<section className={"w-full h-fit mb-8"}>
					<div className={"flex flex-col w-full mb-8"}>
						<div className={"flex flex-col items-start mb-3 pb-2"}>
							<span className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Summary</span>
							<span className={"text-sm text-lightSecondary dark:text-darkSecondary"}>Your today's active sessions</span>
						</div>
						<Timeline range={timelineRange} data={screenTime} epoch={getEpoch()} />
					</div>
				</section>

				<section className={"w-full h-fit mb-8"}>
					<div className={"flex flex-col w-full mb-8"}>
						<div className={"flex flex-col items-start mb-3 pb-2"}>
							<span className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Application Usage</span>
							<span className={"text-sm text-lightSecondary dark:text-darkSecondary"}>most time spent on...</span>
						</div>
						<div className={"flex w-full items-start"}>
							<AppDonut appUsages={appUsages} />
							<ul className={"flex flex-col w-2/3 px-4"} style={{maxHeight: "240px", overflowY: "auto"}}>
								{
									appUsages.map((k, i) => {

										const hrs = Number.parseInt(k.usage / 36e5);
										const minutes = Number.parseInt((k.usage % 36e5) / 6e4);

										// if(hrs || minutes)
										return <li key={i.toString()}
												   className={"flex items-center px-4 py-3 bg-gray-100 dark:bg-darkSecBG hover:bg-gray-300 hover:dark:bg-darkBG hover:cursor-pointer rounded-md mb-2"}>
											<span className={"overflow-clip max-w-xs whitespace-nowrap overflow-ellipsis font-semibold text-sm"}>{k.path.slice(0, k.path.lastIndexOf("\\"))}</span>
											<span className={"font-semibold whitespace-nowrap text-sm mr-4"}>\{k.path.split("\\").pop()}</span>
											<span className={"text-xs whitespace-nowrap ml-auto"}>
												{hrs ? hrs.toString() + "hr " : ''}
												{minutes ? minutes.toString() + "min": hrs ? "" : "< 0min"}
											</span>
										</li>
									})
								}
							</ul>
						</div>
					</div>
				</section>

			</div>
		</>
	)
}

export default Overview;