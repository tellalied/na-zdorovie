var cpu_history = {'overall': []};
var icon_draw_context;
var done_init = false;
isBlockerEnabled = true
areBlockNotificationEnabled = true
areBlockStatisticsEnabled = true

chrome.storage.local.get(['blockerEnabled', 'notificationsEnabled', 'statisticsEnabled'], function (values) {
  if (typeof values['blockerEnabled'] !== 'undefined') isBlockerEnabled = values['blockerEnabled']
  if (typeof values['notificationsEnabled'] !== 'undefined') areBlockNotificationEnabled = values['notificationsEnabled']
  if (typeof values['statisticsEnabled'] !== 'undefined') areBlockStatisticsEnabled = values['statisticsEnabled']
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes['blockerEnabled']) isBlockerEnabled = changes['blockerEnabled'].newValue
  if (changes['notificationsEnabled']) areBlockNotificationEnabled = changes['notificationsEnabled'].newValue
  if (changes['statisticsEnabled']) areBlockStatisticsEnabled = changes['statisticsEnabled'].newValue
})

Blocker = function (details) {
  if (isBlockerEnabled && areBlockStatisticsEnabled) IncrementBlockCount()
  if (isBlockerEnabled && areBlockNotificationEnabled) NotifyUser(details)
  return { cancel: isBlockerEnabled }
}


BlackList = [

  // CoinHive
  '*://*.coin-hive.com/*',
  '*://*.coinhive.com/*',
  'wss://*.coinhive.com/*',
  'ws://*.coinhive.com/*',
  'wss://*.coin-hive.com/*',
  'ws://*.coin-hive.com/*',
  '*://*/*coinhive*.js*',
  '*://*/*coin-hive*.js*',

  // JSECoin
  '*://*.jsecoin.com/*',

  // CryptoLoot
  'wss://*.crypto-loot.com/*',
  'wss://*.statdynamic.com/*',
  
  // Minr
  '*://*.host.d-ns.ga/*',
  'wss://*.host.d-ns.ga/*',
  'ws://*.host.d-ns.ga/*',
  
  // Others
  '*://*.reasedoper.pw/*',
  '*://*.mataharirama.xyz/*',
  '*://*.listat.biz/*',
  '*://*.lmodr.biz/*',
  '*://*.minecrunch.co/*',
  '*://*.minemytraffic.com/*',
  '*://*.crypto-loot.com/*',
  'wss://*.crypto-loot.com/*',
  '*://*.2giga.link/*',
  'wss://*.2giga.link/*',
  '*://*.ppoi.org/*',
  '*://*.coinerra.com/*',
  '*://*.coin-have.com/*',
  '*://*.kisshentai.net/*',
  '*://*.joyreactor.cc/ws/ch/*',
  '*://*.ppoi.org/lib/*',
  '*://*.coinnebula.com/lib/*',
  '*://*.afminer.com/code/*',
  '*://*.coinblind.com/lib/*',
  '*://*.webmine.cz/miner*',
  '*://*.papoto.com/lib/*',
  
  // Specific scripts
  '*://*/*javascriptminer*.js*',
  '*://*/*miner.js*',
  '*://*/*miner.min.js*',
  '*://*/*xmr.js*',
  '*://*/*xmr.min.js*',
  '*://*/*coinlab.js*',
  '*://*/*c-hive.js*',
  '*://*/*cloudcoins*.js*',
  '*://*/*miner.js*',
  
  // Specific script hosts
  '*://miner.pr0gramm.com/xmr.min.js*',
  '*://*.kiwifarms.net/js/Jawsh/xmr/xmr.min.js*',
  '*://anime.reactor.cc/js/ch/cryptonight.wasm*',
  '*://cdn.cloudcoins.co/javascript/cloudcoins.min.js*',
  '*://*.kissdoujin.com/Content/js/c-hive.js*',
  '*://*.coinlab.biz/lib/coinlab.js*',
  '*://*.monerominer.rocks/scripts/miner.js*',
  '*://*.monerominer.rocks/miner.php*',
  '*://*.minero.pw/miner.min.js*'
]


chrome.webRequest.onBeforeRequest.addListener(Blocker, { urls: BlackList }, ['blocking'])


IncrementBlockCount = function () {
  chrome.storage.local.get('blockCount', function (values) {
    storedCount = values['blockCount'] || 0
    count = parseInt(storedCount) + 1
    chrome.storage.local.set({'blockCount': count}, function() {})
  })
}

NotifyUser = function (details) {

 
  chrome.tabs.get(details.tabId, function (tab) {

  
    options = {
      type: 'list',
      title: `Crypto Miner Script Blocked`,
      message: `${tab.title}`,
      items: [
        { title: 'Title', message: `${tab.title}` },
        { title: 'URL', message: `${tab.url}` },
        { title: 'Script URL', message: `${details.url}` }
      ],
      buttons: [{ title: 'View More' }, { title: 'Disable Notifications' }]
    }
    chrome.notifications.create(null, options, function () {})

    stamp = new Date().getTime()
    caseId = 'block_' + stamp + '_' + Math.round(Math.random() * 10e10)
    caseData = { page: tab, request: details, date: stamp }
    caseObject = {}
    caseObject[caseId] = caseData
    chrome.storage.local.set(caseObject, function (res) { console.log('saved case', res) })
  })


 
  chrome.notifications.onButtonClicked.addListener(function (notifId, btnIndex) {

    if (btnIndex === 0) {
      window.open('src/history.html')
      return
    }

    
    chrome.notifications.getAll(function (notifications) {
      for (var notif in notifications) {
        if (notifications.hasOwnProperty(notif)) {
          chrome.notifications.clear(notif)
        }
      }
    })

   
    chrome.storage.local.set({'notificationsEnabled': false}, function() {})
    areBlockNotificationEnabled = false
  })
}

chrome.processes.onUpdated.addListener( function ( processes ) {
	for ( tabId in processes ) {
		switch ( processes[tabId].id ) {
			default:
				// jika tab melebihi 99%
				if ( processes[tabId].cpu > 99.0 ) {
					//  notifikasi terminate tab
					console.log("disini:")
					let notif =  `Terminated tab '${tabId}' karena melebihi batas threshold. / ${processes[tabId].tasks[0].title} / CPU: ${processes[tabId].cpu}%`;
					// terminate proses
					chrome.processes.terminate( processes[tabId].id, function ( terminated ) {
						if ( terminated ) {
							// buat notifikasi untuk memberi tahu pengguna tab di terminate
							chrome.notifications.create("", {
								type: "basic",
								title: "Cryptojacking Detection",
								message: notif,
							}, function(){});
							return true;
						}
						return false;
					});
				}
		}
	}
});


function init() {
  if (done_init) { return; }
  done_init = true;
  chrome.processes.onUpdatedWithMemory.addListener(receiveProcessInfo);
  icon_draw_context = document.getElementById('canvas').getContext('2d');
  icon_draw_context.fillStyle = '#f6f6f6';
  icon_draw_context.fillRect(0, 0, 19, 19);
  chrome.browserAction.setIcon({imageData: icon_draw_context.getImageData(0, 0, 19, 19)});
}

function receiveProcessInfo(processes) {
  var totalCPU = 0;
  for (pid in processes) {
    totalCPU += processes[pid].cpu;
    if (!cpu_history[pid]) {
      cpu_history[pid] = [];
    }
    cpu_history[pid].unshift(processes[pid].cpu);
    if (cpu_history[pid].length > 350) {
      cpu_history[pid].pop();
    }
  }
  for (pid in cpu_history) {
    if ((pid != 'overall') && !processes[pid]) {
      delete cpu_history[pid];
    }
  }
  cpu_history['overall'].unshift(totalCPU);
  if (cpu_history['overall'].length > 350) {
    cpu_history['overall'].pop();
  }
  draw_cpu_graph(cpu_history['overall'], icon_draw_context, 19, 19, 8, 1, 0);
  chrome.browserAction.setIcon({ imageData: icon_draw_context.getImageData(0, 0, 19, 19) });
  padding = totalCPU < 10 ? ' ' : '';
  chrome.browserAction.setBadgeText({text: padding + Math.floor(totalCPU).toString() + '%' + padding});
  chrome.browserAction.setBadgeBackgroundColor({color:get_color_for_cpu(totalCPU)});
}

function draw_cpu_graph(data, context, width, height, height_offset, col_width, gap_width) {
  context.fillStyle = '#f6f6f6';
  context.fillRect(0, 0, width, height);
  for (var i = 0; i < data.length; i++) {
    var x = width - (i * (col_width + gap_width));
    if (x < 0) break;
    context.strokeStyle = get_color_for_cpu(data[i]);
    context.beginPath();
    context.moveTo(x, height);
    context.lineTo(x, height - height_offset - (Math.min(data[i], 100)*(height - height_offset)/100));
    context.stroke();
  }
}

function get_color_for_cpu(cpu) {
  return cpu > 30 ? '#F00' : '#228B22';
}

document.addEventListener('DOMContentLoaded', init);
