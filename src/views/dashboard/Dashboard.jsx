import React, {useEffect, useState} from "react";
import Sidebar from "../../components/Sidebar.jsx";
import {Outlet, useNavigate} from "react-router-dom";

function Dashboard() {
	const navigate = useNavigate();
	const [view, setView] = useState(0);

	const sideItems = [
		{mtIcon: "data_usage", text: "Overview"},
		{mtIcon: "settings", text: "Settings"}
	];

	const changeView = (index) => {
		setView(index);
		switch (index) {
			case 0: navigate("/dashboard/overview"); break;
			case 1: navigate("/dashboard/settings"); break;
			default: changeView(0);
		}
	}

	useEffect(() => {
		changeView(0);
	}, []);

	return (
		<>
			<div className={"flex w-full h-full items-start"}>
				<Sidebar sideItems={sideItems} handleChange={changeView} active={view} />
				<hr className={"h-full border-none mx-2 bg-gray-200 invisible dark:bg-darkSecBG"} style={{width: "1px"}} />
				<div className={"flex p-2 h-full w-full"} style={{minWidth: "48rem"}}>
					<Outlet />
				</div>
			</div>
		</>
	)
}

export default Dashboard;