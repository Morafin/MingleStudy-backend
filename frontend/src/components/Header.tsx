type HeaderProps = { firstName: string };

function Header({ firstName }: HeaderProps) {
    return (
        <header className="header">
            <div>
                <p className="eyebrow">MINGLESTUDY</p>
                <h1>Hi, {firstName} 👋</h1>
                <p className="subtitle">Find your people. Learn together.</p>
            </div>
        </header>
    );
}

export default Header;