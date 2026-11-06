import {mergeProgress} from './progress-sync.js';
import {validateState,freshState} from './learning-state.js';
export class CloudClient{
 constructor({origin,getState,onState,onStatus,onIdentity,fetcher=globalThis.fetch.bind(globalThis),storage=globalThis.localStorage}){Object.assign(this,{origin,getState,onState,onStatus,onIdentity,fetcher,storage});this.user=null;this.revision=0;this.generation=0;this.edit=0;this.busy=false;this.timer=null;this.status='guest';this.aiConfigured=false;}
 notify(status,error=''){this.status=status;this.error=error;this.onStatus?.(this);}
 async request(path,options={}){const response=await this.fetcher('/api/'+path,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json',...options.headers}});let data;try{data=await response.json();}catch{throw Error('云端服务暂时不可用（HTTP '+response.status+'）');}if(!response.ok&&response.status!==409){if(response.status===401)this.notify('signed-out');throw Error(data.error||'请求失败，请稍后重试');}return {data,status:response.status};}
 async start(){
  const generation=++this.generation;
  try{const {data}=await this.request('session');if(generation!==this.generation)return;this.user=data.user;this.signIn=data.signIn;this.signOut=data.signOut;this.aiConfigured=data.aiConfigured;
   if(!this.user){this.notify('guest');return;}
   const key='yukorean-user:'+this.user.id;let local;try{local=validateState(JSON.parse(this.storage.getItem(key)));}catch{local=freshState();}
   this.onIdentity?.(this.user,key);this.onState(local);this.notify('syncing');await this.sync();
  }catch(error){this.notify('offline',error.message);}
 }
 changed(){if(!this.user)return;this.edit++;this.notify('pending');clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),900);}
 async sync(){
  if(!this.user||this.busy)return;this.busy=true;const generation=this.generation;let needsRetry=false;
  try{
   this.notify('syncing');const remote=(await this.request('progress')).data;if(generation!==this.generation)return;
   let merged=validateState(mergeProgress(this.getState(),remote.state));this.onState(merged);this.revision=remote.revision;
   for(let attempt=0;attempt<4;attempt++){
    const edit=this.edit;const result=await this.request('progress',{method:'PUT',body:JSON.stringify({state:merged,revision:this.revision})});if(generation!==this.generation)return;
    this.revision=result.data.revision;
    if(result.status===409){merged=validateState(mergeProgress(this.getState(),result.data.state));this.onState(merged);continue;}
    this.lastSynced=result.data.updatedAt;needsRetry=this.edit!==edit;this.notify(needsRetry?'pending':'synced');return;
   }
   throw Error('其他设备正在保存，稍后自动重试');
  }catch(error){this.notify('offline',error.message);needsRetry=true;}
  finally{this.busy=false;if(needsRetry&&this.user){clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),15000);}}
 }
 stop(){++this.generation;this.user=null;clearTimeout(this.timer);this.notify('guest');}
}
