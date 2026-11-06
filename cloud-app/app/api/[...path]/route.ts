import {env} from 'cloudflare:workers';
import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '../../chatgpt-auth';
import {HttpError,readJson,getProgress,putProgress,listChats,getChat} from '../../../lib/progress-service.mjs';
import {validateState} from '../../../lib/learning-state.js';
import {chatTurn} from '../../../lib/ai-service.mjs';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function handle(request:Request){
 try{
  const path=new URL(request.url).pathname.replace('/api/',''),user=await getChatGPTUser();
  if(request.method!=='GET'&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'请求来源无效'},403);
  if(path==='session'&&request.method==='GET')return json({user:user?{id:user.userId,name:user.displayName,email:user.email}:null,signIn:chatGPTSignInPath('/learn/index.html#/account'),signOut:chatGPTSignOutPath('/learn/index.html#/account'),aiConfigured:!!(env as any).OPENAI_API_KEY});
  if(!env.DB)throw new HttpError(503,'云端数据库尚未就绪');
  if(path==='chat'&&request.method==='POST')return json(await chatTurn(env.DB,user,await readJson(request,8000),{apiKey:(env as any).OPENAI_API_KEY,model:(env as any).OPENAI_MODEL,dailyLimit:(env as any).AI_DAILY_LIMIT}));
  if(path==='progress'&&request.method==='GET')return json(await getProgress(env.DB,user));
  if(path==='progress'&&request.method==='PUT'){const result=await putProgress(env.DB,user,await readJson(request),validateState);return json(result,result.conflict?409:200);}
  if(path==='chats'&&request.method==='GET')return json({sessions:await listChats(env.DB,user)});
  if(path.startsWith('chats/')&&request.method==='GET')return json(await getChat(env.DB,user,path.slice(6)));
  return json({error:'没有这个接口'},404);
 }catch(err){if(err instanceof HttpError)return json({error:err.message,code:err.code},err.status);console.error('YUKorean API error',err instanceof Error?err.message:'unknown');return json({error:'服务暂时不可用，请稍后重试'},500);}
}
export const GET=handle;export const PUT=handle;export const POST=handle;
