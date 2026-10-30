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

    /* Floating WhatsApp Button */
    .whatsapp-float {
      position: fixed;
      width: 60px;
      height: 60px;
      bottom: var(--space-24, 24px);
      right: var(--space-24, 24px);
      background-color: #25d366;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      z-index: 999;
      transition: transform var(--transition-fast, 0.2s), background-color var(--transition-fast, 0.2s);
    }

    .whatsapp-float svg {
      width: 34px;
      height: 34px;
      fill: #ffffff;
      display: block;
    }

    .whatsapp-float:hover {
      transform: scale(1.1);
      background-color: #1ebe5d;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .footer-container {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-24);
        padding: var(--space-32) var(--space-20) var(--space-24);
      }
    }

    @media (max-width: 768px) {
      .whatsapp-float {
        width: 50px;
        height: 50px;
        bottom: 20px;
        right: 20px;
      }
      .whatsapp-float svg {
        width: 28px;
        height: 28px;
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
        <>
          {/* FLOATING WHATSAPP BUTTON */}
          <a
            href="https://wa.me/917000438132"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            aria-label="Chat with SRK Handloom on WhatsApp"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

          <footer className="footer">
            <div className="footer-container">

              {/* Column 1 — Brand */}
              <div className="footer-box brand-box">
                <h2 className="footer-logo">SRK Handloom</h2>
                <p className="footer-tagline">Timeless Elegance Woven With Heritage</p>
                <p className="footer-desc">
                  Premium Chanderi, Silk &amp; Bridal Sarees handcrafted with authentic Indian artistry.
                </p>
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
                  <span>asarik782@gmail.com</span>
                </div>
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">☎</span>
                  <span>+91 7000438132</span>
                </div>
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">⊙</span>
                  <span>Chanderi, Madhya Pradesh</span>
                </div>

                {/* Social Media Brand Icons */}
                <div className="footer-social" style={{ marginTop: "16px" }}>
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/luxuriouse_boutique?exln=MTBvdnlwMGJ1M3J5bQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit SRK Handloom on Instagram"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@srk_handloom?si=WdMk0xoIxg0WVgnQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit SRK Handloom on YouTube"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>

                  {/* X (formerly Twitter) */}
                  <a
                    href="https://x.com/hathdraha"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit SRK Handloom on X"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/917000438132"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with SRK Handloom on WhatsApp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>

                  {/* Pinterest */}
                  <a
                    href="https://pin.it/6YdTY3unI"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit SRK Handloom on Pinterest"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 0a12 12 0 0 0-4.37 23.18c-.07-.94-.13-2.39.03-3.42l1.16-4.94s-.29-.6-.29-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.26.64 1.26 1.41 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.82 1.48 1.82 1.78 0 3.15-1.88 3.15-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.14-4.52 4.35 0 .86.33 1.79.74 2.29.08.1.09.19.07.29-.08.31-.25 1.03-.29 1.17-.05.19-.16.23-.37.14-1.38-.64-2.24-2.66-2.24-4.28 0-3.48 2.53-6.68 7.3-6.68 3.83 0 6.81 2.73 6.81 6.38 0 3.81-2.4 6.88-5.73 6.88-1.12 0-2.17-.58-2.53-1.27l-.69 2.63c-.25.96-.92 2.16-1.37 2.89A12 12 0 1 0 12 0z"/>
                    </svg>
                  </a>
                </div>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
              © 2026 SRK Handloom. All Rights Reserved.
            </div>
          </footer>
        </>
      )}
    </>
  );
}

export default Footer;
