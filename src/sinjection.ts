export default class Injection {

    nameOfDependency: string;

    functions: { [name : string] : Function };
    instances: { [name : string] : any };

    constructor(nameOfDependency?: string) {
        this.nameOfDependency = nameOfDependency || '$inject';
        this.functions = {};
        this.instances = {};
    }

    set(name: string, func: Function) : Injection {
        if (func === null) func = undefined;
        if (typeof func != 'function' && typeof func != 'undefined') {
            throw new Error('Provided func argument is not a function.');
        }
        this.functions[name] = func;
        return this;
    }

    get<T>(name: string) : T {
        return this.instances[name] as T;
    }

    build() {
        var instances: { [name : string] : any } = {};
        var waiters: { [name : string] : boolean } = {};

        var buildService = (name: string, requiredByAka?: string): any => {
            var service = instances[name];
            if (service) return service;

            var func = this.functions[name];
            if (typeof func != 'function') {
                throw new Error(`Entry "${name}" required by ${requiredByAka} is not defined.`);
            }

            var args: any[] = [];

            var $inject = (func as any)[this.nameOfDependency];
            if ($inject) {
                if ($inject instanceof Array) {
                    waiters[name] = true;
                    $inject.forEach((n) => {
                        if (waiters[n]) {
                            throw new Error(`Circular dependency of ${
                                Object.keys(waiters).map((name) => {
                                    return `"${name}" (${(this.functions[name] as any).name})`;
                                }).join(', ')
                            }.`);
                        }
                        args.push(buildService(n, `"${name}" (${(func as any).name})`));
                    });
                    delete waiters[name];
                }
                else {
                    throw new Error(`${this.nameOfDependency} property of entry "${name}" (${(func as any).name}) must be an array of strings.`);
                }
            }

            service = instances[name] = new (Function.prototype.bind.apply(func, [null].concat(args)));
            return service;
        };

        Object.keys(this.functions).forEach((name) => {
            buildService(name);
        });

        this.instances = instances;
    }
}