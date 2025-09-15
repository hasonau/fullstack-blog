import { IKImage } from "imagekitio-react";

const Image = ({ src, className, w, h, alt }) => {
  const isAbsoluteUrl = src.startsWith("http");

  return (
    <IKImage
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
      {...(isAbsoluteUrl ? { src } : { path: src })}
      className={className}
      loading="lazy"
      lqip={{ active: true, quality: 20 }}
      alt={alt}
      width={w}
      height={h}
      transformation={[
        {
          width: w,
          height: h,
        },
      ]}
    />
  );
};

export default Image;
