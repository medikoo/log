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
log = log.getNs("feat1");
// Log 'debug' level message in context of 'my-lib:feat1' namespace:
log("some debug message in 'my-lib:feat1' namespace context");

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

#### Configuring logging engine

Just by using main module, library, doesn't produce any log output. There's an exposed emitter at `log.emitter`
which emits all written logs, and on basis of that we may configure desired log output.

##### Node.js dedicated configuration

There's a predefined logger for Node.js environment, just require it on top of main module of your Node.js program, to see written logs:

```javascript
require("log4/env/node");
```

Node.js logger has configured in support for [string formatting](https://nodejs.org/docs/latest-v6.x/api/util.html#util_util_format_format_args). Performance wise it's better to rely on it instead of formatting objects to strings on spot:

```javascript
log("some object %o", obj);
```

Additionally visibility of logs is resolved on basis of env variables.

It follows convention configured
within [debug](https://github.com/visionmedia/debug#windows-note). Still visibility of each level is configured independently via `LOG_DEBUG`, `LOG_INFO`, `LOG_WARNING` etc. variables.  
To ease migration from [debug](https://github.com/visionmedia/debug) if `LOG_DEBUG` is not configured, then `debug` level configuration is read from `DEBUG` variable.

When no visibility is configured in env variables, defaults are that `debug` level logs are hidden and all others are exposed.

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
