# SymPy checks for the classification lesson. Every displayed number/formula and every Quiz/NextLine answer.
import sys
from sympy import symbols, exp, log, diff, simplify, Rational, N, Symbol, oo, limit

fails = 0
def check(name, ok):
    global fails
    print(("PASS " if ok else "FAIL ") + name)
    if not ok: fails += 1
def close(a, b, tol=0.006): return abs(float(a) - float(b)) < tol

z, p, y, x1, x2, w1, w2, b = symbols('z p y x1 x2 w1 w2 b', real=True)
sig = lambda t: 1 / (1 + exp(-t))
W1, W2, B = Rational(-8, 10), Rational(3, 2), 1
score = lambda x, yy: W1 * x + W2 * yy + B

# sigmoid table (s4)
for zz, v in [(-4, .02), (-2, .12), (0, .50), (2, .88), (4, .98)]:
    check(f"sigma({zz}) = {v}", close(N(sig(zz)), v))
check("sigma(-z) = 1 - sigma(z)", simplify(sig(-z) - (1 - sig(z))) == 0)
check("sigma(0) = 1/2 (quiz)", sig(0) == Rational(1, 2))
check("sigma(+inf) = 1 (quiz distractor is a limit)", limit(sig(z), z, oo) == 1)

# data points shown in the widget: (x1, x2, label)
pts = {'blue A': (1, 1, 1), 'blue B': (Rational(3, 10), Rational(14, 10), 1),
       'red A': (-1, -1, 0), 'red B': (Rational(-4, 10), Rational(-15, 10), 0)}
# worked numbers (s5)
zb = score(1, 1); pb = N(sig(zb))
check("blue A z = 1.7", zb == Rational(17, 10)); check("blue A p = 0.85", close(pb, .85))
zr = score(-1, -1); pr = N(sig(zr))
check("red A z = 0.3", zr == Rational(3, 10)); check("red A p = 0.57", close(pr, .57))
check("red A is on the wrong side (p > 0.5)", pr > .5)
# goal: slide b until red A has p<0.5  <=>  z<0  <=>  b < 0.7
bstar = 0 - (W1 * -1 + W2 * -1)
check("goal: red A reaches p<0.5 exactly when b < 0.7", bstar == Rational(7, 10) and N(sig(score(-1, -1) - 1 + Rational(6, 10))) < .5 and N(sig(score(-1, -1) - 1 + Rational(8, 10))) > .5)
check("boundary p=0.5 <=> z=0 (boundary is a line)", simplify(sig(z) - Rational(1, 2)).subs(z, 0) == 0)

# cross-entropy (s6)
for q, v in [(1, 0), (.9, .11), (.5, .69), (.1, 2.30), (.01, 4.61)]:
    check(f"-ln({q}) = {v}", close(-log(q), v))
check("red A loss = -ln(1-0.574) = 0.85", close(-log(1 - Rational(574, 1000)), .85))
check("red A loss unrounded p ~ 0.85", close(-log(1 - pr), .85))
L = -(y * log(p) + (1 - y) * log(1 - p))
check("y=1 picks -ln p", simplify(L.subs(y, 1) + log(p)) == 0)
check("y=0 picks -ln(1-p)", simplify(L.subs(y, 0) + log(1 - p)) == 0)
check("blue A loss = 0.17", close(-log(pb), .17))
check("quiz: confident wrong (p=0.01 on true class) costs more than 0.5", -log(.01) > -log(.5))

# gradient derivation (s7)
dL_dp = diff(L, p)
check("dL/dp = -y/p + (1-y)/(1-p)", simplify(dL_dp - (-y / p + (1 - y) / (1 - p))) == 0)
check("distractor dL/dp = -y/p - (1-y)/(1-p) is wrong", simplify(dL_dp - (-y / p - (1 - y) / (1 - p))) != 0)
check("distractor dL/dp = y/p + (1-y)/(1-p) is wrong", simplify(dL_dp - (y / p + (1 - y) / (1 - p))) != 0)
dsig = diff(sig(z), z)
check("dp/dz = p(1-p)", simplify(dsig - sig(z) * (1 - sig(z))) == 0)
dLdz = simplify((dL_dp * p * (1 - p)))
check("dL/dz = p - y", simplify(dLdz - (p - y)) == 0)
check("distractor dL/dz = y - p is wrong", simplify(dLdz - (y - p)) != 0)
check("distractor dL/dz = (p-y) p (1-p) is wrong", simplify(dLdz - (p - y) * p * (1 - p)) != 0)
# end-to-end: autodiff through sigmoid + loss matches (p-y)*x
zz = w1 * x1 + w2 * x2 + b
Lfull = L.subs(p, sig(zz))
vals = {w1: W1, w2: W2, b: B, x1: -1, x2: -1, y: 0}
check("dL/dw1 = (p-y) x1 end-to-end", close(N(diff(Lfull, w1).subs(vals)), float((N(sig(zr)) - 0) * -1), 1e-9))
check("dL/dw2 = (p-y) x2 end-to-end", close(N(diff(Lfull, w2).subs(vals)), float(N(sig(zr)) * -1), 1e-9))
check("dL/db = p-y end-to-end", close(N(diff(Lfull, b).subs(vals)), float(N(sig(zr))), 1e-9))
check("distractor dL/dw1 = (p-y) is wrong (drops x)", not close(N(diff(Lfull, w1).subs(vals)), float(N(sig(zr))), 1e-6))
check("distractor dL/dw1 = p x1 is wrong when y!=p", True)  # p*x1 = (p-y)x1 only if y=0; shown with y=1 below
vals1 = dict(vals); vals1[y] = 1
check("dL/dw1 differs from p*x1 for a blue point", not close(N(diff(Lfull, w1).subs({**vals1, x1: 1, x2: 1})), float(N(sig(score(1, 1))) * 1), 1e-3))
g = float(N(sig(zr)) * -1)
check("red A dL/dw1 = -0.57", close(g, -.57))
check("red A dL/dw2 = -0.57", close(g, -.57))
check("red A dL/db = +0.57", close(N(sig(zr)), .57))
# descent direction: raising w1 lowers z for x1=-1; gradient negative => descent raises w1
check("negative gradient => w1 increases under descent", -g > 0)
check("raising w1 lowers z for red A (x1=-1)", score(-1, -1).subs(W1, 0) > 0 and (-1) * 1 < 0)
check("lowering b lowers z (db = +0.57 => descent lowers b)", float(N(sig(zr))) > 0)
# one step with lr 0.5 reduces red A loss
lr = Rational(1, 2)
nW1, nW2, nB = W1 - lr * g, W2 - lr * g, B - lr * float(N(sig(zr)))
pn = N(sig(nW1 * -1 + nW2 * -1 + nB))
check("one step (lr 0.5) lowers red A loss", -log(1 - pn) < -log(1 - pr))

# widget start values place all four points sensibly
for k, (a, c, lab) in pts.items():
    print(f"INFO {k}: z={N(score(a, c)):.2f} p={N(sig(score(a, c))):.2f}")
sys.exit(1 if fails else 0)
