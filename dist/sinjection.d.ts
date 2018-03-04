export default class Injection {
    nameOfDependency: string;
    functions: {
        [name: string]: Function;
    };
    instances: {
        [name: string]: any;
    };
    constructor(nameOfDependency?: string);
    set(name: string, func: Function): Injection;
    get<T>(name: string): T;
    build(): void;
}
