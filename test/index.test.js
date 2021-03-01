import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { test } from 'tapx'
import localConfig, { DIR_ERR } from '../index.js'
const { mkdtemp, readFile, chmod, access } = fs.promises

test('localConfig throws if `dir` is not an absolute path', async ({ throws, doesNotThrow }) => {
  throws(() => localConfig(), Error(DIR_ERR))
  throws(() => localConfig({}), Error(DIR_ERR))
  throws(() => localConfig({ dir: false }), Error(DIR_ERR))
  throws(() => localConfig({ dir: null }), Error(DIR_ERR))
  throws(() => localConfig({ dir: '../' }), Error(DIR_ERR))
  throws(() => localConfig({ dir: './' }), Error(DIR_ERR))
  doesNotThrow(() => localConfig({ dir: '/foo/bar' }), Error(DIR_ERR))
})

test('write writes to {dir}/config.json', async ({ is }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const config = localConfig({ dir })
  const data = { user: { username: 'test', email: 'test@test.com', id: '123' } }
  await config.write(data)
  is(await readFile(join(dir, 'config.json')) + '', JSON.stringify(data))
})

test('write serialiation error propagates', async ({ rejects }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const config = localConfig({ dir })
  const data = { user: { username: 'test', email: 'test@test.com', id: '123' } }
  data.circle = data
  await rejects(config.write(data))
})

test('write filesystem error propagates', async ({ rejects }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const config = localConfig({ dir })
  const data = { user: { username: 'test', email: 'test@test.com', id: '123' } }
  await config.write(data)
  await chmod(join(dir, 'config.json'), 0o000)
  await rejects(config.write(data))
})

test('read reads from {dir}/config.json', async ({ same }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const data = { user: { username: 'test', email: 'test@test.com', id: '123' } }
  const config = localConfig({ dir })
  await config.write(data)
  same(await config.read(), data)
  const freshConfig = localConfig({ dir })
  same(await freshConfig.read(), data)
})

test('read returns empty config object in the case of a non-existent config.json file', async ({ same }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const config = localConfig({ dir })
  same(await config.read(), {})
})

test('read returns empty config object for any error', async ({ same }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const config = localConfig({ dir })
  const data = { user: { username: 'test', email: 'test@test.com', id: '123' } }
  await config.write(data)
  await chmod(join(dir, 'config.json'), 0o000)
  const freshConfig = localConfig({ dir })
  same(await freshConfig.read(), {})
})

test('read restores buffers from JSON {type: "Buffer", data: [...]} objects', async ({ same }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const data = { user: { username: 'test', email: Buffer.from('test@test.com'), id: '123', x: null } }
  const config = localConfig({ dir })
  await config.write(data)
  same(await config.read(), data)
  const freshConfig = localConfig({ dir })
  same(await freshConfig.read(), data)
})

test('clear removes {dir}/config.json', async ({ same, rejects }) => {
  const dir = await mkdtemp(join(tmpdir(), '-ops-local-config'))
  const config = localConfig({ dir })
  const data = { user: { username: 'test', email: 'test@test.com', id: '123' } }
  await config.write(data)
  same(await config.read(), data)
  await config.clear()
  same(await config.read(), {})
  await rejects(access(join(dir, 'config.json')))
})
