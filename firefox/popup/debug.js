
/**
 * Logs the creation of a new tab
 */
function createTab(tab) {
  console.log(`Created new tab: ${tab.id}`)
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportError( error ) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute script: ${error.message}`);
}

/**
 * Creates a new tab to execute the main page in the selection class.
 */

var prm_create_tab = browser.tabs.create({
                       url: browser.extension.getURL("selection/debug.html")
                     });

prm_create_tab( createTab, reportError)

