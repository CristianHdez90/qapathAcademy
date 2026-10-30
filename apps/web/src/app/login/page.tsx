import {AuthForm} from '@/components/academy/auth-form';
/** Tras registrarse, /login?registered=1 muestra el aviso de verificación (sin datos personales en la URL). */
export default async function LoginPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;
 return <AuthForm mode='login' registered={params.registered==='1'}/>;
}
