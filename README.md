[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]
![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# log

## Universal logging utility

**Configurable, environment and presentation agnostic, with log levels and namespacing ([debug](https://github.com/visionmedia/debug#debug) style) support**

### Usage

#### Writing logs

```javascript
// Default logger writes at 'debug' level
const log = require("log");

// Log 'debug' level message:
log("some debug message %s", "injected string");

// Get namespaced logger (debug lib style)
log = log.get("my-lib");

// Log 'debug' level message in context of 'my-lib' namespace:
log("some debug message in 'my-lib' namespace context");

// Namespaces can be nested
log = log.get("func");

// Log 'debug' level message in context of 'my-lib:func' namespace:
log("some debug message in 'my-lib:func' namespace context");

// Log 'error' level message in context of 'my-lib:func' namespace:
log.error("some error message");

// log output can be dynamically enabled/disabled during runtime
const { restore } = log.error.disable();
log.error("error message not really logged");
// Restore previous logs visibiity state
restore();
log.error("error message to be logged");
```

#### Available log levels

Mirror of syslog (in severity order):

-   `debug` - debugging information
-   `info` - a purely informational message
-   `notice` - condition normal, but significant
-   `warning` (also aliased as `warn`) - condition warning
-   `error` - condition error
-   `critical` - condition critical
-   `alert` - immediate action required
-   `emergency` - system unusable

#### Output message formatting

`log` doesn't force any specific arguments handling. Still it is recommended to assume [printf-like](https://en.wikipedia.org/wiki/Printf_format_string) message
format, as all currently available writers are setup to support it. Placeholders support reflects one implemented in Node.js [format](https://nodejs.org/api/util.html#util_util_format_format_args) util

Excerpt from Node.js documentation:

_The first argument is a string containing zero or more placeholder tokens. Each placeholder token is replaced with the converted value from the corresponding argument. Supported placeholders are:_

-   _`%s` - String._
-   _`%d` - Number (integer or floating point value)._
-   _`%i` - Integer._
-   _`%f` - Floating point value._
-   _`%j` - JSON. Replaced with the string '[Circular]' if the argument contains circular references._
-   _`%o` - Object. A string representation of an object with generic JavaScript object formatting. Similar to util.inspect() with options { showHidden: true, depth: 4, showProxy: true }. This will show the full object including non-enumerable symbols and properties._
-   _`%O` - Object. A string representation of an object with generic JavaScript object formatting. Similar to util.inspect() without options. This will show the full object not including non-enumerable symbols and properties._
-   _`%%` - single percent sign ('%'). This does not consume an argument._

_Note to log writer configuration developers: For cross-env compatibiity it is advised to base implementation on [sprintf-kit](https://github.com/medikoo/sprintf-kit)_

#### Enabling log writing

`log` on its own doesn't write anything to the console on any other mean (it just emits events to be consumed by preloaded log writers)

To have logs written, the pre-chosen log writer needs to be initialized in main (starting) module of a process.

##### List of available log writers

-   [`log-node`](https://github.com/medikoo/log-node) - For typical Node.js processes
-   [`log-aws-lambda`](https://github.com/medikoo/log-aws-lambda) - For AWS lambda environment

_Note: if some writer is missing, propose a PR_

#### Logs Visibility

Default visibility depends on the enviroment (see chosen log writer for more information), and in most cases is setup through following environment variables:

###### `LOG_LEVEL`

(defaults to `notice`) Lowest log level from which (upwards) all logs will be exposed.

###### `LOG_DEBUG`

Eventual list of namespaces to expose at levels below `LOG_LEVEL` threshold

List is comma separated as e.g. `foo,-foo:bar` (expose all `foo` but not `foo:bar`).

It follows convention configured within [debug](https://github.com/visionmedia/debug#windows-note). To ease eventual migration from [debug](https://github.com/visionmedia/debug), configuration fallbacks to `DEBUG` env var if `LOG_DEBUG` is not present.

### Tests

    $ npm test

Project cross-browser compatibility supported by:

<a href="https://browserstack.com"><img src="https://bstacksupport.zendesk.com/attachments/token/Pj5uf2x5GU9BvWErqAr51Jh2R/?name=browserstack-logo-600x315.png" height="150" /></a>

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/log/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/log
[win-build-image]: https://ci.appveyor.com/api/projects/status/i77xe4unnscrkews?svg=true
[win-build-url]: https://ci.appveyor.com/project/medikoo/log
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/log.svg
[cov-url]: https://codecov.io/gh/medikoo/log
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/log.svg
[npm-url]: https://www.npmjs.com/package/log
