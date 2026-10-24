import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {AuthProvider} from '@/features/auth/auth-provider';
import {ProgressProvider} from '@/features/progress/progress-provider';
import {Sidebar} from '@/components/layout/sidebar';
import {QaAssistant} from '@/components/assistant/qa-assistant';
import './globals.css';
export const metadata:Metadata={title:{default:'QAPath Academy | Aprende QA de principio a fin',template:'%s | QAPath Academy'},description:'Ruta interactiva de QA Manual a Playwright Automation. 24 semanas, Scrum, laboratorios y ejercicios.'};
export default function RootLayout({children}:{children:ReactNode}){
  return <html lang="es"><body><AuthProvider><ProgressProvider><div className="app-shell"><Sidebar/><main id="contenido" className="main-content">{children}</main></div><QaAssistant/></ProgressProvider></AuthProvider></body></html>;
}
