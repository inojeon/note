# KaTeX 0.18.4

CSS, fonts, JavaScript and the MIT LICENSE come from the official fixed npm tarball:
https://registry.npmjs.org/katex/-/katex-0.18.4.tgz

Hugo 0.168.0 produces static formula HTML and MathML during the build. CSS and fonts
are served locally. Only experiment bundles with `params.dynamic_math: true` load
the local JavaScript to render formulas whose coefficients change after user input.
No npm installation or CDN request is needed to author, build or read notes.
