import { useEffect, useState } from "react";
import { addUniversity, saveProfile, searchUniversities, type StudentProfile, type University } from "../data/profileApi";

type Props = { initData: string; profile: StudentProfile; onSaved: (profile: StudentProfile) => void; onCancel?: () => void };

function formatStudentCount(count: number): string {
  if (count === 0) return "No students yet — be the first";
  if (count === 1) return "1 student studying here";
  return `${count} students studying here`;
}

function ProfileForm({ initData, profile, onSaved, onCancel }: Props) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [universityQuery, setUniversityQuery] = useState(profile.university?.name ?? "");
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(profile.university);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      searchUniversities(initData, universityQuery).then(setUniversities).catch(() => setUniversities([]));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [initData, universityQuery]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return setError("Please enter your first and last name.");
    if (!universityQuery.trim()) return setError("Please select or enter your university.");

    setSaving(true); setError("");
    try {
      const university = selectedUniversity ?? await addUniversity(initData, universityQuery.trim());
      onSaved(await saveProfile(initData, { firstName: firstName.trim(), lastName: lastName.trim(), bio, universityId: university.id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const showResults = universityQuery.trim() && !selectedUniversity;
  const hasExactMatch = universities.some((university) => university.name.toLowerCase() === universityQuery.trim().toLowerCase());
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  return (
      <section className="profile-form-shell">
        <p className="eyebrow">MINGLESTUDY</p>
        <h1>{profile.onboardingComplete ? "Edit your profile" : "Welcome to MingleStudy"}</h1>
        <p className="subtitle">Tell students a little about who they will be learning with.</p>

        <form className="profile-form" onSubmit={submit}>
          <div className="profile-summary-card">
            <div className="profile-summary-avatar">{initials}</div>
            <div className="profile-summary-text">
              <span className="profile-summary-name">
                {firstName.trim() || lastName.trim() ? `${firstName} ${lastName}`.trim() : "Your name"}
              </span>
              <span className="profile-summary-university">
                {selectedUniversity?.name || universityQuery.trim() || "Your university"}
              </span>
            </div>
          </div>

          <div className="profile-group-label">About you</div>
          <div className="profile-group">
            <label className="profile-row">
              <span className="profile-row-label">First name</span>
              <input value={firstName} maxLength={80} onChange={(event) => setFirstName(event.target.value)} />
            </label>
            <label className="profile-row">
              <span className="profile-row-label">Last name</span>
              <input value={lastName} maxLength={80} onChange={(event) => setLastName(event.target.value)} />
            </label>
          </div>

          <div className="profile-group-label">University</div>
          <div className="profile-group">
            <label className="profile-row">
              <span className="profile-row-label">Search</span>
              <input
                  value={universityQuery}
                  maxLength={180}
                  placeholder="Start typing your university name"
                  onChange={(event) => { setUniversityQuery(event.target.value); setSelectedUniversity(null); }}
              />
            </label>
          </div>

          {selectedUniversity && (
              <p className="university-selected-hint">{formatStudentCount(selectedUniversity.studentCount)}</p>
          )}

          {showResults && (
              <div className="profile-group university-results">
                {universities.map((university) => (
                    <button
                        type="button"
                        className="profile-row university-result-row"
                        key={university.id}
                        onClick={() => { setSelectedUniversity(university); setUniversityQuery(university.name); }}
                    >
                      <span className="university-result-name">{university.name}</span>
                      <span className="university-result-count">{formatStudentCount(university.studentCount)}</span>
                    </button>
                ))}
                {!hasExactMatch && (
                    <button
                        type="button"
                        className="profile-row university-result-row university-result-add"
                        onClick={async () => {
                          const university = await addUniversity(initData, universityQuery.trim());
                          setSelectedUniversity(university);
                          setUniversityQuery(university.name);
                        }}
                    >
                      Add "{universityQuery.trim()}"
                    </button>
                )}
              </div>
          )}

          <div className="profile-group-label">Bio <span className="profile-group-label-optional">Optional</span></div>
          <div className="profile-group">
            <label className="profile-row profile-row-textarea">
              <textarea
                  value={bio}
                  maxLength={500}
                  placeholder="What are you studying or hoping to learn?"
                  onChange={(event) => setBio(event.target.value)}
              />
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="primary-button" disabled={saving || !universityQuery.trim()}>
              {saving ? "Saving…" : "Save profile"}
            </button>
            {onCancel && <button className="text-button" type="button" onClick={onCancel}>Cancel</button>}
          </div>
        </form>
      </section>
  );
}

export default ProfileForm;