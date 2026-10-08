# ParkFlow — Smart Parking Manager

A professional parking slot management website built as a **static website**.

## Main Data Structure

The project demonstrates a **Stack (LIFO)**:

- `push(slot)` — returns a freed slot to the stack
- `pop()` — allocates the top available slot
- `peek()` — checks the next available slot
- `isEmpty()` — checks whether the stack is empty
- `size()` — returns the number of available slots

## Features

- 20 parking slots
- Vehicle entry and exit
- Automatic slot allocation
- Live parking slot map
- Vehicle search
- Stack visualization
- Dashboard statistics
- LocalStorage persistence
- Responsive professional UI

## Run on your computer

1. Extract the ZIP.
2. Open `index.html` in Chrome/Edge.

No Python, Flask, Node.js or database is required.

## Deploy on Render

Use **New + → Static Site**.

- Build Command: leave empty
- Publish Directory: `.`
- No Start Command is required

Connect the GitHub repository containing `index.html`, `style.css` and `app.js`.

## Important

This version stores data in the browser using LocalStorage. It is ideal for a college/demo project and static hosting. Data is stored separately in each browser/device.
