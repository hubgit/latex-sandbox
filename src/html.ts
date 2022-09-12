import { convertToHtml } from '@unified-latex/unified-latex-to-hast'
import { processLatexToAstViaUnified } from '@unified-latex/unified-latex'

const processor = processLatexToAstViaUnified()

export const convertLatexToHTML = (latex: string) => {
  const ast = processor.parse(latex)
  return convertToHtml(ast)
}
