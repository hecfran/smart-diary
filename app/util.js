let sessionToken = null; // Variable to store the authentication token

// Constant for the interval time
const CHANGE_INTERVAL = 10000;

let promptIndex = 0;
let promptInterval;
let share_location = true;
let location_gps = {
    latitude: 0.0,
    longitude: 0.0
};

function updateLocation() {
    if (share_location) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    location_gps.latitude = position.coords.latitude;
                    location_gps.longitude = position.coords.longitude;
                    console.log('Location updated:', location_gps);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }
}

function handleTrackerAction(action, rowId) {
    const rowElement = document.getElementById(rowId);
    const rowIndex = Array.from(rowElement.parentNode.children).indexOf(rowElement) - 1;
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === rowElement.parentNode.children.length - 1;

    if (action === 'remove') {
        const confirmed = window.confirm('Are you sure you wish to delete this tracker?');
        if (confirmed) {
            fetch(`${DOMAIN}/delete_tracker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    position: rowIndex,
                })
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
        } else {
            console.log("cancel deleting tracker");
        }
    } else if (action === 'up' && isFirstRow) {
        console.log("First row can't be moved up.");
        return; // No action for moving the first row up
    } else if (action === 'down' && isLastRow) {
        console.log("Last row can't be moved down.");
        return; // No action for moving the last row down
    }

    let destiny;
    if (action === 'up') {
        destiny = rowIndex - 1;
    } else if (action === 'down') {
        destiny = rowIndex + 1;
    }

    if (action === 'up' || action === 'down') {
        fetch(`${DOMAIN}/move_tracker_position`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                from: rowIndex,
                destiny: destiny
            })
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
    }

    // Proceed with the action (e.g., "remove")
    console.log(`Action: ${action}, Row ID: ${rowId}`);
    // Implement additional logic for handling the "remove" action here
}

function togglePanel(panelId) {
    const panel = document.querySelector(`#${panelId} .panel`);
    const header = document.querySelector(`#${panelId} .panel-header`);
    const isVisible = panel.style.display === 'block';

    panel.style.display = isVisible ? 'none' : 'block';
    header.textContent = isVisible ? header.textContent.replace('➖', '➕') : header.textContent.replace('➕', '➖');
}

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null; // Return null if the cookie does not exist
}

function getSearchOptionsValues() {
    const searchOptions = document.querySelectorAll('#search_options input, #search_options select');
    const valuesDictionary = {};

    searchOptions.forEach(element => {
        valuesDictionary[element.id] = element.type === 'checkbox' ? element.checked : element.value;
    });

    return valuesDictionary;
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

        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(select);

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

        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(input);

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

        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(document.createElement('br'));
        div.appendChild(input);

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
                break;
            case 'numeric':
                element = createNumericInput(key, value);
                const numericRow = combinedPanel.insertRow();
                numericRow.insertCell().appendChild(element.querySelector('label'));
                numericRow.insertCell().appendChild(element.querySelector('input'));
                break;
            case 'text':
                element = createTextInput(key, value);
                textPanel.appendChild(element);
                break;
        }
    });
}

function regenerateSettings() {
    const settings = {
        binary: {},
        list: {},
        numeric: {},
        text: {}
    };

    // Process binary settings (checkboxes)
    document.querySelectorAll('#settings_checkbox_subpanel input[type="checkbox"]').forEach(input => {
        settings.binary[input.id] = input.checked;
    });

    // Process list settings (select dropdowns)
    document.querySelectorAll('#settings_combined_table select').forEach(select => {
        settings.list[select.id] = select.value;
    });

    // Process numeric settings (input type number)
    document.querySelectorAll('#settings_combined_table input[type="number"]').forEach(input => {
        settings.numeric[input.id] = parseFloat(input.value);
    });

    // Process text settings (input type text and textarea)
    document.querySelectorAll('#settings_text_subpanel input, #settings_text_subpanel textarea').forEach(input => {
        settings.text[input.id] = input.value;
    });

    return settings;
}

function setPanelTitle(panelId, newTitle) {
    const header = document.querySelector(`#${panelId} .panel-header`);
    header.textContent = header.textContent.replace(/➕|➖/, '➕') + ' ' + newTitle;
}

function sendText(part) {
    let text = "";
    let type = "";
    if (part === 0) {
        text = document.getElementById('entry_box_textarea').value;
        type = "User text";
        document.getElementById('entry_box_textarea').value = '';
    } else {
        text = document.getElementById('feedback_input').value;
        type = "feedback";
        document.getElementById('feedback_input').value = '';
    }

    if (!sessionToken) {
        console.error('No authentication token found.');
        return;
    }

    const searchOptionsValues = getSearchOptionsValues();
    const currentDatetime = new Date().toISOString();

    const body = {
        location: location_gps,
        searchOptions: searchOptionsValues,
        text: text,
        type: type,
        string_timestamp: currentDatetime,
        part: part
    };

    fetch(`${DOMAIN}/submit_journal_entry2`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            if (data.rearrange) {
                rearrange(data.rearrange);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updatePrompt(prompts) {
    const entryBoxTextarea = document.getElementById('entry_box_textarea');
    const entryBoxQuestion = document.getElementById('entry_box_question');

    if (entryBoxTextarea.value.trim() === '') {
        entryBoxQuestion.textContent = prompts[promptIndex];
        promptIndex = (promptIndex + 1) % prompts.length;
    }
}

function getTrackerDetails() {
    const trackerItems = document.querySelectorAll('#Tracker_list input[type="checkbox"]');
    const trackerDetails = [];

    trackerItems.forEach(item => {
        trackerDetails.push({
            id: item.id,
            checked: item.checked
        });
    });

    return trackerDetails;
}

function updateTracker() {
    if (!sessionToken) {
        console.error('No authentication token found.');
        return;
    }

    const trackerDetails = getTrackerDetails();
    const currentDatetime = new Date().toISOString();
    const searchOptionsValues = getSearchOptionsValues();

    const body = {
        tracker: trackerDetails,
        string_timestamp: currentDatetime,
        location: location_gps,
        searchOptions: searchOptionsValues,
    };

    fetch(`${DOMAIN}/update_tracker`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Tracker update success:', data);
            if (data.rearrange) {
                rearrange(data.rearrange);
            }
        })
        .catch(error => {
            console.error('Error updating tracker:', error);
        });
}
// Initialize view_by_date with the local date
document.addEventListener('DOMContentLoaded', () => {
    const viewByDateInput = document.getElementById('view_by_date');
    if (viewByDateInput) {
        const today = new Date().toISOString().split('T')[0];
        viewByDateInput.value = today;
    }

    const findButton = document.getElementById('find_button');
    if (findButton) {
        findButton.addEventListener('click', async () => {
            const date = viewByDateInput.value;
            const trackerDetails = getTrackerDetails();
            const searchOptionsValues = getSearchOptionsValues();
            const currentDatetime = new Date().toISOString();

            try {
                const response = await fetch(`${DOMAIN}/view_notes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    },
                    body: JSON.stringify({
                        date: date,
                        tracker: trackerDetails,
                        location: location_gps,
                        searchOptions: searchOptionsValues,
                        string_timestamp: currentDatetime
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Notes:', data);

                // Call rearrange if response contains rearrange value
                if (data.rearrange) {
                    rearrange(data.rearrange);
                }

                // Process and display the notes data as needed
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        });
    }
});


document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeat_password').value;
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const promo = document.getElementById('promo').value;
    const nick = document.getElementById('nick').value;


    // Validate password match
    if (password !== repeatPassword) {
        document.getElementById('passwordMessage').textContent = 'Passwords do not match';
        document.getElementById('passwordMessage').style.color = 'red';
        return;
    }

    const currentDatetime = new Date().toISOString();

    const requestBody = {
        email: email,
        password: password,
        dob: dob,
        gender: gender,
        promo: promo,	
		name:nick,
        string_timestamp: currentDatetime,
		purpose:'personal'
    };

	fetch(`${DOMAIN}/create_new_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('User registered successfully');
            // Optionally, you can reset the form here
            document.getElementById('registrationForm').reset();
        } else {
            alert('Error registering user: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});



