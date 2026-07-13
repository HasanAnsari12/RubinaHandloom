import "./PageHeader.css";

const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="admin-page-header">
      <div className="header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="header-actions">{children}</div>}
    </div>
  );
};

export default PageHeader;
