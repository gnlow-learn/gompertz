// deno-lint-ignore-file no-explicit-any

import { parse } from "https://esm.sh/jsr/@std/csv@1.0.6"

const csv = await fetch(
    "https://ourworldindata.org/grapher/share-of-women-in-england-and-wales-who-have-ever-married-by-age.csv?v=1&csvType=full&useColumnShortNames=true"
).then(x => x.text())

declare global {
    interface Array<T> {
        toObject():
            T extends [infer K extends string, infer V]
                ? Record<K, V>
                : never
    }
}

Array.prototype.toObject = function () {
    return Object.fromEntries(this)
}

const tuple =
<T extends any[]>
(...args: T) =>
    args

const data = parse(csv, { skipFirstRow: true, })
    .map(x => ({
        gender: x.Entity as string,
        age: Number(x.Year),
        married: Object.entries(x)
            .filter(([k]) => k.startsWith("cumulative_"))
            .map(([k, v]) => tuple(k.slice(-4), Number(v)))
            .toObject()
    }))

const data1900 = data
    .filter(({ gender }) => gender == "Women")
    .map(({ age, married }) => tuple(age, married["1900"]))

import { fit } from "./src/fit.ts"

console.log(
    (await fit(data1900)).map(x => x.toFixed(2))
)
