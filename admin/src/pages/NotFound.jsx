import { Link } from "react-router-dom";
import "./PlaceholderPage.css";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="placeholder-card">
        <p className="placeholder-icon">🔍</p>
        <h2>404 — Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="back-link">← Back to Dashboard</Link>
      </div>
    </div>
  );
}

export default NotFound;
