import React from "react";

function Timeline({className = '', range = 'day', data = [], epoch}) {

	const xMax = range === 'day' ? (24 * 3600 * 1000) : range === 'week' ? (7) : 100;
	const yMax = Math.ceil(Math.max(...data.map((x) => (x.end - x.start)), 36e5) / 36e5) + 1;

	return (
		<>
			<div className={"flex w-full relative h-1/3 " + className}>
				{/*  Vertical Axis  */}
				<div id={"vertAxi"} className={"flex flex-col items-center justify-between h-full w-fit"}>
					{
						Array.from(Array(yMax).keys()).reverse().map((i) =>
							<span key={i.toString()} style={{fontSize: '0.75rem'}} className={"text-xs ml-2 text-gray-600"}>{i === 0 ? '' : `${i}hr` }</span>
						)
					}
				</div>
				<div className={"flex flex-col items-center justify-between h-full w-full absolute px-10"}>
					{
						Array.from(Array(yMax).keys()).reverse().map((i) =>
							<hr key={i.toString()} className={`w-full border-0 bg-gray-600 opacity-10 ${i === 0 ? 'invisible' : '' }`} style={{height: "1.5px"}} />
						)
					}
				</div>
				{/*  Data  */}
				<div className={"flex items-end w-full h-full relative mx-4"}>

					{
						data.map((session, index) => {
							const duration = session.end - session.start;
							const start = (100 * session.start) / xMax;
							const end = (100 * session.end) / xMax;
							const width = end - start;
							const height = (100 * duration) / (yMax * 36e5);

							return <div className={"flex items-end absolute h-full"} key={index.toString()} style={{left: `${start}%`, width: `${width}%`}}>

								<div title={`
								${new Date(epoch + session.start).toLocaleTimeString()} - ${new Date(epoch + session.end).toLocaleTimeString()}
							`} className={"flex flex-col rounded-md cursor-pointer h-full border-0"} style={{width: `${width}%`}}>
									<hr className={"w-full absolute bottom-0 rounded border-0 z-10 session h-full"} />
									<hr className={"w-full absolute bottom-0 rounded bg-blue-400 border-0 z-10"} style={{height: `${height}%`}} />
								</div>

							</div>

						})
					}

					{/*  Horizontal Axis  */}
					<div id={"horAxi"} className={"flex absolute -bottom-8 w-full items-center justify-between border-0 border-gray-800"}>
						{
							Array.from(Array(24).keys()).map((i) =>
								<span key={i.toString()} style={{fontSize: '0.75rem'}} className={"text-xs text-gray-600"}>{
									i % 6 === 0 ? (
										i === 0 ? '12 AM' : i === 6 ? '6 AM' : i === 12 ? '12 PM' : i === 18 ? '6 PM' : ''
									) : ''
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