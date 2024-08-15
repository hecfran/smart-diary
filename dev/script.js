
// Update location immediately


function show_messages(jsonObject){
    const messageTable = document.getElementById("message_table");
    while (messageTable.rows.length > 0) {
        messageTable.deleteRow(0);
    }
		
    jsonObject["show_messages"].forEach((message, index) => {
        const newRow = messageTable.insertRow();
        const newCell = newRow.insertCell(0);
        const messageText = message.replace(/\n/g, '<br>');
        newCell.innerHTML = `
            <div>
                <p id="message_text_${index}">${messageText}</p>
                <button id="read_button_${index}">Read</button>
                <button id="share_button_${index}">Share</button>
            </div>
        `;
        newRow.id = `message_row_${index + 1}`;

        if (jsonObject["show_messages_types"] && jsonObject["show_messages_types"][index]) {
            const messageType = jsonObject["show_messages_types"][index];
            newRow.classList.add(`message-type-${messageType.toLowerCase().replace(/ /g, '-')}`);
        }

        // Add event listener for read button
        const readButton = document.getElementById(`read_button_${index}`);
        readButton.addEventListener('click', () => {
            const messageElement = document.getElementById(`message_text_${index}`);
            const message = messageElement.textContent;
            // Use system TTS to read the message
            // Remove HTML marks from the message
            const cleanMessage = message.replace(/<[^>]*>/g, '');
            // Use TTS API to read the message
            // For example, using the Web Speech API:
            const speech = new SpeechSynthesisUtterance(cleanMessage);
            speech.lang = 'en-US';
            window.speechSynthesis.speak(speech);
        });

        // Add event listener for share button
        const shareButton = document.getElementById(`share_button_${index}`);
        shareButton.addEventListener('click', () => {
            const messageElement = document.getElementById(`message_text_${index}`);
            const message = messageElement.textContent;
            // Use Web Share API to share the message
            if (navigator.share) {
                navigator.share({
                    title: 'Shared Message',
                    text: message,
                })
                .then(() => console.log('Shared successfully'))
                .catch((error) => console.error('Error sharing:', error));
            } else {
                console.log('Web Share API not supported');
            }
        });
    });
    messageTable.rows[messageTable.rows.length - 1].scrollIntoView({ behavior: "smooth" });
}



function rearrange(jsonObject) {
    if (jsonObject["panels"]) {
        for (const panelId in jsonObject["panels"]) {
            const panelState = jsonObject["panels"][panelId];
            const panelSection = document.getElementById(panelId);

            if (panelState === 0) {
                panelSection.style.display = 'none';
            } else {
                panelSection.style.display = 'block';
                const panel = panelSection.querySelector('.panel');
                const header = panelSection.querySelector('.panel-header');
                const isVisible = panel.style.display === 'block';

                if (panelState === 1) {
                    if (isVisible) togglePanel(panelId);
                } else if (panelState === 2) {
                    if (!isVisible) togglePanel(panelId);
                }
            }
        }
    }
	if (jsonObject["hide_elements"]) {
        hideElementsByIds(jsonObject["hide_elements"]);
    }
	if (jsonObject["show_elements"]) {
        showElementsByIds(jsonObject["show_elements"]);
    }
	if (jsonObject["text_habit"]) {
        //document.getElementById('habit_question').value = jsonObject["text_habit"];
		appendKeywordsToHabitQuestion(jsonObject["text_habit"])
    }


	if (jsonObject["attention_elements"]) {
        attentionElementsByIds(jsonObject["attention_elements"]);
    }
	
    if (jsonObject["settings"]) {
        updatePanelSettings(jsonObject["settings"]);
    }

    if (jsonObject["re-name"]) {
        for (const elementId in jsonObject["re-name"]) {
            const newText = jsonObject["re-name"][elementId];
            const element = document.getElementById(elementId);
            if (element.classList.contains('panel-header')) {
                const symbol = element.textContent.trim().charAt(0);
                if (symbol === '➕' || symbol === '➖') {
                    element.textContent = symbol + ' ' + newText;
                } else {
                    element.textContent = newText;
                }
            } else {
                element.textContent = newText;
            }
        }
    }

    if (jsonObject["pop-up"]) {
        alert(jsonObject["pop-up"]);
    }

    if (jsonObject["show_messages"]) {
		show_messages(jsonObject)
	}
        /*const messageTable = document.getElementById("message_table");
        while (messageTable.rows.length > 0) {
            messageTable.deleteRow(0);
        }
        jsonObject["show_messages"].forEach((message, index) => {
            const newRow = messageTable.insertRow();
            const newCell = newRow.insertCell(0);
            newCell.innerHTML = message.replace(/\n/g, '<br>');
            newRow.id = `message_row_${index + 1}`;

            if (jsonObject["show_messages_types"] && jsonObject["show_messages_types"][index]) {
                const messageType = jsonObject["show_messages_types"][index];
                newRow.classList.add(`message-type-${messageType.toLowerCase().replace(/ /g, '-')}`);
            }
        });
        messageTable.rows[messageTable.rows.length - 1].scrollIntoView({ behavior: "smooth" });
    }
	*/

    if (jsonObject["habit_checks"]) {
        const trackerList = document.getElementById("Tracker_list");
        while (trackerList.firstChild) {
            trackerList.removeChild(trackerList.firstChild);
        }
        jsonObject["habit_checks"].forEach((habit, index) => {
            const checkboxId = `habit_check_${habit.id}`;
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = checkboxId;
            checkbox.name = "habit_check";
            checkbox.value = habit.LongDescription;

            const label = document.createElement("label");
            label.htmlFor = checkboxId;
            label.appendChild(document.createTextNode(habit.LongDescription));

            const div = document.createElement("div");
            div.appendChild(checkbox);
            div.appendChild(label);

            trackerList.appendChild(div);
        });
    }

    if (jsonObject["prompts"]) {
        const prompts = jsonObject["prompts"];
        if (Array.isArray(prompts) && prompts.length > 0) {
            clearInterval(promptInterval); // Clear any existing interval
            promptIndex = 0; // Reset index
            updatePrompt(prompts); // Start prompt rotation
            promptInterval = setInterval(() => updatePrompt(prompts), CHANGE_INTERVAL);
        }
    }

    if (jsonObject["Trackers"]) {
        const trackerTable = document.getElementById("habit_goal_tracker_table");

        // Clear existing table
        while (trackerTable.rows.length > 0) {
            trackerTable.deleteRow(0);
        }

        // Add new headers
        const headerRow = trackerTable.insertRow();
        const headers = ["Description", "Type", "Times", "Frequency", "Actions"];
        headers.forEach(headerText => {
            const header = document.createElement("th");
            header.innerText = headerText;
            headerRow.appendChild(header);
        });

        // Add rows for each tracker
        jsonObject["Trackers"].forEach((tracker, index) => {
            const row = trackerTable.insertRow();
            row.id = `tracker_row_${index}`;

            const keywordsCell = row.insertCell();
            keywordsCell.innerText = tracker.Keywords;
            keywordsCell.title = tracker.LongDescription;

            const typeCell = row.insertCell();
            typeCell.innerText = tracker.Type.replace("bool", "yes/no");

            const goalNumberCell = row.insertCell();
            goalNumberCell.innerText = tracker.GoalNumber;

            const goalFrequencyCell = row.insertCell();
            goalFrequencyCell.innerText = tracker.GoalFrequency;

            const actionsCell = row.insertCell();
            ["up", "down", "remove"].forEach(action => {
                const button = document.createElement("button");
                button.innerText = action.charAt(0).toUpperCase() + action.slice(1);
                button.addEventListener("click", () => handleTrackerAction(action, row.id));
                actionsCell.appendChild(button);
            });

            // Assign id=0 to the first button of the second row after the header
            if (index === 0) {
                const firstButton = actionsCell.querySelector("button");
                firstButton.id = 0;
                firstButton.addEventListener("click", () => handleTrackerAction(firstButton.innerText.toLowerCase(), firstButton.id));
            }
        });
    }
}


function appendKeywordsToHabitQuestion(dictList) {
    // Step 1: Retrieve the current value of the habit_question element
    let habitQuestionElement = document.getElementById('habit_question');
    let currentValue = habitQuestionElement.value;

    // Step 2: Extract the 'Keywords' values from the list of dictionaries
    let keywords = dictList.map(dict => dict['Keywords']).join(', ');

    // Step 3: Append these values to the habit_question value, separated by commas
    let newValue = currentValue ? `${currentValue}, ${keywords}` : keywords;

    // Step 4: Update the habit_question element with the new value
    habitQuestionElement.innerText  =  newValue;
}


function updatePanelSettings(settings) {
    // Function to create a checkbox element
    function createCheckbox(key, value) {
        const label = document.createElement('label');
        label.htmlFor = key;
        label.innerText = value.localized_name;
        label.title = value.help;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = key;
        checkbox.checked = value.value;

        const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);

        return div;
    }

    // Function to create a list selection element
    function createListSelection(key, value) {
        const label = document.createElement('label');
        label.htmlFor = key;
        label.innerText = value.localized_name;
        label.title = value.help;

        const select = document.createElement('select');
        select.id = key;

        value.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.innerText = option;
            select.appendChild(opt);
        });

        select.value = value.value;

        const resetButton = document.createElement('button');
        resetButton.innerText = 'Reset';
        resetButton.onclick = () => {
            select.value = value.default;
        };

        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(select);
        div.appendChild(select);
        div.appendChild(resetButton);

        return div;
    }

    // Function to create a numeric input element
    function createNumericInput(key, value) {
        const label = document.createElement('label');
        label.htmlFor = key;
        label.innerText = value.localized_name;
        label.title = value.help;

        const input = document.createElement('input');
        input.type = value.float_value ? 'number' : 'text';
        input.id = key;
        input.value = value.value;
        if (value.min !== undefined) input.min = value.min;
        if (value.max !== undefined) input.max = value.max;
        if (value.float_value) input.step = "0.01";

        const resetButton = document.createElement('button');
        resetButton.innerText = 'Reset';
        resetButton.onclick = () => {
            input.value = value.default;
        };

        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(resetButton);

        return div;
    }

    // Function to create a text input element
    function createTextInput(key, value) {
        const label = document.createElement('label');
        label.htmlFor = key;
        label.innerText = value.localized_name;
        label.title = value.help;

        const input = document.createElement(value.paragraph ? 'textarea' : 'input');
        input.id = key;
        input.value = value.value;
        input.rows = value.paragraph ? 5 : 1;
        input.style.width = '100%';

        const resetButton = document.createElement('button');
        resetButton.innerText = 'Reset';
        resetButton.onclick = () => {
            input.value = value.default;
        };

        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(document.createElement('br'));
        div.appendChild(input);
        div.appendChild(resetButton);

        return div;
    }

    // Create an array of all items with their order and type
    const allItems = [];
    for (const [type, values] of Object.entries(settings)) {
        for (const [key, value] of Object.entries(values)) {
            allItems.push({ key, value, type });
        }
    }

    // Sort all items by their order
    allItems.sort((a, b) => a.value.order - b.value.order);

    // Clear all panels
    const binaryPanel = document.getElementById('settings_checkbox_subpanel');
    binaryPanel.innerHTML = '<legend>Checkbox Settings</legend>';
    const combinedPanel = document.getElementById('settings_combined_table');
    combinedPanel.innerHTML = '';
    const textPanel = document.getElementById('settings_text_subpanel');
    textPanel.innerHTML = '';

    // Add items to their respective panels in order
    allItems.forEach(({ key, value, type }) => {
        let element;
        switch (type) {
            case 'binary':
                element = createCheckbox(key, value);
                binaryPanel.appendChild(element);
                break;
            case 'list':
                element = createListSelection(key, value);
                const listRow = combinedPanel.insertRow();
                listRow.insertCell().appendChild(element.querySelector('label'));
                listRow.insertCell().appendChild(element.querySelector('select'));
                listRow.insertCell().appendChild(element.querySelector('button'));
                break;
            case 'numeric':
                element = createNumericInput(key, value);
                const numericRow = combinedPanel.insertRow();
                numericRow.insertCell().appendChild(element.querySelector('label'));
                numericRow.insertCell().appendChild(element.querySelector('input'));
                numericRow.insertCell().appendChild(element.querySelector('button'));
                break;
            case 'text':
                element = createTextInput(key, value);
                textPanel.appendChild(element);
                break;
        }

        // Print value on console if setting is 'save_location'
        if (key === 'save_location') {
            console.log(`Save location: ${value.value}`);
			share_location = false;

        }
    });

    // Debugging: Print all numeric inputs
    console.log('Numeric inputs in the DOM:');
    document.querySelectorAll('#settings_combined_table input[type="number"]').forEach(input => {
        console.log(`Input ID: ${input.id}, Value: ${input.value}`);
    });
}





function handleUnlockDiaryButtonClick() {
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    const searchOptionsValues = getSearchOptionsValues();
    //const currentDatetime = new Date().toISOString();
    const currentDatetime = new Date().toLocaleString(); // Use local time


    const requestBody = {
        email: email,
        password: password,
        searchOptions: searchOptionsValues,
        string_timestamp: currentDatetime
    };

    fetch(`${DOMAIN}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            sessionToken = data.access_token;
            //setCookie('access_token', data.access_token, 7); // problem seeing other people diary. 
        }
        if (data.rearrange) {
            rearrange(data.rearrange);
			turnOnLocation();//after rearrange check if location is need it
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



function turnOnLocation(){
	updateLocation(); //after knowing if location is available
	setInterval(updateLocation, 300000); // Update location every 5 minutes (300000 milliseconds)
}

function startApp() {
    //const currentDatetime = new Date().toISOString();
    const currentDatetime = new Date().toLocaleString(); // Use local time

    const location = location_gps;

    // Step 1: Call ${DOMAIN}/ and check the response
    fetch(`${DOMAIN}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            string_timestamp: currentDatetime,
            location: location
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Service currently unavailable for manainance, please try again later');
            }
            return response.json();
        })
        .then(data => {
            // Step 2: Check for access_token cookie
            let accessToken = getCookie('access_token');
            if (!accessToken || accessToken === '') {
                // If the cookie does not exist or is an empty string, call ${DOMAIN}/start
                return fetch(`${DOMAIN}/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        string_timestamp: currentDatetime,
                        location: location
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data); // Print the response to the console
                        if (data.rearrange) {
                            rearrange(data.rearrange);
                        }
                    });
            } else {
				sessionToken = accessToken; // this is why the page was not working after auto-login 1-aug-2024
                // If the cookie exists and is not an empty string, call ${DOMAIN}/login with the Authorization header
                return fetch(`${DOMAIN}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        string_timestamp: currentDatetime,
                        location: location
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        console.warn('Login failed, starting app instead');
                        // Remove the cookie
                        setCookie('access_token', '', 100); // This will delete the cookie
                        // Call ${DOMAIN}/start
                        return fetch(`${DOMAIN}/start`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                string_timestamp: currentDatetime,
								auth_success: 1,
                                location: location
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data); // Print the response to the console
                                if (data.rearrange) {
                                    rearrange(data.rearrange);
                                }
                            });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data); // Print the response to the console
                    if (data.rearrange) {
                        rearrange(data.rearrange);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // If an error occurred during login, call ${DOMAIN}/start
                    return fetch(`${DOMAIN}/start`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            string_timestamp: currentDatetime,
                            location: location
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data); // Print the response to the console
                            if (data.rearrange) {
                                rearrange(data.rearrange);
                            }
                        });
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Service currently unavailable');
        });
}

// Call startApp on window load
window.addEventListener('load', startApp);



document.getElementById('unlock_diary_button').addEventListener('click', handleUnlockDiaryButtonClick);


document.getElementById('registrationForm').addEventListener('input', function() {
    var password = document.getElementById('password').value;
    var repeatPassword = document.getElementById('repeat_password').value;
    var passwordMessage = document.getElementById('passwordMessage');

    if (password === '' || repeatPassword === '') {
        passwordMessage.textContent = 'Empty password';
        passwordMessage.style.color = 'red';
    } else if (password.length < 8) {
        passwordMessage.textContent = 'Password too short';
        passwordMessage.style.color = 'red';
    } else if (password !== repeatPassword) {
        passwordMessage.textContent = 'Passwords are different';
        passwordMessage.style.color = 'red';
    } else {
        passwordMessage.textContent = 'Passwords match';
        passwordMessage.style.color = 'green';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const searchOptionsSelect = document.getElementById('search_options_select');
    const searchStartDate = document.getElementById('search_start_date');
    const searchEndDate = document.getElementById('search_end_date');

    function setSearchDates() {
        const today = new Date();
        let startDate = new Date();
        
        if (searchOptionsSelect.value === 'month') {
            startDate.setMonth(today.getMonth() - 1);
        } else if (searchOptionsSelect.value === 'year') {
            startDate.setFullYear(today.getFullYear() - 1);
        } else if (searchOptionsSelect.value === 'all_times') {
            startDate = new Date(1950, 0, 1); // January 1, 1950
        } else {
            return; // Custom option
        }

        searchStartDate.valueAsDate = startDate;

        let endDate = new Date(today);
        endDate.setDate(today.getDate() + 1);
        searchEndDate.valueAsDate = endDate;
    }

    function handleDateChange() {
        searchOptionsSelect.value = 'custom';
    }

    searchOptionsSelect.addEventListener('change', setSearchDates);
    searchStartDate.addEventListener('change', handleDateChange);
    searchEndDate.addEventListener('change', handleDateChange);

    setSearchDates();
});



document.getElementById('entry_box_send_button').addEventListener('click', function() {
    sendText(0);
});

document.getElementById('feedback_send_button').addEventListener('click', function() {
    sendText(1);
});

document.getElementById('daily_tracker').addEventListener('click', updateTracker);

document.getElementById('new_tracker_form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission from reloading the page

    const question = document.getElementById('tracker_question').value;
    const type = document.getElementById('tracker_type').value;
    const amount = document.getElementById('tracker_amount').value;
    const frequency = document.getElementById('tracker_frequency').value;
    const searchOptionsValues = getSearchOptionsValues();
    //const currentDatetime = new Date().toISOString();
    const currentDatetime = new Date().toLocaleString(); // Use local time



    const requestBody = {
        long_description: question,
        freq: frequency,
        goal: amount,
        type: type,
        location: location_gps,
        searchOptions: searchOptionsValues	,
        string_timestamp: currentDatetime
		
		
    };

    if (!sessionToken) {
        console.error('No authentication token found.');
        return;
    }

    fetch(`${DOMAIN}/addTracker`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.rearrange) {
            rearrange(data.rearrange);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    // Clear the form fields
    document.getElementById('new_tracker_form').reset();
});

function hideElementsByIds(ids) {
    ids.forEach(id => {
        let element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

function showElementsByIds(ids) {
    ids.forEach(id => {
        let element = document.getElementById(id);
        if (element) {
            element.style.display = '';
        }
    });
}


function attentionElementsByIds(ids) {
    ids.forEach(id => {
        let element = document.getElementById(id);
        if (element) {
		    element.focus();
        }
    });
}



// initialize weg page without making an api call
document.addEventListener('DOMContentLoaded', function() {
    const rearrangeConfig = {
        'panels': {
            'video': 0,
            'message_viewer': 0,
            'search_options': 0,
            'entry_box': 2,
            'habit_goal_tracker': 0,
            'settings': 0,
            'membership': 0,
            'about': 0,
            'feedback_customer_care': 0,
            'account': 0,
            'edit_habit_goal_tracker': 0,
            'customReports': 0,
            'log_in': 2,
            'register': 1,
            'introduction': 2,
		    'voice-recording': 0
		
        },
        'hide_elements': [
            'entry_box_question',
            'entry_box_send_button',
            'logout_button'
        ],
        'attention_elements': [
            'introduction',
            'login_email_row',
            'entry_box_textarea'
        ]
    };

    // Call the rearrange function with the specified configuration
    rearrange(rearrangeConfig);
});
