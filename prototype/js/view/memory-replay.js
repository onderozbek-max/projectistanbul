// An earned replay owns presentation above a hidden/inert hub; no run, reward or progression transaction is started.
P.MemoryReplay = (function () {
  var R = {}, current = null;
  R.active = function () { return !!current; };
  R.open = function (id) {
    if (current || !P.Meta.isOpen() || !P.Meta.state().collection['page:' + id] || !P.Story.pages[id]) return false;
    var root = document.querySelector('.meta-root'), focus = document.activeElement;
    var state = current = { id: id, root: root, focus: focus, hidden: root.hidden, inert: root.inert };
    root.hidden = true; root.inert = true;
    function finish() {
      if (current !== state) return;
      current = null; root.hidden = state.hidden; root.inert = state.inert;
      state.back.remove(); document.removeEventListener('keydown', key, true);
      if (focus && focus.isConnected) focus.focus({ preventScroll: true });
    }
    function key(e) {
      if (e.code !== 'Escape') return;
      e.preventDefault(); e.stopImmediatePropagation(); R.close();
    }
    var back = state.back = document.createElement('button'); back.type = 'button'; back.className = 'memory-back btn small';
    back.textContent = P.t('a9.memory.back'); back.onclick = R.close;
    document.getElementById('phone').appendChild(back); document.addEventListener('keydown', key, true);
    state.finish = finish;
    try { P.Comic.page(id, finish, 'memory'); } catch (error) { finish(); throw error; }
    back.focus({ preventScroll: true });
    return true;
  };
  R.close = function () { var state = current; if (!state) return; P.Comic.cancelPages('memory'); state.finish(); };
  return R;
})();
