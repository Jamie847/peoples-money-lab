/** Exact rational transaction amounts. Decimal and fraction strings are accepted. */
const gcd = (a,b) => { a=a<0n?-a:a; b=b<0n?-b:b; while(b){[a,b]=[b,a%b];}return a||1n; };
export class Q {
  constructor(value=0, denominator) {
    if(value instanceof Q){this.n=value.n;this.d=value.d;return;}
    let n,d;
    if(denominator!==undefined){n=BigInt(value);d=BigInt(denominator);}
    else {
      const s=String(value).replace(/^([+-]?)\./, '$10.');
      if(s.includes('/')) {const a=s.split('/');if(a.length!==2)throw Error('Invalid fraction');n=BigInt(a[0]);d=BigInt(a[1]);}
      else {const m=s.match(/^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);if(!m)throw Error('Invalid finite amount: '+s);
        let scale=(m[3]||'').length-Number(m[4]||0);if(Math.abs(scale)>1000)throw Error('Amount exponent too large');
        n=BigInt(m[2]+(m[3]||''))*(m[1]==='-'?-1n:1n);d=1n;
        if(scale>=0)d=10n**BigInt(scale);else n*=10n**BigInt(-scale);
      }
    }
    if(d===0n)throw Error('Zero denominator');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);this.n=n/g;this.d=d/g;
  }
  add(v){const b=q(v);return new Q(this.n*b.d+b.n*this.d,this.d*b.d);}
  sub(v){return this.add(q(v).neg());}
  mul(v){const b=q(v);return new Q(this.n*b.n,this.d*b.d);}
  div(v){const b=q(v);return new Q(this.n*b.d,this.d*b.n);}
  neg(){return new Q(-this.n,this.d);}
  cmp(v){const b=q(v),x=this.n*b.d-b.n*this.d;return x<0n?-1:x>0n?1:0;}
  eq(v){return this.cmp(v)===0;}
  min(v){return this.cmp(v)<=0?this:q(v);}
  max(v){return this.cmp(v)>=0?this:q(v);}
  round(places=12){if(!Number.isInteger(places)||places<0||places>100)throw Error('Invalid decimal precision');const scale=10n**BigInt(places),sign=this.n<0n?-1n:1n,n=this.n*sign*scale;return new Q(sign*((n*2n+this.d)/(2n*this.d)),scale);}
  number(){const n=Number(this.n),d=Number(this.d);if(Number.isFinite(n)&&Number.isFinite(d))return n/d;return Number(this.n/this.d)+Number((this.n%this.d)*1000000000000000n/this.d)/1e15;}
  toString(){return this.d===1n?String(this.n):`${this.n}/${this.d}`;}
  toJSON(){return this.toString();}
}
export const q=v=>v instanceof Q?v:new Q(v);
export const sum=items=>items.reduce((a,b)=>a.add(b),q(0));
