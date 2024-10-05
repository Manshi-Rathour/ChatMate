from flask import Flask, render_template, request, jsonify
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

app.static_folder = 'static'
app.template_folder = 'templates'

# Get the OpenAI API key from the environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")


# Define a class to parse the incoming request (if necessary)
class ChatInput:
    def __init__(self, message):
        self.message = message


@app.route("/")
def index():
    return render_template("index.html")


# Route to handle chatbot response requests
@app.route("/chatbot", methods=['POST'])
def get_response():
    try:
        # Get the message from the frontend (sent in JSON format)
        data = request.get_json()

        # Ensure the 'message' key exists in the request
        if not data or 'message' not in data:
            return jsonify({"message": "Invalid request. 'message' is required"}), 400

        # Create ChatInput object with the user message
        input_data = ChatInput(data['message'])

        # Call the function to get a response from OpenAI
        response = fetch_openai_response(input_data)

        # Return the response as JSON back to the frontend
        return jsonify(response)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": f"Error: {str(e)}"}), 500


# Function to interact with OpenAI API and fetch chatbot response
def fetch_openai_response(input_data: ChatInput):
    user_message = input_data.message
    messages = [
        {"role": "system", "content": "You are a helpful chatbot."},
        {"role": "user", "content": user_message}
    ]

    try:
        # Call the OpenAI API to get the chatbot's response
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        print('OpenAI API Response:', response)

        # Parse OpenAI's response and return the chatbot's message
        if hasattr(response, 'choices') and response.choices:
            if hasattr(response.choices[0], 'message') and response.choices[0].message:
                if hasattr(response.choices[0].message, 'content') and response.choices[0].message.content:
                    assistant_message = response.choices[0].message.content
                    return {"message": assistant_message}
                else:
                    print("Error: 'content' key does not exist in 'message'")
            else:
                print("Error: 'message' key does not exist in 'choices'")
        else:
            print("Error: 'choices' key does not exist in response or is empty")

        # Return an error message if something went wrong with the API response
        return {"message": "Error: Unexpected response from OpenAI"}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"message": f"Error: {str(e)}"}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
