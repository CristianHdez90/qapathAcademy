/** Normalized visible ranges: a jump to the bottom must not count as reading the whole chapter. */
export function addReadingExposure(previous:readonly (readonly [number,number])[],top:number,bottom:number,height:number,viewportHeight:number):[number,number][]{
 if(height<=0||viewportHeight<=0)return [...previous].map(([a,b])=>[a,b]);
 const start=Math.max(0,Math.min(1,-top/height)),end=Math.max(0,Math.min(1,(Math.min(bottom,viewportHeight)-top)/height));
 if(end<=start)return [...previous].map(([a,b])=>[a,b]);
 const sorted=[...previous,[start,end] as const].sort((a,b)=>a[0]-b[0]);const merged:[number,number][]=[];
 for(const [a,b] of sorted){const last=merged[merged.length-1];if(last&&a<=last[1])last[1]=Math.max(last[1],b);else merged.push([a,b])}return merged;
}
export function chapterWasTraversed(ranges:readonly (readonly [number,number])[]){return ranges.reduce((sum,[a,b])=>sum+b-a,0)>=.8&&ranges.some(([,end])=>end>=.98)}
export function readingEligible(ranges:readonly (readonly [number,number])[],attentionMs:number,minimumMs:number){return attentionMs>=minimumMs&&chapterWasTraversed(ranges)}
