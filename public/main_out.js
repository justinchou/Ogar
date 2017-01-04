(function (a, $) {
    // a 是 window, MC 是index.html中定义的 MiniclipAPI

    function setCookie(a, expire) {
        if (expire) {
            var b = new Date;
            b.setTime(b.getTime() + 864E5 * expire);    // 864E5 => 86400 * 1000 => 1000 Days
            b = "; expires=" + b.toGMTString()
        } else b = "";
        document.cookie = "agario_redirect=" + a + b + "; path=/"
    }

    function setRegion() {
        // $.get(protocol + "//gc.agar.io", function (data) {
        //     var arr = data.split(" ");
        //     var lang1 = arr[0];
        //     var lang2 = arr[1] || "";
        //     if (lang.hasOwnProperty(lang1)) {
        //         if ("string" == typeof lang[lang1]) {
        //             MC.getRegion() || (MC.setRegion(lang[lang1]), $("#region").val(MC.getRegion()))
        //         } else {
        //             lang[lang1].hasOwnProperty(lang2) && !MC.getRegion() && (MC.setRegion(lang[lang1][lang2]), $("#region").val(MC.getRegion()))
        //         }
        //     }
        //     if ("" != lang1) {
        //         cc.initialise({
        //             cookies: {social: {}, analytics: {}, advertising: {}, necessary: {}},
        //             settings: {consenttype: "explicit"}
        //         });
        //         cc.setLocation(lang1);
        //     }
        // }, "text");

        // var arr = "CN ?".split(" ");
        // var lang1 = arr[0];
        // var lang2 = arr[1] || "";
        // if (lang.hasOwnProperty(lang1)) {
        //     if ("string" == typeof lang[lang1]) {
        //         MC.getRegion() || (MC.setRegion(lang[lang1]), $("#region").val(MC.getRegion()));
        //     } else {
        //         lang[lang1].hasOwnProperty(lang2) && !MC.getRegion() && (MC.setRegion(lang[lang1][lang2]), $("#region").val(MC.getRegion()))
        //     }
        // }
        // if ("" != lang1) {
        //     cc.initialise({
        //         cookies: {social: {}, analytics: {}, advertising: {}, necessary: {}},
        //         settings: {consenttype: "explicit"}
        //     });
        //     cc.setLocation(lang1);
        // }

        var lang1 = "CN";
        MC.getRegion() || (MC.setRegion(lang[lang1]), $("#region").val(MC.getRegion()));
        cc.initialise({
            cookies: {social: {}, analytics: {}, advertising: {}, necessary: {}},
            settings: {consenttype: "explicit"}
        });
        cc.setLocation(lang1);
    }

    function D(b) {
        b.preventDefault();
        a.core && a.core.playerZoom && a.core.playerZoom(b.wheelDelta / -120 || b.detail || 0)
    }

    function E(a) {
        d.context = "google" == a ? "google" : "facebook";
        updateStorage()
    }

    function updateStorage() {
        a.localStorage[q] = JSON.stringify(d);
        d = JSON.parse(a.localStorage[q]);
        a.storageInfo = d;
        "google" == d.context ? ($("#gPlusShare").show(), $("#fbShare").hide()) : ($("#gPlusShare").hide(), $("#fbShare").show())
    }

    function F(b) {
        $("#helloContainer").attr("data-has-account-data");
        "" != b.displayName && (b.name = b.displayName);
        if (null == b.name || void 0 == b.name) b.name = "";
        var e = b.name.lastIndexOf("_");
        -1 != e && (b.name = b.name.substring(0, e));
        $("#helloContainer").attr("data-has-account-data", "1");
        $("#helloContainer").attr("data-logged-in", "1");
        $(".agario-profile-panel .progress-bar-star").text(b.level);
        $(".agario-exp-bar .progress-bar-text").text(b.xp + "/" + b.xpNeeded + " XP");
        $(".agario-exp-bar .progress-bar").css("width", (88 * b.xp / b.xpNeeded).toFixed(2) + "%");
        $(".agario-profile-name").text(b.name);
        "" != b.picture && $(".agario-profile-picture").attr("src", b.picture);
        d.userInfo.level = b.level;
        d.userInfo.xp = b.xp;
        d.userInfo.xpNeeded = b.xpNeeded;
        d.userInfo.displayName = b.name;
        d.userInfo.loggedIn = "1";
        a.updateStorage()
    }

    function r(b, e) {
        var k = b;
        if (d.userInfo.loggedIn) {
            var h = $("#helloContainer").is(":visible") && "1" == $("#helloContainer").attr("data-has-account-data");
            k && k || (k = d.userInfo);
            if (h) {
                var g = +$(".agario-exp-bar .progress-bar-text").first().text().split("/")[0], h = +$(".agario-exp-bar .progress-bar-text").first().text().split("/")[1].split(" ")[0], l = $(".agario-profile-panel .progress-bar-star").first().text();
                if (l != k.level) r({xp: h, xpNeeded: h, level: l}, function () {
                    $(".agario-profile-panel .progress-bar-star").text(k.level);
                    $(".agario-exp-bar .progress-bar").css("width", "100%");
                    $(".progress-bar-star").addClass("animated tada").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                        $(".progress-bar-star").removeClass("animated tada")
                    });
                    setTimeout(function () {
                        $(".agario-exp-bar .progress-bar-text").text(k.xpNeeded + "/" + k.xpNeeded + " XP");
                        r({xp: 0, xpNeeded: k.xpNeeded, level: k.level}, function () {
                            r(k)
                        })
                    }, 1E3)
                }); else {
                    var f = Date.now(), n = function () {
                        var b;
                        b = (Date.now() - f) / 1E3;
                        b = 0 > b ? 0 : 1 < b ? 1 : b;
                        b = b * b * (3 - 2 * b);
                        $(".agario-exp-bar .progress-bar-text").text(~~(g + (k.xp - g) * b) + "/" + k.xpNeeded + " XP");
                        $(".agario-exp-bar .progress-bar").css("width", (88 * (g + (k.xp - g) * b) / k.xpNeeded).toFixed(2) + "%");
                        e && e();
                        1 > b && a.requestAnimationFrame(n)
                    };
                    a.requestAnimationFrame(n)
                }
            }
        }
    }

    function G() {
        1 != H && 0 != z && 0 != I && (H = !0, ("1" == a.storageInfo.loginIntent &&
        "facebook" == a.storageInfo.context || J) && a.FB.getLoginStatus(function (b) {
            "connected" === b.status ? K(b) : a.logout()
        }), a.facebookRelogin = L, a.facebookLogin = L)
    }

    function L(b) {
        if (null == a.FB) alert("You seem to have something blocking Facebook on your browser, please check for any extensions"), b(null); else return d.loginIntent = "1", a.updateStorage(), a.FB.login(function (a) {
            K(a);
            b(a)
        }, {scope: A, w: "rerequest"}), !0
    }

    function K(b) {
        if ("connected" == b.status) {
            var e = b.authResponse.accessToken;
            null == e || "undefined" == e || "" == e ? (3 > M && (M++, a.facebookRelogin()), a.logout()) : (a.fetchFacebookPermissions(), a.MC.doLoginWithFB(e), f.cache.login_info = [e, "facebook"], a.FB.api("/me/picture?width=180&height=180", function (e) {
                d.userInfo.picture = e.data.url;
                a.updateStorage();
                $(".agario-profile-picture").attr("src", e.data.url);
                d.userInfo.socialId = b.authResponse.userID;
                w()
            }), $("#helloContainer").attr("data-logged-in", "1"), d.context = "facebook", d.loginIntent = "1", a.updateStorage(), a.MC.showInstructionsPanel(!0))
        }
    }

    var m = document.createElement("canvas");
    if ("undefined" != typeof console &&
        "undefined" != typeof DataView &&
        "undefined" != typeof WebSocket &&
        m && null != m.getContext &&
        a.localStorage
    ) {
        // 获取通过get url传入的参数
        var z = false, x = {};
        (function () {
            var b = a.location.search;
            "?" == b.charAt(0) && (b = b.slice(1));
            for (var b = b.split("&"), e = 0; e < b.length; e++) {
                var c = b[e].split("=");
                x[c[0]] = c[1]
            }
        })();
        a.queryString = x;

        // 设置Cookie
        var J = "fb" in x,
            m = "miniclip" in x,
            N = "http:" != a.location.protocol,
            V = "1" == function (a) {
                a += "=";
                for (var b = document.cookie.split(";"), c = 0; c < b.length; c++) {
                    for (var d = b[c]; " " == d.charAt(0);)d = d.substring(1, d.length);
                    if (!d.indexOf(a))return d.substring(a.length, d.length)
                }
                return null;
            }("agario_redirect");
        J || m || (N && !V ?
            (setCookie("1", 1),
            a.location.href = "http:" + a.location.href.substring(a.location.protocol.length),
            setTimeout(function () {setCookie("", -1)}, 3E3)) :
            setCookie("", -1));
        N || setCookie("", -1);

        // 如果未初始化, 进行初始化
        if (!a.agarioNoInit) {
            var protocol = a.location.protocol,
                m = a.navigator.userAgent;

            // 如果是安卓/苹果, 跳转到应用商店 => argo.pro 是跳转到 /mobile/ 下的手机版
            if (-1 != m.indexOf("Android")) {
                // a.ga && a.ga("send", "event", "MobileRedirect", "PlayStore"),
                // setTimeout(function () {
                //     a.location.href = "https://play.google.com/store/apps/details?id=com.miniclip.agar.io"
                // }, 1E3);
            } else if (-1 != m.indexOf("iPhone") || -1 != m.indexOf("iPad") || -1 != m.indexOf("iPod")) {
                // a.ga && a.ga("send", "event", "MobileRedirect", "AppStore")
                // (function () {
                //     a.location.href = "https://itunes.apple.com/app/agar.io/id995999703?mt=8&at=1l3vajp"
                // }, 1E3);
            } else {
                var f = {};
                a.agarApp = f;
                (new Image).src = "/img/split.png";
                var P;
                a.agarioInit = function () {
                    MC.showAds(0);
                    P = setInterval(a.agarioAfterInit, 2E3)
                };
                a.agarioAfterInit = function () {
                    clearInterval(P);
                    z = !0;
                    MC.wasInitialized();
                    null != a.localStorage[q] && (d = JSON.parse(a.localStorage[q]));
                    "1" == d.loginIntent && E(d.context);
                    "" == d.userInfo.name && "" == d.userInfo.displayName || F(d.userInfo);
                    G();
                    f.a.b();
                    MC.getLatestConfigurationID();
                    f.core.init();
                    MC.refreshRegionInfo();
                    setInterval(MC.refreshRegionInfo, 18E4);
                    /firefox/i.test(navigator.userAgent) ? document.addEventListener("DOMMouseScroll", D, !1) : document.body.onmousewheel = D;
                    presetGameMode && MC.setGameMode(presetGameMode, !1);
                    a.location.hash && 6 <= a.location.hash.length ? MC.joinParty(a.location.hash) : (setRegion(), MC.checkRegion());
                    a.MC.setInGameState(!1)
                };
                var p = "";
                a.setAcid = function () {
                };
                a.f = function () {
                    try {
                        console.log('       ,,,,,                                                  \u2553\u2584\u2593\u2584               \n     \u250c\u2593\u2593\u2593\u2593\u2593\u2556                                                 \u2559\u2593\u2593\u2580`              \n     \u2593\u2593\u2593\u255c\u2593\u2593\u2593        ,\u2553\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2510  ,\u2553\u2584\u2584\u2584\u2584\u2584\u2556     \u2553\u2584\u2584 ,\u2553\u2584\u2584\u2310      \u2553\u2584\u2584\u2584     \u2553\u2584\u2584\u2584\u2584\u2584,   \n    \u255f\u2593\u2593\u258c \u2559\u2593\u2593\u2593      \u2593\u2593\u2593\u2580\u2580\u2580\u2593\u2593\u2593\u2593\u2580`  \u2580\u2593\u2580\u2580\u2580\u2580\u2593\u2593\u2593\u2556   \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593`      ]\u2593\u2593\u2593   \u2584\u2593\u2593\u2593\u2593\u2580\u2593\u2593\u2593\u2593\u00c7 \n   \u2590\u2593\u2593\u2593`  \u2593\u2593\u2593\u258c    ]\u2593\u2593\u2593   ]\u2593\u2593\u2593     ,,,,,\u2593\u2593\u2593\u2593   \u2593\u2593\u2593\u2593\u255c          ]\u2593\u2593\u2593  \u255f\u2593\u2593\u2593`   j\u2593\u2593\u2593U\n  \u2553\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2556    \u2580\u2593\u2593\u2593\u2584\u2584\u2593\u2593\u2593\u255c   \u2584\u2593\u2593\u2593\u2593\u2580\u2580\u2593\u2593\u2593\u2593   \u2593\u2593\u2593\u258c           ]\u2593\u2593\u2593  \u2593\u2593\u2593\u2593    ]\u2593\u2593\u2593\u258c\n  \u2593\u2593\u2593\u2593\u2580\u2580\u2580\u2580\u2580\u2580\u2593\u2593\u2593\u00b5   \u2554\u2593\u2593\u2580"""     ]\u2593\u2593\u2593\u2592  ,\u2593\u2593\u2593\u2593   \u2593\u2593\u2593\u258c     ,\u2553\u2553,  ]\u2593\u2593\u2593  \u2559\u2593\u2593\u2593\u2556   \u2584\u2593\u2593\u2593`\n \u2593\u2593\u2593\u2593       \u2593\u2593\u2593\u2593   \u2559\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2588\u2593\u2556  \u2593\u2593\u2593\u2593\u2588\u2588\u2593\u2580\u2593\u2593\u2593   \u2593\u2593\u2593\u258c     \u2593\u2593\u2593\u2593  ]\u2593\u2593\u2593   \u2559\u2580\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2580  \n ````        ```` \u2584\u2593\u2593\u2580""""\u2580\u2593\u2593\u2593    """`  ```   ````      \u2559"`   ```      `"""`    \n                  \u2593\u2593\u2593\u2584,,,\u2553\u2584\u2593\u2593\u2593                                                  \n                   \u2559\u2580\u2580\u2593\u2593\u2593\u2580\u2580\u2580                                                    \n')
                    } catch (b) {
                    }
                };
                var B = {};
                a.addKeyListeners = function () {
                    a.onkeydown = function (b) {
                        if (!B[b.keyCode])switch (B[b.keyCode] = !0, b.keyCode) {
                            case 32:
                                a.core && a.core.split && a.core.split();
                                b.preventDefault();
                                break;
                            case 87:
                                a.core && a.core.eject && a.core.eject();
                                break;
                            case 81:
                                a.core && a.core.specialOn && a.core.specialOn();
                                break;
                            case 27:
                                b.preventDefault();
                                MC.showNickDialog(300);
                                $("#oferwallContainer").is(":visible") && a.closeOfferwall();
                                $("#videoContainer").is(":visible") && a.closeVideoContainer();
                                break;
                            case 220:
                                b.preventDefault(), MC.showStatsDialog()
                        }
                    };
                    a.onkeyup = function (b) {
                        B[b.keyCode] = !1;
                        81 == b.keyCode && a.specialOff && a.core.specialOff()
                    }
                };
                m = function (b) {
                    var e = {}, d = !1, h = {skipDraw: !0, predictionModifier: 1.1};
                    b.init = function () {
                        f.account.init();
                        f.google.h();
                        f.a.init();
                        (d = "debug" in a.queryString) && f.debug.showDebug()
                    };
                    b.bind = function (a, b) {
                        $(e).bind(a, b)
                    };
                    b.unbind = function (a, b) {
                        $(e).unbind(a, b)
                    };
                    b.trigger = function (a, b) {
                        $(e).trigger(a, b)
                    };
                    b.__defineGetter__("debug", function () {
                        return d
                    });
                    b.__defineSetter__("debug", function (a) {
                        return d = a
                    });
                    b.__defineGetter__("proxy", function () {
                        return a.MC
                    });
                    b.__defineGetter__("config", function () {
                        return h
                    });
                    return b
                }({});
                f.core = m;
                f.cache = {};
                m = function (a) {
                    function b(a, b, e, d) {
                        a += "Canvas";
                        var g = $("<canvas>", {id: a});
                        l.append(g);
                        e = new SmoothieChart(e);
                        for (g = 0; g < b.length; g++) {
                            var k = b[g], n = _.extend(T, d[g]);
                            e.addTimeSeries(k, n)
                        }
                        e.streamTo(document.getElementById(a), 0)
                    }

                    function d(a, e) {
                        n[a] = h();
                        b(a, [n[a]], e, [{
                            strokeStyle: "rgba(0, 255, 0, 1)",
                            fillStyle: "rgba(0, 255, 0, 0.2)",
                            lineWidth: 2
                        }])
                    }

                    function h() {
                        return new TimeSeries({F: !1})
                    }

                    var g = !1, l, m = !1, n = {}, T = {
                        strokeStyle: "rgba(0, 255, 0, 1)",
                        fillStyle: "rgba(0, 255, 0, 0.2)",
                        lineWidth: 2
                    };
                    a.showDebug = function () {
                        g || (l = $("#debug-overlay"), d("networkUpdate", {
                            name: "network updates",
                            minValue: 0,
                            maxValue: 240
                        }), n.rttSDev = h(), n.rttMean = h(), b("rttMean", [n.rttSDev, n.rttMean], {
                            name: "rtt",
                            minValue: 0,
                            maxValue: 120
                        }, [{
                            strokeStyle: "rgba(255, 0, 0, 1)",
                            fillStyle: "rgba(0, 255, 0, 0.2)",
                            lineWidth: 2
                        }, {
                            strokeStyle: "rgba(0, 255, 0, 1)",
                            fillStyle: "rgba(0, 255, 0, 0)",
                            lineWidth: 2
                        }]), d("fps", {name: "fps", minValue: 0, maxValue: 70}), g = !0);
                        f.core.debug = !0;
                        l.show()
                    };
                    a.hideDebug = function () {
                        l.hide();
                        f.core.debug = !1
                    };
                    a.updateChart = function (a, b, e) {
                        g && a in n && n[a].append(b, e)
                    };
                    a.__defineGetter__("showPrediction", function () {
                        return m
                    });
                    a.__defineSetter__("showPrediction", function (a) {
                        return m = a
                    });
                    return a
                }({});
                f.debug = m;
                var lang = {
                    AF: "JP-Tokyo",
                    AX: "EU-London",
                    AL: "EU-London",
                    DZ: "EU-London",
                    AS: "SG-Singapore",
                    AD: "EU-London",
                    AO: "EU-London",
                    AI: "US-Atlanta",
                    AG: "US-Atlanta",
                    AR: "BR-Brazil",
                    AM: "JP-Tokyo",
                    AW: "US-Atlanta",
                    AU: "SG-Singapore",
                    AT: "EU-London",
                    AZ: "JP-Tokyo",
                    BS: "US-Atlanta",
                    BH: "JP-Tokyo",
                    BD: "JP-Tokyo",
                    BB: "US-Atlanta",
                    BY: "EU-London",
                    BE: "EU-London",
                    BZ: "US-Atlanta",
                    BJ: "EU-London",
                    BM: "US-Atlanta",
                    BT: "JP-Tokyo",
                    BO: "BR-Brazil",
                    BQ: "US-Atlanta",
                    BA: "EU-London",
                    BW: "EU-London",
                    BR: "BR-Brazil",
                    IO: "JP-Tokyo",
                    VG: "US-Atlanta",
                    BN: "JP-Tokyo",
                    BG: "EU-London",
                    BF: "EU-London",
                    BI: "EU-London",
                    KH: "JP-Tokyo",
                    CM: "EU-London",
                    CA: "US-Atlanta",
                    CV: "EU-London",
                    KY: "US-Atlanta",
                    CF: "EU-London",
                    TD: "EU-London",
                    CL: "BR-Brazil",
                    CN: "CN-China",
                    CX: "JP-Tokyo",
                    CC: "JP-Tokyo",
                    CO: "BR-Brazil",
                    KM: "EU-London",
                    CD: "EU-London",
                    CG: "EU-London",
                    CK: "SG-Singapore",
                    CR: "US-Atlanta",
                    CI: "EU-London",
                    HR: "EU-London",
                    CU: "US-Atlanta",
                    CW: "US-Atlanta",
                    CY: "JP-Tokyo",
                    CZ: "EU-London",
                    DK: "EU-London",
                    DJ: "EU-London",
                    DM: "US-Atlanta",
                    DO: "US-Atlanta",
                    EC: "BR-Brazil",
                    EG: "EU-London",
                    SV: "US-Atlanta",
                    GQ: "EU-London",
                    ER: "EU-London",
                    EE: "EU-London",
                    ET: "EU-London",
                    FO: "EU-London",
                    FK: "BR-Brazil",
                    FJ: "SG-Singapore",
                    FI: "EU-London",
                    FR: "EU-London",
                    GF: "BR-Brazil",
                    PF: "SG-Singapore",
                    GA: "EU-London",
                    GM: "EU-London",
                    GE: "JP-Tokyo",
                    DE: "EU-London",
                    GH: "EU-London",
                    GI: "EU-London",
                    GR: "EU-London",
                    GL: "US-Atlanta",
                    GD: "US-Atlanta",
                    GP: "US-Atlanta",
                    GU: "SG-Singapore",
                    GT: "US-Atlanta",
                    GG: "EU-London",
                    GN: "EU-London",
                    GW: "EU-London",
                    GY: "BR-Brazil",
                    HT: "US-Atlanta",
                    VA: "EU-London",
                    HN: "US-Atlanta",
                    HK: "JP-Tokyo",
                    HU: "EU-London",
                    IS: "EU-London",
                    IN: "JP-Tokyo",
                    ID: "JP-Tokyo",
                    IR: "JP-Tokyo",
                    IQ: "JP-Tokyo",
                    IE: "EU-London",
                    IM: "EU-London",
                    IL: "JP-Tokyo",
                    IT: "EU-London",
                    JM: "US-Atlanta",
                    JP: "JP-Tokyo",
                    JE: "EU-London",
                    JO: "JP-Tokyo",
                    KZ: "JP-Tokyo",
                    KE: "EU-London",
                    KI: "SG-Singapore",
                    KP: "JP-Tokyo",
                    KR: "JP-Tokyo",
                    KW: "JP-Tokyo",
                    KG: "JP-Tokyo",
                    LA: "JP-Tokyo",
                    LV: "EU-London",
                    LB: "JP-Tokyo",
                    LS: "EU-London",
                    LR: "EU-London",
                    LY: "EU-London",
                    LI: "EU-London",
                    LT: "EU-London",
                    LU: "EU-London",
                    MO: "JP-Tokyo",
                    MK: "EU-London",
                    MG: "EU-London",
                    MW: "EU-London",
                    MY: "JP-Tokyo",
                    MV: "JP-Tokyo",
                    ML: "EU-London",
                    MT: "EU-London",
                    MH: "SG-Singapore",
                    MQ: "US-Atlanta",
                    MR: "EU-London",
                    MU: "EU-London",
                    YT: "EU-London",
                    MX: "US-Atlanta",
                    FM: "SG-Singapore",
                    MD: "EU-London",
                    MC: "EU-London",
                    MN: "JP-Tokyo",
                    ME: "EU-London",
                    MS: "US-Atlanta",
                    MA: "EU-London",
                    MZ: "EU-London",
                    MM: "JP-Tokyo",
                    NA: "EU-London",
                    NR: "SG-Singapore",
                    NP: "JP-Tokyo",
                    NL: "EU-London",
                    NC: "SG-Singapore",
                    NZ: "SG-Singapore",
                    NI: "US-Atlanta",
                    NE: "EU-London",
                    NG: "EU-London",
                    NU: "SG-Singapore",
                    NF: "SG-Singapore",
                    MP: "SG-Singapore",
                    NO: "EU-London",
                    OM: "JP-Tokyo",
                    PK: "JP-Tokyo",
                    PW: "SG-Singapore",
                    PS: "JP-Tokyo",
                    PA: "US-Atlanta",
                    PG: "SG-Singapore",
                    PY: "BR-Brazil",
                    PE: "BR-Brazil",
                    PH: "JP-Tokyo",
                    PN: "SG-Singapore",
                    PL: "EU-London",
                    PT: "EU-London",
                    PR: "US-Atlanta",
                    QA: "JP-Tokyo",
                    RE: "EU-London",
                    RO: "EU-London",
                    RU: "RU-Russia",
                    RW: "EU-London",
                    BL: "US-Atlanta",
                    SH: "EU-London",
                    KN: "US-Atlanta",
                    LC: "US-Atlanta",
                    MF: "US-Atlanta",
                    PM: "US-Atlanta",
                    VC: "US-Atlanta",
                    WS: "SG-Singapore",
                    SM: "EU-London",
                    ST: "EU-London",
                    SA: "EU-London",
                    SN: "EU-London",
                    RS: "EU-London",
                    SC: "EU-London",
                    SL: "EU-London",
                    SG: "JP-Tokyo",
                    SX: "US-Atlanta",
                    SK: "EU-London",
                    SI: "EU-London",
                    SB: "SG-Singapore",
                    SO: "EU-London",
                    ZA: "EU-London",
                    SS: "EU-London",
                    ES: "EU-London",
                    LK: "JP-Tokyo",
                    SD: "EU-London",
                    SR: "BR-Brazil",
                    SJ: "EU-London",
                    SZ: "EU-London",
                    SE: "EU-London",
                    CH: "EU-London",
                    SY: "EU-London",
                    TW: "JP-Tokyo",
                    TJ: "JP-Tokyo",
                    TZ: "EU-London",
                    TH: "JP-Tokyo",
                    TL: "JP-Tokyo",
                    TG: "EU-London",
                    TK: "SG-Singapore",
                    TO: "SG-Singapore",
                    TT: "US-Atlanta",
                    TN: "EU-London",
                    TR: "TK-Turkey",
                    TM: "JP-Tokyo",
                    TC: "US-Atlanta",
                    TV: "SG-Singapore",
                    UG: "EU-London",
                    UA: "EU-London",
                    AE: "EU-London",
                    GB: "EU-London",
                    US: "US-Atlanta",
                    UM: "SG-Singapore",
                    VI: "US-Atlanta",
                    UY: "BR-Brazil",
                    UZ: "JP-Tokyo",
                    VU: "SG-Singapore",
                    VE: "BR-Brazil",
                    VN: "JP-Tokyo",
                    WF: "SG-Singapore",
                    EH: "EU-London",
                    YE: "JP-Tokyo",
                    ZM: "EU-London",
                    ZW: "EU-London"
                };
                a.Maths = function (a) {
                    function b(a, b, e) {
                        return a < b ? b : a > e ? e : a
                    }

                    a.B = function (a, e, c) {
                        c = b(c, 0, 1);
                        return a + c * (e - a)
                    };
                    a.A = b;
                    a.fixed = function (a, b) {
                        var e = Math.pow(10, b);
                        return ~~(a * e) / e
                    };
                    return a
                }({});
                a.Utils = function (a) {
                    a.D = function () {
                        for (var a = new Date, b = [a.getMonth() + 1, a.getDate(), a.getFullYear()], a = [a.getHours(), a.getMinutes(), a.getSeconds()], c = 1; 3 > c; c++)10 > a[c] && (a[c] = "0" + a[c]);
                        return "[" + b.join("/") + " " + a.join(":") + "]"
                    };
                    return a
                }({});
                Date.now || (Date.now = function () {
                    return (new Date).getTime()
                });
                var q = "storeObjectInfo", y = {
                    context: null,
                    defaultProvider: "facebook",
                    loginIntent: "0",
                    userInfo: {
                        socialToken: null,
                        tokenExpires: "",
                        level: "",
                        xp: "",
                        xpNeeded: "",
                        name: "",
                        picture: "",
                        displayName: "",
                        loggedIn: "0",
                        socialId: ""
                    }
                }, d = a.defaultSt = y;
                a.storageInfo = d;
                a.createDefaultStorage = function () {
                    d = y
                };
                a.updateStorage = updateStorage;
                a.hasLoginIntent = function () {
                    return "1" == d.loginIntent
                };
                a.checkLoginStatus = function () {
                    "1" == d.loginIntent && (w(), E(d.context))
                };
                var w = function () {
                    a.MC.setProfilePicture(d.userInfo.picture);
                    a.MC.setSocialId(d.userInfo.socialId)
                };
                a.logout = function () {
                    d = y;
                    delete a.localStorage[q];
                    a.localStorage[q] = JSON.stringify(y);
                    updateStorage();
                    Q();
                    f.cache.sentGameServerLogin = !1;
                    delete f.cache.login_info;
                    $("#helloContainer").attr("data-logged-in", "0");
                    $("#helloContainer").attr("data-has-account-data", "0");
                    $(".timer").text("");
                    $("#gPlusShare").hide();
                    $("#fbShare").show();
                    $("#user-id-tag").text("");
                    $(".shop-blocker").fadeOut(100);
                    MC.doLogout();
                    MC.reconnect()
                };
                a.animateAccountData = r;
                a.toggleSocialLogin = function () {
                    $("#socialLoginContainer").toggle();
                    $("#settings").hide();
                    $("#instructions").hide();
                    MC.showInstructionsPanel()
                };
                a.toggleSettings = function () {
                    $("#settings").toggle();
                    $("#socialLoginContainer").hide();
                    $("#instructions").hide();
                    MC.showInstructionsPanel()
                };
                f.account = function (b) {
                    function e() {
                    }

                    function k(b, c) {
                        a.TRModule.init(c.id);
                        if (null == h || h.id != c.id) h = c, null != a.ssa_json && (a.ssa_json.applicationUserId = "" + c.id, a.ssa_json.custom_user_id = "" + c.id), "undefined" != typeof SSA_CORE && SSA_CORE.start()
                    }

                    var h = null;
                    b.init = function () {
                        f.core.bind("user_login", k);
                        f.core.bind("user_logout", e)
                    };
                    b.setUserData = function (a) {
                        F(a)
                    };
                    b.setAccountData = function (a, b) {
                        var e = $("#helloContainer").attr("data-has-account-data", "1");
                        d.userInfo.xp = a.xp;
                        d.userInfo.xpNeeded = a.xpNeeded;
                        d.userInfo.level = a.level;
                        updateStorage();
                        e && b ? r(a) : ($(".agario-profile-panel .progress-bar-star").text(a.level), $(".agario-exp-bar .progress-bar-text").text(a.xp + "/" + a.xpNeeded + " XP"), $(".agario-exp-bar .progress-bar").css("width", (88 * a.xp / a.xpNeeded).toFixed(2) + "%"))
                    };
                    b.v = function (a) {
                        r(a)
                    };
                    return b
                }({});
                var M = 0, I = !1, H = !1, A = "public_profile,email";
                a.facebookLogin = function () {
                    alert("Facebook Login is unavailable, please try again later or check if you are using private mode.")
                };
                a.getFacebookPermissions = function () {
                    return d.permissions
                };
                a.fetchFacebookPermissions = function () {
                    a.FB.api("/me/permissions", function (a) {
                        a && a.data && (d.permissions = a.data)
                    })
                };
                a.requestExtraPermissions = function (b) {
                    var c = a.checkFacebookPermissions(b);
                    c || (-1 == A.indexOf(b) && (A += "," + b), a.facebookRelogin());
                    return !c
                };
                a.checkFacebookPermissions = function (b) {
                    var c = a.getFacebookPermissions;
                    if (c) {
                        c = c();
                        b = b.split(",");
                        if (null == c)return !1;
                        for (var d = 0; d < b.length; d++) {
                            for (var f = !1, g = 0; g < c.length; g++)b[d] == c[g].permission && "granted" == c[g].status && (f = !0);
                            if (!f)return !1
                        }
                        return !0
                    }
                    return !1
                };
                a.fbAsyncInit = function () {
                    // a.FB.init({appId: EnvConfig.fb_app_id, cookie: !0, xfbml: !0, status: !0, version: "v2.2"});
                    // I = !0;
                    // G();
                    // if (EnvConfig.env_staging || EnvConfig.env_production) {
                    //     var b = document.createElement("script"), c = document.getElementsByTagName("script")[0];
                    //     b.src = "https://renotifier.miniclippt.com/rntracking.js?app_id=" + EnvConfig.fb_app_id;
                    //     c.parentNode.insertBefore(b, c)
                    // }
                };
                var C = !1;
                (function (b) {
                    // function d() {
                    //     var a = document.createElement("script");
                    //     a.type = "text/javascript";
                    //     a.async = !0;
                    //     a.src = "//apis.google.com/js/client:platform.js?onload=gapiAsyncInit";
                    //     var b = document.getElementsByTagName("script")[0];
                    //     b.parentNode.insertBefore(a, b);
                    //     h = !0
                    // }

                    var f = {}, h = !1;
                    a.gapiAsyncInit = function () {
                        // $(f).trigger("initialized")
                    };
                    b.google = {
                        h: function () {
                            // d()
                        },
                        g: function (b, c) {
                            // a.gapi.client.load("plus", "v1", function () {
                            //     gapi.client.plus.people.get({userId: "me"}).execute(function (a) {
                            //         c(a)
                            //     })
                            // })
                        }
                    };
                    b.o = function (a) {
                        // h || d();
                        // "undefined" !== typeof gapi ? a() : $(f).bind("initialized", a)
                    };
                    return b
                })(f);
                m = function (b) {
                    function e(b) {
                        a.MC.doLoginWithGPlus(b);
                        f.cache.login_info = [b, "google"];
                        a.MC.showInstructionsPanel(!0)
                    }

                    function k(a) {
                        d.userInfo.picture = a;
                        $(".agario-profile-picture").attr("src", a)
                    }

                    var h = !1, g = !1, l = null, m = {
                        client_id: EnvConfig.gplus_client_id,
                        cookie_policy: "single_host_origin",
                        scope: "https://www.googleapis.com/auth/plus.login email",
                        app_package_name: "com.miniclip.agar.io"
                    };
                    b.a = {
                        G: function () {
                            return l
                        }, s: function () {
                            return d && "1" == d.loginIntent && "google" == d.context
                        }, init: function () {
                            var b = this;
                            f.o(function () {
                                a.gapi.ytsubscribe.go("agarYoutube");
                                h = !0;
                                b.b()
                            })
                        }, b: function () {
                            if (1 != g && 0 != z && 0 != h) {
                                g = !0;
                                var b = this;
                                a.gapi.load("auth2", function () {
                                    l = a.gapi.auth2.init(m);
                                    var c = document.getElementById("gplusLogin");
                                    c.addEventListener("click", function () {
                                        a.MC.googleLogin();
                                        b.l(a.open, l)
                                    });
                                    l.attachClickHandler(c, {}, function () {
                                    }, b.c);
                                    l.currentUser.listen(_.bind(b.m, b));
                                    l.then(_.bind(b.j, b), _.bind(b.c, b))
                                })
                            }
                        }, l: function (b) {
                            a.open = function () {
                                a.open = b;
                                var c = b.apply(this, arguments), d = setInterval(function () {
                                    c.closed && (clearInterval(d), a.MC.onGoogleLoginComplete())
                                }, 100);
                                return c
                            }
                        }, j: function () {
                            l.currentUser.get();
                            this.s() && !l.isSignedIn.get() && a.logout()
                        }, c: function () {
                        }, m: function (b) {
                            if (null != l && null != b) {
                                if (l.isSignedIn.get() && !C) {
                                    C = !0;
                                    d.loginIntent = "1";
                                    var c = b.getAuthResponse(), g = c.access_token, h = b.getBasicProfile();
                                    b = h.getImageUrl();
                                    void 0 == b ? f.google.g(c, function (b) {
                                        b.result.isPlusUser ? (b && k(b.image.url), e(g), b && (d.userInfo.picture = b.image.url), d.userInfo.socialId = h.getId(), w()) : (alert("Please add Google+ to your Google account and try again.\nOr you can login with another account."), a.logout())
                                    }) : (k(b), d.userInfo.picture = b, d.userInfo.socialId = h.getId(), w(), e(g));
                                    d.context = "google";
                                    a.updateStorage()
                                }
                                a.MC.onGoogleLoginComplete()
                            }
                        }, i: function () {
                            l && (l.signOut(), C = !1)
                        }
                    };
                    return b
                }(f);
                a.gplusModule = m;
                var Q = function () {
                    f.a.i()
                };
                a.logoutGooglePlus = Q;
                a.getStatsString = function (b) {
                    var d = $(".stats-time-alive").text();
                    return a.parseString(b, "%@", [d.split(":")[0], d.split(":")[1], $(".stats-highest-mass").text()])
                };
                a.twitterShareStats = function () {
                    a.open("https://twitter.com/intent/tweet?text=" +
                        a.getStatsString("page_tt_share_stats"), "Agar.io", "width=660,height=310,menubar=no,toolbar=no,resizable=yes,scrollbars=no,left=" + (a.screenX + a.innerWidth / 2 - 330) + ",top=" + (a.innerHeight - 310) / 2)
                };
                a.fbShareStats = function () {
                    var b = a.i18n("page_fb_matchresults_title"), c = a.i18n("page_fb_matchresults_description"), d = a.getStatsString("page_fb_matchresults_subtitle");
                    a.FB.ui({
                        method: "feed",
                        display: "iframe",
                        name: b,
                        caption: c,
                        description: d,
                        link: "http://agar.io",
                        C: "http://static2.miniclipcdn.com/mobile/agar/Agar.io_matchresults_fb_1200x630.png",
                        u: {name: "play now!", link: "http://agar.io"}
                    })
                };
                a.fillSocialValues = function (b, c) {
                    "google" == a.storageInfo.context && a.gapi.interactivepost.render(c, {
                        contenturl: EnvConfig.game_url,
                        clientid: EnvConfig.gplus_client_id,
                        cookiepolicy: "http://agar.io",
                        prefilltext: b,
                        calltoactionlabel: "BEAT",
                        calltoactionurl: EnvConfig.game_url
                    })
                };
                $(function () {
                    a.f();
                    "MAsyncInit" in a && a.MAsyncInit();
                    $("[data-itr]").each(function () {
                        var b = $(this), d = b.attr("data-itr");
                        b.html(a.i18n(d))
                    })
                })
            }
        }
    } else {
        alert("You browser does not support this game, we recommend you to use Firefox to play this");
    }
})(window, window.jQuery);