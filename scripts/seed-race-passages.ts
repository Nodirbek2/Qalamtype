// Run with: node --import tsx scripts/seed-race-passages.ts
// Apply the emitted SQL after database/race_career.sql when provisioning a database.
import {ARCADE_PASSAGES} from '../src/data/textCorpus';
const quote=(value:string)=>"'"+value.replace(/'/g,"''")+"'";
console.log('insert into public.race_passages(language,passage) values '+Object.entries(ARCADE_PASSAGES).flatMap(([language,passages])=>passages.map(passage=>`(${quote(language)},${quote(passage)})`)).join(',\n')+' on conflict do nothing;');
