// Executes real PostgreSQL authorization and RPC code in an isolated WASM database.
// Auth identity is a test shim; this does NOT exercise GoTrue, email delivery or PostgREST.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
(async()=>{
 const db=new PGlite();
 let checks=0;
 const query=(sql,args=[])=>db.query(sql,args).then(r=>r.rows);
 const eq=(actual,expected)=>{assert.deepEqual(actual,expected);checks++};
 async function denied(sql,args=[],code='42501'){
  await assert.rejects(query(sql,args),e=>e.code===code);checks++;
 }
 async function as(role,id=''){
  assert.ok(['anon','authenticated','postgres'].includes(role));
  await db.exec('reset role; set role '+role);
  await query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
 }
 try{
  await db.exec(`create role anon; create role authenticated; create schema auth;
   create table auth.users(id uuid primary key);
   create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   grant usage on schema public,auth to anon,authenticated;
   grant execute on function auth.uid() to anon,authenticated;`);
  await query('insert into auth.users values ($1),($2)',[A,B]);
  // Legacy files share a date-only version: preserve history; use their documented
  // deployment order until live migration history can be reconciled safely.
  for(const name of ['20261013_private_adult_leaderboard.sql','20261013_opt_in_read_gate.sql']){
   // Only extension installation is omitted: gen_random_uuid is built into PostgreSQL.
   await db.exec(fs.readFileSync('supabase/migrations/'+name,'utf8').replace('create extension if not exists pgcrypto;',''));
  }
  await as('authenticated',A);
  await query("select * from joy_join_leaderboard('PK')");
  await denied('select * from joy_weekly_leaderboard(null)',[],'42883'); // regression reproduced
  await as('postgres');
  for(const name of fs.readdirSync('supabase/migrations').filter(n=>/^\d{14}_.*\.sql$/.test(n)).sort()){
   await db.exec(fs.readFileSync('supabase/migrations/'+name,'utf8'));
  }
  eq((await query("select count(*)::int as n from pg_class where relname in ('joy_public_profiles','joy_positive_actions') and relrowsecurity"))[0].n,2);
  await as('anon');
  for(const table of ['joy_public_profiles','joy_positive_actions'])await denied('select * from '+table);
  for(const call of ["joy_join_leaderboard('PK')","joy_weekly_leaderboard(null)","joy_claim_positive_action('plan')",'joy_leave_leaderboard()','joy_delete_leaderboard_data()'])await denied('select * from '+call);
  await as('authenticated');
  await denied('select * from joy_weekly_leaderboard(null)');
  await as('authenticated',B);
  await denied('select * from joy_weekly_leaderboard(null)');
  await denied("select * from joy_claim_positive_action('plan')",[],'P0001');
  eq(await query('select * from joy_public_profiles'),[]);
  await denied("select * from joy_join_leaderboard('bad')",[],'P0001');
  await query("select * from joy_join_leaderboard('US')");
  eq((await query('select user_id from joy_public_profiles')).map(x=>x.user_id),[B]);
  eq(await query('select * from joy_public_profiles where user_id=$1',[A]),[]);
  await as('authenticated',A);
  eq((await query('select user_id from joy_public_profiles')).map(x=>x.user_id),[A]);
  for(const table of ['joy_public_profiles','joy_positive_actions']){
   await denied('delete from '+table+' where user_id=$1',[B]);
   await denied('update '+table+' set user_id=$1 where user_id=$2',[A,B]);
  }
  await denied("insert into joy_public_profiles(user_id,public_alias) values ($1,'forged')",[B]);
  await denied("insert into joy_positive_actions(user_id,action_day,action_key,points) values ($1,current_date,'plan',20)",[B]);
  eq((await query("select * from joy_claim_positive_action('plan')"))[0],{accepted:true,weekly_points:10});
  for(let i=0;i<5;i++)eq((await query("select * from joy_claim_positive_action('plan')"))[0],{accepted:false,weekly_points:10});
  await denied("select * from joy_claim_positive_action('invented')",[],'P0001');
  const actions=['offline','break','reflect','reset','joy-nature-spot','joy-animal-memory','joy-creative-doodle','joy-learning-spark','joy-comedy-smile','joy-calm-five'];
  for(const action of actions)eq((await query('select * from joy_claim_positive_action($1)',[action]))[0].accepted,true);
  eq((await query("select * from joy_claim_positive_action('reset')"))[0],{accepted:false,weekly_points:130});
  let ranks=await query('select * from joy_weekly_leaderboard(null)');
  eq(ranks.length,2);eq(Number(ranks[0].points),130);eq(ranks[0].country,'PK');
  eq(Object.keys(ranks[0]).sort(),['alias','country','points','rank']);
  eq((await query("select * from joy_weekly_leaderboard(' us ')" )).map(x=>x.country),['US']);
  await denied("select * from joy_weekly_leaderboard('USA')",[],'22023');
  await as('postgres');
  await query("insert into joy_positive_actions(user_id,action_day,action_key,points) values ($1,date_trunc('week',now() at time zone 'UTC')::date-1,'plan',10)",[B]);
  await as('authenticated',B);
  eq(await query('select * from joy_positive_actions where user_id=$1',[A]),[]);
  eq(Number((await query("select * from joy_weekly_leaderboard('US')"))[0].points),0);
  await query("select * from joy_claim_positive_action('offline')");
  await query('select joy_leave_leaderboard()');
  await denied('select * from joy_weekly_leaderboard(null)');
  await denied("select * from joy_claim_positive_action('plan')",[],'P0001');
  await as('authenticated',A);
  eq((await query('select * from joy_weekly_leaderboard(null)')).length,1);
  await query('select joy_delete_leaderboard_data()');
  eq(await query('select * from joy_public_profiles'),[]);
  eq(await query('select * from joy_positive_actions'),[]);
  await denied('select * from joy_weekly_leaderboard(null)');
  await as('authenticated',B);
  eq((await query('select * from joy_public_profiles')).length,1);
  eq((await query('select * from joy_positive_actions')).length,2);
  console.log(`PASS: ${checks} PostgreSQL checks: legacy bug reproduction, RPCs, two-user RLS, denied writes, score caps, opt-out and deletion (NOT live OTP)`);
 }finally{await db.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
