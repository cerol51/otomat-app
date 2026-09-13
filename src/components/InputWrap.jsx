export const InputWrap = ({ label, htmlFor, children }) => (
    <div className="mb-4">
        <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
        {children}
    </div>
);
