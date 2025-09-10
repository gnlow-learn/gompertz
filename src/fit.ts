import p from "npm:pyodide@0.28.2/pyodide.js"

const pyodide = await p.loadPyodide()

await pyodide.loadPackage("numpy")
await pyodide.loadPackage("scipy")

await pyodide.runPythonAsync(`
    import numpy as np
    from scipy.optimize import curve_fit

    def gompertz(t, a, b, c, offset):
        return a*np.exp(-b*np.exp(-c*(t-offset)))
    
    def fit(x_data, y_data, initial_guess=[70, 1, 0.1, 0]):
        popt, _ = curve_fit(
            gompertz,
            np.array(x_data),
            np.array(y_data),
            p0=initial_guess,
        )
        return popt.tolist()

    globals()["fit"] = fit
`)

export const fit =
async (coords: [number, number][]) => {
    const xData = new Float32Array(coords.map(v => v[0]))
    const yData = new Float32Array(coords.map(v => v[1]))

    return <[number, number, number, number]>
        [...await pyodide.globals.get("fit")(xData, yData)]
}
