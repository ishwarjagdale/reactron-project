import React from "react";

function Timeline({className = '', range = 'day', data = [], epoch}) {

	const xMax = range === 'day' ? (24 * 3600 * 1000) : range === 'week' ? (7) : 100;
	const xMin = 0;
	const yMax = Math.ceil(Math.max(...data.map((x) => (x.end - x.start)), 5 * 36e5) / 36e5);

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
				{/*  Data  */}
				<div className={"flex items-end w-full h-full relative mx-4"}>

					{
						data.map((session, index) => {
							const duration = session.end - session.start;
							const start = (100 * session.start) / xMax;
							const end = (100 * session.end) / xMax;
							const width = end - start;
							const height = (100 * duration) / (yMax * 36e5);

							return <div title={`
								${new Date(epoch + session.start).toLocaleTimeString()} - ${new Date(epoch + session.end).toLocaleTimeString()}
							`} className={"flex items-end absolute w-full h-full"} key={index.toString()} style={{left: `${start}%`}}>
								<hr className={"rounded h-full border-0 hover:opacity-25"} style={{width: `${width}%`, background: 'rgba(255, 255, 255, 0.05)'}} />
								<hr className={"w-1 rounded-t bg-blue-400 border-0"} style={{height: `${height}%`, left: `${end}%`}} />
							</div>

						})
					}

					{/*  Horizontal Axis  */}
					<div id={"horAxi"} className={"flex absolute -bottom-4 w-full items-center justify-between border-t border-gray-800"}>
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