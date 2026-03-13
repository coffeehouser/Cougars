import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import memberService from '../../services/memberService';
import './MemberForm.css';

const MAJORS = [
  'IT - Networking',
  'IT - Cybersecurity',
  'IT - Software Development',
  'IT - General',
  'Other',
];

const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  'Graduate',
];

const OSI_LAYERS = [
  { num: 7, name: 'Application' },
  { num: 6, name: 'Presentation' },
  { num: 5, name: 'Session' },
  { num: 4, name: 'Transport' },
  { num: 3, name: 'Network' },
  { num: 2, name: 'Data Link' },
  { num: 1, name: 'Physical' },
];

const EMPTY_FORM = {
  name: '',
  major: '',
  semester: '',
  role: '',
  osiLayers: [],
  osiDescription: '',
  bio: '',
  linkedinUrl: '',
  githubUrl: '',
  profileImage: '',
};

function MemberForm({ mode = 'create', existingMember = null }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (mode === 'edit' && existingMember) {
      setFormData({
        name: existingMember.name || '',
        major: existingMember.major || '',
        semester: existingMember.semester || '',
        role: existingMember.role || '',
        osiLayers: existingMember.osiLayers || [],
        osiDescription: existingMember.osiDescription || '',
        bio: existingMember.bio || '',
        linkedinUrl: existingMember.linkedinUrl || '',
        githubUrl: existingMember.githubUrl || '',
        profileImage: existingMember.profileImage || '',
      });
    }
  }, [mode, existingMember]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLayerToggle = (layerNum) => {
    setFormData(prev => {
      const current = prev.osiLayers;
      const updated = current.includes(layerNum)
        ? current.filter(n => n !== layerNum)
        : [...current, layerNum];
      return { ...prev, osiLayers: updated };
    });
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Display name is required.';
    if (!formData.major) return 'Please select your major.';
    if (!formData.semester) return 'Please select your semester.';
    if (!formData.role.trim()) return 'Project role is required.';
    if (formData.linkedinUrl && !/^https?:\/\//.test(formData.linkedinUrl)) {
      return 'LinkedIn URL must start with http:// or https://';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      let member;

      if (mode === 'create') {
        const res = await memberService.createMember(formData);
        member = res.member;
      } else {
        const res = await memberService.updateMember(existingMember._id, formData);
        member = res.member;
      }

      navigate(`/member/${member._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="member-form-page">
      <div className="member-form-card card">
        <div className="card-header">
          <h2>{mode === 'create' ? 'Create Your Profile' : 'Edit Profile'}</h2>
          <p className="text-muted">
            {mode === 'create'
              ? 'Set up your Cyber Cougars showcase profile.'
              : 'Update your profile information.'}
          </p>
        </div>

        {error && <div className="member-form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="member-form">

          {/* Profile Image */}
          <div className="form-group">
            <label htmlFor="profileImage">Profile Photo Path</label>
            <input
              id="profileImage"
              name="profileImage"
              type="text"
              value={formData.profileImage}
              onChange={handleChange}
              placeholder="/images/headshots/yourname.jpg"
            />
            <span className="form-help">
              Place your headshot in <code>client/public/images/headshots/</code> and enter the path above.
              Leave blank to use the default photo.
            </span>
            {formData.profileImage && (
              <img
                src={formData.profileImage}
                alt="Preview"
                className="member-form__preview"
                style={{ marginTop: '8px', borderRadius: '8px', maxHeight: '160px', objectFit: 'cover' }}
              />
            )}
          </div>

          {/* Name + Role row */}
          <div className="member-form__row">
            <div className="form-group">
              <label htmlFor="name">Display Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                maxLength={80}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Project Role *</label>
              <input
                id="role"
                name="role"
                type="text"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Network Engineer"
                maxLength={100}
                required
              />
            </div>
          </div>

          {/* Major + Semester row */}
          <div className="member-form__row">
            <div className="form-group">
              <label htmlFor="major">Major *</label>
              <select id="major" name="major" value={formData.major} onChange={handleChange} required>
                <option value="">Select a major...</option>
                {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="semester">Semester *</label>
              <select id="semester" name="semester" value={formData.semester} onChange={handleChange} required>
                <option value="">Select semester...</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* LinkedIn + GitHub row */}
          <div className="member-form__row">
            <div className="form-group">
              <label htmlFor="linkedinUrl">LinkedIn URL</label>
              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <div className="form-group">
              <label htmlFor="githubUrl">GitHub URL</label>
              <input
                id="githubUrl"
                name="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          {/* OSI Layers */}
          <div className="form-group">
            <label>OSI Layers You're Demonstrating</label>
            <div className="member-form__osi-grid">
              {OSI_LAYERS.map(layer => (
                <label key={layer.num} className="member-form__osi-check">
                  <input
                    type="checkbox"
                    checked={formData.osiLayers.includes(layer.num)}
                    onChange={() => handleLayerToggle(layer.num)}
                  />
                  <span className="member-form__osi-badge">L{layer.num}</span>
                  <span>{layer.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* OSI Description */}
          <div className="form-group">
            <label htmlFor="osiDescription">What Are You Demonstrating? (OSI context)</label>
            <textarea
              id="osiDescription"
              name="osiDescription"
              value={formData.osiDescription}
              onChange={handleChange}
              placeholder="Briefly describe what you're showing at your station and which OSI concepts it illustrates..."
              maxLength={500}
              rows={3}
            />
            <span className="form-help">{formData.osiDescription.length}/500 characters</span>
          </div>

          {/* Bio */}
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="A brief intro about yourself — background, interests, career goals..."
              maxLength={1000}
              rows={4}
            />
            <span className="form-help">{formData.bio.length}/1000 characters</span>
          </div>

          {/* Actions */}
          <div className="member-form__actions">
            <button type="submit" className="btn btn-primary btn-large" disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create Profile' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default MemberForm;
