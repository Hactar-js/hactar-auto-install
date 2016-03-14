# Hactar Auto Installer

This plugin for [Hactar](https://github.com/Hactar-js) takes your JavaScript, scans it for import statements and then automatically installs dependencies. It doesn't use things like Webpack loaders, it parses your JavaScript directly.

![Imgur](http://i.imgur.com/d6uY23S.gifv)

## Installation

First install [Hactar](https://github.com/Hactar-js/hactar):

```sh
$ npm install -g hactar
```

Then run:

```sh
$ hactar --plugins hactar-auto-install
```

Go read up on [Hactar](https://github.com/Hactar-js/hactar) for more details

## Usage

Just run hactar:

```sh
$ hactar
```

And everything happens automatically :)

## Using it in another hactar plugin

Like all Hactar plugins, this one exports a saga, an ES6 generator that looks like this:

```js
function* saga(action, ch) {
  parseImports(action)
}
```

You can use it like this:

```js
import { saga as autoInstaller } from 'hactar-auto-install'

function* customPlugin(action, ch) {
  yield autoInstaller(action, ch)
}
```

See the [building a plugin docs](https://Hactar-js.github.io/hactar/building-a-plugin) for more examples and details

## Using it in a custom config file

If you have a custom Hactar config file (`hactar.config.js`) you can load the plugin like this:

```js
import autoInstaller from 'hactar-auto-install'
const plugins = [ autoInstaller ]
export { plugins }
```

See the [customization docs](https://Hactar-js.github.io/hactar/customization) for more examples and details

## Support

If you found this repo useful please consider supporting me on [Gratipay](https://gratipay.com/~k2052/), sending me some bitcoin `1csGsaDCFLRPPqugYjX93PEzaStuqXVMu`, or giving me lunch money via [Cash.me/$k2052](https://cash.me/$k2052) or [paypal.me/k2052](http://paypal.me/k2052)
