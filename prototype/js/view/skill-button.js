// Active-skill button (W2, view only). A round button in #skills, above the ULT button, shows the loadout's active skill
// (P.Skills.hud(s).active). A tap requests it through P.Input.requestSkill(), the same one-shot as key E. A dark sweep
// covers the part of the ring still recharging; the gold edge shows it is ready, the blue edge that it is running.
// SkillsFx.update calls sync(s) every frame; the DOM is only touched when the state changes.
P.SkillButton = (function () {
  var B = { el: null, holder:null, label:null, id: '', last: '', angle: -1 };
  var CSS = '.skill-control{display:flex;flex-direction:column;align-items:center;gap:6px;width:100px;min-height:100px;pointer-events:none}' +
    '.btn-skill{pointer-events:auto;position:relative;width:68px;height:68px;border-radius:50%;' +
    'border:3px solid var(--ink,#14151F);background:#2A2B3A;padding:0;overflow:hidden;cursor:pointer}' +
    '.btn-skill:active{transform:translateY(2px)}' +
    '.btn-skill .skill-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(rgba(20,21,31,.72) var(--cd,0deg),transparent 0)}' +
    '.btn-skill .skill-ico{position:absolute;inset:5px 12px 17px;display:flex;align-items:center;justify-content:center;pointer-events:none}' +
    '.btn-skill .skill-ico svg{width:100%;height:100%}' +
    '.skill-control .skill-state{display:block;max-width:120px;padding:3px 6px;border-radius:6px;background:#14151f;color:#fff;font:800 calc(11px * var(--ui-text,1))/1.1 var(--hud-body);text-align:center;overflow-wrap:anywhere;pointer-events:none}' +
    '.btn-skill.ready{border-color:#D7B96C}' +
    '.btn-skill.on{border-color:#3DDCFF}';

  function build() {
    var host, el, st, ult, holder, label;
    if (typeof document === 'undefined') return null;
    host = document.getElementById('skills'); ult = document.getElementById('btn-ult');
    if (!host) return null;
    st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    el = document.createElement('button');
    el.id = 'btn-skill'; el.className = 'btn-skill';
    el.innerHTML = '<span class="skill-ring"></span><span class="skill-ico"></span>';
    holder=document.createElement('div');holder.className='skill-control';
    label=document.createElement('span');label.className='skill-state';label.setAttribute('aria-hidden','true');
    holder.appendChild(el);holder.appendChild(label);B.holder=holder;B.label=label;
    el.addEventListener('click', function () { if (el.getAttribute('aria-disabled') !== 'true' && P.Input) P.Input.requestSkill(); });
    host.insertBefore(holder, ult && ult.closest('.ult-control') || ult || null);
    return el;
  }

  B.sync = function (s) {
    var a, state, ico, cd, text, label, key;
    if (!B.el) B.el = build();
    if (!B.el || !s || !P.Skills || !P.Skills.hud) return;
    B.el.style.visibility = P.UI && P.UI.abilityVisible && !P.UI.abilityVisible(s, 'skill') ? 'hidden' : '';
    B.label.style.visibility=B.el.style.visibility;
    a = P.Skills.hud(s).active;
    if (!a || !a.id) { if (!B.el.hidden) B.el.hidden = true;B.holder.classList.add('hidden');return; }
    B.holder.classList.remove('hidden');
    if (B.el.hidden) B.el.hidden = false;
    if (a.id !== B.id) {
      B.id = a.id; B.last = '';
      ico = B.el.querySelector('.skill-ico');
      ico.innerHTML = P.Icons ? P.Icons.svg('skill.' + a.id, 40) : '';
    }
    cd = Math.round((1 - a.cdFrac) * 360);
    state = (a.ready ? 'ready' : a.on ? 'active' : 'seconds');
    if (cd !== B.angle) { B.angle = cd; B.el.style.setProperty('--cd', cd + 'deg'); }
    key = P.lang + '|' + state + '|' + (state === 'seconds' ? a.cdS : '');
    if (key === B.last) return;
    B.last = key;
    text = P.t('ui.hud.skill.' + state, { n: a.cdS });
    label = P.t('skill.' + a.id) + ' · ' + (state === 'seconds' ? P.t('ui.hud.skill.cooldown', { n: a.cdS }) : text);
    B.el.setAttribute('aria-label', label); B.el.setAttribute('aria-disabled', String(!a.ready));
    B.el.title = label; B.label.textContent = a.ready ? P.t('skill.' + a.id) : text;
    B.el.classList.toggle('ready', !!a.ready);
    B.el.classList.toggle('on', !!a.on);
  };

  return B;
})();
