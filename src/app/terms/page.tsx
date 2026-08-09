import { readFile } from "fs/promises";
import path from "path";
import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const raw = await readFile(path.join(process.cwd(), "content/terms.md"), "utf8");
  const body = raw.replace(/^# Terms of Service\n+/, "");

  return (
    <LegalPage title="Terms of Service">
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
        return <p key={i}>{line.replace(/\*\*/g, "")}</p>;
      })}
    </LegalPage>
  );
}
