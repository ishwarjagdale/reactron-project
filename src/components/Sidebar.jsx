import React from "react";


function SideItems({index, active, mtIcon, text, handleChange}) {
	return (
		<>
			<li onClick={() => handleChange(index)} className={`flex items-center ${active ? 'bg-darkComp text-black' : 'text-gray-400 hover:bg-darkSecBG'} p-2 mb-2 px-4 rounded-md w-full h-fit`}>
				<span className={"material-icons text-xl"}>{ mtIcon }</span>
				<span className={"text-sm pl-2"}>{ text }</span>
			</li>
		</>
	)
}


function Sidebar({sideItems, active=0, handleChange}) {
	return (
		<>
			<ul className={"flex flex-col w-full p-2 h-full"} style={{maxWidth: "16rem"}}>
				{
					sideItems.map((item, i) =>
						<SideItems key={i.toString()} index={i} handleChange={handleChange} active={i === active} mtIcon={item.mtIcon} text={item.text} />
					)
				}
			</ul>
		</>
	)
}

export default Sidebar;