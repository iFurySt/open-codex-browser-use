var codex = (function () {
  var Tt = "codex-agent-overlay-root",
    Jn = -44,
    It = 0.9,
    Ot = 2.2,
    Mt = 0.12,
    At = 0.7,
    j = {
      arcFlow: 0.5783555327868779,
      arcSize: 0.2765523188064277,
      boundsMargin: 20,
      candidateCount: 20,
      clickAngleDegrees: -44,
      endpointHandle: 0.15,
      startHandle: 0.41960295031576633,
    };
  function wt({ bounds: t, end: n, start: o }) {
    return Ft(Pt({ bounds: t, config: j, end: n, start: o }), t, j);
  }
  function Z(t, n) {
    const o = g(n, 0, 1),
      e = o === 1 ? t.segments.length - 1 : o * t.segments.length,
      r = Math.floor(e),
      i = t.segments[r];
    if (i == null)
      throw new Error("Cursor motion path has no segment for progress");
    const a = t.segments[r - 1],
      s = r === 0 ? t.start : a?.end;
    if (s == null)
      throw new Error("Cursor motion path segment is missing its start point");
    const c = o === 1 ? 1 : e - r;
    return { point: Bt(s, i, c), tangent: Gt(s, i, c) };
  }
  function J(t) {
    if (x({ x: 0, y: 0 }, t) < 0.001) return st(-44);
    const n = F(t);
    return st(Math.atan2(n.y, n.x) * (180 / Math.PI) + 90);
  }
  function x(t, n) {
    const o = n.x - t.x,
      e = n.y - t.y;
    return Math.sqrt(o * o + e * e);
  }
  function Nt(t) {
    return { dampingFraction: It, response: Lt(t) };
  }
  function g(t, n, o) {
    return Math.max(n, Math.min(o, t));
  }
  function Pt({ bounds: t, config: n, end: o, start: e }) {
    const r = et(n.clickAngleDegrees),
      i = x(e, o),
      a = { x: o.x - e.x, y: o.y - e.y },
      s = F(a),
      c = Math.max(48, Math.min(640, i * n.startHandle, i * 0.9)),
      l = Math.max(48, Math.min(640, i * n.endpointHandle, i * 0.9)),
      u = { x: -r.x, y: -r.y },
      d = D(t, e, r, c),
      h = D(t, o, u, l),
      p = { x: -s.y, y: s.x },
      y = p.x * r.x + p.y * r.y >= 0 ? 1 : -1,
      C = { x: p.x * y, y: p.y * y },
      f = Vt(e, o),
      S = D(t, e, r, c * 0.65),
      v = D(t, o, u, l * 0.65),
      A = F(a),
      T = Math.max(50, Math.min(520, i * n.arcSize)),
      w = Math.max(38, Math.min(440, i * n.arcFlow)),
      H = [0.55, 0.8, 1.05],
      K = [0.65, 1, 1.35],
      P = [tt(e, o, d, h), tt(e, o, S, v)];
    for (const z of H)
      for (const Zn of K)
        bt({
          arcDistanceBase: T,
          arcDistanceScale: z,
          arcHandleDistanceBase: w,
          arcHandleScale: Zn,
          arcTangent: A,
          candidates: P,
          end: o,
          endControl: h,
          midpoint: f,
          naturalArcNormal: C,
          start: e,
          startControl: d,
          startControlDistance: c,
          clickTangent: r,
        });
    return P.slice(0, n.candidateCount);
  }
  function bt({
    arcDistanceBase: t,
    arcDistanceScale: n,
    arcHandleDistanceBase: o,
    arcHandleScale: e,
    arcTangent: r,
    candidates: i,
    clickTangent: a,
    end: s,
    endControl: c,
    midpoint: l,
    naturalArcNormal: u,
    start: d,
    startControl: h,
    startControlDistance: p,
  }) {
    (Q({
      arcDistanceBase: t,
      arcDistanceScale: n,
      arcHandleDistanceBase: o,
      arcHandleScale: e,
      arcNormal: u,
      arcTangent: r,
      candidates: i,
      clickTangent: a,
      end: s,
      endControl: c,
      midpoint: l,
      start: d,
      startControl: h,
      startControlDistance: p,
    }),
      Q({
        arcDistanceBase: t,
        arcDistanceScale: n,
        arcHandleDistanceBase: o,
        arcHandleScale: e,
        arcNormal: { x: -u.x, y: -u.y },
        arcTangent: r,
        candidates: i,
        clickTangent: a,
        end: s,
        endControl: c,
        midpoint: l,
        start: d,
        startControl: h,
        startControlDistance: p,
      }));
  }
  function Q({
    arcDistanceBase: t,
    arcDistanceScale: n,
    arcHandleDistanceBase: o,
    arcHandleScale: e,
    arcNormal: r,
    arcTangent: i,
    candidates: a,
    clickTangent: s,
    end: c,
    endControl: l,
    midpoint: u,
    start: d,
    startControl: h,
    startControlDistance: p,
  }) {
    const y = t * n,
      C = o * e,
      f = {
        x: u.x + r.x * y + s.x * p * 0.16,
        y: u.y + r.y * y + s.y * p * 0.16,
      },
      S = { x: f.x - i.x * C, y: f.y - i.y * C },
      v = { x: f.x + i.x * C, y: f.y + i.y * C };
    a.push(
      Dt({
        arc: f,
        arcIn: S,
        arcOut: v,
        end: c,
        endControl: l,
        start: d,
        startControl: h,
      }),
    );
  }
  function tt(t, n, o, e) {
    return {
      arc: null,
      arcIn: null,
      arcOut: null,
      end: n,
      endControl: e,
      segments: [{ control1: o, control2: e, end: n }],
      start: t,
      startControl: o,
    };
  }
  function Dt({
    arc: t,
    arcIn: n,
    arcOut: o,
    end: e,
    endControl: r,
    start: i,
    startControl: a,
  }) {
    return {
      arc: t,
      arcIn: n,
      arcOut: o,
      end: e,
      endControl: r,
      segments: [
        { control1: a, control2: n, end: t },
        { control1: o, control2: r, end: e },
      ],
      start: i,
      startControl: a,
    };
  }
  function Ft(t, n, o) {
    const e = t[0];
    if (e == null)
      throw new Error("Cursor motion requires at least one candidate");
    let r = e,
      i = Number.POSITIVE_INFINITY,
      a = e,
      s = Number.POSITIVE_INFINITY;
    for (const c of t) {
      const l = nt(c, n, o),
        u = Ut(c, l);
      (u < s && ((a = c), (s = u)),
        l.staysInBounds && u < i && ((r = c), (i = u)));
    }
    return i === Number.POSITIVE_INFINITY ? a : r;
  }
  function nt(t, n, o) {
    let e = 0,
      r = 0,
      i = 0,
      a = 0,
      s = null,
      c = n == null || o == null ? !0 : it(t.start, n, o.boundsMargin),
      l = t.start,
      u = t.start;
    for (const d of t.segments) {
      for (let h = 1; h <= 24; h += 1) {
        const p = h / 24,
          y = rt(l, d.control1, d.control2, d.end, p);
        ((e += x(u, y)),
          n != null && o != null && (c = c && it(y, n, o.boundsMargin)));
        const C = { x: y.x - u.x, y: y.y - u.y };
        if (x({ x: 0, y: 0 }, C) > 0.01) {
          const f = Math.atan2(C.y, C.x);
          if (s != null) {
            const S = kt(s, f);
            ((r += S * S), (i = Math.max(i, Math.abs(S))), (a += Math.abs(S)));
          }
          s = f;
        }
        u = y;
      }
      l = d.end;
    }
    return {
      angleChangeEnergy: r,
      length: e,
      maxAngleChange: i,
      staysInBounds: c,
      totalTurn: a,
    };
  }
  function Ut(t, n) {
    const o = Math.max(1, x(t.start, t.end)),
      e = Math.max(0, n.length / o - 1),
      r = t.arc == null ? 0 : 45,
      i = ot(t);
    return (
      n.length +
      e * 320 +
      n.angleChangeEnergy * 140 +
      n.maxAngleChange * 180 +
      n.totalTurn * 18 +
      i * 90 +
      r
    );
  }
  function ot(t) {
    const n = et(-44),
      o = F({ x: t.end.x - t.start.x, y: t.end.y - t.start.y });
    return g((-(o.x * n.x + o.y * n.y) - 0.08) / 0.92, 0, 1);
  }
  function Lt(t) {
    const n = nt(t),
      o = Math.max(1, x(t.start, t.end)),
      e = Math.max(0, n.length / o - 1),
      r = g((n.length - 180) / 760, 0, 1),
      i = g(e / 0.55, 0, 1),
      a = g(n.totalTurn / (Math.PI * 1.4), 0, 1),
      s = g(n.angleChangeEnergy / 1.25, 0, 1),
      c = g(i * 0.42 + a * 0.38 + s * 0.2, 0, 1),
      l = ot(t),
      u = t.arc == null ? 0 : 0.04,
      d = l * 0.28,
      h = t.arc == null ? 1 : 0.9;
    return g((0.42 + r * 0.22 + c * 0.12 + d + u) * At * h, Mt, Ot);
  }
  function D(t, n, o, e) {
    let r = e;
    return (
      o.x < 0 && (r = Math.min(r, n.x / -o.x)),
      o.x > 0 && (r = Math.min(r, (t.width - n.x) / o.x)),
      o.y < 0 && (r = Math.min(r, n.y / -o.y)),
      o.y > 0 && (r = Math.min(r, (t.height - n.y) / o.y)),
      { x: n.x + o.x * Math.max(0, r), y: n.y + o.y * Math.max(0, r) }
    );
  }
  function et(t) {
    const n = t * (Math.PI / 180);
    return { x: Math.sin(n), y: -Math.cos(n) };
  }
  function Bt(t, n, o) {
    return rt(t, n.control1, n.control2, n.end, o);
  }
  function rt(t, n, o, e, r) {
    const i = 1 - r,
      a = i * i * i,
      s = 3 * i * i * r,
      c = 3 * i * r * r,
      l = r * r * r;
    return {
      x: t.x * a + n.x * s + o.x * c + e.x * l,
      y: t.y * a + n.y * s + o.y * c + e.y * l,
    };
  }
  function Gt(t, n, o) {
    const e = 1 - o;
    return {
      x:
        3 * e * e * (n.control1.x - t.x) +
        6 * e * o * (n.control2.x - n.control1.x) +
        3 * o * o * (n.end.x - n.control2.x),
      y:
        3 * e * e * (n.control1.y - t.y) +
        6 * e * o * (n.control2.y - n.control1.y) +
        3 * o * o * (n.end.y - n.control2.y),
    };
  }
  function Vt(t, n) {
    return { x: (t.x + n.x) / 2, y: (t.y + n.y) / 2 };
  }
  function F(t) {
    const n = Math.sqrt(t.x * t.x + t.y * t.y);
    return n < 0.001 ? { x: 1, y: 0 } : { x: t.x / n, y: t.y / n };
  }
  function it(t, n, o) {
    return t.x >= o && t.x <= n.width - o && t.y >= o && t.y <= n.height - o;
  }
  function kt(t, n) {
    let o = n - t;
    for (; o > Math.PI; ) o -= Math.PI * 2;
    for (; o < -Math.PI; ) o += Math.PI * 2;
    return o;
  }
  function st(t) {
    const n = t % 360;
    return n < 0 ? n + 360 : n;
  }
  var W = 24,
    U = W / 2,
    Yt = 23,
    $t = 24,
    Ht = 12,
    Wt = -2.5,
    qt = 44,
    Xt = 5,
    Kt = 0.4,
    zt = 0,
    jt = 1.41,
    Zt = 0.66,
    Jt = 12.5,
    Qt = 0.58,
    tn = 0.55,
    L = 1 / 60,
    nn = 0.85,
    at = 12,
    on = 196,
    en = 70,
    rn = 0.15,
    ct = 0,
    B = 1 / 240,
    sn = 1,
    lt = 0.001 * 60,
    an = { dampingFraction: 0.85, response: 0.2 },
    cn = { dampingFraction: 0.86, response: 0.42 },
    ln = { dampingFraction: 0.94, response: 0.19 },
    G = { dampingFraction: 0.9, response: 0.19 },
    ut = { dampingFraction: 0.9, response: 0.12 },
    un = { dampingFraction: 0.82, response: 0.055 },
    Sn = { dampingFraction: 0.86, response: 0.12 };
  function dn(
    t,
    { assetUrl: n, dataTestId: o = "browser-agent-cursor", onArrived: e },
  ) {
    const r = gn(t, n, o);
    let i = null,
      a = N(),
      s = null,
      c = null,
      l = null,
      u = null,
      d = null,
      h = null,
      p = !1,
      y = !1;
    const C = () => {
        l == null || c == null || d === c || ((d = c), e?.(l));
      },
      f = () => {
        i != null ||
          s == null ||
          y ||
          (i = Fn((S) => {
            i = null;
            const v = s;
            if (v == null) return;
            const A = p ? L : Math.max(L, (S - a) / 1e3);
            ((p = !1), (a = S));
            const T = Cn(v, A, S);
            (V(r, v), T && C(), En(v) && f());
          }));
      };
    return {
      destroy: () => {
        ((y = !0), i != null && (Un(i), (i = null)), r.layer.remove());
      },
      setState: (S) => {
        const v = S.turnKey ?? "",
          A = S.cursor != null,
          T = On({
            cursorX: S.cursor?.x,
            cursorY: S.cursor?.y,
            viewportHeight: S.viewportSize.height,
            viewportWidth: S.viewportSize.width,
          }),
          w = S.isVisible !== !1 && S.cursor?.visible !== !1,
          H = S.cursor?.animateMovement !== !1,
          K = w && !A;
        if (
          ((l = S.cursor?.moveSequence ?? null),
          (c = l == null ? null : `${v}:${l}`),
          s == null && (s = hn(T, w)),
          (s.visibilitySpring.target = w ? 1 : 0),
          K &&
            u !== v &&
            ((u = v), m(s.visibilitySpring, 1), (s.thinkStartedAt = N())),
          !A)
        ) {
          (ht(s, T), V(r, s), f());
          return;
        }
        const P =
          S.cursor?.moveSequence != null &&
          w &&
          s.visibilitySpring.value <= 0.001 &&
          h !== v;
        s.thinkStartedAt = null;
        const z = x(s.point, T);
        if (!H || P || z < 0.5) {
          (P && ((h = v), m(s.visibilitySpring, 1)),
            ht(s, T),
            H ||
              ((s.stretchSpring.force = 0),
              (s.stretchSpring.value = 1),
              (s.stretchSpring.velocity = 0)),
            V(r, s),
            C(),
            f());
          return;
        }
        (pn(s, T, S.viewportSize), (p = !0), V(r, s), f());
      },
    };
  }
  function gn(t, n, o) {
    const e = document.createElement("div");
    (e.setAttribute("aria-hidden", "true"),
      (e.style.inset = "0"),
      (e.style.overflow = "hidden"),
      (e.style.pointerEvents = "none"),
      (e.style.position = "absolute"),
      (e.style.zIndex = "20"));
    const r = document.createElement("div");
    ((r.dataset.testid = o),
      (r.style.height = `${W}px`),
      (r.style.left = "0"),
      (r.style.position = "absolute"),
      (r.style.top = "0"),
      (r.style.transformOrigin = `${U}px ${U}px`),
      (r.style.willChange = "transform"),
      (r.style.width = `${W}px`));
    const i = document.createElement("div");
    i.style.transform = `translate3d(${Ht}px, ${Wt}px, 0)`;
    const a = document.createElement("img");
    return (
      (a.alt = ""),
      (a.dataset.browserAgentCursorAsset = ""),
      (a.dataset.testid = `${o}-asset`),
      (a.draggable = !1),
      (a.height = $t),
      (a.src = n),
      (a.style.display = "block"),
      (a.style.transform = `rotate(${qt}deg) scale(1)`),
      (a.style.transformOrigin = "0 0"),
      (a.width = Yt),
      i.appendChild(a),
      r.appendChild(i),
      e.appendChild(r),
      t.appendChild(e),
      { cursor: r, layer: e }
    );
  }
  function hn(t, n) {
    const o = n ? 1 : 0,
      e = M(-44);
    return {
      motion: null,
      point: t,
      positionXSpring: R(t.x, t.x, G),
      positionYSpring: R(t.y, t.y, G),
      rotation: e,
      rotationSpring: R(e, e, ut),
      scootAxisRotation: 0,
      scootAxisSpring: R(0, 0, ut),
      scootRotationSpring: R(0, 0, un),
      scootStretchSpring: R(1, 1, Sn),
      stretchSpring: R(1, 1, an),
      thinkStartedAt: null,
      visibilitySpring: R(o, o, cn),
    };
  }
  function pn(t, n, o) {
    t.thinkStartedAt = null;
    const e = { x: t.point.x, y: t.point.y };
    if (x(e, n) <= on) {
      fn(t, e, n);
      return;
    }
    const r = wt({ bounds: o, end: n, start: e }),
      i = Nt(r);
    (St(t, Nn(i.response), i.dampingFraction),
      (t.motion = { mode: "bezier", path: r, progressSpring: R(0, 1, i) }));
  }
  function fn(t, n, o) {
    const e = mn(n, o);
    (St(t, G.response, G.dampingFraction),
      (t.positionXSpring.target = o.x),
      (t.positionYSpring.target = o.y),
      O(t.rotationSpring, M(-44)),
      O(t.scootAxisSpring, e.axisRotation),
      (t.motion = {
        axisRotation: e.axisRotation,
        end: o,
        mode: "scoot",
        progressSpring: R(0, 1, ln),
        rotationTarget: e.rotationTarget,
        start: n,
      }));
  }
  function mn(t, n) {
    const o = bn({ x: n.x - t.x, y: n.y - t.y });
    return { axisRotation: yn(o), rotationTarget: vn(o) };
  }
  function yn(t) {
    return x({ x: 0, y: 0 }, t) < 0.001
      ? 0
      : Math.atan2(t.y, t.x) * (180 / Math.PI);
  }
  function vn(t) {
    return g(t.x * 0.75 + -t.y * 0.62, -1, 1) * en;
  }
  function Cn(t, n, o) {
    const e = xn(t, n, o);
    return (
      _(t.visibilitySpring, n),
      _(t.stretchSpring, n),
      _(t.scootStretchSpring, n),
      _(t.scootRotationSpring, n),
      e
    );
  }
  function xn(t, n, o) {
    if (t.motion == null)
      return (
        (t.stretchSpring.target = 1),
        (t.scootStretchSpring.target = 1),
        (t.scootRotationSpring.target = 0),
        !1
      );
    const e = Math.max(0, n);
    return (
      (t.thinkStartedAt = null),
      t.motion.mode === "scoot" ? _n(t, e, o) : Rn(t, e, o)
    );
  }
  function Rn(t, n, o) {
    const e = t.motion;
    if (e?.mode !== "bezier") return !1;
    ((t.scootStretchSpring.target = 1),
      (t.scootRotationSpring.target = 0),
      _(e.progressSpring, n));
    const r = g(e.progressSpring.value, 0, 1),
      i = Z(e.path, r),
      a = J(i.tangent);
    ((t.positionXSpring.target = i.point.x),
      (t.positionYSpring.target = i.point.y),
      O(t.rotationSpring, a),
      O(t.scootAxisSpring, 0));
    const s = dt(t, n);
    if (
      ((t.stretchSpring.target = An(s.speed)),
      r >= 0.999 &&
        Math.abs(e.progressSpring.velocity) < 0.01 &&
        gt(t, i.point))
    ) {
      const c = Z(e.path, 1),
        l = J(c.tangent);
      return (
        q(t, c.point),
        m(t.rotationSpring, l),
        (t.rotation = l),
        m(t.scootAxisSpring, 0),
        (t.scootAxisRotation = 0),
        m(t.stretchSpring, 1),
        (t.motion = null),
        (t.thinkStartedAt = o),
        !0
      );
    }
    return !1;
  }
  function _n(t, n, o) {
    const e = t.motion;
    if (e?.mode !== "scoot") return !1;
    (_(e.progressSpring, n),
      (t.positionXSpring.target = e.end.x),
      (t.positionYSpring.target = e.end.y),
      O(t.scootAxisSpring, e.axisRotation),
      O(t.rotationSpring, M(-44)));
    const r = Pn(dt(t, n).point, e.start, e.end),
      i = Math.sin(Math.min(1, r) * Math.PI);
    return (
      (t.stretchSpring.target = 1),
      (t.scootStretchSpring.target = wn(r)),
      (t.scootRotationSpring.target = e.rotationTarget * i),
      r >= 0.999 && Math.abs(e.progressSpring.velocity) < 0.01 && gt(t, e.end)
        ? (q(t, e.end),
          m(t.rotationSpring, M(-44)),
          (t.rotation = t.rotationSpring.value),
          pt(t),
          m(t.stretchSpring, 1),
          (t.motion = null),
          (t.thinkStartedAt = o),
          !0)
        : !1
    );
  }
  function En(t) {
    return (
      t.motion != null ||
      t.thinkStartedAt != null ||
      !I(t.positionXSpring) ||
      !I(t.positionYSpring) ||
      !I(t.rotationSpring) ||
      !I(t.scootAxisSpring) ||
      !I(t.scootRotationSpring) ||
      !I(t.scootStretchSpring) ||
      !I(t.stretchSpring) ||
      !I(t.visibilitySpring)
    );
  }
  function I(t) {
    return t.value === t.target && mt(t);
  }
  function V(t, n) {
    const o = Mn(n, N());
    Tn(t.cursor, {
      point: n.point,
      rotation: o,
      scootAxisRotation: n.scootAxisRotation,
      scootRotation: n.scootRotationSpring.value,
      scootStretch: n.scootStretchSpring.value,
      stretch: n.stretchSpring.value,
      visibility: n.visibilitySpring.value,
    });
  }
  function Tn(t, n) {
    const o = In(n);
    ((t.style.transform = o.transform),
      (t.style.opacity = `${o.opacity}`),
      (t.style.filter = o.filter));
  }
  function In({
    point: t,
    rotation: n,
    scootAxisRotation: o,
    scootRotation: e,
    scootStretch: r,
    stretch: i,
    visibility: a,
  }) {
    const s = g(a, 0, 1),
      c = k(Kt, 1, s),
      l = k(Xt, 0, s),
      u = g(r, ct, 1),
      d = [`translate3d(${E(t.x - U)}px, ${E(t.y - U)}px, 0)`];
    return (
      (Math.abs(ft(0, o)) > 0.001 || Math.abs(u - 1) > 0.001) &&
        d.push(
          `rotate(${E(o)}deg)`,
          `scale(1, ${E(u)})`,
          `rotate(${E(-o)}deg)`,
        ),
      d.push(`rotate(${E(M(n + e))}deg)`, `scale(${E(i * c)}, ${E(c)})`),
      { filter: `blur(${E(l)}px)`, opacity: E(s), transform: d.join(" ") }
    );
  }
  function On({ cursorX: t, cursorY: n, viewportHeight: o, viewportWidth: e }) {
    return {
      x: g(t ?? Math.round(e * Qt), 0, e),
      y: g(n ?? Math.round(o * tn), 0, o),
    };
  }
  function Mn(t, n) {
    if (t.thinkStartedAt == null) return t.rotation;
    const o = (n - t.thinkStartedAt) / 1e3 - zt;
    if (o < 0) return t.rotation;
    const e = Math.min(1, o / jt),
      r = Math.sin(e * Math.PI),
      i = Math.sin((o / Zt) * Math.PI * 2) * r;
    return e >= 1
      ? ((t.thinkStartedAt = null), t.rotation)
      : t.rotation + i * Jt;
  }
  function An(t) {
    return g(1 - t / 5500, 0.65, 1);
  }
  function wn(t) {
    return k(1, k(1, ct, Math.sin(g(t, 0, 1) * Math.PI)), rn);
  }
  function Nn(t) {
    return g(t * 0.18, 0.035, 0.12);
  }
  function St(t, n, o) {
    ((t.positionXSpring.response = n),
      (t.positionYSpring.response = n),
      (t.positionXSpring.dampingFraction = o),
      (t.positionYSpring.dampingFraction = o));
  }
  function dt(t, n) {
    const o = t.point;
    (_(t.positionXSpring, n),
      _(t.positionYSpring, n),
      _(t.rotationSpring, n),
      _(t.scootAxisSpring, n));
    const e = { x: t.positionXSpring.value, y: t.positionYSpring.value },
      r = x(o, e) / Math.max(n, 1 / 240);
    return (
      (t.point = e),
      (t.rotation = t.rotationSpring.value),
      (t.scootAxisRotation = t.scootAxisSpring.value),
      { point: e, speed: r }
    );
  }
  function gt(t, n) {
    return (
      x(t.point, n) <= nn &&
      Math.abs(t.positionXSpring.velocity) <= at &&
      Math.abs(t.positionYSpring.velocity) <= at
    );
  }
  function q(t, n) {
    ((t.point = n), m(t.positionXSpring, n.x), m(t.positionYSpring, n.y));
  }
  function ht(t, n) {
    ((t.motion = null),
      q(t, n),
      m(t.rotationSpring, M(-44)),
      (t.rotation = t.rotationSpring.value),
      pt(t),
      m(t.stretchSpring, 1));
  }
  function pt(t) {
    (m(t.scootAxisSpring, 0),
      m(t.scootRotationSpring, 0),
      m(t.scootStretchSpring, 1),
      (t.scootAxisRotation = 0));
  }
  function Pn(t, n, o) {
    const e = { x: o.x - n.x, y: o.y - n.y },
      r = e.x * e.x + e.y * e.y;
    return r < 0.001 ? 1 : g(((t.x - n.x) * e.x + (t.y - n.y) * e.y) / r, 0, 1);
  }
  function O(t, n) {
    t.target = t.value + ft(t.value, n);
  }
  function ft(t, n) {
    let o = n - t;
    for (; o > 180; ) o -= 360;
    for (; o < -180; ) o += 360;
    return o;
  }
  function bn(t) {
    const n = Math.sqrt(t.x * t.x + t.y * t.y);
    return n < 0.001 ? { x: 1, y: 0 } : { x: t.x / n, y: t.y / n };
  }
  function R(t, n, o) {
    return {
      dampingFraction: o.dampingFraction,
      force: 0,
      response: o.response,
      simulationTime: 0,
      scriptTime: 0,
      target: n,
      value: t,
      velocity: 0,
    };
  }
  function m(t, n) {
    ((t.force = 0),
      (t.simulationTime = 0),
      (t.scriptTime = 0),
      (t.target = n),
      (t.value = n),
      (t.velocity = 0));
  }
  function _(t, n) {
    const o = Math.max(0.001, t.response),
      e = 1 / (2 * B ** 2),
      r = Math.min((Math.PI * 2) ** 2 / o ** 2, e),
      i = Math.sqrt(r) * 2 * t.dampingFraction;
    for (
      t.scriptTime += Math.max(0, n),
        t.scriptTime - t.simulationTime > sn &&
          (t.simulationTime = t.scriptTime - L);
      t.simulationTime < t.scriptTime;
    )
      (Dn(t, r, i), (t.simulationTime += B));
    mt(t) && (t.value = t.target);
  }
  function Dn(t, n, o) {
    const e = B / 2,
      r = t.velocity + t.force * e;
    ((t.value += r * B),
      (t.force = r * -o + (t.target - t.value) * n),
      (t.velocity = r + t.force * e));
  }
  function mt(t) {
    if (Math.max(t.velocity * t.velocity, t.force * t.force) > lt * lt)
      return !1;
    const n = t.target * 0.01,
      o = t.target - t.value;
    return n === 0 || o * o <= n * n;
  }
  function k(t, n, o) {
    return t + (n - t) * o;
  }
  function M(t) {
    const n = t % 360;
    return n < 0 ? n + 360 : n;
  }
  function E(t) {
    return Math.round(t * 1e3) / 1e3;
  }
  function N() {
    return typeof performance > "u" ? Date.now() : performance.now();
  }
  function Fn(t) {
    return typeof window < "u" && window.requestAnimationFrame != null
      ? window.requestAnimationFrame(t)
      : typeof window < "u"
        ? window.setTimeout(() => t(N()), L * 1e3)
        : (t(N()), 0);
  }
  function Un(t) {
    if (typeof window < "u" && window.cancelAnimationFrame != null) {
      window.cancelAnimationFrame(t);
      return;
    }
    typeof window < "u" && window.clearTimeout(t);
  }
  var yt = { cursor: null, isVisible: !1, sessionId: null, turnId: null },
    Ln = window.top === window.self;
  function vt(t) {
    if (!t || typeof t != "object") return yt;
    const n = t,
      o = typeof n.sessionId == "string" ? n.sessionId : null,
      e = typeof n.turnId == "string" ? n.turnId : null;
    return {
      cursor: Bn(n.cursor),
      isVisible: n.isVisible === !0 && o != null,
      sessionId: o,
      turnId: e,
    };
  }
  function Bn(t) {
    if (!t || typeof t != "object") return null;
    const n = t;
    return typeof n.visible != "boolean" ||
      typeof n.x != "number" ||
      typeof n.y != "number" ||
      !Number.isFinite(n.x) ||
      !Number.isFinite(n.y)
      ? null
      : {
          ...(typeof n.animateMovement == "boolean"
            ? { animateMovement: n.animateMovement }
            : {}),
          ...(Number.isInteger(n.moveSequence)
            ? { moveSequence: n.moveSequence }
            : {}),
          visible: n.visible,
          x: n.x,
          y: n.y,
        };
  }
  function Gn(t) {
    let n = yt,
      o = null;
    const e = document.createElement("div");
    ((e.className = "codex-agent-overlay"),
      e.setAttribute("aria-hidden", "true"),
      Ln &&
        (o = dn(e, {
          assetUrl: chrome.runtime.getURL("images/cursor-chat.png"),
          onArrived: (s) => {
            if (n.sessionId == null || n.turnId == null) return;
            const c = {
              type: "AGENT_CURSOR_ARRIVED",
              moveSequence: s,
              sessionId: n.sessionId,
              turnId: n.turnId,
            };
            chrome.runtime.sendMessage(c).catch(() => {});
          },
        })));
    const r = () => {
        o?.setState({
          cursor: n.cursor,
          isVisible: n.isVisible && n.sessionId != null,
          turnKey:
            n.sessionId == null ? null : `${n.sessionId}:${n.turnId ?? ""}`,
          viewportSize: Vn(),
        });
      },
      i = (s) => {
        ((n = s), r());
      },
      a = (s, c, l) =>
        s?.type !== "AGENT_CURSOR_STATE"
          ? !1
          : o == null
            ? (l({ ok: !1 }), !0)
            : (i(vt(s.state)), l({ ok: !0 }), !0);
    return (
      chrome.runtime.onMessage.addListener(a),
      window.addEventListener("resize", r),
      window.visualViewport?.addEventListener("resize", r),
      t.replaceChildren(e),
      r(),
      chrome.runtime
        .sendMessage({ type: "GET_AGENT_CURSOR_STATE" })
        .then((s) => {
          s?.ok && i(vt(s.state));
        })
        .catch(() => {}),
      () => {
        (o?.destroy(),
          chrome.runtime.onMessage.removeListener(a),
          window.removeEventListener("resize", r),
          window.visualViewport?.removeEventListener("resize", r),
          t.replaceChildren());
      }
    );
  }
  function Vn() {
    return {
      height: window.visualViewport?.height ?? window.innerHeight,
      width: window.visualViewport?.width ?? window.innerWidth,
    };
  }
  var kn =
      ".codex-agent-overlay{all:initial;z-index:2147483646;pointer-events:none;position:fixed;inset:0}@media print{.codex-agent-overlay{display:none}}",
    Ct = !1;
  function Yn() {
    if (!Ct) {
      if (((Ct = !0), !xt())) {
        const t = new MutationObserver(() => {
          xt() && t.disconnect();
        });
        t.observe(document, { childList: !0, subtree: !0 });
      }
      chrome.runtime.onMessage.addListener((t, n, o) =>
        t?.type === "CONTENT_PING" ? (o({ ok: !0 }), !0) : !1,
      );
    }
  }
  function xt() {
    if (document.getElementById("codex-agent-overlay-root")) return !0;
    const t = document.documentElement ?? document.body;
    if (!t) return !1;
    const n = document.createElement("div");
    ((n.id = Tt), t.appendChild(n));
    const o = n.attachShadow({ mode: "closed" }),
      e = document.createElement("style");
    ((e.textContent = kn), o.appendChild(e));
    const r = document.createElement("div");
    return (o.appendChild(r), Gn(r), !0);
  }
  function Qn(t) {
    return t;
  }
  var $n = {
    cssInjectionMode: "manifest",
    matchAboutBlank: !0,
    matches: ["<all_urls>"],
    registration: "runtime",
    runAt: "document_start",
    main() {
      Yn();
    },
  };
  function Y(t, ...n) {}
  var Hn = {
      debug: (...t) => Y(console.debug, ...t),
      log: (...t) => Y(console.log, ...t),
      warn: (...t) => Y(console.warn, ...t),
      error: (...t) => Y(console.error, ...t),
    },
    Wn = globalThis.browser?.runtime?.id
      ? globalThis.browser
      : globalThis.chrome,
    Rt = Wn,
    _t = class Et extends Event {
      static EVENT_NAME = X("wxt:locationchange");
      constructor(n, o) {
        (super(Et.EVENT_NAME, {}), (this.newUrl = n), (this.oldUrl = o));
      }
    };
  function X(t) {
    return `${Rt?.runtime?.id}:codex:${t}`;
  }
  var qn = typeof globalThis.navigation?.addEventListener == "function";
  function Xn(t) {
    let n,
      o = !1;
    return {
      run() {
        o ||
          ((o = !0),
          (n = new URL(location.href)),
          qn
            ? globalThis.navigation.addEventListener(
                "navigate",
                (e) => {
                  const r = new URL(e.destination.url);
                  r.href !== n.href &&
                    (window.dispatchEvent(new _t(r, n)), (n = r));
                },
                { signal: t.signal },
              )
            : t.setInterval(() => {
                const e = new URL(location.href);
                e.href !== n.href &&
                  (window.dispatchEvent(new _t(e, n)), (n = e));
              }, 1e3));
      },
    };
  }
  var Kn = class b {
    static SCRIPT_STARTED_MESSAGE_TYPE = X("wxt:content-script-started");
    id;
    abortController;
    locationWatcher = Xn(this);
    constructor(n, o) {
      ((this.contentScriptName = n),
        (this.options = o),
        (this.id = Math.random().toString(36).slice(2)),
        (this.abortController = new AbortController()),
        this.stopOldScripts(),
        this.listenForNewerScripts());
    }
    get signal() {
      return this.abortController.signal;
    }
    abort(n) {
      return this.abortController.abort(n);
    }
    get isInvalid() {
      return (
        Rt.runtime?.id == null && this.notifyInvalidated(),
        this.signal.aborted
      );
    }
    get isValid() {
      return !this.isInvalid;
    }
    onInvalidated(n) {
      return (
        this.signal.addEventListener("abort", n),
        () => this.signal.removeEventListener("abort", n)
      );
    }
    block() {
      return new Promise(() => {});
    }
    setInterval(n, o) {
      const e = setInterval(() => {
        this.isValid && n();
      }, o);
      return (this.onInvalidated(() => clearInterval(e)), e);
    }
    setTimeout(n, o) {
      const e = setTimeout(() => {
        this.isValid && n();
      }, o);
      return (this.onInvalidated(() => clearTimeout(e)), e);
    }
    requestAnimationFrame(n) {
      const o = requestAnimationFrame((...e) => {
        this.isValid && n(...e);
      });
      return (this.onInvalidated(() => cancelAnimationFrame(o)), o);
    }
    requestIdleCallback(n, o) {
      const e = requestIdleCallback((...r) => {
        this.signal.aborted || n(...r);
      }, o);
      return (this.onInvalidated(() => cancelIdleCallback(e)), e);
    }
    addEventListener(n, o, e, r) {
      (o === "wxt:locationchange" && this.isValid && this.locationWatcher.run(),
        n.addEventListener?.(o.startsWith("wxt:") ? X(o) : o, e, {
          ...r,
          signal: this.signal,
        }));
    }
    notifyInvalidated() {
      (this.abort("Content script context invalidated"),
        Hn.debug(
          `Content script "${this.contentScriptName}" context invalidated`,
        ));
    }
    stopOldScripts() {
      (document.dispatchEvent(
        new CustomEvent(b.SCRIPT_STARTED_MESSAGE_TYPE, {
          detail: {
            contentScriptName: this.contentScriptName,
            messageId: this.id,
          },
        }),
      ),
        window.postMessage(
          {
            type: b.SCRIPT_STARTED_MESSAGE_TYPE,
            contentScriptName: this.contentScriptName,
            messageId: this.id,
          },
          "*",
        ));
    }
    verifyScriptStartedEvent(n) {
      const o = n.detail?.contentScriptName === this.contentScriptName,
        e = n.detail?.messageId === this.id;
      return o && !e;
    }
    listenForNewerScripts() {
      const n = (o) => {
        !(o instanceof CustomEvent) ||
          !this.verifyScriptStartedEvent(o) ||
          this.notifyInvalidated();
      };
      (document.addEventListener(b.SCRIPT_STARTED_MESSAGE_TYPE, n),
        this.onInvalidated(() =>
          document.removeEventListener(b.SCRIPT_STARTED_MESSAGE_TYPE, n),
        ));
    }
  };
  function to() {}
  function $(t, ...n) {}
  var zn = {
      debug: (...t) => $(console.debug, ...t),
      log: (...t) => $(console.log, ...t),
      warn: (...t) => $(console.warn, ...t),
      error: (...t) => $(console.error, ...t),
    },
    jn = (async () => {
      try {
        const { main: t, ...n } = $n;
        return await t(new Kn("codex", n));
      } catch (t) {
        throw (
          zn.error('The content script "codex" crashed on startup!', t),
          t
        );
      }
    })();
  return jn;
})();

codex;
