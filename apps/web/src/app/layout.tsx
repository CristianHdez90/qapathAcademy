import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {AuthProvider} from '@/features/auth/auth-provider';
import {ProgressProvider} from '@/features/progress/progress-provider';
import {Sidebar} from '@/components/layout/sidebar';
import {QaAssistant} from '@/components/assistant/qa-assistant';
import type {CSSProperties} from 'react';
import {loadPublishedAppearance} from '@/features/appearance/load-appearance';
import {isOriginalDesign,themeVars} from '@/features/appearance/appearance';
import {themeColorStyle} from '@/features/appearance/site-theme';
import '@/components/courses/home-theme.css';
import './globals.css';
import './learning-ux.css';
import './navigation.css';
export const metadata:Metadata={title:{default:'QAPath Academy | Aprende QA de principio a fin',template:'%s | QAPath Academy'},description:'Ruta interactiva de QA Manual a Playwright Automation. 24 semanas, Scrum, laboratorios y ejercicios.'};
/** SPEC-UX-310 · El tema publicado se aplica en toda la plataforma desde el servidor (sin parpadeo ni redeploy). */
export default async function RootLayout({children}:{children:ReactNode}){
  const appearance=await loadPublishedAppearance();
  const themed=!isOriginalDesign(appearance.tokens);
  return <html lang="es"><body data-home-theme={themed?appearance.preset:undefined} style={themed?themeVars(appearance.tokens) as CSSProperties:undefined}>{themed&&<style id="qapath-site-theme" dangerouslySetInnerHTML={{__html:themeColorStyle(appearance.tokens)}}/>}<a className="skip-content" href="#contenido">Saltar al contenido</a><AuthProvider><ProgressProvider><div className="app-shell"><Sidebar/><main id="contenido" tabIndex={-1} className="main-content">{children}</main></div></ProgressProvider><QaAssistant/></AuthProvider></body></html>;
}
