import React, {useEffect, useState} from "react";
import Sidebar from "../../components/Sidebar.jsx";
import {Outlet, useLocation, useNavigate} from "react-router-dom";

function Dashboard() {
	const navigate = useNavigate();
	const location = useLocation();
	const [view, setView] = useState(-1);

	const sideItems = [
		{mtIcon: "data_usage", text: "Overview", url: "overview"},
		{mtIcon: "visibility", text: "Blinker", url: "blinker"},
		{mtIcon: "notifications_active", text: "Reminders", url: "reminders"},
		{mtIcon: "settings", text: "Settings", url: "settings"}
	];

	const changeView = (index) => {
		setView(index);
		navigate(`/dashboard/${sideItems[index].url}`);
	}

	useEffect(() => {
		let loc = (location.pathname.split("/")[2]);
		let found = false;
		sideItems.forEach((i, k) => {
			if(i.url === loc) {
				found = true;
				changeView(k);
			}
		});
		if(!found) changeView(0);
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