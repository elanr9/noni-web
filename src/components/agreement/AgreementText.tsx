/* An agreement's text, with each numbered section's name in bold. The text
   itself is stored and hashed as plain text; this only sets it. */
export function AgreementText({ body, className = "" }: { body: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {body
        .trim()
        .split(/\n{2,}/)
        .map((para, i) => {
          const m = para.match(/^(\d+\. [^.\n]{2,40}\.)\s*([\s\S]*)$/);
          return (
            <p key={i} className="m-0 whitespace-pre-line">
              {m ? (
                <>
                  <strong className="font-bold">{m[1]}</strong> {m[2]}
                </>
              ) : (
                para
              )}
            </p>
          );
        })}
    </div>
  );
}
