// report.mjs
export const generateReport = (profile) => {
  const rows = profile.events
    .map(
      (e) => `
    <tr class="${e.duration / profile.total > 0.8 ? 'hot' : ''}">
      <td>${e.name}</td>
      <td>${e.duration.toFixed(2)} ms</td>
      <td>${((e.duration / profile.total) * 100).toFixed(1)}%</td>
      <td>${
        e.source
          ? e.source.original
            ? `${e.source.original.source}:${e.source.original.line}`
            : `${e.source.file}:${e.source.line}`
          : ''
      }</td>
    </tr>`
    )
    .join('')

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Wukong Profiler Report</title>
<style>
body { font-family: system-ui; padding: 20px; }
table { border-collapse: collapse; width: 100%; }
th, td { padding: 8px; border-bottom: 1px solid #eee; }
.hot { background: #ffe5e5; }
</style>
</head>
<body>
<h1>🔥 Wukong Profiler Report</h1>
<p>Total: ${profile.total.toFixed(2)} ms</p>

<table>
<thead>
<tr>
  <th>Step</th>
  <th>Duration</th>
  <th>Ratio</th>
  <th>Source</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>`

  return html
}
