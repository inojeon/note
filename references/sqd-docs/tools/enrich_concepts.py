"""Apply the shared glossary to concept sources, then run build_concepts.py.

Edit docs/assets/concept-glossary.json for terminology and descriptions.
This command is idempotent; existing glossary markup is refreshed safely.
"""
from pathlib import Path
from html.parser import HTMLParser
import html
import json
import re
from concept_math import typeset_html

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Node:
    def __init__(self, tag='', attrs=(), children=None):
        self.tag, self.attrs, self.children = tag, dict(attrs), children or []
    def render(self):
        if not self.tag: return ''.join(render(c) for c in self.children)
        attrs = ''.join(' '+k+('' if v is None else '="'+html.escape(v,quote=True)+'"') for k,v in self.attrs.items())
        start = '<'+self.tag+attrs+'>'
        return start if self.tag in VOID else start+''.join(render(c) for c in self.children)+'</'+self.tag+'>'
def render(c): return c.render() if isinstance(c, Node) else c
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node(); self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        node=Node(tag,attrs);self.stack[-1].children.append(node)
        if tag not in VOID:self.stack.append(node)
    def handle_endtag(self, tag):
        assert self.stack[-1].tag == tag, (self.stack[-1].tag,tag)
        self.stack.pop()
    def handle_data(self, data):self.stack[-1].children.append(data)
    def handle_entityref(self,name):self.handle_data('&'+name+';')
    def handle_charref(self,name):self.handle_data('&#'+name+';')
    def handle_decl(self,decl):self.handle_data('<!'+decl+'>')
    def handle_comment(self,data):self.handle_data('<!--'+data+'-->')

def plain(node):
    return ''.join(plain(c) if isinstance(c,Node) else c for c in node.children)

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
    node.children=updated

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
aliases={'크릴로프 공간':'크릴로프 부분공간','랑초스':'랑초스 알고리즘','직교성':'직교',
         '순수 상태':'순수상태','혼합 상태':'혼합상태','복소 켤레':'켤레','복소켤레':'켤레',
         '복소켤레 전치':'켤레전치','들뜬 고유상태':'들뜬상태'}
lookup={e['term']:e for e in entries}
lookup.update({a:lookup[k] for a,k in aliases.items()})
pattern=re.compile('|'.join(re.escape(term)+(r'\('+re.escape(entry['english'])+r'\)' if len(term)==1 else r'(?:\('+re.escape(entry['english'])+r'\))?') for term,entry in sorted(lookup.items(),key=lambda x:len(x[0]),reverse=True)))
runtime=(ROOT/'docs/assets/concept-glossary.js').read_text()
summary={}
for path in sorted((ROOT/'docs').glob('concept-*.html')):
    parser=Parser();parser.feed(path.read_text());tree=parser.root;reset(tree)
    seen=set();panels=[];slug=path.stem.removeprefix('concept-')
    def walk(node):
        classes=node.attrs.get('class','').split()
        if node.tag in {'head','script','style','nav','a','h1','h2','h3','svg','math','button','summary'} or any(c in classes for c in ['meta','eyebrow','lead','formula','math-array','math-tex','term-hint']):return
        result=[]
        for c in node.children:
            if isinstance(c,Node):walk(c);result.append(c);continue
            def annotate(m):
                matched=m.group();term=next(k for k in sorted(lookup,key=len,reverse=True) if matched==k or matched.startswith(k+'('));entry=lookup[term]
                if entry['id'] in seen:return matched
                seen.add(entry['id']);ident='glossary-'+slug+'-'+entry['id'];label=term+'('+entry['english']+')'
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
