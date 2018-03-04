(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Injection = /** @class */ (function () {
        function Injection(nameOfDependency) {
            this.nameOfDependency = nameOfDependency || '$inject';
            this.functions = {};
            this.instances = {};
        }
        Injection.prototype.set = function (name, func) {
            if (func === null)
                func = undefined;
            if (typeof func != 'function' && typeof func != 'undefined') {
                throw new Error('Provided func argument is not a function.');
            }
            this.functions[name] = func;
            return this;
        };
        Injection.prototype.get = function (name) {
            return this.instances[name];
        };
        Injection.prototype.build = function () {
            var _this = this;
            var instances = {};
            var waiters = {};
            var buildService = function (name, requiredByAka) {
                var service = instances[name];
                if (service)
                    return service;
                var func = _this.functions[name];
                if (typeof func != 'function') {
                    throw new Error("Entry \"" + name + "\" required by " + requiredByAka + " is not defined.");
                }
                var args = [];
                var $inject = func[_this.nameOfDependency];
                if ($inject) {
                    if ($inject instanceof Array) {
                        waiters[name] = true;
                        $inject.forEach(function (n) {
                            if (waiters[n]) {
                                throw new Error("Circular dependency of " + Object.keys(waiters).map(function (name) {
                                    return "\"" + name + "\" (" + _this.functions[name].name + ")";
                                }).join(', ') + ".");
                            }
                            args.push(buildService(n, "\"" + name + "\" (" + func.name + ")"));
                        });
                        delete waiters[name];
                    }
                    else {
                        throw new Error(_this.nameOfDependency + " property of entry \"" + name + "\" (" + func.name + ") must be an array of strings.");
                    }
                }
                service = instances[name] = new (Function.prototype.bind.apply(func, [null].concat(args)));
                return service;
            };
            Object.keys(this.functions).forEach(function (name) {
                buildService(name);
            });
            this.instances = instances;
        };
        return Injection;
    }());
    exports.default = Injection;
});
