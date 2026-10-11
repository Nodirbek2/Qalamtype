# Qalamtype audit — 11 October 2026

Repository: Nodirbek2/Qalamtype. Supabase: btusuhujuegpglonfdvz.

## Repairs

- Added missing profiles.is_profile_complete and private academy_progress storage. Production Postgres logs confirmed repeated missing-column errors before repair.
- Removed Supabase requests from the auth callback, ignored duplicate same-user auth events, and guarded against stale profile responses after sign-out.
- Made profile saves check database success; retained profile-completion flow; handled email confirmation without attempting unauthenticated profile creation.
- Restored account result subscription, chronological charts, and corrected the words-test time estimate.
- Fixed academy custom-text completion, final-character scoring, mistake classification, lesson retry processing, and synchronous progress calculations.
- Fixed Supabase user ID usage, Uzbek language filters and labels, and migrated 10 legacy `uzbek` rows to `uzbek_latin`.
- Removed local-only runs from public leaderboard rankings. Leaderboards now read current profile names and avatars rather than trying an unauthorized results-table update.
- Preserved academy best scores with a database-side monotonic merge across devices.
- Enabled results realtime publication and added user/date index, case-insensitive unique usernames, input constraints, and optimized ownership policies.
- Revoked client execution of the internal SECURITY DEFINER event-trigger function while retaining its automatic-RLS behavior.
- Created the missing avatars bucket, 5 MB and image-type limits, and own-folder upload/upsert policies; versioned avatar URLs after replacement.
- Added React type definitions, a pinned Supabase dependency, npm lockfile, and regression tests. Both npm and Bun lockfiles are synchronized to the pinned React and Supabase versions.

The SQL files in db/audit record migrations already applied to production. Do not blindly rerun them: some statements intentionally create new policies and constraints.

## Verification

- TypeScript check, production build, 10 tests, and the two-client game network simulation passed.
- npm audit reported zero known vulnerabilities for the resolved npm dependency tree.
- Rollback-only database tests verified own-progress insert/update and denial of cross-user writes; no test progress remains.
- Verified revoked function privileges, realtime publication, normalized language rows, bucket configuration, and a public REST query joining results to profiles.
- Live homepage and leaderboard rendered, and a bot race started. After merging PR #3, GitHub reported a successful Vercel production deployment and the live leaderboard displayed both corrected Uzbek filters.

## Remaining limitations

- Vercel MCP lists two projects but project-detail requests return HTTP 403 for nodirbek2s-projects. CLI fallback has no credentials. Environment variables, private deployment logs/settings, and private production configuration could not be fully audited through Vercel.
- Real email-confirmation and Google OAuth flows require an authorized test login; regression testing here uses a mocked auth client. No real user credentials were used.
- Supabase still reports leaked-password protection disabled. The available connector cannot update that Auth setting. Enable it in the Auth settings if the plan supports it: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- The production bundle is approximately 1.3 MB before gzip; lazy-loading charts and secondary views is a future performance improvement.
- Scores are calculated by the browser. Database ownership and value constraints prevent malformed/cross-user writes, but do not establish anti-cheat proof. Competitive score verification needs a server-side design.
- The leaderboard fetch is capped at 1,000 raw results, then selects the best entry per user. At larger scale this should become a database aggregation/paginated query.

This audit fixes verified defects, but does not certify the application as free of all possible bugs.
