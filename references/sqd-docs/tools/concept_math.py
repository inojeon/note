"""Mark the notes' authored expressions as TeX for the shared KaTeX renderer.

This is a small catalog of authored expressions, not a general TeX parser.
Existing TeX markers, scripts, SVG labels and HTML attributes are left untouched.
"""
from html import escape
from html.parser import HTMLParser
import re


SYMBOLS = {'ψ': r'\psi ', 'Ψ': r'\Psi ', 'φ': r'\phi ', 'χ': r'\chi ',
           'ρ': r'\rho ', 'ℏ': r'\hbar ', '∂': r'\partial ', '∑': r'\sum ',
           '⟨': r'\langle ', '⟩': r'\rangle ', '−': '-', '⋮': r'\vdots ',
           '…': r'\ldots ', 'ℬ': r'\mathcal{B}', '↔': r'\leftrightarrow '}

def tex_atom(value):
    return ''.join(SYMBOLS.get(c,c) for c in str(value))

def tag(name, *children, **attrs):
    if name in {'mi','mn','mo'}:
        value=tex_atom(''.join(children))
        if attrs.get('mathvariant')=='bold': return r'\mathbf{'+value+'}'
        if value=='cos': return r'\cos '
        return value
    if name in {'math','mrow','mtd'}: return ''.join(children)
    if name in {'msub','munder'}: return children[0]+'_{'+children[1]+'}'
    if name=='msup': return '{'+children[0]+'}^{'+children[1]+'}'
    if name=='munderover': return children[0]+'_{'+children[1]+'}^{'+children[2]+'}'
    if name=='mover': return r'\overset{'+children[1]+'}{'+children[0]+'}'
    if name=='mfrac': return r'\frac{'+children[0]+'}{'+children[1]+'}'
    if name=='msqrt': return r'\sqrt{'+''.join(children)+'}'
    if name=='mtr': return ' & '.join(children)
    if name=='mtable': return r'\begin{matrix}'+r' \\ '.join(children)+r'\end{matrix}'
    raise ValueError('Unsupported authored math node: '+name)

def mi(value): return tag('mi', str(value))
def mn(value): return tag('mn', str(value))
def mo(value): return tag('mo', str(value))
def row(*values): return ''.join(values)
def sub(base, index): return tag('msub', base, index)
def sup(base, index): return tag('msup', base, index)
def frac(top, bottom): return tag('mfrac', top, bottom)
def root(value): return tag('msqrt', value)
def ket(value): return r'\lvert '+value+r'\rangle '
def bra(value): return r'\langle '+value+r'\rvert '
def inner(left, right): return r'\langle '+left+r'\mid '+right+r'\rangle '
def sandwich(left, operator, right): return r'\langle '+left+r'\lvert '+operator+r'\rvert '+right+r'\rangle '
def parens(value): return '('+value+')'
def absolute(value): return r'\lvert '+value+r'\rvert '
def matrix(rows): return r'\begin{bmatrix}'+r' \\ '.join(' & '.join(cells) for cells in rows)+r'\end{bmatrix}'
def math(label, content, display='inline'):
    return '<span class="math-tex" data-tex="'+escape(content,quote=True)+'">'+escape(label)+'</span>'


psi, bigpsi, phi, i, c = map(mi, ['ψ', 'Ψ', 'φ', 'i', 'c'])
ci = sub(c, i)
phii = sub(phi, i)
phase = sup(mi('e'), row(mi('i'), phi))
global_phase = sup(mi('e'), row(mi('i'), mi('χ')))
phase_time = sup(mi('e'), row(mo('−'), frac(row(mi('i'), mi('E'), mi('t')), mi('ℏ'))))
summation = tag('munder', mo('∑'), i)
normalization = row(summation, sup(absolute(ci), mn(2)), mo('='), mn(1))
position = row(psi, parens(mi('r')))
expressions = {}


def add(label, content, *aliases):
    for text in (label, *aliases):
        expressions[text] = math(label, content)


add('|ψ⟩ = Σᵢ cᵢ|i⟩', row(ket(psi), mo('='), summation, ci, ket(i)))
add('|ψ⟩ = Σᵢ cᵢ|φᵢ⟩', row(ket(psi), mo('='), summation, ci, ket(phii)))
add('Σᵢ|cᵢ|² = 1', normalization)
add('cᵢ = ⟨φᵢ|ψ⟩', row(ci, mo('='), inner(phii, psi)))
add('cᵢ = ⟨i|ψ⟩', row(ci, mo('='), inner(i, psi)))
add('pᵢ = |⟨i|ψ⟩|²', row(sub(mi('p'),i), mo('='), sup(absolute(inner(i,psi)),mn(2))))
add('⟨ψ|ψ⟩ = 1', row(inner(psi,psi),mo('='),mn(1)))
add('ψ(r) = ⟨r|ψ⟩', row(position,mo('='),inner(mi('r'),psi)))
add('|ψ(r)|²', sup(absolute(position),mn(2)))
add('Ψ(x₁, …, xN)', row(bigpsi,parens(row(sub(mi('x'),mn(1)),mo(','),mo('…'),mo(','),sub(mi('x'),mi('N'))))))
add('ρ = |ψ⟩⟨ψ|', row(mi('ρ'),mo('='),ket(psi),bra(psi)))
add('⟨A⟩ = ⟨ψ|A|ψ⟩', row(mo('⟨'),mi('A'),mo('⟩'),mo('='),sandwich(psi,mi('A'),psi)))
add('p(a) = ⟨ψ|Pₐ|ψ⟩', row(mi('p'),parens(mi('a')),mo('='),sandwich(psi,sub(mi('P'),mi('a')),psi)))
add('e^{iχ}|ψ⟩', row(global_phase,ket(psi)), 'eⁱχ|ψ⟩')
add('e^{iχ}',global_phase,'eⁱχ')
add('e^{iφ}',phase)
add('e^{−iEt/ℏ}',phase_time)
add('Ψ(t) = e^{−iEt/ℏ}ψ',row(bigpsi,parens(mi('t')),mo('='),phase_time,psi))
add('iℏ∂Ψ/∂t = HΨ',row(mi('i'),mi('ℏ'),frac(row(mo('∂'),bigpsi),row(mo('∂'),mi('t'))),mo('='),mi('H'),bigpsi))
add('Hψ = Eψ',row(mi('H'),psi,mo('='),mi('E'),psi))
add('|ψ⟩ = (|1⟩ + e^{iφ}|2⟩)/√2',row(ket(psi),mo('='),frac(row(ket(mn(1)),mo('+'),phase,ket(mn(2))),root(mn(2)))))
add('(|1⟩+e^{iφ}|2⟩)/√2',frac(row(ket(mn(1)),mo('+'),phase,ket(mn(2))),root(mn(2))))
add('c₊ = (1 + e^{iφ})/2, c₋ = (1 − e^{iφ})/2',row(sub(c,mo('+')),mo('='),frac(row(mn(1),mo('+'),phase),mn(2)),mo(','),sub(c,mo('−')),mo('='),frac(row(mn(1),mo('−'),phase),mn(2))))
for sign in ['+', '−']:
    add(f'|{sign}⟩ = (|1⟩ {sign} |2⟩)/√2',row(ket(mo(sign)),mo('='),frac(row(ket(mn(1)),mo(sign),ket(mn(2))),root(mn(2)))))
    add(f'P({sign}) = |c{ "₊" if sign=="+" else "₋" }|² = (1 {sign} cos φ)/2',row(mi('P'),parens(mo(sign)),mo('='),sup(absolute(sub(c,mo(sign))),mn(2)),mo('='),frac(row(mn(1),mo(sign),tag('mi','cos',mathvariant='normal'),phi),mn(2))))
add('e^{iφ}/√2',frac(phase,root(mn(2))))
add('1/√2',frac(mn(1),root(mn(2))))
for symbol in ['ψ','Ψ','φ','i','r','0','1','2','+','−','E₁','E₂']:
    atom = sub(mi('E'),mn(symbol[-1].translate(str.maketrans('₁₂','12')))) if symbol.startswith('E') else mn(symbol) if symbol.isdigit() else mo(symbol) if symbol in ['+','−'] else mi(symbol)
    add(f'|{symbol}⟩',ket(atom))
    add(f'⟨{symbol}|',bra(atom))
for label, left, right in [('⟨i|ψ⟩',i,psi),('⟨φᵢ|ψ⟩',phii,psi),('⟨ψ|ψ⟩',psi,psi),('⟨r|ψ⟩',mi('r'),psi),('⟨0|ψ⟩',mn(0),psi)]:
    add(label,inner(left,right))
add('⟨φ|ψ⟩',inner(phi,psi))
# Additional textbook formulas used in the quantum notes.
add('p₀ = cos²θ', 'p_0=\\cos^2\\theta')
add('p₁ = sin²θ', 'p_1=\\sin^2\\theta')
add('|c|² = c* c = a² + b²', '|c|^2=c^*c=a^2+b^2')
add('iℏ f′(t)ψ = f(t)Hψ', 'i\\hbar f^{\\prime}(t)\\psi=f(t)H\\psi')
add('iℏf′(t) = Ef(t)', 'i\\hbar f^{\\prime}(t)=Ef(t)')
add('Ψ(t) = f(t)ψ', '\\Psi(t)=f(t)\\psi')
add('H† = H', 'H^{\\dagger}=H')
add('Hc = Ec', 'Hc=Ec')
add('c†c = 1', 'c^{\\dagger}c=1')
add('⟨H⟩ = c†Hc', '\\langle H\\rangle=c^{\\dagger}Hc')
add('⟨φ|ψ⟩', '\\langle\\phi\\mid\\psi\\rangle')
pattern=re.compile('|'.join(re.escape(key) for key in sorted(expressions,key=len,reverse=True)))


def typeset_text(text):
    parts=[]; end=0
    for match in pattern.finditer(text):
        parts.extend((escape(text[end:match.start()],quote=False),expressions[match.group()]))
        end=match.end()
    parts.append(escape(text[end:],quote=False))
    return ''.join(parts)


class Typesetter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.parts=[];self.blocked=[];self.stack=[]

    def handle_starttag(self,tag,attrs):
        self.parts.append(self.get_starttag_text())
        blocked = tag in {'script','style','svg','math','head'} or 'data-tex' in dict(attrs)
        if tag not in {'br','hr','img','input','meta','link','wbr'}:
            self.stack.append(blocked)
            if blocked:self.blocked.append(tag)

    def handle_endtag(self,tag):
        self.parts.append('</'+tag+'>')
        if self.stack and self.stack.pop():self.blocked.pop()

    def handle_startendtag(self,tag,attrs):self.parts.append(self.get_starttag_text())
    def handle_data(self,data):self.parts.append(data if self.blocked else typeset_text(data))
    def handle_entityref(self,name):self.parts.append('&'+name+';')
    def handle_charref(self,name):self.parts.append('&#'+name+';')
    def handle_decl(self,decl):self.parts.append('<!'+decl+'>')
    def handle_comment(self,data):self.parts.append('<!--'+data+'-->')


def typeset_html(source):
    parser=Typesetter();parser.feed(source)
    return ''.join(parser.parts)
