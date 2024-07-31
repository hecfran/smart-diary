const DOMAIN2 = 'http://127.0.0.1:5000';

async function fetchStats() {
    const url = `${DOMAIN2}/db/stats`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const dataString = JSON.stringify(data, null, 2); // Convert JSON object to string with pretty printing
        alert(dataString); // Display the JSON string in a pop-up
        return data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        alert('Error fetching stats');
        return null;
    }
}


window.onload = function() {
	// Example usage
	fetchStats().then(data => {
		if (data) {
			console.log('Stats:', data);
		} else {
			console.log('Failed to fetch stats');
		}
	});
	
	
	
	
	
	
    const jsonObject = {
        "pop-up": "Welcome to Hero's Diary!",
        "panels": {
            "log_in": 2,
            "register": 1,
			"membership":0,
			"about":0
			
        },
        "re-name": {
            "header_message": "Bienvenue à Hero's Diary",
            "register-header": "S'inscrire",
			"log_in-header":"logear en mi diario"
        }
    };
    rearrange(jsonObject);
};





// Example dictionary object
const settings = {
    "binary": {
        "month_email": {
            "complexity": 20,
            "help": "would you like monthly summaries of your diary?",
            "localized_name": "email me monthly reports",
            "order": 2.0,
            "value": false
        },
		"location": {
            "complexity": 50,
            "help": "add your location to each journal entry",
            "localized_name": "share location",
            "order": 43,
            "value": false
        },
        "week_email": {
            "complexity": 7,
            "help": "would you like weekly summaries of your diary?",
            "localized_name": "email me weekly reports",
            "order": 1.0,
            "value": false
        }
    },
    "list": {
        "lan": {
            "complexity": 0,
            "help": "choose the language of the system",
            "localized_name": "App language",
            "options": [
                "English-USA",
                "Spanish"
            ],
            "order": 3.0,
            "value": "English-USA"
        }
    },
    "numeric": {
        "lucky": {
            "complexity": 20,
            "help": "which is your lucky number",
            "localized_name": "lucky number",
            "order": 3.0,
            "value": 33,
            "min": 1,
            "max": 100,
            "float_value": true
        }
    },
    "text": {
        "nick-name": {
            "complexity": 0,
            "help": "your name for refering to you when writing reporst in third person",
            "localized_name": "nick-name",
            "order": 0,
            "paragraph": false,
            "value": "Dan"
        },		
        "person": {
            "complexity": 20,
            "help": "extra background for the AI to write summaries",
            "localized_name": "personal characteristics background",
            "order": 1.1,
            "paragraph": true,
            "value": "Name: Alex, gender: male, age:35"
        },
        "summary_instructions_month": {
            "complexity": 20,
            "help": "write the instruction to the AI on how to write your summaries",
            "localized_name": "summary instructions for the month",
            "order": 4.0,
            "paragraph": true,
            "value": "write a summary describing me in third person, with emphasis on achievements."
        },
        "summary_instructions_week": {
            "complexity": 7,
            "help": "write the instruction to the AI on how to write your summaries",
            "localized_name": "summary instructions for the week",
            "order": 4.0,
            "paragraph": true,
            "value": "write a summary describing me in third person, with emphasis on achievements."
        }
    }
};

// Call the function with the example settings
updatePanelSettings(settings);
updatePanelSettings(settings);
// Example usage:
const updatedSettings_test = regenerateSettings();
console.log(updatedSettings_test);
