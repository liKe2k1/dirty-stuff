// ==UserScript==
// @name         USMS - Hafterfassungstweak
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Überträgt automatisch die Häftlingsdaten aus der Hafttabelle in die Erfassung
// @author       USMS-30 / Jil Brown
// @grant        unsafeWindow
// @match        https://docs.google.com/*
// @match        https://akte.dirty-gaming.com/*
// @match        https://*.googleusercontent.com/*
// @run-at       document-end
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
// @require      http://userscripts-mirror.org/scripts/source/107941.user.js
// @downloadURL  https://raw.githubusercontent.com/liKe2k1/dirty-stuff/main/usms-hafterfassung-tweak.user.js
// @updateURL    https://raw.githubusercontent.com/liKe2k1/dirty-stuff/main/usms-hafterfassung-tweak.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    if (location.href == 'https://akte.dirty-gaming.com/hafttabelle') {
        fetchInmates();
    }

    if (location.href.includes('googleusercontent')) {
        if ( $(document).find('iframe').attr('id') == 'userHtmlFrame') {
            $(document).find('iframe').bind("load", function() {
                var iframeElement = $(document).find('iframe').contents();

                let inmatesLoaded = JSON.parse(GM_getValue("inmates"));
                let tpl = '';
                $(inmatesLoaded).each(function(key, item) {
                    tpl += '<a href="#" class="inmate-list-link ' + (item.sleeping ? 'sleeping':'awake') + '" data-id="' + item.userId + '">' + item.name + ' [' +  item.userId + ']</a>';
                });
                iframeElement.find('#tampermonkey-inmates').html(tpl);
                iframeElement.find('#tampermonkey-inmates').show();

                iframeElement.find('.inmate-list-link').click(function(e) {
                    fillUser($(this).attr('data-id'));
                    e.preventDefault();
                });

                iframeElement.find('#inmate-id').blur(function() {
                    let searchId = $(this).val();
                    fillUser(searchId);
                });
            });
        }
    }
})();


function fillUser(userId) {
    let inmatesLoaded = JSON.parse(GM_getValue("inmates"));
    $(inmatesLoaded).each(function(key, item) {
        if (item.userId == userId) {
            $(document).find('iframe').contents().find('#inmate-id').val(item.userId.trim());
            $(document).find('iframe').contents().find('#name').val(item.name.trim());
            $(document).find('iframe').contents().find('#caseno').val(item.caseNo.trim());
            $(document).find('iframe').contents().find('#detention').val(item.detentionTime.trim());
        }
    });
}

function parseTable(type)
{
    let inmates = [];
    if( $("#" + type).length ) {
        $("#" + type + ">table>tbody>tr").each(function(rowIdx, rows) {
            let inmate = {};
            $(rows).find('td').each(function(key, item) {
                inmate['sleeping'] = (type == 'wach' ? false : true);
                if (key == 0) {
                    const regexIdName = /\=".*\">([0-9]+)\s(.+)<\//gm;
                    let m;
                    while ((m = regexIdName.exec( $(item).html() )) !== null) {
                        if (m.index === regexIdName.lastIndex) {
                            regexIdName.lastIndex++;
                        }
                        inmate['userId'] = m[1];
                        inmate['name'] = m[2];
                    }
                }
                if (key == 1) inmate['created'] = $(item).html();
                if (key == 2) inmate['caseNo'] = $(item).html();
                if (key == 6) {
                    const regexIdName = /.*ort.*value="(.+)"/gm;
                    let m;
                    while ((m = regexIdName.exec( $(item).html() )) !== null) {
                        if (m.index === regexIdName.lastIndex) {
                            regexIdName.lastIndex++;
                        }
                        inmate['location'] = m[1];
                    }
                }
                if (key == 7) inmate['detentionTime'] = $(item).html().replace(/\n/g, "");
            });
            inmates.push(inmate);
        });
    }
    return inmates;
}

function fetchInmates()
{
    let inmatesAwake = parseTable('wach')
    let inmates = inmatesAwake.concat(parseTable('schlafend'))
    GM_setValue("inmates", JSON.stringify(inmates));
}
