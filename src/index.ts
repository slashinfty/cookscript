import { Fraction } from "./Fraction.js";

type Ingredient = {
    name: string,
    amount: string,
    section?: string
}

type RawIngredient = {
    string: string,
    name: string,
    value: Fraction,
    units: string,
    preparation?: string,
    section?: string
}

type Direction = {
    text: string,
    section?: string,
    note?: string
}

type RecipeObject = {
    meta: {
        author?: string,
        time?: string | {
            prep: string,
            cook: string
        },
        serves?: number,
        sections?: 'directions' | 'ingredients' | 'both'
    },
    title: string,
    sections: string[],
    ingredients: Ingredient[],
    directions: Direction[],
    notes: string[]
}

export default class Recipe {
    #string: string;
    #meta: RecipeObject['meta'];
    #title: RecipeObject['title'];
    #sections: RecipeObject['sections'];
    #ingredients: RecipeObject['ingredients'];
    #directions: RecipeObject['directions'];
    #notes : RecipeObject['notes'];
    
    constructor(input: string) {
        this.#string = input;

        let lines = this.#string.split(/\r?\n|\r|\n/g).filter(l => l !== '');
        const titleIndex = lines.findIndex(line => /^\>.+/.test(line));
        this.#title = lines[titleIndex].replace(/\>/, '');

        this.#meta = {};
        this.#sections = [];
        for (let i = 0; i < titleIndex; i++) {
            const line = lines[i];
            const [prop, val] = line.split(/\=/);
            if (prop === 'sections') this.#meta.sections = val as 'directions' | 'ingredients' | 'both';
            if (prop === 'author') this.#meta[prop] = val;
            if (prop === 'time') {
                if (/\|/.test(val)) {
                    const [prep, cook] = val.split(/\|/);
                    this.#meta[prop] = {
                        prep: prep,
                        cook: cook
                    }
                } else this.#meta[prop] = val;
            }
            if (prop === 'serves') this.#meta[prop] = Number(val);
        }

        this.#notes = [];
        this.#directions = [];
        this.#ingredients = [];
        let rawIngredients: RawIngredient[] = [];
        for (let i = titleIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (/^#.+/.test(line)) this.#sections.push(line.replace(/^#/, ''));
            else if (/^\+\+.+/.test(line)) this.#notes.push(line.replace(/^\+\+/, ''));
            else if (/^\+.+/.test(line)) this.#directions[this.#directions.length - 1]['note'] = line.replace(/^\+/, '');
            else {
                const newRawIngredients: RawIngredient[] = [];
                line.match(/@[^@]+\}/g)?.forEach(ingredient => {
                    const [name] = ingredient.match(/(?<=@)[^\{\[]+/)!;
                    const [amount] = ingredient.match(/(?<=\{)[^\}]+/)!;
                    const [value, units] = amount.split(/%!?/);
                    const rawIngredient: RawIngredient = {
                        string: ingredient,
                        name: name,
                        value: Fraction.fromString(value),
                        units: units
                    }
                    if (/\[.+\]/.test(ingredient)) [rawIngredient['preparation']] = ingredient.match(/(?<=\[)[^\]]+/)!;
                    if (this.#sections.length > 0 && (this.#meta.sections === 'both' || this.#meta.sections === 'ingredients')) rawIngredient['section'] = this.#sections[this.#sections.length - 1];
                    newRawIngredients.push(rawIngredient);
                });
                rawIngredients = [...rawIngredients, ...newRawIngredients];
                this.#directions.push({ text: newRawIngredients.reduce((newLine, ingredient) => newLine.replace(ingredient.string, `${/%!/.test(ingredient.string) ? `${ingredient.value.toString()} ${ingredient.units} ` : ''}${ingredient.name}`), line) });
                if (this.#sections.length > 0 && (this.#meta.sections === 'both' || this.#meta.sections === 'directions')) this.#directions[this.#directions.length - 1]['section'] = this.#sections[this.#sections.length - 1];
            }
        }
    
        while (rawIngredients.length > 0) {
            const rawIngredient = rawIngredients.shift()!;
            const existingIngredientIndex = this.#ingredients.findIndex(i => i.name === rawIngredient.name && (this.#sections.length > 0 ? i.section === rawIngredient.section : true));
            if (existingIngredientIndex === -1) {
                const newIngredient: Ingredient = {
                    name: `${rawIngredient.name}${rawIngredient.hasOwnProperty('preparation') ? `, ${rawIngredient.preparation}` : ''}`,
                    amount: `${rawIngredient.value.toString()} ${rawIngredient.units}`
                }
                if (rawIngredient.hasOwnProperty('section')) newIngredient['section'] = rawIngredient.section;
                this.#ingredients.push(newIngredient);
            } else {
                const existingIngredient = this.#ingredients[existingIngredientIndex];
                const updatedIngredient: Ingredient = {
                    ...existingIngredient,
                    name: `${existingIngredient.name}, divided`
                }
                const [value, units] = existingIngredient.amount.split(/(?<=\d)\s(?=\D)/);
                if (units === rawIngredient.units) {
                    const newValue = Fraction.add(rawIngredient.value, Fraction.fromString(value));
                    updatedIngredient.amount = `${newValue.toString()} ${units}`;
                } else updatedIngredient.amount = `${updatedIngredient.amount} & ${rawIngredient.value.toString()} ${rawIngredient.units}`;
                this.#ingredients[existingIngredientIndex] = updatedIngredient;
            }
        }
    }

    raw(): string {
        return this.#string;
    }

    value(): RecipeObject {
        return {
            meta: this.#meta,
            title: this.#title,
            sections: this.#sections,
            ingredients: this.#ingredients,
            directions: this.#directions,
            notes: this.#notes
        }
    }
}