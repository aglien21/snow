/* Snow IPTV për Samsung TV (Tizen) dhe Android (TV + telefon) – lojtar IPTV në shqip.
   Burimi: Xtream Codes (host + përdorues + fjalëkalim) ose link M3U.
   Videoja luhet me AVPlay të televizorit: luan .ts, HLS, MPEG-2, HEVC, MP2… direkt nga ofruesi. */
"use strict";
var VERSIONI = "1.5.6";
(function () {   // TV i vjetër pa "gap" te flex (Chromium < 84, p.sh. Samsung 2020): app.css përdor margin në vend të tij
  try {
    var d = document.createElement("div");
    d.style.cssText = "display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden";
    d.appendChild(document.createElement("div")); d.appendChild(document.createElement("div"));
    (document.body || document.documentElement).appendChild(d);
    var ka = d.scrollHeight === 1; d.parentNode.removeChild(d);
    if (!ka) document.documentElement.className += " pa-gap";
  } catch (e) {}
})();
var PANELI = "http://130.61.238.162:8000/snow/api/pajisja";   // paneli i administratorit (Oracle)
var $ = function (s) { return document.querySelector(s); };
var NE_TV = !!(window.webapis && window.webapis.avplay);

// ------------------------------------------------------------------ ruajtja
var LS = {
  get: function (k, d) { try { var v = localStorage.getItem("mi_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem("mi_" + k, JSON.stringify(v)); } catch (e) {} }
};
// ------------------------------------------------------------------ gjuha (shqip / English)
var GJ = LS.get("gjuha", "sq") === "en" ? "en" : "sq";
var EN = {"Rendit": "Sort", "Më të rejat": "Newest", "Vlerësimi": "Rating", "📅 Sipas datës (më të rejat)": "📅 By date added (newest)", "🔤 Sipas alfabetit (A–Z)": "🔤 Alphabetical (A–Z)", "⭐ Sipas vlerësimit": "⭐ By rating", "⌨️ Tastiera në ekran": "⌨️ On-screen keyboard", "Automatike": "Automatic", "Snow (me shigjeta)": "Snow (arrow keys)", "E sistemit": "System", "Nëse tastiera e Android TV mbyllet vetë, zgjidh Snow": "If the Android TV keyboard closes by itself, choose Snow", "▲▼◀▶ zgjidh · OK shkruaj · Back mbyll": "▲▼◀▶ choose · OK type · Back close", "Ndryshon gjuhën e aplikacionit (rihapet)": "Changes the app language (the app reopens)", "Serveri u përgjigj me gabim ": "The server replied with error ","Përgjigje e pakuptueshme nga serveri": "Unreadable reply from the server","S'u lidh dot me serverin. Kontrollo adresën dhe internetin.": "Could not connect to the server. Check the address and your internet.","Serveri nuk u përgjigj (koha mbaroi).": "The server did not reply (timed out).","Emri ose fjalëkalimi është i gabuar.": "Wrong username or password.","Pa emër": "No name","Linku nuk është playlist M3U.": "The link is not an M3U playlist.","Të tjera": "Other","Playlist-a është bosh.": "The playlist is empty.","guida është shumë e madhe për këtë TV (provo vetëm AL)": "the guide is too large for this TV (try only AL)","guida është shumë e madhe për këtë pajisje (provo vetëm AL)": "the guide is too large for this device (try only AL)","serveri u përgjigj ": "the server replied ","s'u lidh dot": "could not connect","koha mbaroi": "timed out","pa stream": "no stream","skedari .gz është i prerë": "the .gz file is truncated","skedari .gz është i dëmtuar": "the .gz file is damaged","skedari .gz s'mbështetet": "the .gz file is not supported","skedari .gz është bosh ose i dëmtuar": "the .gz file is empty or damaged","duke u shkarkuar…": "downloading…","asnjë kanal i listës s'u gjet në këtë guidë": "none of the list's channels were found in this guide",": skedari s'duket si guidë XMLTV": ": the file does not look like an XMLTV guide","pa link": "no link"," kanal": " channel"," kanale": " channels"," · po rifreskohet…": " · refreshing…","⚠️ s'u ngarkua": "⚠️ not loaded","përgjigje e gabuar": "invalid reply","paneli pret që administratori të pranojë çelësin e ri": "the panel is waiting for the administrator to accept the new key","paneli s'u arrit": "panel not reachable","📋 Listat u përditësuan nga administratori": "📋 The lists were updated by the administrator","📋 Administratori e hoqi listën": "📋 The administrator removed the list","📋 Administratori të dërgoi listën": "📋 The administrator sent you the list","📢 <b>Mesazh</b><br><div style='margin-top:16px;text-align:left;white-space:pre-wrap'>": "📢 <b>Message</b><br><div style='margin-top:16px;text-align:left;white-space:pre-wrap'>","U hoq nga të preferuarat": "Removed from favourites","⭐ U shtua te të preferuarat": "⭐ Added to favourites","Automatik": "Automatic","Mbush ekranin": "Fill screen","Origjinal (me shirita)": "Original (with bars)","🖼️ Figura: ": "🖼️ Picture: ","  · ruhet për këtë kanal": "  · saved for this channel","Nuk po hapet.": "It won't open.","S'u lidh dot me serverin e kanalit.": "Could not connect to the channel's server.","Formati i këtij kanali nuk mbështetet.": "This channel's format is not supported.","<small>Mund të jetë offline, ose abonimi po përdoret në një pajisje tjetër. (": "<small>It may be offline, or the subscription is in use on another device. (","Hap fillimisht një listë me kanale": "Open a list with channels first","<h2>🧪 Prova ": "<h2>🧪 Test "," (si tani)": " (current)","<div class='prog'><div class='tit'>A duket figura brenda kutisë lart?</div><div class='per'>Prit 2–3 sekonda pas çdo prove.</div></div>": "<div class='prog'><div class='tit'>Can you see the picture in the box above?</div><div class='per'>Wait 2–3 seconds after each test.</div></div>","<div class='prog'><div class='ora-p'>▼ prova tjetër · ▲ e mëparshmja</div><div class='tit'>OK = kjo punon (ruhet)</div><div class='per'>Back = anulo</div></div>": "<div class='prog'><div class='ora-p'>▼ next test · ▲ previous</div><div class='tit'>OK = this one works (saved)</div><div class='per'>Back = cancel</div></div>","✅ U ruajt prova ": "✅ Saved test "," për kutinë e vogël": " for the small box","✅ Kutia e vogël: si më parë": "✅ Small box: as before","Testi u anulua": "Test cancelled","📺 Të gjitha": "📺 All","⭐ Të preferuarat": "⭐ Favourites","🕘 Të fundit": "🕘 Recent","Këtu dalin kanalet që ke parë së fundi.": "Channels you watched recently appear here.","Bosh": "Empty","S'ka guidë për këtë kanal.": "No guide for this channel.","Duke marrë guidën…": "Loading the guide…","TANI · ": "NOW · ","TANI": "NOW","<div class='ndihme'>OK: shiko këtu · OK përsëri: ekran i plotë · Mbaj OK: ⭐<div class='ngjyrat'>": "<div class='ndihme'>OK: watch here · OK again: full screen · Hold OK: ⭐<div class='ngjyrat'>","Pastaj ": "Next ","▲▼ / CH: kanal tjetër · OK: menuja · ◀: lista · Back: dil<br>": "▲▼ / CH: other channel · OK: menu · ◀: list · Back: exit<br>",">Figura (": ">Picture (","OK: pauzë · ◀ ▶: 10 sek · ⏪ ⏩: 1 min · Back: dil<br><span class='ngj'><i class='ng ng-v'></i>/ ▼: figura (": "OK: pause · ◀ ▶: 10 sec · ⏪ ⏩: 1 min · Back: exit<br><span class='ngj'><i class='ng ng-v'></i>/ ▼: picture (","Kanalet · ": "Channels · ","▶ Episodi tjetër": "▶ Next episode","Vazhdo nga ": "Resume from ","▶ Vazhdo": "▶ Resume","⟲ Nga fillimi": "⟲ From the start","Të gjitha": "All","Ende s'ke të preferuar. Mbaj OK të shtypur mbi një poster.": "No favourites yet. Hold OK on a poster to add one.","S'ka seriale.": "No series.","S'ka filma.": "No movies.","Duke hapur serialin…": "Opening the series…","Ky serial s'ka episode.": "This series has no episodes.","Sezoni ": "Season "," episode": " episodes","Serial-i nuk u hap: ": "The series did not open: ","Episodi ": "Episode ","Shkruaj të paktën 2 shkronja.": "Type at least 2 letters.","Kanal · ": "Channel · ","Film": "Movie","Serial": "Series","Asgjë me „": "Nothing for “","Shkruaj diçka për të kërkuar.": "Type something to search.","📺 ID e këtij TV": "📺 This TV's ID","Çelësi: ": "Key: "," · jepja administratorit": " · give it to the administrator","Duke pyetur panelin…": "Asking the panel…","📋 Lista aktive": "📋 Active list","➕ Shto listë të re": "➕ Add a new list","✏️ Ndrysho listën aktive": "✏️ Edit the active list","🗑️ Fshi listën aktive": "🗑️ Delete the active list","🔄 Rifresko kanalet": "🔄 Refresh channels","📅 Guida (EPG)": "📅 Guide (EPG)"," · OK: rifresko": " · OK: refresh","Shto linkun te „Ndrysho listën aktive“ (p.sh. AL)": "Add the link in “Edit the active list” (e.g. AL)","Duke shkarkuar guidën…": "Downloading the guide…","🎚️ Formati i kanaleve live": "🎚️ Live channel format","Nëse kanalet ngecin ose s'hapen, provo formatin tjetër": "If channels stutter or don't open, try the other format","🖼️ Formati i figurës": "🖼️ Picture format","Për të gjitha kanalet. Për një kanal të vetëm: shtyp ▶ kur je në ekran të plotë": "For all channels. For a single channel: press ▶ in full screen","🧪 Testo kutinë e videos": "🧪 Test the video box","Prova ": "Test ","Standarde": "Standard","Nëse figura s'del te kutia e vogël (zëri po): provo mënyrat një nga një": "If the small box has sound but no picture: try the modes one by one","📐 Shkalla e videos": "📐 Video scale","Normale": "Normal","VETËM nëse video del gabim ose s'duket (Samsung 4K 2020): provo ×2": "ONLY if the video is misplaced or missing (Samsung 4K 2020): try ×2","📐 Shkalla e videos: ": "📐 Video scale: "," · kthehu te Live dhe shiko kutinë": " · go back to Live and check the box","🔞 Kategoritë për të rritur": "🔞 Adult categories","Të fshehura": "Hidden","Të dukshme": "Visible","⬇️ Kontrollo për përditësim": "⬇️ Check for updates"," s'u hap": " failed to open","▶️ Kur hapet: nis kanalin e fundit": "▶️ On start: play the last channel","Po": "Yes","Jo": "No","përditësuar nga GitHub": "updated from GitHub","versioni i instaluar": "installed version","<div style='margin:-4px 0 14px;font-size:20px;color:var(--theks2)'>⚠️ Versioni ": "<div style='margin:-4px 0 14px;font-size:20px;color:var(--theks2)'>⚠️ Version "," s'u hap në këtë pajisje": " failed to open on this device",". „Kontrollo për përditësim” e provon përsëri.</div>": ". “Check for updates” will try it again.</div>","pa afat": "no expiry","Llogaria: <b>": "Account: <b>","</b><br>Statusi: <b>": "</b><br>Status: <b>","</b><br>Skadon: <b>": "</b><br>Expires: <b>","</b><br>Lidhje njëkohësisht: <b>": "</b><br>Max connections: <b>","<div style='background:#1c2333;border-radius:12px;padding:14px 18px;margin:0 0 14px'>📺 ID e TV-së: <b style='font-size:30px;letter-spacing:1px'>": "<div style='background:#1c2333;border-radius:12px;padding:14px 18px;margin:0 0 14px'>📺 TV ID: <b style='font-size:30px;letter-spacing:1px'>","</b><br>Çelësi: <b style='font-size:26px'>": "</b><br>Key: <b style='font-size:26px'>","</b><br>Paneli: ": "</b><br>Panel: ","✅ i lidhur": "✅ connected","duke u lidhur…": "connecting…","Kanale: <b>": "Channels: <b>","</b> · Filma: <b>": "</b> · Movies: <b>","</b> · Seriale: <b>": "</b> · Series: <b>","<br>Guida: <b>": "<br>Guide: <b>","<br><br><b>Telekomanda</b><br>▲▼◀▶ lëviz · OK zgjidh · Mbaj OK: ⭐ të preferuarat<br>CH+/CH−: kanali tjetër · Numrat: shko te kanali<br>🔴 Listat · 🟢 Guida e plotë · 🟡 Formati i figurës · 🔵 Grupet e kanaleve<br>Back: kthehu": "<br><br><b>Remote</b><br>▲▼◀▶ move · OK select · Hold OK: ⭐ favourites<br>CH+/CH−: other channel · Numbers: go to channel<br>🔴 Lists · 🟢 Full guide · 🟡 Picture format · 🔵 Channel groups<br>Back: go back","🟡 Formati: hap fillimisht një kanal ose film": "🟡 Format: open a channel or movie first"," · duket në ekran të plotë": " · visible in full screen","🔵 Grupet: dil fillimisht nga filmi (Back)": "🔵 Groups: exit the movie first (Back)","📋 Zgjidh playlistën": "📋 Choose a playlist","E diel": "Sunday","E hënë": "Monday","E martë": "Tuesday","E mërkurë": "Wednesday","E enjte": "Thursday","E premte": "Friday","E shtunë": "Saturday","Sot": "Today","Nesër": "Tomorrow","Dje": "Yesterday"," orë": " h","Guida (EPG) e listës": "List guide (EPG)","Guida nga ofruesi": "Provider guide","Guida nga serveri": "Server guide","🟢 Guida është për kanalet live": "🟢 The guide is for live channels","🟢 Guida: shko te Live dhe zgjidh një kanal": "🟢 Guide: go to Live and choose a channel","S'ka guidë për këtë kanal.<br><br>Shto guidën te lista: Cilësimet → 📅 Guida (p.sh. <b>AL</b>).": "No guide for this channel.<br><br>Add a guide to the list: Settings → 📅 Guide (e.g. <b>AL</b>).","<span class='gp-etiketa tani'>TANI · mbaron pas ": "<span class='gp-etiketa tani'>NOW · ends in ","<span class='gp-etiketa'>Fillon pas ": "<span class='gp-etiketa'>Starts in ","Duke marrë përshkrimin…": "Loading the description…","S'ka përshkrim për këtë program.": "No description for this programme.","▲▼ programet · ◀ ▶ kanali tjetër · OK: shiko kanalin · <i class='ng ng-j'></i>/ Back: mbyll": "▲▼ programmes · ◀ ▶ other channel · OK: watch channel · <i class='ng ng-j'></i>/ Back: close","Cilën listë do të hapësh?": "Which list do you want to open?","🔒 Këtë listë e menaxhon administratori": "🔒 This list is managed by the administrator","Ta fshij listën „": "Delete the list “","🗑️ Po, fshije": "🗑️ Yes, delete","Ndrysho listën": "Edit list","Shto listë të re": "Add a new list","Mirë se erdhe! Shto listën e parë": "Welcome! Add your first list","Abonimi": "Subscription","📺 ID e këtij TV: <b>": "📺 This TV's ID: <b>","</b> · Çelësi: <b>": "</b> · Key: <b>","<br><small>Nëse administratori ta dërgon listën, ajo hapet vetë këtu.</small>": "<br><small>If the administrator sends you a list, it opens here automatically.</small>","◀  Xtream Codes (server + përdorues + fjalëkalim)  ▶": "◀  Xtream Codes (server + username + password)  ▶","◀  Link M3U  ▶": "◀  M3U link  ▶","Lista": "List","Plotëso serverin, përdoruesin dhe fjalëkalimin.": "Fill in the server, username and password.","Linku u kthye në Xtream (me guidë, filma e seriale)": "The link was converted to Xtream (with guide, movies and series)","Shkruaj linkun M3U.": "Enter the M3U link.","Duke u lidhur…": "Connecting…","Duke ngarkuar „": "Loading “","⚠️ Lista „": "⚠️ The list “","“ nuk u ngarkua.<br><small>": "” did not load.<br><small>","↻ Provo përsëri": "↻ Try again","⚙️ Ndrysho listën": "⚙️ Edit list","📋 Listë tjetër": "📋 Another list","S'ka kanal me numrin ": "No channel with number ","Të dalësh nga Snow IPTV?": "Exit Snow IPTV?","Po, dil": "Yes, exit","(në shfletues s'mund të dalë)": "(can't exit in a browser)","⏸ Pauzë": "⏸ Paused","▶ Vazhdon": "▶ Playing","Përditësimet s'janë aktive në këtë version": "Updates are not active in this version","Duke kontrolluar në GitHub…": "Checking GitHub…","⬇️ U shkarkua versioni i ri <b>": "⬇️ Downloaded the new version <b>","</b>.<br>Ta hap tani?": "</b>.<br>Open it now?","Po, rihape": "Yes, reopen","Më vonë": "Later","Listat": "Lists","Guida": "Guide","Formati": "Format","Grupet": "Groups"," program": " programme"," programe": " programmes","gabim ": "error ","Ende s'ke të preferuar.<br>Mbaj <b>OK</b> të shtypur mbi një kanal.": "No favourites yet.<br>Hold <b>OK</b> on a channel to add one."," (abonimi)": " (subscription)","“": "”","“?": "”?","“…": "”…","📺 Live": "📺 Live","🎬 Filma": "🎬 Movies","🎞️ Seriale": "🎞️ Series","🔍 Kërko": "🔍 Search","⚙️ Cilësimet": "⚙️ Settings","Kategoritë": "Categories","Kanalet": "Channels","Zgjidh një kanal": "Choose a channel","Filma": "Movies","Seriale": "Series","Sezonat": "Seasons","Episodet": "Episodes","Shkruaj emrin e kanalit, filmit ose serialit…": "Type the name of a channel, movie or series…","Shtyp OK te kutia për tastierën · ↓ për rezultatet": "Press OK on the box for the keyboard · ↓ for results","Shto listën": "Add list","Shkruaj të dhënat që të ka dhënë ofruesi. Shtyp": "Enter the details your provider gave you. Press","te një fushë për tastierën.": "on a field for the keyboard.","Mund të ngjitësh edhe linkun e plotë": "You can also paste the full link","te „Serveri“: e ndaj vetë.": "into “Server”: it is split automatically.","Emri i listës": "List name","p.sh. Abonimi": "e.g. Subscription","Lloji": "Type","Serveri (host:porta)": "Server (host:port)","Përdoruesi": "Username","Fjalëkalimi": "Password","Linku M3U": "M3U link","Guida EPG (opsionale) – p.sh.": "EPG guide (optional) – e.g.",", ose": ", or",", ose një link .xml / .xml.gz": ", or a .xml / .xml.gz link","✔ Ruaj dhe hyr": "✔ Save and enter","Anulo": "Cancel","http://serveri.com:8080": "http://server.com:8080","Duke u hapur…": "Opening…"};
function T(s) { return GJ === "en" && EN[s] !== undefined ? EN[s] : s; }
function perktheNgarkuesin(s) {   // mesazhet e js/ngarkuesi.js (skedar i instaluar, mbetet shqip)
  s = String(s == null ? "" : s);
  if (GJ !== "en") return s;
  var m = s.match(/^✅ Snow IPTV u përditësua në versionin (\S+)/);
  if (m) return "✅ Snow IPTV was updated to version " + m[1];
  m = s.match(/ke më të riun \(([^)]*)\)/); if (m) return "You have the latest version (" + m[1] + ")";
  m = s.match(/versioni (\S+) u prish më parë/); if (m) return "version " + m[1] + " failed before";
  var t = { "pa adresë": "no address", "shkarkimi dështoi": "download failed", "skedarët s'duken në rregull": "the files don't look right",
    "s'ka vend për ruajtje": "not enough storage", "u mbyll gjatë hapjes": "closed while opening", "s'u hap brenda 30 sekondave": "did not open within 30 seconds" };
  for (var k in t) if (s.indexOf(k) >= 0) return s.replace(k, t[k]);
  return s;
}
function perktheDOM(rr) {   // tekstet fikse të ui.html
  if (GJ !== "en") return;
  rr = rr || document.body;
  var w = document.createTreeWalker(rr, 4, null, false), n, t, k, i, f;
  while ((n = w.nextNode())) { t = n.nodeValue; k = t.replace(/^\s+|\s+$/g, ""); if (k && EN[k] !== undefined) n.nodeValue = t.replace(k, function () { return EN[k]; }); }
  f = rr.querySelectorAll("[placeholder]");
  for (i = 0; i < f.length; i++) { k = f[i].getAttribute("placeholder"); if (EN[k] !== undefined) f[i].setAttribute("placeholder", EN[k]); }
  document.documentElement.lang = "en";
}
function dergoGjuhen() { try { if (window.SnowAndroid && window.SnowAndroid.setLang) window.SnowAndroid.setLang(GJ); } catch (e) {} }
function zgjidhGjuhenFillim() {   // vetëm në hapjen e parë (pa lista, gjuha s'është zgjedhur kurrë)
  if (DG || S.listat.length) return;
  dialog("🌐 <b>Zgjidh gjuhën</b><br>Choose your language", [
    { t: "Shqip", f: function () { LS.set("gjuha", "sq"); dergoGjuhen(); } },
    { t: "English", f: function () { if (GJ !== "en") ndryshoGjuhen(); } }]);
}
function ndryshoGjuhen() {
  GJ = GJ === "en" ? "sq" : "en";
  LS.set("gjuha", GJ); dergoGjuhen();
  njofto(GJ === "en" ? "🌐 English…" : "🌐 Shqip…", 3000);
  setTimeout(function () { try { L.ndalo(); } catch (e) {} location.reload(); }, 400);
}
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function inicialet(e) { return String(e || "?").replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase() || "TV"; }
function ngjyra(e) { var h = 0; e = String(e || ""); for (var i = 0; i < e.length; i++) h = (h * 31 + e.charCodeAt(i)) % 360; return "hsl(" + h + ",45%,32%)"; }
function ora(t) { var d = new Date(t * 1000); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
function kohe(ms) { var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); s = s % 60;
  return (h ? h + ":" + ("0" + m).slice(-2) : m) + ":" + ("0" + s).slice(-2); }
function b64(s) { if (!s) return ""; try { return decodeURIComponent(escape(atob(s))); } catch (e) { try { return atob(s); } catch (e2) { return s; } } }
function tani() { return Date.now() / 1000; }

var CIL = { figura: LS.get("figura", "auto"), formati: LS.get("formati", "auto"), fshihTeRritur: LS.get("fshihTeRritur", true), nisFundit: LS.get("nisFundit", true), shkalla: LS.get("shkalla", 1), kutia: LS.get("kutia", null) };
function ruajCil() { for (var k in CIL) LS.set(k, CIL[k]); }

// ------------------------------------------------------------------ rrjeti
function merr(url, lloji, sek) {
  return new Promise(function (ok, jo) {
    var x = new XMLHttpRequest(), mbaroi = false;
    x.open("GET", url, true);
    x.timeout = (sek || 25) * 1000;
    x.onload = function () {
      mbaroi = true;
      if (x.status < 200 || x.status >= 300) return jo(new Error(T("Serveri u përgjigj me gabim ") + x.status));
      if (lloji === "text") return ok(x.responseText);
      try { ok(JSON.parse(x.responseText)); } catch (e) { jo(new Error(T("Përgjigje e pakuptueshme nga serveri"))); }
    };
    x.onerror = function () { if (!mbaroi) jo(new Error(T("S'u lidh dot me serverin. Kontrollo adresën dhe internetin."))); };
    x.ontimeout = function () { jo(new Error(T("Serveri nuk u përgjigj (koha mbaroi)."))); };
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
    if (!d || !d.user_info || String(d.user_info.auth) !== "1") throw new Error((d && d.user_info && d.user_info.message) || T("Emri ose fjalëkalimi është i gabuar."));
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
    var kat = function (l) { return (Array.isArray(l) ? l : []).map(function (k) { return { id: String(k.category_id), emri: k.category_name || T("Pa emër") }; }); };
    D.liveKat = kat(r[0]); D.vodKat = kat(r[2]); D.serKat = kat(r[4]);
    (Array.isArray(r[1]) ? r[1] : []).forEach(function (x, i) {
      D.live.push({ k: "l" + x.stream_id, sid: x.stream_id, num: +x.num || i + 1, emri: x.name || "", logo: x.stream_icon || "",
        kat: String(x.category_id), epg: x.epg_channel_id || "" });
    });
    (Array.isArray(r[3]) ? r[3] : []).forEach(function (x) {
      D.vod.push({ k: "v" + x.stream_id, sid: x.stream_id, emri: x.name || x.title || "", logo: x.stream_icon || "", kat: String(x.category_id), sh: +x.added || 0,
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
Xtream.prototype.epg = function (it, n) {
  return this.api("get_short_epg", "&stream_id=" + it.sid + "&limit=" + (n || 4)).then(function (d) {
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
    if (t.indexOf("#EXT") < 0) throw new Error(T("Linku nuk është playlist M3U."));
    var koka = t.slice(0, 2000).split(/\r?\n/)[0] || "", tvg = koka.match(/(?:url-tvg|x-tvg-url)="([^"]+)"/i);
    self.tvgUrl = tvg ? tvg[1] : "";
    var D = { live: [], liveKat: [], vod: [], vodKat: [], ser: [], serKat: [] }, katL = {}, katV = {}, info = null, n = 0;
    t.split(/\r?\n/).forEach(function (l) {
      l = l.trim();
      if (l.indexOf("#EXTINF") === 0) { info = l; return; }
      if (!l || l[0] === "#" || !info) return;
      var a = function (e) { var m = info.match(new RegExp(e + '="([^"]*)"')); return m ? m[1] : ""; };
      var emri = info.slice(info.lastIndexOf(",") + 1).trim(), g = a("group-title") || T("Të tjera");
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
    if (!D.live.length && !D.vod.length) throw new Error(T("Playlist-a është bosh."));
    return D;
  });
};
M3U.prototype.urlLive = function (it) { return it.url; };
M3U.prototype.urlVod = function (it) { return it.url; };
M3U.prototype.epg = function (it, n) { return this.xt && it.xt ? this.xt.epg(it, n) : Promise.resolve([]); };  // linqe Xtream brenda M3U: guida nga ofruesi
M3U.prototype.epgTani = function () { return Promise.resolve(null); };

// ------------------------------------------------------------------ guida XMLTV (EPG nga një link — punon pa serverin/PC-në)
// Fusha "Guida EPG" e listës: lidhje .xml / .xml.gz (disa, të ndara me presje ose hapësirë), ose kode të shkurtra:
//   AL, IT, UK, DE… = epgshare01 (falas, rifreskohet çdo ditë) · OFRUESI = guida e plotë e abonimit Xtream (xmltv.php)
// Skedari lexohet copë-copë dhe mbahen vetëm kanalet e listës (36 orët e ardhshme), që TV-ja të mos mbushë kujtesën.
var GX = { prog: {}, harta: {}, n: 0, urls: [], gjendja: "", gabim: "", koha: 0, duke: false, nr: 0 };
var EPG_KODET = "https://epgshare01.online/epgshare01/epg_ripper_";
function linqetEpg(l) {
  var tekst = String((l && l.epg) || "") + " " + String((S.burim && S.burim.tvgUrl) || ""), pare = {}, r = [];
  tekst.split(/[\s,;]+/).forEach(function (u) {
    if (!u) return;
    if (/^[a-z]{2}\d?$/i.test(u)) u = EPG_KODET + u.toUpperCase() + (/\d$/.test(u) ? "" : "1") + ".xml.gz";
    else if (/^(ofruesi|provider|abonimi)$/i.test(u)) {
      if (!(l && l.lloji === "xtream" && l.host)) return;
      u = String(l.host).trim().replace(/\/+$/, "").replace(/^(?!https?:\/\/)/i, "http://") + "/xmltv.php?username=" + encodeURIComponent(l.user) + "&password=" + encodeURIComponent(l.pass);
    } else if (!/^https?:\/\//i.test(u)) { if (u.indexOf(".") < 0) return; u = "http://" + u; }
    if (!pare[u]) { pare[u] = 1; r.push(u); }
  });
  return r.slice(0, 6);
}
function emerEpg(u) {   // për ekranin: "epgshare01 · AL" / "serveri.com (abonimi)"
  var m = u.match(/epg_ripper_([A-Z0-9_]+)\.xml/i);
  if (m) return m[1].replace(/1$/, "");
  m = u.match(/^https?:\/\/([^\/:?#]+)/i);
  return (m ? m[1] : u) + (/xmltv\.php/i.test(u) ? T(" (abonimi)") : "");
}
function epgNorm(emri) {   // "AL: Top Channel HD" == "Top Channel" == "top.channel" (si në serverin Mini IPTV)
  var e = String(emri || "");
  try { e = e.normalize("NFKD"); } catch (x) {}
  e = e.replace(/[^\x00-\x7f]/g, "").toLowerCase();
  e = e.replace(/^\s*(\[[^\]]*\]|\|[^|]*\||[a-z]{2,3}\s*[:|])\s*/, "");
  e = e.replace(/\(.*?\)|\[.*?\]/g, " ").replace(/[^a-z0-9+]+/g, " ").replace(/\bplus\b/g, "+");
  var hiq = { hd: 1, fhd: 1, uhd: 1, sd: 1, "4k": 1, hevc: 1, h265: 1, tv: 1, al: 1, alb: 1, backup: 1, raw: 1, live: 1, "1080p": 1, "720p": 1 };
  return e.split(" ").filter(function (f) { return f && !hiq[f]; }).join("");
}
function epgVendi(tvgId, xmlId) {   // "24TV.by" s'merr guidën e "24.TV.al"
  var a = /\.([a-z]{2})$/i.exec(tvgId || ""), b = /\.([a-z]{2})$/i.exec(xmlId || "");
  return !(a && b) || a[1].toLowerCase() === b[1].toLowerCase();
}
function xmlTekst(s) {
  s = String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  if (s.indexOf("&") >= 0) s = s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, function (m, k) {
    k = k.toLowerCase();
    if (k[0] === "#") { var c = k[1] === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10); try { return String.fromCharCode(c); } catch (e) { return ""; } }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[k];
  });
  return s.replace(/\s+/g, " ").trim();
}
function xmlKoha(s) {   // "20261002180000 +0200" -> sekonda UTC
  var m = /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*([+-])?(\d\d)?(\d\d)?/.exec(s || "");
  if (!m) return 0;
  var t = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)) / 1000;
  if (m[7]) t -= (m[7] === "-" ? -1 : 1) * (+m[8] * 3600 + (+m[9] || 0) * 60);
  return t;
}
function xmlAtr(el, emri) { var m = new RegExp("\\s" + emri + "\\s*=\\s*\"([^\"]*)\"").exec(el) || new RegExp("\\s" + emri + "\\s*=\\s*'([^']*)'").exec(el); return m ? xmlTekst(m[1]) : ""; }
function xmlFut(el, tag) { var m = new RegExp("<" + tag + "\\b[^>]*>([\\s\\S]*?)</" + tag + ">").exec(el); return m ? xmlTekst(m[1]) : ""; }

// lidh kanalet e listës me kanalet e një burimi XMLTV (i pari burim fiton)
function lidhKanaletEpg(kanalet, ids, emrat, src, harta) {
  var perdorur = {};
  kanalet.forEach(function (it) {
    if (harta[it.k]) return;
    var id = it.epg ? ids[String(it.epg).toLowerCase()] : null;
    if (!id) { var n = epgNorm(it.emri), c = n && emrat[n]; if (c && epgVendi(it.epg, c)) id = c; }
    if (id) { harta[it.k] = src + "|" + id; perdorur[id] = 1; }
  });
  return perdorur;
}
// buxheti i memories për guidën (TV/Android të dobët + abonime me mijëra kanale)
var BUX = { p: 0, d: 0 };
// lexuesi copë-copë i një skedari XMLTV
function LexuesXmltv(src, kanalet, harta) {
  var b = "", ids = {}, emrat = {}, gati = false, duhen = {}, lok = {}, t0 = tani() - 3 * 3600, t1 = tani() + 36 * 3600, self = this;
  this.prog = {}; this.kanaleXml = 0; this.programe = 0;
  function lidh() {
    gati = true;
    if (!self.kanaleXml) kanalet.forEach(function (it) { if (it.epg) ids[String(it.epg).toLowerCase()] = String(it.epg).toLowerCase(); });   // pa <channel>: vetëm sipas tvg-id
    duhen = lidhKanaletEpg(kanalet.filter(function (it) { return !harta[it.k]; }), ids, emrat, src, lok);
  }
  function kanal(el) {
    var id = xmlAtr(el, "id").toLowerCase(); if (!id) return;
    self.kanaleXml++; ids[id] = id;
    var re = /<display-name\b[^>]*>([\s\S]*?)<\/display-name>/g, m;
    while ((m = re.exec(el))) { var n = epgNorm(xmlTekst(m[1])); if (n && !emrat[n]) emrat[n] = id; }
  }
  function programi(el) {
    if (!gati) lidh();
    var ch = xmlAtr(el, "channel").toLowerCase(); if (!duhen[ch]) return;
    var fil = xmlKoha(xmlAtr(el, "start")), mb = xmlKoha(xmlAtr(el, "stop")) || fil + 1800;
    if (!fil || mb < t0 || fil > t1) return;
    var k = src + "|" + ch, l = self.prog[k] || (self.prog[k] = []);
    if (l.length >= (BUX.p < 25000 ? 80 : BUX.p < 60000 ? 12 : 4)) return;   // pas një kufiri: më pak programe për kanalet e tjera
    var kt = xmlFut(el, "category").slice(0, 30), pr = xmlFut(el, "desc"), lim = BUX.d < 4e6 ? 900 : BUX.d < 7e6 ? 200 : 0;
    pr = !lim ? "" : pr.length > lim ? pr.slice(0, lim - 1) + "…" : pr;
    BUX.p++; BUX.d += pr.length;
    l.push(kt ? [fil, mb, xmlFut(el, "title").slice(0, 120), pr, kt] : [fil, mb, xmlFut(el, "title").slice(0, 120), pr]);
    self.programe++;
  }
  this.shto = function (t) {
    b += t;
    var i = 0, p = -2, c = -2;   // -1 = s'ka më në këtë copë (mos e kërko përsëri)
    for (;;) {
      if (p !== -1 && p < i) p = b.indexOf("<programme", i);
      if (c !== -1 && c < i) c = b.indexOf("<channel", i);
      if (p < 0 && c < 0) { i = Math.max(i, b.length - 16); break; }   // ruaj bishtin: mund të jetë "<progr…" e prerë
      var s = c >= 0 && (p < 0 || c < p) ? c : p, eKanal = s === c;
      var fundTag = b.indexOf(">", s); if (fundTag < 0) { i = s; break; }
      if (b.charAt(fundTag - 1) === "/") { (eKanal ? kanal : programi)(b.slice(s, fundTag + 1)); i = fundTag + 1; continue; }
      var mbyll = eKanal ? "</channel>" : "</programme>", e = b.indexOf(mbyll, fundTag);
      if (e < 0) { i = s; break; }
      (eKanal ? kanal : programi)(b.slice(s, e)); i = e + mbyll.length;
    }
    b = b.slice(i);
  };
  this.mbaro = function () {
    if (!gati) lidh();
    for (var k in self.prog) self.prog[k].sort(function (a, z) { return a[0] - z[0]; });
    for (var q in lok) if (self.prog[lok[q]]) harta[q] = lok[q];   // kanali lidhet vetëm me burimin që ka programe për të
  };
}

// --- shkarkimi: fetch copë-copë (kujtesë e vogël); nëse s'lejohet, XMLHttpRequest
function lexoRrjedhen(s, lexues) {
  var rd = s.getReader(), dec = new TextDecoder("utf-8");
  function hap() { return rd.read().then(function (p) { if (p.done) { lexues.shto(dec.decode()); return; } lexues.shto(dec.decode(p.value, { stream: true })); return hap(); }); }
  return hap();
}
function lexoBufferin(u, lexues) {
  if (u.length > 1 && u[0] === 0x1f && u[1] === 0x8b) {
    if (window.DecompressionStream && window.Response) return lexoRrjedhen(new Response(u).body.pipeThrough(new DecompressionStream("gzip")), lexues);
    if (u.length > 12e6) return Promise.reject(new Error(T("guida është shumë e madhe për këtë TV (provo vetëm AL)")));
    try { u = gunzip(u); } catch (e) { return Promise.reject(e); }
  }
  var dec = new TextDecoder("utf-8"), i = 0, H = 1 << 20;
  return new Promise(function (ok, jo) {
    (function hapi() {
      try {
        if (i >= u.length) { lexues.shto(dec.decode()); return ok(); }
        lexues.shto(dec.decode(u.subarray(i, i + H), { stream: true })); i += H;
        setTimeout(hapi, 0);   // mos e ngri telekomandën
      } catch (e) { jo(e); }
    })();
  });
}
function merrBinar(url, sek) {
  return new Promise(function (ok, jo) {
    var x = new XMLHttpRequest();
    x.open("GET", url, true); x.responseType = "arraybuffer"; x.timeout = (sek || 180) * 1000;
    x.onprogress = function (e) { if (e.loaded > 60e6) { x.onload = x.onerror = x.ontimeout = null; try { x.abort(); } catch (er) {} jo(new Error(T("guida është shumë e madhe për këtë pajisje (provo vetëm AL)"))); } };
    x.onload = function () { if (x.status < 200 || x.status >= 300) return jo(new Error(T("serveri u përgjigj ") + x.status)); ok(new Uint8Array(x.response)); };
    x.onerror = function () { jo(new Error(T("s'u lidh dot"))); };
    x.ontimeout = function () { jo(new Error(T("koha mbaroi"))); };
    x.send();
  });
}
function lexoBurimin(url, lexues) {
  function meXhr() { return merrBinar(url).then(function (u) { return lexoBufferin(u, lexues); }); }
  if (!window.fetch || !window.ReadableStream || !window.TextDecoder) return meXhr();
  var ctl = window.AbortController ? new AbortController() : null, filloi = false;
  var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 240000);
  return fetch(url, ctl ? { signal: ctl.signal, credentials: "omit" } : { credentials: "omit" }).then(function (r) {
    if (!r.ok) { var e = new Error(T("serveri u përgjigj ") + r.status); e.fund = true; throw e; }
    if (!r.body || !r.body.getReader) throw new Error(T("pa stream"));
    var rd = r.body.getReader();
    return rd.read().then(function (p) {
      filloi = true;
      var pare = p.value || new Uint8Array(0), gz = pare.length > 1 && pare[0] === 0x1f && pare[1] === 0x8b;
      var rr = new ReadableStream({
        start: function (c) { if (pare.length) c.enqueue(pare); if (p.done) c.close(); },
        pull: function (c) { return rd.read().then(function (q) { if (q.done) c.close(); else c.enqueue(q.value); }); }
      });
      if (gz && !(window.DecompressionStream && rr.pipeThrough)) {   // TV i vjetër: mblidhe të gjithë dhe hape në JS
        var copat = [], gj = 0, rd2 = rr.getReader();
        return (function mblidh() {
          return rd2.read().then(function (q) {
            if (!q.done) { copat.push(q.value); gj += q.value.length; if (gj > 12e6) throw new Error(T("guida është shumë e madhe për këtë TV (provo vetëm AL)")); return mblidh(); }
            var u = new Uint8Array(gj), o = 0; copat.forEach(function (c) { u.set(c, o); o += c.length; }); copat = null;
            return lexoBufferin(u, lexues);
          });
        })();
      }
      return lexoRrjedhen(gz ? rr.pipeThrough(new DecompressionStream("gzip")) : rr, lexues);
    });
  }).then(function () { clearTimeout(timer); }, function (e) {
    clearTimeout(timer);
    if (e && e.fund) throw e;
    if (filloi) throw e;   // u prish në mes: mos e shkarko të gjithën përsëri
    return meXhr();       // fetch s'u lejua (p.sh. CORS në TV): provo XHR
  });
}

// --- gunzip në JavaScript (për TV-të pa DecompressionStream, p.sh. Samsung 2020)
function gunzip(d) {
  var out = new Uint8Array(Math.max(65536, d.length * 8)), op = 0, pos = 0, bb = 0, bc = 0;
  var LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  var LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  var DB = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  var DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  var RENDI = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  function vend(n) {
    if (op + n <= out.length) return;
    var nl = out.length * 2; while (nl < op + n) nl *= 2;
    if (nl > 200e6) throw new Error(T("guida është shumë e madhe për këtë TV (provo vetëm AL)"));
    var o2 = new Uint8Array(nl); o2.set(out.subarray(0, op)); out = o2;
  }
  function bit() { if (!bc) { if (pos >= d.length) throw new Error(T("skedari .gz është i prerë")); bb = d[pos++]; bc = 8; } var v = bb & 1; bb >>>= 1; bc--; return v; }
  function bite(n) { var v = 0; for (var i = 0; i < n; i++) v |= bit() << i; return v; }
  function Pema() { this.t = new Uint16Array(16); this.s = new Uint16Array(320); }
  function nderto(p, gj, off, n) {
    var i, o = new Uint16Array(16), sh = 0;
    for (i = 0; i < 16; i++) p.t[i] = 0;
    for (i = 0; i < n; i++) p.t[gj[off + i]]++;
    p.t[0] = 0;
    for (i = 0; i < 16; i++) { o[i] = sh; sh += p.t[i]; }
    for (i = 0; i < n; i++) if (gj[off + i]) p.s[o[gj[off + i]]++] = i;
  }
  function simboli(p) {
    var sh = 0, cur = 0, len = 0;
    do { cur = 2 * cur + bit(); if (++len > 15) throw new Error(T("skedari .gz është i dëmtuar")); sh += p.t[len]; cur -= p.t[len]; } while (cur >= 0);
    return p.s[sh + cur];
  }
  var lf = new Pema(), df = new Pema(), lt = new Pema(), dt = new Pema(), kt = new Pema(), g = new Uint8Array(320), i;
  for (i = 0; i < 144; i++) g[i] = 8; for (; i < 256; i++) g[i] = 9; for (; i < 280; i++) g[i] = 7; for (; i < 288; i++) g[i] = 8;
  nderto(lf, g, 0, 288);
  for (i = 0; i < 30; i++) g[i] = 5;
  nderto(df, g, 0, 30);
  function blloku(L, D) {
    for (;;) {
      var s = simboli(L);
      if (s < 256) { vend(1); out[op++] = s; }
      else if (s === 256) return;
      else {
        s -= 257; if (s > 28) throw new Error(T("skedari .gz është i dëmtuar"));
        var len = LB[s] + bite(LE[s]), ds = simboli(D); if (ds > 29) throw new Error(T("skedari .gz është i dëmtuar"));
        var dist = DB[ds] + bite(DE[ds]); if (dist > op) throw new Error(T("skedari .gz është i dëmtuar"));
        vend(len); for (var j = 0; j < len; j++) { out[op] = out[op - dist]; op++; }
      }
    }
  }
  function dinamik() {
    var hlit = bite(5) + 257, hdist = bite(5) + 1, hclen = bite(4) + 4, j, gj = new Uint8Array(320);
    for (j = 0; j < 19; j++) g[j] = 0;
    for (j = 0; j < hclen; j++) g[RENDI[j]] = bite(3);
    nderto(kt, g, 0, 19);
    for (var n = 0; n < hlit + hdist;) {
      var s = simboli(kt), para, sa;
      if (s < 16) { gj[n++] = s; continue; }
      if (s === 16) { if (!n) throw new Error(T("skedari .gz është i dëmtuar")); para = gj[n - 1]; sa = 3 + bite(2); }
      else if (s === 17) { para = 0; sa = 3 + bite(3); }
      else { para = 0; sa = 11 + bite(7); }
      if (n + sa > hlit + hdist) throw new Error(T("skedari .gz është i dëmtuar"));
      while (sa--) gj[n++] = para;
    }
    nderto(lt, gj, 0, hlit); nderto(dt, gj, hlit, hdist);
    blloku(lt, dt);
  }
  while (pos + 10 <= d.length && d[pos] === 0x1f && d[pos + 1] === 0x8b) {   // një ose disa pjesë gzip njëra pas tjetrës
    if (d[pos + 2] !== 8) throw new Error(T("skedari .gz s'mbështetet"));
    var flg = d[pos + 3]; pos += 10;
    if (flg & 4) pos += 2 + (d[pos] | (d[pos + 1] << 8));
    if (flg & 8) while (pos < d.length && d[pos++]) {}
    if (flg & 16) while (pos < d.length && d[pos++]) {}
    if (flg & 2) pos += 2;
    bb = 0; bc = 0;
    var fund;
    do {
      fund = bit(); var tipi = bite(2);
      if (tipi === 0) {
        bc = 0; if (pos + 4 > d.length) throw new Error(T("skedari .gz është i prerë"));
        var len = d[pos] | (d[pos + 1] << 8); pos += 4;
        if (pos + len > d.length) throw new Error(T("skedari .gz është i prerë"));
        vend(len); out.set(d.subarray(pos, pos + len), op); op += len; pos += len;
      } else if (tipi === 1) blloku(lf, df);
      else if (tipi === 2) dinamik();
      else throw new Error(T("skedari .gz është i dëmtuar"));
    } while (!fund);
    bc = 0; pos += 8;   // CRC32 + madhësia
  }
  if (!op) throw new Error(T("skedari .gz është bosh ose i dëmtuar"));
  return out.subarray(0, op);
}

// --- ngarkimi i guidës për listën aktive
function kaGuideXml(it) { var k = it && GX.harta[it.k], p = k && GX.prog[k]; return !!(p && p.length && p[p.length - 1][1] > tani()); }
function xmlPer(it) {
  var k = GX.harta[it.k], p = k && GX.prog[k]; if (!p) return null;
  var t = tani(), r = [];
  for (var i = 0; i < p.length && r.length < 6; i++) if (p[i][1] > t) r.push({ fil: p[i][0], mb: p[i][1], tit: p[i][2], per: p[i][3] });
  return r.length ? r : null;
}
function aplikoGuiden() {
  GX.n = 0; for (var k in GX.harta) if (GX.prog[GX.harta[k]]) GX.n++;
  if (!S.burim) return;
  rivizato();
  if (F.ekran === "live" && UI.lKan) infoKanali(UI.lKan.tani());
  if (S.luan && S.luan.lloji === "live" && document.body.classList.contains("plote") && !$("#osd").classList.contains("fsh")) osdLive(false);
  if (F.ekran === "cil") vizatoCil();
}
function nisGuiden(detyro) {
  var l = S.listat[S.aktive], urls = linqetEpg(l), celes = celesListe() + "|" + urls.join(" "), nr = ++GX.nr;
  GX.prog = {}; GX.harta = {}; GX.n = 0; GX.urls = urls; GX.gabim = ""; GX.duke = false; GX.koha = 0;
  if (!urls.length) { GX.gjendja = ""; return; }
  var c = LS.get("xmltv", null);
  if (c && c.celes === celes && c.prog && c.harta) {   // guida e ruajtur: shfaqet menjëherë
    GX.prog = c.prog; GX.harta = c.harta; GX.koha = c.t || 0; aplikoGuiden();
    GX.gjendja = "gati";
    if (!detyro && tani() - GX.koha < 4 * 3600) return;
  }
  GX.duke = true; GX.gjendja = T("duke u shkarkuar…"); BUX = { p: 0, d: 0 };
  if (F.ekran === "cil") vizatoCil();
  var kanalet = S.live.slice(), harta = {}, prog = {}, gabimet = [], i = 0;
  (function tjetri() {
    if (nr !== GX.nr) return;
    if (i >= urls.length) {
      GX.duke = false;
      var n = 0; for (var k in harta) n++;
      if (!n) {   // asnjë kanal s'u gjet: mbaj guidën e vjetër nëse kishte
        GX.gabim = gabimet.length ? gabimet.join(" · ") : T("asnjë kanal i listës s'u gjet në këtë guidë");
        GX.gjendja = "gabim"; if (F.ekran === "cil") vizatoCil();
        return;
      }
      GX.prog = prog; GX.harta = harta; GX.koha = tani(); GX.gabim = gabimet.join(" · "); GX.gjendja = "gati";
      aplikoGuiden();
      try {   // ruaje (vetëm nëse s'është shumë e madhe, që të mos zërë vendin e listave/të preferuarave)
        localStorage.removeItem("mi_xmltv");
        var est = vleresoGuiden(prog, harta);
        for (var niv = 0; niv < 5; niv++) {   // nëse është e madhe, ngjeshe: pa përshkrime → vetëm 24 orët e ardhshme
          if (est[niv] > 1450000) continue;
          var j = JSON.stringify({ celes: celes, t: GX.koha, harta: harta, prog: niv ? ngjeshGuiden(prog, niv) : prog });
          if (j.length < 1500000) localStorage.setItem("mi_xmltv", j);
          break;
        }
      } catch (e) {}
      return;
    }
    var u = urls[i++], lx = new LexuesXmltv(String(i), kanalet, harta);
    lexoBurimin(u, lx).then(function () {
      lx.mbaro();
      for (var k in lx.prog) prog[k] = lx.prog[k];
      if (!lx.kanaleXml && !lx.programe) gabimet.push(emerEpg(u) + T(": skedari s'duket si guidë XMLTV"));
    }).catch(function (e) { gabimet.push(emerEpg(u) + ": " + (e && e.message || e)); }).then(function () { setTimeout(tjetri, 0); });
  })();
}
function vleresoGuiden(prog, harta) {   // madhësia e përafërt e JSON-it për çdo nivel ngjeshjeje
  var t = tani(), e = [0, 0, 0, 0, 0], k, h = 0;
  for (k in harta) h += k.length + harta[k].length + 8;
  for (k in prog) {
    var l = prog[k], j = 0;
    for (var i = 0; i < l.length; i++) {
      var p = l[i], b = 30 + p[2].length + (p[4] ? p[4].length + 3 : 0), d = p[3] ? p[3].length : 0;
      e[0] += b + d;
      if (p[1] <= t) continue;
      e[1] += b + (p[0] < t + 12 * 3600 ? d : 0); e[2] += b + (j < 3 ? d : 0); e[3] += b; if (p[0] < t + 24 * 3600) e[4] += b; j++;
    }
    for (i = 0; i < 5; i++) e[i] += k.length + 6;
  }
  return e.map(function (x) { return Math.round(x * 1.05) + h; });
}
function ngjeshGuiden(prog, niv) {
  var r = {}, t = tani(), deri = niv >= 4 ? t + 24 * 3600 : 1e12;
  for (var k in prog) r[k] = prog[k].filter(function (p) { return p[1] > t && p[0] < deri; }).map(function (p, i) {
    var per = niv === 1 ? (p[0] < t + 12 * 3600 ? p[3] : "") : niv === 2 && i < 3 ? p[3] : "";
    return p[4] ? [p[0], p[1], p[2], per, p[4]] : [p[0], p[1], p[2], per]; });
  return r;
}
function tekstGuida() {
  if (!GX.urls.length) return T("pa link");
  if (GX.duke && !GX.n) return T("duke u shkarkuar…");
  if (GX.n) return GX.n + (GX.n === 1 ? T(" kanal") : T(" kanale")) + (GX.duke ? T(" · po rifreskohet…") : "");
  return GX.gjendja === "gabim" ? T("⚠️ s'u ngarkua") : "—";
}

// ------------------------------------------------------------------ ID e TV-së dhe paneli i administratorit
function idPajisjes() {
  var mac = "";
  try { if (window.webapis && webapis.network && webapis.network.getMac) mac = webapis.network.getMac() || ""; } catch (e) {}
  mac = String(mac).toUpperCase().replace(/[^0-9A-F]/g, "");
  if (mac.length === 12 && !/^0+$/.test(mac)) { mac = mac.match(/../g).join(":"); if (LS.get("pajisja_id", "") !== mac) LS.set("pajisja_id", mac); return mac; }
  var id = LS.get("pajisja_id", "");
  if (!id) {   // pa MAC (p.sh. versioni i vjetër pa leje): ID e rastësishme në formë MAC-u, që s'ndryshon më
    id = "02"; for (var i = 0; i < 5; i++) id += ":" + ("0" + Math.floor(Math.random() * 256).toString(16)).slice(-2);
    id = id.toUpperCase(); LS.set("pajisja_id", id);
  }
  return id;
}
function celesiPajisjes() {
  var c = LS.get("pajisja_celesi", "");
  if (!c) { c = String(100000 + Math.floor(Math.random() * 900000)); LS.set("pajisja_celesi", c); }
  return c;
}
function modeliTV() {
  try { return webapis.productinfo.getRealModel() || webapis.productinfo.getModel() || "Samsung"; } catch (e) { return NE_TV ? "Samsung" : "Shfletues"; }
}
var PN = { duke: false, gabimi: "", lidhur: 0 };
function pyetPanelin() {
  if (!PANELI || PN.duke) return;
  PN.duke = true;
  var x = new XMLHttpRequest();
  x.open("POST", PANELI, true);
  x.timeout = 15000;
  x.setRequestHeader("Content-Type", "application/json");
  x.onload = function () {
    PN.duke = false;
    var d = null; try { d = JSON.parse(x.responseText); } catch (e) {}
    if (!d) { PN.gabimi = T("përgjigje e gabuar"); return; }
    if (x.status === 403 && d.gabim === "celesi") { PN.gabimi = T("paneli pret që administratori të pranojë çelësin e ri"); return; }
    if (!d.ok) { PN.gabimi = d.gabim || (T("gabim ") + x.status); return; }
    PN.gabimi = ""; PN.lidhur = Date.now(); PN.emri = d.emri || "";
    aplikoListatPanelit(d.listat || []);
    (d.mesazhe || []).forEach(shtoMesazh);
    if (F.ekran === "cil") vizatoCil();
  };
  x.onerror = x.ontimeout = function () { PN.duke = false; PN.gabimi = T("paneli s'u arrit"); };
  x.send(JSON.stringify({ id: idPajisjes(), celesi: celesiPajisjes(), v: VERSIONI, modeli: modeliTV() }));
}
function thelbiListes(l) { return JSON.stringify([l.lloji || "xtream", l.host || "", l.user || "", l.pass || "", l.m3u || ""]); }
function aplikoListatPanelit(listat) {
  var json = JSON.stringify(listat);
  if (json === LS.get("paneli_json", "[]")) return;           // asgjë e re
  LS.set("paneli_json", json);
  var aktive = S.listat[S.aktive] || null, aktiveT = aktive ? thelbiListes(aktive) : "";
  var reja = listat.map(function (l) { return { emri: l.emri, lloji: l.lloji, host: l.host, user: l.user, pass: l.pass, m3u: l.m3u, epg: l.epg || "", paneli: true }; });
  S.listat = reja.concat(S.listat.filter(function (l) { return !l.paneli; }));
  LS.set("listat", S.listat);
  var idx = -1, hoqi = !reja.length || (aktive && aktive.paneli && !reja.some(function (l) { return thelbiListes(l) === aktiveT; }));
  S.listat.forEach(function (l, i) { if (idx < 0 && thelbiListes(l) === aktiveT) idx = i; });
  if (idx >= 0 && S.burim) {   // lista që po shikon s'ndryshoi
    S.aktive = idx; LS.set("aktive", idx);
    njofto(T("📋 Listat u përditësuan nga administratori"), 4000);
    if ((S.listat[idx].epg || "") !== (aktive.epg || "")) nisGuiden(true);   // administratori ndryshoi vetëm guidën
    if (F.ekran === "cil") vizatoCil();
    return;
  }
  S.aktive = 0; LS.set("aktive", 0);
  if (S.listat.length) { njofto(hoqi && !reja.length ? T("📋 Administratori e hoqi listën") : T("📋 Administratori të dërgoi listën"), 4000); ngarkoListen(); }
  else if (S.burim) { S.burim = null; hapForme(-1); }
}
var MQ = [];
function shtoMesazh(m) {
  if (!m || !m.id) return;
  if (LS.get("mesazhe_pare", []).indexOf(m.id) >= 0 || MQ.some(function (x) { return x.id === m.id; })) return;
  MQ.push(m);
  shfaqMesazhet();
}
function shfaqMesazhet() {
  if (!MQ.length) return;
  if (DG || !$("#fillimi").classList.contains("fsh") || (document.activeElement && document.activeElement.tagName === "INPUT")) { setTimeout(shfaqMesazhet, 2000); return; }
  var m = MQ.shift(), pare = LS.get("mesazhe_pare", []);
  pare.push(m.id); LS.set("mesazhe_pare", pare.slice(-200));
  dialog(T("📢 <b>Mesazh</b><br><div style='margin-top:16px;text-align:left;white-space:pre-wrap'>") + esc(m.tekst) + "</div>", [{ t: "OK" }]);
}

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
  if (S.fav[it.k]) { delete S.fav[it.k]; njofto(T("U hoq nga të preferuarat")); } else { S.fav[it.k] = 1; njofto(T("⭐ U shtua te të preferuarat")); }
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
  var vj = this.inner.getElementsByTagName("img");   // anulo shkarkimet e posterave që s'duken më
  for (var q = 0; q < vj.length; q++) { try { vj[q].removeAttribute("src"); } catch (e) {} }
  this.inner.innerHTML = h.replace(/<img src=/g, '<img decoding="async" data-src=');
  var self = this; clearTimeout(this._tImg);
  this._tImg = setTimeout(function () {   // posterat: pasi ndalon lëvizja
    var im = self.inner.querySelectorAll("img[data-src]");
    for (var q = 0; q < im.length; q++) { im[q].src = im[q].getAttribute("data-src"); im[q].removeAttribute("data-src"); }
  }, 180);
  var rreshta = Math.ceil(n / this.kol);
  if (rreshta > v) {
    var H = this.el.clientHeight || 850;
    this.shirit.style.display = "block"; this.shirit.style.height = Math.max(40, H * v / rreshta) + "px"; this.shirit.style.top = (H - Math.max(40, H * v / rreshta)) * this.top / (rreshta - v) + "px";
  } else this.shirit.style.display = "none";
};

// ------------------------------------------------------------------ vizatimi i rreshtave
function posterUrl(u) {   // TMDB: madhësi e vogël në vend të "original" (më pak memorie në TV)
  return u ? String(u).replace(/(image\.tmdb\.org\/t\/p\/)(original|w\d+(?:_and_h\d+[^\/]*)?)\//i, "$1w342/") : u;
}
function logoHtml(emri, src, klasa) {
  if (klasa === "poster") src = posterUrl(src);
  var ini = esc(inicialet(emri));
  return '<div class="' + klasa + '" style="background:' + ngjyra(emri) + '">' +
    (src ? '<img src="' + esc(src) + '" onerror="this.parentNode.textContent=\'' + ini + '\'">' : ini) + "</div>";
}
function epgPer(it) {
  var t = tani(), l = null;
  if (S.epgTani && S.epgTani[String(it.sid)]) l = S.epgTani[String(it.sid)].map(function (p) { return { fil: p[0], mb: p[1], tit: p[2] }; });
  else if ((l = xmlPer(it))) {}   // guida nga linku EPG i listës
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
  { id: "auto", m: "PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO", t: T("Automatik") },
  { id: "mbush", m: "PLAYER_DISPLAY_MODE_FULL_SCREEN", t: T("Mbush ekranin") },
  { id: "origjinal", m: "PLAYER_DISPLAY_MODE_LETTER_BOX", t: T("Origjinal (me shirita)") }
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
  njofto(T("🖼️ Figura: ") + f.t + (S.luan.lloji === "live" ? T("  · ruhet për këtë kanal") : ""), 3000);
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
      if (!this.kutiaVone()) this._rectAV();
      av.prepareAsync(function () {
        if (id !== self._nr) return;
        try { self.gjatesiaMs = av.getDuration() || 0; } catch (e) {}
        if (fillim > 0) { try { av.seekTo(fillim); } catch (e) {} }
        av.play(); ngarkim(false);
        self._rectAV();
        if (CIL.kutia && !self.ePlote()) setTimeout(function () { if (id === self._nr && !self.ePlote()) self._rectAV(); }, 1200);
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
    var tekst = T("Nuk po hapet.");
    if (/CONNECTION|NETWORK|TIMEOUT/i.test(arsyeja)) tekst = T("S'u lidh dot me serverin e kanalit.");
    else if (/UNSUPPORTED|FORMAT|CODEC/i.test(arsyeja)) tekst = T("Formati i këtij kanali nuk mbështetet.");
    gabimVideo(true, "⚠️ " + tekst + T("<small>Mund të jetë offline, ose abonimi po përdoret në një pajisje tjetër. (") + esc(arsyeja).slice(0, 60) + ")</small>");
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
  metoda: function () {
    if (this.ePlote()) return figura(this.figura).m;
    var kt = CIL.kutia; return kt ? (kt.m ? "PLAYER_DISPLAY_MODE_" + kt.m : "") : "PLAYER_DISPLAY_MODE_LETTER_BOX";
  },
  kutiaVone: function () { return !this.ePlote() && CIL.kutia && CIL.kutia.vone; },
  _rectAV: function () {
    var r = this.rect, o = $("#av");
    o.style.left = r[0] + "px"; o.style.top = r[1] + "px"; o.style.width = r[2] + "px"; o.style.height = r[3] + "px";
    var m = this.metoda();
    if (m) { try { webapis.avplay.setDisplayMethod(m); } catch (e) {} }
    var k = (!this.ePlote() && CIL.kutia ? CIL.kutia.k : CIL.shkalla) || 1;   // disa Samsung 4K (2020) e lexojnë rect-in në 3840x2160 -> ×2
    try { webapis.avplay.setDisplayRect(Math.round(r[0] * k), Math.round(r[1] * k), Math.round(r[2] * k), Math.round(r[3] * k)); } catch (e) {}
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
// --- testi i kutisë së vogël (TV që s'e shfaqin videon në kutinë e vogël, p.sh. Samsung 2020)
var PROVAT_KUTIA = [null,
  { m: "LETTER_BOX", k: 2 }, { m: "FULL_SCREEN", k: 2 }, { m: "AUTO_ASPECT_RATIO", k: 2 }, { m: "", k: 2 }, { m: "LETTER_BOX", k: 2, vone: 1 },
  { m: "LETTER_BOX", k: 1 }, { m: "FULL_SCREEN", k: 1 }, { m: "", k: 1 }];
var TK = null;
function provaKutiaNr(kt) { var j = JSON.stringify(kt || null); for (var i = 0; i < PROVAT_KUTIA.length; i++) if (JSON.stringify(PROVAT_KUTIA[i]) === j) return i; return 0; }
function testoKutine() {
  if (!S.live.length) return njofto(T("Hap fillimisht një listë me kanale"));
  var it = (S.luan && S.luan.lloji === "live" && S.luan.it) || UI.lKan.tani() || S.live[0];
  TK = { i: provaKutiaNr(CIL.kutia), it: it, para: CIL.kutia };
  F.tab = 0; shfaqEkran("live"); vendosZone("kan");
  provaKutia();
}
function provaKutia() { CIL.kutia = PROVAT_KUTIA[TK.i]; luajLive(TK.it); vizatoTestin(); }
function vizatoTestin() {
  $("#l-info").innerHTML = T("<h2>🧪 Prova ") + (TK.i + 1) + " / " + PROVAT_KUTIA.length + (TK.i ? "" : T(" (si tani)")) + "</h2><div class='kat-e'>" + esc(TK.it.emri) + "</div>" +
    T("<div class='prog'><div class='tit'>A duket figura brenda kutisë lart?</div><div class='per'>Prit 2–3 sekonda pas çdo prove.</div></div>") +
    T("<div class='prog'><div class='ora-p'>▼ prova tjetër · ▲ e mëparshmja</div><div class='tit'>OK = kjo punon (ruhet)</div><div class='per'>Back = anulo</div></div>");
}
function tastTest(k) {
  var n = PROVAT_KUTIA.length;
  if (k === K.POSHTE || k === K.DJATHTAS || k === K.CHDN) { TK.i = (TK.i + 1) % n; provaKutia(); }
  else if (k === K.LART || k === K.MAJTAS || k === K.CHUP) { TK.i = (TK.i + n - 1) % n; provaKutia(); }
  else if (k === K.OK) {
    var nr = TK.i; CIL.kutia = PROVAT_KUTIA[nr]; ruajCil(); TK = null;
    njofto(nr ? T("✅ U ruajt prova ") + (nr + 1) + T(" për kutinë e vogël") : T("✅ Kutia e vogël: si më parë"), 4000); infoKanali(UI.lKan.tani());
  } else if (k === K.PRAPA) {
    var it = TK.it; CIL.kutia = TK.para; TK = null; luajLive(it); infoKanali(UI.lKan.tani()); njofto(T("Testi u anulua"), 2500);
  }
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
  if (TS && z !== F.zona) { TS = null; var tsd = $("#tastiera"); if (tsd) tsd.classList.add("fsh"); }
  F.zona = z;
  if (z !== "vrend") RV.hap = false;
  if ($("#rendit-btn")) vizatoRendit();
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
  rez.push({ id: "*", emri: T("📺 Të gjitha"), n: S.live.length });
  rez.push({ id: "fav", emri: T("⭐ Të preferuarat"), n: S.live.filter(function (x) { return S.fav[x.k]; }).length });
  rez.push({ id: "hist", emri: T("🕘 Të fundit") });
  S.liveKat.forEach(function (k) { if (n[k.id]) rez.push({ id: k.id, emri: k.emri, n: n[k.id] }); });
  var pa = S.live.filter(function (x) { return !S.liveKat.some(function (k) { return k.id === x.kat; }); });
  if (pa.length && S.liveKat.length) rez.push({ id: "_", emri: T("Të tjera"), n: pa.length });
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
  UI.lKan.bosh = k.id === "fav" ? T("Ende s'ke të preferuar.<br>Mbaj <b>OK</b> të shtypur mbi një kanal.") : k.id === "hist" ? T("Këtu dalin kanalet që ke parë së fundi.") : T("Bosh");
  var j = 0;
  if (ruajFokus && S.luan && S.luan.lloji === "live") { var p = l.indexOf(S.luan.it); if (p >= 0) j = p; }
  UI.lKan.vendos(l, j);
  $("#l-kan-titull").textContent = k.emri.replace(/^[^\wÀ-ž]+\s*/, "") + " · " + l.length;
  LS.set("katLive_" + celesListe(), k.id);
  infoKanali(UI.lKan.tani());
}
var epgTimer = null;
function infoKanali(it) {
  if (TK) return vizatoTestin();
  var el = $("#l-info");
  if (!it) { el.innerHTML = ""; return; }
  var kat = (S.liveKat.filter(function (k) { return k.id === it.kat; })[0] || {}).emri || "";
  var e = epgPer(it), h = "<h2>" + esc(it.num + ". " + it.emri) + "</h2><div class='kat-e'>" + esc(kat) + (S.fav[it.k] ? " · ⭐" : "") + "</div>";
  if (e && e.lista.length) {
    e.lista.slice(0, 2).forEach(function (p, i) {
      h += "<div class='prog'><div class='ora-p'>" + (i === 0 && p.fil <= tani() ? T("TANI · ") : "") + ora(p.fil) + " – " + ora(p.mb) + "</div><div class='tit'>" + esc(p.tit) + "</div>" +
        (p.per ? "<div class='per'>" + esc(p.per) + "</div>" : "") + "</div>";
    });
  } else h += "<div class='prog'><div class='per'>" + (S.epgC[it.k] && !(GX.duke && !GX.n) ? T("S'ka guidë për këtë kanal.") : T("Duke marrë guidën…")) + "</div></div>";
  h += T("<div class='ndihme'>OK: shiko këtu · OK përsëri: ekran i plotë · Mbaj OK: ⭐<div class='ngjyrat'>") + LEGJENDA + "</div></div>";
  el.innerHTML = h;
  clearTimeout(epgTimer);
  var c = S.epgC[it.k];
  if (!(S.epgTani && S.epgTani[String(it.sid)]) && !kaGuideXml(it) && (!c || tani() - c.t > 600)) {
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
  if ((S.epgTani && S.epgTani[String(it.sid)]) || kaGuideXml(it)) return;
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
  $("#o-pastaj").textContent = e && e.pastaj ? T("Pastaj ") + ora(e.pastaj.fil) + ":  " + e.pastaj.tit : "";
  $("#o-ndihme").innerHTML = T("▲▼ / CH: kanal tjetër · OK: menuja · ◀: lista · Back: dil<br>") + LEGJENDA.replace(">" + T("Formati") + "<", T(">Figura (") + esc(figura(L.figura).t) + ")<");
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
  $("#o-ndihme").innerHTML = T("OK: pauzë · ◀ ▶: 10 sek · ⏪ ⏩: 1 min · Back: dil<br><span class='ngj'><i class='ng ng-v'></i>/ ▼: figura (") + esc(figura(L.figura).t) + ")</span>";
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
  $("#z-titull").textContent = T("Kanalet · ") + l.length;
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
      if (pas) { njofto(T("▶ Episodi tjetër")); pas(); } else dilPlote();
    } });
    hyrPlote();
    clearInterval(pozTimer); pozTimer = setInterval(ruajPozicionin, 15000);
  };
  if (p) dialog(T("Vazhdo nga ") + kohe(p) + "?", [{ t: T("▶ Vazhdo"), f: function () { nis(p); } }, { t: T("⟲ Nga fillimi"), f: function () { nis(0); } }]);
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
  var n = {}, rez = [{ id: "*", emri: T("Të gjitha"), n: lista.length }, { id: "fav", emri: T("⭐ Të preferuarat"), n: lista.filter(function (x) { return S.fav[x.k]; }).length }];
  lista.forEach(function (x) { n[x.kat] = (n[x.kat] || 0) + 1; });
  kat.forEach(function (k) { if (n[k.id]) rez.push({ id: k.id, emri: k.emri, n: n[k.id] }); });
  return rez;
}
function zgjidhKatVod(lloji, i) {
  var ser = lloji === "ser", lk = ser ? UI.sKat : UI.vKat, rr = ser ? UI.sRr : UI.vRr, lista = ser ? S.ser : S.vod;
  var k = lk.items[i]; if (!k) return;
  lk.zgjedhur = i; lk.vizato();
  var l = k.id === "*" ? lista : k.id === "fav" ? lista.filter(function (x) { return S.fav[x.k]; }) : lista.filter(function (x) { return x.kat === k.id; });
  if (!ser) { l = renditVod(l); ndertoRendit(); }
  rr.bosh = k.id === "fav" ? T("Ende s'ke të preferuar. Mbaj OK të shtypur mbi një poster.") : (ser ? T("S'ka seriale.") : T("S'ka filma."));
  rr.vendos(l, 0);
  $(ser ? "#s-titull" : "#v-titull").textContent = k.emri + " · " + l.length;
}
function hapSerial(it) {
  $("#fillimi-tekst").textContent = T("Duke hapur serialin…");
  ngarkim(true);
  S.burim.serial(it).then(function (d) {
    ngarkim(false);
    var ep = (d && d.episodes) || {}, sez = Object.keys(ep).sort(function (a, b) { return a - b; });
    if (!sez.length) return njofto(T("Ky serial s'ka episode."));
    S.serTani = { it: it, info: (d && d.info) || {}, ep: ep, sez: sez };
    shfaqEkran("serdet");
    UI.dSez.vendos(sez.map(function (s) { return { t: T("Sezoni ") + s, v: ep[s].length, s: s }; }), 0);
    UI.dSez.zgjedhur = 0;
    zgjidhSezonin(0);
    vendosZone("ep");
    var inf = S.serTani.info;
    $("#d-info").innerHTML = (it.logo ? '<img src="' + esc(it.logo) + '">' : "") + "<h2>" + esc(it.emri) + "</h2>" +
      "<div class='kat-e'>" + esc([inf.genre, inf.releaseDate || inf.year, inf.rating ? "★ " + inf.rating : ""].filter(Boolean).join(" · ")) + "</div>" +
      "<div class='per'>" + esc(inf.plot || it.per || "") + "</div>";
  }).catch(function (e) { ngarkim(false); dialog(T("Serial-i nuk u hap: ") + esc(e.message), [{ t: "OK" }]); });
}
function zgjidhSezonin(i) {
  var s = UI.dSez.items[i]; if (!s) return;
  UI.dSez.zgjedhur = i; UI.dSez.vizato();
  var poz = LS.get("poz_" + celesListe(), {});
  UI.dEp.vendos(S.serTani.ep[s.s].map(function (e, j) {
    var inf = e.info || {};
    return { t: (e.episode_num || j + 1) + ". " + (e.title || T("Episodi ") + (j + 1)), d: [inf.duration, poz["e" + e.id] ? "⏸ " + kohe(poz["e" + e.id]) : ""].filter(Boolean).join(" · "), e: e, s: s.s };
  }), 0);
  $("#d-titull").textContent = T("Sezoni ") + s.s + " · " + UI.dEp.items.length + (GJ === "en" && UI.dEp.items.length === 1 ? " episode" : T(" episode"));
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
  if (q.length < 2) { UI.kLista.bosh = T("Shkruaj të paktën 2 shkronja."); UI.kLista.vendos([], 0); return; }
  var r = [];
  S.live.forEach(function (x) { if (x.emri.toLowerCase().indexOf(q) >= 0) r.push({ t: "📺 " + x.emri, d: T("Kanal · ") + x.num, it: x, l: "live" }); });
  S.vod.forEach(function (x) { if (x.emri.toLowerCase().indexOf(q) >= 0) r.push({ t: "🎬 " + x.emri, d: T("Film"), it: x, l: "vod" }); });
  S.ser.forEach(function (x) { if (x.emri.toLowerCase().indexOf(q) >= 0) r.push({ t: "🎞️ " + x.emri, d: T("Serial"), it: x, l: "ser" }); });
  UI.kLista.bosh = T("Asgjë me „") + esc(q) + T("“");
  UI.kLista.vendos(r.slice(0, 500), 0);
}

// ---- CILËSIMET
function rreshtatCil() {
  var l = S.listat[S.aktive] || {};
  var rr = [
    { t: T("📺 ID e këtij TV"), v: idPajisjes(), d: T("Çelësi: ") + celesiPajisjes() + T(" · jepja administratorit"), f: function () { njofto(T("Duke pyetur panelin…")); pyetPanelin(); setTimeout(vizatoCil, 3000); } },
    { t: T("📋 Lista aktive"), v: (l.paneli ? "🔒 " : "") + (l.emri || "—"), f: zgjidhListen },
    { t: T("➕ Shto listë të re"), f: function () { hapForme(-1); } },
    { t: T("✏️ Ndrysho listën aktive"), f: function () { hapForme(S.aktive); } },
    { t: T("🗑️ Fshi listën aktive"), f: fshiListen },
    { t: T("🔄 Rifresko kanalet"), f: function () { ngarkoListen(); } },
    { t: T("📅 Guida (EPG)"), v: tekstGuida(), d: GX.urls.length ? GX.urls.map(emerEpg).join(", ") + (GX.gabim ? " · ⚠️ " + GX.gabim : "") + T(" · OK: rifresko") : T("Shto linkun te „Ndrysho listën aktive“ (p.sh. AL)"),
      f: function () { if (!GX.urls.length) return hapForme(S.aktive); njofto(T("Duke shkarkuar guidën…")); nisGuiden(true); vizatoCil(); } },
    { t: T("🎚️ Formati i kanaleve live"), v: { auto: T("Automatik"), ts: "TS", m3u8: "HLS" }[CIL.formati], d: T("Nëse kanalet ngecin ose s'hapen, provo formatin tjetër"),
      f: function () { CIL.formati = { auto: "ts", ts: "m3u8", m3u8: "auto" }[CIL.formati]; ruajCil(); vizatoCil(); } },
    { t: T("🖼️ Formati i figurës"), v: figura(CIL.figura).t, d: T("Për të gjitha kanalet. Për një kanal të vetëm: shtyp ▶ kur je në ekran të plotë"),
      f: function () { var i = FIGURAT.indexOf(figura(CIL.figura)); CIL.figura = FIGURAT[(i + 1) % FIGURAT.length].id; ruajCil(); vizatoCil(); } },
    { t: T("🧪 Testo kutinë e videos"), samsung: 1, v: CIL.kutia ? T("Prova ") + (provaKutiaNr(CIL.kutia) + 1) : T("Standarde"),
      d: T("Nëse figura s'del te kutia e vogël (zëri po): provo mënyrat një nga një"), f: testoKutine },
    { t: T("📐 Shkalla e videos"), samsung: 1, v: CIL.shkalla == 2 ? "×2" : CIL.shkalla == 1.5 ? "×1.5" : T("Normale"),
      d: T("VETËM nëse video del gabim ose s'duket (Samsung 4K 2020): provo ×2"),
      f: function () { CIL.shkalla = CIL.shkalla == 1 ? 2 : CIL.shkalla == 2 ? 1.5 : 1; ruajCil(); if (NE_TV && L.luan()) L._rectAV(); vizatoCil();
        njofto(T("📐 Shkalla e videos: ") + (CIL.shkalla == 1 ? T("Normale") : "×" + CIL.shkalla) + T(" · kthehu te Live dhe shiko kutinë"), 4000); } },
    { t: T("🔞 Kategoritë për të rritur"), v: CIL.fshihTeRritur ? T("Të fshehura") : T("Të dukshme"),
      f: function () { CIL.fshihTeRritur = !CIL.fshihTeRritur; ruajCil(); ngarkoListen(); } },
    { t: T("⬇️ Kontrollo për përditësim"), v: VERSIONI + (versioniKeq() ? " · ⚠️ " + versioniKeq() + T(" s'u hap") : ""), f: kontrolloPerditesim },
    { t: T("▶️ Kur hapet: nis kanalin e fundit"), v: CIL.nisFundit ? T("Po") : T("Jo"), f: function () { CIL.nisFundit = !CIL.nisFundit; ruajCil(); vizatoCil(); } },
    { t: "🌐 Gjuha / Language", v: GJ === "en" ? "English" : "Shqip", d: T("Ndryshon gjuhën e aplikacionit (rihapet)"), f: ndryshoGjuhen }
  ];
  if (window.SNOW_ANDROID) rr.splice(rr.length - 1, 0, { t: T("⌨️ Tastiera në ekran"), v: T(TS_EMRAT[LS.get("tastiera", "auto")] || TS_EMRAT.auto), d: T("Nëse tastiera e Android TV mbyllet vetë, zgjidh Snow"),
    f: function () { var r = ["auto", "snow", "sistemi"]; LS.set("tastiera", r[(r.indexOf(LS.get("tastiera", "auto")) + 1) % 3]); vizatoCil(); } });
  // Android (ExoPlayer) s'ka nevojë për rregullimet e AVPlay të Samsung-ut
  return window.SNOW_ANDROID ? rr.filter(function (r) { return !r.samsung; }) : rr;
}
function vizatoCil() {
  var i = UI.cLista.i; UI.cLista.vendos(rreshtatCil(), i);
  var nga = window.MI_BURIMI && window.MI_BURIMI.nga === "github" ? T("përditësuar nga GitHub") : T("versioni i instaluar");
  var inf = S.burim && S.burim.info && S.burim.info.user_info, h = "<h2>Snow IPTV " + VERSIONI + "</h2><div style='margin:-6px 0 14px;font-size:20px'>" + nga + "</div>";
  if (versioniKeq()) { var ars = ""; try { ars = localStorage.getItem("mi_kodi_arsye") || ""; } catch (e) {}
    h += T("<div style='margin:-4px 0 14px;font-size:20px;color:var(--theks2)'>⚠️ Versioni ") + esc(versioniKeq()) + T(" s'u hap në këtë pajisje") + (ars ? " (" + esc(perktheNgarkuesin(ars)) + ")" : "") + T(". „Kontrollo për përditësim” e provon përsëri.</div>"); }
  if (inf) {
    var exp = inf.exp_date && +inf.exp_date ? new Date(+inf.exp_date * 1000).toLocaleDateString(GJ === "en" ? "en-GB" : "sq-AL") : T("pa afat");
    h += T("Llogaria: <b>") + esc(inf.username) + T("</b><br>Statusi: <b>") + esc(inf.status || "") + T("</b><br>Skadon: <b>") + esc(exp) + T("</b><br>Lidhje njëkohësisht: <b>") + esc(inf.max_connections || "?") + "</b><br>";
  }
  h += T("<div style='background:#1c2333;border-radius:12px;padding:14px 18px;margin:0 0 14px'>📺 ID e TV-së: <b style='font-size:30px;letter-spacing:1px'>") + esc(idPajisjes()) +
    T("</b><br>Çelësi: <b style='font-size:26px'>") + esc(celesiPajisjes()) + T("</b><br>Paneli: ") +
    (PN.lidhur ? T("✅ i lidhur") + (PN.emri ? " · <b>" + esc(PN.emri) + "</b>" : "") : PN.gabimi ? "⚠️ " + esc(PN.gabimi) : T("duke u lidhur…")) + "</div>";
  h += T("Kanale: <b>") + S.live.length + T("</b> · Filma: <b>") + S.vod.length + T("</b> · Seriale: <b>") + S.ser.length + "</b>";
  if (GX.urls.length) h += T("<br>Guida: <b>") + esc(tekstGuida()) + "</b>" + (GX.koha ? " · " + ora(GX.koha) : "");
  h += T("<br><br><b>Telekomanda</b><br>▲▼◀▶ lëviz · OK zgjidh · Mbaj OK: ⭐ të preferuarat<br>CH+/CH−: kanali tjetër · Numrat: shko te kanali<br>🔴 Listat · 🟢 Guida e plotë · 🟡 Formati i figurës · 🔵 Grupet e kanaleve<br>Back: kthehu");
  $("#c-info").innerHTML = h;
}
// ------------------------------------------------------------------ butonat me ngjyra (🔴 listat · 🟢 guida · 🟡 formati · 🔵 grupet)
var LEGJENDA = "<span class='ngj'><i class='ng ng-k'></i>" + T("Listat") + "</span><span class='ngj'><i class='ng ng-j'></i>" + T("Guida") + "</span>" +
  "<span class='ngj'><i class='ng ng-v'></i>" + T("Formati") + "</span><span class='ngj'><i class='ng ng-b'></i>" + T("Grupet") + "</span>";
function ePlote() { return document.body.classList.contains("plote"); }
function veprimNgjyre(k) {
  if (F.ekran === "forma" && !ePlote()) return;   // duke plotësuar formularin: mos e prish
  if (k === K.KUQ) return ngjyraListat();
  if (k === K.JESHIL) return hapGuiden();
  if (k === K.VERDHE) return ngjyraFormati();
  if (k === K.BLU) return ngjyraGrupet();
}
function ngjyraFormati() {
  if (!S.luan || !L.luan()) return njofto(T("🟡 Formati: hap fillimisht një kanal ose film"));
  ndryshoFiguren();
  if (ePlote()) { if (S.luan.lloji === "live") osdLive(true); else osdVod(true); }
  else njofto(T("🖼️ Figura: ") + figura(L.figura).t + T(" · duket në ekran të plotë"), 3000);
}
function ngjyraGrupet() {
  if (ePlote()) {
    if (S.luan && S.luan.lloji === "live") { dilPlote(); vendosZone("kat"); }
    else njofto(T("🔵 Grupet: dil fillimisht nga filmi (Back)"));
    return;
  }
  if (F.ekran === "live") return vendosZone(F.zona === "kat" ? "kan" : "kat");
  if (F.ekran === "vod") return vendosZone(F.zona === "vkat" ? "vrr" : "vkat");
  if (F.ekran === "ser") return vendosZone(F.zona === "skat" ? "srr" : "skat");
  F.tab = 0; shfaqEkran("live"); vendosZone("kat");
}
function ngjyraListat() {
  var b = S.listat.slice(0, 7).map(function (l, i) {
    return { t: (i === S.aktive ? "✔ " : "") + (l.paneli ? "🔒 " : "") + l.emri, f: function () {
      if (i === S.aktive) return;
      if (ePlote()) { L.ndalo(); S.luan = null; dilPlote(); }
      S.aktive = i; LS.set("aktive", i); ngarkoListen();
    } };
  });
  b.push({ t: T("➕ Shto listë të re"), f: function () { if (ePlote()) { L.ndalo(); S.luan = null; dilPlote(); } hapForme(-1); } });
  dialog(T("📋 Zgjidh playlistën"), b, true);
  DG.i = Math.max(0, Math.min(S.aktive, b.length - 1)); vizatoDialog();
}

// ------------------------------------------------------------------ 🟢 guida e plotë (programet + përshkrimi i plotë)
var GP = null, DITET = [T("E diel"), T("E hënë"), T("E martë"), T("E mërkurë"), T("E enjte"), T("E premte"), T("E shtunë")];
function emerDite(t) {
  var d = new Date(t * 1000), s = new Date(); s.setHours(0, 0, 0, 0);
  var n = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - s) / 864e5);
  if (n === 0) return T("Sot"); if (n === 1) return T("Nesër"); if (n === -1) return T("Dje");
  return DITET[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1);
}
function kohezgjatje(s) {
  s = Math.max(0, Math.round(s / 60)); var o = Math.floor(s / 60), m = s % 60;
  return o ? o + T(" orë") + (m ? " " + m + " min" : "") : m + " min";
}
function programetPlote(it) {
  var t = tani(), k = GX.harta[it.k], p = k && GX.prog[k], l = null, burim = "";
  if (p && p.length) { l = p.map(function (x) { return { fil: x[0], mb: x[1], tit: x[2], per: x[3], kat: x[4] || "" }; }); burim = T("Guida (EPG) e listës"); }
  else if (S.epgP && S.epgP[it.k] && S.epgP[it.k].l.length) { l = S.epgP[it.k].l; burim = T("Guida nga ofruesi"); }
  else if (S.epgTani && S.epgTani[String(it.sid)]) { l = S.epgTani[String(it.sid)].map(function (x) { return { fil: x[0], mb: x[1], tit: x[2] }; }); burim = T("Guida nga serveri"); }
  else if (S.epgC[it.k] && S.epgC[it.k].l.length) { l = S.epgC[it.k].l; burim = T("Guida nga ofruesi"); }
  if (!l) return null;
  l = l.filter(function (x) { return x.mb > t; });
  return l.length ? { l: l, burim: burim, xml: !!(p && p.length) } : null;
}
function hapGuiden() {
  var plote = ePlote(), it = null, lista = null;
  if (plote) {
    if (!S.luan || S.luan.lloji !== "live") return njofto(T("🟢 Guida është për kanalet live"));
    it = S.luan.it; lista = S.luan.lista && S.luan.lista.length ? S.luan.lista : S.live;
  } else if (F.ekran === "live" && UI.lKan && UI.lKan.items.length) {
    it = F.zona === "kan" ? UI.lKan.tani() : (S.luan && S.luan.lloji === "live" ? S.luan.it : UI.lKan.tani());
    lista = UI.lKan.items.indexOf(it) >= 0 ? UI.lKan.items : S.live;
  } else if (S.luan && S.luan.lloji === "live") { it = S.luan.it; lista = S.luan.lista || S.live; }
  else return njofto(T("🟢 Guida: shko te Live dhe zgjidh një kanal"));
  if (!it) return;
  $("#zap").classList.add("fsh"); $("#osd").classList.add("fsh");
  GP = { it: it, lista: lista, plote: plote, i: 0, s: 0 };
  $("#gp").classList.remove("fsh");
  ngarkoGuidenPlote(); vizatoGuidenPlote();
}
function mbyllGuiden() {
  if (!GP) return;
  var plote = GP.plote; GP = null;
  $("#gp").classList.add("fsh");
  if (plote && ePlote() && S.luan && S.luan.lloji === "live") osdLive(true);
}
function ngarkoGuidenPlote() {
  var it = GP.it, pp = programetPlote(it);
  if (pp && pp.xml) return;   // guida XML i ka të gjitha
  if (!S.burim || !S.burim.epg) return;
  S.epgP = S.epgP || {};
  var c = S.epgP[it.k]; if (c && tani() - c.t < 1800) return;
  GP.duke = true;
  S.burim.epg(it, 40).then(function (l) { S.epgP[it.k] = { t: tani(), l: l || [] }; if (l && l.length) S.epgC[it.k] = { t: tani(), l: l.slice(0, 4) }; })
    .catch(function () { S.epgP[it.k] = { t: tani(), l: [] }; })
    .then(function () { if (GP && GP.it === it) { GP.duke = false; vizatoGuidenPlote(); } });
}
function vizatoGuidenPlote() {
  if (!GP) return;
  var it = GP.it, pp = programetPlote(it), l = pp ? pp.l : [], t = tani();
  GP.n = l.length; GP.i = Math.max(0, Math.min(GP.i, l.length - 1));
  $("#gp-logo").outerHTML = logoHtml(it.emri, it.logo, "o-logo").replace('class="o-logo"', 'id="gp-logo" class="o-logo"');
  $("#gp-emri").textContent = it.num + ". " + it.emri;
  $("#gp-burimi").textContent = pp ? pp.burim + " · " + l.length + (l.length === 1 ? T(" program") : T(" programe")) : "";
  $("#gp-ora").textContent = oraTani();
  // lista: dritare që mban të dukshëm programin e zgjedhur (titujt e ditëve zënë vend)
  var H = 790, rr = function (s) { var h = 0, out = [], dita = null; for (var j = s; j < l.length; j++) {
    var d = emerDite(l[j].fil), shto = (d !== dita ? 50 : 0) + 72; if (h + shto > H && j > s) break;
    h += shto; out.push({ j: j, dita: d !== dita ? d : null }); dita = d; } return out; };
  if (GP.i < GP.s) GP.s = GP.i;
  var dr = rr(GP.s); while (dr.length && dr[dr.length - 1].j < GP.i) { GP.s++; dr = rr(GP.s); }
  var h = "";
  if (!l.length) h = "<div class='gp-bosh'>" + (GP.duke ? T("Duke marrë guidën…") : T("S'ka guidë për këtë kanal.<br><br>Shto guidën te lista: Cilësimet → 📅 Guida (p.sh. <b>AL</b>).")) + "</div>";
  dr.forEach(function (r) {
    var p = l[r.j], eTani = p.fil <= t;
    if (r.dita) h += "<div class='gp-dita'>" + esc(r.dita) + "</div>";
    h += "<div class='gp-rr" + (eTani ? " tani" : "") + (r.j === GP.i ? " fokus" : "") + "'><div class='gp-o'>" + (eTani ? T("TANI") : ora(p.fil)) + "</div><div class='gp-t'>" + esc(p.tit) + "</div></div>";
  });
  $("#gp-lista").innerHTML = h;
  var d = "", p = l[GP.i];
  if (p) {
    var eT = p.fil <= t, pct = Math.min(100, Math.max(0, (t - p.fil) / (p.mb - p.fil) * 100));
    d = "<h2>" + esc(p.tit) + "</h2><div class='gp-kur'>" + esc(emerDite(p.fil)) + " · " + ora(p.fil) + " – " + ora(p.mb) + " · " + kohezgjatje(p.mb - p.fil) + "</div>";
    d += eT ? T("<span class='gp-etiketa tani'>TANI · mbaron pas ") + kohezgjatje(p.mb - t) + "</span>" : T("<span class='gp-etiketa'>Fillon pas ") + kohezgjatje(p.fil - t) + "</span>";
    if (p.kat) d += "<span class='gp-etiketa'>" + esc(p.kat) + "</span>";
    if (eT) d += "<div class='o-shirit'><i style='width:" + pct.toFixed(0) + "%'></i></div>";
    d += p.per ? "<div class='gp-per'>" + esc(p.per) + "</div>" : "<div class='gp-per bosh'>" + (GP.duke ? T("Duke marrë përshkrimin…") : T("S'ka përshkrim për këtë program.")) + "</div>";
  }
  $("#gp-det").innerHTML = d;
  $("#gp-ndihme").innerHTML = T("▲▼ programet · ◀ ▶ kanali tjetër · OK: shiko kanalin · <i class='ng ng-j'></i>/ Back: mbyll");
}
function tastGuida(k) {
  if (k === K.LART || k === K.POSHTE || k === K.CHUP || k === K.CHDN || k === K.PGUP || k === K.PGDN) {
    var d = k === K.LART ? -1 : k === K.POSHTE ? 1 : (k === K.CHUP || k === K.PGUP) ? -7 : 7;
    GP.i = Math.max(0, Math.min((GP.n || 1) - 1, GP.i + d)); return vizatoGuidenPlote();
  }
  if (k === K.MAJTAS || k === K.DJATHTAS) {
    var l = GP.lista || [], i = l.indexOf(GP.it); if (!l.length) return;
    GP.it = l[(i + (k === K.DJATHTAS ? 1 : -1) + l.length) % l.length]; GP.i = 0; GP.s = 0; GP.duke = false;
    ngarkoGuidenPlote(); return vizatoGuidenPlote();
  }
  if (k === K.OK) {
    var it = GP.it, plote = GP.plote, lista = GP.lista; mbyllGuiden();
    if (plote && ePlote()) { if (it !== S.luan.it) { S.luan.it = it; S.luan.lista = lista; zapKanal(0); } else osdLive(true); return; }
    if (F.ekran === "live" && UI.lKan) { var p = UI.lKan.items.indexOf(it); if (p >= 0) { UI.lKan.i = p; UI.lKan.vizato(); vendosZone("kan"); } infoKanali(it); }
    if (!(S.luan && S.luan.it === it && L.luan())) luajLive(it, lista, false);
    return;
  }
  if (k === K.PRAPA || k === K.JESHIL || k === K.INFO) return mbyllGuiden();
  if (k === K.KUQ || k === K.VERDHE || k === K.BLU) { mbyllGuiden(); return veprimNgjyre(k); }
}
function zgjidhListen() {
  if (S.listat.length) return ngjyraListat();
  dialog(T("Cilën listë do të hapësh?"), S.listat.slice(0, 5).map(function (l, i) {
    return { t: (i === S.aktive ? "✔ " : "") + (l.paneli ? "🔒 " : "") + l.emri, f: function () { S.aktive = i; LS.set("aktive", i); ngarkoListen(); } };
  }));
}
function fshiListen() {
  var l = S.listat[S.aktive]; if (!l) return;
  if (l.paneli) return njofto(T("🔒 Këtë listë e menaxhon administratori"), 3500);
  dialog(T("Ta fshij listën „") + esc(l.emri) + T("“?"), [{ t: T("🗑️ Po, fshije"), f: function () {
    S.listat.splice(S.aktive, 1); S.aktive = 0; LS.set("listat", S.listat); LS.set("aktive", 0);
    if (S.listat.length) ngarkoListen(); else hapForme(-1);
  } }, { t: T("Jo") }]);
}

// ---- FORMA (shto/ndrysho listë)
var FM = { idx: -1, lloji: "xtream", fokus: 0 };
function hapForme(idx) {
  if (idx >= 0 && S.listat[idx] && S.listat[idx].paneli) return njofto(T("🔒 Këtë listë e menaxhon administratori"), 3500);
  FM.idx = idx;
  var l = idx >= 0 ? S.listat[idx] : null;
  FM.lloji = l ? l.lloji : "xtream";
  $("#f-titull").textContent = l ? T("Ndrysho listën") : (S.listat.length ? T("Shto listë të re") : T("Mirë se erdhe! Shto listën e parë"));
  $("#f-emri").value = l ? l.emri : (S.listat.length ? "" : T("Abonimi"));
  $("#f-host").value = l && l.host || ""; $("#f-user").value = l && l.user || ""; $("#f-pass").value = l && l.pass || ""; $("#f-m3u").value = l && l.m3u || "";
  $("#f-epg").value = l && l.epg || "";
  $("#f-gabim").textContent = "";
  $("#f-id").innerHTML = PANELI ? T("📺 ID e këtij TV: <b>") + esc(idPajisjes()) + T("</b> · Çelësi: <b>") + esc(celesiPajisjes()) + "</b>" +
    (S.listat.length ? "" : T("<br><small>Nëse administratori ta dërgon listën, ajo hapet vetë këtu.</small>")) : "";
  $("#fillimi").classList.add("fsh");
  shfaqEkran("forma"); vendosZone("forma");
  FM.fokus = l ? 0 : 2; vizatoForme();
}
function fushatForme() {
  var f = ["emri", "lloji"].concat(FM.lloji === "xtream" ? ["host", "user", "pass"] : ["m3u"]).concat(["epg", "ruaj", "anulo"]);
  if (!S.listat.length && FM.idx < 0) { f.pop(); f.push("gjuha"); }   // lista e parë: pa "Anulo", me 🌐
  return f;
}
function vizatoForme() {
  var f = fushatForme(), z = f[FM.fokus];
  $("#f-lloji").textContent = FM.lloji === "xtream" ? T("◀  Xtream Codes (server + përdorues + fjalëkalim)  ▶") : T("◀  Link M3U  ▶");
  document.querySelectorAll("#m-forma .fusha").forEach(function (el) {
    var k = el.dataset.f;
    el.style.display = (el.classList.contains("x") && FM.lloji !== "xtream") || (el.classList.contains("m") && FM.lloji !== "m3u") ? "none" : "";
    el.classList.toggle("fokus", k === z);
  });
  var bg = $("#m-forma .buton[data-f='gjuha']"); if (bg) bg.textContent = GJ === "en" ? "🌐 Shqip" : "🌐 English";
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
  var l = { emri: $("#f-emri").value.trim() || T("Lista"), lloji: FM.lloji };
  var epg = $("#f-epg").value.trim(); if (epg) l.epg = epg.slice(0, 1000);
  if (FM.lloji === "xtream") {
    var host = $("#f-host").value.trim(), nd = ndajLinkun(host);
    if (nd) { host = nd.host; $("#f-user").value = nd.user; $("#f-pass").value = nd.pass; }
    if (host && !/^https?:\/\//i.test(host)) host = "http://" + host;
    host = host.replace(/\/(player_api\.php|get\.php|c)?\/?(\?.*)?$/i, "").replace(/\/+$/, "");
    l.host = host; l.user = $("#f-user").value.trim(); l.pass = $("#f-pass").value.trim();
    if (!l.host || !l.user || !l.pass) { $("#f-gabim").textContent = T("Plotëso serverin, përdoruesin dhe fjalëkalimin."); return; }
  } else {
    var m = $("#f-m3u").value.trim();
    if (m && !/^https?:\/\//i.test(m)) m = "http://" + m;
    var nd2 = ndajLinkun(m);
    if (nd2 && /get\.php/i.test(m)) { l.lloji = "xtream"; l.host = nd2.host; l.user = nd2.user; l.pass = nd2.pass; njofto(T("Linku u kthye në Xtream (me guidë, filma e seriale)")); }
    else { l.m3u = m; if (!m) { $("#f-gabim").textContent = T("Shkruaj linkun M3U."); return; } }
  }
  $("#f-gabim").textContent = T("Duke u lidhur…");
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
  $("#fillimi").classList.remove("fsh"); $("#fillimi-tekst").textContent = T("Duke ngarkuar „") + l.emri + T("“…");
  $("#lista-emri").textContent = l.emri;
  S.burim = l.lloji === "xtream" ? new Xtream(l.host, l.user, l.pass) : new M3U(l.m3u);
  S.epgC = {}; S.epgP = {}; S.epgTani = null;
  GX.nr++; GX.prog = {}; GX.harta = {}; GX.n = 0; GX.urls = []; GX.duke = false; GX.gjendja = "";
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
    nisGuiden(false);
    S.burim.epgTani().then(function (m) { if (m) { S.epgTani = m; rivizato(); infoKanali(UI.lKan.tani()); } });
  }).catch(function (e) {
    $("#fillimi").classList.add("fsh");
    dialog(T("⚠️ Lista „") + esc(l.emri) + T("“ nuk u ngarkua.<br><small>") + esc(e.message) + "</small>",
      [{ t: T("↻ Provo përsëri"), f: ngarkoListen }, { t: T("⚙️ Ndrysho listën"), f: function () { hapForme(S.aktive); } }]
        .concat(S.listat.length > 1 ? [{ t: T("📋 Listë tjetër"), f: zgjidhListen }] : []));
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
function dialog(tekst, butonat, vertikal) {
  DG = { b: butonat && butonat.length ? butonat : [{ t: "OK" }], i: 0 };
  if (vertikal) $("#dg-butonat").classList.add("vertikal"); else $("#dg-butonat").classList.remove("vertikal");
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
  if (MQ.length) setTimeout(shfaqMesazhet, 400);
}
var njTimer = null;
function njofto(t, ms) { var n = $("#njoftim"); n.textContent = t; n.classList.remove("fsh"); clearTimeout(njTimer); njTimer = setTimeout(function () { n.classList.add("fsh"); }, ms || 2500); }
function oraTani() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
setInterval(function () { $("#ora").textContent = oraTani(); if (!$("#osd").classList.contains("fsh")) $("#o-ora").textContent = oraTani(); if (GP) vizatoGuidenPlote(); }, 15000);
setInterval(function () {   // OSD-ja rifreskohet ndërsa duket
  if ($("#osd").classList.contains("fsh") || !S.luan || kerkimCak != null) return;
  if (S.luan.lloji === "live") osdLive(false); else osdVod(false);
}, 1000);
setInterval(function () { if (S.burim && !document.hidden) S.burim.epgTani().then(function (m) { if (m) { S.epgTani = m; rivizato(); } }); }, 5 * 60000);
setInterval(function () { if (S.burim && !document.hidden && GX.urls.length && !GX.duke && tani() - GX.koha > 6 * 3600) nisGuiden(true); }, 10 * 60000);

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
    if (!it) return njofto(T("S'ka kanal me numrin ") + n);
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
  dialog(T("Të dalësh nga Snow IPTV?"), [{ t: T("Po, dil"), f: function () {
    L.ndalo();
    try { tizen.application.getCurrentApplication().exit(); } catch (e) { njofto(T("(në shfletues s'mund të dalë)")); }
  } }, { t: T("Jo") }]);
}

// OK i mbajtur gjatë = ⭐ (vetëm kur televizori dërgon edhe "keyup")
var OKG = { kaKeyup: false, timer: null, gjate: false };

// ------------------------------------------------------------------ Filmat: renditja (dropdown)
var RV = { hap: false, i: 0 };
var RV_LLOJET = [
  { id: "data", sh: "Më të rejat", t: "📅 Sipas datës (më të rejat)" },
  { id: "alfa", sh: "A–Z", t: "🔤 Sipas alfabetit (A–Z)" },
  { id: "vl", sh: "Vlerësimi", t: "⭐ Sipas vlerësimit" }
];
function renditjaVod() { var m = LS.get("rendit_vod", "data"); return RV_LLOJET.some(function (x) { return x.id === m; }) ? m : "data"; }
function renditVod(l) {
  var m = renditjaVod(), v = l.map(function (x, i) { return { x: x, i: i }; }), f;
  if (m === "alfa") {
    // alfabeti shqip: Ç pas C, Ë pas E (edhe kur pajisja s'ka rregullat e shqipes) – "\uffff" renditet pas çdo shkronje
    v.forEach(function (o) { o.c = String(o.x.emri || "").toLowerCase().replace(/ç/g, "c\uffff").replace(/ë/g, "e\uffff"); });
    var col = null; try { col = new Intl.Collator("sq", { numeric: true, sensitivity: "base" }); } catch (e) {}
    f = col ? function (a, b) { return col.compare(a.c, b.c) || a.i - b.i; }
            : function (a, b) { return a.c < b.c ? -1 : a.c > b.c ? 1 : a.i - b.i; };
  } else if (m === "vl") {
    var nr = function (x) { var n = parseFloat(x.vl); return isNaN(n) ? -1 : n; };
    f = function (a, b) { return nr(b.x) - nr(a.x) || a.i - b.i; };
  } else f = function (a, b) { return (b.x.sh || 0) - (a.x.sh || 0) || a.i - b.i; };   // pa datë (M3U): rendi i listës
  v.sort(f);   // a.i e mban renditjen të qëndrueshme edhe në Chromium të vjetër
  return v.map(function (o) { return o.x; });
}
function ndertoRendit() {
  if ($("#rendit-btn")) return;
  var st = document.createElement("style");
  st.textContent = "#m-vod .rrjete-kol{position:relative}#v-titull{padding-right:330px}" +
    "#rendit-btn{position:absolute;right:20px;top:10px;font-size:22px;padding:8px 18px;border-radius:10px;background:#1e2638;color:#e8ecf4;border:3px solid transparent;white-space:nowrap;cursor:pointer;z-index:6}" +
    "#rendit-btn.fokus{background:#4fc3f7;color:#000;border-color:#fff}" +
    "#rendit-menu{position:absolute;right:20px;top:62px;min-width:400px;background:#121826;border:3px solid #2c3550;border-radius:14px;padding:8px;box-shadow:0 10px 40px #000c;z-index:7}" +
    "#rendit-menu.fsh{display:none}.rm-r{font-size:24px;padding:12px 18px;border-radius:10px;color:#e8ecf4;white-space:nowrap;cursor:pointer;border:3px solid transparent}" +
    ".rm-r.zgjedhur{color:#4fc3f7}.rm-r.fokus{background:#4fc3f7;color:#000;border-color:#fff}";
  document.head.appendChild(st);
  var k = $("#m-vod .rrjete-kol");
  var b = document.createElement("div"); b.id = "rendit-btn"; k.appendChild(b);
  var m = document.createElement("div"); m.id = "rendit-menu"; m.className = "fsh"; k.appendChild(m);
  vizatoRendit();
}
function vizatoRendit() {
  var b = $("#rendit-btn"); if (!b) return;
  var m = renditjaVod(), a = RV_LLOJET.filter(function (x) { return x.id === m; })[0];
  b.textContent = "⇅ " + T("Rendit") + ": " + T(a.sh) + " ▾";
  b.classList.toggle("fokus", F.zona === "vrend" && !RV.hap);
  var mn = $("#rendit-menu");
  mn.innerHTML = RV_LLOJET.map(function (x, i) {
    return "<div class='rm-r" + (x.id === m ? " zgjedhur" : "") + (RV.hap && i === RV.i ? " fokus" : "") + "' data-rv='" + i + "'>" + esc(T(x.t)) + (x.id === m ? " ✓" : "") + "</div>";
  }).join("");
  mn.classList.toggle("fsh", !RV.hap);
}
function hapRendit() { var m = renditjaVod(); RV.i = 0; RV_LLOJET.forEach(function (x, i) { if (x.id === m) RV.i = i; }); RV.hap = true; vizatoRendit(); }
function mbyllRendit() { RV.hap = false; vizatoRendit(); }
function zgjidhRendit(i) {
  var x = RV_LLOJET[i]; if (!x) return;
  RV.hap = false; LS.set("rendit_vod", x.id);
  if (UI.vKat.items.length) zgjidhKatVod("vod", UI.vKat.zgjedhur >= 0 ? UI.vKat.zgjedhur : 0);
  vizatoRendit();
}
function tastRendit(k) {
  if (RV.hap) {
    if (k === K.LART) { RV.i = Math.max(0, RV.i - 1); vizatoRendit(); }
    else if (k === K.POSHTE) { RV.i = Math.min(RV_LLOJET.length - 1, RV.i + 1); vizatoRendit(); }
    else if (k === K.OK) zgjidhRendit(RV.i);
    else if (k === K.PRAPA || k === K.MAJTAS || k === K.DJATHTAS) mbyllRendit();
    return;
  }
  if (k === K.OK) hapRendit();
  else if (k === K.POSHTE) { if (UI.vRr.items.length) vendosZone("vrr"); }
  else if (k === K.LART) vendosZone("tabet");
  else if (k === K.MAJTAS || k === K.PRAPA) vendosZone("vkat");
}

// ------------------------------------------------------------------ tastiera Snow (Android TV pa ekran me prekje)
var TS = null;   // { inp, sht (0/1), shenja (0/1), r, c }
var TS_EMRAT = { auto: "Automatike", snow: "Snow (me shigjeta)", sistemi: "E sistemit" };
function tastieraJone() {
  if (!window.SNOW_ANDROID) return false;
  var m = LS.get("tastiera", "auto");
  if (m === "snow") return true; if (m === "sistemi") return false;
  return !(navigator.maxTouchPoints > 0);   // Android TV: pa ekran me prekje
}
function hapFushen(inp) {   // OK mbi një kuti teksti
  if (!inp) return;
  if (tastieraJone()) return hapTastieren(inp);
  inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {}
}
var TS_SHKRONJA = [["1","2","3","4","5","6","7","8","9","0"], ["q","w","e","r","t","y","u","i","o","p"], ["a","s","d","f","g","h","j","k","l","ë"],
  ["⇧","z","x","c","v","b","n","m","ç","⌫"], ["?123","␣",".","/",":","✔"]];
var TS_SHENJA = [["1","2","3","4","5","6","7","8","9","0"], ["@","#","&","_","-","+","=","%","!","?"], [";",",","'","\"","(",")","*","$","~","|"],
  ["<",">","[","]","{","}","\\","^","`","⌫"], ["abc","␣",".","/",":","✔"]];
var TS_GJERESI = { "?123": 2, "abc": 2, "␣": 3, "✔": 2 };
function tsRreshtat() { return TS.shenja ? TS_SHENJA : TS_SHKRONJA; }
function tsQendra(r, c) { var x = 0, rr = tsRreshtat()[r]; for (var i = 0; i < c; i++) x += TS_GJERESI[rr[i]] || 1; return x + (TS_GJERESI[rr[c]] || 1) / 2; }
function tsEtiketa(t) { return t === "␣" ? "␣" : (TS.sht && t.length === 1 ? t.toUpperCase() : t); }
function hapTastieren(inp) {
  if (!$("#tastiera")) {
    var st = document.createElement("style");
    st.textContent = "#tastiera{position:absolute;left:990px;top:110px;width:884px;padding:16px 20px 12px;background:#121826;border:3px solid #2c3550;border-radius:18px;box-shadow:0 10px 40px #000c;z-index:60;box-sizing:border-box}" +
      "#tastiera.fsh{display:none}#ts-vlera{font-size:28px;background:#0b0f19;border-radius:10px;padding:8px 16px;margin-bottom:10px;min-height:40px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff}" +
      "#ts-etiketa{font-size:18px;color:#8b93a7;margin:0 0 4px 4px}#ts-vlera i{display:inline-block;width:3px;height:30px;background:#4fc3f7;vertical-align:middle;margin-left:2px}" +
      ".ts-r{height:66px;margin-bottom:8px;white-space:nowrap}.ts-t{display:inline-block;vertical-align:top;height:66px;line-height:60px;margin-right:8px;text-align:center;font-size:28px;font-weight:600;" +
      "background:#1e2638;border-radius:10px;color:#e8ecf4;border:3px solid transparent;box-sizing:border-box}.ts-t.fokus{background:#4fc3f7;color:#000;border-color:#fff}" +
      ".ts-t.aktiv{color:#4fc3f7}.ts-t.fokus.aktiv{color:#000}#ts-ndihme{font-size:20px;color:#8b93a7;margin-top:4px;text-align:center}";
    document.head.appendChild(st);
    var d = document.createElement("div"); d.id = "tastiera"; d.className = "fsh"; $("#skena").appendChild(d);
    d.addEventListener("click", function (e) { var b = e.target.closest ? e.target.closest("[data-ts]") : null; if (!b || !TS) return; var p = b.getAttribute("data-ts").split(","); TS.r = +p[0]; TS.c = +p[1]; tsShtyp(); });
  }
  var a = document.activeElement; if (a && a.tagName === "INPUT") a.blur();
  TS = { inp: inp, sht: 0, shenja: 0, r: 1, c: 0 };
  var tsd = $("#tastiera"); tsd.style.left = inp.id === "k-input" ? "990px" : "518px"; tsd.style.top = inp.id === "k-input" ? "110px" : "500px";
  tsd.classList.remove("fsh"); vizatoTastieren();
}
function vizatoTastieren() {
  if (!TS) return;
  var fu = TS.inp.closest ? TS.inp.closest(".fusha") : null, lb = fu && fu.querySelector("label");
  var rr = tsRreshtat(), h = (lb ? '<div id="ts-etiketa">' + esc(lb.textContent) + "</div>" : "") + '<div id="ts-vlera">' + esc(TS.inp.value) + "<i></i></div>", nj = 84;   // 1 njësi = 84px (76 + 8)
  for (var r = 0; r < rr.length; r++) {
    h += '<div class="ts-r">';
    for (var c = 0; c < rr[r].length; c++) {
      var t = rr[r][c], w = (TS_GJERESI[t] || 1) * nj - 8;
      h += '<div class="ts-t' + (r === TS.r && c === TS.c ? " fokus" : "") + (t === "⇧" && TS.sht ? " aktiv" : "") + '" data-ts="' + r + "," + c + '" style="width:' + w + 'px">' + esc(tsEtiketa(t)) + "</div>";
    }
    h += "</div>";
  }
  $("#tastiera").innerHTML = h + '<div id="ts-ndihme">' + T("▲▼◀▶ zgjidh · OK shkruaj · Back mbyll") + "</div>";
}
function tsNdrysho(v) {
  TS.inp.value = v;
  try { TS.inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) { try { var ev = document.createEvent("Event"); ev.initEvent("input", true, true); TS.inp.dispatchEvent(ev); } catch (e2) {} }
}
function tsShtyp() {
  var t = tsRreshtat()[TS.r][TS.c], v = TS.inp.value;
  if (t === "⌫") tsNdrysho(v.slice(0, -1));
  else if (t === "⇧") TS.sht = TS.sht ? 0 : 1;
  else if (t === "?123" || t === "abc") { TS.shenja = TS.shenja ? 0 : 1; TS.c = Math.min(TS.c, tsRreshtat()[TS.r].length - 1); }
  else if (t === "✔") return mbyllTastieren(true);
  else tsNdrysho(v + (t === "␣" ? " " : tsEtiketa(t)));
  vizatoTastieren();
}
function mbyllTastieren(perfundo) {
  if (!TS) return;
  var inp = TS.inp; TS = null; $("#tastiera").classList.add("fsh");
  if (inp.id === "k-input") { kerko(inp.value); if (perfundo && UI.kLista.items.length) vendosZone("klista"); }
  else if (F.ekran === "forma") { if (perfundo) FM.fokus = Math.min(FM.fokus + 1, fushatForme().length - 1); vizatoForme(); }
}
function tastTastiere(k) {
  var rr = tsRreshtat();
  if (k === K.MAJTAS) TS.c = TS.c > 0 ? TS.c - 1 : rr[TS.r].length - 1;
  else if (k === K.DJATHTAS) TS.c = TS.c < rr[TS.r].length - 1 ? TS.c + 1 : 0;
  else if (k === K.LART || k === K.POSHTE) {
    var r2 = TS.r + (k === K.LART ? -1 : 1); if (r2 < 0 || r2 >= rr.length) return;
    var x = tsQendra(TS.r, TS.c), mir = 0, dist = 1e9;
    for (var c = 0; c < rr[r2].length; c++) { var d = Math.abs(tsQendra(r2, c) - x); if (d < dist - 0.01) { dist = d; mir = c; } }
    TS.r = r2; TS.c = mir;
  }
  else if (k === K.OK) return tsShtyp();
  else if (k >= 48 && k <= 57) { tsNdrysho(TS.inp.value + String(k - 48)); }
  else if (k === K.PRAPA || k === K.CANCEL) return mbyllTastieren(false);
  else if (k === K.DONE) return mbyllTastieren(true);
  else return;
  vizatoTastieren();
}

function tasti(e) {
  var k = e.keyCode;
  if (!NE_TV) {   // prova në shfletues me tastierë
    if (k === 27 || (k === 8 && document.activeElement.tagName !== "INPUT")) k = K.PRAPA;
    else if (k === 32 && document.activeElement.tagName !== "INPUT") k = K.PP;
    else if ((k === 70 || k === 89) && document.activeElement.tagName !== "INPUT") k = K.VERDHE;
    else if (k === 82 && document.activeElement.tagName !== "INPUT") k = K.KUQ;
    else if (k === 71 && document.activeElement.tagName !== "INPUT") k = K.JESHIL;
    else if (k === 66 && document.activeElement.tagName !== "INPUT") k = K.BLU;
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
  if (TS) { tastTastiere(k); return; }
  if (TK) { if (!e.repeat || k !== K.OK) tastTest(k); return; }
  if (GP && !DG) { if (!e.repeat || k !== K.OK) tastGuida(k); return; }
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
  if (GP || TK) return false;
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
  if (k === K.KUQ || k === K.JESHIL || k === K.VERDHE || k === K.BLU) return veprimNgjyre(k);
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
  if (!ser && F.zona === "vrend") return tastRendit(k);
  if (F.zona === zk) {
    if (k === K.LART) { if (!lk.leviz(-1)) vendosZone("tabet"); }
    else if (k === K.POSHTE) lk.leviz(1);
    else if (k === K.OK || k === K.DJATHTAS) { zgjidhKatVod(lloji, lk.i); if (rr.items.length) vendosZone(zr); }
    else if (k === K.PRAPA) dilNgaApp();
  } else {
    if (k === K.LART) { if (!rr.leviz(-rr.kol)) vendosZone(ser ? "tabet" : "vrend"); }
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
    if (k === K.OK) { hapFushen($("#k-input")); }
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
  if (k === K.LART) FM.fokus = Math.max(0, (z === "ruaj" || z === "anulo" || z === "gjuha" ? f.indexOf("ruaj") : FM.fokus) - 1);
  else if (k === K.POSHTE) { if (z !== "ruaj" && z !== "anulo" && z !== "gjuha") FM.fokus = Math.min(f.indexOf("ruaj"), FM.fokus + 1); }
  else if (k === K.MAJTAS || k === K.DJATHTAS) {
    if (z === "lloji") FM.lloji = FM.lloji === "xtream" ? "m3u" : "xtream";
    else if (z === "ruaj" && k === K.DJATHTAS && f.indexOf("anulo") >= 0) FM.fokus = f.indexOf("anulo");
    else if (z === "ruaj" && k === K.DJATHTAS && f.indexOf("gjuha") >= 0) FM.fokus = f.indexOf("gjuha");
    else if ((z === "anulo" || z === "gjuha") && k === K.MAJTAS) FM.fokus = f.indexOf("ruaj");
  }
  else if (k === K.OK) {
    if (z === "lloji") FM.lloji = FM.lloji === "xtream" ? "m3u" : "xtream";
    else if (z === "ruaj") return ruajForme();
    else if (z === "anulo") return mbyllForme();
    else if (z === "gjuha") return ndryshoGjuhen();
    else hapFushen($("#f-" + z));
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
    else if (k === K.DJATHTAS) { ndryshoFiguren(); osdLive(true); }
    else if (k === K.INFO) { if ($("#osd").classList.contains("fsh")) osdLive(true); else $("#osd").classList.add("fsh"); }
    else if (k === K.PRAPA) dilPlote();
    else if (k === K.STOP) { L.ndalo(); S.luan = null; dilPlote(); }
    else if (k === K.PP || k === K.PAUZE || k === K.PLAY) { L.ndrysho(); njofto(L.pauze ? T("⏸ Pauzë") : T("▶ Vazhdon")); }
    else if (!$("#gabimV").classList.contains("fsh") && k === K.OK) zapKanal(0);
  } else {
    if (k === K.OK || k === K.PP || k === K.PLAY || k === K.PAUZE) { L.ndrysho(); osdVod(true); }
    else if (k === K.MAJTAS) kerkoVod(-10000);
    else if (k === K.DJATHTAS) kerkoVod(10000);
    else if (k === K.RW) kerkoVod(-60000);
    else if (k === K.FF) kerkoVod(60000);
    else if (k === K.POSHTE) { ndryshoFiguren(); osdVod(true); }
    else if (k === K.LART || k === K.INFO) osdVod(true);
    else if (k === K.PRAPA || k === K.STOP) dilPlote();
  }
}

// ------------------------------------------------------------------ nisja
function shkallezo() {
  var W = window.innerWidth, H = window.innerHeight, s = Math.min(W / 1920, H / 1080), sk = $("#skena");
  sk.style.transform = "scale(" + s + ")";
  sk.style.left = Math.max(0, Math.round((W - 1920 * s) / 2)) + "px";   // në ekrane më të gjera (telefon) ekrani rri në mes
  sk.style.top = Math.max(0, Math.round((H - 1080 * s) / 2)) + "px";
}

// ------------------------------------------------------------------ prekja (telefon / tablet). Në TV s'ka asnjë efekt.
// Prekje = zgjidh + OK (si telekomanda) · prekje e gjatë = ⭐ · gishti lart/poshtë = lëviz listën
// Ekran i plotë: prekje = info (filma: info, pastaj pauzë) · ▲▼ me gisht = kanal tjetër · ◀ = lista e shpejtë · ▶ = figura
var PR = { aktiv: false, x0: 0, y0: 0, x: 0, y: 0, cak: null, lp: null, hapa: 0, timerGjate: null, gjate: false, levizi: false, fling: null, hist: [] };
function shkallaSkenes() { var r = $("#skena").getBoundingClientRect(); return r.width / 1920 || 1; }
function ePlote() { return document.body.classList.contains("plote"); }
function listaPrekjes(el) {
  var harta = { "l-kat": "kat", "l-kan": "kan", "v-kat": "vkat", "v-rrjet": "vrr", "s-kat": "skat", "s-rrjet": "srr", "d-sez": "sez", "d-ep": "ep", "k-lista": "klista", "c-lista": "clista", "z-lista": "zap" };
  var obj = { kat: UI.lKat, kan: UI.lKan, vkat: UI.vKat, vrr: UI.vRr, skat: UI.sKat, srr: UI.sRr, sez: UI.dSez, ep: UI.dEp, klista: UI.kLista, clista: UI.cLista, zap: UI.zLista };
  for (var e = el; e && e !== document.body && e.nodeType === 1; e = e.parentNode) if (e.id && harta[e.id] && obj[harta[e.id]]) return { zona: harta[e.id], l: obj[harta[e.id]], el: e };
  return null;
}
function indeksiPrekjes(lp, cak) {
  var l = lp.l;
  for (var e = cak; e && e !== lp.el; e = e.parentNode) {
    if (e.parentNode === l.inner) {
      if (!l.items.length) return -1;
      var i = (l.kol ? l.top * l.kol : l.top) + Array.prototype.indexOf.call(l.inner.children, e);
      return i >= 0 && i < l.items.length ? i : -1;
    }
  }
  return -1;
}
Lista.prototype.rrotullo = function (d) {   // lëviz faqen me gisht; zgjedhja ndjek faqen vetëm kur del jashtë saj
  var v = this.dukshme(), kol = this.kol || 1, n = Math.ceil(this.items.length / kol);
  var top = Math.max(0, Math.min(this.top + d, Math.max(0, n - v)));
  if (top === this.top) return false;
  this.top = top;
  var rr = Math.floor(this.i / kol), i0 = this.i;
  if (rr < top) this.i = Math.min(this.items.length - 1, top * kol + this.i % kol);
  else if (rr >= top + v) this.i = Math.min(this.items.length - 1, (top + v - 1) * kol + this.i % kol);
  this.vizato();
  if (this.i !== i0) this.onFocus(this.tani(), this.i);
  return true;
};
function listaLevizet() { return PR.lp && (!ePlote() || PR.lp.zona === "zap"); }
// Kur lista rivizatohet, rreshti nën gisht zëvendësohet dhe shfletuesi vazhdon t'i dërgojë lëvizjet
// te elementi i hequr (që s'arrijnë më te document). Prandaj i dëgjojmë edhe te vetë elementi i prekur.
var PR_CAK = null;
function prDegjo(el) {
  if (PR_CAK === el) return;
  prHiq();
  if (!el || !el.addEventListener) return;
  PR_CAK = el;
  el.addEventListener("touchmove", prCakLeviz, { passive: false });
  el.addEventListener("touchend", prCakMbaron, { passive: false });
  el.addEventListener("touchcancel", prCakAnulo, { passive: true });
}
function prHiq() {
  if (!PR_CAK) return;
  PR_CAK.removeEventListener("touchmove", prCakLeviz, { passive: false });
  PR_CAK.removeEventListener("touchend", prCakMbaron, { passive: false });
  PR_CAK.removeEventListener("touchcancel", prCakAnulo, { passive: true });
  PR_CAK = null;
}
function prCakLeviz(e) { e.__snow = 1; prekjaLeviz(e); }
function prCakMbaron(e) { e.__snow = 1; prekjaMbaron(e); prHiq(); }
function prCakAnulo(e) { e.__snow = 1; prekjaAnulohet(); prHiq(); }
function prekjaAnulohet() { PR.aktiv = false; clearTimeout(PR.timerGjate); }
function prekjaFillon(e) {
  if (e.touches && e.touches.length === 1) prDegjo(e.target);
  if (!e.touches || e.touches.length !== 1) { PR.aktiv = false; clearTimeout(PR.timerGjate); return; }
  var t = e.touches[0];
  clearInterval(PR.fling); PR.fling = null;
  PR.aktiv = true; PR.x0 = PR.x = t.clientX; PR.y0 = PR.y = t.clientY; PR.cak = e.target; PR.levizi = false; PR.gjate = false; PR.hapa = 0;
  PR.hist = [[Date.now(), PR.y]];
  PR.lp = DG ? null : listaPrekjes(e.target);
  clearTimeout(PR.timerGjate);
  PR.timerGjate = setTimeout(function () { if (PR.aktiv && !PR.levizi) { PR.gjate = true; prekjeGjate(); } }, 650);
}
function prekjaLeviz(e) {
  if (e.__snowU) return; e.__snowU = 1;   // e trajtuar një herë (te elementi ose te document)
  if (!PR.aktiv || !e.touches || !e.touches.length) return;
  var t = e.touches[0]; PR.x = t.clientX; PR.y = t.clientY;
  var dx = PR.x - PR.x0, dy = PR.y - PR.y0;
  if (!PR.levizi && Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
  if (!PR.levizi) { PR.levizi = true; clearTimeout(PR.timerGjate); }
  PR.hist.push([Date.now(), PR.y]); if (PR.hist.length > 6) PR.hist.shift();
  if (listaLevizet()) {
    var hapa = Math.trunc(-dy / (PR.lp.l.h * shkallaSkenes()));   // gishti lart → më poshtë në listë
    if (hapa !== PR.hapa) { PR.lp.l.rrotullo(hapa - PR.hapa); PR.hapa = hapa; }
  }
  if (e.cancelable) e.preventDefault();
}
function prekjaMbaron(e) {
  if (e.__snowU) return; e.__snowU = 1;
  if (!PR.aktiv) return;
  PR.aktiv = false; clearTimeout(PR.timerGjate);
  var cak = PR.cak, input = !!(cak && (cak.tagName === "INPUT" || cak.tagName === "TEXTAREA"));
  if (PR.gjate) { if (e.cancelable) e.preventDefault(); return; }
  if (PR.levizi) {
    if (listaLevizet()) flingu(); else if (ePlote()) rreshqitjePlote(PR.x - PR.x0, PR.y - PR.y0);
    if (e.cancelable) e.preventDefault();
    return;
  }
  if (input) { prekInput(cak); return; }   // tastiera hapet vetë
  if (e.cancelable) e.preventDefault();
  var a = document.activeElement; if (a && a.tagName === "INPUT") a.blur();
  try { prekje(cak); } catch (x) { if (window.console) console.error(x); }
}
function flingu() {
  var h = PR.hist; if (h.length < 2) return;
  var a = h[0], b = h[h.length - 1], dt = b[0] - a[0];
  if (dt <= 0 || Date.now() - b[0] > 120) return;   // gishti ndaloi para se ta lëshonte
  var v = (b[1] - a[1]) / dt; if (Math.abs(v) < 0.5) return;
  var l = PR.lp.l, shpejt = -v * 16 / (l.h * shkallaSkenes()), mbetja = 0;
  PR.fling = setInterval(function () {
    mbetja += shpejt; var n = Math.trunc(mbetja);
    if (n) { mbetja -= n; if (!l.rrotullo(n)) { clearInterval(PR.fling); PR.fling = null; return; } }
    shpejt *= 0.94; if (Math.abs(shpejt) < 0.05) { clearInterval(PR.fling); PR.fling = null; }
  }, 16);
}
function zgjidhNePrekje(lp, j) {
  if (F.zona !== lp.zona) vendosZone(lp.zona);
  var l = lp.l, ndryshoi = l.i !== j;
  l.i = j; l.vizato();
  if (ndryshoi) l.onFocus(l.tani(), j);
}
function prekje(cak) {
  if (!cak || !cak.closest) return;
  if (TS) { var tb = cak.closest("[data-ts]"); if (tb) { var tp = tb.getAttribute("data-ts").split(","); TS.r = +tp[0]; TS.c = +tp[1]; tsShtyp(); } return; }
  if (DG) {   // butonat e dialogut
    var b = cak.closest("#dg-butonat .buton");
    if (b) { var bi = Array.prototype.indexOf.call(b.parentNode.children, b); DG.i = bi; vizatoDialog(); mbyllDialog(bi); }
    return;
  }
  if (ePlote()) {
    if (!$("#zap").classList.contains("fsh")) {   // lista e shpejtë mbi video
      var lz = listaPrekjes(cak);
      if (lz && lz.zona === "zap") { var zi = indeksiPrekjes(lz, cak); if (zi >= 0) { UI.zLista.i = zi; UI.zLista.vizato(); veprim(K.OK); } }
      else veprim(K.PRAPA);
      return;
    }
    if (S.luan && S.luan.lloji === "live") veprim(K.INFO);
    else veprim($("#osd").classList.contains("fsh") ? K.INFO : K.OK);
    return;
  }
  var tab = cak.closest(".tab");
  if (tab) {
    if (F.ekran === "forma" || !S.burim) return;
    var ti = TABET.indexOf(tab.dataset.t); if (ti < 0) return;
    F.tab = ti; kaloTab(); tastTabet(K.OK);
    return;
  }
  if (F.ekran === "forma") {
    var fu = cak.closest("#m-forma .fusha, #m-forma .buton");
    if (fu) { var fi = fushatForme().indexOf(fu.dataset.f); if (fi >= 0) { FM.fokus = fi; vizatoForme(); tastForme(K.OK); } }
    return;
  }
  if (cak.closest("#kutia")) {   // kutia e vogël: si OK i dytë → ekran i plotë
    if (F.ekran === "live" && S.luan && S.luan.lloji === "live" && L.luan()) hyrPlote();
    return;
  }
  var rvr = cak.closest(".rm-r");
  if (rvr) { zgjidhRendit(+rvr.getAttribute("data-rv")); vendosZone("vrend"); return; }
  if (cak.closest("#rendit-btn")) { vendosZone("vrend"); if (RV.hap) mbyllRendit(); else hapRendit(); return; }
  if (cak.closest("#k-input")) { vendosZone("kinput"); return; }
  var lp = listaPrekjes(cak);
  if (lp && lp.zona !== "zap") {
    var j = indeksiPrekjes(lp, cak); if (j < 0) return;
    zgjidhNePrekje(lp, j);
    veprim(K.OK);
  }
}
function prekjeGjate() {
  if (DG) return;
  if (ePlote()) { if ($("#zap").classList.contains("fsh") && okGjateLejohet()) veprimGjate(); return; }
  var lp = PR.lp; if (!lp || lp.zona === "zap") return;
  var j = indeksiPrekjes(lp, PR.cak); if (j < 0) return;
  zgjidhNePrekje(lp, j);
  if (okGjateLejohet()) { veprimGjate(); try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {} }
}
function prekInput(inp) {
  if (inp.id === "k-input") { vendosZone("kinput"); return; }
  if (F.ekran === "forma" && inp.closest) {
    var fu = inp.closest(".fusha"); if (!fu) return;
    var fi = fushatForme().indexOf(fu.dataset.f); if (fi >= 0) { FM.fokus = fi; vizatoForme(); }
  }
}
function rreshqitjePlote(dx, dy) {
  var ax = Math.abs(dx), ay = Math.abs(dy);
  if ((ax < 50 && ay < 50) || !$("#zap").classList.contains("fsh")) return;
  if (ay > ax) veprim(dy < 0 ? K.LART : K.POSHTE);   // live: kanali tjetër / i mëparshmi · film: info / figura
  else veprim(dx < 0 ? K.MAJTAS : K.DJATHTAS);        // live: lista e shpejtë / figura · film: −10 s / +10 s
}
function nis() {
  perktheDOM(); dergoGjuhen();
  if (window.SNOW_ANDROID) {   // Android: videoja (ExoPlayer) luan poshtë faqes; <object> i Samsung-ut zëvendësohet me div bosh
    var avO = $("#av");
    if (avO && avO.tagName === "OBJECT") { var avD = document.createElement("div"); avD.id = "av"; avO.parentNode.replaceChild(avD, avO); }
  }
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
  UI.kLista = new Lista($("#k-lista"), { h: 76, render: rreshtThjeshte, bosh: T("Shkruaj diçka për të kërkuar.") });
  UI.cLista = new Lista($("#c-lista"), { h: 76, render: rreshtThjeshte });
  UI.zLista = new Lista($("#z-lista"), { h: 76, render: rreshtKanal });
  document.addEventListener("keydown", tasti);
  document.addEventListener("keyup", tastiLart);
  document.addEventListener("touchstart", prekjaFillon, { passive: true });
  document.addEventListener("touchmove", prekjaLeviz, { passive: false });
  document.addEventListener("touchend", prekjaMbaron, { passive: false });
  document.addEventListener("touchcancel", function () { prekjaAnulohet(); prHiq(); }, { passive: true });
  $("#k-input").addEventListener("input", function () { clearTimeout(kerkimTimer2); kerkimTimer2 = setTimeout(function () { kerko($("#k-input").value); }, 400); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && window.MI_PERDITESIM_GATI && window.MI_PERDITESIM_GATI()) {   // u shkarkua version i ri ndërsa ishe jashtë
      location.reload(); return;
    }
    if (!document.hidden) setTimeout(pyetPanelin, 1500);
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
  if (S.listat.length) ngarkoListen(); else { hapForme(-1); if (LS.get("gjuha", null) === null) setTimeout(zgjidhGjuhenFillim, 400); }
  setTimeout(pyetPanelin, 1500);
  setInterval(function () { if (!document.hidden) pyetPanelin(); }, 5 * 60000);
  setInterval(function () { if (!document.hidden && !S.listat.length && F.ekran === "forma") pyetPanelin(); }, 20000);   // TV i ri: pret listën nga administratori
  var m = window.MI_GATI ? window.MI_GATI() : null;   // ngarkuesit: "u hap pa gabime"
  if (m) setTimeout(function () { njofto(perktheNgarkuesin(m), 7000); }, 2500);
}
function versioniKeq() { try { return localStorage.getItem("mi_kodi_keq") || ""; } catch (e) { return ""; } }
function kontrolloPerditesim() {
  if (!window.MI_KONTROLLO) return njofto(T("Përditësimet s'janë aktive në këtë version"));
  try { localStorage.removeItem("mi_kodi_keq"); } catch (e) {}   // provo përsëri edhe versionin që s'u hap herën e kaluar
  njofto(T("Duke kontrolluar në GitHub…"), 10000);
  window.MI_KONTROLLO(function (ok, info) {
    if (ok) dialog(T("⬇️ U shkarkua versioni i ri <b>") + esc(info) + T("</b>.<br>Ta hap tani?"), [{ t: T("Po, rihape"), f: function () { L.ndalo(); location.reload(); } }, { t: T("Më vonë") }]);
    else njofto("ℹ️ " + perktheNgarkuesin(info), 4000);
  });
}
var kerkimTimer2 = null;
if (document.readyState === "complete") nis(); else window.addEventListener("load", nis);
