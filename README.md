# CookScript
Recipe parser written in TypeScript

## Installation
```shell
npm i cookscript
```

## Importing
In Node.js:
```js
import Recipe from 'cookscript';
```

In the browser:
```js
import Recipe from 'https://unpkg.com/cookscript/dist/index.js';
```

## Usage
```js
const recipe = new Recipe(string)
```
The string parameter in the constructor should conform to the formatting [below](#string-formatting).

The `raw()` method returns the input string.

The `value()` method returns an object with the recipe parsed as follows:

```ts
{
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
  ingredients: Array<{
    name: string,
    amount: string,
    section?: string
  }>,
  directions: Array<{
    text: string,
    section?: string,
    note?: string
  }>,
  notes: string[]
}
```

## String Formatting

Recipes are broken into 3 sections: prelude, title, directions. Line breaks separate everything in each section.

### Prelude

At the start, meta information and settings can be declared. The format is `property=value`.

`author=name` will define the author of the recipe.

`time=value` will define how long a recipe takes. Prep time and cook time can be differentiated with a vertical bar such as `time=prep|cook`.

`serves=number` will define how many servings a recipe produces.

`sections=value` will define if there are sections in the recipe. Possible values are `ingredients`, `directions`, or `both`.

### Title

In order to separate the prelude from the directions, a title must be declared.

`>name` defines the title of the recipe.

### Directions

Each direction is separated by a line break. Ingredients are defined in directions and converted to a readable format.

Ingredients are declared, in their most basic form, as `@ingredient{amount%units}`. Ingredients can contain spaces in their name, and amounts should be a number (whole, decimal, or fraction).

If ingredients have special preparation instructions, they can be included between the name and amount as `@ingredient[preparation]{amount%units}`.

By default, amounts are not included in the directions. If the amount should be printed in the direction, it is indicated with an exclamation point before the units as `@ingredient{amount%!units}`.

If an ingredient is divided between directions (within the same section), it should be defined in both places, and if the units match, it will be summed together in the ingredients list.

A few special lines are as follows:

`#section` indicates the start of a section, and all ingredients/directions/both between section tags are grouped together. These must be included if `sections` is defined in the prelude.

`+note` indicates a note that'll be attached to the prior direction. `++note` indicates a note that should be placed in a separate notes section.

## Example

```js
const recipe = new Recipe(`
author=Matt Braddock
serves=8

>Naan

Whisk together the @all purpose flour{350%grams}, @bread flour{150%grams}, @baking powder{3/4%tsp}, @salt{1%tsp}, and @instant yeast{1%tsp}

Mix in the @granulated sugar{2%tsp}, @water[lukewarm]{250%grams}, and @plain yogurt{75%grams}

Once combined, add in the @olive oil{2%tbs}, then knead the dough until smooth

Shape into a ball and place in a lightly greased bowl, then cover and allow to rest for 1 hour

Divide the dough into 8 equal pieces, shape each into balls, and place on a lightly floured surface

Lightly flour the top of the dough, then cover and allow to rest for 30 minutes

+After 20 minutes, preheat a cast iron skillet on high

One at a time, flatten the dough to approximately 3mm thick and cook in the skillet

+Cooking time is around 1 minute for each side; monitor the color of the bottom to determine when to flip
`);

console.log(recipe.value());
```

```
{
  "meta": {
    "author": "Matt Braddock",
    "serves": 8
  },
  "title": "Naan",
  "sections": [],
  "ingredients": [
    {
      "name": "all purpose flour",
      "amount": "350 grams"
    },
    {
      "name": "bread flour",
      "amount": "150 grams"
    },
    {
      "name": "baking powder",
      "amount": "3/4 tsp"
    },
    {
      "name": "salt",
      "amount": "1 tsp"
    },
    {
      "name": "instant yeast",
      "amount": "1 tsp"
    },
    {
      "name": "granulated sugar",
      "amount": "2 tsp"
    },
    {
      "name": "water, lukewarm",
      "amount": "250 grams"
    },
    {
      "name": "plain yogurt",
      "amount": "75 grams"
    },
    {
      "name": "olive oil",
      "amount": "2 tbs"
    }
  ],
  "directions": [
    {
      "text": "Whisk together the all purpose flour, bread flour, baking powder, salt, and instant yeast"
    },
    {
      "text": "Mix in the granulated sugar, water, and plain yogurt"
    },
    {
      "text": "Once combined, add in the olive oil, then knead the dough until smooth"
    },
    {
      "text": "Shape into a ball and place in a lightly greased bowl, then cover and allow to rest for 1 hour"
    },
    {
      "text": "Divide the dough into 8 equal pieces, shape each into balls, and place on a lightly floured surface"
    },
    {
      "text": "Lightly flour the top of the dough, then cover and allow to rest for 30 minutes",
      "note": "After 20 minutes, preheat a cast iron skillet on high"
    },
    {
      "text": "One at a time, flatten the dough to approximately 3mm thick and cook in the skillet",
      "note": "Cooking time is around 1 minute for each side; monitor the color of the bottom to determine when to flip"
    }
  ],
  "notes": []
}

```