"""Typeset the notes' explicit quantum notation with native, offline MathML.

This is a small catalog of authored expressions, not a general TeX parser.
Existing MathML, scripts, SVG labels and HTML attributes are left untouched.
"""
from html import escape
from html.parser import HTMLParser
import re


def tag(name, *children, **attrs):
    attributes = ''.join(f' {key}="{escape(str(value), quote=True)}"' for key, value in attrs.items())
    return f'<{name}{attributes}>' + ''.join(children) + f'</{name}>'


def mi(value): return tag('mi', escape(str(value)))
def mn(value): return tag('mn', escape(str(value)))
def mo(value): return tag('mo', escape(str(value)))
def row(*values): return tag('mrow', *values)
def sub(base, index): return tag('msub', base, index)
def sup(base, index): return tag('msup', base, index)
def frac(top, bottom): return tag('mfrac', top, bottom)
def root(value): return tag('msqrt', value)
def ket(value): return row(mo('|'), value, mo('⟩'))
def bra(value): return row(mo('⟨'), value, mo('|'))
def inner(left, right): return row(mo('⟨'), left, mo('|'), right, mo('⟩'))
def sandwich(left, operator, right): return row(mo('⟨'), left, mo('|'), operator, mo('|'), right, mo('⟩'))
def parens(value): return row(mo('('), value, mo(')'))
def absolute(value): return row(mo('|'), value, mo('|'))
def matrix(rows): return row(mo('['), tag('mtable', *(tag('mtr', *(tag('mtd', cell) for cell in cells)) for cells in rows)), mo(']'))
def math(label, content, display='inline'):
    return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="'+display+'" aria-label="'+escape(label, quote=True)+'">'+row(content)+'</math>'


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
        self.parts=[];self.blocked=[]

    def handle_starttag(self,tag,attrs):
        self.parts.append(self.get_starttag_text())
        if tag in {'script','style','svg','math','head'}: self.blocked.append(tag)

    def handle_endtag(self,tag):
        self.parts.append('</'+tag+'>')
        if self.blocked and self.blocked[-1]==tag:self.blocked.pop()

    def handle_startendtag(self,tag,attrs):self.parts.append(self.get_starttag_text())
    def handle_data(self,data):self.parts.append(data if self.blocked else typeset_text(data))
    def handle_entityref(self,name):self.parts.append('&'+name+';')
    def handle_charref(self,name):self.parts.append('&#'+name+';')
    def handle_decl(self,decl):self.parts.append('<!'+decl+'>')
    def handle_comment(self,data):self.parts.append('<!--'+data+'-->')


def typeset_html(source):
    parser=Typesetter();parser.feed(source)
    return ''.join(parser.parts)
