[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]
![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# log4

_(name may be subject to change)_

## Universal logger utility

**Configurable, environment agnostic, with implied log levels and namespacing ([debug](https://github.com/visionmedia/debug#debug) style) support**

### Usage

#### Writing logs

```javascript
// Default logger refers to 'debug' log level
const log = require("log4");

// Log 'debug' level message:
log("some debug message", "other message token");

// It's a good practice to namespace your log messages (debug lib style) e.g.
log = log.getNs("my-lib");

// Log 'debug' level message in context of 'my-lib' namespace:
log("some debug message in 'my-lib' namespace context");

// Namespaces can be nested
log = log.getNs("func");
// Log 'debug' level message in context of 'my-lib:feat1' namespace:
log("some debug message in 'my-lib:func' namespace context");

// We may log to other than debug levels as follows
// Log 'error' level message in context of 'my-lib:feat1' namespace:
log.error("some error message");

// log output can be dynamically enabled/disabled during runtime
log.disable();
log("message that's not really logged");
log.enable();
log("logger is enabled again, this one should be seen");
```

##### Predefined log levels

Mirror of syslog:

*   `debug` - debugging information
*   `info` - a purely informational message
*   `notice` - condition normal, but significant
*   `warning` - condition warning (can also be accessed through `warn` alias)
*   `error` - condition error
*   `critical` - condition critical
*   `alert` - immediate action required
*   `emergency` - system unusable

Other custom level loggers (if needed) can be obtained via `getLevel` function:

```javascript
log.getLevel("custom");
```

##### String formatting

printf-like message format is supported, in same manner as it's in Node.js [format](https://nodejs.org/api/util.html#util_util_format_format_args) util, with same placeholders support.

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

**Note to log output configuration developers:**

Each log output configuration is expected to support above placeholders. For cross-env compatibiity it is advised to base implementation on [sprintf-kit](https://github.com/medikoo/sprintf-kit))

##### Logs Visibility

###### Environment variables

Default visibility depends on the enviroment (see log output engine for more information), and in most cases is setup through env variables.

Visibility of each level is configured independently via `LOG_DEBUG`, `LOG_INFO`, `LOG_WARNING` etc. variables. It follows convention configured
within [debug](https://github.com/visionmedia/debug#windows-note).

To ease migration from [debug](https://github.com/visionmedia/debug) if `LOG_DEBUG` is not configured, then `debug` level configuration is read from `DEBUG` variable.

When no visibility is configured in env variables, defaults are that `debug` level logs are hidden and all others are exposed.

###### Tweaking visiblity at runtime

Visiblity of each level and namespace can be tweaked at the runtime.

```javascript
// "my-lib" logger
const log = .getNs("my-lib");

// `log.isEnabled` Returns information on whether log is enabled or not
const wasLogEnabled = log.isEnabled;

// Through `log.enable()` and `log.disable()` we can tweak log visiblity at runtime
if (!wasLogEnabled) log.enable();

// Visiblity setting is inherited among child namespaces
log.getNs("some-func").isEnabled; // true

// Disabling visibility on parent, has no effect if child has it's own visiblity setting
require("log4").disable();
log.isEnabled; // true

if (!wasLogEnabled) log.disable(); // Revert to default
```

#### Configuring log output engine

`log4` library on its own, doesn't produce any log output, instead there's an exposed emitter at `log.emitter`
which emits all approached logs, and on basis of that real log output can be configured.

##### List of predefined log output writers

*   `log4-aws-lambda` - Dedicated AWS lambda environment writer
*   `log4-nodejs` - Dedicated Node.js environment writer

To ensure output, at top of main module that serves given environment, require desired log output writer

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
