# Automate Jobs

A Windows desktop agent that can use your mouse, keyboard, browser, and apps the way a person would. You describe a task in plain language. The agent looks at the screen, then clicks, types, scrolls, and opens sites until the work is done.

`app.py` is the main program.

## What `app.py` does

`app.py` runs a loop:

1. You give it a task (as a command-line argument, or when it asks).
2. It waits a few seconds so you can abort if needed.
3. It takes a screenshot of your desktop.
4. A language model plans the next action from that screenshot.
5. It calls a tool: click, type, paste, open a browser, focus a window, and so on.
6. It takes another screenshot and repeats until it calls `finish`.

It does not scrape job boards in the background. It drives the real UI on your PC, so it can work with any site or app you already use in a browser.

Useful actions it can take:

- Open a browser to a URL
- Focus an existing window
- Click, double-click, right-click, drag, and scroll
- Type or paste text
- Press keys and shortcuts (for example Enter, Tab, Ctrl+L)
- Wait for a page to load
- Read and write text files inside this project folder
- Capture the screen so it can aim clicks at the right pixels

Move the mouse to a screen corner to abort (`PyAutoGUI` failsafe). Do not use the mouse or keyboard while a task is running, or the agent will click the wrong place.

## How this helps with finding jobs

Job search is mostly clicking through the same sites, filters, and forms. This agent can sit on your machine and do that navigation for you.

![Naukri Campus job listings](http://res.cloudinary.com/dakddv1pm/image/upload/v1793029476/posts/yjnxhtmwdiqw2s9iot1h.png)

Examples of tasks you can give it:

- Open LinkedIn, Naukri, Indeed, or a company careers page and search for a role and location
- Apply filters (experience, remote, date posted) and scroll through results
- Open listings one by one and copy titles, companies, and links into a notes file in this project
- Fill search boxes, follow “Easy Apply” or similar flows that you already have an account for
- Jump between tabs, go back if a click missed, and keep going until a list of openings is collected

You stay in control of the wording. A good prompt is specific: which site, which keywords, which city, how many listings, and where to save notes.

This is not a guarantee of interviews. It speeds up the repetitive parts of searching and collecting openings so you can spend time on applications that actually fit.

## Setup on a local Windows PC

This project is written for **Windows**. It uses Windows window focus and `os.startfile`.

### 1. Install Python

Install Python 3.11 or newer from [python.org](https://www.python.org/downloads/). During install, enable **Add Python to PATH**.

Check:

```powershell
python --version
```

### 2. Open the project folder

```powershell
cd path\to\mini-projects\automate-jobs
```

### 3. Create a virtual environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks scripts, run this once, then activate again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 4. Install dependencies

```powershell
pip install -r requirements.txt
```

### 5. Add environment variables

Create a `.env` file in `automate-jobs` (same folder as `app.py`). Do not commit this file. `app.py` loads it automatically.

`app.py` uses `ChatOpenAI`, so it needs this variable:

| Variable | Required | Used for |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Authenticates the language model that plans clicks and types |

Example `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
```

Replace the placeholder with your own key. Do not paste real keys into chat, git, or this README.

### 6. Run a task

From the `automate-jobs` folder, with the virtual environment active:

```powershell
python app.py "Open LinkedIn Jobs and search for Python developer roles in Bangalore. Save the first five job titles and links to a text file in this project."
```

If you run it with no argument, it asks:

```text
PC task:
```

Type the task and press Enter.

You have **3 seconds** after start before it begins. Use that window to switch to the desktop you want it to use.

## Tips

- Leave the browser and target site already signed in if the site needs an account.
- Keep the window large and unobstructed so screenshots match what you see.
- Start with a short task (open a site and search) before a long apply loop.
- The latest screenshot is saved as `latest_browser.jpg` in this folder.

## Safety

The agent can click anywhere on the screen and type into the focused window. Run it only on your own PC. Do not point it at banking, password managers, or anything you would not click yourself. Keep secrets out of prompts and out of files you ask it to write.
