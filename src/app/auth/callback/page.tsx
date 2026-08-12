import { AuthCallbackClient } from "./AuthCallbackClient";

type Search = Promise<{
  code?: string;
  next?: string;
  app?: string;
  sb_flow_id?: string;
}>;

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const params = await searchParams;

  if (params.app === "1" && params.code) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-[15px] text-ink/70">
        Returning to Noni…
      </div>
    );
  }

  return (
    <AuthCallbackClient
      code={params.code ?? null}
      next={params.next ?? "/admin"}
      flowId={params.sb_flow_id ?? null}
    />
  );
}
