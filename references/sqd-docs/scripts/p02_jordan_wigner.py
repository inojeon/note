"""문서 2(02-jordan-wigner.html): 파울리 항 수, 이동 연산 하나의 변환, H2 15항."""
from pyscf import gto, scf, ao2mo
from qiskit_nature.second_q.hamiltonians import ElectronicEnergy
from qiskit_nature.second_q.operators import FermionicOp
from qiskit_nature.second_q.mappers import JordanWignerMapper
from common import n2, save

_, _, _, hcore, eri, _ = n2()
ferm = ElectronicEnergy.from_raw_integrals(hcore, eri).second_q_op()
qop = JordanWignerMapper().map(ferm)
hop = JordanWignerMapper().map(FermionicOp({"+_2 -_0": 1.0}, num_spin_orbitals=4))
mol = gto.M(atom="H 0 0 0; H 0 0 0.74", basis="sto-3g", verbose=0); mf = scf.RHF(mol).run()
h1 = mf.mo_coeff.T @ mf.get_hcore() @ mf.mo_coeff; e2 = ao2mo.restore(1, ao2mo.kernel(mol, mf.mo_coeff), 2)
q2 = JordanWignerMapper().map(ElectronicEnergy.from_raw_integrals(h1, e2).second_q_op())
save("02_jw.json", {"n2_fermionic_terms": len(ferm), "n2_pauli_terms": len(qop), "n2_qubits": qop.num_qubits,
                    "hop_labels": hop.paulis.to_labels(), "hop_coeffs": [str(c) for c in hop.coeffs],
                    "h2_pauli": dict(zip(q2.paulis.to_labels(), [float(c.real) for c in q2.coeffs]))})
