# stacksnap

> CLI tool that captures and exports your current dev environment stack as a shareable config snapshot.

---

## Installation

```bash
npm install -g stacksnap
```

Or with pnpm:

```bash
pnpm add -g stacksnap
```

---

## Usage

Capture your current dev environment and export it as a snapshot:

```bash
stacksnap capture
```

This generates a `stacksnap.json` file in your current directory containing your detected runtime versions, package manager, installed global tools, and key config files.

**Share the snapshot:**

```bash
stacksnap export --output my-stack.json
```

**Restore or inspect a snapshot:**

```bash
stacksnap inspect my-stack.json
```

**Compare two snapshots:**

```bash
stacksnap diff snapshot-a.json snapshot-b.json
```

**Example output:**

```json
{
  "node": "20.11.0",
  "packageManager": "pnpm@8.15.1",
  "typescript": "5.4.2",
  "os": "macOS 14.3",
  "shell": "zsh 5.9"
}
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](./LICENSE)
