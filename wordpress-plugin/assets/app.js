(function(){
  'use strict';
  const root = document.getElementById('whc-app');
  if (!root || !window.WHC_APP) return;
  const api = window.WHC_APP.apiUrl;
  const headers = {'X-WP-Nonce':window.WHC_APP.nonce,'Content-Type':'application/json'};
  function esc(value){return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}
  function request(path, options){return fetch(api+path,Object.assign({credentials:'same-origin',headers:headers},options||{})).then(function(r){return r.json().then(function(data){if(!r.ok)throw new Error(data.message||window.WHC_APP.strings.error);return data;});});}
  function render(payload){
    const state=payload.state, catalogue=payload.skills_catalogue;
    const skills=Object.keys(catalogue).map(function(id){
      const s=state.skills[id]||{};
      return {id:Number(id),name:catalogue[id].name,description:catalogue[id].description,levels:Array.isArray(catalogue[id].levels)?catalogue[id].levels:[],unlocked:!!s.unlocked,status:s.status||'not_started',sessions:Number(s.practice_sessions||0),points:Number(s.points||0)};
    });
    const unlocked=skills.filter(function(s){return s.unlocked;}).length;
    root.innerHTML='<header class="whc-app-header"><div><div class="whc-app-brand">Wild Hound Club</div><p class="whc-app-note">Your dog’s trail skills, tracked one session at a time.</p></div><button class="whc-button whc-button-secondary" id="whc-refresh" type="button">Refresh progress</button></header>'+
      '<h1>Progress overview</h1><div class="whc-app-summary">'+
      '<div class="whc-app-card"><div class="whc-app-label">Your name</div><div class="whc-app-value">'+esc(state.display_name||'Member')+'</div></div>'+
      '<div class="whc-app-card"><div class="whc-app-label">Total points</div><div class="whc-app-value">'+esc(state.total_points||0)+'</div></div>'+
      '<div class="whc-app-card"><div class="whc-app-label">Skills unlocked</div><div class="whc-app-value">'+unlocked+' / '+skills.length+'</div></div></div>'+
      '<h2>Your skills</h2><p class="whc-app-note">Practice records are saved to your WordPress user account.</p><div class="whc-skills-grid">'+skills.map(function(s){
        const levels=s.levels.map(function(level){return '<li><strong>'+esc(level.name||('Level '+level.level))+'</strong>'+(level.details?'<p>'+esc(level.details)+'</p>':'')+'</li>';}).join('');
        return '<article class="whc-skill"><div class="whc-skill-status">'+(s.unlocked?'Unlocked':'Locked')+' · '+esc(s.status.replace(/_/g,' '))+'</div><h3>'+esc(s.name)+'</h3><p>'+esc(s.description)+'</p>'+(levels?'<details class="whc-levels"><summary>View training levels</summary><ol>'+levels+'</ol></details>':'')+'<p class="whc-app-note">Practice sessions: '+s.sessions+' · Skill points: '+s.points+'</p>'+(s.unlocked?'<button type="button" class="whc-button whc-practice" data-skill="'+s.id+'">'+esc(window.WHC_APP.strings.practice)+'</button>':'<button type="button" class="whc-button whc-button-secondary" disabled>Coming soon</button>')+'</article>';
      }).join('')+'</div>';
    document.getElementById('whc-refresh').addEventListener('click',load);
    root.querySelectorAll('.whc-practice').forEach(function(button){button.addEventListener('click',function(){button.disabled=true;button.textContent=window.WHC_APP.strings.working;request('practice',{method:'POST',body:JSON.stringify({skill_id:Number(button.dataset.skill)})}).then(load).catch(showError);});});
  }
  function showError(error){root.innerHTML='<div class="whc-error">'+esc(error.message||window.WHC_APP.strings.error)+' <button type="button" class="whc-button" id="whc-retry">Try again</button></div>';document.getElementById('whc-retry').addEventListener('click',load);}
  function load(){root.innerHTML='<p class="whc-loading">'+esc(window.WHC_APP.strings.loading)+'</p>';request('state').then(render).catch(showError);}
  load();
})();