// The Python side of a Python exercise run, shared by the Pyodide worker
// (in the browser) and scripts/content/check-exercises.mjs (local CPython):
// runs the learner's code with stdout captured, then evaluates each check
// expression in the same namespace. Prints/returns one JSON line.

export const PY_HARNESS = String.raw`
import json, io, contextlib, traceback, sys

def __eduflow_run(code, checks):
    ns = {"__name__": "__main__"}
    out = io.StringIO()
    error = None
    try:
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
            exec(compile(code, "exercise.py", "exec"), ns)
    except Exception as e:
        tb = traceback.extract_tb(e.__traceback__)
        line = next((f.lineno for f in reversed(tb) if f.filename == "exercise.py"), None)
        error = {"type": type(e).__name__, "message": str(e), "line": line}
    results = []
    for c in checks:
        try:
            ok = bool(eval(c["test"], ns))
            results.append({"id": c["id"], "pass": ok, "message": ""})
        except Exception as e:
            results.append({"id": c["id"], "pass": False, "message": type(e).__name__ + ": " + str(e)})
    text = out.getvalue()
    if len(text) > 20000:
        text = text[:20000] + "\n… (output truncated)"
    return json.dumps({"stdout": text, "error": error, "checks": results})
`;
