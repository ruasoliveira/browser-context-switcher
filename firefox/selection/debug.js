var G_d_removed_tabs = {};

/**
 * Displays a list of all open URLs, both in the console and the popup page
 */
function displayTabsURLs( l_tabs ) {
  // clean up the div (remove previous values)
  var nd_selection = document.getElementById("selection-content");
  while (nd_selection.firstChild) {
    nd_selection.removeChild( nd_selection.firstChild );
  }

  var l_urls = document.createElement('ul');
  var s_date = new Date().toLocaleString();
  var o_item = document.createElement('li');
  o_item.appendChild( document.createTextNode( s_date ) );
  l_urls.appendChild( o_item );
  for (let o_tab of l_tabs) {

    // skip private browsing tabs
    if (o_tab.incognito) {
      continue;
    }

    // skip tabs scheduled to be removed
    var idx_composed_id = 'tab'+o_tab.id+'win'+o_tab.windowId;
    if (idx_composed_id in G_d_removed_tabs) {
      continue;
    }

    // skip extension tabs (desirable?)
    if ( o_tab.url.includes("moz-extension://") ) {
      continue;
    }

    s_url_text = "[Wnd:" + o_tab.windowId + "] " + "[Tab:" + o_tab.id + "] " + "[Idx:" + o_tab.index + "] ";

    if (o_tab.pinned) {
      s_url_text = "[pinned] " + s_url_text;
    }

    if (o_tab.isInReaderMode) {
      s_url_text += "[RM] "
    }

    s_url_text += "[Url:" + o_tab.url + "] ";

    s_url_text += o_tab.title

    var o_item = document.createElement('li');
    o_item.appendChild( document.createTextNode(s_url_text) );
    l_urls.appendChild( o_item );
  }
  nd_selection.appendChild( l_urls );

  G_d_removed_tabs = {};
}

function handleRemoved( tabId, removeInfo ) {
  var idx_composed_id = 'tab'+tabId+'win'+removeInfo.windowId
  G_d_removed_tabs[idx_composed_id] = true;

  if ( !removeInfo.isWindowClosing ) {
    var prm_l_tabs = browser.tabs.query({});
    prm_l_tabs.then( displayTabsURLs, reportError);
  }

}

function handleCreated(tab) {
  var prm_l_tabs = browser.tabs.query({});
  prm_l_tabs.then( displayTabsURLs, reportError);
}

function handleUpdated(tabId, changeInfo, tabInfo) {
  var prm_l_tabs = browser.tabs.query({});
  prm_l_tabs.then( displayTabsURLs, reportError);
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportError( error ) {
  document.querySelector("#selection-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute script: ${error.message}`);
}

/**
 * When the popup loads, get all open tabs and pass it to a handler that
 * will displays a list of URLs.
 */
var prm_l_tabs = browser.tabs.query({});

prm_l_tabs.then( displayTabsURLs, reportError)

browser.tabs.onRemoved.addListener( handleRemoved );
browser.tabs.onCreated.addListener( handleCreated );
browser.tabs.onUpdated.addListener( handleUpdated );
