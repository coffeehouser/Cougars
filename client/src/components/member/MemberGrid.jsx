import { Link } from 'react-router-dom';
import './MemberGrid.css';

const OSI_LAYER_NAMES = {
  1: 'Physical',
  2: 'Data Link',
  3: 'Network',
  4: 'Transport',
  5: 'Session',
  6: 'Presentation',
  7: 'Application',
};

function MemberGrid({ members = [] }) {
  if (members.length === 0) {
    return (
      <div className="member-grid-empty">
        <p>No team profiles yet — check back soon.</p>
      </div>
    );
  }

  return (
    <div className="member-grid">
      {members.map(member => (
        <Link
          key={member._id}
          to={`/member/${member._id}`}
          className="member-card"
        >
          <div className="member-card__photo-wrap">
            <img
              src={member.profileImage || '/default-profile.png'}
              alt={member.name}
              className="member-card__photo"
              onError={e => { e.target.src = '/default-profile.png'; }}
            />
          </div>

          <div className="member-card__body">
            <h3 className="member-card__name">{member.name}</h3>
            <p className="member-card__role">{member.role}</p>

            {member.osiLayers && member.osiLayers.length > 0 && (
              <div className="member-card__layers">
                {member.osiLayers.sort((a, b) => b - a).map(n => (
                  <span key={n} className="member-card__layer-badge">
                    L{n} · {OSI_LAYER_NAMES[n]}
                  </span>
                ))}
              </div>
            )}

            <p className="member-card__meta">{member.major} · {member.semester}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default MemberGrid;
