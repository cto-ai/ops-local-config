import createDebug from 'debug'
import { join, isAbsolute } from 'path'
import fs from 'fs'
const { readFile, writeFile, rmdir } = fs.promises
const debug = createDebug('ops:local-config')

export const DIR_ERR = '@cto.ai/ops-local-config the `dir` option must be an absolute path string'

export default function localConfig ({ dir } = {}) {
  try {
    if (isAbsolute(dir) === false) throw Error(DIR_ERR)
  } catch {
    throw Error(DIR_ERR)
  }

  const configPath = join(dir, 'config.json')

  let cached = null

  async function read () {
    debug('reading config')
    try {
      if (cached) return cached
      const config = JSON.parse(await readFile(configPath))
      cached = config
      return config
    } catch (err) {
      if (err.code === 'ENOENT') debug(`No config file found at ${err.path}`)
      else debug('%O', err)
      return {}
    }
  }

  async function write (config) {
    debug('writing config')
    await writeFile(configPath, JSON.stringify(config))
    cached = config
    return config
  }

  async function clear () {
    debug('clearing config')
    await rmdir(configPath, { recursive: true })
    cached = null
  }

  return { read, write, clear }
}
