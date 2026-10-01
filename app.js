/* Snow IPTV për Samsung TV (Tizen) – lojtar IPTV në shqip.
   Burimi: Xtream Codes (host + përdorues + fjalëkalim) ose link M3U.
   Videoja luhet me AVPlay të televizorit: luan .ts, HLS, MPEG-2, HEVC, MP2… direkt nga ofruesi. */
"use strict";
var VERSIONI = "1.1.1";
var $ = function (s) { return document.querySelector(s); };
var NE_TV = !!(window.webapis && window.webapis.avplay);

// ------------------------------------------------------------------ ruajtja
var LS = {
  get: function (k, d) { try { var v = localStorage.getItem("mi_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem("mi_" + k, JSON.stringify(v)); } catch (e) {} }
};
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function inicialet(e) { return String(e || "?").replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase() || "TV"; }
function ngjyra(e) { var h = 0; e = String(e || ""); for (var i = 0; i < e.length; i++) h = (h * 31 + e.charCodeAt(i)) % 360; return "hsl(" + h + ",45%,32%)"; }
function ora(t) { var d = new Date(t * 1000); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
function kohe(ms) { var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); s = s % 60;
  return (h ? h + ":" + ("0" + m).slice(-2) : m) + ":" + ("0" + s).slice(-2); }
function b64(s) { if (!s) return ""; try { return decodeURIComponent(escape(atob(s))); } catch (e) { try { return atob(s); } catch (e2) { return s; } } }
function tani() { return Date.now() / 1000; }

var CIL = { figura: LS.get("figura", "auto"), formati: LS.get("formati", "auto"), fshihTeRritur: LS.get("fshihTeRritur", true), nisFundit: LS.get("nisFundit", true) };
function ruajCil() { for (var k in CIL) LS.set(k, CIL[k]); }

// ------------------------------------------------------------------ rrjeti
function merr(url, lloji, sek) {
  return new Promise(function (ok, jo) {
    var x = new XMLHttpRequest(), mbaroi = false;
    x.open("GET", url, true);
    x.timeout = (sek || 25) * 1000;
    x.onload = function () {
      mbaroi = true;
      if (x.status < 200 || x.status >= 300) return jo(new Error("Serveri u përgjigj me gabim " + x.status));
      if (lloji === "text") return ok(x.responseText);
      try { ok(JSON.parse(x.responseText)); } catch (e) { jo(new Error("Përgjigje e pakuptueshme nga serveri")); }
    };
    x.onerror = function () { if (!mbaroi) jo(new Error("S'u lidh dot me serverin. Kontrollo adresën dhe internetin.")); };
    x.ontimeout = function () { jo(new Error("Serveri nuk u përgjigj (koha mbaroi).")); };
    x.send();
  });
}
// ku të çon në fund një link (disa ofrues ridrejtojnë .ts te një server tjetër)
function linkuFundit(url) {
  return new Promise(function (ok) {
    var x = new XMLHttpRequest(), u = url, kryer = false;
    function mbaro() { if (kryer) return; kryer = true; try { x.abort(); } catch (e) {} ok(u); }
    x.open("GET", url, true);
    x.onreadystatechange = function () { if (x.readyState >= 2) { u = x.responseURL || url; mbaro(); } };
    x.onerror = mbaro; setTimeout(mbaro, 6000);
    x.send();
  });
}

// ------------------------------------------------------------------ burimet
var TE_RRITUR = /adult|xxx|18\s*\+|porn|erot|sex|\+18/i;
var XTREAM_RE = /^(https?:\/\/[^\/]+)\/(?:live\/)?([^\/]+)\/([^\/]+)\/(\d+)(?:\.(ts|m3u8))?$/i;

function Xtream(host, user, pass) {
  this.host = host; this.user = user; this.pass = pass; this.info = null; this.formatet = ["ts", "m3u8"];
}
Xtream.prototype.api = function (veprimi, shtesa) {
  var u = this.host + "/player_api.php?username=" + encodeURIComponent(this.user) + "&password=" + encodeURIComponent(this.pass);
  if (veprimi) u += "&action=" + veprimi;
  return merr(u + (shtesa || ""), "json", veprimi && veprimi.indexOf("get_") === 0 && veprimi.indexOf("_streams") > 0 ? 60 : 25);
};
Xtream.prototype.hyr = function () {
  var self = this;
  return this.api("").then(function (d) {
    if (!d || !d.user_info || String(d.user_info.auth) !== "1") throw new Error((d && d.user_info && d.user_info.message) || "Emri ose fjalëkalimi është i gabuar.");
    self.info = d;
    var f = d.user_info.allowed_output_formats;
    if (f && f.length) self.formatet = f;
    return d;
  });
};
Xtream.prototype.ngarko = function () {
  var self = this, bosh = function () { return []; };
  return Promise.all([
    this.api("get_live_categories").catch(bosh), this.api("get_live_streams"),
    this.api("get_vod_categories").catch(bosh), this.api("get_vod_streams").catch(bosh),
    this.api("get_series_categories").catch(bosh), this.api("get_series").catch(bosh)
  ]).then(function (r) {
    var D = { live: [], liveKat: [], vod: [], vodKat: [], ser: [], serKat: [] };
    var kat = function (l) { return (Array.isArray(l) ? l : []).map(function (k) { return { id: String(k.category_id), emri: k.category_name || "Pa emër" }; }); };
    D.liveKat = kat(r[0]); D.vodKat = kat(r[2]); D.serKat = kat(r[4]);
    (Array.isArray(r[1]) ? r[1] : []).forEach(function (x, i) {
      D.live.push({ k: "l" + x.stream_id, sid: x.stream_id, num: +x.num || i + 1, emri: x.name || "", logo: x.stream_icon || "",
        kat: String(x.category_id), epg: x.epg_channel_id || "" });
    });
    (Array.isArray(r[3]) ? r[3] : []).forEach(function (x) {
      D.vod.push({ k: "v" + x.stream_id, sid: x.stream_id, emri: x.name || x.title || "", logo: x.stream_icon || "", kat: String(x.category_id),
        ext: x.container_extension || "mp4", vl: x.rating_5based ? (+x.rating_5based * 2).toFixed(1) : (x.rating && x.rating !== "0" ? x.rating : "") });
    });
    (Array.isArray(r[5]) ? r[5] : []).forEach(function (x) {
      D.ser.push({ k: "s" + x.series_id, sid: x.series_id, emri: x.name || "", logo: x.cover || "", kat: String(x.category_id),
        per: x.plot || "", vl: x.rating_5based ? (+x.rating_5based * 2).toFixed(1) : "" });
    });
    return D;
  });
};
Xtream.prototype.ext = function () {
  if (CIL.formati === "ts" || CIL.formati === "m3u8") return CIL.formati;
  if (!NE_TV) return "m3u8";   // shfletuesi (vetëm për prova) s'luan .ts
  return this.formatet.indexOf("ts") >= 0 ? "ts" : "m3u8";
};
Xtream.prototype.baza = function (lloji) { return this.host + "/" + lloji + "/" + encodeURIComponent(this.user) + "/" + encodeURIComponent(this.pass) + "/"; };
Xtream.prototype.urlLive = function (it) { return this.baza("live") + it.sid + "." + this.ext(); };
Xtream.prototype.urlVod = function (it) { return this.baza("movie") + it.sid + "." + (it.ext || "mp4"); };
Xtream.prototype.urlEp = function (ep) { return this.baza("series") + ep.id + "." + (ep.container_extension || "mp4"); };
Xtream.prototype.epg = function (it) {
  return this.api("get_short_epg", "&stream_id=" + it.sid + "&limit=4").then(function (d) {
    return ((d && d.epg_listings) || []).map(function (p) {
      return { fil: +p.start_timestamp || Date.parse(p.start) / 1000, mb: +p.stop_timestamp || Date.parse(p.end || p.stop) / 1000,
        tit: b64(p.title), per: b64(p.description) };
    }).filter(function (p) { return p.mb > tani(); });
  });
};
Xtream.prototype.epgTani = function () {   // vetëm serveri ynë Mini IPTV e ka: "tani/pastaj" për të gjitha kanalet
  return this.api("get_epg_tani").then(function (d) { return d && !Array.isArray(d) && typeof d === "object" && !d.user_info ? d : null; }).catch(function () { return null; });
};
Xtream.prototype.serial = function (it) { return this.api("get_series_info", "&series_id=" + it.sid); };

function M3U(url) { this.url = url; this.xt = null; }
M3U.prototype.hyr = function () { return Promise.resolve(null); };
M3U.prototype.ngarko = function () {
  var self = this;
  return merr(this.url, "text", 90).then(function (t) {
    if (t.indexOf("#EXT") < 0) throw new Error("Linku nuk është playlist M3U.");
    var D = { live: [], liveKat: [], vod: [], vodKat: [], ser: [], serKat: [] }, katL = {}, katV = {}, info = null, n = 0;
    t.split(/\r?\n/).forEach(function (l) {
      l = l.trim();
      if (l.indexOf("#EXTINF") === 0) { info = l; return; }
      if (!l || l[0] === "#" || !info) return;
      var a = function (e) { var m = info.match(new RegExp(e + '="([^"]*)"')); return m ? m[1] : ""; };
      var emri = info.slice(info.lastIndexOf(",") + 1).trim(), g = a("group-title") || "Të tjera";
      var rr = l.split("?")[0].toLowerCase(), film = /\.(mp4|mkv|avi|mov|m4v|webm)$/.test(rr) || rr.indexOf("/movie/") >= 0 || rr.indexOf("/series/") >= 0;
      n++;
      if (film) {
        if (!katV[g]) { katV[g] = "m" + D.vodKat.length; D.vodKat.push({ id: katV[g], emri: g }); }
        D.vod.push({ k: "v" + n, sid: n, emri: emri, logo: a("tvg-logo"), kat: katV[g], url: l, vl: "" });
      } else {
        if (!katL[g]) { katL[g] = "g" + D.liveKat.length; D.liveKat.push({ id: katL[g], emri: g }); }
        var m = l.match(XTREAM_RE);
        if (m && !self.xt) self.xt = new Xtream(m[1], decodeURIComponent(m[2]), decodeURIComponent(m[3]));
        D.live.push({ k: "l" + n, sid: m ? +m[4] : n, num: D.live.length + 1, emri: emri, logo: a("tvg-logo"), kat: katL[g], url: l, epg: a("tvg-id"),
          xt: !!(m && self.xt && m[1] === self.xt.host && decodeURIComponent(m[2]) === self.xt.user) });
      }
      info = null;
    });
    if (!D.live.length && !D.vod.length) throw new Error("Playlist-a është bosh.");
    return D;
  });
};
M3U.prototype.urlLive = function (it) { return it.url; };
M3U.prototype.urlVod = function (it) { return it.url; };
M3U.prototype.epg = function (it) { return this.xt && it.xt ? this.xt.epg(it) : Promise.resolve([]); };  // linqe Xtream brenda M3U: guida nga ofruesi
M3U.prototype.epgTani = function () { return Promise.resolve(null); };

// ------------------------------------------------------------------ gjendja
var S = {
  listat: LS.get("listat", []), aktive: LS.get("aktive", 0), burim: null,
  live: [], liveKat: [], vod: [], vodKat: [], ser: [], serKat: [],
  epgTani: null, epgC: {}, fav: null, hist: [], luan: null, serTani: null
};
function celesListe() { var l = S.listat[S.aktive]; return l ? (l.lloji === "m3u" ? l.m3u : l.host + "|" + l.user) : ""; }
function ngarkoFav() {
  var f = LS.get("fav_" + celesListe(), []); S.fav = {}; f.forEach(function (k) { S.fav[k] = 1; });
  S.hist = LS.get("hist_" + celesListe(), []);
}
function ndryshoFav(it) {
  if (!it) return;
  if (S.fav[it.k]) { delete S.fav[it.k]; njofto("U hoq nga të preferuarat"); } else { S.fav[it.k] = 1; njofto("⭐ U shtua te të preferuarat"); }
  LS.set("fav_" + celesListe(), Object.keys(S.fav));
  rivizato();
}
function shtoHist(it) {
  S.hist = [it.k].concat(S.hist.filter(function (k) { return k !== it.k; })).slice(0, 30);
  LS.set("hist_" + celesListe(), S.hist);
}

// ------------------------------------------------------------------ lista virtuale (vetëm rreshtat e dukshëm vizatohen)
function Lista(el, opt) {
  this.el = el; this.h = opt.h || 76; this.render = opt.render; this.onFocus = opt.onFocus || function () {};
  this.items = []; this.i = 0; this.top = 0; this.aktiv = false; this.zgjedhur = -1; this.bosh = opt.bosh || "";
  el.innerHTML = '<div class="vl-brenda"></div><div class="vl-shirit"></div>';
  this.inner = el.firstChild; this.shirit = el.lastChild;
}
Lista.prototype.vendos = function (items, i) {
  this.items = items || []; this.i = Math.max(0, Math.min(i || 0, this.items.length - 1)); this.top = Math.max(0, this.i - 3); this.vizato();
};
Lista.prototype.dukshme = function () { return Math.max(1, Math.floor((this.el.clientHeight || 700) / this.h)); };
Lista.prototype.leviz = function (d) {
  if (!this.items.length) return false;
  var n = this.i + d;
  if (n < 0 || n >= this.items.length) {
    if (Math.abs(d) > 1) n = n < 0 ? 0 : this.items.length - 1; else return false;
  }
  if (n === this.i) return false;
  this.i = n; this.vizato(); this.onFocus(this.tani(), this.i); return true;
};
Lista.prototype.tani = function () { return this.items[this.i]; };
Lista.prototype.vizato = function () {
  var v = this.dukshme(), n = this.items.length;
  if (this.i < this.top) this.top = this.i;
  if (this.i >= this.top + v) this.top = this.i - v + 1;
  if (this.top > Math.max(0, n - v)) this.top = Math.max(0, n - v);
  if (!n) { this.inner.innerHTML = this.bosh ? '<div class="bosh-tekst">' + this.bosh + "</div>" : ""; this.shirit.style.display = "none"; return; }
  var h = "";
  for (var k = this.top; k < Math.min(n, this.top + v); k++) h += this.render(this.items[k], k, this.aktiv && k === this.i, k === this.zgjedhur);
  this.inner.innerHTML = h;
  if (n > v) {
    var H = this.el.clientHeight || 700;
    this.shirit.style.display = "block"; this.shirit.style.height = Math.max(40, H * v / n) + "px"; this.shirit.style.top = (H - Math.max(40, H * v / n)) * this.top / (n - v) + "px";
  } else this.shirit.style.display = "none";
};
Lista.prototype.aktivizo = function (b) { this.aktiv = b; this.vizato(); };

// rrjeta e posterave (filma, seriale)
function Rrjet(el, opt) { Lista.call(this, el, opt); this.kol = opt.kol || 5; this.w = opt.w || 250; }
Rrjet.prototype = Object.create(Lista.prototype);
Rrjet.prototype.dukshme = function () { return Math.max(1, Math.floor((this.el.clientHeight || 850) / this.h)); };
Rrjet.prototype.leviz = function (d) {
  var n = this.i + d;
  if (!this.items.length || n < 0 || n >= this.items.length) {
    if (d === this.kol && this.i < this.items.length - 1 && Math.floor(this.i / this.kol) < Math.floor((this.items.length - 1) / this.kol)) n = this.items.length - 1;
    else return false;
  }
  if ((d === 1 && n % this.kol === 0) || (d === -1 && this.i % this.kol === 0)) return false;
  this.i = n; this.vizato(); this.onFocus(this.tani(), this.i); return true;
};
Rrjet.prototype.vizato = function () {
  var v = this.dukshme(), rr = Math.floor(this.i / this.kol), n = this.items.length;
  if (rr < this.top) this.top = rr;
  if (rr >= this.top + v) this.top = rr - v + 1;
  if (!n) { this.inner.innerHTML = this.bosh ? '<div class="bosh-tekst">' + this.bosh + "</div>" : ""; this.shirit.style.display = "none"; return; }
  var h = "";
  for (var k = this.top * this.kol; k < Math.min(n, (this.top + v) * this.kol); k++) {
    var r = Math.floor(k / this.kol) - this.top, c = k % this.kol;
    h += '<div class="karte' + (this.aktiv && k === this.i ? " fokus" : "") + '" style="left:' + (c * this.w + 10) + "px;top:" + (r * this.h) + 'px">' + this.render(this.items[k], k) + "</div>";
  }
  this.inner.innerHTML = h;
  var rreshta = Math.ceil(n / this.kol);
  if (rreshta > v) {
    var H = this.el.clientHeight || 850;
    this.shirit.style.display = "block"; this.shirit.style.height = Math.max(40, H * v / rreshta) + "px"; this.shirit.style.top = (H - Math.max(40, H * v / rreshta)) * this.top / (rreshta - v) + "px";
  } else this.shirit.style.display = "none";
};

// ------------------------------------------------------------------ vizatimi i rreshtave
function logoHtml(emri, src, klasa) {
  var ini = esc(inicialet(emri));
  return '<div class="' + klasa + '" style="background:' + ngjyra(emri) + '">' +
    (src ? '<img src="' + esc(src) + '" onerror="this.parentNode.textContent=\'' + ini + '\'">' : ini) + "</div>";
}
function epgPer(it) {
  var t = tani(), l = null;
  if (S.epgTani && S.epgTani[String(it.sid)]) l = S.epgTani[String(it.sid)].map(function (p) { return { fil: p[0], mb: p[1], tit: p[2] }; });
  else if (S.epgC[it.k]) l = S.epgC[it.k].l;
  if (!l) return null;
  l = l.filter(function (p) { return p.mb > t; });
  return { tani: l[0] && l[0].fil <= t ? l[0] : null, pastaj: l[0] && l[0].fil > t ? l[0] : l[1] || null, lista: l };
}
function rreshtKanal(it, i, fokus, zgj) {
  var e = epgPer(it), dyte = "", luan = S.luan && S.luan.it && S.luan.it.k === it.k;
  if (e && e.tani) {
    var pct = Math.min(100, Math.max(0, (tani() - e.tani.fil) / (e.tani.mb - e.tani.fil) * 100));
    dyte = '<div class="dyte">' + esc(e.tani.tit) + "</div>" + '<div class="shirit-epg"><i style="width:' + pct.toFixed(0) + '%"></i></div>';
  }
  return '<div class="rresht' + (fokus ? " fokus" : "") + (zgj ? " zgjedhur" : "") + (luan ? " luan" : "") + '">' +
    '<div class="nr">' + it.num + "</div>" + logoHtml(it.emri, it.logo, "logo-v") +
    '<div class="tekst"><div class="emri">' + esc(it.emri) + "</div>" + dyte + "</div>" +
    (S.fav[it.k] ? '<div class="yll">★</div>' : "") + "</div>";
}
function rreshtKat(k, i, fokus, zgj) {
  return '<div class="rresht' + (fokus ? " fokus" : "") + (zgj ? " zgjedhur" : "") + '"><div class="tekst"><div class="emri">' + esc(k.emri) +
    "</div></div>" + (k.n != null ? '<div class="numer-kat">' + k.n + "</div>" : "") + "</div>";
}
function karte(it) {
  return (S.fav[it.k] ? '<div class="yll">★</div>' : "") + (it.vl ? '<div class="vleresim">★ ' + esc(it.vl) + "</div>" : "") +
    logoHtml(it.emri, it.logo, "poster") + '<div class="emri">' + esc(it.emri) + "</div>";
}
function rreshtThjeshte(r, i, fokus) {
  return '<div class="rresht' + (fokus ? " fokus" : "") + '"><div class="tekst"><div class="emri">' + esc(r.t) + "</div>" +
    (r.d ? '<div class="dyte">' + esc(r.d) + "</div>" : "") + "</div>" + (r.v != null ? '<div class="numer-kat">' + esc(r.v) + "</div>" : "") + "</div>";
}

// ------------------------------------------------------------------ formati i figurës (si butoni "stretch" te IBO)
var FIGURAT = [
  { id: "auto", m: "PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO", t: "Automatik" },
  { id: "mbush", m: "PLAYER_DISPLAY_MODE_FULL_SCREEN", t: "Mbush ekranin" },
  { id: "origjinal", m: "PLAYER_DISPLAY_MODE_LETTER_BOX", t: "Origjinal (me shirita)" }
];
function figura(id) { return FIGURAT.filter(function (f) { return f.id === id; })[0] || FIGURAT[0]; }
function figuraPer(it) { var m = LS.get("figuraK_" + celesListe(), {}); return (it && m[it.k]) || CIL.figura; }
function ndryshoFiguren() {
  if (!S.luan || !L.luan()) return;
  var it = S.luan.it, i = FIGURAT.indexOf(figura(L.figura)), f = FIGURAT[(i + 1) % FIGURAT.length];
  var m = LS.get("figuraK_" + celesListe(), {});
  if (f.id === CIL.figura) delete m[it.k]; else m[it.k] = f.id;
  LS.set("figuraK_" + celesListe(), m);
  L.vendosFiguren(f.id);
  njofto("🖼️ Figura: " + f.t + (S.luan.lloji === "live" ? "  · ruhet për këtë kanal" : ""), 3000);
}

// ------------------------------------------------------------------ lojtari (AVPlay në TV, <video> në shfletues)
var L = {
  url: "", rect: [0, 0, 1920, 1080], live: true, figura: "auto", onFund: null, provat: 0, pauze: false, kohaMs: 0, gjatesiaMs: 0,
  hap: function (url, opt) {
    opt = opt || {};
    this.ndalo();
    this.url = url; this.live = opt.live !== false; this.onFund = opt.onFund || null; this.provat = opt.provat || 0;
    this.pauze = false; this.kohaMs = opt.fillim || 0; this.gjatesiaMs = 0;
    if (opt.rect) this.rect = opt.rect;
    this.figura = opt.figura || (S.luan ? figuraPer(S.luan.it) : CIL.figura);
    gabimVideo(false); ngarkim(true);
    if (NE_TV) this._hapAV(url, opt.fillim || 0); else this._hapVideo(url, opt.fillim || 0);
  },
  _hapAV: function (url, fillim) {
    var av = webapis.avplay, self = this, id = ++this._nr;
    try {
      av.open(url);
      av.setListener({
        onbufferingstart: function () { if (id === self._nr) ngarkim(true); },
        onbufferingcomplete: function () { if (id === self._nr) ngarkim(false); },
        oncurrentplaytime: function (ms) { if (id !== self._nr) return; self.kohaMs = ms; ngarkim(false); },
        onstreamcompleted: function () { if (id !== self._nr) return; self.ndalo(); if (self.onFund) self.onFund(); },
        onerror: function (e) { if (id === self._nr) self._gabim(String(e)); },
        onevent: function () {}
      });
      this._rectAV();
      av.prepareAsync(function () {
        if (id !== self._nr) return;
        try { self.gjatesiaMs = av.getDuration() || 0; } catch (e) {}
        if (fillim > 0) { try { av.seekTo(fillim); } catch (e) {} }
        av.play(); ngarkim(false);
        self._rectAV();
      }, function (e) { if (id === self._nr) self._gabim(String(e && e.name || e)); });
    } catch (e) { this._gabim(String(e && e.name || e)); }
  },
  _hapVideo: function (url, fillim) {
    var v = $("#vd"), self = this, id = ++this._nr;
    v.muted = true; v.src = url;
    v.onloadedmetadata = function () { if (id !== self._nr) return; self.gjatesiaMs = isFinite(v.duration) ? v.duration * 1000 : 0; if (fillim) v.currentTime = fillim / 1000; };
    v.onplaying = function () { if (id === self._nr) ngarkim(false); };
    v.onwaiting = function () { if (id === self._nr) ngarkim(true); };
    v.ontimeupdate = function () { if (id === self._nr) self.kohaMs = v.currentTime * 1000; };
    v.onended = function () { if (id !== self._nr) return; self.ndalo(); if (self.onFund) self.onFund(); };
    v.onerror = function () { if (id === self._nr && v.getAttribute("src")) self._gabim("MEDIA_ERR_" + (v.error ? v.error.code : "?")); };
    this._rectVideo();
    v.play().catch(function () {});
  },
  _nr: 0,
  _gabim: function (arsyeja) {
    var self = this, url = this.url, nr = this._nr;
    if (this.provat < 1) {   // prova 2: ndoshta ofruesi ridrejton te një server tjetër
      this.provat++;
      try { if (NE_TV) { webapis.avplay.stop(); webapis.avplay.close(); } } catch (e) {}
      linkuFundit(url).then(function (u) {
        if (nr !== self._nr) return;
        setTimeout(function () { if (nr !== self._nr) return; var opt = { live: self.live, onFund: self.onFund, provat: self.provat, fillim: self.kohaMs, figura: self.figura };
          self.hap(u, opt); self.url = url; }, 1500);
      });
      return;
    }
    ngarkim(false);
    var tekst = "Nuk po hapet.";
    if (/CONNECTION|NETWORK|TIMEOUT/i.test(arsyeja)) tekst = "S'u lidh dot me serverin e kanalit.";
    else if (/UNSUPPORTED|FORMAT|CODEC/i.test(arsyeja)) tekst = "Formati i këtij kanali nuk mbështetet.";
    gabimVideo(true, "⚠️ " + tekst + "<small>Mund të jetë offline, ose abonimi po përdoret në një pajisje tjetër. (" + esc(arsyeja).slice(0, 60) + ")</small>");
  },
  ndalo: function () {
    this._nr++;
    ngarkim(false);
    if (NE_TV) { try { webapis.avplay.stop(); } catch (e) {} try { webapis.avplay.close(); } catch (e) {} }
    else { var v = $("#vd"); v.pause(); v.removeAttribute("src"); try { v.load(); } catch (e) {} }
    this.url = "";
  },
  vendosRect: function (r) { this.rect = r; if (NE_TV) this._rectAV(); else this._rectVideo(); },
  vendosFiguren: function (id) {
    this.figura = id;
    if (NE_TV) this._rectAV(); else this._rectVideo();
  },
  ePlote: function () { return this.rect[2] >= 1920 && this.rect[3] >= 1080; },
  // formati i zgjedhur (Automatik / Mbush) vetëm në ekran të plotë; kutia e vogël gjithmonë "Origjinal",
  // sepse "Automatik" i televizorit s'e respekton madhësinë e kutisë dhe del mbi menunë
  metoda: function () { return this.ePlote() ? figura(this.figura).m : "PLAYER_DISPLAY_MODE_LETTER_BOX"; },
  _rectAV: function () {
    var r = this.rect, o = $("#av");
    o.style.left = r[0] + "px"; o.style.top = r[1] + "px"; o.style.width = r[2] + "px"; o.style.height = r[3] + "px";
    try { webapis.avplay.setDisplayMethod(this.metoda()); } catch (e) {}
    try { webapis.avplay.setDisplayRect(r[0], r[1], r[2], r[3]); } catch (e) {}
  },
  _rectVideo: function () {
    var r = this.rect, v = $("#vd");
    v.style.left = r[0] + "px"; v.style.top = r[1] + "px"; v.style.width = r[2] + "px"; v.style.height = r[3] + "px";
    v.style.objectFit = this.ePlote() && this.figura === "mbush" ? "fill" : "contain";
  },
  ndrysho: function () {
    if (NE_TV) {
      var st = ""; try { st = webapis.avplay.getState(); } catch (e) {}
      if (st === "PLAYING") { webapis.avplay.pause(); this.pauze = true; } else if (st === "PAUSED") { webapis.avplay.play(); this.pauze = false; }
    } else { var v = $("#vd"); if (v.paused) { v.play(); this.pauze = false; } else { v.pause(); this.pauze = true; } }
  },
  kerko: function (ms) {
    ms = Math.max(0, Math.min(ms, (this.gjatesiaMs || 1e12) - 3000));
    this.kohaMs = ms;
    if (NE_TV) { try { webapis.avplay.seekTo(ms); } catch (e) {} } else { $("#vd").currentTime = ms / 1000; }
  },
  gjatesia: function () {
    if (NE_TV) { try { this.gjatesiaMs = webapis.avplay.getDuration() || this.gjatesiaMs; } catch (e) {} }
    return this.gjatesiaMs;
  },
  luan: function () { return !!this.url; }
};
function ngarkim(po) { $("#ngarkim").classList.toggle("fsh", !po); $("#ngarkim").classList.toggle("i-vogel", po && !document.body.classList.contains("plote")); }
function gabimVideo(po, html) {
  var g = $("#gabimV"); g.classList.toggle("fsh", !po); if (po) g.innerHTML = html;
  g.classList.toggle("i-vogel", po && !document.body.classList.contains("plote"));
}
function rectKutia() {   // kutia e vogël e videos te "Live" (në koordinata 1920x1080)
  var k = $("#kutia"), sk = $("#skena").getBoundingClientRect(), r = k.getBoundingClientRect(), s = sk.width / 1920;
  if (!r.width || !s) return [1231, 129, 626, 399];
  return [Math.round((r.left - sk.left) / s) + 3, Math.round((r.top - sk.top) / s) + 3, Math.round(r.width / s) - 6, Math.round(r.height / s) - 6];
}

// ------------------------------------------------------------------ fokusi dhe ekranet
var F = { ekran: "live", zona: "kan", tab: 0, prapa: null };
var TABET = ["live", "vod", "ser", "kerko", "cil"];
var UI = {};

function shfaqEkran(e) {
  F.ekran = e;
  document.querySelectorAll(".ekran").forEach(function (x) { x.classList.remove("shfaq"); });
  var m = $("#m-" + e); if (m) m.classList.add("shfaq");
  var t = e === "serdet" ? "ser" : e;
  document.querySelectorAll(".tab").forEach(function (x) { x.classList.toggle("zgjedhur", x.dataset.t === t); });
  // videoja në kënd shihet vetëm te "Live"
  if (e !== "live" && L.luan() && S.luan && S.luan.lloji === "live" && !document.body.classList.contains("plote")) { L.ndalo(); S.luan = null; }
  $("#kutia-bosh").style.display = L.luan() ? "none" : "";
}
function vendosZone(z) {
  F.zona = z;
  var zonat = { kat: UI.lKat, kan: UI.lKan, vkat: UI.vKat, vrr: UI.vRr, skat: UI.sKat, srr: UI.sRr, sez: UI.dSez, ep: UI.dEp, klista: UI.kLista, clista: UI.cLista };
  for (var k in zonat) zonat[k].aktivizo(k === z);
  document.querySelectorAll(".tab").forEach(function (x, i) { x.classList.toggle("fokus", z === "tabet" && i === F.tab); });
  $("#k-input").classList.toggle("fokus", z === "kinput");
}
function rivizato() {
  [UI.lKan, UI.vRr, UI.sRr, UI.zLista, UI.kLista].forEach(function (l) { if (l) l.vizato(); });
}

// ---- LIVE
function kategoriteLive() {
  var n = {}, rez = [];
  S.live.forEach(function (x) { n[x.kat] = (n[x.kat] || 0) + 1; });
  rez.push({ id: "*", emri: "📺 Të gjitha", n: S.live.length });
  rez.push({ id: "fav", emri: "⭐ Të preferuarat", n: S.live.filter(function (x) { return S.fav[x.k]; }).length });
  rez.push({ id: "hist", emri: "🕘 Të fundit" });
  S.liveKat.forEach(function (k) { if (n[k.id]) rez.push({ id: k.id, emri: k.emri, n: n[k.id] }); });
  var pa = S.live.filter(function (x) { return !S.liveKat.some(function (k) { return k.id === x.kat; }); });
  if (pa.length && S.liveKat.length) rez.push({ id: "_", emri: "Të tjera", n: pa.length });
  return rez;
}
function kanaletE(katId) {
  if (katId === "*") return S.live;
  if (katId === "fav") return S.live.filter(function (x) { return S.fav[x.k]; });
  if (katId === "hist") { var m = {}; S.live.forEach(function (x) { m[x.k] = x; }); return S.hist.map(function (k) { return m[k]; }).filter(Boolean); }
  if (katId === "_") return S.live.filter(function (x) { return !S.liveKat.some(function (k) { return k.id === x.kat; }); });
  return S.live.filter(function (x) { return x.kat === katId; });
}
function zgjidhKatLive(i, ruajFokus) {
  var k = UI.lKat.items[i]; if (!k) return;
  UI.lKat.zgjedhur = i; UI.lKat.vizato();
  var l = kanaletE(k.id);
  UI.lKan.bosh = k.id === "fav" ? "Ende s'ke të preferuar.<br>Mbaj <b>OK</b> të shtypur mbi një kanal (ose shtyp butonin e verdhë)." : k.id === "hist" ? "Këtu dalin kanalet që ke parë së fundi." : "Bosh";
  var j = 0;
  if (ruajFokus && S.luan && S.luan.lloji === "live") { var p = l.indexOf(S.luan.it); if (p >= 0) j = p; }
  UI.lKan.vendos(l, j);
  $("#l-kan-titull").textContent = k.emri.replace(/^[^\wÀ-ž]+\s*/, "") + " · " + l.length;
  LS.set("katLive_" + celesListe(), k.id);
  infoKanali(UI.lKan.tani());
}
var epgTimer = null;
function infoKanali(it) {
  var el = $("#l-info");
  if (!it) { el.innerHTML = ""; return; }
  var kat = (S.liveKat.filter(function (k) { return k.id === it.kat; })[0] || {}).emri || "";
  var e = epgPer(it), h = "<h2>" + esc(it.num + ". " + it.emri) + "</h2><div class='kat-e'>" + esc(kat) + (S.fav[it.k] ? " · ⭐" : "") + "</div>";
  if (e && e.lista.length) {
    e.lista.slice(0, 2).forEach(function (p, i) {
      h += "<div class='prog'><div class='ora-p'>" + (i === 0 && p.fil <= tani() ? "TANI · " : "") + ora(p.fil) + " – " + ora(p.mb) + "</div><div class='tit'>" + esc(p.tit) + "</div>" +
        (p.per ? "<div class='per'>" + esc(p.per) + "</div>" : "") + "</div>";
    });
  } else h += "<div class='prog'><div class='per'>" + (S.epgC[it.k] ? "S'ka guidë për këtë kanal." : "Duke marrë guidën…") + "</div></div>";
  h += "<div class='ndihme'>OK: shiko këtu · OK përsëri: ekran i plotë · Mbaj OK: ⭐</div>";
  el.innerHTML = h;
  clearTimeout(epgTimer);
  var c = S.epgC[it.k];
  if (!(S.epgTani && S.epgTani[String(it.sid)]) && (!c || tani() - c.t > 600)) {
    epgTimer = setTimeout(function () {
      S.burim.epg(it).then(function (l) { S.epgC[it.k] = { t: tani(), l: l }; }).catch(function () { S.epgC[it.k] = { t: tani(), l: [] }; })
        .then(function () { if (UI.lKan.tani() === it) { infoKanali(it); UI.lKan.vizato(); } if (S.luan && S.luan.it === it) osdLive(false); });
    }, 350);
  }
}
function luajLive(it, lista, plote) {
  if (!it) return;
  S.luan = { lloji: "live", it: it, lista: lista || UI.lKan.items };
  shtoHist(it);
  LS.set("fundit_" + celesListe(), it.k);
  L.hap(S.burim.urlLive(it), { live: true, rect: plote ? [0, 0, 1920, 1080] : rectKutia() });
  $("#kutia-bosh").style.display = "none";
  if (plote) hyrPlote(); else rivizato();
  if (!S.epgC[it.k]) infoKanaliPaUI(it);
}
function infoKanaliPaUI(it) {
  if (S.epgTani && S.epgTani[String(it.sid)]) return;
  S.burim.epg(it).then(function (l) { S.epgC[it.k] = { t: tani(), l: l }; if (S.luan && S.luan.it === it) osdLive(false); }).catch(function () {});
}

// ---- EKRAN I PLOTË
var osdTimer = null;
function hyrPlote() {
  document.body.classList.add("plote");
  L.vendosRect([0, 0, 1920, 1080]);
  gabimVideo(!$("#gabimV").classList.contains("fsh"), $("#gabimV").innerHTML);
  if (S.luan.lloji === "live") osdLive(true); else osdVod(true);
  F.prapa = F.ekran;
}
function dilPlote() {
  document.body.classList.remove("plote");
  $("#osd").classList.add("fsh"); $("#zap").classList.add("fsh");
  if (S.luan && S.luan.lloji === "live") {
    L.vendosRect(rectKutia());
    shfaqEkran("live");
    F.tab = 0;
    var p = UI.lKan.items.indexOf(S.luan.it);
    if (p < 0) {   // kanali s'është te buqeta që ke hapur: hap buqetën e vet (ose "Të gjitha")
      var ki = 0;
      UI.lKat.items.forEach(function (k, i) { if (k.id === S.luan.it.kat) ki = i; });
      UI.lKat.i = ki; zgjidhKatLive(ki, true);
    } else { UI.lKan.i = p; UI.lKan.vizato(); }
    vendosZone("kan"); infoKanali(UI.lKan.tani());
  } else {
    ruajPozicionin(); L.ndalo(); S.luan = null;
    shfaqEkran(F.prapa || "vod"); vendosZone(F.prapa === "serdet" ? "ep" : F.prapa === "kerko" ? "klista" : F.prapa === "ser" ? "srr" : "vrr");
  }
  gabimVideo(!$("#gabimV").classList.contains("fsh"), $("#gabimV").innerHTML);
}
function osdLive(shfaq) {
  if (!S.luan || S.luan.lloji !== "live") return;
  var it = S.luan.it, e = epgPer(it);
  $("#o-num").textContent = it.num; $("#o-num").style.display = "";
  $("#o-logo").outerHTML = logoHtml(it.emri, it.logo, "o-logo").replace('class="o-logo"', 'id="o-logo" class="o-logo"');
  $("#o-emri").textContent = it.emri + (S.fav[it.k] ? "  ⭐" : "");
  $("#o-tani").textContent = e && e.tani ? ora(e.tani.fil) + " – " + ora(e.tani.mb) + "   " + e.tani.tit : "";
  $("#o-prog").style.width = e && e.tani ? Math.min(100, (tani() - e.tani.fil) / (e.tani.mb - e.tani.fil) * 100) + "%" : "0";
  $("#o-pastaj").textContent = e && e.pastaj ? "Pastaj " + ora(e.pastaj.fil) + ":  " + e.pastaj.tit : "";
  $("#o-ndihme").innerHTML = "▲▼ / CH: kanal tjetër · OK: menuja · ◀: lista e shpejtë<br>▶: figura (" + esc(figura(L.figura).t) + ") · Back: dil";
  $("#o-ora").textContent = oraTani();
  if (shfaq) { $("#osd").classList.remove("fsh"); clearTimeout(osdTimer); osdTimer = setTimeout(function () { $("#osd").classList.add("fsh"); }, 6000); }
}
function osdVod(shfaq, cak) {
  if (!S.luan) return;
  var d = L.gjatesia(), k = cak != null ? cak : L.kohaMs;
  $("#o-num").style.display = "none";
  $("#o-logo").outerHTML = logoHtml(S.luan.it.emri, S.luan.it.logo, "o-logo").replace('class="o-logo"', 'id="o-logo" class="o-logo"');
  $("#o-emri").textContent = S.luan.titull || S.luan.it.emri;
  $("#o-tani").textContent = (L.pauze ? "⏸  " : "▶  ") + kohe(k) + (d ? "  /  " + kohe(d) : "") + (cak != null ? "   ⏩" : "");
  $("#o-prog").style.width = d ? Math.min(100, k / d * 100) + "%" : "0";
  $("#o-pastaj").textContent = "";
  $("#o-ndihme").innerHTML = "OK: pauzë · ◀ ▶: 10 sek · ⏪ ⏩: 1 min<br>▼: figura (" + esc(figura(L.figura).t) + ") · Back: dil";
  $("#o-ora").textContent = oraTani();
  if (shfaq) { $("#osd").classList.remove("fsh"); clearTimeout(osdTimer); if (!L.pauze) osdTimer = setTimeout(function () { $("#osd").classList.add("fsh"); }, 4000); }
}
function zapKanal(d) {
  if (!S.luan || S.luan.lloji !== "live") return;
  var l = S.luan.lista && S.luan.lista.length ? S.luan.lista : S.live, i = l.indexOf(S.luan.it);
  var it = l[(i + d + l.length) % l.length];
  S.luan = { lloji: "live", it: it, lista: l };
  shtoHist(it); LS.set("fundit_" + celesListe(), it.k);
  L.hap(S.burim.urlLive(it), { live: true, rect: [0, 0, 1920, 1080] });
  osdLive(true);
  if (!S.epgC[it.k]) infoKanaliPaUI(it);
}
function hapZap() {
  var l = S.luan.lista && S.luan.lista.length ? S.luan.lista : S.live;
  $("#zap").classList.remove("fsh"); $("#osd").classList.add("fsh");
  $("#z-titull").textContent = "Kanalet · " + l.length;
  UI.zLista.aktiv = true; UI.zLista.vendos(l, Math.max(0, l.indexOf(S.luan.it)));
}

// ---- VOD / SERIALE
var pozTimer = null;
function ruajPozicionin() {
  if (!S.luan || S.luan.lloji === "live") return;
  var p = LS.get("poz_" + celesListe(), {}), d = L.gjatesia();
  if (L.kohaMs > 60000 && (!d || L.kohaMs < d - 120000)) p[S.luan.celes] = L.kohaMs; else delete p[S.luan.celes];
  var k = Object.keys(p); if (k.length > 200) delete p[k[0]];
  LS.set("poz_" + celesListe(), p);
}
function luajVod(it, url, titull, celes, pas) {
  var p = LS.get("poz_" + celesListe(), {})[celes] || 0;
  var nis = function (fillim) {
    if (L.luan() && S.luan && S.luan.lloji === "live") L.ndalo();
    S.luan = { lloji: "vod", it: it, titull: titull, celes: celes, pas: pas };
    L.hap(url, { live: false, fillim: fillim, rect: [0, 0, 1920, 1080], onFund: function () {
      var p2 = LS.get("poz_" + celesListe(), {}); delete p2[celes]; LS.set("poz_" + celesListe(), p2);
      if (pas) { njofto("▶ Episodi tjetër"); pas(); } else dilPlote();
    } });
    hyrPlote();
    clearInterval(pozTimer); pozTimer = setInterval(ruajPozicionin, 15000);
  };
  if (p) dialog("Vazhdo nga " + kohe(p) + "?", [{ t: "▶ Vazhdo", f: function () { nis(p); } }, { t: "⟲ Nga fillimi", f: function () { nis(0); } }]);
  else nis(0);
}
var kerkimTimer = null, kerkimCak = null;
function kerkoVod(delta) {
  if (kerkimCak == null) kerkimCak = L.kohaMs;
  kerkimCak = Math.max(0, kerkimCak + delta);
  var d = L.gjatesia(); if (d) kerkimCak = Math.min(kerkimCak, d - 3000);
  osdVod(true, kerkimCak);
  clearTimeout(kerkimTimer);
  kerkimTimer = setTimeout(function () { L.kerko(kerkimCak); kerkimCak = null; osdVod(true); }, 700);
}

function kategoriteVod(lista, kat) {
  var n = {}, rez = [{ id: "*", emri: "Të gjitha", n: lista.length }, { id: "fav", emri: "⭐ Të preferuarat", n: lista.filter(function (x) { return S.fav[x.k]; }).length }];
  lista.forEach(function (x) { n[x.kat] = (n[x.kat] || 0) + 1; });
  kat.forEach(function (k) { if (n[k.id]) rez.push({ id: k.id, emri: k.emri, n: n[k.id] }); });
  return rez;
}
function zgjidhKatVod(lloji, i) {
  var ser = lloji === "ser", lk = ser ? UI.sKat : UI.vKat, rr = ser ? UI.sRr : UI.vRr, lista = ser ? S.ser : S.vod;
  var k = lk.items[i]; if (!k) return;
  lk.zgjedhur = i; lk.vizato();
  var l = k.id === "*" ? lista : k.id === "fav" ? lista.filter(function (x) { return S.fav[x.k]; }) : lista.filter(function (x) { return x.kat === k.id; });
  rr.bosh = k.id === "fav" ? "Ende s'ke të preferuar. Mbaj OK të shtypur mbi një poster." : (ser ? "S'ka seriale." : "S'ka filma.");
  rr.vendos(l, 0);
  $(ser ? "#s-titull" : "#v-titull").textContent = k.emri + " · " + l.length;
}
function hapSerial(it) {
  $("#fillimi-tekst").textContent = "Duke hapur serialin…";
  ngarkim(true);
  S.burim.serial(it).then(function (d) {
    ngarkim(false);
    var ep = (d && d.episodes) || {}, sez = Object.keys(ep).sort(function (a, b) { return a - b; });
    if (!sez.length) return njofto("Ky serial s'ka episode.");
    S.serTani = { it: it, info: (d && d.info) || {}, ep: ep, sez: sez };
    shfaqEkran("serdet");
    UI.dSez.vendos(sez.map(function (s) { return { t: "Sezoni " + s, v: ep[s].length, s: s }; }), 0);
    UI.dSez.zgjedhur = 0;
    zgjidhSezonin(0);
    vendosZone("ep");
    var inf = S.serTani.info;
    $("#d-info").innerHTML = (it.logo ? '<img src="' + esc(it.logo) + '">' : "") + "<h2>" + esc(it.emri) + "</h2>" +
      "<div class='kat-e'>" + esc([inf.genre, inf.releaseDate || inf.year, inf.rating ? "★ " + inf.rating : ""].filter(Boolean).join(" · ")) + "</div>" +
      "<div class='per'>" + esc(inf.plot || it.per || "") + "</div>";
  }).catch(function (e) { ngarkim(false); dialog("Serial-i nuk u hap: " + esc(e.message), [{ t: "OK" }]); });
}
function zgjidhSezonin(i) {
  var s = UI.dSez.items[i]; if (!s) return;
  UI.dSez.zgjedhur = i; UI.dSez.vizato();
  var poz = LS.get("poz_" + celesListe(), {});
  UI.dEp.vendos(S.serTani.ep[s.s].map(function (e, j) {
    var inf = e.info || {};
    return { t: (e.episode_num || j + 1) + ". " + (e.title || "Episodi " + (j + 1)), d: [inf.duration, poz["e" + e.id] ? "⏸ " + kohe(poz["e" + e.id]) : ""].filter(Boolean).join(" · "), e: e, s: s.s };
  }), 0);
  $("#d-titull").textContent = "Sezoni " + s.s + " · " + UI.dEp.items.length + " episode";
}
function luajEpisod(sIdx, eIdx) {
  var s = UI.dSez.items[sIdx], ser = S.serTani; if (!s) return;
  var ep = ser.ep[s.s][eIdx]; if (!ep) return;
  var pas = function () {
    if (eIdx + 1 < ser.ep[s.s].length) luajEpisod(sIdx, eIdx + 1);
    else if (sIdx + 1 < UI.dSez.items.length) { UI.dSez.i = sIdx + 1; zgjidhSezonin(sIdx + 1); luajEpisod(sIdx + 1, 0); }
    else dilPlote();
  };
  UI.dEp.i = eIdx;
  luajVod(ser.it, S.burim.urlEp(ep), ser.it.emri + " · S" + s.s + " E" + (ep.episode_num || eIdx + 1) + (ep.title ? " · " + ep.title : ""), "e" + ep.id, pas);
}

// ---- KËRKO
function kerko(q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) { UI.kLista.bosh = "Shkruaj të paktën 2 shkronja."; UI.kLista.vendos([], 0); return; }
  var r = [];
  S.live.forEach(function (x) { if (x.emri.toLowerCase().indexOf(q) >= 0) r.push({ t: "📺 " + x.emri, d: "Kanal · " + x.num, it: x, l: "live" }); });
  S.vod.forEach(function (x) { if (x.emri.toLowerCase().indexOf(q) >= 0) r.push({ t: "🎬 " + x.emri, d: "Film", it: x, l: "vod" }); });
  S.ser.forEach(function (x) { if (x.emri.toLowerCase().indexOf(q) >= 0) r.push({ t: "🎞️ " + x.emri, d: "Serial", it: x, l: "ser" }); });
  UI.kLista.bosh = "Asgjë me „" + esc(q) + "“";
  UI.kLista.vendos(r.slice(0, 500), 0);
}

// ---- CILËSIMET
function rreshtatCil() {
  var l = S.listat[S.aktive] || {};
  return [
    { t: "📋 Lista aktive", v: l.emri || "—", f: zgjidhListen },
    { t: "➕ Shto listë të re", f: function () { hapForme(-1); } },
    { t: "✏️ Ndrysho listën aktive", f: function () { hapForme(S.aktive); } },
    { t: "🗑️ Fshi listën aktive", f: fshiListen },
    { t: "🔄 Rifresko kanalet", f: function () { ngarkoListen(); } },
    { t: "🎚️ Formati i kanaleve live", v: { auto: "Automatik", ts: "TS", m3u8: "HLS" }[CIL.formati], d: "Nëse kanalet ngecin ose s'hapen, provo formatin tjetër",
      f: function () { CIL.formati = { auto: "ts", ts: "m3u8", m3u8: "auto" }[CIL.formati]; ruajCil(); vizatoCil(); } },
    { t: "🖼️ Formati i figurës", v: figura(CIL.figura).t, d: "Për të gjitha kanalet. Për një kanal të vetëm: shtyp ▶ kur je në ekran të plotë",
      f: function () { var i = FIGURAT.indexOf(figura(CIL.figura)); CIL.figura = FIGURAT[(i + 1) % FIGURAT.length].id; ruajCil(); vizatoCil(); } },
    { t: "🔞 Kategoritë për të rritur", v: CIL.fshihTeRritur ? "Të fshehura" : "Të dukshme",
      f: function () { CIL.fshihTeRritur = !CIL.fshihTeRritur; ruajCil(); ngarkoListen(); } },
    { t: "⬇️ Kontrollo për përditësim", v: VERSIONI, f: kontrolloPerditesim },
    { t: "▶️ Kur hapet: nis kanalin e fundit", v: CIL.nisFundit ? "Po" : "Jo", f: function () { CIL.nisFundit = !CIL.nisFundit; ruajCil(); vizatoCil(); } }
  ];
}
function vizatoCil() {
  var i = UI.cLista.i; UI.cLista.vendos(rreshtatCil(), i);
  var nga = window.MI_BURIMI && window.MI_BURIMI.nga === "github" ? "përditësuar nga GitHub" : "versioni i instaluar";
  var inf = S.burim && S.burim.info && S.burim.info.user_info, h = "<h2>Snow IPTV " + VERSIONI + "</h2><div style='margin:-6px 0 14px;font-size:20px'>" + nga + "</div>";
  if (inf) {
    var exp = inf.exp_date && +inf.exp_date ? new Date(+inf.exp_date * 1000).toLocaleDateString("sq-AL") : "pa afat";
    h += "Llogaria: <b>" + esc(inf.username) + "</b><br>Statusi: <b>" + esc(inf.status || "") + "</b><br>Skadon: <b>" + esc(exp) + "</b><br>Lidhje njëkohësisht: <b>" + esc(inf.max_connections || "?") + "</b><br>";
  }
  h += "<br>Kanale: <b>" + S.live.length + "</b> · Filma: <b>" + S.vod.length + "</b> · Seriale: <b>" + S.ser.length + "</b>";
  h += "<br><br><b>Telekomanda</b><br>▲▼◀▶ lëviz · OK zgjidh · Mbaj OK: ⭐<br>CH+/CH−: kanali tjetër · Numrat: shko te kanali<br>Ekran i plotë: ▶ (filmat: ▼) ndryshon figurën<br>Back: kthehu";
  $("#c-info").innerHTML = h;
}
function zgjidhListen() {
  if (S.listat.length < 2) return njofto("Ke vetëm një listë. Shto një tjetër me „Shto listë të re“.");
  dialog("Cilën listë do të hapësh?", S.listat.slice(0, 5).map(function (l, i) {
    return { t: (i === S.aktive ? "✔ " : "") + l.emri, f: function () { S.aktive = i; LS.set("aktive", i); ngarkoListen(); } };
  }));
}
function fshiListen() {
  var l = S.listat[S.aktive]; if (!l) return;
  dialog("Ta fshij listën „" + esc(l.emri) + "“?", [{ t: "🗑️ Po, fshije", f: function () {
    S.listat.splice(S.aktive, 1); S.aktive = 0; LS.set("listat", S.listat); LS.set("aktive", 0);
    if (S.listat.length) ngarkoListen(); else hapForme(-1);
  } }, { t: "Jo" }]);
}

// ---- FORMA (shto/ndrysho listë)
var FM = { idx: -1, lloji: "xtream", fokus: 0 };
function hapForme(idx) {
  FM.idx = idx;
  var l = idx >= 0 ? S.listat[idx] : null;
  FM.lloji = l ? l.lloji : "xtream";
  $("#f-titull").textContent = l ? "Ndrysho listën" : (S.listat.length ? "Shto listë të re" : "Mirë se erdhe! Shto listën e parë");
  $("#f-emri").value = l ? l.emri : (S.listat.length ? "" : "Abonimi");
  $("#f-host").value = l && l.host || ""; $("#f-user").value = l && l.user || ""; $("#f-pass").value = l && l.pass || ""; $("#f-m3u").value = l && l.m3u || "";
  $("#f-gabim").textContent = "";
  $("#fillimi").classList.add("fsh");
  shfaqEkran("forma"); vendosZone("forma");
  FM.fokus = l ? 0 : 2; vizatoForme();
}
function fushatForme() {
  var f = ["emri", "lloji"].concat(FM.lloji === "xtream" ? ["host", "user", "pass"] : ["m3u"]).concat(["ruaj", "anulo"]);
  if (!S.listat.length && FM.idx < 0) f.pop();
  return f;
}
function vizatoForme() {
  var f = fushatForme(), z = f[FM.fokus];
  $("#f-lloji").textContent = FM.lloji === "xtream" ? "◀  Xtream Codes (server + përdorues + fjalëkalim)  ▶" : "◀  Link M3U  ▶";
  document.querySelectorAll("#m-forma .fusha").forEach(function (el) {
    var k = el.dataset.f;
    el.style.display = (el.classList.contains("x") && FM.lloji !== "xtream") || (el.classList.contains("m") && FM.lloji !== "m3u") ? "none" : "";
    el.classList.toggle("fokus", k === z);
  });
  document.querySelectorAll("#m-forma .buton").forEach(function (el) {
    el.style.display = f.indexOf(el.dataset.f) >= 0 ? "" : "none";
    el.classList.toggle("fokus", el.dataset.f === z);
  });
}
function ndajLinkun(t) {   // "http://host:port/get.php?username=U&password=P&type=..." -> {host, user, pass}
  try {
    var m = t.match(/^(https?:\/\/[^\/?#]+)/i), u = t.match(/[?&]username=([^&]+)/i), p = t.match(/[?&]password=([^&]+)/i);
    if (m && u && p) return { host: m[1], user: decodeURIComponent(u[1]), pass: decodeURIComponent(p[1]) };
  } catch (e) {}
  return null;
}
function ruajForme() {
  var l = { emri: $("#f-emri").value.trim() || "Lista", lloji: FM.lloji };
  if (FM.lloji === "xtream") {
    var host = $("#f-host").value.trim(), nd = ndajLinkun(host);
    if (nd) { host = nd.host; $("#f-user").value = nd.user; $("#f-pass").value = nd.pass; }
    if (host && !/^https?:\/\//i.test(host)) host = "http://" + host;
    host = host.replace(/\/(player_api\.php|get\.php|c)?\/?(\?.*)?$/i, "").replace(/\/+$/, "");
    l.host = host; l.user = $("#f-user").value.trim(); l.pass = $("#f-pass").value.trim();
    if (!l.host || !l.user || !l.pass) { $("#f-gabim").textContent = "Plotëso serverin, përdoruesin dhe fjalëkalimin."; return; }
  } else {
    var m = $("#f-m3u").value.trim();
    if (m && !/^https?:\/\//i.test(m)) m = "http://" + m;
    var nd2 = ndajLinkun(m);
    if (nd2 && /get\.php/i.test(m)) { l.lloji = "xtream"; l.host = nd2.host; l.user = nd2.user; l.pass = nd2.pass; njofto("Linku u kthye në Xtream (me guidë, filma e seriale)"); }
    else { l.m3u = m; if (!m) { $("#f-gabim").textContent = "Shkruaj linkun M3U."; return; } }
  }
  $("#f-gabim").textContent = "Duke u lidhur…";
  var b = l.lloji === "xtream" ? new Xtream(l.host, l.user, l.pass) : new M3U(l.m3u);
  b.hyr().then(function () {
    if (FM.idx >= 0) S.listat[FM.idx] = l; else { S.listat.push(l); FM.idx = S.listat.length - 1; }
    S.aktive = FM.idx; LS.set("listat", S.listat); LS.set("aktive", S.aktive);
    ngarkoListen();
  }).catch(function (e) { $("#f-gabim").textContent = "⚠️ " + e.message; });
}

// ------------------------------------------------------------------ ngarkimi i listës
function ngarkoListen() {
  var l = S.listat[S.aktive];
  if (!l) return hapForme(-1);
  L.ndalo(); S.luan = null; document.body.classList.remove("plote");
  $("#fillimi").classList.remove("fsh"); $("#fillimi-tekst").textContent = "Duke ngarkuar „" + l.emri + "“…";
  $("#lista-emri").textContent = l.emri;
  S.burim = l.lloji === "xtream" ? new Xtream(l.host, l.user, l.pass) : new M3U(l.m3u);
  S.epgC = {}; S.epgTani = null;
  ngarkoFav();
  S.burim.hyr().then(function () { return S.burim.ngarko(); }).then(function (D) {
    if (CIL.fshihTeRritur) {
      var ter = function (kat) { var s = {}; kat.forEach(function (k) { if (TE_RRITUR.test(k.emri)) s[k.id] = 1; }); return s; };
      var a = ter(D.liveKat), b = ter(D.vodKat), c = ter(D.serKat);
      D.liveKat = D.liveKat.filter(function (k) { return !a[k.id]; }); D.live = D.live.filter(function (x) { return !a[x.kat] && !TE_RRITUR.test(x.emri); });
      D.vodKat = D.vodKat.filter(function (k) { return !b[k.id]; }); D.vod = D.vod.filter(function (x) { return !b[x.kat]; });
      D.serKat = D.serKat.filter(function (k) { return !c[k.id]; }); D.ser = D.ser.filter(function (x) { return !c[x.kat]; });
    }
    for (var k in D) S[k] = D[k];
    $("#fillimi").classList.add("fsh");
    nisUI();
    S.burim.epgTani().then(function (m) { if (m) { S.epgTani = m; rivizato(); infoKanali(UI.lKan.tani()); } });
  }).catch(function (e) {
    $("#fillimi").classList.add("fsh");
    dialog("⚠️ Lista „" + esc(l.emri) + "“ nuk u ngarkua.<br><small>" + esc(e.message) + "</small>",
      [{ t: "↻ Provo përsëri", f: ngarkoListen }, { t: "⚙️ Ndrysho listën", f: function () { hapForme(S.aktive); } }]
        .concat(S.listat.length > 1 ? [{ t: "📋 Listë tjetër", f: zgjidhListen }] : []));
  });
}
function nisUI() {
  UI.lKat.vendos(kategoriteLive(), 0);
  var katRuajtur = LS.get("katLive_" + celesListe(), "*"), ki = 0;
  UI.lKat.items.forEach(function (k, i) { if (k.id === katRuajtur) ki = i; });
  UI.lKat.i = ki; zgjidhKatLive(ki);
  UI.vKat.vendos(kategoriteVod(S.vod, S.vodKat), 0); zgjidhKatVod("vod", 0);
  UI.sKat.vendos(kategoriteVod(S.ser, S.serKat), 0); zgjidhKatVod("ser", 0);
  vizatoCil();
  var tabi = S.live.length ? "live" : S.vod.length ? "vod" : "ser";
  shfaqEkran(tabi); F.tab = TABET.indexOf(tabi);
  vendosZone(tabi === "live" ? "kan" : tabi === "vod" ? "vrr" : "srr");
  // kanali i fundit
  var f = LS.get("fundit_" + celesListe(), null);
  if (f && tabi === "live") {
    var p = UI.lKan.items.findIndex(function (x) { return x.k === f; });
    if (p < 0) { UI.lKat.i = 0; zgjidhKatLive(0); p = UI.lKan.items.findIndex(function (x) { return x.k === f; }); }
    if (p >= 0) { UI.lKan.i = p; UI.lKan.vizato(); infoKanali(UI.lKan.tani()); if (CIL.nisFundit) luajLive(UI.lKan.tani(), UI.lKan.items, false); }
  }
}

// ------------------------------------------------------------------ dialog, njoftim, ora
var DG = null;
function dialog(tekst, butonat) {
  DG = { b: butonat && butonat.length ? butonat : [{ t: "OK" }], i: 0 };
  $("#dg-tekst").innerHTML = tekst;
  vizatoDialog();
  $("#dialog").classList.remove("fsh");
}
function vizatoDialog() {
  $("#dg-butonat").innerHTML = DG.b.map(function (b, i) { return '<div class="buton' + (i ? " dyte" : "") + (i === DG.i ? " fokus" : "") + '">' + esc(b.t) + "</div>"; }).join("");
}
function mbyllDialog(i) {
  var b = DG && i != null ? DG.b[i] : null;
  DG = null; $("#dialog").classList.add("fsh");
  if (b && b.f) b.f();
}
var njTimer = null;
function njofto(t, ms) { var n = $("#njoftim"); n.textContent = t; n.classList.remove("fsh"); clearTimeout(njTimer); njTimer = setTimeout(function () { n.classList.add("fsh"); }, ms || 2500); }
function oraTani() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
setInterval(function () { $("#ora").textContent = oraTani(); if (!$("#osd").classList.contains("fsh")) $("#o-ora").textContent = oraTani(); }, 15000);
setInterval(function () {   // OSD-ja rifreskohet ndërsa duket
  if ($("#osd").classList.contains("fsh") || !S.luan || kerkimCak != null) return;
  if (S.luan.lloji === "live") osdLive(false); else osdVod(false);
}, 1000);
setInterval(function () { if (S.burim && !document.hidden) S.burim.epgTani().then(function (m) { if (m) { S.epgTani = m; rivizato(); } }); }, 5 * 60000);

// ------------------------------------------------------------------ numrat (shko te kanali me numër)
var NR = { t: "", timer: null };
function shtypNumer(d) {
  if (!S.live.length) return;
  NR.t = (NR.t + d).slice(-4);
  $("#numri").textContent = NR.t; $("#numri").classList.remove("fsh");
  clearTimeout(NR.timer);
  NR.timer = setTimeout(function () {
    var n = +NR.t; NR.t = ""; $("#numri").classList.add("fsh");
    var it = S.live.filter(function (x) { return x.num === n; })[0];
    if (!it) return njofto("S'ka kanal me numrin " + n);
    if (document.body.classList.contains("plote")) { S.luan.lista = S.live; S.luan.it = it; zapKanal(0); return; }
    shfaqEkran("live"); F.tab = 0; UI.lKat.i = 0; zgjidhKatLive(0);
    UI.lKan.i = S.live.indexOf(it); UI.lKan.vizato(); vendosZone("kan"); infoKanali(it);
    luajLive(it, S.live, false);
  }, 1500);
}

// ------------------------------------------------------------------ telekomanda
var K = { MAJTAS: 37, LART: 38, DJATHTAS: 39, POSHTE: 40, OK: 13, PRAPA: 10009, CHUP: 427, CHDN: 428, PP: 10252, PLAY: 415, PAUZE: 19, STOP: 413,
  FF: 417, RW: 412, KUQ: 403, JESHIL: 404, VERDHE: 405, BLU: 406, INFO: 457, DONE: 65376, CANCEL: 65385, PGUP: 33, PGDN: 34 };
function regjistroTastet() {
  if (!window.tizen || !tizen.tvinputdevice) return;
  ["ChannelUp", "ChannelDown", "MediaPlayPause", "MediaPlay", "MediaPause", "MediaStop", "MediaFastForward", "MediaRewind",
    "ColorF0Red", "ColorF1Green", "ColorF2Yellow", "ColorF3Blue", "Info", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    .forEach(function (k) { try { tizen.tvinputdevice.registerKey(k); } catch (e) {} });
}
function dilNgaApp() {
  dialog("Të dalësh nga Snow IPTV?", [{ t: "Po, dil", f: function () {
    L.ndalo();
    try { tizen.application.getCurrentApplication().exit(); } catch (e) { njofto("(në shfletues s'mund të dalë)"); }
  } }, { t: "Jo" }]);
}

// OK i mbajtur gjatë = ⭐ (vetëm kur televizori dërgon edhe "keyup")
var OKG = { kaKeyup: false, timer: null, gjate: false };

function tasti(e) {
  var k = e.keyCode;
  if (!NE_TV) {   // prova në shfletues me tastierë
    if (k === 27 || (k === 8 && document.activeElement.tagName !== "INPUT")) k = K.PRAPA;
    else if (k === 32 && document.activeElement.tagName !== "INPUT") k = K.PP;
    else if (k === 70 && document.activeElement.tagName !== "INPUT") k = K.VERDHE;
    else if (k === K.PGUP) k = K.CHUP; else if (k === K.PGDN) k = K.CHDN;
  }
  // duke shkruar në një kuti teksti
  if (document.activeElement && document.activeElement.tagName === "INPUT") {
    if (k === K.DONE || k === K.OK || k === K.CANCEL || k === K.PRAPA || k === K.LART || k === K.POSHTE) {
      e.preventDefault();
      var inp = document.activeElement; inp.blur();
      if (inp.id === "k-input") { kerko(inp.value); if (k === K.POSHTE || k === K.DONE || k === K.OK) { if (UI.kLista.items.length) vendosZone("klista"); } }
      else if (F.ekran === "forma" && k !== K.CANCEL && k !== K.PRAPA) { FM.fokus = Math.min(FM.fokus + (k === K.LART ? -1 : 1), fushatForme().length - 1); FM.fokus = Math.max(0, FM.fokus); vizatoForme(); }
    }
    return;
  }
  e.preventDefault();
  if (k >= 48 && k <= 57 && !DG && F.ekran !== "forma" && (F.ekran === "live" || document.body.classList.contains("plote")) && !(S.luan && S.luan.lloji !== "live" && document.body.classList.contains("plote"))) return shtypNumer(String(k - 48));
  if (DG) {
    if (k === K.MAJTAS || k === K.LART) { DG.i = Math.max(0, DG.i - 1); vizatoDialog(); }
    else if (k === K.DJATHTAS || k === K.POSHTE) { DG.i = Math.min(DG.b.length - 1, DG.i + 1); vizatoDialog(); }
    else if (k === K.OK) mbyllDialog(DG.i);
    else if (k === K.PRAPA) mbyllDialog(null);
    return;
  }
  if (k === K.OK && OKG.kaKeyup && okGjateLejohet()) {
    if (e.repeat || OKG.timer) return;
    OKG.gjate = false;
    OKG.timer = setTimeout(function () { OKG.gjate = true; veprimGjate(); }, 700);
    return;
  }
  veprim(k);
}
function okGjateLejohet() {
  if (document.body.classList.contains("plote")) return S.luan && S.luan.lloji === "live" && $("#zap").classList.contains("fsh");
  return (F.ekran === "live" && F.zona === "kan") || (F.ekran === "vod" && F.zona === "vrr") || (F.ekran === "ser" && F.zona === "srr");
}
function veprimGjate() {
  if (document.body.classList.contains("plote")) { ndryshoFav(S.luan.it); osdLive(true); return; }
  var l = F.zona === "kan" ? UI.lKan : F.zona === "vrr" ? UI.vRr : UI.sRr;
  ndryshoFav(l.tani());
  if (F.zona === "kan") { infoKanali(l.tani()); UI.lKat.items = kategoriteLive(); UI.lKat.vizato(); }
}
function tastiLart(e) {
  if (e.keyCode !== K.OK) return;
  if (!OKG.kaKeyup) { OKG.kaKeyup = true; return; }
  if (OKG.timer) { clearTimeout(OKG.timer); OKG.timer = null; if (!OKG.gjate) veprim(K.OK); }
}

function veprim(k) {
  var plote = document.body.classList.contains("plote");
  if (k === K.VERDHE) {
    if (plote && S.luan && S.luan.lloji === "live") { ndryshoFav(S.luan.it); return osdLive(true); }
    if (okGjateLejohet()) return veprimGjate();
    return;
  }
  if (plote) return tastPlote(k);
  if (k === K.CHUP || k === K.CHDN) {
    if (F.ekran === "live" && S.luan && S.luan.lloji === "live") { var l = UI.lKan; var i = l.items.indexOf(S.luan.it); var n = l.items[i + (k === K.CHUP ? 1 : -1)];
      if (n) { l.i = l.items.indexOf(n); l.vizato(); infoKanali(n); luajLive(n, l.items, false); } }
    return;
  }
  if (k === K.PP || k === K.PLAY) { if (F.ekran === "live" && S.luan && S.luan.lloji === "live") hyrPlote(); return; }
  if (k === K.STOP) { if (L.luan()) { L.ndalo(); S.luan = null; $("#kutia-bosh").style.display = ""; rivizato(); } return; }
  if (F.zona === "tabet") return tastTabet(k);
  switch (F.ekran) {
    case "live": return tastLive(k);
    case "vod": return tastVod(k, "vod");
    case "ser": return tastVod(k, "ser");
    case "serdet": return tastSerdet(k);
    case "kerko": return tastKerko(k);
    case "cil": return tastCil(k);
    case "forma": return tastForme(k);
  }
}
function tastTabet(k) {
  if (k === K.MAJTAS && F.tab > 0) { F.tab--; kaloTab(); }
  else if (k === K.DJATHTAS && F.tab < TABET.length - 1) { F.tab++; kaloTab(); }
  else if (k === K.POSHTE || k === K.OK) vendosZone({ live: "kan", vod: "vrr", ser: "srr", kerko: "kinput", cil: "clista" }[TABET[F.tab]]);
  else if (k === K.PRAPA) dilNgaApp();
}
function kaloTab() { shfaqEkran(TABET[F.tab]); vendosZone("tabet"); if (TABET[F.tab] === "cil") vizatoCil(); }
function tastLive(k) {
  if (F.zona === "kat") {
    if (k === K.LART) { if (!UI.lKat.leviz(-1)) vendosZone("tabet"); }
    else if (k === K.POSHTE) UI.lKat.leviz(1);
    else if (k === K.CHUP || k === K.PGUP) UI.lKat.leviz(-8);
    else if (k === K.OK || k === K.DJATHTAS) { zgjidhKatLive(UI.lKat.i); if (UI.lKan.items.length) vendosZone("kan"); }
    else if (k === K.PRAPA) dilNgaApp();
  } else if (F.zona === "kan") {
    if (k === K.LART) { if (!UI.lKan.leviz(-1)) vendosZone("tabet"); }
    else if (k === K.POSHTE) UI.lKan.leviz(1);
    else if (k === K.MAJTAS) { vendosZone("kat"); }
    else if (k === K.DJATHTAS) UI.lKan.leviz(UI.lKan.dukshme() - 1);
    else if (k === K.OK) {
      var it = UI.lKan.tani(); if (!it) return;
      if (S.luan && S.luan.it === it && L.luan()) hyrPlote(); else luajLive(it, UI.lKan.items, false);
    } else if (k === K.PRAPA) dilNgaApp();
    else if (k === K.INFO) infoKanali(UI.lKan.tani());
  }
}
function tastVod(k, lloji) {
  var ser = lloji === "ser", lk = ser ? UI.sKat : UI.vKat, rr = ser ? UI.sRr : UI.vRr, zk = ser ? "skat" : "vkat", zr = ser ? "srr" : "vrr";
  if (F.zona === zk) {
    if (k === K.LART) { if (!lk.leviz(-1)) vendosZone("tabet"); }
    else if (k === K.POSHTE) lk.leviz(1);
    else if (k === K.OK || k === K.DJATHTAS) { zgjidhKatVod(lloji, lk.i); if (rr.items.length) vendosZone(zr); }
    else if (k === K.PRAPA) dilNgaApp();
  } else {
    if (k === K.LART) { if (!rr.leviz(-rr.kol)) vendosZone("tabet"); }
    else if (k === K.POSHTE) rr.leviz(rr.kol);
    else if (k === K.MAJTAS) { if (!rr.leviz(-1)) vendosZone(zk); }
    else if (k === K.DJATHTAS) rr.leviz(1);
    else if (k === K.OK) { var it = rr.tani(); if (!it) return; if (ser) hapSerial(it); else luajVod(it, S.burim.urlVod(it), it.emri, "v" + it.sid); }
    else if (k === K.PRAPA) vendosZone(zk);
  }
}
function tastSerdet(k) {
  if (F.zona === "sez") {
    if (k === K.LART) UI.dSez.leviz(-1); else if (k === K.POSHTE) UI.dSez.leviz(1);
    else if (k === K.OK || k === K.DJATHTAS) { zgjidhSezonin(UI.dSez.i); vendosZone("ep"); }
    else if (k === K.PRAPA) { shfaqEkran("ser"); vendosZone("srr"); }
  } else {
    if (k === K.LART) UI.dEp.leviz(-1); else if (k === K.POSHTE) UI.dEp.leviz(1);
    else if (k === K.MAJTAS) vendosZone("sez");
    else if (k === K.OK) luajEpisod(UI.dSez.zgjedhur, UI.dEp.i);
    else if (k === K.PRAPA) { shfaqEkran("ser"); vendosZone("srr"); }
  }
}
function tastKerko(k) {
  if (F.zona === "kinput") {
    if (k === K.OK) { $("#k-input").focus(); }
    else if (k === K.LART) vendosZone("tabet");
    else if (k === K.POSHTE) { if (UI.kLista.items.length) vendosZone("klista"); }
    else if (k === K.PRAPA) vendosZone("tabet");
  } else {
    if (k === K.LART) { if (!UI.kLista.leviz(-1)) vendosZone("kinput"); }
    else if (k === K.POSHTE) UI.kLista.leviz(1);
    else if (k === K.PRAPA) vendosZone("kinput");
    else if (k === K.OK) {
      var r = UI.kLista.tani(); if (!r) return;
      if (r.l === "live") { S.luan = null; luajLive(r.it, S.live, true); F.prapa = "kerko"; }
      else if (r.l === "vod") { F.prapa = "kerko"; luajVod(r.it, S.burim.urlVod(r.it), r.it.emri, "v" + r.it.sid); F.prapa = "kerko"; }
      else hapSerial(r.it);
    }
  }
}
function tastCil(k) {
  if (k === K.LART) { if (!UI.cLista.leviz(-1)) vendosZone("tabet"); }
  else if (k === K.POSHTE) UI.cLista.leviz(1);
  else if (k === K.OK) { var r = UI.cLista.tani(); if (r && r.f) r.f(); }
  else if (k === K.PRAPA) vendosZone("tabet");
}
function tastForme(k) {
  var f = fushatForme(), z = f[FM.fokus];
  if (k === K.LART) FM.fokus = Math.max(0, (z === "ruaj" || z === "anulo" ? f.indexOf("ruaj") : FM.fokus) - 1);
  else if (k === K.POSHTE) { if (z !== "ruaj" && z !== "anulo") FM.fokus = Math.min(f.indexOf("ruaj"), FM.fokus + 1); }
  else if (k === K.MAJTAS || k === K.DJATHTAS) {
    if (z === "lloji") FM.lloji = FM.lloji === "xtream" ? "m3u" : "xtream";
    else if (z === "ruaj" && k === K.DJATHTAS && f.indexOf("anulo") >= 0) FM.fokus = f.indexOf("anulo");
    else if (z === "anulo" && k === K.MAJTAS) FM.fokus = f.indexOf("ruaj");
  }
  else if (k === K.OK) {
    if (z === "lloji") FM.lloji = FM.lloji === "xtream" ? "m3u" : "xtream";
    else if (z === "ruaj") return ruajForme();
    else if (z === "anulo") return mbyllForme();
    else { var inp = $("#f-" + z); if (inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {} } }
  }
  else if (k === K.PRAPA) return mbyllForme();
  vizatoForme();
}
function mbyllForme() {
  if (!S.listat.length) return dilNgaApp();
  if (S.burim) { shfaqEkran("cil"); F.tab = 4; vendosZone("clista"); vizatoCil(); } else ngarkoListen();
}
function tastPlote(k) {
  var live = S.luan && S.luan.lloji === "live";
  if (!$("#zap").classList.contains("fsh")) {   // lista e kanaleve mbi video
    if (k === K.LART) UI.zLista.leviz(-1);
    else if (k === K.POSHTE) UI.zLista.leviz(1);
    else if (k === K.CHUP) UI.zLista.leviz(-10); else if (k === K.CHDN) UI.zLista.leviz(10);
    else if (k === K.OK) { var it = UI.zLista.tani(); $("#zap").classList.add("fsh"); if (it && it !== S.luan.it) { S.luan.it = it; zapKanal(0); } else osdLive(true); }
    else if (k === K.PRAPA || k === K.MAJTAS || k === K.DJATHTAS) $("#zap").classList.add("fsh");
    return;
  }
  if (live) {
    if (k === K.LART || k === K.CHUP) zapKanal(1);
    else if (k === K.POSHTE || k === K.CHDN) zapKanal(-1);
    else if (k === K.OK) dilPlote();       // OK: si Back, kanali në kutinë e vogël + buqetat + kanalet
    else if (k === K.MAJTAS) hapZap();     // ◀: lista e shpejtë mbi video
    else if (k === K.DJATHTAS || k === K.BLU) { ndryshoFiguren(); osdLive(true); }
    else if (k === K.INFO) { if ($("#osd").classList.contains("fsh")) osdLive(true); else $("#osd").classList.add("fsh"); }
    else if (k === K.PRAPA) dilPlote();
    else if (k === K.STOP) { L.ndalo(); S.luan = null; dilPlote(); }
    else if (k === K.PP || k === K.PAUZE || k === K.PLAY) { L.ndrysho(); njofto(L.pauze ? "⏸ Pauzë" : "▶ Vazhdon"); }
    else if (!$("#gabimV").classList.contains("fsh") && k === K.OK) zapKanal(0);
  } else {
    if (k === K.OK || k === K.PP || k === K.PLAY || k === K.PAUZE) { L.ndrysho(); osdVod(true); }
    else if (k === K.MAJTAS) kerkoVod(-10000);
    else if (k === K.DJATHTAS) kerkoVod(10000);
    else if (k === K.RW) kerkoVod(-60000);
    else if (k === K.FF) kerkoVod(60000);
    else if (k === K.POSHTE || k === K.BLU) { ndryshoFiguren(); osdVod(true); }
    else if (k === K.LART || k === K.INFO) osdVod(true);
    else if (k === K.PRAPA || k === K.STOP) dilPlote();
  }
}

// ------------------------------------------------------------------ nisja
function shkallezo() {
  var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  $("#skena").style.transform = "scale(" + s + ")";
}
function nis() {
  if (!NE_TV) document.body.classList.add("shfletues");
  else { var vd = $("#vd"); if (vd) vd.parentNode.removeChild(vd); }   // në TV videoja luan POSHTË faqes: asgjë e errët s'duhet ta mbulojë
  shkallezo(); window.addEventListener("resize", shkallezo);
  regjistroTastet();
  UI.lKat = new Lista($("#l-kat"), { h: 64, render: rreshtKat, onFocus: function () {} });
  UI.lKan = new Lista($("#l-kan"), { h: 76, render: rreshtKanal, onFocus: function (it) { infoKanali(it); } });
  UI.vKat = new Lista($("#v-kat"), { h: 64, render: rreshtKat });
  UI.sKat = new Lista($("#s-kat"), { h: 64, render: rreshtKat });
  UI.vRr = new Rrjet($("#v-rrjet"), { h: 420, w: 250, kol: 5, render: karte });
  UI.sRr = new Rrjet($("#s-rrjet"), { h: 420, w: 250, kol: 5, render: karte });
  UI.dSez = new Lista($("#d-sez"), { h: 64, render: rreshtThjeshte });
  UI.dEp = new Lista($("#d-ep"), { h: 76, render: rreshtThjeshte });
  UI.kLista = new Lista($("#k-lista"), { h: 76, render: rreshtThjeshte, bosh: "Shkruaj diçka për të kërkuar." });
  UI.cLista = new Lista($("#c-lista"), { h: 76, render: rreshtThjeshte });
  UI.zLista = new Lista($("#z-lista"), { h: 76, render: rreshtKanal });
  document.addEventListener("keydown", tasti);
  document.addEventListener("keyup", tastiLart);
  $("#k-input").addEventListener("input", function () { clearTimeout(kerkimTimer2); kerkimTimer2 = setTimeout(function () { kerko($("#k-input").value); }, 400); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && window.MI_PERDITESIM_GATI && window.MI_PERDITESIM_GATI()) {   // u shkarkua version i ri ndërsa ishe jashtë
      location.reload(); return;
    }
    if (document.hidden) {
      if (S.luan && L.luan()) { if (S.luan.lloji !== "live") ruajPozicionin();
        S.pezull = { luan: S.luan, url: L.url, koha: L.kohaMs, onFund: L.onFund, plote: document.body.classList.contains("plote") }; L.ndalo(); }
    } else if (S.pezull) {
      var p = S.pezull; S.pezull = null; S.luan = p.luan;
      setTimeout(function () {   // TV-ja ka nevojë për një çast pasi kthehesh
        L.hap(p.url, { live: p.luan.lloji === "live", fillim: p.luan.lloji === "live" ? 0 : p.koha, onFund: p.onFund, rect: p.plote ? [0, 0, 1920, 1080] : rectKutia() });
      }, 500);
    }
  });
  $("#ora").textContent = oraTani();
  if (S.listat.length) ngarkoListen(); else hapForme(-1);
  var m = window.MI_GATI ? window.MI_GATI() : null;   // ngarkuesit: "u hap pa gabime"
  if (m) setTimeout(function () { njofto(m, 7000); }, 2500);
}
function kontrolloPerditesim() {
  if (!window.MI_KONTROLLO) return njofto("Përditësimet s'janë aktive në këtë version");
  njofto("Duke kontrolluar në GitHub…", 10000);
  window.MI_KONTROLLO(function (ok, info) {
    if (ok) dialog("⬇️ U shkarkua versioni i ri <b>" + esc(info) + "</b>.<br>Ta hap tani?", [{ t: "Po, rihape", f: function () { L.ndalo(); location.reload(); } }, { t: "Më vonë" }]);
    else njofto("ℹ️ " + info, 4000);
  });
}
var kerkimTimer2 = null;
if (document.readyState === "complete") nis(); else window.addEventListener("load", nis);
