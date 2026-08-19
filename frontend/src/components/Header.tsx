type HeaderProps = { firstName: string };

function Header({ firstName }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-brand">
                <img src="/logo512.png" alt="MingleStudy" className="brand-icon" />
                <div>
                    <p className="eyebrow">MINGLESTUDY</p>
                    <h1>Hi, {firstName} 👋</h1>
                    <p className="subtitle">Find your people. Learn together.</p>
                </div>
            </div>
        </header>
    );
}

export default Header;