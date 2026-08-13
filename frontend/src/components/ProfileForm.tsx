import { useState } from "react";
import { addUniversity, saveProfile, type StudentProfile, type University } from "../data/profileApi";

type Props = { initData: string; profile: StudentProfile; onSaved: (profile: StudentProfile) => void; onCancel?: () => void };

// Preset institutes shown at the top of the dropdown for quick selection.
// Add more names here as you onboard more institutes.
const PRESET_INSTITUTES = ["ISFT Institute"];

const CUSTOM_VALUE = "__custom__";

function ProfileForm({ initData, profile, onSaved, onCancel }: Props) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [bio, setBio] = useState(profile.bio ?? "");

  const initialIsPreset = profile.university ? PRESET_INSTITUTES.includes(profile.university.name) : false;
  const [dropdownValue, setDropdownValue] = useState<string>(
      initialIsPreset ? (profile.university as University).name : profile.university ? CUSTOM_VALUE : ""
  );
  const [universityQuery, setUniversityQuery] = useState(profile.university?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    setDropdownValue(value);
    setError("");

    if (value === "" || value === CUSTOM_VALUE) {
      setUniversityQuery("");
    } else {
      // A preset was picked — just fill the query text with it.
      // The actual University record is created/fetched on Save.
      setUniversityQuery(value);
    }
  }

  const showCustomInput = dropdownValue === CUSTOM_VALUE;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return setError("Please enter your first and last name.");
    if (!universityQuery.trim()) return setError("Please select or enter your university.");

    setSaving(true); setError("");
    try {
      const university = await addUniversity(initData, universityQuery.trim());
      onSaved(await saveProfile(initData, { firstName: firstName.trim(), lastName: lastName.trim(), bio, universityId: university.id }));
    } catch (err) {
      // Show the real reason instead of a generic message — no dev tools needed inside Telegram.
      setError(err instanceof Error ? err.message : "We could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
      <section className="profile-form-shell">
        <p className="eyebrow">MINGLESTUDY</p>
        <h1>{profile.onboardingComplete ? "Edit your profile" : "Welcome to MingleStudy"}</h1>
        <p className="subtitle">Tell students a little about who they will be learning with.</p>
        <form className="profile-form" onSubmit={submit}>
          <label>First name<input value={firstName} maxLength={80} onChange={(event) => setFirstName(event.target.value)} /></label>
          <label>Last name<input value={lastName} maxLength={80} onChange={(event) => setLastName(event.target.value)} /></label>

          <label>
            University
            <select value={dropdownValue} onChange={handleDropdownChange}>
              <option value="">Select your university</option>
              {PRESET_INSTITUTES.map((name) => <option key={name} value={name}>{name}</option>)}
              <option value={CUSTOM_VALUE}>Other (type it in)…</option>
            </select>
          </label>

          {showCustomInput && (
              <input
                  value={universityQuery}
                  maxLength={180}
                  placeholder="Enter your university"
                  onChange={(event) => setUniversityQuery(event.target.value)}
              />
          )}

          <label>Bio <span>Optional</span><textarea value={bio} maxLength={500} placeholder="What are you studying or hoping to learn?" onChange={(event) => setBio(event.target.value)} /></label>
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