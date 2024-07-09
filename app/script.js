
// Update location immediately




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
    if (jsonObject["settings"]) {
		updatePanelSettings(jsonObject["settings"])
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
        const messageTable = document.getElementById("message_table");
        while (messageTable.rows.length > 0) {
            messageTable.deleteRow(0);
        }
        jsonObject["show_messages"].forEach((message, index) => {
            const newRow = messageTable.insertRow();
            const newCell = newRow.insertCell(0);
            newCell.innerHTML = message.replace(/\n/g, '<br>');
            newRow.id = `message_row_${index + 1}`;
        });
        messageTable.rows[messageTable.rows.length - 1].scrollIntoView({ behavior: "smooth" });
    }

    if (jsonObject["habit_checks"]) {
        const trackerList = document.getElementById("Tracker_list");
        while (trackerList.firstChild) {
            trackerList.removeChild(trackerList.firstChild);
        }
        jsonObject["habit_checks"].forEach((habit, index) => {
            const checkboxId = `habit_check_${index}`;
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

    // New functionality for Trackers
// New functionality for Trackers
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

function handleUnlockDiaryButtonClick() {
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    const searchOptionsValues = getSearchOptionsValues();
    const currentDatetime = new Date().toISOString();

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
            setCookie('access_token', data.access_token, 7);
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
    fetch(`${DOMAIN}/start`)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Print the response to the console
            if (data.rearrange) {
                rearrange(data.rearrange);			
            }
        })
        .catch(error => {
            console.error('Error:', error);
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
    const currentDatetime = new Date().toISOString();


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

