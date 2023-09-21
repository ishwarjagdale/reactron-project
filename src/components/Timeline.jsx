import React from "react";

function Timeline({callAppUsage, className = '', range = 0, data = [], epoch}) {

	const xMax = range <= 0 ? (24 * 3600 * 1000) : 7;
	const yMax = range <= 0 ? Math.ceil(Math.max(...data.map((x) => (x.end - x.start)), 36e5) / 36e5) + 1 :
		Math.ceil(Math.max(...Object.keys(data).map((x) => data[x].usage), 36e5) / 36e5) + 1;

	return (
		<>
			<div className={"flex w-full relative " + className} style={{height: "15rem"}}>
				{/*  Vertical Axis  */}
				<div id={"vertAxi"} className={"flex flex-col items-center justify-between h-full w-fit"}>
					{
						Array.from(Array(yMax).keys()).reverse().map((i) =>
							<span key={i.toString()} style={{fontSize: '0.75rem'}}
								  className={"text-xs ml-2 text-gray-600"}>{i === 0 ? '' : `${i}hr`}</span>
						)
					}
				</div>
				<div className={"flex flex-col items-center justify-between h-full w-full absolute px-10"}>
					{
						Array.from(Array(yMax).keys()).reverse().map((i) =>
							<hr key={i.toString()}
								className={`w-full border-0 bg-gray-600 opacity-10 ${i === 0 ? 'invisible' : ''}`}
								style={{height: "1.5px"}}/>
						)
					}
				</div>
				{/*  Data  */}
				<div className={"flex items-end w-full h-full relative mx-4"}>

					{
						range <= 0 ? data.length ? data.map((session, index) => {
								const duration = session.end - session.start;
								const start = (100 * session.start) / xMax;
								const end = (100 * session.end) / xMax;
								const width = end - start;
								const height = (100 * duration) / (yMax * 36e5);

								return <div title={`
								${new Date(epoch + session.start).toLocaleTimeString()} - ${new Date(epoch + session.end).toLocaleTimeString()}
							`} className={"flex items-end absolute h-full"} key={index.toString()}
											style={{left: `${start}%`, width: `${width}%`}}>

									<hr className={"w-full absolute bottom-0 rounded border-0 z-10 session h-full"}/>
									<hr className={"w-full absolute bottom-0 rounded bg-blue-400 border-0 z-10"}
										style={{height: `${height}%`}}/>

								</div>

							}) : <div className={"absolute w-full h-full flex items-center justify-center"}>
								<span className={"text-sm text-lightSecondary dark:text-darkSecondary opacity-60"}>No data available!</span>
							</div>
							: Object.keys(data).length ? <>
									<div className={"flex w-full absolute h-full items-end justify-around"}>
										{
											Object.keys(data).map((date, index) => {
												const height = (100 * data[date].usage) / ((yMax - 1) * 36e5);

												const hours = Number.parseInt(data[date].usage / 36e5);
												const minutes = Number.parseInt((data[date].usage % 36e5) / 6e4);

												return <div onClick={() => callAppUsage(range - index)} title={`${hours}hr ${minutes}min\n${new Date(Number.parseInt(date)).toDateString()}`} className={"relative h-full"} key={index.toString()} style={{width: `5%`}}>
													<hr className={"w-full absolute bottom-0 rounded border-0 z-10 session h-full"}/>
													<hr className={"w-full absolute bottom-0 rounded bg-blue-400 border-0 z-10"}
														style={{height: `${height}%`}}/>
												</div>
											})
										}
									</div>
								</>
								: <div className={"absolute w-full h-full flex items-center justify-center"}>
									<span className={"text-sm text-lightSecondary dark:text-darkSecondary opacity-60"}>No data available!</span>
								</div>

					}

					{/*  Horizontal Axis  */}
					<div id={"horAxi"}
						 className={"flex absolute -bottom-8 w-full items-center justify-between border-0 border-gray-800"}>
						{
							Array.from(Array(range <= 0 ? 24 : 7).keys()).map((i) =>
								<span key={i.toString()} style={{fontSize: '0.75rem'}}
									  className={"text-xs text-gray-600"}>{
									range <= 0 ? i % 2 === 0 ? (
										i.toString().padStart(2, '0') + ":00"
									) : '' : `${new Date(Date.now() - ((range - i) * 36e5 * 24)).toDateString()}`
								}</span>
							)
						}
					</div>
				</div>
			</div>
		</>
	)
}

export default Timeline;