import React from "react";

const CategoryImage = ({ src, alt, className = "" }) => {
  const placeholder = "/assets/product-placeholder.png";

  return (
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "var(--bg-main)",
        border: "1px solid var(--border-medium)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        aspectRatio: "1/1",
      }}
      className={className}
    >
      <img
        src={src || placeholder}
        alt={alt || "Category thumbnail"}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.src = placeholder;
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default CategoryImage;
