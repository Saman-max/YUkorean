export class HttpError extends Error{constructor(status,message,code='request_error'){super(message);this.status=status;this.code=code;}}
export const requireIdentity=user=>{if(!user?.userId)throw new HttpError(401,'请先登录，再使用云端学习。','sign_in_required');return user.userId;};
export async function readJson(request,maxBytes=512000){const length=Number(request.headers.get('content-length')||0);if(length>maxBytes)throw new HttpError(413,'提交内容过大');const body=await request.text();if(new TextEncoder().encode(body).length>maxBytes)throw new HttpError(413,'提交内容过大');try{return JSON.parse(body);}catch{throw new HttpError(400,'JSON 格式错误');}}
export async function getProgress(db,user){const id=requireIdentity(user);const row=await db.prepare('SELECT payload, revision, updated_at FROM learning_progress WHERE user_id = ?').bind(id).first();return row?{state:JSON.parse(row.payload),revision:row.revision,updatedAt:row.updated_at}:{state:null,revision:0,updatedAt:null};}
export async function putProgress(db,user,body,validate){
 const id=requireIdentity(user);if(!Number.isInteger(body.revision)||body.revision<0)throw new HttpError(400,'进度版本无效');
 let state;try{state=validate(body.state);}catch{throw new HttpError(400,'学习记录格式无效');}
 const now=Date.now(),payload=JSON.stringify(state);if(new TextEncoder().encode(payload).length>512000)throw new HttpError(413,'学习记录超过容量上限');
 if(body.revision===0)await db.prepare('INSERT OR IGNORE INTO learning_progress (user_id,payload,revision,updated_at) VALUES (?, ?, 0, ?)').bind(id,payload,now).run();
 const result=await db.prepare('UPDATE learning_progress SET payload = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(payload,now,id,body.revision).run();
 if((result.meta?.changes??result.changes)!==1)return {conflict:true,...await getProgress(db,user)};
 return {state,revision:body.revision+1,updatedAt:now};
}
export async function listChats(db,user){const id=requireIdentity(user);return (await db.prepare('SELECT id, scenario, title, created_at, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 60').bind(id).all()).results;}
export async function getChat(db,user,id){const uid=requireIdentity(user);const session=await db.prepare('SELECT id,scenario,title FROM chat_sessions WHERE id = ? AND user_id = ?').bind(id,uid).first();if(!session)throw new HttpError(404,'没有找到这个对话');const messages=(await db.prepare('SELECT id,role,payload,created_at FROM chat_messages WHERE session_id = ? AND user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 200').bind(id,uid).all()).results;return {session,messages:messages.reverse().map(m=>({...JSON.parse(m.payload),id:m.id,role:m.role}))};}
