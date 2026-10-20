"""Small, lossless HTML tree used by note authoring and validation tools."""
from html.parser import HTMLParser
import html

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
