import { HowItWorks } from "@/components/landing/HowItWorks";

/* Dev preview of the landing How it works section. 404 in production. */
export default function HowPreview() {
  return (
    <div className="landing-root min-h-screen bg-white">
      <style>{`.landing-root{--nav:0px}.landing-screen-fixed{height:100svh;min-height:520px}`}</style>
      <HowItWorks />
    </div>
  );
}
