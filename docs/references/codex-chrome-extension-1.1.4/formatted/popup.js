var St = (g, _) => () => (_ || g((_ = { exports: {} }).exports, _), _.exports);
(function () {
  const _ = document.createElement("link").relList;
  if (_ && _.supports && _.supports("modulepreload")) return;
  for (const m of document.querySelectorAll('link[rel="modulepreload"]')) G(m);
  new MutationObserver((m) => {
    for (const J of m)
      if (J.type === "childList")
        for (const ll of J.addedNodes)
          ll.tagName === "LINK" && ll.rel === "modulepreload" && G(ll);
  }).observe(document, { childList: !0, subtree: !0 });
  function j(m) {
    const J = {};
    return (
      m.integrity && (J.integrity = m.integrity),
      m.referrerPolicy && (J.referrerPolicy = m.referrerPolicy),
      m.crossOrigin === "use-credentials"
        ? (J.credentials = "include")
        : m.crossOrigin === "anonymous"
          ? (J.credentials = "omit")
          : (J.credentials = "same-origin"),
      J
    );
  }
  function G(m) {
    if (m.ep) return;
    m.ep = !0;
    const J = j(m);
    fetch(m.href, J);
  }
})();
var Em = St((g) => {
    var _ = Symbol.for("react.transitional.element"),
      j = Symbol.for("react.portal"),
      G = Symbol.for("react.fragment"),
      m = Symbol.for("react.strict_mode"),
      J = Symbol.for("react.profiler"),
      ll = Symbol.for("react.consumer"),
      hl = Symbol.for("react.context"),
      tl = Symbol.for("react.forward_ref"),
      N = Symbol.for("react.suspense"),
      A = Symbol.for("react.memo"),
      B = Symbol.for("react.lazy"),
      q = Symbol.for("react.activity"),
      gt = Symbol.iterator;
    function Rl(v) {
      return v === null || typeof v != "object"
        ? null
        : ((v = (gt && v[gt]) || v["@@iterator"]),
          typeof v == "function" ? v : null);
    }
    var Yl = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
      },
      xl = Object.assign,
      wt = {};
    function Kl(v, E, M) {
      ((this.props = v),
        (this.context = E),
        (this.refs = wt),
        (this.updater = M || Yl));
    }
    ((Kl.prototype.isReactComponent = {}),
      (Kl.prototype.setState = function (v, E) {
        if (typeof v != "object" && typeof v != "function" && v != null)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables.",
          );
        this.updater.enqueueSetState(this, v, E, "setState");
      }),
      (Kl.prototype.forceUpdate = function (v) {
        this.updater.enqueueForceUpdate(this, v, "forceUpdate");
      }));
    function Wt() {}
    Wt.prototype = Kl.prototype;
    function Ol(v, E, M) {
      ((this.props = v),
        (this.context = E),
        (this.refs = wt),
        (this.updater = M || Yl));
    }
    var bt = (Ol.prototype = new Wt());
    ((bt.constructor = Ol),
      xl(bt, Kl.prototype),
      (bt.isPureReactComponent = !0));
    var Jl = Array.isArray;
    function wl() {}
    var W = { H: null, A: null, T: null, S: null },
      jl = Object.prototype.hasOwnProperty;
    function _t(v, E, M) {
      var H = M.ref;
      return {
        $$typeof: _,
        type: v,
        key: E,
        ref: H !== void 0 ? H : null,
        props: M,
      };
    }
    function bu(v, E) {
      return _t(v.type, E, v.props);
    }
    function Wl(v) {
      return typeof v == "object" && v !== null && v.$$typeof === _;
    }
    function Ot(v) {
      var E = { "=": "=0", ":": "=2" };
      return (
        "$" +
        v.replace(/[=:]/g, function (M) {
          return E[M];
        })
      );
    }
    var Lu = /\/+/g;
    function zt(v, E) {
      return typeof v == "object" && v !== null && v.key != null
        ? Ot("" + v.key)
        : E.toString(36);
    }
    function U(v) {
      switch (v.status) {
        case "fulfilled":
          return v.value;
        case "rejected":
          throw v.reason;
        default:
          switch (
            (typeof v.status == "string"
              ? v.then(wl, wl)
              : ((v.status = "pending"),
                v.then(
                  function (E) {
                    v.status === "pending" &&
                      ((v.status = "fulfilled"), (v.value = E));
                  },
                  function (E) {
                    v.status === "pending" &&
                      ((v.status = "rejected"), (v.reason = E));
                  },
                )),
            v.status)
          ) {
            case "fulfilled":
              return v.value;
            case "rejected":
              throw v.reason;
          }
      }
      throw v;
    }
    function O(v, E, M, H, L) {
      var Z = typeof v;
      (Z === "undefined" || Z === "boolean") && (v = null);
      var P = !1;
      if (v === null) P = !0;
      else
        switch (Z) {
          case "bigint":
          case "string":
          case "number":
            P = !0;
            break;
          case "object":
            switch (v.$$typeof) {
              case _:
              case j:
                P = !0;
                break;
              case B:
                return ((P = v._init), O(P(v._payload), E, M, H, L));
            }
        }
      if (P)
        return (
          (L = L(v)),
          (P = H === "" ? "." + zt(v, 0) : H),
          Jl(L)
            ? ((M = ""),
              P != null && (M = P.replace(Lu, "$&/") + "/"),
              O(L, E, M, "", function (Oa) {
                return Oa;
              }))
            : L != null &&
              (Wl(L) &&
                (L = bu(
                  L,
                  M +
                    (L.key == null || (v && v.key === L.key)
                      ? ""
                      : ("" + L.key).replace(Lu, "$&/") + "/") +
                    P,
                )),
              E.push(L)),
          1
        );
      P = 0;
      var ql = H === "" ? "." : H + ":";
      if (Jl(v))
        for (var Sl = 0; Sl < v.length; Sl++)
          ((H = v[Sl]), (Z = ql + zt(H, Sl)), (P += O(H, E, M, Z, L)));
      else if (((Sl = Rl(v)), typeof Sl == "function"))
        for (v = Sl.call(v), Sl = 0; !(H = v.next()).done; )
          ((H = H.value), (Z = ql + zt(H, Sl++)), (P += O(H, E, M, Z, L)));
      else if (Z === "object") {
        if (typeof v.then == "function") return O(U(v), E, M, H, L);
        throw (
          (E = String(v)),
          Error(
            "Objects are not valid as a React child (found: " +
              (E === "[object Object]"
                ? "object with keys {" + Object.keys(v).join(", ") + "}"
                : E) +
              "). If you meant to render a collection of children, use an array instead.",
          )
        );
      }
      return P;
    }
    function D(v, E, M) {
      if (v == null) return v;
      var H = [],
        L = 0;
      return (
        O(v, H, "", "", function (Z) {
          return E.call(M, Z, L++);
        }),
        H
      );
    }
    function k(v) {
      if (v._status === -1) {
        var E = v._result;
        ((E = E()),
          E.then(
            function (M) {
              (v._status === 0 || v._status === -1) &&
                ((v._status = 1), (v._result = M));
            },
            function (M) {
              (v._status === 0 || v._status === -1) &&
                ((v._status = 2), (v._result = M));
            },
          ),
          v._status === -1 && ((v._status = 0), (v._result = E)));
      }
      if (v._status === 1) return v._result.default;
      throw v._result;
    }
    var yl =
        typeof reportError == "function"
          ? reportError
          : function (v) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var E = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof v == "object" &&
                    v !== null &&
                    typeof v.message == "string"
                      ? String(v.message)
                      : String(v),
                  error: v,
                });
                if (!window.dispatchEvent(E)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", v);
                return;
              }
              console.error(v);
            },
      $l = {
        map: D,
        forEach: function (v, E, M) {
          D(
            v,
            function () {
              E.apply(this, arguments);
            },
            M,
          );
        },
        count: function (v) {
          var E = 0;
          return (
            D(v, function () {
              E++;
            }),
            E
          );
        },
        toArray: function (v) {
          return (
            D(v, function (E) {
              return E;
            }) || []
          );
        },
        only: function (v) {
          if (!Wl(v))
            throw Error(
              "React.Children.only expected to receive a single React element child.",
            );
          return v;
        },
      };
    ((g.Activity = q),
      (g.Children = $l),
      (g.Component = Kl),
      (g.Fragment = G),
      (g.Profiler = J),
      (g.PureComponent = Ol),
      (g.StrictMode = m),
      (g.Suspense = N),
      (g.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = W),
      (g.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function (v) {
          return W.H.useMemoCache(v);
        },
      }),
      (g.cache = function (v) {
        return function () {
          return v.apply(null, arguments);
        };
      }),
      (g.cacheSignal = function () {
        return null;
      }),
      (g.cloneElement = function (v, E, M) {
        if (v == null)
          throw Error(
            "The argument must be a React element, but you passed " + v + ".",
          );
        var H = xl({}, v.props),
          L = v.key;
        if (E != null)
          for (Z in (E.key !== void 0 && (L = "" + E.key), E))
            !jl.call(E, Z) ||
              Z === "key" ||
              Z === "__self" ||
              Z === "__source" ||
              (Z === "ref" && E.ref === void 0) ||
              (H[Z] = E[Z]);
        var Z = arguments.length - 2;
        if (Z === 1) H.children = M;
        else if (1 < Z) {
          for (var P = Array(Z), ql = 0; ql < Z; ql++)
            P[ql] = arguments[ql + 2];
          H.children = P;
        }
        return _t(v.type, L, H);
      }),
      (g.createContext = function (v) {
        return (
          (v = {
            $$typeof: hl,
            _currentValue: v,
            _currentValue2: v,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
          }),
          (v.Provider = v),
          (v.Consumer = { $$typeof: ll, _context: v }),
          v
        );
      }),
      (g.createElement = function (v, E, M) {
        var H,
          L = {},
          Z = null;
        if (E != null)
          for (H in (E.key !== void 0 && (Z = "" + E.key), E))
            jl.call(E, H) &&
              H !== "key" &&
              H !== "__self" &&
              H !== "__source" &&
              (L[H] = E[H]);
        var P = arguments.length - 2;
        if (P === 1) L.children = M;
        else if (1 < P) {
          for (var ql = Array(P), Sl = 0; Sl < P; Sl++)
            ql[Sl] = arguments[Sl + 2];
          L.children = ql;
        }
        if (v && v.defaultProps)
          for (H in ((P = v.defaultProps), P)) L[H] === void 0 && (L[H] = P[H]);
        return _t(v, Z, L);
      }),
      (g.createRef = function () {
        return { current: null };
      }),
      (g.forwardRef = function (v) {
        return { $$typeof: tl, render: v };
      }),
      (g.isValidElement = Wl),
      (g.lazy = function (v) {
        return { $$typeof: B, _payload: { _status: -1, _result: v }, _init: k };
      }),
      (g.memo = function (v, E) {
        return { $$typeof: A, type: v, compare: E === void 0 ? null : E };
      }),
      (g.startTransition = function (v) {
        var E = W.T,
          M = {};
        W.T = M;
        try {
          var H = v(),
            L = W.S;
          (L !== null && L(M, H),
            typeof H == "object" &&
              H !== null &&
              typeof H.then == "function" &&
              H.then(wl, yl));
        } catch (Z) {
          yl(Z);
        } finally {
          (E !== null && M.types !== null && (E.types = M.types), (W.T = E));
        }
      }),
      (g.unstable_useCacheRefresh = function () {
        return W.H.useCacheRefresh();
      }),
      (g.use = function (v) {
        return W.H.use(v);
      }),
      (g.useActionState = function (v, E, M) {
        return W.H.useActionState(v, E, M);
      }),
      (g.useCallback = function (v, E) {
        return W.H.useCallback(v, E);
      }),
      (g.useContext = function (v) {
        return W.H.useContext(v);
      }),
      (g.useDebugValue = function () {}),
      (g.useDeferredValue = function (v, E) {
        return W.H.useDeferredValue(v, E);
      }),
      (g.useEffect = function (v, E) {
        return W.H.useEffect(v, E);
      }),
      (g.useEffectEvent = function (v) {
        return W.H.useEffectEvent(v);
      }),
      (g.useId = function () {
        return W.H.useId();
      }),
      (g.useImperativeHandle = function (v, E, M) {
        return W.H.useImperativeHandle(v, E, M);
      }),
      (g.useInsertionEffect = function (v, E) {
        return W.H.useInsertionEffect(v, E);
      }),
      (g.useLayoutEffect = function (v, E) {
        return W.H.useLayoutEffect(v, E);
      }),
      (g.useMemo = function (v, E) {
        return W.H.useMemo(v, E);
      }),
      (g.useOptimistic = function (v, E) {
        return W.H.useOptimistic(v, E);
      }),
      (g.useReducer = function (v, E, M) {
        return W.H.useReducer(v, E, M);
      }),
      (g.useRef = function (v) {
        return W.H.useRef(v);
      }),
      (g.useState = function (v) {
        return W.H.useState(v);
      }),
      (g.useSyncExternalStore = function (v, E, M) {
        return W.H.useSyncExternalStore(v, E, M);
      }),
      (g.useTransition = function () {
        return W.H.useTransition();
      }),
      (g.version = "19.2.4"));
  }),
  Ge = St((g, _) => {
    _.exports = Em();
  }),
  Am = St((g) => {
    var _ =
      Ge().__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    g.c = function (j) {
      return _.H.useMemoCache(j);
    };
  }),
  _m = St((g, _) => {
    _.exports = Am();
  }),
  uf = _m(),
  bn = Ge(),
  Om = (0, bn.createContext)(null),
  Mm = St((g) => {
    var _ = Symbol.for("react.transitional.element"),
      j = Symbol.for("react.fragment");
    function G(m, J, ll) {
      var hl = null;
      if (
        (ll !== void 0 && (hl = "" + ll),
        J.key !== void 0 && (hl = "" + J.key),
        "key" in J)
      ) {
        ll = {};
        for (var tl in J) tl !== "key" && (ll[tl] = J[tl]);
      } else ll = J;
      return (
        (J = ll.ref),
        {
          $$typeof: _,
          type: m,
          key: hl,
          ref: J !== void 0 ? J : null,
          props: ll,
        }
      );
    }
    ((g.jsx = G), (g.jsxs = G));
  }),
  Dm = St((g, _) => {
    _.exports = Mm();
  }),
  fl = Dm();
function Um(g) {
  const _ = (0, uf.c)(8),
    {
      children: j,
      linkComponent: G,
      allowedWidgetTypes: m,
      radixPortalContainer: J,
      hydrationSafe: ll,
    } = g,
    hl = G === void 0 ? "a" : G,
    tl = m === void 0 ? "GA" : m,
    N = ll === void 0 ? !1 : ll;
  let A;
  _[0] !== tl || _[1] !== N || _[2] !== hl || _[3] !== J
    ? ((A = {
        linkComponent: hl,
        allowedWidgetTypes: tl,
        radixPortalContainer: J,
        hydrationSafe: N,
      }),
      (_[0] = tl),
      (_[1] = N),
      (_[2] = hl),
      (_[3] = J),
      (_[4] = A))
    : (A = _[4]);
  let B;
  return (
    _[5] !== j || _[6] !== A
      ? ((B = (0, fl.jsx)(Om.Provider, { value: A, children: j })),
        (_[5] = j),
        (_[6] = A),
        (_[7] = B))
      : (B = _[7]),
    B
  );
}
var Nm = St((g) => {
    function _(U, O) {
      var D = U.length;
      U.push(O);
      l: for (; 0 < D; ) {
        var k = (D - 1) >>> 1,
          yl = U[k];
        if (0 < m(yl, O)) ((U[k] = O), (U[D] = yl), (D = k));
        else break l;
      }
    }
    function j(U) {
      return U.length === 0 ? null : U[0];
    }
    function G(U) {
      if (U.length === 0) return null;
      var O = U[0],
        D = U.pop();
      if (D !== O) {
        U[0] = D;
        l: for (var k = 0, yl = U.length, $l = yl >>> 1; k < $l; ) {
          var v = 2 * (k + 1) - 1,
            E = U[v],
            M = v + 1,
            H = U[M];
          if (0 > m(E, D))
            M < yl && 0 > m(H, E)
              ? ((U[k] = H), (U[M] = D), (k = M))
              : ((U[k] = E), (U[v] = D), (k = v));
          else if (M < yl && 0 > m(H, D)) ((U[k] = H), (U[M] = D), (k = M));
          else break l;
        }
      }
      return O;
    }
    function m(U, O) {
      var D = U.sortIndex - O.sortIndex;
      return D !== 0 ? D : U.id - O.id;
    }
    if (
      ((g.unstable_now = void 0),
      typeof performance == "object" && typeof performance.now == "function")
    ) {
      var J = performance;
      g.unstable_now = function () {
        return J.now();
      };
    } else {
      var ll = Date,
        hl = ll.now();
      g.unstable_now = function () {
        return ll.now() - hl;
      };
    }
    var tl = [],
      N = [],
      A = 1,
      B = null,
      q = 3,
      gt = !1,
      Rl = !1,
      Yl = !1,
      xl = !1,
      wt = typeof setTimeout == "function" ? setTimeout : null,
      Kl = typeof clearTimeout == "function" ? clearTimeout : null,
      Wt = typeof setImmediate < "u" ? setImmediate : null;
    function Ol(U) {
      for (var O = j(N); O !== null; ) {
        if (O.callback === null) G(N);
        else if (O.startTime <= U)
          (G(N), (O.sortIndex = O.expirationTime), _(tl, O));
        else break;
        O = j(N);
      }
    }
    function bt(U) {
      if (((Yl = !1), Ol(U), !Rl))
        if (j(tl) !== null) ((Rl = !0), Jl || ((Jl = !0), Wl()));
        else {
          var O = j(N);
          O !== null && zt(bt, O.startTime - U);
        }
    }
    var Jl = !1,
      wl = -1,
      W = 5,
      jl = -1;
    function _t() {
      return xl ? !0 : !(g.unstable_now() - jl < W);
    }
    function bu() {
      if (((xl = !1), Jl)) {
        var U = g.unstable_now();
        jl = U;
        var O = !0;
        try {
          l: {
            ((Rl = !1), Yl && ((Yl = !1), Kl(wl), (wl = -1)), (gt = !0));
            var D = q;
            try {
              t: {
                for (
                  Ol(U), B = j(tl);
                  B !== null && !(B.expirationTime > U && _t());
                ) {
                  var k = B.callback;
                  if (typeof k == "function") {
                    ((B.callback = null), (q = B.priorityLevel));
                    var yl = k(B.expirationTime <= U);
                    if (((U = g.unstable_now()), typeof yl == "function")) {
                      ((B.callback = yl), Ol(U), (O = !0));
                      break t;
                    }
                    (B === j(tl) && G(tl), Ol(U));
                  } else G(tl);
                  B = j(tl);
                }
                if (B !== null) O = !0;
                else {
                  var $l = j(N);
                  ($l !== null && zt(bt, $l.startTime - U), (O = !1));
                }
              }
              break l;
            } finally {
              ((B = null), (q = D), (gt = !1));
            }
            O = void 0;
          }
        } finally {
          O ? Wl() : (Jl = !1);
        }
      }
    }
    var Wl;
    if (typeof Wt == "function")
      Wl = function () {
        Wt(bu);
      };
    else if (typeof MessageChannel < "u") {
      var Ot = new MessageChannel(),
        Lu = Ot.port2;
      ((Ot.port1.onmessage = bu),
        (Wl = function () {
          Lu.postMessage(null);
        }));
    } else
      Wl = function () {
        wt(bu, 0);
      };
    function zt(U, O) {
      wl = wt(function () {
        U(g.unstable_now());
      }, O);
    }
    ((g.unstable_IdlePriority = 5),
      (g.unstable_ImmediatePriority = 1),
      (g.unstable_LowPriority = 4),
      (g.unstable_NormalPriority = 3),
      (g.unstable_Profiling = null),
      (g.unstable_UserBlockingPriority = 2),
      (g.unstable_cancelCallback = function (U) {
        U.callback = null;
      }),
      (g.unstable_forceFrameRate = function (U) {
        0 > U || 125 < U
          ? console.error(
              "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
            )
          : (W = 0 < U ? Math.floor(1e3 / U) : 5);
      }),
      (g.unstable_getCurrentPriorityLevel = function () {
        return q;
      }),
      (g.unstable_next = function (U) {
        switch (q) {
          case 1:
          case 2:
          case 3:
            var O = 3;
            break;
          default:
            O = q;
        }
        var D = q;
        q = O;
        try {
          return U();
        } finally {
          q = D;
        }
      }),
      (g.unstable_requestPaint = function () {
        xl = !0;
      }),
      (g.unstable_runWithPriority = function (U, O) {
        switch (U) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            U = 3;
        }
        var D = q;
        q = U;
        try {
          return O();
        } finally {
          q = D;
        }
      }),
      (g.unstable_scheduleCallback = function (U, O, D) {
        var k = g.unstable_now();
        switch (
          (typeof D == "object" && D !== null
            ? ((D = D.delay), (D = typeof D == "number" && 0 < D ? k + D : k))
            : (D = k),
          U)
        ) {
          case 1:
            var yl = -1;
            break;
          case 2:
            yl = 250;
            break;
          case 5:
            yl = 1073741823;
            break;
          case 4:
            yl = 1e4;
            break;
          default:
            yl = 5e3;
        }
        return (
          (yl = D + yl),
          (U = {
            id: A++,
            callback: O,
            priorityLevel: U,
            startTime: D,
            expirationTime: yl,
            sortIndex: -1,
          }),
          D > k
            ? ((U.sortIndex = D),
              _(N, U),
              j(tl) === null &&
                U === j(N) &&
                (Yl ? (Kl(wl), (wl = -1)) : (Yl = !0), zt(bt, D - k)))
            : ((U.sortIndex = yl),
              _(tl, U),
              Rl || gt || ((Rl = !0), Jl || ((Jl = !0), Wl()))),
          U
        );
      }),
      (g.unstable_shouldYield = _t),
      (g.unstable_wrapCallback = function (U) {
        var O = q;
        return function () {
          var D = q;
          q = O;
          try {
            return U.apply(this, arguments);
          } finally {
            q = D;
          }
        };
      }));
  }),
  Cm = St((g, _) => {
    _.exports = Nm();
  }),
  pm = St((g) => {
    var _ = Ge();
    function j(N) {
      var A = "https://react.dev/errors/" + N;
      if (1 < arguments.length) {
        A += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var B = 2; B < arguments.length; B++)
          A += "&args[]=" + encodeURIComponent(arguments[B]);
      }
      return (
        "Minified React error #" +
        N +
        "; visit " +
        A +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function G() {}
    var m = {
        d: {
          f: G,
          r: function () {
            throw Error(j(522));
          },
          D: G,
          C: G,
          L: G,
          m: G,
          X: G,
          S: G,
          M: G,
        },
        p: 0,
        findDOMNode: null,
      },
      J = Symbol.for("react.portal");
    function ll(N, A, B) {
      var q =
        3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return {
        $$typeof: J,
        key: q == null ? null : "" + q,
        children: N,
        containerInfo: A,
        implementation: B,
      };
    }
    var hl = _.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function tl(N, A) {
      if (N === "font") return "";
      if (typeof A == "string") return A === "use-credentials" ? A : "";
    }
    ((g.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = m),
      (g.createPortal = function (N, A) {
        var B =
          2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!A || (A.nodeType !== 1 && A.nodeType !== 9 && A.nodeType !== 11))
          throw Error(j(299));
        return ll(N, A, null, B);
      }),
      (g.flushSync = function (N) {
        var A = hl.T,
          B = m.p;
        try {
          if (((hl.T = null), (m.p = 2), N)) return N();
        } finally {
          ((hl.T = A), (m.p = B), m.d.f());
        }
      }),
      (g.preconnect = function (N, A) {
        typeof N == "string" &&
          (A
            ? ((A = A.crossOrigin),
              (A =
                typeof A == "string"
                  ? A === "use-credentials"
                    ? A
                    : ""
                  : void 0))
            : (A = null),
          m.d.C(N, A));
      }),
      (g.prefetchDNS = function (N) {
        typeof N == "string" && m.d.D(N);
      }),
      (g.preinit = function (N, A) {
        if (typeof N == "string" && A && typeof A.as == "string") {
          var B = A.as,
            q = tl(B, A.crossOrigin),
            gt = typeof A.integrity == "string" ? A.integrity : void 0,
            Rl = typeof A.fetchPriority == "string" ? A.fetchPriority : void 0;
          B === "style"
            ? m.d.S(
                N,
                typeof A.precedence == "string" ? A.precedence : void 0,
                { crossOrigin: q, integrity: gt, fetchPriority: Rl },
              )
            : B === "script" &&
              m.d.X(N, {
                crossOrigin: q,
                integrity: gt,
                fetchPriority: Rl,
                nonce: typeof A.nonce == "string" ? A.nonce : void 0,
              });
        }
      }),
      (g.preinitModule = function (N, A) {
        if (typeof N == "string")
          if (typeof A == "object" && A !== null) {
            if (A.as == null || A.as === "script") {
              var B = tl(A.as, A.crossOrigin);
              m.d.M(N, {
                crossOrigin: B,
                integrity:
                  typeof A.integrity == "string" ? A.integrity : void 0,
                nonce: typeof A.nonce == "string" ? A.nonce : void 0,
              });
            }
          } else A ?? m.d.M(N);
      }),
      (g.preload = function (N, A) {
        if (
          typeof N == "string" &&
          typeof A == "object" &&
          A !== null &&
          typeof A.as == "string"
        ) {
          var B = A.as,
            q = tl(B, A.crossOrigin);
          m.d.L(N, B, {
            crossOrigin: q,
            integrity: typeof A.integrity == "string" ? A.integrity : void 0,
            nonce: typeof A.nonce == "string" ? A.nonce : void 0,
            type: typeof A.type == "string" ? A.type : void 0,
            fetchPriority:
              typeof A.fetchPriority == "string" ? A.fetchPriority : void 0,
            referrerPolicy:
              typeof A.referrerPolicy == "string" ? A.referrerPolicy : void 0,
            imageSrcSet:
              typeof A.imageSrcSet == "string" ? A.imageSrcSet : void 0,
            imageSizes: typeof A.imageSizes == "string" ? A.imageSizes : void 0,
            media: typeof A.media == "string" ? A.media : void 0,
          });
        }
      }),
      (g.preloadModule = function (N, A) {
        if (typeof N == "string")
          if (A) {
            var B = tl(A.as, A.crossOrigin);
            m.d.m(N, {
              as: typeof A.as == "string" && A.as !== "script" ? A.as : void 0,
              crossOrigin: B,
              integrity: typeof A.integrity == "string" ? A.integrity : void 0,
            });
          } else m.d.m(N);
      }),
      (g.requestFormReset = function (N) {
        m.d.r(N);
      }),
      (g.unstable_batchedUpdates = function (N, A) {
        return N(A);
      }),
      (g.useFormState = function (N, A, B) {
        return hl.H.useFormState(N, A, B);
      }),
      (g.useFormStatus = function () {
        return hl.H.useHostTransitionStatus();
      }),
      (g.version = "19.2.4"));
  }),
  Hm = St((g, _) => {
    function j() {
      if (
        !(
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
        )
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(j);
        } catch (G) {
          console.error(G);
        }
    }
    (j(), (_.exports = pm()));
  }),
  Rm = St((g) => {
    var _ = Cm(),
      j = Ge(),
      G = Hm();
    function m(l) {
      var t = "https://react.dev/errors/" + l;
      if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var u = 2; u < arguments.length; u++)
          t += "&args[]=" + encodeURIComponent(arguments[u]);
      }
      return (
        "Minified React error #" +
        l +
        "; visit " +
        t +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    function J(l) {
      return !(
        !l ||
        (l.nodeType !== 1 && l.nodeType !== 9 && l.nodeType !== 11)
      );
    }
    function ll(l) {
      var t = l,
        u = l;
      if (l.alternate) for (; t.return; ) t = t.return;
      else {
        l = t;
        do ((t = l), (t.flags & 4098) !== 0 && (u = t.return), (l = t.return));
        while (l);
      }
      return t.tag === 3 ? u : null;
    }
    function hl(l) {
      if (l.tag === 13) {
        var t = l.memoizedState;
        if (
          (t === null &&
            ((l = l.alternate), l !== null && (t = l.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function tl(l) {
      if (l.tag === 31) {
        var t = l.memoizedState;
        if (
          (t === null &&
            ((l = l.alternate), l !== null && (t = l.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function N(l) {
      if (ll(l) !== l) throw Error(m(188));
    }
    function A(l) {
      var t = l.alternate;
      if (!t) {
        if (((t = ll(l)), t === null)) throw Error(m(188));
        return t !== l ? null : l;
      }
      for (var u = l, a = t; ; ) {
        var n = u.return;
        if (n === null) break;
        var e = n.alternate;
        if (e === null) {
          if (((a = n.return), a !== null)) {
            u = a;
            continue;
          }
          break;
        }
        if (n.child === e.child) {
          for (e = n.child; e; ) {
            if (e === u) return (N(n), l);
            if (e === a) return (N(n), t);
            e = e.sibling;
          }
          throw Error(m(188));
        }
        if (u.return !== a.return) ((u = n), (a = e));
        else {
          for (var c = !1, i = n.child; i; ) {
            if (i === u) {
              ((c = !0), (u = n), (a = e));
              break;
            }
            if (i === a) {
              ((c = !0), (a = n), (u = e));
              break;
            }
            i = i.sibling;
          }
          if (!c) {
            for (i = e.child; i; ) {
              if (i === u) {
                ((c = !0), (u = e), (a = n));
                break;
              }
              if (i === a) {
                ((c = !0), (a = e), (u = n));
                break;
              }
              i = i.sibling;
            }
            if (!c) throw Error(m(189));
          }
        }
        if (u.alternate !== a) throw Error(m(190));
      }
      if (u.tag !== 3) throw Error(m(188));
      return u.stateNode.current === u ? l : t;
    }
    function B(l) {
      var t = l.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return l;
      for (l = l.child; l !== null; ) {
        if (((t = B(l)), t !== null)) return t;
        l = l.sibling;
      }
      return null;
    }
    var q = Object.assign,
      gt = Symbol.for("react.element"),
      Rl = Symbol.for("react.transitional.element"),
      Yl = Symbol.for("react.portal"),
      xl = Symbol.for("react.fragment"),
      wt = Symbol.for("react.strict_mode"),
      Kl = Symbol.for("react.profiler"),
      Wt = Symbol.for("react.consumer"),
      Ol = Symbol.for("react.context"),
      bt = Symbol.for("react.forward_ref"),
      Jl = Symbol.for("react.suspense"),
      wl = Symbol.for("react.suspense_list"),
      W = Symbol.for("react.memo"),
      jl = Symbol.for("react.lazy"),
      _t = Symbol.for("react.activity"),
      bu = Symbol.for("react.memo_cache_sentinel"),
      Wl = Symbol.iterator;
    function Ot(l) {
      return l === null || typeof l != "object"
        ? null
        : ((l = (Wl && l[Wl]) || l["@@iterator"]),
          typeof l == "function" ? l : null);
    }
    var Lu = Symbol.for("react.client.reference");
    function zt(l) {
      if (l == null) return null;
      if (typeof l == "function")
        return l.$$typeof === Lu ? null : l.displayName || l.name || null;
      if (typeof l == "string") return l;
      switch (l) {
        case xl:
          return "Fragment";
        case Kl:
          return "Profiler";
        case wt:
          return "StrictMode";
        case Jl:
          return "Suspense";
        case wl:
          return "SuspenseList";
        case _t:
          return "Activity";
      }
      if (typeof l == "object")
        switch (l.$$typeof) {
          case Yl:
            return "Portal";
          case Ol:
            return l.displayName || "Context";
          case Wt:
            return (l._context.displayName || "Context") + ".Consumer";
          case bt:
            var t = l.render;
            return (
              (l = l.displayName),
              l ||
                ((l = t.displayName || t.name || ""),
                (l = l !== "" ? "ForwardRef(" + l + ")" : "ForwardRef")),
              l
            );
          case W:
            return (
              (t = l.displayName || null),
              t !== null ? t : zt(l.type) || "Memo"
            );
          case jl:
            ((t = l._payload), (l = l._init));
            try {
              return zt(l(t));
            } catch {}
        }
      return null;
    }
    var U = Array.isArray,
      O = j.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      D = G.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      k = { pending: !1, data: null, method: null, action: null },
      yl = [],
      $l = -1;
    function v(l) {
      return { current: l };
    }
    function E(l) {
      0 > $l || ((l.current = yl[$l]), (yl[$l] = null), $l--);
    }
    function M(l, t) {
      ($l++, (yl[$l] = l.current), (l.current = t));
    }
    var H = v(null),
      L = v(null),
      Z = v(null),
      P = v(null);
    function ql(l, t) {
      switch ((M(Z, t), M(L, l), M(H, null), t.nodeType)) {
        case 9:
        case 11:
          l = (l = t.documentElement) && (l = l.namespaceURI) ? Uy(l) : 0;
          break;
        default:
          if (((l = t.tagName), (t = t.namespaceURI)))
            ((t = Uy(t)), (l = Ny(t, l)));
          else
            switch (l) {
              case "svg":
                l = 1;
                break;
              case "math":
                l = 2;
                break;
              default:
                l = 0;
            }
      }
      (E(H), M(H, l));
    }
    function Sl() {
      (E(H), E(L), E(Z));
    }
    function Oa(l) {
      l.memoizedState !== null && M(P, l);
      var t = H.current,
        u = Ny(t, l.type);
      t !== u && (M(L, l), M(H, u));
    }
    function zn(l) {
      (L.current === l && (E(H), E(L)),
        P.current === l && (E(P), (sn._currentValue = k)));
    }
    var Xe, af;
    function zu(l) {
      if (Xe === void 0)
        try {
          throw Error();
        } catch (u) {
          var t = u.stack.trim().match(/\n( *(at )?)/);
          ((Xe = (t && t[1]) || ""),
            (af =
              -1 <
              u.stack.indexOf(`
    at`)
                ? " (<anonymous>)"
                : -1 < u.stack.indexOf("@")
                  ? "@unknown:0:0"
                  : ""));
        }
      return (
        `
` +
        Xe +
        l +
        af
      );
    }
    var Qe = !1;
    function Le(l, t) {
      if (!l || Qe) return "";
      Qe = !0;
      var u = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var a = {
          DetermineComponentFrameRoot: function () {
            try {
              if (t) {
                var T = function () {
                  throw Error();
                };
                if (
                  (Object.defineProperty(T.prototype, "props", {
                    set: function () {
                      throw Error();
                    },
                  }),
                  typeof Reflect == "object" && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(T, []);
                  } catch (S) {
                    var o = S;
                  }
                  Reflect.construct(l, [], T);
                } else {
                  try {
                    T.call();
                  } catch (S) {
                    o = S;
                  }
                  l.call(T.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (S) {
                  o = S;
                }
                (T = l()) &&
                  typeof T.catch == "function" &&
                  T.catch(function () {});
              }
            } catch (S) {
              if (S && o && typeof S.stack == "string")
                return [S.stack, o.stack];
            }
            return [null, null];
          },
        };
        a.DetermineComponentFrameRoot.displayName =
          "DetermineComponentFrameRoot";
        var n = Object.getOwnPropertyDescriptor(
          a.DetermineComponentFrameRoot,
          "name",
        );
        n &&
          n.configurable &&
          Object.defineProperty(a.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot",
          });
        var e = a.DetermineComponentFrameRoot(),
          c = e[0],
          i = e[1];
        if (c && i) {
          var f = c.split(`
`),
            s = i.split(`
`);
          for (
            n = a = 0;
            a < f.length && !f[a].includes("DetermineComponentFrameRoot");
          )
            a++;
          for (
            ;
            n < s.length && !s[n].includes("DetermineComponentFrameRoot");
          )
            n++;
          if (a === f.length || n === s.length)
            for (
              a = f.length - 1, n = s.length - 1;
              1 <= a && 0 <= n && f[a] !== s[n];
            )
              n--;
          for (; 1 <= a && 0 <= n; a--, n--)
            if (f[a] !== s[n]) {
              if (a !== 1 || n !== 1)
                do
                  if ((a--, n--, 0 > n || f[a] !== s[n])) {
                    var b =
                      `
` + f[a].replace(" at new ", " at ");
                    return (
                      l.displayName &&
                        b.includes("<anonymous>") &&
                        (b = b.replace("<anonymous>", l.displayName)),
                      b
                    );
                  }
                while (1 <= a && 0 <= n);
              break;
            }
        }
      } finally {
        ((Qe = !1), (Error.prepareStackTrace = u));
      }
      return (u = l ? l.displayName || l.name : "") ? zu(u) : "";
    }
    function ev(l, t) {
      switch (l.tag) {
        case 26:
        case 27:
        case 5:
          return zu(l.type);
        case 16:
          return zu("Lazy");
        case 13:
          return l.child !== t && t !== null
            ? zu("Suspense Fallback")
            : zu("Suspense");
        case 19:
          return zu("SuspenseList");
        case 0:
        case 15:
          return Le(l.type, !1);
        case 11:
          return Le(l.type.render, !1);
        case 1:
          return Le(l.type, !0);
        case 31:
          return zu("Activity");
        default:
          return "";
      }
    }
    function nf(l) {
      try {
        var t = "",
          u = null;
        do ((t += ev(l, u)), (u = l), (l = l.return));
        while (l);
        return t;
      } catch (a) {
        return (
          `
Error generating stack: ` +
          a.message +
          `
` +
          a.stack
        );
      }
    }
    var Ze = Object.prototype.hasOwnProperty,
      re = _.unstable_scheduleCallback,
      Ve = _.unstable_cancelCallback,
      cv = _.unstable_shouldYield,
      iv = _.unstable_requestPaint,
      Fl = _.unstable_now,
      fv = _.unstable_getCurrentPriorityLevel,
      ef = _.unstable_ImmediatePriority,
      cf = _.unstable_UserBlockingPriority,
      Tn = _.unstable_NormalPriority,
      yv = _.unstable_LowPriority,
      ff = _.unstable_IdlePriority,
      vv = _.log,
      dv = _.unstable_setDisableYieldValue,
      Ma = null,
      kl = null;
    function $t(l) {
      if (
        (typeof vv == "function" && dv(l),
        kl && typeof kl.setStrictMode == "function")
      )
        try {
          kl.setStrictMode(Ma, l);
        } catch {}
    }
    var Il = Math.clz32 ? Math.clz32 : sv,
      mv = Math.log,
      hv = Math.LN2;
    function sv(l) {
      return ((l >>>= 0), l === 0 ? 32 : (31 - ((mv(l) / hv) | 0)) | 0);
    }
    var En = 256,
      An = 262144,
      _n = 4194304;
    function Tu(l) {
      var t = l & 42;
      if (t !== 0) return t;
      switch (l & -l) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return l & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return l & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return l & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return l;
      }
    }
    function On(l, t, u) {
      var a = l.pendingLanes;
      if (a === 0) return 0;
      var n = 0,
        e = l.suspendedLanes,
        c = l.pingedLanes;
      l = l.warmLanes;
      var i = a & 134217727;
      return (
        i !== 0
          ? ((a = i & ~e),
            a !== 0
              ? (n = Tu(a))
              : ((c &= i),
                c !== 0
                  ? (n = Tu(c))
                  : u || ((u = i & ~l), u !== 0 && (n = Tu(u)))))
          : ((i = a & ~e),
            i !== 0
              ? (n = Tu(i))
              : c !== 0
                ? (n = Tu(c))
                : u || ((u = a & ~l), u !== 0 && (n = Tu(u)))),
        n === 0
          ? 0
          : t !== 0 &&
              t !== n &&
              (t & e) === 0 &&
              ((e = n & -n),
              (u = t & -t),
              e >= u || (e === 32 && (u & 4194048) !== 0))
            ? t
            : n
      );
    }
    function Da(l, t) {
      return (l.pendingLanes & ~(l.suspendedLanes & ~l.pingedLanes) & t) === 0;
    }
    function ov(l, t) {
      switch (l) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function yf() {
      var l = _n;
      return ((_n <<= 1), (_n & 62914560) === 0 && (_n = 4194304), l);
    }
    function xe(l) {
      for (var t = [], u = 0; 31 > u; u++) t.push(l);
      return t;
    }
    function Mn(l, t) {
      ((l.pendingLanes |= t),
        t !== 268435456 &&
          ((l.suspendedLanes = 0), (l.pingedLanes = 0), (l.warmLanes = 0)));
    }
    function Sv(l, t, u, a, n, e) {
      var c = l.pendingLanes;
      ((l.pendingLanes = u),
        (l.suspendedLanes = 0),
        (l.pingedLanes = 0),
        (l.warmLanes = 0),
        (l.expiredLanes &= u),
        (l.entangledLanes &= u),
        (l.errorRecoveryDisabledLanes &= u),
        (l.shellSuspendCounter = 0));
      var i = l.entanglements,
        f = l.expirationTimes,
        s = l.hiddenUpdates;
      for (u = c & ~u; 0 < u; ) {
        var b = 31 - Il(u),
          T = 1 << b;
        ((i[b] = 0), (f[b] = -1));
        var o = s[b];
        if (o !== null)
          for (s[b] = null, b = 0; b < o.length; b++) {
            var S = o[b];
            S !== null && (S.lane &= -536870913);
          }
        u &= ~T;
      }
      (a !== 0 && vf(l, a, 0),
        e !== 0 &&
          n === 0 &&
          l.tag !== 0 &&
          (l.suspendedLanes |= e & ~(c & ~t)));
    }
    function vf(l, t, u) {
      ((l.pendingLanes |= t), (l.suspendedLanes &= ~t));
      var a = 31 - Il(t);
      ((l.entangledLanes |= t),
        (l.entanglements[a] = l.entanglements[a] | 1073741824 | (u & 261930)));
    }
    function df(l, t) {
      var u = (l.entangledLanes |= t);
      for (l = l.entanglements; u; ) {
        var a = 31 - Il(u),
          n = 1 << a;
        ((n & t) | (l[a] & t) && (l[a] |= t), (u &= ~n));
      }
    }
    function mf(l, t) {
      var u = t & -t;
      return (
        (u = (u & 42) !== 0 ? 1 : hf(u)),
        (u & (l.suspendedLanes | t)) !== 0 ? 0 : u
      );
    }
    function hf(l) {
      switch (l) {
        case 2:
          l = 1;
          break;
        case 8:
          l = 4;
          break;
        case 32:
          l = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          l = 128;
          break;
        case 268435456:
          l = 134217728;
          break;
        default:
          l = 0;
      }
      return l;
    }
    function Ke(l) {
      return (
        (l &= -l),
        2 < l ? (8 < l ? ((l & 134217727) !== 0 ? 32 : 268435456) : 8) : 2
      );
    }
    function sf() {
      var l = D.p;
      return l !== 0 ? l : ((l = window.event), l === void 0 ? 32 : $y(l.type));
    }
    function of(l, t) {
      var u = D.p;
      try {
        return ((D.p = l), t());
      } finally {
        D.p = u;
      }
    }
    var Ft = Math.random().toString(36).slice(2),
      Ul = "__reactFiber$" + Ft,
      Gl = "__reactProps$" + Ft,
      Ua = "__reactContainer$" + Ft,
      Je = "__reactEvents$" + Ft,
      gv = "__reactListeners$" + Ft,
      bv = "__reactHandles$" + Ft,
      Sf = "__reactResources$" + Ft,
      Na = "__reactMarker$" + Ft;
    function we(l) {
      (delete l[Ul], delete l[Gl], delete l[Je], delete l[gv], delete l[bv]);
    }
    function Zu(l) {
      var t = l[Ul];
      if (t) return t;
      for (var u = l.parentNode; u; ) {
        if ((t = u[Ua] || u[Ul])) {
          if (
            ((u = t.alternate),
            t.child !== null || (u !== null && u.child !== null))
          )
            for (l = Yy(l); l !== null; ) {
              if ((u = l[Ul])) return u;
              l = Yy(l);
            }
          return t;
        }
        ((l = u), (u = l.parentNode));
      }
      return null;
    }
    function ru(l) {
      if ((l = l[Ul] || l[Ua])) {
        var t = l.tag;
        if (
          t === 5 ||
          t === 6 ||
          t === 13 ||
          t === 31 ||
          t === 26 ||
          t === 27 ||
          t === 3
        )
          return l;
      }
      return null;
    }
    function Ca(l) {
      var t = l.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return l.stateNode;
      throw Error(m(33));
    }
    function Vu(l) {
      var t = l[Sf];
      return (
        t ||
          (t = l[Sf] =
            { hoistableStyles: new Map(), hoistableScripts: new Map() }),
        t
      );
    }
    function Ml(l) {
      l[Na] = !0;
    }
    var gf = new Set(),
      bf = {};
    function Eu(l, t) {
      (xu(l, t), xu(l + "Capture", t));
    }
    function xu(l, t) {
      for (bf[l] = t, l = 0; l < t.length; l++) gf.add(t[l]);
    }
    var zv = RegExp(
        "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
      ),
      zf = {},
      Tf = {};
    function Tv(l) {
      return Ze.call(Tf, l)
        ? !0
        : Ze.call(zf, l)
          ? !1
          : zv.test(l)
            ? (Tf[l] = !0)
            : ((zf[l] = !0), !1);
    }
    function Dn(l, t, u) {
      if (Tv(t))
        if (u === null) l.removeAttribute(t);
        else {
          switch (typeof u) {
            case "undefined":
            case "function":
            case "symbol":
              l.removeAttribute(t);
              return;
            case "boolean":
              var a = t.toLowerCase().slice(0, 5);
              if (a !== "data-" && a !== "aria-") {
                l.removeAttribute(t);
                return;
              }
          }
          l.setAttribute(t, "" + u);
        }
    }
    function Un(l, t, u) {
      if (u === null) l.removeAttribute(t);
      else {
        switch (typeof u) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            l.removeAttribute(t);
            return;
        }
        l.setAttribute(t, "" + u);
      }
    }
    function Nt(l, t, u, a) {
      if (a === null) l.removeAttribute(u);
      else {
        switch (typeof a) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            l.removeAttribute(u);
            return;
        }
        l.setAttributeNS(t, u, "" + a);
      }
    }
    function et(l) {
      switch (typeof l) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return l;
        case "object":
          return l;
        default:
          return "";
      }
    }
    function Ef(l) {
      var t = l.type;
      return (
        (l = l.nodeName) &&
        l.toLowerCase() === "input" &&
        (t === "checkbox" || t === "radio")
      );
    }
    function Ev(l, t, u) {
      var a = Object.getOwnPropertyDescriptor(l.constructor.prototype, t);
      if (
        !l.hasOwnProperty(t) &&
        typeof a < "u" &&
        typeof a.get == "function" &&
        typeof a.set == "function"
      ) {
        var n = a.get,
          e = a.set;
        return (
          Object.defineProperty(l, t, {
            configurable: !0,
            get: function () {
              return n.call(this);
            },
            set: function (c) {
              ((u = "" + c), e.call(this, c));
            },
          }),
          Object.defineProperty(l, t, { enumerable: a.enumerable }),
          {
            getValue: function () {
              return u;
            },
            setValue: function (c) {
              u = "" + c;
            },
            stopTracking: function () {
              ((l._valueTracker = null), delete l[t]);
            },
          }
        );
      }
    }
    function We(l) {
      if (!l._valueTracker) {
        var t = Ef(l) ? "checked" : "value";
        l._valueTracker = Ev(l, t, "" + l[t]);
      }
    }
    function Af(l) {
      if (!l) return !1;
      var t = l._valueTracker;
      if (!t) return !0;
      var u = t.getValue(),
        a = "";
      return (
        l && (a = Ef(l) ? (l.checked ? "true" : "false") : l.value),
        (l = a),
        l !== u ? (t.setValue(l), !0) : !1
      );
    }
    function Nn(l) {
      if (
        ((l = l || (typeof document < "u" ? document : void 0)), typeof l > "u")
      )
        return null;
      try {
        return l.activeElement || l.body;
      } catch {
        return l.body;
      }
    }
    var Av = /[\n"\\]/g;
    function ct(l) {
      return l.replace(Av, function (t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      });
    }
    function $e(l, t, u, a, n, e, c, i) {
      ((l.name = ""),
        c != null &&
        typeof c != "function" &&
        typeof c != "symbol" &&
        typeof c != "boolean"
          ? (l.type = c)
          : l.removeAttribute("type"),
        t != null
          ? c === "number"
            ? ((t === 0 && l.value === "") || l.value != t) &&
              (l.value = "" + et(t))
            : l.value !== "" + et(t) && (l.value = "" + et(t))
          : (c !== "submit" && c !== "reset") || l.removeAttribute("value"),
        t != null
          ? Fe(l, c, et(t))
          : u != null
            ? Fe(l, c, et(u))
            : a != null && l.removeAttribute("value"),
        n == null && e != null && (l.defaultChecked = !!e),
        n != null &&
          (l.checked = n && typeof n != "function" && typeof n != "symbol"),
        i != null &&
        typeof i != "function" &&
        typeof i != "symbol" &&
        typeof i != "boolean"
          ? (l.name = "" + et(i))
          : l.removeAttribute("name"));
    }
    function _f(l, t, u, a, n, e, c, i) {
      if (
        (e != null &&
          typeof e != "function" &&
          typeof e != "symbol" &&
          typeof e != "boolean" &&
          (l.type = e),
        t != null || u != null)
      ) {
        if (!((e !== "submit" && e !== "reset") || t != null)) {
          We(l);
          return;
        }
        ((u = u != null ? "" + et(u) : ""),
          (t = t != null ? "" + et(t) : u),
          i || t === l.value || (l.value = t),
          (l.defaultValue = t));
      }
      ((a = a ?? n),
        (a = typeof a != "function" && typeof a != "symbol" && !!a),
        (l.checked = i ? l.checked : !!a),
        (l.defaultChecked = !!a),
        c != null &&
          typeof c != "function" &&
          typeof c != "symbol" &&
          typeof c != "boolean" &&
          (l.name = c),
        We(l));
    }
    function Fe(l, t, u) {
      (t === "number" && Nn(l.ownerDocument) === l) ||
        l.defaultValue === "" + u ||
        (l.defaultValue = "" + u);
    }
    function Ku(l, t, u, a) {
      if (((l = l.options), t)) {
        t = {};
        for (var n = 0; n < u.length; n++) t["$" + u[n]] = !0;
        for (u = 0; u < l.length; u++)
          ((n = t.hasOwnProperty("$" + l[u].value)),
            l[u].selected !== n && (l[u].selected = n),
            n && a && (l[u].defaultSelected = !0));
      } else {
        for (u = "" + et(u), t = null, n = 0; n < l.length; n++) {
          if (l[n].value === u) {
            ((l[n].selected = !0), a && (l[n].defaultSelected = !0));
            return;
          }
          t !== null || l[n].disabled || (t = l[n]);
        }
        t !== null && (t.selected = !0);
      }
    }
    function Of(l, t, u) {
      if (
        t != null &&
        ((t = "" + et(t)), t !== l.value && (l.value = t), u == null)
      ) {
        l.defaultValue !== t && (l.defaultValue = t);
        return;
      }
      l.defaultValue = u != null ? "" + et(u) : "";
    }
    function Mf(l, t, u, a) {
      if (t == null) {
        if (a != null) {
          if (u != null) throw Error(m(92));
          if (U(a)) {
            if (1 < a.length) throw Error(m(93));
            a = a[0];
          }
          u = a;
        }
        ((u ??= ""), (t = u));
      }
      ((u = et(t)),
        (l.defaultValue = u),
        (a = l.textContent),
        a === u && a !== "" && a !== null && (l.value = a),
        We(l));
    }
    function Ju(l, t) {
      if (t) {
        var u = l.firstChild;
        if (u && u === l.lastChild && u.nodeType === 3) {
          u.nodeValue = t;
          return;
        }
      }
      l.textContent = t;
    }
    var _v = new Set(
      "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
        " ",
      ),
    );
    function Df(l, t, u) {
      var a = t.indexOf("--") === 0;
      u == null || typeof u == "boolean" || u === ""
        ? a
          ? l.setProperty(t, "")
          : t === "float"
            ? (l.cssFloat = "")
            : (l[t] = "")
        : a
          ? l.setProperty(t, u)
          : typeof u != "number" || u === 0 || _v.has(t)
            ? t === "float"
              ? (l.cssFloat = u)
              : (l[t] = ("" + u).trim())
            : (l[t] = u + "px");
    }
    function Uf(l, t, u) {
      if (t != null && typeof t != "object") throw Error(m(62));
      if (((l = l.style), u != null)) {
        for (var a in u)
          !u.hasOwnProperty(a) ||
            (t != null && t.hasOwnProperty(a)) ||
            (a.indexOf("--") === 0
              ? l.setProperty(a, "")
              : a === "float"
                ? (l.cssFloat = "")
                : (l[a] = ""));
        for (var n in t)
          ((a = t[n]), t.hasOwnProperty(n) && u[n] !== a && Df(l, n, a));
      } else for (var e in t) t.hasOwnProperty(e) && Df(l, e, t[e]);
    }
    function ke(l) {
      if (l.indexOf("-") === -1) return !1;
      switch (l) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return !1;
        default:
          return !0;
      }
    }
    var Ov = new Map([
        ["acceptCharset", "accept-charset"],
        ["htmlFor", "for"],
        ["httpEquiv", "http-equiv"],
        ["crossOrigin", "crossorigin"],
        ["accentHeight", "accent-height"],
        ["alignmentBaseline", "alignment-baseline"],
        ["arabicForm", "arabic-form"],
        ["baselineShift", "baseline-shift"],
        ["capHeight", "cap-height"],
        ["clipPath", "clip-path"],
        ["clipRule", "clip-rule"],
        ["colorInterpolation", "color-interpolation"],
        ["colorInterpolationFilters", "color-interpolation-filters"],
        ["colorProfile", "color-profile"],
        ["colorRendering", "color-rendering"],
        ["dominantBaseline", "dominant-baseline"],
        ["enableBackground", "enable-background"],
        ["fillOpacity", "fill-opacity"],
        ["fillRule", "fill-rule"],
        ["floodColor", "flood-color"],
        ["floodOpacity", "flood-opacity"],
        ["fontFamily", "font-family"],
        ["fontSize", "font-size"],
        ["fontSizeAdjust", "font-size-adjust"],
        ["fontStretch", "font-stretch"],
        ["fontStyle", "font-style"],
        ["fontVariant", "font-variant"],
        ["fontWeight", "font-weight"],
        ["glyphName", "glyph-name"],
        ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
        ["glyphOrientationVertical", "glyph-orientation-vertical"],
        ["horizAdvX", "horiz-adv-x"],
        ["horizOriginX", "horiz-origin-x"],
        ["imageRendering", "image-rendering"],
        ["letterSpacing", "letter-spacing"],
        ["lightingColor", "lighting-color"],
        ["markerEnd", "marker-end"],
        ["markerMid", "marker-mid"],
        ["markerStart", "marker-start"],
        ["overlinePosition", "overline-position"],
        ["overlineThickness", "overline-thickness"],
        ["paintOrder", "paint-order"],
        ["panose-1", "panose-1"],
        ["pointerEvents", "pointer-events"],
        ["renderingIntent", "rendering-intent"],
        ["shapeRendering", "shape-rendering"],
        ["stopColor", "stop-color"],
        ["stopOpacity", "stop-opacity"],
        ["strikethroughPosition", "strikethrough-position"],
        ["strikethroughThickness", "strikethrough-thickness"],
        ["strokeDasharray", "stroke-dasharray"],
        ["strokeDashoffset", "stroke-dashoffset"],
        ["strokeLinecap", "stroke-linecap"],
        ["strokeLinejoin", "stroke-linejoin"],
        ["strokeMiterlimit", "stroke-miterlimit"],
        ["strokeOpacity", "stroke-opacity"],
        ["strokeWidth", "stroke-width"],
        ["textAnchor", "text-anchor"],
        ["textDecoration", "text-decoration"],
        ["textRendering", "text-rendering"],
        ["transformOrigin", "transform-origin"],
        ["underlinePosition", "underline-position"],
        ["underlineThickness", "underline-thickness"],
        ["unicodeBidi", "unicode-bidi"],
        ["unicodeRange", "unicode-range"],
        ["unitsPerEm", "units-per-em"],
        ["vAlphabetic", "v-alphabetic"],
        ["vHanging", "v-hanging"],
        ["vIdeographic", "v-ideographic"],
        ["vMathematical", "v-mathematical"],
        ["vectorEffect", "vector-effect"],
        ["vertAdvY", "vert-adv-y"],
        ["vertOriginX", "vert-origin-x"],
        ["vertOriginY", "vert-origin-y"],
        ["wordSpacing", "word-spacing"],
        ["writingMode", "writing-mode"],
        ["xmlnsXlink", "xmlns:xlink"],
        ["xHeight", "x-height"],
      ]),
      Mv =
        /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function Cn(l) {
      return Mv.test("" + l)
        ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
        : l;
    }
    function Ct() {}
    var Ie = null;
    function Pe(l) {
      return (
        (l = l.target || l.srcElement || window),
        l.correspondingUseElement && (l = l.correspondingUseElement),
        l.nodeType === 3 ? l.parentNode : l
      );
    }
    var wu = null,
      Wu = null;
    function Nf(l) {
      var t = ru(l);
      if (t && (l = t.stateNode)) {
        var u = l[Gl] || null;
        l: switch (((l = t.stateNode), t.type)) {
          case "input":
            if (
              ($e(
                l,
                u.value,
                u.defaultValue,
                u.defaultValue,
                u.checked,
                u.defaultChecked,
                u.type,
                u.name,
              ),
              (t = u.name),
              u.type === "radio" && t != null)
            ) {
              for (u = l; u.parentNode; ) u = u.parentNode;
              for (
                u = u.querySelectorAll(
                  'input[name="' + ct("" + t) + '"][type="radio"]',
                ),
                  t = 0;
                t < u.length;
                t++
              ) {
                var a = u[t];
                if (a !== l && a.form === l.form) {
                  var n = a[Gl] || null;
                  if (!n) throw Error(m(90));
                  $e(
                    a,
                    n.value,
                    n.defaultValue,
                    n.defaultValue,
                    n.checked,
                    n.defaultChecked,
                    n.type,
                    n.name,
                  );
                }
              }
              for (t = 0; t < u.length; t++)
                ((a = u[t]), a.form === l.form && Af(a));
            }
            break l;
          case "textarea":
            Of(l, u.value, u.defaultValue);
            break l;
          case "select":
            ((t = u.value), t != null && Ku(l, !!u.multiple, t, !1));
        }
      }
    }
    var lc = !1;
    function Cf(l, t, u) {
      if (lc) return l(t, u);
      lc = !0;
      try {
        return l(t);
      } finally {
        if (
          ((lc = !1),
          (wu !== null || Wu !== null) &&
            (Se(), wu && ((t = wu), (l = Wu), (Wu = wu = null), Nf(t), l)))
        )
          for (t = 0; t < l.length; t++) Nf(l[t]);
      }
    }
    function pa(l, t) {
      var u = l.stateNode;
      if (u === null) return null;
      var a = u[Gl] || null;
      if (a === null) return null;
      u = a[t];
      l: switch (t) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          ((a = !a.disabled) ||
            ((l = l.type),
            (a = !(
              l === "button" ||
              l === "input" ||
              l === "select" ||
              l === "textarea"
            ))),
            (l = !a));
          break l;
        default:
          l = !1;
      }
      if (l) return null;
      if (u && typeof u != "function") throw Error(m(231, t, typeof u));
      return u;
    }
    var pt = !(
        typeof window > "u" ||
        typeof window.document > "u" ||
        typeof window.document.createElement > "u"
      ),
      tc = !1;
    if (pt)
      try {
        var Ha = {};
        (Object.defineProperty(Ha, "passive", {
          get: function () {
            tc = !0;
          },
        }),
          window.addEventListener("test", Ha, Ha),
          window.removeEventListener("test", Ha, Ha));
      } catch {
        tc = !1;
      }
    var kt = null,
      uc = null,
      pn = null;
    function pf() {
      if (pn) return pn;
      var l,
        t = uc,
        u = t.length,
        a,
        n = "value" in kt ? kt.value : kt.textContent,
        e = n.length;
      for (l = 0; l < u && t[l] === n[l]; l++);
      var c = u - l;
      for (a = 1; a <= c && t[u - a] === n[e - a]; a++);
      return (pn = n.slice(l, 1 < a ? 1 - a : void 0));
    }
    function Hn(l) {
      var t = l.keyCode;
      return (
        "charCode" in l
          ? ((l = l.charCode), l === 0 && t === 13 && (l = 13))
          : (l = t),
        l === 10 && (l = 13),
        32 <= l || l === 13 ? l : 0
      );
    }
    function Rn() {
      return !0;
    }
    function Hf() {
      return !1;
    }
    function Xl(l) {
      function t(u, a, n, e, c) {
        ((this._reactName = u),
          (this._targetInst = n),
          (this.type = a),
          (this.nativeEvent = e),
          (this.target = c),
          (this.currentTarget = null));
        for (var i in l)
          l.hasOwnProperty(i) && ((u = l[i]), (this[i] = u ? u(e) : e[i]));
        return (
          (this.isDefaultPrevented = (
            e.defaultPrevented != null
              ? e.defaultPrevented
              : e.returnValue === !1
          )
            ? Rn
            : Hf),
          (this.isPropagationStopped = Hf),
          this
        );
      }
      return (
        q(t.prototype, {
          preventDefault: function () {
            this.defaultPrevented = !0;
            var u = this.nativeEvent;
            u &&
              (u.preventDefault
                ? u.preventDefault()
                : typeof u.returnValue != "unknown" && (u.returnValue = !1),
              (this.isDefaultPrevented = Rn));
          },
          stopPropagation: function () {
            var u = this.nativeEvent;
            u &&
              (u.stopPropagation
                ? u.stopPropagation()
                : typeof u.cancelBubble != "unknown" && (u.cancelBubble = !0),
              (this.isPropagationStopped = Rn));
          },
          persist: function () {},
          isPersistent: Rn,
        }),
        t
      );
    }
    var Au = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (l) {
          return l.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0,
      },
      qn = Xl(Au),
      Ra = q({}, Au, { view: 0, detail: 0 }),
      Dv = Xl(Ra),
      ac,
      nc,
      qa,
      Bn = q({}, Ra, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: cc,
        button: 0,
        buttons: 0,
        relatedTarget: function (l) {
          return l.relatedTarget === void 0
            ? l.fromElement === l.srcElement
              ? l.toElement
              : l.fromElement
            : l.relatedTarget;
        },
        movementX: function (l) {
          return "movementX" in l
            ? l.movementX
            : (l !== qa &&
                (qa && l.type === "mousemove"
                  ? ((ac = l.screenX - qa.screenX),
                    (nc = l.screenY - qa.screenY))
                  : (nc = ac = 0),
                (qa = l)),
              ac);
        },
        movementY: function (l) {
          return "movementY" in l ? l.movementY : nc;
        },
      }),
      Rf = Xl(Bn),
      Uv = Xl(q({}, Bn, { dataTransfer: 0 })),
      ec = Xl(q({}, Ra, { relatedTarget: 0 })),
      Nv = Xl(
        q({}, Au, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
      ),
      Cv = Xl(
        q({}, Au, {
          clipboardData: function (l) {
            return "clipboardData" in l
              ? l.clipboardData
              : window.clipboardData;
          },
        }),
      ),
      qf = Xl(q({}, Au, { data: 0 })),
      pv = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified",
      },
      Hv = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta",
      },
      Rv = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey",
      };
    function qv(l) {
      var t = this.nativeEvent;
      return t.getModifierState
        ? t.getModifierState(l)
        : (l = Rv[l])
          ? !!t[l]
          : !1;
    }
    function cc() {
      return qv;
    }
    var Bv = Xl(
        q({}, Ra, {
          key: function (l) {
            if (l.key) {
              var t = pv[l.key] || l.key;
              if (t !== "Unidentified") return t;
            }
            return l.type === "keypress"
              ? ((l = Hn(l)), l === 13 ? "Enter" : String.fromCharCode(l))
              : l.type === "keydown" || l.type === "keyup"
                ? Hv[l.keyCode] || "Unidentified"
                : "";
          },
          code: 0,
          location: 0,
          ctrlKey: 0,
          shiftKey: 0,
          altKey: 0,
          metaKey: 0,
          repeat: 0,
          locale: 0,
          getModifierState: cc,
          charCode: function (l) {
            return l.type === "keypress" ? Hn(l) : 0;
          },
          keyCode: function (l) {
            return l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
          },
          which: function (l) {
            return l.type === "keypress"
              ? Hn(l)
              : l.type === "keydown" || l.type === "keyup"
                ? l.keyCode
                : 0;
          },
        }),
      ),
      Bf = Xl(
        q({}, Bn, {
          pointerId: 0,
          width: 0,
          height: 0,
          pressure: 0,
          tangentialPressure: 0,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
          pointerType: 0,
          isPrimary: 0,
        }),
      ),
      Yv = Xl(
        q({}, Ra, {
          touches: 0,
          targetTouches: 0,
          changedTouches: 0,
          altKey: 0,
          metaKey: 0,
          ctrlKey: 0,
          shiftKey: 0,
          getModifierState: cc,
        }),
      ),
      jv = Xl(q({}, Au, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 })),
      Gv = Xl(
        q({}, Bn, {
          deltaX: function (l) {
            return "deltaX" in l
              ? l.deltaX
              : "wheelDeltaX" in l
                ? -l.wheelDeltaX
                : 0;
          },
          deltaY: function (l) {
            return "deltaY" in l
              ? l.deltaY
              : "wheelDeltaY" in l
                ? -l.wheelDeltaY
                : "wheelDelta" in l
                  ? -l.wheelDelta
                  : 0;
          },
          deltaZ: 0,
          deltaMode: 0,
        }),
      ),
      Xv = Xl(q({}, Au, { newState: 0, oldState: 0 })),
      Qv = [9, 13, 27, 32],
      ic = pt && "CompositionEvent" in window,
      Ba = null;
    pt && "documentMode" in document && (Ba = document.documentMode);
    var Lv = pt && "TextEvent" in window && !Ba,
      Yf = pt && (!ic || (Ba && 8 < Ba && 11 >= Ba)),
      jf = " ",
      Gf = !1;
    function Xf(l, t) {
      switch (l) {
        case "keyup":
          return Qv.indexOf(t.keyCode) !== -1;
        case "keydown":
          return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function Qf(l) {
      return (
        (l = l.detail),
        typeof l == "object" && "data" in l ? l.data : null
      );
    }
    var $u = !1;
    function Zv(l, t) {
      switch (l) {
        case "compositionend":
          return Qf(t);
        case "keypress":
          return t.which !== 32 ? null : ((Gf = !0), jf);
        case "textInput":
          return ((l = t.data), l === jf && Gf ? null : l);
        default:
          return null;
      }
    }
    function rv(l, t) {
      if ($u)
        return l === "compositionend" || (!ic && Xf(l, t))
          ? ((l = pf()), (pn = uc = kt = null), ($u = !1), l)
          : null;
      switch (l) {
        case "paste":
          return null;
        case "keypress":
          if (
            !(t.ctrlKey || t.altKey || t.metaKey) ||
            (t.ctrlKey && t.altKey)
          ) {
            if (t.char && 1 < t.char.length) return t.char;
            if (t.which) return String.fromCharCode(t.which);
          }
          return null;
        case "compositionend":
          return Yf && t.locale !== "ko" ? null : t.data;
        default:
          return null;
      }
    }
    var Vv = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0,
    };
    function Lf(l) {
      var t = l && l.nodeName && l.nodeName.toLowerCase();
      return t === "input" ? !!Vv[l.type] : t === "textarea";
    }
    function Zf(l, t, u, a) {
      (wu ? (Wu ? Wu.push(a) : (Wu = [a])) : (wu = a),
        (t = _e(t, "onChange")),
        0 < t.length &&
          ((u = new qn("onChange", "change", null, u, a)),
          l.push({ event: u, listeners: t })));
    }
    var Ya = null,
      ja = null;
    function xv(l) {
      Ty(l, 0);
    }
    function Yn(l) {
      if (Af(Ca(l))) return l;
    }
    function rf(l, t) {
      if (l === "change") return t;
    }
    var Vf = !1;
    if (pt) {
      var fc;
      if (pt) {
        var yc = "oninput" in document;
        if (!yc) {
          var xf = document.createElement("div");
          (xf.setAttribute("oninput", "return;"),
            (yc = typeof xf.oninput == "function"));
        }
        fc = yc;
      } else fc = !1;
      Vf = fc && (!document.documentMode || 9 < document.documentMode);
    }
    function Kf() {
      Ya && (Ya.detachEvent("onpropertychange", Jf), (ja = Ya = null));
    }
    function Jf(l) {
      if (l.propertyName === "value" && Yn(ja)) {
        var t = [];
        (Zf(t, ja, l, Pe(l)), Cf(xv, t));
      }
    }
    function Kv(l, t, u) {
      l === "focusin"
        ? (Kf(), (Ya = t), (ja = u), Ya.attachEvent("onpropertychange", Jf))
        : l === "focusout" && Kf();
    }
    function Jv(l) {
      if (l === "selectionchange" || l === "keyup" || l === "keydown")
        return Yn(ja);
    }
    function wv(l, t) {
      if (l === "click") return Yn(t);
    }
    function Wv(l, t) {
      if (l === "input" || l === "change") return Yn(t);
    }
    function $v(l, t) {
      return (l === t && (l !== 0 || 1 / l === 1 / t)) || (l !== l && t !== t);
    }
    var Pl = typeof Object.is == "function" ? Object.is : $v;
    function Ga(l, t) {
      if (Pl(l, t)) return !0;
      if (
        typeof l != "object" ||
        l === null ||
        typeof t != "object" ||
        t === null
      )
        return !1;
      var u = Object.keys(l),
        a = Object.keys(t);
      if (u.length !== a.length) return !1;
      for (a = 0; a < u.length; a++) {
        var n = u[a];
        if (!Ze.call(t, n) || !Pl(l[n], t[n])) return !1;
      }
      return !0;
    }
    function wf(l) {
      for (; l && l.firstChild; ) l = l.firstChild;
      return l;
    }
    function Wf(l, t) {
      var u = wf(l);
      l = 0;
      for (var a; u; ) {
        if (u.nodeType === 3) {
          if (((a = l + u.textContent.length), l <= t && a >= t))
            return { node: u, offset: t - l };
          l = a;
        }
        l: {
          for (; u; ) {
            if (u.nextSibling) {
              u = u.nextSibling;
              break l;
            }
            u = u.parentNode;
          }
          u = void 0;
        }
        u = wf(u);
      }
    }
    function $f(l, t) {
      return l && t
        ? l === t
          ? !0
          : l && l.nodeType === 3
            ? !1
            : t && t.nodeType === 3
              ? $f(l, t.parentNode)
              : "contains" in l
                ? l.contains(t)
                : l.compareDocumentPosition
                  ? !!(l.compareDocumentPosition(t) & 16)
                  : !1
        : !1;
    }
    function Ff(l) {
      l =
        l != null &&
        l.ownerDocument != null &&
        l.ownerDocument.defaultView != null
          ? l.ownerDocument.defaultView
          : window;
      for (var t = Nn(l.document); t instanceof l.HTMLIFrameElement; ) {
        try {
          var u = typeof t.contentWindow.location.href == "string";
        } catch {
          u = !1;
        }
        if (u) l = t.contentWindow;
        else break;
        t = Nn(l.document);
      }
      return t;
    }
    function vc(l) {
      var t = l && l.nodeName && l.nodeName.toLowerCase();
      return (
        t &&
        ((t === "input" &&
          (l.type === "text" ||
            l.type === "search" ||
            l.type === "tel" ||
            l.type === "url" ||
            l.type === "password")) ||
          t === "textarea" ||
          l.contentEditable === "true")
      );
    }
    var Fv = pt && "documentMode" in document && 11 >= document.documentMode,
      Fu = null,
      dc = null,
      Xa = null,
      mc = !1;
    function kf(l, t, u) {
      var a =
        u.window === u ? u.document : u.nodeType === 9 ? u : u.ownerDocument;
      mc ||
        Fu == null ||
        Fu !== Nn(a) ||
        ((a = Fu),
        "selectionStart" in a && vc(a)
          ? (a = { start: a.selectionStart, end: a.selectionEnd })
          : ((a = (
              (a.ownerDocument && a.ownerDocument.defaultView) ||
              window
            ).getSelection()),
            (a = {
              anchorNode: a.anchorNode,
              anchorOffset: a.anchorOffset,
              focusNode: a.focusNode,
              focusOffset: a.focusOffset,
            })),
        (Xa && Ga(Xa, a)) ||
          ((Xa = a),
          (a = _e(dc, "onSelect")),
          0 < a.length &&
            ((t = new qn("onSelect", "select", null, t, u)),
            l.push({ event: t, listeners: a }),
            (t.target = Fu))));
    }
    function _u(l, t) {
      var u = {};
      return (
        (u[l.toLowerCase()] = t.toLowerCase()),
        (u["Webkit" + l] = "webkit" + t),
        (u["Moz" + l] = "moz" + t),
        u
      );
    }
    var ku = {
        animationend: _u("Animation", "AnimationEnd"),
        animationiteration: _u("Animation", "AnimationIteration"),
        animationstart: _u("Animation", "AnimationStart"),
        transitionrun: _u("Transition", "TransitionRun"),
        transitionstart: _u("Transition", "TransitionStart"),
        transitioncancel: _u("Transition", "TransitionCancel"),
        transitionend: _u("Transition", "TransitionEnd"),
      },
      hc = {},
      If = {};
    pt &&
      ((If = document.createElement("div").style),
      "AnimationEvent" in window ||
        (delete ku.animationend.animation,
        delete ku.animationiteration.animation,
        delete ku.animationstart.animation),
      "TransitionEvent" in window || delete ku.transitionend.transition);
    function Ou(l) {
      if (hc[l]) return hc[l];
      if (!ku[l]) return l;
      var t = ku[l],
        u;
      for (u in t) if (t.hasOwnProperty(u) && u in If) return (hc[l] = t[u]);
      return l;
    }
    var Pf = Ou("animationend"),
      l0 = Ou("animationiteration"),
      t0 = Ou("animationstart"),
      kv = Ou("transitionrun"),
      Iv = Ou("transitionstart"),
      Pv = Ou("transitioncancel"),
      u0 = Ou("transitionend"),
      a0 = new Map(),
      sc =
        "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
          " ",
        );
    sc.push("scrollEnd");
    function Tt(l, t) {
      (a0.set(l, t), Eu(t, [l]));
    }
    var jn =
        typeof reportError == "function"
          ? reportError
          : function (l) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var t = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof l == "object" &&
                    l !== null &&
                    typeof l.message == "string"
                      ? String(l.message)
                      : String(l),
                  error: l,
                });
                if (!window.dispatchEvent(t)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", l);
                return;
              }
              console.error(l);
            },
      it = [],
      Iu = 0,
      oc = 0;
    function Gn() {
      for (var l = Iu, t = (oc = Iu = 0); t < l; ) {
        var u = it[t];
        it[t++] = null;
        var a = it[t];
        it[t++] = null;
        var n = it[t];
        it[t++] = null;
        var e = it[t];
        if (((it[t++] = null), a !== null && n !== null)) {
          var c = a.pending;
          (c === null ? (n.next = n) : ((n.next = c.next), (c.next = n)),
            (a.pending = n));
        }
        e !== 0 && n0(u, n, e);
      }
    }
    function Xn(l, t, u, a) {
      ((it[Iu++] = l),
        (it[Iu++] = t),
        (it[Iu++] = u),
        (it[Iu++] = a),
        (oc |= a),
        (l.lanes |= a),
        (l = l.alternate),
        l !== null && (l.lanes |= a));
    }
    function Sc(l, t, u, a) {
      return (Xn(l, t, u, a), Qn(l));
    }
    function Mu(l, t) {
      return (Xn(l, null, null, t), Qn(l));
    }
    function n0(l, t, u) {
      l.lanes |= u;
      var a = l.alternate;
      a !== null && (a.lanes |= u);
      for (var n = !1, e = l.return; e !== null; )
        ((e.childLanes |= u),
          (a = e.alternate),
          a !== null && (a.childLanes |= u),
          e.tag === 22 &&
            ((l = e.stateNode), l === null || l._visibility & 1 || (n = !0)),
          (l = e),
          (e = e.return));
      return l.tag === 3
        ? ((e = l.stateNode),
          n &&
            t !== null &&
            ((n = 31 - Il(u)),
            (l = e.hiddenUpdates),
            (a = l[n]),
            a === null ? (l[n] = [t]) : a.push(t),
            (t.lane = u | 536870912)),
          e)
        : null;
    }
    function Qn(l) {
      if (50 < cn) throw ((cn = 0), (Mi = null), Error(m(185)));
      for (var t = l.return; t !== null; ) ((l = t), (t = l.return));
      return l.tag === 3 ? l.stateNode : null;
    }
    var Pu = {};
    function ld(l, t, u, a) {
      ((this.tag = l),
        (this.key = u),
        (this.sibling =
          this.child =
          this.return =
          this.stateNode =
          this.type =
          this.elementType =
            null),
        (this.index = 0),
        (this.refCleanup = this.ref = null),
        (this.pendingProps = t),
        (this.dependencies =
          this.memoizedState =
          this.updateQueue =
          this.memoizedProps =
            null),
        (this.mode = a),
        (this.subtreeFlags = this.flags = 0),
        (this.deletions = null),
        (this.childLanes = this.lanes = 0),
        (this.alternate = null));
    }
    function lt(l, t, u, a) {
      return new ld(l, t, u, a);
    }
    function gc(l) {
      return ((l = l.prototype), !(!l || !l.isReactComponent));
    }
    function Ht(l, t) {
      var u = l.alternate;
      return (
        u === null
          ? ((u = lt(l.tag, t, l.key, l.mode)),
            (u.elementType = l.elementType),
            (u.type = l.type),
            (u.stateNode = l.stateNode),
            (u.alternate = l),
            (l.alternate = u))
          : ((u.pendingProps = t),
            (u.type = l.type),
            (u.flags = 0),
            (u.subtreeFlags = 0),
            (u.deletions = null)),
        (u.flags = l.flags & 65011712),
        (u.childLanes = l.childLanes),
        (u.lanes = l.lanes),
        (u.child = l.child),
        (u.memoizedProps = l.memoizedProps),
        (u.memoizedState = l.memoizedState),
        (u.updateQueue = l.updateQueue),
        (t = l.dependencies),
        (u.dependencies =
          t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
        (u.sibling = l.sibling),
        (u.index = l.index),
        (u.ref = l.ref),
        (u.refCleanup = l.refCleanup),
        u
      );
    }
    function e0(l, t) {
      l.flags &= 65011714;
      var u = l.alternate;
      return (
        u === null
          ? ((l.childLanes = 0),
            (l.lanes = t),
            (l.child = null),
            (l.subtreeFlags = 0),
            (l.memoizedProps = null),
            (l.memoizedState = null),
            (l.updateQueue = null),
            (l.dependencies = null),
            (l.stateNode = null))
          : ((l.childLanes = u.childLanes),
            (l.lanes = u.lanes),
            (l.child = u.child),
            (l.subtreeFlags = 0),
            (l.deletions = null),
            (l.memoizedProps = u.memoizedProps),
            (l.memoizedState = u.memoizedState),
            (l.updateQueue = u.updateQueue),
            (l.type = u.type),
            (t = u.dependencies),
            (l.dependencies =
              t === null
                ? null
                : { lanes: t.lanes, firstContext: t.firstContext })),
        l
      );
    }
    function Ln(l, t, u, a, n, e) {
      var c = 0;
      if (((a = l), typeof l == "function")) gc(l) && (c = 1);
      else if (typeof l == "string")
        c = cm(l, u, H.current)
          ? 26
          : l === "html" || l === "head" || l === "body"
            ? 27
            : 5;
      else
        l: switch (l) {
          case _t:
            return (
              (l = lt(31, u, t, n)),
              (l.elementType = _t),
              (l.lanes = e),
              l
            );
          case xl:
            return Du(u.children, n, e, t);
          case wt:
            ((c = 8), (n |= 24));
            break;
          case Kl:
            return (
              (l = lt(12, u, t, n | 2)),
              (l.elementType = Kl),
              (l.lanes = e),
              l
            );
          case Jl:
            return (
              (l = lt(13, u, t, n)),
              (l.elementType = Jl),
              (l.lanes = e),
              l
            );
          case wl:
            return (
              (l = lt(19, u, t, n)),
              (l.elementType = wl),
              (l.lanes = e),
              l
            );
          default:
            if (typeof l == "object" && l !== null)
              switch (l.$$typeof) {
                case Ol:
                  c = 10;
                  break l;
                case Wt:
                  c = 9;
                  break l;
                case bt:
                  c = 11;
                  break l;
                case W:
                  c = 14;
                  break l;
                case jl:
                  ((c = 16), (a = null));
                  break l;
              }
            ((c = 29),
              (u = Error(m(130, l === null ? "null" : typeof l, ""))),
              (a = null));
        }
      return (
        (t = lt(c, u, t, n)),
        (t.elementType = l),
        (t.type = a),
        (t.lanes = e),
        t
      );
    }
    function Du(l, t, u, a) {
      return ((l = lt(7, l, a, t)), (l.lanes = u), l);
    }
    function bc(l, t, u) {
      return ((l = lt(6, l, null, t)), (l.lanes = u), l);
    }
    function c0(l) {
      var t = lt(18, null, null, 0);
      return ((t.stateNode = l), t);
    }
    function zc(l, t, u) {
      return (
        (t = lt(4, l.children !== null ? l.children : [], l.key, t)),
        (t.lanes = u),
        (t.stateNode = {
          containerInfo: l.containerInfo,
          pendingChildren: null,
          implementation: l.implementation,
        }),
        t
      );
    }
    var i0 = new WeakMap();
    function ft(l, t) {
      if (typeof l == "object" && l !== null) {
        var u = i0.get(l);
        return u !== void 0
          ? u
          : ((t = { value: l, source: t, stack: nf(t) }), i0.set(l, t), t);
      }
      return { value: l, source: t, stack: nf(t) };
    }
    var la = [],
      ta = 0,
      Zn = null,
      Qa = 0,
      yt = [],
      vt = 0,
      It = null,
      Mt = 1,
      Dt = "";
    function Rt(l, t) {
      ((la[ta++] = Qa), (la[ta++] = Zn), (Zn = l), (Qa = t));
    }
    function f0(l, t, u) {
      ((yt[vt++] = Mt), (yt[vt++] = Dt), (yt[vt++] = It), (It = l));
      var a = Mt;
      l = Dt;
      var n = 32 - Il(a) - 1;
      ((a &= ~(1 << n)), (u += 1));
      var e = 32 - Il(t) + n;
      if (30 < e) {
        var c = n - (n % 5);
        ((e = (a & ((1 << c) - 1)).toString(32)),
          (a >>= c),
          (n -= c),
          (Mt = (1 << (32 - Il(t) + n)) | (u << n) | a),
          (Dt = e + l));
      } else ((Mt = (1 << e) | (u << n) | a), (Dt = l));
    }
    function Tc(l) {
      l.return !== null && (Rt(l, 1), f0(l, 1, 0));
    }
    function Ec(l) {
      for (; l === Zn; )
        ((Zn = la[--ta]), (la[ta] = null), (Qa = la[--ta]), (la[ta] = null));
      for (; l === It; )
        ((It = yt[--vt]),
          (yt[vt] = null),
          (Dt = yt[--vt]),
          (yt[vt] = null),
          (Mt = yt[--vt]),
          (yt[vt] = null));
    }
    function y0(l, t) {
      ((yt[vt++] = Mt),
        (yt[vt++] = Dt),
        (yt[vt++] = It),
        (Mt = t.id),
        (Dt = t.overflow),
        (It = l));
    }
    var Nl = null,
      vl = null,
      w = !1,
      Pt = null,
      dt = !1,
      Ac = Error(m(519));
    function lu(l) {
      throw (
        La(
          ft(
            Error(
              m(
                418,
                1 < arguments.length && arguments[1] !== void 0 && arguments[1]
                  ? "text"
                  : "HTML",
                "",
              ),
            ),
            l,
          ),
        ),
        Ac
      );
    }
    function v0(l) {
      var t = l.stateNode,
        u = l.type,
        a = l.memoizedProps;
      switch (((t[Ul] = l), (t[Gl] = a), u)) {
        case "dialog":
          (V("cancel", t), V("close", t));
          break;
        case "iframe":
        case "object":
        case "embed":
          V("load", t);
          break;
        case "video":
        case "audio":
          for (u = 0; u < yn.length; u++) V(yn[u], t);
          break;
        case "source":
          V("error", t);
          break;
        case "img":
        case "image":
        case "link":
          (V("error", t), V("load", t));
          break;
        case "details":
          V("toggle", t);
          break;
        case "input":
          (V("invalid", t),
            _f(
              t,
              a.value,
              a.defaultValue,
              a.checked,
              a.defaultChecked,
              a.type,
              a.name,
              !0,
            ));
          break;
        case "select":
          V("invalid", t);
          break;
        case "textarea":
          (V("invalid", t), Mf(t, a.value, a.defaultValue, a.children));
      }
      ((u = a.children),
        (typeof u != "string" &&
          typeof u != "number" &&
          typeof u != "bigint") ||
        t.textContent === "" + u ||
        a.suppressHydrationWarning === !0 ||
        My(t.textContent, u)
          ? (a.popover != null && (V("beforetoggle", t), V("toggle", t)),
            a.onScroll != null && V("scroll", t),
            a.onScrollEnd != null && V("scrollend", t),
            a.onClick != null && (t.onclick = Ct),
            (t = !0))
          : (t = !1),
        t || lu(l, !0));
    }
    function d0(l) {
      for (Nl = l.return; Nl; )
        switch (Nl.tag) {
          case 5:
          case 31:
          case 13:
            dt = !1;
            return;
          case 27:
          case 3:
            dt = !0;
            return;
          default:
            Nl = Nl.return;
        }
    }
    function ua(l) {
      if (l !== Nl) return !1;
      if (!w) return (d0(l), (w = !0), !1);
      var t = l.tag,
        u;
      if (
        ((u = t !== 3 && t !== 27) &&
          ((u = t === 5) &&
            ((u = l.type),
            (u =
              !(u !== "form" && u !== "button") ||
              Qi(l.type, l.memoizedProps))),
          (u = !u)),
        u && vl && lu(l),
        d0(l),
        t === 13)
      ) {
        if (((l = l.memoizedState), (l = l !== null ? l.dehydrated : null), !l))
          throw Error(m(317));
        vl = By(l);
      } else if (t === 31) {
        if (((l = l.memoizedState), (l = l !== null ? l.dehydrated : null), !l))
          throw Error(m(317));
        vl = By(l);
      } else
        t === 27
          ? ((t = vl),
            mu(l.type) ? ((l = xi), (xi = null), (vl = l)) : (vl = t))
          : (vl = Nl ? st(l.stateNode.nextSibling) : null);
      return !0;
    }
    function Uu() {
      ((vl = Nl = null), (w = !1));
    }
    function _c() {
      var l = Pt;
      return (
        l !== null &&
          (rl === null ? (rl = l) : rl.push.apply(rl, l), (Pt = null)),
        l
      );
    }
    function La(l) {
      Pt === null ? (Pt = [l]) : Pt.push(l);
    }
    var Oc = v(null),
      Nu = null,
      qt = null;
    function tu(l, t, u) {
      (M(Oc, t._currentValue), (t._currentValue = u));
    }
    function Bt(l) {
      ((l._currentValue = Oc.current), E(Oc));
    }
    function Mc(l, t, u) {
      for (; l !== null; ) {
        var a = l.alternate;
        if (
          ((l.childLanes & t) !== t
            ? ((l.childLanes |= t), a !== null && (a.childLanes |= t))
            : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t),
          l === u)
        )
          break;
        l = l.return;
      }
    }
    function Dc(l, t, u, a) {
      var n = l.child;
      for (n !== null && (n.return = l); n !== null; ) {
        var e = n.dependencies;
        if (e !== null) {
          var c = n.child;
          e = e.firstContext;
          l: for (; e !== null; ) {
            var i = e;
            e = n;
            for (var f = 0; f < t.length; f++)
              if (i.context === t[f]) {
                ((e.lanes |= u),
                  (i = e.alternate),
                  i !== null && (i.lanes |= u),
                  Mc(e.return, u, l),
                  a || (c = null));
                break l;
              }
            e = i.next;
          }
        } else if (n.tag === 18) {
          if (((c = n.return), c === null)) throw Error(m(341));
          ((c.lanes |= u),
            (e = c.alternate),
            e !== null && (e.lanes |= u),
            Mc(c, u, l),
            (c = null));
        } else c = n.child;
        if (c !== null) c.return = n;
        else
          for (c = n; c !== null; ) {
            if (c === l) {
              c = null;
              break;
            }
            if (((n = c.sibling), n !== null)) {
              ((n.return = c.return), (c = n));
              break;
            }
            c = c.return;
          }
        n = c;
      }
    }
    function aa(l, t, u, a) {
      l = null;
      for (var n = t, e = !1; n !== null; ) {
        if (!e) {
          if ((n.flags & 524288) !== 0) e = !0;
          else if ((n.flags & 262144) !== 0) break;
        }
        if (n.tag === 10) {
          var c = n.alternate;
          if (c === null) throw Error(m(387));
          if (((c = c.memoizedProps), c !== null)) {
            var i = n.type;
            Pl(n.pendingProps.value, c.value) ||
              (l !== null ? l.push(i) : (l = [i]));
          }
        } else if (n === P.current) {
          if (((c = n.alternate), c === null)) throw Error(m(387));
          c.memoizedState.memoizedState !== n.memoizedState.memoizedState &&
            (l !== null ? l.push(sn) : (l = [sn]));
        }
        n = n.return;
      }
      (l !== null && Dc(t, l, u, a), (t.flags |= 262144));
    }
    function rn(l) {
      for (l = l.firstContext; l !== null; ) {
        if (!Pl(l.context._currentValue, l.memoizedValue)) return !0;
        l = l.next;
      }
      return !1;
    }
    function Cu(l) {
      ((Nu = l),
        (qt = null),
        (l = l.dependencies),
        l !== null && (l.firstContext = null));
    }
    function Cl(l) {
      return m0(Nu, l);
    }
    function Vn(l, t) {
      return (Nu === null && Cu(l), m0(l, t));
    }
    function m0(l, t) {
      var u = t._currentValue;
      if (((t = { context: t, memoizedValue: u, next: null }), qt === null)) {
        if (l === null) throw Error(m(308));
        ((qt = t),
          (l.dependencies = { lanes: 0, firstContext: t }),
          (l.flags |= 524288));
      } else qt = qt.next = t;
      return u;
    }
    var td =
        typeof AbortController < "u"
          ? AbortController
          : function () {
              var l = [],
                t = (this.signal = {
                  aborted: !1,
                  addEventListener: function (u, a) {
                    l.push(a);
                  },
                });
              this.abort = function () {
                ((t.aborted = !0),
                  l.forEach(function (u) {
                    return u();
                  }));
              };
            },
      ud = _.unstable_scheduleCallback,
      ad = _.unstable_NormalPriority,
      zl = {
        $$typeof: Ol,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0,
      };
    function Uc() {
      return { controller: new td(), data: new Map(), refCount: 0 };
    }
    function Za(l) {
      (l.refCount--,
        l.refCount === 0 &&
          ud(ad, function () {
            l.controller.abort();
          }));
    }
    var ra = null,
      Nc = 0,
      na = 0,
      ea = null;
    function nd(l, t) {
      if (ra === null) {
        var u = (ra = []);
        ((Nc = 0),
          (na = Hi()),
          (ea = {
            status: "pending",
            value: void 0,
            then: function (a) {
              u.push(a);
            },
          }));
      }
      return (Nc++, t.then(h0, h0), t);
    }
    function h0() {
      if (--Nc === 0 && ra !== null) {
        ea !== null && (ea.status = "fulfilled");
        var l = ra;
        ((ra = null), (na = 0), (ea = null));
        for (var t = 0; t < l.length; t++) (0, l[t])();
      }
    }
    function ed(l, t) {
      var u = [],
        a = {
          status: "pending",
          value: null,
          reason: null,
          then: function (n) {
            u.push(n);
          },
        };
      return (
        l.then(
          function () {
            ((a.status = "fulfilled"), (a.value = t));
            for (var n = 0; n < u.length; n++) (0, u[n])(t);
          },
          function (n) {
            for (a.status = "rejected", a.reason = n, n = 0; n < u.length; n++)
              (0, u[n])(void 0);
          },
        ),
        a
      );
    }
    var s0 = O.S;
    O.S = function (l, t) {
      ((W1 = Fl()),
        typeof t == "object" &&
          t !== null &&
          typeof t.then == "function" &&
          nd(l, t),
        s0 !== null && s0(l, t));
    };
    var pu = v(null);
    function Cc() {
      var l = pu.current;
      return l !== null ? l : il.pooledCache;
    }
    function xn(l, t) {
      t === null ? M(pu, pu.current) : M(pu, t.pool);
    }
    function o0() {
      var l = Cc();
      return l === null ? null : { parent: zl._currentValue, pool: l };
    }
    var ca = Error(m(460)),
      pc = Error(m(474)),
      Kn = Error(m(542)),
      Jn = { then: function () {} };
    function S0(l) {
      return ((l = l.status), l === "fulfilled" || l === "rejected");
    }
    function g0(l, t, u) {
      switch (
        ((u = l[u]),
        u === void 0 ? l.push(t) : u !== t && (t.then(Ct, Ct), (t = u)),
        t.status)
      ) {
        case "fulfilled":
          return t.value;
        case "rejected":
          throw ((l = t.reason), z0(l), l);
        default:
          if (typeof t.status == "string") t.then(Ct, Ct);
          else {
            if (((l = il), l !== null && 100 < l.shellSuspendCounter))
              throw Error(m(482));
            ((l = t),
              (l.status = "pending"),
              l.then(
                function (a) {
                  if (t.status === "pending") {
                    var n = t;
                    ((n.status = "fulfilled"), (n.value = a));
                  }
                },
                function (a) {
                  if (t.status === "pending") {
                    var n = t;
                    ((n.status = "rejected"), (n.reason = a));
                  }
                },
              ));
          }
          switch (t.status) {
            case "fulfilled":
              return t.value;
            case "rejected":
              throw ((l = t.reason), z0(l), l);
          }
          throw ((Ru = t), ca);
      }
    }
    function Hu(l) {
      try {
        var t = l._init;
        return t(l._payload);
      } catch (u) {
        throw u !== null && typeof u == "object" && typeof u.then == "function"
          ? ((Ru = u), ca)
          : u;
      }
    }
    var Ru = null;
    function b0() {
      if (Ru === null) throw Error(m(459));
      var l = Ru;
      return ((Ru = null), l);
    }
    function z0(l) {
      if (l === ca || l === Kn) throw Error(m(483));
    }
    var ia = null,
      Va = 0;
    function wn(l) {
      var t = Va;
      return ((Va += 1), ia === null && (ia = []), g0(ia, l, t));
    }
    function xa(l, t) {
      ((t = t.props.ref), (l.ref = t !== void 0 ? t : null));
    }
    function Wn(l, t) {
      throw t.$$typeof === gt
        ? Error(m(525))
        : ((l = Object.prototype.toString.call(t)),
          Error(
            m(
              31,
              l === "[object Object]"
                ? "object with keys {" + Object.keys(t).join(", ") + "}"
                : l,
            ),
          ));
    }
    function T0(l) {
      function t(d, y) {
        if (l) {
          var h = d.deletions;
          h === null ? ((d.deletions = [y]), (d.flags |= 16)) : h.push(y);
        }
      }
      function u(d, y) {
        if (!l) return null;
        for (; y !== null; ) (t(d, y), (y = y.sibling));
        return null;
      }
      function a(d) {
        for (var y = new Map(); d !== null; )
          (d.key !== null ? y.set(d.key, d) : y.set(d.index, d),
            (d = d.sibling));
        return y;
      }
      function n(d, y) {
        return ((d = Ht(d, y)), (d.index = 0), (d.sibling = null), d);
      }
      function e(d, y, h) {
        return (
          (d.index = h),
          l
            ? ((h = d.alternate),
              h !== null
                ? ((h = h.index), h < y ? ((d.flags |= 67108866), y) : h)
                : ((d.flags |= 67108866), y))
            : ((d.flags |= 1048576), y)
        );
      }
      function c(d) {
        return (l && d.alternate === null && (d.flags |= 67108866), d);
      }
      function i(d, y, h, z) {
        return y === null || y.tag !== 6
          ? ((y = bc(h, d.mode, z)), (y.return = d), y)
          : ((y = n(y, h)), (y.return = d), y);
      }
      function f(d, y, h, z) {
        var R = h.type;
        return R === xl
          ? b(d, y, h.props.children, z, h.key)
          : y !== null &&
              (y.elementType === R ||
                (typeof R == "object" &&
                  R !== null &&
                  R.$$typeof === jl &&
                  Hu(R) === y.type))
            ? ((y = n(y, h.props)), xa(y, h), (y.return = d), y)
            : ((y = Ln(h.type, h.key, h.props, null, d.mode, z)),
              xa(y, h),
              (y.return = d),
              y);
      }
      function s(d, y, h, z) {
        return y === null ||
          y.tag !== 4 ||
          y.stateNode.containerInfo !== h.containerInfo ||
          y.stateNode.implementation !== h.implementation
          ? ((y = zc(h, d.mode, z)), (y.return = d), y)
          : ((y = n(y, h.children || [])), (y.return = d), y);
      }
      function b(d, y, h, z, R) {
        return y === null || y.tag !== 7
          ? ((y = Du(h, d.mode, z, R)), (y.return = d), y)
          : ((y = n(y, h)), (y.return = d), y);
      }
      function T(d, y, h) {
        if (
          (typeof y == "string" && y !== "") ||
          typeof y == "number" ||
          typeof y == "bigint"
        )
          return ((y = bc("" + y, d.mode, h)), (y.return = d), y);
        if (typeof y == "object" && y !== null) {
          switch (y.$$typeof) {
            case Rl:
              return (
                (h = Ln(y.type, y.key, y.props, null, d.mode, h)),
                xa(h, y),
                (h.return = d),
                h
              );
            case Yl:
              return ((y = zc(y, d.mode, h)), (y.return = d), y);
            case jl:
              return ((y = Hu(y)), T(d, y, h));
          }
          if (U(y) || Ot(y))
            return ((y = Du(y, d.mode, h, null)), (y.return = d), y);
          if (typeof y.then == "function") return T(d, wn(y), h);
          if (y.$$typeof === Ol) return T(d, Vn(d, y), h);
          Wn(d, y);
        }
        return null;
      }
      function o(d, y, h, z) {
        var R = y !== null ? y.key : null;
        if (
          (typeof h == "string" && h !== "") ||
          typeof h == "number" ||
          typeof h == "bigint"
        )
          return R !== null ? null : i(d, y, "" + h, z);
        if (typeof h == "object" && h !== null) {
          switch (h.$$typeof) {
            case Rl:
              return h.key === R ? f(d, y, h, z) : null;
            case Yl:
              return h.key === R ? s(d, y, h, z) : null;
            case jl:
              return ((h = Hu(h)), o(d, y, h, z));
          }
          if (U(h) || Ot(h)) return R !== null ? null : b(d, y, h, z, null);
          if (typeof h.then == "function") return o(d, y, wn(h), z);
          if (h.$$typeof === Ol) return o(d, y, Vn(d, h), z);
          Wn(d, h);
        }
        return null;
      }
      function S(d, y, h, z, R) {
        if (
          (typeof z == "string" && z !== "") ||
          typeof z == "number" ||
          typeof z == "bigint"
        )
          return ((d = d.get(h) || null), i(y, d, "" + z, R));
        if (typeof z == "object" && z !== null) {
          switch (z.$$typeof) {
            case Rl:
              return (
                (d = d.get(z.key === null ? h : z.key) || null),
                f(y, d, z, R)
              );
            case Yl:
              return (
                (d = d.get(z.key === null ? h : z.key) || null),
                s(y, d, z, R)
              );
            case jl:
              return ((z = Hu(z)), S(d, y, h, z, R));
          }
          if (U(z) || Ot(z))
            return ((d = d.get(h) || null), b(y, d, z, R, null));
          if (typeof z.then == "function") return S(d, y, h, wn(z), R);
          if (z.$$typeof === Ol) return S(d, y, h, Vn(y, z), R);
          Wn(y, z);
        }
        return null;
      }
      function C(d, y, h, z) {
        for (
          var R = null, $ = null, p = y, Q = (y = 0), K = null;
          p !== null && Q < h.length;
          Q++
        ) {
          p.index > Q ? ((K = p), (p = null)) : (K = p.sibling);
          var F = o(d, p, h[Q], z);
          if (F === null) {
            p === null && (p = K);
            break;
          }
          (l && p && F.alternate === null && t(d, p),
            (y = e(F, y, Q)),
            $ === null ? (R = F) : ($.sibling = F),
            ($ = F),
            (p = K));
        }
        if (Q === h.length) return (u(d, p), w && Rt(d, Q), R);
        if (p === null) {
          for (; Q < h.length; Q++)
            ((p = T(d, h[Q], z)),
              p !== null &&
                ((y = e(p, y, Q)),
                $ === null ? (R = p) : ($.sibling = p),
                ($ = p)));
          return (w && Rt(d, Q), R);
        }
        for (p = a(p); Q < h.length; Q++)
          ((K = S(p, d, Q, h[Q], z)),
            K !== null &&
              (l &&
                K.alternate !== null &&
                p.delete(K.key === null ? Q : K.key),
              (y = e(K, y, Q)),
              $ === null ? (R = K) : ($.sibling = K),
              ($ = K)));
        return (
          l &&
            p.forEach(function (gu) {
              return t(d, gu);
            }),
          w && Rt(d, Q),
          R
        );
      }
      function Y(d, y, h, z) {
        if (h == null) throw Error(m(151));
        for (
          var R = null, $ = null, p = y, Q = (y = 0), K = null, F = h.next();
          p !== null && !F.done;
          Q++, F = h.next()
        ) {
          p.index > Q ? ((K = p), (p = null)) : (K = p.sibling);
          var gu = o(d, p, F.value, z);
          if (gu === null) {
            p === null && (p = K);
            break;
          }
          (l && p && gu.alternate === null && t(d, p),
            (y = e(gu, y, Q)),
            $ === null ? (R = gu) : ($.sibling = gu),
            ($ = gu),
            (p = K));
        }
        if (F.done) return (u(d, p), w && Rt(d, Q), R);
        if (p === null) {
          for (; !F.done; Q++, F = h.next())
            ((F = T(d, F.value, z)),
              F !== null &&
                ((y = e(F, y, Q)),
                $ === null ? (R = F) : ($.sibling = F),
                ($ = F)));
          return (w && Rt(d, Q), R);
        }
        for (p = a(p); !F.done; Q++, F = h.next())
          ((F = S(p, d, Q, F.value, z)),
            F !== null &&
              (l &&
                F.alternate !== null &&
                p.delete(F.key === null ? Q : F.key),
              (y = e(F, y, Q)),
              $ === null ? (R = F) : ($.sibling = F),
              ($ = F)));
        return (
          l &&
            p.forEach(function (Tm) {
              return t(d, Tm);
            }),
          w && Rt(d, Q),
          R
        );
      }
      function cl(d, y, h, z) {
        if (
          (typeof h == "object" &&
            h !== null &&
            h.type === xl &&
            h.key === null &&
            (h = h.props.children),
          typeof h == "object" && h !== null)
        ) {
          switch (h.$$typeof) {
            case Rl:
              l: {
                for (var R = h.key; y !== null; ) {
                  if (y.key === R) {
                    if (((R = h.type), R === xl)) {
                      if (y.tag === 7) {
                        (u(d, y.sibling),
                          (z = n(y, h.props.children)),
                          (z.return = d),
                          (d = z));
                        break l;
                      }
                    } else if (
                      y.elementType === R ||
                      (typeof R == "object" &&
                        R !== null &&
                        R.$$typeof === jl &&
                        Hu(R) === y.type)
                    ) {
                      (u(d, y.sibling),
                        (z = n(y, h.props)),
                        xa(z, h),
                        (z.return = d),
                        (d = z));
                      break l;
                    }
                    u(d, y);
                    break;
                  } else t(d, y);
                  y = y.sibling;
                }
                h.type === xl
                  ? ((z = Du(h.props.children, d.mode, z, h.key)),
                    (z.return = d),
                    (d = z))
                  : ((z = Ln(h.type, h.key, h.props, null, d.mode, z)),
                    xa(z, h),
                    (z.return = d),
                    (d = z));
              }
              return c(d);
            case Yl:
              l: {
                for (R = h.key; y !== null; ) {
                  if (y.key === R)
                    if (
                      y.tag === 4 &&
                      y.stateNode.containerInfo === h.containerInfo &&
                      y.stateNode.implementation === h.implementation
                    ) {
                      (u(d, y.sibling),
                        (z = n(y, h.children || [])),
                        (z.return = d),
                        (d = z));
                      break l;
                    } else {
                      u(d, y);
                      break;
                    }
                  else t(d, y);
                  y = y.sibling;
                }
                ((z = zc(h, d.mode, z)), (z.return = d), (d = z));
              }
              return c(d);
            case jl:
              return ((h = Hu(h)), cl(d, y, h, z));
          }
          if (U(h)) return C(d, y, h, z);
          if (Ot(h)) {
            if (((R = Ot(h)), typeof R != "function")) throw Error(m(150));
            return ((h = R.call(h)), Y(d, y, h, z));
          }
          if (typeof h.then == "function") return cl(d, y, wn(h), z);
          if (h.$$typeof === Ol) return cl(d, y, Vn(d, h), z);
          Wn(d, h);
        }
        return (typeof h == "string" && h !== "") ||
          typeof h == "number" ||
          typeof h == "bigint"
          ? ((h = "" + h),
            y !== null && y.tag === 6
              ? (u(d, y.sibling), (z = n(y, h)), (z.return = d), (d = z))
              : (u(d, y), (z = bc(h, d.mode, z)), (z.return = d), (d = z)),
            c(d))
          : u(d, y);
      }
      return function (d, y, h, z) {
        try {
          Va = 0;
          var R = cl(d, y, h, z);
          return ((ia = null), R);
        } catch (p) {
          if (p === ca || p === Kn) throw p;
          var $ = lt(29, p, null, d.mode);
          return (($.lanes = z), ($.return = d), $);
        }
      };
    }
    var qu = T0(!0),
      E0 = T0(!1),
      uu = !1;
    function Hc(l) {
      l.updateQueue = {
        baseState: l.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, lanes: 0, hiddenCallbacks: null },
        callbacks: null,
      };
    }
    function Rc(l, t) {
      ((l = l.updateQueue),
        t.updateQueue === l &&
          (t.updateQueue = {
            baseState: l.baseState,
            firstBaseUpdate: l.firstBaseUpdate,
            lastBaseUpdate: l.lastBaseUpdate,
            shared: l.shared,
            callbacks: null,
          }));
    }
    function Bu(l) {
      return { lane: l, tag: 0, payload: null, callback: null, next: null };
    }
    function Yu(l, t, u) {
      var a = l.updateQueue;
      if (a === null) return null;
      if (((a = a.shared), (I & 2) !== 0)) {
        var n = a.pending;
        return (
          n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
          (a.pending = t),
          (t = Qn(l)),
          n0(l, null, u),
          t
        );
      }
      return (Xn(l, a, t, u), Qn(l));
    }
    function Ka(l, t, u) {
      if (
        ((t = t.updateQueue),
        t !== null && ((t = t.shared), (u & 4194048) !== 0))
      ) {
        var a = t.lanes;
        ((a &= l.pendingLanes), (u |= a), (t.lanes = u), df(l, u));
      }
    }
    function qc(l, t) {
      var u = l.updateQueue,
        a = l.alternate;
      if (a !== null && ((a = a.updateQueue), u === a)) {
        var n = null,
          e = null;
        if (((u = u.firstBaseUpdate), u !== null)) {
          do {
            var c = {
              lane: u.lane,
              tag: u.tag,
              payload: u.payload,
              callback: null,
              next: null,
            };
            (e === null ? (n = e = c) : (e = e.next = c), (u = u.next));
          } while (u !== null);
          e === null ? (n = e = t) : (e = e.next = t);
        } else n = e = t;
        ((u = {
          baseState: a.baseState,
          firstBaseUpdate: n,
          lastBaseUpdate: e,
          shared: a.shared,
          callbacks: a.callbacks,
        }),
          (l.updateQueue = u));
        return;
      }
      ((l = u.lastBaseUpdate),
        l === null ? (u.firstBaseUpdate = t) : (l.next = t),
        (u.lastBaseUpdate = t));
    }
    var Bc = !1;
    function Ja() {
      if (Bc) {
        var l = ea;
        if (l !== null) throw l;
      }
    }
    function wa(l, t, u, a) {
      Bc = !1;
      var n = l.updateQueue;
      uu = !1;
      var e = n.firstBaseUpdate,
        c = n.lastBaseUpdate,
        i = n.shared.pending;
      if (i !== null) {
        n.shared.pending = null;
        var f = i,
          s = f.next;
        ((f.next = null), c === null ? (e = s) : (c.next = s), (c = f));
        var b = l.alternate;
        b !== null &&
          ((b = b.updateQueue),
          (i = b.lastBaseUpdate),
          i !== c &&
            (i === null ? (b.firstBaseUpdate = s) : (i.next = s),
            (b.lastBaseUpdate = f)));
      }
      if (e !== null) {
        var T = n.baseState;
        ((c = 0), (b = s = f = null), (i = e));
        do {
          var o = i.lane & -536870913,
            S = o !== i.lane;
          if (S ? (x & o) === o : (a & o) === o) {
            (o !== 0 && o === na && (Bc = !0),
              b !== null &&
                (b = b.next =
                  {
                    lane: 0,
                    tag: i.tag,
                    payload: i.payload,
                    callback: null,
                    next: null,
                  }));
            l: {
              var C = l,
                Y = i;
              o = t;
              var cl = u;
              switch (Y.tag) {
                case 1:
                  if (((C = Y.payload), typeof C == "function")) {
                    T = C.call(cl, T, o);
                    break l;
                  }
                  T = C;
                  break l;
                case 3:
                  C.flags = (C.flags & -65537) | 128;
                case 0:
                  if (
                    ((C = Y.payload),
                    (o = typeof C == "function" ? C.call(cl, T, o) : C),
                    o == null)
                  )
                    break l;
                  T = q({}, T, o);
                  break l;
                case 2:
                  uu = !0;
              }
            }
            ((o = i.callback),
              o !== null &&
                ((l.flags |= 64),
                S && (l.flags |= 8192),
                (S = n.callbacks),
                S === null ? (n.callbacks = [o]) : S.push(o)));
          } else
            ((S = {
              lane: o,
              tag: i.tag,
              payload: i.payload,
              callback: i.callback,
              next: null,
            }),
              b === null ? ((s = b = S), (f = T)) : (b = b.next = S),
              (c |= o));
          if (((i = i.next), i === null)) {
            if (((i = n.shared.pending), i === null)) break;
            ((S = i),
              (i = S.next),
              (S.next = null),
              (n.lastBaseUpdate = S),
              (n.shared.pending = null));
          }
        } while (!0);
        (b === null && (f = T),
          (n.baseState = f),
          (n.firstBaseUpdate = s),
          (n.lastBaseUpdate = b),
          e === null && (n.shared.lanes = 0),
          (iu |= c),
          (l.lanes = c),
          (l.memoizedState = T));
      }
    }
    function A0(l, t) {
      if (typeof l != "function") throw Error(m(191, l));
      l.call(t);
    }
    function _0(l, t) {
      var u = l.callbacks;
      if (u !== null)
        for (l.callbacks = null, l = 0; l < u.length; l++) A0(u[l], t);
    }
    var fa = v(null),
      $n = v(0);
    function O0(l, t) {
      ((l = Vt), M($n, l), M(fa, t), (Vt = l | t.baseLanes));
    }
    function Yc() {
      (M($n, Vt), M(fa, fa.current));
    }
    function jc() {
      ((Vt = $n.current), E(fa), E($n));
    }
    var tt = v(null),
      mt = null;
    function au(l) {
      var t = l.alternate;
      (M(gl, gl.current & 1),
        M(tt, l),
        mt === null &&
          (t === null || fa.current !== null || t.memoizedState !== null) &&
          (mt = l));
    }
    function Gc(l) {
      (M(gl, gl.current), M(tt, l), mt === null && (mt = l));
    }
    function M0(l) {
      l.tag === 22
        ? (M(gl, gl.current), M(tt, l), mt === null && (mt = l))
        : nu(l);
    }
    function nu() {
      (M(gl, gl.current), M(tt, tt.current));
    }
    function ut(l) {
      (E(tt), mt === l && (mt = null), E(gl));
    }
    var gl = v(0);
    function Fn(l) {
      for (var t = l; t !== null; ) {
        if (t.tag === 13) {
          var u = t.memoizedState;
          if (u !== null && ((u = u.dehydrated), u === null || ri(u) || Vi(u)))
            return t;
        } else if (
          t.tag === 19 &&
          (t.memoizedProps.revealOrder === "forwards" ||
            t.memoizedProps.revealOrder === "backwards" ||
            t.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
            t.memoizedProps.revealOrder === "together")
        ) {
          if ((t.flags & 128) !== 0) return t;
        } else if (t.child !== null) {
          ((t.child.return = t), (t = t.child));
          continue;
        }
        if (t === l) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === l) return null;
          t = t.return;
        }
        ((t.sibling.return = t.return), (t = t.sibling));
      }
      return null;
    }
    var Yt = 0,
      X = null,
      nl = null,
      Tl = null,
      kn = !1,
      ya = !1,
      ju = !1,
      In = 0,
      Wa = 0,
      va = null,
      cd = 0;
    function sl() {
      throw Error(m(321));
    }
    function Xc(l, t) {
      if (t === null) return !1;
      for (var u = 0; u < t.length && u < l.length; u++)
        if (!Pl(l[u], t[u])) return !1;
      return !0;
    }
    function Qc(l, t, u, a, n, e) {
      return (
        (Yt = e),
        (X = t),
        (t.memoizedState = null),
        (t.updateQueue = null),
        (t.lanes = 0),
        (O.H = l === null || l.memoizedState === null ? f1 : li),
        (ju = !1),
        (e = u(a, n)),
        (ju = !1),
        ya && (e = U0(t, u, a, n)),
        D0(l),
        e
      );
    }
    function D0(l) {
      O.H = ka;
      var t = nl !== null && nl.next !== null;
      if (((Yt = 0), (Tl = nl = X = null), (kn = !1), (Wa = 0), (va = null), t))
        throw Error(m(300));
      l === null ||
        El ||
        ((l = l.dependencies), l !== null && rn(l) && (El = !0));
    }
    function U0(l, t, u, a) {
      X = l;
      var n = 0;
      do {
        if ((ya && (va = null), (Wa = 0), (ya = !1), 25 <= n))
          throw Error(m(301));
        if (((n += 1), (Tl = nl = null), l.updateQueue != null)) {
          var e = l.updateQueue;
          ((e.lastEffect = null),
            (e.events = null),
            (e.stores = null),
            e.memoCache != null && (e.memoCache.index = 0));
        }
        ((O.H = y1), (e = t(u, a)));
      } while (ya);
      return e;
    }
    function id() {
      var l = O.H,
        t = l.useState()[0];
      return (
        (t = typeof t.then == "function" ? $a(t) : t),
        (l = l.useState()[0]),
        (nl !== null ? nl.memoizedState : null) !== l && (X.flags |= 1024),
        t
      );
    }
    function Lc() {
      var l = In !== 0;
      return ((In = 0), l);
    }
    function Zc(l, t, u) {
      ((t.updateQueue = l.updateQueue), (t.flags &= -2053), (l.lanes &= ~u));
    }
    function rc(l) {
      if (kn) {
        for (l = l.memoizedState; l !== null; ) {
          var t = l.queue;
          (t !== null && (t.pending = null), (l = l.next));
        }
        kn = !1;
      }
      ((Yt = 0), (Tl = nl = X = null), (ya = !1), (Wa = In = 0), (va = null));
    }
    function Bl() {
      var l = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null,
      };
      return (
        Tl === null ? (X.memoizedState = Tl = l) : (Tl = Tl.next = l),
        Tl
      );
    }
    function bl() {
      if (nl === null) {
        var l = X.alternate;
        l = l !== null ? l.memoizedState : null;
      } else l = nl.next;
      var t = Tl === null ? X.memoizedState : Tl.next;
      if (t !== null) ((Tl = t), (nl = l));
      else {
        if (l === null)
          throw X.alternate === null ? Error(m(467)) : Error(m(310));
        ((nl = l),
          (l = {
            memoizedState: nl.memoizedState,
            baseState: nl.baseState,
            baseQueue: nl.baseQueue,
            queue: nl.queue,
            next: null,
          }),
          Tl === null ? (X.memoizedState = Tl = l) : (Tl = Tl.next = l));
      }
      return Tl;
    }
    function Pn() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function $a(l) {
      var t = Wa;
      return (
        (Wa += 1),
        va === null && (va = []),
        (l = g0(va, l, t)),
        (t = X),
        (Tl === null ? t.memoizedState : Tl.next) === null &&
          ((t = t.alternate),
          (O.H = t === null || t.memoizedState === null ? f1 : li)),
        l
      );
    }
    function le(l) {
      if (l !== null && typeof l == "object") {
        if (typeof l.then == "function") return $a(l);
        if (l.$$typeof === Ol) return Cl(l);
      }
      throw Error(m(438, String(l)));
    }
    function Vc(l) {
      var t = null,
        u = X.updateQueue;
      if ((u !== null && (t = u.memoCache), t == null)) {
        var a = X.alternate;
        a !== null &&
          ((a = a.updateQueue),
          a !== null &&
            ((a = a.memoCache),
            a != null &&
              (t = {
                data: a.data.map(function (n) {
                  return n.slice();
                }),
                index: 0,
              })));
      }
      if (
        ((t ??= { data: [], index: 0 }),
        u === null && ((u = Pn()), (X.updateQueue = u)),
        (u.memoCache = t),
        (u = t.data[t.index]),
        u === void 0)
      )
        for (u = t.data[t.index] = Array(l), a = 0; a < l; a++) u[a] = bu;
      return (t.index++, u);
    }
    function jt(l, t) {
      return typeof t == "function" ? t(l) : t;
    }
    function te(l) {
      return xc(bl(), nl, l);
    }
    function xc(l, t, u) {
      var a = l.queue;
      if (a === null) throw Error(m(311));
      a.lastRenderedReducer = u;
      var n = l.baseQueue,
        e = a.pending;
      if (e !== null) {
        if (n !== null) {
          var c = n.next;
          ((n.next = e.next), (e.next = c));
        }
        ((t.baseQueue = n = e), (a.pending = null));
      }
      if (((e = l.baseState), n === null)) l.memoizedState = e;
      else {
        t = n.next;
        var i = (c = null),
          f = null,
          s = t,
          b = !1;
        do {
          var T = s.lane & -536870913;
          if (T !== s.lane ? (x & T) === T : (Yt & T) === T) {
            var o = s.revertLane;
            if (o === 0)
              (f !== null &&
                (f = f.next =
                  {
                    lane: 0,
                    revertLane: 0,
                    gesture: null,
                    action: s.action,
                    hasEagerState: s.hasEagerState,
                    eagerState: s.eagerState,
                    next: null,
                  }),
                T === na && (b = !0));
            else if ((Yt & o) === o) {
              ((s = s.next), o === na && (b = !0));
              continue;
            } else
              ((T = {
                lane: 0,
                revertLane: s.revertLane,
                gesture: null,
                action: s.action,
                hasEagerState: s.hasEagerState,
                eagerState: s.eagerState,
                next: null,
              }),
                f === null ? ((i = f = T), (c = e)) : (f = f.next = T),
                (X.lanes |= o),
                (iu |= o));
            ((T = s.action),
              ju && u(e, T),
              (e = s.hasEagerState ? s.eagerState : u(e, T)));
          } else
            ((o = {
              lane: T,
              revertLane: s.revertLane,
              gesture: s.gesture,
              action: s.action,
              hasEagerState: s.hasEagerState,
              eagerState: s.eagerState,
              next: null,
            }),
              f === null ? ((i = f = o), (c = e)) : (f = f.next = o),
              (X.lanes |= T),
              (iu |= T));
          s = s.next;
        } while (s !== null && s !== t);
        if (
          (f === null ? (c = e) : (f.next = i),
          !Pl(e, l.memoizedState) && ((El = !0), b && ((u = ea), u !== null)))
        )
          throw u;
        ((l.memoizedState = e),
          (l.baseState = c),
          (l.baseQueue = f),
          (a.lastRenderedState = e));
      }
      return (n === null && (a.lanes = 0), [l.memoizedState, a.dispatch]);
    }
    function Kc(l) {
      var t = bl(),
        u = t.queue;
      if (u === null) throw Error(m(311));
      u.lastRenderedReducer = l;
      var a = u.dispatch,
        n = u.pending,
        e = t.memoizedState;
      if (n !== null) {
        u.pending = null;
        var c = (n = n.next);
        do ((e = l(e, c.action)), (c = c.next));
        while (c !== n);
        (Pl(e, t.memoizedState) || (El = !0),
          (t.memoizedState = e),
          t.baseQueue === null && (t.baseState = e),
          (u.lastRenderedState = e));
      }
      return [e, a];
    }
    function N0(l, t, u) {
      var a = X,
        n = bl(),
        e = w;
      if (e) {
        if (u === void 0) throw Error(m(407));
        u = u();
      } else u = t();
      var c = !Pl((nl || n).memoizedState, u);
      if (
        (c && ((n.memoizedState = u), (El = !0)),
        (n = n.queue),
        Wc(H0.bind(null, a, n, l), [l]),
        n.getSnapshot !== t || c || (Tl !== null && Tl.memoizedState.tag & 1))
      ) {
        if (
          ((a.flags |= 2048),
          da(9, { destroy: void 0 }, p0.bind(null, a, n, u, t), null),
          il === null)
        )
          throw Error(m(349));
        e || (Yt & 127) !== 0 || C0(a, t, u);
      }
      return u;
    }
    function C0(l, t, u) {
      ((l.flags |= 16384),
        (l = { getSnapshot: t, value: u }),
        (t = X.updateQueue),
        t === null
          ? ((t = Pn()), (X.updateQueue = t), (t.stores = [l]))
          : ((u = t.stores), u === null ? (t.stores = [l]) : u.push(l)));
    }
    function p0(l, t, u, a) {
      ((t.value = u), (t.getSnapshot = a), R0(t) && q0(l));
    }
    function H0(l, t, u) {
      return u(function () {
        R0(t) && q0(l);
      });
    }
    function R0(l) {
      var t = l.getSnapshot;
      l = l.value;
      try {
        var u = t();
        return !Pl(l, u);
      } catch {
        return !0;
      }
    }
    function q0(l) {
      var t = Mu(l, 2);
      t !== null && Vl(t, l, 2);
    }
    function Jc(l) {
      var t = Bl();
      if (typeof l == "function") {
        var u = l;
        if (((l = u()), ju)) {
          $t(!0);
          try {
            u();
          } finally {
            $t(!1);
          }
        }
      }
      return (
        (t.memoizedState = t.baseState = l),
        (t.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: jt,
          lastRenderedState: l,
        }),
        t
      );
    }
    function B0(l, t, u, a) {
      return ((l.baseState = u), xc(l, nl, typeof a == "function" ? a : jt));
    }
    function fd(l, t, u, a, n) {
      if (ne(l)) throw Error(m(485));
      if (((l = t.action), l !== null)) {
        var e = {
          payload: n,
          action: l,
          next: null,
          isTransition: !0,
          status: "pending",
          value: null,
          reason: null,
          listeners: [],
          then: function (c) {
            e.listeners.push(c);
          },
        };
        (O.T !== null ? u(!0) : (e.isTransition = !1),
          a(e),
          (u = t.pending),
          u === null
            ? ((e.next = t.pending = e), Y0(t, e))
            : ((e.next = u.next), (t.pending = u.next = e)));
      }
    }
    function Y0(l, t) {
      var u = t.action,
        a = t.payload,
        n = l.state;
      if (t.isTransition) {
        var e = O.T,
          c = {};
        O.T = c;
        try {
          var i = u(n, a),
            f = O.S;
          (f !== null && f(c, i), j0(l, t, i));
        } catch (s) {
          wc(l, t, s);
        } finally {
          (e !== null && c.types !== null && (e.types = c.types), (O.T = e));
        }
      } else
        try {
          ((e = u(n, a)), j0(l, t, e));
        } catch (s) {
          wc(l, t, s);
        }
    }
    function j0(l, t, u) {
      u !== null && typeof u == "object" && typeof u.then == "function"
        ? u.then(
            function (a) {
              G0(l, t, a);
            },
            function (a) {
              return wc(l, t, a);
            },
          )
        : G0(l, t, u);
    }
    function G0(l, t, u) {
      ((t.status = "fulfilled"),
        (t.value = u),
        X0(t),
        (l.state = u),
        (t = l.pending),
        t !== null &&
          ((u = t.next),
          u === t
            ? (l.pending = null)
            : ((u = u.next), (t.next = u), Y0(l, u))));
    }
    function wc(l, t, u) {
      var a = l.pending;
      if (((l.pending = null), a !== null)) {
        a = a.next;
        do ((t.status = "rejected"), (t.reason = u), X0(t), (t = t.next));
        while (t !== a);
      }
      l.action = null;
    }
    function X0(l) {
      l = l.listeners;
      for (var t = 0; t < l.length; t++) (0, l[t])();
    }
    function Q0(l, t) {
      return t;
    }
    function L0(l, t) {
      if (w) {
        var u = il.formState;
        if (u !== null) {
          l: {
            var a = X;
            if (w) {
              if (vl) {
                t: {
                  for (var n = vl, e = dt; n.nodeType !== 8; ) {
                    if (!e) {
                      n = null;
                      break t;
                    }
                    if (((n = st(n.nextSibling)), n === null)) {
                      n = null;
                      break t;
                    }
                  }
                  ((e = n.data), (n = e === "F!" || e === "F" ? n : null));
                }
                if (n) {
                  ((vl = st(n.nextSibling)), (a = n.data === "F!"));
                  break l;
                }
              }
              lu(a);
            }
            a = !1;
          }
          a && (t = u[0]);
        }
      }
      return (
        (u = Bl()),
        (u.memoizedState = u.baseState = t),
        (a = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Q0,
          lastRenderedState: t,
        }),
        (u.queue = a),
        (u = e1.bind(null, X, a)),
        (a.dispatch = u),
        (a = Jc(!1)),
        (e = Pc.bind(null, X, !1, a.queue)),
        (a = Bl()),
        (n = { state: t, dispatch: null, action: l, pending: null }),
        (a.queue = n),
        (u = fd.bind(null, X, n, e, u)),
        (n.dispatch = u),
        (a.memoizedState = l),
        [t, u, !1]
      );
    }
    function Z0(l) {
      return r0(bl(), nl, l);
    }
    function r0(l, t, u) {
      if (
        ((t = xc(l, t, Q0)[0]),
        (l = te(jt)[0]),
        typeof t == "object" && t !== null && typeof t.then == "function")
      )
        try {
          var a = $a(t);
        } catch (c) {
          throw c === ca ? Kn : c;
        }
      else a = t;
      t = bl();
      var n = t.queue,
        e = n.dispatch;
      return (
        u !== t.memoizedState &&
          ((X.flags |= 2048),
          da(9, { destroy: void 0 }, yd.bind(null, n, u), null)),
        [a, e, l]
      );
    }
    function yd(l, t) {
      l.action = t;
    }
    function V0(l) {
      var t = bl(),
        u = nl;
      if (u !== null) return r0(t, u, l);
      (bl(), (t = t.memoizedState), (u = bl()));
      var a = u.queue.dispatch;
      return ((u.memoizedState = l), [t, a, !1]);
    }
    function da(l, t, u, a) {
      return (
        (l = { tag: l, create: u, deps: a, inst: t, next: null }),
        (t = X.updateQueue),
        t === null && ((t = Pn()), (X.updateQueue = t)),
        (u = t.lastEffect),
        u === null
          ? (t.lastEffect = l.next = l)
          : ((a = u.next), (u.next = l), (l.next = a), (t.lastEffect = l)),
        l
      );
    }
    function x0() {
      return bl().memoizedState;
    }
    function ue(l, t, u, a) {
      var n = Bl();
      ((X.flags |= l),
        (n.memoizedState = da(
          1 | t,
          { destroy: void 0 },
          u,
          a === void 0 ? null : a,
        )));
    }
    function ae(l, t, u, a) {
      var n = bl();
      a = a === void 0 ? null : a;
      var e = n.memoizedState.inst;
      nl !== null && a !== null && Xc(a, nl.memoizedState.deps)
        ? (n.memoizedState = da(t, e, u, a))
        : ((X.flags |= l), (n.memoizedState = da(1 | t, e, u, a)));
    }
    function K0(l, t) {
      ue(8390656, 8, l, t);
    }
    function Wc(l, t) {
      ae(2048, 8, l, t);
    }
    function vd(l) {
      X.flags |= 4;
      var t = X.updateQueue;
      if (t === null) ((t = Pn()), (X.updateQueue = t), (t.events = [l]));
      else {
        var u = t.events;
        u === null ? (t.events = [l]) : u.push(l);
      }
    }
    function J0(l) {
      var t = bl().memoizedState;
      return (
        vd({ ref: t, nextImpl: l }),
        function () {
          if ((I & 2) !== 0) throw Error(m(440));
          return t.impl.apply(void 0, arguments);
        }
      );
    }
    function w0(l, t) {
      return ae(4, 2, l, t);
    }
    function W0(l, t) {
      return ae(4, 4, l, t);
    }
    function $0(l, t) {
      if (typeof t == "function") {
        l = l();
        var u = t(l);
        return function () {
          typeof u == "function" ? u() : t(null);
        };
      }
      if (t != null)
        return (
          (l = l()),
          (t.current = l),
          function () {
            t.current = null;
          }
        );
    }
    function F0(l, t, u) {
      ((u = u != null ? u.concat([l]) : null),
        ae(4, 4, $0.bind(null, t, l), u));
    }
    function $c() {}
    function k0(l, t) {
      var u = bl();
      t = t === void 0 ? null : t;
      var a = u.memoizedState;
      return t !== null && Xc(t, a[1]) ? a[0] : ((u.memoizedState = [l, t]), l);
    }
    function I0(l, t) {
      var u = bl();
      t = t === void 0 ? null : t;
      var a = u.memoizedState;
      if (t !== null && Xc(t, a[1])) return a[0];
      if (((a = l()), ju)) {
        $t(!0);
        try {
          l();
        } finally {
          $t(!1);
        }
      }
      return ((u.memoizedState = [a, t]), a);
    }
    function Fc(l, t, u) {
      return u === void 0 || ((Yt & 1073741824) !== 0 && (x & 261930) === 0)
        ? (l.memoizedState = t)
        : ((l.memoizedState = u), (l = F1()), (X.lanes |= l), (iu |= l), u);
    }
    function P0(l, t, u, a) {
      return Pl(u, t)
        ? u
        : fa.current !== null
          ? ((l = Fc(l, u, a)), Pl(l, t) || (El = !0), l)
          : (Yt & 42) === 0 || ((Yt & 1073741824) !== 0 && (x & 261930) === 0)
            ? ((El = !0), (l.memoizedState = u))
            : ((l = F1()), (X.lanes |= l), (iu |= l), t);
    }
    function l1(l, t, u, a, n) {
      var e = D.p;
      D.p = e !== 0 && 8 > e ? e : 8;
      var c = O.T,
        i = {};
      ((O.T = i), Pc(l, !1, t, u));
      try {
        var f = n(),
          s = O.S;
        (s !== null && s(i, f),
          f !== null && typeof f == "object" && typeof f.then == "function"
            ? Fa(l, t, ed(f, a), ht(l))
            : Fa(l, t, a, ht(l)));
      } catch (b) {
        Fa(l, t, { then: function () {}, status: "rejected", reason: b }, ht());
      } finally {
        ((D.p = e),
          c !== null && i.types !== null && (c.types = i.types),
          (O.T = c));
      }
    }
    function dd() {}
    function kc(l, t, u, a) {
      if (l.tag !== 5) throw Error(m(476));
      var n = t1(l).queue;
      l1(
        l,
        n,
        t,
        k,
        u === null
          ? dd
          : function () {
              return (u1(l), u(a));
            },
      );
    }
    function t1(l) {
      var t = l.memoizedState;
      if (t !== null) return t;
      t = {
        memoizedState: k,
        baseState: k,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: jt,
          lastRenderedState: k,
        },
        next: null,
      };
      var u = {};
      return (
        (t.next = {
          memoizedState: u,
          baseState: u,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: jt,
            lastRenderedState: u,
          },
          next: null,
        }),
        (l.memoizedState = t),
        (l = l.alternate),
        l !== null && (l.memoizedState = t),
        t
      );
    }
    function u1(l) {
      var t = t1(l);
      (t.next === null && (t = l.alternate.memoizedState),
        Fa(l, t.next.queue, {}, ht()));
    }
    function Ic() {
      return Cl(sn);
    }
    function a1() {
      return bl().memoizedState;
    }
    function n1() {
      return bl().memoizedState;
    }
    function md(l) {
      for (var t = l.return; t !== null; ) {
        switch (t.tag) {
          case 24:
          case 3:
            var u = ht();
            l = Bu(u);
            var a = Yu(t, l, u);
            (a !== null && (Vl(a, t, u), Ka(a, t, u)),
              (t = { cache: Uc() }),
              (l.payload = t));
            return;
        }
        t = t.return;
      }
    }
    function hd(l, t, u) {
      var a = ht();
      ((u = {
        lane: a,
        revertLane: 0,
        gesture: null,
        action: u,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
        ne(l)
          ? c1(t, u)
          : ((u = Sc(l, t, u, a)), u !== null && (Vl(u, l, a), i1(u, t, a))));
    }
    function e1(l, t, u) {
      Fa(l, t, u, ht());
    }
    function Fa(l, t, u, a) {
      var n = {
        lane: a,
        revertLane: 0,
        gesture: null,
        action: u,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
      if (ne(l)) c1(t, n);
      else {
        var e = l.alternate;
        if (
          l.lanes === 0 &&
          (e === null || e.lanes === 0) &&
          ((e = t.lastRenderedReducer), e !== null)
        )
          try {
            var c = t.lastRenderedState,
              i = e(c, u);
            if (((n.hasEagerState = !0), (n.eagerState = i), Pl(i, c)))
              return (Xn(l, t, n, 0), il === null && Gn(), !1);
          } catch {}
        if (((u = Sc(l, t, n, a)), u !== null))
          return (Vl(u, l, a), i1(u, t, a), !0);
      }
      return !1;
    }
    function Pc(l, t, u, a) {
      if (
        ((a = {
          lane: 2,
          revertLane: Hi(),
          gesture: null,
          action: a,
          hasEagerState: !1,
          eagerState: null,
          next: null,
        }),
        ne(l))
      ) {
        if (t) throw Error(m(479));
      } else ((t = Sc(l, u, a, 2)), t !== null && Vl(t, l, 2));
    }
    function ne(l) {
      var t = l.alternate;
      return l === X || (t !== null && t === X);
    }
    function c1(l, t) {
      ya = kn = !0;
      var u = l.pending;
      (u === null ? (t.next = t) : ((t.next = u.next), (u.next = t)),
        (l.pending = t));
    }
    function i1(l, t, u) {
      if ((u & 4194048) !== 0) {
        var a = t.lanes;
        ((a &= l.pendingLanes), (u |= a), (t.lanes = u), df(l, u));
      }
    }
    var ka = {
      readContext: Cl,
      use: le,
      useCallback: sl,
      useContext: sl,
      useEffect: sl,
      useImperativeHandle: sl,
      useLayoutEffect: sl,
      useInsertionEffect: sl,
      useMemo: sl,
      useReducer: sl,
      useRef: sl,
      useState: sl,
      useDebugValue: sl,
      useDeferredValue: sl,
      useTransition: sl,
      useSyncExternalStore: sl,
      useId: sl,
      useHostTransitionStatus: sl,
      useFormState: sl,
      useActionState: sl,
      useOptimistic: sl,
      useMemoCache: sl,
      useCacheRefresh: sl,
    };
    ka.useEffectEvent = sl;
    var f1 = {
        readContext: Cl,
        use: le,
        useCallback: function (l, t) {
          return ((Bl().memoizedState = [l, t === void 0 ? null : t]), l);
        },
        useContext: Cl,
        useEffect: K0,
        useImperativeHandle: function (l, t, u) {
          ((u = u != null ? u.concat([l]) : null),
            ue(4194308, 4, $0.bind(null, t, l), u));
        },
        useLayoutEffect: function (l, t) {
          return ue(4194308, 4, l, t);
        },
        useInsertionEffect: function (l, t) {
          ue(4, 2, l, t);
        },
        useMemo: function (l, t) {
          var u = Bl();
          t = t === void 0 ? null : t;
          var a = l();
          if (ju) {
            $t(!0);
            try {
              l();
            } finally {
              $t(!1);
            }
          }
          return ((u.memoizedState = [a, t]), a);
        },
        useReducer: function (l, t, u) {
          var a = Bl();
          if (u !== void 0) {
            var n = u(t);
            if (ju) {
              $t(!0);
              try {
                u(t);
              } finally {
                $t(!1);
              }
            }
          } else n = t;
          return (
            (a.memoizedState = a.baseState = n),
            (l = {
              pending: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: l,
              lastRenderedState: n,
            }),
            (a.queue = l),
            (l = l.dispatch = hd.bind(null, X, l)),
            [a.memoizedState, l]
          );
        },
        useRef: function (l) {
          var t = Bl();
          return ((l = { current: l }), (t.memoizedState = l));
        },
        useState: function (l) {
          l = Jc(l);
          var t = l.queue,
            u = e1.bind(null, X, t);
          return ((t.dispatch = u), [l.memoizedState, u]);
        },
        useDebugValue: $c,
        useDeferredValue: function (l, t) {
          return Fc(Bl(), l, t);
        },
        useTransition: function () {
          var l = Jc(!1);
          return (
            (l = l1.bind(null, X, l.queue, !0, !1)),
            (Bl().memoizedState = l),
            [!1, l]
          );
        },
        useSyncExternalStore: function (l, t, u) {
          var a = X,
            n = Bl();
          if (w) {
            if (u === void 0) throw Error(m(407));
            u = u();
          } else {
            if (((u = t()), il === null)) throw Error(m(349));
            (x & 127) !== 0 || C0(a, t, u);
          }
          n.memoizedState = u;
          var e = { value: u, getSnapshot: t };
          return (
            (n.queue = e),
            K0(H0.bind(null, a, e, l), [l]),
            (a.flags |= 2048),
            da(9, { destroy: void 0 }, p0.bind(null, a, e, u, t), null),
            u
          );
        },
        useId: function () {
          var l = Bl(),
            t = il.identifierPrefix;
          if (w) {
            var u = Dt,
              a = Mt;
            ((u = (a & ~(1 << (32 - Il(a) - 1))).toString(32) + u),
              (t = "_" + t + "R_" + u),
              (u = In++),
              0 < u && (t += "H" + u.toString(32)),
              (t += "_"));
          } else ((u = cd++), (t = "_" + t + "r_" + u.toString(32) + "_"));
          return (l.memoizedState = t);
        },
        useHostTransitionStatus: Ic,
        useFormState: L0,
        useActionState: L0,
        useOptimistic: function (l) {
          var t = Bl();
          t.memoizedState = t.baseState = l;
          var u = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: null,
            lastRenderedState: null,
          };
          return (
            (t.queue = u),
            (t = Pc.bind(null, X, !0, u)),
            (u.dispatch = t),
            [l, t]
          );
        },
        useMemoCache: Vc,
        useCacheRefresh: function () {
          return (Bl().memoizedState = md.bind(null, X));
        },
        useEffectEvent: function (l) {
          var t = Bl(),
            u = { impl: l };
          return (
            (t.memoizedState = u),
            function () {
              if ((I & 2) !== 0) throw Error(m(440));
              return u.impl.apply(void 0, arguments);
            }
          );
        },
      },
      li = {
        readContext: Cl,
        use: le,
        useCallback: k0,
        useContext: Cl,
        useEffect: Wc,
        useImperativeHandle: F0,
        useInsertionEffect: w0,
        useLayoutEffect: W0,
        useMemo: I0,
        useReducer: te,
        useRef: x0,
        useState: function () {
          return te(jt);
        },
        useDebugValue: $c,
        useDeferredValue: function (l, t) {
          return P0(bl(), nl.memoizedState, l, t);
        },
        useTransition: function () {
          var l = te(jt)[0],
            t = bl().memoizedState;
          return [typeof l == "boolean" ? l : $a(l), t];
        },
        useSyncExternalStore: N0,
        useId: a1,
        useHostTransitionStatus: Ic,
        useFormState: Z0,
        useActionState: Z0,
        useOptimistic: function (l, t) {
          return B0(bl(), nl, l, t);
        },
        useMemoCache: Vc,
        useCacheRefresh: n1,
      };
    li.useEffectEvent = J0;
    var y1 = {
      readContext: Cl,
      use: le,
      useCallback: k0,
      useContext: Cl,
      useEffect: Wc,
      useImperativeHandle: F0,
      useInsertionEffect: w0,
      useLayoutEffect: W0,
      useMemo: I0,
      useReducer: Kc,
      useRef: x0,
      useState: function () {
        return Kc(jt);
      },
      useDebugValue: $c,
      useDeferredValue: function (l, t) {
        var u = bl();
        return nl === null ? Fc(u, l, t) : P0(u, nl.memoizedState, l, t);
      },
      useTransition: function () {
        var l = Kc(jt)[0],
          t = bl().memoizedState;
        return [typeof l == "boolean" ? l : $a(l), t];
      },
      useSyncExternalStore: N0,
      useId: a1,
      useHostTransitionStatus: Ic,
      useFormState: V0,
      useActionState: V0,
      useOptimistic: function (l, t) {
        var u = bl();
        return nl !== null
          ? B0(u, nl, l, t)
          : ((u.baseState = l), [l, u.queue.dispatch]);
      },
      useMemoCache: Vc,
      useCacheRefresh: n1,
    };
    y1.useEffectEvent = J0;
    function ti(l, t, u, a) {
      ((t = l.memoizedState),
        (u = u(a, t)),
        (u = u == null ? t : q({}, t, u)),
        (l.memoizedState = u),
        l.lanes === 0 && (l.updateQueue.baseState = u));
    }
    var ui = {
      enqueueSetState: function (l, t, u) {
        l = l._reactInternals;
        var a = ht(),
          n = Bu(a);
        ((n.payload = t),
          u != null && (n.callback = u),
          (t = Yu(l, n, a)),
          t !== null && (Vl(t, l, a), Ka(t, l, a)));
      },
      enqueueReplaceState: function (l, t, u) {
        l = l._reactInternals;
        var a = ht(),
          n = Bu(a);
        ((n.tag = 1),
          (n.payload = t),
          u != null && (n.callback = u),
          (t = Yu(l, n, a)),
          t !== null && (Vl(t, l, a), Ka(t, l, a)));
      },
      enqueueForceUpdate: function (l, t) {
        l = l._reactInternals;
        var u = ht(),
          a = Bu(u);
        ((a.tag = 2),
          t != null && (a.callback = t),
          (t = Yu(l, a, u)),
          t !== null && (Vl(t, l, u), Ka(t, l, u)));
      },
    };
    function v1(l, t, u, a, n, e, c) {
      return (
        (l = l.stateNode),
        typeof l.shouldComponentUpdate == "function"
          ? l.shouldComponentUpdate(a, e, c)
          : t.prototype && t.prototype.isPureReactComponent
            ? !Ga(u, a) || !Ga(n, e)
            : !0
      );
    }
    function d1(l, t, u, a) {
      ((l = t.state),
        typeof t.componentWillReceiveProps == "function" &&
          t.componentWillReceiveProps(u, a),
        typeof t.UNSAFE_componentWillReceiveProps == "function" &&
          t.UNSAFE_componentWillReceiveProps(u, a),
        t.state !== l && ui.enqueueReplaceState(t, t.state, null));
    }
    function Gu(l, t) {
      var u = t;
      if ("ref" in t) {
        u = {};
        for (var a in t) a !== "ref" && (u[a] = t[a]);
      }
      if ((l = l.defaultProps)) {
        u === t && (u = q({}, u));
        for (var n in l) u[n] === void 0 && (u[n] = l[n]);
      }
      return u;
    }
    function sd(l) {
      jn(l);
    }
    function od(l) {
      console.error(l);
    }
    function Sd(l) {
      jn(l);
    }
    function ee(l, t) {
      try {
        var u = l.onUncaughtError;
        u(t.value, { componentStack: t.stack });
      } catch (a) {
        setTimeout(function () {
          throw a;
        });
      }
    }
    function m1(l, t, u) {
      try {
        var a = l.onCaughtError;
        a(u.value, {
          componentStack: u.stack,
          errorBoundary: t.tag === 1 ? t.stateNode : null,
        });
      } catch (n) {
        setTimeout(function () {
          throw n;
        });
      }
    }
    function ai(l, t, u) {
      return (
        (u = Bu(u)),
        (u.tag = 3),
        (u.payload = { element: null }),
        (u.callback = function () {
          ee(l, t);
        }),
        u
      );
    }
    function h1(l) {
      return ((l = Bu(l)), (l.tag = 3), l);
    }
    function s1(l, t, u, a) {
      var n = u.type.getDerivedStateFromError;
      if (typeof n == "function") {
        var e = a.value;
        ((l.payload = function () {
          return n(e);
        }),
          (l.callback = function () {
            m1(t, u, a);
          }));
      }
      var c = u.stateNode;
      c !== null &&
        typeof c.componentDidCatch == "function" &&
        (l.callback = function () {
          (m1(t, u, a),
            typeof n != "function" &&
              (fu === null ? (fu = new Set([this])) : fu.add(this)));
          var i = a.stack;
          this.componentDidCatch(a.value, {
            componentStack: i !== null ? i : "",
          });
        });
    }
    function gd(l, t, u, a, n) {
      if (
        ((u.flags |= 32768),
        a !== null && typeof a == "object" && typeof a.then == "function")
      ) {
        if (
          ((t = u.alternate),
          t !== null && aa(t, u, n, !0),
          (u = tt.current),
          u !== null)
        ) {
          switch (u.tag) {
            case 31:
            case 13:
              return (
                mt === null
                  ? ge()
                  : u.alternate === null && ol === 0 && (ol = 3),
                (u.flags &= -257),
                (u.flags |= 65536),
                (u.lanes = n),
                a === Jn
                  ? (u.flags |= 16384)
                  : ((t = u.updateQueue),
                    t === null ? (u.updateQueue = new Set([a])) : t.add(a),
                    Ni(l, a, n)),
                !1
              );
            case 22:
              return (
                (u.flags |= 65536),
                a === Jn
                  ? (u.flags |= 16384)
                  : ((t = u.updateQueue),
                    t === null
                      ? ((t = {
                          transitions: null,
                          markerInstances: null,
                          retryQueue: new Set([a]),
                        }),
                        (u.updateQueue = t))
                      : ((u = t.retryQueue),
                        u === null ? (t.retryQueue = new Set([a])) : u.add(a)),
                    Ni(l, a, n)),
                !1
              );
          }
          throw Error(m(435, u.tag));
        }
        return (Ni(l, a, n), ge(), !1);
      }
      if (w)
        return (
          (t = tt.current),
          t !== null
            ? ((t.flags & 65536) === 0 && (t.flags |= 256),
              (t.flags |= 65536),
              (t.lanes = n),
              a !== Ac && ((l = Error(m(422), { cause: a })), La(ft(l, u))))
            : (a !== Ac && ((t = Error(m(423), { cause: a })), La(ft(t, u))),
              (l = l.current.alternate),
              (l.flags |= 65536),
              (n &= -n),
              (l.lanes |= n),
              (a = ft(a, u)),
              (n = ai(l.stateNode, a, n)),
              qc(l, n),
              ol !== 4 && (ol = 2)),
          !1
        );
      var e = Error(m(520), { cause: a });
      if (
        ((e = ft(e, u)),
        en === null ? (en = [e]) : en.push(e),
        ol !== 4 && (ol = 2),
        t === null)
      )
        return !0;
      ((a = ft(a, u)), (u = t));
      do {
        switch (u.tag) {
          case 3:
            return (
              (u.flags |= 65536),
              (l = n & -n),
              (u.lanes |= l),
              (l = ai(u.stateNode, a, l)),
              qc(u, l),
              !1
            );
          case 1:
            if (
              ((t = u.type),
              (e = u.stateNode),
              (u.flags & 128) === 0 &&
                (typeof t.getDerivedStateFromError == "function" ||
                  (e !== null &&
                    typeof e.componentDidCatch == "function" &&
                    (fu === null || !fu.has(e)))))
            )
              return (
                (u.flags |= 65536),
                (n &= -n),
                (u.lanes |= n),
                (n = h1(n)),
                s1(n, l, u, a),
                qc(u, n),
                !1
              );
        }
        u = u.return;
      } while (u !== null);
      return !1;
    }
    var ni = Error(m(461)),
      El = !1;
    function pl(l, t, u, a) {
      t.child = l === null ? E0(t, null, u, a) : qu(t, l.child, u, a);
    }
    function o1(l, t, u, a, n) {
      u = u.render;
      var e = t.ref;
      if ("ref" in a) {
        var c = {};
        for (var i in a) i !== "ref" && (c[i] = a[i]);
      } else c = a;
      return (
        Cu(t),
        (a = Qc(l, t, u, c, e, n)),
        (i = Lc()),
        l !== null && !El
          ? (Zc(l, t, n), Gt(l, t, n))
          : (w && i && Tc(t), (t.flags |= 1), pl(l, t, a, n), t.child)
      );
    }
    function S1(l, t, u, a, n) {
      if (l === null) {
        var e = u.type;
        return typeof e == "function" &&
          !gc(e) &&
          e.defaultProps === void 0 &&
          u.compare === null
          ? ((t.tag = 15), (t.type = e), g1(l, t, e, a, n))
          : ((l = Ln(u.type, null, a, t, t.mode, n)),
            (l.ref = t.ref),
            (l.return = t),
            (t.child = l));
      }
      if (((e = l.child), !mi(l, n))) {
        var c = e.memoizedProps;
        if (
          ((u = u.compare),
          (u = u !== null ? u : Ga),
          u(c, a) && l.ref === t.ref)
        )
          return Gt(l, t, n);
      }
      return (
        (t.flags |= 1),
        (l = Ht(e, a)),
        (l.ref = t.ref),
        (l.return = t),
        (t.child = l)
      );
    }
    function g1(l, t, u, a, n) {
      if (l !== null) {
        var e = l.memoizedProps;
        if (Ga(e, a) && l.ref === t.ref)
          if (((El = !1), (t.pendingProps = a = e), mi(l, n)))
            (l.flags & 131072) !== 0 && (El = !0);
          else return ((t.lanes = l.lanes), Gt(l, t, n));
      }
      return ei(l, t, u, a, n);
    }
    function b1(l, t, u, a) {
      var n = a.children,
        e = l !== null ? l.memoizedState : null;
      if (
        (l === null &&
          t.stateNode === null &&
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        a.mode === "hidden")
      ) {
        if ((t.flags & 128) !== 0) {
          if (((e = e !== null ? e.baseLanes | u : u), l !== null)) {
            for (a = t.child = l.child, n = 0; a !== null; )
              ((n = n | a.lanes | a.childLanes), (a = a.sibling));
            a = n & ~e;
          } else ((a = 0), (t.child = null));
          return z1(l, t, e, u, a);
        }
        if ((u & 536870912) !== 0)
          ((t.memoizedState = { baseLanes: 0, cachePool: null }),
            l !== null && xn(t, e !== null ? e.cachePool : null),
            e !== null ? O0(t, e) : Yc(),
            M0(t));
        else
          return (
            (a = t.lanes = 536870912),
            z1(l, t, e !== null ? e.baseLanes | u : u, u, a)
          );
      } else
        e !== null
          ? (xn(t, e.cachePool), O0(t, e), nu(t), (t.memoizedState = null))
          : (l !== null && xn(t, null), Yc(), nu(t));
      return (pl(l, t, n, u), t.child);
    }
    function Ia(l, t) {
      return (
        (l !== null && l.tag === 22) ||
          t.stateNode !== null ||
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        t.sibling
      );
    }
    function z1(l, t, u, a, n) {
      var e = Cc();
      return (
        (e = e === null ? null : { parent: zl._currentValue, pool: e }),
        (t.memoizedState = { baseLanes: u, cachePool: e }),
        l !== null && xn(t, null),
        Yc(),
        M0(t),
        l !== null && aa(l, t, a, !0),
        (t.childLanes = n),
        null
      );
    }
    function ce(l, t) {
      return (
        (t = fe({ mode: t.mode, children: t.children }, l.mode)),
        (t.ref = l.ref),
        (l.child = t),
        (t.return = l),
        t
      );
    }
    function T1(l, t, u) {
      return (
        qu(t, l.child, null, u),
        (l = ce(t, t.pendingProps)),
        (l.flags |= 2),
        ut(t),
        (t.memoizedState = null),
        l
      );
    }
    function bd(l, t, u) {
      var a = t.pendingProps,
        n = (t.flags & 128) !== 0;
      if (((t.flags &= -129), l === null)) {
        if (w) {
          if (a.mode === "hidden")
            return ((l = ce(t, a)), (t.lanes = 536870912), Ia(null, l));
          if (
            (Gc(t),
            (l = vl)
              ? ((l = qy(l, dt)),
                (l = l !== null && l.data === "&" ? l : null),
                l !== null &&
                  ((t.memoizedState = {
                    dehydrated: l,
                    treeContext: It !== null ? { id: Mt, overflow: Dt } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (u = c0(l)),
                  (u.return = t),
                  (t.child = u),
                  (Nl = t),
                  (vl = null)))
              : (l = null),
            l === null)
          )
            throw lu(t);
          return ((t.lanes = 536870912), null);
        }
        return ce(t, a);
      }
      var e = l.memoizedState;
      if (e !== null) {
        var c = e.dehydrated;
        if ((Gc(t), n))
          if (t.flags & 256) ((t.flags &= -257), (t = T1(l, t, u)));
          else if (t.memoizedState !== null)
            ((t.child = l.child), (t.flags |= 128), (t = null));
          else throw Error(m(558));
        else if (
          (El || aa(l, t, u, !1), (n = (u & l.childLanes) !== 0), El || n)
        ) {
          if (
            ((a = il),
            a !== null && ((c = mf(a, u)), c !== 0 && c !== e.retryLane))
          )
            throw ((e.retryLane = c), Mu(l, c), Vl(a, l, c), ni);
          (ge(), (t = T1(l, t, u)));
        } else
          ((l = e.treeContext),
            (vl = st(c.nextSibling)),
            (Nl = t),
            (w = !0),
            (Pt = null),
            (dt = !1),
            l !== null && y0(t, l),
            (t = ce(t, a)),
            (t.flags |= 4096));
        return t;
      }
      return (
        (l = Ht(l.child, { mode: a.mode, children: a.children })),
        (l.ref = t.ref),
        (t.child = l),
        (l.return = t),
        l
      );
    }
    function ie(l, t) {
      var u = t.ref;
      if (u === null) l !== null && l.ref !== null && (t.flags |= 4194816);
      else {
        if (typeof u != "function" && typeof u != "object") throw Error(m(284));
        (l === null || l.ref !== u) && (t.flags |= 4194816);
      }
    }
    function ei(l, t, u, a, n) {
      return (
        Cu(t),
        (u = Qc(l, t, u, a, void 0, n)),
        (a = Lc()),
        l !== null && !El
          ? (Zc(l, t, n), Gt(l, t, n))
          : (w && a && Tc(t), (t.flags |= 1), pl(l, t, u, n), t.child)
      );
    }
    function E1(l, t, u, a, n, e) {
      return (
        Cu(t),
        (t.updateQueue = null),
        (u = U0(t, a, u, n)),
        D0(l),
        (a = Lc()),
        l !== null && !El
          ? (Zc(l, t, e), Gt(l, t, e))
          : (w && a && Tc(t), (t.flags |= 1), pl(l, t, u, e), t.child)
      );
    }
    function A1(l, t, u, a, n) {
      if ((Cu(t), t.stateNode === null)) {
        var e = Pu,
          c = u.contextType;
        (typeof c == "object" && c !== null && (e = Cl(c)),
          (e = new u(a, e)),
          (t.memoizedState =
            e.state !== null && e.state !== void 0 ? e.state : null),
          (e.updater = ui),
          (t.stateNode = e),
          (e._reactInternals = t),
          (e = t.stateNode),
          (e.props = a),
          (e.state = t.memoizedState),
          (e.refs = {}),
          Hc(t),
          (c = u.contextType),
          (e.context = typeof c == "object" && c !== null ? Cl(c) : Pu),
          (e.state = t.memoizedState),
          (c = u.getDerivedStateFromProps),
          typeof c == "function" &&
            (ti(t, u, c, a), (e.state = t.memoizedState)),
          typeof u.getDerivedStateFromProps == "function" ||
            typeof e.getSnapshotBeforeUpdate == "function" ||
            (typeof e.UNSAFE_componentWillMount != "function" &&
              typeof e.componentWillMount != "function") ||
            ((c = e.state),
            typeof e.componentWillMount == "function" && e.componentWillMount(),
            typeof e.UNSAFE_componentWillMount == "function" &&
              e.UNSAFE_componentWillMount(),
            c !== e.state && ui.enqueueReplaceState(e, e.state, null),
            wa(t, a, e, n),
            Ja(),
            (e.state = t.memoizedState)),
          typeof e.componentDidMount == "function" && (t.flags |= 4194308),
          (a = !0));
      } else if (l === null) {
        e = t.stateNode;
        var i = t.memoizedProps,
          f = Gu(u, i);
        e.props = f;
        var s = e.context,
          b = u.contextType;
        ((c = Pu), typeof b == "object" && b !== null && (c = Cl(b)));
        var T = u.getDerivedStateFromProps;
        ((b =
          typeof T == "function" ||
          typeof e.getSnapshotBeforeUpdate == "function"),
          (i = t.pendingProps !== i),
          b ||
            (typeof e.UNSAFE_componentWillReceiveProps != "function" &&
              typeof e.componentWillReceiveProps != "function") ||
            ((i || s !== c) && d1(t, e, a, c)),
          (uu = !1));
        var o = t.memoizedState;
        ((e.state = o),
          wa(t, a, e, n),
          Ja(),
          (s = t.memoizedState),
          i || o !== s || uu
            ? (typeof T == "function" &&
                (ti(t, u, T, a), (s = t.memoizedState)),
              (f = uu || v1(t, u, f, a, o, s, c))
                ? (b ||
                    (typeof e.UNSAFE_componentWillMount != "function" &&
                      typeof e.componentWillMount != "function") ||
                    (typeof e.componentWillMount == "function" &&
                      e.componentWillMount(),
                    typeof e.UNSAFE_componentWillMount == "function" &&
                      e.UNSAFE_componentWillMount()),
                  typeof e.componentDidMount == "function" &&
                    (t.flags |= 4194308))
                : (typeof e.componentDidMount == "function" &&
                    (t.flags |= 4194308),
                  (t.memoizedProps = a),
                  (t.memoizedState = s)),
              (e.props = a),
              (e.state = s),
              (e.context = c),
              (a = f))
            : (typeof e.componentDidMount == "function" && (t.flags |= 4194308),
              (a = !1)));
      } else {
        ((e = t.stateNode),
          Rc(l, t),
          (c = t.memoizedProps),
          (b = Gu(u, c)),
          (e.props = b),
          (T = t.pendingProps),
          (o = e.context),
          (s = u.contextType),
          (f = Pu),
          typeof s == "object" && s !== null && (f = Cl(s)),
          (i = u.getDerivedStateFromProps),
          (s =
            typeof i == "function" ||
            typeof e.getSnapshotBeforeUpdate == "function") ||
            (typeof e.UNSAFE_componentWillReceiveProps != "function" &&
              typeof e.componentWillReceiveProps != "function") ||
            ((c !== T || o !== f) && d1(t, e, a, f)),
          (uu = !1),
          (o = t.memoizedState),
          (e.state = o),
          wa(t, a, e, n),
          Ja());
        var S = t.memoizedState;
        c !== T ||
        o !== S ||
        uu ||
        (l !== null && l.dependencies !== null && rn(l.dependencies))
          ? (typeof i == "function" && (ti(t, u, i, a), (S = t.memoizedState)),
            (b =
              uu ||
              v1(t, u, b, a, o, S, f) ||
              (l !== null && l.dependencies !== null && rn(l.dependencies)))
              ? (s ||
                  (typeof e.UNSAFE_componentWillUpdate != "function" &&
                    typeof e.componentWillUpdate != "function") ||
                  (typeof e.componentWillUpdate == "function" &&
                    e.componentWillUpdate(a, S, f),
                  typeof e.UNSAFE_componentWillUpdate == "function" &&
                    e.UNSAFE_componentWillUpdate(a, S, f)),
                typeof e.componentDidUpdate == "function" && (t.flags |= 4),
                typeof e.getSnapshotBeforeUpdate == "function" &&
                  (t.flags |= 1024))
              : (typeof e.componentDidUpdate != "function" ||
                  (c === l.memoizedProps && o === l.memoizedState) ||
                  (t.flags |= 4),
                typeof e.getSnapshotBeforeUpdate != "function" ||
                  (c === l.memoizedProps && o === l.memoizedState) ||
                  (t.flags |= 1024),
                (t.memoizedProps = a),
                (t.memoizedState = S)),
            (e.props = a),
            (e.state = S),
            (e.context = f),
            (a = b))
          : (typeof e.componentDidUpdate != "function" ||
              (c === l.memoizedProps && o === l.memoizedState) ||
              (t.flags |= 4),
            typeof e.getSnapshotBeforeUpdate != "function" ||
              (c === l.memoizedProps && o === l.memoizedState) ||
              (t.flags |= 1024),
            (a = !1));
      }
      return (
        (e = a),
        ie(l, t),
        (a = (t.flags & 128) !== 0),
        e || a
          ? ((e = t.stateNode),
            (u =
              a && typeof u.getDerivedStateFromError != "function"
                ? null
                : e.render()),
            (t.flags |= 1),
            l !== null && a
              ? ((t.child = qu(t, l.child, null, n)),
                (t.child = qu(t, null, u, n)))
              : pl(l, t, u, n),
            (t.memoizedState = e.state),
            (l = t.child))
          : (l = Gt(l, t, n)),
        l
      );
    }
    function _1(l, t, u, a) {
      return (Uu(), (t.flags |= 256), pl(l, t, u, a), t.child);
    }
    var ci = {
      dehydrated: null,
      treeContext: null,
      retryLane: 0,
      hydrationErrors: null,
    };
    function ii(l) {
      return { baseLanes: l, cachePool: o0() };
    }
    function fi(l, t, u) {
      return ((l = l !== null ? l.childLanes & ~u : 0), t && (l |= nt), l);
    }
    function O1(l, t, u) {
      var a = t.pendingProps,
        n = !1,
        e = (t.flags & 128) !== 0,
        c;
      if (
        ((c = e) ||
          (c =
            l !== null && l.memoizedState === null
              ? !1
              : (gl.current & 2) !== 0),
        c && ((n = !0), (t.flags &= -129)),
        (c = (t.flags & 32) !== 0),
        (t.flags &= -33),
        l === null)
      ) {
        if (w) {
          if (
            (n ? au(t) : nu(t),
            (l = vl)
              ? ((l = qy(l, dt)),
                (l = l !== null && l.data !== "&" ? l : null),
                l !== null &&
                  ((t.memoizedState = {
                    dehydrated: l,
                    treeContext: It !== null ? { id: Mt, overflow: Dt } : null,
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (u = c0(l)),
                  (u.return = t),
                  (t.child = u),
                  (Nl = t),
                  (vl = null)))
              : (l = null),
            l === null)
          )
            throw lu(t);
          return (Vi(l) ? (t.lanes = 32) : (t.lanes = 536870912), null);
        }
        var i = a.children;
        return (
          (a = a.fallback),
          n
            ? (nu(t),
              (n = t.mode),
              (i = fe({ mode: "hidden", children: i }, n)),
              (a = Du(a, n, u, null)),
              (i.return = t),
              (a.return = t),
              (i.sibling = a),
              (t.child = i),
              (a = t.child),
              (a.memoizedState = ii(u)),
              (a.childLanes = fi(l, c, u)),
              (t.memoizedState = ci),
              Ia(null, a))
            : (au(t), yi(t, i))
        );
      }
      var f = l.memoizedState;
      if (f !== null && ((i = f.dehydrated), i !== null)) {
        if (e)
          t.flags & 256
            ? (au(t), (t.flags &= -257), (t = vi(l, t, u)))
            : t.memoizedState !== null
              ? (nu(t), (t.child = l.child), (t.flags |= 128), (t = null))
              : (nu(t),
                (i = a.fallback),
                (n = t.mode),
                (a = fe({ mode: "visible", children: a.children }, n)),
                (i = Du(i, n, u, null)),
                (i.flags |= 2),
                (a.return = t),
                (i.return = t),
                (a.sibling = i),
                (t.child = a),
                qu(t, l.child, null, u),
                (a = t.child),
                (a.memoizedState = ii(u)),
                (a.childLanes = fi(l, c, u)),
                (t.memoizedState = ci),
                (t = Ia(null, a)));
        else if ((au(t), Vi(i))) {
          if (((c = i.nextSibling && i.nextSibling.dataset), c)) var s = c.dgst;
          ((c = s),
            (a = Error(m(419))),
            (a.stack = ""),
            (a.digest = c),
            La({ value: a, source: null, stack: null }),
            (t = vi(l, t, u)));
        } else if (
          (El || aa(l, t, u, !1), (c = (u & l.childLanes) !== 0), El || c)
        ) {
          if (
            ((c = il),
            c !== null && ((a = mf(c, u)), a !== 0 && a !== f.retryLane))
          )
            throw ((f.retryLane = a), Mu(l, a), Vl(c, l, a), ni);
          (ri(i) || ge(), (t = vi(l, t, u)));
        } else
          ri(i)
            ? ((t.flags |= 192), (t.child = l.child), (t = null))
            : ((l = f.treeContext),
              (vl = st(i.nextSibling)),
              (Nl = t),
              (w = !0),
              (Pt = null),
              (dt = !1),
              l !== null && y0(t, l),
              (t = yi(t, a.children)),
              (t.flags |= 4096));
        return t;
      }
      return n
        ? (nu(t),
          (i = a.fallback),
          (n = t.mode),
          (f = l.child),
          (s = f.sibling),
          (a = Ht(f, { mode: "hidden", children: a.children })),
          (a.subtreeFlags = f.subtreeFlags & 65011712),
          s !== null
            ? (i = Ht(s, i))
            : ((i = Du(i, n, u, null)), (i.flags |= 2)),
          (i.return = t),
          (a.return = t),
          (a.sibling = i),
          (t.child = a),
          Ia(null, a),
          (a = t.child),
          (i = l.child.memoizedState),
          i === null
            ? (i = ii(u))
            : ((n = i.cachePool),
              n !== null
                ? ((f = zl._currentValue),
                  (n = n.parent !== f ? { parent: f, pool: f } : n))
                : (n = o0()),
              (i = { baseLanes: i.baseLanes | u, cachePool: n })),
          (a.memoizedState = i),
          (a.childLanes = fi(l, c, u)),
          (t.memoizedState = ci),
          Ia(l.child, a))
        : (au(t),
          (u = l.child),
          (l = u.sibling),
          (u = Ht(u, { mode: "visible", children: a.children })),
          (u.return = t),
          (u.sibling = null),
          l !== null &&
            ((c = t.deletions),
            c === null ? ((t.deletions = [l]), (t.flags |= 16)) : c.push(l)),
          (t.child = u),
          (t.memoizedState = null),
          u);
    }
    function yi(l, t) {
      return (
        (t = fe({ mode: "visible", children: t }, l.mode)),
        (t.return = l),
        (l.child = t)
      );
    }
    function fe(l, t) {
      return ((l = lt(22, l, null, t)), (l.lanes = 0), l);
    }
    function vi(l, t, u) {
      return (
        qu(t, l.child, null, u),
        (l = yi(t, t.pendingProps.children)),
        (l.flags |= 2),
        (t.memoizedState = null),
        l
      );
    }
    function M1(l, t, u) {
      l.lanes |= t;
      var a = l.alternate;
      (a !== null && (a.lanes |= t), Mc(l.return, t, u));
    }
    function di(l, t, u, a, n, e) {
      var c = l.memoizedState;
      c === null
        ? (l.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: a,
            tail: u,
            tailMode: n,
            treeForkCount: e,
          })
        : ((c.isBackwards = t),
          (c.rendering = null),
          (c.renderingStartTime = 0),
          (c.last = a),
          (c.tail = u),
          (c.tailMode = n),
          (c.treeForkCount = e));
    }
    function D1(l, t, u) {
      var a = t.pendingProps,
        n = a.revealOrder,
        e = a.tail;
      a = a.children;
      var c = gl.current,
        i = (c & 2) !== 0;
      if (
        (i ? ((c = (c & 1) | 2), (t.flags |= 128)) : (c &= 1),
        M(gl, c),
        pl(l, t, a, u),
        (a = w ? Qa : 0),
        !i && l !== null && (l.flags & 128) !== 0)
      )
        l: for (l = t.child; l !== null; ) {
          if (l.tag === 13) l.memoizedState !== null && M1(l, u, t);
          else if (l.tag === 19) M1(l, u, t);
          else if (l.child !== null) {
            ((l.child.return = l), (l = l.child));
            continue;
          }
          if (l === t) break l;
          for (; l.sibling === null; ) {
            if (l.return === null || l.return === t) break l;
            l = l.return;
          }
          ((l.sibling.return = l.return), (l = l.sibling));
        }
      switch (n) {
        case "forwards":
          for (u = t.child, n = null; u !== null; )
            ((l = u.alternate),
              l !== null && Fn(l) === null && (n = u),
              (u = u.sibling));
          ((u = n),
            u === null
              ? ((n = t.child), (t.child = null))
              : ((n = u.sibling), (u.sibling = null)),
            di(t, !1, n, u, e, a));
          break;
        case "backwards":
        case "unstable_legacy-backwards":
          for (u = null, n = t.child, t.child = null; n !== null; ) {
            if (((l = n.alternate), l !== null && Fn(l) === null)) {
              t.child = n;
              break;
            }
            ((l = n.sibling), (n.sibling = u), (u = n), (n = l));
          }
          di(t, !0, u, null, e, a);
          break;
        case "together":
          di(t, !1, null, null, void 0, a);
          break;
        default:
          t.memoizedState = null;
      }
      return t.child;
    }
    function Gt(l, t, u) {
      if (
        (l !== null && (t.dependencies = l.dependencies),
        (iu |= t.lanes),
        (u & t.childLanes) === 0)
      )
        if (l !== null) {
          if ((aa(l, t, u, !1), (u & t.childLanes) === 0)) return null;
        } else return null;
      if (l !== null && t.child !== l.child) throw Error(m(153));
      if (t.child !== null) {
        for (
          l = t.child, u = Ht(l, l.pendingProps), t.child = u, u.return = t;
          l.sibling !== null;
        )
          ((l = l.sibling),
            (u = u.sibling = Ht(l, l.pendingProps)),
            (u.return = t));
        u.sibling = null;
      }
      return t.child;
    }
    function mi(l, t) {
      return (l.lanes & t) !== 0
        ? !0
        : ((l = l.dependencies), !!(l !== null && rn(l)));
    }
    function zd(l, t, u) {
      switch (t.tag) {
        case 3:
          (ql(t, t.stateNode.containerInfo),
            tu(t, zl, l.memoizedState.cache),
            Uu());
          break;
        case 27:
        case 5:
          Oa(t);
          break;
        case 4:
          ql(t, t.stateNode.containerInfo);
          break;
        case 10:
          tu(t, t.type, t.memoizedProps.value);
          break;
        case 31:
          if (t.memoizedState !== null) return ((t.flags |= 128), Gc(t), null);
          break;
        case 13:
          var a = t.memoizedState;
          if (a !== null)
            return a.dehydrated !== null
              ? (au(t), (t.flags |= 128), null)
              : (u & t.child.childLanes) !== 0
                ? O1(l, t, u)
                : (au(t), (l = Gt(l, t, u)), l !== null ? l.sibling : null);
          au(t);
          break;
        case 19:
          var n = (l.flags & 128) !== 0;
          if (
            ((a = (u & t.childLanes) !== 0),
            a || (aa(l, t, u, !1), (a = (u & t.childLanes) !== 0)),
            n)
          ) {
            if (a) return D1(l, t, u);
            t.flags |= 128;
          }
          if (
            ((n = t.memoizedState),
            n !== null &&
              ((n.rendering = null), (n.tail = null), (n.lastEffect = null)),
            M(gl, gl.current),
            a)
          )
            break;
          return null;
        case 22:
          return ((t.lanes = 0), b1(l, t, u, t.pendingProps));
        case 24:
          tu(t, zl, l.memoizedState.cache);
      }
      return Gt(l, t, u);
    }
    function U1(l, t, u) {
      if (l !== null)
        if (l.memoizedProps !== t.pendingProps) El = !0;
        else {
          if (!mi(l, u) && (t.flags & 128) === 0)
            return ((El = !1), zd(l, t, u));
          El = (l.flags & 131072) !== 0;
        }
      else ((El = !1), w && (t.flags & 1048576) !== 0 && f0(t, Qa, t.index));
      switch (((t.lanes = 0), t.tag)) {
        case 16:
          l: {
            var a = t.pendingProps;
            if (((l = Hu(t.elementType)), (t.type = l), typeof l == "function"))
              gc(l)
                ? ((a = Gu(l, a)), (t.tag = 1), (t = A1(null, t, l, a, u)))
                : ((t.tag = 0), (t = ei(null, t, l, a, u)));
            else {
              if (l != null) {
                var n = l.$$typeof;
                if (n === bt) {
                  ((t.tag = 11), (t = o1(null, t, l, a, u)));
                  break l;
                } else if (n === W) {
                  ((t.tag = 14), (t = S1(null, t, l, a, u)));
                  break l;
                }
              }
              throw ((t = zt(l) || l), Error(m(306, t, "")));
            }
          }
          return t;
        case 0:
          return ei(l, t, t.type, t.pendingProps, u);
        case 1:
          return ((a = t.type), (n = Gu(a, t.pendingProps)), A1(l, t, a, n, u));
        case 3:
          l: {
            if ((ql(t, t.stateNode.containerInfo), l === null))
              throw Error(m(387));
            a = t.pendingProps;
            var e = t.memoizedState;
            ((n = e.element), Rc(l, t), wa(t, a, null, u));
            var c = t.memoizedState;
            if (
              ((a = c.cache),
              tu(t, zl, a),
              a !== e.cache && Dc(t, [zl], u, !0),
              Ja(),
              (a = c.element),
              e.isDehydrated)
            )
              if (
                ((e = { element: a, isDehydrated: !1, cache: c.cache }),
                (t.updateQueue.baseState = e),
                (t.memoizedState = e),
                t.flags & 256)
              ) {
                t = _1(l, t, a, u);
                break l;
              } else if (a !== n) {
                ((n = ft(Error(m(424)), t)), La(n), (t = _1(l, t, a, u)));
                break l;
              } else
                for (
                  l = t.stateNode.containerInfo,
                    l.nodeType === 9
                      ? (l = l.body)
                      : (l = l.nodeName === "HTML" ? l.ownerDocument.body : l),
                    vl = st(l.firstChild),
                    Nl = t,
                    w = !0,
                    Pt = null,
                    dt = !0,
                    u = E0(t, null, a, u),
                    t.child = u;
                  u;
                )
                  ((u.flags = (u.flags & -3) | 4096), (u = u.sibling));
            else {
              if ((Uu(), a === n)) {
                t = Gt(l, t, u);
                break l;
              }
              pl(l, t, a, u);
            }
            t = t.child;
          }
          return t;
        case 26:
          return (
            ie(l, t),
            l === null
              ? (u = Qy(t.type, null, t.pendingProps, null))
                ? (t.memoizedState = u)
                : w ||
                  ((u = t.type),
                  (l = t.pendingProps),
                  (a = Oe(Z.current).createElement(u)),
                  (a[Ul] = t),
                  (a[Gl] = l),
                  Hl(a, u, l),
                  Ml(a),
                  (t.stateNode = a))
              : (t.memoizedState = Qy(
                  t.type,
                  l.memoizedProps,
                  t.pendingProps,
                  l.memoizedState,
                )),
            null
          );
        case 27:
          return (
            Oa(t),
            l === null &&
              w &&
              ((a = t.stateNode = jy(t.type, t.pendingProps, Z.current)),
              (Nl = t),
              (dt = !0),
              (n = vl),
              mu(t.type) ? ((xi = n), (vl = st(a.firstChild))) : (vl = n)),
            pl(l, t, t.pendingProps.children, u),
            ie(l, t),
            l === null && (t.flags |= 4194304),
            t.child
          );
        case 5:
          return (
            l === null &&
              w &&
              ((n = a = vl) &&
                ((a = wd(a, t.type, t.pendingProps, dt)),
                a !== null
                  ? ((t.stateNode = a),
                    (Nl = t),
                    (vl = st(a.firstChild)),
                    (dt = !1),
                    (n = !0))
                  : (n = !1)),
              n || lu(t)),
            Oa(t),
            (n = t.type),
            (e = t.pendingProps),
            (c = l !== null ? l.memoizedProps : null),
            (a = e.children),
            Qi(n, e) ? (a = null) : c !== null && Qi(n, c) && (t.flags |= 32),
            t.memoizedState !== null &&
              ((n = Qc(l, t, id, null, null, u)), (sn._currentValue = n)),
            ie(l, t),
            pl(l, t, a, u),
            t.child
          );
        case 6:
          return (
            l === null &&
              w &&
              ((l = u = vl) &&
                ((u = Wd(u, t.pendingProps, dt)),
                u !== null
                  ? ((t.stateNode = u), (Nl = t), (vl = null), (l = !0))
                  : (l = !1)),
              l || lu(t)),
            null
          );
        case 13:
          return O1(l, t, u);
        case 4:
          return (
            ql(t, t.stateNode.containerInfo),
            (a = t.pendingProps),
            l === null ? (t.child = qu(t, null, a, u)) : pl(l, t, a, u),
            t.child
          );
        case 11:
          return o1(l, t, t.type, t.pendingProps, u);
        case 7:
          return (pl(l, t, t.pendingProps, u), t.child);
        case 8:
          return (pl(l, t, t.pendingProps.children, u), t.child);
        case 12:
          return (pl(l, t, t.pendingProps.children, u), t.child);
        case 10:
          return (
            (a = t.pendingProps),
            tu(t, t.type, a.value),
            pl(l, t, a.children, u),
            t.child
          );
        case 9:
          return (
            (n = t.type._context),
            (a = t.pendingProps.children),
            Cu(t),
            (n = Cl(n)),
            (a = a(n)),
            (t.flags |= 1),
            pl(l, t, a, u),
            t.child
          );
        case 14:
          return S1(l, t, t.type, t.pendingProps, u);
        case 15:
          return g1(l, t, t.type, t.pendingProps, u);
        case 19:
          return D1(l, t, u);
        case 31:
          return bd(l, t, u);
        case 22:
          return b1(l, t, u, t.pendingProps);
        case 24:
          return (
            Cu(t),
            (a = Cl(zl)),
            l === null
              ? ((n = Cc()),
                n === null &&
                  ((n = il),
                  (e = Uc()),
                  (n.pooledCache = e),
                  e.refCount++,
                  e !== null && (n.pooledCacheLanes |= u),
                  (n = e)),
                (t.memoizedState = { parent: a, cache: n }),
                Hc(t),
                tu(t, zl, n))
              : ((l.lanes & u) !== 0 && (Rc(l, t), wa(t, null, null, u), Ja()),
                (n = l.memoizedState),
                (e = t.memoizedState),
                n.parent !== a
                  ? ((n = { parent: a, cache: a }),
                    (t.memoizedState = n),
                    t.lanes === 0 &&
                      (t.memoizedState = t.updateQueue.baseState = n),
                    tu(t, zl, a))
                  : ((a = e.cache),
                    tu(t, zl, a),
                    a !== n.cache && Dc(t, [zl], u, !0))),
            pl(l, t, t.pendingProps.children, u),
            t.child
          );
        case 29:
          throw t.pendingProps;
      }
      throw Error(m(156, t.tag));
    }
    function Xt(l) {
      l.flags |= 4;
    }
    function hi(l, t, u, a, n) {
      if (((t = (l.mode & 32) !== 0) && (t = !1), t)) {
        if (((l.flags |= 16777216), (n & 335544128) === n))
          if (l.stateNode.complete) l.flags |= 8192;
          else if (ly()) l.flags |= 8192;
          else throw ((Ru = Jn), pc);
      } else l.flags &= -16777217;
    }
    function N1(l, t) {
      if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
        l.flags &= -16777217;
      else if (((l.flags |= 16777216), !xy(t)))
        if (ly()) l.flags |= 8192;
        else throw ((Ru = Jn), pc);
    }
    function ye(l, t) {
      (t !== null && (l.flags |= 4),
        l.flags & 16384 &&
          ((t = l.tag !== 22 ? yf() : 536870912), (l.lanes |= t), (oa |= t)));
    }
    function Pa(l, t) {
      if (!w)
        switch (l.tailMode) {
          case "hidden":
            t = l.tail;
            for (var u = null; t !== null; )
              (t.alternate !== null && (u = t), (t = t.sibling));
            u === null ? (l.tail = null) : (u.sibling = null);
            break;
          case "collapsed":
            u = l.tail;
            for (var a = null; u !== null; )
              (u.alternate !== null && (a = u), (u = u.sibling));
            a === null
              ? t || l.tail === null
                ? (l.tail = null)
                : (l.tail.sibling = null)
              : (a.sibling = null);
        }
    }
    function dl(l) {
      var t = l.alternate !== null && l.alternate.child === l.child,
        u = 0,
        a = 0;
      if (t)
        for (var n = l.child; n !== null; )
          ((u |= n.lanes | n.childLanes),
            (a |= n.subtreeFlags & 65011712),
            (a |= n.flags & 65011712),
            (n.return = l),
            (n = n.sibling));
      else
        for (n = l.child; n !== null; )
          ((u |= n.lanes | n.childLanes),
            (a |= n.subtreeFlags),
            (a |= n.flags),
            (n.return = l),
            (n = n.sibling));
      return ((l.subtreeFlags |= a), (l.childLanes = u), t);
    }
    function Td(l, t, u) {
      var a = t.pendingProps;
      switch ((Ec(t), t.tag)) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return (dl(t), null);
        case 1:
          return (dl(t), null);
        case 3:
          return (
            (u = t.stateNode),
            (a = null),
            l !== null && (a = l.memoizedState.cache),
            t.memoizedState.cache !== a && (t.flags |= 2048),
            Bt(zl),
            Sl(),
            u.pendingContext &&
              ((u.context = u.pendingContext), (u.pendingContext = null)),
            (l === null || l.child === null) &&
              (ua(t)
                ? Xt(t)
                : l === null ||
                  (l.memoizedState.isDehydrated && (t.flags & 256) === 0) ||
                  ((t.flags |= 1024), _c())),
            dl(t),
            null
          );
        case 26:
          var n = t.type,
            e = t.memoizedState;
          return (
            l === null
              ? (Xt(t),
                e !== null ? (dl(t), N1(t, e)) : (dl(t), hi(t, n, null, a, u)))
              : e
                ? e !== l.memoizedState
                  ? (Xt(t), dl(t), N1(t, e))
                  : (dl(t), (t.flags &= -16777217))
                : ((l = l.memoizedProps),
                  l !== a && Xt(t),
                  dl(t),
                  hi(t, n, l, a, u)),
            null
          );
        case 27:
          if (
            (zn(t),
            (u = Z.current),
            (n = t.type),
            l !== null && t.stateNode != null)
          )
            l.memoizedProps !== a && Xt(t);
          else {
            if (!a) {
              if (t.stateNode === null) throw Error(m(166));
              return (dl(t), null);
            }
            ((l = H.current),
              ua(t) ? v0(t, l) : ((l = jy(n, a, u)), (t.stateNode = l), Xt(t)));
          }
          return (dl(t), null);
        case 5:
          if ((zn(t), (n = t.type), l !== null && t.stateNode != null))
            l.memoizedProps !== a && Xt(t);
          else {
            if (!a) {
              if (t.stateNode === null) throw Error(m(166));
              return (dl(t), null);
            }
            if (((e = H.current), ua(t))) v0(t, e);
            else {
              var c = Oe(Z.current);
              switch (e) {
                case 1:
                  e = c.createElementNS("http://www.w3.org/2000/svg", n);
                  break;
                case 2:
                  e = c.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    n,
                  );
                  break;
                default:
                  switch (n) {
                    case "svg":
                      e = c.createElementNS("http://www.w3.org/2000/svg", n);
                      break;
                    case "math":
                      e = c.createElementNS(
                        "http://www.w3.org/1998/Math/MathML",
                        n,
                      );
                      break;
                    case "script":
                      ((e = c.createElement("div")),
                        (e.innerHTML = "<script><\/script>"),
                        (e = e.removeChild(e.firstChild)));
                      break;
                    case "select":
                      ((e =
                        typeof a.is == "string"
                          ? c.createElement("select", { is: a.is })
                          : c.createElement("select")),
                        a.multiple
                          ? (e.multiple = !0)
                          : a.size && (e.size = a.size));
                      break;
                    default:
                      e =
                        typeof a.is == "string"
                          ? c.createElement(n, { is: a.is })
                          : c.createElement(n);
                  }
              }
              ((e[Ul] = t), (e[Gl] = a));
              l: for (c = t.child; c !== null; ) {
                if (c.tag === 5 || c.tag === 6) e.appendChild(c.stateNode);
                else if (c.tag !== 4 && c.tag !== 27 && c.child !== null) {
                  ((c.child.return = c), (c = c.child));
                  continue;
                }
                if (c === t) break l;
                for (; c.sibling === null; ) {
                  if (c.return === null || c.return === t) break l;
                  c = c.return;
                }
                ((c.sibling.return = c.return), (c = c.sibling));
              }
              t.stateNode = e;
              l: switch ((Hl(e, n, a), n)) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  a = !!a.autoFocus;
                  break l;
                case "img":
                  a = !0;
                  break l;
                default:
                  a = !1;
              }
              a && Xt(t);
            }
          }
          return (
            dl(t),
            hi(
              t,
              t.type,
              l === null ? null : l.memoizedProps,
              t.pendingProps,
              u,
            ),
            null
          );
        case 6:
          if (l && t.stateNode != null) l.memoizedProps !== a && Xt(t);
          else {
            if (typeof a != "string" && t.stateNode === null)
              throw Error(m(166));
            if (((l = Z.current), ua(t))) {
              if (
                ((l = t.stateNode),
                (u = t.memoizedProps),
                (a = null),
                (n = Nl),
                n !== null)
              )
                switch (n.tag) {
                  case 27:
                  case 5:
                    a = n.memoizedProps;
                }
              ((l[Ul] = t),
                (l = !!(
                  l.nodeValue === u ||
                  (a !== null && a.suppressHydrationWarning === !0) ||
                  My(l.nodeValue, u)
                )),
                l || lu(t, !0));
            } else
              ((l = Oe(l).createTextNode(a)), (l[Ul] = t), (t.stateNode = l));
          }
          return (dl(t), null);
        case 31:
          if (((u = t.memoizedState), l === null || l.memoizedState !== null)) {
            if (((a = ua(t)), u !== null)) {
              if (l === null) {
                if (!a) throw Error(m(318));
                if (
                  ((l = t.memoizedState),
                  (l = l !== null ? l.dehydrated : null),
                  !l)
                )
                  throw Error(m(557));
                l[Ul] = t;
              } else
                (Uu(),
                  (t.flags & 128) === 0 && (t.memoizedState = null),
                  (t.flags |= 4));
              (dl(t), (l = !1));
            } else
              ((u = _c()),
                l !== null &&
                  l.memoizedState !== null &&
                  (l.memoizedState.hydrationErrors = u),
                (l = !0));
            if (!l) return t.flags & 256 ? (ut(t), t) : (ut(t), null);
            if ((t.flags & 128) !== 0) throw Error(m(558));
          }
          return (dl(t), null);
        case 13:
          if (
            ((a = t.memoizedState),
            l === null ||
              (l.memoizedState !== null && l.memoizedState.dehydrated !== null))
          ) {
            if (((n = ua(t)), a !== null && a.dehydrated !== null)) {
              if (l === null) {
                if (!n) throw Error(m(318));
                if (
                  ((n = t.memoizedState),
                  (n = n !== null ? n.dehydrated : null),
                  !n)
                )
                  throw Error(m(317));
                n[Ul] = t;
              } else
                (Uu(),
                  (t.flags & 128) === 0 && (t.memoizedState = null),
                  (t.flags |= 4));
              (dl(t), (n = !1));
            } else
              ((n = _c()),
                l !== null &&
                  l.memoizedState !== null &&
                  (l.memoizedState.hydrationErrors = n),
                (n = !0));
            if (!n) return t.flags & 256 ? (ut(t), t) : (ut(t), null);
          }
          return (
            ut(t),
            (t.flags & 128) !== 0
              ? ((t.lanes = u), t)
              : ((u = a !== null),
                (l = l !== null && l.memoizedState !== null),
                u &&
                  ((a = t.child),
                  (n = null),
                  a.alternate !== null &&
                    a.alternate.memoizedState !== null &&
                    a.alternate.memoizedState.cachePool !== null &&
                    (n = a.alternate.memoizedState.cachePool.pool),
                  (e = null),
                  a.memoizedState !== null &&
                    a.memoizedState.cachePool !== null &&
                    (e = a.memoizedState.cachePool.pool),
                  e !== n && (a.flags |= 2048)),
                u !== l && u && (t.child.flags |= 8192),
                ye(t, t.updateQueue),
                dl(t),
                null)
          );
        case 4:
          return (
            Sl(),
            l === null && Ey(t.stateNode.containerInfo),
            dl(t),
            null
          );
        case 10:
          return (Bt(t.type), dl(t), null);
        case 19:
          if ((E(gl), (a = t.memoizedState), a === null)) return (dl(t), null);
          if (((n = (t.flags & 128) !== 0), (e = a.rendering), e === null))
            if (n) Pa(a, !1);
            else {
              if (ol !== 0 || (l !== null && (l.flags & 128) !== 0))
                for (l = t.child; l !== null; ) {
                  if (((e = Fn(l)), e !== null)) {
                    for (
                      t.flags |= 128,
                        Pa(a, !1),
                        l = e.updateQueue,
                        t.updateQueue = l,
                        ye(t, l),
                        t.subtreeFlags = 0,
                        l = u,
                        u = t.child;
                      u !== null;
                    )
                      (e0(u, l), (u = u.sibling));
                    return (
                      M(gl, (gl.current & 1) | 2),
                      w && Rt(t, a.treeForkCount),
                      t.child
                    );
                  }
                  l = l.sibling;
                }
              a.tail !== null &&
                Fl() > se &&
                ((t.flags |= 128), (n = !0), Pa(a, !1), (t.lanes = 4194304));
            }
          else {
            if (!n)
              if (((l = Fn(e)), l !== null)) {
                if (
                  ((t.flags |= 128),
                  (n = !0),
                  (l = l.updateQueue),
                  (t.updateQueue = l),
                  ye(t, l),
                  Pa(a, !0),
                  a.tail === null &&
                    a.tailMode === "hidden" &&
                    !e.alternate &&
                    !w)
                )
                  return (dl(t), null);
              } else
                2 * Fl() - a.renderingStartTime > se &&
                  u !== 536870912 &&
                  ((t.flags |= 128), (n = !0), Pa(a, !1), (t.lanes = 4194304));
            a.isBackwards
              ? ((e.sibling = t.child), (t.child = e))
              : ((l = a.last),
                l !== null ? (l.sibling = e) : (t.child = e),
                (a.last = e));
          }
          return a.tail !== null
            ? ((l = a.tail),
              (a.rendering = l),
              (a.tail = l.sibling),
              (a.renderingStartTime = Fl()),
              (l.sibling = null),
              (u = gl.current),
              M(gl, n ? (u & 1) | 2 : u & 1),
              w && Rt(t, a.treeForkCount),
              l)
            : (dl(t), null);
        case 22:
        case 23:
          return (
            ut(t),
            jc(),
            (a = t.memoizedState !== null),
            l !== null
              ? (l.memoizedState !== null) !== a && (t.flags |= 8192)
              : a && (t.flags |= 8192),
            a
              ? (u & 536870912) !== 0 &&
                (t.flags & 128) === 0 &&
                (dl(t), t.subtreeFlags & 6 && (t.flags |= 8192))
              : dl(t),
            (u = t.updateQueue),
            u !== null && ye(t, u.retryQueue),
            (u = null),
            l !== null &&
              l.memoizedState !== null &&
              l.memoizedState.cachePool !== null &&
              (u = l.memoizedState.cachePool.pool),
            (a = null),
            t.memoizedState !== null &&
              t.memoizedState.cachePool !== null &&
              (a = t.memoizedState.cachePool.pool),
            a !== u && (t.flags |= 2048),
            l !== null && E(pu),
            null
          );
        case 24:
          return (
            (u = null),
            l !== null && (u = l.memoizedState.cache),
            t.memoizedState.cache !== u && (t.flags |= 2048),
            Bt(zl),
            dl(t),
            null
          );
        case 25:
          return null;
        case 30:
          return null;
      }
      throw Error(m(156, t.tag));
    }
    function Ed(l, t) {
      switch ((Ec(t), t.tag)) {
        case 1:
          return (
            (l = t.flags),
            l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
          );
        case 3:
          return (
            Bt(zl),
            Sl(),
            (l = t.flags),
            (l & 65536) !== 0 && (l & 128) === 0
              ? ((t.flags = (l & -65537) | 128), t)
              : null
          );
        case 26:
        case 27:
        case 5:
          return (zn(t), null);
        case 31:
          if (t.memoizedState !== null) {
            if ((ut(t), t.alternate === null)) throw Error(m(340));
            Uu();
          }
          return (
            (l = t.flags),
            l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
          );
        case 13:
          if (
            (ut(t), (l = t.memoizedState), l !== null && l.dehydrated !== null)
          ) {
            if (t.alternate === null) throw Error(m(340));
            Uu();
          }
          return (
            (l = t.flags),
            l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
          );
        case 19:
          return (E(gl), null);
        case 4:
          return (Sl(), null);
        case 10:
          return (Bt(t.type), null);
        case 22:
        case 23:
          return (
            ut(t),
            jc(),
            l !== null && E(pu),
            (l = t.flags),
            l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
          );
        case 24:
          return (Bt(zl), null);
        case 25:
          return null;
        default:
          return null;
      }
    }
    function C1(l, t) {
      switch ((Ec(t), t.tag)) {
        case 3:
          (Bt(zl), Sl());
          break;
        case 26:
        case 27:
        case 5:
          zn(t);
          break;
        case 4:
          Sl();
          break;
        case 31:
          t.memoizedState !== null && ut(t);
          break;
        case 13:
          ut(t);
          break;
        case 19:
          E(gl);
          break;
        case 10:
          Bt(t.type);
          break;
        case 22:
        case 23:
          (ut(t), jc(), l !== null && E(pu));
          break;
        case 24:
          Bt(zl);
      }
    }
    function ln(l, t) {
      try {
        var u = t.updateQueue,
          a = u !== null ? u.lastEffect : null;
        if (a !== null) {
          var n = a.next;
          u = n;
          do {
            if ((u.tag & l) === l) {
              a = void 0;
              var e = u.create,
                c = u.inst;
              ((a = e()), (c.destroy = a));
            }
            u = u.next;
          } while (u !== n);
        }
      } catch (i) {
        al(t, t.return, i);
      }
    }
    function eu(l, t, u) {
      try {
        var a = t.updateQueue,
          n = a !== null ? a.lastEffect : null;
        if (n !== null) {
          var e = n.next;
          a = e;
          do {
            if ((a.tag & l) === l) {
              var c = a.inst,
                i = c.destroy;
              if (i !== void 0) {
                ((c.destroy = void 0), (n = t));
                var f = u,
                  s = i;
                try {
                  s();
                } catch (b) {
                  al(n, f, b);
                }
              }
            }
            a = a.next;
          } while (a !== e);
        }
      } catch (b) {
        al(t, t.return, b);
      }
    }
    function p1(l) {
      var t = l.updateQueue;
      if (t !== null) {
        var u = l.stateNode;
        try {
          _0(t, u);
        } catch (a) {
          al(l, l.return, a);
        }
      }
    }
    function H1(l, t, u) {
      ((u.props = Gu(l.type, l.memoizedProps)), (u.state = l.memoizedState));
      try {
        u.componentWillUnmount();
      } catch (a) {
        al(l, t, a);
      }
    }
    function tn(l, t) {
      try {
        var u = l.ref;
        if (u !== null) {
          switch (l.tag) {
            case 26:
            case 27:
            case 5:
              var a = l.stateNode;
              break;
            case 30:
              a = l.stateNode;
              break;
            default:
              a = l.stateNode;
          }
          typeof u == "function" ? (l.refCleanup = u(a)) : (u.current = a);
        }
      } catch (n) {
        al(l, t, n);
      }
    }
    function Ut(l, t) {
      var u = l.ref,
        a = l.refCleanup;
      if (u !== null)
        if (typeof a == "function")
          try {
            a();
          } catch (n) {
            al(l, t, n);
          } finally {
            ((l.refCleanup = null),
              (l = l.alternate),
              l != null && (l.refCleanup = null));
          }
        else if (typeof u == "function")
          try {
            u(null);
          } catch (n) {
            al(l, t, n);
          }
        else u.current = null;
    }
    function R1(l) {
      var t = l.type,
        u = l.memoizedProps,
        a = l.stateNode;
      try {
        l: switch (t) {
          case "button":
          case "input":
          case "select":
          case "textarea":
            u.autoFocus && a.focus();
            break l;
          case "img":
            u.src ? (a.src = u.src) : u.srcSet && (a.srcset = u.srcSet);
        }
      } catch (n) {
        al(l, l.return, n);
      }
    }
    function si(l, t, u) {
      try {
        var a = l.stateNode;
        (Zd(a, l.type, u, t), (a[Gl] = t));
      } catch (n) {
        al(l, l.return, n);
      }
    }
    function q1(l) {
      return (
        l.tag === 5 ||
        l.tag === 3 ||
        l.tag === 26 ||
        (l.tag === 27 && mu(l.type)) ||
        l.tag === 4
      );
    }
    function oi(l) {
      l: for (;;) {
        for (; l.sibling === null; ) {
          if (l.return === null || q1(l.return)) return null;
          l = l.return;
        }
        for (
          l.sibling.return = l.return, l = l.sibling;
          l.tag !== 5 && l.tag !== 6 && l.tag !== 18;
        ) {
          if (
            (l.tag === 27 && mu(l.type)) ||
            l.flags & 2 ||
            l.child === null ||
            l.tag === 4
          )
            continue l;
          ((l.child.return = l), (l = l.child));
        }
        if (!(l.flags & 2)) return l.stateNode;
      }
    }
    function Si(l, t, u) {
      var a = l.tag;
      if (a === 5 || a === 6)
        ((l = l.stateNode),
          t
            ? (u.nodeType === 9
                ? u.body
                : u.nodeName === "HTML"
                  ? u.ownerDocument.body
                  : u
              ).insertBefore(l, t)
            : ((t =
                u.nodeType === 9
                  ? u.body
                  : u.nodeName === "HTML"
                    ? u.ownerDocument.body
                    : u),
              t.appendChild(l),
              (u = u._reactRootContainer),
              u != null || t.onclick !== null || (t.onclick = Ct)));
      else if (
        a !== 4 &&
        (a === 27 && mu(l.type) && ((u = l.stateNode), (t = null)),
        (l = l.child),
        l !== null)
      )
        for (Si(l, t, u), l = l.sibling; l !== null; )
          (Si(l, t, u), (l = l.sibling));
    }
    function ve(l, t, u) {
      var a = l.tag;
      if (a === 5 || a === 6)
        ((l = l.stateNode), t ? u.insertBefore(l, t) : u.appendChild(l));
      else if (
        a !== 4 &&
        (a === 27 && mu(l.type) && (u = l.stateNode), (l = l.child), l !== null)
      )
        for (ve(l, t, u), l = l.sibling; l !== null; )
          (ve(l, t, u), (l = l.sibling));
    }
    function B1(l) {
      var t = l.stateNode,
        u = l.memoizedProps;
      try {
        for (var a = l.type, n = t.attributes; n.length; )
          t.removeAttributeNode(n[0]);
        (Hl(t, a, u), (t[Ul] = l), (t[Gl] = u));
      } catch (e) {
        al(l, l.return, e);
      }
    }
    var Qt = !1,
      Al = !1,
      gi = !1,
      Y1 = typeof WeakSet == "function" ? WeakSet : Set,
      Dl = null;
    function Ad(l, t) {
      if (((l = l.containerInfo), (Gi = He), (l = Ff(l)), vc(l))) {
        if ("selectionStart" in l)
          var u = { start: l.selectionStart, end: l.selectionEnd };
        else
          l: {
            u = ((u = l.ownerDocument) && u.defaultView) || window;
            var a = u.getSelection && u.getSelection();
            if (a && a.rangeCount !== 0) {
              u = a.anchorNode;
              var n = a.anchorOffset,
                e = a.focusNode;
              a = a.focusOffset;
              try {
                (u.nodeType, e.nodeType);
              } catch {
                u = null;
                break l;
              }
              var c = 0,
                i = -1,
                f = -1,
                s = 0,
                b = 0,
                T = l,
                o = null;
              t: for (;;) {
                for (
                  var S;
                  T !== u || (n !== 0 && T.nodeType !== 3) || (i = c + n),
                    T !== e || (a !== 0 && T.nodeType !== 3) || (f = c + a),
                    T.nodeType === 3 && (c += T.nodeValue.length),
                    (S = T.firstChild) !== null;
                )
                  ((o = T), (T = S));
                for (;;) {
                  if (T === l) break t;
                  if (
                    (o === u && ++s === n && (i = c),
                    o === e && ++b === a && (f = c),
                    (S = T.nextSibling) !== null)
                  )
                    break;
                  ((T = o), (o = T.parentNode));
                }
                T = S;
              }
              u = i === -1 || f === -1 ? null : { start: i, end: f };
            } else u = null;
          }
        u = u || { start: 0, end: 0 };
      } else u = null;
      for (
        Xi = { focusedElem: l, selectionRange: u }, He = !1, Dl = t;
        Dl !== null;
      )
        if (
          ((t = Dl), (l = t.child), (t.subtreeFlags & 1028) !== 0 && l !== null)
        )
          ((l.return = t), (Dl = l));
        else
          for (; Dl !== null; ) {
            switch (((t = Dl), (e = t.alternate), (l = t.flags), t.tag)) {
              case 0:
                if (
                  (l & 4) !== 0 &&
                  ((l = t.updateQueue),
                  (l = l !== null ? l.events : null),
                  l !== null)
                )
                  for (u = 0; u < l.length; u++)
                    ((n = l[u]), (n.ref.impl = n.nextImpl));
                break;
              case 11:
              case 15:
                break;
              case 1:
                if ((l & 1024) !== 0 && e !== null) {
                  ((l = void 0),
                    (u = t),
                    (n = e.memoizedProps),
                    (e = e.memoizedState),
                    (a = u.stateNode));
                  try {
                    var C = Gu(u.type, n);
                    ((l = a.getSnapshotBeforeUpdate(C, e)),
                      (a.__reactInternalSnapshotBeforeUpdate = l));
                  } catch (Y) {
                    al(u, u.return, Y);
                  }
                }
                break;
              case 3:
                if ((l & 1024) !== 0) {
                  if (
                    ((l = t.stateNode.containerInfo), (u = l.nodeType), u === 9)
                  )
                    Zi(l);
                  else if (u === 1)
                    switch (l.nodeName) {
                      case "HEAD":
                      case "HTML":
                      case "BODY":
                        Zi(l);
                        break;
                      default:
                        l.textContent = "";
                    }
                }
                break;
              case 5:
              case 26:
              case 27:
              case 6:
              case 4:
              case 17:
                break;
              default:
                if ((l & 1024) !== 0) throw Error(m(163));
            }
            if (((l = t.sibling), l !== null)) {
              ((l.return = t.return), (Dl = l));
              break;
            }
            Dl = t.return;
          }
    }
    function j1(l, t, u) {
      var a = u.flags;
      switch (u.tag) {
        case 0:
        case 11:
        case 15:
          (Zt(l, u), a & 4 && ln(5, u));
          break;
        case 1:
          if ((Zt(l, u), a & 4))
            if (((l = u.stateNode), t === null))
              try {
                l.componentDidMount();
              } catch (c) {
                al(u, u.return, c);
              }
            else {
              var n = Gu(u.type, t.memoizedProps);
              t = t.memoizedState;
              try {
                l.componentDidUpdate(
                  n,
                  t,
                  l.__reactInternalSnapshotBeforeUpdate,
                );
              } catch (c) {
                al(u, u.return, c);
              }
            }
          (a & 64 && p1(u), a & 512 && tn(u, u.return));
          break;
        case 3:
          if ((Zt(l, u), a & 64 && ((l = u.updateQueue), l !== null))) {
            if (((t = null), u.child !== null))
              switch (u.child.tag) {
                case 27:
                case 5:
                  t = u.child.stateNode;
                  break;
                case 1:
                  t = u.child.stateNode;
              }
            try {
              _0(l, t);
            } catch (c) {
              al(u, u.return, c);
            }
          }
          break;
        case 27:
          t === null && a & 4 && B1(u);
        case 26:
        case 5:
          (Zt(l, u), t === null && a & 4 && R1(u), a & 512 && tn(u, u.return));
          break;
        case 12:
          Zt(l, u);
          break;
        case 31:
          (Zt(l, u), a & 4 && Q1(l, u));
          break;
        case 13:
          (Zt(l, u),
            a & 4 && L1(l, u),
            a & 64 &&
              ((l = u.memoizedState),
              l !== null &&
                ((l = l.dehydrated),
                l !== null && ((u = Hd.bind(null, u)), $d(l, u)))));
          break;
        case 22:
          if (((a = u.memoizedState !== null || Qt), !a)) {
            ((t = (t !== null && t.memoizedState !== null) || Al), (n = Qt));
            var e = Al;
            ((Qt = a),
              (Al = t) && !e
                ? rt(l, u, (u.subtreeFlags & 8772) !== 0)
                : Zt(l, u),
              (Qt = n),
              (Al = e));
          }
          break;
        case 30:
          break;
        default:
          Zt(l, u);
      }
    }
    function G1(l) {
      var t = l.alternate;
      (t !== null && ((l.alternate = null), G1(t)),
        (l.child = null),
        (l.deletions = null),
        (l.sibling = null),
        l.tag === 5 && ((t = l.stateNode), t !== null && we(t)),
        (l.stateNode = null),
        (l.return = null),
        (l.dependencies = null),
        (l.memoizedProps = null),
        (l.memoizedState = null),
        (l.pendingProps = null),
        (l.stateNode = null),
        (l.updateQueue = null));
    }
    var ml = null,
      Ql = !1;
    function Lt(l, t, u) {
      for (u = u.child; u !== null; ) (X1(l, t, u), (u = u.sibling));
    }
    function X1(l, t, u) {
      if (kl && typeof kl.onCommitFiberUnmount == "function")
        try {
          kl.onCommitFiberUnmount(Ma, u);
        } catch {}
      switch (u.tag) {
        case 26:
          (Al || Ut(u, t),
            Lt(l, t, u),
            u.memoizedState
              ? u.memoizedState.count--
              : u.stateNode &&
                ((u = u.stateNode), u.parentNode.removeChild(u)));
          break;
        case 27:
          Al || Ut(u, t);
          var a = ml,
            n = Ql;
          (mu(u.type) && ((ml = u.stateNode), (Ql = !1)),
            Lt(l, t, u),
            dn(u.stateNode),
            (ml = a),
            (Ql = n));
          break;
        case 5:
          Al || Ut(u, t);
        case 6:
          if (
            ((a = ml),
            (n = Ql),
            (ml = null),
            Lt(l, t, u),
            (ml = a),
            (Ql = n),
            ml !== null)
          )
            if (Ql)
              try {
                (ml.nodeType === 9
                  ? ml.body
                  : ml.nodeName === "HTML"
                    ? ml.ownerDocument.body
                    : ml
                ).removeChild(u.stateNode);
              } catch (e) {
                al(u, t, e);
              }
            else
              try {
                ml.removeChild(u.stateNode);
              } catch (e) {
                al(u, t, e);
              }
          break;
        case 18:
          ml !== null &&
            (Ql
              ? ((l = ml),
                Hy(
                  l.nodeType === 9
                    ? l.body
                    : l.nodeName === "HTML"
                      ? l.ownerDocument.body
                      : l,
                  u.stateNode,
                ),
                _a(l))
              : Hy(ml, u.stateNode));
          break;
        case 4:
          ((a = ml),
            (n = Ql),
            (ml = u.stateNode.containerInfo),
            (Ql = !0),
            Lt(l, t, u),
            (ml = a),
            (Ql = n));
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          (eu(2, u, t), Al || eu(4, u, t), Lt(l, t, u));
          break;
        case 1:
          (Al ||
            (Ut(u, t),
            (a = u.stateNode),
            typeof a.componentWillUnmount == "function" && H1(u, t, a)),
            Lt(l, t, u));
          break;
        case 21:
          Lt(l, t, u);
          break;
        case 22:
          ((Al = (a = Al) || u.memoizedState !== null), Lt(l, t, u), (Al = a));
          break;
        default:
          Lt(l, t, u);
      }
    }
    function Q1(l, t) {
      if (
        t.memoizedState === null &&
        ((l = t.alternate), l !== null && ((l = l.memoizedState), l !== null))
      ) {
        l = l.dehydrated;
        try {
          _a(l);
        } catch (u) {
          al(t, t.return, u);
        }
      }
    }
    function L1(l, t) {
      if (
        t.memoizedState === null &&
        ((l = t.alternate),
        l !== null &&
          ((l = l.memoizedState),
          l !== null && ((l = l.dehydrated), l !== null)))
      )
        try {
          _a(l);
        } catch (u) {
          al(t, t.return, u);
        }
    }
    function _d(l) {
      switch (l.tag) {
        case 31:
        case 13:
        case 19:
          var t = l.stateNode;
          return (t === null && (t = l.stateNode = new Y1()), t);
        case 22:
          return (
            (l = l.stateNode),
            (t = l._retryCache),
            t === null && (t = l._retryCache = new Y1()),
            t
          );
        default:
          throw Error(m(435, l.tag));
      }
    }
    function de(l, t) {
      var u = _d(l);
      t.forEach(function (a) {
        if (!u.has(a)) {
          u.add(a);
          var n = Rd.bind(null, l, a);
          a.then(n, n);
        }
      });
    }
    function Ll(l, t) {
      var u = t.deletions;
      if (u !== null)
        for (var a = 0; a < u.length; a++) {
          var n = u[a],
            e = l,
            c = t,
            i = c;
          l: for (; i !== null; ) {
            switch (i.tag) {
              case 27:
                if (mu(i.type)) {
                  ((ml = i.stateNode), (Ql = !1));
                  break l;
                }
                break;
              case 5:
                ((ml = i.stateNode), (Ql = !1));
                break l;
              case 3:
              case 4:
                ((ml = i.stateNode.containerInfo), (Ql = !0));
                break l;
            }
            i = i.return;
          }
          if (ml === null) throw Error(m(160));
          (X1(e, c, n),
            (ml = null),
            (Ql = !1),
            (e = n.alternate),
            e !== null && (e.return = null),
            (n.return = null));
        }
      if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null; ) (Z1(t, l), (t = t.sibling));
    }
    var Et = null;
    function Z1(l, t) {
      var u = l.alternate,
        a = l.flags;
      switch (l.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          (Ll(t, l),
            Zl(l),
            a & 4 && (eu(3, l, l.return), ln(3, l), eu(5, l, l.return)));
          break;
        case 1:
          (Ll(t, l),
            Zl(l),
            a & 512 && (Al || u === null || Ut(u, u.return)),
            a & 64 &&
              Qt &&
              ((l = l.updateQueue),
              l !== null &&
                ((a = l.callbacks),
                a !== null &&
                  ((u = l.shared.hiddenCallbacks),
                  (l.shared.hiddenCallbacks = u === null ? a : u.concat(a))))));
          break;
        case 26:
          var n = Et;
          if (
            (Ll(t, l),
            Zl(l),
            a & 512 && (Al || u === null || Ut(u, u.return)),
            a & 4)
          ) {
            var e = u !== null ? u.memoizedState : null;
            if (((a = l.memoizedState), u === null))
              if (a === null)
                if (l.stateNode === null) {
                  l: {
                    ((a = l.type),
                      (u = l.memoizedProps),
                      (n = n.ownerDocument || n));
                    t: switch (a) {
                      case "title":
                        ((e = n.getElementsByTagName("title")[0]),
                          (!e ||
                            e[Na] ||
                            e[Ul] ||
                            e.namespaceURI === "http://www.w3.org/2000/svg" ||
                            e.hasAttribute("itemprop")) &&
                            ((e = n.createElement(a)),
                            n.head.insertBefore(
                              e,
                              n.querySelector("head > title"),
                            )),
                          Hl(e, a, u),
                          (e[Ul] = l),
                          Ml(e),
                          (a = e));
                        break l;
                      case "link":
                        var c = ry("link", "href", n).get(a + (u.href || ""));
                        if (c) {
                          for (var i = 0; i < c.length; i++)
                            if (
                              ((e = c[i]),
                              e.getAttribute("href") ===
                                (u.href == null || u.href === ""
                                  ? null
                                  : u.href) &&
                                e.getAttribute("rel") ===
                                  (u.rel == null ? null : u.rel) &&
                                e.getAttribute("title") ===
                                  (u.title == null ? null : u.title) &&
                                e.getAttribute("crossorigin") ===
                                  (u.crossOrigin == null
                                    ? null
                                    : u.crossOrigin))
                            ) {
                              c.splice(i, 1);
                              break t;
                            }
                        }
                        ((e = n.createElement(a)),
                          Hl(e, a, u),
                          n.head.appendChild(e));
                        break;
                      case "meta":
                        if (
                          (c = ry("meta", "content", n).get(
                            a + (u.content || ""),
                          ))
                        ) {
                          for (i = 0; i < c.length; i++)
                            if (
                              ((e = c[i]),
                              e.getAttribute("content") ===
                                (u.content == null ? null : "" + u.content) &&
                                e.getAttribute("name") ===
                                  (u.name == null ? null : u.name) &&
                                e.getAttribute("property") ===
                                  (u.property == null ? null : u.property) &&
                                e.getAttribute("http-equiv") ===
                                  (u.httpEquiv == null ? null : u.httpEquiv) &&
                                e.getAttribute("charset") ===
                                  (u.charSet == null ? null : u.charSet))
                            ) {
                              c.splice(i, 1);
                              break t;
                            }
                        }
                        ((e = n.createElement(a)),
                          Hl(e, a, u),
                          n.head.appendChild(e));
                        break;
                      default:
                        throw Error(m(468, a));
                    }
                    ((e[Ul] = l), Ml(e), (a = e));
                  }
                  l.stateNode = a;
                } else Vy(n, l.type, l.stateNode);
              else l.stateNode = Zy(n, a, l.memoizedProps);
            else
              e !== a
                ? (e === null
                    ? u.stateNode !== null &&
                      ((u = u.stateNode), u.parentNode.removeChild(u))
                    : e.count--,
                  a === null
                    ? Vy(n, l.type, l.stateNode)
                    : Zy(n, a, l.memoizedProps))
                : a === null &&
                  l.stateNode !== null &&
                  si(l, l.memoizedProps, u.memoizedProps);
          }
          break;
        case 27:
          (Ll(t, l),
            Zl(l),
            a & 512 && (Al || u === null || Ut(u, u.return)),
            u !== null && a & 4 && si(l, l.memoizedProps, u.memoizedProps));
          break;
        case 5:
          if (
            (Ll(t, l),
            Zl(l),
            a & 512 && (Al || u === null || Ut(u, u.return)),
            l.flags & 32)
          ) {
            n = l.stateNode;
            try {
              Ju(n, "");
            } catch (C) {
              al(l, l.return, C);
            }
          }
          (a & 4 &&
            l.stateNode != null &&
            ((n = l.memoizedProps), si(l, n, u !== null ? u.memoizedProps : n)),
            a & 1024 && (gi = !0));
          break;
        case 6:
          if ((Ll(t, l), Zl(l), a & 4)) {
            if (l.stateNode === null) throw Error(m(162));
            ((a = l.memoizedProps), (u = l.stateNode));
            try {
              u.nodeValue = a;
            } catch (C) {
              al(l, l.return, C);
            }
          }
          break;
        case 3:
          if (
            ((Ue = null),
            (n = Et),
            (Et = Me(t.containerInfo)),
            Ll(t, l),
            (Et = n),
            Zl(l),
            a & 4 && u !== null && u.memoizedState.isDehydrated)
          )
            try {
              _a(t.containerInfo);
            } catch (C) {
              al(l, l.return, C);
            }
          gi && ((gi = !1), r1(l));
          break;
        case 4:
          ((a = Et),
            (Et = Me(l.stateNode.containerInfo)),
            Ll(t, l),
            Zl(l),
            (Et = a));
          break;
        case 12:
          (Ll(t, l), Zl(l));
          break;
        case 31:
          (Ll(t, l),
            Zl(l),
            a & 4 &&
              ((a = l.updateQueue),
              a !== null && ((l.updateQueue = null), de(l, a))));
          break;
        case 13:
          (Ll(t, l),
            Zl(l),
            l.child.flags & 8192 &&
              (l.memoizedState !== null) !=
                (u !== null && u.memoizedState !== null) &&
              (he = Fl()),
            a & 4 &&
              ((a = l.updateQueue),
              a !== null && ((l.updateQueue = null), de(l, a))));
          break;
        case 22:
          n = l.memoizedState !== null;
          var f = u !== null && u.memoizedState !== null,
            s = Qt,
            b = Al;
          if (
            ((Qt = s || n),
            (Al = b || f),
            Ll(t, l),
            (Al = b),
            (Qt = s),
            Zl(l),
            a & 8192)
          )
            l: for (
              t = l.stateNode,
                t._visibility = n ? t._visibility & -2 : t._visibility | 1,
                n && (u === null || f || Qt || Al || Xu(l)),
                u = null,
                t = l;
              ;
            ) {
              if (t.tag === 5 || t.tag === 26) {
                if (u === null) {
                  f = u = t;
                  try {
                    if (((e = f.stateNode), n))
                      ((c = e.style),
                        typeof c.setProperty == "function"
                          ? c.setProperty("display", "none", "important")
                          : (c.display = "none"));
                    else {
                      i = f.stateNode;
                      var T = f.memoizedProps.style,
                        o =
                          T != null && T.hasOwnProperty("display")
                            ? T.display
                            : null;
                      i.style.display =
                        o == null || typeof o == "boolean"
                          ? ""
                          : ("" + o).trim();
                    }
                  } catch (C) {
                    al(f, f.return, C);
                  }
                }
              } else if (t.tag === 6) {
                if (u === null) {
                  f = t;
                  try {
                    f.stateNode.nodeValue = n ? "" : f.memoizedProps;
                  } catch (C) {
                    al(f, f.return, C);
                  }
                }
              } else if (t.tag === 18) {
                if (u === null) {
                  f = t;
                  try {
                    var S = f.stateNode;
                    n ? Ry(S, !0) : Ry(f.stateNode, !1);
                  } catch (C) {
                    al(f, f.return, C);
                  }
                }
              } else if (
                ((t.tag !== 22 && t.tag !== 23) ||
                  t.memoizedState === null ||
                  t === l) &&
                t.child !== null
              ) {
                ((t.child.return = t), (t = t.child));
                continue;
              }
              if (t === l) break l;
              for (; t.sibling === null; ) {
                if (t.return === null || t.return === l) break l;
                (u === t && (u = null), (t = t.return));
              }
              (u === t && (u = null),
                (t.sibling.return = t.return),
                (t = t.sibling));
            }
          a & 4 &&
            ((a = l.updateQueue),
            a !== null &&
              ((u = a.retryQueue),
              u !== null && ((a.retryQueue = null), de(l, u))));
          break;
        case 19:
          (Ll(t, l),
            Zl(l),
            a & 4 &&
              ((a = l.updateQueue),
              a !== null && ((l.updateQueue = null), de(l, a))));
          break;
        case 30:
          break;
        case 21:
          break;
        default:
          (Ll(t, l), Zl(l));
      }
    }
    function Zl(l) {
      var t = l.flags;
      if (t & 2) {
        try {
          for (var u, a = l.return; a !== null; ) {
            if (q1(a)) {
              u = a;
              break;
            }
            a = a.return;
          }
          if (u == null) throw Error(m(160));
          switch (u.tag) {
            case 27:
              var n = u.stateNode;
              ve(l, oi(l), n);
              break;
            case 5:
              var e = u.stateNode;
              (u.flags & 32 && (Ju(e, ""), (u.flags &= -33)), ve(l, oi(l), e));
              break;
            case 3:
            case 4:
              var c = u.stateNode.containerInfo;
              Si(l, oi(l), c);
              break;
            default:
              throw Error(m(161));
          }
        } catch (i) {
          al(l, l.return, i);
        }
        l.flags &= -3;
      }
      t & 4096 && (l.flags &= -4097);
    }
    function r1(l) {
      if (l.subtreeFlags & 1024)
        for (l = l.child; l !== null; ) {
          var t = l;
          (r1(t),
            t.tag === 5 && t.flags & 1024 && t.stateNode.reset(),
            (l = l.sibling));
        }
    }
    function Zt(l, t) {
      if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null; )
          (j1(l, t.alternate, t), (t = t.sibling));
    }
    function Xu(l) {
      for (l = l.child; l !== null; ) {
        var t = l;
        switch (t.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            (eu(4, t, t.return), Xu(t));
            break;
          case 1:
            Ut(t, t.return);
            var u = t.stateNode;
            (typeof u.componentWillUnmount == "function" && H1(t, t.return, u),
              Xu(t));
            break;
          case 27:
            dn(t.stateNode);
          case 26:
          case 5:
            (Ut(t, t.return), Xu(t));
            break;
          case 22:
            t.memoizedState === null && Xu(t);
            break;
          case 30:
            Xu(t);
            break;
          default:
            Xu(t);
        }
        l = l.sibling;
      }
    }
    function rt(l, t, u) {
      for (u = u && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
        var a = t.alternate,
          n = l,
          e = t,
          c = e.flags;
        switch (e.tag) {
          case 0:
          case 11:
          case 15:
            (rt(n, e, u), ln(4, e));
            break;
          case 1:
            if (
              (rt(n, e, u),
              (a = e),
              (n = a.stateNode),
              typeof n.componentDidMount == "function")
            )
              try {
                n.componentDidMount();
              } catch (s) {
                al(a, a.return, s);
              }
            if (((a = e), (n = a.updateQueue), n !== null)) {
              var i = a.stateNode;
              try {
                var f = n.shared.hiddenCallbacks;
                if (f !== null)
                  for (
                    n.shared.hiddenCallbacks = null, n = 0;
                    n < f.length;
                    n++
                  )
                    A0(f[n], i);
              } catch (s) {
                al(a, a.return, s);
              }
            }
            (u && c & 64 && p1(e), tn(e, e.return));
            break;
          case 27:
            B1(e);
          case 26:
          case 5:
            (rt(n, e, u), u && a === null && c & 4 && R1(e), tn(e, e.return));
            break;
          case 12:
            rt(n, e, u);
            break;
          case 31:
            (rt(n, e, u), u && c & 4 && Q1(n, e));
            break;
          case 13:
            (rt(n, e, u), u && c & 4 && L1(n, e));
            break;
          case 22:
            (e.memoizedState === null && rt(n, e, u), tn(e, e.return));
            break;
          case 30:
            break;
          default:
            rt(n, e, u);
        }
        t = t.sibling;
      }
    }
    function bi(l, t) {
      var u = null;
      (l !== null &&
        l.memoizedState !== null &&
        l.memoizedState.cachePool !== null &&
        (u = l.memoizedState.cachePool.pool),
        (l = null),
        t.memoizedState !== null &&
          t.memoizedState.cachePool !== null &&
          (l = t.memoizedState.cachePool.pool),
        l !== u && (l != null && l.refCount++, u != null && Za(u)));
    }
    function zi(l, t) {
      ((l = null),
        t.alternate !== null && (l = t.alternate.memoizedState.cache),
        (t = t.memoizedState.cache),
        t !== l && (t.refCount++, l != null && Za(l)));
    }
    function At(l, t, u, a) {
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null; ) (V1(l, t, u, a), (t = t.sibling));
    }
    function V1(l, t, u, a) {
      var n = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          (At(l, t, u, a), n & 2048 && ln(9, t));
          break;
        case 1:
          At(l, t, u, a);
          break;
        case 3:
          (At(l, t, u, a),
            n & 2048 &&
              ((l = null),
              t.alternate !== null && (l = t.alternate.memoizedState.cache),
              (t = t.memoizedState.cache),
              t !== l && (t.refCount++, l != null && Za(l))));
          break;
        case 12:
          if (n & 2048) {
            (At(l, t, u, a), (l = t.stateNode));
            try {
              var e = t.memoizedProps,
                c = e.id,
                i = e.onPostCommit;
              typeof i == "function" &&
                i(
                  c,
                  t.alternate === null ? "mount" : "update",
                  l.passiveEffectDuration,
                  -0,
                );
            } catch (f) {
              al(t, t.return, f);
            }
          } else At(l, t, u, a);
          break;
        case 31:
          At(l, t, u, a);
          break;
        case 13:
          At(l, t, u, a);
          break;
        case 23:
          break;
        case 22:
          ((e = t.stateNode),
            (c = t.alternate),
            t.memoizedState !== null
              ? e._visibility & 2
                ? At(l, t, u, a)
                : un(l, t)
              : e._visibility & 2
                ? At(l, t, u, a)
                : ((e._visibility |= 2),
                  ma(l, t, u, a, (t.subtreeFlags & 10256) !== 0 || !1)),
            n & 2048 && bi(c, t));
          break;
        case 24:
          (At(l, t, u, a), n & 2048 && zi(t.alternate, t));
          break;
        default:
          At(l, t, u, a);
      }
    }
    function ma(l, t, u, a, n) {
      for (
        n = n && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child;
        t !== null;
      ) {
        var e = l,
          c = t,
          i = u,
          f = a,
          s = c.flags;
        switch (c.tag) {
          case 0:
          case 11:
          case 15:
            (ma(e, c, i, f, n), ln(8, c));
            break;
          case 23:
            break;
          case 22:
            var b = c.stateNode;
            (c.memoizedState !== null
              ? b._visibility & 2
                ? ma(e, c, i, f, n)
                : un(e, c)
              : ((b._visibility |= 2), ma(e, c, i, f, n)),
              n && s & 2048 && bi(c.alternate, c));
            break;
          case 24:
            (ma(e, c, i, f, n), n && s & 2048 && zi(c.alternate, c));
            break;
          default:
            ma(e, c, i, f, n);
        }
        t = t.sibling;
      }
    }
    function un(l, t) {
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null; ) {
          var u = l,
            a = t,
            n = a.flags;
          switch (a.tag) {
            case 22:
              (un(u, a), n & 2048 && bi(a.alternate, a));
              break;
            case 24:
              (un(u, a), n & 2048 && zi(a.alternate, a));
              break;
            default:
              un(u, a);
          }
          t = t.sibling;
        }
    }
    var an = 8192;
    function ha(l, t, u) {
      if (l.subtreeFlags & an)
        for (l = l.child; l !== null; ) (x1(l, t, u), (l = l.sibling));
    }
    function x1(l, t, u) {
      switch (l.tag) {
        case 26:
          (ha(l, t, u),
            l.flags & an &&
              l.memoizedState !== null &&
              im(u, Et, l.memoizedState, l.memoizedProps));
          break;
        case 5:
          ha(l, t, u);
          break;
        case 3:
        case 4:
          var a = Et;
          ((Et = Me(l.stateNode.containerInfo)), ha(l, t, u), (Et = a));
          break;
        case 22:
          l.memoizedState === null &&
            ((a = l.alternate),
            a !== null && a.memoizedState !== null
              ? ((a = an), (an = 16777216), ha(l, t, u), (an = a))
              : ha(l, t, u));
          break;
        default:
          ha(l, t, u);
      }
    }
    function K1(l) {
      var t = l.alternate;
      if (t !== null && ((l = t.child), l !== null)) {
        t.child = null;
        do ((t = l.sibling), (l.sibling = null), (l = t));
        while (l !== null);
      }
    }
    function nn(l) {
      var t = l.deletions;
      if ((l.flags & 16) !== 0) {
        if (t !== null)
          for (var u = 0; u < t.length; u++) {
            var a = t[u];
            ((Dl = a), w1(a, l));
          }
        K1(l);
      }
      if (l.subtreeFlags & 10256)
        for (l = l.child; l !== null; ) (J1(l), (l = l.sibling));
    }
    function J1(l) {
      switch (l.tag) {
        case 0:
        case 11:
        case 15:
          (nn(l), l.flags & 2048 && eu(9, l, l.return));
          break;
        case 3:
          nn(l);
          break;
        case 12:
          nn(l);
          break;
        case 22:
          var t = l.stateNode;
          l.memoizedState !== null &&
          t._visibility & 2 &&
          (l.return === null || l.return.tag !== 13)
            ? ((t._visibility &= -3), me(l))
            : nn(l);
          break;
        default:
          nn(l);
      }
    }
    function me(l) {
      var t = l.deletions;
      if ((l.flags & 16) !== 0) {
        if (t !== null)
          for (var u = 0; u < t.length; u++) {
            var a = t[u];
            ((Dl = a), w1(a, l));
          }
        K1(l);
      }
      for (l = l.child; l !== null; ) {
        switch (((t = l), t.tag)) {
          case 0:
          case 11:
          case 15:
            (eu(8, t, t.return), me(t));
            break;
          case 22:
            ((u = t.stateNode),
              u._visibility & 2 && ((u._visibility &= -3), me(t)));
            break;
          default:
            me(t);
        }
        l = l.sibling;
      }
    }
    function w1(l, t) {
      for (; Dl !== null; ) {
        var u = Dl;
        switch (u.tag) {
          case 0:
          case 11:
          case 15:
            eu(8, u, t);
            break;
          case 23:
          case 22:
            if (
              u.memoizedState !== null &&
              u.memoizedState.cachePool !== null
            ) {
              var a = u.memoizedState.cachePool.pool;
              a != null && a.refCount++;
            }
            break;
          case 24:
            Za(u.memoizedState.cache);
        }
        if (((a = u.child), a !== null)) ((a.return = u), (Dl = a));
        else
          l: for (u = l; Dl !== null; ) {
            a = Dl;
            var n = a.sibling,
              e = a.return;
            if ((G1(a), a === u)) {
              Dl = null;
              break l;
            }
            if (n !== null) {
              ((n.return = e), (Dl = n));
              break l;
            }
            Dl = e;
          }
      }
    }
    var Od = {
        getCacheForType: function (l) {
          var t = Cl(zl),
            u = t.data.get(l);
          return (u === void 0 && ((u = l()), t.data.set(l, u)), u);
        },
        cacheSignal: function () {
          return Cl(zl).controller.signal;
        },
      },
      Md = typeof WeakMap == "function" ? WeakMap : Map,
      I = 0,
      il = null,
      r = null,
      x = 0,
      ul = 0,
      at = null,
      cu = !1,
      sa = !1,
      Ti = !1,
      Vt = 0,
      ol = 0,
      iu = 0,
      Qu = 0,
      Ei = 0,
      nt = 0,
      oa = 0,
      en = null,
      rl = null,
      Ai = !1,
      he = 0,
      W1 = 0,
      se = 1 / 0,
      oe = null,
      fu = null,
      _l = 0,
      yu = null,
      Sa = null,
      xt = 0,
      _i = 0,
      Oi = null,
      $1 = null,
      cn = 0,
      Mi = null;
    function ht() {
      return (I & 2) !== 0 && x !== 0 ? x & -x : O.T !== null ? Hi() : sf();
    }
    function F1() {
      if (nt === 0)
        if ((x & 536870912) === 0 || w) {
          var l = An;
          ((An <<= 1), (An & 3932160) === 0 && (An = 262144), (nt = l));
        } else nt = 536870912;
      return ((l = tt.current), l !== null && (l.flags |= 32), nt);
    }
    function Vl(l, t, u) {
      (((l === il && (ul === 2 || ul === 9)) ||
        l.cancelPendingCommit !== null) &&
        (ga(l, 0), vu(l, x, nt, !1)),
        Mn(l, u),
        ((I & 2) === 0 || l !== il) &&
          (l === il &&
            ((I & 2) === 0 && (Qu |= u), ol === 4 && vu(l, x, nt, !1)),
          Kt(l)));
    }
    function k1(l, t, u) {
      if ((I & 6) !== 0) throw Error(m(327));
      var a = (!u && (t & 127) === 0 && (t & l.expiredLanes) === 0) || Da(l, t),
        n = a ? Nd(l, t) : Ui(l, t, !0),
        e = a;
      do {
        if (n === 0) {
          sa && !a && vu(l, t, 0, !1);
          break;
        } else {
          if (((u = l.current.alternate), e && !Dd(u))) {
            ((n = Ui(l, t, !1)), (e = !1));
            continue;
          }
          if (n === 2) {
            if (((e = t), l.errorRecoveryDisabledLanes & e)) var c = 0;
            else
              ((c = l.pendingLanes & -536870913),
                (c = c !== 0 ? c : c & 536870912 ? 536870912 : 0));
            if (c !== 0) {
              t = c;
              l: {
                var i = l;
                n = en;
                var f = i.current.memoizedState.isDehydrated;
                if (
                  (f && (ga(i, c).flags |= 256), (c = Ui(i, c, !1)), c !== 2)
                ) {
                  if (Ti && !f) {
                    ((i.errorRecoveryDisabledLanes |= e), (Qu |= e), (n = 4));
                    break l;
                  }
                  ((e = rl),
                    (rl = n),
                    e !== null &&
                      (rl === null ? (rl = e) : rl.push.apply(rl, e)));
                }
                n = c;
              }
              if (((e = !1), n !== 2)) continue;
            }
          }
          if (n === 1) {
            (ga(l, 0), vu(l, t, 0, !0));
            break;
          }
          l: {
            switch (((a = l), (e = n), e)) {
              case 0:
              case 1:
                throw Error(m(345));
              case 4:
                if ((t & 4194048) !== t) break;
              case 6:
                vu(a, t, nt, !cu);
                break l;
              case 2:
                rl = null;
                break;
              case 3:
              case 5:
                break;
              default:
                throw Error(m(329));
            }
            if ((t & 62914560) === t && ((n = he + 300 - Fl()), 10 < n)) {
              if ((vu(a, t, nt, !cu), On(a, 0, !0) !== 0)) break l;
              ((xt = t),
                (a.timeoutHandle = Cy(
                  I1.bind(
                    null,
                    a,
                    u,
                    rl,
                    oe,
                    Ai,
                    t,
                    nt,
                    Qu,
                    oa,
                    cu,
                    e,
                    "Throttled",
                    -0,
                    0,
                  ),
                  n,
                )));
              break l;
            }
            I1(a, u, rl, oe, Ai, t, nt, Qu, oa, cu, e, null, -0, 0);
          }
        }
        break;
      } while (!0);
      Kt(l);
    }
    function I1(l, t, u, a, n, e, c, i, f, s, b, T, o, S) {
      if (
        ((l.timeoutHandle = -1),
        (T = t.subtreeFlags),
        T & 8192 || (T & 16785408) === 16785408)
      ) {
        ((T = {
          stylesheets: null,
          count: 0,
          imgCount: 0,
          imgBytes: 0,
          suspenseyImages: [],
          waitingForImages: !0,
          waitingForViewTransition: !1,
          unsuspend: Ct,
        }),
          x1(t, e, T));
        var C =
          (e & 62914560) === e
            ? he - Fl()
            : (e & 4194048) === e
              ? W1 - Fl()
              : 0;
        if (((C = fm(T, C)), C !== null)) {
          ((xt = e),
            (l.cancelPendingCommit = C(
              cy.bind(null, l, t, e, u, a, n, c, i, f, b, T, null, o, S),
            )),
            vu(l, e, c, !s));
          return;
        }
      }
      cy(l, t, e, u, a, n, c, i, f);
    }
    function Dd(l) {
      for (var t = l; ; ) {
        var u = t.tag;
        if (
          (u === 0 || u === 11 || u === 15) &&
          t.flags & 16384 &&
          ((u = t.updateQueue), u !== null && ((u = u.stores), u !== null))
        )
          for (var a = 0; a < u.length; a++) {
            var n = u[a],
              e = n.getSnapshot;
            n = n.value;
            try {
              if (!Pl(e(), n)) return !1;
            } catch {
              return !1;
            }
          }
        if (((u = t.child), t.subtreeFlags & 16384 && u !== null))
          ((u.return = t), (t = u));
        else {
          if (t === l) break;
          for (; t.sibling === null; ) {
            if (t.return === null || t.return === l) return !0;
            t = t.return;
          }
          ((t.sibling.return = t.return), (t = t.sibling));
        }
      }
      return !0;
    }
    function vu(l, t, u, a) {
      ((t &= ~Ei),
        (t &= ~Qu),
        (l.suspendedLanes |= t),
        (l.pingedLanes &= ~t),
        a && (l.warmLanes |= t),
        (a = l.expirationTimes));
      for (var n = t; 0 < n; ) {
        var e = 31 - Il(n),
          c = 1 << e;
        ((a[e] = -1), (n &= ~c));
      }
      u !== 0 && vf(l, u, t);
    }
    function Se() {
      return (I & 6) === 0 ? (fn(0, !1), !1) : !0;
    }
    function Di() {
      if (r !== null) {
        if (ul === 0) var l = r.return;
        else ((l = r), (qt = Nu = null), rc(l), (ia = null), (Va = 0), (l = r));
        for (; l !== null; ) (C1(l.alternate, l), (l = l.return));
        r = null;
      }
    }
    function ga(l, t) {
      var u = l.timeoutHandle;
      (u !== -1 && ((l.timeoutHandle = -1), xd(u)),
        (u = l.cancelPendingCommit),
        u !== null && ((l.cancelPendingCommit = null), u()),
        (xt = 0),
        Di(),
        (il = l),
        (r = u = Ht(l.current, null)),
        (x = t),
        (ul = 0),
        (at = null),
        (cu = !1),
        (sa = Da(l, t)),
        (Ti = !1),
        (oa = nt = Ei = Qu = iu = ol = 0),
        (rl = en = null),
        (Ai = !1),
        (t & 8) !== 0 && (t |= t & 32));
      var a = l.entangledLanes;
      if (a !== 0)
        for (l = l.entanglements, a &= t; 0 < a; ) {
          var n = 31 - Il(a),
            e = 1 << n;
          ((t |= l[n]), (a &= ~e));
        }
      return ((Vt = t), Gn(), u);
    }
    function P1(l, t) {
      ((X = null),
        (O.H = ka),
        t === ca || t === Kn
          ? ((t = b0()), (ul = 3))
          : t === pc
            ? ((t = b0()), (ul = 4))
            : (ul =
                t === ni
                  ? 8
                  : t !== null &&
                      typeof t == "object" &&
                      typeof t.then == "function"
                    ? 6
                    : 1),
        (at = t),
        r === null && ((ol = 1), ee(l, ft(t, l.current))));
    }
    function ly() {
      var l = tt.current;
      return l === null
        ? !0
        : (x & 4194048) === x
          ? mt === null
          : (x & 62914560) === x || (x & 536870912) !== 0
            ? l === mt
            : !1;
    }
    function ty() {
      var l = O.H;
      return ((O.H = ka), l === null ? ka : l);
    }
    function uy() {
      var l = O.A;
      return ((O.A = Od), l);
    }
    function ge() {
      ((ol = 4),
        cu || ((x & 4194048) !== x && tt.current !== null) || (sa = !0),
        ((iu & 134217727) === 0 && (Qu & 134217727) === 0) ||
          il === null ||
          vu(il, x, nt, !1));
    }
    function Ui(l, t, u) {
      var a = I;
      I |= 2;
      var n = ty(),
        e = uy();
      ((il !== l || x !== t) && ((oe = null), ga(l, t)), (t = !1));
      var c = ol;
      l: do
        try {
          if (ul !== 0 && r !== null) {
            var i = r,
              f = at;
            switch (ul) {
              case 8:
                (Di(), (c = 6));
                break l;
              case 3:
              case 2:
              case 9:
              case 6:
                tt.current === null && (t = !0);
                var s = ul;
                if (((ul = 0), (at = null), ba(l, i, f, s), u && sa)) {
                  c = 0;
                  break l;
                }
                break;
              default:
                ((s = ul), (ul = 0), (at = null), ba(l, i, f, s));
            }
          }
          (Ud(), (c = ol));
          break;
        } catch (b) {
          P1(l, b);
        }
      while (!0);
      return (
        t && l.shellSuspendCounter++,
        (qt = Nu = null),
        (I = a),
        (O.H = n),
        (O.A = e),
        r === null && ((il = null), (x = 0), Gn()),
        c
      );
    }
    function Ud() {
      for (; r !== null; ) ay(r);
    }
    function Nd(l, t) {
      var u = I;
      I |= 2;
      var a = ty(),
        n = uy();
      il !== l || x !== t
        ? ((oe = null), (se = Fl() + 500), ga(l, t))
        : (sa = Da(l, t));
      l: do
        try {
          if (ul !== 0 && r !== null) {
            t = r;
            var e = at;
            t: switch (ul) {
              case 1:
                ((ul = 0), (at = null), ba(l, t, e, 1));
                break;
              case 2:
              case 9:
                if (S0(e)) {
                  ((ul = 0), (at = null), ny(t));
                  break;
                }
                ((t = function () {
                  ((ul !== 2 && ul !== 9) || il !== l || (ul = 7), Kt(l));
                }),
                  e.then(t, t));
                break l;
              case 3:
                ul = 7;
                break l;
              case 4:
                ul = 5;
                break l;
              case 7:
                S0(e)
                  ? ((ul = 0), (at = null), ny(t))
                  : ((ul = 0), (at = null), ba(l, t, e, 7));
                break;
              case 5:
                var c = null;
                switch (r.tag) {
                  case 26:
                    c = r.memoizedState;
                  case 5:
                  case 27:
                    var i = r;
                    if (c ? xy(c) : i.stateNode.complete) {
                      ((ul = 0), (at = null));
                      var f = i.sibling;
                      if (f !== null) r = f;
                      else {
                        var s = i.return;
                        s !== null ? ((r = s), be(s)) : (r = null);
                      }
                      break t;
                    }
                }
                ((ul = 0), (at = null), ba(l, t, e, 5));
                break;
              case 6:
                ((ul = 0), (at = null), ba(l, t, e, 6));
                break;
              case 8:
                (Di(), (ol = 6));
                break l;
              default:
                throw Error(m(462));
            }
          }
          Cd();
          break;
        } catch (b) {
          P1(l, b);
        }
      while (!0);
      return (
        (qt = Nu = null),
        (O.H = a),
        (O.A = n),
        (I = u),
        r !== null ? 0 : ((il = null), (x = 0), Gn(), ol)
      );
    }
    function Cd() {
      for (; r !== null && !cv(); ) ay(r);
    }
    function ay(l) {
      var t = U1(l.alternate, l, Vt);
      ((l.memoizedProps = l.pendingProps), t === null ? be(l) : (r = t));
    }
    function ny(l) {
      var t = l,
        u = t.alternate;
      switch (t.tag) {
        case 15:
        case 0:
          t = E1(u, t, t.pendingProps, t.type, void 0, x);
          break;
        case 11:
          t = E1(u, t, t.pendingProps, t.type.render, t.ref, x);
          break;
        case 5:
          rc(t);
        default:
          (C1(u, t), (t = r = e0(t, Vt)), (t = U1(u, t, Vt)));
      }
      ((l.memoizedProps = l.pendingProps), t === null ? be(l) : (r = t));
    }
    function ba(l, t, u, a) {
      ((qt = Nu = null), rc(t), (ia = null), (Va = 0));
      var n = t.return;
      try {
        if (gd(l, n, t, u, x)) {
          ((ol = 1), ee(l, ft(u, l.current)), (r = null));
          return;
        }
      } catch (e) {
        if (n !== null) throw ((r = n), e);
        ((ol = 1), ee(l, ft(u, l.current)), (r = null));
        return;
      }
      t.flags & 32768
        ? (w || a === 1
            ? (l = !0)
            : sa || (x & 536870912) !== 0
              ? (l = !1)
              : ((cu = l = !0),
                (a === 2 || a === 9 || a === 3 || a === 6) &&
                  ((a = tt.current),
                  a !== null && a.tag === 13 && (a.flags |= 16384))),
          ey(t, l))
        : be(t);
    }
    function be(l) {
      var t = l;
      do {
        if ((t.flags & 32768) !== 0) {
          ey(t, cu);
          return;
        }
        l = t.return;
        var u = Td(t.alternate, t, Vt);
        if (u !== null) {
          r = u;
          return;
        }
        if (((t = t.sibling), t !== null)) {
          r = t;
          return;
        }
        r = t = l;
      } while (t !== null);
      ol === 0 && (ol = 5);
    }
    function ey(l, t) {
      do {
        var u = Ed(l.alternate, l);
        if (u !== null) {
          ((u.flags &= 32767), (r = u));
          return;
        }
        if (
          ((u = l.return),
          u !== null &&
            ((u.flags |= 32768), (u.subtreeFlags = 0), (u.deletions = null)),
          !t && ((l = l.sibling), l !== null))
        ) {
          r = l;
          return;
        }
        r = l = u;
      } while (l !== null);
      ((ol = 6), (r = null));
    }
    function cy(l, t, u, a, n, e, c, i, f) {
      l.cancelPendingCommit = null;
      do ze();
      while (_l !== 0);
      if ((I & 6) !== 0) throw Error(m(327));
      if (t !== null) {
        if (t === l.current) throw Error(m(177));
        if (
          ((e = t.lanes | t.childLanes),
          (e |= oc),
          Sv(l, u, e, c, i, f),
          l === il && ((r = il = null), (x = 0)),
          (Sa = t),
          (yu = l),
          (xt = u),
          (_i = e),
          (Oi = n),
          ($1 = a),
          (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0
            ? ((l.callbackNode = null),
              (l.callbackPriority = 0),
              qd(Tn, function () {
                return (dy(), null);
              }))
            : ((l.callbackNode = null), (l.callbackPriority = 0)),
          (a = (t.flags & 13878) !== 0),
          (t.subtreeFlags & 13878) !== 0 || a)
        ) {
          ((a = O.T), (O.T = null), (n = D.p), (D.p = 2), (c = I), (I |= 4));
          try {
            Ad(l, t, u);
          } finally {
            ((I = c), (D.p = n), (O.T = a));
          }
        }
        ((_l = 1), iy(), fy(), yy());
      }
    }
    function iy() {
      if (_l === 1) {
        _l = 0;
        var l = yu,
          t = Sa,
          u = (t.flags & 13878) !== 0;
        if ((t.subtreeFlags & 13878) !== 0 || u) {
          ((u = O.T), (O.T = null));
          var a = D.p;
          D.p = 2;
          var n = I;
          I |= 4;
          try {
            Z1(t, l);
            var e = Xi,
              c = Ff(l.containerInfo),
              i = e.focusedElem,
              f = e.selectionRange;
            if (
              c !== i &&
              i &&
              i.ownerDocument &&
              $f(i.ownerDocument.documentElement, i)
            ) {
              if (f !== null && vc(i)) {
                var s = f.start,
                  b = f.end;
                if ((b === void 0 && (b = s), "selectionStart" in i))
                  ((i.selectionStart = s),
                    (i.selectionEnd = Math.min(b, i.value.length)));
                else {
                  var T = i.ownerDocument || document,
                    o = (T && T.defaultView) || window;
                  if (o.getSelection) {
                    var S = o.getSelection(),
                      C = i.textContent.length,
                      Y = Math.min(f.start, C),
                      cl = f.end === void 0 ? Y : Math.min(f.end, C);
                    !S.extend && Y > cl && ((c = cl), (cl = Y), (Y = c));
                    var d = Wf(i, Y),
                      y = Wf(i, cl);
                    if (
                      d &&
                      y &&
                      (S.rangeCount !== 1 ||
                        S.anchorNode !== d.node ||
                        S.anchorOffset !== d.offset ||
                        S.focusNode !== y.node ||
                        S.focusOffset !== y.offset)
                    ) {
                      var h = T.createRange();
                      (h.setStart(d.node, d.offset),
                        S.removeAllRanges(),
                        Y > cl
                          ? (S.addRange(h), S.extend(y.node, y.offset))
                          : (h.setEnd(y.node, y.offset), S.addRange(h)));
                    }
                  }
                }
              }
              for (T = [], S = i; (S = S.parentNode); )
                S.nodeType === 1 &&
                  T.push({ element: S, left: S.scrollLeft, top: S.scrollTop });
              for (
                typeof i.focus == "function" && i.focus(), i = 0;
                i < T.length;
                i++
              ) {
                var z = T[i];
                ((z.element.scrollLeft = z.left),
                  (z.element.scrollTop = z.top));
              }
            }
            ((He = !!Gi), (Xi = Gi = null));
          } finally {
            ((I = n), (D.p = a), (O.T = u));
          }
        }
        ((l.current = t), (_l = 2));
      }
    }
    function fy() {
      if (_l === 2) {
        _l = 0;
        var l = yu,
          t = Sa,
          u = (t.flags & 8772) !== 0;
        if ((t.subtreeFlags & 8772) !== 0 || u) {
          ((u = O.T), (O.T = null));
          var a = D.p;
          D.p = 2;
          var n = I;
          I |= 4;
          try {
            j1(l, t.alternate, t);
          } finally {
            ((I = n), (D.p = a), (O.T = u));
          }
        }
        _l = 3;
      }
    }
    function yy() {
      if (_l === 4 || _l === 3) {
        ((_l = 0), iv());
        var l = yu,
          t = Sa,
          u = xt,
          a = $1;
        (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0
          ? (_l = 5)
          : ((_l = 0), (Sa = yu = null), vy(l, l.pendingLanes));
        var n = l.pendingLanes;
        if (
          (n === 0 && (fu = null),
          Ke(u),
          (t = t.stateNode),
          kl && typeof kl.onCommitFiberRoot == "function")
        )
          try {
            kl.onCommitFiberRoot(
              Ma,
              t,
              void 0,
              (t.current.flags & 128) === 128,
            );
          } catch {}
        if (a !== null) {
          ((t = O.T), (n = D.p), (D.p = 2), (O.T = null));
          try {
            for (var e = l.onRecoverableError, c = 0; c < a.length; c++) {
              var i = a[c];
              e(i.value, { componentStack: i.stack });
            }
          } finally {
            ((O.T = t), (D.p = n));
          }
        }
        ((xt & 3) !== 0 && ze(),
          Kt(l),
          (n = l.pendingLanes),
          (u & 261930) !== 0 && (n & 42) !== 0
            ? l === Mi
              ? cn++
              : ((cn = 0), (Mi = l))
            : (cn = 0),
          fn(0, !1));
      }
    }
    function vy(l, t) {
      (l.pooledCacheLanes &= t) === 0 &&
        ((t = l.pooledCache), t != null && ((l.pooledCache = null), Za(t)));
    }
    function ze() {
      return (iy(), fy(), yy(), dy());
    }
    function dy() {
      if (_l !== 5) return !1;
      var l = yu,
        t = _i;
      _i = 0;
      var u = Ke(xt),
        a = O.T,
        n = D.p;
      try {
        ((D.p = 32 > u ? 32 : u), (O.T = null), (u = Oi), (Oi = null));
        var e = yu,
          c = xt;
        if (((_l = 0), (Sa = yu = null), (xt = 0), (I & 6) !== 0))
          throw Error(m(331));
        var i = I;
        if (
          ((I |= 4),
          J1(e.current),
          V1(e, e.current, c, u),
          (I = i),
          fn(0, !1),
          kl && typeof kl.onPostCommitFiberRoot == "function")
        )
          try {
            kl.onPostCommitFiberRoot(Ma, e);
          } catch {}
        return !0;
      } finally {
        ((D.p = n), (O.T = a), vy(l, t));
      }
    }
    function my(l, t, u) {
      ((t = ft(u, t)),
        (t = ai(l.stateNode, t, 2)),
        (l = Yu(l, t, 2)),
        l !== null && (Mn(l, 2), Kt(l)));
    }
    function al(l, t, u) {
      if (l.tag === 3) my(l, l, u);
      else
        for (; t !== null; ) {
          if (t.tag === 3) {
            my(t, l, u);
            break;
          } else if (t.tag === 1) {
            var a = t.stateNode;
            if (
              typeof t.type.getDerivedStateFromError == "function" ||
              (typeof a.componentDidCatch == "function" &&
                (fu === null || !fu.has(a)))
            ) {
              ((l = ft(u, l)),
                (u = h1(2)),
                (a = Yu(t, u, 2)),
                a !== null && (s1(u, a, t, l), Mn(a, 2), Kt(a)));
              break;
            }
          }
          t = t.return;
        }
    }
    function Ni(l, t, u) {
      var a = l.pingCache;
      if (a === null) {
        a = l.pingCache = new Md();
        var n = new Set();
        a.set(t, n);
      } else ((n = a.get(t)), n === void 0 && ((n = new Set()), a.set(t, n)));
      n.has(u) ||
        ((Ti = !0), n.add(u), (l = pd.bind(null, l, t, u)), t.then(l, l));
    }
    function pd(l, t, u) {
      var a = l.pingCache;
      (a !== null && a.delete(t),
        (l.pingedLanes |= l.suspendedLanes & u),
        (l.warmLanes &= ~u),
        il === l &&
          (x & u) === u &&
          (ol === 4 || (ol === 3 && (x & 62914560) === x && 300 > Fl() - he)
            ? (I & 2) === 0 && ga(l, 0)
            : (Ei |= u),
          oa === x && (oa = 0)),
        Kt(l));
    }
    function hy(l, t) {
      (t === 0 && (t = yf()), (l = Mu(l, t)), l !== null && (Mn(l, t), Kt(l)));
    }
    function Hd(l) {
      var t = l.memoizedState,
        u = 0;
      (t !== null && (u = t.retryLane), hy(l, u));
    }
    function Rd(l, t) {
      var u = 0;
      switch (l.tag) {
        case 31:
        case 13:
          var a = l.stateNode,
            n = l.memoizedState;
          n !== null && (u = n.retryLane);
          break;
        case 19:
          a = l.stateNode;
          break;
        case 22:
          a = l.stateNode._retryCache;
          break;
        default:
          throw Error(m(314));
      }
      (a !== null && a.delete(t), hy(l, u));
    }
    function qd(l, t) {
      return re(l, t);
    }
    var Te = null,
      za = null,
      Ci = !1,
      Ee = !1,
      pi = !1,
      du = 0;
    function Kt(l) {
      (l !== za &&
        l.next === null &&
        (za === null ? (Te = za = l) : (za = za.next = l)),
        (Ee = !0),
        Ci || ((Ci = !0), Yd()));
    }
    function fn(l, t) {
      if (!pi && Ee) {
        pi = !0;
        do
          for (var u = !1, a = Te; a !== null; ) {
            if (!t)
              if (l !== 0) {
                var n = a.pendingLanes;
                if (n === 0) var e = 0;
                else {
                  var c = a.suspendedLanes,
                    i = a.pingedLanes;
                  ((e = (1 << (31 - Il(42 | l) + 1)) - 1),
                    (e &= n & ~(c & ~i)),
                    (e = e & 201326741 ? (e & 201326741) | 1 : e ? e | 2 : 0));
                }
                e !== 0 && ((u = !0), gy(a, e));
              } else
                ((e = x),
                  (e = On(
                    a,
                    a === il ? e : 0,
                    a.cancelPendingCommit !== null || a.timeoutHandle !== -1,
                  )),
                  (e & 3) === 0 || Da(a, e) || ((u = !0), gy(a, e)));
            a = a.next;
          }
        while (u);
        pi = !1;
      }
    }
    function Bd() {
      sy();
    }
    function sy() {
      Ee = Ci = !1;
      var l = 0;
      du !== 0 && Vd() && (l = du);
      for (var t = Fl(), u = null, a = Te; a !== null; ) {
        var n = a.next,
          e = oy(a, t);
        (e === 0
          ? ((a.next = null),
            u === null ? (Te = n) : (u.next = n),
            n === null && (za = u))
          : ((u = a), (l !== 0 || (e & 3) !== 0) && (Ee = !0)),
          (a = n));
      }
      ((_l !== 0 && _l !== 5) || fn(l, !1), du !== 0 && (du = 0));
    }
    function oy(l, t) {
      for (
        var u = l.suspendedLanes,
          a = l.pingedLanes,
          n = l.expirationTimes,
          e = l.pendingLanes & -62914561;
        0 < e;
      ) {
        var c = 31 - Il(e),
          i = 1 << c,
          f = n[c];
        (f === -1
          ? ((i & u) === 0 || (i & a) !== 0) && (n[c] = ov(i, t))
          : f <= t && (l.expiredLanes |= i),
          (e &= ~i));
      }
      if (
        ((t = il),
        (u = x),
        (u = On(
          l,
          l === t ? u : 0,
          l.cancelPendingCommit !== null || l.timeoutHandle !== -1,
        )),
        (a = l.callbackNode),
        u === 0 ||
          (l === t && (ul === 2 || ul === 9)) ||
          l.cancelPendingCommit !== null)
      )
        return (
          a !== null && a !== null && Ve(a),
          (l.callbackNode = null),
          (l.callbackPriority = 0)
        );
      if ((u & 3) === 0 || Da(l, u)) {
        if (((t = u & -u), t === l.callbackPriority)) return t;
        switch ((a !== null && Ve(a), Ke(u))) {
          case 2:
          case 8:
            u = cf;
            break;
          case 32:
            u = Tn;
            break;
          case 268435456:
            u = ff;
            break;
          default:
            u = Tn;
        }
        return (
          (a = Sy.bind(null, l)),
          (u = re(u, a)),
          (l.callbackPriority = t),
          (l.callbackNode = u),
          t
        );
      }
      return (
        a !== null && a !== null && Ve(a),
        (l.callbackPriority = 2),
        (l.callbackNode = null),
        2
      );
    }
    function Sy(l, t) {
      if (_l !== 0 && _l !== 5)
        return ((l.callbackNode = null), (l.callbackPriority = 0), null);
      var u = l.callbackNode;
      if (ze() && l.callbackNode !== u) return null;
      var a = x;
      return (
        (a = On(
          l,
          l === il ? a : 0,
          l.cancelPendingCommit !== null || l.timeoutHandle !== -1,
        )),
        a === 0
          ? null
          : (k1(l, a, t),
            oy(l, Fl()),
            l.callbackNode != null && l.callbackNode === u
              ? Sy.bind(null, l)
              : null)
      );
    }
    function gy(l, t) {
      if (ze()) return null;
      k1(l, t, !0);
    }
    function Yd() {
      Kd(function () {
        (I & 6) !== 0 ? re(ef, Bd) : sy();
      });
    }
    function Hi() {
      if (du === 0) {
        var l = na;
        (l === 0 && ((l = En), (En <<= 1), (En & 261888) === 0 && (En = 256)),
          (du = l));
      }
      return du;
    }
    function by(l) {
      return l == null || typeof l == "symbol" || typeof l == "boolean"
        ? null
        : typeof l == "function"
          ? l
          : Cn("" + l);
    }
    function zy(l, t) {
      var u = t.ownerDocument.createElement("input");
      return (
        (u.name = t.name),
        (u.value = t.value),
        l.id && u.setAttribute("form", l.id),
        t.parentNode.insertBefore(u, t),
        (l = new FormData(l)),
        u.parentNode.removeChild(u),
        l
      );
    }
    function jd(l, t, u, a, n) {
      if (t === "submit" && u && u.stateNode === n) {
        var e = by((n[Gl] || null).action),
          c = a.submitter;
        c &&
          ((t = (t = c[Gl] || null)
            ? by(t.formAction)
            : c.getAttribute("formAction")),
          t !== null && ((e = t), (c = null)));
        var i = new qn("action", "action", null, a, n);
        l.push({
          event: i,
          listeners: [
            {
              instance: null,
              listener: function () {
                if (a.defaultPrevented) {
                  if (du !== 0) {
                    var f = c ? zy(n, c) : new FormData(n);
                    kc(
                      u,
                      { pending: !0, data: f, method: n.method, action: e },
                      null,
                      f,
                    );
                  }
                } else
                  typeof e == "function" &&
                    (i.preventDefault(),
                    (f = c ? zy(n, c) : new FormData(n)),
                    kc(
                      u,
                      { pending: !0, data: f, method: n.method, action: e },
                      e,
                      f,
                    ));
              },
              currentTarget: n,
            },
          ],
        });
      }
    }
    for (var Ri = 0; Ri < sc.length; Ri++) {
      var qi = sc[Ri];
      Tt(qi.toLowerCase(), "on" + (qi[0].toUpperCase() + qi.slice(1)));
    }
    (Tt(Pf, "onAnimationEnd"),
      Tt(l0, "onAnimationIteration"),
      Tt(t0, "onAnimationStart"),
      Tt("dblclick", "onDoubleClick"),
      Tt("focusin", "onFocus"),
      Tt("focusout", "onBlur"),
      Tt(kv, "onTransitionRun"),
      Tt(Iv, "onTransitionStart"),
      Tt(Pv, "onTransitionCancel"),
      Tt(u0, "onTransitionEnd"),
      xu("onMouseEnter", ["mouseout", "mouseover"]),
      xu("onMouseLeave", ["mouseout", "mouseover"]),
      xu("onPointerEnter", ["pointerout", "pointerover"]),
      xu("onPointerLeave", ["pointerout", "pointerover"]),
      Eu(
        "onChange",
        "change click focusin focusout input keydown keyup selectionchange".split(
          " ",
        ),
      ),
      Eu(
        "onSelect",
        "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
          " ",
        ),
      ),
      Eu("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
      Eu(
        "onCompositionEnd",
        "compositionend focusout keydown keypress keyup mousedown".split(" "),
      ),
      Eu(
        "onCompositionStart",
        "compositionstart focusout keydown keypress keyup mousedown".split(" "),
      ),
      Eu(
        "onCompositionUpdate",
        "compositionupdate focusout keydown keypress keyup mousedown".split(
          " ",
        ),
      ));
    var yn =
        "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
          " ",
        ),
      Gd = new Set(
        "beforetoggle cancel close invalid load scroll scrollend toggle"
          .split(" ")
          .concat(yn),
      );
    function Ty(l, t) {
      t = (t & 4) !== 0;
      for (var u = 0; u < l.length; u++) {
        var a = l[u],
          n = a.event;
        a = a.listeners;
        l: {
          var e = void 0;
          if (t)
            for (var c = a.length - 1; 0 <= c; c--) {
              var i = a[c],
                f = i.instance,
                s = i.currentTarget;
              if (((i = i.listener), f !== e && n.isPropagationStopped()))
                break l;
              ((e = i), (n.currentTarget = s));
              try {
                e(n);
              } catch (b) {
                jn(b);
              }
              ((n.currentTarget = null), (e = f));
            }
          else
            for (c = 0; c < a.length; c++) {
              if (
                ((i = a[c]),
                (f = i.instance),
                (s = i.currentTarget),
                (i = i.listener),
                f !== e && n.isPropagationStopped())
              )
                break l;
              ((e = i), (n.currentTarget = s));
              try {
                e(n);
              } catch (b) {
                jn(b);
              }
              ((n.currentTarget = null), (e = f));
            }
        }
      }
    }
    function V(l, t) {
      var u = t[Je];
      u === void 0 && (u = t[Je] = new Set());
      var a = l + "__bubble";
      u.has(a) || (Ay(t, l, 2, !1), u.add(a));
    }
    function Bi(l, t, u) {
      var a = 0;
      (t && (a |= 4), Ay(u, l, a, t));
    }
    var Ae = "_reactListening" + Math.random().toString(36).slice(2);
    function Ey(l) {
      if (!l[Ae]) {
        ((l[Ae] = !0),
          gf.forEach(function (u) {
            u !== "selectionchange" &&
              (Gd.has(u) || Bi(u, !1, l), Bi(u, !0, l));
          }));
        var t = l.nodeType === 9 ? l : l.ownerDocument;
        t === null || t[Ae] || ((t[Ae] = !0), Bi("selectionchange", !1, t));
      }
    }
    function Ay(l, t, u, a) {
      switch ($y(t)) {
        case 2:
          var n = hm;
          break;
        case 8:
          n = sm;
          break;
        default:
          n = $i;
      }
      ((u = n.bind(null, t, u, l)),
        (n = void 0),
        !tc ||
          (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
          (n = !0),
        a
          ? n !== void 0
            ? l.addEventListener(t, u, { capture: !0, passive: n })
            : l.addEventListener(t, u, !0)
          : n !== void 0
            ? l.addEventListener(t, u, { passive: n })
            : l.addEventListener(t, u, !1));
    }
    function Yi(l, t, u, a, n) {
      var e = a;
      if ((t & 1) === 0 && (t & 2) === 0 && a !== null)
        l: for (;;) {
          if (a === null) return;
          var c = a.tag;
          if (c === 3 || c === 4) {
            var i = a.stateNode.containerInfo;
            if (i === n) break;
            if (c === 4)
              for (c = a.return; c !== null; ) {
                var f = c.tag;
                if ((f === 3 || f === 4) && c.stateNode.containerInfo === n)
                  return;
                c = c.return;
              }
            for (; i !== null; ) {
              if (((c = Zu(i)), c === null)) return;
              if (((f = c.tag), f === 5 || f === 6 || f === 26 || f === 27)) {
                a = e = c;
                continue l;
              }
              i = i.parentNode;
            }
          }
          a = a.return;
        }
      Cf(function () {
        var s = e,
          b = Pe(u),
          T = [];
        l: {
          var o = a0.get(l);
          if (o !== void 0) {
            var S = qn,
              C = l;
            switch (l) {
              case "keypress":
                if (Hn(u) === 0) break l;
              case "keydown":
              case "keyup":
                S = Bv;
                break;
              case "focusin":
                ((C = "focus"), (S = ec));
                break;
              case "focusout":
                ((C = "blur"), (S = ec));
                break;
              case "beforeblur":
              case "afterblur":
                S = ec;
                break;
              case "click":
                if (u.button === 2) break l;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                S = Rf;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                S = Uv;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                S = Yv;
                break;
              case Pf:
              case l0:
              case t0:
                S = Nv;
                break;
              case u0:
                S = jv;
                break;
              case "scroll":
              case "scrollend":
                S = Dv;
                break;
              case "wheel":
                S = Gv;
                break;
              case "copy":
              case "cut":
              case "paste":
                S = Cv;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                S = Bf;
                break;
              case "toggle":
              case "beforetoggle":
                S = Xv;
            }
            var Y = (t & 4) !== 0,
              cl = !Y && (l === "scroll" || l === "scrollend"),
              d = Y ? (o !== null ? o + "Capture" : null) : o;
            Y = [];
            for (var y = s, h; y !== null; ) {
              var z = y;
              if (
                ((h = z.stateNode),
                (z = z.tag),
                (z !== 5 && z !== 26 && z !== 27) ||
                  h === null ||
                  d === null ||
                  ((z = pa(y, d)), z != null && Y.push(vn(y, z, h))),
                cl)
              )
                break;
              y = y.return;
            }
            0 < Y.length &&
              ((o = new S(o, C, null, u, b)),
              T.push({ event: o, listeners: Y }));
          }
        }
        if ((t & 7) === 0) {
          l: {
            if (
              ((o = l === "mouseover" || l === "pointerover"),
              (S = l === "mouseout" || l === "pointerout"),
              o &&
                u !== Ie &&
                (C = u.relatedTarget || u.fromElement) &&
                (Zu(C) || C[Ua]))
            )
              break l;
            if (
              (S || o) &&
              ((o =
                b.window === b
                  ? b
                  : (o = b.ownerDocument)
                    ? o.defaultView || o.parentWindow
                    : window),
              S
                ? ((C = u.relatedTarget || u.toElement),
                  (S = s),
                  (C = C ? Zu(C) : null),
                  C !== null &&
                    ((cl = ll(C)),
                    (Y = C.tag),
                    C !== cl || (Y !== 5 && Y !== 27 && Y !== 6)) &&
                    (C = null))
                : ((S = null), (C = s)),
              S !== C)
            ) {
              if (
                ((Y = Rf),
                (z = "onMouseLeave"),
                (d = "onMouseEnter"),
                (y = "mouse"),
                (l === "pointerout" || l === "pointerover") &&
                  ((Y = Bf),
                  (z = "onPointerLeave"),
                  (d = "onPointerEnter"),
                  (y = "pointer")),
                (cl = S == null ? o : Ca(S)),
                (h = C == null ? o : Ca(C)),
                (o = new Y(z, y + "leave", S, u, b)),
                (o.target = cl),
                (o.relatedTarget = h),
                (z = null),
                Zu(b) === s &&
                  ((Y = new Y(d, y + "enter", C, u, b)),
                  (Y.target = h),
                  (Y.relatedTarget = cl),
                  (z = Y)),
                (cl = z),
                S && C)
              )
                t: {
                  for (Y = Xd, d = S, y = C, h = 0, z = d; z; z = Y(z)) h++;
                  z = 0;
                  for (var R = y; R; R = Y(R)) z++;
                  for (; 0 < h - z; ) ((d = Y(d)), h--);
                  for (; 0 < z - h; ) ((y = Y(y)), z--);
                  for (; h--; ) {
                    if (d === y || (y !== null && d === y.alternate)) {
                      Y = d;
                      break t;
                    }
                    ((d = Y(d)), (y = Y(y)));
                  }
                  Y = null;
                }
              else Y = null;
              (S !== null && _y(T, o, S, Y, !1),
                C !== null && cl !== null && _y(T, cl, C, Y, !0));
            }
          }
          l: {
            if (
              ((o = s ? Ca(s) : window),
              (S = o.nodeName && o.nodeName.toLowerCase()),
              S === "select" || (S === "input" && o.type === "file"))
            )
              var $ = rf;
            else if (Lf(o))
              if (Vf) $ = Wv;
              else {
                $ = Jv;
                var p = Kv;
              }
            else
              ((S = o.nodeName),
                !S ||
                S.toLowerCase() !== "input" ||
                (o.type !== "checkbox" && o.type !== "radio")
                  ? s && ke(s.elementType) && ($ = rf)
                  : ($ = wv));
            if ($ && ($ = $(l, s))) {
              Zf(T, $, u, b);
              break l;
            }
            (p && p(l, o, s),
              l === "focusout" &&
                s &&
                o.type === "number" &&
                s.memoizedProps.value != null &&
                Fe(o, "number", o.value));
          }
          switch (((p = s ? Ca(s) : window), l)) {
            case "focusin":
              (Lf(p) || p.contentEditable === "true") &&
                ((Fu = p), (dc = s), (Xa = null));
              break;
            case "focusout":
              Xa = dc = Fu = null;
              break;
            case "mousedown":
              mc = !0;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              ((mc = !1), kf(T, u, b));
              break;
            case "selectionchange":
              if (Fv) break;
            case "keydown":
            case "keyup":
              kf(T, u, b);
          }
          var Q;
          if (ic)
            l: {
              switch (l) {
                case "compositionstart":
                  var K = "onCompositionStart";
                  break l;
                case "compositionend":
                  K = "onCompositionEnd";
                  break l;
                case "compositionupdate":
                  K = "onCompositionUpdate";
                  break l;
              }
              K = void 0;
            }
          else
            $u
              ? Xf(l, u) && (K = "onCompositionEnd")
              : l === "keydown" &&
                u.keyCode === 229 &&
                (K = "onCompositionStart");
          (K &&
            (Yf &&
              u.locale !== "ko" &&
              ($u || K !== "onCompositionStart"
                ? K === "onCompositionEnd" && $u && (Q = pf())
                : ((kt = b),
                  (uc = "value" in kt ? kt.value : kt.textContent),
                  ($u = !0))),
            (p = _e(s, K)),
            0 < p.length &&
              ((K = new qf(K, l, null, u, b)),
              T.push({ event: K, listeners: p }),
              Q ? (K.data = Q) : ((Q = Qf(u)), Q !== null && (K.data = Q)))),
            (Q = Lv ? Zv(l, u) : rv(l, u)) &&
              ((K = _e(s, "onBeforeInput")),
              0 < K.length &&
                ((p = new qf("onBeforeInput", "beforeinput", null, u, b)),
                T.push({ event: p, listeners: K }),
                (p.data = Q))),
            jd(T, l, s, u, b));
        }
        Ty(T, t);
      });
    }
    function vn(l, t, u) {
      return { instance: l, listener: t, currentTarget: u };
    }
    function _e(l, t) {
      for (var u = t + "Capture", a = []; l !== null; ) {
        var n = l,
          e = n.stateNode;
        if (
          ((n = n.tag),
          (n !== 5 && n !== 26 && n !== 27) ||
            e === null ||
            ((n = pa(l, u)),
            n != null && a.unshift(vn(l, n, e)),
            (n = pa(l, t)),
            n != null && a.push(vn(l, n, e))),
          l.tag === 3)
        )
          return a;
        l = l.return;
      }
      return [];
    }
    function Xd(l) {
      if (l === null) return null;
      do l = l.return;
      while (l && l.tag !== 5 && l.tag !== 27);
      return l || null;
    }
    function _y(l, t, u, a, n) {
      for (var e = t._reactName, c = []; u !== null && u !== a; ) {
        var i = u,
          f = i.alternate,
          s = i.stateNode;
        if (((i = i.tag), f !== null && f === a)) break;
        ((i !== 5 && i !== 26 && i !== 27) ||
          s === null ||
          ((f = s),
          n
            ? ((s = pa(u, e)), s != null && c.unshift(vn(u, s, f)))
            : n || ((s = pa(u, e)), s != null && c.push(vn(u, s, f)))),
          (u = u.return));
      }
      c.length !== 0 && l.push({ event: t, listeners: c });
    }
    var Qd = /\r\n?/g,
      Ld = /\u0000|\uFFFD/g;
    function Oy(l) {
      return (typeof l == "string" ? l : "" + l)
        .replace(
          Qd,
          `
`,
        )
        .replace(Ld, "");
    }
    function My(l, t) {
      return ((t = Oy(t)), Oy(l) === t);
    }
    function el(l, t, u, a, n, e) {
      switch (u) {
        case "children":
          typeof a == "string"
            ? t === "body" || (t === "textarea" && a === "") || Ju(l, a)
            : (typeof a == "number" || typeof a == "bigint") &&
              t !== "body" &&
              Ju(l, "" + a);
          break;
        case "className":
          Un(l, "class", a);
          break;
        case "tabIndex":
          Un(l, "tabindex", a);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          Un(l, u, a);
          break;
        case "style":
          Uf(l, a, e);
          break;
        case "data":
          if (t !== "object") {
            Un(l, "data", a);
            break;
          }
        case "src":
        case "href":
          if (a === "" && (t !== "a" || u !== "href")) {
            l.removeAttribute(u);
            break;
          }
          if (
            a == null ||
            typeof a == "function" ||
            typeof a == "symbol" ||
            typeof a == "boolean"
          ) {
            l.removeAttribute(u);
            break;
          }
          ((a = Cn("" + a)), l.setAttribute(u, a));
          break;
        case "action":
        case "formAction":
          if (typeof a == "function") {
            l.setAttribute(
              u,
              "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
            );
            break;
          } else
            typeof e == "function" &&
              (u === "formAction"
                ? (t !== "input" && el(l, t, "name", n.name, n, null),
                  el(l, t, "formEncType", n.formEncType, n, null),
                  el(l, t, "formMethod", n.formMethod, n, null),
                  el(l, t, "formTarget", n.formTarget, n, null))
                : (el(l, t, "encType", n.encType, n, null),
                  el(l, t, "method", n.method, n, null),
                  el(l, t, "target", n.target, n, null)));
          if (a == null || typeof a == "symbol" || typeof a == "boolean") {
            l.removeAttribute(u);
            break;
          }
          ((a = Cn("" + a)), l.setAttribute(u, a));
          break;
        case "onClick":
          a != null && (l.onclick = Ct);
          break;
        case "onScroll":
          a != null && V("scroll", l);
          break;
        case "onScrollEnd":
          a != null && V("scrollend", l);
          break;
        case "dangerouslySetInnerHTML":
          if (a != null) {
            if (typeof a != "object" || !("__html" in a)) throw Error(m(61));
            if (((u = a.__html), u != null)) {
              if (n.children != null) throw Error(m(60));
              l.innerHTML = u;
            }
          }
          break;
        case "multiple":
          l.multiple = a && typeof a != "function" && typeof a != "symbol";
          break;
        case "muted":
          l.muted = a && typeof a != "function" && typeof a != "symbol";
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
          break;
        case "autoFocus":
          break;
        case "xlinkHref":
          if (
            a == null ||
            typeof a == "function" ||
            typeof a == "boolean" ||
            typeof a == "symbol"
          ) {
            l.removeAttribute("xlink:href");
            break;
          }
          ((u = Cn("" + a)),
            l.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", u));
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          a != null && typeof a != "function" && typeof a != "symbol"
            ? l.setAttribute(u, "" + a)
            : l.removeAttribute(u);
          break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
          a && typeof a != "function" && typeof a != "symbol"
            ? l.setAttribute(u, "")
            : l.removeAttribute(u);
          break;
        case "capture":
        case "download":
          a === !0
            ? l.setAttribute(u, "")
            : a !== !1 &&
                a != null &&
                typeof a != "function" &&
                typeof a != "symbol"
              ? l.setAttribute(u, a)
              : l.removeAttribute(u);
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          a != null &&
          typeof a != "function" &&
          typeof a != "symbol" &&
          !isNaN(a) &&
          1 <= a
            ? l.setAttribute(u, a)
            : l.removeAttribute(u);
          break;
        case "rowSpan":
        case "start":
          a == null ||
          typeof a == "function" ||
          typeof a == "symbol" ||
          isNaN(a)
            ? l.removeAttribute(u)
            : l.setAttribute(u, a);
          break;
        case "popover":
          (V("beforetoggle", l), V("toggle", l), Dn(l, "popover", a));
          break;
        case "xlinkActuate":
          Nt(l, "http://www.w3.org/1999/xlink", "xlink:actuate", a);
          break;
        case "xlinkArcrole":
          Nt(l, "http://www.w3.org/1999/xlink", "xlink:arcrole", a);
          break;
        case "xlinkRole":
          Nt(l, "http://www.w3.org/1999/xlink", "xlink:role", a);
          break;
        case "xlinkShow":
          Nt(l, "http://www.w3.org/1999/xlink", "xlink:show", a);
          break;
        case "xlinkTitle":
          Nt(l, "http://www.w3.org/1999/xlink", "xlink:title", a);
          break;
        case "xlinkType":
          Nt(l, "http://www.w3.org/1999/xlink", "xlink:type", a);
          break;
        case "xmlBase":
          Nt(l, "http://www.w3.org/XML/1998/namespace", "xml:base", a);
          break;
        case "xmlLang":
          Nt(l, "http://www.w3.org/XML/1998/namespace", "xml:lang", a);
          break;
        case "xmlSpace":
          Nt(l, "http://www.w3.org/XML/1998/namespace", "xml:space", a);
          break;
        case "is":
          Dn(l, "is", a);
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          (!(2 < u.length) ||
            (u[0] !== "o" && u[0] !== "O") ||
            (u[1] !== "n" && u[1] !== "N")) &&
            ((u = Ov.get(u) || u), Dn(l, u, a));
      }
    }
    function ji(l, t, u, a, n, e) {
      switch (u) {
        case "style":
          Uf(l, a, e);
          break;
        case "dangerouslySetInnerHTML":
          if (a != null) {
            if (typeof a != "object" || !("__html" in a)) throw Error(m(61));
            if (((u = a.__html), u != null)) {
              if (n.children != null) throw Error(m(60));
              l.innerHTML = u;
            }
          }
          break;
        case "children":
          typeof a == "string"
            ? Ju(l, a)
            : (typeof a == "number" || typeof a == "bigint") && Ju(l, "" + a);
          break;
        case "onScroll":
          a != null && V("scroll", l);
          break;
        case "onScrollEnd":
          a != null && V("scrollend", l);
          break;
        case "onClick":
          a != null && (l.onclick = Ct);
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
          break;
        case "innerText":
        case "textContent":
          break;
        default:
          if (!bf.hasOwnProperty(u))
            l: {
              if (
                u[0] === "o" &&
                u[1] === "n" &&
                ((n = u.endsWith("Capture")),
                (t = u.slice(2, n ? u.length - 7 : void 0)),
                (e = l[Gl] || null),
                (e = e != null ? e[u] : null),
                typeof e == "function" && l.removeEventListener(t, e, n),
                typeof a == "function")
              ) {
                (typeof e != "function" &&
                  e !== null &&
                  (u in l
                    ? (l[u] = null)
                    : l.hasAttribute(u) && l.removeAttribute(u)),
                  l.addEventListener(t, a, n));
                break l;
              }
              u in l
                ? (l[u] = a)
                : a === !0
                  ? l.setAttribute(u, "")
                  : Dn(l, u, a);
            }
      }
    }
    function Hl(l, t, u) {
      switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "img":
          (V("error", l), V("load", l));
          var a = !1,
            n = !1,
            e;
          for (e in u)
            if (u.hasOwnProperty(e)) {
              var c = u[e];
              if (c != null)
                switch (e) {
                  case "src":
                    a = !0;
                    break;
                  case "srcSet":
                    n = !0;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(m(137, t));
                  default:
                    el(l, t, e, c, u, null);
                }
            }
          (n && el(l, t, "srcSet", u.srcSet, u, null),
            a && el(l, t, "src", u.src, u, null));
          return;
        case "input":
          V("invalid", l);
          var i = (e = c = n = null),
            f = null,
            s = null;
          for (a in u)
            if (u.hasOwnProperty(a)) {
              var b = u[a];
              if (b != null)
                switch (a) {
                  case "name":
                    n = b;
                    break;
                  case "type":
                    c = b;
                    break;
                  case "checked":
                    f = b;
                    break;
                  case "defaultChecked":
                    s = b;
                    break;
                  case "value":
                    e = b;
                    break;
                  case "defaultValue":
                    i = b;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (b != null) throw Error(m(137, t));
                    break;
                  default:
                    el(l, t, a, b, u, null);
                }
            }
          _f(l, e, i, f, s, c, n, !1);
          return;
        case "select":
          (V("invalid", l), (a = c = e = null));
          for (n in u)
            if (u.hasOwnProperty(n) && ((i = u[n]), i != null))
              switch (n) {
                case "value":
                  e = i;
                  break;
                case "defaultValue":
                  c = i;
                  break;
                case "multiple":
                  a = i;
                default:
                  el(l, t, n, i, u, null);
              }
          ((t = e),
            (u = c),
            (l.multiple = !!a),
            t != null ? Ku(l, !!a, t, !1) : u != null && Ku(l, !!a, u, !0));
          return;
        case "textarea":
          (V("invalid", l), (e = n = a = null));
          for (c in u)
            if (u.hasOwnProperty(c) && ((i = u[c]), i != null))
              switch (c) {
                case "value":
                  a = i;
                  break;
                case "defaultValue":
                  n = i;
                  break;
                case "children":
                  e = i;
                  break;
                case "dangerouslySetInnerHTML":
                  if (i != null) throw Error(m(91));
                  break;
                default:
                  el(l, t, c, i, u, null);
              }
          Mf(l, a, n, e);
          return;
        case "option":
          for (f in u)
            u.hasOwnProperty(f) &&
              ((a = u[f]), a != null) &&
              (f === "selected"
                ? (l.selected =
                    a && typeof a != "function" && typeof a != "symbol")
                : el(l, t, f, a, u, null));
          return;
        case "dialog":
          (V("beforetoggle", l), V("toggle", l), V("cancel", l), V("close", l));
          break;
        case "iframe":
        case "object":
          V("load", l);
          break;
        case "video":
        case "audio":
          for (a = 0; a < yn.length; a++) V(yn[a], l);
          break;
        case "image":
          (V("error", l), V("load", l));
          break;
        case "details":
          V("toggle", l);
          break;
        case "embed":
        case "source":
        case "link":
          (V("error", l), V("load", l));
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
          for (s in u)
            if (u.hasOwnProperty(s) && ((a = u[s]), a != null))
              switch (s) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(m(137, t));
                default:
                  el(l, t, s, a, u, null);
              }
          return;
        default:
          if (ke(t)) {
            for (b in u)
              u.hasOwnProperty(b) &&
                ((a = u[b]), a !== void 0 && ji(l, t, b, a, u, void 0));
            return;
          }
      }
      for (i in u)
        u.hasOwnProperty(i) &&
          ((a = u[i]), a != null && el(l, t, i, a, u, null));
    }
    function Zd(l, t, u, a) {
      switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "input":
          var n = null,
            e = null,
            c = null,
            i = null,
            f = null,
            s = null,
            b = null;
          for (S in u) {
            var T = u[S];
            if (u.hasOwnProperty(S) && T != null)
              switch (S) {
                case "checked":
                  break;
                case "value":
                  break;
                case "defaultValue":
                  f = T;
                default:
                  a.hasOwnProperty(S) || el(l, t, S, null, a, T);
              }
          }
          for (var o in a) {
            var S = a[o];
            if (((T = u[o]), a.hasOwnProperty(o) && (S != null || T != null)))
              switch (o) {
                case "type":
                  e = S;
                  break;
                case "name":
                  n = S;
                  break;
                case "checked":
                  s = S;
                  break;
                case "defaultChecked":
                  b = S;
                  break;
                case "value":
                  c = S;
                  break;
                case "defaultValue":
                  i = S;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (S != null) throw Error(m(137, t));
                  break;
                default:
                  S !== T && el(l, t, o, S, a, T);
              }
          }
          $e(l, c, i, f, s, b, e, n);
          return;
        case "select":
          S = c = i = o = null;
          for (e in u)
            if (((f = u[e]), u.hasOwnProperty(e) && f != null))
              switch (e) {
                case "value":
                  break;
                case "multiple":
                  S = f;
                default:
                  a.hasOwnProperty(e) || el(l, t, e, null, a, f);
              }
          for (n in a)
            if (
              ((e = a[n]),
              (f = u[n]),
              a.hasOwnProperty(n) && (e != null || f != null))
            )
              switch (n) {
                case "value":
                  o = e;
                  break;
                case "defaultValue":
                  i = e;
                  break;
                case "multiple":
                  c = e;
                default:
                  e !== f && el(l, t, n, e, a, f);
              }
          ((t = i),
            (u = c),
            (a = S),
            o != null
              ? Ku(l, !!u, o, !1)
              : !!a != !!u &&
                (t != null ? Ku(l, !!u, t, !0) : Ku(l, !!u, u ? [] : "", !1)));
          return;
        case "textarea":
          S = o = null;
          for (i in u)
            if (
              ((n = u[i]),
              u.hasOwnProperty(i) && n != null && !a.hasOwnProperty(i))
            )
              switch (i) {
                case "value":
                  break;
                case "children":
                  break;
                default:
                  el(l, t, i, null, a, n);
              }
          for (c in a)
            if (
              ((n = a[c]),
              (e = u[c]),
              a.hasOwnProperty(c) && (n != null || e != null))
            )
              switch (c) {
                case "value":
                  o = n;
                  break;
                case "defaultValue":
                  S = n;
                  break;
                case "children":
                  break;
                case "dangerouslySetInnerHTML":
                  if (n != null) throw Error(m(91));
                  break;
                default:
                  n !== e && el(l, t, c, n, a, e);
              }
          Of(l, o, S);
          return;
        case "option":
          for (var C in u)
            ((o = u[C]),
              u.hasOwnProperty(C) &&
                o != null &&
                !a.hasOwnProperty(C) &&
                (C === "selected"
                  ? (l.selected = !1)
                  : el(l, t, C, null, a, o)));
          for (f in a)
            ((o = a[f]),
              (S = u[f]),
              a.hasOwnProperty(f) &&
                o !== S &&
                (o != null || S != null) &&
                (f === "selected"
                  ? (l.selected =
                      o && typeof o != "function" && typeof o != "symbol")
                  : el(l, t, f, o, a, S)));
          return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
          for (var Y in u)
            ((o = u[Y]),
              u.hasOwnProperty(Y) &&
                o != null &&
                !a.hasOwnProperty(Y) &&
                el(l, t, Y, null, a, o));
          for (s in a)
            if (
              ((o = a[s]),
              (S = u[s]),
              a.hasOwnProperty(s) && o !== S && (o != null || S != null))
            )
              switch (s) {
                case "children":
                case "dangerouslySetInnerHTML":
                  if (o != null) throw Error(m(137, t));
                  break;
                default:
                  el(l, t, s, o, a, S);
              }
          return;
        default:
          if (ke(t)) {
            for (var cl in u)
              ((o = u[cl]),
                u.hasOwnProperty(cl) &&
                  o !== void 0 &&
                  !a.hasOwnProperty(cl) &&
                  ji(l, t, cl, void 0, a, o));
            for (b in a)
              ((o = a[b]),
                (S = u[b]),
                !a.hasOwnProperty(b) ||
                  o === S ||
                  (o === void 0 && S === void 0) ||
                  ji(l, t, b, o, a, S));
            return;
          }
      }
      for (var d in u)
        ((o = u[d]),
          u.hasOwnProperty(d) &&
            o != null &&
            !a.hasOwnProperty(d) &&
            el(l, t, d, null, a, o));
      for (T in a)
        ((o = a[T]),
          (S = u[T]),
          !a.hasOwnProperty(T) ||
            o === S ||
            (o == null && S == null) ||
            el(l, t, T, o, a, S));
    }
    function Dy(l) {
      switch (l) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
          return !0;
        default:
          return !1;
      }
    }
    function rd() {
      if (typeof performance.getEntriesByType == "function") {
        for (
          var l = 0, t = 0, u = performance.getEntriesByType("resource"), a = 0;
          a < u.length;
          a++
        ) {
          var n = u[a],
            e = n.transferSize,
            c = n.initiatorType,
            i = n.duration;
          if (e && i && Dy(c)) {
            for (c = 0, i = n.responseEnd, a += 1; a < u.length; a++) {
              var f = u[a],
                s = f.startTime;
              if (s > i) break;
              var b = f.transferSize,
                T = f.initiatorType;
              b &&
                Dy(T) &&
                ((f = f.responseEnd),
                (c += b * (f < i ? 1 : (i - s) / (f - s))));
            }
            if ((--a, (t += (8 * (e + c)) / (n.duration / 1e3)), l++, 10 < l))
              break;
          }
        }
        if (0 < l) return t / l / 1e6;
      }
      return navigator.connection &&
        ((l = navigator.connection.downlink), typeof l == "number")
        ? l
        : 5;
    }
    var Gi = null,
      Xi = null;
    function Oe(l) {
      return l.nodeType === 9 ? l : l.ownerDocument;
    }
    function Uy(l) {
      switch (l) {
        case "http://www.w3.org/2000/svg":
          return 1;
        case "http://www.w3.org/1998/Math/MathML":
          return 2;
        default:
          return 0;
      }
    }
    function Ny(l, t) {
      if (l === 0)
        switch (t) {
          case "svg":
            return 1;
          case "math":
            return 2;
          default:
            return 0;
        }
      return l === 1 && t === "foreignObject" ? 0 : l;
    }
    function Qi(l, t) {
      return (
        l === "textarea" ||
        l === "noscript" ||
        typeof t.children == "string" ||
        typeof t.children == "number" ||
        typeof t.children == "bigint" ||
        (typeof t.dangerouslySetInnerHTML == "object" &&
          t.dangerouslySetInnerHTML !== null &&
          t.dangerouslySetInnerHTML.__html != null)
      );
    }
    var Li = null;
    function Vd() {
      var l = window.event;
      return l && l.type === "popstate"
        ? l === Li
          ? !1
          : ((Li = l), !0)
        : ((Li = null), !1);
    }
    var Cy = typeof setTimeout == "function" ? setTimeout : void 0,
      xd = typeof clearTimeout == "function" ? clearTimeout : void 0,
      py = typeof Promise == "function" ? Promise : void 0,
      Kd =
        typeof queueMicrotask == "function"
          ? queueMicrotask
          : typeof py < "u"
            ? function (l) {
                return py.resolve(null).then(l).catch(Jd);
              }
            : Cy;
    function Jd(l) {
      setTimeout(function () {
        throw l;
      });
    }
    function mu(l) {
      return l === "head";
    }
    function Hy(l, t) {
      var u = t,
        a = 0;
      do {
        var n = u.nextSibling;
        if ((l.removeChild(u), n && n.nodeType === 8))
          if (((u = n.data), u === "/$" || u === "/&")) {
            if (a === 0) {
              (l.removeChild(n), _a(t));
              return;
            }
            a--;
          } else if (
            u === "$" ||
            u === "$?" ||
            u === "$~" ||
            u === "$!" ||
            u === "&"
          )
            a++;
          else if (u === "html") dn(l.ownerDocument.documentElement);
          else if (u === "head") {
            ((u = l.ownerDocument.head), dn(u));
            for (var e = u.firstChild; e; ) {
              var c = e.nextSibling,
                i = e.nodeName;
              (e[Na] ||
                i === "SCRIPT" ||
                i === "STYLE" ||
                (i === "LINK" && e.rel.toLowerCase() === "stylesheet") ||
                u.removeChild(e),
                (e = c));
            }
          } else u === "body" && dn(l.ownerDocument.body);
        u = n;
      } while (u);
      _a(t);
    }
    function Ry(l, t) {
      var u = l;
      l = 0;
      do {
        var a = u.nextSibling;
        if (
          (u.nodeType === 1
            ? t
              ? ((u._stashedDisplay = u.style.display),
                (u.style.display = "none"))
              : ((u.style.display = u._stashedDisplay || ""),
                u.getAttribute("style") === "" && u.removeAttribute("style"))
            : u.nodeType === 3 &&
              (t
                ? ((u._stashedText = u.nodeValue), (u.nodeValue = ""))
                : (u.nodeValue = u._stashedText || "")),
          a && a.nodeType === 8)
        )
          if (((u = a.data), u === "/$")) {
            if (l === 0) break;
            l--;
          } else (u !== "$" && u !== "$?" && u !== "$~" && u !== "$!") || l++;
        u = a;
      } while (u);
    }
    function Zi(l) {
      var t = l.firstChild;
      for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
        var u = t;
        switch (((t = t.nextSibling), u.nodeName)) {
          case "HTML":
          case "HEAD":
          case "BODY":
            (Zi(u), we(u));
            continue;
          case "SCRIPT":
          case "STYLE":
            continue;
          case "LINK":
            if (u.rel.toLowerCase() === "stylesheet") continue;
        }
        l.removeChild(u);
      }
    }
    function wd(l, t, u, a) {
      for (; l.nodeType === 1; ) {
        var n = u;
        if (l.nodeName.toLowerCase() !== t.toLowerCase()) {
          if (!a && (l.nodeName !== "INPUT" || l.type !== "hidden")) break;
        } else if (a) {
          if (!l[Na])
            switch (t) {
              case "meta":
                if (!l.hasAttribute("itemprop")) break;
                return l;
              case "link":
                if (
                  ((e = l.getAttribute("rel")),
                  e === "stylesheet" && l.hasAttribute("data-precedence"))
                )
                  break;
                if (
                  e !== n.rel ||
                  l.getAttribute("href") !==
                    (n.href == null || n.href === "" ? null : n.href) ||
                  l.getAttribute("crossorigin") !==
                    (n.crossOrigin == null ? null : n.crossOrigin) ||
                  l.getAttribute("title") !== (n.title == null ? null : n.title)
                )
                  break;
                return l;
              case "style":
                if (l.hasAttribute("data-precedence")) break;
                return l;
              case "script":
                if (
                  ((e = l.getAttribute("src")),
                  (e !== (n.src == null ? null : n.src) ||
                    l.getAttribute("type") !==
                      (n.type == null ? null : n.type) ||
                    l.getAttribute("crossorigin") !==
                      (n.crossOrigin == null ? null : n.crossOrigin)) &&
                    e &&
                    l.hasAttribute("async") &&
                    !l.hasAttribute("itemprop"))
                )
                  break;
                return l;
              default:
                return l;
            }
        } else if (t === "input" && l.type === "hidden") {
          var e = n.name == null ? null : "" + n.name;
          if (n.type === "hidden" && l.getAttribute("name") === e) return l;
        } else return l;
        if (((l = st(l.nextSibling)), l === null)) break;
      }
      return null;
    }
    function Wd(l, t, u) {
      if (t === "") return null;
      for (; l.nodeType !== 3; )
        if (
          ((l.nodeType !== 1 ||
            l.nodeName !== "INPUT" ||
            l.type !== "hidden") &&
            !u) ||
          ((l = st(l.nextSibling)), l === null)
        )
          return null;
      return l;
    }
    function qy(l, t) {
      for (; l.nodeType !== 8; )
        if (
          ((l.nodeType !== 1 ||
            l.nodeName !== "INPUT" ||
            l.type !== "hidden") &&
            !t) ||
          ((l = st(l.nextSibling)), l === null)
        )
          return null;
      return l;
    }
    function ri(l) {
      return l.data === "$?" || l.data === "$~";
    }
    function Vi(l) {
      return (
        l.data === "$!" ||
        (l.data === "$?" && l.ownerDocument.readyState !== "loading")
      );
    }
    function $d(l, t) {
      var u = l.ownerDocument;
      if (l.data === "$~") l._reactRetry = t;
      else if (l.data !== "$?" || u.readyState !== "loading") t();
      else {
        var a = function () {
          (t(), u.removeEventListener("DOMContentLoaded", a));
        };
        (u.addEventListener("DOMContentLoaded", a), (l._reactRetry = a));
      }
    }
    function st(l) {
      for (; l != null; l = l.nextSibling) {
        var t = l.nodeType;
        if (t === 1 || t === 3) break;
        if (t === 8) {
          if (
            ((t = l.data),
            t === "$" ||
              t === "$!" ||
              t === "$?" ||
              t === "$~" ||
              t === "&" ||
              t === "F!" ||
              t === "F")
          )
            break;
          if (t === "/$" || t === "/&") return null;
        }
      }
      return l;
    }
    var xi = null;
    function By(l) {
      l = l.nextSibling;
      for (var t = 0; l; ) {
        if (l.nodeType === 8) {
          var u = l.data;
          if (u === "/$" || u === "/&") {
            if (t === 0) return st(l.nextSibling);
            t--;
          } else
            (u !== "$" &&
              u !== "$!" &&
              u !== "$?" &&
              u !== "$~" &&
              u !== "&") ||
              t++;
        }
        l = l.nextSibling;
      }
      return null;
    }
    function Yy(l) {
      l = l.previousSibling;
      for (var t = 0; l; ) {
        if (l.nodeType === 8) {
          var u = l.data;
          if (
            u === "$" ||
            u === "$!" ||
            u === "$?" ||
            u === "$~" ||
            u === "&"
          ) {
            if (t === 0) return l;
            t--;
          } else (u !== "/$" && u !== "/&") || t++;
        }
        l = l.previousSibling;
      }
      return null;
    }
    function jy(l, t, u) {
      switch (((t = Oe(u)), l)) {
        case "html":
          if (((l = t.documentElement), !l)) throw Error(m(452));
          return l;
        case "head":
          if (((l = t.head), !l)) throw Error(m(453));
          return l;
        case "body":
          if (((l = t.body), !l)) throw Error(m(454));
          return l;
        default:
          throw Error(m(451));
      }
    }
    function dn(l) {
      for (var t = l.attributes; t.length; ) l.removeAttributeNode(t[0]);
      we(l);
    }
    var ot = new Map(),
      Gy = new Set();
    function Me(l) {
      return typeof l.getRootNode == "function"
        ? l.getRootNode()
        : l.nodeType === 9
          ? l
          : l.ownerDocument;
    }
    var Jt = D.d;
    D.d = { f: Fd, r: kd, D: Id, C: Pd, L: lm, m: tm, X: am, S: um, M: nm };
    function Fd() {
      var l = Jt.f(),
        t = Se();
      return l || t;
    }
    function kd(l) {
      var t = ru(l);
      t !== null && t.tag === 5 && t.type === "form" ? u1(t) : Jt.r(l);
    }
    var Ta = typeof document > "u" ? null : document;
    function Xy(l, t, u) {
      var a = Ta;
      if (a && typeof t == "string" && t) {
        var n = ct(t);
        ((n = 'link[rel="' + l + '"][href="' + n + '"]'),
          typeof u == "string" && (n += '[crossorigin="' + u + '"]'),
          Gy.has(n) ||
            (Gy.add(n),
            (l = { rel: l, crossOrigin: u, href: t }),
            a.querySelector(n) === null &&
              ((t = a.createElement("link")),
              Hl(t, "link", l),
              Ml(t),
              a.head.appendChild(t))));
      }
    }
    function Id(l) {
      (Jt.D(l), Xy("dns-prefetch", l, null));
    }
    function Pd(l, t) {
      (Jt.C(l, t), Xy("preconnect", l, t));
    }
    function lm(l, t, u) {
      Jt.L(l, t, u);
      var a = Ta;
      if (a && l && t) {
        var n = 'link[rel="preload"][as="' + ct(t) + '"]';
        t === "image" && u && u.imageSrcSet
          ? ((n += '[imagesrcset="' + ct(u.imageSrcSet) + '"]'),
            typeof u.imageSizes == "string" &&
              (n += '[imagesizes="' + ct(u.imageSizes) + '"]'))
          : (n += '[href="' + ct(l) + '"]');
        var e = n;
        switch (t) {
          case "style":
            e = Ea(l);
            break;
          case "script":
            e = Aa(l);
        }
        ot.has(e) ||
          ((l = q(
            {
              rel: "preload",
              href: t === "image" && u && u.imageSrcSet ? void 0 : l,
              as: t,
            },
            u,
          )),
          ot.set(e, l),
          a.querySelector(n) !== null ||
            (t === "style" && a.querySelector(mn(e))) ||
            (t === "script" && a.querySelector(hn(e))) ||
            ((t = a.createElement("link")),
            Hl(t, "link", l),
            Ml(t),
            a.head.appendChild(t)));
      }
    }
    function tm(l, t) {
      Jt.m(l, t);
      var u = Ta;
      if (u && l) {
        var a = t && typeof t.as == "string" ? t.as : "script",
          n =
            'link[rel="modulepreload"][as="' +
            ct(a) +
            '"][href="' +
            ct(l) +
            '"]',
          e = n;
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            e = Aa(l);
        }
        if (
          !ot.has(e) &&
          ((l = q({ rel: "modulepreload", href: l }, t)),
          ot.set(e, l),
          u.querySelector(n) === null)
        ) {
          switch (a) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              if (u.querySelector(hn(e))) return;
          }
          ((a = u.createElement("link")),
            Hl(a, "link", l),
            Ml(a),
            u.head.appendChild(a));
        }
      }
    }
    function um(l, t, u) {
      Jt.S(l, t, u);
      var a = Ta;
      if (a && l) {
        var n = Vu(a).hoistableStyles,
          e = Ea(l);
        t = t || "default";
        var c = n.get(e);
        if (!c) {
          var i = { loading: 0, preload: null };
          if ((c = a.querySelector(mn(e)))) i.loading = 5;
          else {
            ((l = q({ rel: "stylesheet", href: l, "data-precedence": t }, u)),
              (u = ot.get(e)) && Ki(l, u));
            var f = (c = a.createElement("link"));
            (Ml(f),
              Hl(f, "link", l),
              (f._p = new Promise(function (s, b) {
                ((f.onload = s), (f.onerror = b));
              })),
              f.addEventListener("load", function () {
                i.loading |= 1;
              }),
              f.addEventListener("error", function () {
                i.loading |= 2;
              }),
              (i.loading |= 4),
              De(c, t, a));
          }
          ((c = { type: "stylesheet", instance: c, count: 1, state: i }),
            n.set(e, c));
        }
      }
    }
    function am(l, t) {
      Jt.X(l, t);
      var u = Ta;
      if (u && l) {
        var a = Vu(u).hoistableScripts,
          n = Aa(l),
          e = a.get(n);
        e ||
          ((e = u.querySelector(hn(n))),
          e ||
            ((l = q({ src: l, async: !0 }, t)),
            (t = ot.get(n)) && Ji(l, t),
            (e = u.createElement("script")),
            Ml(e),
            Hl(e, "link", l),
            u.head.appendChild(e)),
          (e = { type: "script", instance: e, count: 1, state: null }),
          a.set(n, e));
      }
    }
    function nm(l, t) {
      Jt.M(l, t);
      var u = Ta;
      if (u && l) {
        var a = Vu(u).hoistableScripts,
          n = Aa(l),
          e = a.get(n);
        e ||
          ((e = u.querySelector(hn(n))),
          e ||
            ((l = q({ src: l, async: !0, type: "module" }, t)),
            (t = ot.get(n)) && Ji(l, t),
            (e = u.createElement("script")),
            Ml(e),
            Hl(e, "link", l),
            u.head.appendChild(e)),
          (e = { type: "script", instance: e, count: 1, state: null }),
          a.set(n, e));
      }
    }
    function Qy(l, t, u, a) {
      var n = (n = Z.current) ? Me(n) : null;
      if (!n) throw Error(m(446));
      switch (l) {
        case "meta":
        case "title":
          return null;
        case "style":
          return typeof u.precedence == "string" && typeof u.href == "string"
            ? ((t = Ea(u.href)),
              (u = Vu(n).hoistableStyles),
              (a = u.get(t)),
              a ||
                ((a = { type: "style", instance: null, count: 0, state: null }),
                u.set(t, a)),
              a)
            : { type: "void", instance: null, count: 0, state: null };
        case "link":
          if (
            u.rel === "stylesheet" &&
            typeof u.href == "string" &&
            typeof u.precedence == "string"
          ) {
            l = Ea(u.href);
            var e = Vu(n).hoistableStyles,
              c = e.get(l);
            if (
              (c ||
                ((n = n.ownerDocument || n),
                (c = {
                  type: "stylesheet",
                  instance: null,
                  count: 0,
                  state: { loading: 0, preload: null },
                }),
                e.set(l, c),
                (e = n.querySelector(mn(l))) &&
                  !e._p &&
                  ((c.instance = e), (c.state.loading = 5)),
                ot.has(l) ||
                  ((u = {
                    rel: "preload",
                    as: "style",
                    href: u.href,
                    crossOrigin: u.crossOrigin,
                    integrity: u.integrity,
                    media: u.media,
                    hrefLang: u.hrefLang,
                    referrerPolicy: u.referrerPolicy,
                  }),
                  ot.set(l, u),
                  e || em(n, l, u, c.state))),
              t && a === null)
            )
              throw Error(m(528, ""));
            return c;
          }
          if (t && a !== null) throw Error(m(529, ""));
          return null;
        case "script":
          return (
            (t = u.async),
            (u = u.src),
            typeof u == "string" &&
            t &&
            typeof t != "function" &&
            typeof t != "symbol"
              ? ((t = Aa(u)),
                (u = Vu(n).hoistableScripts),
                (a = u.get(t)),
                a ||
                  ((a = {
                    type: "script",
                    instance: null,
                    count: 0,
                    state: null,
                  }),
                  u.set(t, a)),
                a)
              : { type: "void", instance: null, count: 0, state: null }
          );
        default:
          throw Error(m(444, l));
      }
    }
    function Ea(l) {
      return 'href="' + ct(l) + '"';
    }
    function mn(l) {
      return 'link[rel="stylesheet"][' + l + "]";
    }
    function Ly(l) {
      return q({}, l, { "data-precedence": l.precedence, precedence: null });
    }
    function em(l, t, u, a) {
      l.querySelector('link[rel="preload"][as="style"][' + t + "]")
        ? (a.loading = 1)
        : ((t = l.createElement("link")),
          (a.preload = t),
          t.addEventListener("load", function () {
            return (a.loading |= 1);
          }),
          t.addEventListener("error", function () {
            return (a.loading |= 2);
          }),
          Hl(t, "link", u),
          Ml(t),
          l.head.appendChild(t));
    }
    function Aa(l) {
      return '[src="' + ct(l) + '"]';
    }
    function hn(l) {
      return "script[async]" + l;
    }
    function Zy(l, t, u) {
      if ((t.count++, t.instance === null))
        switch (t.type) {
          case "style":
            var a = l.querySelector('style[data-href~="' + ct(u.href) + '"]');
            if (a) return ((t.instance = a), Ml(a), a);
            var n = q({}, u, {
              "data-href": u.href,
              "data-precedence": u.precedence,
              href: null,
              precedence: null,
            });
            return (
              (a = (l.ownerDocument || l).createElement("style")),
              Ml(a),
              Hl(a, "style", n),
              De(a, u.precedence, l),
              (t.instance = a)
            );
          case "stylesheet":
            n = Ea(u.href);
            var e = l.querySelector(mn(n));
            if (e) return ((t.state.loading |= 4), (t.instance = e), Ml(e), e);
            ((a = Ly(u)),
              (n = ot.get(n)) && Ki(a, n),
              (e = (l.ownerDocument || l).createElement("link")),
              Ml(e));
            var c = e;
            return (
              (c._p = new Promise(function (i, f) {
                ((c.onload = i), (c.onerror = f));
              })),
              Hl(e, "link", a),
              (t.state.loading |= 4),
              De(e, u.precedence, l),
              (t.instance = e)
            );
          case "script":
            return (
              (e = Aa(u.src)),
              (n = l.querySelector(hn(e)))
                ? ((t.instance = n), Ml(n), n)
                : ((a = u),
                  (n = ot.get(e)) && ((a = q({}, u)), Ji(a, n)),
                  (l = l.ownerDocument || l),
                  (n = l.createElement("script")),
                  Ml(n),
                  Hl(n, "link", a),
                  l.head.appendChild(n),
                  (t.instance = n))
            );
          case "void":
            return null;
          default:
            throw Error(m(443, t.type));
        }
      else
        t.type === "stylesheet" &&
          (t.state.loading & 4) === 0 &&
          ((a = t.instance), (t.state.loading |= 4), De(a, u.precedence, l));
      return t.instance;
    }
    function De(l, t, u) {
      for (
        var a = u.querySelectorAll(
            'link[rel="stylesheet"][data-precedence],style[data-precedence]',
          ),
          n = a.length ? a[a.length - 1] : null,
          e = n,
          c = 0;
        c < a.length;
        c++
      ) {
        var i = a[c];
        if (i.dataset.precedence === t) e = i;
        else if (e !== n) break;
      }
      e
        ? e.parentNode.insertBefore(l, e.nextSibling)
        : ((t = u.nodeType === 9 ? u.head : u),
          t.insertBefore(l, t.firstChild));
    }
    function Ki(l, t) {
      ((l.crossOrigin ??= t.crossOrigin),
        (l.referrerPolicy ??= t.referrerPolicy),
        (l.title ??= t.title));
    }
    function Ji(l, t) {
      ((l.crossOrigin ??= t.crossOrigin),
        (l.referrerPolicy ??= t.referrerPolicy),
        (l.integrity ??= t.integrity));
    }
    var Ue = null;
    function ry(l, t, u) {
      if (Ue === null) {
        var a = new Map(),
          n = (Ue = new Map());
        n.set(u, a);
      } else ((n = Ue), (a = n.get(u)), a || ((a = new Map()), n.set(u, a)));
      if (a.has(l)) return a;
      for (
        a.set(l, null), u = u.getElementsByTagName(l), n = 0;
        n < u.length;
        n++
      ) {
        var e = u[n];
        if (
          !(
            e[Na] ||
            e[Ul] ||
            (l === "link" && e.getAttribute("rel") === "stylesheet")
          ) &&
          e.namespaceURI !== "http://www.w3.org/2000/svg"
        ) {
          var c = e.getAttribute(t) || "";
          c = l + c;
          var i = a.get(c);
          i ? i.push(e) : a.set(c, [e]);
        }
      }
      return a;
    }
    function Vy(l, t, u) {
      ((l = l.ownerDocument || l),
        l.head.insertBefore(
          u,
          t === "title" ? l.querySelector("head > title") : null,
        ));
    }
    function cm(l, t, u) {
      if (u === 1 || t.itemProp != null) return !1;
      switch (l) {
        case "meta":
        case "title":
          return !0;
        case "style":
          if (
            typeof t.precedence != "string" ||
            typeof t.href != "string" ||
            t.href === ""
          )
            break;
          return !0;
        case "link":
          if (
            typeof t.rel != "string" ||
            typeof t.href != "string" ||
            t.href === "" ||
            t.onLoad ||
            t.onError
          )
            break;
          return t.rel === "stylesheet"
            ? ((l = t.disabled), typeof t.precedence == "string" && l == null)
            : !0;
        case "script":
          if (
            t.async &&
            typeof t.async != "function" &&
            typeof t.async != "symbol" &&
            !t.onLoad &&
            !t.onError &&
            t.src &&
            typeof t.src == "string"
          )
            return !0;
      }
      return !1;
    }
    function xy(l) {
      return !(l.type === "stylesheet" && (l.state.loading & 3) === 0);
    }
    function im(l, t, u, a) {
      if (
        u.type === "stylesheet" &&
        (typeof a.media != "string" || matchMedia(a.media).matches !== !1) &&
        (u.state.loading & 4) === 0
      ) {
        if (u.instance === null) {
          var n = Ea(a.href),
            e = t.querySelector(mn(n));
          if (e) {
            ((t = e._p),
              t !== null &&
                typeof t == "object" &&
                typeof t.then == "function" &&
                (l.count++, (l = Ne.bind(l)), t.then(l, l)),
              (u.state.loading |= 4),
              (u.instance = e),
              Ml(e));
            return;
          }
          ((e = t.ownerDocument || t),
            (a = Ly(a)),
            (n = ot.get(n)) && Ki(a, n),
            (e = e.createElement("link")),
            Ml(e));
          var c = e;
          ((c._p = new Promise(function (i, f) {
            ((c.onload = i), (c.onerror = f));
          })),
            Hl(e, "link", a),
            (u.instance = e));
        }
        (l.stylesheets === null && (l.stylesheets = new Map()),
          l.stylesheets.set(u, t),
          (t = u.state.preload) &&
            (u.state.loading & 3) === 0 &&
            (l.count++,
            (u = Ne.bind(l)),
            t.addEventListener("load", u),
            t.addEventListener("error", u)));
      }
    }
    var wi = 0;
    function fm(l, t) {
      return (
        l.stylesheets && l.count === 0 && pe(l, l.stylesheets),
        0 < l.count || 0 < l.imgCount
          ? function (u) {
              var a = setTimeout(function () {
                if ((l.stylesheets && pe(l, l.stylesheets), l.unsuspend)) {
                  var e = l.unsuspend;
                  ((l.unsuspend = null), e());
                }
              }, 6e4 + t);
              0 < l.imgBytes && wi === 0 && (wi = 62500 * rd());
              var n = setTimeout(
                function () {
                  if (
                    ((l.waitingForImages = !1),
                    l.count === 0 &&
                      (l.stylesheets && pe(l, l.stylesheets), l.unsuspend))
                  ) {
                    var e = l.unsuspend;
                    ((l.unsuspend = null), e());
                  }
                },
                (l.imgBytes > wi ? 50 : 800) + t,
              );
              return (
                (l.unsuspend = u),
                function () {
                  ((l.unsuspend = null), clearTimeout(a), clearTimeout(n));
                }
              );
            }
          : null
      );
    }
    function Ne() {
      if (
        (this.count--,
        this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))
      ) {
        if (this.stylesheets) pe(this, this.stylesheets);
        else if (this.unsuspend) {
          var l = this.unsuspend;
          ((this.unsuspend = null), l());
        }
      }
    }
    var Ce = null;
    function pe(l, t) {
      ((l.stylesheets = null),
        l.unsuspend !== null &&
          (l.count++,
          (Ce = new Map()),
          t.forEach(ym, l),
          (Ce = null),
          Ne.call(l)));
    }
    function ym(l, t) {
      if (!(t.state.loading & 4)) {
        var u = Ce.get(l);
        if (u) var a = u.get(null);
        else {
          ((u = new Map()), Ce.set(l, u));
          for (
            var n = l.querySelectorAll(
                "link[data-precedence],style[data-precedence]",
              ),
              e = 0;
            e < n.length;
            e++
          ) {
            var c = n[e];
            (c.nodeName === "LINK" || c.getAttribute("media") !== "not all") &&
              (u.set(c.dataset.precedence, c), (a = c));
          }
          a && u.set(null, a);
        }
        ((n = t.instance),
          (c = n.getAttribute("data-precedence")),
          (e = u.get(c) || a),
          e === a && u.set(null, n),
          u.set(c, n),
          this.count++,
          (a = Ne.bind(this)),
          n.addEventListener("load", a),
          n.addEventListener("error", a),
          e
            ? e.parentNode.insertBefore(n, e.nextSibling)
            : ((l = l.nodeType === 9 ? l.head : l),
              l.insertBefore(n, l.firstChild)),
          (t.state.loading |= 4));
      }
    }
    var sn = {
      $$typeof: Ol,
      Provider: null,
      Consumer: null,
      _currentValue: k,
      _currentValue2: k,
      _threadCount: 0,
    };
    function vm(l, t, u, a, n, e, c, i, f) {
      ((this.tag = 1),
        (this.containerInfo = l),
        (this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.callbackNode =
          this.next =
          this.pendingContext =
          this.context =
          this.cancelPendingCommit =
            null),
        (this.callbackPriority = 0),
        (this.expirationTimes = xe(-1)),
        (this.entangledLanes =
          this.shellSuspendCounter =
          this.errorRecoveryDisabledLanes =
          this.expiredLanes =
          this.warmLanes =
          this.pingedLanes =
          this.suspendedLanes =
          this.pendingLanes =
            0),
        (this.entanglements = xe(0)),
        (this.hiddenUpdates = xe(null)),
        (this.identifierPrefix = a),
        (this.onUncaughtError = n),
        (this.onCaughtError = e),
        (this.onRecoverableError = c),
        (this.pooledCache = null),
        (this.pooledCacheLanes = 0),
        (this.formState = f),
        (this.incompleteTransitions = new Map()));
    }
    function dm(l, t, u, a, n, e, c, i, f, s, b, T) {
      return (
        (l = new vm(l, t, u, c, f, s, b, T, i)),
        (t = 1),
        e === !0 && (t |= 24),
        (e = lt(3, null, null, t)),
        (l.current = e),
        (e.stateNode = l),
        (t = Uc()),
        t.refCount++,
        (l.pooledCache = t),
        t.refCount++,
        (e.memoizedState = { element: a, isDehydrated: u, cache: t }),
        Hc(e),
        l
      );
    }
    function mm(l) {
      return l ? ((l = Pu), l) : Pu;
    }
    function Ky(l, t, u, a, n, e) {
      ((n = mm(n)),
        a.context === null ? (a.context = n) : (a.pendingContext = n),
        (a = Bu(t)),
        (a.payload = { element: u }),
        (e = e === void 0 ? null : e),
        e !== null && (a.callback = e),
        (u = Yu(l, a, t)),
        u !== null && (Vl(u, l, t), Ka(u, l, t)));
    }
    function Jy(l, t) {
      if (((l = l.memoizedState), l !== null && l.dehydrated !== null)) {
        var u = l.retryLane;
        l.retryLane = u !== 0 && u < t ? u : t;
      }
    }
    function Wi(l, t) {
      (Jy(l, t), (l = l.alternate) && Jy(l, t));
    }
    function wy(l) {
      if (l.tag === 13 || l.tag === 31) {
        var t = Mu(l, 67108864);
        (t !== null && Vl(t, l, 67108864), Wi(l, 67108864));
      }
    }
    function Wy(l) {
      if (l.tag === 13 || l.tag === 31) {
        var t = ht();
        t = hf(t);
        var u = Mu(l, t);
        (u !== null && Vl(u, l, t), Wi(l, t));
      }
    }
    var He = !0;
    function hm(l, t, u, a) {
      var n = O.T;
      O.T = null;
      var e = D.p;
      try {
        ((D.p = 2), $i(l, t, u, a));
      } finally {
        ((D.p = e), (O.T = n));
      }
    }
    function sm(l, t, u, a) {
      var n = O.T;
      O.T = null;
      var e = D.p;
      try {
        ((D.p = 8), $i(l, t, u, a));
      } finally {
        ((D.p = e), (O.T = n));
      }
    }
    function $i(l, t, u, a) {
      if (He) {
        var n = Fi(a);
        if (n === null) (Yi(l, t, a, Re, u), Fy(l, a));
        else if (Sm(n, l, t, u, a)) a.stopPropagation();
        else if ((Fy(l, a), t & 4 && -1 < om.indexOf(l))) {
          for (; n !== null; ) {
            var e = ru(n);
            if (e !== null)
              switch (e.tag) {
                case 3:
                  if (
                    ((e = e.stateNode), e.current.memoizedState.isDehydrated)
                  ) {
                    var c = Tu(e.pendingLanes);
                    if (c !== 0) {
                      var i = e;
                      for (i.pendingLanes |= 2, i.entangledLanes |= 2; c; ) {
                        var f = 1 << (31 - Il(c));
                        ((i.entanglements[1] |= f), (c &= ~f));
                      }
                      (Kt(e), (I & 6) === 0 && ((se = Fl() + 500), fn(0, !1)));
                    }
                  }
                  break;
                case 31:
                case 13:
                  ((i = Mu(e, 2)), i !== null && Vl(i, e, 2), Se(), Wi(e, 2));
              }
            if (((e = Fi(a)), e === null && Yi(l, t, a, Re, u), e === n)) break;
            n = e;
          }
          n !== null && a.stopPropagation();
        } else Yi(l, t, a, null, u);
      }
    }
    function Fi(l) {
      return ((l = Pe(l)), ki(l));
    }
    var Re = null;
    function ki(l) {
      if (((Re = null), (l = Zu(l)), l !== null)) {
        var t = ll(l);
        if (t === null) l = null;
        else {
          var u = t.tag;
          if (u === 13) {
            if (((l = hl(t)), l !== null)) return l;
            l = null;
          } else if (u === 31) {
            if (((l = tl(t)), l !== null)) return l;
            l = null;
          } else if (u === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated)
              return t.tag === 3 ? t.stateNode.containerInfo : null;
            l = null;
          } else t !== l && (l = null);
        }
      }
      return ((Re = l), null);
    }
    function $y(l) {
      switch (l) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 8;
        case "message":
          switch (fv()) {
            case ef:
              return 2;
            case cf:
              return 8;
            case Tn:
            case yv:
              return 32;
            case ff:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var Ii = !1,
      hu = null,
      su = null,
      ou = null,
      on = new Map(),
      Sn = new Map(),
      Su = [],
      om =
        "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
          " ",
        );
    function Fy(l, t) {
      switch (l) {
        case "focusin":
        case "focusout":
          hu = null;
          break;
        case "dragenter":
        case "dragleave":
          su = null;
          break;
        case "mouseover":
        case "mouseout":
          ou = null;
          break;
        case "pointerover":
        case "pointerout":
          on.delete(t.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          Sn.delete(t.pointerId);
      }
    }
    function gn(l, t, u, a, n, e) {
      return l === null || l.nativeEvent !== e
        ? ((l = {
            blockedOn: t,
            domEventName: u,
            eventSystemFlags: a,
            nativeEvent: e,
            targetContainers: [n],
          }),
          t !== null && ((t = ru(t)), t !== null && wy(t)),
          l)
        : ((l.eventSystemFlags |= a),
          (t = l.targetContainers),
          n !== null && t.indexOf(n) === -1 && t.push(n),
          l);
    }
    function Sm(l, t, u, a, n) {
      switch (t) {
        case "focusin":
          return ((hu = gn(hu, l, t, u, a, n)), !0);
        case "dragenter":
          return ((su = gn(su, l, t, u, a, n)), !0);
        case "mouseover":
          return ((ou = gn(ou, l, t, u, a, n)), !0);
        case "pointerover":
          var e = n.pointerId;
          return (on.set(e, gn(on.get(e) || null, l, t, u, a, n)), !0);
        case "gotpointercapture":
          return (
            (e = n.pointerId),
            Sn.set(e, gn(Sn.get(e) || null, l, t, u, a, n)),
            !0
          );
      }
      return !1;
    }
    function ky(l) {
      var t = Zu(l.target);
      if (t !== null) {
        var u = ll(t);
        if (u !== null) {
          if (((t = u.tag), t === 13)) {
            if (((t = hl(u)), t !== null)) {
              ((l.blockedOn = t),
                of(l.priority, function () {
                  Wy(u);
                }));
              return;
            }
          } else if (t === 31) {
            if (((t = tl(u)), t !== null)) {
              ((l.blockedOn = t),
                of(l.priority, function () {
                  Wy(u);
                }));
              return;
            }
          } else if (
            t === 3 &&
            u.stateNode.current.memoizedState.isDehydrated
          ) {
            l.blockedOn = u.tag === 3 ? u.stateNode.containerInfo : null;
            return;
          }
        }
      }
      l.blockedOn = null;
    }
    function qe(l) {
      if (l.blockedOn !== null) return !1;
      for (var t = l.targetContainers; 0 < t.length; ) {
        var u = Fi(l.nativeEvent);
        if (u === null) {
          u = l.nativeEvent;
          var a = new u.constructor(u.type, u);
          ((Ie = a), u.target.dispatchEvent(a), (Ie = null));
        } else return ((t = ru(u)), t !== null && wy(t), (l.blockedOn = u), !1);
        t.shift();
      }
      return !0;
    }
    function Iy(l, t, u) {
      qe(l) && u.delete(t);
    }
    function gm() {
      ((Ii = !1),
        hu !== null && qe(hu) && (hu = null),
        su !== null && qe(su) && (su = null),
        ou !== null && qe(ou) && (ou = null),
        on.forEach(Iy),
        Sn.forEach(Iy));
    }
    function Be(l, t) {
      l.blockedOn === t &&
        ((l.blockedOn = null),
        Ii ||
          ((Ii = !0),
          _.unstable_scheduleCallback(_.unstable_NormalPriority, gm)));
    }
    var Ye = null;
    function Py(l) {
      Ye !== l &&
        ((Ye = l),
        _.unstable_scheduleCallback(_.unstable_NormalPriority, function () {
          Ye === l && (Ye = null);
          for (var t = 0; t < l.length; t += 3) {
            var u = l[t],
              a = l[t + 1],
              n = l[t + 2];
            if (typeof a != "function") {
              if (ki(a || u) === null) continue;
              break;
            }
            var e = ru(u);
            e !== null &&
              (l.splice(t, 3),
              (t -= 3),
              kc(
                e,
                { pending: !0, data: n, method: u.method, action: a },
                a,
                n,
              ));
          }
        }));
    }
    function _a(l) {
      function t(f) {
        return Be(f, l);
      }
      (hu !== null && Be(hu, l),
        su !== null && Be(su, l),
        ou !== null && Be(ou, l),
        on.forEach(t),
        Sn.forEach(t));
      for (var u = 0; u < Su.length; u++) {
        var a = Su[u];
        a.blockedOn === l && (a.blockedOn = null);
      }
      for (; 0 < Su.length && ((u = Su[0]), u.blockedOn === null); )
        (ky(u), u.blockedOn === null && Su.shift());
      if (((u = (l.ownerDocument || l).$$reactFormReplay), u != null))
        for (a = 0; a < u.length; a += 3) {
          var n = u[a],
            e = u[a + 1],
            c = n[Gl] || null;
          if (typeof e == "function") c || Py(u);
          else if (c) {
            var i = null;
            if (e && e.hasAttribute("formAction")) {
              if (((n = e), (c = e[Gl] || null))) i = c.formAction;
              else if (ki(n) !== null) continue;
            } else i = c.action;
            (typeof i == "function"
              ? (u[a + 1] = i)
              : (u.splice(a, 3), (a -= 3)),
              Py(u));
          }
        }
    }
    function bm() {
      function l(e) {
        e.canIntercept &&
          e.info === "react-transition" &&
          e.intercept({
            handler: function () {
              return new Promise(function (c) {
                return (n = c);
              });
            },
            focusReset: "manual",
            scroll: "manual",
          });
      }
      function t() {
        (n !== null && (n(), (n = null)), a || setTimeout(u, 20));
      }
      function u() {
        if (!a && !navigation.transition) {
          var e = navigation.currentEntry;
          e &&
            e.url != null &&
            navigation.navigate(e.url, {
              state: e.getState(),
              info: "react-transition",
              history: "replace",
            });
        }
      }
      if (typeof navigation == "object") {
        var a = !1,
          n = null;
        return (
          navigation.addEventListener("navigate", l),
          navigation.addEventListener("navigatesuccess", t),
          navigation.addEventListener("navigateerror", t),
          setTimeout(u, 100),
          function () {
            ((a = !0),
              navigation.removeEventListener("navigate", l),
              navigation.removeEventListener("navigatesuccess", t),
              navigation.removeEventListener("navigateerror", t),
              n !== null && (n(), (n = null)));
          }
        );
      }
    }
    function Pi(l) {
      this._internalRoot = l;
    }
    ((lf.prototype.render = Pi.prototype.render =
      function (l) {
        var t = this._internalRoot;
        if (t === null) throw Error(m(409));
        var u = t.current;
        Ky(u, ht(), l, t, null, null);
      }),
      (lf.prototype.unmount = Pi.prototype.unmount =
        function () {
          var l = this._internalRoot;
          if (l !== null) {
            this._internalRoot = null;
            var t = l.containerInfo;
            (Ky(l.current, 2, null, l, null, null), Se(), (t[Ua] = null));
          }
        }));
    function lf(l) {
      this._internalRoot = l;
    }
    lf.prototype.unstable_scheduleHydration = function (l) {
      if (l) {
        var t = sf();
        l = { blockedOn: null, target: l, priority: t };
        for (var u = 0; u < Su.length && t !== 0 && t < Su[u].priority; u++);
        (Su.splice(u, 0, l), u === 0 && ky(l));
      }
    };
    var lv = j.version;
    if (lv !== "19.2.4") throw Error(m(527, lv, "19.2.4"));
    D.findDOMNode = function (l) {
      var t = l._reactInternals;
      if (t === void 0)
        throw typeof l.render == "function"
          ? Error(m(188))
          : ((l = Object.keys(l).join(",")), Error(m(268, l)));
      return (
        (l = A(t)),
        (l = l !== null ? B(l) : null),
        (l = l === null ? null : l.stateNode),
        l
      );
    };
    var zm = {
      bundleType: 0,
      version: "19.2.4",
      rendererPackageName: "react-dom",
      currentDispatcherRef: O,
      reconcilerVersion: "19.2.4",
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
      var je = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!je.isDisabled && je.supportsFiber)
        try {
          ((Ma = je.inject(zm)), (kl = je));
        } catch {}
    }
    g.createRoot = function (l, t) {
      if (!J(l)) throw Error(m(299));
      var u = !1,
        a = "",
        n = sd,
        e = od,
        c = Sd;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (u = !0),
          t.identifierPrefix !== void 0 && (a = t.identifierPrefix),
          t.onUncaughtError !== void 0 && (n = t.onUncaughtError),
          t.onCaughtError !== void 0 && (e = t.onCaughtError),
          t.onRecoverableError !== void 0 && (c = t.onRecoverableError)),
        (t = dm(l, 1, !1, null, null, u, a, null, n, e, c, bm)),
        (l[Ua] = t.current),
        Ey(l),
        new Pi(t)
      );
    };
  }),
  qm = St((g, _) => {
    function j() {
      if (
        !(
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
          typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
        )
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(j);
        } catch (G) {
          console.error(G);
        }
    }
    (j(), (_.exports = Rm()));
  }),
  Bm = qm(),
  Ym = typeof window < "u",
  jm = typeof document < "u",
  Gm = Ym && jm,
  tv = typeof navigator < "u",
  Xm = tv ? (navigator.userAgent ?? "") : "",
  Qm =
    (tv && /(jsdom|happy-dom)/i.test(Xm)) ||
    typeof globalThis.happyDOM == "object",
  uv =
    typeof import.meta < "u"
      ? {
          BASE_URL: "/",
          BROWSER: "chrome",
          CHROME: !0,
          COMMAND: "build",
          DEV: !1,
          EDGE: !1,
          ENTRYPOINT: "html",
          FIREFOX: !1,
          MANIFEST_VERSION: 3,
          MODE: "production",
          OPERA: !1,
          PROD: !0,
          SAFARI: !1,
          SSR: !1,
          WXT_CODEX_BUILD_CHANNEL: "prod",
        }
      : void 0,
  u2 = !!uv?.DEV,
  a2 = Qm || uv?.MODE === "test";
function tf(g) {
  if (!Gm) return;
  const _ = document.documentElement;
  (_.setAttribute("data-theme", g), (_.style.colorScheme = g));
}
var av = "(prefers-color-scheme: dark)";
function Lm() {
  if (typeof window.matchMedia != "function") return "light";
  try {
    return window.matchMedia(av).matches ? "dark" : "light";
  } catch {
    return "light";
  }
}
function Zm() {
  if ((tf(Lm()), typeof window.matchMedia != "function")) return;
  let g;
  try {
    g = window.matchMedia(av);
  } catch {
    return;
  }
  const _ = (j) => {
    tf(j.matches ? "dark" : "light");
  };
  if (
    (tf(g.matches ? "dark" : "light"), typeof g.addEventListener == "function")
  ) {
    g.addEventListener("change", _);
    return;
  }
  g.addListener(_);
}
var rm = (g) => {
    const _ = (0, uf.c)(4);
    let j, G;
    _[0] === Symbol.for("react.memo_cache_sentinel")
      ? ((j = (0, fl.jsx)("path", {
          fillRule: "evenodd",
          clipRule: "evenodd",
          d: "M11.6099 3.75C11.2549 3.75 10.9266 3.93813 10.7471 4.24434L9.99036 5.53548C9.45636 6.44657 8.48265 7.00978 7.42663 7.01839L5.94021 7.03051C5.58531 7.0334 5.25853 7.22419 5.08156 7.53183L4.6852 8.22082C4.50905 8.52702 4.50752 8.90345 4.68118 9.21107L5.42305 10.5252C5.93977 11.4405 5.93977 12.5595 5.42305 13.4748L4.68118 14.7889C4.50752 15.0966 4.50905 15.473 4.6852 15.7792L5.08156 16.4682C5.25853 16.7758 5.58531 16.9666 5.94021 16.9695L7.42665 16.9816C8.48266 16.9902 9.45637 17.5535 9.99037 18.4645L10.7471 19.7557C10.9266 20.0619 11.2549 20.25 11.6099 20.25H12.3901C12.7451 20.25 13.0734 20.0619 13.2529 19.7557L14.0096 18.4645C14.5436 17.5535 15.5173 16.9902 16.5734 16.9816L18.0599 16.9695C18.4148 16.9666 18.7416 16.7758 18.9185 16.4682L19.3149 15.7792C19.491 15.473 19.4926 15.0966 19.3189 14.7889L18.577 13.4748C18.0603 12.5595 18.0603 11.4405 18.577 10.5252L19.3189 9.21107C19.4926 8.90345 19.491 8.52702 19.3149 8.22082L18.9185 7.53183C18.7416 7.22419 18.4148 7.0334 18.0599 7.03051L16.5734 7.01839C15.5174 7.00978 14.5437 6.44657 14.0096 5.53548L13.2529 4.24434C13.0734 3.93813 12.7451 3.75 12.3901 3.75H11.6099ZM9.02167 3.23301C9.56009 2.31439 10.5451 1.75 11.6099 1.75H12.3901C13.4549 1.75 14.4399 2.31439 14.9783 3.23301L15.7351 4.52415C15.9131 4.82785 16.2377 5.01558 16.5897 5.01845L18.0762 5.03058C19.1409 5.03926 20.1212 5.61161 20.6521 6.53452L21.0485 7.22352C21.577 8.14213 21.5815 9.27141 21.0605 10.1943L20.3187 11.5084C20.1464 11.8135 20.1464 12.1865 20.3187 12.4916L21.0605 13.8057C21.5815 14.7286 21.577 15.8579 21.0485 16.7765L20.6521 17.4655C20.1212 18.3884 19.1409 18.9608 18.0762 18.9694L16.5897 18.9816C16.2377 18.9844 15.9131 19.1722 15.7351 19.4759L14.9783 20.767C14.4399 21.6856 13.4549 22.25 12.3901 22.25H11.6099C10.5451 22.25 9.56009 21.6856 9.02167 20.767L8.26491 19.4759C8.08691 19.1722 7.76234 18.9844 7.41034 18.9816L5.9239 18.9694C4.8592 18.9608 3.87888 18.3884 3.34795 17.4655L2.95159 16.7765C2.42314 15.8579 2.41856 14.7286 2.93954 13.8057L3.68141 12.4916C3.85365 12.1865 3.85365 11.8135 3.68141 11.5084L2.93954 10.1943C2.41856 9.27141 2.42314 8.14213 2.95159 7.22352L3.34795 6.53453C3.87888 5.61162 4.8592 5.03926 5.9239 5.03058L7.41032 5.01845C7.76233 5.01558 8.0869 4.82785 8.2649 4.52415L9.02167 3.23301Z",
          fill: "currentColor",
        })),
        (G = (0, fl.jsx)("path", {
          fillRule: "evenodd",
          clipRule: "evenodd",
          d: "M12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8285 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8285 10.5 12 10.5ZM8.50004 12C8.50004 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.50004 13.933 8.50004 12Z",
          fill: "currentColor",
        })),
        (_[0] = j),
        (_[1] = G))
      : ((j = _[0]), (G = _[1]));
    let m;
    return (
      _[2] !== g
        ? ((m = (0, fl.jsxs)("svg", {
            width: "1em",
            height: "1em",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            ...g,
            children: [j, G],
          })),
          (_[2] = g),
          (_[3] = m))
        : (m = _[3]),
      m
    );
  },
  Vm = "https://developers.openai.com/codex/app/chrome-extension",
  xm = "codex://settings/computer-use/google-chrome",
  Km = { connected: "Connected", disconnected: "Disconnected" },
  Jm = {
    connected: "Control Chrome with Codex.",
    disconnected: "Use the Chrome plugin in Codex to connect.",
  },
  wm = {
    connected: "border-success-surface bg-success-surface text-success-surface",
    disconnected: "border-danger-surface bg-danger-surface text-danger-surface",
  };
function Wm(g) {
  return g && typeof g == "object" && "message" in g
    ? String(g.message)
    : String(g);
}
function $m(g) {
  return g?.state === "connected" ? "connected" : "disconnected";
}
function Fm({ showInternalDetails: g }) {
  const [_, j] = (0, bn.useState)(null),
    G = (0, bn.useCallback)(async () => {
      try {
        const N = await chrome.runtime.sendMessage({
          type: "GET_NATIVE_HOST_STATUS",
        });
        N?.status
          ? j(N.status)
          : N?.error &&
            j({
              error: N.error,
              lastChecked: Date.now(),
              state: "disconnected",
            });
      } catch (N) {
        j({ error: Wm(N), lastChecked: Date.now(), state: "disconnected" });
      }
    }, []);
  (0, bn.useEffect)(() => {
    let N = !0;
    (chrome.storage.local.get("NATIVE_HOST_STATUS").then((B) => {
      N && j(B.NATIVE_HOST_STATUS ?? null);
    }),
      G());
    const A = (B, q) => {
      q === "local" &&
        B.NATIVE_HOST_STATUS &&
        j(B.NATIVE_HOST_STATUS.newValue ?? null);
    };
    return (
      chrome.storage.onChanged.addListener(A),
      () => {
        ((N = !1), chrome.storage.onChanged.removeListener(A));
      }
    );
  }, [G]);
  const m = $m(_),
    J = Km[m],
    ll = Jm[m],
    hl = wm[m],
    tl = (0, bn.useMemo)(() => chrome.runtime.getManifest(), []);
  return (0, fl.jsx)("section", {
    className:
      "border-subtle bg-surface-secondary overflow-hidden rounded-lg border",
    children: (0, fl.jsxs)("div", {
      className: "px-3 py-2",
      children: [
        (0, fl.jsxs)("div", {
          className: "flex items-center justify-between gap-2",
          children: [
            (0, fl.jsx)("div", {
              className: "min-w-0 truncate",
              children: (0, fl.jsxs)("div", {
                className: `inline-flex h-6 max-w-full items-center gap-1.5 rounded-full border px-2 text-[12px] leading-4 font-medium ${hl}`,
                children: [
                  (0, fl.jsx)("span", {
                    className: "size-1.5 shrink-0 rounded-full bg-current",
                    "aria-hidden": !0,
                  }),
                  (0, fl.jsx)("span", { className: "truncate", children: J }),
                ],
              }),
            }),
            (0, fl.jsx)("button", {
              type: "button",
              onClick: () => {
                window.location.href = xm;
              },
              "aria-label": "Open settings",
              title: "Open settings",
              className:
                "text-secondary hover:text-default focus-visible:ring-focus -mr-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none",
              children: (0, fl.jsx)(rm, {
                className: "size-4",
                "aria-hidden": !0,
              }),
            }),
          ],
        }),
        (0, fl.jsxs)("p", {
          className: "text-secondary mt-2 text-[12px] leading-4",
          children: [
            ll,
            " ",
            (0, fl.jsx)("a", {
              href: Vm,
              target: "_blank",
              rel: "noreferrer",
              className:
                "hover:text-default inline-flex underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none",
              children: "Learn more",
            }),
          ],
        }),
        (0, fl.jsxs)("div", {
          className: "text-secondary mt-2 space-y-0.5 text-[11px] leading-4",
          children: [
            g
              ? (0, fl.jsxs)("p", {
                  className: "truncate",
                  children: ["Host: ", _?.hostName ?? "Not available"],
                })
              : null,
            (0, fl.jsxs)("p", { children: ["Version v", tl.version] }),
          ],
        }),
      ],
    }),
  });
}
var km = "prod";
function Im(g) {
  if (typeof g != "string") return km;
  switch (g) {
    case "dev":
    case "internal":
    case "prod":
      return g;
    default:
      throw new Error(
        `Unsupported extension build channel "${g}". Use "dev", "internal", or "prod".`,
      );
  }
}
var Pm = Im("prod");
function l2(g) {
  return g !== "prod";
}
function t2() {
  const g = (0, uf.c)(2);
  let _;
  g[0] === Symbol.for("react.memo_cache_sentinel")
    ? ((_ = l2(Pm)), (g[0] = _))
    : (_ = g[0]);
  const j = _;
  let G;
  return (
    g[1] === Symbol.for("react.memo_cache_sentinel")
      ? ((G = (0, fl.jsx)("main", {
          className: "bg-surface text-default w-[360px] p-4",
          children: (0, fl.jsxs)("div", {
            className: "space-y-3",
            children: [
              (0, fl.jsxs)("header", {
                className: "px-2 pt-1 pb-2 text-center",
                children: [
                  (0, fl.jsx)("div", {
                    className: "flex justify-center",
                    children: (0, fl.jsx)("span", {
                      "aria-hidden": "true",
                      className:
                        "codex-popup-logo text-default block size-7 bg-current",
                    }),
                  }),
                  (0, fl.jsx)("h1", {
                    className: "mt-3 text-[16px] leading-5 font-medium",
                    children: "Codex",
                  }),
                ],
              }),
              (0, fl.jsx)(Fm, { showInternalDetails: j }),
            ],
          }),
        })),
        (g[1] = G))
      : (G = g[1]),
    G
  );
}
Zm();
var nv = document.querySelector("#app");
if (nv == null) throw new Error("Popup root not found");
(0, Bm.createRoot)(nv).render(
  (0, fl.jsx)(Um, { children: (0, fl.jsx)(t2, {}) }),
);
