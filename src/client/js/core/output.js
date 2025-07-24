(async () => {
    function t(t, e, i) {
        if (bo) return;
        let n = [];
        (i && n.push(...i),
            vo++,
            console.log(
                `%c[${vo}] %c[${t.toUpperCase()}] %c${e}`,
                'color: #757575ff; font-weight: normal; background-color: #242424ff; padding: 5px; padding-right: 0px; font-weight: bold;',
                `color: ${xo[t]}; font-weight: bold; background-color: #242424ff; padding: 5px; padding-right: 0px; font-weight: bold;`,
                'color: #c7c7c7ff; font-weight: normal; background-color: #242424ff; padding: 5px; margin-left: -5px;',
                ...n
            ));
    }
    function e(t = {}) {
        let e = '';
        if (t.extra) for (let i of t.extra) e += `${i.name}: ${i.value}; `;
        return `color: ${t.color ?? '#c7c7c7ff'}; font-weight: ${t['font-weight'] ?? 'normal'}; background-color: ${t['background-color'] ?? '#242424ff'}; padding: ${t.padding ?? '5px'}; padding-left: ${t['padding-left'] ?? '0px'}; padding-right: ${t['padding-right'] ?? '0px'}; ${e}`;
    }
    function i(t, e) {
        Array.isArray(e) ? t.classList.add(...e) : t.classList.add(e);
    }
    function n(t, e) {
        Array.isArray(e) ? t.classList.remove(...e) : t.classList.remove(e);
    }
    function r(t, e, n, r) {
        let o = po.createElement(t);
        return (e && Object.assign(o, e), n && i(o, n), r && a(o, r), o);
    }
    function a(t, e) {
        if (Array.isArray(e)) for (let i of e) t.appendChild(i);
        else t.appendChild(e);
    }
    function o(t, e) {
        let i = po.getElementById(t);
        return (i && (i = i.tagName === e.toUpperCase() ? i : null), i);
    }
    function s(t) {
        return po.getElementById(t);
    }
    function l(t, e) {
        let i = s(t);
        return new Promise(
            i
                ? (t) => t(i)
                : (i) => {
                      let n, r;
                      ((r = setInterval(() => {
                          let e = s(t);
                          e && (clearInterval(r), clearTimeout(n), i(e));
                      }, e.interval ?? 100)),
                          (n = setTimeout(() => {
                              (clearInterval(r), i(null));
                          }, e.timeout ?? 5e3)));
                  }
        );
    }
    function h(t) {
        return new Promise((e) => setTimeout(() => e(void 0), t));
    }
    function c() {
        if ('true' === po.documentElement.dataset.custom) return 'custom-site';
        let t = new URL(po.location.href).pathname.split('/');
        return '' === t[t.length - 1] ? 'index' : t[t.length - 1].split('.')[0];
    }
    function d(t) {
        return `<span class="materialSymbolsRounded">${t}</span>`;
    }
    async function u() {
        return yo
            ? Promise.resolve()
            : new Promise((t) => {
                  'complete' === po.readyState
                      ? ((yo = 1), t())
                      : mo.addEventListener('DOMContentLoaded', () => {
                            ((yo = 1), t());
                        });
              });
    }
    function f(t, e, i) {
        if (Array.isArray(i)) for (let n of i) t.insertAdjacentElement(e, n);
        else t.insertAdjacentElement(e, i);
    }
    async function g() {
        return (await u(), po.body);
    }
    function p(t, e) {
        let i = t.innerHTML;
        return (
            (t.innerHTML = e),
            () => {
                t.innerHTML = i;
            }
        );
    }
    async function m(t, e) {
        let i = r('div', { className: 'errorPopup' }),
            n = r('p', { className: 'errorPopupText', innerText: t }),
            o = r('button', { className: 'errorPopupClose', innerText: 'Close', type: 'button' });
        if ((a(i, [n, o]), e)) {
            let t = r('p', {
                innerText: `This popup will automatically close within ${_o.format(e / 1e3)} seconds of it being opened.`,
                className: 'errorPopupAutoCloseNotice'
            });
            a(i, t);
        }
        let s = 0;
        return (
            e &&
                setTimeout(() => {
                    0 == s && i.remove();
                }, e),
            o.addEventListener('click', () => {
                (i.remove(), (s = 1));
            }),
            f(await g(), 'afterbegin', i),
            mo.scroll({ top: 0, left: 0, behavior: 'smooth' }),
            i
        );
    }
    async function b() {
        return await fetch('/api/auth/@me').catch(() => ({
            json: () => ({ user: null, admin: 0, mod: 0 }),
            status: 200
        }));
    }
    async function v() {
        if (Mo) return Mo;
        let t = mo.localStorage,
            e = t.getItem('cache_LoggedInUser');
        if (
            (e &&
                ((Mo = JSON.parse(e)),
                new Promise(async (e) => {
                    let i = await b();
                    if (200 === i.status) {
                        let e = await i.json();
                        (!e.user || e.user.id !== Mo?.user?.id) &&
                            (t.removeItem('cache_LoggedInUser'),
                            po.location.href === wo ? po.location.reload() : (po.location.href = wo));
                    } else m('Failed to verify that you are a logged in user.', 4e3);
                    e(void 0);
                })),
            Mo)
        )
            return Mo;
        let i = await b();
        if (200 === i.status) {
            let e = await i.json();
            (Mo = e).user && t.setItem('cache_LoggedInUser', JSON.stringify(e));
        } else (m('Failed to check for a logged in user.', 4e3), (Mo = { user: null, admin: 0, mod: 0 }));
    }
    async function x() {
        return (await v(), Mo || { user: null, admin: 0, mod: 0 });
    }
    function y(t) {
        let e;
        try {
            if (((e = Xo && (self.URL || self.webkitURL).createObjectURL(Xo)), !e)) throw '';
            let i = new Worker(e, { name: t?.name });
            return (
                i.addEventListener('error', () => {
                    (self.URL || self.webkitURL).revokeObjectURL(e);
                }),
                i
            );
        } catch {
            return new Worker('data:text/javascript;charset=utf-8,' + encodeURIComponent(qo), { name: t?.name });
        } finally {
            e && (self.URL || self.webkitURL).revokeObjectURL(e);
        }
    }
    function _(t) {
        throw Error('https://svelte.dev/e/lifecycle_outside_component');
    }
    function w(t) {
        for (var e = 0; e < t.length; e++) t[e]();
    }
    function M(t) {
        console.warn('https://svelte.dev/e/hydration_mismatch');
    }
    function k(t) {
        Ns = t;
    }
    function S(t) {
        if (null === t) throw (M(), as);
        return (Hs = t);
    }
    function C() {
        return S(O(Hs));
    }
    function L(t) {
        if (Ns) {
            if (null !== O(Hs)) throw (M(), as);
            Hs = t;
        }
    }
    function E(t) {
        if ('object' != typeof t || null === t || Vs in t) return t;
        let e = bs(t);
        if (e !== ps && e !== ms) return t;
        var i = new Map(),
            n = ls(t),
            r = $t(0),
            a = nl,
            o = (t) => {
                var e = nl;
                ft(a);
                var i = t();
                return (ft(e), i);
            };
        return (
            n && i.set('length', $t(t.length)),
            new Proxy(t, {
                defineProperty(t, e, n) {
                    (!('value' in n) || 0 == n.configurable || 0 == n.enumerable || 0 == n.writable) &&
                        (function () {
                            throw Error('https://svelte.dev/e/state_descriptors_fixed');
                        })();
                    var r = i.get(e);
                    return (
                        void 0 === r
                            ? ((r = o(() => $t(n.value))), i.set(e, r))
                            : zt(
                                  r,
                                  o(() => E(n.value))
                              ),
                        1
                    );
                },
                deleteProperty(t, e) {
                    var a = i.get(e);
                    if (void 0 === a)
                        e in t &&
                            (i.set(
                                e,
                                o(() => $t(os))
                            ),
                            P(r));
                    else {
                        if (n && 'string' == typeof e) {
                            var s = i.get('length'),
                                l = +e;
                            Number.isInteger(l) && l < s.v && zt(s, l);
                        }
                        (zt(a, os), P(r));
                    }
                    return 1;
                },
                get(e, n, r) {
                    var a;
                    if (n === Vs) return t;
                    var s = i.get(n),
                        l = n in e;
                    if (
                        (void 0 === s &&
                            (!l || (null != (a = fs(e, n)) && a.writable)) &&
                            ((s = o(() => $t(E(l ? e[n] : os)))), i.set(n, s)),
                        void 0 !== s)
                    ) {
                        var h = Tt(s);
                        return h === os ? void 0 : h;
                    }
                    return Reflect.get(e, n, r);
                },
                getOwnPropertyDescriptor(t, e) {
                    var n = Reflect.getOwnPropertyDescriptor(t, e);
                    if (n && 'value' in n) {
                        var r = i.get(e);
                        r && (n.value = Tt(r));
                    } else if (void 0 === n) {
                        var a = i.get(e),
                            o = a?.v;
                        if (void 0 !== a && o !== os) return { enumerable: 1, configurable: 1, value: o, writable: 1 };
                    }
                    return n;
                },
                has(t, e) {
                    var n;
                    if (e === Vs) return 1;
                    var r = i.get(e),
                        a = (void 0 !== r && r.v !== os) || Reflect.has(t, e);
                    return (void 0 !== r || (null !== al && (!a || (null != (n = fs(t, e)) && n.writable)))) &&
                        (void 0 === r && ((r = o(() => $t(a ? E(t[e]) : os))), i.set(e, r)), Tt(r) === os)
                        ? 0
                        : a;
                },
                set(t, e, a, s) {
                    var l,
                        h = i.get(e),
                        c = e in t;
                    if (n && 'length' === e)
                        for (var d = a; d < h.v; d += 1) {
                            var u = i.get(d + '');
                            void 0 !== u ? zt(u, os) : d in t && ((u = o(() => $t(os))), i.set(d + '', u));
                        }
                    void 0 === h
                        ? (!c || (null != (l = fs(t, e)) && l.writable)) &&
                          (zt(
                              (h = o(() => $t(void 0))),
                              o(() => E(a))
                          ),
                          i.set(e, h))
                        : ((c = h.v !== os),
                          zt(
                              h,
                              o(() => E(a))
                          ));
                    var f = Reflect.getOwnPropertyDescriptor(t, e);
                    if ((null != f && f.set && f.set.call(s, a), !c)) {
                        if (n && 'string' == typeof e) {
                            var g = i.get('length'),
                                p = +e;
                            Number.isInteger(p) && p >= g.v && zt(g, p + 1);
                        }
                        P(r);
                    }
                    return 1;
                },
                ownKeys(t) {
                    Tt(r);
                    var e = Reflect.ownKeys(t).filter((t) => {
                        var e = i.get(t);
                        return void 0 === e || e.v !== os;
                    });
                    for (var [n, a] of i) a.v !== os && !(n in t) && e.push(n);
                    return e;
                },
                setPrototypeOf() {
                    !(function () {
                        throw Error('https://svelte.dev/e/state_prototype_fixed');
                    })();
                }
            })
        );
    }
    function P(t, e = 1) {
        zt(t, t.v + e);
    }
    function D() {
        if (void 0 === Ws) {
            ((Ws = window), (Us = /Firefox/.test(navigator.userAgent)));
            var t = Element.prototype,
                e = Node.prototype,
                i = Text.prototype;
            ((Ys = fs(e, 'firstChild').get),
                (qs = fs(e, 'nextSibling').get),
                vs(t) &&
                    ((t.__click = void 0),
                    (t.__className = void 0),
                    (t.__attributes = null),
                    (t.__style = void 0),
                    (t.__e = void 0)),
                vs(i) && (i.__t = void 0));
        }
    }
    function A(t = '') {
        return document.createTextNode(t);
    }
    function T(t) {
        return Ys.call(t);
    }
    function O(t) {
        return qs.call(t);
    }
    function R(t, e) {
        if (!Ns) return T(t);
        var i = T(Hs);
        return (null === i && (i = Hs.appendChild(A())), S(i), i);
    }
    function I(t, e) {
        if (!Ns) {
            var i = T(t);
            return i instanceof Comment && '' === i.data ? O(i) : i;
        }
        return Hs;
    }
    function $(t, e = 1, i = 0) {
        let n = Ns ? Hs : t;
        for (var r; e--; ) ((r = n), (n = O(n)));
        if (!Ns) return n;
        var a = n?.nodeType;
        if (i && 3 !== a) {
            var o = A();
            return (null === n ? r?.after(o) : n.before(o), S(o), o);
        }
        return (S(n), n);
    }
    function F(t) {
        return t === this.v;
    }
    function z(t, e) {
        return t != t ? e == e : t !== e || (null !== t && 'object' == typeof t) || 'function' == typeof t;
    }
    function V(t) {
        return !z(t, this.v);
    }
    function B(t) {
        var e = ys | Ds,
            i = null !== nl && 0 !== (nl.f & ys) ? nl : null;
        return (
            null === al || (null !== i && 0 !== (i.f & Ls)) ? (e |= Ls) : (al.f |= Fs),
            {
                ctx: pl,
                deps: null,
                effects: null,
                equals: F,
                f: e,
                fn: t,
                reactions: null,
                rv: 0,
                v: null,
                wv: 0,
                parent: i ?? al
            }
        );
    }
    function j(t) {
        let e = B(t);
        return (pt(e), e);
    }
    function N(t) {
        var e = t.effects;
        if (null !== e) {
            t.effects = null;
            for (var i = 0; i < e.length; i += 1) et(e[i]);
        }
    }
    function H(t) {
        var e,
            i = al;
        gt(
            (function (t) {
                for (var e = t.parent; null !== e; ) {
                    if (0 === (e.f & ys)) return e;
                    e = e.parent;
                }
                return null;
            })(t)
        );
        try {
            (N(t), (e = _t(t)));
        } finally {
            gt(i);
        }
        return e;
    }
    function W(t) {
        var e = H(t);
        (Rt(t, (!ul && 0 === (t.f & Ls)) || null === t.deps ? Ps : As), t.equals(e) || ((t.v = e), (t.wv = mt())));
    }
    function U(t, e, i, n = 1) {
        var r = al,
            a = {
                ctx: pl,
                deps: null,
                nodes_start: null,
                nodes_end: null,
                f: t | Ds,
                first: null,
                fn: e,
                last: null,
                next: null,
                parent: r,
                prev: null,
                teardown: null,
                transitions: null,
                wv: 0
            };
        if (i)
            try {
                (kt(a), (a.f |= Rs));
            } catch (t) {
                throw (et(a), t);
            }
        else null !== e && Et(a);
        return (
            (i &&
                null === a.deps &&
                null === a.first &&
                null === a.nodes_start &&
                null === a.teardown &&
                0 === (a.f & (Fs | Cs))) ||
                !n ||
                (null !== r &&
                    (function (t, e) {
                        var i = e.last;
                        null === i ? (e.last = e.first = t) : ((i.next = t), (t.prev = i), (e.last = t));
                    })(a, r),
                null === nl || 0 === (nl.f & ys)) ||
                (nl.effects ?? (nl.effects = [])).push(a),
            a
        );
    }
    function Y(t) {
        let e = U(ws, null, 0);
        return (Rt(e, Ps), (e.teardown = t), e);
    }
    function q(t) {
        if (
            (null === al &&
                null === nl &&
                (function () {
                    throw Error('https://svelte.dev/e/effect_orphan');
                })(),
            null !== nl &&
                0 !== (nl.f & Ls) &&
                null === al &&
                (function () {
                    throw Error('https://svelte.dev/e/effect_in_unowned_derived');
                })(),
            el &&
                (function () {
                    throw Error('https://svelte.dev/e/effect_in_teardown');
                })(),
            null === al || 0 === (al.f & ks) || null === pl || pl.m)
        )
            return X(t);
        (pl.e ?? (pl.e = [])).push({ fn: t, effect: al, reaction: nl });
    }
    function X(t) {
        return U(_s, t, 0);
    }
    function G(t) {
        return U(ws, t, 1);
    }
    function Z(t, e = [], i = B) {
        let n = e.map(i);
        return K(() => t(...n.map(Tt)));
    }
    function K(t, e = 0) {
        return U(ws | Ms | e, t, 1);
    }
    function J(t, e = 1) {
        return U(ws | ks, t, 1, e);
    }
    function Q(t) {
        var e = t.teardown;
        if (null !== e) {
            let t = el,
                i = nl;
            (ut(1), ft(null));
            try {
                e.call(null);
            } finally {
                (ut(t), ft(i));
            }
        }
    }
    function tt(t, e = 0) {
        var i = t.first;
        for (t.first = t.last = null; null !== i; ) {
            var n = i.next;
            (0 !== (i.f & Ss) ? (i.parent = null) : et(i, e), (i = n));
        }
    }
    function et(t, e = 1) {
        var i = 0;
        ((e || 0 !== (t.f & $s)) && null !== t.nodes_start && (it(t.nodes_start, t.nodes_end), (i = 1)),
            tt(t, e && !i),
            Mt(t, 0),
            Rt(t, Os));
        var n = t.transitions;
        if (null !== n) for (let t of n) t.stop();
        Q(t);
        var r = t.parent;
        (null !== r && null !== r.first && nt(t),
            (t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null));
    }
    function it(t, e) {
        for (; null !== t; ) {
            var i = t === e ? null : O(t);
            (t.remove(), (t = i));
        }
    }
    function nt(t) {
        var e = t.parent,
            i = t.prev,
            n = t.next;
        (null !== i && (i.next = n),
            null !== n && (n.prev = i),
            null !== e && (e.first === t && (e.first = n), e.last === t && (e.last = i)));
    }
    function rt(t, e) {
        var i = [];
        (at(t, i, 1),
            (function (t, e) {
                var i = t.length;
                if (i > 0) {
                    var n = () => --i || e();
                    for (var r of t) r.out(n);
                } else e();
            })(i, () => {
                (et(t), e && e());
            }));
    }
    function at(t, e, i) {
        if (0 === (t.f & Ts)) {
            if (((t.f ^= Ts), null !== t.transitions)) for (let n of t.transitions) (n.is_global || i) && e.push(n);
            for (var n = t.first; null !== n; ) {
                var r = n.next;
                (at(n, e, 0 !== (n.f & Is) || 0 !== (n.f & ks) ? i : 0), (n = r));
            }
        }
    }
    function ot(t) {
        st(t, 1);
    }
    function st(t, e) {
        if (0 !== (t.f & Ts)) {
            ((t.f ^= Ts), 0 === (t.f & Ps) && (t.f ^= Ps), bt(t) && (Rt(t, Ds), Et(t)));
            for (var i = t.first; null !== i; ) {
                var n = i.next;
                (st(i, 0 !== (i.f & Is) || 0 !== (i.f & ks) ? e : 0), (i = n));
            }
            if (null !== t.transitions) for (let i of t.transitions) (i.is_global || e) && i.in();
        }
    }
    function lt() {
        var t = Gs;
        ((Gs = []), w(t));
    }
    function ht() {
        var t = Zs;
        ((Zs = []), w(t));
    }
    function ct(t) {
        (0 === Gs.length && queueMicrotask(lt), Gs.push(t));
    }
    function dt() {
        (Gs.length > 0 && lt(), Zs.length > 0 && ht());
    }
    function ut(t) {
        el = t;
    }
    function ft(t) {
        nl = t;
    }
    function gt(t) {
        al = t;
    }
    function pt(t) {
        null !== nl && nl.f & zs && (null === ol ? (ol = [t]) : ol.push(t));
    }
    function mt() {
        return ++cl;
    }
    function bt(t) {
        var e,
            i = t.f;
        if (0 !== (i & Ds)) return 1;
        if (0 !== (i & As)) {
            var n = t.deps,
                r = 0 !== (i & Ls);
            if (null !== n) {
                var a,
                    o,
                    s = 0 !== (i & Es),
                    l = r && null !== al && !ul,
                    h = n.length;
                if (s || l) {
                    var c = t,
                        d = c.parent;
                    for (a = 0; a < h; a++)
                        ((o = n[a]),
                            (s || null == (e = o?.reactions) || !e.includes(c)) &&
                                (o.reactions ?? (o.reactions = [])).push(c));
                    (s && (c.f ^= Es), l && null !== d && 0 === (d.f & Ls) && (c.f ^= Ls));
                }
                for (a = 0; a < h; a++) if ((bt((o = n[a])) && W(o), o.wv > t.wv)) return 1;
            }
            (!r || (null !== al && !ul)) && Rt(t, Ps);
        }
        return 0;
    }
    function vt(t) {
        return 0 === (t.f & Os) && (null === t.parent || 0 === (t.parent.f & Cs));
    }
    function xt(t, e, i, n) {
        if (Ks) {
            if ((null === i && (Ks = 0), vt(e))) throw t;
        } else if (
            (null !== i && (Ks = 1),
            (function (t, e) {
                for (var i = e; null !== i; ) {
                    if (0 !== (i.f & Cs))
                        try {
                            return void i.fn(t);
                        } catch {
                            i.f ^= Cs;
                        }
                    i = i.parent;
                }
                throw ((Ks = 0), t);
            })(t, e),
            vt(e))
        )
            throw t;
    }
    function yt(t, e, i = 1) {
        var n = t.reactions;
        if (null !== n)
            for (var r = 0; r < n.length; r++) {
                var a = n[r];
                (null != ol && ol.includes(t)) ||
                    (0 !== (a.f & ys)
                        ? yt(a, e, 0)
                        : e === a && (i ? Rt(a, Ds) : 0 !== (a.f & Ps) && Rt(a, As), Et(a)));
            }
    }
    function _t(t) {
        var e,
            i = sl,
            n = ll,
            r = hl,
            a = nl,
            o = ul,
            s = ol,
            l = pl,
            h = rl,
            c = t.f;
        ((sl = null),
            (ll = 0),
            (hl = null),
            (ul = 0 !== (c & Ls) && (rl || !tl || null === nl)),
            (nl = 0 === (c & (ks | Ss)) ? t : null),
            (ol = null),
            Bt(t.ctx),
            (rl = 0),
            dl++,
            (t.f |= zs));
        try {
            var d = (0, t.fn)(),
                u = t.deps;
            if (null !== sl) {
                var f;
                if ((Mt(t, ll), null !== u && ll > 0))
                    for (u.length = ll + sl.length, f = 0; f < sl.length; f++) u[ll + f] = sl[f];
                else t.deps = u = sl;
                if (!ul) for (f = ll; f < u.length; f++) ((e = u[f]).reactions ?? (e.reactions = [])).push(t);
            } else null !== u && ll < u.length && (Mt(t, ll), (u.length = ll));
            if (null !== hl && !rl && null !== u && 0 === (t.f & (ys | As | Ds)))
                for (f = 0; f < hl.length; f++) yt(hl[f], t);
            return (null !== a && a !== t && (dl++, null !== hl && (null === r ? (r = hl) : r.push(...hl))), d);
        } finally {
            ((sl = i), (ll = n), (hl = r), (nl = a), (ul = o), (ol = s), Bt(l), (rl = h), (t.f ^= zs));
        }
    }
    function wt(t, e) {
        let i = e.reactions;
        if (null !== i) {
            var n = hs.call(i, t);
            if (-1 !== n) {
                var r = i.length - 1;
                0 === r ? (i = e.reactions = null) : ((i[n] = i[r]), i.pop());
            }
        }
        null === i &&
            0 !== (e.f & ys) &&
            (null === sl || !sl.includes(e)) &&
            (Rt(e, As), 0 === (e.f & (Ls | Es)) && (e.f ^= Es), N(e), Mt(e, 0));
    }
    function Mt(t, e) {
        var i = t.deps;
        if (null !== i) for (var n = e; n < i.length; n++) wt(t, i[n]);
    }
    function kt(t) {
        var e = t.f;
        if (0 === (e & Os)) {
            Rt(t, Ps);
            var i = al,
                n = tl;
            ((al = t), (tl = 1));
            try {
                (0 !== (e & Ms)
                    ? (function (t) {
                          for (var e = t.first; null !== e; ) {
                              var i = e.next;
                              (0 === (e.f & ks) && et(e), (e = i));
                          }
                      })(t)
                    : tt(t),
                    Q(t));
                var r = _t(t);
                ((t.teardown = 'function' == typeof r ? r : null), (t.wv = cl));
            } catch (e) {
                xt(e, t, i);
            } finally {
                ((tl = n), (al = i));
            }
        }
    }
    function St() {
        try {
            !(function () {
                throw Error('https://svelte.dev/e/effect_update_depth_exceeded');
            })();
        } catch (t) {
            if (null === Qs) throw t;
            xt(t, Qs, null);
        }
    }
    function Ct() {
        var t = tl;
        try {
            var e = 0;
            for (tl = 1; il.length > 0; ) {
                e++ > 1e3 && St();
                var i = il,
                    n = i.length;
                il = [];
                for (var r = 0; r < n; r++) Lt(Pt(i[r]));
                gl.clear();
            }
        } finally {
            ((Js = 0), (tl = t), (Qs = null));
        }
    }
    function Lt(t) {
        var e = t.length;
        if (0 !== e)
            for (var i = 0; i < e; i++) {
                var n = t[i];
                if (0 === (n.f & (Os | Ts)))
                    try {
                        bt(n) &&
                            (kt(n),
                            null === n.deps &&
                                null === n.first &&
                                null === n.nodes_start &&
                                (null === n.teardown ? nt(n) : (n.fn = null)));
                    } catch (t) {
                        xt(t, n, null);
                    }
            }
    }
    function Et(t) {
        Js || ((Js = 1), queueMicrotask(Ct));
        for (var e = (Qs = t); null !== e.parent; ) {
            var i = (e = e.parent).f;
            if (0 !== (i & (Ss | ks))) {
                if (0 === (i & Ps)) return;
                e.f ^= Ps;
            }
        }
        il.push(e);
    }
    function Pt(t) {
        for (var e = [], i = t; null !== i; ) {
            var n = i.f,
                r = 0 !== (n & (ks | Ss));
            if ((!r || 0 === (n & Ps)) && 0 === (n & Ts)) {
                if (0 !== (n & _s)) e.push(i);
                else if (r) i.f ^= Ps;
                else
                    try {
                        bt(i) && kt(i);
                    } catch (t) {
                        xt(t, i, null);
                    }
                var a = i.first;
                if (null !== a) {
                    i = a;
                    continue;
                }
            }
            var o = i.parent;
            for (i = i.next; null === i && null !== o; ) ((i = o.next), (o = o.parent));
        }
        return e;
    }
    function Dt(t) {
        for (;;) {
            if ((dt(), 0 === il.length)) return;
            ((Js = 1), Ct());
        }
    }
    async function At() {
        (await Promise.resolve(), Dt());
    }
    function Tt(t) {
        var e = 0 !== (t.f & ys);
        if (null === nl || rl) {
            if (e && null === t.deps && null === t.effects) {
                var i = t,
                    n = i.parent;
                null !== n && 0 === (n.f & Ls) && (i.f ^= Ls);
            }
        } else if (null == ol || !ol.includes(t)) {
            var r = nl.deps;
            t.rv < dl &&
                ((t.rv = dl),
                null === sl && null !== r && r[ll] === t
                    ? ll++
                    : null === sl
                      ? (sl = [t])
                      : (!ul || !sl.includes(t)) && sl.push(t));
        }
        return (e && bt((i = t)) && W(i), el && gl.has(t) ? gl.get(t) : t.v);
    }
    function Ot(t) {
        var e = rl;
        try {
            return ((rl = 1), t());
        } finally {
            rl = e;
        }
    }
    function Rt(t, e) {
        t.f = (t.f & fl) | e;
    }
    function It(t, e) {
        return { f: 0, v: t, reactions: null, equals: F, rv: 0, wv: 0 };
    }
    function $t(t, e) {
        let i = It(t);
        return (pt(i), i);
    }
    function Ft(t, e = 0) {
        let i = It(t);
        return (e || (i.equals = V), i);
    }
    function zt(t, e, i = 0) {
        return (
            null !== nl &&
                !rl &&
                0 !== (nl.f & (ys | Ms)) &&
                (null == ol || !ol.includes(t)) &&
                (function () {
                    throw Error('https://svelte.dev/e/state_unsafe_mutation');
                })(),
            (function (t, e) {
                return (
                    t.equals(e) ||
                        (gl.set(t, el ? e : t.v),
                        (t.v = e),
                        0 !== (t.f & ys) && (0 !== (t.f & Ds) && H(t), Rt(t, 0 === (t.f & Ls) ? Ps : As)),
                        (t.wv = mt()),
                        Vt(t, Ds),
                        null !== al &&
                            0 !== (al.f & Ps) &&
                            0 === (al.f & (ks | Ss)) &&
                            (null === hl
                                ? (function (t) {
                                      hl = t;
                                  })([t])
                                : hl.push(t))),
                    e
                );
            })(t, i ? E(e) : e)
        );
    }
    function Vt(t, e) {
        var i = t.reactions;
        if (null !== i)
            for (var n = i.length, r = 0; r < n; r++) {
                var a = i[r],
                    o = a.f;
                0 === (o & Ds) && (Rt(a, e), 0 !== (o & (Ps | Ls)) && (0 !== (o & ys) ? Vt(a, As) : Et(a)));
            }
    }
    function Bt(t) {
        pl = t;
    }
    function jt(t, e = 0, i) {
        var n = (pl = { p: pl, c: null, d: 0, e: null, m: 0, s: t, x: null, l: null });
        Y(() => {
            n.d = 1;
        });
    }
    function Nt(t) {
        let e = pl;
        if (null !== e) {
            void 0 !== t && (e.x = t);
            let o = e.e;
            if (null !== o) {
                var i = al,
                    n = nl;
                e.e = null;
                try {
                    for (var r = 0; r < o.length; r++) {
                        var a = o[r];
                        (gt(a.effect), ft(a.reaction), X(a.fn));
                    }
                } finally {
                    (gt(i), ft(n));
                }
            }
            ((pl = e.p), (e.m = 1));
        }
        return t || {};
    }
    function Ht(t) {
        return ml.includes(t);
    }
    function Wt() {
        bl ||
            ((bl = 1),
            document.addEventListener(
                'reset',
                (t) => {
                    Promise.resolve().then(() => {
                        var e;
                        if (!t.defaultPrevented) for (let i of t.target.elements) null == (e = i.__on_r) || e.call(i);
                    });
                },
                { capture: 1 }
            ));
    }
    function Ut(t) {
        var e = nl,
            i = al;
        (ft(null), gt(null));
        try {
            return t();
        } finally {
            (ft(e), gt(i));
        }
    }
    function Yt(t, e, i, n, r) {
        var a = { capture: n, passive: r },
            o = (function (t, e, i, n = {}) {
                function r(t) {
                    if ((n.capture || qt.call(e, t), !t.cancelBubble)) return Ut(() => i?.call(this, t));
                }
                return (
                    t.startsWith('pointer') || t.startsWith('touch') || 'wheel' === t
                        ? ct(() => {
                              e.addEventListener(t, r, n);
                          })
                        : e.addEventListener(t, r, n),
                    r
                );
            })(t, e, i, a);
        (e === document.body || e === window || e === document) &&
            Y(() => {
                e.removeEventListener(t, o, a);
            });
    }
    function qt(t) {
        var e,
            i = this,
            n = i.ownerDocument,
            r = t.type,
            a = (null == (e = t.composedPath) ? void 0 : e.call(t)) || [],
            o = a[0] || t.target,
            s = 0,
            l = t.__root;
        if (l) {
            var h = a.indexOf(l);
            if (-1 !== h && (i === document || i === window)) return void (t.__root = i);
            var c = a.indexOf(i);
            if (-1 === c) return;
            h <= c && (s = h);
        }
        if ((o = a[s] || t.target) !== i) {
            us(t, 'currentTarget', {
                configurable: 1,
                get() {
                    return o || n;
                }
            });
            var d = nl,
                u = al;
            (ft(null), gt(null));
            try {
                for (var f, g = []; null !== o; ) {
                    var p = o.assignedSlot || o.parentNode || o.host || null;
                    try {
                        var m = o['__' + r];
                        if (null != m && (!o.disabled || t.target === o))
                            if (ls(m)) {
                                var [b, ...v] = m;
                                b.call(o, t, ...v);
                            } else m.call(o, t);
                    } catch (t) {
                        f ? g.push(t) : (f = t);
                    }
                    if (t.cancelBubble || p === i || null === p) break;
                    o = p;
                }
                if (f) {
                    for (let t of g)
                        queueMicrotask(() => {
                            throw t;
                        });
                    throw f;
                }
            } finally {
                ((t.__root = i), delete t.currentTarget, ft(d), gt(u));
            }
        }
    }
    function Xt(t) {
        var e = document.createElement('template');
        return ((e.innerHTML = t), e.content);
    }
    function Gt(t, e) {
        var i = al;
        null === i.nodes_start && ((i.nodes_start = t), (i.nodes_end = e));
    }
    function Zt(t, e) {
        var i,
            n = 0 !== (e & ts),
            r = 0 !== (e & es),
            a = !t.startsWith('<!>');
        return () => {
            if (Ns) return (Gt(Hs, null), Hs);
            void 0 === i && ((i = Xt(a ? t : '<!>' + t)), n || (i = T(i)));
            var e = r || Us ? document.importNode(i, 1) : i.cloneNode(1);
            return (n ? Gt(T(e), e.lastChild) : Gt(e, e), e);
        };
    }
    function Kt(t, e, i = 'svg') {
        var n,
            r = `<${i}>${t.startsWith('<!>') ? '<!>' + t : t}</${i}>`;
        return () => {
            if (Ns) return (Gt(Hs, null), Hs);
            if (!n) {
                var t = T(Xt(r));
                n = T(t);
            }
            var e = n.cloneNode(1);
            return (Gt(e, e), e);
        };
    }
    function Jt() {
        if (Ns) return (Gt(Hs, null), Hs);
        var t = document.createDocumentFragment(),
            e = document.createComment(''),
            i = A();
        return (t.append(e, i), Gt(e, i), t);
    }
    function Qt(t, e) {
        if (Ns) return ((al.nodes_end = Hs), void C());
        null !== t && t.before(e);
    }
    function te(t, e) {
        return ie(t, e);
    }
    function ee(t, e) {
        (D(), (e.intro = e.intro ?? 0));
        let i = e.target,
            n = Ns,
            r = Hs;
        try {
            for (var a = T(i); a && (8 !== a.nodeType || a.data !== is); ) a = O(a);
            if (!a) throw as;
            (k(1), S(a), C());
            let n = ie(t, { ...e, anchor: a });
            if (null === Hs || 8 !== Hs.nodeType || Hs.data !== rs) throw (M(), as);
            return (k(0), n);
        } catch (n) {
            if (n === as)
                return (
                    0 == e.recover &&
                        (function () {
                            throw Error('https://svelte.dev/e/hydration_failed');
                        })(),
                    D(),
                    (function (t) {
                        t.textContent = '';
                    })(i),
                    k(0),
                    te(t, e)
                );
            throw n;
        } finally {
            (k(n), S(r));
        }
    }
    function ie(t, { target: e, anchor: i, props: n = {}, events: r, context: a, intro: o = 1 }) {
        D();
        var s = new Set(),
            l = (t) => {
                for (var i = 0; i < t.length; i++) {
                    var n = t[i];
                    if (!s.has(n)) {
                        s.add(n);
                        var r = Ht(n);
                        e.addEventListener(n, qt, { passive: r });
                        var a = yl.get(n);
                        void 0 === a
                            ? (document.addEventListener(n, qt, { passive: r }), yl.set(n, 1))
                            : yl.set(n, a + 1);
                    }
                }
            };
        (l(cs(vl)), xl.add(l));
        var h = void 0,
            c = (function (t) {
                let e = U(Ss, t, 1);
                return (t = {}) =>
                    new Promise((i) => {
                        t.outro
                            ? rt(e, () => {
                                  (et(e), i(void 0));
                              })
                            : (et(e), i(void 0));
                    });
            })(() => {
                var o = i ?? e.appendChild(A());
                return (
                    J(() => {
                        (a && (jt({}), (pl.c = a)),
                            r && (n.$$events = r),
                            Ns && Gt(o, null),
                            (h = t(o, n) || {}),
                            Ns && (al.nodes_end = Hs),
                            a && Nt());
                    }),
                    () => {
                        var t;
                        for (var n of s) {
                            e.removeEventListener(n, qt);
                            var r = yl.get(n);
                            0 === --r ? (document.removeEventListener(n, qt), yl.delete(n)) : yl.set(n, r);
                        }
                        (xl.delete(l), o !== i && (null == (t = o.parentNode) || t.removeChild(o)));
                    }
                );
            });
        return (_l.set(h, c), h);
    }
    function ne(t, e, [i, n] = [0, 0]) {
        Ns && 0 === i && C();
        var r = t,
            a = null,
            o = null,
            s = os,
            l = 0;
        let h = (t, e = 1) => {
                ((l = 1), c(e, t));
            },
            c = (t, e) => {
                if (s === (s = t)) return;
                let l = 0;
                if (Ns && -1 !== n) {
                    if (0 === i) {
                        let t = r.data;
                        t === is
                            ? (n = 0)
                            : t === ns
                              ? (n = 1 / 0)
                              : (n = parseInt(t.substring(1))) != n && (n = s ? 1 / 0 : -1);
                    }
                    !!s == n > i &&
                        ((r = (function () {
                            for (var t = 0, e = Hs; ; ) {
                                if (8 === e.nodeType) {
                                    var i = e.data;
                                    if (i === rs) {
                                        if (0 === t) return e;
                                        t -= 1;
                                    } else (i === is || i === ns) && (t += 1);
                                }
                                var n = O(e);
                                (e.remove(), (e = n));
                            }
                        })()),
                        S(r),
                        k(0),
                        (l = 1),
                        (n = -1));
                }
                (s
                    ? (a ? ot(a) : e && (a = J(() => e(r))),
                      o &&
                          rt(o, () => {
                              o = null;
                          }))
                    : (o ? ot(o) : e && (o = J(() => e(r, [i + 1, n]))),
                      a &&
                          rt(a, () => {
                              a = null;
                          })),
                    l && k(1));
            };
        (K(
            () => {
                ((l = 0), e(h), l || c(null, null));
            },
            i > 0 ? Is : 0
        ),
            Ns && (r = Hs));
    }
    function re(t, e, i = 0, n = 0, r = 0) {
        var a = t,
            o = '';
        Z(() => {
            var t = al;
            if (o !== (o = e() ?? '')) {
                if (
                    (null !== t.nodes_start && (it(t.nodes_start, t.nodes_end), (t.nodes_start = t.nodes_end = null)),
                    '' !== o)
                ) {
                    if (Ns) {
                        for (var r = C(), s = r; null !== r && (8 !== r.nodeType || '' !== r.data); )
                            ((s = r), (r = O(r)));
                        if (null === r) throw (M(), as);
                        return (Gt(Hs, s), void (a = S(r)));
                    }
                    var l = o + '';
                    i ? (l = `<svg>${l}</svg>`) : n && (l = `<math>${l}</math>`);
                    var h = Xt(l);
                    if (((i || n) && (h = T(h)), Gt(T(h), h.lastChild), i || n)) for (; T(h); ) a.before(T(h));
                    else a.before(h);
                }
            } else Ns && C();
        });
    }
    function ae(t) {
        if (Ns) {
            var e = 0,
                i = () => {
                    if (!e) {
                        if (((e = 1), t.hasAttribute('value'))) {
                            var i = t.value;
                            (oe(t, 'value', null), (t.value = i));
                        }
                        if (t.hasAttribute('checked')) {
                            var n = t.checked;
                            (oe(t, 'checked', null), (t.checked = n));
                        }
                    }
                };
            ((t.__on_r = i),
                (function (t) {
                    (0 === Zs.length && Xs(ht), Zs.push(t));
                })(i),
                Wt());
        }
    }
    function oe(t, e, i, n) {
        var r = se(t);
        (Ns &&
            ((r[e] = t.getAttribute(e)), 'src' === e || 'srcset' === e || ('href' === e && 'LINK' === t.nodeName))) ||
            (r[e] !== (r[e] = i) &&
                ('loading' === e && (t[js] = i),
                null == i
                    ? t.removeAttribute(e)
                    : 'string' != typeof i &&
                        (function (t) {
                            var e = Sl.get(t.nodeName);
                            if (e) return e;
                            Sl.set(t.nodeName, (e = []));
                            for (var i, n = t, r = Element.prototype; r !== n; ) {
                                for (var a in (i = gs(n))) i[a].set && e.push(a);
                                n = bs(n);
                            }
                            return e;
                        })(t).includes(e)
                      ? (t[e] = i)
                      : t.setAttribute(e, i)));
    }
    function se(t) {
        return t.__attributes ?? (t.__attributes = { [Ml]: t.nodeName.includes('-'), [kl]: t.namespaceURI === ss });
    }
    function le(t, e) {
        return t === e || t?.[Vs] === e;
    }
    function he(t = {}, e, i, n) {
        return (
            X(() => {
                var n, r;
                return (
                    G(() => {
                        ((n = r),
                            (r = []),
                            Ot(() => {
                                t !== i(...r) && (e(t, ...r), n && le(i(...n), t) && e(null, ...n));
                            }));
                    }),
                    () => {
                        ct(() => {
                            r && le(i(...r), t) && e(null, ...r);
                        });
                    }
                );
            }),
            t
        );
    }
    function ce(t) {
        (null === pl && _(),
            q(() => {
                let e = Ot(t);
                if ('function' == typeof e) return e;
            }));
    }
    function de(t, e, i) {
        if (null == t) return (e(void 0), xs);
        let n = Ot(() => t.subscribe(e, i));
        return n.unsubscribe ? () => n.unsubscribe() : n;
    }
    function ue(t, e = xs) {
        function i(e) {
            if (z(t, e) && ((t = e), r)) {
                let e = !Cl.length;
                for (let e of a) (e[1](), Cl.push(e, t));
                if (e) {
                    for (let t = 0; t < Cl.length; t += 2) Cl[t][0](Cl[t + 1]);
                    Cl.length = 0;
                }
            }
        }
        function n(e) {
            i(e(t));
        }
        let r = null,
            a = new Set();
        return {
            set: i,
            update: n,
            subscribe(o, s = xs) {
                let l = [o, s];
                return (
                    a.add(l),
                    1 === a.size && (r = e(i, n) || xs),
                    o(t),
                    () => {
                        (a.delete(l), 0 === a.size && r && (r(), (r = null)));
                    }
                );
            }
        };
    }
    function fe(t) {
        let e;
        return (de(t, (t) => (e = t))(), e);
    }
    function ge(t) {
        var e;
        return (null == (e = t.ctx) ? void 0 : e.d) ?? 0;
    }
    function pe(t, e, i, n) {
        var r,
            a,
            o = 0 !== (i & Zo),
            s = 0 !== (i & Jo),
            l = 0 !== (i & Qo),
            h = 0;
        s
            ? ([a, h] = (function (t) {
                  var e = Ll;
                  try {
                      return ((Ll = 0), [t(), Ll]);
                  } finally {
                      Ll = e;
                  }
              })(() => t[e]))
            : (a = t[e]);
        var c,
            d = Vs in t || Bs in t,
            u = (s && ((null == (r = fs(t, e)) ? void 0 : r.set) ?? (d && e in t && ((i) => (t[e] = i))))) || void 0,
            f = n,
            g = 1,
            p = 0,
            m = () => ((p = 1), g && ((g = 0), (f = l ? Ot(n) : n)), f);
        if (
            (void 0 === a &&
                void 0 !== n &&
                (u &&
                    (function () {
                        throw Error('https://svelte.dev/e/props_invalid_value');
                    })(),
                (a = m()),
                u && u(a)),
            (c = () => {
                var i = t[e];
                return void 0 === i ? m() : ((g = 1), (p = 0), i);
            }),
            0 === (i & Ko))
        )
            return c;
        if (u) {
            var b = t.$$legacy;
            return function (t, e) {
                return arguments.length > 0 ? ((!e || b || h) && u(e ? c() : t), t) : c();
            };
        }
        var v = 0,
            x = Ft(a),
            y = B(() => {
                var t = c(),
                    e = Tt(x);
                return v ? ((v = 0), e) : (x.v = t);
            });
        return (
            s && Tt(y),
            o || (y.equals = V),
            function (t, e) {
                if (arguments.length > 0) {
                    let i = e ? Tt(y) : s ? E(t) : t;
                    if (!y.equals(i)) {
                        if (((v = 1), zt(x, i), p && void 0 !== f && (f = i), ge(y))) return t;
                        Ot(() => Tt(y));
                    }
                    return t;
                }
                return ge(y) ? y.v : Tt(y);
            }
        );
    }
    function me(t, e, i, n) {
        var r;
        let a = null == (r = i[t]) ? void 0 : r.type;
        if (((e = 'Boolean' === a && 'boolean' != typeof e ? null != e : e), !n || !i[t])) return e;
        if ('toAttribute' === n)
            switch (a) {
                case 'Object':
                case 'Array':
                    return null == e ? null : JSON.stringify(e);
                case 'Boolean':
                    return e ? '' : null;
                case 'Number':
                    return e ?? null;
                default:
                    return e;
            }
        else
            switch (a) {
                case 'Object':
                case 'Array':
                    return e && JSON.parse(e);
                case 'Boolean':
                default:
                    return e;
                case 'Number':
                    return null != e ? +e : e;
            }
    }
    async function be(t, e, i) {
        if (typeof crypto > 'u' || !('subtle' in crypto) || !('digest' in crypto.subtle))
            throw Error(
                'Web Crypto is not available. Secure context is required (https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).'
            );
        return (function (t) {
            return [...new Uint8Array(t)].map((t) => t.toString(16).padStart(2, '0')).join('');
        })(await crypto.subtle.digest(i.toUpperCase(), Ol.encode(t + e)));
    }
    function ve(t, e, i = 'SHA-256', n = 1e6, r = 0) {
        let a = new AbortController(),
            o = Date.now();
        return {
            promise: (async () => {
                for (let s = r; s <= n; s += 1) {
                    if (a.signal.aborted) return null;
                    if ((await be(e, s, i)) === t) return { number: s, took: Date.now() - o };
                }
                return null;
            })(),
            controller: a
        };
    }
    function xe() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {}
    }
    function ye(t, e = 12) {
        let i = new Uint8Array(e);
        for (let n = 0; n < e; n++) ((i[n] = t % 256), (t = Math.floor(t / 256)));
        return i;
    }
    function _e(t, e) {
        'Space' === t.code && (t.preventDefault(), t.stopImmediatePropagation(), e());
    }
    function we(t, e) {
        (t.preventDefault(), e());
    }
    function Me(t, e, i, n, r, a, o, s) {
        var l;
        [Rl.UNVERIFIED, Rl.ERROR, Rl.EXPIRED, Rl.CODE].includes(Tt(e))
            ? 0 != i() && 0 == (null == (l = Tt(n)) ? void 0 : l.reportValidity())
                ? zt(r, 0)
                : a()
                  ? o()
                  : s()
            : zt(r, 1);
    }
    function ke(t, e) {
        function i(t, e) {
            return btoa(
                JSON.stringify({
                    algorithm: t.algorithm,
                    challenge: t.challenge,
                    number: e.number,
                    salt: t.salt,
                    signature: t.signature,
                    test: Gt() ? 1 : void 0,
                    took: e.took
                })
            );
        }
        function n() {
            ht() && Bt() && Tt(De) === Rl.VERIFIED ? et() : K(Rl.EXPIRED, Tt(Ce).expired);
        }
        function r() {
            let t = fetch;
            if (ft())
                if ((l('using customfetch'), 'string' == typeof ft())) {
                    if (((t = globalThis[ft()] || null), !t)) throw Error('Custom fetch function not found: ' + ft());
                } else t = ft();
            return t;
        }
        function a(t, e = [St() || '', document.documentElement.lang || '', ...navigator.languages]) {
            let i = Object.keys(t).map((t) => t.toLowerCase()),
                n = e.reduce(
                    (e, n) => (
                        (n = n.toLowerCase()),
                        e || (t[n] ? n : null) || i.find((t) => n.split('-')[0] === t.split('-')[0]) || null
                    ),
                    null
                );
            return t[n || 'en'];
        }
        function o(t) {
            var e;
            return [
                ...((null == (e = Tt(Fe))
                    ? void 0
                    : e.querySelectorAll(
                          null != t && t.length
                              ? t.map((t) => `input[name="${t}"]`).join(', ')
                              : 'input[type="text"]:not([data-no-spamfilter]), textarea:not([data-no-spamfilter])'
                      )) || [])
            ].reduce((t, e) => {
                let i = e.name,
                    n = e.value;
                return (i && n && (t[i] = /\n/.test(n) ? n.replace(RegExp('(?<!\\r)\\n', 'g'), '\r\n') : n), t);
            }, {});
        }
        function s(t, e) {
            let i = new URL(ht() || location.origin),
                n = new URL(t, i);
            if ((n.search || (n.search = i.search), e)) for (let t in e) null != e[t] && n.searchParams.set(t, e[t]);
            return '' + n;
        }
        function l(...t) {
            (gt() || t.some((t) => t instanceof Error)) &&
                console[t[0] instanceof Error ? 'error' : 'log']('ALTCHA', `[name=${Ct()}]`, ...t);
        }
        function h() {
            zt(je, Il.PAUSED, 1);
        }
        function c(t) {
            zt(je, Il.ERROR, 1);
        }
        function d() {
            zt(je, Il.READY, 1);
        }
        function u() {
            zt(je, Il.LOADING, 1);
        }
        function f() {
            zt(je, Il.PLAYING, 1);
        }
        function g() {
            zt(je, Il.PAUSED, 1);
        }
        function p(t) {
            var e;
            if ((t.preventDefault(), t.stopPropagation(), Tt(Pe))) {
                let n = new FormData(t.target).get('code') + '';
                if (null != (e = Zt()) && e.startsWith('fn:')) {
                    let t = Zt().replace(/^fn:/, '');
                    if ((l(`calling ${t} function instead of verifyurl`), !(t in globalThis)))
                        throw Error(`Global function "${t}" is undefined.`);
                    return globalThis[t]({ challenge: Tt(Pe).challenge, code: n, solution: Tt(Pe).solution });
                }
                (zt(Ne, 1),
                    P(i(Tt(Pe).challenge, Tt(Pe).solution), n)
                        .then(({ reason: t, verified: e }) => {
                            e
                                ? (zt(Pe, null),
                                  Q(Rl.VERIFIED),
                                  l('verified'),
                                  At().then(() => {
                                      var t;
                                      (null == (t = Tt(Ie)) || t.focus(),
                                          ue('verified', { payload: Tt(Ue) }),
                                          'onsubmit' === st() ? D(Tt(ze)) : Rt() && U());
                                  }))
                                : (K(), zt(Ve, t || 'Verification failed', 1));
                        })
                        .catch((t) => {
                            (zt(Pe, null), Q(Rl.ERROR, t), l('sentinel verification failed:', t));
                        })
                        .finally(() => {
                            zt(Ne, 0);
                        }));
            }
        }
        function m(t) {
            var e;
            let i = t.target;
            vt() &&
                i &&
                !Tt(Ae).contains(i) &&
                ((Tt(De) === Rl.VERIFIED && 0 == _t()) ||
                    (Tt(De) === Rl.VERIFIED &&
                        'focus' === _t() &&
                        (null == (e = Tt(Fe)) || !e.matches(':focus-within'))) ||
                    ('off' === st() && Tt(De) === Rl.UNVERIFIED)) &&
                U();
        }
        function b() {
            vt() && Tt(De) !== Rl.UNVERIFIED && X();
        }
        function v(t) {
            Tt(De) === Rl.UNVERIFIED ? et() : vt() && 'focus' === _t() && Tt(De) === Rl.VERIFIED && tt();
        }
        function x(t) {
            var e;
            let i = t.target;
            (null != i && i.hasAttribute('data-code-challenge-form')) ||
                (zt(ze, t.submitter, 1),
                Tt(Fe) && 'onsubmit' === st()
                    ? (null == (e = Tt(ze)) || e.blur(),
                      Tt(De) === Rl.UNVERIFIED
                          ? (t.preventDefault(),
                            t.stopPropagation(),
                            et().then(() => {
                                D(Tt(ze));
                            }))
                          : Tt(De) !== Rl.VERIFIED &&
                            (t.preventDefault(), t.stopPropagation(), Tt(De) === Rl.VERIFYING && w()))
                    : Tt(Fe) &&
                      vt() &&
                      'off' === st() &&
                      Tt(De) === Rl.UNVERIFIED &&
                      (t.preventDefault(), t.stopPropagation(), tt()));
        }
        function y() {
            K();
        }
        function w() {
            Tt(De) === Rl.VERIFYING && Tt(Ce).waitAlert && alert(Tt(Ce).waitAlert);
        }
        function M() {
            Tt(Oe)
                ? Tt(Oe).paused
                    ? ((Tt(Oe).currentTime = 0), Tt(Oe).play())
                    : Tt(Oe).pause()
                : (zt(We, 1),
                  requestAnimationFrame(() => {
                      var t;
                      null == (t = Tt(Oe)) || t.play();
                  }));
        }
        function k() {
            vt() && X();
        }
        function S(t) {
            return JSON.parse(t);
        }
        async function P(t, e) {
            if (!Zt()) throw Error('Attribute verifyurl not set.');
            l('requesting sentinel verification from', Zt());
            let i = { code: e, payload: t };
            Ht() && ((i.fields = Ht().fields ? o() : void 0), (i.timeZone = Ht().timeZone ? xe() : void 0));
            let n = await fetch(Zt(), {
                body: JSON.stringify(i),
                headers: { 'content-type': 'application/json' },
                method: 'POST'
            });
            if (!(n && n instanceof Response)) throw Error('Fetch function did not return a response.');
            if (200 !== n.status) throw Error(`Server responded with ${n.status}.`);
            let r = await n.json();
            return (null != r && r.payload && zt(Ue, r.payload, 1), ue('sentinelverification', r), r);
        }
        function D(t) {
            var e;
            Tt(Fe) && 'requestSubmit' in Tt(Fe)
                ? Tt(Fe).requestSubmit(t)
                : null != (e = Tt(Fe)) && e.reportValidity() && (t ? t.click() : Tt(Fe).submit());
        }
        function A(t) {
            (l('expire', t), Be && (clearTimeout(Be), (Be = null)), t < 1 ? n() : (Be = setTimeout(n, t)));
        }
        function T(t) {
            (l('floating', t),
                vt() !== t && ((Tt(Ae).style.left = ''), (Tt(Ae).style.top = '')),
                vt(1 == t || '' === t ? 'auto' : 0 == t || 'false' === t ? void 0 : vt()),
                vt()
                    ? (st() || st('onsubmit'),
                      document.addEventListener('scroll', b),
                      document.addEventListener('click', m),
                      window.addEventListener('resize', k))
                    : 'onsubmit' === st() && st(void 0));
        }
        function O(t) {
            var e, i;
            if ((l('overlay', t), Rt(t), t)) {
                if (
                    (st() || st('onsubmit'),
                    Tt(Re) && Tt(Ae).parentElement && Tt(Re).replaceWith(Tt(Ae).parentElement),
                    null != (i = null == (e = Tt(Ae)) ? void 0 : e.parentElement) && i.parentElement)
                ) {
                    (zt(Re, document.createElement('div'), 1), Tt(Ae).parentElement.parentElement.appendChild(Tt(Re)));
                    let t = document.createElement('div'),
                        e = document.createElement('button');
                    ((e.type = 'button'),
                        (e.innerHTML = '&times;'),
                        e.addEventListener('click', (t) => {
                            (t.preventDefault(), K());
                        }),
                        Tt(Re).classList.add('altcha-overlay-backdrop'),
                        e.classList.add('altcha-overlay-close-button'),
                        t.classList.add('altcha-overlay'),
                        Tt(Re).append(t),
                        t.append(e),
                        It() && t.append(...document.querySelectorAll(It())),
                        t.append(Tt(Ae).parentElement));
                }
            } else
                Tt(Re) &&
                    Tt(Ae).parentElement &&
                    (Tt(Re).replaceWith(Tt(Ae).parentElement), (Tt(Ae).style.display = 'block'));
        }
        function F(t) {
            if (!t.algorithm) throw Error('Invalid challenge. Property algorithm is missing.');
            if (void 0 === t.signature) throw Error('Invalid challenge. Property signature is missing.');
            if (!le.includes(t.algorithm.toUpperCase()))
                throw Error('Unknown algorithm value. Allowed values: ' + le.join(', '));
            if (!t.challenge || t.challenge.length < 40) throw Error('Challenge is too short. Min. 40 chars.');
            if (!t.salt || t.salt.length < 10) throw Error('Salt is too short. Min. 10 chars.');
        }
        async function z(t) {
            let e = null;
            if ('Worker' in window) {
                try {
                    e = await (async function (
                        t,
                        e = 'number' == typeof Gt() ? Gt() : t.maxNumber || t.maxnumber || Lt(),
                        i = Math.ceil(Kt())
                    ) {
                        let n = [];
                        i = Math.min(16, e, Math.max(1, i));
                        for (let t = 0; t < i; t++) n.push(altchaCreateWorker(te()));
                        let r = Math.ceil(e / i),
                            a = await Promise.all(
                                n.map((e, i) => {
                                    let a = i * r;
                                    return new Promise((i) => {
                                        (e.addEventListener('message', (t) => {
                                            if (t.data) for (let t of n) t !== e && t.postMessage({ type: 'abort' });
                                            i(t.data);
                                        }),
                                            e.postMessage({ payload: t, max: a + r, start: a, type: 'work' }));
                                    });
                                })
                            );
                        for (let t of n) t.terminate();
                        return a.find((t) => !!t) || null;
                    })(t, t.maxNumber || t.maxnumber || Lt());
                } catch (t) {
                    l(t);
                }
                if (void 0 !== e?.number || 'obfuscated' in t) return { data: t, solution: e };
            }
            if ('obfuscated' in t) {
                let e = await (async function (t, e = '', i = 1e6, n = 0) {
                    let r = 'AES-GCM',
                        a = new AbortController(),
                        o = Date.now(),
                        s = null,
                        l = null;
                    try {
                        l = (function (t) {
                            let e = atob(t),
                                i = new Uint8Array(e.length);
                            for (let t = 0; t < e.length; t++) i[t] = e.charCodeAt(t);
                            return i;
                        })(t);
                        let i = await crypto.subtle.digest('SHA-256', Ol.encode(e));
                        s = await crypto.subtle.importKey('raw', i, r, 0, ['decrypt']);
                    } catch {
                        return { promise: Promise.reject(), controller: a };
                    }
                    return {
                        promise: (async () => {
                            for (let t = n; t <= i; t += 1) {
                                if (a.signal.aborted || !s || !l) return null;
                                try {
                                    let e = await crypto.subtle.decrypt({ name: r, iv: ye(t) }, s, l);
                                    if (e) return { clearText: new TextDecoder().decode(e), took: Date.now() - o };
                                } catch {}
                            }
                            return null;
                        })(),
                        controller: a
                    };
                })(t.obfuscated, t.key, t.maxNumber || t.maxnumber);
                return { data: t, solution: await e.promise };
            }
            return {
                data: t,
                solution: await ve(t.challenge, t.salt, t.algorithm, t.maxNumber || t.maxnumber || Lt()).promise
            };
        }
        async function V() {
            if (!Pt()) return void Q(Rl.ERROR);
            let t = He.find((t) => 'obfuscation' === t.constructor.pluginName);
            return t && 'clarify' in t
                ? 'clarify' in t && 'function' == typeof t.clarify
                    ? t.clarify()
                    : void 0
                : (Q(Rl.ERROR),
                  void l('Plugin `obfuscation` not found. Import `altcha/plugins/obfuscation` to load it.'));
        }
        function B(t) {
            (void 0 !== t.obfuscated && Pt(t.obfuscated),
                void 0 !== t.auto && (st(t.auto), 'onload' === st() && (Pt() ? V() : et())),
                void 0 !== t.blockspam && lt(!!t.blockspam),
                void 0 !== t.customfetch && ft(t.customfetch),
                void 0 !== t.floatinganchor && xt(t.floatinganchor),
                void 0 !== t.delay && pt(t.delay),
                void 0 !== t.floatingoffset && yt(t.floatingoffset),
                void 0 !== t.floating && T(t.floating),
                void 0 !== t.expire && (A(t.expire), bt(t.expire)),
                t.challenge &&
                    (dt('string' == typeof t.challenge ? t.challenge : JSON.stringify(t.challenge)), F(Tt(ke))),
                void 0 !== t.challengeurl && ht(t.challengeurl),
                void 0 !== t.debug && gt(!!t.debug),
                void 0 !== t.hidefooter && wt(!!t.hidefooter),
                void 0 !== t.hidelogo && Mt(!!t.hidelogo),
                void 0 !== t.language && Xt(a(ot(), [t.language])),
                void 0 !== t.maxnumber && Lt(+t.maxnumber),
                void 0 !== t.mockerror && Et(!!t.mockerror),
                void 0 !== t.name && Ct(t.name),
                void 0 !== t.overlaycontent && It(t.overlaycontent),
                void 0 !== t.overlay && O(t.overlay),
                void 0 !== t.refetchonexpire && Bt(!!t.refetchonexpire),
                void 0 !== t.sentinel && 'object' == typeof t.sentinel && Ht(t.sentinel),
                void 0 !== t.spamfilter && qt('object' == typeof t.spamfilter ? t.spamfilter : !!t.spamfilter),
                t.strings && Xt('string' == typeof t.strings ? t.strings : JSON.stringify(t.strings)),
                void 0 !== t.test && Gt('number' == typeof t.test ? t.test : !!t.test),
                void 0 !== t.verifyurl && Zt(t.verifyurl),
                void 0 !== t.workers && Kt(+t.workers),
                void 0 !== t.workerurl && te(t.workerurl));
        }
        function N() {
            return {
                auto: st(),
                blockspam: lt(),
                challengeurl: ht(),
                debug: gt(),
                delay: pt(),
                expire: bt(),
                floating: vt(),
                floatinganchor: xt(),
                floatingoffset: yt(),
                hidefooter: wt(),
                hidelogo: Mt(),
                name: Ct(),
                maxnumber: Lt(),
                mockerror: Et(),
                obfuscated: Pt(),
                overlay: Rt(),
                refetchonexpire: Bt(),
                spamfilter: qt(),
                strings: Tt(Ce),
                test: Gt(),
                verifyurl: Zt(),
                workers: Kt(),
                workerurl: te()
            };
        }
        function H() {
            return Tt($e);
        }
        function W() {
            return Tt(De);
        }
        function U() {
            ((Tt(Ae).style.display = 'none'), Rt() && Tt(Re) && (Tt(Re).style.display = 'none'));
        }
        function X(t = 20) {
            var e;
            if (Tt(Ae))
                if (
                    (Tt($e) ||
                        zt(
                            $e,
                            (xt()
                                ? document.querySelector(xt())
                                : null == (e = Tt(Fe))
                                  ? void 0
                                  : e.querySelector(
                                        'input[type="submit"], button[type="submit"], button:not([type="button"]):not([type="reset"])'
                                    )) || Tt(Fe),
                            1
                        ),
                    Tt($e))
                ) {
                    let e = parseInt(yt(), 10) || 12,
                        i = Tt($e).getBoundingClientRect(),
                        n = Tt(Ae).getBoundingClientRect(),
                        r = document.documentElement.clientHeight,
                        a = document.documentElement.clientWidth,
                        o = 'auto' === vt() ? i.bottom + n.height + e + t > r : 'top' === vt(),
                        s = Math.max(t, Math.min(a - t - n.width, i.left + i.width / 2 - n.width / 2));
                    if (
                        ((Tt(Ae).style.top = o ? i.top - (n.height + e) + 'px' : i.bottom + e + 'px'),
                        (Tt(Ae).style.left = s + 'px'),
                        Tt(Ae).setAttribute('data-floating', o ? 'top' : 'bottom'),
                        Tt(Te))
                    ) {
                        let t = Tt(Te).getBoundingClientRect();
                        Tt(Te).style.left = i.left - s + i.width / 2 - t.width / 2 + 'px';
                    }
                } else l('unable to find floating anchor element');
        }
        function K(t = Rl.UNVERIFIED, e = null) {
            (Be && (clearTimeout(Be), (Be = null)),
                zt(Ee, 0),
                zt(Ue, null),
                zt(Pe, null),
                zt(We, 0),
                zt(je, null),
                Q(t, e));
        }
        function J(t) {
            zt($e, t, 1);
        }
        function Q(t, e = null) {
            (zt(De, t, 1), zt(Ve, e, 1), ue('statechange', { payload: Tt(Ue), state: Tt(De) }));
        }
        function tt() {
            ((Tt(Ae).style.display = 'block'), vt() && X(), Rt() && Tt(Re) && (Tt(Re).style.display = 'flex'));
        }
        async function et() {
            return (
                K(Rl.VERIFYING),
                await new Promise((t) => setTimeout(t, pt() || 0)),
                (async function () {
                    var t;
                    if (Et()) throw (l('mocking error'), Error('Mocked error.'));
                    if (Tt(ke)) return (l('using provided json data'), Tt(ke));
                    if (Gt())
                        return (
                            l('generating test challenge', { test: Gt() }),
                            (async function (t, e = 'SHA-256', i = 1e5) {
                                let n = Date.now().toString(16);
                                return (
                                    t || (t = Math.round(Math.random() * i)),
                                    { algorithm: e, challenge: await be(n, t, e), salt: n, signature: '' }
                                );
                            })('boolean' != typeof Gt() ? +Gt() : void 0)
                        );
                    {
                        if (!ht() && Tt(Fe)) {
                            let t = Tt(Fe).getAttribute('action');
                            null != t && t.includes('/form/') && ht(t + '/altcha');
                        }
                        if (!ht()) throw Error('Attribute challengeurl not set.');
                        l('fetching challenge from', ht());
                        let e = {
                                credentials: 'boolean' == typeof ut() ? 'include' : ut(),
                                headers: 0 != qt() ? { 'x-altcha-spam-filter': '1' } : {}
                            },
                            i = await r()(ht(), e);
                        if (!(i && i instanceof Response))
                            throw Error('Custom fetch function did not return a response.');
                        if (200 !== i.status) throw Error(`Server responded with ${i.status}.`);
                        let n = i.headers.get('X-Altcha-Config'),
                            a = await i.json(),
                            o = new URLSearchParams(null == (t = a.salt.split('?')) ? void 0 : t[1]),
                            h = o.get('expires') || o.get('expire');
                        if (h) {
                            let t = new Date(1e3 * +h),
                                e = isNaN(t.getTime()) ? 0 : t.getTime() - Date.now();
                            e > 0 && A(e);
                        }
                        if (n)
                            try {
                                let t = JSON.parse(n);
                                t &&
                                    'object' == typeof t &&
                                    (t.verifyurl && !t.verifyurl.startsWith('fn:') && (t.verifyurl = s(t.verifyurl)),
                                    B(t));
                            } catch (t) {
                                l('unable to configure from X-Altcha-Config', t);
                            }
                        return a;
                    }
                })()
                    .then((t) => (F(t), l('challenge', t), z(t)))
                    .then(({ data: t, solution: e }) => {
                        var n;
                        if ((l('solution', e), !e || (t && 'challenge' in t && !('clearText' in e)))) {
                            if (void 0 === e?.number || !('challenge' in t))
                                throw (
                                    l(
                                        "Unable to find a solution. Ensure that the 'maxnumber' attribute is greater than the randomly generated number."
                                    ),
                                    Error('Unexpected result returned.')
                                );
                            if (Zt() && 'codeChallenge' in t)
                                (['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(
                                    (null == (n = document.activeElement) ? void 0 : n.tagName) || ''
                                ) &&
                                    0 == mt() &&
                                    document.activeElement.blur(),
                                    zt(Pe, { challenge: t, solution: e }, 1));
                            else {
                                if (Zt() && void 0 !== Ht()) return P(i(t, e));
                                if (Zt())
                                    return (async function (t) {
                                        if (!Zt()) throw Error('Attribute verifyurl not set.');
                                        l('requesting server verification from', Zt());
                                        let e = { payload: t };
                                        if (0 != qt()) {
                                            let {
                                                blockedCountries: t,
                                                classifier: i,
                                                disableRules: n,
                                                email: r,
                                                expectedLanguages: a,
                                                expectedCountries: s,
                                                fields: l,
                                                ipAddress: h,
                                                text: c,
                                                timeZone: d
                                            } = 'ipAddress' === qt()
                                                ? {
                                                      blockedCountries: void 0,
                                                      classifier: void 0,
                                                      disableRules: void 0,
                                                      email: 0,
                                                      expectedCountries: void 0,
                                                      expectedLanguages: void 0,
                                                      fields: 0,
                                                      ipAddress: void 0,
                                                      text: void 0,
                                                      timeZone: void 0
                                                  }
                                                : 'object' == typeof qt()
                                                  ? qt()
                                                  : {
                                                        blockedCountries: void 0,
                                                        classifier: void 0,
                                                        disableRules: void 0,
                                                        email: void 0,
                                                        expectedCountries: void 0,
                                                        expectedLanguages: void 0,
                                                        fields: void 0,
                                                        ipAddress: void 0,
                                                        text: void 0,
                                                        timeZone: void 0
                                                    };
                                            ((e.blockedCountries = t),
                                                (e.classifier = i),
                                                (e.disableRules = n),
                                                (e.email =
                                                    0 == r
                                                        ? void 0
                                                        : (function (t) {
                                                              var e, i;
                                                              let n =
                                                                  null == (e = Tt(Fe))
                                                                      ? void 0
                                                                      : e.querySelector(
                                                                            'string' == typeof t
                                                                                ? `input[name="${t}"]`
                                                                                : 'input[type="email"]:not([data-no-spamfilter])'
                                                                        );
                                                              return (
                                                                  (null == (i = n?.value)
                                                                      ? void 0
                                                                      : i.slice(n.value.indexOf('@'))) || void 0
                                                              );
                                                          })(r)),
                                                (e.expectedCountries = s),
                                                (e.expectedLanguages = a || (ge ? [ge] : void 0)),
                                                (e.fields = 0 == l ? void 0 : o(l)),
                                                (e.ipAddress = 0 == h ? void 0 : h || 'auto'),
                                                (e.text = c),
                                                (e.timeZone = 0 == d ? void 0 : d || xe()));
                                        }
                                        let i = await r()(Zt(), {
                                            body: JSON.stringify(e),
                                            headers: { 'content-type': 'application/json' },
                                            method: 'POST'
                                        });
                                        if (!(i && i instanceof Response))
                                            throw Error('Custom fetch function did not return a response.');
                                        if (200 !== i.status) throw Error(`Server responded with ${i.status}.`);
                                        let n = await i.json();
                                        if (
                                            (null != n && n.payload && zt(Ue, n.payload, 1),
                                            ue('serververification', n),
                                            lt() && 'BAD' === n.classification)
                                        )
                                            throw Error('SpamFilter returned negative classification.');
                                    })(i(t, e));
                                (zt(Ue, i(t, e), 1), l('payload', Tt(Ue)));
                            }
                        }
                    })
                    .then(() => {
                        Tt(Pe)
                            ? (Q(Rl.CODE),
                              At().then(() => {
                                  ue('code', { codeChallenge: Tt(Pe) });
                              }))
                            : (Q(Rl.VERIFIED),
                              l('verified'),
                              At().then(() => {
                                  (ue('verified', { payload: Tt(Ue) }), 'onsubmit' === st() ? D(Tt(ze)) : Rt() && U());
                              }));
                    })
                    .catch((t) => {
                        (l(t), Q(Rl.ERROR, t.message));
                    })
            );
        }
        var it, nt;
        jt(e, 1);
        let [rt, at] = (function () {
                let t = {};
                return [
                    t,
                    function () {
                        Y(() => {
                            for (var e in t) t[e].unsubscribe();
                            us(t, El, { enumerable: 0, value: 1 });
                        });
                    }
                ];
            })(),
            ot = () =>
                (function (t, e, i) {
                    let n = i[e] ?? (i[e] = { store: null, source: Ft(void 0), unsubscribe: xs });
                    if (n.store !== t && !(El in i))
                        if ((n.unsubscribe(), (n.store = t ?? null), null == t))
                            ((n.source.v = void 0), (n.unsubscribe = xs));
                        else {
                            var r = 1;
                            ((n.unsubscribe = de(t, (t) => {
                                r ? (n.source.v = t) : zt(n.source, t);
                            })),
                                (r = 0));
                        }
                    return t && El in i ? fe(t) : Tt(n.source);
                })(ie, '$altchaI18nStore', rt),
            st = pe(e, 'auto', 7, void 0),
            lt = pe(e, 'blockspam', 7, void 0),
            ht = pe(e, 'challengeurl', 7, void 0),
            dt = pe(e, 'challengejson', 7, void 0),
            ut = pe(e, 'credentials', 7, void 0),
            ft = pe(e, 'customfetch', 7, void 0),
            gt = pe(e, 'debug', 7, 0),
            pt = pe(e, 'delay', 7, 0),
            mt = pe(e, 'disableautofocus', 7, 0),
            bt = pe(e, 'expire', 7, void 0),
            vt = pe(e, 'floating', 7, void 0),
            xt = pe(e, 'floatinganchor', 7, void 0),
            yt = pe(e, 'floatingoffset', 7, void 0),
            _t = pe(e, 'floatingpersist', 7, 0),
            wt = pe(e, 'hidefooter', 7, 0),
            Mt = pe(e, 'hidelogo', 7, 0),
            kt = pe(e, 'id', 7, void 0),
            St = pe(e, 'language', 7, void 0),
            Ct = pe(e, 'name', 7, 'altcha'),
            Lt = pe(e, 'maxnumber', 7, 1e6),
            Et = pe(e, 'mockerror', 7, 0),
            Pt = pe(e, 'obfuscated', 7, void 0),
            Rt = pe(e, 'overlay', 7, void 0),
            It = pe(e, 'overlaycontent', 7, void 0),
            Vt = pe(e, 'plugins', 7, void 0),
            Bt = pe(e, 'refetchonexpire', 7, 1),
            Ht = pe(e, 'sentinel', 7, void 0),
            qt = pe(e, 'spamfilter', 7, 0),
            Xt = pe(e, 'strings', 7, void 0),
            Gt = pe(e, 'test', 7, 0),
            Zt = pe(e, 'verifyurl', 7, void 0),
            Kt = pe(e, 'workers', 23, () => Math.min(16, navigator.hardwareConcurrency || 8)),
            te = pe(e, 'workerurl', 7, void 0),
            { altchaI18n: ee } = globalThis,
            ie = ee.store,
            le = ['SHA-256', 'SHA-384', 'SHA-512'],
            ue = (t, i) => {
                e.$$host.dispatchEvent(new CustomEvent(t, { detail: i }));
            },
            ge = null == (nt = null == (it = document.documentElement.lang) ? void 0 : it.split('-')) ? void 0 : nt[0],
            me = j(() => {
                var t;
                return (
                    ht() &&
                    new URL(ht(), location.origin).host.endsWith('.altcha.org') &&
                    !(null == (t = ht()) || !t.includes('apiKey=ckey_'))
                );
            }),
            ke = j(() => (dt() ? S(dt()) : void 0)),
            Se = j(() => (Xt() ? S(Xt()) : {})),
            Ce = j(() => ({ ...a(ot()), ...Tt(Se) })),
            Le = j(() => `${kt() || Ct()}_checkbox_${Math.round(1e8 * Math.random())}`),
            Ee = $t(0),
            Pe = $t(null),
            De = $t(E(Rl.UNVERIFIED)),
            Ae = $t(void 0),
            Te = $t(null),
            Oe = $t(null),
            Re = $t(null),
            Ie = $t(null),
            $e = $t(null),
            Fe = $t(null),
            ze = $t(null),
            Ve = $t(null),
            Be = null,
            je = $t(null),
            Ne = $t(0),
            He = [],
            We = $t(0),
            Ue = $t(null);
        (q(() => {
            !(function () {
                for (let t of He) 'function' == typeof t.onErrorChange && t.onErrorChange(Tt(Ve));
            })(Tt(Ve));
        }),
            q(() => {
                !(function () {
                    for (let t of He) 'function' == typeof t.onStateChange && t.onStateChange(Tt(De));
                    (vt() &&
                        Tt(De) !== Rl.UNVERIFIED &&
                        requestAnimationFrame(() => {
                            X();
                        }),
                        zt(Ee, Tt(De) === Rl.VERIFIED),
                        Rt() && Tt(Re) && (Tt(De) !== Rl.UNVERIFIED ? tt() : U()));
                })(Tt(De));
            }),
            (function (t) {
                (null === pl && _(), ce(() => () => Ot(t)));
            })(() => {
                ((function () {
                    for (let t of He) t.destroy();
                })(),
                    zt(ze, null),
                    Tt(Fe) &&
                        (Tt(Fe).removeEventListener('submit', x),
                        Tt(Fe).removeEventListener('reset', y),
                        Tt(Fe).removeEventListener('focusin', v),
                        zt(Fe, null)),
                    Be && (clearTimeout(Be), (Be = null)),
                    document.removeEventListener('click', m),
                    document.removeEventListener('scroll', b),
                    window.removeEventListener('resize', k));
            }),
            ce(() => {
                var t;
                (l('mounted', '2.1.0'),
                    l('workers', Kt()),
                    (function () {
                        let t = void 0 !== Vt() ? Vt().split(',') : void 0;
                        for (let e of globalThis.altchaPlugins)
                            (!t || t.includes(e.pluginName)) &&
                                He.push(
                                    new e({
                                        el: Tt(Ae),
                                        clarify: V,
                                        dispatch: ue,
                                        getConfiguration: N,
                                        getFloatingAnchor: H,
                                        getState: W,
                                        log: l,
                                        reset: K,
                                        solve: z,
                                        setState: Q,
                                        setFloatingAnchor: J,
                                        verify: et
                                    })
                                );
                    })(),
                    l('plugins', He.length ? He.map((t) => t.constructor.pluginName).join(', ') : 'none'),
                    Gt() && l('using test mode'),
                    bt() && A(bt()),
                    void 0 !== st() && l('auto', st()),
                    void 0 !== vt() && T(vt()),
                    zt(Fe, null == (t = Tt(Ae)) ? void 0 : t.closest('form'), 1),
                    Tt(Fe) &&
                        (Tt(Fe).addEventListener('submit', x, { capture: 1 }),
                        Tt(Fe).addEventListener('reset', y),
                        ('onfocus' === st() || 'focus' === _t()) && Tt(Fe).addEventListener('focusin', v)),
                    Rt() && O(1),
                    'onload' === st() && (Pt() ? V() : et()),
                    Tt(me) &&
                        (wt() || Mt()) &&
                        l(
                            'Attributes hidefooter and hidelogo ignored because usage with free API Keys requires attribution.'
                        ),
                    requestAnimationFrame(() => {
                        ue('load');
                    }));
            }));
        var Ye = Kl(),
            qe = I(Ye);
        !(function (t, e, i, n) {
            var r;
            Ns && C();
            var a = null == (r = e.$$slots) ? void 0 : r.default,
                o = 0;
            (1 == a && ((a = e.children), (o = 1)), void 0 === a || a(t, o ? () => n : n));
        })(qe, e, 0, {});
        var Xe = $(qe, 2),
            Ge = R(Xe),
            Ze = R(Ge);
        let Ke;
        var Je = R(Ze),
            Qe = (t) => {
                $l(t);
            };
        ne(Je, (t) => {
            Tt(De) === Rl.VERIFYING && t(Qe);
        });
        var ti = $(Je, 2);
        (ae(ti),
            (ti.__change = [Me, De, qt, Fe, Ee, Pt, V, et]),
            he(
                ti,
                (t) => zt(Ie, t),
                () => Tt(Ie)
            ),
            L(Ze));
        var ei = $(Ze, 2),
            ii = R(ei),
            ni = (t) => {
                var e = Jt();
                (re(I(e), () => Tt(Ce).verified), Qt(t, e));
            },
            ri = (t, e) => {
                var i = (t) => {
                        var e = Jt();
                        (re(I(e), () => Tt(Ce).verifying), Qt(t, e));
                    },
                    n = (t, e) => {
                        var i = (t) => {
                                var e = Jt();
                                (re(I(e), () => Tt(Ce).verificationRequired), Qt(t, e));
                            },
                            n = (t) => {
                                var e = Jt();
                                (re(I(e), () => Tt(Ce).label), Qt(t, e));
                            };
                        ne(
                            t,
                            (t) => {
                                Tt(De) === Rl.CODE ? t(i) : t(n, 0);
                            },
                            e
                        );
                    };
                ne(
                    t,
                    (t) => {
                        Tt(De) === Rl.VERIFYING ? t(i) : t(n, 0);
                    },
                    e
                );
            };
        (ne(ii, (t) => {
            Tt(De) === Rl.VERIFIED ? t(ni) : t(ri, 0);
        }),
            L(ei));
        var ai = $(ei, 2),
            oi = (t) => {
                var e = zl();
                (ae(e),
                    Z(() => {
                        (oe(e, 'name', Ct()),
                            (function (t, e) {
                                var i = se(t);
                                i.value === (i.value = e ?? void 0) ||
                                    (t.value === e && (0 !== e || 'PROGRESS' !== t.nodeName)) ||
                                    (t.value = e ?? '');
                            })(e, Tt(Ue)));
                    }),
                    Qt(t, e));
            };
        ne(ai, (t) => {
            Tt(De) === Rl.VERIFIED && t(oi);
        });
        var si = $(ai, 2),
            li = (t) => {
                var e = Vl(),
                    i = R(e);
                (oe(i, 'href', 'https://altcha.org/'),
                    L(e),
                    Z(() => oe(i, 'aria-label', Tt(Ce).ariaLinkLabel)),
                    Qt(t, e));
            };
        ne(si, (t) => {
            (1 != Mt() || Tt(me)) && t(li);
        });
        var hi = $(si, 2),
            ci = (t) => {
                var e = Ul(),
                    i = $(R(e), 2),
                    n = R(i),
                    r = $(n, 2);
                ((function (t, e) {
                    if (e) {
                        let e = document.body;
                        ((t.autofocus = 1),
                            ct(() => {
                                document.activeElement === e && t.focus();
                            }));
                    }
                })(r, !mt()),
                    (r.__keydown = [_e, M]));
                var a = $(r, 2),
                    o = R(a),
                    l = R(o),
                    m = (t) => {
                        var e = Hl();
                        e.__click = M;
                        var i = R(e),
                            n = (t) => {
                                $l(t, () => 20);
                            },
                            r = (t, e) => {
                                var i = (t) => {
                                        Qt(t, Bl());
                                    },
                                    n = (t, e) => {
                                        var i = (t) => {
                                                Qt(t, jl());
                                            },
                                            n = (t) => {
                                                Qt(t, Nl());
                                            };
                                        ne(
                                            t,
                                            (t) => {
                                                Tt(je) === Il.PLAYING ? t(i) : t(n, 0);
                                            },
                                            e
                                        );
                                    };
                                ne(
                                    t,
                                    (t) => {
                                        Tt(je) === Il.ERROR ? t(i) : t(n, 0);
                                    },
                                    e
                                );
                            };
                        (ne(i, (t) => {
                            Tt(je) === Il.LOADING ? t(n) : t(r, 0);
                        }),
                            L(e),
                            Z(() => {
                                (oe(e, 'title', Tt(Ce).getAudioChallenge),
                                    (e.disabled = Tt(je) === Il.LOADING || Tt(je) === Il.ERROR || Tt(Ne)),
                                    oe(
                                        e,
                                        'aria-label',
                                        Tt(je) === Il.LOADING ? Tt(Ce).loading : Tt(Ce).getAudioChallenge
                                    ));
                            }),
                            Qt(t, e));
                    };
                ne(l, (t) => {
                    Tt(Pe).challenge.codeChallenge.audio && t(m);
                });
                var b = $(l, 2);
                ((b.__click = [we, et]), L(o));
                var v = $(o, 2),
                    x = R(v),
                    y = (t) => {
                        $l(t, () => 16);
                    };
                ne(x, (t) => {
                    Tt(Ne) && t(y);
                });
                var _ = $(x);
                (L(v), L(a));
                var w = $(a, 2),
                    k = (t) => {
                        var e = Wl(),
                            i = R(e);
                        (L(e),
                            he(
                                e,
                                (t) => zt(Oe, t),
                                () => Tt(Oe)
                            ),
                            Z(
                                (t) => oe(i, 'src', t),
                                [() => s(Tt(Pe).challenge.codeChallenge.audio, { language: St() })]
                            ),
                            Yt('loadstart', e, u),
                            Yt('canplay', e, d),
                            Yt('pause', e, g),
                            Yt('playing', e, f),
                            Yt('ended', e, h),
                            Yt('error', i, c),
                            Qt(t, e));
                    };
                (ne(w, (t) => {
                    Tt(Pe).challenge.codeChallenge.audio && Tt(We) && t(k);
                }),
                    L(i),
                    L(e),
                    Z(() => {
                        (oe(e, 'aria-label', Tt(Ce).verificationRequired),
                            oe(n, 'src', Tt(Pe).challenge.codeChallenge.image),
                            oe(r, 'minlength', Tt(Pe).challenge.codeChallenge.length || 1),
                            oe(r, 'maxlength', Tt(Pe).challenge.codeChallenge.length),
                            oe(r, 'placeholder', Tt(Ce).enterCode),
                            oe(
                                r,
                                'aria-label',
                                Tt(je) === Il.LOADING
                                    ? Tt(Ce).loading
                                    : Tt(je) === Il.PLAYING
                                      ? ''
                                      : Tt(Ce).enterCodeAria
                            ),
                            oe(r, 'aria-live', Tt(je) ? 'assertive' : 'polite'),
                            oe(r, 'aria-busy', Tt(je) === Il.LOADING),
                            (r.disabled = Tt(Ne)),
                            oe(b, 'aria-label', Tt(Ce).reload),
                            oe(b, 'title', Tt(Ce).reload),
                            (b.disabled = Tt(Ne)),
                            (v.disabled = Tt(Ne)),
                            oe(v, 'aria-label', Tt(Ce).verify),
                            (function (t, e) {
                                var i = null == e ? '' : 'object' == typeof e ? e + '' : e;
                                i !== (t.__t ?? (t.__t = t.nodeValue)) && ((t.__t = i), (t.nodeValue = i + ''));
                            })(_, ' ' + (Tt(Ce).verify ?? '')));
                    }),
                    Yt('submit', i, p, 1),
                    Qt(t, e));
            };
        (ne(hi, (t) => {
            var e;
            null != (e = Tt(Pe)) && e.challenge.codeChallenge && t(ci);
        }),
            L(Ge));
        var di = $(Ge, 2),
            ui = (t) => {
                var e = Xl(),
                    i = $(R(e), 2),
                    n = (t) => {
                        var e = Yl();
                        (re(R(e), () => Tt(Ce).expired), L(e), Z(() => oe(e, 'title', Tt(Ve))), Qt(t, e));
                    },
                    r = (t) => {
                        var e = ql();
                        (re(R(e), () => Tt(Ce).error), L(e), Z(() => oe(e, 'title', Tt(Ve))), Qt(t, e));
                    };
                (ne(i, (t) => {
                    Tt(De) === Rl.EXPIRED ? t(n) : t(r, 0);
                }),
                    L(e),
                    Qt(t, e));
            };
        ne(di, (t) => {
            (Tt(Ve) || Tt(De) === Rl.EXPIRED) && t(ui);
        });
        var fi = $(di, 2),
            gi = (t) => {
                var e = Gl(),
                    i = R(e);
                (re(R(i), () => Tt(Ce).footer), L(i), L(e), Qt(t, e));
            };
        ne(fi, (t) => {
            Tt(Ce).footer && (1 != wt() || Tt(me)) && t(gi);
        });
        var pi = $(fi, 2),
            mi = (t) => {
                var e = Zl();
                (he(
                    e,
                    (t) => zt(Te, t),
                    () => Tt(Te)
                ),
                    Qt(t, e));
            };
        (ne(pi, (t) => {
            vt() && t(mi);
        }),
            L(Xe),
            he(
                Xe,
                (t) => zt(Ae, t),
                () => Tt(Ae)
            ),
            Z(
                (t) => {
                    (oe(Xe, 'data-state', Tt(De)),
                        oe(Xe, 'data-floating', vt()),
                        oe(Xe, 'data-overlay', Rt()),
                        (Ke = (function (t, e, i, n, r, a) {
                            var o = t.__className;
                            if (Ns || o !== i || void 0 === o) {
                                var s = (function (t, e, i) {
                                    var n = '' + t;
                                    if (i)
                                        for (var r in i)
                                            if (i[r]) n = n ? n + ' ' + r : r;
                                            else if (n.length)
                                                for (var a = r.length, o = 0; (o = n.indexOf(r, o)) >= 0; ) {
                                                    var s = o + a;
                                                    (0 !== o && !wl.includes(n[o - 1])) ||
                                                    (s !== n.length && !wl.includes(n[s]))
                                                        ? (o = s)
                                                        : (n = (0 === o ? '' : n.substring(0, o)) + n.substring(s + 1));
                                                }
                                    return '' === n ? null : n;
                                })(i, 0, a);
                                ((!Ns || s !== t.getAttribute('class')) &&
                                    (null == s ? t.removeAttribute('class') : (t.className = s)),
                                    (t.__className = i));
                            } else if (a && r !== a)
                                for (var l in a) {
                                    var h = !!a[l];
                                    (null == r || h !== !!r[l]) && t.classList.toggle(l, h);
                                }
                            return a;
                        })(Ze, 0, 'altcha-checkbox', 0, Ke, t)),
                        oe(ti, 'id', Tt(Le)),
                        (ti.required = 'onsubmit' !== st() && (!vt() || 'off' !== st())),
                        oe(ei, 'for', Tt(Le)));
                },
                [() => ({ 'altcha-checkbox-verifying': Tt(De) === Rl.VERIFYING })]
            ),
            Yt('invalid', ti, w),
            (function (t, e, i = e) {
                ((function (t, e, i, n = i) {
                    t.addEventListener('change', () => Ut(i));
                    let r = t.__on_r;
                    ((t.__on_r = r
                        ? () => {
                              (r(), n(1));
                          }
                        : () => n(1)),
                        Wt());
                })(t, 0, (e) => {
                    i(e ? t.defaultChecked : t.checked);
                }),
                    ((Ns && t.defaultChecked !== t.checked) || null == Ot(e)) && i(t.checked),
                    G(() => {
                        var i = e();
                        t.checked = !!i;
                    }));
            })(
                ti,
                () => Tt(Ee),
                (t) => zt(Ee, t)
            ),
            Qt(t, Ye));
        var bi = Nt({
            clarify: V,
            configure: B,
            getConfiguration: N,
            getFloatingAnchor: H,
            getPlugin: (t) => He.find((e) => e.constructor.pluginName === t),
            getState: W,
            hide: U,
            repositionFloating: X,
            reset: K,
            setFloatingAnchor: J,
            setState: Q,
            show: tt,
            verify: et,
            get auto() {
                return st();
            },
            set auto(t = void 0) {
                (st(t), Dt());
            },
            get blockspam() {
                return lt();
            },
            set blockspam(t = void 0) {
                (lt(t), Dt());
            },
            get challengeurl() {
                return ht();
            },
            set challengeurl(t = void 0) {
                (ht(t), Dt());
            },
            get challengejson() {
                return dt();
            },
            set challengejson(t = void 0) {
                (dt(t), Dt());
            },
            get credentials() {
                return ut();
            },
            set credentials(t = void 0) {
                (ut(t), Dt());
            },
            get customfetch() {
                return ft();
            },
            set customfetch(t = void 0) {
                (ft(t), Dt());
            },
            get debug() {
                return gt();
            },
            set debug(t = 0) {
                (gt(t), Dt());
            },
            get delay() {
                return pt();
            },
            set delay(t = 0) {
                (pt(t), Dt());
            },
            get disableautofocus() {
                return mt();
            },
            set disableautofocus(t = 0) {
                (mt(t), Dt());
            },
            get expire() {
                return bt();
            },
            set expire(t = void 0) {
                (bt(t), Dt());
            },
            get floating() {
                return vt();
            },
            set floating(t = void 0) {
                (vt(t), Dt());
            },
            get floatinganchor() {
                return xt();
            },
            set floatinganchor(t = void 0) {
                (xt(t), Dt());
            },
            get floatingoffset() {
                return yt();
            },
            set floatingoffset(t = void 0) {
                (yt(t), Dt());
            },
            get floatingpersist() {
                return _t();
            },
            set floatingpersist(t = 0) {
                (_t(t), Dt());
            },
            get hidefooter() {
                return wt();
            },
            set hidefooter(t = 0) {
                (wt(t), Dt());
            },
            get hidelogo() {
                return Mt();
            },
            set hidelogo(t = 0) {
                (Mt(t), Dt());
            },
            get id() {
                return kt();
            },
            set id(t = void 0) {
                (kt(t), Dt());
            },
            get language() {
                return St();
            },
            set language(t = void 0) {
                (St(t), Dt());
            },
            get name() {
                return Ct();
            },
            set name(t = 'altcha') {
                (Ct(t), Dt());
            },
            get maxnumber() {
                return Lt();
            },
            set maxnumber(t = 1e6) {
                (Lt(t), Dt());
            },
            get mockerror() {
                return Et();
            },
            set mockerror(t = 0) {
                (Et(t), Dt());
            },
            get obfuscated() {
                return Pt();
            },
            set obfuscated(t = void 0) {
                (Pt(t), Dt());
            },
            get overlay() {
                return Rt();
            },
            set overlay(t = void 0) {
                (Rt(t), Dt());
            },
            get overlaycontent() {
                return It();
            },
            set overlaycontent(t = void 0) {
                (It(t), Dt());
            },
            get plugins() {
                return Vt();
            },
            set plugins(t = void 0) {
                (Vt(t), Dt());
            },
            get refetchonexpire() {
                return Bt();
            },
            set refetchonexpire(t = 1) {
                (Bt(t), Dt());
            },
            get sentinel() {
                return Ht();
            },
            set sentinel(t = void 0) {
                (Ht(t), Dt());
            },
            get spamfilter() {
                return qt();
            },
            set spamfilter(t = 0) {
                (qt(t), Dt());
            },
            get strings() {
                return Xt();
            },
            set strings(t = void 0) {
                (Xt(t), Dt());
            },
            get test() {
                return Gt();
            },
            set test(t = 0) {
                (Gt(t), Dt());
            },
            get verifyurl() {
                return Zt();
            },
            set verifyurl(t = void 0) {
                (Zt(t), Dt());
            },
            get workers() {
                return Kt();
            },
            set workers(t = Math.min(16, navigator.hardwareConcurrency || 8)) {
                (Kt(t), Dt());
            },
            get workerurl() {
                return te();
            },
            set workerurl(t = void 0) {
                (te(t), Dt());
            }
        });
        return (at(), bi);
    }
    function Se(t, e = '__altcha-css') {
        if (!document.getElementById(e)) {
            let i = document.createElement('style');
            ((i.id = e), (i.textContent = t), document.head.appendChild(i));
        }
    }
    async function Ce() {
        if (
            'true' === mo.sessionStorage.getItem('ignoreDevBanner') ||
            !(await fetch('/api/vars')
                .then((t) => t.json())
                .then((t) => t.isDev)
                .catch(console.error))
        )
            return;
        let t = r(
            'div',
            { id: 'devBanner' },
            [],
            [
                r('p', {
                    innerText:
                        'You are currently viewing a development build of jtoh.pro. Please avoid leaking anything unless you are instructed to do so.'
                })
            ]
        );
        f(await g(), 'afterbegin', t);
    }
    function Le(t) {
        void 0 === Ql[t] && (Ql[t] = 0);
    }
    function Ee(t) {
        return (Le(t), Ql[t]);
    }
    function Pe(t) {
        (Le(t), (Ql[t] = 1));
    }
    function De(t) {
        (Le(t), (Ql[t] = 0));
    }
    async function Ae() {
        await u();
        let t = o('accountSettingsContainer', 'div');
        if (t && ((t.innerHTML = ''), !(await x()).user)) {
            let e = r('p');
            return ((e.innerText = 'You must be logged in to access custom site settings.'), a(t, e));
        }
    }
    function Te(t) {
        return (t + 0.5) | 0;
    }
    function Oe(t) {
        return sh(Te(2.55 * t), 0, 255);
    }
    function Re(t) {
        return sh(Te(255 * t), 0, 255);
    }
    function Ie(t) {
        return sh(Te(t / 2.55) / 100, 0, 1);
    }
    function $e(t) {
        return sh(Te(100 * t), 0, 100);
    }
    function Fe(t, e, i) {
        let n = e * Math.min(i, 1 - i),
            r = (e, r = (e + t / 30) % 12) => i - n * Math.max(Math.min(r - 3, 9 - r, 1), -1);
        return [r(0), r(8), r(4)];
    }
    function ze(t, e, i) {
        let n = (n, r = (n + t / 60) % 6) => i - i * e * Math.max(Math.min(r, 4 - r, 1), 0);
        return [n(5), n(3), n(1)];
    }
    function Ve(t, e, i) {
        let n,
            r = Fe(t, 1, 0.5);
        for (e + i > 1 && ((n = 1 / (e + i)), (e *= n), (i *= n)), n = 0; n < 3; n++)
            ((r[n] *= 1 - e - i), (r[n] += e));
        return r;
    }
    function Be(t) {
        let e,
            i,
            n,
            r = t.r / 255,
            a = t.g / 255,
            o = t.b / 255,
            s = Math.max(r, a, o),
            l = Math.min(r, a, o),
            h = (s + l) / 2;
        return (
            s !== l &&
                ((n = s - l),
                (i = h > 0.5 ? n / (2 - s - l) : n / (s + l)),
                (e = (function (t, e, i, n, r) {
                    return t === r ? (e - i) / n + (e < i ? 6 : 0) : e === r ? (i - t) / n + 2 : (t - e) / n + 4;
                })(r, a, o, n, s)),
                (e = 60 * e + 0.5)),
            [0 | e, i || 0, h]
        );
    }
    function je(t, e, i, n) {
        return (Array.isArray(e) ? t(e[0], e[1], e[2]) : t(e, i, n)).map(Re);
    }
    function Ne(t, e, i) {
        return je(Fe, t, e, i);
    }
    function He(t) {
        return ((t % 360) + 360) % 360;
    }
    function We(t, e, i) {
        if (t) {
            let n = Be(t);
            ((n[e] = Math.max(0, Math.min(n[e] + n[e] * i, 0 === e ? 360 : 1))),
                (n = Ne(n)),
                (t.r = n[0]),
                (t.g = n[1]),
                (t.b = n[2]));
        }
    }
    function Ue(t, e) {
        return t && Object.assign(e || {}, t);
    }
    function Ye(t) {
        var e = { r: 0, g: 0, b: 0, a: 255 };
        return (
            Array.isArray(t)
                ? t.length >= 3 && ((e = { r: t[0], g: t[1], b: t[2], a: 255 }), t.length > 3 && (e.a = Re(t[3])))
                : ((e = Ue(t, { r: 0, g: 0, b: 0, a: 1 })).a = Re(e.a)),
            e
        );
    }
    function qe() {}
    function Xe(t) {
        return null == t;
    }
    function Ge(t) {
        if (Array.isArray && Array.isArray(t)) return 1;
        let e = {}.toString.call(t);
        return '[object' === e.slice(0, 7) && 'Array]' === e.slice(-6);
    }
    function Ze(t) {
        return null !== t && '[object Object]' === {}.toString.call(t);
    }
    function Ke(t) {
        return ('number' == typeof t || t instanceof Number) && isFinite(+t);
    }
    function Je(t, e) {
        return Ke(t) ? t : e;
    }
    function Qe(t, e) {
        return typeof t > 'u' ? e : t;
    }
    function ti(t, e, i) {
        if (t && 'function' == typeof t.call) return t.apply(i, e);
    }
    function ei(t, e, i, n) {
        let r, a, o;
        if (Ge(t))
            if (((a = t.length), n)) for (r = a - 1; r >= 0; r--) e.call(i, t[r], r);
            else for (r = 0; r < a; r++) e.call(i, t[r], r);
        else if (Ze(t)) for (o = Object.keys(t), a = o.length, r = 0; r < a; r++) e.call(i, t[o[r]], o[r]);
    }
    function ii(t, e) {
        let i, n, r, a;
        if (!t || !e || t.length !== e.length) return 0;
        for (i = 0, n = t.length; i < n; ++i)
            if (((r = t[i]), (a = e[i]), r.datasetIndex !== a.datasetIndex || r.index !== a.index)) return 0;
        return 1;
    }
    function ni(t) {
        if (Ge(t)) return t.map(ni);
        if (Ze(t)) {
            let e = Object.create(null),
                i = Object.keys(t),
                n = i.length,
                r = 0;
            for (; r < n; ++r) e[i[r]] = ni(t[i[r]]);
            return e;
        }
        return t;
    }
    function ri(t) {
        return -1 === ['__proto__', 'prototype', 'constructor'].indexOf(t);
    }
    function ai(t, e, i, n) {
        if (!ri(t)) return;
        let r = e[t],
            a = i[t];
        Ze(r) && Ze(a) ? oi(r, a, n) : (e[t] = ni(a));
    }
    function oi(t, e, i) {
        let n = Ge(e) ? e : [e],
            r = n.length;
        if (!Ze(t)) return t;
        let a,
            o = (i = i || {}).merger || ai;
        for (let e = 0; e < r; ++e) {
            if (((a = n[e]), !Ze(a))) continue;
            let r = Object.keys(a);
            for (let e = 0, n = r.length; e < n; ++e) o(r[e], t, a, i);
        }
        return t;
    }
    function si(t, e) {
        return oi(t, e, { merger: li });
    }
    function li(t, e, i) {
        if (!ri(t)) return;
        let n = e[t],
            r = i[t];
        Ze(n) && Ze(r) ? si(n, r) : {}.hasOwnProperty.call(e, t) || (e[t] = ni(r));
    }
    function hi(t, e) {
        return (
            Ch[e] ||
            (Ch[e] = (function (t) {
                let e = (function (t) {
                    let e = t.split('.'),
                        i = [],
                        n = '';
                    for (let t of e) ((n += t), n.endsWith('\\') ? (n = n.slice(0, -1) + '.') : (i.push(n), (n = '')));
                    return i;
                })(t);
                return (t) => {
                    for (let i of e) {
                        if ('' === i) break;
                        t = t && t[i];
                    }
                    return t;
                };
            })(e))
        )(t);
    }
    function ci(t) {
        return t.charAt(0).toUpperCase() + t.slice(1);
    }
    function di(t, e, i) {
        return Math.abs(t - e) < i;
    }
    function ui(t) {
        let e = Math.round(t);
        t = di(t, e, t / 1e3) ? e : t;
        let i = Math.pow(10, Math.floor(zh(t))),
            n = t / i;
        return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * i;
    }
    function fi(t) {
        return (
            !(function (t) {
                return (
                    'symbol' == typeof t ||
                    ('object' == typeof t &&
                        null !== t &&
                        !(Symbol.toPrimitive in t || 'toString' in t || 'valueOf' in t))
                );
            })(t) &&
            !isNaN(parseFloat(t)) &&
            isFinite(t)
        );
    }
    function gi(t, e, i) {
        let n, r, a;
        for (n = 0, r = t.length; n < r; n++)
            ((a = t[n][i]), isNaN(a) || ((e.min = Math.min(e.min, a)), (e.max = Math.max(e.max, a))));
    }
    function pi(t) {
        return t * (Dh / 180);
    }
    function mi(t) {
        return t * (180 / Dh);
    }
    function bi(t) {
        if (!Ke(t)) return;
        let e = 1,
            i = 0;
        for (; Math.round(t * e) / e !== t; ) ((e *= 10), i++);
        return i;
    }
    function vi(t, e) {
        let i = e.x - t.x,
            n = e.y - t.y,
            r = Math.sqrt(i * i + n * n),
            a = Math.atan2(n, i);
        return (a < -0.5 * Dh && (a += Ah), { angle: a, distance: r });
    }
    function xi(t, e) {
        return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2));
    }
    function yi(t, e) {
        return ((t - e + Th) % Ah) - Dh;
    }
    function _i(t) {
        return ((t % Ah) + Ah) % Ah;
    }
    function wi(t, e, i, n) {
        let r = _i(t),
            a = _i(e),
            o = _i(i),
            s = _i(a - r),
            l = _i(o - r),
            h = _i(r - a),
            c = _i(r - o);
        return r === a || r === o || (n && a === o) || (s > l && h < c);
    }
    function Mi(t, e, i) {
        return Math.max(e, Math.min(i, t));
    }
    function ki(t, e, i, n = 1e-6) {
        return t >= Math.min(e, i) - n && t <= Math.max(e, i) + n;
    }
    function Si(t, e, i) {
        i = i || ((i) => t[i] < e);
        let n,
            r = t.length - 1,
            a = 0;
        for (; r - a > 1; ) ((n = (a + r) >> 1), i(n) ? (a = n) : (r = n));
        return { lo: a, hi: r };
    }
    function Ci(t, e) {
        let i = t._chartjs;
        if (!i) return;
        let n = i.listeners,
            r = n.indexOf(e);
        (-1 !== r && n.splice(r, 1),
            !(n.length > 0) &&
                (Nh.forEach((e) => {
                    delete t[e];
                }),
                delete t._chartjs));
    }
    function Li(t) {
        let e = new Set(t);
        return e.size === t.length ? t : Array.from(e);
    }
    function Ei(t, e) {
        let i = [],
            n = 0;
        return function (...r) {
            ((i = r),
                n ||
                    ((n = 1),
                    Hh.call(window, () => {
                        ((n = 0), t.apply(e, i));
                    })));
        };
    }
    function Pi(t, e, i) {
        let n = e.length,
            r = 0,
            a = n;
        if (t._sorted) {
            let { iScale: o, vScale: s, _parsed: l } = t,
                h = t.dataset && t.dataset.options ? t.dataset.options.spanGaps : null,
                c = o.axis,
                { min: d, max: u, minDefined: f, maxDefined: g } = o.getUserBounds();
            if (f) {
                if (((r = Math.min(Bh(l, c, d).lo, i ? n : Bh(e, c, o.getPixelForValue(d)).lo)), h)) {
                    let t = l
                        .slice(0, r + 1)
                        .reverse()
                        .findIndex((t) => !Xe(t[s.axis]));
                    r -= Math.max(0, t);
                }
                r = Mi(r, 0, n - 1);
            }
            if (g) {
                let t = Math.max(Bh(l, o.axis, u, 1).hi + 1, i ? 0 : Bh(e, c, o.getPixelForValue(u), 1).hi + 1);
                if (h) {
                    let e = l.slice(t - 1).findIndex((t) => !Xe(t[s.axis]));
                    t += Math.max(0, e);
                }
                a = Mi(t, r, n) - r;
            } else a = n - r;
        }
        return { start: r, count: a };
    }
    function Di(t) {
        let { xScale: e, yScale: i, _scaleRanges: n } = t,
            r = { xmin: e.min, xmax: e.max, ymin: i.min, ymax: i.max };
        if (!n) return ((t._scaleRanges = r), 1);
        let a = n.xmin !== e.min || n.xmax !== e.max || n.ymin !== i.min || n.ymax !== i.max;
        return (Object.assign(n, r), a);
    }
    function Ai(t) {
        if (t && 'object' == typeof t) {
            let e = '' + t;
            return '[object CanvasPattern]' === e || '[object CanvasGradient]' === e;
        }
        return 0;
    }
    function Ti(t) {
        return Ai(t) ? t : new wh(t);
    }
    function Oi(t) {
        return Ai(t) ? t : new wh(t).saturate(0.5).darken(0.1).hexString();
    }
    function Ri(t) {
        (t.set('animation', {
            delay: void 0,
            duration: 1e3,
            easing: 'easeOutQuart',
            fn: void 0,
            from: void 0,
            loop: void 0,
            to: void 0,
            type: void 0
        }),
            t.describe('animation', {
                _fallback: 0,
                _indexable: 0,
                _scriptable: (t) => 'onProgress' !== t && 'onComplete' !== t && 'fn' !== t
            }),
            t.set('animations', {
                colors: { type: 'color', properties: Jh },
                numbers: { type: 'number', properties: Kh }
            }),
            t.describe('animations', { _fallback: 'animation' }),
            t.set('transitions', {
                active: { animation: { duration: 400 } },
                resize: { animation: { duration: 0 } },
                show: { animations: { colors: { from: 'transparent' }, visible: { type: 'boolean', duration: 0 } } },
                hide: {
                    animations: {
                        colors: { to: 'transparent' },
                        visible: { type: 'boolean', easing: 'linear', fn: (t) => 0 | t }
                    }
                }
            }));
    }
    function Ii(t) {
        t.set('layout', { autoPadding: 1, padding: { top: 0, right: 0, bottom: 0, left: 0 } });
    }
    function $i(t, e, i) {
        return (function (t, e) {
            let i = t + JSON.stringify((e = e || {})),
                n = Qh.get(i);
            return (n || ((n = new Intl.NumberFormat(t, e)), Qh.set(i, n)), n);
        })(e, i).format(t);
    }
    function Fi(t) {
        (t.set('scale', {
            display: 1,
            offset: 0,
            reverse: 0,
            beginAtZero: 0,
            bounds: 'ticks',
            clip: 1,
            grace: 0,
            grid: {
                display: 1,
                lineWidth: 1,
                drawOnChartArea: 1,
                drawTicks: 1,
                tickLength: 8,
                tickWidth: (t, e) => e.lineWidth,
                tickColor: (t, e) => e.color,
                offset: 0
            },
            border: { display: 1, dash: [], dashOffset: 0, width: 1 },
            title: { display: 0, text: '', padding: { top: 4, bottom: 4 } },
            ticks: {
                minRotation: 0,
                maxRotation: 50,
                mirror: 0,
                textStrokeWidth: 0,
                textStrokeColor: '',
                padding: 3,
                display: 1,
                autoSkip: 1,
                autoSkipPadding: 3,
                labelOffset: 0,
                callback: ec.formatters.values,
                minor: {},
                major: {},
                align: 'center',
                crossAlign: 'near',
                showLabelBackdrop: 0,
                backdropColor: 'rgba(255, 255, 255, 0.75)',
                backdropPadding: 2
            }
        }),
            t.route('scale.ticks', 'color', '', 'color'),
            t.route('scale.grid', 'color', '', 'borderColor'),
            t.route('scale.border', 'color', '', 'borderColor'),
            t.route('scale.title', 'color', '', 'color'),
            t.describe('scale', {
                _fallback: 0,
                _scriptable: (t) =>
                    !t.startsWith('before') && !t.startsWith('after') && 'callback' !== t && 'parser' !== t,
                _indexable: (t) => 'borderDash' !== t && 'tickBorderDash' !== t && 'dash' !== t
            }),
            t.describe('scales', { _fallback: 'scale' }),
            t.describe('scale.ticks', {
                _scriptable: (t) => 'backdropPadding' !== t && 'callback' !== t,
                _indexable: (t) => 'backdropPadding' !== t
            }));
    }
    function zi(t, e) {
        if (!e) return t;
        let i = e.split('.');
        for (let e = 0, n = i.length; e < n; ++e) {
            let n = i[e];
            t = t[n] || (t[n] = Object.create(null));
        }
        return t;
    }
    function Vi(t, e, i) {
        return 'string' == typeof e ? oi(zi(t, e), i) : oi(zi(t, ''), e);
    }
    function Bi(t, e, i, n, r) {
        let a = e[r];
        return (a || ((a = e[r] = t.measureText(r).width), i.push(r)), a > n && (n = a), n);
    }
    function ji(t, e, i, n) {
        let r = ((n = n || {}).data = n.data || {}),
            a = (n.garbageCollect = n.garbageCollect || []);
        (n.font !== e && ((r = n.data = {}), (a = n.garbageCollect = []), (n.font = e)), t.save(), (t.font = e));
        let o,
            s,
            l,
            h,
            c,
            d = 0,
            u = i.length;
        for (o = 0; o < u; o++)
            if (((h = i[o]), null == h || Ge(h))) {
                if (Ge(h))
                    for (s = 0, l = h.length; s < l; s++) ((c = h[s]), null != c && !Ge(c) && (d = Bi(t, r, a, d, c)));
            } else d = Bi(t, r, a, d, h);
        t.restore();
        let f = a.length / 2;
        if (f > i.length) {
            for (o = 0; o < f; o++) delete r[a[o]];
            a.splice(0, f);
        }
        return d;
    }
    function Ni(t, e, i) {
        let n = t.currentDevicePixelRatio,
            r = 0 !== i ? Math.max(i / 2, 0.5) : 0;
        return Math.round((e - r) * n) / n + r;
    }
    function Hi(t, e) {
        (!e && !t) ||
            ((e = e || t.getContext('2d')).save(),
            e.resetTransform(),
            e.clearRect(0, 0, t.width, t.height),
            e.restore());
    }
    function Wi(t, e, i, n) {
        Ui(t, e, i, n, null);
    }
    function Ui(t, e, i, n, r) {
        let a,
            o,
            s,
            l,
            h,
            c,
            d,
            u,
            f = e.pointStyle,
            g = e.rotation,
            p = e.radius,
            m = (g || 0) * Rh;
        if (
            f &&
            'object' == typeof f &&
            ((a = '' + f), '[object HTMLImageElement]' === a || '[object HTMLCanvasElement]' === a)
        )
            return (
                t.save(),
                t.translate(i, n),
                t.rotate(m),
                t.drawImage(f, -f.width / 2, -f.height / 2, f.width, f.height),
                void t.restore()
            );
        if (!(isNaN(p) || p <= 0)) {
            switch ((t.beginPath(), f)) {
                default:
                    (r ? t.ellipse(i, n, r / 2, p, 0, 0, Ah) : t.arc(i, n, p, 0, Ah), t.closePath());
                    break;
                case 'triangle':
                    ((c = r ? r / 2 : p),
                        t.moveTo(i + Math.sin(m) * c, n - Math.cos(m) * p),
                        (m += Fh),
                        t.lineTo(i + Math.sin(m) * c, n - Math.cos(m) * p),
                        (m += Fh),
                        t.lineTo(i + Math.sin(m) * c, n - Math.cos(m) * p),
                        t.closePath());
                    break;
                case 'rectRounded':
                    ((h = 0.516 * p),
                        (l = p - h),
                        (o = Math.cos(m + $h) * l),
                        (d = Math.cos(m + $h) * (r ? r / 2 - h : l)),
                        (s = Math.sin(m + $h) * l),
                        (u = Math.sin(m + $h) * (r ? r / 2 - h : l)),
                        t.arc(i - d, n - s, h, m - Dh, m - Ih),
                        t.arc(i + u, n - o, h, m - Ih, m),
                        t.arc(i + d, n + s, h, m, m + Ih),
                        t.arc(i - u, n + o, h, m + Ih, m + Dh),
                        t.closePath());
                    break;
                case 'rect':
                    if (!g) {
                        ((l = Math.SQRT1_2 * p), (c = r ? r / 2 : l), t.rect(i - c, n - l, 2 * c, 2 * l));
                        break;
                    }
                    m += $h;
                case 'rectRot':
                    ((d = Math.cos(m) * (r ? r / 2 : p)),
                        (o = Math.cos(m) * p),
                        (s = Math.sin(m) * p),
                        (u = Math.sin(m) * (r ? r / 2 : p)),
                        t.moveTo(i - d, n - s),
                        t.lineTo(i + u, n - o),
                        t.lineTo(i + d, n + s),
                        t.lineTo(i - u, n + o),
                        t.closePath());
                    break;
                case 'crossRot':
                    m += $h;
                case 'cross':
                    ((d = Math.cos(m) * (r ? r / 2 : p)),
                        (o = Math.cos(m) * p),
                        (s = Math.sin(m) * p),
                        (u = Math.sin(m) * (r ? r / 2 : p)),
                        t.moveTo(i - d, n - s),
                        t.lineTo(i + d, n + s),
                        t.moveTo(i + u, n - o),
                        t.lineTo(i - u, n + o));
                    break;
                case 'star':
                    ((d = Math.cos(m) * (r ? r / 2 : p)),
                        (o = Math.cos(m) * p),
                        (s = Math.sin(m) * p),
                        (u = Math.sin(m) * (r ? r / 2 : p)),
                        t.moveTo(i - d, n - s),
                        t.lineTo(i + d, n + s),
                        t.moveTo(i + u, n - o),
                        t.lineTo(i - u, n + o),
                        (m += $h),
                        (d = Math.cos(m) * (r ? r / 2 : p)),
                        (o = Math.cos(m) * p),
                        (s = Math.sin(m) * p),
                        (u = Math.sin(m) * (r ? r / 2 : p)),
                        t.moveTo(i - d, n - s),
                        t.lineTo(i + d, n + s),
                        t.moveTo(i + u, n - o),
                        t.lineTo(i - u, n + o));
                    break;
                case 'line':
                    ((o = r ? r / 2 : Math.cos(m) * p),
                        (s = Math.sin(m) * p),
                        t.moveTo(i - o, n - s),
                        t.lineTo(i + o, n + s));
                    break;
                case 'dash':
                    (t.moveTo(i, n), t.lineTo(i + Math.cos(m) * (r ? r / 2 : p), n + Math.sin(m) * p));
                    break;
                case 0:
                    t.closePath();
            }
            (t.fill(), e.borderWidth > 0 && t.stroke());
        }
    }
    function Yi(t, e, i) {
        return (
            (i = i || 0.5),
            !e || (t && t.x > e.left - i && t.x < e.right + i && t.y > e.top - i && t.y < e.bottom + i)
        );
    }
    function qi(t, e) {
        (t.save(), t.beginPath(), t.rect(e.left, e.top, e.right - e.left, e.bottom - e.top), t.clip());
    }
    function Xi(t) {
        t.restore();
    }
    function Gi(t, e, i, n, r) {
        if (!e) return t.lineTo(i.x, i.y);
        if ('middle' === r) {
            let n = (e.x + i.x) / 2;
            (t.lineTo(n, e.y), t.lineTo(n, i.y));
        } else ('after' === r) != !!n ? t.lineTo(e.x, i.y) : t.lineTo(i.x, e.y);
        t.lineTo(i.x, i.y);
    }
    function Zi(t, e, i, n) {
        if (!e) return t.lineTo(i.x, i.y);
        t.bezierCurveTo(n ? e.cp1x : e.cp2x, n ? e.cp1y : e.cp2y, n ? i.cp2x : i.cp1x, n ? i.cp2y : i.cp1y, i.x, i.y);
    }
    function Ki(t, e, i, n, r) {
        if (r.strikethrough || r.underline) {
            let a = t.measureText(n),
                o = e - a.actualBoundingBoxLeft,
                s = e + a.actualBoundingBoxRight,
                l = i + a.actualBoundingBoxDescent,
                h = r.strikethrough ? (i - a.actualBoundingBoxAscent + l) / 2 : l;
            ((t.strokeStyle = t.fillStyle),
                t.beginPath(),
                (t.lineWidth = r.decorationWidth || 2),
                t.moveTo(o, h),
                t.lineTo(s, h),
                t.stroke());
        }
    }
    function Ji(t, e) {
        let i = t.fillStyle;
        ((t.fillStyle = e.color), t.fillRect(e.left, e.top, e.width, e.height), (t.fillStyle = i));
    }
    function Qi(t, e, i, n, r, a = {}) {
        let o,
            s,
            l = Ge(e) ? e : [e],
            h = a.strokeWidth > 0 && '' !== a.strokeColor;
        for (
            t.save(),
                t.font = r.string,
                (function (t, e) {
                    (e.translation && t.translate(e.translation[0], e.translation[1]),
                        Xe(e.rotation) || t.rotate(e.rotation),
                        e.color && (t.fillStyle = e.color),
                        e.textAlign && (t.textAlign = e.textAlign),
                        e.textBaseline && (t.textBaseline = e.textBaseline));
                })(t, a),
                o = 0;
            o < l.length;
            ++o
        )
            ((s = l[o]),
                a.backdrop && Ji(t, a.backdrop),
                h &&
                    (a.strokeColor && (t.strokeStyle = a.strokeColor),
                    Xe(a.strokeWidth) || (t.lineWidth = a.strokeWidth),
                    t.strokeText(s, i, n, a.maxWidth)),
                t.fillText(s, i, n, a.maxWidth),
                Ki(t, i, n, s, a),
                (n += +r.lineHeight));
        t.restore();
    }
    function tn(t, e) {
        let { x: i, y: n, w: r, h: a, radius: o } = e;
        (t.arc(i + o.topLeft, n + o.topLeft, o.topLeft, 1.5 * Dh, Dh, 1),
            t.lineTo(i, n + a - o.bottomLeft),
            t.arc(i + o.bottomLeft, n + a - o.bottomLeft, o.bottomLeft, Dh, Ih, 1),
            t.lineTo(i + r - o.bottomRight, n + a),
            t.arc(i + r - o.bottomRight, n + a - o.bottomRight, o.bottomRight, Ih, 0, 1),
            t.lineTo(i + r, n + o.topRight),
            t.arc(i + r - o.topRight, n + o.topRight, o.topRight, 0, -Ih, 1),
            t.lineTo(i + o.topLeft, n));
    }
    function en(t, e) {
        let i = ('' + t).match(oc);
        if (!i || 'normal' === i[1]) return 1.2 * e;
        switch (((t = +i[2]), i[3])) {
            case 'px':
                return t;
            case '%':
                t /= 100;
        }
        return e * t;
    }
    function nn(t, e) {
        let i = {},
            n = Ze(e),
            r = n ? Object.keys(e) : e,
            a = Ze(t) ? (n ? (i) => Qe(t[i], t[e[i]]) : (e) => t[e]) : () => t;
        for (let t of r) i[t] = lc(a(t));
        return i;
    }
    function rn(t) {
        return nn(t, { top: 'y', right: 'x', bottom: 'y', left: 'x' });
    }
    function an(t) {
        return nn(t, ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']);
    }
    function on(t) {
        let e = rn(t);
        return ((e.width = e.left + e.right), (e.height = e.top + e.bottom), e);
    }
    function sn(t, e) {
        let i = Qe((t = t || {}).size, (e = e || ac.font).size);
        'string' == typeof i && (i = parseInt(i, 10));
        let n = Qe(t.style, e.style);
        n && !('' + n).match(sc) && (console.warn('Invalid font style specified: "' + n + '"'), (n = void 0));
        let r = {
            family: Qe(t.family, e.family),
            lineHeight: en(Qe(t.lineHeight, e.lineHeight), i),
            size: i,
            style: n,
            weight: Qe(t.weight, e.weight),
            string: ''
        };
        return (
            (r.string = (function (t) {
                return !t || Xe(t.size) || Xe(t.family)
                    ? null
                    : (t.style ? t.style + ' ' : '') + (t.weight ? t.weight + ' ' : '') + t.size + 'px ' + t.family;
            })(r)),
            r
        );
    }
    function ln(t, e, i, n) {
        let r,
            a,
            o,
            s = 1;
        for (r = 0, a = t.length; r < a; ++r)
            if (
                ((o = t[r]),
                void 0 !== o &&
                    (void 0 !== e && 'function' == typeof o && ((o = o(e)), (s = 0)),
                    void 0 !== i && Ge(o) && ((o = o[i % o.length]), (s = 0)),
                    void 0 !== o))
            )
                return (n && !s && (n.cacheable = 0), o);
    }
    function hn(t, e) {
        return Object.assign(Object.create(t), e);
    }
    function cn(t, e = [''], i, n, r = () => t[0]) {
        let a = i || t;
        typeof n > 'u' && (n = vn('_fallback', t));
        let o = {
            [Symbol.toStringTag]: 'Object',
            _cacheable: 1,
            _scopes: t,
            _rootScopes: a,
            _fallback: n,
            _getTarget: r,
            override: (i) => cn([i, ...t], e, a, n)
        };
        return new Proxy(o, {
            deleteProperty(e, i) {
                return (delete e[i], delete e._keys, delete t[0][i], 1);
            },
            get(i, n) {
                return fn(i, n, () =>
                    (function (t, e, i, n) {
                        let r;
                        for (let a of e)
                            if (((r = vn(hc(a, t), i)), typeof r < 'u')) return cc(t, r) ? mn(i, n, t, r) : r;
                    })(n, e, t, i)
                );
            },
            getOwnPropertyDescriptor(t, e) {
                return Reflect.getOwnPropertyDescriptor(t._scopes[0], e);
            },
            getPrototypeOf() {
                return Reflect.getPrototypeOf(t[0]);
            },
            has(t, e) {
                return xn(t).includes(e);
            },
            ownKeys(t) {
                return xn(t);
            },
            set(t, e, i) {
                let n = t._storage || (t._storage = r());
                return ((t[e] = n[e] = i), delete t._keys, 1);
            }
        });
    }
    function dn(t, e, i, n) {
        let r = {
            _cacheable: 0,
            _proxy: t,
            _context: e,
            _subProxy: i,
            _stack: new Set(),
            _descriptors: un(t, n),
            setContext: (e) => dn(t, e, i, n),
            override: (r) => dn(t.override(r), e, i, n)
        };
        return new Proxy(r, {
            deleteProperty(e, i) {
                return (delete e[i], delete t[i], 1);
            },
            get(t, e, i) {
                return fn(t, e, () =>
                    (function (t, e, i) {
                        let { _proxy: n, _context: r, _subProxy: a, _descriptors: o } = t,
                            s = n[e];
                        return (
                            Eh(s) &&
                                o.isScriptable(e) &&
                                (s = (function (t, e, i, n) {
                                    let { _proxy: r, _context: a, _subProxy: o, _stack: s } = i;
                                    if (s.has(t))
                                        throw Error('Recursion detected: ' + Array.from(s).join('->') + '->' + t);
                                    s.add(t);
                                    let l = e(a, o || n);
                                    return (s.delete(t), cc(t, l) && (l = mn(r._scopes, r, t, l)), l);
                                })(e, s, t, i)),
                            Ge(s) &&
                                s.length &&
                                (s = (function (t, e, i, n) {
                                    let { _proxy: r, _context: a, _subProxy: o, _descriptors: s } = i;
                                    if (typeof a.index < 'u' && n(t)) return e[a.index % e.length];
                                    if (Ze(e[0])) {
                                        let i = e,
                                            n = r._scopes.filter((t) => t !== i);
                                        e = [];
                                        for (let l of i) {
                                            let i = mn(n, r, t, l);
                                            e.push(dn(i, a, o && o[t], s));
                                        }
                                    }
                                    return e;
                                })(e, s, t, o.isIndexable)),
                            cc(e, s) && (s = dn(s, r, a && a[e], o)),
                            s
                        );
                    })(t, e, i)
                );
            },
            getOwnPropertyDescriptor(e, i) {
                return e._descriptors.allKeys
                    ? Reflect.has(t, i)
                        ? { enumerable: 1, configurable: 1 }
                        : void 0
                    : Reflect.getOwnPropertyDescriptor(t, i);
            },
            getPrototypeOf() {
                return Reflect.getPrototypeOf(t);
            },
            has(e, i) {
                return Reflect.has(t, i);
            },
            ownKeys() {
                return Reflect.ownKeys(t);
            },
            set(e, i, n) {
                return ((t[i] = n), delete e[i], 1);
            }
        });
    }
    function un(t, e = { scriptable: 1, indexable: 1 }) {
        let { _scriptable: i = e.scriptable, _indexable: n = e.indexable, _allKeys: r = e.allKeys } = t;
        return {
            allKeys: r,
            scriptable: i,
            indexable: n,
            isScriptable: Eh(i) ? i : () => i,
            isIndexable: Eh(n) ? n : () => n
        };
    }
    function fn(t, e, i) {
        if ({}.hasOwnProperty.call(t, e) || 'constructor' === e) return t[e];
        let n = i();
        return ((t[e] = n), n);
    }
    function gn(t, e, i) {
        return Eh(t) ? t(e, i) : t;
    }
    function pn(t, e, i, n, r) {
        for (let a of e) {
            let e = dc(i, a);
            if (e) {
                t.add(e);
                let a = gn(e._fallback, i, r);
                if (typeof a < 'u' && a !== i && a !== n) return a;
            } else if (0 == e && typeof n < 'u' && i !== n) return null;
        }
        return 0;
    }
    function mn(t, e, i, n) {
        let r = e._rootScopes,
            a = gn(e._fallback, i, n),
            o = [...t, ...r],
            s = new Set();
        s.add(n);
        let l = bn(s, o, i, a || i, n);
        return null === l || (typeof a < 'u' && a !== i && ((l = bn(s, o, a, l, n)), null === l))
            ? 0
            : cn(Array.from(s), [''], r, a, () =>
                  (function (t, e, i) {
                      let n = t._getTarget();
                      e in n || (n[e] = {});
                      let r = n[e];
                      return Ge(r) && Ze(i) ? i : r || {};
                  })(e, i, n)
              );
    }
    function bn(t, e, i, n, r) {
        for (; i; ) i = pn(t, e, i, n, r);
        return i;
    }
    function vn(t, e) {
        for (let i of e) {
            if (!i) continue;
            let e = i[t];
            if (typeof e < 'u') return e;
        }
    }
    function xn(t) {
        let e = t._keys;
        return (
            e ||
                (e = t._keys =
                    (function (t) {
                        let e = new Set();
                        for (let i of t) for (let t of Object.keys(i).filter((t) => !t.startsWith('_'))) e.add(t);
                        return Array.from(e);
                    })(t._scopes)),
            e
        );
    }
    function yn(t, e, i, n) {
        let r,
            a,
            o,
            s,
            { iScale: l } = t,
            { key: h = 'r' } = this._parsing,
            c = Array(n);
        for (r = 0, a = n; r < a; ++r) ((o = r + i), (s = e[o]), (c[r] = { r: l.parse(hi(s, h), o) }));
        return c;
    }
    function _n(t, e, i, n) {
        let r = t.skip ? e : t,
            a = e,
            o = i.skip ? e : i,
            s = xi(a, r),
            l = xi(o, a),
            h = s / (s + l),
            c = l / (s + l);
        ((h = isNaN(h) ? 0 : h), (c = isNaN(c) ? 0 : c));
        let d = n * h,
            u = n * c;
        return {
            previous: { x: a.x - d * (o.x - r.x), y: a.y - d * (o.y - r.y) },
            next: { x: a.x + u * (o.x - r.x), y: a.y + u * (o.y - r.y) }
        };
    }
    function wn(t, e, i) {
        return Math.max(Math.min(t, i), e);
    }
    function Mn() {
        return typeof window < 'u' && typeof document < 'u';
    }
    function kn(t) {
        let e = t.parentNode;
        return (e && '' + e == '[object ShadowRoot]' && (e = e.host), e);
    }
    function Sn(t, e, i) {
        let n;
        return (
            'string' == typeof t
                ? ((n = parseInt(t, 10)), -1 !== t.indexOf('%') && (n = (n / 100) * e.parentNode[i]))
                : (n = t),
            n
        );
    }
    function Cn(t, e, i) {
        let n = {};
        i = i ? '-' + i : '';
        for (let r = 0; r < 4; r++) {
            let a = mc[r];
            n[a] = parseFloat(t[e + '-' + a + i]) || 0;
        }
        return ((n.width = n.left + n.right), (n.height = n.top + n.bottom), n);
    }
    function Ln(t, e) {
        if ('native' in t) return t;
        let { canvas: i, currentDevicePixelRatio: n } = e,
            r = pc(i),
            a = 'border-box' === r.boxSizing,
            o = Cn(r, 'padding'),
            s = Cn(r, 'border', 'width'),
            {
                x: l,
                y: h,
                box: c
            } = (function (t, e) {
                let i,
                    n,
                    r = t.touches,
                    a = r && r.length ? r[0] : t,
                    { offsetX: o, offsetY: s } = a,
                    l = 0;
                if (bc(o, s, t.target)) ((i = o), (n = s));
                else {
                    let t = e.getBoundingClientRect();
                    ((i = a.clientX - t.left), (n = a.clientY - t.top), (l = 1));
                }
                return { x: i, y: n, box: l };
            })(t, i),
            d = o.left + (c && s.left),
            u = o.top + (c && s.top),
            { width: f, height: g } = e;
        return (
            a && ((f -= o.width + s.width), (g -= o.height + s.height)),
            { x: Math.round((((l - d) / f) * i.width) / n), y: Math.round((((h - u) / g) * i.height) / n) }
        );
    }
    function En(t, e, i) {
        let n = e || 1,
            r = Math.floor(t.height * n),
            a = Math.floor(t.width * n);
        ((t.height = Math.floor(t.height)), (t.width = Math.floor(t.width)));
        let o = t.canvas;
        return (
            o.style &&
                (i || (!o.style.height && !o.style.width)) &&
                ((o.style.height = t.height + 'px'), (o.style.width = t.width + 'px')),
            t.currentDevicePixelRatio !== n || o.height !== r || o.width !== a
                ? ((t.currentDevicePixelRatio = n),
                  (o.height = r),
                  (o.width = a),
                  t.ctx.setTransform(n, 0, 0, n, 0, 0),
                  1)
                : 0
        );
    }
    function Pn(t, e) {
        let i = (function (t, e) {
                return pc(t).getPropertyValue(e);
            })(t, e),
            n = i && i.match(/^(\d+)(\.\d+)?px$/);
        return n ? +n[1] : void 0;
    }
    function Dn(t, e, i, n) {
        return { x: t.x + i * (e.x - t.x), y: t.y + i * (e.y - t.y) };
    }
    function An(t, e, i, n) {
        return {
            x: t.x + i * (e.x - t.x),
            y: 'middle' === n ? (i < 0.5 ? t.y : e.y) : 'after' === n ? (i < 1 ? t.y : e.y) : i > 0 ? e.y : t.y
        };
    }
    function Tn(t, e, i, n) {
        let r = { x: t.cp2x, y: t.cp2y },
            a = { x: e.cp1x, y: e.cp1y },
            o = Dn(t, r, i),
            s = Dn(r, a, i),
            l = Dn(a, e, i),
            h = Dn(o, s, i),
            c = Dn(s, l, i);
        return Dn(h, c, i);
    }
    function On(t, e, i) {
        return t ? yc(e, i) : _c();
    }
    function Rn(t, e) {
        let i, n;
        ('ltr' === e || 'rtl' === e) &&
            ((i = t.canvas.style),
            (n = [i.getPropertyValue('direction'), i.getPropertyPriority('direction')]),
            i.setProperty('direction', e, 'important'),
            (t.prevTextDirection = n));
    }
    function In(t, e) {
        void 0 !== e && (delete t.prevTextDirection, t.canvas.style.setProperty('direction', e[0], e[1]));
    }
    function $n(t) {
        return 'angle' === t
            ? { between: wi, compare: yi, normalize: _i }
            : { between: ki, compare: (t, e) => t - e, normalize: (t) => t };
    }
    function Fn({ start: t, end: e, count: i, loop: n, style: r }) {
        return { start: t % i, end: e % i, loop: n && (e - t + 1) % i == 0, style: r };
    }
    function zn(t, e, i) {
        if (!i) return [t];
        let n,
            r,
            a,
            { property: o, start: s, end: l } = i,
            h = e.length,
            { compare: c, between: d, normalize: u } = $n(o),
            {
                start: f,
                end: g,
                loop: p,
                style: m
            } = (function (t, e, i) {
                let n,
                    r,
                    { property: a, start: o, end: s } = i,
                    { between: l, normalize: h } = $n(a),
                    c = e.length,
                    { start: d, end: u, loop: f } = t;
                if (f) {
                    for (d += c, u += c, n = 0, r = c; n < r && l(h(e[d % c][a]), o, s); ++n) (d--, u--);
                    ((d %= c), (u %= c));
                }
                return (u < d && (u += c), { start: d, end: u, loop: f, style: t.style });
            })(t, e, i),
            b = [],
            v = 0,
            x = null,
            y = () => v || (d(s, a, n) && 0 !== c(s, a)),
            _ = () => !v || 0 === c(l, n) || d(l, a, n);
        for (let t = f, i = f; t <= g; ++t)
            ((r = e[t % h]),
                !r.skip &&
                    ((n = u(r[o])),
                    n !== a &&
                        ((v = d(n, s, l)),
                        null === x && y() && (x = 0 === c(n, s) ? t : i),
                        null !== x &&
                            _() &&
                            (b.push(Fn({ start: x, end: t, loop: p, count: h, style: m })), (x = null)),
                        (i = t),
                        (a = n))));
        return (null !== x && b.push(Fn({ start: x, end: g, loop: p, count: h, style: m })), b);
    }
    function Vn(t, e) {
        let i = [],
            n = t.segments;
        for (let r = 0; r < n.length; r++) {
            let a = zn(n[r], t.points, e);
            a.length && i.push(...a);
        }
        return i;
    }
    function Bn(t) {
        return {
            backgroundColor: t.backgroundColor,
            borderCapStyle: t.borderCapStyle,
            borderDash: t.borderDash,
            borderDashOffset: t.borderDashOffset,
            borderJoinStyle: t.borderJoinStyle,
            borderWidth: t.borderWidth,
            borderColor: t.borderColor
        };
    }
    function jn(t, e) {
        if (!e) return 0;
        let i = [],
            n = function (t, e) {
                return Ai(e) ? (i.includes(e) || i.push(e), i.indexOf(e)) : e;
            };
        return JSON.stringify(t, n) !== JSON.stringify(e, n);
    }
    function Nn(t, e, i) {
        return t.options.clip ? t[i] : e[i];
    }
    function Hn(t, e) {
        let i = e._clip;
        if (i.disabled) return 0;
        let n = (function (t, e) {
            let { xScale: i, yScale: n } = t;
            return i && n
                ? { left: Nn(i, e, 'left'), right: Nn(i, e, 'right'), top: Nn(n, e, 'top'), bottom: Nn(n, e, 'bottom') }
                : e;
        })(e, t.chartArea);
        return {
            left: 0 == i.left ? 0 : n.left - (1 == i.left ? 0 : i.left),
            right: 0 == i.right ? t.width : n.right + (1 == i.right ? 0 : i.right),
            top: 0 == i.top ? 0 : n.top - (1 == i.top ? 0 : i.top),
            bottom: 0 == i.bottom ? t.height : n.bottom + (1 == i.bottom ? 0 : i.bottom)
        };
    }
    function Wn(t, e) {
        let i = (t && t.options) || {},
            n = i.reverse,
            r = void 0 === i.min ? e : 0,
            a = void 0 === i.max ? e : 0;
        return { start: n ? a : r, end: n ? r : a };
    }
    function Un(t, e) {
        let i,
            n,
            r = [],
            a = t._getSortedDatasetMetas(e);
        for (i = 0, n = a.length; i < n; ++i) r.push(a[i].index);
        return r;
    }
    function Yn(t, e, i, n = {}) {
        let r,
            a,
            o,
            s,
            l = t.keys,
            h = 'single' === n.mode;
        if (null === e) return;
        let c = 0;
        for (r = 0, a = l.length; r < a; ++r) {
            if (((o = +l[r]), o === i)) {
                if (((c = 1), n.all)) continue;
                break;
            }
            ((s = t.values[o]), Ke(s) && (h || 0 === e || Vh(e) === Vh(s)) && (e += s));
        }
        return c || n.all ? e : 0;
    }
    function qn(t, e) {
        let i = t && t.options.stacked;
        return i || (void 0 === i && void 0 !== e.stack);
    }
    function Xn(t, e, i) {
        let n = t[e] || (t[e] = {});
        return n[i] || (n[i] = {});
    }
    function Gn(t, e, i, n) {
        for (let r of e.getMatchingVisibleMetas(n).reverse()) {
            let e = t[r.index];
            if ((i && e > 0) || (!i && e < 0)) return r.index;
        }
        return null;
    }
    function Zn(t, e) {
        let i,
            { chart: n, _cachedMeta: r } = t,
            a = n._stacks || (n._stacks = {}),
            { iScale: o, vScale: s, index: l } = r,
            h = o.axis,
            c = s.axis,
            d = (function (t, e, i) {
                return `${t.id}.${e.id}.${i.stack || i.type}`;
            })(o, s, r),
            u = e.length;
        for (let t = 0; t < u; ++t) {
            let n = e[t],
                { [h]: o, [c]: u } = n;
            ((i = (n._stacks || (n._stacks = {}))[c] = Xn(a, d, o)),
                (i[l] = u),
                (i._top = Gn(i, s, 1, r.type)),
                (i._bottom = Gn(i, s, 0, r.type)),
                ((i._visualValues || (i._visualValues = {}))[l] = u));
        }
    }
    function Kn(t, e) {
        let i = t.scales;
        return Object.keys(i)
            .filter((t) => i[t].axis === e)
            .shift();
    }
    function Jn(t, e) {
        let i = t.controller.index,
            n = t.vScale && t.vScale.axis;
        if (n) {
            e = e || t._parsed;
            for (let t of e) {
                let e = t._stacks;
                if (!e || void 0 === e[n] || void 0 === e[n][i]) return;
                (delete e[n][i],
                    void 0 !== e[n]._visualValues && void 0 !== e[n]._visualValues[i] && delete e[n]._visualValues[i]);
            }
        }
    }
    function Qn(t) {
        let e,
            i,
            n,
            r,
            a = t.iScale,
            o = (function (t, e) {
                if (!t._cache.$bar) {
                    let i = t.getMatchingVisibleMetas(e),
                        n = [];
                    for (let e = 0, r = i.length; e < r; e++) n = n.concat(i[e].controller.getAllParsedValues(t));
                    t._cache.$bar = Li(n.sort((t, e) => t - e));
                }
                return t._cache.$bar;
            })(a, t.type),
            s = a._length,
            l = () => {
                32767 === n || -32768 === n || (Lh(r) && (s = Math.min(s, Math.abs(n - r) || s)), (r = n));
            };
        for (e = 0, i = o.length; e < i; ++e) ((n = a.getPixelForValue(o[e])), l());
        for (r = void 0, e = 0, i = a.ticks.length; e < i; ++e) ((n = a.getPixelForTick(e)), l());
        return s;
    }
    function tr(t, e, i, n) {
        return (
            Ge(t)
                ? (function (t, e, i, n) {
                      let r = i.parse(t[0], n),
                          a = i.parse(t[1], n),
                          o = Math.min(r, a),
                          s = Math.max(r, a),
                          l = o,
                          h = s;
                      (Math.abs(o) > Math.abs(s) && ((l = s), (h = o)),
                          (e[i.axis] = h),
                          (e._custom = { barStart: l, barEnd: h, start: r, end: a, min: o, max: s }));
                  })(t, e, i, n)
                : (e[i.axis] = i.parse(t, n)),
            e
        );
    }
    function er(t, e, i, n) {
        let r,
            a,
            o,
            s,
            l = t.iScale,
            h = t.vScale,
            c = l.getLabels(),
            d = l === h,
            u = [];
        for (r = i, a = i + n; r < a; ++r)
            ((s = e[r]), (o = {}), (o[l.axis] = d || l.parse(c[r], r)), u.push(tr(s, o, h, r)));
        return u;
    }
    function ir(t) {
        return t && void 0 !== t.barStart && void 0 !== t.barEnd;
    }
    function nr(t, e, i, n) {
        let r = e.borderSkipped,
            a = {};
        if (!r) return void (t.borderSkipped = a);
        if (1 == r) return void (t.borderSkipped = { top: 1, right: 1, bottom: 1, left: 1 });
        let {
            start: o,
            end: s,
            reverse: l,
            top: h,
            bottom: c
        } = (function (t) {
            let e, i, n, r, a;
            return (
                t.horizontal
                    ? ((e = t.base > t.x), (i = 'left'), (n = 'right'))
                    : ((e = t.base < t.y), (i = 'bottom'), (n = 'top')),
                e ? ((r = 'end'), (a = 'start')) : ((r = 'start'), (a = 'end')),
                { start: i, end: n, reverse: e, top: r, bottom: a }
            );
        })(t);
        ('middle' === r &&
            i &&
            ((t.enableBorderRadius = 1),
            (i._top || 0) === n ? (r = h) : (i._bottom || 0) === n ? (r = c) : ((a[rr(c, o, s, l)] = 1), (r = h))),
            (a[rr(r, o, s, l)] = 1),
            (t.borderSkipped = a));
    }
    function rr(t, e, i, n) {
        return (
            n
                ? ((t = (function (t, e, i) {
                      return t === e ? i : t === i ? e : t;
                  })(t, e, i)),
                  (t = ar(t, i, e)))
                : (t = ar(t, e, i)),
            t
        );
    }
    function ar(t, e, i) {
        return 'start' === t ? e : 'end' === t ? i : t;
    }
    function or(t, { inflateAmount: e }, i) {
        t.inflateAmount = 'auto' === e ? (1 === i ? 0.33 : 0) : e;
    }
    function sr() {
        throw Error('This method is not implemented: Check that a complete date adapter is provided.');
    }
    function lr(t, e, i, n) {
        let { controller: r, data: a, _sorted: o } = t,
            s = r._cachedMeta.iScale,
            l = t.dataset && t.dataset.options ? t.dataset.options.spanGaps : null;
        if (s && e === s.axis && 'r' !== e && o && a.length) {
            let o = s._reversePixels ? jh : Bh;
            if (!n) {
                let n = o(a, e, i);
                if (l) {
                    let { vScale: e } = r._cachedMeta,
                        { _parsed: i } = t,
                        a = i
                            .slice(0, n.lo + 1)
                            .reverse()
                            .findIndex((t) => !Xe(t[e.axis]));
                    n.lo -= Math.max(0, a);
                    let o = i.slice(n.hi).findIndex((t) => !Xe(t[e.axis]));
                    n.hi += Math.max(0, o);
                }
                return n;
            }
            if (r._sharedOptions) {
                let t = a[0],
                    n = 'function' == typeof t.getRange && t.getRange(e);
                if (n) {
                    let t = o(a, e, i - n),
                        r = o(a, e, i + n);
                    return { lo: t.lo, hi: r.hi };
                }
            }
        }
        return { lo: 0, hi: a.length - 1 };
    }
    function hr(t, e, i, n, r) {
        let a = t.getSortedVisibleDatasetMetas(),
            o = i[e];
        for (let t = 0, i = a.length; t < i; ++t) {
            let { index: i, data: s } = a[t],
                { lo: l, hi: h } = lr(a[t], e, o, r);
            for (let t = l; t <= h; ++t) {
                let e = s[t];
                e.skip || n(e, i, t);
            }
        }
    }
    function cr(t, e, i, n, r) {
        let a = [];
        return (
            (!r && !t.isPointInArea(e)) ||
                hr(
                    t,
                    i,
                    e,
                    function (i, o, s) {
                        (!r && !Yi(i, t.chartArea, 0)) ||
                            (i.inRange(e.x, e.y, n) && a.push({ element: i, datasetIndex: o, index: s }));
                    },
                    1
                ),
            a
        );
    }
    function dr(t, e, i, n, r, a) {
        return a || t.isPointInArea(e)
            ? 'r' !== i || n
                ? (function (t, e, i, n, r, a) {
                      let o = [],
                          s = (function (t) {
                              let e = -1 !== t.indexOf('x'),
                                  i = -1 !== t.indexOf('y');
                              return function (t, n) {
                                  let r = e ? Math.abs(t.x - n.x) : 0,
                                      a = i ? Math.abs(t.y - n.y) : 0;
                                  return Math.sqrt(Math.pow(r, 2) + Math.pow(a, 2));
                              };
                          })(i),
                          l = 1 / 0;
                      return (
                          hr(t, i, e, function (i, h, c) {
                              let d = i.inRange(e.x, e.y, r);
                              if (n && !d) return;
                              let u = i.getCenterPoint(r);
                              if (!a && !t.isPointInArea(u) && !d) return;
                              let f = s(e, u);
                              f < l
                                  ? ((o = [{ element: i, datasetIndex: h, index: c }]), (l = f))
                                  : f === l && o.push({ element: i, datasetIndex: h, index: c });
                          }),
                          o
                      );
                  })(t, e, i, n, r, a)
                : (function (t, e, i, n) {
                      let r = [];
                      return (
                          hr(t, i, e, function (t, i, a) {
                              let { startAngle: o, endAngle: s } = t.getProps(['startAngle', 'endAngle'], n),
                                  { angle: l } = vi(t, { x: e.x, y: e.y });
                              wi(l, o, s) && r.push({ element: t, datasetIndex: i, index: a });
                          }),
                          r
                      );
                  })(t, e, i, r)
            : [];
    }
    function ur(t, e, i, n, r) {
        let a = [],
            o = 'x' === i ? 'inXRange' : 'inYRange',
            s = 0;
        return (
            hr(t, i, e, (t, n, l) => {
                t[o] &&
                    t[o](e[i], r) &&
                    (a.push({ element: t, datasetIndex: n, index: l }), (s = s || t.inRange(e.x, e.y, r)));
            }),
            n && !s ? [] : a
        );
    }
    function fr(t, e) {
        return t.filter((t) => t.pos === e);
    }
    function gr(t, e) {
        return t.filter((t) => -1 === Wc.indexOf(t.pos) && t.box.axis === e);
    }
    function pr(t, e) {
        return t.sort((t, i) => {
            let n = e ? i : t,
                r = e ? t : i;
            return n.weight === r.weight ? n.index - r.index : n.weight - r.weight;
        });
    }
    function mr(t, e, i, n) {
        return Math.max(t[i], e[i]) + Math.max(t[n], e[n]);
    }
    function br(t, e) {
        ((t.top = Math.max(t.top, e.top)),
            (t.left = Math.max(t.left, e.left)),
            (t.bottom = Math.max(t.bottom, e.bottom)),
            (t.right = Math.max(t.right, e.right)));
    }
    function vr(t, e, i, n) {
        let { pos: r, box: a } = i,
            o = t.maxPadding;
        if (!Ze(r)) {
            i.size && (t[r] -= i.size);
            let e = n[i.stack] || { size: 0, count: 1 };
            ((e.size = Math.max(e.size, i.horizontal ? a.height : a.width)),
                (i.size = e.size / e.count),
                (t[r] += i.size));
        }
        a.getPadding && br(o, a.getPadding());
        let s = Math.max(0, e.outerWidth - mr(o, t, 'left', 'right')),
            l = Math.max(0, e.outerHeight - mr(o, t, 'top', 'bottom')),
            h = s !== t.w,
            c = l !== t.h;
        return ((t.w = s), (t.h = l), i.horizontal ? { same: h, other: c } : { same: c, other: h });
    }
    function xr(t, e) {
        let i = e.maxPadding;
        return (function (t) {
            let n = { left: 0, top: 0, right: 0, bottom: 0 };
            return (
                t.forEach((t) => {
                    n[t] = Math.max(e[t], i[t]);
                }),
                n
            );
        })(t ? ['left', 'right'] : ['top', 'bottom']);
    }
    function yr(t, e, i, n) {
        let r,
            a,
            o,
            s,
            l,
            h,
            c = [];
        for (r = 0, a = t.length, l = 0; r < a; ++r) {
            ((o = t[r]), (s = o.box), s.update(o.width || e.w, o.height || e.h, xr(o.horizontal, e)));
            let { same: a, other: d } = vr(e, i, o, n);
            ((l |= a && c.length), (h = h || d), s.fullSize || c.push(o));
        }
        return (l && yr(c, e, i, n)) || h;
    }
    function _r(t, e, i, n, r) {
        ((t.top = i), (t.left = e), (t.right = e + n), (t.bottom = i + r), (t.width = n), (t.height = r));
    }
    function wr(t, e, i, n) {
        let r = i.padding,
            { x: a, y: o } = e;
        for (let s of t) {
            let t = s.box,
                l = n[s.stack] || { count: 1, placed: 0, weight: 1 },
                h = s.stackWeight / l.weight || 1;
            if (s.horizontal) {
                let n = e.w * h,
                    a = l.size || t.height;
                (Lh(l.start) && (o = l.start),
                    t.fullSize
                        ? _r(t, r.left, o, i.outerWidth - r.right - r.left, a)
                        : _r(t, e.left + l.placed, o, n, a),
                    (l.start = o),
                    (l.placed += n),
                    (o = t.bottom));
            } else {
                let n = e.h * h,
                    o = l.size || t.width;
                (Lh(l.start) && (a = l.start),
                    t.fullSize
                        ? _r(t, a, r.top, o, i.outerHeight - r.bottom - r.top)
                        : _r(t, a, e.top + l.placed, o, n),
                    (l.start = a),
                    (l.placed += n),
                    (a = t.right));
            }
        }
        ((e.x = a), (e.y = o));
    }
    function Mr(t, e, i) {
        t && t.canvas && t.canvas.removeEventListener(e, i, Kc);
    }
    function kr(t, e) {
        for (let i of t) if (i === e || i.contains(e)) return 1;
    }
    function Sr(t, e, i) {
        let n = t.canvas,
            r = new MutationObserver((t) => {
                let e = 0;
                for (let i of t) ((e = e || kr(i.addedNodes, n)), (e = e && !kr(i.removedNodes, n)));
                e && i();
            });
        return (r.observe(document, { childList: 1, subtree: 1 }), r);
    }
    function Cr(t, e, i) {
        let n = t.canvas,
            r = new MutationObserver((t) => {
                let e = 0;
                for (let i of t) ((e = e || kr(i.removedNodes, n)), (e = e && !kr(i.addedNodes, n)));
                e && i();
            });
        return (r.observe(document, { childList: 1, subtree: 1 }), r);
    }
    function Lr() {
        let t = window.devicePixelRatio;
        t !== Qc &&
            ((Qc = t),
            Jc.forEach((e, i) => {
                i.currentDevicePixelRatio !== t && e();
            }));
    }
    function Er(t, e, i) {
        let n = t.canvas,
            r = n && kn(n);
        if (!r) return;
        let a = Ei((t, e) => {
                let n = r.clientWidth;
                (i(t, e), n < r.clientWidth && i());
            }, window),
            o = new ResizeObserver((t) => {
                let e = t[0],
                    i = e.contentRect.width,
                    n = e.contentRect.height;
                (0 === i && 0 === n) || a(i, n);
            });
        return (
            o.observe(r),
            (function (t, e) {
                (Jc.size || window.addEventListener('resize', Lr), Jc.set(t, e));
            })(t, a),
            o
        );
    }
    function Pr(t, e, i) {
        (i && i.disconnect(),
            'resize' === e &&
                (function (t) {
                    (Jc.delete(t), Jc.size || window.removeEventListener('resize', Lr));
                })(t));
    }
    function Dr(t, e, i) {
        let n = t.canvas,
            r = Ei((e) => {
                null !== t.ctx &&
                    i(
                        (function (t, e) {
                            let i = Gc[t.type] || t.type,
                                { x: n, y: r } = Ln(t, e);
                            return {
                                type: i,
                                chart: e,
                                native: t,
                                x: void 0 !== n ? n : null,
                                y: void 0 !== r ? r : null
                            };
                        })(e, t)
                    );
            }, t);
        return (
            (function (t, e, i) {
                t && t.addEventListener(e, i, Kc);
            })(n, e, r),
            r
        );
    }
    function Ar(t, e, i, n, r) {
        let a,
            o,
            s,
            l = Qe(n, 0),
            h = Math.min(Qe(r, t.length), t.length),
            c = 0;
        for (i = Math.ceil(i), r && ((a = r - n), (i = a / Math.floor(a / i))), s = l; s < 0; )
            (c++, (s = Math.round(l + c * i)));
        for (o = Math.max(l, 0); o < h; o++) o === s && (e.push(t[o]), c++, (s = Math.round(l + c * i)));
    }
    function Tr(t, e) {
        let i = [],
            n = t.length / e,
            r = t.length,
            a = 0;
        for (; a < r; a += n) i.push(t[Math.floor(a)]);
        return i;
    }
    function Or(t, e, i) {
        let n,
            r = t.ticks.length,
            a = Math.min(e, r - 1),
            o = t._startPixel,
            s = t._endPixel,
            l = 1e-6,
            h = t.getPixelForTick(a);
        if (
            !(
                i &&
                ((n =
                    1 === r
                        ? Math.max(h - o, s - h)
                        : 0 === e
                          ? (t.getPixelForTick(1) - h) / 2
                          : (h - t.getPixelForTick(a - 1)) / 2),
                (h += a < e ? n : -n),
                h < o - l || h > s + l)
            )
        )
            return h;
    }
    function Rr(t) {
        return t.drawTicks ? t.tickLength : 0;
    }
    function Ir(t, e) {
        if (!t.display) return 0;
        let i = sn(t.font, e),
            n = on(t.padding);
        return (Ge(t.text) ? t.text.length : 1) * i.lineHeight + n.height;
    }
    function $r(t, e, i) {
        let n = Wh(t);
        return (((i && 'right' !== e) || (!i && 'right' === e)) && (n = id(n)), n);
    }
    function Fr(t, e) {
        return e || 0 != t ? (1 == t ? {} : t) : null;
    }
    function zr(t, { plugin: e, local: i }, n, r) {
        let a = t.pluginScopeKeys(e),
            o = t.getOptionScopes(n, a);
        return (
            i && e.defaults && o.push(e.defaults),
            t.createResolver(o, r, [''], { scriptable: 0, indexable: 0, allKeys: 1 })
        );
    }
    function Vr(t, e) {
        return ((e.datasets || {})[t] || {}).indexAxis || e.indexAxis || (ac.datasets[t] || {}).indexAxis || 'x';
    }
    function Br(t) {
        if ('x' === t || 'y' === t || 'r' === t) return t;
    }
    function jr(t) {
        return 'top' === t || 'bottom' === t ? 'x' : 'left' === t || 'right' === t ? 'y' : void 0;
    }
    function Nr(t, ...e) {
        if (Br(t)) return t;
        for (let i of e) {
            let e = i.axis || jr(i.position) || (t.length > 1 && Br(t[0].toLowerCase()));
            if (e) return e;
        }
        throw Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`);
    }
    function Hr(t, e, i) {
        if (i[e + 'AxisID'] === t) return { axis: e };
    }
    function Wr(t) {
        let e = t.options || (t.options = {});
        ((e.plugins = Qe(e.plugins, {})),
            (e.scales = (function (t, e) {
                let i = ic[t.type] || { scales: {} },
                    n = e.scales || {},
                    r = Vr(t.type, e),
                    a = Object.create(null);
                return (
                    Object.keys(n).forEach((e) => {
                        let o = n[e];
                        if (!Ze(o)) return console.error('Invalid scale configuration for scale: ' + e);
                        if (o._proxy) return console.warn('Ignoring resolver passed as options for scale: ' + e);
                        let s = Nr(
                                e,
                                o,
                                (function (t, e) {
                                    if (e.data && e.data.datasets) {
                                        let i = e.data.datasets.filter((e) => e.xAxisID === t || e.yAxisID === t);
                                        if (i.length) return Hr(t, 'x', i[0]) || Hr(t, 'y', i[0]);
                                    }
                                    return {};
                                })(e, t),
                                ac.scales[o.type]
                            ),
                            l = (function (t, e) {
                                return t === e ? '_index_' : '_value_';
                            })(s, r),
                            h = i.scales || {};
                        a[e] = si(Object.create(null), [{ axis: s }, o, h[s], h[l]]);
                    }),
                    t.data.datasets.forEach((i) => {
                        let r = i.type || t.type,
                            o = i.indexAxis || Vr(r, e),
                            s = (ic[r] || {}).scales || {};
                        Object.keys(s).forEach((t) => {
                            let e = (function (t, e) {
                                    let i = t;
                                    return (
                                        '_index_' === t ? (i = e) : '_value_' === t && (i = 'x' === e ? 'y' : 'x'),
                                        i
                                    );
                                })(t, o),
                                r = i[e + 'AxisID'] || e;
                            ((a[r] = a[r] || Object.create(null)), si(a[r], [{ axis: e }, n[r], s[t]]));
                        });
                    }),
                    Object.keys(a).forEach((t) => {
                        let e = a[t];
                        si(e, [ac.scales[e.type], ac.scale]);
                    }),
                    a
                );
            })(t, e)));
    }
    function Ur(t) {
        return (((t = t || {}).datasets = t.datasets || []), (t.labels = t.labels || []), t);
    }
    function Yr(t, e) {
        let i = cd.get(t);
        return (i || ((i = e()), cd.set(t, i), dd.add(i)), i);
    }
    function qr(t, e, i) {
        let n = t.get(e);
        n || ((n = new Map()), t.set(e, n));
        let r = i.join(),
            a = n.get(r);
        return (
            a ||
                ((a = { resolver: cn(e, i), subPrefixes: i.filter((t) => !t.toLowerCase().includes('hover')) }),
                n.set(r, a)),
            a
        );
    }
    function Xr(t, e) {
        return 'top' === t || 'bottom' === t || (-1 === pd.indexOf(t) && 'x' === e);
    }
    function Gr(t, e) {
        return function (i, n) {
            return i[t] === n[t] ? i[e] - n[e] : i[t] - n[t];
        };
    }
    function Zr(t) {
        let e = t.chart,
            i = e.options.animation;
        (e.notifyPlugins('afterRender'), ti(i && i.onComplete, [t], e));
    }
    function Kr(t) {
        let e = t.chart,
            i = e.options.animation;
        ti(i && i.onProgress, [t], e);
    }
    function Jr(t) {
        return (
            Mn() && 'string' == typeof t ? (t = document.getElementById(t)) : t && t.length && (t = t[0]),
            t && t.canvas && (t = t.canvas),
            t
        );
    }
    function Qr(t, e, i) {
        let n = Object.keys(t);
        for (let r of n) {
            let n = +r;
            if (n >= e) {
                let a = t[r];
                (delete t[r], (i > 0 || n > e) && (t[n + i] = a));
            }
        }
    }
    function ta() {
        return ei(vd.instances, (t) => t._plugins.invalidate());
    }
    function ea(t, e, i, n) {
        return { x: i + t * Math.cos(e), y: n + t * Math.sin(e) };
    }
    function ia(t, e, i, n, r, a) {
        let { x: o, y: s, startAngle: l, pixelMargin: h, innerRadius: c } = e,
            d = Math.max(e.outerRadius + n + i - h, 0),
            u = c > 0 ? c + n + i + h : 0,
            f = 0,
            g = r - l;
        if (n) {
            let t = ((c > 0 ? c - n : 0) + (d > 0 ? d - n : 0)) / 2;
            f = (g - (0 !== t ? (g * t) / (t + n) : g)) / 2;
        }
        let p = (g - Math.max(0.001, g * d - i / Dh) / d) / 2,
            m = l + p + f,
            b = r - p - f,
            {
                outerStart: v,
                outerEnd: x,
                innerStart: y,
                innerEnd: _
            } = (function (t, e, i, n) {
                let r = (function (t) {
                        return nn(t, ['outerStart', 'outerEnd', 'innerStart', 'innerEnd']);
                    })(t.options.borderRadius),
                    a = (i - e) / 2,
                    o = Math.min(a, (n * e) / 2),
                    s = (t) => Mi(t, 0, Math.min(a, ((i - Math.min(a, t)) * n) / 2));
                return {
                    outerStart: s(r.outerStart),
                    outerEnd: s(r.outerEnd),
                    innerStart: Mi(r.innerStart, 0, o),
                    innerEnd: Mi(r.innerEnd, 0, o)
                };
            })(e, u, d, b - m),
            w = d - v,
            M = d - x,
            k = m + v / w,
            S = b - x / M,
            C = u + y,
            L = u + _,
            E = m + y / C,
            P = b - _ / L;
        if ((t.beginPath(), a)) {
            let e = (k + S) / 2;
            if ((t.arc(o, s, d, k, e), t.arc(o, s, d, e, S), x > 0)) {
                let e = ea(M, S, o, s);
                t.arc(e.x, e.y, x, S, b + Ih);
            }
            let i = ea(L, b, o, s);
            if ((t.lineTo(i.x, i.y), _ > 0)) {
                let e = ea(L, P, o, s);
                t.arc(e.x, e.y, _, b + Ih, P + Math.PI);
            }
            let n = (b - _ / u + (m + y / u)) / 2;
            if ((t.arc(o, s, u, b - _ / u, n, 1), t.arc(o, s, u, n, m + y / u, 1), y > 0)) {
                let e = ea(C, E, o, s);
                t.arc(e.x, e.y, y, E + Math.PI, m - Ih);
            }
            let r = ea(w, m, o, s);
            if ((t.lineTo(r.x, r.y), v > 0)) {
                let e = ea(w, k, o, s);
                t.arc(e.x, e.y, v, m - Ih, k);
            }
        } else
            (t.moveTo(o, s),
                t.lineTo(Math.cos(k) * d + o, Math.sin(k) * d + s),
                t.lineTo(Math.cos(S) * d + o, Math.sin(S) * d + s));
        t.closePath();
    }
    function na(t, e, i = e) {
        ((t.lineCap = Qe(i.borderCapStyle, e.borderCapStyle)),
            t.setLineDash(Qe(i.borderDash, e.borderDash)),
            (t.lineDashOffset = Qe(i.borderDashOffset, e.borderDashOffset)),
            (t.lineJoin = Qe(i.borderJoinStyle, e.borderJoinStyle)),
            (t.lineWidth = Qe(i.borderWidth, e.borderWidth)),
            (t.strokeStyle = Qe(i.borderColor, e.borderColor)));
    }
    function ra(t, e, i) {
        t.lineTo(i.x, i.y);
    }
    function aa(t, e, i = {}) {
        let n = t.length,
            { start: r = 0, end: a = n - 1 } = i,
            { start: o, end: s } = e,
            l = Math.max(r, o),
            h = Math.min(a, s);
        return {
            count: n,
            start: l,
            loop: e.loop,
            ilen: h < l && !((r < o && a < o) || (r > s && a > s)) ? n + h - l : h - l
        };
    }
    function oa(t, e, i, n) {
        let r,
            a,
            o,
            { points: s, options: l } = e,
            { count: h, start: c, loop: d, ilen: u } = aa(s, i, n),
            f = (function (t) {
                return t.stepped ? Gi : t.tension || 'monotone' === t.cubicInterpolationMode ? Zi : ra;
            })(l),
            { move: g = 1, reverse: p } = n || {};
        for (r = 0; r <= u; ++r)
            ((a = s[(c + (p ? u - r : r)) % h]),
                !a.skip && (g ? (t.moveTo(a.x, a.y), (g = 0)) : f(t, o, a, p, l.stepped), (o = a)));
        return (d && ((a = s[(c + (p ? u : 0)) % h]), f(t, o, a, p, l.stepped)), !!d);
    }
    function sa(t, e, i, n) {
        let r,
            a,
            o,
            s,
            l,
            h,
            c = e.points,
            { count: d, start: u, ilen: f } = aa(c, i, n),
            { move: g = 1, reverse: p } = n || {},
            m = 0,
            b = 0,
            v = (t) => (u + (p ? f - t : t)) % d,
            x = () => {
                s !== l && (t.lineTo(m, l), t.lineTo(m, s), t.lineTo(m, h));
            };
        for (g && ((a = c[v(0)]), t.moveTo(a.x, a.y)), r = 0; r <= f; ++r) {
            if (((a = c[v(r)]), a.skip)) continue;
            let e = a.x,
                i = a.y,
                n = 0 | e;
            (n === o
                ? (i < s ? (s = i) : i > l && (l = i), (m = (b * m + e) / ++b))
                : (x(), t.lineTo(e, i), (o = n), (b = 0), (s = l = i)),
                (h = i));
        }
        x();
    }
    function la(t) {
        let e = t.options;
        return t._decimated ||
            t._loop ||
            e.tension ||
            'monotone' === e.cubicInterpolationMode ||
            e.stepped ||
            (e.borderDash && e.borderDash.length)
            ? oa
            : sa;
    }
    function ha(t, e, i, n) {
        let r = t.options,
            { [i]: a } = t.getProps([i], n);
        return Math.abs(e - a) < r.radius + r.hitRadius;
    }
    function ca(t, e) {
        let i,
            n,
            r,
            a,
            o,
            { x: s, y: l, base: h, width: c, height: d } = t.getProps(['x', 'y', 'base', 'width', 'height'], e);
        return (
            t.horizontal
                ? ((o = d / 2), (i = Math.min(s, h)), (n = Math.max(s, h)), (r = l - o), (a = l + o))
                : ((o = c / 2), (i = s - o), (n = s + o), (r = Math.min(l, h)), (a = Math.max(l, h))),
            { left: i, top: r, right: n, bottom: a }
        );
    }
    function da(t, e, i, n) {
        return t ? 0 : Mi(e, i, n);
    }
    function ua(t, e, i, n) {
        let r = null === e,
            a = null === i,
            o = t && !(r && a) && ca(t, n);
        return o && (r || ki(e, o.left, o.right)) && (a || ki(i, o.top, o.bottom));
    }
    function fa(t, e) {
        t.rect(e.x, e.y, e.w, e.h);
    }
    function ga(t, e, i = {}) {
        let n = t.x !== i.x ? -e : 0,
            r = t.y !== i.y ? -e : 0;
        return {
            x: t.x + n,
            y: t.y + r,
            w: t.w + ((t.x + t.w !== i.x + i.w ? e : 0) - n),
            h: t.h + ((t.y + t.h !== i.y + i.h ? e : 0) - r),
            radius: t.radius
        };
    }
    function pa(t) {
        return Sd[t % Sd.length];
    }
    function ma(t) {
        return Cd[t % Cd.length];
    }
    function ba(t) {
        let e;
        for (e in t) if (t[e].borderColor || t[e].backgroundColor) return 1;
        return 0;
    }
    function va(t) {
        if (t._decimated) {
            let e = t._data;
            (delete t._decimated,
                delete t._data,
                Object.defineProperty(t, 'data', { configurable: 1, enumerable: 1, writable: 1, value: e }));
        }
    }
    function xa(t) {
        t.data.datasets.forEach((t) => {
            va(t);
        });
    }
    function ya(t, e, i, n) {
        if (n) return;
        let r = e[t],
            a = i[t];
        return ('angle' === t && ((r = _i(r)), (a = _i(a))), { property: t, start: r, end: a });
    }
    function _a(t, e, i) {
        for (; e > t; e--) {
            let t = i[e];
            if (!isNaN(t.x) && !isNaN(t.y)) break;
        }
        return e;
    }
    function wa(t, e, i, n) {
        return t && e ? n(t[i], e[i]) : t ? t[i] : e ? e[i] : 0;
    }
    function Ma(t, e) {
        let i = [],
            n = 0;
        return (
            Ge(t)
                ? ((n = 1), (i = t))
                : (i = (function (t, e) {
                      let { x: i = null, y: n = null } = t || {},
                          r = e.points,
                          a = [];
                      return (
                          e.segments.forEach(({ start: t, end: e }) => {
                              e = _a(t, e, r);
                              let o = r[t],
                                  s = r[e];
                              null !== n
                                  ? (a.push({ x: o.x, y: n }), a.push({ x: s.x, y: n }))
                                  : null !== i && (a.push({ x: i, y: o.y }), a.push({ x: i, y: s.y }));
                          }),
                          a
                      );
                  })(t, e)),
            i.length ? new _d({ points: i, options: { tension: 0 }, _loop: n, _fullLoop: n }) : null
        );
    }
    function ka(t) {
        return t && 0 != t.fill;
    }
    function Sa(t, e, i) {
        let n,
            r = t[e].fill,
            a = [e];
        if (!i) return r;
        for (; 0 != r && -1 === a.indexOf(r); ) {
            if (!Ke(r)) return r;
            if (((n = t[r]), !n)) return 0;
            if (n.visible) return r;
            (a.push(r), (r = n.fill));
        }
        return 0;
    }
    function Ca(t, e, i) {
        let n = (function (t) {
            let e = t.options,
                i = e.fill,
                n = Qe(i && i.target, i);
            return (void 0 === n && (n = !!e.backgroundColor), 0 == n || null === n ? 0 : 1 == n ? 'origin' : n);
        })(t);
        if (Ze(n)) return isNaN(n.value) ? 0 : n;
        let r = parseFloat(n);
        return Ke(r) && Math.floor(r) === r
            ? (function (t, e, i, n) {
                  return (('-' === t || '+' === t) && (i = e + i), i === e || i < 0 || i >= n ? 0 : i);
              })(n[0], e, r, i)
            : ['origin', 'start', 'end', 'stack', 'shape'].indexOf(n) >= 0 && n;
    }
    function La(t, e, i) {
        let n = [];
        for (let r = 0; r < i.length; r++) {
            let a = i[r],
                { first: o, last: s, point: l } = Ea(a, e, 'x');
            if (!(!l || (o && s)))
                if (o) n.unshift(l);
                else if ((t.push(l), !s)) break;
        }
        t.push(...n);
    }
    function Ea(t, e, i) {
        let n = t.interpolate(e, i);
        if (!n) return {};
        let r = n[i],
            a = t.segments,
            o = t.points,
            s = 0,
            l = 0;
        for (let t = 0; t < a.length; t++) {
            let e = a[t],
                n = o[e.start][i],
                h = o[e.end][i];
            if (ki(r, n, h)) {
                ((s = r === n), (l = r === h));
                break;
            }
        }
        return { first: s, last: l, point: n };
    }
    function Pa(t, e, i) {
        let n = (function (t) {
                let { chart: e, fill: i, line: n } = t;
                if (Ke(i))
                    return (function (t, e) {
                        let i = t.getDatasetMeta(e);
                        return i && t.isDatasetVisible(e) ? i.dataset : null;
                    })(e, i);
                if ('stack' === i)
                    return (function (t) {
                        let { scale: e, index: i, line: n } = t,
                            r = [],
                            a = n.segments,
                            o = n.points,
                            s = (function (t, e) {
                                let i = [],
                                    n = t.getMatchingVisibleMetas('line');
                                for (let t = 0; t < n.length; t++) {
                                    let r = n[t];
                                    if (r.index === e) break;
                                    r.hidden || i.unshift(r.dataset);
                                }
                                return i;
                            })(e, i);
                        s.push(Ma({ x: null, y: e.bottom }, n));
                        for (let t = 0; t < a.length; t++) {
                            let e = a[t];
                            for (let t = e.start; t <= e.end; t++) La(r, o[t], s);
                        }
                        return new _d({ points: r, options: {} });
                    })(t);
                if ('shape' === i) return 1;
                let r = (function (t) {
                    return (t.scale || {}).getPointPositionForValue
                        ? (function (t) {
                              let { scale: e, fill: i } = t,
                                  n = e.options,
                                  r = e.getLabels().length,
                                  a = n.reverse ? e.max : e.min,
                                  o = (function (t, e, i) {
                                      let n;
                                      return (
                                          (n =
                                              'start' === t
                                                  ? i
                                                  : 'end' === t
                                                    ? e.options.reverse
                                                        ? e.min
                                                        : e.max
                                                    : Ze(t)
                                                      ? t.value
                                                      : e.getBaseValue()),
                                          n
                                      );
                                  })(i, e, a),
                                  s = [];
                              if (n.grid.circular) {
                                  let t = e.getPointPositionForValue(0, a);
                                  return new Pd({ x: t.x, y: t.y, radius: e.getDistanceFromCenterForValue(o) });
                              }
                              for (let t = 0; t < r; ++t) s.push(e.getPointPositionForValue(t, o));
                              return s;
                          })(t)
                        : (function (t) {
                              let { scale: e = {}, fill: i } = t,
                                  n = (function (t, e) {
                                      let i = null;
                                      return (
                                          'start' === t
                                              ? (i = e.bottom)
                                              : 'end' === t
                                                ? (i = e.top)
                                                : Ze(t)
                                                  ? (i = e.getPixelForValue(t.value))
                                                  : e.getBasePixel && (i = e.getBasePixel()),
                                          i
                                      );
                                  })(i, e);
                              if (Ke(n)) {
                                  let t = e.isHorizontal();
                                  return { x: t ? n : null, y: t ? null : n };
                              }
                              return null;
                          })(t);
                })(t);
                return r instanceof Pd ? r : Ma(r, n);
            })(e),
            { chart: r, index: a, line: o, scale: s, axis: l } = e,
            h = o.options,
            c = h.fill,
            d = h.backgroundColor,
            { above: u = d, below: f = d } = c || {},
            g = r.getDatasetMeta(a),
            p = Hn(r, g);
        n &&
            o.points.length &&
            (qi(t, i),
            (function (t, e) {
                let { line: i, target: n, above: r, below: a, area: o, scale: s, clip: l } = e,
                    h = i._loop ? 'angle' : e.axis;
                t.save();
                let c = a;
                (a !== r &&
                    ('x' === h
                        ? (Da(t, n, o.top),
                          Ta(t, { line: i, target: n, color: r, scale: s, property: h, clip: l }),
                          t.restore(),
                          t.save(),
                          Da(t, n, o.bottom))
                        : 'y' === h &&
                          (Aa(t, n, o.left),
                          Ta(t, { line: i, target: n, color: a, scale: s, property: h, clip: l }),
                          t.restore(),
                          t.save(),
                          Aa(t, n, o.right),
                          (c = r))),
                    Ta(t, { line: i, target: n, color: c, scale: s, property: h, clip: l }),
                    t.restore());
            })(t, { line: o, target: n, above: u, below: f, area: i, scale: s, axis: l, clip: p }),
            Xi(t));
    }
    function Da(t, e, i) {
        let { segments: n, points: r } = e,
            a = 1,
            o = 0;
        t.beginPath();
        for (let s of n) {
            let { start: n, end: l } = s,
                h = r[n],
                c = r[_a(n, l, r)];
            (a ? (t.moveTo(h.x, h.y), (a = 0)) : (t.lineTo(h.x, i), t.lineTo(h.x, h.y)),
                (o = !!e.pathSegment(t, s, { move: o })),
                o ? t.closePath() : t.lineTo(c.x, i));
        }
        (t.lineTo(e.first().x, i), t.closePath(), t.clip());
    }
    function Aa(t, e, i) {
        let { segments: n, points: r } = e,
            a = 1,
            o = 0;
        t.beginPath();
        for (let s of n) {
            let { start: n, end: l } = s,
                h = r[n],
                c = r[_a(n, l, r)];
            (a ? (t.moveTo(h.x, h.y), (a = 0)) : (t.lineTo(i, h.y), t.lineTo(h.x, h.y)),
                (o = !!e.pathSegment(t, s, { move: o })),
                o ? t.closePath() : t.lineTo(i, c.y));
        }
        (t.lineTo(i, e.first().y), t.closePath(), t.clip());
    }
    function Ta(t, e) {
        let { line: i, target: n, property: r, color: a, scale: o, clip: s } = e,
            l = (function (t, e, i) {
                let n = t.segments,
                    r = t.points,
                    a = e.points,
                    o = [];
                for (let t of n) {
                    let { start: n, end: s } = t;
                    s = _a(n, s, r);
                    let l = ya(i, r[n], r[s], t.loop);
                    if (!e.segments) {
                        o.push({ source: t, target: l, start: r[n], end: r[s] });
                        continue;
                    }
                    let h = Vn(e, l);
                    for (let e of h) {
                        let n = ya(i, a[e.start], a[e.end], e.loop),
                            s = zn(t, r, n);
                        for (let t of s)
                            o.push({
                                source: t,
                                target: e,
                                start: { [i]: wa(l, n, 'start', Math.max) },
                                end: { [i]: wa(l, n, 'end', Math.min) }
                            });
                    }
                }
                return o;
            })(i, n, r);
        for (let { source: e, target: h, start: c, end: d } of l) {
            let { style: { backgroundColor: l = a } = {} } = e,
                u = 1 != n;
            (t.save(), (t.fillStyle = l), Oa(t, o, s, u && ya(r, c, d)), t.beginPath());
            let f,
                g = !!i.pathSegment(t, e);
            if (u) {
                g ? t.closePath() : Ra(t, n, d, r);
                let e = !!n.pathSegment(t, h, { move: g, reverse: 1 });
                ((f = g && e), f || Ra(t, n, c, r));
            }
            (t.closePath(), t.fill(f ? 'evenodd' : 'nonzero'), t.restore());
        }
    }
    function Oa(t, e, i, n) {
        let r = e.chart.chartArea,
            { property: a, start: o, end: s } = n || {};
        if ('x' === a || 'y' === a) {
            let e, n, l, h;
            ('x' === a
                ? ((e = o), (n = r.top), (l = s), (h = r.bottom))
                : ((e = r.left), (n = o), (l = r.right), (h = s)),
                t.beginPath(),
                i &&
                    ((e = Math.max(e, i.left)),
                    (l = Math.min(l, i.right)),
                    (n = Math.max(n, i.top)),
                    (h = Math.min(h, i.bottom))),
                t.rect(e, n, l - e, h - n),
                t.clip());
        }
    }
    function Ra(t, e, i, n) {
        let r = e.interpolate(i, n);
        r && t.lineTo(r.x, r.y);
    }
    function Ia(t, e) {
        return e * (t.text ? t.text.length : 0);
    }
    function $a(t, e) {
        return (e && (Ge(e) ? [].push.apply(t, e) : t.push(e)), t);
    }
    function Fa(t) {
        return ('string' == typeof t || t instanceof String) && t.indexOf('\n') > -1 ? t.split('\n') : t;
    }
    function za(t, e) {
        let { element: i, datasetIndex: n, index: r } = e,
            a = t.getDatasetMeta(n).controller,
            { label: o, value: s } = a.getLabelAndValue(r);
        return {
            chart: t,
            label: o,
            parsed: a.getParsed(r),
            raw: t.data.datasets[n].data[r],
            formattedValue: s,
            dataset: a.getDataset(),
            dataIndex: r,
            datasetIndex: n,
            element: i
        };
    }
    function Va(t, e) {
        let i = t.chart.ctx,
            { body: n, footer: r, title: a } = t,
            { boxWidth: o, boxHeight: s } = e,
            l = sn(e.bodyFont),
            h = sn(e.titleFont),
            c = sn(e.footerFont),
            d = a.length,
            u = r.length,
            f = n.length,
            g = on(e.padding),
            p = g.height,
            m = 0,
            b = n.reduce((t, e) => t + e.before.length + e.lines.length + e.after.length, 0);
        ((b += t.beforeBody.length + t.afterBody.length),
            d && (p += d * h.lineHeight + (d - 1) * e.titleSpacing + e.titleMarginBottom),
            b &&
                (p +=
                    f * (e.displayColors ? Math.max(s, l.lineHeight) : l.lineHeight) +
                    (b - f) * l.lineHeight +
                    (b - 1) * e.bodySpacing),
            u && (p += e.footerMarginTop + u * c.lineHeight + (u - 1) * e.footerSpacing));
        let v = 0,
            x = function (t) {
                m = Math.max(m, i.measureText(t).width + v);
            };
        return (
            i.save(),
            (i.font = h.string),
            ei(t.title, x),
            (i.font = l.string),
            ei(t.beforeBody.concat(t.afterBody), x),
            (v = e.displayColors ? o + 2 + e.boxPadding : 0),
            ei(n, (t) => {
                (ei(t.before, x), ei(t.lines, x), ei(t.after, x));
            }),
            (v = 0),
            (i.font = c.string),
            ei(t.footer, x),
            i.restore(),
            (m += g.width),
            { width: m, height: p }
        );
    }
    function Ba(t, e, i, n) {
        let { x: r, width: a } = i,
            {
                width: o,
                chartArea: { left: s, right: l }
            } = t,
            h = 'center';
        return (
            'center' === n
                ? (h = r <= (s + l) / 2 ? 'left' : 'right')
                : r <= a / 2
                  ? (h = 'left')
                  : r >= o - a / 2 && (h = 'right'),
            (function (t, e, i, n) {
                let { x: r, width: a } = n,
                    o = i.caretSize + i.caretPadding;
                if (('left' === t && r + a + o > e.width) || ('right' === t && r - a - o < 0)) return 1;
            })(h, t, e, i) && (h = 'center'),
            h
        );
    }
    function ja(t, e, i) {
        let n =
            i.yAlign ||
            e.yAlign ||
            (function (t, e) {
                let { y: i, height: n } = e;
                return i < n / 2 ? 'top' : i > t.height - n / 2 ? 'bottom' : 'center';
            })(t, i);
        return { xAlign: i.xAlign || e.xAlign || Ba(t, e, i, n), yAlign: n };
    }
    function Na(t, e, i, n) {
        let { caretSize: r, caretPadding: a, cornerRadius: o } = t,
            { xAlign: s, yAlign: l } = i,
            h = r + a,
            { topLeft: c, topRight: d, bottomLeft: u, bottomRight: f } = an(o),
            g = (function (t, e) {
                let { x: i, width: n } = t;
                return ('right' === e ? (i -= n) : 'center' === e && (i -= n / 2), i);
            })(e, s),
            p = (function (t, e, i) {
                let { y: n, height: r } = t;
                return ('top' === e ? (n += i) : (n -= 'bottom' === e ? r + i : r / 2), n);
            })(e, l, h);
        return (
            'center' === l
                ? 'left' === s
                    ? (g += h)
                    : 'right' === s && (g -= h)
                : 'left' === s
                  ? (g -= Math.max(c, u) + r)
                  : 'right' === s && (g += Math.max(d, f) + r),
            { x: Mi(g, 0, n.width - e.width), y: Mi(p, 0, n.height - e.height) }
        );
    }
    function Ha(t, e, i) {
        let n = on(i.padding);
        return 'center' === e ? t.x + t.width / 2 : 'right' === e ? t.x + t.width - n.right : t.x + n.left;
    }
    function Wa(t) {
        return $a([], Fa(t));
    }
    function Ua(t, e) {
        let i = e && e.dataset && e.dataset.tooltip && e.dataset.tooltip.callbacks;
        return i ? t.override(i) : t;
    }
    function Ya(t, e, i, n) {
        let r = t[e].call(i, n);
        return typeof r > 'u' ? Bd[e].call(i, n) : r;
    }
    function qa(t) {
        let e = this.getLabels();
        return t >= 0 && t < e.length ? e[t] : t;
    }
    function Xa(t, e, { horizontal: i, minRotation: n }) {
        let r = pi(n);
        return Math.min(e / ((i ? Math.sin(r) : Math.cos(r)) || 0.001), 0.75 * e * ('' + t).length);
    }
    function Ga(t) {
        return t / Math.pow(10, Gd(t)) === 1;
    }
    function Za(t, e, i) {
        let n = Math.pow(10, i),
            r = Math.floor(t / n);
        return Math.ceil(e / n) - r;
    }
    function Ka(t) {
        let e = t.ticks;
        if (e.display && t.display) {
            let t = on(e.backdropPadding);
            return Qe(e.font && e.font.size, ac.font.size) + t.height;
        }
        return 0;
    }
    function Ja(t, e, i) {
        return ((i = Ge(i) ? i : [i]), { w: ji(t, e.string, i), h: i.length * e.lineHeight });
    }
    function Qa(t, e, i, n, r) {
        return t === n || t === r
            ? { start: e - i / 2, end: e + i / 2 }
            : t < n || t > r
              ? { start: e - i, end: e }
              : { start: e, end: e + i };
    }
    function to(t, e, i, n, r) {
        let a = Math.abs(Math.sin(i)),
            o = Math.abs(Math.cos(i)),
            s = 0,
            l = 0;
        (n.start < e.l
            ? ((s = (e.l - n.start) / a), (t.l = Math.min(t.l, e.l - s)))
            : n.end > e.r && ((s = (n.end - e.r) / a), (t.r = Math.max(t.r, e.r + s))),
            r.start < e.t
                ? ((l = (e.t - r.start) / o), (t.t = Math.min(t.t, e.t - l)))
                : r.end > e.b && ((l = (r.end - e.b) / o), (t.b = Math.max(t.b, e.b + l))));
    }
    function eo(t, e, i) {
        let n = t.drawingArea,
            { extra: r, additionalAngle: a, padding: o, size: s } = i,
            l = t.getPointPosition(e, n + r + o, a),
            h = Math.round(mi(_i(l.angle + Ih))),
            c = (function (t, e, i) {
                return (90 === i || 270 === i ? (t -= e / 2) : (i > 270 || i < 90) && (t -= e), t);
            })(l.y, s.h, h),
            d = (function (t) {
                return 0 === t || 180 === t ? 'center' : t < 180 ? 'left' : 'right';
            })(h),
            u = (function (t, e, i) {
                return ('right' === i ? (t -= e) : 'center' === i && (t -= e / 2), t);
            })(l.x, s.w, d);
        return { visible: 1, x: l.x, y: c, textAlign: d, left: u, top: c, right: u + s.w, bottom: c + s.h };
    }
    function io(t, e) {
        if (!e) return 1;
        let { left: i, top: n, right: r, bottom: a } = t;
        return !(Yi({ x: i, y: n }, e) || Yi({ x: i, y: a }, e) || Yi({ x: r, y: n }, e) || Yi({ x: r, y: a }, e));
    }
    function no(t, e, i) {
        let { left: n, top: r, right: a, bottom: o } = i,
            { backdropColor: s } = e;
        if (!Xe(s)) {
            let i = an(e.borderRadius),
                l = on(e.backdropPadding);
            t.fillStyle = s;
            let h = n - l.left,
                c = r - l.top,
                d = a - n + l.width,
                u = o - r + l.height;
            Object.values(i).some((t) => 0 !== t)
                ? (t.beginPath(), tn(t, { x: h, y: c, w: d, h: u, radius: i }), t.fill())
                : t.fillRect(h, c, d, u);
        }
    }
    function ro(t, e, i, n) {
        let { ctx: r } = t;
        if (i) r.arc(t.xCenter, t.yCenter, e, 0, Ah);
        else {
            let i = t.getPointPosition(0, e);
            r.moveTo(i.x, i.y);
            for (let a = 1; a < n; a++) ((i = t.getPointPosition(a, e)), r.lineTo(i.x, i.y));
        }
    }
    function ao(t, e) {
        return t - e;
    }
    function oo(t, e) {
        if (Xe(e)) return null;
        let i = t._adapter,
            { parser: n, round: r, isoWeekday: a } = t._parseOpts,
            o = e;
        return (
            'function' == typeof n && (o = n(o)),
            Ke(o) || (o = 'string' == typeof n ? i.parse(o, n) : i.parse(o)),
            null === o
                ? null
                : (r && (o = 'week' !== r || (!fi(a) && 1 != a) ? i.startOf(o, r) : i.startOf(o, 'isoWeek', a)), +o)
        );
    }
    function so(t, e, i, n) {
        let r = tu.length;
        for (let a = tu.indexOf(t); a < r - 1; ++a) {
            let t = Qd[tu[a]];
            if (t.common && Math.ceil((i - e) / ((t.steps ? t.steps : Number.MAX_SAFE_INTEGER) * t.size)) <= n)
                return tu[a];
        }
        return tu[r - 1];
    }
    function lo(t, e, i) {
        if (i) {
            if (i.length) {
                let { lo: n, hi: r } = Si(i, e);
                t[i[n] >= e ? i[n] : i[r]] = 1;
            }
        } else t[e] = 1;
    }
    function ho(t, e, i) {
        let n,
            r,
            a = [],
            o = {},
            s = e.length;
        for (n = 0; n < s; ++n) ((r = e[n]), (o[r] = n), a.push({ value: r, major: 0 }));
        return 0 !== s && i
            ? (function (t, e, i, n) {
                  let r,
                      a,
                      o = t._adapter,
                      s = +o.startOf(e[0].value, n),
                      l = e[e.length - 1].value;
                  for (r = s; r <= l; r = +o.add(r, 1, n)) ((a = i[r]), a >= 0 && (e[a].major = 1));
                  return e;
              })(t, a, o, i)
            : a;
    }
    function co(t, e, i) {
        let n,
            r,
            a,
            o,
            s = 0,
            l = t.length - 1;
        i
            ? (e >= t[s].pos && e <= t[l].pos && ({ lo: s, hi: l } = Bh(t, 'pos', e)),
              ({ pos: n, time: a } = t[s]),
              ({ pos: r, time: o } = t[l]))
            : (e >= t[s].time && e <= t[l].time && ({ lo: s, hi: l } = Bh(t, 'time', e)),
              ({ time: n, pos: a } = t[s]),
              ({ time: r, pos: o } = t[l]));
        let h = r - n;
        return h ? a + ((o - a) * (e - n)) / h : a;
    }
    async function uo() {
        await u();
        let e = o('accountSettingsContainer', 'div');
        if (!e) return;
        let i = await x();
        if (((e.innerHTML = ''), !i.user)) return (e.innerHTML = '<p>You must be logged in to use this page!</p>');
        a(e, [
            r('h2', { innerText: 'General Actions', className: 'accountSettingsHeader' }),
            r('div', {}, ['split', 'accountSettingsSplit'])
        ]);
        let n = r('button', { innerHTML: d('logout') + ' Logout', type: 'button' }),
            l = r('button', {
                innerHTML: d('logout') + ' Logout All Sessions',
                type: 'button',
                className: 'dangerButton'
            }),
            c = r('button', { innerHTML: d('switch_account') + ' Switch Accounts', type: 'button' });
        (a(e, [n, c, l]),
            n.addEventListener('click', async () => {
                mo.location.href = '/logout?single=true';
            }),
            l.addEventListener('click', async () => {
                mo.location.href = '/logout';
            }),
            c.addEventListener('click', async () => {
                (mo.sessionStorage.setItem('LoginRedirect', mo.location.href),
                    (mo.location.href = '/logout?switch=true&single=true'));
            }),
            a(e, [
                r('h2', { innerText: 'Card Background Photo', className: 'accountSettingsHeader' }),
                r('div', {}, ['split', 'accountSettingsSplit']),
                r('a', {
                    innerHTML: d('image') + " Click here to change your card's background photo.",
                    href: '/app/account/card-backgrounds',
                    id: 'clickHereToChangeCardBackground'
                }),
                r('p', {
                    innerHTML: 'This is the photo that will be used as the background of your card.',
                    id: 'cardBackgroundThisPhotoWillBeUsedParagraph'
                })
            ]));
        let f = r('div', { innerHTML: '<p>Loading...</p>' });
        (a(e, [f]),
            (async () => {
                let t = await (
                    await fetch('/api/account/card-background').catch(() => ({
                        json: async () => (m('Failed to load card background photo.', 0), { result: null })
                    }))
                ).json();
                if (t.result) {
                    f.innerHTML = '';
                    let e = r('img', { id: 'currentCardImage' });
                    ((e.src = t.result.webPath), a(f, [e]));
                } else {
                    ((f.innerHTML = ''),
                        a(f, [
                            r('p', {
                                innerHTML:
                                    'You have not set a card background photo yet. Click the button above to set one.'
                            })
                        ]));
                    let t = s('cardBackgroundThisPhotoWillBeUsedParagraph');
                    t && t.remove();
                }
            })(),
            a(e, [
                r('h2', { innerText: 'Account Data', className: 'accountSettingsHeader' }),
                r('div', {}, ['split', 'accountSettingsSplit'])
            ]));
        let g = r('button', { type: 'button', innerHTML: d('folder_zip') + ' Download Account Data' });
        (g.addEventListener('click', async () => {
            if (Ee('downloadData')) return;
            Pe('downloadData');
            let t = p(g, d('hourglass_empty') + 'Downloading...'),
                e = await (async function () {
                    function t() {
                        return new Promise(async (t) => {
                            ((e.innerHTML =
                                e.innerHTML +
                                '<altcha-widget challengeurl="/api/captcha/get" hidelogo hidefooter></altcha-widget>'),
                                a(
                                    e,
                                    r('i', {
                                        innerHTML:
                                            'Having trouble? <a target="_blank" href="https://discord.jtoh.pro">Let us know.</a>'
                                    })
                                ),
                                (e.style.display = ''),
                                await Promise.resolve().then(() => (ih(), zo)));
                            let i = ((await (function (t, e) {
                                let i = po.getElementsByClassName(t);
                                return new Promise(
                                    i && i.length >= (e.amount ?? 1)
                                        ? (t) => t(i)
                                        : (n) => {
                                              let r, a;
                                              ((a = setInterval(() => {
                                                  let o = po.getElementsByClassName(t);
                                                  o &&
                                                      i.length >= (e.amount ?? 1) &&
                                                      (clearInterval(a), clearTimeout(r), n(o));
                                              }, e.interval ?? 100)),
                                                  (r = setTimeout(() => {
                                                      (clearInterval(a), n(null));
                                                  }, e.timeout ?? 5e3)));
                                          }
                                );
                            })('altcha-checkbox', {})) ?? [])[0];
                            (po.querySelector('altcha-widget')?.addEventListener('statechange', (i) => {
                                'verified' === i.detail.state &&
                                    ((e.style.bottom = '-300px'),
                                    setTimeout(() => {
                                        e.remove();
                                    }, 1e3),
                                    t(i.detail.payload));
                            }),
                                setTimeout(() => {
                                    e.style.bottom = '';
                                }, 500),
                                setTimeout(() => {
                                    i?.firstElementChild?.click();
                                }, 1e3));
                        });
                    }
                    await u();
                    let e = s('captchaContainer');
                    if (
                        (e &&
                            (console.warn(
                                'Legacy captcha container found, they should no longer be created or used, as they will be skipped.'
                            ),
                            e.remove()),
                        (e = r('div', { id: 'captchaContainer' })),
                        a(
                            e,
                            r('p', {
                                innerHTML:
                                    'An action you are trying to perform requires a captcha. <br>Please wait a moment as we verify that you are not a robot.'
                            })
                        ),
                        (e.style.display = 'none'),
                        (e.style.bottom = '-300px'),
                        a(po.documentElement, e),
                        await (async function () {
                            return (await v(), Mo ? null !== Mo.user : 0);
                        })())
                    ) {
                        let i = mo.sessionStorage.getItem('captchaGateway');
                        if (
                            1 ==
                            (
                                await (
                                    i
                                        ? await fetch('/api/captcha/verify?token=' + i).catch(() => ({
                                              json() {
                                                  return { success: 0 };
                                              }
                                          }))
                                        : {
                                              json() {
                                                  return { success: 0 };
                                              }
                                          }
                                ).json()
                            ).success
                        )
                            return (e.remove(), i ?? '');
                        {
                            let e = await t(),
                                i = await fetch('/api/captcha/gateway?token=' + e).catch(() => {});
                            if (!i) return await t();
                            let n = await i.json();
                            if (n.error) return await t();
                            let r = n.token;
                            return (mo.sessionStorage.setItem('captchaGateway', r), r);
                        }
                    }
                    return await t();
                })();
            e || po.location.reload();
            let i = r('a', { download: 'account-data.zip', href: '/api/account/download-data?captcha=' + e });
            (i.click(), t());
            let n = p(g, d('check') + 'Done!');
            (await h(2e3), n(), De('downloadData'), i.remove());
        }),
            a(e, [
                g,
                r(
                    'p',
                    { innerText: 'Use the button above to download your account data.' },
                    [],
                    [
                        r(
                            'span',
                            {
                                innerHTML:
                                    d('warning') +
                                    'The information found in your account data should NOT be shared with anyone.'
                            },
                            ['dangerInfoBox']
                        )
                    ]
                )
            ]),
            a(e, [
                r('h2', { innerText: 'Account Punishments', className: 'accountSettingsHeader' }),
                r('div', {}, ['split', 'accountSettingsSplit']),
                r(
                    'p',
                    {
                        innerText:
                            'Account punishments are restrictions placed by staff members which prevent you from completing specific actions. These restrictions are only placed on users who violate our guidelines.'
                    },
                    []
                )
            ]));
        let b = await await fetch('/api/account/punishments')
            .then((t) => t.json())
            .catch(() => ({ result: [] }));
        if (0 === b.result.length)
            a(e, [
                r('p', {
                    innerText:
                        'You have no account punishments at this time. This means your account is in good standing!',
                    id: 'accountSettingsNoPunishments'
                })
            ]);
        else {
            let t = r('div', { id: 'accountSettingsPunishmentsList' });
            a(e, [t]);
            for (let e of b.result) {
                let i = r('div', {
                    innerHTML: `<span class="accountSettingsPunishmentType">${d('warning')} ${e.punishmentType}</span> - ${e.reason}`,
                    className: 'accountSettingsPunishmentItem'
                });
                ((i.innerHTML += e.expires
                    ? `<br><span class="accountSettingsPunishmentExpires">Expires on ${new Date(e.expires).toLocaleString()}</span>`
                    : '<br><span class="accountSettingsPunishmentExpires">This punishment does not expire.</span>'),
                    a(t, [i]));
            }
        }
        let y = await (await fetch(i.admin ? '/api/refs/list' : '/api/refs/viewable')).json();
        if (y.codes.length > 0) {
            (t('success', 'User can view the following referral codes: ' + y.codes.join(', ')),
                a(e, [
                    r('h2', { innerText: 'Referral Codes', className: 'accountSettingsHeader' }),
                    r('div', {}, ['split', 'accountSettingsSplit']),
                    r(
                        'p',
                        {
                            innerText:
                                'Referral codes allow you to track how many clicks your links have received. All codes you have access to view are listed below. Please contact our partnership email for assistance.'
                        },
                        []
                    )
                ]));
            let i = r('div', { id: 'accountSettingsReferralCodesList' });
            a(e, [i]);
            for (let t of y.codes) {
                let e = await (await fetch('/api/refs/stats/' + t)).json(),
                    n = r('div', { className: 'accountSettingsReferralCodeItem' }),
                    o = r('h3', { innerHTML: `${d('star')} ${t}`, className: 'accountSettingsReferralCodeHeader' }),
                    s = r('p', {
                        className: 'accountSettingsReferralStats',
                        innerHTML: `<b>Today</b>:  ${_o.format(e.stats.today)} <b>This Week:</b> ${_o.format(e.stats.week)} <b>This Month:</b> ${_o.format(e.stats.month)} <b>This Year:</b> ${_o.format(e.stats.year)} <b>Total:</b> ${_o.format(e.stats.total)}`
                    }),
                    l = r('canvas', { className: 'accountSettingsReferralChart' });
                (new vd(l, {
                    type: 'line',
                    data: {
                        labels: e.data.map((t) =>
                            new Date(t.date).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })
                        ),
                        datasets: [
                            {
                                label: 'Clicks',
                                data: e.data.map((t) => t.views),
                                fill: 0,
                                tension: 0.1,
                                backgroundColor: '#ff4336',
                                borderColor: '#f7685e',
                                pointRadius: 0
                            }
                        ]
                    },
                    options: {
                        font: { family: 'Poppins' },
                        plugins: {
                            legend: { labels: { color: '#ebebeb', font: { family: 'Poppins' } } },
                            title: {
                                display: 0,
                                text: 'Daily Referrals - ' + t,
                                color: '#ebebeb',
                                font: { family: 'Poppins' }
                            }
                        },
                        layout: { padding: 10 },
                        scales: {
                            y: { grid: { color: '#828282' }, ticks: { color: '#ebebeb' } },
                            x: { grid: { color: '#828282' }, ticks: { color: '#ebebeb' } }
                        }
                    }
                }),
                    a(n, [o, s, l]),
                    a(i, [n]));
            }
        }
    }
    function fo() {
        let t = po.documentElement,
            e = mo.localStorage.getItem('theme');
        e ? (i(t, e), uu.emit('applied', e)) : (i(t, 'themesDark'), uu.emit('applied', 'themesDark'));
    }
    function go(t) {
        let e = po.documentElement,
            i = mo.localStorage;
        (e.classList.forEach((t) => {
            t.startsWith('themes') && n(e, t);
        }),
            i.setItem('theme', t),
            fo());
    }
    var po,
        mo,
        bo,
        vo,
        xo,
        yo,
        _o,
        wo,
        Mo,
        ko = Object.create,
        So = Object.defineProperty,
        Co = Object.getOwnPropertyDescriptor,
        Lo = Object.getOwnPropertyNames,
        Eo = Object.getPrototypeOf,
        Po = {}.hasOwnProperty,
        Do = (t, e) => () => (t && (e = t((t = 0))), e),
        Ao = (t, e) => {
            for (var i in e) So(t, i, { get: e[i], enumerable: 1 });
        },
        To = Do(() => {
            ((po = globalThis.document), (mo = globalThis.window));
        }),
        Oo = Do(() => {
            ((bo = 0), (vo = 0), (xo = { info: '#00bfff', warn: '#ffa500', error: '#ff4500', success: '#32cd32' }));
        }),
        Ro = Do(() => {
            (To(), Oo(), (yo = 0));
        }),
        Io = Do(() => {
            ((_o = new Intl.NumberFormat()), new Intl.DateTimeFormat());
        }),
        $o = Do(() => {
            (To(), Io(), Ro());
        }),
        Fo = Do(() => {
            (To(), $o(), Ro(), (wo = po.location.href), (Mo = null));
        }),
        zo = {};
    Ao(zo, { Altcha: () => ke });
    var Vo,
        Bo,
        jo,
        No,
        Ho,
        Wo,
        Uo,
        Yo,
        qo,
        Xo,
        Go,
        Zo,
        Ko,
        Jo,
        Qo,
        ts,
        es,
        is,
        ns,
        rs,
        as,
        os,
        ss,
        ls,
        hs,
        cs,
        ds,
        us,
        fs,
        gs,
        ps,
        ms,
        bs,
        vs,
        xs,
        ys,
        _s,
        ws,
        Ms,
        ks,
        Ss,
        Cs,
        Ls,
        Es,
        Ps,
        Ds,
        As,
        Ts,
        Os,
        Rs,
        Is,
        $s,
        Fs,
        zs,
        Vs,
        Bs,
        js,
        Ns,
        Hs,
        Ws,
        Us,
        Ys,
        qs,
        Xs,
        Gs,
        Zs,
        Ks,
        Js,
        Qs,
        tl,
        el,
        il,
        nl,
        rl,
        al,
        ol,
        sl,
        ll,
        hl,
        cl,
        dl,
        ul,
        fl,
        gl,
        pl,
        ml,
        bl,
        vl,
        xl,
        yl,
        _l,
        wl,
        Ml,
        kl,
        Sl,
        Cl,
        Ll,
        El,
        Pl,
        Dl,
        Al,
        Tl,
        Ol,
        Rl,
        Il,
        $l,
        Fl,
        zl,
        Vl,
        Bl,
        jl,
        Nl,
        Hl,
        Wl,
        Ul,
        Yl,
        ql,
        Xl,
        Gl,
        Zl,
        Kl,
        Jl,
        Ql,
        th,
        eh,
        ih = Do(() => {
            var t;
            ((Vo = Object.defineProperty),
                (Bo = (t) => {
                    throw TypeError(t);
                }),
                (jo = (t, e, i) =>
                    e in t ? Vo(t, e, { enumerable: 1, configurable: 1, writable: 1, value: i }) : (t[e] = i)),
                (No = (t, e, i) => jo(t, 'symbol' != typeof e ? e + '' : e, i)),
                (Ho = (t, e, i) => e.has(t) || Bo('Cannot ' + i)),
                (Wo = (t, e, i) => (Ho(t, e, 'read from private field'), i ? i.call(t) : e.get(t))),
                (Uo = (t, e, i) =>
                    e.has(t)
                        ? Bo('Cannot add the same private member more than once')
                        : e instanceof WeakSet
                          ? e.add(t)
                          : e.set(t, i)),
                (Yo = (t, e, i, n) => (Ho(t, e, 'write to private field'), n ? n.call(t, i) : e.set(t, i), i)),
                (qo =
                    '(function(){"use strict";const d=new TextEncoder;function p(e){return[...new Uint8Array(e)].map(t=>t.toString(16).padStart(2,"0")).join("")}async function b(e,t,r){if(typeof crypto>"u"||!("subtle"in crypto)||!("digest"in crypto.subtle))throw new Error("Web Crypto is not available. Secure context is required (https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).");return p(await crypto.subtle.digest(r.toUpperCase(),d.encode(e+t)))}function w(e,t,r="SHA-256",n=1e6,s=0){const o=new AbortController,a=Date.now();return{promise:(async()=>{for(let c=s;c<=n;c+=1){if(o.signal.aborted)return null;if(await b(t,c,r)===e)return{number:c,took:Date.now()-a}}return null})(),controller:o}}function h(e){const t=atob(e),r=new Uint8Array(t.length);for(let n=0;n<t.length;n++)r[n]=t.charCodeAt(n);return r}function g(e,t=12){const r=new Uint8Array(t);for(let n=0;n<t;n++)r[n]=e%256,e=Math.floor(e/256);return r}async function m(e,t="",r=1e6,n=0){const s="AES-GCM",o=new AbortController,a=Date.now(),l=async()=>{for(let u=n;u<=r;u+=1){if(o.signal.aborted||!c||!y)return null;try{const f=await crypto.subtle.decrypt({name:s,iv:g(u)},c,y);if(f)return{clearText:new TextDecoder().decode(f),took:Date.now()-a}}catch{}}return null};let c=null,y=null;try{y=h(e);const u=await crypto.subtle.digest("SHA-256",d.encode(t));c=await crypto.subtle.importKey("raw",u,s,!1,["decrypt"])}catch{return{promise:Promise.reject(),controller:o}}return{promise:l(),controller:o}}let i;onmessage=async e=>{const{type:t,payload:r,start:n,max:s}=e.data;let o=null;if(t==="abort")i==null||i.abort(),i=void 0;else if(t==="work"){if("obfuscated"in r){const{key:a,obfuscated:l}=r||{};o=await m(l,a,s,n)}else{const{algorithm:a,challenge:l,salt:c}=r||{};o=w(l,c,a,s,n)}i=o.controller,o.promise.then(a=>{self.postMessage(a&&{...a,worker:!0})})}}})();\n'),
                (Xo = typeof self < 'u' && self.Blob && new Blob([qo], { type: 'text/javascript;charset=utf-8' })),
                typeof window < 'u' &&
                    ((Go = window.__svelte ?? (window.__svelte = {})).v ?? (Go.v = new Set())).add('5'),
                (Zo = 1),
                (Ko = 4),
                (Jo = 8),
                (Qo = 16),
                (ts = 1),
                (es = 2),
                (is = '['),
                (ns = '[!'),
                (rs = ']'),
                (as = {}),
                (os = Symbol()),
                (ss = 'http://www.w3.org/1999/xhtml'),
                (ls = Array.isArray),
                (hs = [].indexOf),
                (cs = Array.from),
                (ds = Object.keys),
                (us = Object.defineProperty),
                (fs = Object.getOwnPropertyDescriptor),
                (gs = Object.getOwnPropertyDescriptors),
                (ps = Object.prototype),
                (ms = Array.prototype),
                (bs = Object.getPrototypeOf),
                (vs = Object.isExtensible),
                (xs = () => {}),
                (ys = 2),
                (_s = 4),
                (ws = 8),
                (Ms = 16),
                (ks = 32),
                (Ss = 64),
                (Cs = 128),
                (Ls = 256),
                (Es = 512),
                (Ps = 1024),
                (Ds = 2048),
                (As = 4096),
                (Ts = 8192),
                (Os = 16384),
                (Rs = 32768),
                (Is = 65536),
                ($s = 1 << 19),
                (Fs = 1 << 20),
                (zs = 1 << 21),
                (Vs = Symbol('$state')),
                (Bs = Symbol('legacy props')),
                (js = Symbol('')),
                (Ns = 0),
                (Xs = typeof requestIdleCallback > 'u' ? (t) => setTimeout(t, 1) : requestIdleCallback),
                (Gs = []),
                (Zs = []),
                (Ks = 0),
                (Js = 0),
                (Qs = null),
                (tl = 0),
                (el = 0),
                (il = []),
                (nl = null),
                (rl = 0),
                (al = null),
                (ol = null),
                (sl = null),
                (ll = 0),
                (hl = null),
                (cl = 1),
                (dl = 0),
                (ul = 0),
                (fl = -7169),
                (gl = new Map()),
                (pl = null),
                (ml = ['touchstart', 'touchmove']),
                (bl = 0),
                (vl = new Set()),
                (xl = new Set()),
                (yl = new Map()),
                (_l = new WeakMap()),
                (wl = [...' \t\n\r\f \v\ufeff']),
                (Ml = Symbol('is custom element')),
                (kl = Symbol('is html')),
                (Sl = new Map()),
                (Cl = []),
                (Ll = 0),
                (El = Symbol()),
                (Al = class {
                    constructor(t) {
                        (Uo(this, Pl), Uo(this, Dl));
                        var e,
                            i = new Map(),
                            n = (t, e) => {
                                var n = Ft(e);
                                return (i.set(t, n), n);
                            };
                        let r = new Proxy(
                            { ...(t.props || {}), $$events: {} },
                            {
                                get(t, e) {
                                    return Tt(i.get(e) ?? n(e, Reflect.get(t, e)));
                                },
                                has(t, e) {
                                    return e === Bs ? 1 : (Tt(i.get(e) ?? n(e, Reflect.get(t, e))), Reflect.has(t, e));
                                },
                                set(t, e, r) {
                                    return (zt(i.get(e) ?? n(e, r), r), Reflect.set(t, e, r));
                                }
                            }
                        );
                        (Yo(
                            this,
                            Dl,
                            (t.hydrate ? ee : te)(t.component, {
                                target: t.target,
                                anchor: t.anchor,
                                props: r,
                                context: t.context,
                                intro: t.intro ?? 0,
                                recover: t.recover
                            })
                        ),
                            (!(null != (e = t?.props) && e.$$host) || 0 == t.sync) && Dt(),
                            Yo(this, Pl, r.$$events));
                        for (let t of Object.keys(Wo(this, Dl)))
                            '$set' === t ||
                                '$destroy' === t ||
                                '$on' === t ||
                                us(this, t, {
                                    get() {
                                        return Wo(this, Dl)[t];
                                    },
                                    set(e) {
                                        Wo(this, Dl)[t] = e;
                                    },
                                    enumerable: 1
                                });
                        ((Wo(this, Dl).$set = (t) => {
                            Object.assign(r, t);
                        }),
                            (Wo(this, Dl).$destroy = () => {
                                !(function (t) {
                                    let e = _l.get(t);
                                    e ? (_l.delete(t), e(void 0)) : Promise.resolve();
                                })(Wo(this, Dl));
                            }));
                    }
                    $set(t) {
                        Wo(this, Dl).$set(t);
                    }
                    $on(t, e) {
                        Wo(this, Pl)[t] = Wo(this, Pl)[t] || [];
                        let i = (...t) => e.call(this, ...t);
                        return (
                            Wo(this, Pl)[t].push(i),
                            () => {
                                Wo(this, Pl)[t] = Wo(this, Pl)[t].filter((t) => t !== i);
                            }
                        );
                    }
                    $destroy() {
                        Wo(this, Dl).$destroy();
                    }
                }),
                (Pl = new WeakMap()),
                (Dl = new WeakMap()),
                'function' == typeof HTMLElement &&
                    (Tl = class extends HTMLElement {
                        constructor(t, e, i) {
                            (super(),
                                No(this, '$$ctor'),
                                No(this, '$$s'),
                                No(this, '$$c'),
                                No(this, '$$cn', 0),
                                No(this, '$$d', {}),
                                No(this, '$$r', 0),
                                No(this, '$$p_d', {}),
                                No(this, '$$l', {}),
                                No(this, '$$l_u', new Map()),
                                No(this, '$$me'),
                                (this.$$ctor = t),
                                (this.$$s = e),
                                i && this.attachShadow({ mode: 'open' }));
                        }
                        addEventListener(t, e, i) {
                            if (((this.$$l[t] = this.$$l[t] || []), this.$$l[t].push(e), this.$$c)) {
                                let i = this.$$c.$on(t, e);
                                this.$$l_u.set(e, i);
                            }
                            super.addEventListener(t, e, i);
                        }
                        removeEventListener(t, e, i) {
                            if ((super.removeEventListener(t, e, i), this.$$c)) {
                                let t = this.$$l_u.get(e);
                                t && (t(), this.$$l_u.delete(e));
                            }
                        }
                        async connectedCallback() {
                            if (((this.$$cn = 1), !this.$$c)) {
                                let t = function (t) {
                                    return (e) => {
                                        let i = document.createElement('slot');
                                        ('default' !== t && (i.name = t), Qt(e, i));
                                    };
                                };
                                if ((await Promise.resolve(), !this.$$cn || this.$$c)) return;
                                let e = {},
                                    i = (function (t) {
                                        let e = {};
                                        return (
                                            t.childNodes.forEach((t) => {
                                                e[t.slot || 'default'] = 1;
                                            }),
                                            e
                                        );
                                    })(this);
                                for (let n of this.$$s)
                                    n in i &&
                                        ('default' !== n || this.$$d.children
                                            ? (e[n] = t(n))
                                            : ((this.$$d.children = t(n)), (e.default = 1)));
                                for (let t of this.attributes) {
                                    let e = this.$$g_p(t.name);
                                    e in this.$$d || (this.$$d[e] = me(e, t.value, this.$$p_d, 'toProp'));
                                }
                                for (let t in this.$$p_d)
                                    !(t in this.$$d) && void 0 !== this[t] && ((this.$$d[t] = this[t]), delete this[t]);
                                ((this.$$c = (function (t) {
                                    return new Al(t);
                                })({
                                    component: this.$$ctor,
                                    target: this.shadowRoot || this,
                                    props: { ...this.$$d, $$slots: e, $$host: this }
                                })),
                                    (this.$$me = (function (t) {
                                        let e = U(Ss, t, 1);
                                        return () => {
                                            et(e);
                                        };
                                    })(() => {
                                        G(() => {
                                            var t;
                                            this.$$r = 1;
                                            for (let e of ds(this.$$c)) {
                                                if (null == (t = this.$$p_d[e]) || !t.reflect) continue;
                                                this.$$d[e] = this.$$c[e];
                                                let i = me(e, this.$$d[e], this.$$p_d, 'toAttribute');
                                                null == i
                                                    ? this.removeAttribute(this.$$p_d[e].attribute || e)
                                                    : this.setAttribute(this.$$p_d[e].attribute || e, i);
                                            }
                                            this.$$r = 0;
                                        });
                                    })));
                                for (let t in this.$$l)
                                    for (let e of this.$$l[t]) {
                                        let i = this.$$c.$on(t, e);
                                        this.$$l_u.set(e, i);
                                    }
                                this.$$l = {};
                            }
                        }
                        attributeChangedCallback(t, e, i) {
                            var n;
                            this.$$r ||
                                ((t = this.$$g_p(t)),
                                (this.$$d[t] = me(t, i, this.$$p_d, 'toProp')),
                                null == (n = this.$$c) || n.$set({ [t]: this.$$d[t] }));
                        }
                        disconnectedCallback() {
                            ((this.$$cn = 0),
                                Promise.resolve().then(() => {
                                    !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), (this.$$c = void 0));
                                }));
                        }
                        $$g_p(t) {
                            return (
                                ds(this.$$p_d).find(
                                    (e) =>
                                        this.$$p_d[e].attribute === t ||
                                        (!this.$$p_d[e].attribute && e.toLowerCase() === t)
                                ) || t
                            );
                        }
                    }),
                (Ol = new TextEncoder()),
                ((t = Rl || {}).CODE = 'code'),
                (t.ERROR = 'error'),
                (t.VERIFIED = 'verified'),
                (t.VERIFYING = 'verifying'),
                (t.UNVERIFIED = 'unverified'),
                (t.EXPIRED = 'expired'),
                (Rl = t),
                (Il = ((t) => (
                    (t.ERROR = 'error'),
                    (t.LOADING = 'loading'),
                    (t.PLAYING = 'playing'),
                    (t.PAUSED = 'paused'),
                    (t.READY = 'ready'),
                    t
                ))(Il || {})),
                (globalThis.altchaPlugins = globalThis.altchaPlugins || []),
                (globalThis.altchaI18n = globalThis.altchaI18n || {
                    get: (t) => fe(globalThis.altchaI18n.store)[t],
                    set(t, e) {
                        (Object.assign(fe(globalThis.altchaI18n.store), { [t]: e }),
                            globalThis.altchaI18n.store.set(fe(globalThis.altchaI18n.store)));
                    },
                    store: ue({})
                }),
                globalThis.altchaI18n.set('en', {
                    ariaLinkLabel: 'Visit Altcha.org',
                    enterCode: 'Enter code',
                    enterCodeAria: 'Enter code you hear. Press Space to play audio.',
                    error: 'Verification failed. Try again later.',
                    expired: 'Verification expired. Try again.',
                    footer: 'Protected by <a href="https://altcha.org/" target="_blank" aria-label="Visit Altcha.org">ALTCHA</a>',
                    getAudioChallenge: 'Get an audio challenge',
                    label: "I'm not a robot",
                    loading: 'Loading...',
                    reload: 'Reload',
                    verify: 'Verify',
                    verificationRequired: 'Verification required!',
                    verified: 'Verified',
                    verifying: 'Verifying...',
                    waitAlert: 'Verifying... please wait.'
                }),
                ($l = (t, e) => {
                    let i = (function (t) {
                        let e = B(t);
                        return ((e.equals = V), e);
                    })(() =>
                        (function (t, e, i = 0) {
                            return void 0 === t ? (i ? e() : e) : t;
                        })(e?.(), 24)
                    );
                    var n = Fl();
                    (Z(() => {
                        (oe(n, 'width', Tt(i)), oe(n, 'height', Tt(i)));
                    }),
                        Qt(t, n));
                }),
                (Fl = Kt(
                    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="altcha-spinner"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" fill="currentColor" opacity=".25"></path><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" fill="currentColor"></path></svg>'
                )),
                (zl = Zt('<input type="hidden">')),
                (Vl = Zt(
                    '<div><a target="_blank" class="altcha-logo" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.33955 16.4279C5.88954 20.6586 12.1971 21.2105 16.4279 17.6604C18.4699 15.947 19.6548 13.5911 19.9352 11.1365L17.9886 10.4279C17.8738 12.5624 16.909 14.6459 15.1423 16.1284C11.7577 18.9684 6.71167 18.5269 3.87164 15.1423C1.03163 11.7577 1.4731 6.71166 4.8577 3.87164C8.24231 1.03162 13.2883 1.4731 16.1284 4.8577C16.9767 5.86872 17.5322 7.02798 17.804 8.2324L19.9522 9.01429C19.7622 7.07737 19.0059 5.17558 17.6604 3.57212C14.1104 -0.658624 7.80283 -1.21043 3.57212 2.33956C-0.658625 5.88958 -1.21046 12.1971 2.33955 16.4279Z" fill="currentColor"></path><path d="M3.57212 2.33956C1.65755 3.94607 0.496389 6.11731 0.12782 8.40523L2.04639 9.13961C2.26047 7.15832 3.21057 5.25375 4.8577 3.87164C8.24231 1.03162 13.2883 1.4731 16.1284 4.8577L13.8302 6.78606L19.9633 9.13364C19.7929 7.15555 19.0335 5.20847 17.6604 3.57212C14.1104 -0.658624 7.80283 -1.21043 3.57212 2.33956Z" fill="currentColor"></path><path d="M7 10H5C5 12.7614 7.23858 15 10 15C12.7614 15 15 12.7614 15 10H13C13 11.6569 11.6569 13 10 13C8.3431 13 7 11.6569 7 10Z" fill="currentColor"></path></svg></a></div>'
                )),
                (Bl = Kt(
                    '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM10.9999 16.0002V18.0002H12.9999V16.0002H10.9999ZM10.9999 9.00017V14.0002H12.9999V9.00017H10.9999Z"></path></svg>'
                )),
                (jl = Kt(
                    '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V7ZM7 7C7 6.44772 7.44772 6 8 6C8.55228 6 9 6.44772 9 7V17C9 17.5523 8.55228 18 8 18C7.44772 18 7 17.5523 7 17V7Z"></path></svg>'
                )),
                (Nl = Kt(
                    '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12H7C8.10457 12 9 12.8954 9 14V19C9 20.1046 8.10457 21 7 21H4C2.89543 21 2 20.1046 2 19V12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12V19C22 20.1046 21.1046 21 20 21H17C15.8954 21 15 20.1046 15 19V14C15 12.8954 15.8954 12 17 12H20C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12Z"></path></svg>'
                )),
                (Hl = Zt('<button type="button" class="altcha-code-challenge-audio"><!></button>')),
                (Wl = Zt('<audio hidden autoplay><source></audio>')),
                (Ul = Zt(
                    '<div class="altcha-code-challenge" role="dialog"><div class="altcha-code-challenge-arrow"></div> <form data-code-challenge-form="1"><img class="altcha-code-challenge-image" alt=""> <input type="text" autocomplete="off" name="code" class="altcha-code-challenge-input" required> <div class="altcha-code-challenge-buttons"><div class="altcha-code-challenge-buttons-left"><!> <button type="button" class="altcha-code-challenge-reload"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2V4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 9.25022 5.38734 6.82447 7.50024 5.38451L7.5 8H9.5V2L3.5 2V4L5.99918 3.99989C3.57075 5.82434 2 8.72873 2 12Z"></path></svg></button></div> <button type="submit" class="altcha-code-challenge-verify"><!> </button></div> <!></form></div>'
                )),
                (Yl = Zt('<div><!></div>')),
                (ql = Zt('<div><!></div>')),
                (Xl = Zt(
                    '<div class="altcha-error"><svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg> <!></div>'
                )),
                (Gl = Zt('<div class="altcha-footer"><div><!></div></div>')),
                (Zl = Zt('<div class="altcha-anchor-arrow"></div>')),
                (Kl = Zt(
                    '<!> <div class="altcha"><div class="altcha-main"><div><!> <input type="checkbox"></div> <label class="altcha-label"><!></label> <!> <!> <!></div> <!> <!> <!></div>',
                    1
                )),
                (function (t) {
                    for (var e = 0; e < t.length; e++) vl.add(t[e]);
                    for (var i of xl) i(t);
                })(['change', 'keydown', 'click']),
                customElements.define(
                    'altcha-widget',
                    (function (t, e, i) {
                        let n = class extends Tl {
                            constructor() {
                                (super(t, i, 0), (this.$$p_d = e));
                            }
                            static get observedAttributes() {
                                return ds(e).map((t) => (e[t].attribute || t).toLowerCase());
                            }
                        };
                        return (
                            ds(e).forEach((t) => {
                                us(n.prototype, t, {
                                    get() {
                                        return this.$$c && t in this.$$c ? this.$$c[t] : this.$$d[t];
                                    },
                                    set(i) {
                                        var n;
                                        ((i = me(t, i, e)), (this.$$d[t] = i));
                                        var r = this.$$c;
                                        r &&
                                            ((null == (n = fs(r, t)) ? void 0 : n.get)
                                                ? (r[t] = i)
                                                : r.$set({ [t]: i }));
                                    }
                                });
                            }),
                            [
                                'clarify',
                                'configure',
                                'getConfiguration',
                                'getFloatingAnchor',
                                'getPlugin',
                                'getState',
                                'hide',
                                'repositionFloating',
                                'reset',
                                'setFloatingAnchor',
                                'setState',
                                'show',
                                'verify'
                            ].forEach((t) => {
                                us(n.prototype, t, {
                                    get() {
                                        var e;
                                        return null == (e = this.$$c) ? void 0 : e[t];
                                    }
                                });
                            }),
                            (t.element = n),
                            n
                        );
                    })(
                        ke,
                        {
                            blockspam: { type: 'Boolean' },
                            debug: { type: 'Boolean' },
                            delay: { type: 'Number' },
                            disableautofocus: { type: 'Boolean' },
                            expire: { type: 'Number' },
                            floatingoffset: { type: 'Number' },
                            hidefooter: { type: 'Boolean' },
                            hidelogo: { type: 'Boolean' },
                            maxnumber: { type: 'Number' },
                            mockerror: { type: 'Boolean' },
                            refetchonexpire: { type: 'Boolean' },
                            test: { type: 'Boolean' },
                            workers: { type: 'Number' },
                            auto: {},
                            challengeurl: {},
                            challengejson: {},
                            credentials: {},
                            customfetch: {},
                            floating: {},
                            floatinganchor: {},
                            floatingpersist: {},
                            id: {},
                            language: {},
                            name: {},
                            obfuscated: {},
                            overlay: {},
                            overlaycontent: {},
                            plugins: {},
                            sentinel: {},
                            spamfilter: {},
                            strings: {},
                            verifyurl: {},
                            workerurl: {}
                        },
                        ['default']
                    )
                ),
                (Jl =
                    '@keyframes overlay-slidein{to{opacity:1;top:50%}}@keyframes altcha-spinner{to{transform:rotate(360deg)}}.altcha{background:var(--altcha-color-base, transparent);border:var(--altcha-border-width, 1px) solid var(--altcha-color-border, #a0a0a0);border-radius:var(--altcha-border-radius, 3px);color:var(--altcha-color-text, currentColor);display:flex;flex-direction:column;max-width:var(--altcha-max-width, 260px);position:relative}.altcha:focus-within{border-color:var(--altcha-color-border-focus, currentColor)}.altcha[data-floating]{background:var(--altcha-color-base, white);display:none;filter:drop-shadow(3px 3px 6px rgba(0,0,0,.2));left:-100%;position:fixed;top:-100%;width:var(--altcha-max-width, 260px);z-index:999999}.altcha[data-floating=top] .altcha-anchor-arrow{border-bottom-color:transparent;border-top-color:var(--altcha-color-border, #a0a0a0);bottom:-12px;top:auto}.altcha[data-floating=bottom]:focus-within::after{border-bottom-color:var(--altcha-color-border-focus, currentColor)}.altcha[data-floating=top]:focus-within::after{border-top-color:var(--altcha-color-border-focus, currentColor)}.altcha[data-floating]:not([data-state=unverified]){display:block}.altcha-anchor-arrow{border:6px solid transparent;border-bottom-color:var(--altcha-color-border, #a0a0a0);content:"";height:0;left:12px;position:absolute;top:-12px;width:0}.altcha-main{align-items:center;display:flex;gap:.4rem;padding:.7rem;position:relative}.altcha-code-challenge{background:var(--altcha-color-base, white);border:1px solid var(--altcha-color-border-focus, currentColor);border-radius:var(--altcha-border-radius, 3px);filter:drop-shadow(3px 3px 6px rgba(0,0,0,.2));padding:.5rem;position:absolute;top:2.5rem;z-index:9999999}.altcha-code-challenge>form{display:flex;flex-direction:column;gap:.5rem}.altcha-code-challenge-input{border:1px solid currentColor;border-radius:3px;box-sizing:border-box;outline:0;font-size:16px;padding:.35rem;width:220px}.altcha-code-challenge-input:focus{outline:2px solid color-mix(in srgb,var(--altcha-color-active, #1D1DC9) 20%,transparent)}.altcha-code-challenge-input:disabled{opacity:.7}.altcha-code-challenge-image{background-color:#fff;border:1px solid currentColor;border-radius:3px;box-sizing:border-box;object-fit:contain;height:50px;width:220px}.altcha-code-challenge-audio,.altcha-code-challenge-reload{background:color-mix(in srgb,var(--altcha-color-text, currentColor) 10%,transparent);border:0;border-radius:3px;color:var(--altcha-color-text, currentColor);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:.35rem}.altcha-code-challenge-audio:disabled,.altcha-code-challenge-reload:disabled,.altcha-code-challenge-verify:disabled{opacity:.7;pointer-events:none}.altcha-code-challenge-audio>*,.altcha-code-challenge-reload>*{height:20px;width:20px}.altcha-code-challenge-buttons{display:flex;justify-content:space-between}.altcha-code-challenge-buttons-left{display:flex;gap:.25rem}.altcha-code-challenge-verify{align-items:center;background:var(--altcha-color-active, #1D1DC9);border:0;border-radius:3px;color:#fff;cursor:pointer;display:flex;gap:.5rem;font-size:100%;padding:.35rem 1rem}.altcha-code-challenge-arrow{border:6px solid transparent;border-bottom-color:var(--altcha-color-border, currentColor);content:"";height:0;left:.15rem;position:absolute;top:-12px;width:0}.altcha[data-floating=top] .altcha-code-challenge{top:-150px}.altcha[data-floating=top] .altcha-code-challenge-arrow{border-bottom-color:transparent;border-top-color:var(--altcha-color-border, currentColor);bottom:-12px;top:auto}.altcha-label{cursor:pointer;flex-grow:1}.altcha-logo{color:currentColor!important;opacity:.7}.altcha-footer:hover,.altcha-logo:hover{opacity:1}.altcha-error{color:var(--altcha-color-error-text, #f23939);display:flex;font-size:.85rem;gap:.3rem;padding:0 .7rem .7rem}.altcha-footer{align-items:center;background-color:var(--altcha-color-footer-bg, transparent);display:flex;font-size:.75rem;opacity:.7;justify-content:end;padding:.2rem .7rem}.altcha-footer a{color:currentColor}.altcha-checkbox{display:flex;align-items:center;justify-content:center;height:24px;position:relative;width:24px}.altcha-checkbox .altcha-spinner{bottom:0;left:0;position:absolute;right:0;top:0}.altcha-checkbox input{width:18px;height:18px;margin:0}.altcha-checkbox-verifying input{appearance:none;opacity:0;pointer-events:none}.altcha-spinner{animation:altcha-spinner .75s infinite linear;transform-origin:center}.altcha-overlay{--altcha-color-base:#fff;--altcha-color-text:#000;animation:overlay-slidein .5s forwards;display:flex;flex-direction:column;gap:.5rem;left:50%;width:260px;opacity:0;position:fixed;top:45%;transform:translate(-50%,-50%)}.altcha-overlay-backdrop{background:rgba(0,0,0,.5);bottom:0;display:none;left:0;position:fixed;right:0;top:0;z-index:99999999}.altcha-overlay-close-button{align-self:flex-end;background:0 0;border:0;padding:.25rem;cursor:pointer;color:currentColor;font-size:130%;line-height:1;opacity:.7}@media (max-height:450px){.altcha-overlay{top:10%!important;transform:translate(-50%,0)}}'),
                (globalThis.altchaCreateWorker = (t) => (t ? new Worker(new URL(t)) : new y())),
                Se(Jl),
                Se(Jl));
        }),
        nh = Do(() => {
            (To(),
                Ro(),
                Fo(),
                Oo(),
                (globalThis.jp_toggleDevBanner = function () {
                    let e = s('devBanner');
                    return (
                        e
                            ? (e.remove(),
                              mo.sessionStorage.setItem('ignoreDevBanner', 'true'),
                              t('success', 'Development banner hidden. Run "jp_toggleDevBanner()" to show it again.'))
                            : (Ce(),
                              mo.sessionStorage.setItem('ignoreDevBanner', 'false'),
                              t('success', 'Development banner shown. Run "jp_toggleDevBanner()" to hide it again.'),
                              Ce()),
                        'jp_toggleDevBanner() has been called. The banner is now ' + (e ? 'hidden' : 'shown') + '.'
                    );
                }));
        }),
        rh = Do(() => {
            Ql = {};
        }),
        ah =
            ((th = (t, e) => {
                function i() {
                    i.init.call(this);
                }
                function n(t) {
                    if ('function' != typeof t)
                        throw new TypeError(
                            'The "listener" argument must be of type Function. Received type ' + typeof t
                        );
                }
                function r(t) {
                    return void 0 === t._maxListeners ? i.defaultMaxListeners : t._maxListeners;
                }
                function a(t, e, i, a) {
                    var o, s, l;
                    if (
                        (n(i),
                        void 0 === (s = t._events)
                            ? ((s = t._events = Object.create(null)), (t._eventsCount = 0))
                            : (void 0 !== s.newListener &&
                                  (t.emit('newListener', e, i.listener ? i.listener : i), (s = t._events)),
                              (l = s[e])),
                        void 0 === l)
                    )
                        ((l = s[e] = i), ++t._eventsCount);
                    else if (
                        ('function' == typeof l ? (l = s[e] = a ? [i, l] : [l, i]) : a ? l.unshift(i) : l.push(i),
                        (o = r(t)) > 0 && l.length > o && !l.warned)
                    ) {
                        l.warned = 1;
                        var h = Error(
                            'Possible EventEmitter memory leak detected. ' +
                                l.length +
                                ' ' +
                                e +
                                ' listeners added. Use emitter.setMaxListeners() to increase limit'
                        );
                        ((h.name = 'MaxListenersExceededWarning'),
                            (h.emitter = t),
                            (h.type = e),
                            (h.count = l.length),
                            (function (t) {
                                console && console.warn && console.warn(t);
                            })(h));
                    }
                    return t;
                }
                function o() {
                    if (!this.fired)
                        return (
                            this.target.removeListener(this.type, this.wrapFn),
                            (this.fired = 1),
                            0 === arguments.length
                                ? this.listener.call(this.target)
                                : this.listener.apply(this.target, arguments)
                        );
                }
                function s(t, e, i) {
                    var n = { fired: 0, wrapFn: void 0, target: t, type: e, listener: i },
                        r = o.bind(n);
                    return ((r.listener = i), (n.wrapFn = r), r);
                }
                function l(t, e, i) {
                    var n = t._events;
                    if (void 0 === n) return [];
                    var r = n[e];
                    return void 0 === r
                        ? []
                        : 'function' == typeof r
                          ? i
                              ? [r.listener || r]
                              : [r]
                          : i
                            ? (function (t) {
                                  for (var e = Array(t.length), i = 0; i < e.length; ++i) e[i] = t[i].listener || t[i];
                                  return e;
                              })(r)
                            : c(r, r.length);
                }
                function h(t) {
                    var e = this._events;
                    if (void 0 !== e) {
                        var i = e[t];
                        if ('function' == typeof i) return 1;
                        if (void 0 !== i) return i.length;
                    }
                    return 0;
                }
                function c(t, e) {
                    for (var i = Array(e), n = 0; n < e; ++n) i[n] = t[n];
                    return i;
                }
                function d(t, e, i, n) {
                    if ('function' == typeof t.on) n.once ? t.once(e, i) : t.on(e, i);
                    else {
                        if ('function' != typeof t.addEventListener)
                            throw new TypeError(
                                'The "emitter" argument must be of type EventEmitter. Received type ' + typeof t
                            );
                        t.addEventListener(e, function r(a) {
                            (n.once && t.removeEventListener(e, r), i(a));
                        });
                    }
                }
                var u,
                    f = 'object' == typeof Reflect ? Reflect : null,
                    g =
                        f && 'function' == typeof f.apply
                            ? f.apply
                            : function (t, e, i) {
                                  return function () {}.apply.call(t, e, i);
                              };
                u =
                    f && 'function' == typeof f.ownKeys
                        ? f.ownKeys
                        : Object.getOwnPropertySymbols
                          ? function (t) {
                                return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t));
                            }
                          : function (t) {
                                return Object.getOwnPropertyNames(t);
                            };
                var p =
                    Number.isNaN ||
                    function (t) {
                        return t != t;
                    };
                ((e.exports = i),
                    (e.exports.once = function (t, e) {
                        return new Promise(function (i, n) {
                            function r(i) {
                                (t.removeListener(e, a), n(i));
                            }
                            function a() {
                                ('function' == typeof t.removeListener && t.removeListener('error', r),
                                    i([].slice.call(arguments)));
                            }
                            (d(t, e, a, { once: 1 }),
                                'error' !== e &&
                                    (function (t, e) {
                                        'function' == typeof t.on && d(t, 'error', e, { once: 1 });
                                    })(t, r));
                        });
                    }),
                    (i.EventEmitter = i),
                    (i.prototype._events = void 0),
                    (i.prototype._eventsCount = 0),
                    (i.prototype._maxListeners = void 0));
                var m = 10;
                (Object.defineProperty(i, 'defaultMaxListeners', {
                    enumerable: 1,
                    get() {
                        return m;
                    },
                    set(t) {
                        if ('number' != typeof t || t < 0 || p(t))
                            throw new RangeError(
                                'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                                    t +
                                    '.'
                            );
                        m = t;
                    }
                }),
                    (i.init = function () {
                        ((void 0 === this._events || this._events === Object.getPrototypeOf(this)._events) &&
                            ((this._events = Object.create(null)), (this._eventsCount = 0)),
                            (this._maxListeners = this._maxListeners || void 0));
                    }),
                    (i.prototype.setMaxListeners = function (t) {
                        if ('number' != typeof t || t < 0 || p(t))
                            throw new RangeError(
                                'The value of "n" is out of range. It must be a non-negative number. Received ' +
                                    t +
                                    '.'
                            );
                        return ((this._maxListeners = t), this);
                    }),
                    (i.prototype.getMaxListeners = function () {
                        return r(this);
                    }),
                    (i.prototype.emit = function (t) {
                        for (var e = [], i = 1; i < arguments.length; i++) e.push(arguments[i]);
                        var n = 'error' === t,
                            r = this._events;
                        if (void 0 !== r) n = n && void 0 === r.error;
                        else if (!n) return 0;
                        if (n) {
                            var a;
                            if ((e.length > 0 && (a = e[0]), a instanceof Error)) throw a;
                            var o = Error('Unhandled error.' + (a ? ' (' + a.message + ')' : ''));
                            throw ((o.context = a), o);
                        }
                        var s = r[t];
                        if (void 0 === s) return 0;
                        if ('function' == typeof s) g(s, this, e);
                        else {
                            var l = s.length,
                                h = c(s, l);
                            for (i = 0; i < l; ++i) g(h[i], this, e);
                        }
                        return 1;
                    }),
                    (i.prototype.on = i.prototype.addListener =
                        function (t, e) {
                            return a(this, t, e, 0);
                        }),
                    (i.prototype.prependListener = function (t, e) {
                        return a(this, t, e, 1);
                    }),
                    (i.prototype.once = function (t, e) {
                        return (n(e), this.on(t, s(this, t, e)), this);
                    }),
                    (i.prototype.prependOnceListener = function (t, e) {
                        return (n(e), this.prependListener(t, s(this, t, e)), this);
                    }),
                    (i.prototype.off = i.prototype.removeListener =
                        function (t, e) {
                            var i, r, a, o, s;
                            if ((n(e), void 0 === (r = this._events))) return this;
                            if (void 0 === (i = r[t])) return this;
                            if (i === e || i.listener === e)
                                0 === --this._eventsCount
                                    ? (this._events = Object.create(null))
                                    : (delete r[t],
                                      r.removeListener && this.emit('removeListener', t, i.listener || e));
                            else if ('function' != typeof i) {
                                for (a = -1, o = i.length - 1; o >= 0; o--)
                                    if (i[o] === e || i[o].listener === e) {
                                        ((s = i[o].listener), (a = o));
                                        break;
                                    }
                                if (a < 0) return this;
                                (0 === a
                                    ? i.shift()
                                    : (function (t, e) {
                                          for (; e + 1 < t.length; e++) t[e] = t[e + 1];
                                          t.pop();
                                      })(i, a),
                                    1 === i.length && (r[t] = i[0]),
                                    void 0 !== r.removeListener && this.emit('removeListener', t, s || e));
                            }
                            return this;
                        }),
                    (i.prototype.removeAllListeners = function (t) {
                        var e, i, n;
                        if (void 0 === (i = this._events)) return this;
                        if (void 0 === i.removeListener)
                            return (
                                0 === arguments.length
                                    ? ((this._events = Object.create(null)), (this._eventsCount = 0))
                                    : void 0 !== i[t] &&
                                      (0 === --this._eventsCount ? (this._events = Object.create(null)) : delete i[t]),
                                this
                            );
                        if (0 === arguments.length) {
                            var r,
                                a = Object.keys(i);
                            for (n = 0; n < a.length; ++n)
                                'removeListener' !== (r = a[n]) && this.removeAllListeners(r);
                            return (
                                this.removeAllListeners('removeListener'),
                                (this._events = Object.create(null)),
                                (this._eventsCount = 0),
                                this
                            );
                        }
                        if ('function' == typeof (e = i[t])) this.removeListener(t, e);
                        else if (void 0 !== e) for (n = e.length - 1; n >= 0; n--) this.removeListener(t, e[n]);
                        return this;
                    }),
                    (i.prototype.listeners = function (t) {
                        return l(this, t, 1);
                    }),
                    (i.prototype.rawListeners = function (t) {
                        return l(this, t, 0);
                    }),
                    (i.listenerCount = function (t, e) {
                        return 'function' == typeof t.listenerCount ? t.listenerCount(e) : h.call(t, e);
                    }),
                    (i.prototype.listenerCount = h),
                    (i.prototype.eventNames = function () {
                        return this._eventsCount > 0 ? u(this._events) : [];
                    }));
            }),
            () => (eh || th((eh = { exports: {} }), eh), eh.exports)),
        oh = {};
    Ao(oh, { default: () => Ae });
    var sh,
        lh,
        hh,
        ch,
        dh,
        uh,
        fh,
        gh,
        ph,
        mh,
        bh,
        vh,
        xh,
        yh,
        _h,
        wh,
        Mh,
        kh,
        Sh,
        Ch,
        Lh,
        Eh,
        Ph,
        Dh,
        Ah,
        Th,
        Oh,
        Rh,
        Ih,
        $h,
        Fh,
        zh,
        Vh,
        Bh,
        jh,
        Nh,
        Hh,
        Wh,
        Uh,
        Yh,
        qh,
        Xh,
        Gh,
        Zh,
        Kh,
        Jh,
        Qh,
        tc,
        ec,
        ic,
        nc,
        rc,
        ac,
        oc,
        sc,
        lc,
        hc,
        cc,
        dc,
        uc,
        fc,
        gc,
        pc,
        mc,
        bc,
        vc,
        xc,
        yc,
        _c,
        wc,
        Mc,
        kc,
        Sc,
        Cc,
        Lc,
        Ec,
        Pc,
        Dc,
        Ac,
        Tc,
        Oc,
        Rc,
        Ic,
        $c,
        Fc,
        zc,
        Vc,
        Bc,
        jc,
        Nc,
        Hc,
        Wc,
        Uc,
        Yc,
        qc,
        Xc,
        Gc,
        Zc,
        Kc,
        Jc,
        Qc,
        td,
        ed,
        id,
        nd,
        rd,
        ad,
        od,
        sd,
        ld,
        hd,
        cd,
        dd,
        ud,
        fd,
        gd,
        pd,
        md,
        bd,
        vd,
        xd,
        yd,
        _d,
        wd,
        Md,
        kd,
        Sd,
        Cd,
        Ld,
        Ed,
        Pd,
        Dd,
        Ad,
        Td,
        Od,
        Rd,
        Id,
        $d,
        Fd,
        zd,
        Vd,
        Bd,
        jd,
        Nd,
        Hd,
        Wd,
        Ud,
        Yd,
        qd,
        Xd,
        Gd,
        Zd,
        Kd,
        Jd,
        Qd,
        tu,
        eu,
        iu,
        nu,
        ru,
        au = Do(() => {
            (Fo(), Ro());
        }),
        ou = Do(() => {
            ((sh = (t, e, i) => Math.max(Math.min(t, i), e)),
                (lh = {
                    0: 0,
                    1: 1,
                    2: 2,
                    3: 3,
                    4: 4,
                    5: 5,
                    6: 6,
                    7: 7,
                    8: 8,
                    9: 9,
                    A: 10,
                    B: 11,
                    C: 12,
                    D: 13,
                    E: 14,
                    F: 15,
                    a: 10,
                    b: 11,
                    c: 12,
                    d: 13,
                    e: 14,
                    f: 15
                }),
                (hh = [...'0123456789ABCDEF']),
                (ch = (t) => hh[15 & t]),
                (dh = (t) => hh[(240 & t) >> 4] + hh[15 & t]),
                (uh = (t) => (240 & t) >> 4 == (15 & t)),
                (fh = (t) => uh(t.r) && uh(t.g) && uh(t.b) && uh(t.a)),
                (gh = (t, e) => (t < 255 ? e(t) : '')),
                (ph =
                    /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/),
                (mh = {
                    x: 'dark',
                    Z: 'light',
                    Y: 're',
                    X: 'blu',
                    W: 'gr',
                    V: 'medium',
                    U: 'slate',
                    A: 'ee',
                    T: 'ol',
                    S: 'or',
                    B: 'ra',
                    C: 'lateg',
                    D: 'ights',
                    R: 'in',
                    Q: 'turquois',
                    E: 'hi',
                    P: 'ro',
                    O: 'al',
                    N: 'le',
                    M: 'de',
                    L: 'yello',
                    F: 'en',
                    K: 'ch',
                    G: 'arks',
                    H: 'ea',
                    I: 'ightg',
                    J: 'wh'
                }),
                (bh = {
                    OiceXe: 'f0f8ff',
                    antiquewEte: 'faebd7',
                    aqua: 'ffff',
                    aquamarRe: '7fffd4',
                    azuY: 'f0ffff',
                    beige: 'f5f5dc',
                    bisque: 'ffe4c4',
                    black: '0',
                    blanKedOmond: 'ffebcd',
                    Xe: 'ff',
                    XeviTet: '8a2be2',
                    bPwn: 'a52a2a',
                    burlywood: 'deb887',
                    caMtXe: '5f9ea0',
                    KartYuse: '7fff00',
                    KocTate: 'd2691e',
                    cSO: 'ff7f50',
                    cSnflowerXe: '6495ed',
                    cSnsilk: 'fff8dc',
                    crimson: 'dc143c',
                    cyan: 'ffff',
                    xXe: '8b',
                    xcyan: '8b8b',
                    xgTMnPd: 'b8860b',
                    xWay: 'a9a9a9',
                    xgYF: '6400',
                    xgYy: 'a9a9a9',
                    xkhaki: 'bdb76b',
                    xmagFta: '8b008b',
                    xTivegYF: '556b2f',
                    xSange: 'ff8c00',
                    xScEd: '9932cc',
                    xYd: '8b0000',
                    xsOmon: 'e9967a',
                    xsHgYF: '8fbc8f',
                    xUXe: '483d8b',
                    xUWay: '2f4f4f',
                    xUgYy: '2f4f4f',
                    xQe: 'ced1',
                    xviTet: '9400d3',
                    dAppRk: 'ff1493',
                    dApskyXe: 'bfff',
                    dimWay: '696969',
                    dimgYy: '696969',
                    dodgerXe: '1e90ff',
                    fiYbrick: 'b22222',
                    flSOwEte: 'fffaf0',
                    foYstWAn: '228b22',
                    fuKsia: 'ff00ff',
                    gaRsbSo: 'dcdcdc',
                    ghostwEte: 'f8f8ff',
                    gTd: 'ffd700',
                    gTMnPd: 'daa520',
                    Way: '808080',
                    gYF: '8000',
                    gYFLw: 'adff2f',
                    gYy: '808080',
                    honeyMw: 'f0fff0',
                    hotpRk: 'ff69b4',
                    RdianYd: 'cd5c5c',
                    Rdigo: '4b0082',
                    ivSy: 'fffff0',
                    khaki: 'f0e68c',
                    lavFMr: 'e6e6fa',
                    lavFMrXsh: 'fff0f5',
                    lawngYF: '7cfc00',
                    NmoncEffon: 'fffacd',
                    ZXe: 'add8e6',
                    ZcSO: 'f08080',
                    Zcyan: 'e0ffff',
                    ZgTMnPdLw: 'fafad2',
                    ZWay: 'd3d3d3',
                    ZgYF: '90ee90',
                    ZgYy: 'd3d3d3',
                    ZpRk: 'ffb6c1',
                    ZsOmon: 'ffa07a',
                    ZsHgYF: '20b2aa',
                    ZskyXe: '87cefa',
                    ZUWay: '778899',
                    ZUgYy: '778899',
                    ZstAlXe: 'b0c4de',
                    ZLw: 'ffffe0',
                    lime: 'ff00',
                    limegYF: '32cd32',
                    lRF: 'faf0e6',
                    magFta: 'ff00ff',
                    maPon: '800000',
                    VaquamarRe: '66cdaa',
                    VXe: 'cd',
                    VScEd: 'ba55d3',
                    VpurpN: '9370db',
                    VsHgYF: '3cb371',
                    VUXe: '7b68ee',
                    VsprRggYF: 'fa9a',
                    VQe: '48d1cc',
                    VviTetYd: 'c71585',
                    midnightXe: '191970',
                    mRtcYam: 'f5fffa',
                    mistyPse: 'ffe4e1',
                    moccasR: 'ffe4b5',
                    navajowEte: 'ffdead',
                    navy: '80',
                    Tdlace: 'fdf5e6',
                    Tive: '808000',
                    TivedBb: '6b8e23',
                    Sange: 'ffa500',
                    SangeYd: 'ff4500',
                    ScEd: 'da70d6',
                    pOegTMnPd: 'eee8aa',
                    pOegYF: '98fb98',
                    pOeQe: 'afeeee',
                    pOeviTetYd: 'db7093',
                    papayawEp: 'ffefd5',
                    pHKpuff: 'ffdab9',
                    peru: 'cd853f',
                    pRk: 'ffc0cb',
                    plum: 'dda0dd',
                    powMrXe: 'b0e0e6',
                    purpN: '800080',
                    YbeccapurpN: '663399',
                    Yd: 'ff0000',
                    Psybrown: 'bc8f8f',
                    PyOXe: '4169e1',
                    saddNbPwn: '8b4513',
                    sOmon: 'fa8072',
                    sandybPwn: 'f4a460',
                    sHgYF: '2e8b57',
                    sHshell: 'fff5ee',
                    siFna: 'a0522d',
                    silver: 'c0c0c0',
                    skyXe: '87ceeb',
                    UXe: '6a5acd',
                    UWay: '708090',
                    UgYy: '708090',
                    snow: 'fffafa',
                    sprRggYF: 'ff7f',
                    stAlXe: '4682b4',
                    tan: 'd2b48c',
                    teO: '8080',
                    tEstN: 'd8bfd8',
                    tomato: 'ff6347',
                    Qe: '40e0d0',
                    viTet: 'ee82ee',
                    JHt: 'f5deb3',
                    wEte: 'ffffff',
                    wEtesmoke: 'f5f5f5',
                    Lw: 'ffff00',
                    LwgYF: '9acd32'
                }),
                (xh =
                    /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/),
                (yh = (t) => (t <= 0.0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055)),
                (_h = (t) => (t <= 0.04045 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4))),
                (wh = class t {
                    constructor(e) {
                        if (e instanceof t) return e;
                        let i,
                            n = typeof e;
                        ('object' === n
                            ? (i = Ye(e))
                            : 'string' === n &&
                              (i =
                                  (function (t) {
                                      var e,
                                          i = t.length;
                                      return (
                                          '#' === t[0] &&
                                              (4 === i || 5 === i
                                                  ? (e = {
                                                        r: 255 & (17 * lh[t[1]]),
                                                        g: 255 & (17 * lh[t[2]]),
                                                        b: 255 & (17 * lh[t[3]]),
                                                        a: 5 === i ? 17 * lh[t[4]] : 255
                                                    })
                                                  : (7 === i || 9 === i) &&
                                                    (e = {
                                                        r: (lh[t[1]] << 4) | lh[t[2]],
                                                        g: (lh[t[3]] << 4) | lh[t[4]],
                                                        b: (lh[t[5]] << 4) | lh[t[6]],
                                                        a: 9 === i ? (lh[t[7]] << 4) | lh[t[8]] : 255
                                                    })),
                                          e
                                      );
                                  })(e) ||
                                  (function (t) {
                                      vh ||
                                          ((vh = (function () {
                                              let t,
                                                  e,
                                                  i,
                                                  n,
                                                  r,
                                                  a = {},
                                                  o = Object.keys(bh),
                                                  s = Object.keys(mh);
                                              for (t = 0; t < o.length; t++) {
                                                  for (n = r = o[t], e = 0; e < s.length; e++)
                                                      ((i = s[e]), (r = r.replace(i, mh[i])));
                                                  ((i = parseInt(bh[n], 16)),
                                                      (a[r] = [(i >> 16) & 255, (i >> 8) & 255, 255 & i]));
                                              }
                                              return a;
                                          })()),
                                          (vh.transparent = [0, 0, 0, 0]));
                                      let e = vh[t.toLowerCase()];
                                      return e && { r: e[0], g: e[1], b: e[2], a: 4 === e.length ? e[3] : 255 };
                                  })(e) ||
                                  (function (t) {
                                      return 'r' === t.charAt(0)
                                          ? (function (t) {
                                                let e,
                                                    i,
                                                    n,
                                                    r = xh.exec(t),
                                                    a = 255;
                                                if (r) {
                                                    if (r[7] !== e) {
                                                        let t = +r[7];
                                                        a = r[8] ? Oe(t) : sh(255 * t, 0, 255);
                                                    }
                                                    return (
                                                        (e = +r[1]),
                                                        (i = +r[3]),
                                                        (n = +r[5]),
                                                        (e = 255 & (r[2] ? Oe(e) : sh(e, 0, 255))),
                                                        (i = 255 & (r[4] ? Oe(i) : sh(i, 0, 255))),
                                                        (n = 255 & (r[6] ? Oe(n) : sh(n, 0, 255))),
                                                        { r: e, g: i, b: n, a: a }
                                                    );
                                                }
                                            })(t)
                                          : (function (t) {
                                                let e,
                                                    i = ph.exec(t),
                                                    n = 255;
                                                if (!i) return;
                                                i[5] !== e && (n = i[6] ? Oe(+i[5]) : Re(+i[5]));
                                                let r = He(+i[2]),
                                                    a = +i[3] / 100,
                                                    o = +i[4] / 100;
                                                return (
                                                    (e =
                                                        'hwb' === i[1]
                                                            ? (function (t, e, i) {
                                                                  return je(Ve, t, e, i);
                                                              })(r, a, o)
                                                            : 'hsv' === i[1]
                                                              ? (function (t, e, i) {
                                                                    return je(ze, t, e, i);
                                                                })(r, a, o)
                                                              : Ne(r, a, o)),
                                                    { r: e[0], g: e[1], b: e[2], a: n }
                                                );
                                            })(t);
                                  })(e)),
                            (this._rgb = i),
                            (this._valid = !!i));
                    }
                    get valid() {
                        return this._valid;
                    }
                    get rgb() {
                        var t = Ue(this._rgb);
                        return (t && (t.a = Ie(t.a)), t);
                    }
                    set rgb(t) {
                        this._rgb = Ye(t);
                    }
                    rgbString() {
                        return this._valid
                            ? (function (t) {
                                  return (
                                      t &&
                                      (t.a < 255
                                          ? `rgba(${t.r}, ${t.g}, ${t.b}, ${Ie(t.a)})`
                                          : `rgb(${t.r}, ${t.g}, ${t.b})`)
                                  );
                              })(this._rgb)
                            : void 0;
                    }
                    hexString() {
                        return this._valid
                            ? (function (t) {
                                  var e = fh(t) ? ch : dh;
                                  return t ? '#' + e(t.r) + e(t.g) + e(t.b) + gh(t.a, e) : void 0;
                              })(this._rgb)
                            : void 0;
                    }
                    hslString() {
                        return this._valid
                            ? (function (t) {
                                  if (!t) return;
                                  let e = Be(t),
                                      i = e[0],
                                      n = $e(e[1]),
                                      r = $e(e[2]);
                                  return t.a < 255 ? `hsla(${i}, ${n}%, ${r}%, ${Ie(t.a)})` : `hsl(${i}, ${n}%, ${r}%)`;
                              })(this._rgb)
                            : void 0;
                    }
                    mix(t, e) {
                        if (t) {
                            let i,
                                n = this.rgb,
                                r = t.rgb,
                                a = e === i ? 0.5 : e,
                                o = 2 * a - 1,
                                s = n.a - r.a,
                                l = ((o * s === -1 ? o : (o + s) / (1 + o * s)) + 1) / 2;
                            ((i = 1 - l),
                                (n.r = 255 & (l * n.r + i * r.r + 0.5)),
                                (n.g = 255 & (l * n.g + i * r.g + 0.5)),
                                (n.b = 255 & (l * n.b + i * r.b + 0.5)),
                                (n.a = a * n.a + (1 - a) * r.a),
                                (this.rgb = n));
                        }
                        return this;
                    }
                    interpolate(t, e) {
                        return (
                            t &&
                                (this._rgb = (function (t, e, i) {
                                    let n = _h(Ie(t.r)),
                                        r = _h(Ie(t.g)),
                                        a = _h(Ie(t.b));
                                    return {
                                        r: Re(yh(n + i * (_h(Ie(e.r)) - n))),
                                        g: Re(yh(r + i * (_h(Ie(e.g)) - r))),
                                        b: Re(yh(a + i * (_h(Ie(e.b)) - a))),
                                        a: t.a + i * (e.a - t.a)
                                    };
                                })(this._rgb, t._rgb, e)),
                            this
                        );
                    }
                    clone() {
                        return new t(this.rgb);
                    }
                    alpha(t) {
                        return ((this._rgb.a = Re(t)), this);
                    }
                    clearer(t) {
                        return ((this._rgb.a *= 1 - t), this);
                    }
                    greyscale() {
                        let t = this._rgb,
                            e = Te(0.3 * t.r + 0.59 * t.g + 0.11 * t.b);
                        return ((t.r = t.g = t.b = e), this);
                    }
                    opaquer(t) {
                        return ((this._rgb.a *= 1 + t), this);
                    }
                    negate() {
                        let t = this._rgb;
                        return ((t.r = 255 - t.r), (t.g = 255 - t.g), (t.b = 255 - t.b), this);
                    }
                    lighten(t) {
                        return (We(this._rgb, 2, t), this);
                    }
                    darken(t) {
                        return (We(this._rgb, 2, -t), this);
                    }
                    saturate(t) {
                        return (We(this._rgb, 1, t), this);
                    }
                    desaturate(t) {
                        return (We(this._rgb, 1, -t), this);
                    }
                    rotate(t) {
                        return (
                            (function (t, e) {
                                var i = Be(t);
                                ((i[0] = He(i[0] + e)), (i = Ne(i)), (t.r = i[0]), (t.g = i[1]), (t.b = i[2]));
                            })(this._rgb, t),
                            this
                        );
                    }
                }));
        }),
        su = Do(() => {
            (ou(),
                (Mh = (() => {
                    let t = 0;
                    return () => t++;
                })()),
                (kh = (t, e) => ('string' == typeof t && t.endsWith('%') ? parseFloat(t) / 100 : +t / e)),
                (Sh = (t, e) => ('string' == typeof t && t.endsWith('%') ? (parseFloat(t) / 100) * e : +t)),
                (Ch = { '': (t) => t, x: (t) => t.x, y: (t) => t.y }),
                (Lh = (t) => typeof t < 'u'),
                (Eh = (t) => 'function' == typeof t),
                (Ph = (t, e) => {
                    if (t.size !== e.size) return 0;
                    for (let i of t) if (!e.has(i)) return 0;
                    return 1;
                }),
                (Th = (Ah = 2 * (Dh = Math.PI)) + Dh),
                (Oh = 1 / 0),
                (Rh = Dh / 180),
                (Ih = Dh / 2),
                ($h = Dh / 4),
                (Fh = (2 * Dh) / 3),
                (zh = Math.log10),
                (Vh = Math.sign),
                (Bh = (t, e, i, n) =>
                    Si(
                        t,
                        i,
                        n
                            ? (n) => {
                                  let r = t[n][e];
                                  return r < i || (r === i && t[n + 1][e] === i);
                              }
                            : (n) => t[n][e] < i
                    )),
                (jh = (t, e, i) => Si(t, i, (n) => t[n][e] >= i)),
                (Nh = ['push', 'pop', 'shift', 'splice', 'unshift']),
                (Hh =
                    typeof window > 'u'
                        ? function (t) {
                              return t();
                          }
                        : window.requestAnimationFrame),
                (Wh = (t) => ('start' === t ? 'left' : 'end' === t ? 'right' : 'center')),
                (Uh = (t, e, i) => ('start' === t ? e : 'end' === t ? i : (e + i) / 2)),
                (Yh = (t, e, i, n) => (t === (n ? 'left' : 'right') ? i : 'center' === t ? (e + i) / 2 : e)),
                (qh = (t) => 0 === t || 1 === t),
                (Xh = (t, e, i) => -Math.pow(2, 10 * (t -= 1)) * Math.sin(((t - e) * Ah) / i)),
                (Gh = (t, e, i) => Math.pow(2, -10 * t) * Math.sin(((t - e) * Ah) / i) + 1),
                (Zh = {
                    linear: (t) => t,
                    easeInQuad: (t) => t * t,
                    easeOutQuad: (t) => -t * (t - 2),
                    easeInOutQuad: (t) => ((t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1)),
                    easeInCubic: (t) => t * t * t,
                    easeOutCubic: (t) => (t -= 1) * t * t + 1,
                    easeInOutCubic: (t) => ((t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2)),
                    easeInQuart: (t) => t * t * t * t,
                    easeOutQuart: (t) => -((t -= 1) * t * t * t - 1),
                    easeInOutQuart: (t) => ((t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2)),
                    easeInQuint: (t) => t * t * t * t * t,
                    easeOutQuint: (t) => (t -= 1) * t * t * t * t + 1,
                    easeInOutQuint: (t) =>
                        (t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2),
                    easeInSine: (t) => 1 - Math.cos(t * Ih),
                    easeOutSine: (t) => Math.sin(t * Ih),
                    easeInOutSine: (t) => -0.5 * (Math.cos(Dh * t) - 1),
                    easeInExpo: (t) => (0 === t ? 0 : Math.pow(2, 10 * (t - 1))),
                    easeOutExpo: (t) => (1 === t ? 1 : 1 - Math.pow(2, -10 * t)),
                    easeInOutExpo: (t) =>
                        qh(t)
                            ? t
                            : t < 0.5
                              ? 0.5 * Math.pow(2, 10 * (2 * t - 1))
                              : 0.5 * (2 - Math.pow(2, -10 * (2 * t - 1))),
                    easeInCirc: (t) => (t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1)),
                    easeOutCirc: (t) => Math.sqrt(1 - (t -= 1) * t),
                    easeInOutCirc: (t) =>
                        (t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
                    easeInElastic: (t) => (qh(t) ? t : Xh(t, 0.075, 0.3)),
                    easeOutElastic: (t) => (qh(t) ? t : Gh(t, 0.075, 0.3)),
                    easeInOutElastic(t) {
                        return qh(t)
                            ? t
                            : t < 0.5
                              ? 0.5 * Xh(2 * t, 0.1125, 0.45)
                              : 0.5 + 0.5 * Gh(2 * t - 1, 0.1125, 0.45);
                    },
                    easeInBack(t) {
                        return t * t * (2.70158 * t - 1.70158);
                    },
                    easeOutBack(t) {
                        return (t -= 1) * t * (2.70158 * t + 1.70158) + 1;
                    },
                    easeInOutBack(t) {
                        let e = 1.70158;
                        return (t /= 0.5) < 1
                            ? t * t * ((1 + (e *= 1.525)) * t - e) * 0.5
                            : 0.5 * ((t -= 2) * t * ((1 + (e *= 1.525)) * t + e) + 2);
                    },
                    easeInBounce: (t) => 1 - Zh.easeOutBounce(1 - t),
                    easeOutBounce(t) {
                        return t < 1 / 2.75
                            ? 7.5625 * t * t
                            : t < 2 / 2.75
                              ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
                              : t < 2.5 / 2.75
                                ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
                                : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                    },
                    easeInOutBounce: (t) =>
                        t < 0.5 ? 0.5 * Zh.easeInBounce(2 * t) : 0.5 * Zh.easeOutBounce(2 * t - 1) + 0.5
                }),
                (Kh = ['x', 'y', 'borderWidth', 'radius', 'tension']),
                (Jh = ['color', 'borderColor', 'backgroundColor']),
                (Qh = new Map()),
                (tc = {
                    values(t) {
                        return Ge(t) ? t : '' + t;
                    },
                    numeric(t, e, i) {
                        if (0 === t) return '0';
                        let n,
                            r = this.chart.options.locale,
                            a = t;
                        if (i.length > 1) {
                            let e = Math.max(Math.abs(i[0].value), Math.abs(i[i.length - 1].value));
                            ((e < 1e-4 || e > 1e15) && (n = 'scientific'),
                                (a = (function (t, e) {
                                    let i = e.length > 3 ? e[2].value - e[1].value : e[1].value - e[0].value;
                                    return (Math.abs(i) >= 1 && t !== Math.floor(t) && (i = t - Math.floor(t)), i);
                                })(t, i)));
                        }
                        let o = zh(Math.abs(a)),
                            s = isNaN(o) ? 1 : Math.max(Math.min(-1 * Math.floor(o), 20), 0),
                            l = { notation: n, minimumFractionDigits: s, maximumFractionDigits: s };
                        return (Object.assign(l, this.options.ticks.format), $i(t, r, l));
                    },
                    logarithmic(t, e, i) {
                        if (0 === t) return '0';
                        let n = i[e].significand || t / Math.pow(10, Math.floor(zh(t)));
                        return [1, 2, 3, 5, 10, 15].includes(n) || e > 0.8 * i.length
                            ? tc.numeric.call(this, t, e, i)
                            : '';
                    }
                }),
                (ec = { formatters: tc }),
                (ic = Object.create(null)),
                (nc = Object.create(null)),
                (rc = class {
                    constructor(t, e) {
                        ((this.animation = void 0),
                            (this.backgroundColor = 'rgba(0,0,0,0.1)'),
                            (this.borderColor = 'rgba(0,0,0,0.1)'),
                            (this.color = '#666'),
                            (this.datasets = {}),
                            (this.devicePixelRatio = (t) => t.chart.platform.getDevicePixelRatio()),
                            (this.elements = {}),
                            (this.events = ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']),
                            (this.font = {
                                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                                size: 12,
                                style: 'normal',
                                lineHeight: 1.2,
                                weight: null
                            }),
                            (this.hover = {}),
                            (this.hoverBackgroundColor = (t, e) => Oi(e.backgroundColor)),
                            (this.hoverBorderColor = (t, e) => Oi(e.borderColor)),
                            (this.hoverColor = (t, e) => Oi(e.color)),
                            (this.indexAxis = 'x'),
                            (this.interaction = { mode: 'nearest', intersect: 1, includeInvisible: 0 }),
                            (this.maintainAspectRatio = 1),
                            (this.onHover = null),
                            (this.onClick = null),
                            (this.parsing = 1),
                            (this.plugins = {}),
                            (this.responsive = 1),
                            (this.scale = void 0),
                            (this.scales = {}),
                            (this.showLine = 1),
                            (this.drawActiveElementsOnTop = 1),
                            this.describe(t),
                            this.apply(e));
                    }
                    set(t, e) {
                        return Vi(this, t, e);
                    }
                    get(t) {
                        return zi(this, t);
                    }
                    describe(t, e) {
                        return Vi(nc, t, e);
                    }
                    override(t, e) {
                        return Vi(ic, t, e);
                    }
                    route(t, e, i, n) {
                        let r = zi(this, t),
                            a = zi(this, i),
                            o = '_' + e;
                        Object.defineProperties(r, {
                            [o]: { value: r[e], writable: 1 },
                            [e]: {
                                enumerable: 1,
                                get() {
                                    let t = this[o],
                                        e = a[n];
                                    return Ze(t) ? Object.assign({}, e, t) : Qe(t, e);
                                },
                                set(t) {
                                    this[o] = t;
                                }
                            }
                        });
                    }
                    apply(t) {
                        t.forEach((t) => t(this));
                    }
                }),
                (ac = new rc(
                    {
                        _scriptable: (t) => !t.startsWith('on'),
                        _indexable: (t) => 'events' !== t,
                        hover: { _fallback: 'interaction' },
                        interaction: { _scriptable: 0, _indexable: 0 }
                    },
                    [Ri, Ii, Fi]
                )),
                (oc = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/),
                (sc = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/),
                (lc = (t) => +t || 0),
                (hc = (t, e) => (t ? t + ci(e) : e)),
                (cc = (t, e) =>
                    Ze(e) && 'adapters' !== t && (null === Object.getPrototypeOf(e) || e.constructor === Object)),
                (dc = (t, e) => (1 == t ? e : 'string' == typeof t ? hi(e, t) : void 0)),
                (uc = Number.EPSILON || 1e-14),
                (fc = (t, e) => e < t.length && !t[e].skip && t[e]),
                (gc = (t) => ('x' === t ? 'y' : 'x')),
                (pc = (t) => t.ownerDocument.defaultView.getComputedStyle(t, null)),
                (mc = ['top', 'right', 'bottom', 'left']),
                (bc = (t, e, i) => (t > 0 || e > 0) && (!i || !i.shadowRoot)),
                (vc = (t) => Math.round(10 * t) / 10),
                (xc = (function () {
                    let t = 0;
                    try {
                        let e = {
                            get passive() {
                                return ((t = 1), 0);
                            }
                        };
                        Mn() && (window.addEventListener('test', null, e), window.removeEventListener('test', null, e));
                    } catch {}
                    return t;
                })()),
                (yc = function (t, e) {
                    return {
                        x(i) {
                            return t + t + e - i;
                        },
                        setWidth(t) {
                            e = t;
                        },
                        textAlign(t) {
                            return 'center' === t ? t : 'right' === t ? 'left' : 'right';
                        },
                        xPlus(t, e) {
                            return t - e;
                        },
                        leftForLtr(t, e) {
                            return t - e;
                        }
                    };
                }),
                (_c = function () {
                    return {
                        x(t) {
                            return t;
                        },
                        setWidth(t) {},
                        textAlign(t) {
                            return t;
                        },
                        xPlus(t, e) {
                            return t + e;
                        },
                        leftForLtr(t, e) {
                            return t;
                        }
                    };
                }));
        }),
        lu = Do(() => {
            (su(),
                (wc = class {
                    constructor() {
                        ((this._request = null),
                            (this._charts = new Map()),
                            (this._running = 0),
                            (this._lastDate = void 0));
                    }
                    _notify(t, e, i, n) {
                        let r = e.duration;
                        e.listeners[n].forEach((n) =>
                            n({ chart: t, initial: e.initial, numSteps: r, currentStep: Math.min(i - e.start, r) })
                        );
                    }
                    _refresh() {
                        this._request ||
                            ((this._running = 1),
                            (this._request = Hh.call(window, () => {
                                (this._update(), (this._request = null), this._running && this._refresh());
                            })));
                    }
                    _update(t = Date.now()) {
                        let e = 0;
                        (this._charts.forEach((i, n) => {
                            if (!i.running || !i.items.length) return;
                            let r,
                                a = i.items,
                                o = a.length - 1,
                                s = 0;
                            for (; o >= 0; --o)
                                ((r = a[o]),
                                    r._active
                                        ? (r._total > i.duration && (i.duration = r._total), r.tick(t), (s = 1))
                                        : ((a[o] = a[a.length - 1]), a.pop()));
                            (s && (n.draw(), this._notify(n, i, t, 'progress')),
                                a.length || ((i.running = 0), this._notify(n, i, t, 'complete'), (i.initial = 0)),
                                (e += a.length));
                        }),
                            (this._lastDate = t),
                            0 === e && (this._running = 0));
                    }
                    _getAnims(t) {
                        let e = this._charts,
                            i = e.get(t);
                        return (
                            i ||
                                ((i = { running: 0, initial: 1, items: [], listeners: { complete: [], progress: [] } }),
                                e.set(t, i)),
                            i
                        );
                    }
                    listen(t, e, i) {
                        this._getAnims(t).listeners[e].push(i);
                    }
                    add(t, e) {
                        !e || !e.length || this._getAnims(t).items.push(...e);
                    }
                    has(t) {
                        return this._getAnims(t).items.length > 0;
                    }
                    start(t) {
                        let e = this._charts.get(t);
                        e &&
                            ((e.running = 1),
                            (e.start = Date.now()),
                            (e.duration = e.items.reduce((t, e) => Math.max(t, e._duration), 0)),
                            this._refresh());
                    }
                    running(t) {
                        if (!this._running) return 0;
                        let e = this._charts.get(t);
                        return !(!e || !e.running || !e.items.length);
                    }
                    stop(t) {
                        let e = this._charts.get(t);
                        if (!e || !e.items.length) return;
                        let i = e.items,
                            n = i.length - 1;
                        for (; n >= 0; --n) i[n].cancel();
                        ((e.items = []), this._notify(t, e, Date.now(), 'complete'));
                    }
                    remove(t) {
                        return this._charts.delete(t);
                    }
                }),
                (Mc = new wc()),
                (kc = 'transparent'),
                (Sc = {
                    boolean(t, e, i) {
                        return i > 0.5 ? e : t;
                    },
                    color(t, e, i) {
                        let n = Ti(t || kc),
                            r = n.valid && Ti(e || kc);
                        return r && r.valid ? r.mix(n, i).hexString() : e;
                    },
                    number(t, e, i) {
                        return t + (e - t) * i;
                    }
                }),
                (Cc = class {
                    constructor(t, e, i, n) {
                        let r = e[i];
                        n = ln([t.to, n, r, t.from]);
                        let a = ln([t.from, r, n]);
                        ((this._active = 1),
                            (this._fn = t.fn || Sc[t.type || typeof a]),
                            (this._easing = Zh[t.easing] || Zh.linear),
                            (this._start = Math.floor(Date.now() + (t.delay || 0))),
                            (this._duration = this._total = Math.floor(t.duration)),
                            (this._loop = !!t.loop),
                            (this._target = e),
                            (this._prop = i),
                            (this._from = a),
                            (this._to = n),
                            (this._promises = void 0));
                    }
                    active() {
                        return this._active;
                    }
                    update(t, e, i) {
                        if (this._active) {
                            this._notify(0);
                            let n = this._target[this._prop],
                                r = i - this._start,
                                a = this._duration - r;
                            ((this._start = i),
                                (this._duration = Math.floor(Math.max(a, t.duration))),
                                (this._total += r),
                                (this._loop = !!t.loop),
                                (this._to = ln([t.to, e, n, t.from])),
                                (this._from = ln([t.from, n, e])));
                        }
                    }
                    cancel() {
                        this._active && (this.tick(Date.now()), (this._active = 0), this._notify(0));
                    }
                    tick(t) {
                        let e,
                            i = t - this._start,
                            n = this._duration,
                            r = this._prop,
                            a = this._from,
                            o = this._loop,
                            s = this._to;
                        if (((this._active = a !== s && (o || i < n)), !this._active))
                            return ((this._target[r] = s), void this._notify(1));
                        i < 0
                            ? (this._target[r] = a)
                            : ((e = (i / n) % 2),
                              (e = o && e > 1 ? 2 - e : e),
                              (e = this._easing(Math.min(1, Math.max(0, e)))),
                              (this._target[r] = this._fn(a, s, e)));
                    }
                    wait() {
                        let t = this._promises || (this._promises = []);
                        return new Promise((e, i) => {
                            t.push({ res: e, rej: i });
                        });
                    }
                    _notify(t) {
                        let e = t ? 'res' : 'rej',
                            i = this._promises || [];
                        for (let t = 0; t < i.length; t++) i[t][e]();
                    }
                }),
                (Lc = class {
                    constructor(t, e) {
                        ((this._chart = t), (this._properties = new Map()), this.configure(e));
                    }
                    configure(t) {
                        if (!Ze(t)) return;
                        let e = Object.keys(ac.animation),
                            i = this._properties;
                        Object.getOwnPropertyNames(t).forEach((n) => {
                            let r = t[n];
                            if (!Ze(r)) return;
                            let a = {};
                            for (let t of e) a[t] = r[t];
                            ((Ge(r.properties) && r.properties) || [n]).forEach((t) => {
                                (t === n || !i.has(t)) && i.set(t, a);
                            });
                        });
                    }
                    _animateOptions(t, e) {
                        let i = e.options,
                            n = (function (t, e) {
                                if (!e) return;
                                let i = t.options;
                                if (i)
                                    return (
                                        i.$shared &&
                                            (t.options = i = Object.assign({}, i, { $shared: 0, $animations: {} })),
                                        i
                                    );
                                t.options = e;
                            })(t, i);
                        if (!n) return [];
                        let r = this._createAnimations(n, i);
                        return (
                            i.$shared &&
                                (function (t, e) {
                                    let i = [],
                                        n = Object.keys(e);
                                    for (let e = 0; e < n.length; e++) {
                                        let r = t[n[e]];
                                        r && r.active() && i.push(r.wait());
                                    }
                                    return Promise.all(i);
                                })(t.options.$animations, i).then(
                                    () => {
                                        t.options = i;
                                    },
                                    () => {}
                                ),
                            r
                        );
                    }
                    _createAnimations(t, e) {
                        let i,
                            n = this._properties,
                            r = [],
                            a = t.$animations || (t.$animations = {}),
                            o = Object.keys(e),
                            s = Date.now();
                        for (i = o.length - 1; i >= 0; --i) {
                            let l = o[i];
                            if ('$' === l.charAt(0)) continue;
                            if ('options' === l) {
                                r.push(...this._animateOptions(t, e));
                                continue;
                            }
                            let h = e[l],
                                c = a[l],
                                d = n.get(l);
                            if (c) {
                                if (d && c.active()) {
                                    c.update(d, h, s);
                                    continue;
                                }
                                c.cancel();
                            }
                            d && d.duration ? ((a[l] = c = new Cc(d, t, l, h)), r.push(c)) : (t[l] = h);
                        }
                        return r;
                    }
                    update(t, e) {
                        if (0 === this._properties.size) return void Object.assign(t, e);
                        let i = this._createAnimations(t, e);
                        return i.length ? (Mc.add(this._chart, i), 1) : void 0;
                    }
                }),
                (Ec = (t) => 'reset' === t || 'none' === t),
                (Pc = (t, e) => (e ? t : Object.assign({}, t))),
                (Dc = (t, e, i) => t && !e.hidden && e._stacked && { keys: Un(i, 1), values: null }),
                (Ac = class {
                    static defaults = {};
                    static datasetElementType = null;
                    static dataElementType = null;
                    constructor(t, e) {
                        ((this.chart = t),
                            (this._ctx = t.ctx),
                            (this.index = e),
                            (this._cachedDataOpts = {}),
                            (this._cachedMeta = this.getMeta()),
                            (this._type = this._cachedMeta.type),
                            (this.options = void 0),
                            (this._parsing = 0),
                            (this._data = void 0),
                            (this._objectData = void 0),
                            (this._sharedOptions = void 0),
                            (this._drawStart = void 0),
                            (this._drawCount = void 0),
                            (this.enableOptionSharing = 0),
                            (this.supportsDecimation = 0),
                            (this.$context = void 0),
                            (this._syncList = []),
                            (this.datasetElementType = new.target.datasetElementType),
                            (this.dataElementType = new.target.dataElementType),
                            this.initialize());
                    }
                    initialize() {
                        let t = this._cachedMeta;
                        (this.configure(),
                            this.linkScales(),
                            (t._stacked = qn(t.vScale, t)),
                            this.addElements(),
                            this.options.fill &&
                                !this.chart.isPluginEnabled('filler') &&
                                console.warn(
                                    "Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options"
                                ));
                    }
                    updateIndex(t) {
                        (this.index !== t && Jn(this._cachedMeta), (this.index = t));
                    }
                    linkScales() {
                        let t = this.chart,
                            e = this._cachedMeta,
                            i = this.getDataset(),
                            n = (t, e, i, n) => ('x' === t ? e : 'r' === t ? n : i),
                            r = (e.xAxisID = Qe(i.xAxisID, Kn(t, 'x'))),
                            a = (e.yAxisID = Qe(i.yAxisID, Kn(t, 'y'))),
                            o = (e.rAxisID = Qe(i.rAxisID, Kn(t, 'r'))),
                            s = e.indexAxis,
                            l = (e.iAxisID = n(s, r, a, o)),
                            h = (e.vAxisID = n(s, a, r, o));
                        ((e.xScale = this.getScaleForId(r)),
                            (e.yScale = this.getScaleForId(a)),
                            (e.rScale = this.getScaleForId(o)),
                            (e.iScale = this.getScaleForId(l)),
                            (e.vScale = this.getScaleForId(h)));
                    }
                    getDataset() {
                        return this.chart.data.datasets[this.index];
                    }
                    getMeta() {
                        return this.chart.getDatasetMeta(this.index);
                    }
                    getScaleForId(t) {
                        return this.chart.scales[t];
                    }
                    _getOtherScale(t) {
                        let e = this._cachedMeta;
                        return t === e.iScale ? e.vScale : e.iScale;
                    }
                    reset() {
                        this._update('reset');
                    }
                    _destroy() {
                        let t = this._cachedMeta;
                        (this._data && Ci(this._data, this), t._stacked && Jn(t));
                    }
                    _dataCheck() {
                        let t = this.getDataset(),
                            e = t.data || (t.data = []),
                            i = this._data;
                        if (Ze(e))
                            this._data = (function (t, e) {
                                let i,
                                    n,
                                    r,
                                    { iScale: a, vScale: o } = e,
                                    s = 'x' === a.axis ? 'x' : 'y',
                                    l = 'x' === o.axis ? 'x' : 'y',
                                    h = Object.keys(t),
                                    c = Array(h.length);
                                for (i = 0, n = h.length; i < n; ++i) ((r = h[i]), (c[i] = { [s]: r, [l]: t[r] }));
                                return c;
                            })(e, this._cachedMeta);
                        else if (i !== e) {
                            if (i) {
                                Ci(i, this);
                                let t = this._cachedMeta;
                                (Jn(t), (t._parsed = []));
                            }
                            (e &&
                                Object.isExtensible(e) &&
                                (function (t, e) {
                                    t._chartjs
                                        ? t._chartjs.listeners.push(e)
                                        : (Object.defineProperty(t, '_chartjs', {
                                              configurable: 1,
                                              enumerable: 0,
                                              value: { listeners: [e] }
                                          }),
                                          Nh.forEach((e) => {
                                              let i = '_onData' + ci(e),
                                                  n = t[e];
                                              Object.defineProperty(t, e, {
                                                  configurable: 1,
                                                  enumerable: 0,
                                                  value(...e) {
                                                      let r = n.apply(this, e);
                                                      return (
                                                          t._chartjs.listeners.forEach((t) => {
                                                              'function' == typeof t[i] && t[i](...e);
                                                          }),
                                                          r
                                                      );
                                                  }
                                              });
                                          }));
                                })(e, this),
                                (this._syncList = []),
                                (this._data = e));
                        }
                    }
                    addElements() {
                        let t = this._cachedMeta;
                        (this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType()));
                    }
                    buildOrUpdateElements(t) {
                        let e = this._cachedMeta,
                            i = this.getDataset(),
                            n = 0;
                        this._dataCheck();
                        let r = e._stacked;
                        ((e._stacked = qn(e.vScale, e)),
                            e.stack !== i.stack && ((n = 1), Jn(e), (e.stack = i.stack)),
                            this._resyncElements(t),
                            (n || r !== e._stacked) && (Zn(this, e._parsed), (e._stacked = qn(e.vScale, e))));
                    }
                    configure() {
                        let t = this.chart.config,
                            e = t.datasetScopeKeys(this._type),
                            i = t.getOptionScopes(this.getDataset(), e, 1);
                        ((this.options = t.createResolver(i, this.getContext())),
                            (this._parsing = this.options.parsing),
                            (this._cachedDataOpts = {}));
                    }
                    parse(t, e) {
                        let i,
                            n,
                            r,
                            { _cachedMeta: a, _data: o } = this,
                            { iScale: s, _stacked: l } = a,
                            h = s.axis,
                            c = 0 === t && e === o.length ? 1 : a._sorted,
                            d = t > 0 && a._parsed[t - 1];
                        if (0 == this._parsing) ((a._parsed = o), (a._sorted = 1), (r = o));
                        else {
                            r = Ge(o[t])
                                ? this.parseArrayData(a, o, t, e)
                                : Ze(o[t])
                                  ? this.parseObjectData(a, o, t, e)
                                  : this.parsePrimitiveData(a, o, t, e);
                            let s = () => null === n[h] || (d && n[h] < d[h]);
                            for (i = 0; i < e; ++i) ((a._parsed[i + t] = n = r[i]), c && (s() && (c = 0), (d = n)));
                            a._sorted = c;
                        }
                        l && Zn(this, r);
                    }
                    parsePrimitiveData(t, e, i, n) {
                        let r,
                            a,
                            o,
                            { iScale: s, vScale: l } = t,
                            h = s.axis,
                            c = l.axis,
                            d = s.getLabels(),
                            u = s === l,
                            f = Array(n);
                        for (r = 0, a = n; r < a; ++r)
                            ((o = r + i), (f[r] = { [h]: u || s.parse(d[o], o), [c]: l.parse(e[o], o) }));
                        return f;
                    }
                    parseArrayData(t, e, i, n) {
                        let r,
                            a,
                            o,
                            s,
                            { xScale: l, yScale: h } = t,
                            c = Array(n);
                        for (r = 0, a = n; r < a; ++r)
                            ((o = r + i), (s = e[o]), (c[r] = { x: l.parse(s[0], o), y: h.parse(s[1], o) }));
                        return c;
                    }
                    parseObjectData(t, e, i, n) {
                        let r,
                            a,
                            o,
                            s,
                            { xScale: l, yScale: h } = t,
                            { xAxisKey: c = 'x', yAxisKey: d = 'y' } = this._parsing,
                            u = Array(n);
                        for (r = 0, a = n; r < a; ++r)
                            ((o = r + i), (s = e[o]), (u[r] = { x: l.parse(hi(s, c), o), y: h.parse(hi(s, d), o) }));
                        return u;
                    }
                    getParsed(t) {
                        return this._cachedMeta._parsed[t];
                    }
                    getDataElement(t) {
                        return this._cachedMeta.data[t];
                    }
                    applyStack(t, e, i) {
                        let n = this._cachedMeta,
                            r = e[t.axis];
                        return Yn({ keys: Un(this.chart, 1), values: e._stacks[t.axis]._visualValues }, r, n.index, {
                            mode: i
                        });
                    }
                    updateRangeFromParsed(t, e, i, n) {
                        let r = i[e.axis],
                            a = null === r ? NaN : r,
                            o = n && i._stacks[e.axis];
                        (n && o && ((n.values = o), (a = Yn(n, r, this._cachedMeta.index))),
                            (t.min = Math.min(t.min, a)),
                            (t.max = Math.max(t.max, a)));
                    }
                    getMinMax(t, e) {
                        function i() {
                            r = o[n];
                            let e = r[h.axis];
                            return !Ke(r[t.axis]) || u > e || f < e;
                        }
                        let n,
                            r,
                            a = this._cachedMeta,
                            o = a._parsed,
                            s = a._sorted && t === a.iScale,
                            l = o.length,
                            h = this._getOtherScale(t),
                            c = Dc(e, a, this.chart),
                            d = { min: 1 / 0, max: -1 / 0 },
                            { min: u, max: f } = (function (t) {
                                let { min: e, max: i, minDefined: n, maxDefined: r } = t.getUserBounds();
                                return { min: n ? e : -1 / 0, max: r ? i : 1 / 0 };
                            })(h);
                        for (n = 0; n < l && (i() || (this.updateRangeFromParsed(d, t, r, c), !s)); ++n);
                        if (s)
                            for (n = l - 1; n >= 0; --n)
                                if (!i()) {
                                    this.updateRangeFromParsed(d, t, r, c);
                                    break;
                                }
                        return d;
                    }
                    getAllParsedValues(t) {
                        let e,
                            i,
                            n,
                            r = this._cachedMeta._parsed,
                            a = [];
                        for (e = 0, i = r.length; e < i; ++e) ((n = r[e][t.axis]), Ke(n) && a.push(n));
                        return a;
                    }
                    getMaxOverflow() {
                        return 0;
                    }
                    getLabelAndValue(t) {
                        let e = this._cachedMeta,
                            i = e.iScale,
                            n = e.vScale,
                            r = this.getParsed(t);
                        return {
                            label: i ? '' + i.getLabelForValue(r[i.axis]) : '',
                            value: n ? '' + n.getLabelForValue(r[n.axis]) : ''
                        };
                    }
                    _update(t) {
                        let e = this._cachedMeta;
                        (this.update(t || 'default'),
                            (e._clip = (function (t) {
                                let e, i, n, r;
                                return (
                                    Ze(t)
                                        ? ((e = t.top), (i = t.right), (n = t.bottom), (r = t.left))
                                        : (e = i = n = r = t),
                                    { top: e, right: i, bottom: n, left: r, disabled: 0 == t }
                                );
                            })(
                                Qe(
                                    this.options.clip,
                                    (function (t, e, i) {
                                        if (0 == i) return 0;
                                        let n = Wn(t, i),
                                            r = Wn(e, i);
                                        return { top: r.end, right: n.end, bottom: r.start, left: n.start };
                                    })(e.xScale, e.yScale, this.getMaxOverflow())
                                )
                            )));
                    }
                    update(t) {}
                    draw() {
                        let t,
                            e = this._ctx,
                            i = this._cachedMeta,
                            n = i.data || [],
                            r = this.chart.chartArea,
                            a = [],
                            o = this._drawStart || 0,
                            s = this._drawCount || n.length - o,
                            l = this.options.drawActiveElementsOnTop;
                        for (i.dataset && i.dataset.draw(e, r, o, s), t = o; t < o + s; ++t) {
                            let i = n[t];
                            i.hidden || (i.active && l ? a.push(i) : i.draw(e, r));
                        }
                        for (t = 0; t < a.length; ++t) a[t].draw(e, r);
                    }
                    getStyle(t, e) {
                        let i = e ? 'active' : 'default';
                        return void 0 === t && this._cachedMeta.dataset
                            ? this.resolveDatasetElementOptions(i)
                            : this.resolveDataElementOptions(t || 0, i);
                    }
                    getContext(t, e, i) {
                        let n,
                            r = this.getDataset();
                        if (t >= 0 && t < this._cachedMeta.data.length) {
                            let e = this._cachedMeta.data[t];
                            ((n =
                                e.$context ||
                                (e.$context = (function (t, e, i) {
                                    return hn(t, {
                                        active: 0,
                                        dataIndex: e,
                                        parsed: void 0,
                                        raw: void 0,
                                        element: i,
                                        index: e,
                                        mode: 'default',
                                        type: 'data'
                                    });
                                })(this.getContext(), t, e))),
                                (n.parsed = this.getParsed(t)),
                                (n.raw = r.data[t]),
                                (n.index = n.dataIndex = t));
                        } else
                            ((n =
                                this.$context ||
                                (this.$context = (function (t, e) {
                                    return hn(t, {
                                        active: 0,
                                        dataset: void 0,
                                        datasetIndex: e,
                                        index: e,
                                        mode: 'default',
                                        type: 'dataset'
                                    });
                                })(this.chart.getContext(), this.index))),
                                (n.dataset = r),
                                (n.index = n.datasetIndex = this.index));
                        return ((n.active = !!e), (n.mode = i), n);
                    }
                    resolveDatasetElementOptions(t) {
                        return this._resolveElementOptions(this.datasetElementType.id, t);
                    }
                    resolveDataElementOptions(t, e) {
                        return this._resolveElementOptions(this.dataElementType.id, e, t);
                    }
                    _resolveElementOptions(t, e = 'default', i) {
                        let n = 'active' === e,
                            r = this._cachedDataOpts,
                            a = t + '-' + e,
                            o = r[a],
                            s = this.enableOptionSharing && Lh(i);
                        if (o) return Pc(o, s);
                        let l = this.chart.config,
                            h = l.datasetElementScopeKeys(this._type, t),
                            c = n ? [t + 'Hover', 'hover', t, ''] : [t, ''],
                            d = l.getOptionScopes(this.getDataset(), h),
                            u = l.resolveNamedOptions(
                                d,
                                Object.keys(ac.elements[t]),
                                () => this.getContext(i, n, e),
                                c
                            );
                        return (u.$shared && ((u.$shared = s), (r[a] = Object.freeze(Pc(u, s)))), u);
                    }
                    _resolveAnimations(t, e, i) {
                        let n,
                            r = this.chart,
                            a = this._cachedDataOpts,
                            o = 'animation-' + e,
                            s = a[o];
                        if (s) return s;
                        if (0 != r.options.animation) {
                            let r = this.chart.config,
                                a = r.datasetAnimationScopeKeys(this._type, e),
                                o = r.getOptionScopes(this.getDataset(), a);
                            n = r.createResolver(o, this.getContext(t, i, e));
                        }
                        let l = new Lc(r, n && n.animations);
                        return (n && n._cacheable && (a[o] = Object.freeze(l)), l);
                    }
                    getSharedOptions(t) {
                        if (t.$shared) return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
                    }
                    includeOptions(t, e) {
                        return !e || Ec(t) || this.chart._animationsDisabled;
                    }
                    _getSharedOptions(t, e) {
                        let i = this.resolveDataElementOptions(t, e),
                            n = this._sharedOptions,
                            r = this.getSharedOptions(i),
                            a = this.includeOptions(e, r) || r !== n;
                        return (this.updateSharedOptions(r, e, i), { sharedOptions: r, includeOptions: a });
                    }
                    updateElement(t, e, i, n) {
                        Ec(n) ? Object.assign(t, i) : this._resolveAnimations(e, n).update(t, i);
                    }
                    updateSharedOptions(t, e, i) {
                        t && !Ec(e) && this._resolveAnimations(void 0, e).update(t, i);
                    }
                    _setStyle(t, e, i, n) {
                        t.active = n;
                        let r = this.getStyle(e, n);
                        this._resolveAnimations(e, i, n).update(t, { options: (!n && this.getSharedOptions(r)) || r });
                    }
                    removeHoverStyle(t, e, i) {
                        this._setStyle(t, i, 'active', 0);
                    }
                    setHoverStyle(t, e, i) {
                        this._setStyle(t, i, 'active', 1);
                    }
                    _removeDatasetHoverStyle() {
                        let t = this._cachedMeta.dataset;
                        t && this._setStyle(t, void 0, 'active', 0);
                    }
                    _setDatasetHoverStyle() {
                        let t = this._cachedMeta.dataset;
                        t && this._setStyle(t, void 0, 'active', 1);
                    }
                    _resyncElements(t) {
                        let e = this._data,
                            i = this._cachedMeta.data;
                        for (let [t, e, i] of this._syncList) this[t](e, i);
                        this._syncList = [];
                        let n = i.length,
                            r = e.length,
                            a = Math.min(r, n);
                        (a && this.parse(0, a),
                            r > n ? this._insertElements(n, r - n, t) : r < n && this._removeElements(r, n - r));
                    }
                    _insertElements(t, e, i = 1) {
                        let n,
                            r = this._cachedMeta,
                            a = r.data,
                            o = t + e,
                            s = (t) => {
                                for (t.length += e, n = t.length - 1; n >= o; n--) t[n] = t[n - e];
                            };
                        for (s(a), n = t; n < o; ++n) a[n] = new this.dataElementType();
                        (this._parsing && s(r._parsed), this.parse(t, e), i && this.updateElements(a, t, e, 'reset'));
                    }
                    updateElements(t, e, i, n) {}
                    _removeElements(t, e) {
                        let i = this._cachedMeta;
                        if (this._parsing) {
                            let n = i._parsed.splice(t, e);
                            i._stacked && Jn(i, n);
                        }
                        i.data.splice(t, e);
                    }
                    _sync(t) {
                        if (this._parsing) this._syncList.push(t);
                        else {
                            let [e, i, n] = t;
                            this[e](i, n);
                        }
                        this.chart._dataChanges.push([this.index, ...t]);
                    }
                    _onDataPush() {
                        let t = arguments.length;
                        this._sync(['_insertElements', this.getDataset().data.length - t, t]);
                    }
                    _onDataPop() {
                        this._sync(['_removeElements', this._cachedMeta.data.length - 1, 1]);
                    }
                    _onDataShift() {
                        this._sync(['_removeElements', 0, 1]);
                    }
                    _onDataSplice(t, e) {
                        e && this._sync(['_removeElements', t, e]);
                        let i = arguments.length - 2;
                        i && this._sync(['_insertElements', t, i]);
                    }
                    _onDataUnshift() {
                        this._sync(['_insertElements', 0, arguments.length]);
                    }
                }),
                (Tc = class extends Ac {
                    static id = 'bar';
                    static defaults = {
                        datasetElementType: 0,
                        dataElementType: 'bar',
                        categoryPercentage: 0.8,
                        barPercentage: 0.9,
                        grouped: 1,
                        animations: { numbers: { type: 'number', properties: ['x', 'y', 'base', 'width', 'height'] } }
                    };
                    static overrides = {
                        scales: {
                            _index_: { type: 'category', offset: 1, grid: { offset: 1 } },
                            _value_: { type: 'linear', beginAtZero: 1 }
                        }
                    };
                    parsePrimitiveData(t, e, i, n) {
                        return er(t, e, i, n);
                    }
                    parseArrayData(t, e, i, n) {
                        return er(t, e, i, n);
                    }
                    parseObjectData(t, e, i, n) {
                        let r,
                            a,
                            o,
                            s,
                            { iScale: l, vScale: h } = t,
                            { xAxisKey: c = 'x', yAxisKey: d = 'y' } = this._parsing,
                            u = 'x' === l.axis ? c : d,
                            f = 'x' === h.axis ? c : d,
                            g = [];
                        for (r = i, a = i + n; r < a; ++r)
                            ((s = e[r]), (o = {}), (o[l.axis] = l.parse(hi(s, u), r)), g.push(tr(hi(s, f), o, h, r)));
                        return g;
                    }
                    updateRangeFromParsed(t, e, i, n) {
                        super.updateRangeFromParsed(t, e, i, n);
                        let r = i._custom;
                        r &&
                            e === this._cachedMeta.vScale &&
                            ((t.min = Math.min(t.min, r.min)), (t.max = Math.max(t.max, r.max)));
                    }
                    getMaxOverflow() {
                        return 0;
                    }
                    getLabelAndValue(t) {
                        let e = this._cachedMeta,
                            { iScale: i, vScale: n } = e,
                            r = this.getParsed(t),
                            a = r._custom,
                            o = ir(a) ? '[' + a.start + ', ' + a.end + ']' : '' + n.getLabelForValue(r[n.axis]);
                        return { label: '' + i.getLabelForValue(r[i.axis]), value: o };
                    }
                    initialize() {
                        ((this.enableOptionSharing = 1),
                            super.initialize(),
                            (this._cachedMeta.stack = this.getDataset().stack));
                    }
                    update(t) {
                        let e = this._cachedMeta;
                        this.updateElements(e.data, 0, e.data.length, t);
                    }
                    updateElements(t, e, i, n) {
                        let r = 'reset' === n,
                            {
                                index: a,
                                _cachedMeta: { vScale: o }
                            } = this,
                            s = o.getBasePixel(),
                            l = o.isHorizontal(),
                            h = this._getRuler(),
                            { sharedOptions: c, includeOptions: d } = this._getSharedOptions(e, n);
                        for (let u = e; u < e + i; u++) {
                            let e = this.getParsed(u),
                                i = r || Xe(e[o.axis]) ? { base: s, head: s } : this._calculateBarValuePixels(u),
                                f = this._calculateBarIndexPixels(u, h),
                                g = (e._stacks || {})[o.axis],
                                p = {
                                    horizontal: l,
                                    base: i.base,
                                    enableBorderRadius: !g || ir(e._custom) || a === g._top || a === g._bottom,
                                    x: l ? i.head : f.center,
                                    y: l ? f.center : i.head,
                                    height: l ? f.size : Math.abs(i.size),
                                    width: l ? Math.abs(i.size) : f.size
                                };
                            d && (p.options = c || this.resolveDataElementOptions(u, t[u].active ? 'active' : n));
                            let m = p.options || t[u].options;
                            (nr(p, m, g, a), or(p, m, h.ratio), this.updateElement(t[u], u, p, n));
                        }
                    }
                    _getStacks(t, e) {
                        let { iScale: i } = this._cachedMeta,
                            n = i.getMatchingVisibleMetas(this._type).filter((t) => t.controller.options.grouped),
                            r = i.options.stacked,
                            a = [],
                            o = this._cachedMeta.controller.getParsed(e),
                            s = o && o[i.axis],
                            l = (t) => {
                                let e = t._parsed.find((t) => t[i.axis] === s),
                                    n = e && e[t.vScale.axis];
                                if (Xe(n) || isNaN(n)) return 1;
                            };
                        for (let i of n)
                            if (
                                (void 0 === e || !l(i)) &&
                                ((0 == r || -1 === a.indexOf(i.stack) || (void 0 === r && void 0 === i.stack)) &&
                                    a.push(i.stack),
                                i.index === t)
                            )
                                break;
                        return (a.length || a.push(void 0), a);
                    }
                    _getStackCount(t) {
                        return this._getStacks(void 0, t).length;
                    }
                    _getAxisCount() {
                        return this._getAxis().length;
                    }
                    getFirstScaleIdForIndexAxis() {
                        let t = this.chart.scales,
                            e = this.chart.options.indexAxis;
                        return Object.keys(t)
                            .filter((i) => t[i].axis === e)
                            .shift();
                    }
                    _getAxis() {
                        let t = {},
                            e = this.getFirstScaleIdForIndexAxis();
                        for (let i of this.chart.data.datasets)
                            t[Qe('x' === this.chart.options.indexAxis ? i.xAxisID : i.yAxisID, e)] = 1;
                        return Object.keys(t);
                    }
                    _getStackIndex(t, e, i) {
                        let n = this._getStacks(t, i),
                            r = void 0 !== e ? n.indexOf(e) : -1;
                        return -1 === r ? n.length - 1 : r;
                    }
                    _getRuler() {
                        let t,
                            e,
                            i = this.options,
                            n = this._cachedMeta,
                            r = n.iScale,
                            a = [];
                        for (t = 0, e = n.data.length; t < e; ++t)
                            a.push(r.getPixelForValue(this.getParsed(t)[r.axis], t));
                        let o = i.barThickness;
                        return {
                            min: o || Qn(n),
                            pixels: a,
                            start: r._startPixel,
                            end: r._endPixel,
                            stackCount: this._getStackCount(),
                            scale: r,
                            grouped: i.grouped,
                            ratio: o ? 1 : i.categoryPercentage * i.barPercentage
                        };
                    }
                    _calculateBarValuePixels(t) {
                        let e,
                            i,
                            {
                                _cachedMeta: { vScale: n, _stacked: r, index: a },
                                options: { base: o, minBarLength: s }
                            } = this,
                            l = o || 0,
                            h = this.getParsed(t),
                            c = h._custom,
                            d = ir(c),
                            u = h[n.axis],
                            f = 0,
                            g = r ? this.applyStack(n, h, r) : u;
                        (g !== u && ((f = g - u), (g = u)),
                            d &&
                                ((u = c.barStart),
                                (g = c.barEnd - c.barStart),
                                0 !== u && Vh(u) !== Vh(c.barEnd) && (f = 0),
                                (f += u)));
                        let p = Xe(o) || d ? f : o,
                            m = n.getPixelForValue(p);
                        if (
                            ((e = this.chart.getDataVisibility(t) ? n.getPixelForValue(f + g) : m),
                            (i = e - m),
                            Math.abs(i) < s)
                        ) {
                            ((i =
                                (function (t, e, i) {
                                    return 0 !== t ? Vh(t) : (e.isHorizontal() ? 1 : -1) * (e.min >= i ? 1 : -1);
                                })(i, n, l) * s),
                                u === l && (m -= i / 2));
                            let t = n.getPixelForDecimal(0),
                                o = n.getPixelForDecimal(1),
                                c = Math.min(t, o);
                            ((m = Math.max(Math.min(m, Math.max(t, o)), c)),
                                (e = m + i),
                                r &&
                                    !d &&
                                    (h._stacks[n.axis]._visualValues[a] =
                                        n.getValueForPixel(e) - n.getValueForPixel(m)));
                        }
                        if (m === n.getPixelForValue(l)) {
                            let t = (Vh(i) * n.getLineWidthForValue(l)) / 2;
                            ((m += t), (i -= t));
                        }
                        return { size: i, base: m, head: e, center: e + i / 2 };
                    }
                    _calculateBarIndexPixels(t, e) {
                        let i,
                            n,
                            r = e.scale,
                            a = this.options,
                            o = a.skipNull,
                            s = Qe(a.maxBarThickness, 1 / 0),
                            l = this._getAxisCount();
                        if (e.grouped) {
                            let r = o ? this._getStackCount(t) : e.stackCount,
                                h =
                                    'flex' === a.barThickness
                                        ? (function (t, e, i, n) {
                                              let r = e.pixels,
                                                  a = r[t],
                                                  o = t > 0 ? r[t - 1] : null,
                                                  s = t < r.length - 1 ? r[t + 1] : null,
                                                  l = i.categoryPercentage;
                                              (null === o && (o = a - (null === s ? e.end - e.start : s - a)),
                                                  null === s && (s = a + a - o));
                                              let h = a - ((a - Math.min(o, s)) / 2) * l;
                                              return {
                                                  chunk: ((Math.abs(s - o) / 2) * l) / n,
                                                  ratio: i.barPercentage,
                                                  start: h
                                              };
                                          })(t, e, a, r * l)
                                        : (function (t, e, i, n) {
                                              let r,
                                                  a,
                                                  o = i.barThickness;
                                              return (
                                                  Xe(o)
                                                      ? ((r = e.min * i.categoryPercentage), (a = i.barPercentage))
                                                      : ((r = o * n), (a = 1)),
                                                  { chunk: r / n, ratio: a, start: e.pixels[t] - r / 2 }
                                              );
                                          })(t, e, a, r * l),
                                c =
                                    'x' === this.chart.options.indexAxis
                                        ? this.getDataset().xAxisID
                                        : this.getDataset().yAxisID,
                                d = this._getAxis().indexOf(Qe(c, this.getFirstScaleIdForIndexAxis())),
                                u = this._getStackIndex(this.index, this._cachedMeta.stack, o ? t : void 0) + d;
                            ((i = h.start + h.chunk * u + h.chunk / 2), (n = Math.min(s, h.chunk * h.ratio)));
                        } else
                            ((i = r.getPixelForValue(this.getParsed(t)[r.axis], t)),
                                (n = Math.min(s, e.min * e.ratio)));
                        return { base: i - n / 2, head: i + n / 2, center: i, size: n };
                    }
                    draw() {
                        let t = this._cachedMeta,
                            e = t.vScale,
                            i = t.data,
                            n = i.length,
                            r = 0;
                        for (; r < n; ++r) null !== this.getParsed(r)[e.axis] && !i[r].hidden && i[r].draw(this._ctx);
                    }
                }),
                (Oc = class extends Ac {
                    static id = 'bubble';
                    static defaults = {
                        datasetElementType: 0,
                        dataElementType: 'point',
                        animations: { numbers: { type: 'number', properties: ['x', 'y', 'borderWidth', 'radius'] } }
                    };
                    static overrides = { scales: { x: { type: 'linear' }, y: { type: 'linear' } } };
                    initialize() {
                        ((this.enableOptionSharing = 1), super.initialize());
                    }
                    parsePrimitiveData(t, e, i, n) {
                        let r = super.parsePrimitiveData(t, e, i, n);
                        for (let t = 0; t < r.length; t++) r[t]._custom = this.resolveDataElementOptions(t + i).radius;
                        return r;
                    }
                    parseArrayData(t, e, i, n) {
                        let r = super.parseArrayData(t, e, i, n);
                        for (let t = 0; t < r.length; t++)
                            r[t]._custom = Qe(e[i + t][2], this.resolveDataElementOptions(t + i).radius);
                        return r;
                    }
                    parseObjectData(t, e, i, n) {
                        let r = super.parseObjectData(t, e, i, n);
                        for (let t = 0; t < r.length; t++) {
                            let n = e[i + t];
                            r[t]._custom = Qe(n && n.r && +n.r, this.resolveDataElementOptions(t + i).radius);
                        }
                        return r;
                    }
                    getMaxOverflow() {
                        let t = this._cachedMeta.data,
                            e = 0;
                        for (let i = t.length - 1; i >= 0; --i)
                            e = Math.max(e, t[i].size(this.resolveDataElementOptions(i)) / 2);
                        return e > 0 && e;
                    }
                    getLabelAndValue(t) {
                        let e = this._cachedMeta,
                            i = this.chart.data.labels || [],
                            { xScale: n, yScale: r } = e,
                            a = this.getParsed(t),
                            o = n.getLabelForValue(a.x),
                            s = r.getLabelForValue(a.y),
                            l = a._custom;
                        return { label: i[t] || '', value: '(' + o + ', ' + s + (l ? ', ' + l : '') + ')' };
                    }
                    update(t) {
                        let e = this._cachedMeta.data;
                        this.updateElements(e, 0, e.length, t);
                    }
                    updateElements(t, e, i, n) {
                        let r = 'reset' === n,
                            { iScale: a, vScale: o } = this._cachedMeta,
                            { sharedOptions: s, includeOptions: l } = this._getSharedOptions(e, n),
                            h = a.axis,
                            c = o.axis;
                        for (let d = e; d < e + i; d++) {
                            let e = t[d],
                                i = !r && this.getParsed(d),
                                u = {},
                                f = (u[h] = r ? a.getPixelForDecimal(0.5) : a.getPixelForValue(i[h])),
                                g = (u[c] = r ? o.getBasePixel() : o.getPixelForValue(i[c]));
                            ((u.skip = isNaN(f) || isNaN(g)),
                                l &&
                                    ((u.options = s || this.resolveDataElementOptions(d, e.active ? 'active' : n)),
                                    r && (u.options.radius = 0)),
                                this.updateElement(e, d, u, n));
                        }
                    }
                    resolveDataElementOptions(t, e) {
                        let i = this.getParsed(t),
                            n = super.resolveDataElementOptions(t, e);
                        n.$shared && (n = Object.assign({}, n, { $shared: 0 }));
                        let r = n.radius;
                        return ('active' !== e && (n.radius = 0), (n.radius += Qe(i && i._custom, r)), n);
                    }
                }),
                (Rc = class extends Ac {
                    static id = 'doughnut';
                    static defaults = {
                        datasetElementType: 0,
                        dataElementType: 'arc',
                        animation: { animateRotate: 1, animateScale: 0 },
                        animations: {
                            numbers: {
                                type: 'number',
                                properties: [
                                    'circumference',
                                    'endAngle',
                                    'innerRadius',
                                    'outerRadius',
                                    'startAngle',
                                    'x',
                                    'y',
                                    'offset',
                                    'borderWidth',
                                    'spacing'
                                ]
                            }
                        },
                        cutout: '50%',
                        rotation: 0,
                        circumference: 360,
                        radius: '100%',
                        spacing: 0,
                        indexAxis: 'r'
                    };
                    static descriptors = {
                        _scriptable: (t) => 'spacing' !== t,
                        _indexable: (t) =>
                            'spacing' !== t && !t.startsWith('borderDash') && !t.startsWith('hoverBorderDash')
                    };
                    static overrides = {
                        aspectRatio: 1,
                        plugins: {
                            legend: {
                                labels: {
                                    generateLabels(t) {
                                        let e = t.data;
                                        if (e.labels.length && e.datasets.length) {
                                            let {
                                                labels: { pointStyle: i, color: n }
                                            } = t.legend.options;
                                            return e.labels.map((e, r) => {
                                                let a = t.getDatasetMeta(0).controller.getStyle(r);
                                                return {
                                                    text: e,
                                                    fillStyle: a.backgroundColor,
                                                    strokeStyle: a.borderColor,
                                                    fontColor: n,
                                                    lineWidth: a.borderWidth,
                                                    pointStyle: i,
                                                    hidden: !t.getDataVisibility(r),
                                                    index: r
                                                };
                                            });
                                        }
                                        return [];
                                    }
                                },
                                onClick(t, e, i) {
                                    (i.chart.toggleDataVisibility(e.index), i.chart.update());
                                }
                            }
                        }
                    };
                    constructor(t, e) {
                        (super(t, e),
                            (this.enableOptionSharing = 1),
                            (this.innerRadius = void 0),
                            (this.outerRadius = void 0),
                            (this.offsetX = void 0),
                            (this.offsetY = void 0));
                    }
                    linkScales() {}
                    parse(t, e) {
                        let i = this.getDataset().data,
                            n = this._cachedMeta;
                        if (0 == this._parsing) n._parsed = i;
                        else {
                            let r,
                                a,
                                o = (t) => +i[t];
                            if (Ze(i[t])) {
                                let { key: t = 'value' } = this._parsing;
                                o = (e) => +hi(i[e], t);
                            }
                            for (r = t, a = t + e; r < a; ++r) n._parsed[r] = o(r);
                        }
                    }
                    _getRotation() {
                        return pi(this.options.rotation - 90);
                    }
                    _getCircumference() {
                        return pi(this.options.circumference);
                    }
                    _getRotationExtents() {
                        let t = Ah,
                            e = -Ah;
                        for (let i = 0; i < this.chart.data.datasets.length; ++i)
                            if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
                                let n = this.chart.getDatasetMeta(i).controller,
                                    r = n._getRotation(),
                                    a = n._getCircumference();
                                ((t = Math.min(t, r)), (e = Math.max(e, r + a)));
                            }
                        return { rotation: t, circumference: e - t };
                    }
                    update(t) {
                        let e = this.chart,
                            { chartArea: i } = e,
                            n = this._cachedMeta,
                            r = n.data,
                            a = this.getMaxBorderWidth() + this.getMaxOffset(r) + this.options.spacing,
                            o = Math.min(
                                kh(this.options.cutout, Math.max((Math.min(i.width, i.height) - a) / 2, 0)),
                                1
                            ),
                            s = this._getRingWeight(this.index),
                            { circumference: l, rotation: h } = this._getRotationExtents(),
                            {
                                ratioX: c,
                                ratioY: d,
                                offsetX: u,
                                offsetY: f
                            } = (function (t, e, i) {
                                let n = 1,
                                    r = 1,
                                    a = 0,
                                    o = 0;
                                if (e < Ah) {
                                    let s = t,
                                        l = s + e,
                                        h = Math.cos(s),
                                        c = Math.sin(s),
                                        d = Math.cos(l),
                                        u = Math.sin(l),
                                        f = (t, e, n) => (wi(t, s, l, 1) ? 1 : Math.max(e, e * i, n, n * i)),
                                        g = (t, e, n) => (wi(t, s, l, 1) ? -1 : Math.min(e, e * i, n, n * i)),
                                        p = f(0, h, d),
                                        m = f(Ih, c, u),
                                        b = g(Dh, h, d),
                                        v = g(Dh + Ih, c, u);
                                    ((n = (p - b) / 2), (r = (m - v) / 2), (a = -(p + b) / 2), (o = -(m + v) / 2));
                                }
                                return { ratioX: n, ratioY: r, offsetX: a, offsetY: o };
                            })(h, l, o),
                            g = Sh(
                                this.options.radius,
                                Math.max(Math.min((i.width - a) / c, (i.height - a) / d) / 2, 0)
                            ),
                            p = (g - Math.max(g * o, 0)) / this._getVisibleDatasetWeightTotal();
                        ((this.offsetX = u * g),
                            (this.offsetY = f * g),
                            (n.total = this.calculateTotal()),
                            (this.outerRadius = g - p * this._getRingWeightOffset(this.index)),
                            (this.innerRadius = Math.max(this.outerRadius - p * s, 0)),
                            this.updateElements(r, 0, r.length, t));
                    }
                    _circumference(t, e) {
                        let i = this.options,
                            n = this._cachedMeta,
                            r = this._getCircumference();
                        return (e && i.animation.animateRotate) ||
                            !this.chart.getDataVisibility(t) ||
                            null === n._parsed[t] ||
                            n.data[t].hidden
                            ? 0
                            : this.calculateCircumference((n._parsed[t] * r) / Ah);
                    }
                    updateElements(t, e, i, n) {
                        let r,
                            a = 'reset' === n,
                            o = this.chart,
                            s = o.chartArea,
                            l = (s.left + s.right) / 2,
                            h = (s.top + s.bottom) / 2,
                            c = a && o.options.animation.animateScale,
                            d = c ? 0 : this.innerRadius,
                            u = c ? 0 : this.outerRadius,
                            { sharedOptions: f, includeOptions: g } = this._getSharedOptions(e, n),
                            p = this._getRotation();
                        for (r = 0; r < e; ++r) p += this._circumference(r, a);
                        for (r = e; r < e + i; ++r) {
                            let e = this._circumference(r, a),
                                i = t[r],
                                o = {
                                    x: l + this.offsetX,
                                    y: h + this.offsetY,
                                    startAngle: p,
                                    endAngle: p + e,
                                    circumference: e,
                                    outerRadius: u,
                                    innerRadius: d
                                };
                            (g && (o.options = f || this.resolveDataElementOptions(r, i.active ? 'active' : n)),
                                (p += e),
                                this.updateElement(i, r, o, n));
                        }
                    }
                    calculateTotal() {
                        let t,
                            e = this._cachedMeta,
                            i = e.data,
                            n = 0;
                        for (t = 0; t < i.length; t++) {
                            let r = e._parsed[t];
                            null !== r &&
                                !isNaN(r) &&
                                this.chart.getDataVisibility(t) &&
                                !i[t].hidden &&
                                (n += Math.abs(r));
                        }
                        return n;
                    }
                    calculateCircumference(t) {
                        let e = this._cachedMeta.total;
                        return e > 0 && !isNaN(t) ? Ah * (Math.abs(t) / e) : 0;
                    }
                    getLabelAndValue(t) {
                        let e = this.chart,
                            i = e.data.labels || [],
                            n = $i(this._cachedMeta._parsed[t], e.options.locale);
                        return { label: i[t] || '', value: n };
                    }
                    getMaxBorderWidth(t) {
                        let e,
                            i,
                            n,
                            r,
                            a,
                            o = 0,
                            s = this.chart;
                        if (!t)
                            for (e = 0, i = s.data.datasets.length; e < i; ++e)
                                if (s.isDatasetVisible(e)) {
                                    ((n = s.getDatasetMeta(e)), (t = n.data), (r = n.controller));
                                    break;
                                }
                        if (!t) return 0;
                        for (e = 0, i = t.length; e < i; ++e)
                            ((a = r.resolveDataElementOptions(e)),
                                'inner' !== a.borderAlign &&
                                    (o = Math.max(o, a.borderWidth || 0, a.hoverBorderWidth || 0)));
                        return o;
                    }
                    getMaxOffset(t) {
                        let e = 0;
                        for (let i = 0, n = t.length; i < n; ++i) {
                            let t = this.resolveDataElementOptions(i);
                            e = Math.max(e, t.offset || 0, t.hoverOffset || 0);
                        }
                        return e;
                    }
                    _getRingWeightOffset(t) {
                        let e = 0;
                        for (let i = 0; i < t; ++i) this.chart.isDatasetVisible(i) && (e += this._getRingWeight(i));
                        return e;
                    }
                    _getRingWeight(t) {
                        return Math.max(Qe(this.chart.data.datasets[t].weight, 1), 0);
                    }
                    _getVisibleDatasetWeightTotal() {
                        return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
                    }
                }),
                (Ic = class extends Ac {
                    static id = 'line';
                    static defaults = {
                        datasetElementType: 'line',
                        dataElementType: 'point',
                        showLine: 1,
                        spanGaps: 0
                    };
                    static overrides = { scales: { _index_: { type: 'category' }, _value_: { type: 'linear' } } };
                    initialize() {
                        ((this.enableOptionSharing = 1), (this.supportsDecimation = 1), super.initialize());
                    }
                    update(t) {
                        let e = this._cachedMeta,
                            { dataset: i, data: n = [], _dataset: r } = e,
                            a = this.chart._animationsDisabled,
                            { start: o, count: s } = Pi(e, n, a);
                        ((this._drawStart = o),
                            (this._drawCount = s),
                            Di(e) && ((o = 0), (s = n.length)),
                            (i._chart = this.chart),
                            (i._datasetIndex = this.index),
                            (i._decimated = !!r._decimated),
                            (i.points = n));
                        let l = this.resolveDatasetElementOptions(t);
                        (this.options.showLine || (l.borderWidth = 0),
                            (l.segment = this.options.segment),
                            this.updateElement(i, void 0, { animated: !a, options: l }, t),
                            this.updateElements(n, o, s, t));
                    }
                    updateElements(t, e, i, n) {
                        let r = 'reset' === n,
                            { iScale: a, vScale: o, _stacked: s, _dataset: l } = this._cachedMeta,
                            { sharedOptions: h, includeOptions: c } = this._getSharedOptions(e, n),
                            d = a.axis,
                            u = o.axis,
                            { spanGaps: f, segment: g } = this.options,
                            p = fi(f) ? f : 1 / 0,
                            m = this.chart._animationsDisabled || r || 'none' === n,
                            b = e + i,
                            v = t.length,
                            x = e > 0 && this.getParsed(e - 1);
                        for (let i = 0; i < v; ++i) {
                            let f = t[i],
                                v = m ? f : {};
                            if (i < e || i >= b) {
                                v.skip = 1;
                                continue;
                            }
                            let y = this.getParsed(i),
                                _ = Xe(y[u]),
                                w = (v[d] = a.getPixelForValue(y[d], i)),
                                M = (v[u] =
                                    r || _
                                        ? o.getBasePixel()
                                        : o.getPixelForValue(s ? this.applyStack(o, y, s) : y[u], i));
                            ((v.skip = isNaN(w) || isNaN(M) || _),
                                (v.stop = i > 0 && Math.abs(y[d] - x[d]) > p),
                                g && ((v.parsed = y), (v.raw = l.data[i])),
                                c && (v.options = h || this.resolveDataElementOptions(i, f.active ? 'active' : n)),
                                m || this.updateElement(f, i, v, n),
                                (x = y));
                        }
                    }
                    getMaxOverflow() {
                        let t = this._cachedMeta,
                            e = t.dataset,
                            i = (e.options && e.options.borderWidth) || 0,
                            n = t.data || [];
                        if (!n.length) return i;
                        let r = n[0].size(this.resolveDataElementOptions(0)),
                            a = n[n.length - 1].size(this.resolveDataElementOptions(n.length - 1));
                        return Math.max(i, r, a) / 2;
                    }
                    draw() {
                        let t = this._cachedMeta;
                        (t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw());
                    }
                }),
                ($c = class extends Ac {
                    static id = 'polarArea';
                    static defaults = {
                        dataElementType: 'arc',
                        animation: { animateRotate: 1, animateScale: 1 },
                        animations: {
                            numbers: {
                                type: 'number',
                                properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius']
                            }
                        },
                        indexAxis: 'r',
                        startAngle: 0
                    };
                    static overrides = {
                        aspectRatio: 1,
                        plugins: {
                            legend: {
                                labels: {
                                    generateLabels(t) {
                                        let e = t.data;
                                        if (e.labels.length && e.datasets.length) {
                                            let {
                                                labels: { pointStyle: i, color: n }
                                            } = t.legend.options;
                                            return e.labels.map((e, r) => {
                                                let a = t.getDatasetMeta(0).controller.getStyle(r);
                                                return {
                                                    text: e,
                                                    fillStyle: a.backgroundColor,
                                                    strokeStyle: a.borderColor,
                                                    fontColor: n,
                                                    lineWidth: a.borderWidth,
                                                    pointStyle: i,
                                                    hidden: !t.getDataVisibility(r),
                                                    index: r
                                                };
                                            });
                                        }
                                        return [];
                                    }
                                },
                                onClick(t, e, i) {
                                    (i.chart.toggleDataVisibility(e.index), i.chart.update());
                                }
                            }
                        },
                        scales: {
                            r: {
                                type: 'radialLinear',
                                angleLines: { display: 0 },
                                beginAtZero: 1,
                                grid: { circular: 1 },
                                pointLabels: { display: 0 },
                                startAngle: 0
                            }
                        }
                    };
                    constructor(t, e) {
                        (super(t, e), (this.innerRadius = void 0), (this.outerRadius = void 0));
                    }
                    getLabelAndValue(t) {
                        let e = this.chart,
                            i = e.data.labels || [],
                            n = $i(this._cachedMeta._parsed[t].r, e.options.locale);
                        return { label: i[t] || '', value: n };
                    }
                    parseObjectData(t, e, i, n) {
                        return yn.bind(this)(t, e, i, n);
                    }
                    update(t) {
                        let e = this._cachedMeta.data;
                        (this._updateRadius(), this.updateElements(e, 0, e.length, t));
                    }
                    getMinMax() {
                        let t = { min: 1 / 0, max: -1 / 0 };
                        return (
                            this._cachedMeta.data.forEach((e, i) => {
                                let n = this.getParsed(i).r;
                                !isNaN(n) &&
                                    this.chart.getDataVisibility(i) &&
                                    (n < t.min && (t.min = n), n > t.max && (t.max = n));
                            }),
                            t
                        );
                    }
                    _updateRadius() {
                        let t = this.chart,
                            e = t.chartArea,
                            i = t.options,
                            n = Math.max(Math.min(e.right - e.left, e.bottom - e.top) / 2, 0),
                            r =
                                (n - Math.max(i.cutoutPercentage ? (n / 100) * i.cutoutPercentage : 1, 0)) /
                                t.getVisibleDatasetCount();
                        ((this.outerRadius = n - r * this.index), (this.innerRadius = this.outerRadius - r));
                    }
                    updateElements(t, e, i, n) {
                        let r,
                            a = 'reset' === n,
                            o = this.chart,
                            s = o.options.animation,
                            l = this._cachedMeta.rScale,
                            h = l.xCenter,
                            c = l.yCenter,
                            d = l.getIndexAngle(0) - 0.5 * Dh,
                            u = d,
                            f = 360 / this.countVisibleElements();
                        for (r = 0; r < e; ++r) u += this._computeAngle(r, n, f);
                        for (r = e; r < e + i; r++) {
                            let e = t[r],
                                i = u,
                                g = u + this._computeAngle(r, n, f),
                                p = o.getDataVisibility(r) ? l.getDistanceFromCenterForValue(this.getParsed(r).r) : 0;
                            ((u = g), a && (s.animateScale && (p = 0), s.animateRotate && (i = g = d)));
                            let m = {
                                x: h,
                                y: c,
                                innerRadius: 0,
                                outerRadius: p,
                                startAngle: i,
                                endAngle: g,
                                options: this.resolveDataElementOptions(r, e.active ? 'active' : n)
                            };
                            this.updateElement(e, r, m, n);
                        }
                    }
                    countVisibleElements() {
                        let t = 0;
                        return (
                            this._cachedMeta.data.forEach((e, i) => {
                                !isNaN(this.getParsed(i).r) && this.chart.getDataVisibility(i) && t++;
                            }),
                            t
                        );
                    }
                    _computeAngle(t, e, i) {
                        return this.chart.getDataVisibility(t)
                            ? pi(this.resolveDataElementOptions(t, e).angle || i)
                            : 0;
                    }
                }),
                (Fc = class extends Rc {
                    static id = 'pie';
                    static defaults = { cutout: 0, rotation: 0, circumference: 360, radius: '100%' };
                }),
                (zc = class extends Ac {
                    static id = 'radar';
                    static defaults = {
                        datasetElementType: 'line',
                        dataElementType: 'point',
                        indexAxis: 'r',
                        showLine: 1,
                        elements: { line: { fill: 'start' } }
                    };
                    static overrides = { aspectRatio: 1, scales: { r: { type: 'radialLinear' } } };
                    getLabelAndValue(t) {
                        let e = this._cachedMeta.vScale,
                            i = this.getParsed(t);
                        return { label: e.getLabels()[t], value: '' + e.getLabelForValue(i[e.axis]) };
                    }
                    parseObjectData(t, e, i, n) {
                        return yn.bind(this)(t, e, i, n);
                    }
                    update(t) {
                        let e = this._cachedMeta,
                            i = e.dataset,
                            n = e.data || [],
                            r = e.iScale.getLabels();
                        if (((i.points = n), 'resize' !== t)) {
                            let e = this.resolveDatasetElementOptions(t);
                            (this.options.showLine || (e.borderWidth = 0),
                                this.updateElement(
                                    i,
                                    void 0,
                                    { _loop: 1, _fullLoop: r.length === n.length, options: e },
                                    t
                                ));
                        }
                        this.updateElements(n, 0, n.length, t);
                    }
                    updateElements(t, e, i, n) {
                        let r = this._cachedMeta.rScale,
                            a = 'reset' === n;
                        for (let o = e; o < e + i; o++) {
                            let e = t[o],
                                i = this.resolveDataElementOptions(o, e.active ? 'active' : n),
                                s = r.getPointPositionForValue(o, this.getParsed(o).r),
                                l = a ? r.xCenter : s.x,
                                h = a ? r.yCenter : s.y;
                            this.updateElement(
                                e,
                                o,
                                { x: l, y: h, angle: s.angle, skip: isNaN(l) || isNaN(h), options: i },
                                n
                            );
                        }
                    }
                }),
                (Vc = class extends Ac {
                    static id = 'scatter';
                    static defaults = { datasetElementType: 0, dataElementType: 'point', showLine: 0, fill: 0 };
                    static overrides = {
                        interaction: { mode: 'point' },
                        scales: { x: { type: 'linear' }, y: { type: 'linear' } }
                    };
                    getLabelAndValue(t) {
                        let e = this._cachedMeta,
                            i = this.chart.data.labels || [],
                            { xScale: n, yScale: r } = e,
                            a = this.getParsed(t),
                            o = n.getLabelForValue(a.x),
                            s = r.getLabelForValue(a.y);
                        return { label: i[t] || '', value: '(' + o + ', ' + s + ')' };
                    }
                    update(t) {
                        let e = this._cachedMeta,
                            { data: i = [] } = e,
                            n = this.chart._animationsDisabled,
                            { start: r, count: a } = Pi(e, i, n);
                        if (
                            ((this._drawStart = r),
                            (this._drawCount = a),
                            Di(e) && ((r = 0), (a = i.length)),
                            this.options.showLine)
                        ) {
                            this.datasetElementType || this.addElements();
                            let { dataset: r, _dataset: a } = e;
                            ((r._chart = this.chart),
                                (r._datasetIndex = this.index),
                                (r._decimated = !!a._decimated),
                                (r.points = i));
                            let o = this.resolveDatasetElementOptions(t);
                            ((o.segment = this.options.segment),
                                this.updateElement(r, void 0, { animated: !n, options: o }, t));
                        } else this.datasetElementType && (delete e.dataset, (this.datasetElementType = 0));
                        this.updateElements(i, r, a, t);
                    }
                    addElements() {
                        let { showLine: t } = this.options;
                        (!this.datasetElementType &&
                            t &&
                            (this.datasetElementType = this.chart.registry.getElement('line')),
                            super.addElements());
                    }
                    updateElements(t, e, i, n) {
                        let r = 'reset' === n,
                            { iScale: a, vScale: o, _stacked: s, _dataset: l } = this._cachedMeta,
                            h = this.resolveDataElementOptions(e, n),
                            c = this.getSharedOptions(h),
                            d = this.includeOptions(n, c),
                            u = a.axis,
                            f = o.axis,
                            { spanGaps: g, segment: p } = this.options,
                            m = fi(g) ? g : 1 / 0,
                            b = this.chart._animationsDisabled || r || 'none' === n,
                            v = e > 0 && this.getParsed(e - 1);
                        for (let h = e; h < e + i; ++h) {
                            let e = t[h],
                                i = this.getParsed(h),
                                g = b ? e : {},
                                x = Xe(i[f]),
                                y = (g[u] = a.getPixelForValue(i[u], h)),
                                _ = (g[f] =
                                    r || x
                                        ? o.getBasePixel()
                                        : o.getPixelForValue(s ? this.applyStack(o, i, s) : i[f], h));
                            ((g.skip = isNaN(y) || isNaN(_) || x),
                                (g.stop = h > 0 && Math.abs(i[u] - v[u]) > m),
                                p && ((g.parsed = i), (g.raw = l.data[h])),
                                d && (g.options = c || this.resolveDataElementOptions(h, e.active ? 'active' : n)),
                                b || this.updateElement(e, h, g, n),
                                (v = i));
                        }
                        this.updateSharedOptions(c, n, h);
                    }
                    getMaxOverflow() {
                        let t = this._cachedMeta,
                            e = t.data || [];
                        if (!this.options.showLine) {
                            let t = 0;
                            for (let i = e.length - 1; i >= 0; --i)
                                t = Math.max(t, e[i].size(this.resolveDataElementOptions(i)) / 2);
                            return t > 0 && t;
                        }
                        let i = t.dataset,
                            n = (i.options && i.options.borderWidth) || 0;
                        if (!e.length) return n;
                        let r = e[0].size(this.resolveDataElementOptions(0)),
                            a = e[e.length - 1].size(this.resolveDataElementOptions(e.length - 1));
                        return Math.max(n, r, a) / 2;
                    }
                }),
                (Bc = Object.freeze({
                    __proto__: null,
                    BarController: Tc,
                    BubbleController: Oc,
                    DoughnutController: Rc,
                    LineController: Ic,
                    PieController: Fc,
                    PolarAreaController: $c,
                    RadarController: zc,
                    ScatterController: Vc
                })),
                (jc = class t {
                    static override(e) {
                        Object.assign(t.prototype, e);
                    }
                    options;
                    constructor(t) {
                        this.options = t || {};
                    }
                    init() {}
                    formats() {
                        return sr();
                    }
                    parse() {
                        return sr();
                    }
                    format() {
                        return sr();
                    }
                    add() {
                        return sr();
                    }
                    diff() {
                        return sr();
                    }
                    startOf() {
                        return sr();
                    }
                    endOf() {
                        return sr();
                    }
                }),
                (Nc = { _date: jc }),
                (Hc = {
                    evaluateInteractionItems: hr,
                    modes: {
                        index(t, e, i, n) {
                            let r = Ln(e, t),
                                a = i.axis || 'x',
                                o = i.includeInvisible || 0,
                                s = i.intersect ? cr(t, r, a, n, o) : dr(t, r, a, 0, n, o),
                                l = [];
                            return s.length
                                ? (t.getSortedVisibleDatasetMetas().forEach((t) => {
                                      let e = s[0].index,
                                          i = t.data[e];
                                      i && !i.skip && l.push({ element: i, datasetIndex: t.index, index: e });
                                  }),
                                  l)
                                : [];
                        },
                        dataset(t, e, i, n) {
                            let r = Ln(e, t),
                                a = i.axis || 'xy',
                                o = i.includeInvisible || 0,
                                s = i.intersect ? cr(t, r, a, n, o) : dr(t, r, a, 0, n, o);
                            if (s.length > 0) {
                                let e = s[0].datasetIndex,
                                    i = t.getDatasetMeta(e).data;
                                s = [];
                                for (let t = 0; t < i.length; ++t) s.push({ element: i[t], datasetIndex: e, index: t });
                            }
                            return s;
                        },
                        point(t, e, i, n) {
                            return cr(t, Ln(e, t), i.axis || 'xy', n, i.includeInvisible || 0);
                        },
                        nearest(t, e, i, n) {
                            return dr(t, Ln(e, t), i.axis || 'xy', i.intersect, n, i.includeInvisible || 0);
                        },
                        x(t, e, i, n) {
                            return ur(t, Ln(e, t), 'x', i.intersect, n);
                        },
                        y(t, e, i, n) {
                            return ur(t, Ln(e, t), 'y', i.intersect, n);
                        }
                    }
                }),
                (Wc = ['left', 'top', 'right', 'bottom']),
                (Uc = {
                    addBox(t, e) {
                        (t.boxes || (t.boxes = []),
                            (e.fullSize = e.fullSize || 0),
                            (e.position = e.position || 'top'),
                            (e.weight = e.weight || 0),
                            (e._layers =
                                e._layers ||
                                function () {
                                    return [
                                        {
                                            z: 0,
                                            draw(t) {
                                                e.draw(t);
                                            }
                                        }
                                    ];
                                }),
                            t.boxes.push(e));
                    },
                    removeBox(t, e) {
                        let i = t.boxes ? t.boxes.indexOf(e) : -1;
                        -1 !== i && t.boxes.splice(i, 1);
                    },
                    configure(t, e, i) {
                        ((e.fullSize = i.fullSize), (e.position = i.position), (e.weight = i.weight));
                    },
                    update(t, e, i, n) {
                        if (!t) return;
                        let r = on(t.options.layout.padding),
                            a = Math.max(e - r.width, 0),
                            o = Math.max(i - r.height, 0),
                            s = (function (t) {
                                let e = (function (t) {
                                        let e,
                                            i,
                                            n,
                                            r,
                                            a,
                                            o,
                                            s = [];
                                        for (e = 0, i = (t || []).length; e < i; ++e)
                                            ((n = t[e]),
                                                ({
                                                    position: r,
                                                    options: { stack: a, stackWeight: o = 1 }
                                                } = n),
                                                s.push({
                                                    index: e,
                                                    box: n,
                                                    pos: r,
                                                    horizontal: n.isHorizontal(),
                                                    weight: n.weight,
                                                    stack: a && r + a,
                                                    stackWeight: o
                                                }));
                                        return s;
                                    })(t),
                                    i = pr(
                                        e.filter((t) => t.box.fullSize),
                                        1
                                    ),
                                    n = pr(fr(e, 'left'), 1),
                                    r = pr(fr(e, 'right')),
                                    a = pr(fr(e, 'top'), 1),
                                    o = pr(fr(e, 'bottom')),
                                    s = gr(e, 'x'),
                                    l = gr(e, 'y');
                                return {
                                    fullSize: i,
                                    leftAndTop: n.concat(a),
                                    rightAndBottom: r.concat(l).concat(o).concat(s),
                                    chartArea: fr(e, 'chartArea'),
                                    vertical: n.concat(r).concat(l),
                                    horizontal: a.concat(o).concat(s)
                                };
                            })(t.boxes),
                            l = s.vertical,
                            h = s.horizontal;
                        ei(t.boxes, (t) => {
                            'function' == typeof t.beforeLayout && t.beforeLayout();
                        });
                        let c = l.reduce((t, e) => (e.box.options && 0 == e.box.options.display ? t : t + 1), 0) || 1,
                            d = Object.freeze({
                                outerWidth: e,
                                outerHeight: i,
                                padding: r,
                                availableWidth: a,
                                availableHeight: o,
                                vBoxMaxWidth: a / 2 / c,
                                hBoxMaxHeight: o / 2
                            }),
                            u = Object.assign({}, r);
                        br(u, on(n));
                        let f = Object.assign({ maxPadding: u, w: a, h: o, x: r.left, y: r.top }, r),
                            g = (function (t, e) {
                                let i,
                                    n,
                                    r,
                                    a = (function (t) {
                                        let e = {};
                                        for (let i of t) {
                                            let { stack: t, pos: n, stackWeight: r } = i;
                                            if (!t || !Wc.includes(n)) continue;
                                            let a = e[t] || (e[t] = { count: 0, placed: 0, weight: 0, size: 0 });
                                            (a.count++, (a.weight += r));
                                        }
                                        return e;
                                    })(t),
                                    { vBoxMaxWidth: o, hBoxMaxHeight: s } = e;
                                for (i = 0, n = t.length; i < n; ++i) {
                                    r = t[i];
                                    let { fullSize: n } = r.box,
                                        l = a[r.stack],
                                        h = l && r.stackWeight / l.weight;
                                    r.horizontal
                                        ? ((r.width = h ? h * o : n && e.availableWidth), (r.height = s))
                                        : ((r.width = o), (r.height = h ? h * s : n && e.availableHeight));
                                }
                                return a;
                            })(l.concat(h), d);
                        (yr(s.fullSize, f, d, g),
                            yr(l, f, d, g),
                            yr(h, f, d, g) && yr(l, f, d, g),
                            (function (t) {
                                function e(e) {
                                    let n = Math.max(i[e] - t[e], 0);
                                    return ((t[e] += n), n);
                                }
                                let i = t.maxPadding;
                                ((t.y += e('top')), (t.x += e('left')), e('right'), e('bottom'));
                            })(f),
                            wr(s.leftAndTop, f, d, g),
                            (f.x += f.w),
                            (f.y += f.h),
                            wr(s.rightAndBottom, f, d, g),
                            (t.chartArea = {
                                left: f.left,
                                top: f.top,
                                right: f.left + f.w,
                                bottom: f.top + f.h,
                                height: f.h,
                                width: f.w
                            }),
                            ei(s.chartArea, (e) => {
                                let i = e.box;
                                (Object.assign(i, t.chartArea),
                                    i.update(f.w, f.h, { left: 0, top: 0, right: 0, bottom: 0 }));
                            }));
                    }
                }),
                (Yc = class {
                    acquireContext(t, e) {}
                    releaseContext(t) {
                        return 0;
                    }
                    addEventListener(t, e, i) {}
                    removeEventListener(t, e, i) {}
                    getDevicePixelRatio() {
                        return 1;
                    }
                    getMaximumSize(t, e, i, n) {
                        return (
                            (i = i || t.height),
                            { width: (e = Math.max(0, e || t.width)), height: Math.max(0, n ? Math.floor(e / n) : i) }
                        );
                    }
                    isAttached(t) {
                        return 1;
                    }
                    updateConfig(t) {}
                }),
                (qc = class extends Yc {
                    acquireContext(t) {
                        return (t && t.getContext && t.getContext('2d')) || null;
                    }
                    updateConfig(t) {
                        t.options.animation = 0;
                    }
                }),
                (Xc = '$chartjs'),
                (Gc = {
                    touchstart: 'mousedown',
                    touchmove: 'mousemove',
                    touchend: 'mouseup',
                    pointerenter: 'mouseenter',
                    pointerdown: 'mousedown',
                    pointermove: 'mousemove',
                    pointerup: 'mouseup',
                    pointerleave: 'mouseout',
                    pointerout: 'mouseout'
                }),
                (Zc = (t) => null === t || '' === t),
                (Kc = xc ? { passive: 1 } : 0),
                (Jc = new Map()),
                (Qc = 0),
                (td = class extends Yc {
                    acquireContext(t, e) {
                        let i = t && t.getContext && t.getContext('2d');
                        return i && i.canvas === t
                            ? ((function (t, e) {
                                  let i = t.style,
                                      n = t.getAttribute('height'),
                                      r = t.getAttribute('width');
                                  if (
                                      ((t[Xc] = {
                                          initial: {
                                              height: n,
                                              width: r,
                                              style: { display: i.display, height: i.height, width: i.width }
                                          }
                                      }),
                                      (i.display = i.display || 'block'),
                                      (i.boxSizing = i.boxSizing || 'border-box'),
                                      Zc(r))
                                  ) {
                                      let e = Pn(t, 'width');
                                      void 0 !== e && (t.width = e);
                                  }
                                  if (Zc(n))
                                      if ('' === t.style.height) t.height = t.width / (e || 2);
                                      else {
                                          let e = Pn(t, 'height');
                                          void 0 !== e && (t.height = e);
                                      }
                              })(t, e),
                              i)
                            : null;
                    }
                    releaseContext(t) {
                        let e = t.canvas;
                        if (!e[Xc]) return 0;
                        let i = e[Xc].initial;
                        ['height', 'width'].forEach((t) => {
                            let n = i[t];
                            Xe(n) ? e.removeAttribute(t) : e.setAttribute(t, n);
                        });
                        let n = i.style || {};
                        return (
                            Object.keys(n).forEach((t) => {
                                e.style[t] = n[t];
                            }),
                            (e.width = e.width),
                            delete e[Xc],
                            1
                        );
                    }
                    addEventListener(t, e, i) {
                        (this.removeEventListener(t, e),
                            ((t.$proxies || (t.$proxies = {}))[e] = ({ attach: Sr, detach: Cr, resize: Er }[e] || Dr)(
                                t,
                                e,
                                i
                            )));
                    }
                    removeEventListener(t, e) {
                        let i = t.$proxies || (t.$proxies = {}),
                            n = i[e];
                        n && (({ attach: Pr, detach: Pr, resize: Pr }[e] || Mr)(t, e, n), (i[e] = void 0));
                    }
                    getDevicePixelRatio() {
                        return window.devicePixelRatio;
                    }
                    getMaximumSize(t, e, i, n) {
                        return (function (t, e, i, n) {
                            let r = pc(t),
                                a = Cn(r, 'margin'),
                                o = Sn(r.maxWidth, t, 'clientWidth') || Oh,
                                s = Sn(r.maxHeight, t, 'clientHeight') || Oh,
                                l = (function (t, e, i) {
                                    let n, r;
                                    if (void 0 === e || void 0 === i) {
                                        let a = t && kn(t);
                                        if (a) {
                                            let t = a.getBoundingClientRect(),
                                                o = pc(a),
                                                s = Cn(o, 'border', 'width'),
                                                l = Cn(o, 'padding');
                                            ((e = t.width - l.width - s.width),
                                                (i = t.height - l.height - s.height),
                                                (n = Sn(o.maxWidth, a, 'clientWidth')),
                                                (r = Sn(o.maxHeight, a, 'clientHeight')));
                                        } else ((e = t.clientWidth), (i = t.clientHeight));
                                    }
                                    return { width: e, height: i, maxWidth: n || Oh, maxHeight: r || Oh };
                                })(t, e, i),
                                { width: h, height: c } = l;
                            if ('content-box' === r.boxSizing) {
                                let t = Cn(r, 'border', 'width'),
                                    e = Cn(r, 'padding');
                                ((h -= e.width + t.width), (c -= e.height + t.height));
                            }
                            return (
                                (h = Math.max(0, h - a.width)),
                                (c = Math.max(0, n ? h / n : c - a.height)),
                                (h = vc(Math.min(h, o, l.maxWidth))),
                                (c = vc(Math.min(c, s, l.maxHeight))),
                                h && !c && (c = vc(h / 2)),
                                (void 0 !== e || void 0 !== i) &&
                                    n &&
                                    l.height &&
                                    c > l.height &&
                                    ((c = l.height), (h = vc(Math.floor(c * n)))),
                                { width: h, height: c }
                            );
                        })(t, e, i, n);
                    }
                    isAttached(t) {
                        let e = t && kn(t);
                        return !(!e || !e.isConnected);
                    }
                }),
                (ed = class {
                    static defaults = {};
                    static defaultRoutes = void 0;
                    x;
                    y;
                    active = 0;
                    options;
                    $animations;
                    tooltipPosition(t) {
                        let { x: e, y: i } = this.getProps(['x', 'y'], t);
                        return { x: e, y: i };
                    }
                    hasValue() {
                        return fi(this.x) && fi(this.y);
                    }
                    getProps(t, e) {
                        let i = this.$animations;
                        if (!e || !i) return this;
                        let n = {};
                        return (
                            t.forEach((t) => {
                                n[t] = i[t] && i[t].active() ? i[t]._to : this[t];
                            }),
                            n
                        );
                    }
                }),
                (id = (t) => ('left' === t ? 'right' : 'right' === t ? 'left' : t)),
                (nd = (t, e, i) => ('top' === e || 'left' === e ? t[e] + i : t[e] - i)),
                (rd = (t, e) => Math.min(e || t, t)),
                (ad = class t extends ed {
                    constructor(t) {
                        (super(),
                            (this.id = t.id),
                            (this.type = t.type),
                            (this.options = void 0),
                            (this.ctx = t.ctx),
                            (this.chart = t.chart),
                            (this.top = void 0),
                            (this.bottom = void 0),
                            (this.left = void 0),
                            (this.right = void 0),
                            (this.width = void 0),
                            (this.height = void 0),
                            (this._margins = { left: 0, right: 0, top: 0, bottom: 0 }),
                            (this.maxWidth = void 0),
                            (this.maxHeight = void 0),
                            (this.paddingTop = void 0),
                            (this.paddingBottom = void 0),
                            (this.paddingLeft = void 0),
                            (this.paddingRight = void 0),
                            (this.axis = void 0),
                            (this.labelRotation = void 0),
                            (this.min = void 0),
                            (this.max = void 0),
                            (this._range = void 0),
                            (this.ticks = []),
                            (this._gridLineItems = null),
                            (this._labelItems = null),
                            (this._labelSizes = null),
                            (this._length = 0),
                            (this._maxLength = 0),
                            (this._longestTextCache = {}),
                            (this._startPixel = void 0),
                            (this._endPixel = void 0),
                            (this._reversePixels = 0),
                            (this._userMax = void 0),
                            (this._userMin = void 0),
                            (this._suggestedMax = void 0),
                            (this._suggestedMin = void 0),
                            (this._ticksLength = 0),
                            (this._borderValue = 0),
                            (this._cache = {}),
                            (this._dataLimitsCached = 0),
                            (this.$context = void 0));
                    }
                    init(t) {
                        ((this.options = t.setContext(this.getContext())),
                            (this.axis = t.axis),
                            (this._userMin = this.parse(t.min)),
                            (this._userMax = this.parse(t.max)),
                            (this._suggestedMin = this.parse(t.suggestedMin)),
                            (this._suggestedMax = this.parse(t.suggestedMax)));
                    }
                    parse(t, e) {
                        return t;
                    }
                    getUserBounds() {
                        let { _userMin: t, _userMax: e, _suggestedMin: i, _suggestedMax: n } = this;
                        return (
                            (t = Je(t, 1 / 0)),
                            (e = Je(e, -1 / 0)),
                            (i = Je(i, 1 / 0)),
                            (n = Je(n, -1 / 0)),
                            { min: Je(t, i), max: Je(e, n), minDefined: Ke(t), maxDefined: Ke(e) }
                        );
                    }
                    getMinMax(t) {
                        let e,
                            { min: i, max: n, minDefined: r, maxDefined: a } = this.getUserBounds();
                        if (r && a) return { min: i, max: n };
                        let o = this.getMatchingVisibleMetas();
                        for (let s = 0, l = o.length; s < l; ++s)
                            ((e = o[s].controller.getMinMax(this, t)),
                                r || (i = Math.min(i, e.min)),
                                a || (n = Math.max(n, e.max)));
                        return (
                            (i = a && i > n ? n : i),
                            (n = r && i > n ? i : n),
                            { min: Je(i, Je(n, i)), max: Je(n, Je(i, n)) }
                        );
                    }
                    getPadding() {
                        return {
                            left: this.paddingLeft || 0,
                            top: this.paddingTop || 0,
                            right: this.paddingRight || 0,
                            bottom: this.paddingBottom || 0
                        };
                    }
                    getTicks() {
                        return this.ticks;
                    }
                    getLabels() {
                        let t = this.chart.data;
                        return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [];
                    }
                    getLabelItems(t = this.chart.chartArea) {
                        return this._labelItems || (this._labelItems = this._computeLabelItems(t));
                    }
                    beforeLayout() {
                        ((this._cache = {}), (this._dataLimitsCached = 0));
                    }
                    beforeUpdate() {
                        ti(this.options.beforeUpdate, [this]);
                    }
                    update(t, e, i) {
                        let { beginAtZero: n, grace: r, ticks: a } = this.options,
                            o = a.sampleSize;
                        (this.beforeUpdate(),
                            (this.maxWidth = t),
                            (this.maxHeight = e),
                            (this._margins = i = Object.assign({ left: 0, right: 0, top: 0, bottom: 0 }, i)),
                            (this.ticks = null),
                            (this._labelSizes = null),
                            (this._gridLineItems = null),
                            (this._labelItems = null),
                            this.beforeSetDimensions(),
                            this.setDimensions(),
                            this.afterSetDimensions(),
                            (this._maxLength = this.isHorizontal()
                                ? this.width + i.left + i.right
                                : this.height + i.top + i.bottom),
                            this._dataLimitsCached ||
                                (this.beforeDataLimits(),
                                this.determineDataLimits(),
                                this.afterDataLimits(),
                                (this._range = (function (t, e, i) {
                                    let { min: n, max: r } = t,
                                        a = Sh(e, (r - n) / 2),
                                        o = (t, e) => (i && 0 === t ? 0 : t + e);
                                    return { min: o(n, -Math.abs(a)), max: o(r, a) };
                                })(this, r, n)),
                                (this._dataLimitsCached = 1)),
                            this.beforeBuildTicks(),
                            (this.ticks = this.buildTicks() || []),
                            this.afterBuildTicks());
                        let s = o < this.ticks.length;
                        (this._convertTicksToLabels(s ? Tr(this.ticks, o) : this.ticks),
                            this.configure(),
                            this.beforeCalculateLabelRotation(),
                            this.calculateLabelRotation(),
                            this.afterCalculateLabelRotation(),
                            a.display &&
                                (a.autoSkip || 'auto' === a.source) &&
                                ((this.ticks = (function (t, e) {
                                    let i = t.options.ticks,
                                        n = (function (t) {
                                            let e = t.options.offset,
                                                i = t._tickSize();
                                            return Math.floor(Math.min(t._length / i + (e ? 0 : 1), t._maxLength / i));
                                        })(t),
                                        r = Math.min(i.maxTicksLimit || n, n),
                                        a = i.major.enabled
                                            ? (function (t) {
                                                  let e,
                                                      i,
                                                      n = [];
                                                  for (e = 0, i = t.length; e < i; e++) t[e].major && n.push(e);
                                                  return n;
                                              })(e)
                                            : [],
                                        o = a.length,
                                        s = a[0],
                                        l = a[o - 1],
                                        h = [];
                                    if (o > r)
                                        return (
                                            (function (t, e, i, n) {
                                                let r,
                                                    a = 0,
                                                    o = i[0];
                                                for (n = Math.ceil(n), r = 0; r < t.length; r++)
                                                    r === o && (e.push(t[r]), a++, (o = i[a * n]));
                                            })(e, h, a, o / r),
                                            h
                                        );
                                    let c = (function (t, e, i) {
                                        let n = (function (t) {
                                                let e,
                                                    i,
                                                    n = t.length;
                                                if (n < 2) return 0;
                                                for (i = t[0], e = 1; e < n; ++e) if (t[e] - t[e - 1] !== i) return 0;
                                                return i;
                                            })(t),
                                            r = e.length / i;
                                        if (!n) return Math.max(r, 1);
                                        let a = (function (t) {
                                            let e,
                                                i = [],
                                                n = Math.sqrt(t);
                                            for (e = 1; e < n; e++) t % e === 0 && (i.push(e), i.push(t / e));
                                            return (n === (0 | n) && i.push(n), i.sort((t, e) => t - e).pop(), i);
                                        })(n);
                                        for (let t = 0, e = a.length - 1; t < e; t++) {
                                            let e = a[t];
                                            if (e > r) return e;
                                        }
                                        return Math.max(r, 1);
                                    })(a, e, r);
                                    if (o > 0) {
                                        let t,
                                            i,
                                            n = o > 1 ? Math.round((l - s) / (o - 1)) : null;
                                        for (Ar(e, h, c, Xe(n) ? 0 : s - n, s), t = 0, i = o - 1; t < i; t++)
                                            Ar(e, h, c, a[t], a[t + 1]);
                                        return (Ar(e, h, c, l, Xe(n) ? e.length : l + n), h);
                                    }
                                    return (Ar(e, h, c), h);
                                })(this, this.ticks)),
                                (this._labelSizes = null),
                                this.afterAutoSkip()),
                            s && this._convertTicksToLabels(this.ticks),
                            this.beforeFit(),
                            this.fit(),
                            this.afterFit(),
                            this.afterUpdate());
                    }
                    configure() {
                        let t,
                            e,
                            i = this.options.reverse;
                        (this.isHorizontal()
                            ? ((t = this.left), (e = this.right))
                            : ((t = this.top), (e = this.bottom), (i = !i)),
                            (this._startPixel = t),
                            (this._endPixel = e),
                            (this._reversePixels = i),
                            (this._length = e - t),
                            (this._alignToPixels = this.options.alignToPixels));
                    }
                    afterUpdate() {
                        ti(this.options.afterUpdate, [this]);
                    }
                    beforeSetDimensions() {
                        ti(this.options.beforeSetDimensions, [this]);
                    }
                    setDimensions() {
                        (this.isHorizontal()
                            ? ((this.width = this.maxWidth), (this.left = 0), (this.right = this.width))
                            : ((this.height = this.maxHeight), (this.top = 0), (this.bottom = this.height)),
                            (this.paddingLeft = 0),
                            (this.paddingTop = 0),
                            (this.paddingRight = 0),
                            (this.paddingBottom = 0));
                    }
                    afterSetDimensions() {
                        ti(this.options.afterSetDimensions, [this]);
                    }
                    _callHooks(t) {
                        (this.chart.notifyPlugins(t, this.getContext()), ti(this.options[t], [this]));
                    }
                    beforeDataLimits() {
                        this._callHooks('beforeDataLimits');
                    }
                    determineDataLimits() {}
                    afterDataLimits() {
                        this._callHooks('afterDataLimits');
                    }
                    beforeBuildTicks() {
                        this._callHooks('beforeBuildTicks');
                    }
                    buildTicks() {
                        return [];
                    }
                    afterBuildTicks() {
                        this._callHooks('afterBuildTicks');
                    }
                    beforeTickToLabelConversion() {
                        ti(this.options.beforeTickToLabelConversion, [this]);
                    }
                    generateTickLabels(t) {
                        let e,
                            i,
                            n,
                            r = this.options.ticks;
                        for (e = 0, i = t.length; e < i; e++)
                            ((n = t[e]), (n.label = ti(r.callback, [n.value, e, t], this)));
                    }
                    afterTickToLabelConversion() {
                        ti(this.options.afterTickToLabelConversion, [this]);
                    }
                    beforeCalculateLabelRotation() {
                        ti(this.options.beforeCalculateLabelRotation, [this]);
                    }
                    calculateLabelRotation() {
                        let t,
                            e,
                            i,
                            n = this.options,
                            r = n.ticks,
                            a = rd(this.ticks.length, n.ticks.maxTicksLimit),
                            o = r.minRotation || 0,
                            s = r.maxRotation,
                            l = o;
                        if (!this._isVisible() || !r.display || o >= s || a <= 1 || !this.isHorizontal())
                            return void (this.labelRotation = o);
                        let h = this._getLabelSizes(),
                            c = h.widest.width,
                            d = h.highest.height,
                            u = Mi(this.chart.width - c, 0, this.maxWidth);
                        ((t = n.offset ? this.maxWidth / a : u / (a - 1)),
                            c + 6 > t &&
                                ((t = u / (a - (n.offset ? 0.5 : 1))),
                                (e = this.maxHeight - Rr(n.grid) - r.padding - Ir(n.title, this.chart.options.font)),
                                (i = Math.sqrt(c * c + d * d)),
                                (l = mi(
                                    Math.min(
                                        Math.asin(Mi((h.highest.height + 6) / t, -1, 1)),
                                        Math.asin(Mi(e / i, -1, 1)) - Math.asin(Mi(d / i, -1, 1))
                                    )
                                )),
                                (l = Math.max(o, Math.min(s, l)))),
                            (this.labelRotation = l));
                    }
                    afterCalculateLabelRotation() {
                        ti(this.options.afterCalculateLabelRotation, [this]);
                    }
                    afterAutoSkip() {}
                    beforeFit() {
                        ti(this.options.beforeFit, [this]);
                    }
                    fit() {
                        let t = { width: 0, height: 0 },
                            {
                                chart: e,
                                options: { ticks: i, title: n, grid: r }
                            } = this,
                            a = this._isVisible(),
                            o = this.isHorizontal();
                        if (a) {
                            let a = Ir(n, e.options.font);
                            if (
                                (o
                                    ? ((t.width = this.maxWidth), (t.height = Rr(r) + a))
                                    : ((t.height = this.maxHeight), (t.width = Rr(r) + a)),
                                i.display && this.ticks.length)
                            ) {
                                let { first: e, last: n, widest: r, highest: a } = this._getLabelSizes(),
                                    s = 2 * i.padding,
                                    l = pi(this.labelRotation),
                                    h = Math.cos(l),
                                    c = Math.sin(l);
                                (o
                                    ? (t.height = Math.min(
                                          this.maxHeight,
                                          t.height + (i.mirror ? 0 : c * r.width + h * a.height) + s
                                      ))
                                    : (t.width = Math.min(
                                          this.maxWidth,
                                          t.width + (i.mirror ? 0 : h * r.width + c * a.height) + s
                                      )),
                                    this._calculatePadding(e, n, c, h));
                            }
                        }
                        (this._handleMargins(),
                            o
                                ? ((this.width = this._length = e.width - this._margins.left - this._margins.right),
                                  (this.height = t.height))
                                : ((this.width = t.width),
                                  (this.height = this._length = e.height - this._margins.top - this._margins.bottom)));
                    }
                    _calculatePadding(t, e, i, n) {
                        let {
                                ticks: { align: r, padding: a },
                                position: o
                            } = this.options,
                            s = 0 !== this.labelRotation,
                            l = 'top' !== o && 'x' === this.axis;
                        if (this.isHorizontal()) {
                            let o = this.getPixelForTick(0) - this.left,
                                h = this.right - this.getPixelForTick(this.ticks.length - 1),
                                c = 0,
                                d = 0;
                            (s
                                ? l
                                    ? ((c = n * t.width), (d = i * e.height))
                                    : ((c = i * t.height), (d = n * e.width))
                                : 'start' === r
                                  ? (d = e.width)
                                  : 'end' === r
                                    ? (c = t.width)
                                    : 'inner' !== r && ((c = t.width / 2), (d = e.width / 2)),
                                (this.paddingLeft = Math.max(((c - o + a) * this.width) / (this.width - o), 0)),
                                (this.paddingRight = Math.max(((d - h + a) * this.width) / (this.width - h), 0)));
                        } else {
                            let i = e.height / 2,
                                n = t.height / 2;
                            ('start' === r ? ((i = 0), (n = t.height)) : 'end' === r && ((i = e.height), (n = 0)),
                                (this.paddingTop = i + a),
                                (this.paddingBottom = n + a));
                        }
                    }
                    _handleMargins() {
                        this._margins &&
                            ((this._margins.left = Math.max(this.paddingLeft, this._margins.left)),
                            (this._margins.top = Math.max(this.paddingTop, this._margins.top)),
                            (this._margins.right = Math.max(this.paddingRight, this._margins.right)),
                            (this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom)));
                    }
                    afterFit() {
                        ti(this.options.afterFit, [this]);
                    }
                    isHorizontal() {
                        let { axis: t, position: e } = this.options;
                        return 'top' === e || 'bottom' === e || 'x' === t;
                    }
                    isFullSize() {
                        return this.options.fullSize;
                    }
                    _convertTicksToLabels(t) {
                        let e, i;
                        for (
                            this.beforeTickToLabelConversion(), this.generateTickLabels(t), e = 0, i = t.length;
                            e < i;
                            e++
                        )
                            Xe(t[e].label) && (t.splice(e, 1), i--, e--);
                        this.afterTickToLabelConversion();
                    }
                    _getLabelSizes() {
                        let t = this._labelSizes;
                        if (!t) {
                            let e = this.options.ticks.sampleSize,
                                i = this.ticks;
                            (e < i.length && (i = Tr(i, e)),
                                (this._labelSizes = t =
                                    this._computeLabelSizes(i, i.length, this.options.ticks.maxTicksLimit)));
                        }
                        return t;
                    }
                    _computeLabelSizes(t, e, i) {
                        let n,
                            r,
                            a,
                            o,
                            s,
                            l,
                            h,
                            c,
                            d,
                            u,
                            f,
                            { ctx: g, _longestTextCache: p } = this,
                            m = [],
                            b = [],
                            v = Math.floor(e / rd(e, i)),
                            x = 0,
                            y = 0;
                        for (n = 0; n < e; n += v) {
                            if (
                                ((o = t[n].label),
                                (s = this._resolveTickFontOptions(n)),
                                (g.font = l = s.string),
                                (h = p[l] = p[l] || { data: {}, gc: [] }),
                                (c = s.lineHeight),
                                (d = u = 0),
                                Xe(o) || Ge(o))
                            ) {
                                if (Ge(o))
                                    for (r = 0, a = o.length; r < a; ++r)
                                        ((f = o[r]), !Xe(f) && !Ge(f) && ((d = Bi(g, h.data, h.gc, d, f)), (u += c)));
                            } else ((d = Bi(g, h.data, h.gc, d, o)), (u = c));
                            (m.push(d), b.push(u), (x = Math.max(d, x)), (y = Math.max(u, y)));
                        }
                        !(function (t, e) {
                            ei(t, (t) => {
                                let i,
                                    n = t.gc,
                                    r = n.length / 2;
                                if (r > e) {
                                    for (i = 0; i < r; ++i) delete t.data[n[i]];
                                    n.splice(0, r);
                                }
                            });
                        })(p, e);
                        let _ = m.indexOf(x),
                            w = b.indexOf(y),
                            M = (t) => ({ width: m[t] || 0, height: b[t] || 0 });
                        return { first: M(0), last: M(e - 1), widest: M(_), highest: M(w), widths: m, heights: b };
                    }
                    getLabelForValue(t) {
                        return t;
                    }
                    getPixelForValue(t, e) {
                        return NaN;
                    }
                    getValueForPixel(t) {}
                    getPixelForTick(t) {
                        let e = this.ticks;
                        return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
                    }
                    getPixelForDecimal(t) {
                        this._reversePixels && (t = 1 - t);
                        let e = this._startPixel + t * this._length;
                        return (function (t) {
                            return Mi(t, -32768, 32767);
                        })(this._alignToPixels ? Ni(this.chart, e, 0) : e);
                    }
                    getDecimalForPixel(t) {
                        let e = (t - this._startPixel) / this._length;
                        return this._reversePixels ? 1 - e : e;
                    }
                    getBasePixel() {
                        return this.getPixelForValue(this.getBaseValue());
                    }
                    getBaseValue() {
                        let { min: t, max: e } = this;
                        return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0;
                    }
                    getContext(t) {
                        let e = this.ticks || [];
                        if (t >= 0 && t < e.length) {
                            let i = e[t];
                            return (
                                i.$context ||
                                (i.$context = (function (t, e, i) {
                                    return hn(t, { tick: i, index: e, type: 'tick' });
                                })(this.getContext(), t, i))
                            );
                        }
                        return (
                            this.$context ||
                            (this.$context = (function (t, e) {
                                return hn(t, { scale: e, type: 'scale' });
                            })(this.chart.getContext(), this))
                        );
                    }
                    _tickSize() {
                        let t = this.options.ticks,
                            e = pi(this.labelRotation),
                            i = Math.abs(Math.cos(e)),
                            n = Math.abs(Math.sin(e)),
                            r = this._getLabelSizes(),
                            a = t.autoSkipPadding || 0,
                            o = r ? r.widest.width + a : 0,
                            s = r ? r.highest.height + a : 0;
                        return this.isHorizontal() ? (s * i > o * n ? o / i : s / n) : s * n < o * i ? s / i : o / n;
                    }
                    _isVisible() {
                        let t = this.options.display;
                        return 'auto' !== t ? !!t : this.getMatchingVisibleMetas().length > 0;
                    }
                    _computeGridLineItems(t) {
                        let e,
                            i,
                            n,
                            r,
                            a,
                            o,
                            s,
                            l,
                            h,
                            c,
                            d,
                            u,
                            f = this.axis,
                            g = this.chart,
                            p = this.options,
                            { grid: m, position: b, border: v } = p,
                            x = m.offset,
                            y = this.isHorizontal(),
                            _ = this.ticks.length + (x ? 1 : 0),
                            w = Rr(m),
                            M = [],
                            k = v.setContext(this.getContext()),
                            S = k.display ? k.width : 0,
                            C = S / 2,
                            L = function (t) {
                                return Ni(g, t, S);
                            };
                        if ('top' === b)
                            ((e = L(this.bottom)),
                                (o = this.bottom - w),
                                (l = e - C),
                                (c = L(t.top) + C),
                                (u = t.bottom));
                        else if ('bottom' === b)
                            ((e = L(this.top)), (c = t.top), (u = L(t.bottom) - C), (o = e + C), (l = this.top + w));
                        else if ('left' === b)
                            ((e = L(this.right)),
                                (a = this.right - w),
                                (s = e - C),
                                (h = L(t.left) + C),
                                (d = t.right));
                        else if ('right' === b)
                            ((e = L(this.left)), (h = t.left), (d = L(t.right) - C), (a = e + C), (s = this.left + w));
                        else if ('x' === f) {
                            if ('center' === b) e = L((t.top + t.bottom) / 2 + 0.5);
                            else if (Ze(b)) {
                                let t = Object.keys(b)[0];
                                e = L(this.chart.scales[t].getPixelForValue(b[t]));
                            }
                            ((c = t.top), (u = t.bottom), (o = e + C), (l = o + w));
                        } else if ('y' === f) {
                            if ('center' === b) e = L((t.left + t.right) / 2);
                            else if (Ze(b)) {
                                let t = Object.keys(b)[0];
                                e = L(this.chart.scales[t].getPixelForValue(b[t]));
                            }
                            ((a = e - C), (s = a - w), (h = t.left), (d = t.right));
                        }
                        let E = Qe(p.ticks.maxTicksLimit, _),
                            P = Math.max(1, Math.ceil(_ / E));
                        for (i = 0; i < _; i += P) {
                            let t = this.getContext(i),
                                e = m.setContext(t),
                                f = v.setContext(t),
                                p = e.lineWidth,
                                b = e.color,
                                _ = f.dash || [],
                                w = f.dashOffset,
                                k = e.tickWidth,
                                S = e.tickColor,
                                C = e.tickBorderDash || [],
                                L = e.tickBorderDashOffset;
                            ((n = Or(this, i, x)),
                                void 0 !== n &&
                                    ((r = Ni(g, n, p)),
                                    y ? (a = s = h = d = r) : (o = l = c = u = r),
                                    M.push({
                                        tx1: a,
                                        ty1: o,
                                        tx2: s,
                                        ty2: l,
                                        x1: h,
                                        y1: c,
                                        x2: d,
                                        y2: u,
                                        width: p,
                                        color: b,
                                        borderDash: _,
                                        borderDashOffset: w,
                                        tickWidth: k,
                                        tickColor: S,
                                        tickBorderDash: C,
                                        tickBorderDashOffset: L
                                    })));
                        }
                        return ((this._ticksLength = _), (this._borderValue = e), M);
                    }
                    _computeLabelItems(t) {
                        let e,
                            i,
                            n,
                            r,
                            a,
                            o,
                            s,
                            l,
                            h,
                            c,
                            d,
                            u,
                            f = this.axis,
                            g = this.options,
                            { position: p, ticks: m } = g,
                            b = this.isHorizontal(),
                            v = this.ticks,
                            { align: x, crossAlign: y, padding: _, mirror: w } = m,
                            M = Rr(g.grid),
                            k = M + _,
                            S = w ? -_ : k,
                            C = -pi(this.labelRotation),
                            L = [],
                            E = 'middle';
                        if ('top' === p) ((o = this.bottom - S), (s = this._getXAxisLabelAlignment()));
                        else if ('bottom' === p) ((o = this.top + S), (s = this._getXAxisLabelAlignment()));
                        else if ('left' === p) {
                            let t = this._getYAxisLabelAlignment(M);
                            ((s = t.textAlign), (a = t.x));
                        } else if ('right' === p) {
                            let t = this._getYAxisLabelAlignment(M);
                            ((s = t.textAlign), (a = t.x));
                        } else if ('x' === f) {
                            if ('center' === p) o = (t.top + t.bottom) / 2 + k;
                            else if (Ze(p)) {
                                let t = Object.keys(p)[0];
                                o = this.chart.scales[t].getPixelForValue(p[t]) + k;
                            }
                            s = this._getXAxisLabelAlignment();
                        } else if ('y' === f) {
                            if ('center' === p) a = (t.left + t.right) / 2 - k;
                            else if (Ze(p)) {
                                let t = Object.keys(p)[0];
                                a = this.chart.scales[t].getPixelForValue(p[t]);
                            }
                            s = this._getYAxisLabelAlignment(M).textAlign;
                        }
                        'y' === f && ('start' === x ? (E = 'top') : 'end' === x && (E = 'bottom'));
                        let P = this._getLabelSizes();
                        for (e = 0, i = v.length; e < i; ++e) {
                            ((n = v[e]), (r = n.label));
                            let t = m.setContext(this.getContext(e));
                            ((l = this.getPixelForTick(e) + m.labelOffset),
                                (h = this._resolveTickFontOptions(e)),
                                (c = h.lineHeight),
                                (d = Ge(r) ? r.length : 1));
                            let f,
                                g = d / 2,
                                x = t.color,
                                _ = t.textStrokeColor,
                                M = t.textStrokeWidth,
                                k = s;
                            if (
                                (b
                                    ? ((a = l),
                                      'inner' === s &&
                                          (k =
                                              e === i - 1
                                                  ? this.options.reverse
                                                      ? 'left'
                                                      : 'right'
                                                  : 0 === e
                                                    ? this.options.reverse
                                                        ? 'right'
                                                        : 'left'
                                                    : 'center'),
                                      (u =
                                          'top' === p
                                              ? 'near' === y || 0 !== C
                                                  ? -d * c + c / 2
                                                  : 'center' === y
                                                    ? -P.highest.height / 2 - g * c + c
                                                    : c / 2 - P.highest.height
                                              : 'near' === y || 0 !== C
                                                ? c / 2
                                                : 'center' === y
                                                  ? P.highest.height / 2 - g * c
                                                  : P.highest.height - d * c),
                                      w && (u *= -1),
                                      0 !== C && !t.showLabelBackdrop && (a += (c / 2) * Math.sin(C)))
                                    : ((o = l), (u = ((1 - d) * c) / 2)),
                                t.showLabelBackdrop)
                            ) {
                                let n = on(t.backdropPadding),
                                    r = P.heights[e],
                                    a = P.widths[e],
                                    o = u - n.top,
                                    l = 0 - n.left;
                                switch (E) {
                                    case 'middle':
                                        o -= r / 2;
                                        break;
                                    case 'bottom':
                                        o -= r;
                                }
                                switch (s) {
                                    case 'center':
                                        l -= a / 2;
                                        break;
                                    case 'right':
                                        l -= a;
                                        break;
                                    case 'inner':
                                        e === i - 1 ? (l -= a) : e > 0 && (l -= a / 2);
                                }
                                f = {
                                    left: l,
                                    top: o,
                                    width: a + n.width,
                                    height: r + n.height,
                                    color: t.backdropColor
                                };
                            }
                            L.push({
                                label: r,
                                font: h,
                                textOffset: u,
                                options: {
                                    rotation: C,
                                    color: x,
                                    strokeColor: _,
                                    strokeWidth: M,
                                    textAlign: k,
                                    textBaseline: E,
                                    translation: [a, o],
                                    backdrop: f
                                }
                            });
                        }
                        return L;
                    }
                    _getXAxisLabelAlignment() {
                        let { position: t, ticks: e } = this.options;
                        if (-pi(this.labelRotation)) return 'top' === t ? 'left' : 'right';
                        let i = 'center';
                        return (
                            'start' === e.align
                                ? (i = 'left')
                                : 'end' === e.align
                                  ? (i = 'right')
                                  : 'inner' === e.align && (i = 'inner'),
                            i
                        );
                    }
                    _getYAxisLabelAlignment(t) {
                        let e,
                            i,
                            {
                                position: n,
                                ticks: { crossAlign: r, mirror: a, padding: o }
                            } = this.options,
                            s = t + o,
                            l = this._getLabelSizes().widest.width;
                        return (
                            'left' === n
                                ? a
                                    ? ((i = this.right + o),
                                      'near' === r
                                          ? (e = 'left')
                                          : 'center' === r
                                            ? ((e = 'center'), (i += l / 2))
                                            : ((e = 'right'), (i += l)))
                                    : ((i = this.right - s),
                                      'near' === r
                                          ? (e = 'right')
                                          : 'center' === r
                                            ? ((e = 'center'), (i -= l / 2))
                                            : ((e = 'left'), (i = this.left)))
                                : 'right' === n
                                  ? a
                                      ? ((i = this.left + o),
                                        'near' === r
                                            ? (e = 'right')
                                            : 'center' === r
                                              ? ((e = 'center'), (i -= l / 2))
                                              : ((e = 'left'), (i -= l)))
                                      : ((i = this.left + s),
                                        'near' === r
                                            ? (e = 'left')
                                            : 'center' === r
                                              ? ((e = 'center'), (i += l / 2))
                                              : ((e = 'right'), (i = this.right)))
                                  : (e = 'right'),
                            { textAlign: e, x: i }
                        );
                    }
                    _computeLabelArea() {
                        if (this.options.ticks.mirror) return;
                        let t = this.chart,
                            e = this.options.position;
                        return 'left' === e || 'right' === e
                            ? { top: 0, left: this.left, bottom: t.height, right: this.right }
                            : 'top' === e || 'bottom' === e
                              ? { top: this.top, left: 0, bottom: this.bottom, right: t.width }
                              : void 0;
                    }
                    drawBackground() {
                        let {
                            ctx: t,
                            options: { backgroundColor: e },
                            left: i,
                            top: n,
                            width: r,
                            height: a
                        } = this;
                        e && (t.save(), (t.fillStyle = e), t.fillRect(i, n, r, a), t.restore());
                    }
                    getLineWidthForValue(t) {
                        let e = this.options.grid;
                        if (!this._isVisible() || !e.display) return 0;
                        let i = this.ticks.findIndex((e) => e.value === t);
                        return i >= 0 ? e.setContext(this.getContext(i)).lineWidth : 0;
                    }
                    drawGrid(t) {
                        let e,
                            i,
                            n = this.options.grid,
                            r = this.ctx,
                            a = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t)),
                            o = (t, e, i) => {
                                !i.width ||
                                    !i.color ||
                                    (r.save(),
                                    (r.lineWidth = i.width),
                                    (r.strokeStyle = i.color),
                                    r.setLineDash(i.borderDash || []),
                                    (r.lineDashOffset = i.borderDashOffset),
                                    r.beginPath(),
                                    r.moveTo(t.x, t.y),
                                    r.lineTo(e.x, e.y),
                                    r.stroke(),
                                    r.restore());
                            };
                        if (n.display)
                            for (e = 0, i = a.length; e < i; ++e) {
                                let t = a[e];
                                (n.drawOnChartArea && o({ x: t.x1, y: t.y1 }, { x: t.x2, y: t.y2 }, t),
                                    n.drawTicks &&
                                        o(
                                            { x: t.tx1, y: t.ty1 },
                                            { x: t.tx2, y: t.ty2 },
                                            {
                                                color: t.tickColor,
                                                width: t.tickWidth,
                                                borderDash: t.tickBorderDash,
                                                borderDashOffset: t.tickBorderDashOffset
                                            }
                                        ));
                            }
                    }
                    drawBorder() {
                        let {
                                chart: t,
                                ctx: e,
                                options: { border: i, grid: n }
                            } = this,
                            r = i.setContext(this.getContext()),
                            a = i.display ? r.width : 0;
                        if (!a) return;
                        let o,
                            s,
                            l,
                            h,
                            c = n.setContext(this.getContext(0)).lineWidth,
                            d = this._borderValue;
                        (this.isHorizontal()
                            ? ((o = Ni(t, this.left, a) - a / 2), (s = Ni(t, this.right, c) + c / 2), (l = h = d))
                            : ((l = Ni(t, this.top, a) - a / 2), (h = Ni(t, this.bottom, c) + c / 2), (o = s = d)),
                            e.save(),
                            (e.lineWidth = r.width),
                            (e.strokeStyle = r.color),
                            e.beginPath(),
                            e.moveTo(o, l),
                            e.lineTo(s, h),
                            e.stroke(),
                            e.restore());
                    }
                    drawLabels(t) {
                        if (!this.options.ticks.display) return;
                        let e = this.ctx,
                            i = this._computeLabelArea();
                        i && qi(e, i);
                        let n = this.getLabelItems(t);
                        for (let t of n) Qi(e, t.label, 0, t.textOffset, t.font, t.options);
                        i && Xi(e);
                    }
                    drawTitle() {
                        let {
                            ctx: t,
                            options: { position: e, title: i, reverse: n }
                        } = this;
                        if (!i.display) return;
                        let r = sn(i.font),
                            a = on(i.padding),
                            o = i.align,
                            s = r.lineHeight / 2;
                        'bottom' === e || 'center' === e || Ze(e)
                            ? ((s += a.bottom), Ge(i.text) && (s += r.lineHeight * (i.text.length - 1)))
                            : (s += a.top);
                        let {
                            titleX: l,
                            titleY: h,
                            maxWidth: c,
                            rotation: d
                        } = (function (t, e, i, n) {
                            let r,
                                a,
                                o,
                                { top: s, left: l, bottom: h, right: c, chart: d } = t,
                                { chartArea: u, scales: f } = d,
                                g = 0,
                                p = h - s,
                                m = c - l;
                            if (t.isHorizontal()) {
                                if (((a = Uh(n, l, c)), Ze(i))) {
                                    let t = Object.keys(i)[0];
                                    o = f[t].getPixelForValue(i[t]) + p - e;
                                } else o = 'center' === i ? (u.bottom + u.top) / 2 + p - e : nd(t, i, e);
                                r = c - l;
                            } else {
                                if (Ze(i)) {
                                    let t = Object.keys(i)[0];
                                    a = f[t].getPixelForValue(i[t]) - m + e;
                                } else a = 'center' === i ? (u.left + u.right) / 2 - m + e : nd(t, i, e);
                                ((o = Uh(n, h, s)), (g = 'left' === i ? -Ih : Ih));
                            }
                            return { titleX: a, titleY: o, maxWidth: r, rotation: g };
                        })(this, s, e, o);
                        Qi(t, i.text, 0, 0, r, {
                            color: i.color,
                            maxWidth: c,
                            rotation: d,
                            textAlign: $r(o, e, n),
                            textBaseline: 'middle',
                            translation: [l, h]
                        });
                    }
                    draw(t) {
                        this._isVisible() &&
                            (this.drawBackground(),
                            this.drawGrid(t),
                            this.drawBorder(),
                            this.drawTitle(),
                            this.drawLabels(t));
                    }
                    _layers() {
                        let e = this.options,
                            i = (e.ticks && e.ticks.z) || 0,
                            n = Qe(e.grid && e.grid.z, -1),
                            r = Qe(e.border && e.border.z, 0);
                        return this._isVisible() && this.draw === t.prototype.draw
                            ? [
                                  {
                                      z: n,
                                      draw: (t) => {
                                          (this.drawBackground(), this.drawGrid(t), this.drawTitle());
                                      }
                                  },
                                  {
                                      z: r,
                                      draw: () => {
                                          this.drawBorder();
                                      }
                                  },
                                  {
                                      z: i,
                                      draw: (t) => {
                                          this.drawLabels(t);
                                      }
                                  }
                              ]
                            : [
                                  {
                                      z: i,
                                      draw: (t) => {
                                          this.draw(t);
                                      }
                                  }
                              ];
                    }
                    getMatchingVisibleMetas(t) {
                        let e,
                            i,
                            n = this.chart.getSortedVisibleDatasetMetas(),
                            r = this.axis + 'AxisID',
                            a = [];
                        for (e = 0, i = n.length; e < i; ++e) {
                            let i = n[e];
                            i[r] === this.id && (!t || i.type === t) && a.push(i);
                        }
                        return a;
                    }
                    _resolveTickFontOptions(t) {
                        return sn(this.options.ticks.setContext(this.getContext(t)).font);
                    }
                    _maxDigits() {
                        let t = this._resolveTickFontOptions(0).lineHeight;
                        return (this.isHorizontal() ? this.width : this.height) / t;
                    }
                }),
                (od = class {
                    constructor(t, e, i) {
                        ((this.type = t), (this.scope = e), (this.override = i), (this.items = Object.create(null)));
                    }
                    isForType(t) {
                        return {}.isPrototypeOf.call(this.type.prototype, t.prototype);
                    }
                    register(t) {
                        let e,
                            i = Object.getPrototypeOf(t);
                        (function (t) {
                            return 'id' in t && 'defaults' in t;
                        })(i) && (e = this.register(i));
                        let n = this.items,
                            r = t.id,
                            a = this.scope + '.' + r;
                        if (!r) throw Error('class does not have id: ' + t);
                        return (
                            r in n ||
                                ((n[r] = t),
                                (function (t, e, i) {
                                    let n = oi(Object.create(null), [i ? ac.get(i) : {}, ac.get(e), t.defaults]);
                                    (ac.set(e, n),
                                        t.defaultRoutes &&
                                            (function (t, e) {
                                                Object.keys(e).forEach((i) => {
                                                    let n = i.split('.'),
                                                        r = n.pop(),
                                                        a = [t].concat(n).join('.'),
                                                        o = e[i].split('.'),
                                                        s = o.pop(),
                                                        l = o.join('.');
                                                    ac.route(a, r, l, s);
                                                });
                                            })(e, t.defaultRoutes),
                                        t.descriptors && ac.describe(e, t.descriptors));
                                })(t, a, e),
                                this.override && ac.override(t.id, t.overrides)),
                            a
                        );
                    }
                    get(t) {
                        return this.items[t];
                    }
                    unregister(t) {
                        let e = this.items,
                            i = t.id,
                            n = this.scope;
                        (i in e && delete e[i], n && i in ac[n] && (delete ac[n][i], this.override && delete ic[i]));
                    }
                }),
                (sd = class {
                    constructor() {
                        ((this.controllers = new od(Ac, 'datasets', 1)),
                            (this.elements = new od(ed, 'elements')),
                            (this.plugins = new od(Object, 'plugins')),
                            (this.scales = new od(ad, 'scales')),
                            (this._typedRegistries = [this.controllers, this.scales, this.elements]));
                    }
                    add(...t) {
                        this._each('register', t);
                    }
                    remove(...t) {
                        this._each('unregister', t);
                    }
                    addControllers(...t) {
                        this._each('register', t, this.controllers);
                    }
                    addElements(...t) {
                        this._each('register', t, this.elements);
                    }
                    addPlugins(...t) {
                        this._each('register', t, this.plugins);
                    }
                    addScales(...t) {
                        this._each('register', t, this.scales);
                    }
                    getController(t) {
                        return this._get(t, this.controllers, 'controller');
                    }
                    getElement(t) {
                        return this._get(t, this.elements, 'element');
                    }
                    getPlugin(t) {
                        return this._get(t, this.plugins, 'plugin');
                    }
                    getScale(t) {
                        return this._get(t, this.scales, 'scale');
                    }
                    removeControllers(...t) {
                        this._each('unregister', t, this.controllers);
                    }
                    removeElements(...t) {
                        this._each('unregister', t, this.elements);
                    }
                    removePlugins(...t) {
                        this._each('unregister', t, this.plugins);
                    }
                    removeScales(...t) {
                        this._each('unregister', t, this.scales);
                    }
                    _each(t, e, i) {
                        [...e].forEach((e) => {
                            let n = i || this._getRegistryForType(e);
                            i || n.isForType(e) || (n === this.plugins && e.id)
                                ? this._exec(t, n, e)
                                : ei(e, (e) => {
                                      let n = i || this._getRegistryForType(e);
                                      this._exec(t, n, e);
                                  });
                        });
                    }
                    _exec(t, e, i) {
                        let n = ci(t);
                        (ti(i['before' + n], [], i), e[t](i), ti(i['after' + n], [], i));
                    }
                    _getRegistryForType(t) {
                        for (let e = 0; e < this._typedRegistries.length; e++) {
                            let i = this._typedRegistries[e];
                            if (i.isForType(t)) return i;
                        }
                        return this.plugins;
                    }
                    _get(t, e, i) {
                        let n = e.get(t);
                        if (void 0 === n) throw Error('"' + t + '" is not a registered ' + i + '.');
                        return n;
                    }
                }),
                (ld = new sd()),
                (hd = class {
                    constructor() {
                        this._init = [];
                    }
                    notify(t, e, i, n) {
                        'beforeInit' === e &&
                            ((this._init = this._createDescriptors(t, 1)), this._notify(this._init, t, 'install'));
                        let r = n ? this._descriptors(t).filter(n) : this._descriptors(t),
                            a = this._notify(r, t, e, i);
                        return (
                            'afterDestroy' === e &&
                                (this._notify(r, t, 'stop'), this._notify(this._init, t, 'uninstall')),
                            a
                        );
                    }
                    _notify(t, e, i, n) {
                        n = n || {};
                        for (let r of t) {
                            let t = r.plugin;
                            if (0 == ti(t[i], [e, n, r.options], t) && n.cancelable) return 0;
                        }
                        return 1;
                    }
                    invalidate() {
                        Xe(this._cache) || ((this._oldCache = this._cache), (this._cache = void 0));
                    }
                    _descriptors(t) {
                        if (this._cache) return this._cache;
                        let e = (this._cache = this._createDescriptors(t));
                        return (this._notifyStateChanges(t), e);
                    }
                    _createDescriptors(t, e) {
                        let i = t && t.config,
                            n = Qe(i.options && i.options.plugins, {}),
                            r = (function (t) {
                                let e = {},
                                    i = [],
                                    n = Object.keys(ld.plugins.items);
                                for (let t = 0; t < n.length; t++) i.push(ld.getPlugin(n[t]));
                                let r = t.plugins || [];
                                for (let t = 0; t < r.length; t++) {
                                    let n = r[t];
                                    -1 === i.indexOf(n) && (i.push(n), (e[n.id] = 1));
                                }
                                return { plugins: i, localIds: e };
                            })(i);
                        return 0 != n || e
                            ? (function (t, { plugins: e, localIds: i }, n, r) {
                                  let a = [],
                                      o = t.getContext();
                                  for (let s of e) {
                                      let e = s.id,
                                          l = Fr(n[e], r);
                                      null !== l &&
                                          a.push({
                                              plugin: s,
                                              options: zr(t.config, { plugin: s, local: i[e] }, l, o)
                                          });
                                  }
                                  return a;
                              })(t, r, n, e)
                            : [];
                    }
                    _notifyStateChanges(t) {
                        let e = this._oldCache || [],
                            i = this._cache,
                            n = (t, e) => t.filter((t) => !e.some((e) => t.plugin.id === e.plugin.id));
                        (this._notify(n(e, i), t, 'stop'), this._notify(n(i, e), t, 'start'));
                    }
                }),
                (cd = new Map()),
                (dd = new Set()),
                (ud = (t, e, i) => {
                    let n = hi(e, i);
                    void 0 !== n && t.add(n);
                }),
                (fd = class {
                    constructor(t) {
                        ((this._config = (function (t) {
                            return (((t = t || {}).data = Ur(t.data)), Wr(t), t);
                        })(t)),
                            (this._scopeCache = new Map()),
                            (this._resolverCache = new Map()));
                    }
                    get platform() {
                        return this._config.platform;
                    }
                    get type() {
                        return this._config.type;
                    }
                    set type(t) {
                        this._config.type = t;
                    }
                    get data() {
                        return this._config.data;
                    }
                    set data(t) {
                        this._config.data = Ur(t);
                    }
                    get options() {
                        return this._config.options;
                    }
                    set options(t) {
                        this._config.options = t;
                    }
                    get plugins() {
                        return this._config.plugins;
                    }
                    update() {
                        let t = this._config;
                        (this.clearCache(), Wr(t));
                    }
                    clearCache() {
                        (this._scopeCache.clear(), this._resolverCache.clear());
                    }
                    datasetScopeKeys(t) {
                        return Yr(t, () => [['datasets.' + t, '']]);
                    }
                    datasetAnimationScopeKeys(t, e) {
                        return Yr(`${t}.transition.${e}`, () => [
                            [`datasets.${t}.transitions.${e}`, 'transitions.' + e],
                            ['datasets.' + t, '']
                        ]);
                    }
                    datasetElementScopeKeys(t, e) {
                        return Yr(`${t}-${e}`, () => [
                            [`datasets.${t}.elements.${e}`, 'datasets.' + t, 'elements.' + e, '']
                        ]);
                    }
                    pluginScopeKeys(t) {
                        let e = t.id;
                        return Yr(`${this.type}-plugin-${e}`, () => [
                            ['plugins.' + e, ...(t.additionalOptionScopes || [])]
                        ]);
                    }
                    _cachedScopes(t, e) {
                        let i = this._scopeCache,
                            n = i.get(t);
                        return ((!n || e) && ((n = new Map()), i.set(t, n)), n);
                    }
                    getOptionScopes(t, e, i) {
                        let { options: n, type: r } = this,
                            a = this._cachedScopes(t, i),
                            o = a.get(e);
                        if (o) return o;
                        let s = new Set();
                        e.forEach((e) => {
                            (t && (s.add(t), e.forEach((e) => ud(s, t, e))),
                                e.forEach((t) => ud(s, n, t)),
                                e.forEach((t) => ud(s, ic[r] || {}, t)),
                                e.forEach((t) => ud(s, ac, t)),
                                e.forEach((t) => ud(s, nc, t)));
                        });
                        let l = Array.from(s);
                        return (0 === l.length && l.push(Object.create(null)), dd.has(e) && a.set(e, l), l);
                    }
                    chartOptionScopes() {
                        let { options: t, type: e } = this;
                        return [t, ic[e] || {}, ac.datasets[e] || {}, { type: e }, ac, nc];
                    }
                    resolveNamedOptions(t, e, i, n = ['']) {
                        let r = { $shared: 1 },
                            { resolver: a, subPrefixes: o } = qr(this._resolverCache, t, n),
                            s = a;
                        (function (t, e) {
                            let { isScriptable: i, isIndexable: n } = un(t);
                            for (let r of e) {
                                let e = i(r),
                                    a = n(r),
                                    o = (a || e) && t[r];
                                if ((e && (Eh(o) || gd(o))) || (a && Ge(o))) return 1;
                            }
                            return 0;
                        })(a, e) && ((r.$shared = 0), (s = dn(a, (i = Eh(i) ? i() : i), this.createResolver(t, i, o))));
                        for (let t of e) r[t] = s[t];
                        return r;
                    }
                    createResolver(t, e, i = [''], n) {
                        let { resolver: r } = qr(this._resolverCache, t, i);
                        return Ze(e) ? dn(r, e, void 0, n) : r;
                    }
                }),
                (gd = (t) => Ze(t) && Object.getOwnPropertyNames(t).some((e) => Eh(t[e]))),
                (pd = ['top', 'bottom', 'left', 'right', 'chartArea']),
                (md = {}),
                (bd = (t) => {
                    let e = Jr(t);
                    return Object.values(md)
                        .filter((t) => t.canvas === e)
                        .pop();
                }),
                (vd = class {
                    static defaults = ac;
                    static instances = md;
                    static overrides = ic;
                    static registry = ld;
                    static version = '4.5.0';
                    static getChart = bd;
                    static register(...t) {
                        (ld.add(...t), ta());
                    }
                    static unregister(...t) {
                        (ld.remove(...t), ta());
                    }
                    constructor(t, e) {
                        let i = (this.config = new fd(e)),
                            n = Jr(t),
                            r = bd(n);
                        if (r)
                            throw Error(
                                "Canvas is already in use. Chart with ID '" +
                                    r.id +
                                    "' must be destroyed before the canvas with ID '" +
                                    r.canvas.id +
                                    "' can be reused."
                            );
                        let a = i.createResolver(i.chartOptionScopes(), this.getContext());
                        ((this.platform = new (i.platform ||
                            (function (t) {
                                return !Mn() || (typeof OffscreenCanvas < 'u' && t instanceof OffscreenCanvas)
                                    ? qc
                                    : td;
                            })(n))()),
                            this.platform.updateConfig(i));
                        let o = this.platform.acquireContext(n, a.aspectRatio),
                            s = o && o.canvas,
                            l = s && s.height,
                            h = s && s.width;
                        ((this.id = Mh()),
                            (this.ctx = o),
                            (this.canvas = s),
                            (this.width = h),
                            (this.height = l),
                            (this._options = a),
                            (this._aspectRatio = this.aspectRatio),
                            (this._layers = []),
                            (this._metasets = []),
                            (this._stacks = void 0),
                            (this.boxes = []),
                            (this.currentDevicePixelRatio = void 0),
                            (this.chartArea = void 0),
                            (this._active = []),
                            (this._lastEvent = void 0),
                            (this._listeners = {}),
                            (this._responsiveListeners = void 0),
                            (this._sortedMetasets = []),
                            (this.scales = {}),
                            (this._plugins = new hd()),
                            (this.$proxies = {}),
                            (this._hiddenIndices = {}),
                            (this.attached = 0),
                            (this._animationsDisabled = void 0),
                            (this.$context = void 0),
                            (this._doResize = (function (t, e) {
                                let i;
                                return function (...n) {
                                    return (e ? (clearTimeout(i), (i = setTimeout(t, e, n))) : t.apply(this, n), e);
                                };
                            })((t) => this.update(t), a.resizeDelay || 0)),
                            (this._dataChanges = []),
                            (md[this.id] = this),
                            o && s
                                ? (Mc.listen(this, 'complete', Zr),
                                  Mc.listen(this, 'progress', Kr),
                                  this._initialize(),
                                  this.attached && this.update())
                                : console.error("Failed to create chart: can't acquire context from the given item"));
                    }
                    get aspectRatio() {
                        let {
                            options: { aspectRatio: t, maintainAspectRatio: e },
                            width: i,
                            height: n,
                            _aspectRatio: r
                        } = this;
                        return Xe(t) ? (e && r ? r : n ? i / n : null) : t;
                    }
                    get data() {
                        return this.config.data;
                    }
                    set data(t) {
                        this.config.data = t;
                    }
                    get options() {
                        return this._options;
                    }
                    set options(t) {
                        this.config.options = t;
                    }
                    get registry() {
                        return ld;
                    }
                    _initialize() {
                        return (
                            this.notifyPlugins('beforeInit'),
                            this.options.responsive ? this.resize() : En(this, this.options.devicePixelRatio),
                            this.bindEvents(),
                            this.notifyPlugins('afterInit'),
                            this
                        );
                    }
                    clear() {
                        return (Hi(this.canvas, this.ctx), this);
                    }
                    stop() {
                        return (Mc.stop(this), this);
                    }
                    resize(t, e) {
                        Mc.running(this) ? (this._resizeBeforeDraw = { width: t, height: e }) : this._resize(t, e);
                    }
                    _resize(t, e) {
                        let i = this.options,
                            n = this.platform.getMaximumSize(
                                this.canvas,
                                t,
                                e,
                                i.maintainAspectRatio && this.aspectRatio
                            ),
                            r = i.devicePixelRatio || this.platform.getDevicePixelRatio(),
                            a = this.width ? 'resize' : 'attach';
                        ((this.width = n.width),
                            (this.height = n.height),
                            (this._aspectRatio = this.aspectRatio),
                            En(this, r, 1) &&
                                (this.notifyPlugins('resize', { size: n }),
                                ti(i.onResize, [this, n], this),
                                this.attached && this._doResize(a) && this.render()));
                    }
                    ensureScalesHaveIDs() {
                        ei(this.options.scales || {}, (t, e) => {
                            t.id = e;
                        });
                    }
                    buildOrUpdateScales() {
                        let t = this.options,
                            e = t.scales,
                            i = this.scales,
                            n = Object.keys(i).reduce((t, e) => ((t[e] = 0), t), {}),
                            r = [];
                        (e &&
                            (r = r.concat(
                                Object.keys(e).map((t) => {
                                    let i = e[t],
                                        n = Nr(t, i),
                                        r = 'r' === n,
                                        a = 'x' === n;
                                    return {
                                        options: i,
                                        dposition: r ? 'chartArea' : a ? 'bottom' : 'left',
                                        dtype: r ? 'radialLinear' : a ? 'category' : 'linear'
                                    };
                                })
                            )),
                            ei(r, (e) => {
                                let r = e.options,
                                    a = r.id,
                                    o = Nr(a, r),
                                    s = Qe(r.type, e.dtype);
                                ((void 0 === r.position || Xr(r.position, o) !== Xr(e.dposition)) &&
                                    (r.position = e.dposition),
                                    (n[a] = 1));
                                let l = null;
                                (a in i && i[a].type === s
                                    ? (l = i[a])
                                    : ((l = new (ld.getScale(s))({ id: a, type: s, ctx: this.ctx, chart: this })),
                                      (i[l.id] = l)),
                                    l.init(r, t));
                            }),
                            ei(n, (t, e) => {
                                t || delete i[e];
                            }),
                            ei(i, (t) => {
                                (Uc.configure(this, t, t.options), Uc.addBox(this, t));
                            }));
                    }
                    _updateMetasets() {
                        let t = this._metasets,
                            e = this.data.datasets.length,
                            i = t.length;
                        if ((t.sort((t, e) => t.index - e.index), i > e)) {
                            for (let t = e; t < i; ++t) this._destroyDatasetMeta(t);
                            t.splice(e, i - e);
                        }
                        this._sortedMetasets = t.slice(0).sort(Gr('order', 'index'));
                    }
                    _removeUnreferencedMetasets() {
                        let {
                            _metasets: t,
                            data: { datasets: e }
                        } = this;
                        (t.length > e.length && delete this._stacks,
                            t.forEach((t, i) => {
                                0 === e.filter((e) => e === t._dataset).length && this._destroyDatasetMeta(i);
                            }));
                    }
                    buildOrUpdateControllers() {
                        let t,
                            e,
                            i = [],
                            n = this.data.datasets;
                        for (this._removeUnreferencedMetasets(), t = 0, e = n.length; t < e; t++) {
                            let e = n[t],
                                r = this.getDatasetMeta(t),
                                a = e.type || this.config.type;
                            if (
                                (r.type && r.type !== a && (this._destroyDatasetMeta(t), (r = this.getDatasetMeta(t))),
                                (r.type = a),
                                (r.indexAxis = e.indexAxis || Vr(a, this.options)),
                                (r.order = e.order || 0),
                                (r.index = t),
                                (r.label = '' + e.label),
                                (r.visible = this.isDatasetVisible(t)),
                                r.controller)
                            )
                                (r.controller.updateIndex(t), r.controller.linkScales());
                            else {
                                let e = ld.getController(a),
                                    { datasetElementType: n, dataElementType: o } = ac.datasets[a];
                                (Object.assign(e, {
                                    dataElementType: ld.getElement(o),
                                    datasetElementType: n && ld.getElement(n)
                                }),
                                    (r.controller = new e(this, t)),
                                    i.push(r.controller));
                            }
                        }
                        return (this._updateMetasets(), i);
                    }
                    _resetElements() {
                        ei(
                            this.data.datasets,
                            (t, e) => {
                                this.getDatasetMeta(e).controller.reset();
                            },
                            this
                        );
                    }
                    reset() {
                        (this._resetElements(), this.notifyPlugins('reset'));
                    }
                    update(t) {
                        let e = this.config;
                        e.update();
                        let i = (this._options = e.createResolver(e.chartOptionScopes(), this.getContext())),
                            n = (this._animationsDisabled = !i.animation);
                        if (
                            (this._updateScales(),
                            this._checkEventBindings(),
                            this._updateHiddenIndices(),
                            this._plugins.invalidate(),
                            0 == this.notifyPlugins('beforeUpdate', { mode: t, cancelable: 1 }))
                        )
                            return;
                        let r = this.buildOrUpdateControllers();
                        this.notifyPlugins('beforeElementsUpdate');
                        let a = 0;
                        for (let t = 0, e = this.data.datasets.length; t < e; t++) {
                            let { controller: e } = this.getDatasetMeta(t),
                                i = !n && -1 === r.indexOf(e);
                            (e.buildOrUpdateElements(i), (a = Math.max(+e.getMaxOverflow(), a)));
                        }
                        ((a = this._minPadding = i.layout.autoPadding ? a : 0),
                            this._updateLayout(a),
                            n ||
                                ei(r, (t) => {
                                    t.reset();
                                }),
                            this._updateDatasets(t),
                            this.notifyPlugins('afterUpdate', { mode: t }),
                            this._layers.sort(Gr('z', '_idx')));
                        let { _active: o, _lastEvent: s } = this;
                        (s ? this._eventHandler(s, 1) : o.length && this._updateHoverStyles(o, o, 1), this.render());
                    }
                    _updateScales() {
                        (ei(this.scales, (t) => {
                            Uc.removeBox(this, t);
                        }),
                            this.ensureScalesHaveIDs(),
                            this.buildOrUpdateScales());
                    }
                    _checkEventBindings() {
                        let t = this.options,
                            e = new Set(Object.keys(this._listeners)),
                            i = new Set(t.events);
                        (!Ph(e, i) || !!this._responsiveListeners !== t.responsive) &&
                            (this.unbindEvents(), this.bindEvents());
                    }
                    _updateHiddenIndices() {
                        let { _hiddenIndices: t } = this,
                            e = this._getUniformDataChanges() || [];
                        for (let { method: i, start: n, count: r } of e) Qr(t, n, '_removeElements' === i ? -r : r);
                    }
                    _getUniformDataChanges() {
                        let t = this._dataChanges;
                        if (!t || !t.length) return;
                        this._dataChanges = [];
                        let e = this.data.datasets.length,
                            i = (e) =>
                                new Set(t.filter((t) => t[0] === e).map((t, e) => e + ',' + t.splice(1).join(','))),
                            n = i(0);
                        for (let t = 1; t < e; t++) if (!Ph(n, i(t))) return;
                        return Array.from(n)
                            .map((t) => t.split(','))
                            .map((t) => ({ method: t[1], start: +t[2], count: +t[3] }));
                    }
                    _updateLayout(t) {
                        if (0 == this.notifyPlugins('beforeLayout', { cancelable: 1 })) return;
                        Uc.update(this, this.width, this.height, t);
                        let e = this.chartArea,
                            i = e.width <= 0 || e.height <= 0;
                        ((this._layers = []),
                            ei(
                                this.boxes,
                                (t) => {
                                    (i && 'chartArea' === t.position) ||
                                        (t.configure && t.configure(), this._layers.push(...t._layers()));
                                },
                                this
                            ),
                            this._layers.forEach((t, e) => {
                                t._idx = e;
                            }),
                            this.notifyPlugins('afterLayout'));
                    }
                    _updateDatasets(t) {
                        if (0 != this.notifyPlugins('beforeDatasetsUpdate', { mode: t, cancelable: 1 })) {
                            for (let t = 0, e = this.data.datasets.length; t < e; ++t)
                                this.getDatasetMeta(t).controller.configure();
                            for (let e = 0, i = this.data.datasets.length; e < i; ++e)
                                this._updateDataset(e, Eh(t) ? t({ datasetIndex: e }) : t);
                            this.notifyPlugins('afterDatasetsUpdate', { mode: t });
                        }
                    }
                    _updateDataset(t, e) {
                        let i = this.getDatasetMeta(t),
                            n = { meta: i, index: t, mode: e, cancelable: 1 };
                        0 != this.notifyPlugins('beforeDatasetUpdate', n) &&
                            (i.controller._update(e), (n.cancelable = 0), this.notifyPlugins('afterDatasetUpdate', n));
                    }
                    render() {
                        0 != this.notifyPlugins('beforeRender', { cancelable: 1 }) &&
                            (Mc.has(this)
                                ? this.attached && !Mc.running(this) && Mc.start(this)
                                : (this.draw(), Zr({ chart: this })));
                    }
                    draw() {
                        let t;
                        if (this._resizeBeforeDraw) {
                            let { width: t, height: e } = this._resizeBeforeDraw;
                            ((this._resizeBeforeDraw = null), this._resize(t, e));
                        }
                        if (
                            (this.clear(),
                            this.width <= 0 ||
                                this.height <= 0 ||
                                0 == this.notifyPlugins('beforeDraw', { cancelable: 1 }))
                        )
                            return;
                        let e = this._layers;
                        for (t = 0; t < e.length && e[t].z <= 0; ++t) e[t].draw(this.chartArea);
                        for (this._drawDatasets(); t < e.length; ++t) e[t].draw(this.chartArea);
                        this.notifyPlugins('afterDraw');
                    }
                    _getSortedDatasetMetas(t) {
                        let e,
                            i,
                            n = this._sortedMetasets,
                            r = [];
                        for (e = 0, i = n.length; e < i; ++e) {
                            let i = n[e];
                            (!t || i.visible) && r.push(i);
                        }
                        return r;
                    }
                    getSortedVisibleDatasetMetas() {
                        return this._getSortedDatasetMetas(1);
                    }
                    _drawDatasets() {
                        if (0 == this.notifyPlugins('beforeDatasetsDraw', { cancelable: 1 })) return;
                        let t = this.getSortedVisibleDatasetMetas();
                        for (let e = t.length - 1; e >= 0; --e) this._drawDataset(t[e]);
                        this.notifyPlugins('afterDatasetsDraw');
                    }
                    _drawDataset(t) {
                        let e = this.ctx,
                            i = { meta: t, index: t.index, cancelable: 1 },
                            n = Hn(this, t);
                        0 != this.notifyPlugins('beforeDatasetDraw', i) &&
                            (n && qi(e, n),
                            t.controller.draw(),
                            n && Xi(e),
                            (i.cancelable = 0),
                            this.notifyPlugins('afterDatasetDraw', i));
                    }
                    isPointInArea(t) {
                        return Yi(t, this.chartArea, this._minPadding);
                    }
                    getElementsAtEventForMode(t, e, i, n) {
                        let r = Hc.modes[e];
                        return 'function' == typeof r ? r(this, t, i, n) : [];
                    }
                    getDatasetMeta(t) {
                        let e = this.data.datasets[t],
                            i = this._metasets,
                            n = i.filter((t) => t && t._dataset === e).pop();
                        return (
                            n ||
                                ((n = {
                                    type: null,
                                    data: [],
                                    dataset: null,
                                    controller: null,
                                    hidden: null,
                                    xAxisID: null,
                                    yAxisID: null,
                                    order: (e && e.order) || 0,
                                    index: t,
                                    _dataset: e,
                                    _parsed: [],
                                    _sorted: 0
                                }),
                                i.push(n)),
                            n
                        );
                    }
                    getContext() {
                        return this.$context || (this.$context = hn(null, { chart: this, type: 'chart' }));
                    }
                    getVisibleDatasetCount() {
                        return this.getSortedVisibleDatasetMetas().length;
                    }
                    isDatasetVisible(t) {
                        let e = this.data.datasets[t];
                        if (!e) return 0;
                        let i = this.getDatasetMeta(t);
                        return 'boolean' == typeof i.hidden ? !i.hidden : !e.hidden;
                    }
                    setDatasetVisibility(t, e) {
                        this.getDatasetMeta(t).hidden = !e;
                    }
                    toggleDataVisibility(t) {
                        this._hiddenIndices[t] = !this._hiddenIndices[t];
                    }
                    getDataVisibility(t) {
                        return !this._hiddenIndices[t];
                    }
                    _updateVisibility(t, e, i) {
                        let n = i ? 'show' : 'hide',
                            r = this.getDatasetMeta(t),
                            a = r.controller._resolveAnimations(void 0, n);
                        Lh(e)
                            ? ((r.data[e].hidden = !i), this.update())
                            : (this.setDatasetVisibility(t, i),
                              a.update(r, { visible: i }),
                              this.update((e) => (e.datasetIndex === t ? n : void 0)));
                    }
                    hide(t, e) {
                        this._updateVisibility(t, e, 0);
                    }
                    show(t, e) {
                        this._updateVisibility(t, e, 1);
                    }
                    _destroyDatasetMeta(t) {
                        let e = this._metasets[t];
                        (e && e.controller && e.controller._destroy(), delete this._metasets[t]);
                    }
                    _stop() {
                        let t, e;
                        for (this.stop(), Mc.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)
                            this._destroyDatasetMeta(t);
                    }
                    destroy() {
                        this.notifyPlugins('beforeDestroy');
                        let { canvas: t, ctx: e } = this;
                        (this._stop(),
                            this.config.clearCache(),
                            t &&
                                (this.unbindEvents(),
                                Hi(t, e),
                                this.platform.releaseContext(e),
                                (this.canvas = null),
                                (this.ctx = null)),
                            delete md[this.id],
                            this.notifyPlugins('afterDestroy'));
                    }
                    toBase64Image(...t) {
                        return this.canvas.toDataURL(...t);
                    }
                    bindEvents() {
                        (this.bindUserEvents(),
                            this.options.responsive ? this.bindResponsiveEvents() : (this.attached = 1));
                    }
                    bindUserEvents() {
                        let t = this._listeners,
                            e = this.platform,
                            i = (i, n) => {
                                (e.addEventListener(this, i, n), (t[i] = n));
                            },
                            n = (t, e, i) => {
                                ((t.offsetX = e), (t.offsetY = i), this._eventHandler(t));
                            };
                        ei(this.options.events, (t) => i(t, n));
                    }
                    bindResponsiveEvents() {
                        this._responsiveListeners || (this._responsiveListeners = {});
                        let t,
                            e = this._responsiveListeners,
                            i = this.platform,
                            n = (t, n) => {
                                (i.addEventListener(this, t, n), (e[t] = n));
                            },
                            r = (t, n) => {
                                e[t] && (i.removeEventListener(this, t, n), delete e[t]);
                            },
                            a = (t, e) => {
                                this.canvas && this.resize(t, e);
                            },
                            o = () => {
                                (r('attach', o), (this.attached = 1), this.resize(), n('resize', a), n('detach', t));
                            };
                        ((t = () => {
                            ((this.attached = 0), r('resize', a), this._stop(), this._resize(0, 0), n('attach', o));
                        }),
                            i.isAttached(this.canvas) ? o() : t());
                    }
                    unbindEvents() {
                        (ei(this._listeners, (t, e) => {
                            this.platform.removeEventListener(this, e, t);
                        }),
                            (this._listeners = {}),
                            ei(this._responsiveListeners, (t, e) => {
                                this.platform.removeEventListener(this, e, t);
                            }),
                            (this._responsiveListeners = void 0));
                    }
                    updateHoverStyle(t, e, i) {
                        let n,
                            r,
                            a,
                            o,
                            s = i ? 'set' : 'remove';
                        for (
                            'dataset' === e &&
                                ((n = this.getDatasetMeta(t[0].datasetIndex)),
                                n.controller['_' + s + 'DatasetHoverStyle']()),
                                a = 0,
                                o = t.length;
                            a < o;
                            ++a
                        ) {
                            r = t[a];
                            let e = r && this.getDatasetMeta(r.datasetIndex).controller;
                            e && e[s + 'HoverStyle'](r.element, r.datasetIndex, r.index);
                        }
                    }
                    getActiveElements() {
                        return this._active || [];
                    }
                    setActiveElements(t) {
                        let e = this._active || [],
                            i = t.map(({ datasetIndex: t, index: e }) => {
                                let i = this.getDatasetMeta(t);
                                if (!i) throw Error('No dataset found at index ' + t);
                                return { datasetIndex: t, element: i.data[e], index: e };
                            });
                        !ii(i, e) && ((this._active = i), (this._lastEvent = null), this._updateHoverStyles(i, e));
                    }
                    notifyPlugins(t, e, i) {
                        return this._plugins.notify(this, t, e, i);
                    }
                    isPluginEnabled(t) {
                        return 1 === this._plugins._cache.filter((e) => e.plugin.id === t).length;
                    }
                    _updateHoverStyles(t, e, i) {
                        let n = this.options.hover,
                            r = (t, e) =>
                                t.filter(
                                    (t) => !e.some((e) => t.datasetIndex === e.datasetIndex && t.index === e.index)
                                ),
                            a = r(e, t),
                            o = i ? t : r(t, e);
                        (a.length && this.updateHoverStyle(a, n.mode, 0),
                            o.length && n.mode && this.updateHoverStyle(o, n.mode, 1));
                    }
                    _eventHandler(t, e) {
                        let i = { event: t, replay: e, cancelable: 1, inChartArea: this.isPointInArea(t) },
                            n = (e) => (e.options.events || this.options.events).includes(t.native.type);
                        if (0 == this.notifyPlugins('beforeEvent', i, n)) return;
                        let r = this._handleEvent(t, e, i.inChartArea);
                        return (
                            (i.cancelable = 0),
                            this.notifyPlugins('afterEvent', i, n),
                            (r || i.changed) && this.render(),
                            this
                        );
                    }
                    _handleEvent(t, e, i) {
                        let { _active: n = [], options: r } = this,
                            a = this._getActiveElements(t, n, i, e),
                            o = (function (t) {
                                return 'mouseup' === t.type || 'click' === t.type || 'contextmenu' === t.type;
                            })(t),
                            s = (function (t, e, i, n) {
                                return i && 'mouseout' !== t.type ? (n ? e : t) : null;
                            })(t, this._lastEvent, i, o);
                        i &&
                            ((this._lastEvent = null),
                            ti(r.onHover, [t, a, this], this),
                            o && ti(r.onClick, [t, a, this], this));
                        let l = !ii(a, n);
                        return (
                            (l || e) && ((this._active = a), this._updateHoverStyles(a, n, e)),
                            (this._lastEvent = s),
                            l
                        );
                    }
                    _getActiveElements(t, e, i, n) {
                        if ('mouseout' === t.type) return [];
                        if (!i) return e;
                        let r = this.options.hover;
                        return this.getElementsAtEventForMode(t, r.mode, r, n);
                    }
                }),
                (xd = class extends ed {
                    static id = 'arc';
                    static defaults = {
                        borderAlign: 'center',
                        borderColor: '#fff',
                        borderDash: [],
                        borderDashOffset: 0,
                        borderJoinStyle: void 0,
                        borderRadius: 0,
                        borderWidth: 2,
                        offset: 0,
                        spacing: 0,
                        angle: void 0,
                        circular: 1,
                        selfJoin: 0
                    };
                    static defaultRoutes = { backgroundColor: 'backgroundColor' };
                    static descriptors = { _scriptable: 1, _indexable: (t) => 'borderDash' !== t };
                    circumference;
                    endAngle;
                    fullCircles;
                    innerRadius;
                    outerRadius;
                    pixelMargin;
                    startAngle;
                    constructor(t) {
                        (super(),
                            (this.options = void 0),
                            (this.circumference = void 0),
                            (this.startAngle = void 0),
                            (this.endAngle = void 0),
                            (this.innerRadius = void 0),
                            (this.outerRadius = void 0),
                            (this.pixelMargin = 0),
                            (this.fullCircles = 0),
                            t && Object.assign(this, t));
                    }
                    inRange(t, e, i) {
                        let n = this.getProps(['x', 'y'], i),
                            { angle: r, distance: a } = vi(n, { x: t, y: e }),
                            {
                                startAngle: o,
                                endAngle: s,
                                innerRadius: l,
                                outerRadius: h,
                                circumference: c
                            } = this.getProps(
                                ['startAngle', 'endAngle', 'innerRadius', 'outerRadius', 'circumference'],
                                i
                            ),
                            d = (this.options.spacing + this.options.borderWidth) / 2,
                            u = Qe(c, s - o),
                            f = wi(r, o, s) && o !== s,
                            g = u >= Ah || f,
                            p = ki(a, l + d, h + d);
                        return g && p;
                    }
                    getCenterPoint(t) {
                        let {
                                x: e,
                                y: i,
                                startAngle: n,
                                endAngle: r,
                                innerRadius: a,
                                outerRadius: o
                            } = this.getProps(['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius'], t),
                            { offset: s, spacing: l } = this.options,
                            h = (n + r) / 2,
                            c = (a + o + l + s) / 2;
                        return { x: e + Math.cos(h) * c, y: i + Math.sin(h) * c };
                    }
                    tooltipPosition(t) {
                        return this.getCenterPoint(t);
                    }
                    draw(t) {
                        let { options: e, circumference: i } = this,
                            n = (e.offset || 0) / 4,
                            r = (e.spacing || 0) / 2,
                            a = e.circular;
                        if (
                            ((this.pixelMargin = 'inner' === e.borderAlign ? 0.33 : 0),
                            (this.fullCircles = i > Ah ? Math.floor(i / Ah) : 0),
                            0 === i || this.innerRadius < 0 || this.outerRadius < 0)
                        )
                            return;
                        t.save();
                        let o = (this.startAngle + this.endAngle) / 2;
                        t.translate(Math.cos(o) * n, Math.sin(o) * n);
                        let s = n * (1 - Math.sin(Math.min(Dh, i || 0)));
                        ((t.fillStyle = e.backgroundColor),
                            (t.strokeStyle = e.borderColor),
                            (function (t, e, i, n, r) {
                                let { fullCircles: a, startAngle: o, circumference: s } = e,
                                    l = e.endAngle;
                                if (a) {
                                    ia(t, e, i, n, l, r);
                                    for (let e = 0; e < a; ++e) t.fill();
                                    isNaN(s) || (l = o + (s % Ah || Ah));
                                }
                                (ia(t, e, i, n, l, r), t.fill());
                            })(t, this, s, r, a),
                            (function (t, e, i, n, r) {
                                let { fullCircles: a, startAngle: o, circumference: s, options: l } = e,
                                    {
                                        borderWidth: h,
                                        borderJoinStyle: c,
                                        borderDash: d,
                                        borderDashOffset: u,
                                        borderRadius: f
                                    } = l,
                                    g = 'inner' === l.borderAlign;
                                if (!h) return;
                                (t.setLineDash(d || []),
                                    (t.lineDashOffset = u),
                                    g
                                        ? ((t.lineWidth = 2 * h), (t.lineJoin = c || 'round'))
                                        : ((t.lineWidth = h), (t.lineJoin = c || 'bevel')));
                                let p = e.endAngle;
                                if (a) {
                                    ia(t, e, i, n, p, r);
                                    for (let e = 0; e < a; ++e) t.stroke();
                                    isNaN(s) || (p = o + (s % Ah || Ah));
                                }
                                (g &&
                                    (function (t, e, i) {
                                        let {
                                                startAngle: n,
                                                pixelMargin: r,
                                                x: a,
                                                y: o,
                                                outerRadius: s,
                                                innerRadius: l
                                            } = e,
                                            h = r / s;
                                        (t.beginPath(),
                                            t.arc(a, o, s, n - h, i + h),
                                            l > r
                                                ? ((h = r / l), t.arc(a, o, l, i + h, n - h, 1))
                                                : t.arc(a, o, r, i + Ih, n - Ih),
                                            t.closePath(),
                                            t.clip());
                                    })(t, e, p),
                                    l.selfJoin &&
                                        p - o >= Dh &&
                                        0 === f &&
                                        'miter' !== c &&
                                        (function (t, e, i) {
                                            let {
                                                    startAngle: n,
                                                    x: r,
                                                    y: a,
                                                    outerRadius: o,
                                                    innerRadius: s,
                                                    options: l
                                                } = e,
                                                { borderWidth: h, borderJoinStyle: c } = l,
                                                d = Math.min(h / o, _i(n - i));
                                            if ((t.beginPath(), t.arc(r, a, o - h / 2, n + d / 2, i - d / 2), s > 0)) {
                                                let e = Math.min(h / s, _i(n - i));
                                                t.arc(r, a, s + h / 2, i - e / 2, n + e / 2, 1);
                                            } else {
                                                let e = Math.min(h / 2, o * _i(n - i));
                                                if ('round' === c) t.arc(r, a, e, i - Dh / 2, n + Dh / 2, 1);
                                                else if ('bevel' === c) {
                                                    let o = 2 * e * e,
                                                        s = -o * Math.cos(i + Dh / 2) + r,
                                                        l = -o * Math.sin(i + Dh / 2) + a,
                                                        h = o * Math.cos(n + Dh / 2) + r,
                                                        c = o * Math.sin(n + Dh / 2) + a;
                                                    (t.lineTo(s, l), t.lineTo(h, c));
                                                }
                                            }
                                            (t.closePath(),
                                                t.moveTo(0, 0),
                                                t.rect(0, 0, t.canvas.width, t.canvas.height),
                                                t.clip('evenodd'));
                                        })(t, e, p),
                                    a || (ia(t, e, i, n, p, r), t.stroke()));
                            })(t, this, s, r, a),
                            t.restore());
                    }
                }),
                (yd = 'function' == typeof Path2D),
                (_d = class extends ed {
                    static id = 'line';
                    static defaults = {
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0,
                        borderJoinStyle: 'miter',
                        borderWidth: 3,
                        capBezierPoints: 1,
                        cubicInterpolationMode: 'default',
                        fill: 0,
                        spanGaps: 0,
                        stepped: 0,
                        tension: 0
                    };
                    static defaultRoutes = { backgroundColor: 'backgroundColor', borderColor: 'borderColor' };
                    static descriptors = { _scriptable: 1, _indexable: (t) => 'borderDash' !== t && 'fill' !== t };
                    constructor(t) {
                        (super(),
                            (this.animated = 1),
                            (this.options = void 0),
                            (this._chart = void 0),
                            (this._loop = void 0),
                            (this._fullLoop = void 0),
                            (this._path = void 0),
                            (this._points = void 0),
                            (this._segments = void 0),
                            (this._decimated = 0),
                            (this._pointsUpdated = 0),
                            (this._datasetIndex = void 0),
                            t && Object.assign(this, t));
                    }
                    updateControlPoints(t, e) {
                        let i = this.options;
                        (!i.tension && 'monotone' !== i.cubicInterpolationMode) ||
                            i.stepped ||
                            this._pointsUpdated ||
                            ((function (t, e, i, n, r) {
                                let a, o, s, l;
                                if (
                                    (e.spanGaps && (t = t.filter((t) => !t.skip)),
                                    'monotone' === e.cubicInterpolationMode)
                                )
                                    !(function (t, e = 'x') {
                                        let i,
                                            n,
                                            r,
                                            a = gc(e),
                                            o = t.length,
                                            s = Array(o).fill(0),
                                            l = Array(o),
                                            h = fc(t, 0);
                                        for (i = 0; i < o; ++i)
                                            if (((n = r), (r = h), (h = fc(t, i + 1)), r)) {
                                                if (h) {
                                                    let t = h[e] - r[e];
                                                    s[i] = 0 !== t ? (h[a] - r[a]) / t : 0;
                                                }
                                                l[i] = n
                                                    ? h
                                                        ? Vh(s[i - 1]) !== Vh(s[i])
                                                            ? 0
                                                            : (s[i - 1] + s[i]) / 2
                                                        : s[i - 1]
                                                    : s[i];
                                            }
                                        ((function (t, e, i) {
                                            let n,
                                                r,
                                                a,
                                                o,
                                                s,
                                                l = t.length,
                                                h = fc(t, 0);
                                            for (let c = 0; c < l - 1; ++c)
                                                if (((s = h), (h = fc(t, c + 1)), s && h)) {
                                                    if (di(e[c], 0, uc)) {
                                                        i[c] = i[c + 1] = 0;
                                                        continue;
                                                    }
                                                    ((n = i[c] / e[c]),
                                                        (r = i[c + 1] / e[c]),
                                                        (o = Math.pow(n, 2) + Math.pow(r, 2)),
                                                        !(o <= 9) &&
                                                            ((a = 3 / Math.sqrt(o)),
                                                            (i[c] = n * a * e[c]),
                                                            (i[c + 1] = r * a * e[c])));
                                                }
                                        })(t, s, l),
                                            (function (t, e, i = 'x') {
                                                let n,
                                                    r,
                                                    a,
                                                    o = gc(i),
                                                    s = t.length,
                                                    l = fc(t, 0);
                                                for (let h = 0; h < s; ++h) {
                                                    if (((r = a), (a = l), (l = fc(t, h + 1)), !a)) continue;
                                                    let s = a[i],
                                                        c = a[o];
                                                    (r &&
                                                        ((n = (s - r[i]) / 3),
                                                        (a['cp1' + i] = s - n),
                                                        (a['cp1' + o] = c - n * e[h])),
                                                        l &&
                                                            ((n = (l[i] - s) / 3),
                                                            (a['cp2' + i] = s + n),
                                                            (a['cp2' + o] = c + n * e[h])));
                                                }
                                            })(t, l, e));
                                    })(t, r);
                                else {
                                    let i = n ? t[t.length - 1] : t[0];
                                    for (a = 0, o = t.length; a < o; ++a)
                                        ((s = t[a]),
                                            (l = _n(i, s, t[Math.min(a + 1, o - (n ? 0 : 1)) % o], e.tension)),
                                            (s.cp1x = l.previous.x),
                                            (s.cp1y = l.previous.y),
                                            (s.cp2x = l.next.x),
                                            (s.cp2y = l.next.y),
                                            (i = s));
                                }
                                e.capBezierPoints &&
                                    (function (t, e) {
                                        let i,
                                            n,
                                            r,
                                            a,
                                            o,
                                            s = Yi(t[0], e);
                                        for (i = 0, n = t.length; i < n; ++i)
                                            ((o = a),
                                                (a = s),
                                                (s = i < n - 1 && Yi(t[i + 1], e)),
                                                a &&
                                                    ((r = t[i]),
                                                    o &&
                                                        ((r.cp1x = wn(r.cp1x, e.left, e.right)),
                                                        (r.cp1y = wn(r.cp1y, e.top, e.bottom))),
                                                    s &&
                                                        ((r.cp2x = wn(r.cp2x, e.left, e.right)),
                                                        (r.cp2y = wn(r.cp2y, e.top, e.bottom)))));
                                    })(t, i);
                            })(this._points, i, t, i.spanGaps ? this._loop : this._fullLoop, e),
                            (this._pointsUpdated = 1));
                    }
                    set points(t) {
                        ((this._points = t), delete this._segments, delete this._path, (this._pointsUpdated = 0));
                    }
                    get points() {
                        return this._points;
                    }
                    get segments() {
                        return (
                            this._segments ||
                            (this._segments = (function (t, e) {
                                let i = t.points,
                                    n = t.options.spanGaps,
                                    r = i.length;
                                if (!r) return [];
                                let a = !!t._loop,
                                    { start: o, end: s } = (function (t, e, i, n) {
                                        let r = 0,
                                            a = e - 1;
                                        if (i && !n) for (; r < e && !t[r].skip; ) r++;
                                        for (; r < e && t[r].skip; ) r++;
                                        for (r %= e, i && (a += r); a > r && t[a % e].skip; ) a--;
                                        return ((a %= e), { start: r, end: a });
                                    })(i, r, a, n);
                                return (function (t, e, i, n) {
                                    return n && n.setContext && i
                                        ? (function (t, e, i, n) {
                                              function r(t, e, n, r) {
                                                  let a = l ? -1 : 1;
                                                  if (t !== e) {
                                                      for (t += h; i[t % h].skip; ) t -= a;
                                                      for (; i[e % h].skip; ) e += a;
                                                      t % h !== e % h &&
                                                          (c.push({ start: t % h, end: e % h, loop: n, style: r }),
                                                          (d = r),
                                                          (u = e % h));
                                                  }
                                              }
                                              let a = t._chart.getContext(),
                                                  o = Bn(t.options),
                                                  {
                                                      _datasetIndex: s,
                                                      options: { spanGaps: l }
                                                  } = t,
                                                  h = i.length,
                                                  c = [],
                                                  d = o,
                                                  u = e[0].start,
                                                  f = u;
                                              for (let t of e) {
                                                  u = l ? u : t.start;
                                                  let e,
                                                      o = i[u % h];
                                                  for (f = u + 1; f <= t.end; f++) {
                                                      let l = i[f % h];
                                                      ((e = Bn(
                                                          n.setContext(
                                                              hn(a, {
                                                                  type: 'segment',
                                                                  p0: o,
                                                                  p1: l,
                                                                  p0DataIndex: (f - 1) % h,
                                                                  p1DataIndex: f % h,
                                                                  datasetIndex: s
                                                              })
                                                          )
                                                      )),
                                                          jn(e, d) && r(u, f - 1, t.loop, d),
                                                          (o = l),
                                                          (d = e));
                                                  }
                                                  u < f - 1 && r(u, f - 1, t.loop, d);
                                              }
                                              return c;
                                          })(t, e, i, n)
                                        : e;
                                })(
                                    t,
                                    1 == n
                                        ? [{ start: o, end: s, loop: a }]
                                        : (function (t, e, i, n) {
                                              let r,
                                                  a = t.length,
                                                  o = [],
                                                  s = e,
                                                  l = t[e];
                                              for (r = e + 1; r <= i; ++r) {
                                                  let i = t[r % a];
                                                  (i.skip || i.stop
                                                      ? l.skip ||
                                                        (o.push({ start: e % a, end: (r - 1) % a, loop: (n = 0) }),
                                                        (e = s = i.stop ? r : null))
                                                      : ((s = r), l.skip && (e = r)),
                                                      (l = i));
                                              }
                                              return (null !== s && o.push({ start: e % a, end: s % a, loop: n }), o);
                                          })(i, o, s < o ? s + r : s, !!t._fullLoop && 0 === o && s === r - 1),
                                    i,
                                    e
                                );
                            })(this, this.options.segment))
                        );
                    }
                    first() {
                        let t = this.segments;
                        return t.length && this.points[t[0].start];
                    }
                    last() {
                        let t = this.segments,
                            e = t.length;
                        return e && this.points[t[e - 1].end];
                    }
                    interpolate(t, e) {
                        let i = this.options,
                            n = t[e],
                            r = this.points,
                            a = Vn(this, { property: e, start: n, end: n });
                        if (!a.length) return;
                        let o,
                            s,
                            l = [],
                            h = (function (t) {
                                return t.stepped ? An : t.tension || 'monotone' === t.cubicInterpolationMode ? Tn : Dn;
                            })(i);
                        for (o = 0, s = a.length; o < s; ++o) {
                            let { start: s, end: c } = a[o],
                                d = r[s],
                                u = r[c];
                            if (d === u) {
                                l.push(d);
                                continue;
                            }
                            let f = h(d, u, Math.abs((n - d[e]) / (u[e] - d[e])), i.stepped);
                            ((f[e] = t[e]), l.push(f));
                        }
                        return 1 === l.length ? l[0] : l;
                    }
                    pathSegment(t, e, i) {
                        return la(this)(t, this, e, i);
                    }
                    path(t, e, i) {
                        let n = this.segments,
                            r = la(this),
                            a = this._loop;
                        ((e = e || 0), (i = i || this.points.length - e));
                        for (let o of n) a &= r(t, this, o, { start: e, end: e + i - 1 });
                        return !!a;
                    }
                    draw(t, e, i, n) {
                        ((this.points || []).length &&
                            (this.options || {}).borderWidth &&
                            (t.save(),
                            (function (t, e, i, n) {
                                yd && !e.options.segment
                                    ? (function (t, e, i, n) {
                                          let r = e._path;
                                          (r || ((r = e._path = new Path2D()), e.path(r, i, n) && r.closePath()),
                                              na(t, e.options),
                                              t.stroke(r));
                                      })(t, e, i, n)
                                    : (function (t, e, i, n) {
                                          let { segments: r, options: a } = e,
                                              o = la(e);
                                          for (let s of r)
                                              (na(t, a, s.style),
                                                  t.beginPath(),
                                                  o(t, e, s, { start: i, end: i + n - 1 }) && t.closePath(),
                                                  t.stroke());
                                      })(t, e, i, n);
                            })(t, this, i, n),
                            t.restore()),
                            this.animated && ((this._pointsUpdated = 0), (this._path = void 0)));
                    }
                }),
                (wd = class extends ed {
                    static id = 'point';
                    parsed;
                    skip;
                    stop;
                    static defaults = {
                        borderWidth: 1,
                        hitRadius: 1,
                        hoverBorderWidth: 1,
                        hoverRadius: 4,
                        pointStyle: 'circle',
                        radius: 3,
                        rotation: 0
                    };
                    static defaultRoutes = { backgroundColor: 'backgroundColor', borderColor: 'borderColor' };
                    constructor(t) {
                        (super(),
                            (this.options = void 0),
                            (this.parsed = void 0),
                            (this.skip = void 0),
                            (this.stop = void 0),
                            t && Object.assign(this, t));
                    }
                    inRange(t, e, i) {
                        let n = this.options,
                            { x: r, y: a } = this.getProps(['x', 'y'], i);
                        return Math.pow(t - r, 2) + Math.pow(e - a, 2) < Math.pow(n.hitRadius + n.radius, 2);
                    }
                    inXRange(t, e) {
                        return ha(this, t, 'x', e);
                    }
                    inYRange(t, e) {
                        return ha(this, t, 'y', e);
                    }
                    getCenterPoint(t) {
                        let { x: e, y: i } = this.getProps(['x', 'y'], t);
                        return { x: e, y: i };
                    }
                    size(t) {
                        let e = (t = t || this.options || {}).radius || 0;
                        return ((e = Math.max(e, (e && t.hoverRadius) || 0)), 2 * (e + ((e && t.borderWidth) || 0)));
                    }
                    draw(t, e) {
                        let i = this.options;
                        this.skip ||
                            i.radius < 0.1 ||
                            !Yi(this, e, this.size(i) / 2) ||
                            ((t.strokeStyle = i.borderColor),
                            (t.lineWidth = i.borderWidth),
                            (t.fillStyle = i.backgroundColor),
                            Wi(t, i, this.x, this.y));
                    }
                    getRange() {
                        let t = this.options || {};
                        return t.radius + t.hitRadius;
                    }
                }),
                (Md = class extends ed {
                    static id = 'bar';
                    static defaults = {
                        borderSkipped: 'start',
                        borderWidth: 0,
                        borderRadius: 0,
                        inflateAmount: 'auto',
                        pointStyle: void 0
                    };
                    static defaultRoutes = { backgroundColor: 'backgroundColor', borderColor: 'borderColor' };
                    constructor(t) {
                        (super(),
                            (this.options = void 0),
                            (this.horizontal = void 0),
                            (this.base = void 0),
                            (this.width = void 0),
                            (this.height = void 0),
                            (this.inflateAmount = void 0),
                            t && Object.assign(this, t));
                    }
                    draw(t) {
                        let {
                                inflateAmount: e,
                                options: { borderColor: i, backgroundColor: n }
                            } = this,
                            { inner: r, outer: a } = (function (t) {
                                let e = ca(t),
                                    i = e.right - e.left,
                                    n = e.bottom - e.top,
                                    r = (function (t, e, i) {
                                        let n = t.borderSkipped,
                                            r = rn(t.options.borderWidth);
                                        return {
                                            t: da(n.top, r.top, 0, i),
                                            r: da(n.right, r.right, 0, e),
                                            b: da(n.bottom, r.bottom, 0, i),
                                            l: da(n.left, r.left, 0, e)
                                        };
                                    })(t, i / 2, n / 2),
                                    a = (function (t, e, i) {
                                        let { enableBorderRadius: n } = t.getProps(['enableBorderRadius']),
                                            r = t.options.borderRadius,
                                            a = an(r),
                                            o = Math.min(e, i),
                                            s = t.borderSkipped,
                                            l = n || Ze(r);
                                        return {
                                            topLeft: da(!l || s.top || s.left, a.topLeft, 0, o),
                                            topRight: da(!l || s.top || s.right, a.topRight, 0, o),
                                            bottomLeft: da(!l || s.bottom || s.left, a.bottomLeft, 0, o),
                                            bottomRight: da(!l || s.bottom || s.right, a.bottomRight, 0, o)
                                        };
                                    })(t, i / 2, n / 2);
                                return {
                                    outer: { x: e.left, y: e.top, w: i, h: n, radius: a },
                                    inner: {
                                        x: e.left + r.l,
                                        y: e.top + r.t,
                                        w: i - r.l - r.r,
                                        h: n - r.t - r.b,
                                        radius: {
                                            topLeft: Math.max(0, a.topLeft - Math.max(r.t, r.l)),
                                            topRight: Math.max(0, a.topRight - Math.max(r.t, r.r)),
                                            bottomLeft: Math.max(0, a.bottomLeft - Math.max(r.b, r.l)),
                                            bottomRight: Math.max(0, a.bottomRight - Math.max(r.b, r.r))
                                        }
                                    }
                                };
                            })(this),
                            o = (function (t) {
                                return t.topLeft || t.topRight || t.bottomLeft || t.bottomRight;
                            })(a.radius)
                                ? tn
                                : fa;
                        (t.save(),
                            (a.w !== r.w || a.h !== r.h) &&
                                (t.beginPath(),
                                o(t, ga(a, e, r)),
                                t.clip(),
                                o(t, ga(r, -e, a)),
                                (t.fillStyle = i),
                                t.fill('evenodd')),
                            t.beginPath(),
                            o(t, ga(r, e)),
                            (t.fillStyle = n),
                            t.fill(),
                            t.restore());
                    }
                    inRange(t, e, i) {
                        return ua(this, t, e, i);
                    }
                    inXRange(t, e) {
                        return ua(this, t, null, e);
                    }
                    inYRange(t, e) {
                        return ua(this, null, t, e);
                    }
                    getCenterPoint(t) {
                        let { x: e, y: i, base: n, horizontal: r } = this.getProps(['x', 'y', 'base', 'horizontal'], t);
                        return { x: r ? (e + n) / 2 : e, y: r ? i : (i + n) / 2 };
                    }
                    getRange(t) {
                        return 'x' === t ? this.width / 2 : this.height / 2;
                    }
                }),
                (kd = Object.freeze({
                    __proto__: null,
                    ArcElement: xd,
                    BarElement: Md,
                    LineElement: _d,
                    PointElement: wd
                })),
                (Cd = (Sd = [
                    'rgb(54, 162, 235)',
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                ]).map((t) => t.replace('rgb(', 'rgba(').replace(')', ', 0.5)'))),
                (Ld = {
                    id: 'colors',
                    defaults: { enabled: 1, forceOverride: 0 },
                    beforeLayout(t, e, i) {
                        if (!i.enabled) return;
                        let {
                                data: { datasets: n },
                                options: r
                            } = t.config,
                            { elements: a } = r,
                            o =
                                ba(n) ||
                                (function (t) {
                                    return t && (t.borderColor || t.backgroundColor);
                                })(r) ||
                                (a && ba(a)) ||
                                'rgba(0,0,0,0.1)' !== ac.borderColor ||
                                'rgba(0,0,0,0.1)' !== ac.backgroundColor;
                        if (!i.forceOverride && o) return;
                        let s = (function (t) {
                            let e = 0;
                            return (i, n) => {
                                let r = t.getDatasetMeta(n).controller;
                                r instanceof Rc
                                    ? (e = (function (t, e) {
                                          return ((t.backgroundColor = t.data.map(() => pa(e++))), e);
                                      })(i, e))
                                    : r instanceof $c
                                      ? (e = (function (t, e) {
                                            return ((t.backgroundColor = t.data.map(() => ma(e++))), e);
                                        })(i, e))
                                      : r &&
                                        (e = (function (t, e) {
                                            return ((t.borderColor = pa(e)), (t.backgroundColor = ma(e)), ++e);
                                        })(i, e));
                            };
                        })(t);
                        n.forEach(s);
                    }
                }),
                (Ed = {
                    id: 'decimation',
                    defaults: { algorithm: 'min-max', enabled: 0 },
                    beforeElementsUpdate(t, e, i) {
                        if (!i.enabled) return void xa(t);
                        let n = t.width;
                        t.data.datasets.forEach((e, r) => {
                            let { _data: a, indexAxis: o } = e,
                                s = t.getDatasetMeta(r),
                                l = a || e.data;
                            if ('y' === ln([o, t.options.indexAxis]) || !s.controller.supportsDecimation) return;
                            let h = t.scales[s.xAxisID];
                            if (('linear' !== h.type && 'time' !== h.type) || t.options.parsing) return;
                            let c,
                                { start: d, count: u } = (function (t, e) {
                                    let i,
                                        n = e.length,
                                        r = 0,
                                        { iScale: a } = t,
                                        { min: o, max: s, minDefined: l, maxDefined: h } = a.getUserBounds();
                                    return (
                                        l && (r = Mi(Bh(e, a.axis, o).lo, 0, n - 1)),
                                        (i = h ? Mi(Bh(e, a.axis, s).hi + 1, r, n) - r : n - r),
                                        { start: r, count: i }
                                    );
                                })(s, l);
                            if (u <= (i.threshold || 4 * n)) va(e);
                            else {
                                switch (
                                    (Xe(a) &&
                                        ((e._data = l),
                                        delete e.data,
                                        Object.defineProperty(e, 'data', {
                                            configurable: 1,
                                            enumerable: 1,
                                            get() {
                                                return this._decimated;
                                            },
                                            set(t) {
                                                this._data = t;
                                            }
                                        })),
                                    i.algorithm)
                                ) {
                                    case 'lttb':
                                        c = (function (t, e, i, n, r) {
                                            let a = r.samples || n;
                                            if (a >= i) return t.slice(e, e + i);
                                            let o,
                                                s,
                                                l,
                                                h,
                                                c,
                                                d = [],
                                                u = (i - 2) / (a - 2),
                                                f = 0,
                                                g = e + i - 1,
                                                p = e;
                                            for (d[f++] = t[p], o = 0; o < a - 2; o++) {
                                                let n,
                                                    r = 0,
                                                    a = 0,
                                                    g = Math.floor((o + 1) * u) + 1 + e,
                                                    m = Math.min(Math.floor((o + 2) * u) + 1, i) + e,
                                                    b = m - g;
                                                for (n = g; n < m; n++) ((r += t[n].x), (a += t[n].y));
                                                ((r /= b), (a /= b));
                                                let v = Math.floor(o * u) + 1 + e,
                                                    x = Math.min(Math.floor((o + 1) * u) + 1, i) + e,
                                                    { x: y, y: _ } = t[p];
                                                for (l = h = -1, n = v; n < x; n++)
                                                    ((h =
                                                        0.5 *
                                                        Math.abs((y - r) * (t[n].y - _) - (y - t[n].x) * (a - _))),
                                                        h > l && ((l = h), (s = t[n]), (c = n)));
                                                ((d[f++] = s), (p = c));
                                            }
                                            return ((d[f++] = t[g]), d);
                                        })(l, d, u, n, i);
                                        break;
                                    case 'min-max':
                                        c = (function (t, e, i, n) {
                                            let r,
                                                a,
                                                o,
                                                s,
                                                l,
                                                h,
                                                c,
                                                d,
                                                u,
                                                f,
                                                g = 0,
                                                p = 0,
                                                m = [],
                                                b = t[e].x,
                                                v = t[e + i - 1].x - b;
                                            for (r = e; r < e + i; ++r) {
                                                ((a = t[r]), (o = ((a.x - b) / v) * n), (s = a.y));
                                                let e = 0 | o;
                                                if (e === l)
                                                    (s < u ? ((u = s), (h = r)) : s > f && ((f = s), (c = r)),
                                                        (g = (p * g + a.x) / ++p));
                                                else {
                                                    let i = r - 1;
                                                    if (!Xe(h) && !Xe(c)) {
                                                        let e = Math.min(h, c),
                                                            n = Math.max(h, c);
                                                        (e !== d && e !== i && m.push({ ...t[e], x: g }),
                                                            n !== d && n !== i && m.push({ ...t[n], x: g }));
                                                    }
                                                    (r > 0 && i !== d && m.push(t[i]),
                                                        m.push(a),
                                                        (l = e),
                                                        (p = 0),
                                                        (u = f = s),
                                                        (h = c = d = r));
                                                }
                                            }
                                            return m;
                                        })(l, d, u, n);
                                        break;
                                    default:
                                        throw Error(`Unsupported decimation algorithm '${i.algorithm}'`);
                                }
                                e._decimated = c;
                            }
                        });
                    },
                    destroy(t) {
                        xa(t);
                    }
                }),
                (Pd = class {
                    constructor(t) {
                        ((this.x = t.x), (this.y = t.y), (this.radius = t.radius));
                    }
                    pathSegment(t, e, i) {
                        let { x: n, y: r, radius: a } = this;
                        return (t.arc(n, r, a, (e = e || { start: 0, end: Ah }).end, e.start, 1), !i.bounds);
                    }
                    interpolate(t) {
                        let { x: e, y: i, radius: n } = this,
                            r = t.angle;
                        return { x: e + Math.cos(r) * n, y: i + Math.sin(r) * n, angle: r };
                    }
                }),
                (Dd = {
                    id: 'filler',
                    afterDatasetsUpdate(t, e, i) {
                        let n,
                            r,
                            a,
                            o,
                            s = (t.data.datasets || []).length,
                            l = [];
                        for (r = 0; r < s; ++r)
                            ((n = t.getDatasetMeta(r)),
                                (a = n.dataset),
                                (o = null),
                                a &&
                                    a.options &&
                                    a instanceof _d &&
                                    (o = {
                                        visible: t.isDatasetVisible(r),
                                        index: r,
                                        fill: Ca(a, r, s),
                                        chart: t,
                                        axis: n.controller.options.indexAxis,
                                        scale: n.vScale,
                                        line: a
                                    }),
                                (n.$filler = o),
                                l.push(o));
                        for (r = 0; r < s; ++r) ((o = l[r]), o && 0 != o.fill && (o.fill = Sa(l, r, i.propagate)));
                    },
                    beforeDraw(t, e, i) {
                        let n = 'beforeDraw' === i.drawTime,
                            r = t.getSortedVisibleDatasetMetas(),
                            a = t.chartArea;
                        for (let e = r.length - 1; e >= 0; --e) {
                            let i = r[e].$filler;
                            i && (i.line.updateControlPoints(a, i.axis), n && i.fill && Pa(t.ctx, i, a));
                        }
                    },
                    beforeDatasetsDraw(t, e, i) {
                        if ('beforeDatasetsDraw' !== i.drawTime) return;
                        let n = t.getSortedVisibleDatasetMetas();
                        for (let e = n.length - 1; e >= 0; --e) {
                            let i = n[e].$filler;
                            ka(i) && Pa(t.ctx, i, t.chartArea);
                        }
                    },
                    beforeDatasetDraw(t, e, i) {
                        let n = e.meta.$filler;
                        !ka(n) || 'beforeDatasetDraw' !== i.drawTime || Pa(t.ctx, n, t.chartArea);
                    },
                    defaults: { propagate: 1, drawTime: 'beforeDatasetDraw' }
                }),
                (Ad = (t, e) => {
                    let { boxHeight: i = e, boxWidth: n = e } = t;
                    return (
                        t.usePointStyle && ((i = Math.min(i, e)), (n = t.pointStyleWidth || Math.min(n, e))),
                        { boxWidth: n, boxHeight: i, itemHeight: Math.max(e, i) }
                    );
                }),
                (Td = (t, e) => null !== t && null !== e && t.datasetIndex === e.datasetIndex && t.index === e.index),
                (Od = class extends ed {
                    constructor(t) {
                        (super(),
                            (this._added = 0),
                            (this.legendHitBoxes = []),
                            (this._hoveredItem = null),
                            (this.doughnutMode = 0),
                            (this.chart = t.chart),
                            (this.options = t.options),
                            (this.ctx = t.ctx),
                            (this.legendItems = void 0),
                            (this.columnSizes = void 0),
                            (this.lineWidths = void 0),
                            (this.maxHeight = void 0),
                            (this.maxWidth = void 0),
                            (this.top = void 0),
                            (this.bottom = void 0),
                            (this.left = void 0),
                            (this.right = void 0),
                            (this.height = void 0),
                            (this.width = void 0),
                            (this._margins = void 0),
                            (this.position = void 0),
                            (this.weight = void 0),
                            (this.fullSize = void 0));
                    }
                    update(t, e, i) {
                        ((this.maxWidth = t),
                            (this.maxHeight = e),
                            (this._margins = i),
                            this.setDimensions(),
                            this.buildLabels(),
                            this.fit());
                    }
                    setDimensions() {
                        this.isHorizontal()
                            ? ((this.width = this.maxWidth),
                              (this.left = this._margins.left),
                              (this.right = this.width))
                            : ((this.height = this.maxHeight),
                              (this.top = this._margins.top),
                              (this.bottom = this.height));
                    }
                    buildLabels() {
                        let t = this.options.labels || {},
                            e = ti(t.generateLabels, [this.chart], this) || [];
                        (t.filter && (e = e.filter((e) => t.filter(e, this.chart.data))),
                            t.sort && (e = e.sort((e, i) => t.sort(e, i, this.chart.data))),
                            this.options.reverse && e.reverse(),
                            (this.legendItems = e));
                    }
                    fit() {
                        let { options: t, ctx: e } = this;
                        if (!t.display) return void (this.width = this.height = 0);
                        let i,
                            n,
                            r = t.labels,
                            a = sn(r.font),
                            o = a.size,
                            s = this._computeTitleHeight(),
                            { boxWidth: l, itemHeight: h } = Ad(r, o);
                        ((e.font = a.string),
                            this.isHorizontal()
                                ? ((i = this.maxWidth), (n = this._fitRows(s, o, l, h) + 10))
                                : ((n = this.maxHeight), (i = this._fitCols(s, a, l, h) + 10)),
                            (this.width = Math.min(i, t.maxWidth || this.maxWidth)),
                            (this.height = Math.min(n, t.maxHeight || this.maxHeight)));
                    }
                    _fitRows(t, e, i, n) {
                        let {
                                ctx: r,
                                maxWidth: a,
                                options: {
                                    labels: { padding: o }
                                }
                            } = this,
                            s = (this.legendHitBoxes = []),
                            l = (this.lineWidths = [0]),
                            h = n + o,
                            c = t;
                        ((r.textAlign = 'left'), (r.textBaseline = 'middle'));
                        let d = -1,
                            u = -h;
                        return (
                            this.legendItems.forEach((t, f) => {
                                let g = i + e / 2 + r.measureText(t.text).width;
                                ((0 === f || l[l.length - 1] + g + 2 * o > a) &&
                                    ((c += h), (l[l.length - (f > 0 ? 0 : 1)] = 0), (u += h), d++),
                                    (s[f] = { left: 0, top: u, row: d, width: g, height: n }),
                                    (l[l.length - 1] += g + o));
                            }),
                            c
                        );
                    }
                    _fitCols(t, e, i, n) {
                        let {
                                ctx: r,
                                maxHeight: a,
                                options: {
                                    labels: { padding: o }
                                }
                            } = this,
                            s = (this.legendHitBoxes = []),
                            l = (this.columnSizes = []),
                            h = a - t,
                            c = o,
                            d = 0,
                            u = 0,
                            f = 0,
                            g = 0;
                        return (
                            this.legendItems.forEach((t, a) => {
                                let { itemWidth: p, itemHeight: m } = (function (t, e, i, n, r) {
                                    let a = (function (t, e, i, n) {
                                            let r = t.text;
                                            return (
                                                r &&
                                                    'string' != typeof r &&
                                                    (r = r.reduce((t, e) => (t.length > e.length ? t : e))),
                                                e + i.size / 2 + n.measureText(r).width
                                            );
                                        })(n, t, e, i),
                                        o = (function (t, e, i) {
                                            let n = t;
                                            return ('string' != typeof e.text && (n = Ia(e, i)), n);
                                        })(r, n, e.lineHeight);
                                    return { itemWidth: a, itemHeight: o };
                                })(i, e, r, t, n);
                                (a > 0 &&
                                    u + m + 2 * o > h &&
                                    ((c += d + o), l.push({ width: d, height: u }), (f += d + o), g++, (d = u = 0)),
                                    (s[a] = { left: f, top: u, col: g, width: p, height: m }),
                                    (d = Math.max(d, p)),
                                    (u += m + o));
                            }),
                            (c += d),
                            l.push({ width: d, height: u }),
                            c
                        );
                    }
                    adjustHitBoxes() {
                        if (!this.options.display) return;
                        let t = this._computeTitleHeight(),
                            {
                                legendHitBoxes: e,
                                options: {
                                    align: i,
                                    labels: { padding: n },
                                    rtl: r
                                }
                            } = this,
                            a = On(r, this.left, this.width);
                        if (this.isHorizontal()) {
                            let r = 0,
                                o = Uh(i, this.left + n, this.right - this.lineWidths[r]);
                            for (let s of e)
                                (r !== s.row &&
                                    ((r = s.row), (o = Uh(i, this.left + n, this.right - this.lineWidths[r]))),
                                    (s.top += this.top + t + n),
                                    (s.left = a.leftForLtr(a.x(o), s.width)),
                                    (o += s.width + n));
                        } else {
                            let r = 0,
                                o = Uh(i, this.top + t + n, this.bottom - this.columnSizes[r].height);
                            for (let s of e)
                                (s.col !== r &&
                                    ((r = s.col),
                                    (o = Uh(i, this.top + t + n, this.bottom - this.columnSizes[r].height))),
                                    (s.top = o),
                                    (s.left += this.left + n),
                                    (s.left = a.leftForLtr(a.x(s.left), s.width)),
                                    (o += s.height + n));
                        }
                    }
                    isHorizontal() {
                        return 'top' === this.options.position || 'bottom' === this.options.position;
                    }
                    draw() {
                        if (this.options.display) {
                            let t = this.ctx;
                            (qi(t, this), this._draw(), Xi(t));
                        }
                    }
                    _draw() {
                        let t,
                            { options: e, columnSizes: i, lineWidths: n, ctx: r } = this,
                            { align: a, labels: o } = e,
                            s = ac.color,
                            l = On(e.rtl, this.left, this.width),
                            h = sn(o.font),
                            { padding: c } = o,
                            d = h.size,
                            u = d / 2;
                        (this.drawTitle(),
                            (r.textAlign = l.textAlign('left')),
                            (r.textBaseline = 'middle'),
                            (r.lineWidth = 0.5),
                            (r.font = h.string));
                        let { boxWidth: f, boxHeight: g, itemHeight: p } = Ad(o, d),
                            m = this.isHorizontal(),
                            b = this._computeTitleHeight();
                        ((t = m
                            ? { x: Uh(a, this.left + c, this.right - n[0]), y: this.top + c + b, line: 0 }
                            : { x: this.left + c, y: Uh(a, this.top + b + c, this.bottom - i[0].height), line: 0 }),
                            Rn(this.ctx, e.textDirection));
                        let v = p + c;
                        (this.legendItems.forEach((x, y) => {
                            ((r.strokeStyle = x.fontColor), (r.fillStyle = x.fontColor));
                            let _ = r.measureText(x.text).width,
                                w = l.textAlign(x.textAlign || (x.textAlign = o.textAlign)),
                                M = f + u + _,
                                k = t.x,
                                S = t.y;
                            (l.setWidth(this.width),
                                m
                                    ? y > 0 &&
                                      k + M + c > this.right &&
                                      ((S = t.y += v),
                                      t.line++,
                                      (k = t.x = Uh(a, this.left + c, this.right - n[t.line])))
                                    : y > 0 &&
                                      S + v > this.bottom &&
                                      ((k = t.x = k + i[t.line].width + c),
                                      t.line++,
                                      (S = t.y = Uh(a, this.top + b + c, this.bottom - i[t.line].height))),
                                (function (t, e, i) {
                                    if (isNaN(f) || f <= 0 || isNaN(g) || g < 0) return;
                                    r.save();
                                    let n = Qe(i.lineWidth, 1);
                                    if (
                                        ((r.fillStyle = Qe(i.fillStyle, s)),
                                        (r.lineCap = Qe(i.lineCap, 'butt')),
                                        (r.lineDashOffset = Qe(i.lineDashOffset, 0)),
                                        (r.lineJoin = Qe(i.lineJoin, 'miter')),
                                        (r.lineWidth = n),
                                        (r.strokeStyle = Qe(i.strokeStyle, s)),
                                        r.setLineDash(Qe(i.lineDash, [])),
                                        o.usePointStyle)
                                    ) {
                                        let a = {
                                                radius: (g * Math.SQRT2) / 2,
                                                pointStyle: i.pointStyle,
                                                rotation: i.rotation,
                                                borderWidth: n
                                            },
                                            s = l.xPlus(t, f / 2);
                                        Ui(r, a, s, e + u, o.pointStyleWidth && f);
                                    } else {
                                        let a = e + Math.max((d - g) / 2, 0),
                                            o = l.leftForLtr(t, f),
                                            s = an(i.borderRadius);
                                        (r.beginPath(),
                                            Object.values(s).some((t) => 0 !== t)
                                                ? tn(r, { x: o, y: a, w: f, h: g, radius: s })
                                                : r.rect(o, a, f, g),
                                            r.fill(),
                                            0 !== n && r.stroke());
                                    }
                                    r.restore();
                                })(l.x(k), S, x),
                                (k = Yh(w, k + f + u, m ? k + M : this.right, e.rtl)),
                                (function (t, e, i) {
                                    Qi(r, i.text, t, e + p / 2, h, {
                                        strikethrough: i.hidden,
                                        textAlign: l.textAlign(i.textAlign)
                                    });
                                })(l.x(k), S, x),
                                m ? (t.x += M + c) : (t.y += 'string' != typeof x.text ? Ia(x, h.lineHeight) + c : v));
                        }),
                            In(this.ctx, e.textDirection));
                    }
                    drawTitle() {
                        let t = this.options,
                            e = t.title,
                            i = sn(e.font),
                            n = on(e.padding);
                        if (!e.display) return;
                        let r,
                            a = On(t.rtl, this.left, this.width),
                            o = this.ctx,
                            s = e.position,
                            l = n.top + i.size / 2,
                            h = this.left,
                            c = this.width;
                        if (this.isHorizontal())
                            ((c = Math.max(...this.lineWidths)),
                                (r = this.top + l),
                                (h = Uh(t.align, h, this.right - c)));
                        else {
                            let e = this.columnSizes.reduce((t, e) => Math.max(t, e.height), 0);
                            r =
                                l +
                                Uh(t.align, this.top, this.bottom - e - t.labels.padding - this._computeTitleHeight());
                        }
                        let d = Uh(s, h, h + c);
                        ((o.textAlign = a.textAlign(Wh(s))),
                            (o.textBaseline = 'middle'),
                            (o.strokeStyle = e.color),
                            (o.fillStyle = e.color),
                            (o.font = i.string),
                            Qi(o, e.text, d, r, i));
                    }
                    _computeTitleHeight() {
                        let t = this.options.title,
                            e = sn(t.font),
                            i = on(t.padding);
                        return t.display ? e.lineHeight + i.height : 0;
                    }
                    _getLegendItemAt(t, e) {
                        let i, n, r;
                        if (ki(t, this.left, this.right) && ki(e, this.top, this.bottom))
                            for (r = this.legendHitBoxes, i = 0; i < r.length; ++i)
                                if (((n = r[i]), ki(t, n.left, n.left + n.width) && ki(e, n.top, n.top + n.height)))
                                    return this.legendItems[i];
                        return null;
                    }
                    handleEvent(t) {
                        let e = this.options;
                        if (
                            !(function (t, e) {
                                return !(
                                    (('mousemove' !== t && 'mouseout' !== t) || (!e.onHover && !e.onLeave)) &&
                                    (!e.onClick || ('click' !== t && 'mouseup' !== t))
                                );
                            })(t.type, e)
                        )
                            return;
                        let i = this._getLegendItemAt(t.x, t.y);
                        if ('mousemove' === t.type || 'mouseout' === t.type) {
                            let n = this._hoveredItem,
                                r = Td(n, i);
                            (n && !r && ti(e.onLeave, [t, n, this], this),
                                (this._hoveredItem = i),
                                i && !r && ti(e.onHover, [t, i, this], this));
                        } else i && ti(e.onClick, [t, i, this], this);
                    }
                }),
                (Rd = {
                    id: 'legend',
                    _element: Od,
                    start(t, e, i) {
                        let n = (t.legend = new Od({ ctx: t.ctx, options: i, chart: t }));
                        (Uc.configure(t, n, i), Uc.addBox(t, n));
                    },
                    stop(t) {
                        (Uc.removeBox(t, t.legend), delete t.legend);
                    },
                    beforeUpdate(t, e, i) {
                        let n = t.legend;
                        (Uc.configure(t, n, i), (n.options = i));
                    },
                    afterUpdate(t) {
                        let e = t.legend;
                        (e.buildLabels(), e.adjustHitBoxes());
                    },
                    afterEvent(t, e) {
                        e.replay || t.legend.handleEvent(e.event);
                    },
                    defaults: {
                        display: 1,
                        position: 'top',
                        align: 'center',
                        fullSize: 1,
                        reverse: 0,
                        weight: 1e3,
                        onClick(t, e, i) {
                            let n = e.datasetIndex,
                                r = i.chart;
                            r.isDatasetVisible(n) ? (r.hide(n), (e.hidden = 1)) : (r.show(n), (e.hidden = 0));
                        },
                        onHover: null,
                        onLeave: null,
                        labels: {
                            color: (t) => t.chart.options.color,
                            boxWidth: 40,
                            padding: 10,
                            generateLabels(t) {
                                let e = t.data.datasets,
                                    {
                                        labels: {
                                            usePointStyle: i,
                                            pointStyle: n,
                                            textAlign: r,
                                            color: a,
                                            useBorderRadius: o,
                                            borderRadius: s
                                        }
                                    } = t.legend.options;
                                return t._getSortedDatasetMetas().map((t) => {
                                    let l = t.controller.getStyle(i ? 0 : void 0),
                                        h = on(l.borderWidth);
                                    return {
                                        text: e[t.index].label,
                                        fillStyle: l.backgroundColor,
                                        fontColor: a,
                                        hidden: !t.visible,
                                        lineCap: l.borderCapStyle,
                                        lineDash: l.borderDash,
                                        lineDashOffset: l.borderDashOffset,
                                        lineJoin: l.borderJoinStyle,
                                        lineWidth: (h.width + h.height) / 4,
                                        strokeStyle: l.borderColor,
                                        pointStyle: n || l.pointStyle,
                                        rotation: l.rotation,
                                        textAlign: r || l.textAlign,
                                        borderRadius: o && (s || l.borderRadius),
                                        datasetIndex: t.index
                                    };
                                }, this);
                            }
                        },
                        title: { color: (t) => t.chart.options.color, display: 0, position: 'center', text: '' }
                    },
                    descriptors: {
                        _scriptable: (t) => !t.startsWith('on'),
                        labels: { _scriptable: (t) => !['generateLabels', 'filter', 'sort'].includes(t) }
                    }
                }),
                (Id = class extends ed {
                    constructor(t) {
                        (super(),
                            (this.chart = t.chart),
                            (this.options = t.options),
                            (this.ctx = t.ctx),
                            (this._padding = void 0),
                            (this.top = void 0),
                            (this.bottom = void 0),
                            (this.left = void 0),
                            (this.right = void 0),
                            (this.width = void 0),
                            (this.height = void 0),
                            (this.position = void 0),
                            (this.weight = void 0),
                            (this.fullSize = void 0));
                    }
                    update(t, e) {
                        let i = this.options;
                        if (((this.left = 0), (this.top = 0), !i.display))
                            return void (this.width = this.height = this.right = this.bottom = 0);
                        ((this.width = this.right = t), (this.height = this.bottom = e));
                        let n = Ge(i.text) ? i.text.length : 1;
                        this._padding = on(i.padding);
                        let r = n * sn(i.font).lineHeight + this._padding.height;
                        this.isHorizontal() ? (this.height = r) : (this.width = r);
                    }
                    isHorizontal() {
                        let t = this.options.position;
                        return 'top' === t || 'bottom' === t;
                    }
                    _drawArgs(t) {
                        let e,
                            i,
                            n,
                            { top: r, left: a, bottom: o, right: s, options: l } = this,
                            h = l.align,
                            c = 0;
                        return (
                            this.isHorizontal()
                                ? ((i = Uh(h, a, s)), (n = r + t), (e = s - a))
                                : ('left' === l.position
                                      ? ((i = a + t), (n = Uh(h, o, r)), (c = -0.5 * Dh))
                                      : ((i = s - t), (n = Uh(h, r, o)), (c = 0.5 * Dh)),
                                  (e = o - r)),
                            { titleX: i, titleY: n, maxWidth: e, rotation: c }
                        );
                    }
                    draw() {
                        let t = this.ctx,
                            e = this.options;
                        if (!e.display) return;
                        let i = sn(e.font),
                            n = i.lineHeight / 2 + this._padding.top,
                            { titleX: r, titleY: a, maxWidth: o, rotation: s } = this._drawArgs(n);
                        Qi(t, e.text, 0, 0, i, {
                            color: e.color,
                            maxWidth: o,
                            rotation: s,
                            textAlign: Wh(e.align),
                            textBaseline: 'middle',
                            translation: [r, a]
                        });
                    }
                }),
                ($d = {
                    id: 'title',
                    _element: Id,
                    start(t, e, i) {
                        !(function (t, e) {
                            let i = new Id({ ctx: t.ctx, options: e, chart: t });
                            (Uc.configure(t, i, e), Uc.addBox(t, i), (t.titleBlock = i));
                        })(t, i);
                    },
                    stop(t) {
                        (Uc.removeBox(t, t.titleBlock), delete t.titleBlock);
                    },
                    beforeUpdate(t, e, i) {
                        let n = t.titleBlock;
                        (Uc.configure(t, n, i), (n.options = i));
                    },
                    defaults: {
                        align: 'center',
                        display: 0,
                        font: { weight: 'bold' },
                        fullSize: 1,
                        padding: 10,
                        position: 'top',
                        text: '',
                        weight: 2e3
                    },
                    defaultRoutes: { color: 'color' },
                    descriptors: { _scriptable: 1, _indexable: 0 }
                }),
                (Fd = new WeakMap()),
                (zd = {
                    id: 'subtitle',
                    start(t, e, i) {
                        let n = new Id({ ctx: t.ctx, options: i, chart: t });
                        (Uc.configure(t, n, i), Uc.addBox(t, n), Fd.set(t, n));
                    },
                    stop(t) {
                        (Uc.removeBox(t, Fd.get(t)), Fd.delete(t));
                    },
                    beforeUpdate(t, e, i) {
                        let n = Fd.get(t);
                        (Uc.configure(t, n, i), (n.options = i));
                    },
                    defaults: {
                        align: 'center',
                        display: 0,
                        font: { weight: 'normal' },
                        fullSize: 1,
                        padding: 0,
                        position: 'top',
                        text: '',
                        weight: 1500
                    },
                    defaultRoutes: { color: 'color' },
                    descriptors: { _scriptable: 1, _indexable: 0 }
                }),
                (Vd = {
                    average(t) {
                        if (!t.length) return 0;
                        let e,
                            i,
                            n = new Set(),
                            r = 0,
                            a = 0;
                        for (e = 0, i = t.length; e < i; ++e) {
                            let i = t[e].element;
                            if (i && i.hasValue()) {
                                let t = i.tooltipPosition();
                                (n.add(t.x), (r += t.y), ++a);
                            }
                        }
                        return 0 === a || 0 === n.size ? 0 : { x: [...n].reduce((t, e) => t + e) / n.size, y: r / a };
                    },
                    nearest(t, e) {
                        if (!t.length) return 0;
                        let i,
                            n,
                            r,
                            a = e.x,
                            o = e.y,
                            s = 1 / 0;
                        for (i = 0, n = t.length; i < n; ++i) {
                            let n = t[i].element;
                            if (n && n.hasValue()) {
                                let t = xi(e, n.getCenterPoint());
                                t < s && ((s = t), (r = n));
                            }
                        }
                        if (r) {
                            let t = r.tooltipPosition();
                            ((a = t.x), (o = t.y));
                        }
                        return { x: a, y: o };
                    }
                }),
                (Bd = {
                    beforeTitle: qe,
                    title(t) {
                        if (t.length > 0) {
                            let e = t[0],
                                i = e.chart.data.labels,
                                n = i ? i.length : 0;
                            if (this && this.options && 'dataset' === this.options.mode) return e.dataset.label || '';
                            if (e.label) return e.label;
                            if (n > 0 && e.dataIndex < n) return i[e.dataIndex];
                        }
                        return '';
                    },
                    afterTitle: qe,
                    beforeBody: qe,
                    beforeLabel: qe,
                    label(t) {
                        if (this && this.options && 'dataset' === this.options.mode)
                            return t.label + ': ' + t.formattedValue || t.formattedValue;
                        let e = t.dataset.label || '';
                        e && (e += ': ');
                        let i = t.formattedValue;
                        return (Xe(i) || (e += i), e);
                    },
                    labelColor(t) {
                        let e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);
                        return {
                            borderColor: e.borderColor,
                            backgroundColor: e.backgroundColor,
                            borderWidth: e.borderWidth,
                            borderDash: e.borderDash,
                            borderDashOffset: e.borderDashOffset,
                            borderRadius: 0
                        };
                    },
                    labelTextColor() {
                        return this.options.bodyColor;
                    },
                    labelPointStyle(t) {
                        let e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);
                        return { pointStyle: e.pointStyle, rotation: e.rotation };
                    },
                    afterLabel: qe,
                    afterBody: qe,
                    beforeFooter: qe,
                    footer: qe,
                    afterFooter: qe
                }),
                (jd = class extends ed {
                    static positioners = Vd;
                    constructor(t) {
                        (super(),
                            (this.opacity = 0),
                            (this._active = []),
                            (this._eventPosition = void 0),
                            (this._size = void 0),
                            (this._cachedAnimations = void 0),
                            (this._tooltipItems = []),
                            (this.$animations = void 0),
                            (this.$context = void 0),
                            (this.chart = t.chart),
                            (this.options = t.options),
                            (this.dataPoints = void 0),
                            (this.title = void 0),
                            (this.beforeBody = void 0),
                            (this.body = void 0),
                            (this.afterBody = void 0),
                            (this.footer = void 0),
                            (this.xAlign = void 0),
                            (this.yAlign = void 0),
                            (this.x = void 0),
                            (this.y = void 0),
                            (this.height = void 0),
                            (this.width = void 0),
                            (this.caretX = void 0),
                            (this.caretY = void 0),
                            (this.labelColors = void 0),
                            (this.labelPointStyles = void 0),
                            (this.labelTextColors = void 0));
                    }
                    initialize(t) {
                        ((this.options = t), (this._cachedAnimations = void 0), (this.$context = void 0));
                    }
                    _resolveAnimations() {
                        let t = this._cachedAnimations;
                        if (t) return t;
                        let e = this.chart,
                            i = this.options.setContext(this.getContext()),
                            n = i.enabled && e.options.animation && i.animations,
                            r = new Lc(this.chart, n);
                        return (n._cacheable && (this._cachedAnimations = Object.freeze(r)), r);
                    }
                    getContext() {
                        return (
                            this.$context ||
                            (this.$context = (function (t, e, i) {
                                return hn(t, { tooltip: e, tooltipItems: i, type: 'tooltip' });
                            })(this.chart.getContext(), this, this._tooltipItems))
                        );
                    }
                    getTitle(t, e) {
                        let { callbacks: i } = e,
                            n = Ya(i, 'beforeTitle', this, t),
                            r = Ya(i, 'title', this, t),
                            a = Ya(i, 'afterTitle', this, t),
                            o = [];
                        return ((o = $a(o, Fa(n))), (o = $a(o, Fa(r))), (o = $a(o, Fa(a))), o);
                    }
                    getBeforeBody(t, e) {
                        return Wa(Ya(e.callbacks, 'beforeBody', this, t));
                    }
                    getBody(t, e) {
                        let { callbacks: i } = e,
                            n = [];
                        return (
                            ei(t, (t) => {
                                let e = { before: [], lines: [], after: [] },
                                    r = Ua(i, t);
                                ($a(e.before, Fa(Ya(r, 'beforeLabel', this, t))),
                                    $a(e.lines, Ya(r, 'label', this, t)),
                                    $a(e.after, Fa(Ya(r, 'afterLabel', this, t))),
                                    n.push(e));
                            }),
                            n
                        );
                    }
                    getAfterBody(t, e) {
                        return Wa(Ya(e.callbacks, 'afterBody', this, t));
                    }
                    getFooter(t, e) {
                        let { callbacks: i } = e,
                            n = Ya(i, 'beforeFooter', this, t),
                            r = Ya(i, 'footer', this, t),
                            a = Ya(i, 'afterFooter', this, t),
                            o = [];
                        return ((o = $a(o, Fa(n))), (o = $a(o, Fa(r))), (o = $a(o, Fa(a))), o);
                    }
                    _createItems(t) {
                        let e,
                            i,
                            n = this._active,
                            r = this.chart.data,
                            a = [],
                            o = [],
                            s = [],
                            l = [];
                        for (e = 0, i = n.length; e < i; ++e) l.push(za(this.chart, n[e]));
                        return (
                            t.filter && (l = l.filter((e, i, n) => t.filter(e, i, n, r))),
                            t.itemSort && (l = l.sort((e, i) => t.itemSort(e, i, r))),
                            ei(l, (e) => {
                                let i = Ua(t.callbacks, e);
                                (a.push(Ya(i, 'labelColor', this, e)),
                                    o.push(Ya(i, 'labelPointStyle', this, e)),
                                    s.push(Ya(i, 'labelTextColor', this, e)));
                            }),
                            (this.labelColors = a),
                            (this.labelPointStyles = o),
                            (this.labelTextColors = s),
                            (this.dataPoints = l),
                            l
                        );
                    }
                    update(t, e) {
                        let i,
                            n = this.options.setContext(this.getContext()),
                            r = this._active,
                            a = [];
                        if (r.length) {
                            let t = Vd[n.position].call(this, r, this._eventPosition);
                            ((a = this._createItems(n)),
                                (this.title = this.getTitle(a, n)),
                                (this.beforeBody = this.getBeforeBody(a, n)),
                                (this.body = this.getBody(a, n)),
                                (this.afterBody = this.getAfterBody(a, n)),
                                (this.footer = this.getFooter(a, n)));
                            let e = (this._size = Va(this, n)),
                                o = Object.assign({}, t, e),
                                s = ja(this.chart, n, o),
                                l = Na(n, o, s, this.chart);
                            ((this.xAlign = s.xAlign),
                                (this.yAlign = s.yAlign),
                                (i = {
                                    opacity: 1,
                                    x: l.x,
                                    y: l.y,
                                    width: e.width,
                                    height: e.height,
                                    caretX: t.x,
                                    caretY: t.y
                                }));
                        } else 0 !== this.opacity && (i = { opacity: 0 });
                        ((this._tooltipItems = a),
                            (this.$context = void 0),
                            i && this._resolveAnimations().update(this, i),
                            t && n.external && n.external.call(this, { chart: this.chart, tooltip: this, replay: e }));
                    }
                    drawCaret(t, e, i, n) {
                        let r = this.getCaretPosition(t, i, n);
                        (e.lineTo(r.x1, r.y1), e.lineTo(r.x2, r.y2), e.lineTo(r.x3, r.y3));
                    }
                    getCaretPosition(t, e, i) {
                        let n,
                            r,
                            a,
                            o,
                            s,
                            l,
                            { xAlign: h, yAlign: c } = this,
                            { caretSize: d, cornerRadius: u } = i,
                            { topLeft: f, topRight: g, bottomLeft: p, bottomRight: m } = an(u),
                            { x: b, y: v } = t,
                            { width: x, height: y } = e;
                        return (
                            'center' === c
                                ? ((s = v + y / 2),
                                  'left' === h
                                      ? ((n = b), (r = n - d), (o = s + d), (l = s - d))
                                      : ((n = b + x), (r = n + d), (o = s - d), (l = s + d)),
                                  (a = n))
                                : ((r =
                                      'left' === h
                                          ? b + Math.max(f, p) + d
                                          : 'right' === h
                                            ? b + x - Math.max(g, m) - d
                                            : this.caretX),
                                  'top' === c
                                      ? ((o = v), (s = o - d), (n = r - d), (a = r + d))
                                      : ((o = v + y), (s = o + d), (n = r + d), (a = r - d)),
                                  (l = o)),
                            { x1: n, x2: r, x3: a, y1: o, y2: s, y3: l }
                        );
                    }
                    drawTitle(t, e, i) {
                        let n,
                            r,
                            a,
                            o = this.title,
                            s = o.length;
                        if (s) {
                            let l = On(i.rtl, this.x, this.width);
                            for (
                                t.x = Ha(this, i.titleAlign, i),
                                    e.textAlign = l.textAlign(i.titleAlign),
                                    e.textBaseline = 'middle',
                                    n = sn(i.titleFont),
                                    r = i.titleSpacing,
                                    e.fillStyle = i.titleColor,
                                    e.font = n.string,
                                    a = 0;
                                a < s;
                                ++a
                            )
                                (e.fillText(o[a], l.x(t.x), t.y + n.lineHeight / 2),
                                    (t.y += n.lineHeight + r),
                                    a + 1 === s && (t.y += i.titleMarginBottom - r));
                        }
                    }
                    _drawColorBox(t, e, i, n, r) {
                        let a = this.labelColors[i],
                            o = this.labelPointStyles[i],
                            { boxHeight: s, boxWidth: l } = r,
                            h = sn(r.bodyFont),
                            c = Ha(this, 'left', r),
                            d = n.x(c),
                            u = e.y + (s < h.lineHeight ? (h.lineHeight - s) / 2 : 0);
                        if (r.usePointStyle) {
                            let e = {
                                    radius: Math.min(l, s) / 2,
                                    pointStyle: o.pointStyle,
                                    rotation: o.rotation,
                                    borderWidth: 1
                                },
                                i = n.leftForLtr(d, l) + l / 2,
                                h = u + s / 2;
                            ((t.strokeStyle = r.multiKeyBackground),
                                (t.fillStyle = r.multiKeyBackground),
                                Wi(t, e, i, h),
                                (t.strokeStyle = a.borderColor),
                                (t.fillStyle = a.backgroundColor),
                                Wi(t, e, i, h));
                        } else {
                            ((t.lineWidth = Ze(a.borderWidth)
                                ? Math.max(...Object.values(a.borderWidth))
                                : a.borderWidth || 1),
                                (t.strokeStyle = a.borderColor),
                                t.setLineDash(a.borderDash || []),
                                (t.lineDashOffset = a.borderDashOffset || 0));
                            let e = n.leftForLtr(d, l),
                                i = n.leftForLtr(n.xPlus(d, 1), l - 2),
                                o = an(a.borderRadius);
                            Object.values(o).some((t) => 0 !== t)
                                ? (t.beginPath(),
                                  (t.fillStyle = r.multiKeyBackground),
                                  tn(t, { x: e, y: u, w: l, h: s, radius: o }),
                                  t.fill(),
                                  t.stroke(),
                                  (t.fillStyle = a.backgroundColor),
                                  t.beginPath(),
                                  tn(t, { x: i, y: u + 1, w: l - 2, h: s - 2, radius: o }),
                                  t.fill())
                                : ((t.fillStyle = r.multiKeyBackground),
                                  t.fillRect(e, u, l, s),
                                  t.strokeRect(e, u, l, s),
                                  (t.fillStyle = a.backgroundColor),
                                  t.fillRect(i, u + 1, l - 2, s - 2));
                        }
                        t.fillStyle = this.labelTextColors[i];
                    }
                    drawBody(t, e, i) {
                        let n,
                            r,
                            a,
                            o,
                            s,
                            l,
                            h,
                            { body: c } = this,
                            {
                                bodySpacing: d,
                                bodyAlign: u,
                                displayColors: f,
                                boxHeight: g,
                                boxWidth: p,
                                boxPadding: m
                            } = i,
                            b = sn(i.bodyFont),
                            v = b.lineHeight,
                            x = 0,
                            y = On(i.rtl, this.x, this.width),
                            _ = function (i) {
                                (e.fillText(i, y.x(t.x + x), t.y + v / 2), (t.y += v + d));
                            },
                            w = y.textAlign(u);
                        for (
                            e.textAlign = u,
                                e.textBaseline = 'middle',
                                e.font = b.string,
                                t.x = Ha(this, w, i),
                                e.fillStyle = i.bodyColor,
                                ei(this.beforeBody, _),
                                x = f && 'right' !== w ? ('center' === u ? p / 2 + m : p + 2 + m) : 0,
                                o = 0,
                                l = c.length;
                            o < l;
                            ++o
                        ) {
                            for (
                                n = c[o],
                                    r = this.labelTextColors[o],
                                    e.fillStyle = r,
                                    ei(n.before, _),
                                    a = n.lines,
                                    f &&
                                        a.length &&
                                        (this._drawColorBox(e, t, o, y, i), (v = Math.max(b.lineHeight, g))),
                                    s = 0,
                                    h = a.length;
                                s < h;
                                ++s
                            )
                                (_(a[s]), (v = b.lineHeight));
                            ei(n.after, _);
                        }
                        ((x = 0), (v = b.lineHeight), ei(this.afterBody, _), (t.y -= d));
                    }
                    drawFooter(t, e, i) {
                        let n,
                            r,
                            a = this.footer,
                            o = a.length;
                        if (o) {
                            let s = On(i.rtl, this.x, this.width);
                            for (
                                t.x = Ha(this, i.footerAlign, i),
                                    t.y += i.footerMarginTop,
                                    e.textAlign = s.textAlign(i.footerAlign),
                                    e.textBaseline = 'middle',
                                    n = sn(i.footerFont),
                                    e.fillStyle = i.footerColor,
                                    e.font = n.string,
                                    r = 0;
                                r < o;
                                ++r
                            )
                                (e.fillText(a[r], s.x(t.x), t.y + n.lineHeight / 2),
                                    (t.y += n.lineHeight + i.footerSpacing));
                        }
                    }
                    drawBackground(t, e, i, n) {
                        let { xAlign: r, yAlign: a } = this,
                            { x: o, y: s } = t,
                            { width: l, height: h } = i,
                            { topLeft: c, topRight: d, bottomLeft: u, bottomRight: f } = an(n.cornerRadius);
                        ((e.fillStyle = n.backgroundColor),
                            (e.strokeStyle = n.borderColor),
                            (e.lineWidth = n.borderWidth),
                            e.beginPath(),
                            e.moveTo(o + c, s),
                            'top' === a && this.drawCaret(t, e, i, n),
                            e.lineTo(o + l - d, s),
                            e.quadraticCurveTo(o + l, s, o + l, s + d),
                            'center' === a && 'right' === r && this.drawCaret(t, e, i, n),
                            e.lineTo(o + l, s + h - f),
                            e.quadraticCurveTo(o + l, s + h, o + l - f, s + h),
                            'bottom' === a && this.drawCaret(t, e, i, n),
                            e.lineTo(o + u, s + h),
                            e.quadraticCurveTo(o, s + h, o, s + h - u),
                            'center' === a && 'left' === r && this.drawCaret(t, e, i, n),
                            e.lineTo(o, s + c),
                            e.quadraticCurveTo(o, s, o + c, s),
                            e.closePath(),
                            e.fill(),
                            n.borderWidth > 0 && e.stroke());
                    }
                    _updateAnimationTarget(t) {
                        let e = this.chart,
                            i = this.$animations,
                            n = i && i.x,
                            r = i && i.y;
                        if (n || r) {
                            let i = Vd[t.position].call(this, this._active, this._eventPosition);
                            if (!i) return;
                            let a = (this._size = Va(this, t)),
                                o = Object.assign({}, i, this._size),
                                s = ja(e, t, o),
                                l = Na(t, o, s, e);
                            (n._to !== l.x || r._to !== l.y) &&
                                ((this.xAlign = s.xAlign),
                                (this.yAlign = s.yAlign),
                                (this.width = a.width),
                                (this.height = a.height),
                                (this.caretX = i.x),
                                (this.caretY = i.y),
                                this._resolveAnimations().update(this, l));
                        }
                    }
                    _willRender() {
                        return !!this.opacity;
                    }
                    draw(t) {
                        let e = this.options.setContext(this.getContext()),
                            i = this.opacity;
                        if (!i) return;
                        this._updateAnimationTarget(e);
                        let n = { width: this.width, height: this.height },
                            r = { x: this.x, y: this.y };
                        i = Math.abs(i) < 0.001 ? 0 : i;
                        let a = on(e.padding);
                        e.enabled &&
                            (this.title.length ||
                                this.beforeBody.length ||
                                this.body.length ||
                                this.afterBody.length ||
                                this.footer.length) &&
                            (t.save(),
                            (t.globalAlpha = i),
                            this.drawBackground(r, t, n, e),
                            Rn(t, e.textDirection),
                            (r.y += a.top),
                            this.drawTitle(r, t, e),
                            this.drawBody(r, t, e),
                            this.drawFooter(r, t, e),
                            In(t, e.textDirection),
                            t.restore());
                    }
                    getActiveElements() {
                        return this._active || [];
                    }
                    setActiveElements(t, e) {
                        let i = this._active,
                            n = t.map(({ datasetIndex: t, index: e }) => {
                                let i = this.chart.getDatasetMeta(t);
                                if (!i) throw Error('Cannot find a dataset at index ' + t);
                                return { datasetIndex: t, element: i.data[e], index: e };
                            }),
                            r = !ii(i, n),
                            a = this._positionChanged(n, e);
                        (r || a) &&
                            ((this._active = n),
                            (this._eventPosition = e),
                            (this._ignoreReplayEvents = 1),
                            this.update(1));
                    }
                    handleEvent(t, e, i = 1) {
                        if (e && this._ignoreReplayEvents) return 0;
                        this._ignoreReplayEvents = 0;
                        let n = this.options,
                            r = this._active || [],
                            a = this._getActiveElements(t, r, e, i),
                            o = this._positionChanged(a, t),
                            s = e || !ii(a, r) || o;
                        return (
                            s &&
                                ((this._active = a),
                                (n.enabled || n.external) &&
                                    ((this._eventPosition = { x: t.x, y: t.y }), this.update(1, e))),
                            s
                        );
                    }
                    _getActiveElements(t, e, i, n) {
                        let r = this.options;
                        if ('mouseout' === t.type) return [];
                        if (!n)
                            return e.filter(
                                (t) =>
                                    this.chart.data.datasets[t.datasetIndex] &&
                                    void 0 !== this.chart.getDatasetMeta(t.datasetIndex).controller.getParsed(t.index)
                            );
                        let a = this.chart.getElementsAtEventForMode(t, r.mode, r, i);
                        return (r.reverse && a.reverse(), a);
                    }
                    _positionChanged(t, e) {
                        let { caretX: i, caretY: n, options: r } = this,
                            a = Vd[r.position].call(this, t, e);
                        return 0 != a && (i !== a.x || n !== a.y);
                    }
                }),
                (Nd = {
                    id: 'tooltip',
                    _element: jd,
                    positioners: Vd,
                    afterInit(t, e, i) {
                        i && (t.tooltip = new jd({ chart: t, options: i }));
                    },
                    beforeUpdate(t, e, i) {
                        t.tooltip && t.tooltip.initialize(i);
                    },
                    reset(t, e, i) {
                        t.tooltip && t.tooltip.initialize(i);
                    },
                    afterDraw(t) {
                        let e = t.tooltip;
                        if (e && e._willRender()) {
                            let i = { tooltip: e };
                            if (0 == t.notifyPlugins('beforeTooltipDraw', { ...i, cancelable: 1 })) return;
                            (e.draw(t.ctx), t.notifyPlugins('afterTooltipDraw', i));
                        }
                    },
                    afterEvent(t, e) {
                        t.tooltip && t.tooltip.handleEvent(e.event, e.replay, e.inChartArea) && (e.changed = 1);
                    },
                    defaults: {
                        enabled: 1,
                        external: null,
                        position: 'average',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        titleFont: { weight: 'bold' },
                        titleSpacing: 2,
                        titleMarginBottom: 6,
                        titleAlign: 'left',
                        bodyColor: '#fff',
                        bodySpacing: 2,
                        bodyFont: {},
                        bodyAlign: 'left',
                        footerColor: '#fff',
                        footerSpacing: 2,
                        footerMarginTop: 6,
                        footerFont: { weight: 'bold' },
                        footerAlign: 'left',
                        padding: 6,
                        caretPadding: 2,
                        caretSize: 5,
                        cornerRadius: 6,
                        boxHeight: (t, e) => e.bodyFont.size,
                        boxWidth: (t, e) => e.bodyFont.size,
                        multiKeyBackground: '#fff',
                        displayColors: 1,
                        boxPadding: 0,
                        borderColor: 'rgba(0,0,0,0)',
                        borderWidth: 0,
                        animation: { duration: 400, easing: 'easeOutQuart' },
                        animations: {
                            numbers: { type: 'number', properties: ['x', 'y', 'width', 'height', 'caretX', 'caretY'] },
                            opacity: { easing: 'linear', duration: 200 }
                        },
                        callbacks: Bd
                    },
                    defaultRoutes: { bodyFont: 'font', footerFont: 'font', titleFont: 'font' },
                    descriptors: {
                        _scriptable: (t) => 'filter' !== t && 'itemSort' !== t && 'external' !== t,
                        _indexable: 0,
                        callbacks: { _scriptable: 0, _indexable: 0 },
                        animation: { _fallback: 0 },
                        animations: { _fallback: 'animation' }
                    },
                    additionalOptionScopes: ['interaction']
                }),
                (Hd = Object.freeze({
                    __proto__: null,
                    Colors: Ld,
                    Decimation: Ed,
                    Filler: Dd,
                    Legend: Rd,
                    SubTitle: zd,
                    Title: $d,
                    Tooltip: Nd
                })),
                (Wd = (t, e, i, n) => (
                    'string' == typeof e
                        ? ((i = t.push(e) - 1), n.unshift({ index: i, label: e }))
                        : isNaN(e) && (i = null),
                    i
                )),
                (Ud = (t, e) => (null === t ? null : Mi(Math.round(t), 0, e))),
                (Yd = class extends ad {
                    static id = 'category';
                    static defaults = { ticks: { callback: qa } };
                    constructor(t) {
                        (super(t), (this._startValue = void 0), (this._valueRange = 0), (this._addedLabels = []));
                    }
                    init(t) {
                        let e = this._addedLabels;
                        if (e.length) {
                            let t = this.getLabels();
                            for (let { index: i, label: n } of e) t[i] === n && t.splice(i, 1);
                            this._addedLabels = [];
                        }
                        super.init(t);
                    }
                    parse(t, e) {
                        if (Xe(t)) return null;
                        let i = this.getLabels();
                        return (
                            (e =
                                isFinite(e) && i[e] === t
                                    ? e
                                    : (function (t, e, i, n) {
                                          let r = t.indexOf(e);
                                          return -1 === r ? Wd(t, e, i, n) : r !== t.lastIndexOf(e) ? i : r;
                                      })(i, t, Qe(e, t), this._addedLabels)),
                            Ud(e, i.length - 1)
                        );
                    }
                    determineDataLimits() {
                        let { minDefined: t, maxDefined: e } = this.getUserBounds(),
                            { min: i, max: n } = this.getMinMax(1);
                        ('ticks' === this.options.bounds && (t || (i = 0), e || (n = this.getLabels().length - 1)),
                            (this.min = i),
                            (this.max = n));
                    }
                    buildTicks() {
                        let t = this.min,
                            e = this.max,
                            i = this.options.offset,
                            n = [],
                            r = this.getLabels();
                        ((r = 0 === t && e === r.length - 1 ? r : r.slice(t, e + 1)),
                            (this._valueRange = Math.max(r.length - (i ? 0 : 1), 1)),
                            (this._startValue = this.min - (i ? 0.5 : 0)));
                        for (let i = t; i <= e; i++) n.push({ value: i });
                        return n;
                    }
                    getLabelForValue(t) {
                        return qa.call(this, t);
                    }
                    configure() {
                        (super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels));
                    }
                    getPixelForValue(t) {
                        return (
                            'number' != typeof t && (t = this.parse(t)),
                            null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange)
                        );
                    }
                    getPixelForTick(t) {
                        let e = this.ticks;
                        return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
                    }
                    getValueForPixel(t) {
                        return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
                    }
                    getBasePixel() {
                        return this.bottom;
                    }
                }),
                (qd = class extends ad {
                    constructor(t) {
                        (super(t),
                            (this.start = void 0),
                            (this.end = void 0),
                            (this._startValue = void 0),
                            (this._endValue = void 0),
                            (this._valueRange = 0));
                    }
                    parse(t, e) {
                        return Xe(t) || (('number' == typeof t || t instanceof Number) && !isFinite(+t)) ? null : +t;
                    }
                    handleTickRangeOptions() {
                        let { beginAtZero: t } = this.options,
                            { minDefined: e, maxDefined: i } = this.getUserBounds(),
                            { min: n, max: r } = this,
                            a = (t) => (n = e ? n : t),
                            o = (t) => (r = i ? r : t);
                        if (t) {
                            let t = Vh(n),
                                e = Vh(r);
                            t < 0 && e < 0 ? o(0) : t > 0 && e > 0 && a(0);
                        }
                        if (n === r) {
                            let e = 0 === r ? 1 : Math.abs(0.05 * r);
                            (o(r + e), t || a(n - e));
                        }
                        ((this.min = n), (this.max = r));
                    }
                    getTickLimit() {
                        let t,
                            e = this.options.ticks,
                            { maxTicksLimit: i, stepSize: n } = e;
                        return (
                            n
                                ? ((t = Math.ceil(this.max / n) - Math.floor(this.min / n) + 1),
                                  t > 1e3 &&
                                      (console.warn(
                                          `scales.${this.id}.ticks.stepSize: ${n} would result generating up to ${t} ticks. Limiting to 1000.`
                                      ),
                                      (t = 1e3)))
                                : ((t = this.computeTickLimit()), (i = i || 11)),
                            i && (t = Math.min(i, t)),
                            t
                        );
                    }
                    computeTickLimit() {
                        return 1 / 0;
                    }
                    buildTicks() {
                        let t = this.options,
                            e = t.ticks,
                            i = this.getTickLimit();
                        i = Math.max(2, i);
                        let n = (function (t, e) {
                            let i,
                                n,
                                r,
                                a,
                                o = [],
                                {
                                    bounds: s,
                                    step: l,
                                    min: h,
                                    max: c,
                                    precision: d,
                                    count: u,
                                    maxTicks: f,
                                    maxDigits: g,
                                    includeBounds: p
                                } = t,
                                m = l || 1,
                                b = f - 1,
                                { min: v, max: x } = e,
                                y = !Xe(h),
                                _ = !Xe(c),
                                w = !Xe(u),
                                M = (x - v) / (g + 1),
                                k = ui((x - v) / b / m) * m;
                            if (k < 1e-14 && !y && !_) return [{ value: v }, { value: x }];
                            ((a = Math.ceil(x / k) - Math.floor(v / k)),
                                a > b && (k = ui((a * k) / b / m) * m),
                                Xe(d) || ((i = Math.pow(10, d)), (k = Math.ceil(k * i) / i)),
                                'ticks' === s
                                    ? ((n = Math.floor(v / k) * k), (r = Math.ceil(x / k) * k))
                                    : ((n = v), (r = x)),
                                y &&
                                _ &&
                                l &&
                                (function (t, e) {
                                    let i = Math.round(t);
                                    return i - e <= t && i + e >= t;
                                })((c - h) / l, k / 1e3)
                                    ? ((a = Math.round(Math.min((c - h) / k, f))), (k = (c - h) / a), (n = h), (r = c))
                                    : w
                                      ? ((n = y ? h : n), (r = _ ? c : r), (a = u - 1), (k = (r - n) / a))
                                      : ((a = (r - n) / k),
                                        (a = di(a, Math.round(a), k / 1e3) ? Math.round(a) : Math.ceil(a))));
                            let S = Math.max(bi(k), bi(n));
                            ((i = Math.pow(10, Xe(d) ? S : d)),
                                (n = Math.round(n * i) / i),
                                (r = Math.round(r * i) / i));
                            let C = 0;
                            for (
                                y &&
                                (p && n !== h
                                    ? (o.push({ value: h }),
                                      n < h && C++,
                                      di(Math.round((n + C * k) * i) / i, h, Xa(h, M, t)) && C++)
                                    : n < h && C++);
                                C < a;
                                ++C
                            ) {
                                let t = Math.round((n + C * k) * i) / i;
                                if (_ && t > c) break;
                                o.push({ value: t });
                            }
                            return (
                                _ && p && r !== c
                                    ? o.length && di(o[o.length - 1].value, c, Xa(c, M, t))
                                        ? (o[o.length - 1].value = c)
                                        : o.push({ value: c })
                                    : (!_ || r === c) && o.push({ value: r }),
                                o
                            );
                        })(
                            {
                                maxTicks: i,
                                bounds: t.bounds,
                                min: t.min,
                                max: t.max,
                                precision: e.precision,
                                step: e.stepSize,
                                count: e.count,
                                maxDigits: this._maxDigits(),
                                horizontal: this.isHorizontal(),
                                minRotation: e.minRotation || 0,
                                includeBounds: 0 != e.includeBounds
                            },
                            this._range || this
                        );
                        return (
                            'ticks' === t.bounds && gi(n, this, 'value'),
                            t.reverse
                                ? (n.reverse(), (this.start = this.max), (this.end = this.min))
                                : ((this.start = this.min), (this.end = this.max)),
                            n
                        );
                    }
                    configure() {
                        let t = this.ticks,
                            e = this.min,
                            i = this.max;
                        if ((super.configure(), this.options.offset && t.length)) {
                            let n = (i - e) / Math.max(t.length - 1, 1) / 2;
                            ((e -= n), (i += n));
                        }
                        ((this._startValue = e), (this._endValue = i), (this._valueRange = i - e));
                    }
                    getLabelForValue(t) {
                        return $i(t, this.chart.options.locale, this.options.ticks.format);
                    }
                }),
                (Xd = class extends qd {
                    static id = 'linear';
                    static defaults = { ticks: { callback: ec.formatters.numeric } };
                    determineDataLimits() {
                        let { min: t, max: e } = this.getMinMax(1);
                        ((this.min = Ke(t) ? t : 0), (this.max = Ke(e) ? e : 1), this.handleTickRangeOptions());
                    }
                    computeTickLimit() {
                        let t = this.isHorizontal(),
                            e = t ? this.width : this.height,
                            i = pi(this.options.ticks.minRotation),
                            n = (t ? Math.sin(i) : Math.cos(i)) || 0.001,
                            r = this._resolveTickFontOptions(0);
                        return Math.ceil(e / Math.min(40, r.lineHeight / n));
                    }
                    getPixelForValue(t) {
                        return null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
                    }
                    getValueForPixel(t) {
                        return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
                    }
                }),
                (Gd = (t) => Math.floor(zh(t))),
                (Zd = (t, e) => Math.pow(10, Gd(t) + e)),
                (Kd = class extends ad {
                    static id = 'logarithmic';
                    static defaults = { ticks: { callback: ec.formatters.logarithmic, major: { enabled: 1 } } };
                    constructor(t) {
                        (super(t),
                            (this.start = void 0),
                            (this.end = void 0),
                            (this._startValue = void 0),
                            (this._valueRange = 0));
                    }
                    parse(t, e) {
                        let i = qd.prototype.parse.call(this, t, e);
                        if (0 !== i) return Ke(i) && i > 0 ? i : null;
                        this._zero = 1;
                    }
                    determineDataLimits() {
                        let { min: t, max: e } = this.getMinMax(1);
                        ((this.min = Ke(t) ? Math.max(0, t) : null),
                            (this.max = Ke(e) ? Math.max(0, e) : null),
                            this.options.beginAtZero && (this._zero = 1),
                            this._zero &&
                                this.min !== this._suggestedMin &&
                                !Ke(this._userMin) &&
                                (this.min = t === Zd(this.min, 0) ? Zd(this.min, -1) : Zd(this.min, 0)),
                            this.handleTickRangeOptions());
                    }
                    handleTickRangeOptions() {
                        let { minDefined: t, maxDefined: e } = this.getUserBounds(),
                            i = this.min,
                            n = this.max,
                            r = (e) => (i = t ? i : e),
                            a = (t) => (n = e ? n : t);
                        (i === n && (i <= 0 ? (r(1), a(10)) : (r(Zd(i, -1)), a(Zd(n, 1)))),
                            i <= 0 && r(Zd(n, -1)),
                            n <= 0 && a(Zd(i, 1)),
                            (this.min = i),
                            (this.max = n));
                    }
                    buildTicks() {
                        let t = this.options,
                            e = (function (t, { min: e, max: i }) {
                                e = Je(t.min, e);
                                let n = [],
                                    r = Gd(e),
                                    a = (function (t, e) {
                                        let i = Gd(e - t);
                                        for (; Za(t, e, i) > 10; ) i++;
                                        for (; Za(t, e, i) < 10; ) i--;
                                        return Math.min(i, Gd(t));
                                    })(e, i),
                                    o = a < 0 ? Math.pow(10, Math.abs(a)) : 1,
                                    s = Math.pow(10, a),
                                    l = r > a ? Math.pow(10, r) : 0,
                                    h = Math.round((e - l) * o) / o,
                                    c = Math.floor((e - l) / s / 10) * s * 10,
                                    d = Math.floor((h - c) / Math.pow(10, a)),
                                    u = Je(t.min, Math.round((l + c + d * Math.pow(10, a)) * o) / o);
                                for (; u < i; )
                                    (n.push({ value: u, major: Ga(u), significand: d }),
                                        d >= 10 ? (d = d < 15 ? 15 : 20) : d++,
                                        d >= 20 && (a++, (d = 2), (o = a >= 0 ? 1 : o)),
                                        (u = Math.round((l + c + d * Math.pow(10, a)) * o) / o));
                                let f = Je(t.max, u);
                                return (n.push({ value: f, major: Ga(f), significand: d }), n);
                            })({ min: this._userMin, max: this._userMax }, this);
                        return (
                            'ticks' === t.bounds && gi(e, this, 'value'),
                            t.reverse
                                ? (e.reverse(), (this.start = this.max), (this.end = this.min))
                                : ((this.start = this.min), (this.end = this.max)),
                            e
                        );
                    }
                    getLabelForValue(t) {
                        return void 0 === t ? '0' : $i(t, this.chart.options.locale, this.options.ticks.format);
                    }
                    configure() {
                        let t = this.min;
                        (super.configure(), (this._startValue = zh(t)), (this._valueRange = zh(this.max) - zh(t)));
                    }
                    getPixelForValue(t) {
                        return (
                            (void 0 === t || 0 === t) && (t = this.min),
                            null === t || isNaN(t)
                                ? NaN
                                : this.getPixelForDecimal(
                                      t === this.min ? 0 : (zh(t) - this._startValue) / this._valueRange
                                  )
                        );
                    }
                    getValueForPixel(t) {
                        let e = this.getDecimalForPixel(t);
                        return Math.pow(10, this._startValue + e * this._valueRange);
                    }
                }),
                (Jd = class extends qd {
                    static id = 'radialLinear';
                    static defaults = {
                        display: 1,
                        animate: 1,
                        position: 'chartArea',
                        angleLines: { display: 1, lineWidth: 1, borderDash: [], borderDashOffset: 0 },
                        grid: { circular: 0 },
                        startAngle: 0,
                        ticks: { showLabelBackdrop: 1, callback: ec.formatters.numeric },
                        pointLabels: {
                            backdropColor: void 0,
                            backdropPadding: 2,
                            display: 1,
                            font: { size: 10 },
                            callback(t) {
                                return t;
                            },
                            padding: 5,
                            centerPointLabels: 0
                        }
                    };
                    static defaultRoutes = {
                        'angleLines.color': 'borderColor',
                        'pointLabels.color': 'color',
                        'ticks.color': 'color'
                    };
                    static descriptors = { angleLines: { _fallback: 'grid' } };
                    constructor(t) {
                        (super(t),
                            (this.xCenter = void 0),
                            (this.yCenter = void 0),
                            (this.drawingArea = void 0),
                            (this._pointLabels = []),
                            (this._pointLabelItems = []));
                    }
                    setDimensions() {
                        let t = (this._padding = on(Ka(this.options) / 2)),
                            e = (this.width = this.maxWidth - t.width),
                            i = (this.height = this.maxHeight - t.height);
                        ((this.xCenter = Math.floor(this.left + e / 2 + t.left)),
                            (this.yCenter = Math.floor(this.top + i / 2 + t.top)),
                            (this.drawingArea = Math.floor(Math.min(e, i) / 2)));
                    }
                    determineDataLimits() {
                        let { min: t, max: e } = this.getMinMax(0);
                        ((this.min = Ke(t) && !isNaN(t) ? t : 0),
                            (this.max = Ke(e) && !isNaN(e) ? e : 0),
                            this.handleTickRangeOptions());
                    }
                    computeTickLimit() {
                        return Math.ceil(this.drawingArea / Ka(this.options));
                    }
                    generateTickLabels(t) {
                        (qd.prototype.generateTickLabels.call(this, t),
                            (this._pointLabels = this.getLabels()
                                .map((t, e) => {
                                    let i = ti(this.options.pointLabels.callback, [t, e], this);
                                    return i || 0 === i ? i : '';
                                })
                                .filter((t, e) => this.chart.getDataVisibility(e))));
                    }
                    fit() {
                        let t = this.options;
                        t.display && t.pointLabels.display
                            ? (function (t) {
                                  let e = {
                                          l: t.left + t._padding.left,
                                          r: t.right - t._padding.right,
                                          t: t.top + t._padding.top,
                                          b: t.bottom - t._padding.bottom
                                      },
                                      i = Object.assign({}, e),
                                      n = [],
                                      r = [],
                                      a = t._pointLabels.length,
                                      o = t.options.pointLabels,
                                      s = o.centerPointLabels ? Dh / a : 0;
                                  for (let l = 0; l < a; l++) {
                                      let a = o.setContext(t.getPointLabelContext(l));
                                      r[l] = a.padding;
                                      let h = t.getPointPosition(l, t.drawingArea + r[l], s),
                                          c = sn(a.font),
                                          d = Ja(t.ctx, c, t._pointLabels[l]);
                                      n[l] = d;
                                      let u = _i(t.getIndexAngle(l) + s),
                                          f = Math.round(mi(u));
                                      to(i, e, u, Qa(f, h.x, d.w, 0, 180), Qa(f, h.y, d.h, 90, 270));
                                  }
                                  (t.setCenterPoint(e.l - i.l, i.r - e.r, e.t - i.t, i.b - e.b),
                                      (t._pointLabelItems = (function (t, e, i) {
                                          let n,
                                              r = [],
                                              a = t._pointLabels.length,
                                              o = t.options,
                                              { centerPointLabels: s, display: l } = o.pointLabels,
                                              h = { extra: Ka(o) / 2, additionalAngle: s ? Dh / a : 0 };
                                          for (let o = 0; o < a; o++) {
                                              ((h.padding = i[o]), (h.size = e[o]));
                                              let a = eo(t, o, h);
                                              (r.push(a),
                                                  'auto' === l && ((a.visible = io(a, n)), a.visible && (n = a)));
                                          }
                                          return r;
                                      })(t, n, r)));
                              })(this)
                            : this.setCenterPoint(0, 0, 0, 0);
                    }
                    setCenterPoint(t, e, i, n) {
                        ((this.xCenter += Math.floor((t - e) / 2)),
                            (this.yCenter += Math.floor((i - n) / 2)),
                            (this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, e, i, n))));
                    }
                    getIndexAngle(t) {
                        return _i(t * (Ah / (this._pointLabels.length || 1)) + pi(this.options.startAngle || 0));
                    }
                    getDistanceFromCenterForValue(t) {
                        if (Xe(t)) return NaN;
                        let e = this.drawingArea / (this.max - this.min);
                        return this.options.reverse ? (this.max - t) * e : (t - this.min) * e;
                    }
                    getValueForDistanceFromCenter(t) {
                        if (Xe(t)) return NaN;
                        let e = t / (this.drawingArea / (this.max - this.min));
                        return this.options.reverse ? this.max - e : this.min + e;
                    }
                    getPointLabelContext(t) {
                        let e = this._pointLabels || [];
                        if (t >= 0 && t < e.length) {
                            let i = e[t];
                            return (function (t, e, i) {
                                return hn(t, { label: i, index: e, type: 'pointLabel' });
                            })(this.getContext(), t, i);
                        }
                    }
                    getPointPosition(t, e, i = 0) {
                        let n = this.getIndexAngle(t) - Ih + i;
                        return { x: Math.cos(n) * e + this.xCenter, y: Math.sin(n) * e + this.yCenter, angle: n };
                    }
                    getPointPositionForValue(t, e) {
                        return this.getPointPosition(t, this.getDistanceFromCenterForValue(e));
                    }
                    getBasePosition(t) {
                        return this.getPointPositionForValue(t || 0, this.getBaseValue());
                    }
                    getPointLabelPosition(t) {
                        let { left: e, top: i, right: n, bottom: r } = this._pointLabelItems[t];
                        return { left: e, top: i, right: n, bottom: r };
                    }
                    drawBackground() {
                        let {
                            backgroundColor: t,
                            grid: { circular: e }
                        } = this.options;
                        if (t) {
                            let i = this.ctx;
                            (i.save(),
                                i.beginPath(),
                                ro(
                                    this,
                                    this.getDistanceFromCenterForValue(this._endValue),
                                    e,
                                    this._pointLabels.length
                                ),
                                i.closePath(),
                                (i.fillStyle = t),
                                i.fill(),
                                i.restore());
                        }
                    }
                    drawGrid() {
                        let t,
                            e,
                            i,
                            n = this.ctx,
                            r = this.options,
                            { angleLines: a, grid: o, border: s } = r,
                            l = this._pointLabels.length;
                        if (
                            (r.pointLabels.display &&
                                (function (t, e) {
                                    let {
                                        ctx: i,
                                        options: { pointLabels: n }
                                    } = t;
                                    for (let r = e - 1; r >= 0; r--) {
                                        let e = t._pointLabelItems[r];
                                        if (!e.visible) continue;
                                        let a = n.setContext(t.getPointLabelContext(r));
                                        no(i, a, e);
                                        let o = sn(a.font),
                                            { x: s, y: l, textAlign: h } = e;
                                        Qi(i, t._pointLabels[r], s, l + o.lineHeight / 2, o, {
                                            color: a.color,
                                            textAlign: h,
                                            textBaseline: 'middle'
                                        });
                                    }
                                })(this, l),
                            o.display &&
                                this.ticks.forEach((t, i) => {
                                    if (0 !== i || (0 === i && this.min < 0)) {
                                        e = this.getDistanceFromCenterForValue(t.value);
                                        let n = this.getContext(i),
                                            r = o.setContext(n),
                                            a = s.setContext(n);
                                        !(function (t, e, i, n, r) {
                                            let a = t.ctx,
                                                o = e.circular,
                                                { color: s, lineWidth: l } = e;
                                            (!o && !n) ||
                                                !s ||
                                                !l ||
                                                i < 0 ||
                                                (a.save(),
                                                (a.strokeStyle = s),
                                                (a.lineWidth = l),
                                                a.setLineDash(r.dash || []),
                                                (a.lineDashOffset = r.dashOffset),
                                                a.beginPath(),
                                                ro(t, i, o, n),
                                                a.closePath(),
                                                a.stroke(),
                                                a.restore());
                                        })(this, r, e, l, a);
                                    }
                                }),
                            a.display)
                        ) {
                            for (n.save(), t = l - 1; t >= 0; t--) {
                                let o = a.setContext(this.getPointLabelContext(t)),
                                    { color: s, lineWidth: l } = o;
                                !l ||
                                    !s ||
                                    ((n.lineWidth = l),
                                    (n.strokeStyle = s),
                                    n.setLineDash(o.borderDash),
                                    (n.lineDashOffset = o.borderDashOffset),
                                    (e = this.getDistanceFromCenterForValue(r.reverse ? this.min : this.max)),
                                    (i = this.getPointPosition(t, e)),
                                    n.beginPath(),
                                    n.moveTo(this.xCenter, this.yCenter),
                                    n.lineTo(i.x, i.y),
                                    n.stroke());
                            }
                            n.restore();
                        }
                    }
                    drawBorder() {}
                    drawLabels() {
                        let t = this.ctx,
                            e = this.options,
                            i = e.ticks;
                        if (!i.display) return;
                        let n,
                            r,
                            a = this.getIndexAngle(0);
                        (t.save(),
                            t.translate(this.xCenter, this.yCenter),
                            t.rotate(a),
                            (t.textAlign = 'center'),
                            (t.textBaseline = 'middle'),
                            this.ticks.forEach((a, o) => {
                                if (0 === o && this.min >= 0 && !e.reverse) return;
                                let s = i.setContext(this.getContext(o)),
                                    l = sn(s.font);
                                if (
                                    ((n = this.getDistanceFromCenterForValue(this.ticks[o].value)), s.showLabelBackdrop)
                                ) {
                                    ((t.font = l.string),
                                        (r = t.measureText(a.label).width),
                                        (t.fillStyle = s.backdropColor));
                                    let e = on(s.backdropPadding);
                                    t.fillRect(
                                        -r / 2 - e.left,
                                        -n - l.size / 2 - e.top,
                                        r + e.width,
                                        l.size + e.height
                                    );
                                }
                                Qi(t, a.label, 0, -n, l, {
                                    color: s.color,
                                    strokeColor: s.textStrokeColor,
                                    strokeWidth: s.textStrokeWidth
                                });
                            }),
                            t.restore());
                    }
                    drawTitle() {}
                }),
                (tu = Object.keys(
                    (Qd = {
                        millisecond: { common: 1, size: 1, steps: 1e3 },
                        second: { common: 1, size: 1e3, steps: 60 },
                        minute: { common: 1, size: 6e4, steps: 60 },
                        hour: { common: 1, size: 36e5, steps: 24 },
                        day: { common: 1, size: 864e5, steps: 30 },
                        week: { common: 0, size: 6048e5, steps: 4 },
                        month: { common: 1, size: 2628e6, steps: 12 },
                        quarter: { common: 0, size: 7884e6, steps: 4 },
                        year: { common: 1, size: 3154e7 }
                    })
                )),
                (eu = class extends ad {
                    static id = 'time';
                    static defaults = {
                        bounds: 'data',
                        adapters: {},
                        time: {
                            parser: 0,
                            unit: 0,
                            round: 0,
                            isoWeekday: 0,
                            minUnit: 'millisecond',
                            displayFormats: {}
                        },
                        ticks: { source: 'auto', callback: 0, major: { enabled: 0 } }
                    };
                    constructor(t) {
                        (super(t),
                            (this._cache = { data: [], labels: [], all: [] }),
                            (this._unit = 'day'),
                            (this._majorUnit = void 0),
                            (this._offsets = {}),
                            (this._normalized = 0),
                            (this._parseOpts = void 0));
                    }
                    init(t, e = {}) {
                        let i = t.time || (t.time = {}),
                            n = (this._adapter = new Nc._date(t.adapters.date));
                        (n.init(e),
                            si(i.displayFormats, n.formats()),
                            (this._parseOpts = { parser: i.parser, round: i.round, isoWeekday: i.isoWeekday }),
                            super.init(t),
                            (this._normalized = e.normalized));
                    }
                    parse(t, e) {
                        return void 0 === t ? null : oo(this, t);
                    }
                    beforeLayout() {
                        (super.beforeLayout(), (this._cache = { data: [], labels: [], all: [] }));
                    }
                    determineDataLimits() {
                        function t(t) {
                            (!o && !isNaN(t.min) && (r = Math.min(r, t.min)),
                                !s && !isNaN(t.max) && (a = Math.max(a, t.max)));
                        }
                        let e = this.options,
                            i = this._adapter,
                            n = e.time.unit || 'day',
                            { min: r, max: a, minDefined: o, maxDefined: s } = this.getUserBounds();
                        ((!o || !s) &&
                            (t(this._getLabelBounds()),
                            ('ticks' !== e.bounds || 'labels' !== e.ticks.source) && t(this.getMinMax(0))),
                            (r = Ke(r) && !isNaN(r) ? r : +i.startOf(Date.now(), n)),
                            (a = Ke(a) && !isNaN(a) ? a : +i.endOf(Date.now(), n) + 1),
                            (this.min = Math.min(r, a - 1)),
                            (this.max = Math.max(r + 1, a)));
                    }
                    _getLabelBounds() {
                        let t = this.getLabelTimestamps(),
                            e = 1 / 0,
                            i = -1 / 0;
                        return (t.length && ((e = t[0]), (i = t[t.length - 1])), { min: e, max: i });
                    }
                    buildTicks() {
                        let t = this.options,
                            e = t.time,
                            i = t.ticks,
                            n = 'labels' === i.source ? this.getLabelTimestamps() : this._generate();
                        'ticks' === t.bounds &&
                            n.length &&
                            ((this.min = this._userMin || n[0]), (this.max = this._userMax || n[n.length - 1]));
                        let r = this.min,
                            a = (function (t, e, i) {
                                let n = 0,
                                    r = t.length;
                                for (; n < r && t[n] < e; ) n++;
                                for (; r > n && t[r - 1] > i; ) r--;
                                return n > 0 || r < t.length ? t.slice(n, r) : t;
                            })(n, r, this.max);
                        return (
                            (this._unit =
                                e.unit ||
                                (i.autoSkip
                                    ? so(e.minUnit, this.min, this.max, this._getLabelCapacity(r))
                                    : (function (t, e, i, n, r) {
                                          for (let a = tu.length - 1; a >= tu.indexOf(i); a--) {
                                              let i = tu[a];
                                              if (Qd[i].common && t._adapter.diff(r, n, i) >= e - 1) return i;
                                          }
                                          return tu[i ? tu.indexOf(i) : 0];
                                      })(this, a.length, e.minUnit, this.min, this.max))),
                            (this._majorUnit =
                                i.major.enabled && 'year' !== this._unit
                                    ? (function (t) {
                                          for (let e = tu.indexOf(t) + 1, i = tu.length; e < i; ++e)
                                              if (Qd[tu[e]].common) return tu[e];
                                      })(this._unit)
                                    : void 0),
                            this.initOffsets(n),
                            t.reverse && a.reverse(),
                            ho(this, a, this._majorUnit)
                        );
                    }
                    afterAutoSkip() {
                        this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t) => +t.value));
                    }
                    initOffsets(t = []) {
                        let e,
                            i,
                            n = 0,
                            r = 0;
                        this.options.offset &&
                            t.length &&
                            ((e = this.getDecimalForValue(t[0])),
                            (n = 1 === t.length ? 1 - e : (this.getDecimalForValue(t[1]) - e) / 2),
                            (i = this.getDecimalForValue(t[t.length - 1])),
                            (r = 1 === t.length ? i : (i - this.getDecimalForValue(t[t.length - 2])) / 2));
                        let a = t.length < 3 ? 0.5 : 0.25;
                        ((n = Mi(n, 0, a)),
                            (r = Mi(r, 0, a)),
                            (this._offsets = { start: n, end: r, factor: 1 / (n + 1 + r) }));
                    }
                    _generate() {
                        let t,
                            e,
                            i = this._adapter,
                            n = this.min,
                            r = this.max,
                            a = this.options,
                            o = a.time,
                            s = o.unit || so(o.minUnit, n, r, this._getLabelCapacity(n)),
                            l = Qe(a.ticks.stepSize, 1),
                            h = 'week' === s ? o.isoWeekday : 0,
                            c = fi(h) || 1 == h,
                            d = {},
                            u = n;
                        if (
                            (c && (u = +i.startOf(u, 'isoWeek', h)),
                            (u = +i.startOf(u, c ? 'day' : s)),
                            i.diff(r, n, s) > 1e5 * l)
                        )
                            throw Error(n + ' and ' + r + ' are too far apart with stepSize of ' + l + ' ' + s);
                        let f = 'data' === a.ticks.source && this.getDataTimestamps();
                        for (t = u, e = 0; t < r; t = +i.add(t, l, s), e++) lo(d, t, f);
                        return (
                            (t === r || 'ticks' === a.bounds || 1 === e) && lo(d, t, f),
                            Object.keys(d)
                                .sort(ao)
                                .map((t) => +t)
                        );
                    }
                    getLabelForValue(t) {
                        let e = this.options.time;
                        return this._adapter.format(t, e.tooltipFormat ? e.tooltipFormat : e.displayFormats.datetime);
                    }
                    format(t, e) {
                        return this._adapter.format(t, e || this.options.time.displayFormats[this._unit]);
                    }
                    _tickFormatFunction(t, e, i, n) {
                        let r = this.options,
                            a = r.ticks.callback;
                        if (a) return ti(a, [t, e, i], this);
                        let o = r.time.displayFormats,
                            s = this._unit,
                            l = this._majorUnit,
                            h = l && o[l],
                            c = i[e];
                        return this._adapter.format(t, n || (l && h && c && c.major ? h : s && o[s]));
                    }
                    generateTickLabels(t) {
                        let e, i, n;
                        for (e = 0, i = t.length; e < i; ++e)
                            ((n = t[e]), (n.label = this._tickFormatFunction(n.value, e, t)));
                    }
                    getDecimalForValue(t) {
                        return null === t ? NaN : (t - this.min) / (this.max - this.min);
                    }
                    getPixelForValue(t) {
                        let e = this._offsets,
                            i = this.getDecimalForValue(t);
                        return this.getPixelForDecimal((e.start + i) * e.factor);
                    }
                    getValueForPixel(t) {
                        let e = this._offsets,
                            i = this.getDecimalForPixel(t) / e.factor - e.end;
                        return this.min + i * (this.max - this.min);
                    }
                    _getLabelSize(t) {
                        let e = this.options.ticks,
                            i = this.ctx.measureText(t).width,
                            n = pi(this.isHorizontal() ? e.maxRotation : e.minRotation),
                            r = Math.cos(n),
                            a = Math.sin(n),
                            o = this._resolveTickFontOptions(0).size;
                        return { w: i * r + o * a, h: i * a + o * r };
                    }
                    _getLabelCapacity(t) {
                        let e = this.options.time,
                            i = e.displayFormats,
                            n = i[e.unit] || i.millisecond,
                            r = this._tickFormatFunction(t, 0, ho(this, [t], this._majorUnit), n),
                            a = this._getLabelSize(r),
                            o = Math.floor(this.isHorizontal() ? this.width / a.w : this.height / a.h) - 1;
                        return o > 0 ? o : 1;
                    }
                    getDataTimestamps() {
                        let t,
                            e,
                            i = this._cache.data || [];
                        if (i.length) return i;
                        let n = this.getMatchingVisibleMetas();
                        if (this._normalized && n.length)
                            return (this._cache.data = n[0].controller.getAllParsedValues(this));
                        for (t = 0, e = n.length; t < e; ++t) i = i.concat(n[t].controller.getAllParsedValues(this));
                        return (this._cache.data = this.normalize(i));
                    }
                    getLabelTimestamps() {
                        let t,
                            e,
                            i = this._cache.labels || [];
                        if (i.length) return i;
                        let n = this.getLabels();
                        for (t = 0, e = n.length; t < e; ++t) i.push(oo(this, n[t]));
                        return (this._cache.labels = this._normalized ? i : this.normalize(i));
                    }
                    normalize(t) {
                        return Li(t.sort(ao));
                    }
                }),
                (iu = class extends eu {
                    static id = 'timeseries';
                    static defaults = eu.defaults;
                    constructor(t) {
                        (super(t), (this._table = []), (this._minPos = void 0), (this._tableRange = void 0));
                    }
                    initOffsets() {
                        let t = this._getTimestampsForTable(),
                            e = (this._table = this.buildLookupTable(t));
                        ((this._minPos = co(e, this.min)),
                            (this._tableRange = co(e, this.max) - this._minPos),
                            super.initOffsets(t));
                    }
                    buildLookupTable(t) {
                        let e,
                            i,
                            n,
                            r,
                            a,
                            { min: o, max: s } = this,
                            l = [],
                            h = [];
                        for (e = 0, i = t.length; e < i; ++e) ((r = t[e]), r >= o && r <= s && l.push(r));
                        if (l.length < 2)
                            return [
                                { time: o, pos: 0 },
                                { time: s, pos: 1 }
                            ];
                        for (e = 0, i = l.length; e < i; ++e)
                            ((a = l[e + 1]),
                                (n = l[e - 1]),
                                (r = l[e]),
                                Math.round((a + n) / 2) !== r && h.push({ time: r, pos: e / (i - 1) }));
                        return h;
                    }
                    _generate() {
                        let t = this.min,
                            e = this.max,
                            i = super.getDataTimestamps();
                        return (
                            (!i.includes(t) || !i.length) && i.splice(0, 0, t),
                            (!i.includes(e) || 1 === i.length) && i.push(e),
                            i.sort((t, e) => t - e)
                        );
                    }
                    _getTimestampsForTable() {
                        let t = this._cache.all || [];
                        if (t.length) return t;
                        let e = this.getDataTimestamps(),
                            i = this.getLabelTimestamps();
                        return (
                            (t = e.length && i.length ? this.normalize(e.concat(i)) : e.length ? e : i),
                            (t = this._cache.all = t),
                            t
                        );
                    }
                    getDecimalForValue(t) {
                        return (co(this._table, t) - this._minPos) / this._tableRange;
                    }
                    getValueForPixel(t) {
                        let e = this._offsets,
                            i = this.getDecimalForPixel(t) / e.factor - e.end;
                        return co(this._table, i * this._tableRange + this._minPos, 1);
                    }
                }),
                (nu = Object.freeze({
                    __proto__: null,
                    CategoryScale: Yd,
                    LinearScale: Xd,
                    LogarithmicScale: Kd,
                    RadialLinearScale: Jd,
                    TimeScale: eu,
                    TimeSeriesScale: iu
                })),
                (ru = [Bc, kd, Hd, nu]));
        }),
        hu = {};
    Ao(hu, { default: () => uo });
    var cu = Do(() => {
        (To(),
            Fo(),
            rh(),
            $o(),
            nh(),
            Ro(),
            lu(),
            Oo(),
            Io(),
            vd.register(...ru),
            (vd.defaults.font.family = 'Poppins'));
    });
    (To(), Ro(), To(), Ro(), To(), Ro(), To(), Ro(), Fo(), Oo(), nh(), To(), rh(), Ro());
    var du = ((t, e, i) => (
            (i = null != t ? ko(Eo(t)) : {}),
            ((t, e, i, n) => {
                if ((e && 'object' == typeof e) || 'function' == typeof e)
                    for (let i of Lo(e))
                        !Po.call(t, i) &&
                            void 0 !== i &&
                            So(t, i, {
                                get() {
                                    return e[i];
                                },
                                enumerable: !(n = Co(e, i)) || n.enumerable
                            });
                return t;
            })(So(i, 'default', { value: t, enumerable: 1 }), t)
        ))(ah()),
        uu = new du.EventEmitter();
    (To(), Ro());
    var fu = ((t) => (e) => {
            var i = t[e];
            if (i) return i();
            throw Error('Module not found in bundle: ' + e);
        })({
            './core/custom-site-settings.ts': () => Promise.resolve().then(() => (au(), oh)),
            './core/settings.ts': () => Promise.resolve().then(() => (cu(), hu))
        }),
        gu = mo.performance.now(),
        pu = new URL(po.location.href);
    if (
        (pu.searchParams.has('ref') && (pu.searchParams.delete('ref'), (po.location.href = '' + pu)),
        'jtoh.pro' !== pu.hostname
            ? (function () {
                  let i = mo.fetch;
                  mo.fetch = async (...n) => {
                      let r = await i(...n),
                          a = '' + n[0];
                      a.startsWith('/') && (a = new URL(a, mo.location.href).href);
                      let o = new URL(a);
                      return (
                          t(
                              'info',
                              `Fetch ${(n[1] ?? {}).method ?? 'GET'} request to %c${o.hostname.replaceAll('.', '/')} @ ${o.pathname}%c completed with status ${r.status} (${r.ok ? 'OK' : 'ERROR'})`,
                              [
                                  e({
                                      color: '#00bfff',
                                      extra: [
                                          { name: 'text-decoration', value: 'none' },
                                          { name: 'margin-left', value: '-5px' }
                                      ]
                                  }),
                                  e({ 'padding-right': '5px' })
                              ]
                          ),
                          r
                      );
                  };
              })()
            : (bo = 1),
        mo.addEventListener('load', function () {
            (i(po.head, '__loaded'), (po.body.style.cursor = 'default'));
        }),
        console.log(
            '%cWarning!',
            'color:rgb(168, 34, 34); font-size: 72px; font-weight: bold; background-color: #585858ff; padding: 5px;'
        ),
        console.log(
            '%cDo not paste anything here! You may get your account stolen or your device compromised!',
            'color:rgba(255, 255, 255, 0.75); font-size: 20px; font-weight: bold; background-color: #585858ff; padding: 5px;'
        ),
        fo(),
        (async function () {
            function t(t) {
                (t.addEventListener('load', (t) => {
                    i(t.target, 'imageIsLoaded');
                }),
                    t.addEventListener('error', (t) => {
                        n(t.target, 'imageIsLoaded');
                    }),
                    t.complete && 0 !== t.naturalWidth && i(t, 'imageIsLoaded'),
                    new MutationObserver((e) => {
                        for (let i of e) 'attributes' === i.type && 'src' === i.attributeName && n(t, 'imageIsLoaded');
                    }).observe(t, { attributes: 1 }));
            }
            new MutationObserver((e) => {
                for (let i of e)
                    if ('childList' === i.type)
                        for (let e of i.addedNodes)
                            if ('IMG' === e.tagName) t(e);
                            else if (e.nodeType === Node.ELEMENT_NODE) {
                                let i = e.getElementsByTagName('img');
                                for (let e of i) t(e);
                            }
            }).observe(await g(), { childList: 1, subtree: 1 });
            let e = po.getElementsByTagName('img');
            for (let i of e) t(i);
        })(),
        (async function () {
            let t = await l('themeChangeOpener', { timeout: 1e4 }),
                e = s('settingsOpener');
            if (!t) return;
            let i = 0;
            t.addEventListener('click', () => {
                i = !i;
                let n = po.getElementsByClassName('themeChanger'),
                    r = s('loggedInName'),
                    a = s('loggedInDetails');
                for (let t of n) {
                    t.dataset.enabled = '' + i;
                    let e = 0;
                    t.addEventListener('click', () => {
                        if (Ee('themeChanger')) return;
                        let i = t.dataset.theme ?? '';
                        (go(i),
                            'themesLight' === i &&
                                (e < 6
                                    ? e++
                                    : (go('themesGlass'),
                                      (e = 0),
                                      Pe('themeChanger'),
                                      setTimeout(() => {
                                          De('themeChanger');
                                      }, 3e3)),
                                setTimeout(() => {
                                    e--;
                                }, 1e3)));
                    });
                }
                i
                    ? ((t.innerHTML = '' + d('visibility_off')),
                      (t.style.borderRadius = '100%'),
                      r && (r.style.display = 'none'),
                      a && (a.style.paddingRight = '0px'),
                      e && ((e.style.borderRadius = '100%'), (e.innerHTML = '' + d('settings'))))
                    : ((t.innerHTML = d('brush') + ' Theme'),
                      (t.style.borderRadius = ''),
                      r && (r.style.display = ''),
                      a && (a.style.paddingRight = ''),
                      e && ((e.style.borderRadius = ''), (e.innerHTML = d('settings') + ' Settings')));
            });
        })(),
        (async function () {
            let t = await l('loggedInDetails', { timeout: 2e3, interval: 1 });
            if (!t) return;
            let e = await x();
            if (e.user) {
                let t = s('menuBar');
                if (!t) return;
                let n = s('themeContainer');
                if (!n) return;
                let o = s('loggedInDetails');
                if (!o) return;
                if (!new URL(po.location.href).pathname.startsWith('/app/account/')) {
                    let t = r('button', {
                        id: 'settingsOpener',
                        innerHTML: d('settings') + ' Settings',
                        type: 'button'
                    });
                    (t.addEventListener('click', () => {
                        mo.location.href = '/app/account/settings';
                    }),
                        n.insertBefore(t, o));
                }
                let l = r('img', { src: e.user.thumbnail, alt: 'User Icon', id: 'loggedInIcon' });
                l.onerror = () => {
                    '/app/assets/default-roblox-profile.png' !== l.src &&
                        (l.src = '/app/assets/default-roblox-profile.png');
                };
                let h = r('span', { innerText: e.user.name, id: 'loggedInName' });
                (a(o, [l, h]),
                    i(o, 'loggedIn'),
                    1 == e.mod && a(t, r('a', { href: '/app/mods/mod-panel', innerText: 'Mod Panel' })),
                    1 == e.admin && a(t, r('a', { href: '/app/admin/admin-panel', innerText: 'Admin Panel' })));
            } else {
                let e = r('button', { id: 'loginButton', innerHTML: d('person') + ' Login', type: 'button' });
                (e.addEventListener('click', () => {
                    (mo.sessionStorage.setItem('LoginRedirect', mo.location.href), (mo.location.href = '/login'));
                }),
                    a(t, e),
                    'captcha' === c() && (t.innerHTML = ''));
            }
        })(),
        (async function t() {
            let e = await l('menuBar', { timeout: 5e3, interval: 0 });
            if (!e) return;
            let n = e.getElementsByTagName('a');
            if (!n || 0 === n.length) return (await h(100), t());
            for (let t of n) new URL(t.href).pathname === new URL(mo.location.href).pathname && i(t, 'menuBarActive');
            let r = await l('themeContainer', { timeout: 5e3, interval: 0 });
            if (!r) return;
            let a = () => {
                r.style.paddingTop = e.scrollWidth > e.clientWidth ? '10px' : '';
            };
            (mo.addEventListener('resize', a),
                await u(),
                await h(100),
                a(),
                setTimeout(a, 3e3),
                setTimeout(() => {
                    for (let t of n)
                        new URL(t.href).pathname === new URL(mo.location.href).pathname && i(t, 'menuBarActive');
                }, 3e3));
        })(),
        (async function () {
            let t = new URL(mo.location.href).host,
                e = await (async function () {
                    return (await u(), po.head);
                })();
            po.title =
                'true' !== po.documentElement.dataset.custom
                    ? `${t} - ${e.dataset.page ?? 'Untitled Page'}`
                    : (e.dataset.page ?? 'Untitled Page');
        })(),
        (async function () {
            await u();
            let t = s('blogDetails');
            if (t) {
                let e = JSON.parse(decodeURIComponent(t.dataset.json ?? '')),
                    n = r('span', {
                        innerHTML: `${d('calendar_add_on')} <b>Posted:</b> ${new Date(e.created).toLocaleString()}`
                    }),
                    o = r('span', {
                        innerHTML: `${d('edit')} <b>Last Edited:</b> ${new Date(e.lastEdited).toLocaleString()}${e.editCount > 1 ? ` <i>(${e.editCount} Edits)</i>` : ''}`
                    });
                a(t, [n, r('br'), o]);
                let s = r('a', { target: '_blank', href: e.source, innerText: 'This post is open source.' });
                (i(s, 'blogSource'), a(t.parentElement, s));
            }
        })(),
        (function () {
            let t = new URL(mo.location.href);
            if ('true' === t.searchParams.get('loginRedirect')) {
                let e = mo.sessionStorage.getItem('LoginRedirect');
                try {
                    let i = new URL(e);
                    (t.hostname === i.hostname && (mo.location.href = i.href),
                        mo.sessionStorage.removeItem('LoginRedirect'));
                } catch (t) {
                    console.error(t);
                    let e = new URL(mo.location.href);
                    (e.searchParams.delete('loginRedirect'), mo.history.replaceState({}, '', e.href));
                }
            }
        })(),
        (async function () {
            let t = await fetch('/api/vars')
                .then((t) => t.json())
                .then((t) => t.version)
                .catch(console.error);
            t &&
                t !== mo.localStorage.getItem('$VERSION') &&
                (mo.localStorage.setItem('$VERSION', t), await fetch('/api/clear-site-cache').catch(console.error));
        })(),
        !(
            'localhost' === pu.hostname ||
            'jtoh.pro' === pu.hostname ||
            'beta.jtoh.pro' === pu.hostname ||
            pu.hostname.endsWith('.jtoh.pro') ||
            pu.hostname.endsWith('.etoh.pro') ||
            pu.hostname.endsWith('.roblox-obby.pro') ||
            pu.hostname.endsWith('.localhost')
        ))
    )
        if (pu.host.endsWith('devtunnels.ms') || pu.host.endsWith('app.github.dev')) {
            let t = await fetch('/api/vars').catch(() => ({ json: () => ({ usingCustomUrl: 0 }) })),
                { usingCustomUrl: e } = await t.json();
            e || (po.location.href = 'https://jtoh.pro');
        } else po.location.href = 'https://jtoh.pro';
    try {
        let t = await fu(`./core/${c()}.ts`);
        t && (await t.default());
    } catch (th) {
        t('error', '' + th);
    }
    (Ce(), t('success', `Loaded in ${Math.round(mo.performance.now() - gu)}ms`));
})();
