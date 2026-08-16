/* تحويل السجلات إلى تمثيل مضغوط: قواميس + مصفوفات */
function pack(recs){
  const dicts={nt:[],p:[],ed:[],ct:[],st:[],cr:[]};
  const idx={}; for(const k in dicts) idx[k]=new Map();
  function di(k,v){ v=v==null?'':String(v); let m=idx[k]; if(!m.has(v)){m.set(v,dicts[k].length);dicts[k].push(v);} return m.get(v); }
  const DAY=86400000;
  const rows=recs.map(r=>[
    r.t==null?-1:Math.floor(r.t/DAY),      //0 يوم
    r.n||'',                                //1 الاسم
    r.e||'',                                //2 البريد
    r.h||'',                                //3 الجوال
    r.g,                                    //4 الجنس
    di('nt',r.nt),                          //5 الجنسية
    r.ar, r.ry, r.dm, r.emp,                //6,7,8,9
    di('p',r.p),                            //10 الوظيفة المتقدم لها
    r.x==null?-1:r.x,                       //11 الخبرة
    r.a==null?-1:r.a,                       //12 العمر
    (r.cp||'').slice(0,60),                 //13 الوظيفة الحالية
    (r.co||'').slice(0,60),                 //14 الشركة
    r.sc==null?-1:r.sc,                     //15 الراتب الحالي
    r.se==null?-1:r.se,                     //16 المتوقع
    r.cv||'',                               //17 السيرة
    di('ed',r.ed),                          //18 المؤهل
    di('ct',r.ct),                          //19 المدينة
    (r.tr||'').slice(0,100),                //20 التدريبات
    (r.cr||[]).map(c=>di('cr',c)),          //21 الشهادات
    di('st',r.st),                          //22 الحالة
    (r.pos&&r.pos.length>1)?r.pos.map(x=>di('p',x)):0, //23 كل الوظائف المتقدَّم لها
    r.subs||1                               //24 عدد الطلبات
  ]);
  return {v:1,d:dicts,r:rows};
}
module.exports={pack};
