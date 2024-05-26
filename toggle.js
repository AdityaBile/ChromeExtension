// ***** Chrome.storage changes *****
var timer = null;
var globalObj = {};
var extStorageKeys = [];

function initStorage() {
  getValuesFromStorage(function () {
    pageLoaded();
    recursiveLoader();
  });
}

function getKeys(callback) {
  chrome.storage.local.get("keys", function (o) {
    extStorageKeys = o["keys"] || "[]";
    try {
      extStorageKeys = JSON.parse(extStorageKeys);
    } catch (err) {
      console.log(err);
    }
    if (typeof callback == "function") callback();
  });
}

function recursiveLoader() {
  if (timer) clearInterval(timer);
  timer = setInterval(getValuesFromStorage, 1000);
}

function setItem(a, b) {
  globalObj[a] = b;
  var obj = {};
  obj[a] = b;
  chrome.storage.local.set(obj);
  if (extStorageKeys.indexOf(a) == -1) {
    extStorageKeys.push(a);
  }
  chrome.storage.local.set({ keys: JSON.stringify(extStorageKeys) });
  // writeToFile(globalObj);
}

function getItem(a) {
  var b = globalObj[a];
  if (b != undefined) {
    return b;
  } else {
    return null;
  }
}

function removeItem(a) {
  delete globalObj[a];
  if (extStorageKeys.indexOf(a) > -1) {
    extStorageKeys.splice(extStorageKeys.indexOf(a), 1);
    chrome.storage.local.set({ keys: JSON.stringify(extStorageKeys) });
  }
  chrome.storage.local.remove(a);
  // writeToFile(globalObj);
}

function getValuesFromStorage(callback) {
  getKeys(function () {
    getStorageObjFromKeys(0, function () {
      if (typeof callback == "function") callback();
    });
  });
}

function getStorageObjFromKeys(idx, callback) {
  var key = extStorageKeys[idx];
  if (key) {
    chrome.storage.local.get(key, function (o) {
      globalObj[key] = o[key];
      idx++;
      getStorageObjFromKeys(idx, callback);
    });
  } else {
    if (typeof callback == "function") callback();
  }
}
// **********************************

function button_enable(countryId) {
  // var country_id=localStorage.getItem('countryId');      // ***** Chrome.storage changes *****
  var t_str = "#";
  var country_id_t = t_str.concat(countryId);
  $(country_id_t).prop("checked", true);
}

//  $(document).ready(function (){ // ***** Chrome.storage changes *****
async function toggleProxyUIOn() {
  const tab = await promisify((r) => chrome.tabs.getSelected(null, r));
  const host = getHostFromUrl(tab.url);
  promisify((r) =>
    chrome.extension.sendMessage({ greeting: "enableProxy", url: host }, r)
  ); //CONTINUE
  document.getElementById("plugins_Y").style.color = "black";
  document.getElementById("plugins_N").style.color = "#B5B5B5";
  document.getElementById("plugins_N").style.backgroundColor = "white";
  document.getElementById("plugins_Y").style.backgroundColor = "#59BA59";

  $("input[type=radio]").attr("disabled", false);
  var countryId = $("input[type=radio][name=radSize]:checked").attr("id");
  // if(localStorage.getItem('countryId')=='noCountrySet'){  // ***** Chrome.storage changes *****
  if (getItem("countryId") == "noCountrySet") {
    //alert(countryId);
    countryId = "eastUSAProxy";
    // localStorage.setItem('countryId', countryId );          // ***** Chrome.storage changes *****
    setItem("countryId", countryId);
  } else {
    // countryId=localStorage.getItem('countryId');            // ***** Chrome.storage changes *****
    countryId = getItem("countryId");
  }
  button_enable(countryId || "eastUSAProxy");
  connect_to_country(countryId);
}

function toggleProxyUIOff() {
  $("input[type=radio]").attr("checked", false);
  $("input[type=radio]").attr("disabled", true);
  promisify((r) =>
    chrome.extension.sendMessage({ greeting: "disableProxy" }, r)
  ); //CONTINUE
  setItem("proxyMode", "off");

  document.getElementById("plugins_Y").style.color = "#B5B5B5";
  document.getElementById("plugins_N").style.color = "black";
  document.getElementById("plugins_N").style.backgroundColor = "#D47D7D";
  document.getElementById("plugins_Y").style.backgroundColor = "white";
}

function pageLoaded() {
  // Commented above line and added this line.

  // chrome.tabs.onUpdated.addListener(function(){
  // if(localStorage.getItem('proxyMode') != "off" && localStorage.getItem('proxyMode') != "on"){ // ***** Chrome.storage changes *****
  if (!(getItem("proxyMode") in { off: true, on: true, paused: true })) {
    // localStorage.setItem('proxyMode', 'off');                 // ***** Chrome.storage changes *****
    setItem("proxyMode", "off");
    // localStorage.setItem('countryId', 'noCountrySet');        // ***** Chrome.storage changes *****
    setItem("countryId", "noCountrySet");
    document.getElementById("plugins_Y").style.color = "#B5B5B5";
    document.getElementById("plugins_N").style.color = "black";
  }

  if (getItem("proxyMode") == "off") {
    toggleProxyUIOff();
  } else {
    toggleProxyUIOn();
  }

  chrome.tabs.getSelected(null, function (tab) {
    $("input[name=radSize]:radio").change(function () {
      //localStorage.setItem('proxyMode', 'on');
      var countryId = $("input[type=radio][name=radSize]:checked").attr("id");
      //alert(countryId);
      set_global_storage(countryId);
      connect_to_country(countryId);
    });

    function set_global_storage(countryId) {
      // localStorage.setItem('countryId', countryId );        // ***** Chrome.storage changes *****
      setItem("countryId", countryId);
    }

    $("#plugins_Y").click(function () {
      // localStorage.setItem('proxyMode', 'on');              // ***** Chrome.storage changes *****
      toggleProxyUIOn();
    });

    $("#plugins_N").click(function () {
      // localStorage.setItem('proxyMode', 'off');                // ***** Chrome.storage changes *****
      toggleProxyUIOff();
    });

    $(".button").click(function () {
      // var sets = JSON.parse(localStorage.getItem(taburl));
      var ele = $(this).children("div").attr("class");
      var obj = {};
      var sel = $(this).children("div");
      var id = $(this).attr("id");
    });
  });

  chrome.windows.onRemoved.addListener(function (wind) {
    // var sets = JSON.parse(localStorage.getItem(taburl));          // ***** Chrome.storage changes *****
    var sets = JSON.parse(getItem(taburl));
    if (sets.deletebrowsingdata == true) {
      var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
      var oneMonthAgo = new Date().getTime() - millisecondsPerMonth;
      chrome.browsingData.remove(
        {
          since: oneMonthAgo,
        },
        {
          localstorage: true,
        }
      );
    }
  });
}

/*
 * if google autosuggest or autocomplete is on, then the following code does not work properly when proxyMode is partiallyOn
 * Eg: if user types aol it immediately hits google server for autosuggest and mustEnableProxy function below returns true since,
 * google is in proxyEnabledSites list. This connects thru proxy for aol.com which is wrong.
 * Autosuggest is disabled in epic so no prob currently.
 */

//infospace - inspcloud.com
var proxyEnabledSites = [
  "infospace.com",
  "google.com",
  "google.co.in",
  "inspcloud.com",
  "dogpile.com",
  "ixquick.com",
  "google.co.uk",
  "bing.com",
  "duckduckgo.com",
  "yandex",
  "yandex.com",
  "yandex.ru",
  "yandex.rt",
  "epicsearch.in",
  "google.com",
  "naver.com",
  "naver.net",
  "daum.net",
  "daumcdn.net",
  "blekko.com",
  "nate.com",
  "baidu.com",
  "ask.com",
  "sogou.com",
  "soso.com",
  "so.com",
  "sezname.cz",
  "vinden.nl",
  "onet.pl",
];
var proxyExceptionSites = [
  "mail.google.com",
  "plus.google.com",
  "play.google.com",
  "news.google.com",
  "maps.google.com",
  "maps.static.com",
  "mts1.google.com",
  "mts0.google.com",
  "googleusercontent.com",
  "ytimg.com",
  "drive.goo",
];

var rand = 80;

var proxy_utils = {
  list_visisted: [],
  isTabvisited: function (d) {
    //Here we have to check for repeted url
    //if(this.list_visisted[i].tabId==d.tabId && this.list_visisted[i].url ==d.url)
    for (var i = 0; i < this.list_visisted.length; i++)
      if (
        this.list_visisted[i].tabId == d.tabId &&
        this.list_visisted[i].enabled == false
      )
        return true;
    return false;
  },
  get_stripped_url: function (url) {
    var taburl;
    taburl += url;
    taburl = taburl.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
    return taburl;
  },
};

var proxy = {
  globalTabUrl: "",
  checkAndEnableProxy: function (obj) {
    if (!proxy_utils.isTabvisited(obj)) {
      obj.enabled = proxy.mustEnableProxy(obj.url);
      // if(obj.url=='google.co.in'){
      //     alert("yes Im google.co.in")
      // }
      // alert("here " +obj.url)
      console.log("At mustEnableProxy" + obj.enabled);
      return obj.enabled;
    }
    return false;
  },

  getEpicDomain: function (t) {
    mm = t
      .replace("||", "")
      .replace("@@", "")
      .replace("-", "")
      .match(/^([\w]+:\/{0,2})?([\w]+\.|.*@)?([\w]+\.[\w]{2,3})(\/?)(.*)?(^)?/);
    if ((mm && mm[3]) != null) {
      return mm && mm[3];
    } else if ((mm && mm[3]) == null) {
      //Not a proper Domain
      //Goes to others
    }
    return "sorry";
  },

  mustEnableProxy: function (url) {
    for (var i = 0; i < proxyExceptionSites.length; i++) {
      if (url.indexOf(proxyExceptionSites[i]) != -1) {
        return false;
      }
    }

    kf = proxy.getEpicDomain(url);

    if (kf.indexOf("yandex") > -1) return true;

    if (kf.indexOf("mail") > -1) return false;
    for (var i = 0; i < proxyEnabledSites.length; i++) {
      if (url.indexOf("google.com") > -1) {
        //IF http req is google/ gstatic and tab url is google.com
        //return true;

        var fk = proxy.getEpicDomain(proxy.globalTabUrl);
        //  alert(fk)
        //console.log('uk check :'+ url)
        if (
          fk == "google.com" ||
          fk == "gstatic.com" ||
          fk == "google.co" ||
          fk == "www.google.com"
        ) {
          return true;
        } //else {
        //     return false;
      }
      console.log("fake car: " + kf);
      if (
        kf == proxyEnabledSites[i] ||
        kf == "google.co" ||
        fk == "google.com" ||
        kf == "gstatic.com"
      )
        return true;
    }

    return false;
  },

  proxySettings: function (config) {
    chrome.proxy.settings.set(
      {
        value: config,
        scope: "regular",
      },
      function () {}
    );
  },

  // ***** USE Servers ***** >>>
  connect_use: function () {
    var config_use_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS use10.theepicbrowser.com:30442; DIRECT;';\n" +
          "return 'HTTPS use10.theepicbrowser.com:30442;HTTPS backup10.theepicbrowser.com:30442;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_use_epicbrowser_com);
    //alert('connected to use');
  },

  connect_use2ndServer: function () {
    var config_connect_use2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS use11.theepicbrowser.com:30442; DIRECT';\n" +
          "return 'HTTPS use11.theepicbrowser.com:30442;HTTPS backup10.theepicbrowser.com:30442;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_use2ndServer_epicbrowser_com);
    //alert('connected to use');
  },
  connect_use3rdServer: function () {
    var config_connect_use3rdServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS use12.theepicbrowser.com:30442; DIRECT';\n" +
          "return 'HTTPS use12.theepicbrowser.com:30442;HTTPS backup10.theepicbrowser.com:30442;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_use3rdServer_epicbrowser_com);
    //alert('connected to use');
  },
  connect_use4thServer: function () {
    var config_connect_use4thServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS use13.theepicbrowser.com:30442; DIRECT';\n" +
          "return 'HTTPS use13.theepicbrowser.com:30442;HTTPS backup10.theepicbrowser.com:30442;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_use4thServer_epicbrowser_com);
    //alert('connected to use');
  },
  connect_use5thServer: function () {
    var config_connect_use5thServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS use14.theepicbrowser.com:30442; DIRECT';\n" +
          "return 'HTTPS use14.theepicbrowser.com:30442;HTTPS backup10.theepicbrowser.com:30442;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_use5thServer_epicbrowser_com);
    //alert('connected to use');
  },
  // ***** USE Servers ***** <<<

  // ***** USW Servers ***** >>>
  connect_usw: function () {
    var config_usw_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS usw10.theepicbrowser.com:41763;DIRECT;';\n" +
          "return 'HTTPS usw10.theepicbrowser.com:41763;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_usw_epicbrowser_com);
    // alert('connected to USW');
  },
  connect_usw2ndServer: function () {
    var config_connect_usw2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS usw11.theepicbrowser.com:41763;DIRECT;';\n" +
          "return 'HTTPS usw11.theepicbrowser.com:41763;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_usw2ndServer_epicbrowser_com);
    // alert('connected to USW');
  },
  connect_usw3rdServer: function () {
    var config_connect_usw3rdServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS usw12.theepicbrowser.com:41763;DIRECT;';\n" +
          "return 'HTTPS usw12.theepicbrowser.com:41763;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_usw3rdServer_epicbrowser_com);
    // alert('connected to USW');
  },
  connect_usw4thServer: function () {
    var config_connect_usw4thServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS usw13.theepicbrowser.com:41763;DIRECT;';\n" +
          "return 'HTTPS usw13.theepicbrowser.com:41763;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_usw4thServer_epicbrowser_com);
    // alert('connected to USW');
  },
  // ***** USW Servers ***** <<<

  // ***** Canada Servers ***** >>>
  connect_canada: function () {
    var config_ca_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS ca10.epicbrowser.net:43065;DIRECT;';\n" +
          "return 'HTTPS ca10.epicbrowser.net:43065;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_ca_epicbrowser_com);
    //alert('connected to canada');
  },
  connect_canada2ndServer: function () {
    var config_ca2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS ca11.epicbrowser.net:43065;DIRECT;';\n" +
          "return 'HTTPS ca11.epicbrowser.net:43065;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_ca2ndServer_epicbrowser_com);
    //alert('connected to canada');
  },
  // ca3 used in android.

  connect_canada4thServer: function () {
    var config_connect_canada4thServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS ca12.epicbrowser.net:43065;DIRECT;';\n" +
          "return 'HTTPS ca12.epicbrowser.net:43065;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_canada4thServer_epicbrowser_com);
    //alert('connected to canada');
  },
  connect_canada5thServer: function () {
    var config_connect_canada5thServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS ca13.epicbrowser.net:43065;DIRECT;';\n" +
          "return 'HTTPS ca13.epicbrowser.net:43065;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_canada5thServer_epicbrowser_com);
    //alert('connected to canada');
  },
  // ***** Canada Servers ***** <<<

  // ***** UK Servers ***** >>>
  connect_uk: function () {
    var config_global_epicbrowser_net = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS uk10.epicbrowser.net:34974;DIRECT;';\n" +
          "return 'HTTPS uk10.epicbrowser.net:34974;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_global_epicbrowser_net);
    //alert('connected to uk');
  },
  connect_uk2ndServer: function () {
    var config_uk2ndServer_epicbrowser_net = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS uk11.epicbrowser.net:34974;DIRECT;';\n" +
          "return 'HTTPS uk11.epicbrowser.net:34974;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_uk2ndServer_epicbrowser_net);
    //alert('connected to uk');
  },
  connect_uk3rdServer: function () {
    var config_connect_uk3rdServer_epicbrowser_net = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS uk12.epicbrowser.net:34974;DIRECT;';\n" +
          "return 'HTTPS uk12.epicbrowser.net:34974;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_uk3rdServer_epicbrowser_net);
    //alert('connected to uk');
  },
  connect_uk4thServer: function () {
    var config_connect_uk4thServer_epicbrowser_net = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS uk13.epicbrowser.net:34974;DIRECT;';\n" +
          "return 'HTTPS uk13.epicbrowser.net:34974;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_uk4thServer_epicbrowser_net);
    //alert('connected to uk');
  },
  // ***** UK Servers ***** <<<

  // ***** Germany Servers ***** >>>
  connect_germany: function () {
    var config_de_epicbrowser_cm = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS de10.theepicbrowser.com:42874;DIRECT;';\n" +
          "return 'HTTPS de10.theepicbrowser.com:42874;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_de_epicbrowser_cm);
    //alert('connected to germany');
  },
  connect_germany2ndServer: function () {
    var config_connect_germany2ndServer_epicbrowser_cm = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS de11.theepicbrowser.com:42874;DIRECT;';\n" +
          "return 'HTTPS de11.theepicbrowser.com:42874;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_germany2ndServer_epicbrowser_cm);
    //alert('connected to germany');
  },
  connect_germany3rdServer: function () {
    var config_connect_germany3rdServer_epicbrowser_cm = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS de12.theepicbrowser.com:42874;DIRECT;';\n" +
          "return 'HTTPS de12.theepicbrowser.com:42874;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_connect_germany3rdServer_epicbrowser_cm);
    //alert('connected to germany');
  },
  // ***** Germany Servers ***** <<<

  // ***** France Servers ***** >>>
  // Got some issue with this server, couldn't able to login, so we are distributing the traffic of frace in between
  // 50% traffic to the fr.epicbrowser.net and 50% to the fr2.epicbrowser.net
  // connect_france: function (){
  //      var config_fr_epicbrowser_com = {
  //          mode: "pac_script",
  //          pacScript: {
  //             data: "function FindProxyForURL(url, host) {\n" +
  //              "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
  //                   "return 'DIRECT;';\n" +
  //              "else if(host == 'www.epicsearch.in') \n" +
  //                   "return 'fr.epicbrowser.com:8888;DIRECT;';\n" +
  //              "return 'HTTPS fr.epicbrowser.com:8888;';\n" +

  //             "}"
  //         }
  //     };

  //     proxy.proxySettings(config_fr_epicbrowser_com);
  //    // alert('connected to france');
  // },
  // ***********************************************
  connect_france2ndServer: function () {
    var config_fr2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS fr10.epicbrowser.net:42784;DIRECT;';\n" +
          "return 'HTTPS fr10.epicbrowser.net:42784;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_fr2ndServer_epicbrowser_com);
    // alert('connected to france');
  },
  connect_france3rdServer: function () {
    var config_fr3rdServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS fr11.epicbrowser.net:42784;DIRECT;';\n" +
          "return 'HTTPS fr11.epicbrowser.net:42784;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_fr3rdServer_epicbrowser_com);
    // alert('connected to france');
  },
  // ***** France Servers ***** <<<

  // ***** Netherlands Servers ***** >>>
  connect_netherlands: function () {
    var config_nl_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS ne10.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS ne10.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_nl_epicbrowser_com);
    // alert('connected to france');
  },
  connect_netherlands2ndServer: function () {
    var config_nl2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS ne11.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS ne11.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_nl2ndServer_epicbrowser_com);
    // alert('connected to france');
  },
  // ***** Netherlands Servers ***** <<<

  // ***** Singapore Servers ***** >>>
  connect_singapore: function () {
    var config_singapore_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS sg10.epicbrowser.net:42478;DIRECT;';\n" +
          "return 'HTTPS sg10.epicbrowser.net:42478;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_singapore_epicbrowser_com);
    //alert('connected to singapore');
  },

  connect_singapore2ndServer: function () {
    var config_singapore2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS sg11.epicbrowser.net:42478;DIRECT;';\n" +
          "return 'HTTPS sg11.epicbrowser.net:42478;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_singapore2ndServer_epicbrowser_com);
    //alert('connected to singapore');
  },
  // ***** Singapore Servers ***** <<<
  // ***** Australia Servers ***** >>>
  connect_australia: function () {
    var config_australia_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS au10.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS au10.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_australia_epicbrowser_com);
    //alert('connected to australia');
  },

  connect_australia2ndServer: function () {
    var config_australia2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS au11.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS au11.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_australia2ndServer_epicbrowser_com);
    //alert('connected to australia');
  },
  // ***** Australia Servers ***** <<<
  // ***** Japan Servers ***** >>>
  connect_japan: function () {
    var config_japan_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS jp10.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS jp10.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_japan_epicbrowser_com);
    //alert('connected to japan');
  },

  connect_japan2ndServer: function () {
    var config_japan2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS jp11.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS jp11.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_japan2ndServer_epicbrowser_com);
    //alert('connected to japan');
  },
  // ***** Japan Servers ***** <<<
  // ***** Korea Servers ***** >>>
  connect_korea: function () {
    var config_korea_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS kr10.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS kr10.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_korea_epicbrowser_com);
    //alert('connected to korea');
  },

  connect_korea2ndServer: function () {
    var config_korea2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS kr11.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS kr11.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_korea2ndServer_epicbrowser_com);
    //alert('connected to korea');
  },
  // ***** Korea Servers ***** <<<
  // ***** Brazil Servers ***** >>>
  connect_brazil: function () {
    var config_brazil_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS br10.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS br10.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_brazil_epicbrowser_com);
    //alert('connected to brazil');
  },

  connect_brazil2ndServer: function () {
    var config_brazil2ndServer_epicbrowser_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS br11.epicbrowser.net:43074;DIRECT;';\n" +
          "return 'HTTPS br11.epicbrowser.net:43074;';\n" +
          "}",
      },
    };

    proxy.proxySettings(config_brazil2ndServer_epicbrowser_com);
    //alert('connected to brazil');
  },
  // ***** Brazil Servers ***** <<<
  connectThruProxy: function () {
    var config_faisla_in = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host=='duckduckgo.com' || host=='www.google.com' || host=='www.google.co.in' || host=='blekko.com' || host=='encrypted.google.com' || host=='www.bing.com'|| host=='live.com' || host=='infospace.com' || host=='www.google.co.uk' ||  host=='ixquick.com' || host=='dogpile.com' || host=='inspcloud.com' || host=='yandex.com' ||host=='yandex.ru' || host=='yandex.rt' || host=='naver.com' || host=='naver.net' || host=='nate.com'|| host=='baidu.com'|| host=='ask.com'|| host=='sogou.com'||host=='soso.com'|| host=='so.com'||host=='sezname.cz' || host=='vinden.nl' || host=='onet.pl') \n" +
          "return 'HTTPS www.faisla.in:44300;';\n" +
          "else if(host == 'www.epicsearch.in' || host == '*.search.yahoo.com' || host == 'search.yahoo.com') \n" +
          "  return 'HTTPS www.faisla.in:44300; DIRECT;';\n" +
          "else return DIRECT\n" +
          "}",
      },
    };

    var config_epicbrowser_net = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host=='duckduckgo.com' || host=='www.google.com' || host=='www.google.co.in' || host=='blekko.com' || host=='encrypted.google.com' || host=='www.bing.com'|| host=='live.com' || host=='infospace.com' || host=='www.google.co.uk' ||  host=='ixquick.com' || host=='dogpile.com' || host=='inspcloud.com' || host=='yandex.com' ||host=='yandex.ru' || host=='yandex.rt' || host=='naver.com' || host=='naver.net' || host=='nate.com'|| host=='baidu.com'|| host=='ask.com'|| host=='sogou.com'||host=='soso.com'|| host=='so.com'||host=='sezname.cz' || host=='vinden.nl' || host=='onet.pl') \n" +
          "return 'HTTPS epicbrowser.net:44300;';\n" +
          "else if(host == 'www.epicsearch.in' || host == '*.search.yahoo.com' || host == 'search.yahoo.com') \n" +
          "  return 'HTTPS epicbrowser.net:44300; DIRECT;';\n" +
          "else return DIRECT\n" +
          "}",
      },
    };

    var config_odecide_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host=='duckduckgo.com' || host=='www.google.com' || host=='www.google.co.in' || host=='blekko.com' || host=='encrypted.google.com' || host=='www.bing.com'|| host=='live.com' || host=='infospace.com' || host=='www.google.co.uk' ||  host=='ixquick.com' || host=='dogpile.com' || host=='inspcloud.com' || host=='yandex.com' ||host=='yandex.ru' || host=='yandex.rt' || host=='naver.com' || host=='naver.net' || host=='nate.com'|| host=='baidu.com'|| host=='ask.com'|| host=='sogou.com'||host=='soso.com'|| host=='so.com'||host=='sezname.cz' || host=='vinden.nl' || host=='onet.pl') \n" +
          "return 'HTTPS www.odecide.com:44300;';\n" +
          "else if(host == 'www.epicsearch.in' || host == '*.search.yahoo.com' || host == 'search.yahoo.com') \n" +
          "  return 'HTTPS www.odecide.com:44300; DIRECT;';\n" +
          "else return DIRECT\n" +
          "}",
      },
    };

    console.log(rand);
    if (rand <= 35) {
      //proxy.proxySettings(config_epicbrowser_net);
      proxy.proxySettings(config_faisla_in);
    } else if (rand > 35 && rand <= 70) {
      proxy.proxySettings(config_odecide_com);
    } else {
      proxy.proxySettings(config_epicbrowser_net);
      //proxy.proxySettings(config_odecide_com);
    }
  },

  connect_global: function () {
    var config_global_faisla_in = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS www.faisla.in:44300;DIRECT;';\n" +
          "return 'HTTPS www.faisla.in:44300;';\n" +
          "}",
      },
    };

    var config_global_epicbrowser_net = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS epicbrowser.net:44300;DIRECT;';\n" +
          "return 'HTTPS epicbrowser.net:44300;';\n" +
          "}",
      },
    };

    var config_global_odecide_com = {
      mode: "pac_script",
      pacScript: {
        data:
          "function FindProxyForURL(url, host) {\n" +
          "if(host == '*.search.yahoo.com' || host == 'search.yahoo.com' || host == 'ys.epicbrowser.com' || host == 'searchyahoo.epicbrowser.com' || host == 'nt.epicbrowser.com' || host == 'updates.epic browser.com') \n" +
          "return 'DIRECT;';\n" +
          "else if(host == 'www.epicsearch.in') \n" +
          "return 'HTTPS www.odecide.com:44300;DIRECT;';\n" +
          "return 'HTTPS www.odecide.com:44300;';\n" +
          "}",
      },
    };
    console.log(rand);
    if (rand <= 35) {
      //proxy.proxySettings(config_epicbrowser_net);
      proxy.proxySettings(config_global_faisla_in);
    } else if (rand > 35 && rand <= 70) {
      proxy.proxySettings(config_global_odecide_com);
    } else {
      proxy.proxySettings(config_global_epicbrowser_net);
      // alert('connected config_global_epicbrowser_net');
      //proxy.proxySettings(config_odecide_com);
    }

    //config_global_epicbrowser_net
    //proxy.proxySettings(config_global_odecide_com);
    //proxy.proxySettings(config_global_faisla_in);
  },

  connectDirectly: function () {
    //alert('commect directly')
    proxy.proxySettings({
      mode: "direct",
    });
  },
};

var requestFilter = {
  urls: ["<all_urls>"],
};

setProxy = function (details) {
  // var obj = {};
  // obj.tabId = details.tabId;
  // obj.url = proxy_utils.get_stripped_url(details.url)
  // obj.enabled = false;

  // if (localStorage.getItem('proxyMode') == "on") {            // ***** Chrome.storage changes *****
  if (getItem("proxyMode") == "on") {
    // alert('THIS CODE IS NOT');
    proxy.connect_global();
  }

  // else if (proxy.checkAndEnableProxy(obj)) {
  //     proxy.connectThruProxy();
  // } else
  //     proxy.connectDirectly();

  if (obj.url.indexOf("netflix.com") != -1) {
    return {
      redirectUrl: details.url.replace(
        "netflix.com/",
        "updates.epicbrowser.com/extensions/win/netflix.html"
      ),
    };
  }

  return {};
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var rand = getRandomInt(0, 100);
// *******************************************

function connect_to_country(countryId) {
  switch (countryId) {
    case "eastUSAProxy":
      if (rand <= 20) {
        proxy.connect_use();
        // alert(use1st server);
      } else if (rand > 20 && rand <= 40) {
        proxy.connect_use2ndServer();
        // alert(use2nd server);
      } else if (rand > 40 && rand <= 60) {
        proxy.connect_use3rdServer();
        // alert(use3rd server);
      } else if (rand > 60 && rand <= 80) {
        proxy.connect_use4thServer();
      } else {
        proxy.connect_use5thServer();
        // alert(use4th server);
      }
      break;
    case "westUSAProxy":
      if (rand <= 25) {
        proxy.connect_usw();
      } else if (rand > 25 && rand <= 50) {
        proxy.connect_usw2ndServer();
      } else if (rand > 50 && rand <= 75) {
        proxy.connect_usw3rdServer();
      } else {
        proxy.connect_usw4thServer();
      }
      break;
    case "CanadaProxy":
      if (rand <= 25) {
        proxy.connect_canada();
      } else if (rand > 25 && rand <= 50) {
        proxy.connect_canada2ndServer();
      } else if (rand > 50 && rand <= 75) {
        proxy.connect_canada4thServer();
      } else {
        proxy.connect_canada5thServer();
      }
      break;
    case "deProxy":
      if (rand <= 34) {
        proxy.connect_germany();
      } else if (rand > 34 && rand <= 67) {
        proxy.connect_germany2ndServer();
      } else {
        proxy.connect_germany3rdServer();
      }
      break;
    case "uk":
      if (rand <= 25) {
        proxy.connect_uk();
      } else if (rand > 25 && rand <= 50) {
        proxy.connect_uk2ndServer();
      } else if (rand > 50 && rand <= 75) {
        proxy.connect_uk3rdServer();
      } else {
        proxy.connect_uk4thServer();
      }
      break;
    case "lyonFranceProxy":
      // Got some issue with this server, couldn't able to login, so we are distributing the traffic of frace in between
      // 50% traffic to the fr.epicbrowser.net and 50% to the fr2.epicbrowser.net
      // if(rand <= 34){
      //     proxy.connect_france();
      // } else if(rand > 34 && rand <= 67){
      //     proxy.connect_france2ndServer();
      // } else {
      //     proxy.connect_france3rdServer();
      //     // alert(france3rdServer);
      // }
      if (rand <= 50) {
        proxy.connect_france2ndServer();
      } else {
        proxy.connect_france3rdServer();
      }
      // **********************
      break;
    case "NetherlandsProxy":
      if (rand <= 50) {
        proxy.connect_netherlands();
      } else {
        proxy.connect_netherlands2ndServer();
      }
      break;
    case "singapore":
      if (rand <= 50) {
        proxy.connect_singapore();
      } else {
        proxy.connect_singapore2ndServer();
      }
      break;
    case "australia":
      if (rand <= 50) {
        proxy.connect_australia();
      } else {
        proxy.connect_australia2ndServer();
      }
      break;
    case "brazil":
      if (rand <= 50) {
        proxy.connect_brazil();
      } else {
        proxy.connect_brazil2ndServer();
      }
      break;
    case "japan":
      if (rand <= 50) {
        proxy.connect_japan();
      } else {
        proxy.connect_japan2ndServer();
      }
      break;
    case "korea":
      if (rand <= 50) {
        proxy.connect_korea();
      } else {
        proxy.connect_korea2ndServer();
      }
      break;
    default:
    //proxy.connect_global();
    //alert('country not set yet');
  }
}

initStorage(); // ***** Chrome.storage changes *****

// #agad - handle whitelisted site

function updateToggleButton(id, value) {
  let noEl = document.querySelector(`#${id} .toggle-off`);
  let yesEl = document.querySelector(`#${id} .toggle-on`);

  function toggleOff() {
    yesEl.classList.replace("selected", "unselected");
    noEl.classList.replace("unselected", "selected");
  }
  function toggleOn() {
    noEl.classList.replace("selected", "unselected");
    yesEl.classList.replace("unselected", "selected");
  }
  if (value == true) {
    toggleOn();
  } else {
    toggleOff();
  }
}

function promisify(fn) {
  return new Promise((accept, cancel) => {
    fn(accept);
  });
}

function getHostFromUrl(url) {
  var host = url.match(/^(.*:)\/\/([a-z0-9\-.]+)(:[0-9]+)?(.*)$/)[2];
  var proto = url.match(/^(.*:)\/\/([a-z0-9\-.]+)(:[0-9]+)?(.*)$/)[1];
  var text = host;
  var index = text.indexOf("www.");
  if (index != -1) text = text.substring(index + 4);
  return text;
}

async function setCurrentDomainNameLabel(host) {
  document.querySelector("#current-domain-name").innerHTML = host;
}

//change to current domain name

let whitelistedSitesMap = {};
async function loadWhitelistedSitesMap() {
  const whitelistedSites =
    (await promisify((r) => chrome.storage.sync.get("whitelistedSites", r)))
      .whitelistedSites || [];
  whitelistedSites.forEach((site) => {
    whitelistedSitesMap[site] = true;
  });
}
async function saveWhitelistedSitesMap() {
  let whitelistedSites = Object.keys(whitelistedSitesMap).filter(
    (k) => whitelistedSitesMap[k] == true
  );
  await promisify((r) => chrome.storage.sync.set({ whitelistedSites }, r));

  //notify background
}

function isWebPage(url) {
  return url.match(/^http(?:s)?:\/\//) != null;
}

async function loadUI() {
  const tab = await promisify((r) => chrome.tabs.getSelected(null, r));
  if (!isWebPage(tab.url)) {
    document.querySelector("#proxyAllowedWrapper").style.display = "none";
    return;
  }
  const host = getHostFromUrl(tab.url);
  let proxyId = chrome.runtime.id;
  //set current domain name label
  setCurrentDomainNameLabel(host);

  function toggleWhitelistedSiteOn() {
    return promisify((r) =>
      chrome.extension.sendMessage(
        { greeting: "toggleWhitelistedSite", value: true, url: host },
        r
      )
    );
  }
  function toggleWhitelistedSiteOff() {
    return promisify((r) =>
      chrome.extension.sendMessage(
        { greeting: "toggleWhitelistedSite", value: false, url: host },
        r
      )
    );
  }
  // #agad - whitelisted sites
  document
    .querySelector("#link-whitelisted-sites")
    ?.addEventListener("click", () => {
      chrome.tabs.create({ url: "options.html" });
    });

  let v = await promisify((r) =>
    chrome.extension.sendMessage(
      { greeting: "isWhitelistedSite", url: host },
      r
    )
  );

  updateToggleButton("proxyAllowed", !v);

  document
    .querySelector("#proxyAllowed .toggle-off")
    .addEventListener("click", function () {
      updateToggleButton("proxyAllowed", false);
      toggleWhitelistedSiteOn();
    });

  document
    .querySelector("#proxyAllowed .toggle-on")
    .addEventListener("click", function () {
      updateToggleButton("proxyAllowed", true);
      toggleWhitelistedSiteOff();
    });
}

// ************ Button Toggle On/Off *************

function toggleImage() {
  var onButton = document.getElementById("plugins_Y");
  var offButton = document.getElementById("plugins_N");
  var popupInner = document.querySelector(
    ".sym-hidden-reflex-proxy-popup-inner"
  );

  if (onButton.style.display === "none") {
    onButton.style.display = "block";
    offButton.style.display = "none";
    popupInner.style.display = "block";
  } else {
    onButton.style.display = "none";
    offButton.style.display = "block";
    popupInner.style.display = "none";
  }
}

function toggleButton() {
  var onButton = document.getElementById("toggle-on");
  var offButton = document.getElementById("toggle-off");
  var toggleText = document.getElementById("toggle-text");

  if (onButton.style.display === "none") {
    onButton.style.display = "block";
    offButton.style.display = "none";
    toggleText.innerHTML = "ENABLED";
    toggleText.style.color = "green";
  } else {
    onButton.style.display = "none";
    offButton.style.display = "block";
    toggleText.innerHTML = "DISABLED";
    toggleText.style.color = "red";
  }
}

loadUI();
