"""모든 데이터를 다시 만든다. 무거운 각도 최적화는 --optimize를 붙일 때만."""
import subprocess, sys, time, os
here = os.path.dirname(os.path.abspath(__file__))
jobs = ["intro_h2.py", "p00_quickstart.py", "p01_pyscf_n2.py", "p02_jordan_wigner.py", "p03_ucj_inside.py",
        "p04_circuit.py", "p05_sampling.py", "p06_sqd_guide.py", "math_n2_krylov.py", "bo_h2.py"]
for j in jobs:
    env = dict(os.environ, OMP_NUM_THREADS="1")  # SQD 반복 결과가 스레드 수에 따라 달라지므로 고정
    t = time.time(); args = [sys.executable, os.path.join(here, j)] + (["--optimize"] if j.startswith("p03") and "--optimize" in sys.argv else [])
    r = subprocess.run(args, cwd=here, env=env)
    print(f"[{'ok' if r.returncode == 0 else 'FAIL'}] {j} {time.time() - t:.0f}s"); 
    if r.returncode: sys.exit(r.returncode)
