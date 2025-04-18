# MCP Automation Server

This server provides automated task execution for your website through natural language prompts.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

## Usage

Send POST requests to `http://localhost:3000/automate` with a JSON body containing a `prompt` field.

### Example Prompts

1. Login:
```json
{
    "prompt": "login with email: user@example.com password: mypassword"
}
```

2. Navigation:
```json
{
    "prompt": "go to contact us page"
}
```

3. Form Filling:
```json
{
    "prompt": "fill form with name: John email: john@example.com message: Hello"
}
```

### Response Format

The server will respond with a JSON object containing:
```json
{
    "success": true/false,
    "message": "Task execution result message"
}
```

## Features

- Natural language processing for task understanding
- Automated browser control
- Support for:
  - Login operations
  - Page navigation
  - Form filling and submission
- Error handling and reporting

## Configuration

The server is configured to work with your website at `http://localhost:3095`. To change this, modify the `BASE_URL` constant in `src/services/automationService.js`. 