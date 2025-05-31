# booleanBot

**booleanBot** is a feature-rich, persistent, and customizable Discord bot focused on automated temporary voice channels with robust access controls and role-based command permissions.

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

### 🧑‍\u🤝‍\u👨 Invite-Based Access System

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

### 💾 Persistent Storage (SQLite)

* Uses `better-sqlite3` for high-speed, persistent data.
* Stores:

  * Temporary VC tracking
  * User-preferred VC names
  * Invited users per VC owner

---

### 🔐 Role-Based Command Permissions

* Controlled via `config.json`:

```json
{
  "commandPermissions": {
    "setupautovc": ["Booster"],
    "renamevc": ["Booster"],
    "addvcuser": ["Booster"],
    "removevcuser": ["Booster"]
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
│   └── unlockvc.js
├── events/
│   ├── ready.js
│   └── voiceStateUpdate.js
├── db/
│   └── voiceManager.js
├── config.json
├── .env
└── index.js
```

---

## 🚀 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourname/booleanBot.git
cd booleanBot
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

---

## 📜 License

MIT

---

## 🤝 Contributing

Pull requests welcome! If you'd like to add features, improve structure, or optimize queries, open a PR or submit an issue.

---

**Made with ❤️ by booleanBot Dev Team.**
