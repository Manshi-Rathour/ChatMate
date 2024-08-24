document.getElementById('startChat').addEventListener('click', function() {
    // Hide the content section
    document.getElementById('content').style.display = 'none';

    // Show the chat section
    document.getElementById('chatSection').style.display = 'block';
});


document.getElementById('backToMain').addEventListener('click', function() {
    // Show the content section
    document.getElementById('content').style.display = 'flex';

    // Hide the chat section
    document.getElementById('chatSection').style.display = 'none';
});


document.addEventListener("DOMContentLoaded", function() {
    const textElement = document.getElementById("typingEffect");
    const text = textElement.textContent;
    textElement.textContent = ""; // Clear the text element
    let index = 0;

    function type() {
        if (index < text.length) {
            textElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100); // Adjust speed of typing here
        }
    }

    type(); // Start typing effect
});
