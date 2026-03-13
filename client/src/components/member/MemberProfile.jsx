import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import './MemberProfile.css';

const OSI_LAYER_NAMES = {
  1: 'Physical',
  2: 'Data Link',
  3: 'Network',
  4: 'Transport',
  5: 'Session',
  6: 'Presentation',
  7: 'Application',
};

function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    memberService.getMemberById(id)
      .then(data => setMember(data.member))
      .catch(() => setError('Member not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  // auth controller returns user.id (not user._id); member.owner is populated so has ._id
  const isOwner = user && member && member.owner &&
    (member.owner._id === user.id || member.owner === user.id);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await memberService.deleteMember(member._id);
      navigate('/');
    } catch {
      setError('Failed to delete profile. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="member-profile-loading">
        <div className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="member-profile-error">
        <h2>Profile Not Found</h2>
        <p>{error || 'This member profile does not exist.'}</p>
        <Link to="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="member-profile-page">

      {/* Banner bar */}
      <div className="member-profile__banner" />

      <div className="member-profile-layout">

        {/* ── Left Sidebar ── */}
        <aside className="member-profile__sidebar">

          <div className="member-profile__photo-wrap">
            <img
              src={member.profileImage || '/images/headshots/default.jpg'}
              alt={member.name}
              className="member-profile__photo"
              onError={e => { e.target.src = '/images/headshots/default.jpg'; }}
            />
          </div>

          <div className="member-profile__identity">
            <h1 className="member-profile__name">{member.name}</h1>
            <p className="member-profile__role">{member.role}</p>
          </div>

          {member.osiLayers && member.osiLayers.length > 0 && (
            <div className="member-profile__osi">
              <h4 className="member-profile__section-title">OSI Layers</h4>
              <div className="member-profile__osi-badges">
                {member.osiLayers.sort((a, b) => b - a).map(n => (
                  <span key={n} className="member-profile__osi-badge">
                    <span className="member-profile__osi-num">L{n}</span>
                    {OSI_LAYER_NAMES[n]}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="member-profile__meta">
            <div className="member-profile__meta-item">
              <span className="member-profile__meta-label">Major</span>
              <span>{member.major}</span>
            </div>
            <div className="member-profile__meta-item">
              <span className="member-profile__meta-label">Semester</span>
              <span>{member.semester}</span>
            </div>
          </div>

          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary member-profile__linkedin-btn"
            >
              View LinkedIn
            </a>
          )}

          {isOwner && (
            <div className="member-profile__owner-actions">
              <Link to="/profile/edit" className="btn btn-secondary btn-small">Edit Profile</Link>
              <button
                className="btn btn-danger btn-small"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}

        </aside>

        {/* ── Main Content ── */}
        <main className="member-profile__main">

          {member.bio && (
            <section className="member-profile__section">
              <h3 className="member-profile__section-title">About</h3>
              <p className="member-profile__bio">{member.bio}</p>
            </section>
          )}

          {member.osiDescription && (
            <section className="member-profile__section">
              <h3 className="member-profile__section-title">OSI Showcase — What I'm Demonstrating</h3>
              <div className="member-profile__osi-desc">
                {member.osiLayers && member.osiLayers.length > 0 && (
                  <div className="member-profile__osi-desc-layers">
                    {member.osiLayers.sort((a, b) => b - a).map(n => (
                      <span key={n} className="member-profile__osi-tag">
                        Layer {n} · {OSI_LAYER_NAMES[n]}
                      </span>
                    ))}
                  </div>
                )}
                <p>{member.osiDescription}</p>
              </div>
            </section>
          )}

          {!member.bio && !member.osiDescription && (
            <section className="member-profile__section">
              <p className="text-muted">This member hasn't added a bio yet.</p>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}

export default MemberProfile;
