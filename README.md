[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]
![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# log4

_(name may be subject to change)_

## Universal logger utility

**Configurable, environment and output agnostic, with implied log levels and namespacing ([debug](https://github.com/visionmedia/debug#debug) style) support**

### Usage

#### Writing logs

```javascript
// Default logger writes at 'debug' level
const log = require("log4");

// Log 'debug' level message:
log("some debug message %s", "injected string");

// It's nice to namespace logs (debug lib style) e.g.
log = log.get("my-lib");

// Log 'debug' level message in context of 'my-lib' namespace:
log("some debug message in 'my-lib' namespace context");

// Namespaces can be nested
log = log.get("func");
// Log 'debug' level message in context of 'my-lib:func' namespace:
log("some debug message in 'my-lib:func' namespace context");

// We may log to other than debug levels as follows
// Log 'error' level message in context of 'my-lib:func' namespace:
log.error("some error message");

// log output can be dynamically enabled/disabled during runtime
const { restore } = log.error.disable();
log.error("error message not really logged");
// To reliably restore previous state, we rely on provided `restore` function
restore(); // Bring back previous settings
log.error("error message to be logged");
```

##### Available log levels

Mirror of syslog, in severity order:

*   `debug` - debugging information
*   `info` - a purely informational message
*   `notice` - condition normal, but significant
*   `warning` - condition warning (can also be accessed through `warn` alias)
*   `error` - condition error
*   `critical` - condition critical
*   `alert` - immediate action required
*   `emergency` - system unusable

`warning` for convenience is also aliased at `log.warn`

##### Output message formatting

`log4` doesn't force any specific arguments handling. Still it is recommended to assume printf-like message
format, as preconfigured writers are setup to support it, with same placeholders as
those supported by Node.js [format](https://nodejs.org/api/util.html#util_util_format_format_args) util

Excerpt from Node.js documentation:

_The first argument is a string containing zero or more placeholder tokens. Each placeholder token is replaced with the converted value from the corresponding argument. Supported placeholders are:_

*   _`%s` - String._
*   _`%d` - Number (integer or floating point value)._
*   _`%i` - Integer._
*   _`%f` - Floating point value._
*   _`%j` - JSON. Replaced with the string '[Circular]' if the argument contains circular references._
*   _`%o` - Object. A string representation of an object with generic JavaScript object formatting. Similar to util.inspect() with options { showHidden: true, depth: 4, showProxy: true }. This will show the full object including non-enumerable symbols and properties._
*   _`%O` - Object. A string representation of an object with generic JavaScript object formatting. Similar to util.inspect() without options. This will show the full object not including non-enumerable symbols and properties._
*   _`%%` - single percent sign ('%'). This does not consume an argument._

**Note to log writer configuration developers**

For cross-env compatibiity it is advised to base implementation on [sprintf-kit](https://github.com/medikoo/sprintf-kit))

##### Enabling log writing

`log4` on its own doesn't write anything to the console on any other mean (it just emits events to be consumed by plugged in log writers)

To have logs written, the pre-chosen log writer needs to be initialized in main (starting) module of a process (refer to its documentation for more information).

List of available log writers

*   [`log4-nodejs`](https://github.com/medikoo/log4-nodejs) - For typical Node.js processes
*   [`log4-aws-lambda`](https://github.com/medikoo/log4-aws-lambda) - For AWS lambda environment

_Note: please add any missing writers via PR_

##### Logs Visibility

Default visibility depends on the enviroment (see chosen log writer for more information), and in most cases is setup through following environment variables:

###### `LOG_LEVEL`

(defaults to `warning`) Lowest log level from which all logs will be exposed.

###### `LOG_DEBUG`

Eventual list of namespaces to expose at levels below `LOG_LEVEL` threshold

List is comma separated as e.g. `foo,-foo:bar` (expose all `foo` but not `foo:bar`).

It follows convention configured within [debug](https://github.com/visionmedia/debug#windows-note). To ease eventual migration from [debug](https://github.com/visionmedia/debug), configuration is also read from `DEBUG` if `LOG_DEBUG` is not present.

### Tests

    $ npm test

Project cross-browser compatibility supported by:

<a href="https://browserstack.com"><img src="https://bstacksupport.zendesk.com/attachments/token/Pj5uf2x5GU9BvWErqAr51Jh2R/?name=browserstack-logo-600x315.png" height="150" /></a>

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/log4/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/log4
[win-build-image]: https://ci.appveyor.com/api/projects/status/i77xe4unnscrkews?svg=true
[win-build-url]: https://ci.appveyor.com/project/medikoo/log4
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/log4.svg
[cov-url]: https://codecov.io/gh/medikoo/log4
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/log4.svg
[npm-url]: https://www.npmjs.com/package/log4
