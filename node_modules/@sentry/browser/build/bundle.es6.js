var Sentry = (function (exports) {
  'use strict';

  /** Console logging verbosity for the SDK. */
  var LogLevel;
  (function (LogLevel) {
      /** No logs will be generated. */
      LogLevel[LogLevel["None"] = 0] = "None";
      /** Only SDK internal errors will be logged. */
      LogLevel[LogLevel["Error"] = 1] = "Error";
      /** Information useful for debugging the SDK will be logged. */
      LogLevel[LogLevel["Debug"] = 2] = "Debug";
      /** All SDK actions will be logged. */
      LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
  })(LogLevel || (LogLevel = {}));

  /** JSDoc */
  (function (Severity) {
      /** JSDoc */
      Severity["Fatal"] = "fatal";
      /** JSDoc */
      Severity["Error"] = "error";
      /** JSDoc */
      Severity["Warning"] = "warning";
      /** JSDoc */
      Severity["Log"] = "log";
      /** JSDoc */
      Severity["Info"] = "info";
      /** JSDoc */
      Severity["Debug"] = "debug";
      /** JSDoc */
      Severity["Critical"] = "critical";
  })(exports.Severity || (exports.Severity = {}));
  // tslint:disable:completed-docs
  // tslint:disable:no-unnecessary-qualifier no-namespace
  (function (Severity) {
      /**
       * Converts a string-based level into a {@link Severity}.
       *
       * @param level string representation of Severity
       * @returns Severity
       */
      function fromString(level) {
          switch (level) {
              case 'debug':
                  return Severity.Debug;
              case 'info':
                  return Severity.Info;
              case 'warn':
              case 'warning':
                  return Severity.Warning;
              case 'error':
                  return Severity.Error;
              case 'fatal':
                  return Severity.Fatal;
              case 'critical':
                  return Severity.Critical;
              case 'log':
              default:
                  return Severity.Log;
          }
      }
      Severity.fromString = fromString;
  })(exports.Severity || (exports.Severity = {}));

  /** The status of an event. */
  (function (Status) {
      /** The status could not be determined. */
      Status["Unknown"] = "unknown";
      /** The event was skipped due to configuration or callbacks. */
      Status["Skipped"] = "skipped";
      /** The event was sent to Sentry successfully. */
      Status["Success"] = "success";
      /** The client is currently rate limited and will try again later. */
      Status["RateLimit"] = "rate_limit";
      /** The event could not be processed. */
      Status["Invalid"] = "invalid";
      /** A server-side error ocurred during submission. */
      Status["Failed"] = "failed";
  })(exports.Status || (exports.Status = {}));
  // tslint:disable:completed-docs
  // tslint:disable:no-unnecessary-qualifier no-namespace
  (function (Status) {
      /**
       * Converts a HTTP status code into a {@link Status}.
       *
       * @param code The HTTP response status code.
       * @returns The send status or {@link Status.Unknown}.
       */
      function fromHttpCode(code) {
          if (code >= 200 && code < 300) {
              return Status.Success;
          }
          if (code === 429) {
              return Status.RateLimit;
          }
          if (code >= 400 && code < 500) {
              return Status.Invalid;
          }
          if (code >= 500) {
              return Status.Failed;
          }
          return Status.Unknown;
      }
      Status.fromHttpCode = fromHttpCode;
  })(exports.Status || (exports.Status = {}));

  /**
   * Checks whether given value's type is one of a few Error or Error-like
   * {@link isError}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isError(wat) {
      switch (Object.prototype.toString.call(wat)) {
          case '[object Error]':
              return true;
          case '[object Exception]':
              return true;
          case '[object DOMException]':
              return true;
          default:
              return wat instanceof Error;
      }
  }
  /**
   * Checks whether given value's type is ErrorEvent
   * {@link isErrorEvent}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isErrorEvent(wat) {
      return Object.prototype.toString.call(wat) === '[object ErrorEvent]';
  }
  /**
   * Checks whether given value's type is DOMError
   * {@link isDOMError}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isDOMError(wat) {
      return Object.prototype.toString.call(wat) === '[object DOMError]';
  }
  /**
   * Checks whether given value's type is DOMException
   * {@link isDOMException}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isDOMException(wat) {
      return Object.prototype.toString.call(wat) === '[object DOMException]';
  }
  /**
   * Checks whether given value's type is a string
   * {@link isString}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isString(wat) {
      return Object.prototype.toString.call(wat) === '[object String]';
  }
  /**
   * Checks whether given value's is a primitive (undefined, null, number, boolean, string)
   * {@link isPrimitive}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isPrimitive(wat) {
      return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
  }
  /**
   * Checks whether given value's type is an object literal
   * {@link isPlainObject}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isPlainObject(wat) {
      return Object.prototype.toString.call(wat) === '[object Object]';
  }
  /**
   * Checks whether given value's type is an regexp
   * {@link isRegExp}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isRegExp(wat) {
      return Object.prototype.toString.call(wat) === '[object RegExp]';
  }
  /**
   * Checks whether given value has a then function.
   * @param wat A value to be checked.
   */
  function isThenable(wat) {
      // tslint:disable:no-unsafe-any
      return Boolean(wat && wat.then && typeof wat.then === 'function');
      // tslint:enable:no-unsafe-any
  }
  /**
   * Checks whether given value's type is a SyntheticEvent
   * {@link isSyntheticEvent}.
   *
   * @param wat A value to be checked.
   * @returns A boolean representing the result.
   */
  function isSyntheticEvent(wat) {
      // tslint:disable-next-line:no-unsafe-any
      return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
  }

  /**
   * Requires a module which is protected _against bundler minification.
   *
   * @param request The module path to resolve
   */
  function dynamicRequire(mod, request) {
      return mod.require(request);
  }
  /**
   * Checks whether we're in the Node.js or Browser environment
   *
   * @returns Answer to given question
   */
  function isNodeEnv() {
      // tslint:disable:strict-type-predicates
      return Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
  }
  const fallbackGlobalObject = {};
  /**
   * Safely get global scope object
   *
   * @returns Global scope object
   */
  // tslint:disable:strict-type-predicates
  function getGlobalObject() {
      return (isNodeEnv()
          ? global
          : typeof window !== 'undefined'
              ? window
              : typeof self !== 'undefined'
                  ? self
                  : fallbackGlobalObject);
  }
  /**
   * UUID4 generator
   *
   * @returns string Generated UUID4.
   */
  function uuid4() {
      const global = getGlobalObject();
      const crypto = global.crypto || global.msCrypto;
      if (!(crypto === void 0) && crypto.getRandomValues) {
          // Use window.crypto API if available
          const arr = new Uint16Array(8);
          crypto.getRandomValues(arr);
          // set 4 in byte 7
          // tslint:disable-next-line:no-bitwise
          arr[3] = (arr[3] & 0xfff) | 0x4000;
          // set 2 most significant bits of byte 9 to '10'
          // tslint:disable-next-line:no-bitwise
          arr[4] = (arr[4] & 0x3fff) | 0x8000;
          const pad = (num) => {
              let v = num.toString(16);
              while (v.length < 4) {
                  v = `0${v}`;
              }
              return v;
          };
          return (pad(arr[0]) + pad(arr[1]) + pad(arr[2]) + pad(arr[3]) + pad(arr[4]) + pad(arr[5]) + pad(arr[6]) + pad(arr[7]));
      }
      // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
      return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
          // tslint:disable-next-line:no-bitwise
          const r = (Math.random() * 16) | 0;
          // tslint:disable-next-line:no-bitwise
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
      });
  }
  /**
   * Given a child DOM element, returns a query-selector statement describing that
   * and its ancestors
   * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
   * @returns generated DOM path
   */
  function htmlTreeAsString(elem) {
      let currentElem = elem;
      const MAX_TRAVERSE_HEIGHT = 5;
      const MAX_OUTPUT_LEN = 80;
      const out = [];
      let height = 0;
      let len = 0;
      const separator = ' > ';
      const sepLength = separator.length;
      let nextStr;
      while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
          nextStr = htmlElementAsString(currentElem);
          // bail out if
          // - nextStr is the 'html' element
          // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
          //   (ignore this limit if we are on the first iteration)
          if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN)) {
              break;
          }
          out.push(nextStr);
          len += nextStr.length;
          currentElem = currentElem.parentNode;
      }
      return out.reverse().join(separator);
  }
  /**
   * Returns a simple, query-selector representation of a DOM element
   * e.g. [HTMLElement] => input#foo.btn[name=baz]
   * @returns generated DOM path
   */
  function htmlElementAsString(elem) {
      const out = [];
      let className;
      let classes;
      let key;
      let attr;
      let i;
      if (!elem || !elem.tagName) {
          return '';
      }
      out.push(elem.tagName.toLowerCase());
      if (elem.id) {
          out.push(`#${elem.id}`);
      }
      className = elem.className;
      if (className && isString(className)) {
          classes = className.split(/\s+/);
          for (i = 0; i < classes.length; i++) {
              out.push(`.${classes[i]}`);
          }
      }
      const attrWhitelist = ['type', 'name', 'title', 'alt'];
      for (i = 0; i < attrWhitelist.length; i++) {
          key = attrWhitelist[i];
          attr = elem.getAttribute(key);
          if (attr) {
              out.push(`[${key}="${attr}"]`);
          }
      }
      return out.join('');
  }
  /**
   * Parses string form of URL into an object
   * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
   * // intentionally using regex and not <a/> href parsing trick because React Native and other
   * // environments where DOM might not be available
   * @returns parsed URL object
   */
  function parseUrl(url) {
      if (!url) {
          return {};
      }
      const match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
      if (!match) {
          return {};
      }
      // coerce to undefined values to empty string so we don't get 'undefined'
      const query = match[6] || '';
      const fragment = match[8] || '';
      return {
          host: match[4],
          path: match[5],
          protocol: match[2],
          relative: match[5] + query + fragment,
      };
  }
  /**
   * Extracts either message or type+value from an event that can be used for user-facing logs
   * @returns event's description
   */
  function getEventDescription(event) {
      if (event.message) {
          return event.message;
      }
      if (event.exception && event.exception.values && event.exception.values[0]) {
          const exception = event.exception.values[0];
          if (exception.type && exception.value) {
              return `${exception.type}: ${exception.value}`;
          }
          return exception.type || exception.value || event.event_id || '<unknown>';
      }
      return event.event_id || '<unknown>';
  }
  /** JSDoc */
  function consoleSandbox(callback) {
      const global = getGlobalObject();
      const levels = ['debug', 'info', 'warn', 'error', 'log'];
      if (!('console' in global)) {
          return callback();
      }
      const originalConsole = global.console;
      const wrappedLevels = {};
      // Restore all wrapped console methods
      levels.forEach(level => {
          if (level in global.console && originalConsole[level].__sentry__) {
              wrappedLevels[level] = originalConsole[level].__sentry_wrapped__;
              originalConsole[level] = originalConsole[level].__sentry_original__;
          }
      });
      // Perform callback manipulations
      const result = callback();
      // Revert restoration to wrapped state
      Object.keys(wrappedLevels).forEach(level => {
          originalConsole[level] = wrappedLevels[level];
      });
      return result;
  }
  /**
   * Adds exception values, type and value to an synthetic Exception.
   * @param event The event to modify.
   * @param value Value of the exception.
   * @param type Type of the exception.
   * @param mechanism Mechanism of the exception.
   * @hidden
   */
  function addExceptionTypeValue(event, value, type, mechanism = {
      handled: true,
      type: 'generic',
  }) {
      event.exception = event.exception || {};
      event.exception.values = event.exception.values || [];
      event.exception.values[0] = event.exception.values[0] || {};
      event.exception.values[0].value = event.exception.values[0].value || value || '';
      event.exception.values[0].type = event.exception.values[0].type || type || 'Error';
      event.exception.values[0].mechanism = event.exception.values[0].mechanism || mechanism;
  }

  // tslint:disable:no-unsafe-any
  /**
   * Memo class used for decycle json objects. Uses WeakSet if available otherwise array.
   */
  class Memo {
      constructor() {
          // tslint:disable-next-line
          this._hasWeakSet = typeof WeakSet === 'function';
          this._inner = this._hasWeakSet ? new WeakSet() : [];
      }
      /**
       * Sets obj to remember.
       * @param obj Object to remember
       */
      memoize(obj) {
          if (this._hasWeakSet) {
              if (this._inner.has(obj)) {
                  return true;
              }
              this._inner.add(obj);
              return false;
          }
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < this._inner.length; i++) {
              const value = this._inner[i];
              if (value === obj) {
                  return true;
              }
          }
          this._inner.push(obj);
          return false;
      }
      /**
       * Removes object from internal storage.
       * @param obj Object to forget
       */
      unmemoize(obj) {
          if (this._hasWeakSet) {
              this._inner.delete(obj);
          }
          else {
              for (let i = 0; i < this._inner.length; i++) {
                  if (this._inner[i] === obj) {
                      this._inner.splice(i, 1);
                      break;
                  }
              }
          }
      }
  }

  /**
   * Wrap a given object method with a higher-order function
   *
   * @param source An object that contains a method to be wrapped.
   * @param name A name of method to be wrapped.
   * @param replacement A function that should be used to wrap a given method.
   * @returns void
   */
  function fill(source, name, replacement) {
      if (!(name in source) || source[name].__sentry__) {
          return;
      }
      const original = source[name];
      const wrapped = replacement(original);
      // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
      // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
      // tslint:disable-next-line:strict-type-predicates
      if (typeof wrapped === 'function') {
          wrapped.prototype = wrapped.prototype || {};
          Object.defineProperties(wrapped, {
              __sentry__: {
                  enumerable: false,
                  value: true,
              },
              __sentry_original__: {
                  enumerable: false,
                  value: original,
              },
              __sentry_wrapped__: {
                  enumerable: false,
                  value: wrapped,
              },
          });
      }
      source[name] = wrapped;
  }
  /**
   * Encodes given object into url-friendly format
   *
   * @param object An object that contains serializable values
   * @returns string Encoded
   */
  function urlEncode(object) {
      return Object.keys(object)
          .map(
      // tslint:disable-next-line:no-unsafe-any
      key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`)
          .join('&');
  }
  /**
   * Transforms Error object into an object literal with all it's attributes
   * attached to it.
   *
   * Based on: https://github.com/ftlabs/js-abbreviate/blob/fa709e5f139e7770a71827b1893f22418097fbda/index.js#L95-L106
   *
   * @param error An Error containing all relevant information
   * @returns An object with all error properties
   */
  function objectifyError(error) {
      // These properties are implemented as magical getters and don't show up in `for-in` loop
      const err = {
          message: error.message,
          name: error.name,
          stack: error.stack,
      };
      for (const i in error) {
          if (Object.prototype.hasOwnProperty.call(error, i)) {
              err[i] = error[i];
          }
      }
      return err;
  }
  /** Calculates bytes size of input string */
  function utf8Length(value) {
      // tslint:disable-next-line:no-bitwise
      return ~-encodeURI(value).split(/%..|./).length;
  }
  /** Calculates bytes size of input object */
  function jsonSize(value) {
      return utf8Length(JSON.stringify(value));
  }
  /** JSDoc */
  function normalizeToSize(object, 
  // Default Node.js REPL depth
  depth = 3, 
  // 100kB, as 200kB is max payload size, so half sounds reasonable
  maxSize = 100 * 1024) {
      const serialized = normalize(object, depth);
      if (jsonSize(serialized) > maxSize) {
          return normalizeToSize(object, depth - 1, maxSize);
      }
      return serialized;
  }
  /** Transforms any input value into a string form, either primitive value or a type of the input */
  function serializeValue(value) {
      const type = Object.prototype.toString.call(value);
      // Node.js REPL notation
      if (typeof value === 'string') {
          return value;
      }
      if (type === '[object Object]') {
          return '[Object]';
      }
      if (type === '[object Array]') {
          return '[Array]';
      }
      const normalized = normalizeValue(value);
      return isPrimitive(normalized) ? normalized : type;
  }
  /**
   * normalizeValue()
   *
   * Takes unserializable input and make it serializable friendly
   *
   * - translates undefined/NaN values to "[undefined]"/"[NaN]" respectively,
   * - serializes Error objects
   * - filter global objects
   */
  function normalizeValue(value, key) {
      if (key === 'domain' && typeof value === 'object' && value._events) {
          return '[Domain]';
      }
      if (key === 'domainEmitter') {
          return '[DomainEmitter]';
      }
      if (typeof global !== 'undefined' && value === global) {
          return '[Global]';
      }
      if (typeof window !== 'undefined' && value === window) {
          return '[Window]';
      }
      if (typeof document !== 'undefined' && value === document) {
          return '[Document]';
      }
      // tslint:disable-next-line:strict-type-predicates
      if (typeof Event !== 'undefined' && value instanceof Event) {
          return Object.getPrototypeOf(value) ? value.constructor.name : 'Event';
      }
      // React's SyntheticEvent thingy
      if (isSyntheticEvent(value)) {
          return '[SyntheticEvent]';
      }
      if (Number.isNaN(value)) {
          return '[NaN]';
      }
      if (value === void 0) {
          return '[undefined]';
      }
      if (typeof value === 'function') {
          return `[Function: ${value.name || '<unknown-function-name>'}]`;
      }
      return value;
  }
  /**
   * Walks an object to perform a normalization on it
   *
   * @param key of object that's walked in current iteration
   * @param value object to be walked
   * @param depth Optional number indicating how deep should walking be performed
   * @param memo Optional Memo class handling decycling
   */
  function walk(key, value, depth = +Infinity, memo = new Memo()) {
      // If we reach the maximum depth, serialize whatever has left
      if (depth === 0) {
          return serializeValue(value);
      }
      // If value implements `toJSON` method, call it and return early
      // tslint:disable:no-unsafe-any
      if (value !== null && value !== undefined && typeof value.toJSON === 'function') {
          return value.toJSON();
      }
      // tslint:enable:no-unsafe-any
      // If normalized value is a primitive, there are no branches left to walk, so we can just bail out, as theres no point in going down that branch any further
      const normalized = normalizeValue(value, key);
      if (isPrimitive(normalized)) {
          return normalized;
      }
      // Create source that we will use for next itterations, either objectified error object (Error type with extracted keys:value pairs) or the input itself
      const source = (isError(value) ? objectifyError(value) : value);
      // Create an accumulator that will act as a parent for all future itterations of that branch
      const acc = Array.isArray(value) ? [] : {};
      // If we already walked that branch, bail out, as it's circular reference
      if (memo.memoize(value)) {
          return '[Circular ~]';
      }
      // Walk all keys of the source
      for (const innerKey in source) {
          // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
          if (!Object.prototype.hasOwnProperty.call(source, innerKey)) {
              continue;
          }
          // Recursively walk through all the child nodes
          acc[innerKey] = walk(innerKey, source[innerKey], depth - 1, memo);
      }
      // Once walked through all the branches, remove the parent from memo storage
      memo.unmemoize(value);
      // Return accumulated values
      return acc;
  }
  /**
   * normalize()
   *
   * - Creates a copy to prevent original input mutation
   * - Skip non-enumerablers
   * - Calls `toJSON` if implemented
   * - Removes circular references
   * - Translates non-serializeable values (undefined/NaN/Functions) to serializable format
   * - Translates known global objects/Classes to a string representations
   * - Takes care of Error objects serialization
   * - Optionally limit depth of final output
   */
  function normalize(input, depth) {
      try {
          // tslint:disable-next-line:no-unsafe-any
          return JSON.parse(JSON.stringify(input, (key, value) => walk(key, value, depth)));
      }
      catch (_oO) {
          return '**non-serializable**';
      }
  }

  /** JSDoc */
  var States;
  (function (States) {
      /** JSDoc */
      States["PENDING"] = "PENDING";
      /** JSDoc */
      States["RESOLVED"] = "RESOLVED";
      /** JSDoc */
      States["REJECTED"] = "REJECTED";
  })(States || (States = {}));
  /** JSDoc */
  class SyncPromise {
      constructor(callback) {
          /** JSDoc */
          this._state = States.PENDING;
          /** JSDoc */
          this._handlers = [];
          /** JSDoc */
          this._resolve = (value) => {
              this._setResult(value, States.RESOLVED);
          };
          /** JSDoc */
          this._reject = (reason) => {
              this._setResult(reason, States.REJECTED);
          };
          /** JSDoc */
          this._setResult = (value, state) => {
              if (this._state !== States.PENDING) {
                  return;
              }
              if (isThenable(value)) {
                  value.then(this._resolve, this._reject);
                  return;
              }
              this._value = value;
              this._state = state;
              this._executeHandlers();
          };
          /** JSDoc */
          this._executeHandlers = () => {
              if (this._state === States.PENDING) {
                  return;
              }
              if (this._state === States.REJECTED) {
                  // tslint:disable-next-line:no-unsafe-any
                  this._handlers.forEach(h => h.onFail && h.onFail(this._value));
              }
              else {
                  // tslint:disable-next-line:no-unsafe-any
                  this._handlers.forEach(h => h.onSuccess && h.onSuccess(this._value));
              }
              this._handlers = [];
              return;
          };
          /** JSDoc */
          this._attachHandler = (handler) => {
              this._handlers = this._handlers.concat(handler);
              this._executeHandlers();
          };
          try {
              callback(this._resolve, this._reject);
          }
          catch (e) {
              this._reject(e);
          }
      }
      /** JSDoc */
      then(onfulfilled, onrejected) {
          // public then<U>(onSuccess?: HandlerOnSuccess<T, U>, onFail?: HandlerOnFail<U>): SyncPromise<T | U> {
          return new SyncPromise((resolve, reject) => {
              this._attachHandler({
                  onFail: reason => {
                      if (!onrejected) {
                          reject(reason);
                          return;
                      }
                      try {
                          resolve(onrejected(reason));
                          return;
                      }
                      catch (e) {
                          reject(e);
                          return;
                      }
                  },
                  onSuccess: result => {
                      if (!onfulfilled) {
                          resolve(result);
                          return;
                      }
                      try {
                          resolve(onfulfilled(result));
                          return;
                      }
                      catch (e) {
                          reject(e);
                          return;
                      }
                  },
              });
          });
      }
      /** JSDoc */
      catch(onFail) {
          // tslint:disable-next-line:no-unsafe-any
          return this.then((val) => val, onFail);
      }
      /** JSDoc */
      toString() {
          return `[object SyncPromise]`;
      }
      /** JSDoc */
      static resolve(value) {
          return new SyncPromise(resolve => {
              resolve(value);
          });
      }
      /** JSDoc */
      static reject(reason) {
          return new SyncPromise((_, reject) => {
              reject(reason);
          });
      }
  }

  /**
   * Holds additional event information. {@link Scope.applyToEvent} will be
   * called by the client before an event will be sent.
   */
  class Scope {
      constructor() {
          /** Flag if notifiying is happening. */
          this._notifyingListeners = false;
          /** Callback for client to receive scope changes. */
          this._scopeListeners = [];
          /** Callback list that will be called after {@link applyToEvent}. */
          this._eventProcessors = [];
          /** Array of breadcrumbs. */
          this._breadcrumbs = [];
          /** User */
          this._user = {};
          /** Tags */
          this._tags = {};
          /** Extra */
          this._extra = {};
      }
      /**
       * Add internal on change listener. Used for sub SDKs that need to store the scope.
       * @hidden
       */
      addScopeListener(callback) {
          this._scopeListeners.push(callback);
      }
      /**
       * @inheritDoc
       */
      addEventProcessor(callback) {
          this._eventProcessors.push(callback);
          return this;
      }
      /**
       * This will be called on every set call.
       */
      _notifyScopeListeners() {
          if (!this._notifyingListeners) {
              this._notifyingListeners = true;
              setTimeout(() => {
                  this._scopeListeners.forEach(callback => {
                      callback(this);
                  });
                  this._notifyingListeners = false;
              });
          }
      }
      /**
       * This will be called after {@link applyToEvent} is finished.
       */
      _notifyEventProcessors(processors, event, hint, index = 0) {
          return new SyncPromise((resolve, reject) => {
              const processor = processors[index];
              // tslint:disable-next-line:strict-type-predicates
              if (event === null || typeof processor !== 'function') {
                  resolve(event);
              }
              else {
                  const result = processor(Object.assign({}, event), hint);
                  if (isThenable(result)) {
                      result
                          .then(final => this._notifyEventProcessors(processors, final, hint, index + 1).then(resolve))
                          .catch(reject);
                  }
                  else {
                      this._notifyEventProcessors(processors, result, hint, index + 1)
                          .then(resolve)
                          .catch(reject);
                  }
              }
          });
      }
      /**
       * @inheritDoc
       */
      setUser(user) {
          this._user = normalize(user);
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      setTags(tags) {
          this._tags = Object.assign({}, this._tags, normalize(tags));
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      setTag(key, value) {
          this._tags = Object.assign({}, this._tags, { [key]: normalize(value) });
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      setExtras(extra) {
          this._extra = Object.assign({}, this._extra, normalize(extra));
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      setExtra(key, extra) {
          this._extra = Object.assign({}, this._extra, { [key]: normalize(extra) });
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      setFingerprint(fingerprint) {
          this._fingerprint = normalize(fingerprint);
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      setLevel(level) {
          this._level = normalize(level);
          this._notifyScopeListeners();
          return this;
      }
      /**
       * Inherit values from the parent scope.
       * @param scope to clone.
       */
      static clone(scope) {
          const newScope = new Scope();
          Object.assign(newScope, scope, {
              _scopeListeners: [],
          });
          if (scope) {
              newScope._breadcrumbs = [...scope._breadcrumbs];
              newScope._tags = Object.assign({}, scope._tags);
              newScope._extra = Object.assign({}, scope._extra);
              newScope._user = scope._user;
              newScope._level = scope._level;
              newScope._fingerprint = scope._fingerprint;
              newScope._eventProcessors = [...scope._eventProcessors];
          }
          return newScope;
      }
      /**
       * @inheritDoc
       */
      clear() {
          this._breadcrumbs = [];
          this._tags = {};
          this._extra = {};
          this._user = {};
          this._level = undefined;
          this._fingerprint = undefined;
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      addBreadcrumb(breadcrumb, maxBreadcrumbs) {
          this._breadcrumbs =
              maxBreadcrumbs !== undefined && maxBreadcrumbs >= 0
                  ? [...this._breadcrumbs, normalize(breadcrumb)].slice(-maxBreadcrumbs)
                  : [...this._breadcrumbs, normalize(breadcrumb)];
          this._notifyScopeListeners();
          return this;
      }
      /**
       * @inheritDoc
       */
      clearBreadcrumbs() {
          this._breadcrumbs = [];
          this._notifyScopeListeners();
          return this;
      }
      /**
       * Applies fingerprint from the scope to the event if there's one,
       * uses message if there's one instead or get rid of empty fingerprint
       */
      _applyFingerprint(event) {
          // Make sure it's an array first and we actually have something in place
          event.fingerprint = event.fingerprint
              ? Array.isArray(event.fingerprint)
                  ? event.fingerprint
                  : [event.fingerprint]
              : [];
          // If we have something on the scope, then merge it with event
          if (this._fingerprint) {
              event.fingerprint = event.fingerprint.concat(this._fingerprint);
          }
          // If we have no data at all, remove empty array default
          if (event.fingerprint && !event.fingerprint.length) {
              delete event.fingerprint;
          }
      }
      /**
       * Applies the current context and fingerprint to the event.
       * Note that breadcrumbs will be added by the client.
       * Also if the event has already breadcrumbs on it, we do not merge them.
       * @param event Event
       * @param hint May contain additional informartion about the original exception.
       * @param maxBreadcrumbs number of max breadcrumbs to merged into event.
       * @hidden
       */
      applyToEvent(event, hint) {
          if (this._extra && Object.keys(this._extra).length) {
              event.extra = Object.assign({}, this._extra, event.extra);
          }
          if (this._tags && Object.keys(this._tags).length) {
              event.tags = Object.assign({}, this._tags, event.tags);
          }
          if (this._user && Object.keys(this._user).length) {
              event.user = Object.assign({}, this._user, event.user);
          }
          if (this._level) {
              event.level = this._level;
          }
          this._applyFingerprint(event);
          const hasNoBreadcrumbs = !event.breadcrumbs || event.breadcrumbs.length === 0;
          if (hasNoBreadcrumbs && this._breadcrumbs.length > 0) {
              event.breadcrumbs = this._breadcrumbs;
          }
          return this._notifyEventProcessors([...getGlobalEventProcessors(), ...this._eventProcessors], event, hint);
      }
  }
  /**
   * Retruns the global event processors.
   */
  function getGlobalEventProcessors() {
      const global = getGlobalObject();
      global.__SENTRY__ = global.__SENTRY__ || {};
      global.__SENTRY__.globalEventProcessors = global.__SENTRY__.globalEventProcessors || [];
      return global.__SENTRY__.globalEventProcessors;
  }
  /**
   * Add a EventProcessor to be kept globally.
   * @param callback EventProcessor to add
   */
  function addGlobalEventProcessor(callback) {
      getGlobalEventProcessors().push(callback);
  }

  // TODO: Implement different loggers for different environments
  const global$1 = getGlobalObject();
  /** Prefix for logging strings */
  const PREFIX = 'Sentry Logger ';
  /** JSDoc */
  class Logger {
      /** JSDoc */
      constructor() {
          this._enabled = false;
      }
      /** JSDoc */
      disable() {
          this._enabled = false;
      }
      /** JSDoc */
      enable() {
          this._enabled = true;
      }
      /** JSDoc */
      log(...args) {
          if (!this._enabled) {
              return;
          }
          consoleSandbox(() => {
              global$1.console.log(`${PREFIX}[Log]: ${args.join(' ')}`); // tslint:disable-line:no-console
          });
      }
      /** JSDoc */
      warn(...args) {
          if (!this._enabled) {
              return;
          }
          consoleSandbox(() => {
              global$1.console.warn(`${PREFIX}[Warn]: ${args.join(' ')}`); // tslint:disable-line:no-console
          });
      }
      /** JSDoc */
      error(...args) {
          if (!this._enabled) {
              return;
          }
          consoleSandbox(() => {
              global$1.console.error(`${PREFIX}[Error]: ${args.join(' ')}`); // tslint:disable-line:no-console
          });
      }
  }
  // Ensure we only have a single logger instance, even if multiple versions of @sentry/utils are being used
  global$1.__SENTRY__ = global$1.__SENTRY__ || {};
  const logger = global$1.__SENTRY__.logger || (global$1.__SENTRY__.logger = new Logger());

  /**
   * API compatibility version of this hub.
   *
   * WARNING: This number should only be incresed when the global interface
   * changes a and new methods are introduced.
   *
   * @hidden
   */
  const API_VERSION = 3;
  /**
   * Default maximum number of breadcrumbs added to an event. Can be overwritten
   * with {@link Options.maxBreadcrumbs}.
   */
  const DEFAULT_BREADCRUMBS = 30;
  /**
   * Absolute maximum number of breadcrumbs added to an event. The
   * `maxBreadcrumbs` option cannot be higher than this value.
   */
  const MAX_BREADCRUMBS = 100;
  /**
   * @inheritDoc
   */
  class Hub {
      /**
       * Creates a new instance of the hub, will push one {@link Layer} into the
       * internal stack on creation.
       *
       * @param client bound to the hub.
       * @param scope bound to the hub.
       * @param version number, higher number means higher priority.
       */
      constructor(client, scope = new Scope(), _version = API_VERSION) {
          this._version = _version;
          /** Is a {@link Layer}[] containing the client and scope */
          this._stack = [];
          this._stack.push({ client, scope });
      }
      /**
       * Internal helper function to call a method on the top client if it exists.
       *
       * @param method The method to call on the client.
       * @param args Arguments to pass to the client function.
       */
      _invokeClient(method, ...args) {
          const top = this.getStackTop();
          if (top && top.client && top.client[method]) {
              top.client[method](...args, top.scope);
          }
      }
      /**
       * @inheritDoc
       */
      isOlderThan(version) {
          return this._version < version;
      }
      /**
       * @inheritDoc
       */
      bindClient(client) {
          const top = this.getStackTop();
          top.client = client;
      }
      /**
       * @inheritDoc
       */
      pushScope() {
          // We want to clone the content of prev scope
          const stack = this.getStack();
          const parentScope = stack.length > 0 ? stack[stack.length - 1].scope : undefined;
          const scope = Scope.clone(parentScope);
          this.getStack().push({
              client: this.getClient(),
              scope,
          });
          return scope;
      }
      /**
       * @inheritDoc
       */
      popScope() {
          return this.getStack().pop() !== undefined;
      }
      /**
       * @inheritDoc
       */
      withScope(callback) {
          const scope = this.pushScope();
          try {
              callback(scope);
          }
          finally {
              this.popScope();
          }
      }
      /**
       * @inheritDoc
       */
      getClient() {
          return this.getStackTop().client;
      }
      /** Returns the scope of the top stack. */
      getScope() {
          return this.getStackTop().scope;
      }
      /** Returns the scope stack for domains or the process. */
      getStack() {
          return this._stack;
      }
      /** Returns the topmost scope layer in the order domain > local > process. */
      getStackTop() {
          return this._stack[this._stack.length - 1];
      }
      /**
       * @inheritDoc
       */
      captureException(exception, hint) {
          const eventId = (this._lastEventId = uuid4());
          this._invokeClient('captureException', exception, Object.assign({}, hint, { event_id: eventId }));
          return eventId;
      }
      /**
       * @inheritDoc
       */
      captureMessage(message, level, hint) {
          const eventId = (this._lastEventId = uuid4());
          this._invokeClient('captureMessage', message, level, Object.assign({}, hint, { event_id: eventId }));
          return eventId;
      }
      /**
       * @inheritDoc
       */
      captureEvent(event, hint) {
          const eventId = (this._lastEventId = uuid4());
          this._invokeClient('captureEvent', event, Object.assign({}, hint, { event_id: eventId }));
          return eventId;
      }
      /**
       * @inheritDoc
       */
      lastEventId() {
          return this._lastEventId;
      }
      /**
       * @inheritDoc
       */
      addBreadcrumb(breadcrumb, hint) {
          const top = this.getStackTop();
          if (!top.scope || !top.client) {
              return;
          }
          const { beforeBreadcrumb, maxBreadcrumbs = DEFAULT_BREADCRUMBS } = top.client.getOptions();
          if (maxBreadcrumbs <= 0) {
              return;
          }
          const timestamp = new Date().getTime() / 1000;
          const mergedBreadcrumb = Object.assign({ timestamp }, breadcrumb);
          const finalBreadcrumb = beforeBreadcrumb
              ? consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint))
              : mergedBreadcrumb;
          if (finalBreadcrumb === null) {
              return;
          }
          top.scope.addBreadcrumb(finalBreadcrumb, Math.min(maxBreadcrumbs, MAX_BREADCRUMBS));
      }
      /**
       * @inheritDoc
       */
      configureScope(callback) {
          const top = this.getStackTop();
          if (top.scope && top.client) {
              // TODO: freeze flag
              callback(top.scope);
          }
      }
      /**
       * @inheritDoc
       */
      run(callback) {
          const oldHub = makeMain(this);
          try {
              callback(this);
          }
          finally {
              makeMain(oldHub);
          }
      }
      /**
       * @inheritDoc
       */
      getIntegration(integration) {
          const client = this.getClient();
          if (!client) {
              return null;
          }
          try {
              return client.getIntegration(integration);
          }
          catch (_oO) {
              logger.warn(`Cannot retrieve integration ${integration.id} from the current Hub`);
              return null;
          }
      }
  }
  /** Returns the global shim registry. */
  function getMainCarrier() {
      const carrier = getGlobalObject();
      carrier.__SENTRY__ = carrier.__SENTRY__ || {
          hub: undefined,
      };
      return carrier;
  }
  /**
   * Replaces the current main hub with the passed one on the global object
   *
   * @returns The old replaced hub
   */
  function makeMain(hub) {
      const registry = getMainCarrier();
      const oldHub = getHubFromCarrier(registry);
      setHubOnCarrier(registry, hub);
      return oldHub;
  }
  /**
   * Returns the default hub instance.
   *
   * If a hub is already registered in the global carrier but this module
   * contains a more recent version, it replaces the registered version.
   * Otherwise, the currently registered hub will be returned.
   */
  function getCurrentHub() {
      // Get main carrier (global for every environment)
      const registry = getMainCarrier();
      // If there's no hub, or its an old API, assign a new one
      if (!hasHubOnCarrier(registry) || getHubFromCarrier(registry).isOlderThan(API_VERSION)) {
          setHubOnCarrier(registry, new Hub());
      }
      // Prefer domains over global if they are there
      try {
          // We need to use `dynamicRequire` because `require` on it's own will be optimized by webpack.
          // We do not want this to happen, we need to try to `require` the domain node module and fail if we are in browser
          // for example so we do not have to shim it and use `getCurrentHub` universally.
          const domain = dynamicRequire(module, 'domain');
          const activeDomain = domain.active;
          // If there no active domain, just return global hub
          if (!activeDomain) {
              return getHubFromCarrier(registry);
          }
          // If there's no hub on current domain, or its an old API, assign a new one
          if (!hasHubOnCarrier(activeDomain) || getHubFromCarrier(activeDomain).isOlderThan(API_VERSION)) {
              const registryHubTopStack = getHubFromCarrier(registry).getStackTop();
              setHubOnCarrier(activeDomain, new Hub(registryHubTopStack.client, Scope.clone(registryHubTopStack.scope)));
          }
          // Return hub that lives on a domain
          return getHubFromCarrier(activeDomain);
      }
      catch (_Oo) {
          // Return hub that lives on a global object
          return getHubFromCarrier(registry);
      }
  }
  /**
   * This will tell whether a carrier has a hub on it or not
   * @param carrier object
   */
  function hasHubOnCarrier(carrier) {
      if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
          return true;
      }
      return false;
  }
  /**
   * This will create a new {@link Hub} and add to the passed object on
   * __SENTRY__.hub.
   * @param carrier object
   * @hidden
   */
  function getHubFromCarrier(carrier) {
      if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
          return carrier.__SENTRY__.hub;
      }
      carrier.__SENTRY__ = carrier.__SENTRY__ || {};
      carrier.__SENTRY__.hub = new Hub();
      return carrier.__SENTRY__.hub;
  }
  /**
   * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
   * @param carrier object
   * @param hub Hub
   */
  function setHubOnCarrier(carrier, hub) {
      if (!carrier) {
          return false;
      }
      carrier.__SENTRY__ = carrier.__SENTRY__ || {};
      carrier.__SENTRY__.hub = hub;
      return true;
  }

  /**
   * This calls a function on the current hub.
   * @param method function to call on hub.
   * @param args to pass to function.
   */
  function callOnHub(method, ...args) {
      const hub = getCurrentHub();
      if (hub && hub[method]) {
          // tslint:disable-next-line:no-unsafe-any
          return hub[method](...args);
      }
      throw new Error(`No hub defined or ${method} was not found on the hub, please open a bug report.`);
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * @param exception An exception-like object.
   * @returns The generated eventId.
   */
  function captureException(exception) {
      let syntheticException;
      try {
          throw new Error('Sentry syntheticException');
      }
      catch (exception) {
          syntheticException = exception;
      }
      return callOnHub('captureException', exception, {
          originalException: exception,
          syntheticException,
      });
  }
  /**
   * Captures a message event and sends it to Sentry.
   *
   * @param message The message to send to Sentry.
   * @param level Define the level of the message.
   * @returns The generated eventId.
   */
  function captureMessage(message, level) {
      let syntheticException;
      try {
          throw new Error(message);
      }
      catch (exception) {
          syntheticException = exception;
      }
      return callOnHub('captureMessage', message, level, {
          originalException: message,
          syntheticException,
      });
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * @param event The event to send to Sentry.
   * @returns The generated eventId.
   */
  function captureEvent(event) {
      return callOnHub('captureEvent', event);
  }
  /**
   * Records a new breadcrumb which will be attached to future events.
   *
   * Breadcrumbs will be added to subsequent events to provide more context on
   * user's actions prior to an error or crash.
   *
   * @param breadcrumb The breadcrumb to record.
   */
  function addBreadcrumb(breadcrumb) {
      callOnHub('addBreadcrumb', breadcrumb);
  }
  /**
   * Callback to set context information onto the scope.
   * @param callback Callback function that receives Scope.
   */
  function configureScope(callback) {
      callOnHub('configureScope', callback);
  }
  /**
   * Creates a new scope with and executes the given operation within.
   * The scope is automatically removed once the operation
   * finishes or throws.
   *
   * This is essentially a convenience function for:
   *
   *     pushScope();
   *     callback();
   *     popScope();
   *
   * @param callback that will be enclosed into push/popScope.
   */
  function withScope(callback) {
      callOnHub('withScope', callback);
  }

  /** An error emitted by Sentry SDKs and related utilities. */
  class SentryError extends Error {
      constructor(message) {
          super(message);
          this.message = message;
          // tslint:disable:no-unsafe-any
          this.name = new.target.prototype.constructor.name;
          Object.setPrototypeOf(this, new.target.prototype);
      }
  }

  /** Regular expression used to parse a Dsn. */
  const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w\.-]+)(?::(\d+))?\/(.+)/;
  /** Error message */
  const ERROR_MESSAGE = 'Invalid Dsn';
  /** The Sentry Dsn, identifying a Sentry instance and project. */
  class Dsn {
      /** Creates a new Dsn component */
      constructor(from) {
          if (typeof from === 'string') {
              this._fromString(from);
          }
          else {
              this._fromComponents(from);
          }
          this._validate();
      }
      /**
       * Renders the string representation of this Dsn.
       *
       * By default, this will render the public representation without the password
       * component. To get the deprecated private _representation, set `withPassword`
       * to true.
       *
       * @param withPassword When set to true, the password will be included.
       */
      toString(withPassword = false) {
          // tslint:disable-next-line:no-this-assignment
          const { host, path, pass, port, projectId, protocol, user } = this;
          return (`${protocol}://${user}${withPassword && pass ? `:${pass}` : ''}` +
              `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}${projectId}`);
      }
      /** Parses a string into this Dsn. */
      _fromString(str) {
          const match = DSN_REGEX.exec(str);
          if (!match) {
              throw new SentryError(ERROR_MESSAGE);
          }
          const [protocol, user, pass = '', host, port = '', lastPath] = match.slice(1);
          let path = '';
          let projectId = lastPath;
          const split = projectId.split('/');
          if (split.length > 1) {
              path = split.slice(0, -1).join('/');
              projectId = split.pop();
          }
          Object.assign(this, { host, pass, path, projectId, port, protocol, user });
      }
      /** Maps Dsn components into this instance. */
      _fromComponents(components) {
          this.protocol = components.protocol;
          this.user = components.user;
          this.pass = components.pass || '';
          this.host = components.host;
          this.port = components.port || '';
          this.path = components.path || '';
          this.projectId = components.projectId;
      }
      /** Validates this Dsn and throws on error. */
      _validate() {
          ['protocol', 'user', 'host', 'projectId'].forEach(component => {
              if (!this[component]) {
                  throw new SentryError(ERROR_MESSAGE);
              }
          });
          if (this.protocol !== 'http' && this.protocol !== 'https') {
              throw new SentryError(ERROR_MESSAGE);
          }
          if (this.port && Number.isNaN(parseInt(this.port, 10))) {
              throw new SentryError(ERROR_MESSAGE);
          }
      }
  }

  const SENTRY_API_VERSION = '7';
  /** Helper class to provide urls to different Sentry endpoints. */
  class API {
      /** Create a new instance of API */
      constructor(dsn) {
          this.dsn = dsn;
          this._dsnObject = new Dsn(dsn);
      }
      /** Returns the Dsn object. */
      getDsn() {
          return this._dsnObject;
      }
      /** Returns a string with auth headers in the url to the store endpoint. */
      getStoreEndpoint() {
          return `${this._getBaseUrl()}${this.getStoreEndpointPath()}`;
      }
      /** Returns the store endpoint with auth added in url encoded. */
      getStoreEndpointWithUrlEncodedAuth() {
          const dsn = this._dsnObject;
          const auth = {
              sentry_key: dsn.user,
              sentry_version: SENTRY_API_VERSION,
          };
          // Auth is intentionally sent as part of query string (NOT as custom HTTP header)
          // to avoid preflight CORS requests
          return `${this.getStoreEndpoint()}?${urlEncode(auth)}`;
      }
      /** Returns the base path of the url including the port. */
      _getBaseUrl() {
          const dsn = this._dsnObject;
          const protocol = dsn.protocol ? `${dsn.protocol}:` : '';
          const port = dsn.port ? `:${dsn.port}` : '';
          return `${protocol}//${dsn.host}${port}`;
      }
      /** Returns only the path component for the store endpoint. */
      getStoreEndpointPath() {
          const dsn = this._dsnObject;
          return `${dsn.path ? `/${dsn.path}` : ''}/api/${dsn.projectId}/store/`;
      }
      /** Returns an object that can be used in request headers. */
      getRequestHeaders(clientName, clientVersion) {
          const dsn = this._dsnObject;
          const header = [`Sentry sentry_version=${SENTRY_API_VERSION}`];
          header.push(`sentry_timestamp=${new Date().getTime()}`);
          header.push(`sentry_client=${clientName}/${clientVersion}`);
          header.push(`sentry_key=${dsn.user}`);
          if (dsn.pass) {
              header.push(`sentry_secret=${dsn.pass}`);
          }
          return {
              'Content-Type': 'application/json',
              'X-Sentry-Auth': header.join(', '),
          };
      }
      /** Returns the url to the report dialog endpoint. */
      getReportDialogEndpoint(dialogOptions = {}) {
          const dsn = this._dsnObject;
          const endpoint = `${this._getBaseUrl()}${dsn.path ? `/${dsn.path}` : ''}/api/embed/error-page/`;
          const encodedOptions = [];
          encodedOptions.push(`dsn=${dsn.toString()}`);
          for (const key in dialogOptions) {
              if (key === 'user') {
                  if (!dialogOptions.user) {
                      continue;
                  }
                  if (dialogOptions.user.name) {
                      encodedOptions.push(`name=${encodeURIComponent(dialogOptions.user.name)}`);
                  }
                  if (dialogOptions.user.email) {
                      encodedOptions.push(`email=${encodeURIComponent(dialogOptions.user.email)}`);
                  }
              }
              else {
                  encodedOptions.push(`${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key])}`);
              }
          }
          if (encodedOptions.length) {
              return `${endpoint}?${encodedOptions.join('&')}`;
          }
          return endpoint;
      }
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  /**
   * Truncates given string to the maximum characters count
   *
   * @param str An object that contains serializable values
   * @param max Maximum number of characters in truncated string
   * @returns string Encoded
   */
  function truncate(str, max = 0) {
      if (max === 0) {
          return str;
      }
      return str.length <= max ? str : `${str.substr(0, max)}...`;
  }
  /**
   * Join values in array
   * @param input array of values to be joined together
   * @param delimiter string to be placed in-between values
   * @returns Joined values
   */
  function safeJoin(input, delimiter) {
      if (!Array.isArray(input)) {
          return '';
      }
      const output = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < input.length; i++) {
          const value = input[i];
          try {
              output.push(String(value));
          }
          catch (e) {
              output.push('[value cannot be serialized]');
          }
      }
      return output.join(delimiter);
  }
  /** Merges provided array of keys into */
  function keysToEventMessage(keys, maxLength = 40) {
      if (!keys.length) {
          return '[object has no keys]';
      }
      if (keys[0].length >= maxLength) {
          return truncate(keys[0], maxLength);
      }
      for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
          const serialized = keys.slice(0, includedKeys).join(', ');
          if (serialized.length > maxLength) {
              continue;
          }
          if (includedKeys === keys.length) {
              return serialized;
          }
          return truncate(serialized, maxLength);
      }
      return '';
  }

  const installedIntegrations = [];
  /** Gets integration to install */
  function getIntegrationsToSetup(options) {
      const defaultIntegrations = (options.defaultIntegrations && [...options.defaultIntegrations]) || [];
      const userIntegrations = options.integrations;
      let integrations = [];
      if (Array.isArray(userIntegrations)) {
          const userIntegrationsNames = userIntegrations.map(i => i.name);
          const pickedIntegrationsNames = [];
          // Leave only unique default integrations, that were not overridden with provided user integrations
          defaultIntegrations.forEach(defaultIntegration => {
              if (userIntegrationsNames.indexOf(defaultIntegration.name) === -1 &&
                  pickedIntegrationsNames.indexOf(defaultIntegration.name) === -1) {
                  integrations.push(defaultIntegration);
                  pickedIntegrationsNames.push(defaultIntegration.name);
              }
          });
          // Don't add same user integration twice
          userIntegrations.forEach(userIntegration => {
              if (pickedIntegrationsNames.indexOf(userIntegration.name) === -1) {
                  integrations.push(userIntegration);
                  pickedIntegrationsNames.push(userIntegration.name);
              }
          });
      }
      else if (typeof userIntegrations === 'function') {
          integrations = userIntegrations(defaultIntegrations);
          integrations = Array.isArray(integrations) ? integrations : [integrations];
      }
      else {
          return [...defaultIntegrations];
      }
      return integrations;
  }
  /** Setup given integration */
  function setupIntegration(integration) {
      if (installedIntegrations.indexOf(integration.name) !== -1) {
          return;
      }
      integration.setupOnce(addGlobalEventProcessor, getCurrentHub);
      installedIntegrations.push(integration.name);
      logger.log(`Integration installed: ${integration.name}`);
  }
  /**
   * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
   * integrations are added unless they were already provided before.
   * @param integrations array of integration instances
   * @param withDefault should enable default integrations
   */
  function setupIntegrations(options) {
      const integrations = {};
      getIntegrationsToSetup(options).forEach(integration => {
          integrations[integration.name] = integration;
          setupIntegration(integration);
      });
      return integrations;
  }

  /**
   * Base implementation for all JavaScript SDK clients.
   *
   * Call the constructor with the corresponding backend constructor and options
   * specific to the client subclass. To access these options later, use
   * {@link Client.getOptions}. Also, the Backend instance is available via
   * {@link Client.getBackend}.
   *
   * If a Dsn is specified in the options, it will be parsed and stored. Use
   * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
   * invalid, the constructor will throw a {@link SentryException}. Note that
   * without a valid Dsn, the SDK will not send any events to Sentry.
   *
   * Before sending an event via the backend, it is passed through
   * {@link BaseClient.prepareEvent} to add SDK information and scope data
   * (breadcrumbs and context). To add more custom information, override this
   * method and extend the resulting prepared event.
   *
   * To issue automatically created events (e.g. via instrumentation), use
   * {@link Client.captureEvent}. It will prepare the event and pass it through
   * the callback lifecycle. To issue auto-breadcrumbs, use
   * {@link Client.addBreadcrumb}.
   *
   * @example
   * class NodeClient extends BaseClient<NodeBackend, NodeOptions> {
   *   public constructor(options: NodeOptions) {
   *     super(NodeBackend, options);
   *   }
   *
   *   // ...
   * }
   */
  class BaseClient {
      /**
       * Initializes this client instance.
       *
       * @param backendClass A constructor function to create the backend.
       * @param options Options for the client.
       */
      constructor(backendClass, options) {
          /** Is the client still processing a call? */
          this._processing = false;
          this._backend = new backendClass(options);
          this._options = options;
          if (options.dsn) {
              this._dsn = new Dsn(options.dsn);
          }
          this._integrations = setupIntegrations(this._options);
      }
      /**
       * @inheritDoc
       */
      captureException(exception, hint, scope) {
          let eventId = hint && hint.event_id;
          this._processing = true;
          this._getBackend()
              .eventFromException(exception, hint)
              .then(event => this._processEvent(event, hint, scope))
              .then(finalEvent => {
              // We need to check for finalEvent in case beforeSend returned null
              eventId = finalEvent && finalEvent.event_id;
              this._processing = false;
          })
              .catch(reason => {
              logger.log(reason);
              this._processing = false;
          });
          return eventId;
      }
      /**
       * @inheritDoc
       */
      captureMessage(message, level, hint, scope) {
          let eventId = hint && hint.event_id;
          this._processing = true;
          const promisedEvent = isPrimitive(message)
              ? this._getBackend().eventFromMessage(`${message}`, level, hint)
              : this._getBackend().eventFromException(message, hint);
          promisedEvent
              .then(event => this._processEvent(event, hint, scope))
              .then(finalEvent => {
              // We need to check for finalEvent in case beforeSend returned null
              eventId = finalEvent && finalEvent.event_id;
              this._processing = false;
          })
              .catch(reason => {
              logger.log(reason);
              this._processing = false;
          });
          return eventId;
      }
      /**
       * @inheritDoc
       */
      captureEvent(event, hint, scope) {
          let eventId = hint && hint.event_id;
          this._processing = true;
          this._processEvent(event, hint, scope)
              .then(finalEvent => {
              // We need to check for finalEvent in case beforeSend returned null
              eventId = finalEvent && finalEvent.event_id;
              this._processing = false;
          })
              .catch(reason => {
              logger.log(reason);
              this._processing = false;
          });
          return eventId;
      }
      /**
       * @inheritDoc
       */
      getDsn() {
          return this._dsn;
      }
      /**
       * @inheritDoc
       */
      getOptions() {
          return this._options;
      }
      /**
       * @inheritDoc
       */
      flush(timeout) {
          return __awaiter(this, void 0, void 0, function* () {
              return (yield Promise.all([
                  this._getBackend()
                      .getTransport()
                      .close(timeout),
                  this._isClientProcessing(),
              ])).reduce((prev, current) => prev && current);
          });
      }
      /**
       * @inheritDoc
       */
      close(timeout) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.flush(timeout).finally(() => {
                  this.getOptions().enabled = false;
              });
          });
      }
      /**
       * @inheritDoc
       */
      getIntegrations() {
          return this._integrations || {};
      }
      /**
       * @inheritDoc
       */
      getIntegration(integration) {
          try {
              return this._integrations[integration.id] || null;
          }
          catch (_oO) {
              logger.warn(`Cannot retrieve integration ${integration.id} from the current Client`);
              return null;
          }
      }
      /** Waits for the client to be done with processing. */
      _isClientProcessing(counter = 0) {
          return __awaiter(this, void 0, void 0, function* () {
              return new Promise(resolve => {
                  if (this._processing) {
                      // Safeguard in case of endless recursion
                      if (counter >= 10) {
                          resolve(false);
                      }
                      else {
                          setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                              resolve(yield this._isClientProcessing(counter + 1));
                          }), 10);
                      }
                  }
                  else {
                      resolve(true);
                  }
              });
          });
      }
      /** Returns the current backend. */
      _getBackend() {
          return this._backend;
      }
      /** Determines whether this SDK is enabled and a valid Dsn is present. */
      _isEnabled() {
          return this.getOptions().enabled !== false && this._dsn !== undefined;
      }
      /**
       * Adds common information to events.
       *
       * The information includes release and environment from `options`,
       * breadcrumbs and context (extra, tags and user) from the scope.
       *
       * Information that is already present in the event is never overwritten. For
       * nested objects, such as the context, keys are merged.
       *
       * @param event The original event.
       * @param hint May contain additional informartion about the original exception.
       * @param scope A scope containing event metadata.
       * @returns A new event with more information.
       */
      _prepareEvent(event, scope, hint) {
          const { environment, release, dist, maxValueLength = 250 } = this.getOptions();
          const prepared = Object.assign({}, event);
          if (prepared.environment === undefined && environment !== undefined) {
              prepared.environment = environment;
          }
          if (prepared.release === undefined && release !== undefined) {
              prepared.release = release;
          }
          if (prepared.dist === undefined && dist !== undefined) {
              prepared.dist = dist;
          }
          if (prepared.message) {
              prepared.message = truncate(prepared.message, maxValueLength);
          }
          const exception = prepared.exception && prepared.exception.values && prepared.exception.values[0];
          if (exception && exception.value) {
              exception.value = truncate(exception.value, maxValueLength);
          }
          const request = prepared.request;
          if (request && request.url) {
              request.url = truncate(request.url, maxValueLength);
          }
          if (prepared.event_id === undefined) {
              prepared.event_id = uuid4();
          }
          this._addIntegrations(prepared.sdk);
          // We prepare the result here with a resolved Event.
          let result = SyncPromise.resolve(prepared);
          // This should be the last thing called, since we want that
          // {@link Hub.addEventProcessor} gets the finished prepared event.
          if (scope) {
              // In case we have a hub we reassign it.
              result = scope.applyToEvent(prepared, hint);
          }
          return result;
      }
      /**
       * This function adds all used integrations to the SDK info in the event.
       * @param sdkInfo The sdkInfo of the event that will be filled with all integrations.
       */
      _addIntegrations(sdkInfo) {
          const integrationsArray = Object.keys(this._integrations);
          if (sdkInfo && integrationsArray.length > 0) {
              sdkInfo.integrations = integrationsArray;
          }
      }
      /**
       * Processes an event (either error or message) and sends it to Sentry.
       *
       * This also adds breadcrumbs and context information to the event. However,
       * platform specific meta data (such as the User's IP address) must be added
       * by the SDK implementor.
       *
       *
       * @param event The event to send to Sentry.
       * @param hint May contain additional informartion about the original exception.
       * @param scope A scope containing event metadata.
       * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
       */
      _processEvent(event, hint, scope) {
          const { beforeSend, sampleRate } = this.getOptions();
          if (!this._isEnabled()) {
              return SyncPromise.reject('SDK not enabled, will not send event.');
          }
          // 1.0 === 100% events are sent
          // 0.0 === 0% events are sent
          if (typeof sampleRate === 'number' && Math.random() > sampleRate) {
              return SyncPromise.reject('This event has been sampled, will not send event.');
          }
          return new SyncPromise((resolve, reject) => {
              this._prepareEvent(event, scope, hint).then(prepared => {
                  if (prepared === null) {
                      reject('An event processor returned null, will not send event.');
                      return;
                  }
                  let finalEvent = prepared;
                  try {
                      const isInternalException = hint && hint.data && hint.data.__sentry__ === true;
                      if (isInternalException || !beforeSend) {
                          this._getBackend().sendEvent(finalEvent);
                          resolve(finalEvent);
                          return;
                      }
                      const beforeSendResult = beforeSend(prepared, hint);
                      if (typeof beforeSendResult === 'undefined') {
                          logger.error('`beforeSend` method has to return `null` or a valid event.');
                      }
                      else if (isThenable(beforeSendResult)) {
                          this._handleAsyncBeforeSend(beforeSendResult, resolve, reject);
                      }
                      else {
                          finalEvent = beforeSendResult;
                          if (finalEvent === null) {
                              logger.log('`beforeSend` returned `null`, will not send event.');
                              resolve(null);
                              return;
                          }
                          // From here on we are really async
                          this._getBackend().sendEvent(finalEvent);
                          resolve(finalEvent);
                      }
                  }
                  catch (exception) {
                      this.captureException(exception, {
                          data: {
                              __sentry__: true,
                          },
                          originalException: exception,
                      });
                      reject('`beforeSend` throw an error, will not send event.');
                  }
              });
          });
      }
      /**
       * Resolves before send Promise and calls resolve/reject on parent SyncPromise.
       */
      _handleAsyncBeforeSend(beforeSend, resolve, reject) {
          beforeSend
              .then(processedEvent => {
              if (processedEvent === null) {
                  reject('`beforeSend` returned `null`, will not send event.');
                  return;
              }
              // From here on we are really async
              this._getBackend().sendEvent(processedEvent);
              resolve(processedEvent);
          })
              .catch(e => {
              reject(`beforeSend rejected with ${e}`);
          });
      }
  }

  /** Noop transport */
  class NoopTransport {
      /**
       * @inheritDoc
       */
      sendEvent(_) {
          return __awaiter(this, void 0, void 0, function* () {
              return Promise.resolve({
                  reason: `NoopTransport: Event has been skipped because no Dsn is configured.`,
                  status: exports.Status.Skipped,
              });
          });
      }
      /**
       * @inheritDoc
       */
      close(_) {
          return __awaiter(this, void 0, void 0, function* () {
              return Promise.resolve(true);
          });
      }
  }

  /**
   * This is the base implemention of a Backend.
   * @hidden
   */
  class BaseBackend {
      /** Creates a new backend instance. */
      constructor(options) {
          this._options = options;
          if (!this._options.dsn) {
              logger.warn('No DSN provided, backend will not do anything.');
          }
          this._transport = this._setupTransport();
      }
      /**
       * Sets up the transport so it can be used later to send requests.
       */
      _setupTransport() {
          return new NoopTransport();
      }
      /**
       * @inheritDoc
       */
      eventFromException(_exception, _hint) {
          throw new SentryError('Backend has to implement `eventFromException` method');
      }
      /**
       * @inheritDoc
       */
      eventFromMessage(_message, _level, _hint) {
          throw new SentryError('Backend has to implement `eventFromMessage` method');
      }
      /**
       * @inheritDoc
       */
      sendEvent(event) {
          this._transport.sendEvent(event).catch(reason => {
              logger.error(`Error while sending event: ${reason}`);
          });
      }
      /**
       * @inheritDoc
       */
      getTransport() {
          return this._transport;
      }
  }

  /**
   * Internal function to create a new SDK client instance. The client is
   * installed and then bound to the current scope.
   *
   * @param clientClass The client class to instanciate.
   * @param options Options to pass to the client.
   */
  function initAndBind(clientClass, options) {
      if (options.debug === true) {
          logger.enable();
      }
      getCurrentHub().bindClient(new clientClass(options));
  }

  let originalFunctionToString;
  /** Patch toString calls to return proper name for wrapped functions */
  class FunctionToString {
      constructor() {
          /**
           * @inheritDoc
           */
          this.name = FunctionToString.id;
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
          originalFunctionToString = Function.prototype.toString;
          Function.prototype.toString = function (...args) {
              const context = this.__sentry__ ? this.__sentry_original__ : this;
              // tslint:disable-next-line:no-unsafe-any
              return originalFunctionToString.apply(context, args);
          };
      }
  }
  /**
   * @inheritDoc
   */
  FunctionToString.id = 'FunctionToString';

  // "Script error." is hard coded into browsers for errors that it can't read.
  // this is the result of a script being pulled in from an external domain and CORS.
  const DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/];
  /** Inbound filters configurable by the user */
  class InboundFilters {
      constructor(_options = {}) {
          this._options = _options;
          /**
           * @inheritDoc
           */
          this.name = InboundFilters.id;
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
          addGlobalEventProcessor((event) => {
              const hub = getCurrentHub();
              if (!hub) {
                  return event;
              }
              const self = hub.getIntegration(InboundFilters);
              if (self) {
                  const client = hub.getClient();
                  const clientOptions = client ? client.getOptions() : {};
                  const options = self._mergeOptions(clientOptions);
                  if (self._shouldDropEvent(event, options)) {
                      return null;
                  }
              }
              return event;
          });
      }
      /** JSDoc */
      _shouldDropEvent(event, options) {
          if (this._isSentryError(event, options)) {
              logger.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${getEventDescription(event)}`);
              return true;
          }
          if (this._isIgnoredError(event, options)) {
              logger.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${getEventDescription(event)}`);
              return true;
          }
          if (this._isBlacklistedUrl(event, options)) {
              logger.warn(`Event dropped due to being matched by \`blacklistUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${this._getEventFilterUrl(event)}`);
              return true;
          }
          if (!this._isWhitelistedUrl(event, options)) {
              logger.warn(`Event dropped due to not being matched by \`whitelistUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${this._getEventFilterUrl(event)}`);
              return true;
          }
          return false;
      }
      /** JSDoc */
      _isSentryError(event, options = {}) {
          if (!options.ignoreInternal) {
              return false;
          }
          try {
              // tslint:disable-next-line:no-unsafe-any
              return event.exception.values[0].type === 'SentryError';
          }
          catch (_oO) {
              return false;
          }
      }
      /** JSDoc */
      _isIgnoredError(event, options = {}) {
          if (!options.ignoreErrors || !options.ignoreErrors.length) {
              return false;
          }
          return this._getPossibleEventMessages(event).some(message => 
          // Not sure why TypeScript complains here...
          options.ignoreErrors.some(pattern => this._isMatchingPattern(message, pattern)));
      }
      /** JSDoc */
      _isBlacklistedUrl(event, options = {}) {
          // TODO: Use Glob instead?
          if (!options.blacklistUrls || !options.blacklistUrls.length) {
              return false;
          }
          const url = this._getEventFilterUrl(event);
          return !url ? false : options.blacklistUrls.some(pattern => this._isMatchingPattern(url, pattern));
      }
      /** JSDoc */
      _isWhitelistedUrl(event, options = {}) {
          // TODO: Use Glob instead?
          if (!options.whitelistUrls || !options.whitelistUrls.length) {
              return true;
          }
          const url = this._getEventFilterUrl(event);
          return !url ? true : options.whitelistUrls.some(pattern => this._isMatchingPattern(url, pattern));
      }
      /** JSDoc */
      _mergeOptions(clientOptions = {}) {
          return {
              blacklistUrls: [...(this._options.blacklistUrls || []), ...(clientOptions.blacklistUrls || [])],
              ignoreErrors: [
                  ...(this._options.ignoreErrors || []),
                  ...(clientOptions.ignoreErrors || []),
                  ...DEFAULT_IGNORE_ERRORS,
              ],
              ignoreInternal: typeof this._options.ignoreInternal !== 'undefined' ? this._options.ignoreInternal : true,
              whitelistUrls: [...(this._options.whitelistUrls || []), ...(clientOptions.whitelistUrls || [])],
          };
      }
      /** JSDoc */
      _isMatchingPattern(value, pattern) {
          if (isRegExp(pattern)) {
              return pattern.test(value);
          }
          if (typeof pattern === 'string') {
              return value.includes(pattern);
          }
          return false;
      }
      /** JSDoc */
      _getPossibleEventMessages(event) {
          if (event.message) {
              return [event.message];
          }
          if (event.exception) {
              try {
                  // tslint:disable-next-line:no-unsafe-any
                  const { type, value } = event.exception.values[0];
                  return [`${value}`, `${type}: ${value}`];
              }
              catch (oO) {
                  logger.error(`Cannot extract message for event ${getEventDescription(event)}`);
                  return [];
              }
          }
          return [];
      }
      /** JSDoc */
      _getEventFilterUrl(event) {
          try {
              if (event.stacktrace) {
                  // tslint:disable:no-unsafe-any
                  const frames = event.stacktrace.frames;
                  return frames[frames.length - 1].filename;
              }
              if (event.exception) {
                  // tslint:disable:no-unsafe-any
                  const frames = event.exception.values[0].stacktrace.frames;
                  return frames[frames.length - 1].filename;
              }
              return null;
          }
          catch (oO) {
              logger.error(`Cannot extract url for event ${getEventDescription(event)}`);
              return null;
          }
      }
  }
  /**
   * @inheritDoc
   */
  InboundFilters.id = 'InboundFilters';



  var CoreIntegrations = /*#__PURE__*/Object.freeze({
    FunctionToString: FunctionToString,
    InboundFilters: InboundFilters
  });

  /**
   * Tells whether current environment supports Fetch API
   * {@link supportsFetch}.
   *
   * @returns Answer to the given question.
   */
  function supportsFetch() {
      if (!('fetch' in getGlobalObject())) {
          return false;
      }
      try {
          // tslint:disable-next-line:no-unused-expression
          new Headers();
          // tslint:disable-next-line:no-unused-expression
          new Request('');
          // tslint:disable-next-line:no-unused-expression
          new Response();
          return true;
      }
      catch (e) {
          return false;
      }
  }
  /**
   * Tells whether current environment supports Fetch API natively
   * {@link supportsNativeFetch}.
   *
   * @returns Answer to the given question.
   */
  function supportsNativeFetch() {
      if (!supportsFetch()) {
          return false;
      }
      const global = getGlobalObject();
      return global.fetch.toString().indexOf('native') !== -1;
  }
  /**
   * Tells whether current environment supports Referrer Policy API
   * {@link supportsReferrerPolicy}.
   *
   * @returns Answer to the given question.
   */
  function supportsReferrerPolicy() {
      // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
      // https://caniuse.com/#feat=referrer-policy
      // It doesn't. And it throw exception instead of ignoring this parameter...
      // REF: https://github.com/getsentry/raven-js/issues/1233
      if (!supportsFetch()) {
          return false;
      }
      try {
          // tslint:disable:no-unused-expression
          new Request('_', {
              referrerPolicy: 'origin',
          });
          return true;
      }
      catch (e) {
          return false;
      }
  }
  /**
   * Tells whether current environment supports History API
   * {@link supportsHistory}.
   *
   * @returns Answer to the given question.
   */
  function supportsHistory() {
      // NOTE: in Chrome App environment, touching history.pushState, *even inside
      //       a try/catch block*, will cause Chrome to output an error to console.error
      // borrowed from: https://github.com/angular/angular.js/pull/13945/files
      const global = getGlobalObject();
      const chrome = global.chrome;
      // tslint:disable-next-line:no-unsafe-any
      const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
      const hasHistoryApi = 'history' in global && !!global.history.pushState && !!global.history.replaceState;
      return !isChromePackagedApp && hasHistoryApi;
  }

  // tslint:disable
  /**
   * TraceKit - Cross brower stack traces
   *
   * This was originally forked from github.com/occ/TraceKit, but has since been
   * largely modified and is now maintained as part of Sentry JS SDK.
   *
   * NOTE: Last merge with upstream repository
   * Jul 11,2018 - #f03357c
   *
   * https://github.com/csnover/TraceKit
   * @license MIT
   * @namespace TraceKit
   */
  var window$1 = getGlobalObject();
  var TraceKit = {
      report: false,
      collectWindowErrors: false,
      computeStackTrace: false,
      linesOfContext: false,
  };
  // var TraceKit: TraceKitInterface = {};
  // var TraceKit = {};
  // global reference to slice
  var UNKNOWN_FUNCTION = '?';
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types
  var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;
  /**
   * A better form of hasOwnProperty<br/>
   * Example: `_has(MainHostObject, property) === true/false`
   *
   * @param {Object} object to check property
   * @param {string} key to check
   * @return {Boolean} true if the object has the key and it is not inherited
   */
  function _has(object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
  }
  /**
   * A safe form of location.href<br/>
   *
   * @return {string} location.href
   */
  function getLocationHref() {
      if (typeof document === 'undefined' || document.location == null)
          return '';
      return document.location.href;
  }
  /**
   * Cross-browser processing of unhandled exceptions
   *
   * Syntax:
   * ```js
   *   TraceKit.report.subscribe(function(stackInfo) { ... })
   *   TraceKit.report(exception)
   *   try { ...code... } catch(ex) { TraceKit.report(ex); }
   * ```
   *
   * Supports:
   *   - Firefox: full stack trace with line numbers, plus column number
   *     on top frame; column number is not guaranteed
   *   - Opera: full stack trace with line and column numbers
   *   - Chrome: full stack trace with line and column numbers
   *   - Safari: line and column number for the top frame only; some frames
   *     may be missing, and column number is not guaranteed
   *   - IE: line and column number for the top frame only; some frames
   *     may be missing, and column number is not guaranteed
   *
   * In theory, TraceKit should work on all of the following versions:
   *   - IE5.5+ (only 8.0 tested)
   *   - Firefox 0.9+ (only 3.5+ tested)
   *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
   *     Exceptions Have Stacktrace to be enabled in opera:config)
   *   - Safari 3+ (only 4+ tested)
   *   - Chrome 1+ (only 5+ tested)
   *   - Konqueror 3.5+ (untested)
   *
   * Requires TraceKit.computeStackTrace.
   *
   * Tries to catch all unhandled exceptions and report them to the
   * subscribed handlers. Please note that TraceKit.report will rethrow the
   * exception. This is REQUIRED in order to get a useful stack trace in IE.
   * If the exception does not reach the top of the browser, you will only
   * get a stack trace from the point where TraceKit.report was called.
   *
   * Handlers receive a TraceKit.StackTrace object as described in the
   * TraceKit.computeStackTrace docs.
   *
   * @memberof TraceKit
   * @namespace
   */
  TraceKit.report = (function reportModuleWrapper() {
      var handlers = [], lastException = null, lastExceptionStack = null;
      /**
       * Add a crash handler.
       * @param {Function} handler
       * @memberof TraceKit.report
       */
      function subscribe(handler) {
          // NOTE: We call both handlers manually in browser/integrations/globalhandler.ts
          // So user can choose which one he wants to attach
          // installGlobalHandler();
          // installGlobalUnhandledRejectionHandler();
          handlers.push(handler);
      }
      /**
       * Dispatch stack information to all handlers.
       * @param {TraceKit.StackTrace} stack
       * @param {boolean} isWindowError Is this a top-level window error?
       * @param {Error=} error The error that's being handled (if available, null otherwise)
       * @memberof TraceKit.report
       * @throws An exception if an error occurs while calling an handler.
       */
      function notifyHandlers(stack, isWindowError, error) {
          var exception = null;
          if (isWindowError && !TraceKit.collectWindowErrors) {
              return;
          }
          for (var i in handlers) {
              if (_has(handlers, i)) {
                  try {
                      handlers[i](stack, isWindowError, error);
                  }
                  catch (inner) {
                      exception = inner;
                  }
              }
          }
          if (exception) {
              throw exception;
          }
      }
      var _oldOnerrorHandler, _onErrorHandlerInstalled;
      /**
       * Ensures all global unhandled exceptions are recorded.
       * Supported by Gecko and IE.
       * @param {string} message Error message.
       * @param {string} url URL of script that generated the exception.
       * @param {(number|string)} lineNo The line number at which the error occurred.
       * @param {(number|string)=} columnNo The column number at which the error occurred.
       * @param {Error=} errorObj The actual Error object.
       * @memberof TraceKit.report
       */
      function traceKitWindowOnError(message, url, lineNo, columnNo, errorObj) {
          var stack = null;
          // If 'errorObj' is ErrorEvent, get real Error from inside
          errorObj = isErrorEvent(errorObj) ? errorObj.error : errorObj;
          // If 'message' is ErrorEvent, get real message from inside
          message = isErrorEvent(message) ? message.message : message;
          if (lastExceptionStack) {
              TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
              processLastException();
          }
          else if (errorObj && isError(errorObj)) {
              stack = TraceKit.computeStackTrace(errorObj);
              stack.mechanism = 'onerror';
              notifyHandlers(stack, true, errorObj);
          }
          else {
              var location = {
                  url: url,
                  line: lineNo,
                  column: columnNo,
              };
              var name;
              var msg = message; // must be new var or will modify original `arguments`
              if ({}.toString.call(message) === '[object String]') {
                  var groups = message.match(ERROR_TYPES_RE);
                  if (groups) {
                      name = groups[1];
                      msg = groups[2];
                  }
              }
              location.func = UNKNOWN_FUNCTION;
              location.context = null;
              stack = {
                  name: name,
                  message: msg,
                  mode: 'onerror',
                  mechanism: 'onerror',
                  stack: [
                      Object.assign({}, location, { 
                          // Firefox sometimes doesn't return url correctly and this is an old behavior
                          // that I prefer to port here as well.
                          // It can be altered only here, as previously it's using `location.url` for other things — Kamil
                          url: location.url || getLocationHref() }),
                  ],
              };
              notifyHandlers(stack, true, null);
          }
          if (_oldOnerrorHandler) {
              // @ts-ignore
              return _oldOnerrorHandler.apply(this, arguments);
          }
          return false;
      }
      /**
       * Ensures all unhandled rejections are recorded.
       * @param {PromiseRejectionEvent} e event.
       * @memberof TraceKit.report
       * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onunhandledrejection
       * @see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
       */
      function traceKitWindowOnUnhandledRejection(e) {
          var err = (e && (e.detail ? e.detail.reason : e.reason)) || e;
          var stack = TraceKit.computeStackTrace(err);
          stack.mechanism = 'onunhandledrejection';
          notifyHandlers(stack, true, err);
      }
      /**
       * Install a global onerror handler
       * @memberof TraceKit.report
       */
      function installGlobalHandler() {
          if (_onErrorHandlerInstalled === true) {
              return;
          }
          _oldOnerrorHandler = window$1.onerror;
          window$1.onerror = traceKitWindowOnError;
          _onErrorHandlerInstalled = true;
      }
      /**
       * Install a global onunhandledrejection handler
       * @memberof TraceKit.report
       */
      function installGlobalUnhandledRejectionHandler() {
          window$1.onunhandledrejection = traceKitWindowOnUnhandledRejection;
      }
      /**
       * Process the most recent exception
       * @memberof TraceKit.report
       */
      function processLastException() {
          var _lastExceptionStack = lastExceptionStack, _lastException = lastException;
          lastExceptionStack = null;
          lastException = null;
          notifyHandlers(_lastExceptionStack, false, _lastException);
      }
      /**
       * Reports an unhandled Error to TraceKit.
       * @param {Error} ex
       * @memberof TraceKit.report
       * @throws An exception if an incomplete stack trace is detected (old IE browsers).
       */
      function report(ex) {
          if (lastExceptionStack) {
              if (lastException === ex) {
                  return; // already caught by an inner catch block, ignore
              }
              else {
                  processLastException();
              }
          }
          var stack = TraceKit.computeStackTrace(ex);
          lastExceptionStack = stack;
          lastException = ex;
          // If the stack trace is incomplete, wait for 2 seconds for
          // slow slow IE to see if onerror occurs or not before reporting
          // this exception; otherwise, we will end up with an incomplete
          // stack trace
          setTimeout(function () {
              if (lastException === ex) {
                  processLastException();
              }
          }, stack.incomplete ? 2000 : 0);
          throw ex; // re-throw to propagate to the top level (and cause window.onerror)
      }
      report.subscribe = subscribe;
      report.installGlobalHandler = installGlobalHandler;
      report.installGlobalUnhandledRejectionHandler = installGlobalUnhandledRejectionHandler;
      return report;
  })();
  /**
   * An object representing a single stack frame.
   * @typedef {Object} StackFrame
   * @property {string} url The JavaScript or HTML file URL.
   * @property {string} func The function name, or empty for anonymous functions (if guessing did not work).
   * @property {string[]?} args The arguments passed to the function, if known.
   * @property {number=} line The line number, if known.
   * @property {number=} column The column number, if known.
   * @property {string[]} context An array of source code lines; the middle element corresponds to the correct line#.
   * @memberof TraceKit
   */
  /**
   * An object representing a JavaScript stack trace.
   * @typedef {Object} StackTrace
   * @property {string} name The name of the thrown exception.
   * @property {string} message The exception error message.
   * @property {TraceKit.StackFrame[]} stack An array of stack frames.
   * @property {string} mode 'stack', 'stacktrace', 'multiline', 'callers', 'onerror', or 'failed' -- method used to collect the stack trace.
   * @memberof TraceKit
   */
  /**
   * TraceKit.computeStackTrace: cross-browser stack traces in JavaScript
   *
   * Syntax:
   *   ```js
   *   s = TraceKit.computeStackTrace(exception) // consider using TraceKit.report instead (see below)
   *   ```
   *
   * Supports:
   *   - Firefox:  full stack trace with line numbers and unreliable column
   *               number on top frame
   *   - Opera 10: full stack trace with line and column numbers
   *   - Opera 9-: full stack trace with line numbers
   *   - Chrome:   full stack trace with line and column numbers
   *   - Safari:   line and column number for the topmost stacktrace element
   *               only
   *   - IE:       no line numbers whatsoever
   *
   * Tries to guess names of anonymous functions by looking for assignments
   * in the source code. In IE and Safari, we have to guess source file names
   * by searching for function bodies inside all page scripts. This will not
   * work for scripts that are loaded cross-domain.
   * Here be dragons: some function names may be guessed incorrectly, and
   * duplicate functions may be mismatched.
   *
   * TraceKit.computeStackTrace should only be used for tracing purposes.
   * Logging of unhandled exceptions should be done with TraceKit.report,
   * which builds on top of TraceKit.computeStackTrace and provides better
   * IE support by utilizing the window.onerror event to retrieve information
   * about the top of the stack.
   *
   * Note: In IE and Safari, no stack trace is recorded on the Error object,
   * so computeStackTrace instead walks its *own* chain of callers.
   * This means that:
   *  * in Safari, some methods may be missing from the stack trace;
   *  * in IE, the topmost function in the stack trace will always be the
   *    caller of computeStackTrace.
   *
   * This is okay for tracing (because you are likely to be calling
   * computeStackTrace from the function you want to be the topmost element
   * of the stack trace anyway), but not okay for logging unhandled
   * exceptions (because your catch block will likely be far away from the
   * inner function that actually caused the exception).
   *
   * @memberof TraceKit
   * @namespace
   */
  TraceKit.computeStackTrace = (function computeStackTraceWrapper() {
      // Contents of Exception in various browsers.
      //
      // SAFARI:
      // ex.message = Can't find variable: qq
      // ex.line = 59
      // ex.sourceId = 580238192
      // ex.sourceURL = http://...
      // ex.expressionBeginOffset = 96
      // ex.expressionCaretOffset = 98
      // ex.expressionEndOffset = 98
      // ex.name = ReferenceError
      //
      // FIREFOX:
      // ex.message = qq is not defined
      // ex.fileName = http://...
      // ex.lineNumber = 59
      // ex.columnNumber = 69
      // ex.stack = ...stack trace... (see the example below)
      // ex.name = ReferenceError
      //
      // CHROME:
      // ex.message = qq is not defined
      // ex.name = ReferenceError
      // ex.type = not_defined
      // ex.arguments = ['aa']
      // ex.stack = ...stack trace...
      //
      // INTERNET EXPLORER:
      // ex.message = ...
      // ex.name = ReferenceError
      //
      // OPERA:
      // ex.message = ...message... (see the example below)
      // ex.name = ReferenceError
      // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
      // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'
      /**
       * Computes stack trace information from the stack property.
       * Chrome and Gecko use this property.
       * @param {Error} ex
       * @return {?TraceKit.StackTrace} Stack trace information.
       * @memberof TraceKit.computeStackTrace
       */
      function computeStackTraceFromStackProp(ex) {
          if (!ex.stack) {
              return null;
          }
          var chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|moz-extension).*?:\/.*?|\[native code\]|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i, winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i, 
          // Used to additionally parse URL/line/column from eval frames
          isEval, geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/, lines = ex.stack.split('\n'), stack = [], submatch, parts, element, reference = /^(.*) is undefined$/.exec(ex.message);
          for (var i = 0, j = lines.length; i < j; ++i) {
              if ((parts = chrome.exec(lines[i]))) {
                  var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
                  isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
                  if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                      // throw out eval line/column and use top-most line/column number
                      parts[2] = submatch[1]; // url
                      // NOTE: It's messing out our integration tests in Karma, let's see if we can live with it – Kamil
                      // parts[3] = submatch[2]; // line
                      // parts[4] = submatch[3]; // column
                  }
                  element = {
                      url: !isNative ? parts[2] : null,
                      func: parts[1] || UNKNOWN_FUNCTION,
                      args: isNative ? [parts[2]] : [],
                      line: parts[3] ? +parts[3] : null,
                      column: parts[4] ? +parts[4] : null,
                  };
              }
              else if ((parts = winjs.exec(lines[i]))) {
                  element = {
                      url: parts[2],
                      func: parts[1] || UNKNOWN_FUNCTION,
                      args: [],
                      line: +parts[3],
                      column: parts[4] ? +parts[4] : null,
                  };
              }
              else if ((parts = gecko.exec(lines[i]))) {
                  isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
                  if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                      // throw out eval line/column and use top-most line number
                      parts[3] = submatch[1];
                      // NOTE: It's messing out our integration tests in Karma, let's see if we can live with it – Kamil
                      // parts[4] = submatch[2];
                      // parts[5] = null; // no column when eval
                  }
                  else if (i === 0 && !parts[5] && ex.columnNumber !== void 0) {
                      // FireFox uses this awesome columnNumber property for its top frame
                      // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                      // so adding 1
                      // NOTE: this hack doesn't work if top-most frame is eval
                      stack[0].column = ex.columnNumber + 1;
                  }
                  element = {
                      url: parts[3],
                      func: parts[1] || UNKNOWN_FUNCTION,
                      args: parts[2] ? parts[2].split(',') : [],
                      line: parts[4] ? +parts[4] : null,
                      column: parts[5] ? +parts[5] : null,
                  };
              }
              else {
                  continue;
              }
              if (!element.func && element.line) {
                  element.func = UNKNOWN_FUNCTION;
              }
              element.context = null;
              stack.push(element);
          }
          if (!stack.length) {
              return null;
          }
          if (stack[0] && stack[0].line && !stack[0].column && reference) {
              stack[0].column = null;
          }
          return {
              mode: 'stack',
              name: ex.name,
              message: ex.message,
              stack: stack,
          };
      }
      /**
       * Computes stack trace information from the stacktrace property.
       * Opera 10+ uses this property.
       * @param {Error} ex
       * @return {?TraceKit.StackTrace} Stack trace information.
       * @memberof TraceKit.computeStackTrace
       */
      function computeStackTraceFromStacktraceProp(ex) {
          // Access and store the stacktrace property before doing ANYTHING
          // else to it because Opera is not very good at providing it
          // reliably in other circumstances.
          var stacktrace = ex.stacktrace;
          if (!stacktrace) {
              return;
          }
          var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i, opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i, lines = stacktrace.split('\n'), stack = [], parts;
          for (var line = 0; line < lines.length; line += 2) {
              var element = null;
              if ((parts = opera10Regex.exec(lines[line]))) {
                  element = {
                      url: parts[2],
                      line: +parts[1],
                      column: null,
                      func: parts[3],
                      args: [],
                  };
              }
              else if ((parts = opera11Regex.exec(lines[line]))) {
                  element = {
                      url: parts[6],
                      line: +parts[1],
                      column: +parts[2],
                      func: parts[3] || parts[4],
                      args: parts[5] ? parts[5].split(',') : [],
                  };
              }
              if (element) {
                  if (!element.func && element.line) {
                      element.func = UNKNOWN_FUNCTION;
                  }
                  if (element.line) {
                      element.context = null;
                  }
                  if (!element.context) {
                      element.context = [lines[line + 1]];
                  }
                  stack.push(element);
              }
          }
          if (!stack.length) {
              return null;
          }
          return {
              mode: 'stacktrace',
              name: ex.name,
              message: ex.message,
              stack: stack,
          };
      }
      /**
       * NOT TESTED.
       * Computes stack trace information from an error message that includes
       * the stack trace.
       * Opera 9 and earlier use this method if the option to show stack
       * traces is turned on in opera:config.
       * @param {Error} ex
       * @return {?TraceKit.StackTrace} Stack information.
       * @memberof TraceKit.computeStackTrace
       */
      function computeStackTraceFromOperaMultiLineMessage(ex) {
          // TODO: Clean this function up
          // Opera includes a stack trace into the exception message. An example is:
          //
          // Statement on line 3: Undefined variable: undefinedFunc
          // Backtrace:
          //   Line 3 of linked script file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.js: In function zzz
          //         undefinedFunc(a);
          //   Line 7 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function yyy
          //           zzz(x, y, z);
          //   Line 3 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function xxx
          //           yyy(a, a, a);
          //   Line 1 of function script
          //     try { xxx('hi'); return false; } catch(ex) { TraceKit.report(ex); }
          //   ...
          var lines = ex.message.split('\n');
          if (lines.length < 4) {
              return null;
          }
          var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i, lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i, lineRE3 = /^\s*Line (\d+) of function script\s*$/i, stack = [], scripts = window$1 && window$1.document && window$1.document.getElementsByTagName('script'), inlineScriptBlocks = [], parts;
          for (var s in scripts) {
              if (_has(scripts, s) && !scripts[s].src) {
                  inlineScriptBlocks.push(scripts[s]);
              }
          }
          for (var line = 2; line < lines.length; line += 2) {
              var item = null;
              if ((parts = lineRE1.exec(lines[line]))) {
                  item = {
                      url: parts[2],
                      func: parts[3],
                      args: [],
                      line: +parts[1],
                      column: null,
                  };
              }
              else if ((parts = lineRE2.exec(lines[line]))) {
                  item = {
                      url: parts[3],
                      func: parts[4],
                      args: [],
                      line: +parts[1],
                      column: null,
                  };
              }
              else if ((parts = lineRE3.exec(lines[line]))) {
                  var url = getLocationHref().replace(/#.*$/, '');
                  item = {
                      url: url,
                      func: '',
                      args: [],
                      line: parts[1],
                      column: null,
                  };
              }
              if (item) {
                  if (!item.func) {
                      item.func = UNKNOWN_FUNCTION;
                  }
                  // if (context) alert("Context mismatch. Correct midline:\n" + lines[i+1] + "\n\nMidline:\n" + midline + "\n\nContext:\n" + context.join("\n") + "\n\nURL:\n" + item.url);
                  item.context = [lines[line + 1]];
                  stack.push(item);
              }
          }
          if (!stack.length) {
              return null; // could not parse multiline exception message as Opera stack trace
          }
          return {
              mode: 'multiline',
              name: ex.name,
              message: lines[0],
              stack: stack,
          };
      }
      /**
       * Adds information about the first frame to incomplete stack traces.
       * Safari and IE require this to get complete data on the first frame.
       * @param {TraceKit.StackTrace} stackInfo Stack trace information from
       * one of the compute* methods.
       * @param {string} url The URL of the script that caused an error.
       * @param {(number|string)} lineNo The line number of the script that
       * caused an error.
       * @param {string=} message The error generated by the browser, which
       * hopefully contains the name of the object that caused the error.
       * @return {boolean} Whether or not the stack information was
       * augmented.
       * @memberof TraceKit.computeStackTrace
       */
      function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
          var initial = {
              url: url,
              line: lineNo,
          };
          if (initial.url && initial.line) {
              stackInfo.incomplete = false;
              if (!initial.func) {
                  initial.func = UNKNOWN_FUNCTION;
              }
              if (!initial.context) {
                  initial.context = null;
              }
              var reference = / '([^']+)' /.exec(message);
              if (reference) {
                  initial.column = null;
              }
              if (stackInfo.stack.length > 0) {
                  if (stackInfo.stack[0].url === initial.url) {
                      if (stackInfo.stack[0].line === initial.line) {
                          return false; // already in stack trace
                      }
                      else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
                          stackInfo.stack[0].line = initial.line;
                          stackInfo.stack[0].context = initial.context;
                          return false;
                      }
                  }
              }
              stackInfo.stack.unshift(initial);
              stackInfo.partial = true;
              return true;
          }
          else {
              stackInfo.incomplete = true;
          }
          return false;
      }
      /**
       * Computes stack trace information by walking the arguments.caller
       * chain at the time the exception occurred. This will cause earlier
       * frames to be missed but is the only way to get any stack trace in
       * Safari and IE. The top frame is restored by
       * {@link augmentStackTraceWithInitialElement}.
       * @param {Error} ex
       * @return {TraceKit.StackTrace=} Stack trace information.
       * @memberof TraceKit.computeStackTrace
       */
      function computeStackTraceByWalkingCallerChain(ex, depth) {
          var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i, stack = [], funcs = {}, recursion = false, parts, item;
          for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
              if (curr === computeStackTrace || curr === TraceKit.report) {
                  continue;
              }
              item = {
                  url: null,
                  func: UNKNOWN_FUNCTION,
                  args: [],
                  line: null,
                  column: null,
              };
              if (curr.name) {
                  item.func = curr.name;
              }
              else if ((parts = functionName.exec(curr.toString()))) {
                  item.func = parts[1];
              }
              if (typeof item.func === 'undefined') {
                  try {
                      item.func = parts.input.substring(0, parts.input.indexOf('{'));
                  }
                  catch (e) { }
              }
              if (funcs['' + curr]) {
                  recursion = true;
              }
              else {
                  funcs['' + curr] = true;
              }
              stack.push(item);
          }
          if (depth) {
              stack.splice(0, depth);
          }
          var result = {
              mode: 'callers',
              name: ex.name,
              message: ex.message,
              stack: stack,
          };
          augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
          return result;
      }
      /**
       * Computes a stack trace for an exception.
       * @param {Error} ex
       * @param {(string|number)=} depth
       * @memberof TraceKit.computeStackTrace
       */
      function computeStackTrace(ex, depth) {
          var stack = null;
          depth = depth == null ? 0 : +depth;
          try {
              // This must be tried first because Opera 10 *destroys*
              // its stacktrace property if you try to access the stack
              // property first!!
              stack = computeStackTraceFromStacktraceProp(ex);
              if (stack) {
                  return stack;
              }
          }
          catch (e) { }
          try {
              stack = computeStackTraceFromStackProp(ex);
              if (stack) {
                  return stack;
              }
          }
          catch (e) { }
          try {
              stack = computeStackTraceFromOperaMultiLineMessage(ex);
              if (stack) {
                  return stack;
              }
          }
          catch (e) { }
          try {
              stack = computeStackTraceByWalkingCallerChain(ex, depth + 1);
              if (stack) {
                  return stack;
              }
          }
          catch (e) { }
          return {
              original: ex,
              name: ex.name,
              message: ex.message,
              mode: 'failed',
          };
      }
      computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
      computeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp;
      return computeStackTrace;
  })();
  TraceKit.collectWindowErrors = true;
  TraceKit.linesOfContext = 11;
  const subscribe = TraceKit.report.subscribe;
  const installGlobalHandler = TraceKit.report.installGlobalHandler;
  const installGlobalUnhandledRejectionHandler = TraceKit.report.installGlobalUnhandledRejectionHandler;
  const computeStackTrace = TraceKit.computeStackTrace;

  const STACKTRACE_LIMIT = 50;
  /**
   * This function creates an exception from an TraceKitStackTrace
   * @param stacktrace TraceKitStackTrace that will be converted to an exception
   * @hidden
   */
  function exceptionFromStacktrace(stacktrace) {
      const frames = prepareFramesForEvent(stacktrace.stack);
      const exception = {
          type: stacktrace.name,
          value: stacktrace.message,
      };
      if (frames && frames.length) {
          exception.stacktrace = { frames };
      }
      // tslint:disable-next-line:strict-type-predicates
      if (exception.type === undefined && exception.value === '') {
          exception.value = 'Unrecoverable error caught';
      }
      return exception;
  }
  /**
   * @hidden
   */
  function eventFromPlainObject(exception, syntheticException) {
      const exceptionKeys = Object.keys(exception).sort();
      const event = {
          extra: {
              __serialized__: normalizeToSize(exception),
          },
          message: `Non-Error exception captured with keys: ${keysToEventMessage(exceptionKeys)}`,
      };
      if (syntheticException) {
          const stacktrace = computeStackTrace(syntheticException);
          const frames = prepareFramesForEvent(stacktrace.stack);
          event.stacktrace = {
              frames,
          };
      }
      return event;
  }
  /**
   * @hidden
   */
  function eventFromStacktrace(stacktrace) {
      const exception = exceptionFromStacktrace(stacktrace);
      return {
          exception: {
              values: [exception],
          },
      };
  }
  /**
   * @hidden
   */
  function prepareFramesForEvent(stack) {
      if (!stack || !stack.length) {
          return [];
      }
      let localStack = stack;
      const firstFrameFunction = localStack[0].func || '';
      const lastFrameFunction = localStack[localStack.length - 1].func || '';
      // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
      if (firstFrameFunction.includes('captureMessage') || firstFrameFunction.includes('captureException')) {
          localStack = localStack.slice(1);
      }
      // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
      if (lastFrameFunction.includes('sentryWrapped')) {
          localStack = localStack.slice(0, -1);
      }
      // The frame where the crash happened, should be the last entry in the array
      return localStack
          .map((frame) => ({
          colno: frame.column,
          filename: frame.url || localStack[0].url,
          function: frame.func || '?',
          in_app: true,
          lineno: frame.line,
      }))
          .slice(0, STACKTRACE_LIMIT)
          .reverse();
  }

  /** A simple queue that holds promises. */
  class PromiseBuffer {
      constructor(_limit) {
          this._limit = _limit;
          /** Internal set of queued Promises */
          this._buffer = [];
      }
      /**
       * Says if the buffer is ready to take more requests
       */
      isReady() {
          return this._limit === undefined || this.length() < this._limit;
      }
      /**
       * Add a promise to the queue.
       *
       * @param task Can be any Promise<T>
       * @returns The original promise.
       */
      add(task) {
          return __awaiter(this, void 0, void 0, function* () {
              if (!this.isReady()) {
                  return Promise.reject(new SentryError('Not adding Promise due to buffer limit reached.'));
              }
              if (this._buffer.indexOf(task) === -1) {
                  this._buffer.push(task);
              }
              task
                  .then(() => __awaiter(this, void 0, void 0, function* () { return this.remove(task); }))
                  .catch(() => __awaiter(this, void 0, void 0, function* () {
                  return this.remove(task).catch(() => {
                      // We have to add this catch here otherwise we have an unhandledPromiseRejection
                      // because it's a new Promise chain.
                  });
              }));
              return task;
          });
      }
      /**
       * Remove a promise to the queue.
       *
       * @param task Can be any Promise<T>
       * @returns Removed promise.
       */
      remove(task) {
          return __awaiter(this, void 0, void 0, function* () {
              const removedTask = this._buffer.splice(this._buffer.indexOf(task), 1)[0];
              return removedTask;
          });
      }
      /**
       * This function returns the number of unresolved promises in the queue.
       */
      length() {
          return this._buffer.length;
      }
      /**
       * This will drain the whole queue, returns true if queue is empty or drained.
       * If timeout is provided and the queue takes longer to drain, the promise still resolves but with false.
       *
       * @param timeout Number in ms to wait until it resolves with false.
       */
      drain(timeout) {
          return __awaiter(this, void 0, void 0, function* () {
              return new Promise(resolve => {
                  const capturedSetTimeout = setTimeout(() => {
                      if (timeout && timeout > 0) {
                          resolve(false);
                      }
                  }, timeout);
                  Promise.all(this._buffer)
                      .then(() => {
                      clearTimeout(capturedSetTimeout);
                      resolve(true);
                  })
                      .catch(() => {
                      resolve(true);
                  });
              });
          });
      }
  }

  /** Base Transport class implementation */
  class BaseTransport {
      constructor(options) {
          this.options = options;
          /** A simple buffer holding all requests. */
          this._buffer = new PromiseBuffer(30);
          this.url = new API(this.options.dsn).getStoreEndpointWithUrlEncodedAuth();
      }
      /**
       * @inheritDoc
       */
      sendEvent(_) {
          return __awaiter(this, void 0, void 0, function* () {
              throw new SentryError('Transport Class has to implement `sendEvent` method');
          });
      }
      /**
       * @inheritDoc
       */
      close(timeout) {
          return __awaiter(this, void 0, void 0, function* () {
              return this._buffer.drain(timeout);
          });
      }
  }

  const global$2 = getGlobalObject();
  /** `fetch` based transport */
  class FetchTransport extends BaseTransport {
      /**
       * @inheritDoc
       */
      sendEvent(event) {
          return __awaiter(this, void 0, void 0, function* () {
              const defaultOptions = {
                  body: JSON.stringify(event),
                  method: 'POST',
                  // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
                  // https://caniuse.com/#feat=referrer-policy
                  // It doesn't. And it throw exception instead of ignoring this parameter...
                  // REF: https://github.com/getsentry/raven-js/issues/1233
                  referrerPolicy: (supportsReferrerPolicy() ? 'origin' : ''),
              };
              return this._buffer.add(global$2.fetch(this.url, defaultOptions).then(response => ({
                  status: exports.Status.fromHttpCode(response.status),
              })));
          });
      }
  }

  /** `XHR` based transport */
  class XHRTransport extends BaseTransport {
      /**
       * @inheritDoc
       */
      sendEvent(event) {
          return __awaiter(this, void 0, void 0, function* () {
              return this._buffer.add(new Promise((resolve, reject) => {
                  const request = new XMLHttpRequest();
                  request.onreadystatechange = () => {
                      if (request.readyState !== 4) {
                          return;
                      }
                      if (request.status === 200) {
                          resolve({
                              status: exports.Status.fromHttpCode(request.status),
                          });
                      }
                      reject(request);
                  };
                  request.open('POST', this.url);
                  request.send(JSON.stringify(event));
              }));
          });
      }
  }



  var index = /*#__PURE__*/Object.freeze({
    BaseTransport: BaseTransport,
    FetchTransport: FetchTransport,
    XHRTransport: XHRTransport
  });

  /**
   * The Sentry Browser SDK Backend.
   * @hidden
   */
  class BrowserBackend extends BaseBackend {
      /**
       * @inheritDoc
       */
      _setupTransport() {
          if (!this._options.dsn) {
              // We return the noop transport here in case there is no Dsn.
              return super._setupTransport();
          }
          const transportOptions = this._options.transportOptions
              ? this._options.transportOptions
              : { dsn: this._options.dsn };
          if (this._options.transport) {
              return new this._options.transport(transportOptions);
          }
          if (supportsFetch()) {
              return new FetchTransport(transportOptions);
          }
          return new XHRTransport(transportOptions);
      }
      /**
       * @inheritDoc
       */
      eventFromException(exception, hint) {
          let event;
          if (isErrorEvent(exception) && exception.error) {
              // If it is an ErrorEvent with `error` property, extract it to get actual Error
              const errorEvent = exception;
              exception = errorEvent.error; // tslint:disable-line:no-parameter-reassignment
              event = eventFromStacktrace(computeStackTrace(exception));
              return SyncPromise.resolve(this._buildEvent(event, hint));
          }
          if (isDOMError(exception) || isDOMException(exception)) {
              // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
              // then we just extract the name and message, as they don't provide anything else
              // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
              // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
              const domException = exception;
              const name = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
              const message = domException.message ? `${name}: ${domException.message}` : name;
              return this.eventFromMessage(message, exports.Severity.Error, hint).then(messageEvent => {
                  addExceptionTypeValue(messageEvent, message);
                  return SyncPromise.resolve(this._buildEvent(messageEvent, hint));
              });
          }
          if (isError(exception)) {
              // we have a real Error object, do nothing
              event = eventFromStacktrace(computeStackTrace(exception));
              return SyncPromise.resolve(this._buildEvent(event, hint));
          }
          if (isPlainObject(exception) && hint && hint.syntheticException) {
              // If it is plain Object, serialize it manually and extract options
              // This will allow us to group events based on top-level keys
              // which is much better than creating new group when any key/value change
              const objectException = exception;
              event = eventFromPlainObject(objectException, hint.syntheticException);
              addExceptionTypeValue(event, 'Custom Object', undefined, {
                  handled: true,
                  synthetic: true,
                  type: 'generic',
              });
              event.level = exports.Severity.Error;
              return SyncPromise.resolve(this._buildEvent(event, hint));
          }
          // If none of previous checks were valid, then it means that
          // it's not a DOMError/DOMException
          // it's not a plain Object
          // it's not a valid ErrorEvent (one with an error property)
          // it's not an Error
          // So bail out and capture it as a simple message:
          const stringException = exception;
          return this.eventFromMessage(stringException, undefined, hint).then(messageEvent => {
              addExceptionTypeValue(messageEvent, `${stringException}`, undefined, {
                  handled: true,
                  synthetic: true,
                  type: 'generic',
              });
              messageEvent.level = exports.Severity.Error;
              return SyncPromise.resolve(this._buildEvent(messageEvent, hint));
          });
      }
      /**
       * This is an internal helper function that creates an event.
       */
      _buildEvent(event, hint) {
          return Object.assign({}, event, { event_id: hint && hint.event_id });
      }
      /**
       * @inheritDoc
       */
      eventFromMessage(message, level = exports.Severity.Info, hint) {
          const event = {
              event_id: hint && hint.event_id,
              level,
              message,
          };
          if (this._options.attachStacktrace && hint && hint.syntheticException) {
              const stacktrace = computeStackTrace(hint.syntheticException);
              const frames = prepareFramesForEvent(stacktrace.stack);
              event.stacktrace = {
                  frames,
              };
          }
          return SyncPromise.resolve(event);
      }
  }

  const SDK_NAME = 'sentry.javascript.browser';
  const SDK_VERSION = '5.0.5';

  /**
   * The Sentry Browser SDK Client.
   *
   * @see BrowserOptions for documentation on configuration options.
   * @see SentryClient for usage documentation.
   */
  class BrowserClient extends BaseClient {
      /**
       * Creates a new Browser SDK instance.
       *
       * @param options Configuration options for this SDK.
       */
      constructor(options = {}) {
          super(BrowserBackend, options);
      }
      /**
       * @inheritDoc
       */
      _prepareEvent(event, scope, hint) {
          event.platform = event.platform || 'javascript';
          event.sdk = Object.assign({}, event.sdk, { name: SDK_NAME, packages: [
                  ...((event.sdk && event.sdk.packages) || []),
                  {
                      name: 'npm:@sentry/browser',
                      version: SDK_VERSION,
                  },
              ], version: SDK_VERSION });
          return super._prepareEvent(event, scope, hint);
      }
      /**
       * Show a report dialog to the user to send feedback to a specific event.
       *
       * @param options Set individual options for the dialog
       */
      showReportDialog(options = {}) {
          // doesn't work without a document (React Native)
          const document = getGlobalObject().document;
          if (!document) {
              return;
          }
          if (!this._isEnabled()) {
              logger.error('Trying to call showReportDialog with Sentry Client is disabled');
              return;
          }
          const dsn = options.dsn || this.getDsn();
          if (!options.eventId) {
              logger.error('Missing `eventId` option in showReportDialog call');
              return;
          }
          if (!dsn) {
              logger.error('Missing `Dsn` option in showReportDialog call');
              return;
          }
          const script = document.createElement('script');
          script.async = true;
          script.src = new API(dsn).getReportDialogEndpoint(options);
          (document.head || document.body).appendChild(script);
      }
  }

  const debounceDuration = 1000;
  let keypressTimeout;
  let lastCapturedEvent;
  let ignoreOnError = 0;
  /**
   * @hidden
   */
  function shouldIgnoreOnError() {
      return ignoreOnError > 0;
  }
  /**
   * @hidden
   */
  function ignoreNextOnError() {
      // onerror should trigger before setTimeout
      ignoreOnError += 1;
      setTimeout(() => {
          ignoreOnError -= 1;
      });
  }
  /**
   * Instruments the given function and sends an event to Sentry every time the
   * function throws an exception.
   *
   * @param fn A function to wrap.
   * @returns The wrapped function.
   * @hidden
   */
  function wrap(fn, options = {}, before) {
      // tslint:disable-next-line:strict-type-predicates
      if (typeof fn !== 'function') {
          return fn;
      }
      try {
          // We don't wanna wrap it twice
          if (fn.__sentry__) {
              return fn;
          }
          // If this has already been wrapped in the past, return that wrapped function
          if (fn.__sentry_wrapped__) {
              return fn.__sentry_wrapped__;
          }
      }
      catch (e) {
          // Just accessing custom props in some Selenium environments
          // can cause a "Permission denied" exception (see raven-js#495).
          // Bail on wrapping and return the function as-is (defers to window.onerror).
          return fn;
      }
      const sentryWrapped = function () {
          // tslint:disable-next-line:strict-type-predicates
          if (before && typeof before === 'function') {
              before.apply(this, arguments);
          }
          const args = Array.prototype.slice.call(arguments);
          try {
              // Attempt to invoke user-land function
              // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
              //       means Raven caught an error invoking your application code. This is
              //       expected behavior and NOT indicative of a bug with Raven.js.
              const wrappedArguments = args.map((arg) => wrap(arg, options));
              if (fn.handleEvent) {
                  return fn.handleEvent.apply(this, wrappedArguments);
              }
              return fn.apply(this, wrappedArguments);
          }
          catch (ex) {
              ignoreNextOnError();
              withScope(scope => {
                  scope.addEventProcessor((event) => {
                      const processedEvent = Object.assign({}, event);
                      if (options.mechanism) {
                          addExceptionTypeValue(processedEvent, undefined, undefined, options.mechanism);
                      }
                      processedEvent.extra = Object.assign({}, processedEvent.extra, { arguments: normalize(args, 3) });
                      return processedEvent;
                  });
                  captureException(ex);
              });
              throw ex;
          }
      };
      // Accessing some objects may throw
      // ref: https://github.com/getsentry/sentry-javascript/issues/1168
      try {
          for (const property in fn) {
              if (Object.prototype.hasOwnProperty.call(fn, property)) {
                  sentryWrapped[property] = fn[property];
              }
          }
      }
      catch (_oO) { } // tslint:disable-line:no-empty
      fn.prototype = fn.prototype || {};
      sentryWrapped.prototype = fn.prototype;
      Object.defineProperty(fn, '__sentry_wrapped__', {
          enumerable: false,
          value: sentryWrapped,
      });
      // Signal that this function has been wrapped/filled already
      // for both debugging and to prevent it to being wrapped/filled twice
      Object.defineProperties(sentryWrapped, {
          __sentry__: {
              enumerable: false,
              value: true,
          },
          __sentry_original__: {
              enumerable: false,
              value: fn,
          },
      });
      // Restore original function name (not all browsers allow that)
      try {
          Object.defineProperty(sentryWrapped, 'name', {
              get() {
                  return fn.name;
              },
          });
      }
      catch (_oO) {
          /*no-empty*/
      }
      return sentryWrapped;
  }
  /**
   * Wraps addEventListener to capture UI breadcrumbs
   * @param eventName the event name (e.g. "click")
   * @returns wrapped breadcrumb events handler
   * @hidden
   */
  function breadcrumbEventHandler(eventName) {
      return (event) => {
          // reset keypress timeout; e.g. triggering a 'click' after
          // a 'keypress' will reset the keypress debounce so that a new
          // set of keypresses can be recorded
          keypressTimeout = undefined;
          // It's possible this handler might trigger multiple times for the same
          // event (e.g. event propagation through node ancestors). Ignore if we've
          // already captured the event.
          if (lastCapturedEvent === event) {
              return;
          }
          lastCapturedEvent = event;
          // try/catch both:
          // - accessing event.target (see getsentry/raven-js#838, #768)
          // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
          //   can throw an exception in some circumstances.
          let target;
          try {
              target = htmlTreeAsString(event.target);
          }
          catch (e) {
              target = '<unknown>';
          }
          getCurrentHub().addBreadcrumb({
              category: `ui.${eventName}`,
              message: target,
          }, {
              event,
              name: eventName,
          });
      };
  }
  /**
   * Wraps addEventListener to capture keypress UI events
   * @returns wrapped keypress events handler
   * @hidden
   */
  function keypressEventHandler() {
      // TODO: if somehow user switches keypress target before
      //       debounce timeout is triggered, we will only capture
      //       a single breadcrumb from the FIRST target (acceptable?)
      return (event) => {
          let target;
          try {
              target = event.target;
          }
          catch (e) {
              // just accessing event properties can throw an exception in some rare circumstances
              // see: https://github.com/getsentry/raven-js/issues/838
              return;
          }
          const tagName = target && target.tagName;
          // only consider keypress events on actual input elements
          // this will disregard keypresses targeting body (e.g. tabbing
          // through elements, hotkeys, etc)
          if (!tagName || (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && !target.isContentEditable)) {
              return;
          }
          // record first keypress in a series, but ignore subsequent
          // keypresses until debounce clears
          if (!keypressTimeout) {
              breadcrumbEventHandler('input')(event);
          }
          clearTimeout(keypressTimeout);
          keypressTimeout = setTimeout(() => {
              keypressTimeout = undefined;
          }, debounceDuration);
      };
  }

  /** Global handlers */
  class GlobalHandlers {
      /** JSDoc */
      constructor(options) {
          /**
           * @inheritDoc
           */
          this.name = GlobalHandlers.id;
          this._options = Object.assign({ onerror: true, onunhandledrejection: true }, options);
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
          Error.stackTraceLimit = 50;
          subscribe((stack, _, error) => {
              // TODO: use stack.context to get a valuable information from TraceKit, eg.
              // [
              //   0: "  })"
              //   1: ""
              //   2: "  function foo () {"
              //   3: "    Sentry.captureException('some error')"
              //   4: "    Sentry.captureMessage('some message')"
              //   5: "    throw 'foo'"
              //   6: "  }"
              //   7: ""
              //   8: "  function bar () {"
              //   9: "    foo();"
              //   10: "  }"
              // ]
              if (shouldIgnoreOnError()) {
                  return;
              }
              const self = getCurrentHub().getIntegration(GlobalHandlers);
              if (self) {
                  getCurrentHub().captureEvent(self._eventFromGlobalHandler(stack), {
                      data: { stack },
                      originalException: error,
                  });
              }
          });
          if (this._options.onerror) {
              logger.log('Global Handler attached: onerror');
              installGlobalHandler();
          }
          if (this._options.onunhandledrejection) {
              logger.log('Global Handler attached: onunhandledrejection');
              installGlobalUnhandledRejectionHandler();
          }
      }
      /**
       * This function creates an Event from an TraceKitStackTrace.
       *
       * @param stacktrace TraceKitStackTrace to be converted to an Event.
       */
      _eventFromGlobalHandler(stacktrace) {
          const event = eventFromStacktrace(stacktrace);
          const data = {
              mode: stacktrace.mode,
          };
          if (stacktrace.message) {
              data.message = stacktrace.message;
          }
          if (stacktrace.name) {
              data.name = stacktrace.name;
          }
          const client = getCurrentHub().getClient();
          const maxValueLength = (client && client.getOptions().maxValueLength) || 250;
          const fallbackValue = stacktrace.original
              ? truncate(JSON.stringify(normalize(stacktrace.original)), maxValueLength)
              : '';
          const fallbackType = stacktrace.mechanism === 'onunhandledrejection' ? 'UnhandledRejection' : 'Error';
          // This makes sure we have type/value in every exception
          addExceptionTypeValue(event, fallbackValue, fallbackType, {
              data,
              handled: false,
              type: stacktrace.mechanism,
          });
          return event;
      }
  }
  /**
   * @inheritDoc
   */
  GlobalHandlers.id = 'GlobalHandlers';

  /** Wrap timer functions and event targets to catch errors and provide better meta data */
  class TryCatch {
      constructor() {
          /** JSDoc */
          this._ignoreOnError = 0;
          /**
           * @inheritDoc
           */
          this.name = TryCatch.id;
      }
      /** JSDoc */
      _wrapTimeFunction(original) {
          return function (...args) {
              const originalCallback = args[0];
              args[0] = wrap(originalCallback, {
                  mechanism: {
                      data: { function: getFunctionName(original) },
                      handled: true,
                      type: 'instrument',
                  },
              });
              return original.apply(this, args);
          };
      }
      /** JSDoc */
      _wrapRAF(original) {
          return function (callback) {
              return original(wrap(callback, {
                  mechanism: {
                      data: {
                          function: 'requestAnimationFrame',
                          handler: getFunctionName(original),
                      },
                      handled: true,
                      type: 'instrument',
                  },
              }));
          };
      }
      /** JSDoc */
      _wrapEventTarget(target) {
          const global = getGlobalObject();
          const proto = global[target] && global[target].prototype;
          if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
              return;
          }
          fill(proto, 'addEventListener', function (original) {
              return function (eventName, fn, options) {
                  try {
                      fn.handleEvent = wrap(fn.handleEvent.bind(fn), {
                          mechanism: {
                              data: {
                                  function: 'handleEvent',
                                  handler: getFunctionName(fn),
                                  target,
                              },
                              handled: true,
                              type: 'instrument',
                          },
                      });
                  }
                  catch (err) {
                      // can sometimes get 'Permission denied to access property "handle Event'
                  }
                  // More breadcrumb DOM capture ... done here and not in `_instrumentBreadcrumbs`
                  // so that we don't have more than one wrapper function
                  let before;
                  let clickHandler;
                  let keypressHandler;
                  if (target === 'EventTarget' || target === 'Node') {
                      // NOTE: generating multiple handlers per addEventListener invocation, should
                      //       revisit and verify we can just use one (almost certainly)
                      clickHandler = breadcrumbEventHandler('click');
                      keypressHandler = keypressEventHandler();
                      before = function (event) {
                          // need to intercept every DOM event in `before` argument, in case that
                          // same wrapped method is re-used for different events (e.g. mousemove THEN click)
                          // see #724
                          if (!event) {
                              return;
                          }
                          let eventType;
                          try {
                              eventType = event.type;
                          }
                          catch (e) {
                              // just accessing event properties can throw an exception in some rare circumstances
                              // see: https://github.com/getsentry/raven-js/issues/838
                              return;
                          }
                          if (eventType === 'click') {
                              return clickHandler(event);
                          }
                          if (eventType === 'keypress') {
                              return keypressHandler(event);
                          }
                      };
                  }
                  return original.call(this, eventName, wrap(fn, {
                      mechanism: {
                          data: {
                              function: 'addEventListener',
                              handler: getFunctionName(fn),
                              target,
                          },
                          handled: true,
                          type: 'instrument',
                      },
                  }, before), options);
              };
          });
          fill(proto, 'removeEventListener', function (original) {
              return function (eventName, fn, options) {
                  let callback = fn;
                  try {
                      callback = callback && (callback.__sentry_wrapped__ || callback);
                  }
                  catch (e) {
                      // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
                  }
                  return original.call(this, eventName, callback, options);
              };
          });
      }
      /**
       * Wrap timer functions and event targets to catch errors
       * and provide better metadata.
       */
      setupOnce() {
          this._ignoreOnError = this._ignoreOnError;
          const global = getGlobalObject();
          fill(global, 'setTimeout', this._wrapTimeFunction.bind(this));
          fill(global, 'setInterval', this._wrapTimeFunction.bind(this));
          fill(global, 'requestAnimationFrame', this._wrapRAF.bind(this));
          [
              'EventTarget',
              'Window',
              'Node',
              'ApplicationCache',
              'AudioTrackList',
              'ChannelMergerNode',
              'CryptoOperation',
              'EventSource',
              'FileReader',
              'HTMLUnknownElement',
              'IDBDatabase',
              'IDBRequest',
              'IDBTransaction',
              'KeyOperation',
              'MediaController',
              'MessagePort',
              'ModalWindow',
              'Notification',
              'SVGElementInstance',
              'Screen',
              'TextTrack',
              'TextTrackCue',
              'TextTrackList',
              'WebSocket',
              'WebSocketWorker',
              'Worker',
              'XMLHttpRequest',
              'XMLHttpRequestEventTarget',
              'XMLHttpRequestUpload',
          ].forEach(this._wrapEventTarget.bind(this));
      }
  }
  /**
   * @inheritDoc
   */
  TryCatch.id = 'TryCatch';
  /**
   * Safely extract function name from itself
   */
  function getFunctionName(fn) {
      try {
          return (fn && fn.name) || '<anonymous>';
      }
      catch (e) {
          // Just accessing custom props in some Selenium environments
          // can cause a "Permission denied" exception (see raven-js#495).
          return '<anonymous>';
      }
  }

  const global$3 = getGlobalObject();
  let lastHref;
  /** Default Breadcrumbs instrumentations */
  class Breadcrumbs {
      /**
       * @inheritDoc
       */
      constructor(options) {
          /**
           * @inheritDoc
           */
          this.name = Breadcrumbs.id;
          this._options = Object.assign({ console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true }, options);
      }
      /** JSDoc */
      _instrumentConsole() {
          if (!('console' in global$3)) {
              return;
          }
          ['debug', 'info', 'warn', 'error', 'log'].forEach(function (level) {
              if (!(level in global$3.console)) {
                  return;
              }
              fill(global$3.console, level, function (originalConsoleLevel) {
                  return function (...args) {
                      const breadcrumbData = {
                          category: 'console',
                          data: {
                              extra: {
                                  arguments: normalize(args, 3),
                              },
                              logger: 'console',
                          },
                          level: exports.Severity.fromString(level),
                          message: safeJoin(args, ' '),
                      };
                      if (level === 'assert') {
                          if (args[0] === false) {
                              breadcrumbData.message = `Assertion failed: ${safeJoin(args.slice(1), ' ') || 'console.assert'}`;
                              breadcrumbData.data.extra.arguments = normalize(args.slice(1), 3);
                          }
                      }
                      Breadcrumbs.addBreadcrumb(breadcrumbData, {
                          input: args,
                          level,
                      });
                      // this fails for some browsers. :(
                      if (originalConsoleLevel) {
                          Function.prototype.apply.call(originalConsoleLevel, global$3.console, args);
                      }
                  };
              });
          });
      }
      /** JSDoc */
      _instrumentDOM() {
          if (!('document' in global$3)) {
              return;
          }
          // Capture breadcrumbs from any click that is unhandled / bubbled up all the way
          // to the document. Do this before we instrument addEventListener.
          global$3.document.addEventListener('click', breadcrumbEventHandler('click'), false);
          global$3.document.addEventListener('keypress', keypressEventHandler(), false);
      }
      /** JSDoc */
      _instrumentFetch() {
          if (!supportsNativeFetch()) {
              return;
          }
          fill(global$3, 'fetch', function (originalFetch) {
              return function (...args) {
                  const fetchInput = args[0];
                  let method = 'GET';
                  let url;
                  if (typeof fetchInput === 'string') {
                      url = fetchInput;
                  }
                  else if ('Request' in global$3 && fetchInput instanceof Request) {
                      url = fetchInput.url;
                      if (fetchInput.method) {
                          method = fetchInput.method;
                      }
                  }
                  else {
                      url = String(fetchInput);
                  }
                  if (args[1] && args[1].method) {
                      method = args[1].method;
                  }
                  const client = getCurrentHub().getClient();
                  const dsn = client && client.getDsn();
                  if (dsn) {
                      const filterUrl = new API(dsn).getStoreEndpoint();
                      // if Sentry key appears in URL, don't capture it as a request
                      // but rather as our own 'sentry' type breadcrumb
                      if (filterUrl && url.includes(filterUrl)) {
                          if (method === 'POST' && args[1] && args[1].body) {
                              addSentryBreadcrumb(args[1].body);
                          }
                          return originalFetch.apply(global$3, args);
                      }
                  }
                  const fetchData = {
                      method,
                      url,
                  };
                  return originalFetch
                      .apply(global$3, args)
                      .then((response) => {
                      fetchData.status_code = response.status;
                      Breadcrumbs.addBreadcrumb({
                          category: 'fetch',
                          data: fetchData,
                          type: 'http',
                      }, {
                          input: args,
                          response,
                      });
                      return response;
                  })
                      .catch((error) => {
                      Breadcrumbs.addBreadcrumb({
                          category: 'fetch',
                          data: fetchData,
                          level: exports.Severity.Error,
                          type: 'http',
                      }, {
                          error,
                          input: args,
                      });
                      throw error;
                  });
              };
          });
      }
      /** JSDoc */
      _instrumentHistory() {
          if (!supportsHistory()) {
              return;
          }
          const captureUrlChange = (from, to) => {
              const parsedLoc = parseUrl(global$3.location.href);
              const parsedTo = parseUrl(to);
              let parsedFrom = parseUrl(from);
              // Initial pushState doesn't provide `from` information
              if (!parsedFrom.path) {
                  parsedFrom = parsedLoc;
              }
              // because onpopstate only tells you the "new" (to) value of location.href, and
              // not the previous (from) value, we need to track the value of the current URL
              // state ourselves
              lastHref = to;
              // Use only the path component of the URL if the URL matches the current
              // document (almost all the time when using pushState)
              if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
                  // tslint:disable-next-line:no-parameter-reassignment
                  to = parsedTo.relative;
              }
              if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
                  // tslint:disable-next-line:no-parameter-reassignment
                  from = parsedFrom.relative;
              }
              Breadcrumbs.addBreadcrumb({
                  category: 'navigation',
                  data: {
                      from,
                      to,
                  },
              });
          };
          // record navigation (URL) changes
          const oldOnPopState = global$3.onpopstate;
          global$3.onpopstate = (...args) => {
              const currentHref = global$3.location.href;
              captureUrlChange(lastHref, currentHref);
              if (oldOnPopState) {
                  return oldOnPopState.apply(this, args);
              }
          };
          /**
           * @hidden
           */
          function historyReplacementFunction(originalHistoryFunction) {
              // note history.pushState.length is 0; intentionally not declaring
              // params to preserve 0 arity
              return function (...args) {
                  const url = args.length > 2 ? args[2] : undefined;
                  // url argument is optional
                  if (url) {
                      // coerce to string (this is what pushState does)
                      captureUrlChange(lastHref, String(url));
                  }
                  return originalHistoryFunction.apply(this, args);
              };
          }
          fill(global$3.history, 'pushState', historyReplacementFunction);
          fill(global$3.history, 'replaceState', historyReplacementFunction);
      }
      /** JSDoc */
      _instrumentXHR() {
          if (!('XMLHttpRequest' in global$3)) {
              return;
          }
          /**
           * @hidden
           */
          function wrapProp(prop, xhr) {
              // TODO: Fix XHR types
              if (prop in xhr && typeof xhr[prop] === 'function') {
                  fill(xhr, prop, original => wrap(original, {
                      mechanism: {
                          data: {
                              function: prop,
                              handler: (original && original.name) || '<anonymous>',
                          },
                          handled: true,
                          type: 'instrument',
                      },
                  }));
              }
          }
          const xhrproto = XMLHttpRequest.prototype;
          fill(xhrproto, 'open', originalOpen => function (...args) {
              const url = args[1];
              this.__sentry_xhr__ = {
                  method: args[0],
                  url: args[1],
              };
              const client = getCurrentHub().getClient();
              const dsn = client && client.getDsn();
              if (dsn) {
                  const filterUrl = new API(dsn).getStoreEndpoint();
                  // if Sentry key appears in URL, don't capture it as a request
                  // but rather as our own 'sentry' type breadcrumb
                  if (isString(url) && (filterUrl && url.includes(filterUrl))) {
                      this.__sentry_own_request__ = true;
                  }
              }
              return originalOpen.apply(this, args);
          });
          fill(xhrproto, 'send', originalSend => function (...args) {
              const xhr = this; // tslint:disable-line:no-this-assignment
              if (xhr.__sentry_own_request__) {
                  addSentryBreadcrumb(args[0]);
              }
              /**
               * @hidden
               */
              function onreadystatechangeHandler() {
                  if (xhr.readyState === 4) {
                      if (xhr.__sentry_own_request__) {
                          return;
                      }
                      try {
                          // touching statusCode in some platforms throws
                          // an exception
                          if (xhr.__sentry_xhr__) {
                              xhr.__sentry_xhr__.status_code = xhr.status;
                          }
                      }
                      catch (e) {
                          /* do nothing */
                      }
                      Breadcrumbs.addBreadcrumb({
                          category: 'xhr',
                          data: xhr.__sentry_xhr__,
                          type: 'http',
                      }, {
                          xhr,
                      });
                  }
              }
              ['onload', 'onerror', 'onprogress'].forEach(prop => {
                  wrapProp(prop, xhr);
              });
              if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
                  fill(xhr, 'onreadystatechange', function (original) {
                      return wrap(original, {
                          mechanism: {
                              data: {
                                  function: 'onreadystatechange',
                                  handler: (original && original.name) || '<anonymous>',
                              },
                              handled: true,
                              type: 'instrument',
                          },
                      }, onreadystatechangeHandler);
                  });
              }
              else {
                  // if onreadystatechange wasn't actually set by the page on this xhr, we
                  // are free to set our own and capture the breadcrumb
                  xhr.onreadystatechange = onreadystatechangeHandler;
              }
              return originalSend.apply(this, args);
          });
      }
      /**
       * Helper that checks if integration is enabled on the client.
       * @param breadcrumb Breadcrumb
       * @param hint BreadcrumbHint
       */
      static addBreadcrumb(breadcrumb, hint) {
          if (getCurrentHub().getIntegration(Breadcrumbs)) {
              getCurrentHub().addBreadcrumb(breadcrumb, hint);
          }
      }
      /**
       * Instrument browser built-ins w/ breadcrumb capturing
       *  - Console API
       *  - DOM API (click/typing)
       *  - XMLHttpRequest API
       *  - Fetch API
       *  - History API
       */
      setupOnce() {
          if (this._options.console) {
              this._instrumentConsole();
          }
          if (this._options.dom) {
              this._instrumentDOM();
          }
          if (this._options.xhr) {
              this._instrumentXHR();
          }
          if (this._options.fetch) {
              this._instrumentFetch();
          }
          if (this._options.history) {
              this._instrumentHistory();
          }
      }
  }
  /**
   * @inheritDoc
   */
  Breadcrumbs.id = 'Breadcrumbs';
  /** JSDoc */
  function addSentryBreadcrumb(serializedData) {
      // There's always something that can go wrong with deserialization...
      try {
          const event = JSON.parse(serializedData);
          Breadcrumbs.addBreadcrumb({
              category: 'sentry',
              event_id: event.event_id,
              level: event.level || exports.Severity.fromString('error'),
              message: getEventDescription(event),
          }, {
              event,
          });
      }
      catch (_oO) {
          logger.error('Error while adding sentry type breadcrumb');
      }
  }

  const DEFAULT_KEY = 'cause';
  const DEFAULT_LIMIT = 5;
  /** Adds SDK info to an event. */
  class LinkedErrors {
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
          /**
           * @inheritDoc
           */
          this.name = LinkedErrors.id;
          this._key = options.key || DEFAULT_KEY;
          this._limit = options.limit || DEFAULT_LIMIT;
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
          addGlobalEventProcessor((event, hint) => {
              const self = getCurrentHub().getIntegration(LinkedErrors);
              if (self) {
                  return self.handler(event, hint);
              }
              return event;
          });
      }
      /**
       * @inheritDoc
       */
      handler(event, hint) {
          if (!event.exception || !event.exception.values || !hint || !(hint.originalException instanceof Error)) {
              return event;
          }
          const linkedErrors = this.walkErrorTree(hint.originalException, this._key);
          event.exception.values = [...linkedErrors, ...event.exception.values];
          return event;
      }
      /**
       * @inheritDoc
       */
      walkErrorTree(error, key, stack = []) {
          if (!(error[key] instanceof Error) || stack.length + 1 >= this._limit) {
              return stack;
          }
          const stacktrace = computeStackTrace(error[key]);
          const exception = exceptionFromStacktrace(stacktrace);
          return this.walkErrorTree(error[key], key, [exception, ...stack]);
      }
  }
  /**
   * @inheritDoc
   */
  LinkedErrors.id = 'LinkedErrors';

  const global$4 = getGlobalObject();
  /** UserAgent */
  class UserAgent {
      constructor() {
          /**
           * @inheritDoc
           */
          this.name = UserAgent.id;
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
          addGlobalEventProcessor((event) => {
              if (getCurrentHub().getIntegration(UserAgent)) {
                  if (!global$4.navigator || !global$4.location) {
                      return event;
                  }
                  // HTTP Interface: https://docs.sentry.io/clientdev/interfaces/http/?platform=javascript
                  const request = event.request || {};
                  request.url = request.url || global$4.location.href;
                  request.headers = request.headers || {};
                  request.headers['User-Agent'] = global$4.navigator.userAgent;
                  return Object.assign({}, event, { request });
              }
              return event;
          });
      }
  }
  /**
   * @inheritDoc
   */
  UserAgent.id = 'UserAgent';



  var BrowserIntegrations = /*#__PURE__*/Object.freeze({
    GlobalHandlers: GlobalHandlers,
    TryCatch: TryCatch,
    Breadcrumbs: Breadcrumbs,
    LinkedErrors: LinkedErrors,
    UserAgent: UserAgent
  });

  const defaultIntegrations = [
      new InboundFilters(),
      new FunctionToString(),
      new TryCatch(),
      new Breadcrumbs(),
      new GlobalHandlers(),
      new LinkedErrors(),
      new UserAgent(),
  ];
  /**
   * The Sentry Browser SDK Client.
   *
   * To use this SDK, call the {@link init} function as early as possible when
   * loading the web page. To set context information or send manual events, use
   * the provided methods.
   *
   * @example
   *
   * ```
   *
   * import { init } from '@sentry/browser';
   *
   * init({
   *   dsn: '__DSN__',
   *   // ...
   * });
   * ```
   *
   * @example
   * ```
   *
   * import { configureScope } from '@sentry/browser';
   * configureScope((scope: Scope) => {
   *   scope.setExtra({ battery: 0.7 });
   *   scope.setTag({ user_mode: 'admin' });
   *   scope.setUser({ id: '4711' });
   * });
   * ```
   *
   * @example
   * ```
   *
   * import { addBreadcrumb } from '@sentry/browser';
   * addBreadcrumb({
   *   message: 'My Breadcrumb',
   *   // ...
   * });
   * ```
   *
   * @example
   *
   * ```
   *
   * import * as Sentry from '@sentry/browser';
   * Sentry.captureMessage('Hello, world!');
   * Sentry.captureException(new Error('Good bye'));
   * Sentry.captureEvent({
   *   message: 'Manual',
   *   stacktrace: [
   *     // ...
   *   ],
   * });
   * ```
   *
   * @see {@link BrowserOptions} for documentation on configuration options.
   */
  function init(options = {}) {
      if (options.defaultIntegrations === undefined) {
          options.defaultIntegrations = defaultIntegrations;
      }
      initAndBind(BrowserClient, options);
  }
  /**
   * Present the user with a report dialog.
   *
   * @param options Everything is optional, we try to fetch all info need from the global scope.
   */
  function showReportDialog(options = {}) {
      if (!options.eventId) {
          options.eventId = getCurrentHub().lastEventId();
      }
      const client = getCurrentHub().getClient();
      if (client) {
          client.showReportDialog(options);
      }
  }
  /**
   * This is the getter for lastEventId.
   *
   * @returns The last event id of a captured event.
   */
  function lastEventId() {
      return getCurrentHub().lastEventId();
  }
  /**
   * This function is here to be API compatible with the loader.
   * @hidden
   */
  function forceLoad() {
      // Noop
  }
  /**
   * This function is here to be API compatible with the loader.
   * @hidden
   */
  function onLoad(callback) {
      callback();
  }
  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout Maximum time in ms the client should wait.
   */
  function flush(timeout) {
      return __awaiter(this, void 0, void 0, function* () {
          const client = getCurrentHub().getClient();
          if (client) {
              return client.flush(timeout);
          }
          return Promise.reject(false);
      });
  }
  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout Maximum time in ms the client should wait.
   */
  function close(timeout) {
      return __awaiter(this, void 0, void 0, function* () {
          const client = getCurrentHub().getClient();
          if (client) {
              return client.close(timeout);
          }
          return Promise.reject(false);
      });
  }

  let windowIntegrations = {};
  // tslint:disable: no-unsafe-any
  const _window = getGlobalObject();
  if (_window.Sentry && _window.Sentry.Integrations) {
      windowIntegrations = _window.Sentry.Integrations;
  }
  // tslint:enable: no-unsafe-any
  const INTEGRATIONS = Object.assign({}, windowIntegrations, CoreIntegrations, BrowserIntegrations);

  exports.Integrations = INTEGRATIONS;
  exports.Transports = index;
  exports.addGlobalEventProcessor = addGlobalEventProcessor;
  exports.addBreadcrumb = addBreadcrumb;
  exports.captureException = captureException;
  exports.captureEvent = captureEvent;
  exports.captureMessage = captureMessage;
  exports.configureScope = configureScope;
  exports.withScope = withScope;
  exports.getHubFromCarrier = getHubFromCarrier;
  exports.getCurrentHub = getCurrentHub;
  exports.Hub = Hub;
  exports.Scope = Scope;
  exports.BrowserClient = BrowserClient;
  exports.defaultIntegrations = defaultIntegrations;
  exports.forceLoad = forceLoad;
  exports.init = init;
  exports.lastEventId = lastEventId;
  exports.onLoad = onLoad;
  exports.showReportDialog = showReportDialog;
  exports.flush = flush;
  exports.close = close;
  exports.SDK_NAME = SDK_NAME;
  exports.SDK_VERSION = SDK_VERSION;

  return exports;

}({}));
//# sourceMappingURL=bundle.es6.js.map
