type IconName='book'|'target'|'play'|'reset'|'check'|'bug'|'save'|'file'|'info'|'code'|'steps'|'trash'|'light'|'search';
const paths:Record<IconName,string>={
 book:'M3 4h6a4 4 0 0 1 3 1.4A4 4 0 0 1 15 4h6v15h-6a4 4 0 0 0-3 1.4A4 4 0 0 0 9 19H3zM12 5.4v15',
 target:'M20 12a8 8 0 1 1-8-8M16 3h5v5M21 3l-9 9M15 12a3 3 0 1 1-3-3',
 play:'m8 5 11 7-11 7z',reset:'M3 10a9 9 0 1 1 1.5 8M3 4v6h6',
 check:'m5 12 4 4L19 6',bug:'M8 9a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0zM9 5 7 3m8 2 2-2M8 11H4m12 0h4M8 16H4m12 0h4M12 10v10',
 save:'M5 3h12l4 4v14H3V3zM7 3v6h10V3M7 21v-7h10v7',
 file:'M14 3H5v18h14V8zM14 3v5h5M8 12h8m-8 4h6',
 info:'M12 11v6m0-10v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
 code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18',steps:'M9 6h12M9 12h12M9 18h12M3 5h1v3M3 12h2l-2 2h2M3 18h2v3H3',
 trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
 light:'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 2H9z',
 search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0'
};
export function FoundationIcon({name}:{name:IconName}){return <svg className="foundation-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]}/></svg>}
