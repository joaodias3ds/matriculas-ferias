import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.argv[2],mode=process.argv[3]==='--remote'?'--remote':'--local';
if(!root||!fs.existsSync(path.join(root,'_indice.json')))throw Error('Informe a pasta Alunos JSON.');
const index=JSON.parse(fs.readFileSync(path.join(root,'_indice.json'),'utf8'));
const quote=v=>v==null?'NULL':"'"+String(v).replaceAll("'","''")+"'";
const tel=v=>String(v||'').replace(/\D/g,'');
const rows=[];
for(const item of index.alunos){const filename=path.resolve(root,item.arquivo);if(!filename.startsWith(path.resolve(root)+path.sep))continue;const d=JSON.parse(fs.readFileSync(filename,'utf8')),a=d.aluno||{},r=d.responsaveis||{};const born=a.dataNascimento?new Date(a.dataNascimento):null;let age=null,birthDate=null;if(born&&!Number.isNaN(born.getTime())){const today=new Date();age=today.getFullYear()-born.getFullYear()-(today.getMonth()<born.getMonth()||today.getMonth()===born.getMonth()&&today.getDate()<born.getDate()?1:0);birthDate=born.toISOString().slice(0,10)}const values=[d.matricula?.numero||item.matricula,a.nomeCompleto,age,tel(a.telefone),tel(a.telefone),a.escola,a.serie,r.mae?.nome,tel(r.mae?.telefone),r.pai?.nome,tel(r.pai?.telefone),birthDate,a.email||null];if(!values[0]||!values[1])continue;rows.push('INSERT OR REPLACE INTO legacy_students (registration,name,age,phone,whatsapp,school,grade,mother_name,mother_phone,father_name,father_phone,birth_date,email) VALUES ('+values.map(quote).join(',')+');')}
const temp=path.join(os.tmpdir(),'rnm-import-'+crypto.randomUUID()+'.sql');try{fs.writeFileSync(temp,rows.join('\n'),{mode:0o600});const result=spawnSync('npx',['wrangler','d1','execute','matriculas-ferias',mode,'--file',temp],{cwd:path.resolve(import.meta.dirname,'..'),stdio:['inherit','pipe','pipe'],shell:process.platform==='win32'});if(result.status!==0){process.stderr.write(result.stderr);process.exitCode=1}else console.log('Importação concluída: '+rows.length+' registros. Nenhum dado pessoal foi gravado no repositório.')}finally{fs.rmSync(temp,{force:true})}
