$elVersion = document.getElementById('version')
$elHeader = document.getElementsByClassName('header')[0]
$elBlockCount = document.getElementById('stat-block-count')
$elSettings = document.getElementsByClassName('settings')[0]
$elSettingsBlocker = document.getElementById('blockerEnabled')
$elSettingsNotifs = document.getElementById('notificationsEnabled')
$elSettingsStats = document.getElementById('statisticsEnabled')

$elVersion.innerText = chrome.app.getDetails().version

chrome.storage.local.get(['blockCount', 'blockerEnabled', 'notificationsEnabled', 'statisticsEnabled'], function (values) {
  $elBlockCount.innerText = values['blockCount'] || 0
  if (values['blockerEnabled'] !== false) $elSettingsBlocker.setAttribute('checked', 'checked')
  if (values['notificationsEnabled'] !== false) $elSettingsNotifs.setAttribute('checked', 'checked')
  if (values['statisticsEnabled'] !== false) $elSettingsStats.setAttribute('checked', 'checked')
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log(changes)
  if (changes['blockCount']) $elBlockCount.innerText = changes['blockCount'].newValue
  if (changes['blockerEnabled']) $elSettingsBlocker.setAttribute('checked', (changes['blockerEnabled'].newValue == true ? 'checked': false))
  if (changes['notificationsEnabled']) $elSettingsNotifs.setAttribute('checked', (changes['notificationsEnabled'].newValue == true ? 'checked': false))
  if (changes['statisticsEnabled']) $elSettingsStats.setAttribute('checked', (changes['statisticsEnabled'].newValue == true ? 'checked': false))
})

$elSettings.addEventListener('click', function (event) {
  values = {}
  values[event.target.id] = (event.target.checked == true ? true : false)
  if (event.target.id) chrome.storage.local.set(values, function() {})
})

