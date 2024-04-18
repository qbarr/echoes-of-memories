import path from 'path'
import { parse } from './preprocessor.js'

const NOOP = () => true

const EXTS = ['.cjs', '.jsx', '.js', '.mjs', '.vue'].reduce((p, v) => ((p[v] = true), p), {})

let test = false
export function ifdefRollupPlugin(defines) {
  if (!defines) defines = {}
  if (!test) test = NOOP

  return {
    name: 'rollup-ifdef-plugin',
    enforce: 'pre',
    async transform(src, id) {
      if (!test(id)) return
      const ext = path.extname(id).split('?v')[0]
      if (!EXTS[ext]) return

      const verbose = false
      const tripleSlash = true
      const fillWithBlanks = true
      const uncommentPrefix = '/// #code'
      const filePath = id

      const source = parse(
		src,
		defines,
		verbose,
		tripleSlash,
		filePath,
		fillWithBlanks,
		uncommentPrefix
	)

      return { code: source, map: null }
    }
  }
}
