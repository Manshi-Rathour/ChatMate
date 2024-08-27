console.log("Script loaded");

document.getElementById('logoImage').addEventListener('click', function() {
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

document.getElementById('startChat').addEventListener('click', function() {
    console.log('Start Chat button clicked');
    document.getElementById('content').style.display = 'none';
    document.getElementById('chatSection').style.display = 'flex';
});

document.getElementById('backToMain').addEventListener('click', function() {
    console.log('Back to Main button clicked');
    document.getElementById('content').style.display = 'flex';
    document.getElementById('chatSection').style.display = 'none';
    startTypingEffect(); // Restart the typing effect when returning to the main page
});

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

let isRecognizing = false;
let recognition = null;

function initializeRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support speech recognition.");
        return;
    }
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        console.log("Speech recognition started");
        isRecognizing = true;
        updateMuteButton();
    };

    recognition.onend = function() {
        console.log("Speech recognition ended");
        isRecognizing = false;
        updateMuteButton();
    };

    recognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        console.log("Speech recognized: ", transcript);
    };
}

function updateMuteButton() {
    const muteBtnIcon = document.querySelector('#muteBtn i');
    if (isRecognizing) {
        muteBtnIcon.classList.remove('fa-microphone-slash');
        muteBtnIcon.classList.add('fa-microphone');
        muteBtnIcon.title = 'Voice Recognizing';
    } else {
        muteBtnIcon.classList.remove('fa-microphone');
        muteBtnIcon.classList.add('fa-microphone-slash');
        muteBtnIcon.title = 'Voice Recognizing Stopped';
    }
}

document.getElementById('muteBtn').addEventListener('click', function() {
    console.log('Mute button clicked');
    if (isRecognizing) {
        // Stop speech recognition
        recognition.stop();
    } else {
        // Start speech recognition
        if (!recognition) {
            initializeRecognition();
        }
        recognition.start();
    }
});

document.getElementById('exitBtn').addEventListener('click', function() {
    console.log('Exit button clicked');

    const button = document.getElementById('exitBtn');
    const buttonIcon = button.querySelector('i');

    if (isRecognizing) {
        // Stop speech recognition and go back to the main page
        recognition.stop();
        buttonIcon.classList.remove('fa-times');
        buttonIcon.classList.add('fa-play'); // Switch to a play icon
        button.title = 'Start Speech Recognition'; // Change tooltip text
        isRecognizing = false;

        // Go back to the main page
        document.getElementById('chatSection').style.display = 'none';
        document.getElementById('content').style.display = 'flex';
        startTypingEffect(); // Restart the typing effect when returning to the main page
    } else {
        // Start speech recognition
        if (!recognition) {
            initializeRecognition();
        }
        recognition.start();
        buttonIcon.classList.remove('fa-play');
        buttonIcon.classList.add('fa-times'); // Switch to an exit icon
        button.title = 'Stop Speech Recognition'; // Change tooltip text
        isRecognizing = true;
    }
});

document.getElementById('voiceWave').addEventListener('click', function() {
    console.log('Voice Wave clicked');
    const voiceWave = document.getElementById('voiceWave');
    voiceWave.style.animation = 'vibrate 0.5s linear infinite';
    setTimeout(() => {
        voiceWave.style.animation = '';
    }, 2000);
});
