
/**
 * Displays a list of all open URLs, both in the console and the popup page
 */
function displayTabsURLs( l_tabs ) {

  var l_urls = document.createElement('ul');
  for (let o_tab of l_tabs) {
    console.log(`${o_tab.url}`);

    if (o_tab.incognito) { // skip private browsing tabs
      continue;
    }

    s_url_text = o_tab.url;
    if (o_tab.pinned) {
      s_url_text = "[pinned] " + s_url_text;
    }

    var o_item = document.createElement('li');
    o_item.appendChild( document.createTextNode(s_url_text) );
    l_urls.appendChild( o_item );
  }

  document.getElementById("selection-content").appendChild( l_urls );
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

