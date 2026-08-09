import { readFile } from "fs/promises";
import path from "path";
import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const raw = await readFile(
    path.join(process.cwd(), "content/privacy.md"),
    "utf8",
  );
  const body = raw.replace(/^# Privacy Policy\n+/, "");

  return (
    <LegalPage title="Privacy Policy">
      {body.split("\n").map((line, i) => {
        if (line.startsWith("## "))
          return (
            <h2 key={i} className="display pt-6 text-2xl font-semibold text-ink">
              {line.replace(/^## /, "")}
            </h2>
          );
        if (line.startsWith("### "))
          return (
            <h3 key={i} className="pt-3 text-lg font-bold text-ink">
              {line.replace(/^### /, "")}
            </h3>
          );
        if (line.startsWith("- "))
          return (
            <li key={i} className="ml-5 list-disc">
              {line.replace(/^- /, "")}
            </li>
          );
        if (line.trim() === "" || line.trim() === "---") return null;
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <p key={i} className="font-semibold text-ink">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        return <p key={i}>{line.replace(/\*\*/g, "")}</p>;
      })}
    </LegalPage>
  );
}
