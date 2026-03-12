import { Link } from 'react-router-dom';
import './OSIStack.css';

const OSI_LAYERS = [
  { num: 7, name: 'Application',  protocol: 'HTTP, DNS, FTP, SMTP' },
  { num: 6, name: 'Presentation', protocol: 'SSL/TLS, Encoding' },
  { num: 5, name: 'Session',      protocol: 'NetBIOS, RPC, SSH' },
  { num: 4, name: 'Transport',    protocol: 'TCP, UDP' },
  { num: 3, name: 'Network',      protocol: 'IP, ICMP, Routing' },
  { num: 2, name: 'Data Link',    protocol: 'Ethernet, VLAN, MAC' },
  { num: 1, name: 'Physical',     protocol: 'Cables, Switches, NICs' },
];

function OSIStack({ members = [] }) {
  return (
    <div className="osi-stack">
      <div className="osi-label-row">
        <span className="osi-label-text">OSI Layer</span>
        <span className="osi-label-text">Protocols</span>
        <span className="osi-label-text">Team Coverage</span>
      </div>

      {OSI_LAYERS.map((layer) => {
        const assigned = members.filter(m =>
          Array.isArray(m.osiLayers) && m.osiLayers.includes(layer.num)
        );
        const isActive = assigned.length > 0;

        return (
          <div
            key={layer.num}
            className={`osi-row ${isActive ? 'osi-row--active' : 'osi-row--open'}`}
          >
            <div className="osi-layer-id">
              <span className="osi-layer-num">{layer.num}</span>
              <span className="osi-layer-name">{layer.name}</span>
            </div>

            <div className="osi-protocols">
              <code>{layer.protocol}</code>
            </div>

            <div className="osi-members">
              {isActive ? (
                assigned.map(m => (
                  <Link
                    key={m._id}
                    to={`/member/${m._id}`}
                    className="osi-member-chip"
                  >
                    {m.name}
                  </Link>
                ))
              ) : (
                <span className="osi-open-label">Open</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OSIStack;
