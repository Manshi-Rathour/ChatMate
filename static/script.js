console.log("Script loaded");

document.getElementById('logoImage').addEventListener('click', function() {
    stopSpeaking(); 
    location.reload();
});

document.addEventListener("DOMContentLoaded", function() {
    startTypingEffect(); // Start the typing effect on initial load
});

function startTypingEffect() {
    const textElement = document.getElementById("typingEffect");
    const text = textElement.textContent;
    textElement.textContent = ""; // Clear the text element to start from an empty state
    let index = 0;

    function type() {
        if (index < text.length) {
            textElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100); // Adjust the typing speed here
        }
    }

    type(); // Start the typing effect
}

// Function to stop any ongoing speech synthesis
function stopSpeaking() {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
}

document.getElementById('toggleRightPaneBtn').addEventListener('click', function() {
    console.log('Toggle Right Pane button clicked');
    const rightPane = document.getElementById('rightPane');
    const leftPane = document.getElementById('leftPane');

    if (rightPane.classList.contains('hidden')) {
        // Show the right pane and shrink the left pane
        rightPane.classList.remove('hidden');
        leftPane.style.width = '70%';
    } else {
        // Hide the right pane and expand the left pane
        rightPane.classList.add('hidden');
        leftPane.style.width = '100%';
    }
});

document.getElementById('startChat').addEventListener('click', function() {
    console.log('Start Chat button clicked');
    document.getElementById('content').style.display = 'none';
    document.getElementById('chatSection').style.display = 'flex';
});

document.getElementById('backToMain').addEventListener('click', function() {
    console.log('Back to Main button clicked');
    stopSpeaking(); 
    document.getElementById('content').style.display = 'flex';
    document.getElementById('chatSection').style.display = 'none';
    startTypingEffect(); // Restart the typing effect when returning to the main page
});






// Voice Wave Drawing Logic (Equalizer Style)
const voiceWaveDiv = document.getElementById('voiceWave');
const canvas = document.createElement('canvas');
voiceWaveDiv.appendChild(canvas);

const ctx = canvas.getContext('2d');
let isSpeaking = false;
let bars = []; // Array to hold bar heights
const numberOfBars = 30; // Number of equalizer bars
const maxBarHeight = 150; // Maximum height of the bars
const updateInterval = 200; // Time in milliseconds to update the bar heights

// Adjust canvas size dynamically
function adjustCanvasSize() {
    canvas.width = voiceWaveDiv.offsetWidth;
    canvas.height = voiceWaveDiv.offsetHeight;
}

// Function to generate random bars
function generateBars() {
    bars = Array.from({ length: numberOfBars }, () => Math.random() * maxBarHeight);
}

// Function to draw the equalizer bars
function drawEqualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    const barWidth = canvas.width / numberOfBars;

    bars.forEach((height, index) => {
        const x = index * barWidth;
        ctx.fillStyle = '#403035'; // Bar color
        ctx.fillRect(x, canvas.height - height, barWidth - 2, height);
    });

    if (isSpeaking) {
        requestAnimationFrame(drawEqualizer);
    }
}

// Function to update bar heights
function updateBars() {
    if (!isSpeaking) return;

    bars = bars.map(height => Math.max(10, Math.random() * maxBarHeight)); // Randomly update heights
    setTimeout(updateBars, updateInterval); // Call updateBars again after the specified interval
}

// Stop the bars when speech recognition ends
function stopEqualizer() {
    isSpeaking = false;
    // Do not clear the canvas, just stop updating heights
}

// Start the bars animation and drawing
function startEqualizer() {
    isSpeaking = true;
    adjustCanvasSize(); // Adjust canvas size before drawing
    generateBars(); // Generate initial bars
    drawEqualizer(); // Start drawing the bars
    updateBars(); // Start updating the bars
}

// Function to display random bars on page load
function showInitialBars() {
    adjustCanvasSize(); // Ensure canvas is correctly sized
    generateBars(); // Generate random heights for the bars
    drawEqualizer(); // Draw the bars on the canvas
}


// Show initial random bars on page load
window.onload = showInitialBars;






let isRecognizing = false;
let recognition = null;
let finalTranscript = ''; // Store final transcript after user stops talking
let interimTranscript = ''; // Store interim transcript for UI updates
let pauseTimeout = null; // Timer to detect pauses in speech

function initializeRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support speech recognition.");
        return;
    }
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep the recognition active until explicitly stopped
    recognition.interimResults = true; // Get interim results while speaking

    recognition.onstart = function() {
        console.log("Speech recognition started");
        isRecognizing = true;
        startEqualizer(); // Start equalizer on speech recognition start
    };

    recognition.onend = function() {
        console.log("Speech recognition ended");
        stopEqualizer();

        // Reset the icon to 'fa-play' when recognition ends
        const button = document.getElementById('playBtn');
        const buttonIcon = button.querySelector('i');
        buttonIcon.classList.remove('fa-times');
        buttonIcon.classList.add('fa-play');
        button.title = 'Start Speech Recognition';
    };

    recognition.onresult = function(event) {
        clearTimeout(pauseTimeout); // Reset the pause timer

        interimTranscript = ''; // Reset interimTranscript for new accumulation

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript; // Append to final transcript
                console.log("Final result received:", finalTranscript); // Debugging statement
                processFinalTranscript(); // Send final transcript to backend after processing
            } else {
                interimTranscript += event.results[i][0].transcript; // Accumulate interim results
            }
        }

        // Update the UI with the interim transcript only
        updateTranscript(interimTranscript);

        // Set timeout to detect 1-second pause in speech, but do NOT stop recognition
        pauseTimeout = setTimeout(() => {
            console.log("Pause detected, processing final transcript");
            processFinalTranscript(); // Process the final transcript but keep the mic active
        }, 1000); // Wait 1 second for pause detection
    };
}

function processFinalTranscript() {
    // If there's a final transcript, send it to the backend
    if (finalTranscript.trim()) {
        console.log("Final Transcript (sending to backend): ", finalTranscript);

        // Send the final transcript to the backend
        sendMessageToChatbot(finalTranscript).then(response => {
            // Append the chatbot's response to the UI
            appendMessage('Chatbot', response.message);

            // Stop recognition temporarily while the bot speaks
            if (isRecognizing) {
                recognition.stop();  // Stop recognizing to avoid interference with bot's speech
                updateMicButton(false); // Update the button to reflect mic stopped
            }

            // Speak the chatbot's response, and restart recognition after speaking
            speakText(response.message, 'en-US').then(() => {

                console.log("Bot finished speaking, restarting recognition if it was on");

                // Once the bot finishes speaking, restart recognition if it was previously on
                if (isRecognizing) {
                    recognition.start();  // Restart recognition after bot speaks
                    updateMicButton(true); // Update the button to reflect mic restarted
                }
            });
        });

        // Reset the final transcript after sending to backend
        finalTranscript = '';
    }
}

async function speakText(text, language) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;

        // Start the equalizer when speech synthesis begins
        startEqualizer();

        // Resolve the promise when speech synthesis ends
        utterance.onend = () => {
            console.log("Speech synthesis ended");
            isSpeaking = false;  // Set speaking status to false when done
            stopEqualizer(); // Stop the equalizer when speech ends
            resolve();
        };

        window.speechSynthesis.speak(utterance);
    });
}

function updateTranscript(interimText) {
    const responseDiv = document.getElementById('responseDiv');
    let lastUserMessage = responseDiv.querySelector('p.user-message:last-of-type');

    // If there's an existing interim message, update it with the current interim text
    if (lastUserMessage && interimText) {
        lastUserMessage.innerHTML = `<i class="fas fa-user"></i> : ${interimText}`; // Only show interim text
    } 
    // If no previous interim message, append a new one for the interim text
    else if (interimText) {
        appendMessage('User', interimText); // Append a new message with interim text
    }
}

function appendMessage(role, text) {
    const messageElement = document.createElement('p');
    const icon = role === 'User' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    messageElement.innerHTML = `${icon} : ${text}`;
    messageElement.style.padding = '5px';
    messageElement.style.color = "#403035";
    messageElement.classList.add(`${role.toLowerCase()}-message`); // Add class for easy targeting
    if (role === 'Chatbot') {
        messageElement.style.backgroundColor = "#ffb5a7";
        messageElement.style.borderRadius = "3px";
    }
    document.getElementById('responseDiv').appendChild(messageElement);

    // Scroll to the bottom to always show the latest message
    const responseDiv = document.getElementById('responseDiv');
    responseDiv.scrollTop = responseDiv.scrollHeight;
}

// Function to update the microphone button icon and tooltip
function updateMicButton(isRecognizing) {
    const button = document.getElementById('playBtn');
    const buttonIcon = button.querySelector('i');

    if (isRecognizing) {
        buttonIcon.classList.remove('fa-play');
        buttonIcon.classList.add('fa-times');
        button.title = 'Stop Speech Recognition';
    } else {
        buttonIcon.classList.remove('fa-times');
        buttonIcon.classList.add('fa-play');
        button.title = 'Start Speech Recognition';
    }
}

// Play button event listener to start/stop recording
document.getElementById('playBtn').addEventListener('click', function() {
    console.log('Play button clicked');
    
    if (isRecognizing) {
        recognition.stop(); // Stop recognition on user command
        updateMicButton(false); // Update the button to reflect mic stopped
        isRecognizing = false; // Set recognizing state to false
        stopEqualizer(); // Stop the equalizer but keep bars
    } else {
        if (!recognition) {
            initializeRecognition(); // Initialize recognition if not already done
        }
        recognition.start(); // Start recognizing
        startEqualizer(); // Start the equalizer
        updateMicButton(true); // Update the button to reflect mic started
        isRecognizing = true; // Set recognizing state to true
    }
});

async function sendMessageToChatbot(message) {
    try {
        const response = await fetch('/chatbot', {
            method: 'POST',
            body: JSON.stringify({ message }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const jsonResponse = await response.json();
        console.log("Backend response:", jsonResponse);
        return jsonResponse;
    } catch (error) {
        console.error('Error in sendMessageToChatbot:', error);
        return { message: `Error: ${error.message}` };
    }
}
