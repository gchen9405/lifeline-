CIS 4120 Final Project
Gordon Chen, Fiona Herzog, Michael Pignatelli

Lifeline is a healthcare management web application that allows users to manage their healthcare activities. It consolidates medications, lab results, and medical apointments into a single chronological timeline interface with AI-powered assistance. 

Frontend: React application built with Typescript, TailwindCSS
Backend: we will not be making a true backend
AI Integration: Google Gemini 2.5 Flash Lite

Acknowledgements: we utilized AI tools including ChatGPT and Gemini to generate starter code and debug

### Requirements
- A `.env` file in the project root with your Gemini key:

```bash
GEMINI_API_KEY=api_key_here
```

To run the demo locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2. **In a second terminal**:
   PORT=3001 node server/index.cjs

3.  **Start the Dev Server**:
    ```bash
    npm run dev
    ```

4.  **View the Pages**:
    Once the server is running, you can access the demo at the following URL:
    `http://localhost:5173/`
