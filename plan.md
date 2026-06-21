# instruction.md

# FocusX Chrome Extension

## Important Implementation Note

A Chrome extension already exists in this repository. All changes should be implemented by improving and restructuring the existing extension rather than rebuilding it from scratch.

Ensure the Chrome extension works properly across all supported scenarios:

* Existing functionality must continue to work after refactoring.
* X (Twitter) blocking and timer functionality must work reliably.
* Settings must persist correctly.
* Multi-tab synchronization must work correctly.
* Browser restart recovery must work correctly.
* Any future YouTube extension integration must not break the FocusX extension.
* The popup toggle should allow switching between the current FocusX extension experience and the YouTube extension experience while keeping both extensions functional and isolated.

---

# FocusX Chrome Extension

## Overview

FocusX is a Chrome extension that helps users reduce doomscrolling on X (Twitter).

The extension automatically starts a browsing session when the user visits blocked X pages. Once the browsing duration expires, those pages are locked for a configurable amount of time.

---

# Core Features

## X Page Blocking

Support blocking:

* `/home`
* `/explore`
* `/search/*`
* `/notifications`

Users can enable or disable each page individually.

---

# Timer System

Users configure:

### Browse Duration

Examples:

* 10 min (default)
* Custom value

### Block Duration

Examples:

* 60 min (default)
* Custom value

The timer starts automatically when a user enters a blocked page.

No start button required.

---

# Lock Screen

When a user tries to browse a blocked page after the browsing session expires:

* Hide page content.
* Show a simple, minimal FocusX lock screen.
* Show the remaining lock countdown.
* Show a motivational message.
* Show quick links to allowed actions:

  * Create Post (`/compose/post`)
  * DMs (`/messages`)
  * Notifications (`/notifications`)
* During onboarding, fetch and store the user's X profile URL and username.
* The stored profile should be used throughout the extension.
* Example:

  * `x.com/ashirwadsingh_`
* The profile detection should be automatic and adaptable for every user.

Example:

```
Timeline Locked

Stay focused.

Unlocks in:
52m 12s
```

Additional actions:

**Browse Timeline** (starts a new browsing session if allowed)

**DMs** | **Notifications** | **Create Post**

---

# Anti-Cheat Requirements

### Refresh Protection

Refreshing the page must not reset timers.

### Browser Restart Protection

Closing and reopening Chrome must preserve timers.

### Multi Tab Sync

All X tabs must share the same session.

### Persistent Storage

Store all state using:

```
chrome.storage.local
```

---

# Settings

## Time Settings

Two simple number inputs:

```
Browse Duration
[ 20 ] min

Block Duration
[ 60 ] min
```

No dropdowns.

No sliders.

---

## Allowed Pages

Simple toggle list:

```
Home Timeline
Explore
Search
Notifications
```

---

## Extension Control

Global enable toggle.

Bottom button:

```
Disable FocusX
```

Disables all blocking and timers.

---

# Popup UI

Keep the design extremely simple.

Sections:

### Header

* FocusX logo
* Toggle to switch between the current FocusX extension and the YouTube extension experience

### Time Settings

* Browse Duration input
* Block Duration input

### Allowed Pages

* Home Timeline
* Explore
* Search
* Notifications

### Footer

* Disable FocusX button

No analytics.

No charts.

No statistics.

No navigation tabs.

No advanced settings in MVP.

---

# Folder Restructure

Current repository:

```
/
├── manifest.json
├── popup.html
├── popup.js
├── style.css
├── content.js
├── content.css
└── icons/
```

Recommended structure:

```
/
├── manifest.json
│
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
│
├── x/
│   ├── content.js
│   ├── timer.js
│   ├── storage.js
│   ├── lock-screen.js
│   └── lock-screen.css
│
├── background/
│   └── service-worker.js
│
├── shared/
│   ├── constants.js
│   └── utils.js
│
└── icons/
```

---

# Module Responsibilities

## popup/

Responsible for:

* Settings UI
* User preferences
* Enable/disable controls
* Extension switching controls

---

## x/content.js

Responsible for:

* URL detection
* Injecting lock screen
* Starting session checks

---

## x/timer.js

Responsible for:

* Browse timer
* Lock timer
* Session calculations

---

## x/storage.js

Responsible for:

* Reading settings
* Saving settings
* Session persistence
* User profile persistence

---

## x/lock-screen.js

Responsible for:

* Rendering blocked page UI
* Countdown updates
* Allowed action shortcuts

---

## background/service-worker.js

Responsible for:

* Cross-tab synchronization
* State recovery
* Background timer checks

---

# Storage Schema

## Settings

```
{
  enabled: true,

  browseDuration: 20,

  blockDuration: 60,

  blockHome: true,

  blockExplore: true,

  blockSearch: true,

  blockNotifications: false
}
```

## User Profile

```
{
  username: "ashirwadsingh_",
  profileUrl: "https://x.com/ashirwadsingh_"
}
```

## Runtime State

```
{
  sessionStartedAt: null,

  lockStartedAt: null,

  state: "idle"
}
```

Possible states:

```
idle
browsing
locked
```

---

# MVP Success Criteria

* Home page blocking works.
* Explore page blocking works.
* Search page blocking works.
* Notifications page blocking works.
* Timers survive refreshes.
* Timers survive browser restarts.
* Multiple tabs share the same timer.
* User can configure durations.
* User can enable or disable pages.
* Lock screen appears correctly.
* User profile is detected and stored during onboarding.
* Allowed actions (DMs, Notifications, Create Post) remain accessible from the lock screen.
* Existing Chrome extension functionality continues to work after refactoring.
* FocusX and YouTube extension modes can coexist without conflicts.
* Extension remains lightweight and simple.
