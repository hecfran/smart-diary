// Sample data for the read-only demo of the 2024 Hero's Diary (old.herosdiary.com).
// All characters, entries, trackers, and reports below are 100% fictional [FAKE DEMO] placeholders.
// Nothing here comes from any real account or real user.
window.DEMO_DATA = {
    user: {
        nick: 'Captain Demo (Fictional Character)',
        email: 'fake-demo@example.invalid (fictional demo account)',
        dob: '1899-02-30',
        gender: 'other',
        complexity: 60
    },

    // Fictional diary entries. "time" is local time; "type" is a 2024 message type.
    entries: [
        {
            time: '2024-11-25T08:12:40',
            type: 'User text',
            text: '[FAKE DEMO ENTRY] Polished my cardboard knight helmet at sunrise atop the Floating Lighthouse. Fed two copper acorns to my pocket-sized clockwork dragon before hoisting the cloud-watching kite.',
            ai: '[FAKE DEMO AI REPLY] Shiny cardboard armor meets the morning breeze while a brass dragon snacks on acorns.\n- Polished cardboard armor\n- Fed the clockwork dragon\nWhich cloud constellation are you charting next?'
        },
        {
            time: '2024-11-26T21:40:05',
            type: 'User text',
            text: '[FAKE DEMO ENTRY] The talking porcelain teapot insisted that Tuesday should be spelled with three Qs. We debated grammar over invisible biscuits until the moon balloon floated past the observatory window.',
            ai: '[FAKE DEMO AI REPLY] A stubborn teapot guards the alphabet while a moon balloon drifts by.\n- Friendly debate with a talking teapot\n- Quiet evening in the observatory\nWhat will tomorrow\'s tea-time riddle be?'
        },
        {
            time: '2024-11-28T19:05:51',
            type: 'User text',
            text: '[FAKE DEMO ENTRY] Grateful for my folding paper compass that always points toward the nearest bakery on Cloud Island instead of magnetic north. Mapped three imaginary archipelago shoals before supper.',
            ai: '[FAKE DEMO AI REPLY] A pastry-seeking compass leads every chart on Cloud Island.\n- Grateful for a whimsical paper compass\n- Mapped three fictional islands\nWhich imaginary island deserves a lighthouse next?'
        },
        {
            time: '2024-11-30T10:30:00',
            type: 'user habit tracker',
            text: '[FAKE DEMO TRACKER] habit tracker update:\n[DEMO] Did you feed the imaginary dragon today? : done',
            ai: ''
        },
        {
            time: '2024-12-01T09:00:00',
            type: 'AI summary week',
            text: '[FAKE DEMO WEEKLY SUMMARY] Week summary, 25 November to 1 December 2024.\nOur fictional Captain Demo polished cardboard armor, settled a spelling dispute with a talking teapot, and followed a pastry compass across Cloud Island. All imaginary dragon feedings were marked complete in this placeholder week.',
            ai: ''
        },
        {
            time: '2024-12-03T22:15:12',
            type: 'User text',
            text: '[FAKE DEMO ENTRY] Presented my blueprints for a pedal-powered dirigible made of umbrella ribs to the Council of Clockmakers. Every mechanical owl nodded twice in approval.',
            ai: '[FAKE DEMO AI REPLY] Umbrella wings and approving brass owls mark a triumphant workshop evening.\n- Presented fictional dirigible blueprints\n- Celebrated with the Council of Clockmakers\nWhere will the maiden test flight glide first?'
        },
        {
            time: '2024-12-05T18:47:33',
            type: 'conversation',
            text: '[FAKE DEMO CONVERSATION] Question: How many times did Captain Demo polish armor or feed the clockwork dragon?\nBook: Placeholder log shows dragon feeding on 25 and 30 November and cardboard shield polishing throughout the week.',
            ai: ''
        },
        {
            time: '2024-12-08T20:02:19',
            type: 'User text',
            text: '[FAKE DEMO ENTRY] Quiet Sunday in the lighthouse library. Read twenty pages from the Encyclopedia of Impossible Knots, brewed stardust cocoa, and tucked the clockwork dragon into a velvet sock.',
            ai: '[FAKE DEMO AI REPLY] Stardust cocoa, impossible knots, and a sleeping miniature dragon close a restful placeholder Sunday.\n- Read the Encyclopedia of Impossible Knots\n- Rested in the fictional lighthouse\nWhich knot from chapter four looked most mysterious?'
        },
        {
            time: '2024-12-31T12:00:00',
            type: 'AI summary month',
            text: '[FAKE DEMO MONTHLY SUMMARY] Month summary, December 2024.\nIn this completely fictional December showcase, Captain Demo balanced workshop inventions with talking teapots, cloud cartography, and dragon care—demonstrating how Hero\'s Diary (2024) displayed monthly AI summaries.',
            ai: ''
        }
    ],

    // Fictional trackers in the exact 2024 shape (DEFAULT_TRACKER_LIST). "today" is 0 until done today.
    trackers: [
        { id: '1', Type: 'bool', Keywords: 'dragon', ListPosition: 1, LongDescription: '[DEMO] Did you feed the imaginary dragon today?', GoalNumber: 3, GoalFrequency: 'week', today: 0 },
        { id: '2', Type: 'text', Keywords: 'quest', ListPosition: 2, LongDescription: '[DEMO] What fictional quest are you grateful for?', GoalNumber: 4, GoalFrequency: 'week', today: 0 },
        { id: '3', Type: 'text', Keywords: 'wizardry', ListPosition: 3, LongDescription: '[DEMO] What wizardry frustrated you today?', GoalNumber: 4, GoalFrequency: 'month', today: 0 },
        { id: '4', Type: 'bool', Keywords: 'shield', ListPosition: 4, LongDescription: '[DEMO] Did you polish your cardboard shield?', GoalNumber: 4, GoalFrequency: 'month', today: 0 },
        { id: '5', Type: 'bool', Keywords: 'spellbook', ListPosition: 5, LongDescription: '[DEMO] Did you read 20 pages of the Spellbook?', GoalNumber: 4, GoalFrequency: 'week', today: 0 }
    ],

    // Prompts shown above the entry box (from GENERIC_PROPTS in the 2024 server).
    prompts: [
        '[DEMO PROMPT] What fictional adventure happened in your story today?',
        '[DEMO PROMPT] Which imaginary friend or clockwork pet helped you today?',
        '[DEMO PROMPT] What was the highlight of today\'s storybook quest?',
        '[DEMO PROMPT] What whimsical puzzle did you try to solve today?',
        '[DEMO PROMPT] What sample detail would you like to test in this 2024 UI demo?'
    ],

    // Settings, in the 2024 shape (DEFAULT_SETTINGS_VAL). Saving changes them for this visit only.
    settings: {
        binary: {
            show_prompts: { order: 2.001, localized_name: 'Show me prompts', value: true, default: true, help: 'Show me prompts to give me ideas on what to write' },
            entry_ai_summary: { order: 2.1, localized_name: 'Ai entry summary', value: true, default: true, help: 'Would you like the ai, to write a bullet point summary for each of your entries?' },
            save_location: { order: 2.1, localized_name: 'save my location on every journal entry', value: false, default: false, help: 'Would you like to save your gps location on each journal entry you take?' }
        },
        numeric: {
            displayed_messages: { order: 3.1, localized_name: 'displayed_messages', value: 10, default: 5, help: 'amount of messages to be displayed' }
        },
        list: {
            will: {
                order: 4.0,
                localized_name: 'Testament',
                value: 'keep to improve ai only',
                default: 'keep to improve ai only',
                options: ['Destroy my data', 'keep to improve ai only', 'remove anything embarazing or unethical (ai decideds what) and donate it  to humanity', 'make it public, donate my diary to humanity'],
                help: 'what to do after your death: when your age is 100 and you didn\'t login in last 20 years'
            }
        },
        text: {
            email_notes: { order: 1.51, paragraph: false, localized_name: 'Email every note to:', value: '', default: '', help: 'leave black to deactivate, write an email adress to send every note you create, useful if you want a backup' },
            email_notes_header: { order: 1.51, paragraph: false, localized_name: 'Email header', value: '@diary', default: '@diary', help: 'header of email when sending notes, eg is emailed to evernote #adds a tag @specifies booknote' },
            summary_instructions_individual_entry2: {
                order: 3.5,
                paragraph: true,
                localized_name: 'Summary instructions for the jounal entry',
                value: 'Respond in the same languge as the message is written.\nWrite a very brief and criptc summary of the following jounal entry with a littel touch of poetic language.\nIf possible end the response with a follow up question, prompting the author to give more details.',
                default: 'Respond in the same languge as the message is written.\nWrite a very brief and criptc summary of the following jounal entry with a littel touch of poetic language.\nIf possible end the response with a follow up question, prompting the author to give more details.',
                help: 'write the instruction to the Ai on how to responde each journal entry'
            },
            summary_instructions_week: { order: 4.0, paragraph: true, localized_name: 'Summary instructions for the week', value: 'write a summery describing me in third person, give a touch of artistic language, with emphasis on achivements. ', default: 'write a summery describing me in third person, give a touch of artistic language, with emphasis on achivements. ', help: 'write the instruction to the Ai on how to write your summaries' },
            summary_instructions_month: { order: 4.1, paragraph: true, localized_name: 'Summary instructions for the month', value: 'write a summery describing me in third person, give a touch of artistic language, with emphasis on achivements. ', default: 'write a summery describing me in third person, give a touch of artistic language, with emphasis on achivements. ', help: 'write the instruction to the Ai on how to write your summaries' },
            person: { order: 5.0, paragraph: true, localized_name: 'Personal characteristics background', value: '', default: '', help: 'extra background for the AI to write summaries' }
        }
    },

    // The reply the demo gives to a new entry, in place of the 2024 AI call.
    demoReply: '[FAKE DEMO AI REPLY] In 2024 an AI wrote a short placeholder reply here. This interactive preview has no AI and discards everything when you leave the page.',

    // Fictional custom reports (report_template 1, 2, 3).
    reports: {
        1: '[FAKE DEMO REPORT] Whisker & Wonder Mindset Report.\nExecutive summary: completely fictional mood log for Captain Demo — amused by talking teapots (26 Nov), delighted by Cloud Island maps (28 Nov), and tranquil over stardust cocoa (8 Dec).\n- 26 Nov 2024: playful debate with a porcelain teapot\n- 28 Nov 2024: mapped imaginary islands\n- 3 Dec 2024: Council of Clockmakers approved dirigible plans\n- 8 Dec 2024: read Encyclopedia of Impossible Knots',
        2: '[FAKE DEMO REPORT] Cardboard Armor & Dragon Care Report.\nExecutive summary: fictional activity log showing clockwork dragon feedings completed twice and cardboard armor polished atop the Floating Lighthouse.\n- 25 Nov 2024: fed copper acorns to miniature dragon\n- 30 Nov 2024: dragon care ticked in demo tracker\n- 8 Dec 2024: cozy lighthouse rest',
        3: '[FAKE DEMO REPORT] Storybook Fellowship Report.\nExecutive summary: fictional interactions with the talking teapot, Council of Clockmakers mechanical owls, and the miniature clockwork dragon.\n- 26 Nov 2024: tea-time spelling debate\n- 28 Nov 2024: guided by pastry-seeking paper compass\n- 3 Dec 2024: presented umbrella-wing dirigible'
    }
};
