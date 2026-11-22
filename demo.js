// Demo mode for the 2024 Hero's Diary (old.herosdiary.com).
// The 2024 server is gone. This file replaces window.fetch for every call to the old API
// and answers from demo-data.js, in the shapes the 2024 server sent ({rearrange: ...}).
// Nothing is sent anywhere and nothing is stored: new entries live in memory until the page is left.
// Load order on every page: domain.js, demo-data.js, demo.js, then the page's own scripts.
(function () {
    'use strict';

    var UNAVAILABLE = 'Not available in the demo.';
    var DEMO_BASE = (typeof DOMAIN === 'string' && DOMAIN) ? DOMAIN : 'https://demo.invalid';
    // Also catch the old API host, in case a stale copy of domain.js is ever served.
    var API_BASES = [DEMO_BASE, 'https://demo.invalid', 'https://api.herosdiary.com', 'http://api.herosdiary.com'];

    var src = window.DEMO_DATA || { user: {}, entries: [], trackers: [], prompts: [], settings: {}, reports: {} };
    function clone(x) { return JSON.parse(JSON.stringify(x)); }

    // ---- State for this visit only ----
    var entries = (src.entries || []).map(function (e) {
        return { time: new Date(e.time), type: e.type, html: e.text, ai: e.ai || '' };
    });
    var trackers = clone(src.trackers || []);
    var settings = clone(src.settings || {});
    var user = src.user || {};

    // ---- Helpers ----
    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'];
    function pad(n) { return String(n).padStart(2, '0'); }
    // Same format as the 2024 server: "%A, %B %d, %Y %H:%M:%S".
    function formatTime(d) {
        return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + pad(d.getDate()) + ', ' + d.getFullYear() +
            ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }
    function localDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function setting(type, key, fallback) {
        var s = settings[type] && settings[type][key];
        return s && s.value !== undefined ? s.value : fallback;
    }

    // Which "Message filter" checkbox controls which message type.
    var FILTER_FOR_TYPE = {
        'user text': 'row-notes',
        'user habit tracker': 'row-notes',
        'ai summary week': 'week-summaries',
        'ai summary month': 'month-summaries',
        'other': 'other-ai-reports',
        'gamified': 'batches-rewards',
        'conversation': 'conversations',
        'feedback': 'feedback'
    };

    // Same layout as messages_to_instructions() in the 2024 server (one row for the entry, one for the AI reply).
    function toMessages(list) {
        var messages = [];
        var types = [];
        list.forEach(function (m) {
            var text = '<b>' + formatTime(m.time) + ' -- ' + m.type + ' </b><br>' + m.html;
            if (m.type.toLowerCase() !== 'user text') {
                text = '<span style="color: darkblue;">' + text + '</span>';
            }
            messages.push(text);
            types.push(m.type);
            if (m.ai) {
                messages.push("<span style='color: #006400;'><i>ai: " + escapeHtml(m.ai).replace(/\n/g, '<br>') + '</i></span>');
                types.push(m.type);
            }
        });
        return { show_messages: messages, show_messages_types: types };
    }

    function sorted() {
        return entries.slice().sort(function (a, b) { return a.time - b.time; });
    }

    function recentMessages(r, searchOptions) {
        var opts = searchOptions || {};
        var n = parseInt(setting('numeric', 'displayed_messages', 10), 10);
        if (!(n > 0)) n = 10;
        var list = sorted().filter(function (m) {
            var box = FILTER_FOR_TYPE[m.type.toLowerCase()];
            return !(box && opts[box] === false);
        });
        var out = toMessages(list.slice(-n));
        r.show_messages = out.show_messages;
        r.show_messages_types = out.show_messages_types;
        return r;
    }

    function addTo(r, key, items) {
        r[key] = (r[key] || []).concat(items);
        return r;
    }

    // rearrange_go_login() of the 2024 server.
    function goLogin() {
        return {
            panels: {
                'video': 0, 'message_viewer': 0, 'search_options': 0, 'entry_box': 2,
                'habit_goal_tracker': 0, 'settings': 0, 'membership': 0, 'about': 0,
                'feedback_customer_care': 0, 'account': 0, 'edit_habit_goal_tracker': 0,
                'customReports': 0, 'log_in': 2, 'register': 1, 'introduction': 2
            },
            hide_elements: ['entry_box_question', 'entry_box_send_button', 'logout_button'],
            attention_elements: ['introduction', 'login_email_row', 'entry_box_textarea']
        };
    }

    // look_message() of the 2024 server.
    function lookMessage(r) {
        r.panels = Object.assign(r.panels || {}, {
            'log_in': 0, 'register': 0, 'message_viewer': 2, 'search_options': 0, 'entry_box': 2,
            'habit_goal_tracker': 2, 'edit_habit_goal_tracker': 1, 'settings': 1, 'membership': 0,
            'about': 1, 'feedback_customer_care': 1, 'customReports': (user.complexity || 0) > 20 ? 1 : 0,
            'account': 0, 'introduction': 0
        });
        addTo(r, 'hide_elements', ['footerSection', 'header', 'settings_discard_button', 'settings_reset_button']);
        addTo(r, 'show_elements', ['entry_box_send_button', 'logout_button', 'entry_box_question']);
        addTo(r, 'attention_elements', ['entry_box_send_button', 'entry_box_textarea']);
        return r;
    }

    // rearrenge_refresh_habits() of the 2024 server.
    function refreshHabits(r) {
        var checks = trackers.filter(function (t) { return t.Type === 'bool' && !t.today; });
        var texts = trackers.filter(function (t) { return t.Type === 'text' && !t.today; });
        r.habit_checks = checks;
        r.text_habit = texts;
        r.habit_answer = trackers.filter(function (t) { return t.today; });
        addTo(r, checks.length ? 'show_elements' : 'hide_elements', ['Tracker_list', 'daily_tracker']);
        if (!checks.length && !texts.length) {
            r.panels = r.panels || {};
            r.panels.habit_goal_tracker = 0;
        }
        return r;
    }

    // rearrenge_refresh_prompts() of the 2024 server.
    function refreshPrompts(r) {
        var show = setting('binary', 'show_prompts', true);
        if (show) {
            r.prompts = (src.prompts || []).slice();
            addTo(r, 'show_elements', ['entry_box_question']);
        } else {
            r.prompts = ['Prompt: how was your day?', 'Prompt: write about anything important to you'];
            r.show_elements = (r.show_elements || []).filter(function (id) { return id !== 'entry_box_question'; });
            addTo(r, 'hide_elements', ['entry_box_question']);
        }
        return r;
    }

    function trackerList(r) {
        r.Trackers = trackers;
        return r;
    }

    // hide_complex_settings() of the 2024 server.
    function settingsView() {
        var s = clone(settings);
        s.no_change = {
            'Available features': (user.complexity || 0) + '%',
            'DateOfBirth': user.dob || '',
            'Gender': user.gender || '',
            'Email': user.email || ''
        };
        return s;
    }

    // Marks a text tracker as done when an entry mentions its key word (the 2024 server asked the AI).
    function markTrackersFromText(text) {
        var lower = text.toLowerCase();
        trackers.forEach(function (t) {
            if (t.Keywords && lower.indexOf(String(t.Keywords).toLowerCase()) !== -1) t.today = 1;
        });
    }

    var STOP_WORDS = ['did', 'you', 'do', 'does', 'today', 'are', 'what', 'how', 'about', 'the', 'a', 'an', 'is',
        'have', 'has', 'i', 'my', 'me', 'recently', 'your', 'for', 'to', 'of', 'in', 'on', 'at', 'with', 'were', 'was'];
    function keywordFor(question) {
        var words = question.toLowerCase().replace(/[^a-z0-9À-ɏ\s]/g, ' ').split(/\s+/);
        for (var i = 0; i < words.length; i++) {
            if (words[i] && STOP_WORDS.indexOf(words[i]) === -1) return words[i];
        }
        return 'tracker';
    }

    // ---- The fake API ----
    function handle(path, body) {
        var r;
        switch (path) {
            case '/':
                return [200, { status: 'demo' }];

            case '/start':
                return [200, { rearrange: goLogin() }];

            case '/login':
                // Any login succeeds as the demo hero.
                r = lookMessage({});
                recentMessages(r, body.searchOptions);
                r['re-name'] = { header_message: (user.nick || 'Demo hero') + " welcome to Hero's diary." };
                refreshHabits(r);
                refreshPrompts(r);
                trackerList(r);
                r.settings = settingsView();
                return [200, { access_token: 'demo-token', rearrange: r }];

            case '/submit_journal_entry2': {
                var text = String(body.text || '');
                if (text.trim()) {
                    var isFeedback = body.part === 1 || body.type === 'feedback';
                    entries.push({
                        time: new Date(),
                        type: isFeedback ? 'feedback' : 'User text',
                        html: escapeHtml(text),
                        ai: (!isFeedback && setting('binary', 'entry_ai_summary', true)) ? (src.demoReply || '') : ''
                    });
                    if (!isFeedback) markTrackersFromText(text);
                }
                r = recentMessages({}, body.searchOptions);
                refreshHabits(r);
                refreshPrompts(r);
                return [200, { message_id: entries.length, rearrange: r }];
            }

            case '/view_notes': {
                var day = String(body.date || '');
                var onDay = sorted().filter(function (m) { return localDate(m.time) === day; });
                if (onDay.length) {
                    r = toMessages(onDay);
                } else {
                    r = {
                        show_messages: ['No entries on ' + escapeHtml(day) + '. The sample entries are from November and December 2024.'],
                        show_messages_types: ['other']
                    };
                }
                return [200, { rearrange: r }];
            }

            case '/update_tracker':
                (body.tracker || []).forEach(function (t) {
                    if (!t.checked) return;
                    var id = String(t.id).replace(/^habit_check_/, '');
                    trackers.forEach(function (tr) { if (String(tr.id) === id) tr.today = 1; });
                });
                r = recentMessages({}, body.searchOptions);
                refreshHabits(r);
                refreshPrompts(r);
                return [200, { update: 'suscess', rearrange: r }];

            case '/addTracker': {
                var question = String(body.long_description || '').trim();
                if (!question) return [200, { rearrange: { 'pop-up': 'Error: write a question first' } }];
                var nextId = trackers.reduce(function (m, t) { return Math.max(m, parseInt(t.id, 10) || 0); }, 0) + 1;
                trackers.push({
                    id: String(nextId),
                    Type: body.type === 'text' ? 'text' : 'bool',
                    Keywords: keywordFor(question),
                    ListPosition: trackers.length + 1,
                    LongDescription: question,
                    GoalNumber: parseInt(body.goal, 10) || 1,
                    GoalFrequency: body.freq === 'month' ? 'month' : 'week',
                    today: 0
                });
                r = trackerList({});
                refreshHabits(r);
                return [200, { msj: 'sucessfully added', rearrange: r }];
            }

            case '/delete_tracker': {
                var pos = parseInt(body.position, 10);
                if (pos >= 0 && pos < trackers.length) trackers.splice(pos, 1);
                r = trackerList({});
                refreshHabits(r);
                return [200, { msj: 'suscesfully moved', rearrange: r }];
            }

            case '/move_tracker_position': {
                var from = parseInt(body.from, 10);
                var to = parseInt(body.destiny, 10);
                if (from >= 0 && from < trackers.length && to >= 0 && to < trackers.length) {
                    var moved = trackers.splice(from, 1)[0];
                    trackers.splice(to, 0, moved);
                }
                r = trackerList({});
                refreshHabits(r);
                return [200, { msj: 'suscesfully moved', rearrange: r }];
            }

            case '/custom_report': {
                var report = (src.reports || {})[body.report_template];
                if (report) {
                    entries.push({
                        time: new Date(),
                        type: 'other',
                        html: escapeHtml('Report for the last ' + (parseInt(body.n_months, 10) || 12) + ' months.\n' + report),
                        ai: ''
                    });
                }
                r = recentMessages({}, body.searchOptions);
                refreshHabits(r);
                refreshPrompts(r);
                r.panels = Object.assign(r.panels || {}, { customReports: 1 });
                return [200, { rearrange: r }];
            }

            case '/update_settings':
                // update_settings() of the 2024 server, for this visit only.
                Object.keys(settings).forEach(function (type) {
                    var updates = body[type] || {};
                    Object.keys(updates).forEach(function (key) {
                        if (!settings[type][key]) return;
                        var v = updates[key];
                        if (type === 'numeric') v = parseInt(v, 10) || settings[type][key].default;
                        settings[type][key].value = v;
                    });
                });
                return [200, { rearrange: { 'pop-up': 'settings saved', panels: { settings: 1 } } }];

            case '/create_new_user':
                return [200, { success: false, message: UNAVAILABLE }];

            case '/update_password_request':
            case '/send_email_to_delete_account':
            case '/update_password':
                return [200, { error: UNAVAILABLE }];

            case '/delete_account':
            case '/verify_email':
                return [400, { msj: UNAVAILABLE, Error: UNAVAILABLE }];

            case '/upload':
            case '/upload_voice':
                return [200, { extracted_text: '' }];

            default:
                return [404, { error: UNAVAILABLE }];
        }
    }

    function apiPath(url) {
        for (var i = 0; i < API_BASES.length; i++) {
            var base = API_BASES[i];
            if (url === base || url.indexOf(base + '/') === 0 || url.indexOf(base + '?') === 0) {
                var rest = url.slice(base.length).split('?')[0].split('#')[0];
                return rest || '/';
            }
        }
        return null;
    }

    var realFetch = window.fetch ? window.fetch.bind(window) : null;

    window.fetch = function (input, init) {
        var url = typeof input === 'string' ? input : (input && input.url) || String(input);
        var path = apiPath(url);
        if (path === null) {
            if (realFetch) return realFetch(input, init);
            return Promise.reject(new TypeError('fetch is not available'));
        }
        var body = {};
        if (init && typeof init.body === 'string') {
            try { body = JSON.parse(init.body) || {}; } catch (e) { body = {}; }
        }
        var answer;
        try {
            answer = handle(path, body);
        } catch (e) {
            console.error('Demo API error:', e);
            answer = [500, { error: UNAVAILABLE }];
        }
        console.log('[demo] ' + ((init && init.method) || 'GET') + ' ' + path + ' answered locally');
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(new Response(JSON.stringify(answer[1]), {
                    status: answer[0],
                    headers: { 'Content-Type': 'application/json' }
                }));
            }, 150);
        });
    };

    // ---- Buttons that cannot work without the 2024 server ----
    // Sign-up, password reset and delete account show the demo message. Dictate and Scan would send
    // audio and photos to the server, so they show it too (and never ask for the microphone or camera).
    var BLOCKED_CLICKS = ['forgot_password_button', 'delete_account_button', 'entry_box_dictate_button', 'entry_box_scan_button'];
    window.addEventListener('click', function (event) {
        var target = event.target;
        if (!target || !target.closest) return;
        for (var i = 0; i < BLOCKED_CLICKS.length; i++) {
            if (target.closest('#' + BLOCKED_CLICKS[i])) {
                event.preventDefault();
                event.stopImmediatePropagation();
                alert(UNAVAILABLE);
                return;
            }
        }
    }, true);
    window.addEventListener('submit', function (event) {
        if (event.target && event.target.id === 'registrationForm') {
            event.preventDefault();
            event.stopImmediatePropagation();
            alert(UNAVAILABLE);
        }
    }, true);

    // For verify_email.html and delete_account.html: replaces the page's onload handler.
    window.demoUnavailablePage = function () {
        var el = document.getElementById('result');
        if (el) el.innerText = UNAVAILABLE;
    };
})();
