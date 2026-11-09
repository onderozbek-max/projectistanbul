// Active-skill button (W2, view only). A round button in #skills, above the ULT button, shows the loadout's active skill
// (P.Skills.hud(s).active). A tap requests it through P.Input.requestSkill(), the same one-shot as key E. A dark sweep
// covers the part of the ring still recharging; the gold edge shows it is ready, the blue edge that it is running.
// SkillsFx.update calls sync(s) every frame; the DOM is only touched when the state changes.
P.SkillButton = (function () {
  var B = { el: null, id: '', last: '' };
  var CSS = '.btn-skill{pointer-events:auto;position:relative;width:64px;height:64px;border-radius:50%;' +
    'border:3px solid var(--ink,#14151F);background:#2A2B3A;padding:0;overflow:hidden;cursor:pointer}' +
    '.btn-skill:active{transform:translateY(2px)}' +
    '.btn-skill .skill-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(rgba(20,21,31,.72) var(--cd,0deg),transparent 0)}' +
    '.btn-skill .skill-ico{position:absolute;inset:8px;display:flex;align-items:center;justify-content:center;pointer-events:none}' +
    '.btn-skill .skill-ico svg{width:100%;height:100%}' +
    '.btn-skill.ready{box-shadow:0 0 0 3px #FFD166}' +
    '.btn-skill.on{box-shadow:0 0 0 3px #3DDCFF}';

  function build() {
    var host, el, st, ult;
    if (typeof document === 'undefined') return null;
    host = document.getElementById('skills'); ult = document.getElementById('btn-ult');
    if (!host) return null;
    st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    el = document.createElement('button');
    el.id = 'btn-skill'; el.className = 'btn-skill';
    el.innerHTML = '<span class="skill-ring"></span><span class="skill-ico"></span>';
    el.addEventListener('click', function () { if (P.Input && P.Input.requestSkill) P.Input.requestSkill(); });
    host.insertBefore(el, ult || null);
    return el;
  }

  B.sync = function (s) {
    var a, state, ico, cd;
    if (!B.el) B.el = build();
    if (!B.el || !s || !P.Skills || !P.Skills.hud) return;
    a = P.Skills.hud(s).active;
    if (!a || !a.id) { if (!B.el.hidden) B.el.hidden = true; return; }
    if (B.el.hidden) B.el.hidden = false;
    if (a.id !== B.id) {
      B.id = a.id; B.last = '';
      ico = B.el.querySelector('.skill-ico');
      ico.innerHTML = P.Icons ? P.Icons.svg('skill.' + a.id, 40) : '';
      B.el.setAttribute('aria-label', P.t('skill.' + a.id));
      B.el.title = P.t('skill.' + a.id);
    }
    cd = Math.round((1 - a.cdFrac) * 360);
    state = (a.ready ? 'ready' : '') + '|' + (a.on ? 'on' : '') + '|' + cd;
    if (state === B.last) return;
    B.last = state;
    B.el.style.setProperty('--cd', cd + 'deg');
    B.el.classList.toggle('ready', !!a.ready);
    B.el.classList.toggle('on', !!a.on);
  };

  return B;
})();
