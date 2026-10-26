import base64
import os
import subprocess
import sys
import time
import webbrowser
from typing import Annotated, Literal, TypedDict

import pyautogui
import pygetwindow as gw
import pyperclip
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

load_dotenv()

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.35

SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SERVER_DIR, ".."))
LATEST_SCREENSHOT = os.path.join(SERVER_DIR, "latest_browser.jpg")

llm = ChatOpenAI(model="gpt-5.4-mini", temperature=0)


def click(x, y):
    pyautogui.click(x, y)


def type_text(text):
    pyautogui.write(text, interval=0.03)


def press_key(key):
    pyautogui.press(key)


def take_screenshot():
    image = pyautogui.screenshot()
    image.convert("RGB").save(LATEST_SCREENSHOT, quality=70)
    return image


def screenshot_as_data_url() -> str | None:
    if not os.path.exists(LATEST_SCREENSHOT):
        return None
    with open(LATEST_SCREENSHOT, "rb") as file:
        encoded = base64.b64encode(file.read()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"


def safe_project_path(relative_path: str) -> str:
    path = os.path.abspath(os.path.join(PROJECT_ROOT, relative_path))
    if not path.startswith(PROJECT_ROOT):
        raise ValueError("Path must stay inside the project folder.")
    return path


def after_action(message: str) -> str:
    time.sleep(0.25)
    take_screenshot()
    width, height = pyautogui.size()
    x, y = pyautogui.position()
    return f"{message} Screen {width}x{height}. Mouse at ({x}, {y})."


@tool
def capture_screen() -> str:
    """Take a screenshot of the current desktop so you can plan the next action."""
    return after_action("Captured screen.")


@tool
def screen_info() -> str:
    """Return screen size, mouse position, and visible window titles."""
    width, height = pyautogui.size()
    x, y = pyautogui.position()
    titles = [window.title for window in gw.getAllWindows() if window.title.strip()]
    preview = titles[:25]
    return (
        f"Screen {width}x{height}. Mouse ({x}, {y}). "
        f"Windows: {preview}"
    )


@tool
def open_browser(url: str = "https://www.google.com") -> str:
    """Open the default web browser at a URL."""
    webbrowser.open(url)
    time.sleep(2.5)
    return after_action(f"Opened browser at {url}.")


@tool
def open_app(target: str) -> str:
    """Open an app, file, or folder on this Windows PC. Examples: notepad, calc, chrome, msedge, explorer, code, a full path."""
    target = target.strip()
    if target.startswith(("http://", "https://")):
        webbrowser.open(target)
    else:
        try:
            os.startfile(target)
        except OSError:
            subprocess.Popen(
                ["cmd", "/c", "start", "", target],
                shell=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
    time.sleep(2)
    return after_action(f"Launched {target}.")


@tool
def focus_window(title: str) -> str:
    """Focus the first window whose title contains this text."""
    matches = [
        window
        for window in gw.getAllWindows()
        if title.lower() in (window.title or "").lower()
    ]
    if not matches:
        titles = [window.title for window in gw.getAllWindows() if window.title.strip()]
        return f"No window matching '{title}'. Visible: {titles[:25]}"
    window = matches[0]
    try:
        if window.isMinimized:
            window.restore()
    except gw.PyGetWindowException:
        pass
    try:
        window.activate()
    except gw.PyGetWindowException:
        # Windows often returns error code 0 even when activate worked.
        pass
    try:
        click_x = window.left + max(window.width // 2, 40)
        click_y = window.top + 24
        pyautogui.click(click_x, click_y)
    except Exception:
        pass
    time.sleep(0.4)
    return after_action(f"Focused window: {window.title}")


@tool
def click_screen(x: int, y: int) -> str:
    """Left-click a screen pixel. Use coordinates from the latest screenshot."""
    click(x, y)
    return after_action(f"Clicked ({x}, {y}).")


@tool
def double_click_screen(x: int, y: int) -> str:
    """Double-click a screen pixel. Use this to open files and desktop icons."""
    pyautogui.doubleClick(x, y)
    return after_action(f"Double-clicked ({x}, {y}).")


@tool
def right_click_screen(x: int, y: int) -> str:
    """Right-click a screen pixel to open a context menu."""
    pyautogui.rightClick(x, y)
    return after_action(f"Right-clicked ({x}, {y}).")


@tool
def move_mouse(x: int, y: int) -> str:
    """Move the mouse without clicking."""
    pyautogui.moveTo(x, y, duration=0.2)
    return after_action(f"Moved mouse to ({x}, {y}).")


@tool
def drag_mouse(x: int, y: int, duration: float = 0.4) -> str:
    """Drag from the current mouse position to (x, y)."""
    pyautogui.dragTo(x, y, duration=max(0.1, min(duration, 3)))
    return after_action(f"Dragged to ({x}, {y}).")


@tool
def type_text_tool(text: str) -> str:
    """Type into the focused field. Click the field first. Prefer paste_text for long or unicode text."""
    type_text(text)
    return after_action("Typed text.")


@tool
def paste_text(text: str) -> str:
    """Paste text into the focused field using the clipboard. Better for long text, URLs, and code."""
    pyperclip.copy(text)
    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.2)
    return after_action("Pasted text.")


@tool
def press_browser_key(key: str) -> str:
    """Press one key, such as enter, tab, escape, backspace, delete, down, up, left, right, home, end."""
    press_key(key)
    return after_action(f"Pressed {key}.")


@tool
def press_hotkey(keys: str) -> str:
    """Press a key chord. Examples: ctrl+l, ctrl+t, ctrl+s, ctrl+c, ctrl+v, alt+tab, win+e, ctrl+enter."""
    pyautogui.hotkey(*[part.strip() for part in keys.split("+")])
    return after_action(f"Pressed {keys}.")


@tool
def scroll_page(clicks: int) -> str:
    """Scroll the focused window. Positive clicks scroll up, negative scroll down."""
    pyautogui.scroll(clicks)
    return after_action(f"Scrolled {clicks} clicks.")


@tool
def wait_for_page(seconds: float = 2.0) -> str:
    """Wait for a page, app, or animation to settle."""
    time.sleep(max(0.2, min(seconds, 10)))
    return after_action(f"Waited {seconds} seconds.")


@tool
def list_project_files(relative_dir: str = ".") -> str:
    """List files in a folder inside this project. Path is relative to the project root."""
    path = safe_project_path(relative_dir)
    if not os.path.isdir(path):
        return f"Not a directory: {relative_dir}"
    names = sorted(os.listdir(path))[:80]
    return f"{relative_dir}: {names}"


@tool
def read_project_file(relative_path: str) -> str:
    """Read a text file from this project. Path is relative to the project root."""
    path = safe_project_path(relative_path)
    if not os.path.isfile(path):
        return f"File not found: {relative_path}"
    with open(path, encoding="utf-8", errors="replace") as file:
        content = file.read(12000)
    return content


@tool
def write_project_file(relative_path: str, content: str) -> str:
    """Create or overwrite a text file inside this project. Path is relative to the project root."""
    path = safe_project_path(relative_path)
    os.makedirs(os.path.dirname(path) or PROJECT_ROOT, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)
    return f"Wrote {len(content)} characters to {relative_path}."


@tool
def finish(summary: str) -> str:
    """Call this only when the user's task is fully complete. This is the only way to stop."""
    return summary


all_tools = [
    capture_screen,
    screen_info,
    open_browser,
    open_app,
    focus_window,
    click_screen,
    double_click_screen,
    right_click_screen,
    move_mouse,
    drag_mouse,
    type_text_tool,
    paste_text,
    press_browser_key,
    press_hotkey,
    scroll_page,
    wait_for_page,
    list_project_files,
    read_project_file,
    write_project_file,
    finish,
]
llm_with_tools = llm.bind_tools(all_tools)

SYSTEM_PROMPT = """You operate this Windows PC with tools: mouse, keyboard, apps, browser, and project files.

Rules:
- Always call a tool. Never reply with only text.
- Call finish(summary) only when the user's request is fully done. That is the only stop.
- Start with capture_screen or screen_info so you can see the desktop.
- Click using screenshot pixel coordinates. Origin is the top-left of the screen.
- Open websites with open_browser(url). Open programs with open_app (notepad, calc, chrome, code, explorer).
- Focus an existing window with focus_window instead of clicking randomly.
- Call one mouse/keyboard/window tool per turn. Do not pair focus_window with open_browser in the same turn.
- For long text or code, use paste_text, not typing character by character.
- To change this project, use list_project_files / read_project_file / write_project_file. Do not mouse-type into the editor.
- After UI actions, look at the new screenshot before the next click.
- If a click misses, capture_screen and try again. Do not give up with a chat message.
"""

NUDGE = (
    "You answered with text and no tool. That is not allowed. "
    "Call a tool now to continue, or call finish if the task is truly complete."
)


class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def with_screenshot(messages: list[BaseMessage]) -> list[BaseMessage]:
    data_url = screenshot_as_data_url()
    if not data_url:
        return messages
    width, height = pyautogui.size()
    return messages + [
        HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": (
                        f"Current screenshot. Screen size is {width}x{height}. "
                        "Choose click coordinates in this image."
                    ),
                },
                {"type": "image_url", "image_url": {"url": data_url}},
            ]
        )
    ]


def called_finish(message: AIMessage) -> bool:
    return any(call.get("name") == "finish" for call in (message.tool_calls or []))


def agent(state: State):
    result = llm_with_tools.invoke(with_screenshot(state["messages"]))
    if result.tool_calls:
        print("Tools:", [call["name"] for call in result.tool_calls])
    elif result.content:
        print("Agent tried to stop:", result.content)
    return {"messages": [result]}


def nudge(state: State):
    print("Nudging agent to keep going.")
    return {"messages": [HumanMessage(content=NUDGE)]}


def route_agent(state: State) -> Literal["tools", "nudge"]:
    last = state["messages"][-1]
    if isinstance(last, AIMessage) and last.tool_calls:
        return "tools"
    return "nudge"


def route_tools(state: State) -> Literal["agent", "end"]:
    for message in reversed(state["messages"]):
        if isinstance(message, AIMessage) and message.tool_calls:
            return "end" if called_finish(message) else "agent"
    return "agent"


graph = StateGraph(State)
graph.add_node("agent", agent)
graph.add_node("tools", ToolNode(all_tools, handle_tool_errors=True))
graph.add_node("nudge", nudge)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", route_agent, {"tools": "tools", "nudge": "nudge"})
graph.add_edge("nudge", "agent")
graph.add_conditional_edges("tools", route_tools, {"agent": "agent", "end": END})
workflow = graph.compile()


def final_summary(messages: list[BaseMessage]) -> str:
    for message in reversed(messages):
        if isinstance(message, ToolMessage) and message.name == "finish":
            return message.content
    last = messages[-1]
    content = getattr(last, "content", last)
    return str(content)


def run_browser_task(task: str):
    print("Starting in 3 seconds. Move the mouse to a screen corner to abort.")
    time.sleep(3)
    take_screenshot()

    result = workflow.invoke(
        {
            "messages": [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=task),
            ]
        },
        config={"recursion_limit": 300},
    )
    summary = final_summary(result["messages"])
    print("Done:", summary)
    return summary


if __name__ == "__main__":
    task = " ".join(sys.argv[1:]).strip() or input("PC task: ").strip()
    if not task:
        raise SystemExit("No task given.")
    run_browser_task(task)
