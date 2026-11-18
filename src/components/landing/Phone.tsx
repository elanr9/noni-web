import Image from "next/image";

/* A real Noni screen in a plain device frame. Radii are percentages so the
   frame keeps its shape at any width; set the width on `className`. */
export function Phone({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 300px, 60vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className={`shrink-0 rounded-[13%/6%] bg-ink p-[2.6%] shadow-[0_30px_60px_-20px_rgba(15,23,32,0.35),0_8px_20px_-8px_rgba(15,23,32,0.2)] ${className}`}
    >
      <div className="overflow-hidden rounded-[11%/5.1%] bg-[#f2f3f5]">
        <Image
          src={src}
          alt={alt}
          width={780}
          height={1688}
          priority={priority}
          sizes={sizes}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}
