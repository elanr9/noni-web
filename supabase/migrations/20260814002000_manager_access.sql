-- Company-admin toggles for what campaign managers can see and do in the
-- app live at companies.settings.manager_access. Only the company admin
-- (or platform admin / service role) may change that key.

create or replace function public.enforce_company_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role and SQL jobs carry no auth uid; clients are RLS-scoped.
  if auth.uid() is null or public.is_platform_admin() then
    return new;
  end if;
  if new.settings -> 'account_template' is distinct from old.settings -> 'account_template'
     and not public.has_permission('edit_account_template') then
    raise exception 'edit_account_template permission required';
  end if;
  if new.settings -> 'publish' is distinct from old.settings -> 'publish'
     and not public.has_permission('manage_publish_time') then
    raise exception 'manage_publish_time permission required';
  end if;
  if new.settings -> 'manager_access' is distinct from old.settings -> 'manager_access'
     and not public.is_company_admin() then
    raise exception 'company admin only';
  end if;
  return new;
end;
$$;
