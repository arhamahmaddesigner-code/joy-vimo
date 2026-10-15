const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=fs.readFileSync('supabase/migrations/20261013_private_adult_leaderboard.sql','utf8');
const gate=fs.readFileSync('supabase/migrations/20261013_opt_in_read_gate.sql','utf8');
for(const table of ['joy_public_profiles','joy_positive_actions']){
 assert.match(base,new RegExp('alter table public\\.'+table+' enable row level security','i'));
 assert.match(base,new RegExp('revoke all on public\\.'+table+' from anon,authenticated','i'));
}
for(const fn of ['joy_join_leaderboard','joy_leave_leaderboard','joy_delete_leaderboard_data','joy_claim_positive_action','joy_weekly_leaderboard']){
 assert.match(base,new RegExp('revoke all on function public\\.'+fn+'\\(','i'));
 assert.match(base,new RegExp('grant execute on function public\\.'+fn+'\\(','i'));
}
assert.match(base,/user_id\s*=\s*\(select auth\.uid\(\)\)/i);
assert.match(base,/visible and adult_self_declared/i);
assert.match(gate,/if \(select auth\.uid\(\)\) is null/i);
assert.match(gate,/p\.visible and p\.adult_self_declared/i);
assert.match(gate,/raise exception 'Join the adult leaderboard before viewing rankings'/i);
assert.match(base,/primary key\(user_id,action_day,action_key\)/i);
assert.match(base,/when 'plan' then 10/i);
console.log('PASS: static leaderboard migration contract; live Supabase security still requires account-level QA');
