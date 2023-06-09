// ==UserScript==
// @name         Dirty-Gaming Akte -> UserID in Akte
// @version      1.0
// @author       USMS-30 / Jil Brown
// @icon         https://akte.dirty-gaming.com/img/favicon.png
// @match        https://akte.dirty-gaming.com/buerger/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
// @updateURL  https://raw.githubusercontent.com/liKe2k1/dirty-stuff/main/akte-show-user-id.user.js
// @downloadURL  https://raw.githubusercontent.com/liKe2k1/dirty-stuff/main/akte-show-user-id.user.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var url = location.href;
    var userId = url.substring(url.lastIndexOf("/")+1)
    let idContent = '<tr><td class="px-0 py-2"><i class="fas fa-id-badge"></i></td><td class="pl-1 py-2">ID</td><td class="py-2">' + userId + '</td></tr>'
    $('#pageBuergerakte').find('h2').append(' [' + userId + ']');
    $('#buergerakteUebersicht').find('table').find('tbody').prepend(idContent);
})();
