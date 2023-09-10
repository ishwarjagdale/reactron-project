import React from "react";

function AppDonut({appUsages}) {
	
	const width = 50;
	const strokeWidth = 4
	const radius = width - strokeWidth;
	const strokeLinecap = "round"; // "butt | round | square | inherit"
	const strokeLinejoin = "round"; // "miter | round | bevel | inherit"
	const pathLength = 100;

	const colors = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58"];

	// const total = 36e2 * 24;
	const total = appUsages.length ? appUsages.map(r => r.usage).reduce((previousValue, currentValue) => previousValue + currentValue) : 0;
	let sum = 0;

	const hours = Number.parseInt(total / 36e5);
	const minutes = Number.parseInt((total % 36e5) / 6e4);

	return (
		<>
			<div className={"flex items-center relative justify-center w-1/3"} style={{minWidth: "15rem"}}>
				<div className={"absolute flex items-center"}>
					{
						hours ? <div className={"flex items-end mr-2"}>
							<span className={"font-bold text-4xl"}>{hours}</span>
							<span className={"text-xl font-medium text-lightSecondary dark:text-darkSecondary"}>Hr</span>
						</div> : <></>
					}
					{
						minutes ? <div className={"flex items-end"}>
							<span className={"font-bold text-4xl"}>{minutes}</span>
							<span className={"text-xl font-medium text-lightSecondary dark:text-darkSecondary"}>Min</span>
						</div> : <></>
					}
					{
						!hours && !minutes ? <span className={"text-sm text-lightSecondary dark:text-darkSecondary opacity-60"}>No data available!</span> : <></>
					}

				</div>
				<svg id={"donut"} className={"aspect-square"} style={{height: "15rem"}}>
					<circle cx={"50%"} cy={"50%"} r={`${radius}%`} fill={"none"} className={"donut-back"} strokeWidth={`${strokeWidth}%`}></circle>
					{
						appUsages.map((k, i) => {
							let w = ((k.usage * 100) / (total || 100));
							sum += w;

							return <circle key={i.toString()} aria-description={k.path.toString()}
								strokeDasharray={`${w} ${pathLength - w}`} pathLength={pathLength} strokeDashoffset={-(sum - w)}
								strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin}
								cx={"50%"} cy={"50%"} r={`${radius}%`} fill={"none"} stroke={colors[((i % 4) + Number.parseInt(i / 4)) % 4]} strokeWidth={`${strokeWidth}%`}></circle>
						})
					}
				</svg>
			</div>
		</>

	)
}

export default AppDonut;