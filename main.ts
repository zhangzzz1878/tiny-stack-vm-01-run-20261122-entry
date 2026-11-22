import{mkdirSync as k,readFileSync as f,readdirSync as e,writeFileSync as w}from 'node:fs';
import{join as j}from 'node:path';

const IN=process.env.MAKEFUN_INPUT_DIR??'/input';
const OUT=process.env.MAKEFUN_OUTPUT_DIR??'/output';

// opcode -> [immediate bytes, pops, pushes]
const A:{[o:number]:number[]}={
  0x00:[0,0,0],0x01:[1,0,1],0x02:[4,0,1],0x03:[0,1,0],0x04:[0,1,2],
  0x05:[0,2,2],0x06:[0,2,3],0x07:[0,3,3],
  0x10:[0,2,1],0x11:[0,2,1],0x12:[0,2,1],0x13:[0,2,1],0x14:[0,2,1],
  0x15:[0,2,1],0x16:[0,2,1],0x17:[0,1,1],0x18:[0,2,1],0x19:[0,2,1],
  0x1a:[0,2,1],0x1b:[0,1,1],0x1c:[0,2,1],0x1d:[0,2,1],0x1e:[0,2,1],
  0x20:[0,2,1],0x21:[0,2,1],0x22:[0,2,1],
  0x30:[2,0,0],0x31:[2,1,0],0x32:[2,1,0],0x33:[2,0,0],0x34:[0,0,0],
  0x40:[0,1,1],0x41:[0,2,0],0x50:[0,1,0],0x51:[0,1,0],0x52:[0,0,1],0x53:[0,1,0],
};

function run(p:Uint8Array,inp:Uint8Array):[Uint8Array,number]{
  const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256);
  const out=new Uint8Array(65536),dig=new Uint8Array(10);
  let sp=0,cp=0,ol=0,ip=0,pc=0,st=0;
  const n=p.length;
  const end=(c:number):[Uint8Array,number]=>[out.subarray(0,ol),c];
  for(;;){
    if(st===1e6) return end(10);
    if(pc<0||pc>=n) return end(9);
    const op=p[pc],m=A[op];
    if(!m) return end(5);
    if(pc+m[0]>=n) return end(9);
    st++;
    const nx=pc+1+m[0];
    if(sp<m[1]) return end(2);
    if(sp-m[1]+m[2]>256) return end(3);
    pc=nx;
    switch(op){
      case 0x00: return end(0);
      case 0x01: D[sp++]=(p[nx-1]<<24)>>24; break;
      case 0x02: D[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24; break;
      case 0x03: sp--; break;
      case 0x04: D[sp]=D[sp-1]; sp++; break;
      case 0x05: {const t=D[sp-1]; D[sp-1]=D[sp-2]; D[sp-2]=t; break;}
      case 0x06: D[sp]=D[sp-2]; sp++; break;
      case 0x07: {const t=D[sp-3]; D[sp-3]=D[sp-2]; D[sp-2]=D[sp-1]; D[sp-1]=t; break;}
      case 0x17: D[sp-1]=-D[sp-1]|0; break;
      case 0x1b: D[sp-1]=~D[sp-1]; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        const b=D[sp-1],a=D[sp-2];
        let r=0;
        switch(op){
          case 0x10: r=(a+b)|0; break;
          case 0x11: r=(a-b)|0; break;
          case 0x12: r=Math.imul(a,b); break;
          case 0x13:
            if(b===0) return end(4);
            r=a===-2147483648&&b===-1?a:(a/b)|0; break;
          case 0x14:
            if(b===0) return end(4);
            r=b===-1?0:(a%b)|0; break;
          case 0x15:
            if(b===0) return end(4);
            r=Math.floor((a>>>0)/(b>>>0))|0; break;
          case 0x16:
            if(b===0) return end(4);
            r=((a>>>0)%(b>>>0))|0; break;
          case 0x18: r=a&b; break;
          case 0x19: r=a|b; break;
          case 0x1a: r=a^b; break;
          case 0x1c: r=a<<(b&31); break;
          case 0x1d: r=a>>(b&31); break;
          case 0x1e: r=(a>>>(b&31))|0; break;
          case 0x20: r=a===b?1:0; break;
          case 0x21: r=a<b?1:0; break;
          case 0x22: r=(a>>>0)<(b>>>0)?1:0; break;
        }
        sp-=2; D[sp++]=r; break;
      }
      case 0x30: case 0x31: case 0x32: {
        const rel=((p[nx-2]|p[nx-1]<<8)<<16)>>16;
        let take=op===0x30;
        if(op!==0x30){const v=D[--sp]; take=op===0x31?v===0:v!==0;}
        if(take) pc=nx+rel;
        break;
      }
      case 0x33:
        if(cp===64) return end(7);
        C[cp++]=nx; pc=p[nx-2]|p[nx-1]<<8; break;
      case 0x34:
        if(cp===0) return end(8);
        pc=C[--cp]; break;
      case 0x40: {
        const a=D[sp-1];
        if(a<0||a>255) return end(6);
        D[sp-1]=M[a]; break;
      }
      case 0x41: {
        const a=D[sp-1],v=D[sp-2];
        if(a<0||a>255) return end(6);
        sp-=2; M[a]=v; break;
      }
      case 0x50: {
        const v=D[sp-1];
        let u:number;
        const neg=v<0;
        u=neg?(-v)>>>0:v;
        let k=0;
        if(u===0) dig[k++]=48;
        else while(u>0){dig[k++]=48+(u%10); u=Math.floor(u/10);}
        const len=k+(neg?1:0);
        if(ol+len>65536) return end(11);
        sp--;
        if(neg) out[ol++]=45;
        while(k>0) out[ol++]=dig[--k];
        break;
      }
      case 0x51:
        if(ol+1>65536) return end(11);
        out[ol++]=D[--sp]&255; break;
      case 0x52:
        D[sp++]=ip<inp.length?inp[ip++]:-1; break;
      case 0x53:
        return end(D[--sp]&255);
    }
  }
}

for(const id of e(IN).sort()){
  const g=j(IN,id);
  const r=run(f(j(g,'program.bin')),f(j(g,'input.bin')));
  k(j(OUT,id),{recursive:true});
  w(j(OUT,id,'stdout.bin'),r[0]);
  w(j(OUT,id,'exit.txt'),r[1]+'\n');
}
