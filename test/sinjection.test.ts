import Injection from '../src/sinjection';
import { expect } from 'chai';

interface G {
    get(): string;
}
class A implements G {
    constructor() {}
    get(): string {
        return 'A';
    }
}
class B implements G {
    constructor() {}
    get(): string {
        return 'B';
    }
}
class C implements G {
    g: G;
    static $inject = ['@c'];
    static $inject2 = ['@c2'];
    constructor(g: G) {
        this.g = g;
    }
    get(): string {
        return 'C' + this.g.get();
    }
}
class CF {
    static $inject = 'fail';
    constructor() {}
    get(): string {
        return 'B';
    }
}
class D implements G {
    g: G;
    static $inject = ['@d'];
    constructor(g: G) {
        this.g = g;
    }
    get(): string {
        return 'D' + this.g.get();
    }
}

class E implements G {
    g: G;
    static $inject = ['*'];
    constructor(g: G) {
        this.g = g;
    }
    get(): string {
        return 'D' + this.g.get();
    }
}

describe('Injection', () => {
    it('should successfully inject', () => {
        var injection = new Injection();
        injection.set('*', C).set('@c', A).set('@c2', B);
        injection.build();
        expect(injection.get<G>('*').get()).equal('CA');
        injection.nameOfDependency += '2';
        injection.build();
        expect(injection.get<G>('*').get()).equal('CB');
    });
    it('should failed to inject', () => {
        var injection = new Injection();
        expect(() => {
            injection.set('1', (2 as any))
        }).to.throw('Provided func argument is not a function.');

        injection.set('*', C);
        expect(() => {
            injection.build()
        }).to.throw('Entry "@c" required by "*" (C) is not defined.');

        injection.set('@c', CF);
        expect(() => {
            injection.build()
        }).to.throw('$inject property of entry "@c" (CF) must be an array of strings.');

        injection.set('@c', E);
        injection.set('@d', null);
        expect(() => {
            injection.build()
        }).to.throw('Circular dependency of "*" (C), "@c" (E).');
    });
});