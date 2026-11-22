// Sample data for the read-only demo of the 2024 Hero's Diary (old.herosdiary.com).
// Written for the demo. None of it comes from a real account.
// demo.js answers the old API calls from this data, in the shapes the 2024 server sent.
window.DEMO_DATA = {
    user: {
        nick: 'Demo hero',
        email: 'demo hero (not a real account)',
        dob: '1990-01-01',
        gender: 'other',
        complexity: 60
    },

    // Diary entries. "time" is local time; "type" is a 2024 message type.
    entries: [
        {
            time: '2024-11-25T08:12:40',
            type: 'User text',
            text: 'Started the week with a run along the river before work. Cold, but the sky was clear and I felt good afterwards.',
            ai: 'A crisp river run opens the week, breath visible, legs awake.\n- Exercise done before work\n- Mood: energised\nWhat helped you get out of the door this morning?'
        },
        {
            time: '2024-11-26T21:40:05',
            type: 'User text',
            text: 'Long day. The project deadline moved forward by a week and nobody asked me first. I am frustrated, but I made a plan for the next days.',
            ai: 'A deadline shifts like sand underfoot, and still a plan is drawn.\n- Frustration about not being consulted\n- A plan made for the coming days\nWhich part of the plan worries you most?'
        },
        {
            time: '2024-11-28T19:05:51',
            type: 'User text',
            text: 'Grateful for my sister, who called just to ask how I was. We talked for an hour about nothing in particular.',
            ai: 'An hour of easy talk, a small gift from a sister.\n- Grateful for family\n- Felt cared for\nWhen did you last call her just to ask how she was?'
        },
        {
            time: '2024-11-30T10:30:00',
            type: 'user habit tracker',
            text: 'habit tracker update:\nDid you exercise today? : done',
            ai: ''
        },
        {
            time: '2024-12-01T09:00:00',
            type: 'AI summary week',
            text: 'Week summary, 25 November to 1 December 2024.\nOur hero opened the week on the river path, running through the cold. A moved deadline tested their patience, yet they answered it with a plan rather than complaint. The week closed in warmth: a long call with a sister, and two more runs ticked off the tracker. Achievements: 3 of 3 exercise goals, a project plan under pressure, and time given to family.',
            ai: ''
        },
        {
            time: '2024-12-03T22:15:12',
            type: 'User text',
            text: 'Proud of myself today. I presented the plan to the team and they agreed to most of it. I was nervous but it went well.',
            ai: 'Nerves before, agreement after: a quiet victory.\n- Presented the plan to the team\n- Most of it accepted\nWhat would you do differently next time you present?'
        },
        {
            time: '2024-12-05T18:47:33',
            type: 'conversation',
            text: 'Question: How many times did I exercise in November?\nBook: Your diary mentions exercise on 25 November and the tracker marks it done on 30 November, so at least twice in the last week of November.',
            ai: ''
        },
        {
            time: '2024-12-08T20:02:19',
            type: 'User text',
            text: 'Quiet Sunday. Cooked soup, read two chapters, went to bed early. Sometimes doing little is exactly right.',
            ai: 'A slow Sunday of soup and pages, rest chosen on purpose.\n- Rest and reading\n- Content with a quiet day\nWhat are you reading at the moment?'
        },
        {
            time: '2024-12-31T12:00:00',
            type: 'AI summary month',
            text: 'Month summary, December 2024.\nDecember asked our hero to lead, and they did: a plan presented, a team persuaded, nerves overcome. Between the busy days they kept their runs, cooked, read and rested without guilt. Family stayed close. The month ends with a hero who has learned that a moved deadline is a problem to solve, not a verdict.',
            ai: ''
        }
    ],

    // Trackers, as the 2024 server listed them (DEFAULT_TRACKER_LIST). "today" is 0 until done today.
    trackers: [
        { id: '1', Type: 'bool', Keywords: 'exercise', ListPosition: 1, LongDescription: 'Did you exercise today?', GoalNumber: 3, GoalFrequency: 'week', today: 0 },
        { id: '2', Type: 'text', Keywords: 'grateful', ListPosition: 2, LongDescription: 'What are you grateful about today?', GoalNumber: 4, GoalFrequency: 'week', today: 0 },
        { id: '3', Type: 'text', Keywords: 'frustrated', ListPosition: 3, LongDescription: 'What are you frustrated or irritated about recently?', GoalNumber: 4, GoalFrequency: 'month', today: 0 },
        { id: '4', Type: 'text', Keywords: 'proud', ListPosition: 4, LongDescription: 'What are you proud about recently?', GoalNumber: 4, GoalFrequency: 'month', today: 0 },
        { id: '5', Type: 'bool', Keywords: 'read', ListPosition: 5, LongDescription: 'Did you read for 20 minutes today?', GoalNumber: 4, GoalFrequency: 'week', today: 0 }
    ],

    // Prompts shown above the entry box (from GENERIC_PROPTS in the 2024 server).
    prompts: [
        'How was your day?',
        'What are you grateful for today?',
        'What was the highlight of your day?',
        'What challenges did you face today?',
        'What is something you are proud of today?'
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
    demoReply: '(Demo) In 2024 an AI wrote a short reply here: a brief, slightly poetic summary of your entry and a follow-up question. The demo has no AI and keeps your entry only until you leave the page.',

    // Custom reports (report_template 1, 2, 3).
    reports: {
        1: 'Mental health report (demo).\nExecutive summary: over the last weeks I felt mostly calm and energised, with one stressful spell when a deadline moved (26 November). I answered it with a plan and felt proud once the team agreed (3 December). Rest and family calls helped.\n- 26 Nov 2024: frustrated, made a plan\n- 28 Nov 2024: grateful, felt cared for\n- 3 Dec 2024: nervous, then proud\n- 8 Dec 2024: content, rested',
        2: 'Physical health report (demo).\nExecutive summary: I ran regularly and met my exercise goal in the last week of November. No symptoms were mentioned. Sleep was good on quiet days.\n- 25 Nov 2024: morning run by the river\n- 30 Nov 2024: exercise ticked in the tracker\n- 8 Dec 2024: early night',
        3: 'Relationships health report (demo).\nExecutive summary: family contact was warm and easy; work relationships were tested by the moved deadline and improved after the presentation.\n- 26 Nov 2024: not consulted about the deadline\n- 28 Nov 2024: an hour on the phone with my sister\n- 3 Dec 2024: the team agreed to my plan'
    }
};
