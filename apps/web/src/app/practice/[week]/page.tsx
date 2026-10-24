export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {academyApi,ApiError} from '@/lib/academy-api';
import {PracticeActivity} from '@/components/academy/practice-activity';
export default async function PracticeActivityPage({params}:{params:Promise<{week:string}>}){
 const {week}=await params;if(!/^([1-9]|1[0-9]|2[0-4])$/.test(week))notFound();
 let lesson;
 try{lesson=await academyApi.lesson(Number(week))}catch(error){if(error instanceof ApiError&&(error.status===404||error.status===422))notFound();throw error}
 if(!lesson.guide.exercise)notFound();
 return <PracticeActivity key={week} week={Number(week)} exercise={lesson.guide.exercise}/>;
}
