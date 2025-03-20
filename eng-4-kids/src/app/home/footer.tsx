export const Footer: React.FC = () => {
    return (
        <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
            <p>&copy; {new Date().getFullYear()} Eng-4-Kids. All rights reserved.</p>
        </footer>
    );
};
