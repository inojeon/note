"""Apply the shared glossary to concept sources, then run build_concepts.py.

Edit docs/assets/concept-glossary.json for terminology and descriptions.
This command is idempotent; existing glossary markup is refreshed safely.
"""
from pathlib import Path
import html
import json
import re
from concept_math import typeset_html

ROOT = Path(__file__).resolve().parents[1]
from concept_dom import Node, Parser, plain, render

def reset(node):
    updated=[]
    for c in node.children:
        if isinstance(c,Node):
            if 'term-wrap' in c.attrs.get('class','').split():
                button=next(n for n in c.children if isinstance(n,Node) and n.tag=='button')
                updated.append(plain(button));continue
            if 'term-popover' in c.attrs.get('class','').split():continue
            if c.tag=='script' and 'const triggers=Array.from' in plain(c):continue
            reset(c)
        updated.append(c)
    # Resetting a tooltip can split a compound term across adjacent text nodes.
    # Rejoin them so longest-term matching still sees e.g. 무차원 or 공간오비탈.
    merged=[]
    for item in updated:
        if isinstance(item,str) and merged and isinstance(merged[-1],str):merged[-1]+=item
        else:merged.append(item)
    if node.tag not in {'script','style'}:
        merged=[clean_labels(item) if isinstance(item,str) else item for item in merged]
    node.children=merged

def clean_labels(text):
    """Repair legacy partial matches before matching complete concepts."""
    replacements = {
        '행렬(Matrix)식': '행렬식',
        '반교환(Commutativity)': '반교환(Anticommutation)',
        '교환(Commutativity)(Exchange)': '교환(Exchange)',
        '교환(Commutativity)': '교환',
        '비직교(Orthogonality)': '비직교(Nonorthogonal)',
        '무차원(Dimension)': '무차원',
        '생성(Span) 스크립트': '생성 스크립트',
        '생성(Span) 연산자': '생성 연산자(Creation Operator)',
        '중첩(Superposition)된 기저 집합': '포함 관계인 기저 집합',
        '측정 기저(Measurement Basis)(Basis)': '측정 기저(Measurement Basis)',
        '최소 기저 집합(Minimal Basis Set)(Basis Set)': '최소 기저 집합(Minimal Basis Set)',
        '공간 오비탈(Spatial Orbital)(Orbital)': '공간 오비탈(Spatial Orbital)',
        '스핀오비탈(Spin Orbital)(Orbital)': '스핀오비탈(Spin Orbital)',
        '행렬원소(Matrix Element)(Hamiltonian Matrix Element)': '행렬원소(Hamiltonian Matrix Element)',
        '부분공간(Subspace) 대각화(Diagonalization)(Subspace Diagonalization)': '부분공간 대각화(Subspace Diagonalization)',
        '자기일관장(Self-Consistent Field)(MCSCF)': '자기일관장(MCSCF)',
        '하트리(Hartree)(Hartree, Ha)': '하트리(Hartree, Ha)',
        '라디안(Radian)(rad)': '라디안(Radian, rad)',
        '(Full Configuration Interaction)(FCI)': '(Full Configuration Interaction, FCI)',
        '분자 오비탈를': '분자 오비탈을',
        '분자 오비탈는': '분자 오비탈은',
        '기저 집합(Basis Set)는': '기저 집합(Basis Set)은',
        '하트리–폭는': '하트리–폭은',
        '하트리–폭(Hartree–Fock, HF)는': '하트리–폭(Hartree–Fock, HF)은',
    }
    for old,new in replacements.items():
        text=text.replace(old,new)
    return re.sub(r'\(([^()]+)\)\(\1,\s*([A-Za-z]+)\)',r'(\1, \2)',text)

def render_worked_example(entry):
    parts=[]
    for part in entry['worked_parts']:
        if isinstance(part,str):
            parts.append('<span class="example-equation-text">'+html.escape(part)+'</span>')
            continue
        rows=part['matrix']
        assert rows and all(len(row)==len(rows[0]) for row in rows)
        label='; '.join(', '.join(map(str,row)) for row in rows)
        cells=''.join('<span class="math-row">'+''.join('<span>'+html.escape(str(value))+'</span>' for value in row)+'</span>' for row in rows)
        parts.append('<span class="math-array" role="math" aria-label="'+html.escape(label,quote=True)+'"><span class="math-cells" aria-hidden="true">'+cells+'</span></span>')
    return '<span class="term-example"><b>간단한 예시</b><span>'+html.escape(entry['worked_example'])+'</span><span class="term-example-math">'+''.join(parts)+'</span></span>'

entries=json.loads((ROOT/'docs/assets/concept-glossary.json').read_text())
aliases={'사영 측정':'투영 측정','곱 상태':'곱상태','하트리–포크':'하트리–폭','완전 구성 상호작용':'전체 구성 상호작용','크릴로프 공간':'크릴로프 부분공간','랑초스':'랑초스 알고리즘','직교성':'직교',
         '순수 상태':'순수상태','혼합 상태':'혼합상태','복소 켤레':'켤레','복소켤레':'켤레',
         '복소켤레 전치':'켤레전치', '공간오비탈':'공간 오비탈', '스핀오비탈':'스핀 오비탈', '스핀 궤도':'스핀 오비탈', '공간 궤도':'공간 오비탈', '원자오비탈':'원자 오비탈', '분자오비탈':'분자 오비탈', '전자배치':'전자 배치', '슬레이터행렬식':'슬레이터 행렬식','들뜬 고유상태':'들뜬상태'}
lookup={e['term']:e for e in entries}
lookup.update({a:lookup[k] for a,k in aliases.items()})
def term_pattern(term, entry):
    english=r'\('+re.escape(entry['english'])+r'(?:,\s*[A-Z][A-Z0-9-]*)?\)'
    # Korean particles may follow a term, but a term must not start in the
    # middle of another word (e.g. 비직교 or 반교환). A different supplied
    # English label is intentional: never insert a second translation.
    suffix = r'(?!식)' if entry['id']=='matrix' else ''
    explicit = len(term)==1 or entry['id'] in {'span','exchange'}
    return r'(?<![가-힣A-Za-z])'+re.escape(term)+(english if explicit else '(?:'+english+')?')+suffix+r'(?!\s*\([A-Za-z])'
pattern=re.compile('|'.join(term_pattern(term,entry) for term,entry in sorted(lookup.items(),key=lambda x:len(x[0]),reverse=True)))
runtime=(ROOT/'docs/assets/concept-glossary.js').read_text()
def main():
    summary={}
    for path in sorted((ROOT/'docs').glob('concept-*.html')):
        parser=Parser();parser.feed(path.read_text());tree=parser.root;reset(tree)
        seen=set();panels=[];slug=path.stem.removeprefix('concept-')
        def walk(node):
            classes=node.attrs.get('class','').split()
            if node.tag in {'head','script','style','nav','a','h1','h2','h3','svg','math','button','summary','select','option'} or any(c in classes for c in ['meta','eyebrow','lead','formula','math-array','math-tex','term-hint','note-guide','note-check','note-remember']):return
            result=[]
            for c in node.children:
                if isinstance(c,Node):walk(c);result.append(c);continue
                def annotate(m):
                    matched=m.group();term=next(k for k in sorted(lookup,key=len,reverse=True) if matched==k or matched.startswith(k+'('));entry=lookup[term]
                    if entry['id'] in seen:return matched
                    seen.add(entry['id']);ident='glossary-'+slug+'-'+entry['id'];label=matched if '(' in matched else term+'('+entry['english']+')'
                    target=entry['page']
                    more=f'<a href="concept-{target}.html">関連概念を読む →</a>' if target and target!=slug else ''
                    more=more.replace('関連概念を読む','관련 개념 읽기')
                    panel=f'<span id="{ident}" class="term-popover" popover="auto" role="note" aria-label="{html.escape(label)} 설명"><strong>{html.escape(label)}</strong><span>{html.escape(entry["description"])}</span>{render_worked_example(entry)}<span class="term-formula">{html.escape(entry["example"])}</span>{more}</span>'
                    panels.append(panel)
                    return f'<span class="term-wrap"><button type="button" class="term-trigger" popovertarget="{ident}" aria-controls="{ident}" aria-describedby="{ident}" aria-expanded="false">{html.escape(label)}</button></span>'
                result.append(pattern.sub(annotate,c))
            node.children=result
        walk(tree)
        def finish(node):
            if node.tag=='main':
                node.children.extend(panels)
                node.children.append('<script>'+runtime+'</script>')
            for child in node.children:
                if isinstance(child,Node):finish(child)
        finish(tree)
        output=tree.render()
        if 'class="term-hint"' not in output:
            output=output.replace('<h2>정의</h2>','<h2>정의</h2><p class="term-hint">점선 밑줄 용어에 마우스를 올리거나 터치하면 뜻을 볼 수 있습니다.</p>',1)
        path.write_text(typeset_html(output))
        summary[slug]=len(seen)
    print(json.dumps(summary,ensure_ascii=False))

if __name__ == "__main__":
    main()
