import 'dotenv/config';
const KEY=process.env.FORTYGUARD_API_KEY, BASE='https://api.fortyguard.com';
const S={lat:33.4353,lon:-112.0078};
function ring(lat,lon,m){const dLat=m/111320,dLon=m/(111320*Math.cos(lat*Math.PI/180));
 return {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[lon-dLon,lat-dLat],[lon+dLon,lat-dLat],[lon+dLon,lat+dLat],[lon-dLon,lat+dLat],[lon-dLon,lat-dLat]]]}}]};}
const now=new Date(), off=Math.round(S.lon/15), loc=new Date(now.getTime()+off*3600000);
const dt={start_date:loc.toISOString().slice(0,10),start_time:`${String(loc.getUTCHours()).padStart(2,'0')}:00`,filter_type:1};
console.log('requesting site-local dateTime:',JSON.stringify(dt));
const t0=Date.now();
const r=await fetch(`${BASE}/v1/heatmap`,{method:'POST',headers:{'api-key':KEY,'Content-Type':'application/json'},
 body:JSON.stringify({polygon_aoi:ring(S.lat,S.lon,15000),date_time:dt,granularity:100,analytic_type:'tcm'})});
const b=await r.json().catch(()=>null); const id=b?.data?.activity_id;
console.log('submit HTTP',r.status,'id',id);
if(!id){console.log(JSON.stringify(b).slice(0,500));process.exit(1);}
for(let i=0;i<120;i++){
  const s=await fetch(`${BASE}/v1/status/${id}`,{headers:{'api-key':KEY}});
  const d=(await s.json().catch(()=>null))?.data; const st=String(d?.status||'').toLowerCase();
  if(st==='completed'||st==='succeeded'){
    const ts=d?.result?.stats_data?.temperature_stats??d?.result?.stats_data?.Temperature_stats;
    console.log(`15km COMPLETED in ${Math.round((Date.now()-t0)/1000)}s`);
    console.log('stats:',JSON.stringify(ts)); process.exit(0);
  }
  if(st==='failed'||st==='error'){console.log(`15km FAILED after ${Math.round((Date.now()-t0)/1000)}s:`,JSON.stringify(d).slice(0,600));process.exit(0);}
  if(i%6===0)console.log(`  ${Math.round((Date.now()-t0)/1000)}s status=${st||'?'}`);
  await new Promise(r=>setTimeout(r,5000));
}
console.log('still not done after 10 minutes');
