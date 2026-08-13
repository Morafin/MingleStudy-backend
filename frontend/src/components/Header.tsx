type HeaderProps = { firstName: string; photoUrl?: string; onProfileClick: () => void };

function Header({ firstName, photoUrl, onProfileClick }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">MINGLESTUDY</p>
        <h1>Hi, {firstName} 👋</h1>
        <p className="subtitle">Find your people. Learn together.</p>
      </div>
      <button className="avatar" aria-label="Edit profile" onClick={onProfileClick}>
        {photoUrl ? <img src={photoUrl} alt={`${firstName}'s profile`} /> : firstName.slice(0, 1).toUpperCase()}
      </button>
    </header>
  );
}

export default Header;
