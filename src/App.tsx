import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  SandpackProvider,
  SandpackThemeProvider,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
} from '@codesandbox/sandpack-react'
import { convertLatexToHTML } from './html'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import 'katex/dist/katex.min.css'
import renderMathInElement from 'katex/dist/contrib/auto-render'
import katex from 'katex/dist/katex.mjs'

const files = {
  '/main.tex': `\\documentclass[article]
\\begin{document}
\\section{Introduction}

This is a paragraph

$$ E=mc^2 $$

\\end{document}`,
  '/example.tex': `hi`,
}

export default () => {
  const [html, setHTML] = useState<string>('')

  const compile = useCallback((state: EditorState) => {
    setHTML(convertLatexToHTML(state.doc.toString()))
  }, [])

  const renderedRef = useRef()

  useLayoutEffect(() => {
    if (renderedRef.current) {
      renderMathInElement(renderedRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
        ],
        //trust: true,
        //strict: false,
      })

      for (const element of renderedRef.current.querySelectorAll(
        '.display-math'
      )) {
        katex.render(element.textContent, element, {
          displayMode: true,
          throwOnError: false,
        })
      }

      for (const element of renderedRef.current.querySelectorAll(
        '.inline-math'
      )) {
        katex.render(element.textContent, element, {
          displayMode: false,
          throwOnError: false,
        })
      }
    }
  }, [renderedRef, html])

  const extensions = useMemo(
    () => [
      ViewPlugin.define((view) => {
        compile(view.state)
        return {}
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          compile(update.state)
        }
      }),
    ],
    []
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <SandpackProvider
          files={files}
          customSetup={{
            entry: '/main.tex',
          }}
        >
          <SandpackThemeProvider theme="light">
            <SandpackLayout>
              <SandpackFileExplorer />
              <SandpackCodeEditor
                showLineNumbers
                showTabs
                showRunButton
                wrapContent
                closableTabs
                extensions={extensions}
              />
            </SandpackLayout>
          </SandpackThemeProvider>
        </SandpackProvider>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <article
          dangerouslySetInnerHTML={{ __html: html }}
          className="prose lg:prose-xl prose-stone"
          style={{ margin: '1em' }}
          ref={renderedRef}
        />
      </div>
    </div>
  )
}
