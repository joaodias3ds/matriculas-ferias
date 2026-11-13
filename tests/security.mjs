import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='http://127.0.0.1:8788';
let passed=0;
async function call(path,method='GET',data,headers={}){return fetch(base+path,{method,headers:{...(data!==undefined?{'content-type':'application/json'}:{}),...headers},...(data!==undefined?{body:JSON.stringify(data)}:{})})}
function check(value,message){assert.ok(value,message);passed++}
for(const path of ['/api/admin/applications','/api/admin/tracking'])check((await call(path)).status===401,'Admin must require login');
check((await call('/api/admin/status','POST',{id:1,action:'paid'})).status===401,'Anonymous modification denied');
check((await call('/api/enroll','POST',null)).status===400,'Null body rejected');
check((await call('/api/enroll','POST',[])).status===400,'Array body rejected');
check((await call('/api/admin/login','POST',{password:'wrong'},{origin:'https://attacker.invalid'})).status===403,'Cross-origin login rejected');
check((await call('/api/enroll','POST',{padding:'x'.repeat(17000)})).status===413,'Oversized body rejected');
const login=await call('/api/admin/login','POST',{password:fs.readFileSync('.dev.vars','utf8').match(/^ADMIN_SECRET=(.+)$/m)[1].trim()});check(login.status===200,'Admin login');const cookie=login.headers.get('set-cookie');check(cookie.includes('HttpOnly')&&cookie.includes('Secure')&&cookie.includes('SameSite=Strict'),'Protected session cookie');const auth={cookie:cookie.split(';')[0]};
const suffix=Date.now().toString().slice(-7),data={name:'Teste Segurança '+suffix,birthDate:'2008-01-01',email:'teste@example.invalid',emailConfirm:'teste@example.invalid',phone:'629'+suffix+'0',whatsapp:'629'+suffix+'0',instagram:'@teste.seguro',grade:'3ª série EM',school:'Escola Teste',courses:['Redação'],planId:'redacao',modalityId:'normal',paymentMethod:'Pix',dataConsent:true,courseInfo:true,privacy:true,terms:true,info:true};
check((await call('/api/enroll','POST',{...data,legacyRegistration:'TESTSEC',lookupToken:'fake'})).status===400,'Forged legacy proof rejected');
const response=await call('/api/enroll','POST',{...data,totalCents:1,enrollmentFeeCents:0});const result=await response.json();check(response.status===201,'New enrollment succeeds');check(result.enrollmentFeeCents===5000&&result.totalCents===25000,'Server controls fee and total');
check((await call('/api/enroll','POST',data)).status===409,'Duplicate rejected');
const lookup=await call('/api/legacy','POST',{registration:'TESTSEC',phone:'62911112222'});const proof=await lookup.json();check(lookup.status===200&&proof.lookupToken,'Legacy proof issued after matching phone');
const existing=await call('/api/enroll','POST',{...data,name:'Aluno Teste Segurança',phone:'62911112222',whatsapp:'62911112222',legacyRegistration:'TESTSEC',lookupToken:proof.lookupToken});const old=await existing.json();check(existing.status===201&&old.enrollmentFeeCents===0&&old.totalCents===20000,'Validated legacy fee waived');
let records=(await(await call('/api/admin/applications','GET',undefined,auth)).json()).applications;const created=records.find(x=>x.protocol===result.protocol);check(created.enrollment_fee_cents===5000,'Fee persisted');
check((await call('/api/admin/status','POST',{id:created.id,action:'approve'},auth)).status===200,'Approval saves');check((await call('/api/admin/status','POST',{id:created.id,action:'paid'},auth)).status===200,'Payment saves');
check((await call('/api/admin/tracking','POST',{registration:result.registration},auth)).status===200,'Tracking finds new registration');const row=(await(await call('/api/admin/tracking','GET',undefined,auth)).json()).rows.find(x=>x.registration===result.registration);check(!!row,'Tracking persisted');
check((await call('/api/admin/tracking','PUT',{...row,paid:1,value_cents:25000,redacao:[true,false,true,false],gramatica:[false,false,false,false],internal_status:'<script>teste</script>'},auth)).status===200,'Tracking edits save');const saved=(await(await call('/api/admin/tracking','GET',undefined,auth)).json()).rows.find(x=>x.registration===result.registration);check(saved.paid===1&&saved.value_cents===25000&&JSON.parse(saved.redacao)[2],'Tracking survives reload');
for(const record of records.filter(x=>[result.protocol,old.protocol].includes(x.protocol)))check((await call('/api/admin/status','POST',{id:record.id,action:'remove'},auth)).status===200,'Removal saves');
const html=await fetch(base);check(html.headers.get('x-frame-options')==='DENY'&&html.headers.get('content-security-policy').includes("script-src 'self'"),'Browser protection headers');
console.log('Passed '+passed+' local security and functional checks. No production data changed.');
