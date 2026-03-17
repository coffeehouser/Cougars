import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import OSIStack from '../home/OSIStack';
import MemberGrid from '../member/MemberGrid';
import PhotoGallery from '../home/PhotoGallery';
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
          In three weeks, after class hours, a team of students from Development, Networking,
          and Security programs designed, cabled, configured, and deployed a fully functional
          network infrastructure — and the web application you are looking at right now.
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

      {/* ── Build Story ── */}
      <section className="home-section">
        <div className="home-section__header">
          <h2>The Three-Week Build</h2>
          <p>No external help. No dedicated lab time. Just a group of students who decided to build something real after class.</p>
        </div>
        <div className="home-phases">
          <div className="home-phase">
            <span className="home-phase__num">01</span>
            <h3>Planning &amp; Physical Infrastructure</h3>
            <p>The team came together across program tracks and defined the project scope. Students ran and terminated network cables, racked equipment, and established the physical layer — the foundation everything else depends on.</p>
          </div>
          <div className="home-phase">
            <span className="home-phase__num">02</span>
            <h3>Network Design &amp; Configuration</h3>
            <p>Networking students configured two Cisco 2960 switches and a Cisco 4321 router. VLANs were designed and deployed to segment traffic, with inter-VLAN routing handled via Router-on-a-Stick — a production-grade architecture built and verified by students.</p>
          </div>
          <div className="home-phase">
            <span className="home-phase__num">03</span>
            <h3>Server Build, Apache &amp; Go-Live</h3>
            <p>The server was physically built and configured by the team. Apache was installed, the web application was developed and deployed, and the entire stack was tested end-to-end.</p>
          </div>
        </div>
      </section>

      {/* ── What We Built ── */}
      <section className="home-section">
        <div className="home-section__header">
          <h2>What We Built</h2>
          <p>Every component in this infrastructure was designed, configured, and deployed by club members.</p>
        </div>
        <div className="home-built-grid">
          <div className="home-built-item">
            <span className="home-built-item__label">Network Cabling</span>
            <p>Students ran, terminated, and tested all network cables by hand. Every connection was made by a club member — no pre-made patch cables, no shortcuts.</p>
          </div>
          <div className="home-built-item">
            <span className="home-built-item__label">Cisco 2960 Switches</span>
            <p>Two Cisco Catalyst 2960 switches configured with VLANs, trunk links, and access port assignments to segment the network and carry inter-VLAN traffic to the router.</p>
          </div>
          <div className="home-built-item">
            <span className="home-built-item__label">Cisco 4321 Router</span>
            <p>A Cisco 4321 ISR configured using Router-on-a-Stick, with subinterfaces and 802.1Q encapsulation to route traffic between VLANs — a real enterprise routing design.</p>
          </div>
          <div className="home-built-item">
            <span className="home-built-item__label">VLAN Segmentation</span>
            <p>The network is logically segmented using VLANs, isolating traffic by function — mirroring the design approach used in enterprise environments to control broadcast domains and enforce security boundaries.</p>
          </div>
          <div className="home-built-item">
            <span className="home-built-item__label">Physical Server Build</span>
            <p>The web server was assembled by the team from selected hardware, with the operating system configured from scratch before any services were deployed.</p>
          </div>
          <div className="home-built-item">
            <span className="home-built-item__label">Apache Web Server</span>
            <p>Apache installed, configured, and deployed on Linux. This site is being served live from that machine, sitting on the network infrastructure the club built.</p>
          </div>
        </div>
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

      {/* ── Gallery ── */}
      <section className="home-section">
        <div className="home-section__header">
          <h2>Behind the Build</h2>
          <p>The Cyber Cougars putting in the work.</p>
        </div>
        <PhotoGallery />
      </section>

    </div>
  );
};

export default Home;
