# @cto.ai/ops-local-config

> cto.ai library for managing local configuration settings

Creates, writes, reads and removes a `config.json` file from a specified directory.

## API

This is a native ESM module.

### `localConfig(opts) => instance`

**Options:**

* `dir` (`string`) *Required* - the configuration directory to store a `config.json` file in
* `name` (`string`) *Optional* - an alternative name for `config.json` (without the extension)


### `instance.read() => Promise => config`

Read and parse contents of the `config.json` file into an object.

### `instance.write(config)  => Promise => config`

Serialize and write a configuration object to the `config.json` file.

### `instance.clear() => Promise => undefined`

Removes the `config.json` file.

## Engines

* Node 12.4+
* Node 14.0+

## Development

Test:

```sh
npm test
```

Visual coverage report (run after test):

```sh
npm run cov
```

Lint:

```sh
npm run lint
```

Autoformat:

```sh
npm run lint -- --fix
```

## Releasing

For mainline releases:

```sh
npm version <major|minor|patch>
git push --follow-tags
```

For prereleases:

```sh
npm version prerelease
git push --follow-tags
```

### License

MIT
