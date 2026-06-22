import { withSupabase } from "@supabase/server";

// This is a demo request handler wrapped with withSupabase.
// It automatically handles JWT verification, CORS preflight requests,
// and configures RLS-scoped (ctx.supabase) and Admin (ctx.supabaseAdmin) clients.
export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    try {
      // ctx.supabase: RLS-scoped client (uses user's JWT)
      // ctx.supabaseAdmin: Admin client (bypasses RLS using service_role key)
      // ctx.userClaims: Parsed JWT claims of the authenticated user
      const { userClaims } = ctx;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Auth verification successful via @supabase/server SDK",
          user: userClaims || null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
};
