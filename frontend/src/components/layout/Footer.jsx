// frontend/src/components/layout/Footer.jsx
import { useLocation, Link } from "react-router-dom";

function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const footerStyles = `
    .footer {
      background: linear-gradient(
        135deg,
        var(--primary-hover) 0%,
        var(--primary) 100%
      );
      color: var(--background);
      margin-top: var(--space-48);
      border-top: 3px solid var(--accent);
      box-shadow: var(--shadow-lg);
      font-family: var(--font-body);
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-40) var(--space-24) var(--space-32);
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1fr;
      gap: var(--space-32);
      align-items: start;
    }

    /* Column 1 — Brand */
    .footer-logo {
      color: var(--accent) !important;
      font-family: var(--font-heading);
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: var(--space-8);
    }

    .footer-tagline {
      color: var(--secondary);
      font-style: italic;
      font-size: 13px;
      margin-bottom: var(--space-12);
      line-height: 1.5;
    }

    .footer-desc {
      font-size: 13px;
      color: rgba(255, 253, 249, 0.7);
      line-height: 1.7;
      margin-bottom: var(--space-16);
    }

    /* Social icons row */
    .footer-social {
      display: flex;
      gap: var(--space-8);
      margin-top: var(--space-8);
      flex-wrap: wrap;
    }

    .footer-social a {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 34px !important;
      height: 34px !important;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.2);
      color: rgba(255, 253, 249, 0.85) !important;
      text-decoration: none;
      transition: background-color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
      flex-shrink: 0;
      margin-bottom: 0 !important;
      /* block the translateX from footer-box a:hover */
      transform: none;
      padding: 0;
    }

    .footer-social a svg {
      width: 15px;
      height: 15px;
      display: block;
      flex-shrink: 0;
      fill: currentColor;
      pointer-events: none;
    }

    .footer-social a:hover {
      background: rgba(212, 175, 55, 0.18) !important;
      border-color: var(--accent) !important;
      transform: translateY(-2px) !important;
      color: var(--accent) !important;
    }

    /* Columns 2-4 */
    .footer-box h3 {
      color: var(--accent);
      margin-bottom: var(--space-16);
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }

    .footer-box a {
      display: block;
      color: rgba(255, 253, 249, 0.8);
      text-decoration: none;
      margin-bottom: var(--space-8);
      font-size: 13px;
      transition: color var(--transition-fast), transform var(--transition-fast);
    }

    .footer-box a:hover {
      color: var(--accent);
      transform: translateX(3px);
    }

    /* Contact column text */
    .footer-contact-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-8);
      font-size: 13px;
      color: rgba(255, 253, 249, 0.8);
      margin-bottom: var(--space-8);
      line-height: 1.4;
    }

    .footer-contact-icon {
      flex-shrink: 0;
      font-size: 13px;
      margin-top: 1px;
    }

    /* Bottom bar */
    .footer-bottom {
      border-top: 1px solid rgba(212, 175, 55, 0.15);
      text-align: center;
      padding: var(--space-16) var(--space-24);
      font-size: 12px;
      color: rgba(255, 253, 249, 0.5);
      letter-spacing: 0.4px;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .footer-container {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-24);
        padding: var(--space-32) var(--space-20) var(--space-24);
      }
    }

    @media (max-width: 540px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: var(--space-20);
        padding: var(--space-24) var(--space-16) var(--space-20);
      }
      .footer-logo {
        font-size: 20px;
      }
    }
  `;

  return (
    <>
      <style>{footerStyles}</style>
      {/* Only render footer HTML on non-home pages (home has its own footer) */}
      {!isHomePage && (
        <footer className="footer">
          <div className="footer-container">

            {/* Column 1 — Brand */}
            <div className="footer-box brand-box">
              <h2 className="footer-logo">Rubina Handloom Sarees</h2>
              <p className="footer-tagline">Timeless Elegance Woven With Heritage</p>
              <p className="footer-desc">
                Premium Chanderi, Silk &amp; Bridal Sarees handcrafted with authentic Indian artistry.
              </p>
              <div className="footer-social">
                {/* Instagram */}
                <a href="#" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href="https://wa.me/917470507311" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 — Quick Links */}
            <div className="footer-box">
              <h3>Quick Links</h3>
              <Link to="/">Home</Link>
              <Link to="/products">Shop</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/account">My Account</Link>
            </div>

            {/* Column 3 — Customer Support */}
            <div className="footer-box">
              <h3>Customer Support</h3>
              <a href="#">Shipping Policy</a>
              <a href="#">Returns &amp; Refunds</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms &amp; Conditions</a>
            </div>

            {/* Column 4 — Contact */}
            <div className="footer-box">
              <h3>Contact</h3>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">✉</span>
                <span>support@rubinahandloom.com</span>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">☎</span>
                <span>+91 74705 07311</span>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">⊙</span>
                <span>Chanderi, Madhya Pradesh</span>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            © 2026 Rubina Handloom Sarees. All Rights Reserved.
          </div>
        </footer>
      )}
    </>
  );
}

export default Footer;
