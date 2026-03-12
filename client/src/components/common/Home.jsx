import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import OSIStack from '../home/OSIStack';
import MemberGrid from '../member/MemberGrid';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberService.getAllMembers()
      .then(data => setMembers(data.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-container">

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero__eyebrow">Mid-State Technical College · IT Club</div>
        <h1 className="home-hero__title">Cyber Cougars<br />OSI Showcase</h1>
        <p className="home-hero__subtitle">
          Demonstrating all seven layers of the OSI model through hands-on networking,
          security, and web technology — live at the industry event on March&nbsp;17,&nbsp;2026.
        </p>

        {isAuthenticated ? (
          <div className="home-hero__actions">
            <Link to="/my-profile" className="btn btn-primary">My Profile</Link>
            <Link to="/profile/create" className="btn btn-secondary">Create Profile</Link>
          </div>
        ) : (
          <div className="home-hero__actions">
            <Link to="/register" className="btn btn-primary">Join the Team</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        )}
      </section>

      {/* ── OSI Stack ── */}
      <section className="home-section">
        <div className="home-section__header">
          <h2>OSI Layer Coverage</h2>
          <p>Each team member owns one or more layers of the OSI model. Click a name to see their profile.</p>
        </div>
        <OSIStack members={members} />
      </section>

      {/* ── Team ── */}
      <section className="home-section">
        <div className="home-section__header">
          <h2>Meet the Team</h2>
          <p>Click any card to view a full member profile.</p>
        </div>
        {loading ? (
          <div className="home-loading">
            <div className="spinner" />
            <p>Loading team...</p>
          </div>
        ) : (
          <MemberGrid members={members} />
        )}
      </section>

    </div>
  );
};

export default Home;
