import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const progress=sqliteTable('learning_progress',{
 userId:text('user_id').primaryKey(), payload:text('payload').notNull(),revision:integer('revision').notNull().default(0),updatedAt:integer('updated_at').notNull()
});
export const chatSessions=sqliteTable('chat_sessions',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),scenario:text('scenario').notNull(),title:text('title').notNull(),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
});
export const chatMessages=sqliteTable('chat_messages',{
 id:text('id').primaryKey(),sessionId:text('session_id').notNull(),userId:text('user_id').notNull(),requestId:text('request_id').notNull(),role:text('role').notNull(),payload:text('payload').notNull(),createdAt:integer('created_at').notNull()
});
export const aiRequests=sqliteTable('ai_requests',{
 userId:text('user_id').notNull(),requestId:text('request_id').notNull(),status:text('status').notNull(),result:text('result'),createdAt:integer('created_at').notNull()
},t=>[primaryKey({columns:[t.userId,t.requestId]})]);
export const aiDailyUsage=sqliteTable('ai_daily_usage',{
 userId:text('user_id').notNull(),day:text('day').notNull(),count:integer('count').notNull().default(0)
},t=>[primaryKey({columns:[t.userId,t.day]})]);
