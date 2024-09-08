export class Fraction {
    #num: number;
    #den: number;

    constructor(input: [number, number]) {
        [this.#num, this.#den] = input;
    }

    value(): [number, number] {
        const gcd = (a: number, b: number): number => {
            const [min, max] = [Math.min(a, b), Math.max(a, b)];
            return max % min === 0 ? min : gcd(min, max % min);
        }
        return [
            this.#num / gcd(this.#num, this.#den),
            this.#den / gcd(this.#num, this.#den)
        ];
    }

    toString(): string {
        if (this.#den === 1) return `${this.#num}`;
        if (this.#num > this.#den) return `${Math.floor(this.#num / this.#den)} ${this.#num % this.#den}/${this.#den}`;
        return `${this.#num}/${this.#den}`;
    }

    static add(a: Fraction, b: Fraction): Fraction {
        const [n1, d1] = a.value();
        const [n2, d2] = b.value();
        if (d1 === d2) return new Fraction([n1 + n2, d1]);
        const lcm = (x: number, y: number, k: number = 1): number => {
            const [min, max] = [Math.min(x, y), Math.max(x, y)];
            return (max * k) % min === 0 ? max * k : lcm(max, min, k + 1);
        }
        return new Fraction([
            lcm(d1, d2) * n1 / d1 + lcm(d1, d2) * n2 / d2,
            lcm(d1, d2)
        ]);
    }

    static fromString(str: string): Fraction {
        const improper = (s: string, d: string): number => {
            const [w, p] = s.split(/\s/).map(a => Number(a));
            return p + w * Number(d);
        }
        let [n, d = '1'] = str.split(/\//);
        return new Fraction([/\s/.test(n) ? improper(n, d) : Number(n), Number(d)]);
    }
}