export function dayNumber(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('ISO date required');const n=Date.parse(date+'T00:00:00Z');if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==date)throw Error('Invalid date');return n/86400000;}
export const iso=n=>new Date(n*86400000).toISOString().slice(0,10);
export const addDays=(date,n)=>iso(dayNumber(date)+n);
export function isBusinessDay(date,holidays=[]){const d=new Date(date+'T00:00:00Z').getUTCDay();return d!==0&&d!==6&&!holidays.includes(date);}
export function quarterEnd(date){dayNumber(date);const y=+date.slice(0,4),m=+date.slice(5,7),endMonth=Math.ceil(m/3)*3;return new Date(Date.UTC(y,endMonth,0)).toISOString().slice(0,10);}
export function nextQuarterEnd(date){const d=new Date(quarterEnd(date)+'T00:00:00Z');return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+4,0)).toISOString().slice(0,10);}
export function lastBusinessDay(date,holidays=[]){let d=date;while(!isBusinessDay(d,holidays))d=addDays(d,-1);return d;}
