import { AuthCallbackClient } from "./AuthCallbackClient";
import { ReturnToApp } from "./ReturnToApp";

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
    const q = new URLSearchParams({ code: params.code });
    if (params.sb_flow_id) q.set("sb_flow_id", params.sb_flow_id);
    return <ReturnToApp query={q.toString()} />;
  }

  return (
    <AuthCallbackClient
      code={params.code ?? null}
      next={params.next ?? "/admin"}
      flowId={params.sb_flow_id ?? null}
    />
  );
}
