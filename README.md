# ZootedBot

**ZootedBot** is a feature-rich, persistent, and customizable Discord bot focused on automated temporary voice channels, reaction roles, role-based command permissions, customizable welcome messages, and a full-featured embed builder.

---

## 🔧 Features

### 🎤 Auto Voice Channel System

* `/setupautovc`: Creates a parent category and a `➕ Create Voice` channel.
* When a user joins `➕ Create Voice`:

  * A **temporary voice channel** is created just for them.
  * The user is automatically moved into their new VC.
  * The VC auto-deletes when empty.
  * All VC names and invites **persist** between restarts using SQLite.

---

### 🧑‍🤝‍🧑 Invite-Based Access System

* `/addvcuser @user`: Grants someone access to your private VC.
* `/removevcuser @user`: Revokes access.
* VC becomes **private** when the first user is invited.
* VC automatically reverts to **public** when the last invited user is removed.
* All permissions persist through deletion, recreation, and restarts.

---

### 🛠️ Voice Channel Control Commands

* `/renamevc [name]`: Renames your temp VC. The name persists until manually changed.
* `/unlockvc`: Clears all invited users and reopens the VC to everyone.

---

### 🎭 Reaction Role System (Persistent)

* `/reactionrole add` — Assign a role to a reaction on a message.
  * Emoji can be Unicode or custom.
  * Can mark roles as **non-removable**.
* `/reactionrole remove` — Remove reaction role bindings.
* Users get roles when they react.
* Reaction roles persist across restarts via SQLite.
* Full rehydration logic ensures reactions work after downtime.

---

### 💬 Custom Welcome Message System

* Sends a welcome message to a specific channel when a new user joins.
* Fully customizable with placeholders:
  - `{{user}}` — Mentions the new user
  - `{{server}}` — Displays the server name
  - Channel mentions supported using `<#channelID>`
* Configurable in `config.json`:
```json
{
  "welcomeChannelId": "your-channel-id",
  "welcomeMessage": "👋 Welcome to **{{server}}**, {{user}}! Check out <#123456789012345678> before accessing the rest of the server."
}
```
* Add or change easily without touching bot code.

---

### 🧱 Embed Builder System

* `/embedbuilder` — Launches a full interactive embed builder.

  * Builds an embed using buttons + modals.
  * Live preview shows changes as they're made.
  * Supports all core embed fields:
    - Title
    - Description
    - URL
    - Color (hex)
    - Image
    - Thumbnail
    - Footer
    - Timestamp
    - Add Fields (inline or block)
  * Fields can be added or removed with a visual field manager.
  * Supports reset, live preview, and channel selection.
  * When done, users can select a channel and send the final embed.
  * Requires `Administrator` or server owner to use.

* Permissions:
  - Embed builder commands/buttons/modals are restricted to admins or the server owner.
  - Session-specific (previews are per-user, not global).

---

### 💾 Persistent Storage (SQLite)

* Uses `better-sqlite3` for high-speed, persistent data.
* Stores:

  * Temporary VC tracking
  * User-preferred VC names
  * Invited users per VC owner
  * Reaction role bindings
  * Reaction role history per user/message/emoji

---

### 🔐 Role-Based Command Permissions

* Controlled via `config.json`:

```json
{
  "commandPermissions": {
    "setupautovc": ["Administrator"],
    "renamevc": ["Booster"],
    "addvcuser": ["Booster"],
    "removevcuser": ["Booster"],
    "reactionrole": ["Administrator"]
  }
}
```

* Only users with those roles can run the associated commands.
* Permissions are checked via `role.name` (can be converted to role IDs).

---

### 🧼 Clean Codebase

* Modular structure using `commands/` and `events/` folders.
* Uses `Collection` to register commands.
* Follows best practices (async/await, config-driven, no deprecated flags).
* Replaces deprecated `ephemeral: true` with `flags: MessageFlags.Ephemeral`.

---

## 📁 Folder Structure

```
project-root/
├── commands/
│   ├── setupautovc.js
│   ├── renamevc.js
│   ├── addvcuser.js
│   ├── removevcuser.js
│   ├── unlockvc.js
│   ├── reactionroles.js
│   ├── embedbuilder.js
├── events/
│   ├── ready.js
│   ├── voiceStateUpdate.js
│   ├── messageReactAdd.js
│   └── messageReactRemove.js
│   ├── interactionCreate.js
│   └── guildMemberAdd.js
├── db/
│   ├── voiceManager.js
│   └── reactionRoleManager.js
├── src/
│   ├── deploy-commands.js
├── utils/
│   ├── permissions.js
├── config.json
├── .env
└── index.js
```

---

## 🚀 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourname/zootedbot.git
cd zootedbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file:

```env
TOKEN=your-bot-token-here
```

### 4. Register Slash Commands

```bash
node src/deploy-commands.js
```

### 5. Start the Bot

```bash
node index.js
```

---

## 📘 Notes & Future Ideas

* ✅ Easily extendable to support `/lockvc`, `/vcaccess list`, `/vcowner transfer`, etc.
* 💡 Consider adding logs or notifications when access is granted/removed.
* 🌐 Can be hosted on Physgun.com or any Node.js-compatible service.
* 📊 Add a dashboard or audit log for reaction role activity.
* ✍️ Expand Embed Builder to support editing posted embeds and presets.

---

## 📜 License

MIT

---

## 🤝 Contributing

Pull requests welcome! If you'd like to add features, improve structure, or optimize queries, open a PR or submit an issue.

---

**Made with ❤️ by ZootedBot Dev Team.**
