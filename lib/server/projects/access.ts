import { createSessionSupabaseClient } from "@/lib/supabase/server";

export async function getProjectAccess(projectId: string): Promise<{
  customer: boolean;
  developer: boolean;
}> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { customer: false, developer: false };
  }
  const [customer, developer] = await Promise.all([
    supabase.rpc("is_project_customer", { p_project_id: projectId }),
    supabase.rpc("is_assigned_project_developer", { p_project_id: projectId }),
  ]);
  return {
    customer: Boolean(customer.data),
    developer: Boolean(developer.data),
  };
}
