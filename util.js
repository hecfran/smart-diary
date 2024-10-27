let sessionToken = null; // Variable to store the authentication token

function getFormattedDate() {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Use 24-hour time format
  };

  // Use 'en-GB' for a consistent day/month/year format
  return new Date().toLocaleString('en-GB', options);
}

console.log(getFormattedDate());



document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    document.getElementById('entry_box_scan_button').addEventListener('click', captureAndUploadImage);
    console.log("Event listener added to entry_box_scan_button");
});


// Constant for the interval time
const CHANGE_INTERVAL = 10000;

let promptIndex = 0;
let promptInterval;
let share_location = false;
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

	// Process numeric settings (input type number and text)
	document.querySelectorAll('#settings_combined_table input[type="number"], #settings_combined_table input[type="text"]').forEach(input => {
		const value = input.type === 'number' ? parseFloat(input.value) : input.value;
		console.log(`Processing input: ${input.id}, value: ${input.value}, parsed value: ${value}`);
		if (input.type === 'number' && !isNaN(value)) {
			settings.numeric[input.id] = value;
		} else {
			settings.numeric[input.id] = value;
		}
	});

	// Print all collected values
	console.log('Collected numeric settings:', settings.numeric);

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
    //const currentDatetime = new Date().toISOString();
    const currentDatetime = getFormattedDate(); //new Date().toLocaleString(); // Use local time


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
    //const currentDatetime = new Date().toISOString();
    const currentDatetime = Date().toLocaleString();// new Date().toLocaleString(); // Use local time
	
	
	

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
	togglePanel('introduction') 
    if (viewByDateInput) {
        //const today = new Date().toISOString().split('T')[0];
	    const today = new Date().toLocaleString();//Date().toLocaleString().split('T')[0]; // Use local time

        viewByDateInput.value = today;
    }

    const findButton = document.getElementById('find_button');
    if (findButton) {
        findButton.addEventListener('click', async () => {
            const date = viewByDateInput.value;
            const trackerDetails = getTrackerDetails();
            const searchOptionsValues = getSearchOptionsValues();
		    const currentDatetime = Date().toLocaleString();//new Date().toLocaleString(); // Use local time
            //const currentDatetime = new Date().toISOString();

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

    //const currentDatetime = new Date().toISOString();
    const currentDatetime = getFormattedDate();//Date().toLocaleString();//new Date().toLocaleString(); // Use local time


    const requestBody = {
        email: email,
        password: password,
        dob: dob,
        gender: gender,
        promo: promo,    
        name: nick,
        string_timestamp: currentDatetime,
        purpose: 'personal'
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
            alert('User created, check your email to verify your account'); // Update this line
            // Optionally, you can reset the form here
            document.getElementById('registrationForm').reset();
			togglePanel('registrationForm');
        } else {
            alert('Error registering user: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('logout_button').addEventListener('click', function() {
    setCookie('access_token', '', 100); // Remove the access token cookie
    alert('You have been logged out.');
    location.reload(); // Reload the page
});



document.addEventListener('DOMContentLoaded', () => {
    const monthSelector = document.getElementById('monthSelector');
    const mentalHealthButton = document.getElementById('mentalHealth');
    const physicalHealthButton = document.getElementById('physicalHealth');
    const relationshipsHealthButton = document.getElementById('relationshipsHealth');

    if (mentalHealthButton) {
        mentalHealthButton.addEventListener('click', () => generateReport(1, monthSelector.value));
    }

    if (physicalHealthButton) {
        physicalHealthButton.addEventListener('click', () => generateReport(2, monthSelector.value));
    }

    if (relationshipsHealthButton) {
        relationshipsHealthButton.addEventListener('click', () => generateReport(3, monthSelector.value));
    }
});

function generateReport(templateId, nMonths) {
    if (!sessionToken) {
        console.error('No authentication token found.');
        return;
    }

    //const currentDatetime = new Date().toISOString();
    const currentDatetime = getFormattedDate();//new Date().toLocaleString(); // Use local time

    const searchOptionsValues = getSearchOptionsValues();
	
    const body = {
        location: location_gps,
        string_timestamp: currentDatetime,
        report_template: templateId,
        n_months: nMonths,
        searchOptions: searchOptionsValues,
		
		
    };

    fetch(`${DOMAIN}/custom_report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(data => {
            if (data.rearrange) {
                rearrange(data.rearrange);
            }
            console.log('Report generated:', data);
        })
        .catch(error => {
            console.error('Error generating report:', error);
        });
}



// Function to save settings
function saveSettings() {
    // Extract the current settings
    const updatedSettings = regenerateSettings();

    // Check if sessionToken is available
    if (!sessionToken) {
        console.error('No authentication token found.');
        alert('You need to be logged in to save settings.');
        return;
    }

    // Send the updated settings to the server
    fetch(`${DOMAIN}/update_settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(updatedSettings)
    })
    .then(response => response.json())
    .then(data => {
		//console.log(data.success); 
		if (data.rearrange) {
			rearrange(data.rearrange);
        }
        //if (data.success) {
        //    alert('Settings saved successfully.');
        //} else {
        //    alert('Error saving settings: ' + data.message);
        //}
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving settings.');
    });
}

// Add an event listener to the "Save Changes" button
document.getElementById('settings_save_button').addEventListener('click', saveSettings);









// Function to show the "not implemented yet" alert
function showNotImplementedAlert() {
    alert("Function not implemented yet, please be patient we are working on it");
}

function voice_recording() {
    const modal = document.getElementById("voiceModal");
    const stopRecordingButton = document.getElementById("stopRecordingButton");
    const closeButton = document.querySelector(".close-button");
    const audioPlayback = document.getElementById("audioPlayback");
	
	
    rearrange({'panels': {'voice-recording': 2}});
	playBeep();
    let mediaRecorder;
    let audioChunks = [];
    let startTime;
    let timerInterval;
	let timerElement;
    function handleStream(stream) {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            clearInterval(timerInterval);
            playBeep(); // Play beep sound when recording stops
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;

            const formData = new FormData();
            formData.append('file', audioBlob, 'voiceRecording.wav');

            try {				
                rearrange({'panels': {'voice-recording': 0}});
                const response = await fetch(`${DOMAIN}/upload_voice`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                console.log('Success:', data);
                if (data.extracted_text) {
                    document.getElementById('entry_box_textarea').value += data.extracted_text;
					if (timerElement) {
						document.querySelector(".voice-recorder-container").removeChild(timerElement);
					}
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        mediaRecorder.start();
        startTime = Date.now();
        updateTimer();
        modal.style.display = "block";

        setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                modal.style.display = "none";
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    function updateTimer() {
        timerElement = document.createElement("div");
        timerElement.id = "recordingTimer";
        document.querySelector(".voice-recorder-container").appendChild(timerElement);
		
        timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            timerElement.textContent = `Recording: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);
    }

    function handleError(error) {
        console.error('Error accessing the microphone:', error);
        alert('Unable to access the microphone.');
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(handleStream)
            .catch(handleError);
    } else {
        alert('getUserMedia API is not supported in your browser.');
    }

    stopRecordingButton.onclick = () => {
        if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
        modal.style.display = "none";
        clearInterval(timerInterval);
    };

    closeButton.onclick = () => {
        modal.style.display = "none";
        clearInterval(timerInterval);
    };

    window.onclick = event => {
        if (event.target == modal) {
            modal.style.display = "none";
            clearInterval(timerInterval);
        }
    };
}

function playBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // You can change this to 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440Hz is the frequency for the beep
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5); // Beep duration
}



function closeCapturePanel() {
    const videoModal = document.getElementById('videoModal');
    videoModal.style.display = 'none';
    
    // Stop the video stream
    const videoElement = document.getElementById('videoElement');
    const stream = videoElement.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

function handleForgotPassword() {
    const email = document.getElementById('login_email').value;

    if (!email) {
        alert('Please enter your email address.');
        return;
    }
    
    fetch(`${DOMAIN}/update_password_request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else if (data.message) {
            alert('Follow the instructions sent to your email to change the password.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again.');
    });
}

function handleSendEmailToDeleteAccount() {

    fetch(`${DOMAIN}/send_email_to_delete_account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else if (data.message) {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again.');
    });
}

// Add event listeners to buttons without assigned functions
document.addEventListener('DOMContentLoaded', () => {
	//initialize asociated functions
    const buttons = {
        'forgot_password_button': handleForgotPassword,      
		'cancelcaptureButton':closeCapturePanel,
		'entry_box_dictate_button': voice_recording,
		'delete_account_button': handleSendEmailToDeleteAccount,
		
		//initialized non implemented functions
        'habit_goal_tracker_reset_button': showNotImplementedAlert,
        'settings_discard_button': showNotImplementedAlert,
        'settings_reset_button': showNotImplementedAlert,        
        'request_data_button': showNotImplementedAlert,
        'import_diary_button': showNotImplementedAlert,
        'refresh_view_button': showNotImplementedAlert,
    };

    Object.keys(buttons).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', buttons[id]);
        }
    });
	
	//initialize date picker for viewer
	const dateInput = document.getElementById('view_by_date');
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
	const day = String(today.getDate()).padStart(2, '0');
	dateInput.value = `${year}-${month}-${day}`;
});









document.addEventListener('DOMContentLoaded', function () {
  const textarea = document.getElementById('entry_box_textarea');
  const minRows = 5;
  const maxRows = 20;

  function getTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  }

  function calculateCharsPerLine(textarea) {
    const font = window.getComputedStyle(textarea).font;
    const width = textarea.offsetWidth;
    const avgCharWidth = getTextWidth('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', font) / 52;
    return Math.floor(width / avgCharWidth);
  }

  function countLines(text, charsPerLine) {
    const lines = text.split('\n');
    let totalLines = 0;
    lines.forEach(line => {
      const lineCount = Math.ceil(line.length / charsPerLine);
      totalLines += lineCount;
    });
    return totalLines;
  }

  function adjustTextareaHeight() {
    const text = textarea.value;
    const charsPerLine = calculateCharsPerLine(textarea);
    const lines = countLines(text, charsPerLine);
    textarea.rows = Math.max(minRows, Math.min(maxRows, lines));
  }

  textarea.addEventListener('input', adjustTextareaHeight);
  window.addEventListener('resize', adjustTextareaHeight);

  // Initial adjustment
  adjustTextareaHeight();
});


// Function to hide the footer and save cookie on acceptance
function acceptCookies() {
	document.getElementById('footerSection').style.display = 'none'; // Hide the footer
	document.cookie = "cookiesAccepted=true; expires=Sat, 03 Aug 2030 12:00:00 UTC; path=/"; // Set a cookie indicating acceptance
}

// Check if the user has previously accepted the use of cookies
if (document.cookie.replace(/(?:(?:^|.*;\s*)cookiesAccepted\s*\=\s*([^;]*).*$)|^.*$/, "\$1") !== 'true') {
	document.getElementById('footerSection').style.display = 'block'; // Display the footer if the cookie is not set
} else {
	document.getElementById('footerSection').style.display = 'none'; // Hide the footer if the cookie is set
}


function captureAndUploadImage() {
    console.log("captureAndUploadImage function called");

    // Function to handle the video stream
    function handleStream(stream) {
        const rearrangeConfig = {
            'panels': {'video': 2}
        };
        rearrange(rearrangeConfig);

        // Show the modal and expand the scanner panel
        expandScannerPanel();
        var modal = document.getElementById("videoModal");
        var videoElement = document.getElementById("videoElement");
        var captureButton = document.getElementById("captureButton");
        var closeButton = document.querySelector(".close-button");

        videoElement.srcObject = stream;
        modal.style.display = "block";

        closeButton.onclick = function() {
            modal.style.display = "none";
            stream.getTracks().forEach(track => track.stop());
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                stream.getTracks().forEach(track => track.stop());
            }
        }

        captureButton.onclick = function() {
            const rearrangeConfig = {
                'panels': {'video': 0}
            };
            rearrange(rearrangeConfig);

            // Create a canvas element to capture the image
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            // Set canvas dimensions to match video
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            // Draw the video frame to the canvas
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Stop the video stream
            stream.getTracks().forEach(track => track.stop());

            // Convert the canvas to a blob
            canvas.toBlob(function(blob) {
                // Create a FormData object to send the image
                var formData = new FormData();
                formData.append('file', blob, 'photo.jpg');

                // Send the image to the server
                fetch(`${DOMAIN}/upload`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    if (data.extracted_text) {
                        document.getElementById('entry_box_textarea').value += data.extracted_text;
                    }
                    modal.style.display = "none";
                    collapseScannerPanel();  // Collapse the scanner panel after the image is processed
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }, 'image/jpeg');
        }
    }

    // Function to handle errors
    function handleError(error) {
        console.error('Error accessing the camera:', error);
        if (error.name === 'OverconstrainedError') {
            // Fallback to default camera if back camera is not available
            navigator.mediaDevices.getUserMedia({ video: true }).then(handleStream).catch(function(error) {
                console.error('Error accessing the default camera:', error);
                alert('Unable to access the camera.');
            });
        } else {
            alert('Unable to access the camera.');
        }
    }

    // Check if the browser supports the getUserMedia API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
            .then(handleStream)
            .catch(handleError);
    } else {
        alert('getUserMedia API is not supported in your browser.');
    }
}


function expandScannerPanel() {
    const panelSection = document.getElementById('video');
    const panel = panelSection.querySelector('.panel');
    const header = panelSection.querySelector('.panel-header');

    panel.style.display = 'block';
    header.textContent = header.textContent.replace('➕', '➖');
}

function collapseScannerPanel() {
    const panelSection = document.getElementById('video');
    const panel = panelSection.querySelector('.panel');
    const header = panelSection.querySelector('.panel-header');

    panel.style.display = 'none';
    header.textContent = header.textContent.replace('➖', '➕');
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    document.getElementById('entry_box_scan_button').addEventListener('click', captureAndUploadImage);
    console.log("Event listener added to entry_box_scan_button");
});

