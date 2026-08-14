export const TableRow = ({ label, children, bg = "bg-white/50" }) => (
    <div className={`flex flex-col sm:flex-row border-b border-gray-100/80 ${bg} backdrop-blur-sm`}>
        <div className="sm:w-2/5 p-4 font-semibold text-slate-500 bg-slate-50/50 border-r border-gray-100/80 flex items-center justify-start sm:justify-end text-left sm:text-right text-[13px] uppercase tracking-wider">
            {label}
        </div>
        <div className="sm:w-3/5 p-4 text-slate-700 flex items-center flex-wrap gap-2 text-sm leading-relaxed">
            {children}
        </div>
    </div>
);
