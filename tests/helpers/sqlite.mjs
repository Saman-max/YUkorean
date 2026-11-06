import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function database(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../../cloud-app/drizzle/0000_odd_dagger.sql',import.meta.url),'utf8'));
 const db={prepare(sql){return {bind(...params){return {async first(){return sqlite.prepare(sql).get(...params)||null;},async all(){return {results:sqlite.prepare(sql).all(...params)};},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...params).changes)}};}};}};},async batch(statements){sqlite.exec('BEGIN');try{const out=[];for(const statement of statements)out.push(await statement.run());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}},close(){sqlite.close();}};return db;
}
