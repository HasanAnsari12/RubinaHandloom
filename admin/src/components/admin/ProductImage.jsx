import React, { useState, useEffect } from "react";
import "./ProductImage.css";

const ProductImage = ({ src, alt = "Product Thumbnail", className = "" }) => {
  const defaultPlaceholder = "/assets/product-placeholder.png";

  const resolveSrc = (source) => {
    if (!source) return defaultPlaceholder;
    if (typeof source === "string") return source;
    if (source.url) return source.url;
    return defaultPlaceholder;
  };

  const [imgSrc, setImgSrc] = useState(resolveSrc(src));

  useEffect(() => {
    setImgSrc(resolveSrc(src));
  }, [src]);

  const handleError = () => {
    if (imgSrc !== defaultPlaceholder) {
      setImgSrc(defaultPlaceholder);
    }
  };

  return (
    <div className={`product-img-aspect-box ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        className="product-img-thumbnail"
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
    </div>
  );
};

export default ProductImage;
