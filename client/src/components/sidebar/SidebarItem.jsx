const SidebarItem = ({ icon, text, active, onClick }) => (
	<div
		onClick={onClick}
		className={`flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 ${
			active
				? "border-l-4 border-blue-600 bg-blue-50 text-blue-600 font-medium"
				: "text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-l-4 border-transparent"
		}`}
	>
		<span className="mr-3">{icon}</span>
		<span>{text}</span>
	</div>
);

export default SidebarItem;
