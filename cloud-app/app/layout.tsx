import type {ReactNode} from 'react';
export const metadata={title:'YUKorean 云端学习中心',description:'90 天韩语课程、真实 AI 对话、账号与云端进度'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>;}
