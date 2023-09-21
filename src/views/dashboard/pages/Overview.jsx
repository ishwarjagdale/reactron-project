import React, {useEffect, useState} from "react";
import Timeline from "../../../components/Timeline.jsx";
import AppDonut from "../../../components/AppDonut.jsx";

function getEpoch() {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}


function Overview() {

	const [screenTime, setScreenTime] = useState([]);
	const [timeRange, setTimeRange] = useState(0);
	const [appUsages, setAppUsages] = useState([{path: "", usage: 0}]);

	const getAppUsages = (timeR = timeRange) => {
		window.electronAPI.getAppUsages(timeR).then(r => {
			setAppUsages(JSON.parse(r)
				.sort((a, b) => a.usage > b.usage ? -1 : a.usage < b.usage ? 1 : 0)
				.filter((a) => a.usage > 6e4));
		});
	}

	const getScreenLogs = (timeR = timeRange) => {
		window.electronAPI.getScreenLogs(timeRange).then(r => {
			setScreenTime(JSON.parse(r))
		});
	}

	useEffect(getScreenLogs, [timeRange]);
	useEffect(getAppUsages, [timeRange]);

	useEffect(() => {
		const interval = setInterval(() => {
			getScreenLogs(); getAppUsages();
		}, 6e5);
		return () => clearInterval(interval);
	});

	function handleHover(e) {
		if(e.type === "mouseover" && e.target.tagName === "LI") {
			for(let i of document.querySelectorAll('svg[id=donut] > circle')) {
				if(i.getAttribute("aria-description") !== e.target.id) {
					i.style.filter = 'grayscale(1.2)';
				}
			}
		} else if(e.type === "mouseleave" && e.target.tagName === "LI") {
			for(let i of document.querySelectorAll('svg[id=donut] > circle')) {
					i.style.filter = '';
			}
		}
	}

	function toggleTimeRange() {
		setScreenTime([]);
		setTimeRange(timeRange <= 0 ? 6 : 0);
	}


	return (
		<>
			<div className={"flex flex-col w-full"}>

				<section className={"w-full h-fit mb-8"}>
					<div className={"flex flex-col w-full mb-8"}>
						<div className={"flex items-center mb-3 pb-2"}>
							<div className={"flex flex-col items-start justify-between w-full"}>
								<span className={"text-2xl font-OpenSans accent-border font-bold text-lightPrimary dark:text-darkPrimary"}>Summary</span>
								<span className={"text-sm text-lightSecondary dark:text-darkSecondary"}>Your today's active sessions</span>
							</div>
							<div className={"flex items-center but relative rounded-md"}>
								<button onClick={() => setTimeRange(timeRange > 0 ? timeRange + 7 : timeRange - 1)}  className={"material-icons text-lg hover-but h-full"}>arrow_left</button>
								<button onClick={toggleTimeRange} className={"whitespace-nowrap hover-but text-xs p-2.5 font-OpenSans h-full"}>
									{ timeRange <= 0 ? new Date(Date.now() + (timeRange * 36e5 * 24)).toDateString() :
										`${new Date(Date.now() - ((timeRange) * 36e5 * 24)).toDateString()} - ${new Date(Date.now() - ((timeRange - 6) * 36e5 * 24)).toDateString()}`}
								</button>
								<button onClick={() => {
									if(timeRange === 6) {
										setScreenTime([]);
										setTimeRange(0);
									} else
									setTimeRange(timeRange > 0 ? timeRange - 7 : timeRange + 1)
								}} className={`material-icons text-lg hover-but h-full disabled:text-slate-600`} disabled={timeRange === 0}>arrow_right</button>
							</div>
						</div>
						<Timeline callAppUsage={(timeR) => getAppUsages(timeR)} range={timeRange} data={screenTime} epoch={getEpoch()} />
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
							<ul className={"flex flex-col w-2/3 px-4"} style={{height: "240px", overflowY: "auto"}}>
								{
									appUsages.length ? appUsages.map((k, i) => {

										const hrs = Number.parseInt(k.usage / 36e5);
										const minutes = Number.parseInt((k.usage % 36e5) / 6e4);

										// if(hrs || minutes)
										return <li key={i.toString()} id={k.path} onMouseLeave={handleHover} onMouseOverCapture={handleHover}
												   className={"flex items-center px-4 py-3 bg-gray-100 dark:bg-darkSecBG hover:bg-gray-300 hover:dark:bg-darkBG hover:cursor-pointer rounded-md mb-2"}>
											<span className={"overflow-clip max-w-xs whitespace-nowrap overflow-ellipsis font-semibold text-sm"}>{k.path.slice(0, k.path.lastIndexOf("\\"))}</span>
											<span className={"font-semibold whitespace-nowrap text-sm mr-4"}>\{k.path.split("\\").pop()}</span>
											<span className={"text-xs whitespace-nowrap ml-auto"}>
												{hrs ? hrs.toString() + "hr " : ''}
												{minutes ? minutes.toString() + "min": hrs ? "" : "< 0min"}
											</span>
										</li>
									}) : timeRange > 0 ? <li className={"text-lightSecondary dark:text-gray-500 text-sm my-auto w-full flex justify-center items-center"}>Select a date from above graph to see the details.</li> : <></>
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