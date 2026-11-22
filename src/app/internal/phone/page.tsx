import { Phone } from "@/components/landing/Phone";

/* Dev preview of the landing phone frame. 404 in production. */
export default function PhonePreview() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-10 bg-white p-10">
      <Phone src="/landing/briefs.png" alt="" className="w-[300px]" />
      <div className="h-[640px]">
        <Phone fitHeight src="/landing/analytics.png" alt="" />
      </div>
    </div>
  );
}
