$elHistory = document.getElementsByClassName('history')[0]
$elRemoveHistory = document.getElementsByClassName('clear-history')[0]
caseHistoryIds = []

chrome.storage.local.get(null, function(storage) {
  var history = []
  var table = ''
  for (var caseId in storage) {
    if (storage.hasOwnProperty(caseId) && caseId.startsWith('block_')) {
      history.push(storage[caseId])
      caseHistoryIds.push(caseId)
      table = constructTableData(storage[caseId]) + table
    }
  }
  if (history.length > 0) $elHistory.innerHTML = constructTable(table)
})

constructTableData = function (caseObject) {
  return `
  <tr>
    <td>${new Date(caseObject.date).toLocaleString()}</td>
    <td>${caseObject.page.title}</td>
    <td><a href="${caseObject.page.url}">${caseObject.page.url}</a></td>
    <td>${caseObject.request.url}</td>
  </tr>
  `
}

constructTable = function (tableData) {
  return `
  <table>
    <thead>
      <th>Timestamp</th>
      <th>Nama Website</th>
      <th>URL Website</th>
      <th>Malicious Script</th>
    </thead>
    <tbody>${tableData}</tbody>
  </table>`
}

$elRemoveHistory.addEventListener('click', function (event) {
  if (!confirm("Yakin ingin menghapus Log ?")) return
  chrome.storage.local.remove(caseHistoryIds, function () {
    location.reload()
  })
})
