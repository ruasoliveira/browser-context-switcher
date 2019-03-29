var G_d_window_to_contextname = {};
var G_d_removed_tabs = {};
var G_s_root_bookmark_name = "Browser Context Switcher";
var G_s_root_bookmark_id = "";
var G_d_windows = {};

/**
 * Utils
 */
function compareWindowsToContexts( d_windows_urls, d_contexts_urls ) {
  var l_diffs = [];
  var l_wins_to_delete = [];

  for (var id_win in d_windows_urls) {
    var l_win_urls = d_windows_urls[id_win];
    l_win_urls.sort();
    var b_similar = false;
    var b_equals = false;
    var s_match_name = "";
    for (var s_context_name in d_contexts_urls) {
      var l_ctx_urls = d_contexts_urls[s_context_name];
      l_ctx_urls.sort();
      if ( JSON.stringify(l_win_urls) === JSON.stringify(l_ctx_urls) ) {
        s_match_name = s_context_name;
        b_equals = true;
        break;
      }
    }
    if ( b_similar || b_equals ) {
      delete d_contexts_urls[s_match_name];
      l_wins_to_delete += [ id_win ];
      if ( b_equals ) {
        G_d_window_to_contextname[id_win] = s_context_name;
      } else {
        l_diffs.push( { winId: id_win, contextName: s_context_name, type: 'similar' } );
      }
    }
  }

  for (let id_win of l_wins_to_delete) {
    delete d_windows_urls[id_win];
  }

  var s_date = new Date().toLocaleString();
  var n_count = 0;
  for (var id_win in d_windows_urls) {
    if (d_windows_urls.hasOwnProperty( id_win )) {
      var l_win_urls = d_windows_urls[id_win];
      console.log( [id_win, l_win_urls] );
      s_context_name = s_date + ", WinID: " + n_count;
      n_count++;
      l_diffs.push( { winId: id_win, contextName: s_context_name, type: 'new' } );
    }
  }

  console.log("log compare_windows_to_contexts");
  console.log(d_windows_urls);
  console.log( l_diffs );
  return l_diffs;
}

function createBMTabs( id_parent, id_win ) {
  console.log( 'createBMTabs' );
  console.log(`id_parent: ${id_parent}`);
  console.log(`id_win: ${id_win}`);
  for (let o_tab of G_d_windows[id_win].tabs) {
    json_create_details = {
      title: o_tab.title,
      url: o_tab.url,
      parentId: id_parent
    }

//        browser.bookmarks.create( json_create_details )
//                         .then( handleCreatedBM );
  }
  
}

function createBM( l_diffs ) {
  console.log( 'createBM' );
  console.log( l_diffs );
  var json_create_details = {}

  for (var idx in l_diffs) {
    var d_tp_diff = l_diffs[idx]
    console.log(d_tp_diff);
    if ( d_tp_diff.type == 'new' ) {
      var id_win = d_tp_diff.winId;
      json_create_details = {
        title: d_tp_diff.contextName,
        type: "folder",
        parentId: G_s_root_bookmark_id
      }

      browser.bookmarks.create( json_create_details )
                       .then( handleCreatedBM )
                       .then( (node, id_win) => createBMTabs(node.id, id_win) );
    }
  }
}

/**
 * Debuging
 */
function reportError( error ) {
  document.querySelector("#selection-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute script: ${error.message}`);
}

function displayTabsURLs( l_tabs ) {
  var s_date = new Date().toLocaleString();

  for (let o_tab of l_tabs) {
    if ( ! o_tab.windowId in G_d_window_to_contextname ) {
      G_d_window_to_contextname[o_tab.windowId] = s_date;
    }

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

    var s_url_text = "[Wnd:" + o_tab.windowId + "] " + "[Tab:" + o_tab.id + "] " + "[Idx:" + o_tab.index + "] ";

    if (o_tab.pinned) {
      s_url_text = "[pinned] " + s_url_text;
    }

    if (o_tab.isInReaderMode) {
      s_url_text += "[RM] ";
    }

    s_url_text += "[Url:" + o_tab.url + "] ";

    s_url_text += o_tab.title;
  }
  G_d_removed_tabs = {};
}

/**
 * Tabs-related callbacks
 */
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
 * Bookmarks-related callbacks
 */
function handleGotWindows( l_windows ) {
  G_d_windows = {};
  var d_windows_urls = {};
  for (let o_win of l_windows) {
    G_d_windows[o_win.id] = o_win;
    if ( ! d_windows_urls[o_win.id] ) {
      d_windows_urls[o_win.id] = [];
    }
    for (let o_tab of o_win.tabs) {
      d_windows_urls[o_win.id].push( o_tab.url );
    }
    console.log(`Window: ${o_win.id}`);
    console.log(o_win.tabs.map((tab) => {return tab.url}));
  }

  console.log("log handleGotWindows");
  console.log(d_windows_urls);
  console.log(Object.keys(d_windows_urls));

  return d_windows_urls;
}

// TODO: use promise chaining: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#Chaining
function handleGotBookmark( bookmarks ) {
  console.log(bookmarks);

  var prm_l_windows = browser.windows.getAll({
    populate: true,
    windowTypes: ["normal"]
  });
  var prm_got_windows = prm_l_windows.then( handleGotWindows, reportError);

  var d_contexts_urls = {};
  G_s_root_bookmark_id = bookmarks[0].id;
  console.log(`G_s_root_bookmark_id: ${G_s_root_bookmark_id}`);
  for (let o_context in bookmarks[0].children) {
    if (o_context.children) {
      for (let o_tab in o_context.children) {
        if (! d_contexts_urls[o_context.title] ) {
          d_contexts_urls[o_context.title] = [];
        }
        d_contexts_urls[o_context.title] += [o_tab.url]
      }
    }
  }

  prm_got_windows.then( (d_windows_urls, d_contexts_urls) => compareWindowsToContexts(d_windows_urls, d_contexts_urls) )
  .then( l_diffs => createBM(l_diffs) );
}

function handleCreatedBM( node ) {
  console.log("handleCreatedBM");
  console.log(node);
  return node;
}

function handleDidNotFindBookmark(error) {
  console.log(`An error: ${error}`);

  var json_create_details = {
    title: G_s_root_bookmark_name,
    type: "folder",
    parentId: "toolbar_____"
  }

  var prm_create_bm = browser.bookmarks.create( json_create_details );
  prm_create_bm.then( handleCreatedBM )
               .then( node => G_s_root_bookmark_id = node.id ) ;

  console.log(`G_s_root_bookmark_id: ${G_s_root_bookmark_id}`);
}

/**
 * Main
 */
var prm_search_bm = browser.bookmarks.search({ title: G_s_root_bookmark_name });
prm_search_bm.then( handleGotBookmark, handleDidNotFindBookmark);

var prm_l_tabs = browser.tabs.query({});
prm_l_tabs.then( displayTabsURLs, reportError);

browser.tabs.onRemoved.addListener( handleRemoved );
browser.tabs.onCreated.addListener( handleCreated );
browser.tabs.onUpdated.addListener( handleUpdated );
