import { HeroDemo } from "@/components/landing/HeroDemo";

/* Dev preview of the landing hero picture. 404 in production. */
export default function HeroPreview() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-10">
      <HeroDemo />
    </div>
  );
}
