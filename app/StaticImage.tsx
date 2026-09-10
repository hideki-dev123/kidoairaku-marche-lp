type StaticImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function StaticImage({ src, alt, priority }: StaticImageProps) {
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} />;
}
