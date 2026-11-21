// Scope belongs near the current decision, with existing screens and controls retained.
P.ExperienceUI = (function () {
  var E = {};
  function note(parent, id, text, before) {
    var n = document.getElementById(id);
    if (!n) { n = document.createElement('p'); n.id = id; n.className = 'caption experience-scope'; parent.insertBefore(n, before || null); }
    n.textContent = text;
  }
  E.pause = function (s) {
    var box = document.getElementById('pause-build'), lo = P.Meta && P.Meta.loadout();
    note(box.parentNode, 'pause-run-scope', P.t('exp.run'), box);
    plan(s, box.parentNode, 'pause');
    if (!lo) return;
    var id = lo.startWeapon, key = P.CFG.weapons[id].nameKey || 'item.' + id;
    note(box.parentNode, 'pause-permanent', P.t('exp.permanent') + ' · ' +
      P.t('exp.loadout', { weapon: P.t(key), n: Object.keys(P.Meta.state().tree.learned).length }));
  };
  E.cards = function (s, parent, changed) { plan(s, parent, 'cards', changed); };
  var discovered = new WeakSet();
  function plan(s, parent, context, changed) {
    var id = context + '-plan', root=document.getElementById(id);
    if(!root){root=document.createElement('details');root.id=id;root.className='build-plan';parent.appendChild(root);}
    var owned=P.CFG.arsenal.weapons.filter(function(id){return s.hero.weapons[id]>0&&!(s.hero.evolved&&s.hero.evolved[id]);});
    root.hidden=!s.recipeAssistance||!owned.length;root.innerHTML='';
    var title=document.createElement('summary');title.textContent=P.t('a9.plan.current',{weapon:P.t('item.'+(s.recipeFocus||owned[0]))});root.appendChild(title);
    var help=document.createElement('p');help.className='caption';help.textContent=P.t('a9.plan.effect');root.appendChild(help);
    var recipe=document.createElement('p');recipe.className='caption';recipe.textContent=P.UIProgress.liveRecipe(P.Progression.buildState(s))||'';root.appendChild(recipe);
    if(context==='cards'&&owned.length>1&&!discovered.has(s)){root.open=true;discovered.add(s);}
    var list=document.createElement('div');list.style.cssText='display:flex;gap:8px;flex-wrap:wrap';root.appendChild(list);
    owned.forEach(function(id){var button=document.createElement('button');button.className='btn small';
      button.dataset.buildPlan=id;button.style.cssText='flex:1 1 140px;white-space:normal;min-height:44px';
      button.textContent=P.t(s.recipeFocus===id?'exp.plan.following':'exp.plan.choose',{weapon:P.t('item.'+id)});
      button.disabled=s.recipeFocus===id;button.onclick=function(){
        if(context==='cards'&&document.getElementById('cards').dataset.locked)return;
        if(!P.Progression.setBuildPlan(s,id))return;
        if(changed)changed();else P.Screens.showPause(s);document.getElementById(context+'-plan').open=true;
      };list.appendChild(button);
    });
  }
  E.result = function (r) {
    var box = document.getElementById('res-rewards');
    note(box.parentNode, 'result-scope', P.t('exp.persist') + (r.win && !r.hasNext ? ' ' + P.t('exp.boundary') : ''));
    var p=P.Meta && P.Meta.heroStats('arda'), C=P.CFG.stats;
    var id=p && C.ids.find(function(k){return p.ready[k]>0 && p.attr[k]<C.max;});
    var text='';
    if (id) {
      var to=Object.assign({},p.attr); to[id]++;
      var field=C.primary[id], a=P.Stats.effects(p.attr), b=P.Stats.effects(to);
      text=P.t('exp.result.ready',{attr:P.t('stat.'+id),effect:P.t('fx.'+field,{v:'+'+(Math.round(a[field]*1000)/10)+'% → +'+(Math.round(b[field]*1000)/10)+'%'})});
    }
    note(box.parentNode,'result-ready',text);
    var invite=document.getElementById('btn-res-growth');if(invite){invite.dataset.stat=id||'';invite.textContent=id?P.t('reset.growth.apply',{attr:P.t('stat.'+id)}):P.t('growth.title');}
  };
  return E;
})();
