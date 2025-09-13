import p from "npm:pyodide@0.28.2/pyodide.js"

const pyodide = await p.loadPyodide()

await pyodide.loadPackage("numpy")
await pyodide.loadPackage("scipy")

await pyodide.runPythonAsync(`
    import numpy as np
    from scipy.optimize import curve_fit

    def gompertz_cdf(t, a, b, c, max, offset):
        return max*(c*(offset-t)+np.exp(-a/b*np.expm1((offset-t)*b)))
    
    def fit(x_data, y_data, initial_guess=[0.01, 0.01, 0, 1, 15]):
        popt, _ = curve_fit(
            gompertz_cdf,
            np.array(x_data),
            np.array(y_data),
            p0=initial_guess,
            bounds=(
                [0, 0, 0, 0, 0],
                [np.inf, np.inf, np.inf, np.inf, 20]
            ),
        )
        return popt.tolist()

    globals()["fit"] = fit
`)

export const fit =
async (coords: [number, number][]) => {
    const xData = new Float32Array(coords.map(v => v[0]))
    const yData = new Float32Array(coords.map(v => v[1]))

    return <[number, number, number, number, number]>
        [...await pyodide.globals.get("fit")(xData, yData)]
}
