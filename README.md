<!-- XIO Stress Tester • project documentation -->
<p align="center">
  <img src="public/og-image.jpg" width="100%" alt="XIO Stress Tester — performance and security dashboard" />
</p>

<h1 align="center">🛡️ XIO STRESS TESTER</h1>
<p align="center"><strong>Benchmark smarter. Observe every request. Understand your infrastructure.</strong></p>
<p align="center">A React + Express dashboard for controlled HTTP load tests, server diagnostics, and real-time performance insights.</p>

<p align="center">
  <a href="https://github.com/Quincunx33/Stress-Tester/releases/tag/v2.0.0-ish"><img alt="iSH Release" src="https://img.shields.io/badge/iOS%20%2F%20iSH-v2.0.0-7c3aed?style=for-the-badge&logo=apple&logoColor=white" /></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="Express" src="https://img.shields.io/badge/Express-111827?style=for-the-badge&logo=express&logoColor=white" />
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &nbsp;•&nbsp;
  <a href="#ios-ish">iPhone / iPad (iSH)</a> &nbsp;•&nbsp;
  <a href="#dependencies">Dependencies</a> &nbsp;•&nbsp;
  <a href="#troubleshooting">Troubleshooting</a> &nbsp;•&nbsp;
  <a href="https://github.com/Quincunx33/Stress-Tester/releases">Releases</a>
</p>

---

> [!IMPORTANT]
> **Authorized testing only.** Run benchmarks only on systems you own or have explicit permission to test. The current API does not enforce login or target ownership verification. Keep the dashboard **private**, never publish an unrestricted instance to the internet, and start with conservative traffic settings.

## ✨ Why XIO?

<table>
<tr>
<td width="50%" valign="top">
  <strong>⚡ LOAD TESTING</strong>
  <ul>
    <li>HTTP/1.1 and HTTP/2 request paths</li>
    <li>Experimental HTTP/3 in the source edition</li>
    <li>Configurable methods, durations, workloads and patterns</li>
    <li>Multi-process Node.js cluster workers</li>
  </ul>
</td>
<td width="50%" valign="top">
  <strong>📊 LIVE TELEMETRY</strong>
  <ul>
    <li>Server-Sent Events (SSE) dashboard updates</li>
    <li>Request rate, success rate and status codes</li>
    <li>P50 / P95 / P99 latency estimates</li>
    <li>JSON and CSV report downloads</li>
  </ul>
</td>
</tr>
<tr>
<td valign="top">
  <strong>🔎 SERVER DIAGNOSTICS</strong>
  <ul>
    <li>Response-header and TLS inspection</li>
    <li>Host fingerprint / protocol information</li>
    <li>WAF response analysis for permitted targets</li>
    <li>Configurable security test scenarios</li>
  </ul>
</td>
<td valign="top">
  <strong>📱 CROSS-DEVICE WORKFLOW</strong>
  <ul>
    <li>React 19, TypeScript and Tailwind CSS</li>
    <li>Responsive dashboard + PWA shell</li>
    <li>Dedicated iSH release for iPhone and iPad</li>
    <li>One repository for client and server</li>
  </ul>
</td>
</tr>
</table>

> **Edition note:** The mobile iSH release is separate from the full source build. Native HTTP/3 is disabled in the iSH edition for compatibility. Some metrics and protocol behavior may vary by platform.

<a id="quick-start"></a>
## 🚀 Quick Start — Desktop / Linux / macOS

The root [`package.json`](package.json) contains **both frontend and backend dependencies**. A single `npm install` installs the modules declared there; no separate frontend/backend folders are needed.

**Requirements:** Git, npm, and a modern Node.js LTS runtime. Native dependencies (especially HTTP/3) may vary by operating system.

```bash
git clone https://github.com/Quincunx33/Stress-Tester.git
cd Stress-Tester

# Install frontend + backend + development packages
npm install

# Launch React UI and Express backend in development mode
npm run dev
```

Open **http://localhost:3000** in your browser.

**Production-style local build:**

```bash
npm run build
npm run start
```

| Script | What it does |
|:--|:--|
| `npm run dev` | Runs the Express server with Vite development middleware |
| `npm run build` | Builds frontend assets and bundles the backend entry point |
| `npm run start` | Starts `dist/server.cjs` |
| `npm run lint` | Checks TypeScript with `tsc --noEmit` |

<a id="ios-ish"></a>
## 🍏 iPhone & iPad — iSH Shell Installation

<p align="center">
  <a href="https://github.com/Quincunx33/Stress-Tester/releases/download/v2.0.0-ish/Stress-Tester-iSH-ULTIMATE-v2.zip"><img alt="Download iSH ULTIMATE v2 ZIP" src="https://img.shields.io/badge/Download-iSH_ULTIMATE_v2-6d28d9?style=for-the-badge&logo=apple&logoColor=white" /></a>
</p>

**Release:** [iSH ULTIMATE v2.0.0](https://github.com/Quincunx33/Stress-Tester/releases/tag/v2.0.0-ish)  
**Asset:** `Stress-Tester-iSH-ULTIMATE-v2.zip`  
**Target:** iSH Shell on iOS / iPadOS (Alpine Linux environment)

The release notes describe a **prebundled server** and an `AbortController` compatibility polyfill. Use the ZIP for the easiest iSH experience instead of trying to compile the full desktop source on a phone. The archive's internal file layout and dependencies have not been independently verified, so check the extracted folder before launching.

> [!TIP]
> **iSH install commands — copy & paste**
>
> **1. Install Alpine packages (Node.js + npm + download tools):**
>
> ```sh
> apk update
> apk add nodejs npm curl unzip ca-certificates
> ```
>
> **2. Install Express only if the extracted release needs it** (run this inside the folder containing `server.js` or its `package.json`):
>
> ```sh
> npm install express@4.21.2
> ```
>
> **Important:** `apk add express` is **not** an Express.js installation command. `apk` installs Alpine packages; **Express.js is installed with `npm`**. The `v2.0.0-ish` release is described as prebundled, so skip step 2 unless Express is missing.

### 01 / Prepare iSH

Open **iSH Shell** on your iPhone or iPad and enter:

```sh
apk update
apk add nodejs npm curl unzip ca-certificates

# Verify the Node.js and npm installation
node --version
npm --version
```

> [!NOTE]
> `apk add nodejs npm` installs **Node.js + npm only**. It does **not** install **Express.js**. Express is a separate Node package installed using `npm install express`. See **Step 03** below.

### 02 / Download and unpack the release

```sh
mkdir -p ~/xio-ish
cd ~/xio-ish

curl -fL --retry 3 \
  -o Stress-Tester-iSH-ULTIMATE-v2.zip \
  "https://github.com/Quincunx33/Stress-Tester/releases/download/v2.0.0-ish/Stress-Tester-iSH-ULTIMATE-v2.zip"

unzip Stress-Tester-iSH-ULTIMATE-v2.zip
ls -la
```

If the ZIP creates a subfolder, enter the directory holding the launcher or server before continuing. Locate them with:

```sh
find . -name 'start.sh' -o -name 'server.js' -o -name 'package.json'
```

### 03 / Install Express and backend modules **when needed**

**There are two possible setups:**

| Your extracted release contains… | What to do |
|:--|:--|
| A self-contained `server.js` | **No extra npm install should be required** according to the release notes. Go to Step 04. |
| A `package.json` with external dependencies | Run `npm install` **inside that release folder**. |
| A `server.js` that fails with `Cannot find module 'express'` | Install Express manually as shown below. |

**Express install command for iSH:**

```sh
# Run inside the folder containing server.js / package.json
npm install express@4.21.2

# Confirm Express is installed
node -e "console.log('Express:', require('express/package.json').version)"
```

**Other backend modules, only if the release imports them and reports missing packages:**

```sh
npm install dotenv@17.2.3 http-proxy-agent@9.1.0 \
  https-proxy-agent@9.1.0 socks-proxy-agent@10.1.0
```

> [!CAUTION]
> Do **not** blindly run the main repository's desktop `npm install` in iSH: its full source build includes an HTTP/3 dependency that may be incompatible with iSH's 32-bit environment. Use the release's own manifest if present. Installing Express cannot fix incompatible native modules.

### 04 / Start the dashboard

Run the command matching the files in your extracted release directory:

```sh
# If the release includes start.sh:
sh start.sh
```

Or:

```sh
# If it includes a standalone server.js:
node server.js
```

Now open **http://localhost:3000** in Safari **on the same device**. If the release prints another port, use that port instead. Keep iSH running while using the dashboard; iOS can suspend background applications.

<details>
<summary><strong>📦 Why isn't React installed separately on iSH?</strong></summary>

React, React DOM, Vite, Tailwind and other **frontend** packages are build-time or UI dependencies. A ZIP with a prebuilt frontend serves compiled assets without installing React on the phone. If you want to edit and rebuild the UI, use the source installation below on a compatible desktop, Linux machine or VM.

</details>

<details>
<summary><strong>🧩 What if the release shows a module error?</strong></summary>

1. Check that you're in the directory containing `server.js`, `start.sh`, or its `package.json`.
2. If there is a `package.json`, try `npm install` from that directory, subject to iSH compatibility.
3. If the error specifically says `Cannot find module 'express'`, use `npm install express@4.21.2`.
4. If the error names a different missing package, install only that package if supported by the release.
5. A Node.js version mismatch, native module failure, or segmentation fault is **not** automatically fixed by installing Express. Prefer the prebuilt mobile release over the full desktop source.

</details>

<a id="dependencies"></a>
## 🧱 Frontend & Backend Dependencies

This repository has **one root `package.json`**, not separate `client` and `server` packages. The recommended installation method is always:

```bash
cd Stress-Tester
npm install
```

For clarity, here is how the dependencies are grouped in the current source code:

| Layer | Packages / role |
|:--|:--|
| **Backend** | `express`, `dotenv`, `http-proxy-agent`, `https-proxy-agent`, `socks-proxy-agent` |
| **HTTP/3 (experimental)** | `@currentspace/http3` — platform-sensitive, not for iSH |
| **Frontend** | `react`, `react-dom`, `recharts`, `lucide-react`, `motion` |
| **Frontend tooling** | `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite` |
| **Development** | `typescript`, `tsx`, `esbuild`, `@types/node`, `@types/express`, `autoprefixer` |
| **Other declared dependency** | `@google/genai` |

<details>
<summary><strong>Show manual npm commands (for rebuilding a missing package manifest)</strong></summary>

These are **reference commands**, not additional steps after `npm install`:

**Backend:**

```bash
npm install express dotenv http-proxy-agent https-proxy-agent socks-proxy-agent
```

**Frontend:**

```bash
npm install react react-dom recharts lucide-react motion
```

**Frontend / TypeScript build tooling:**

```bash
npm install -D vite @vitejs/plugin-react @tailwindcss/vite tailwindcss \
  typescript tsx esbuild @types/node @types/express autoprefixer
```

For the full **source** build, additional declared packages such as `@currentspace/http3` must be installed **on a compatible system**. Prefer the versions in the checked-in [`package.json`](package.json), and avoid manual reconstruction unless required.

</details>

<a id="architecture"></a>
## 🧬 Architecture

```text
                ┌──────────────────────────────┐
                │  React + TypeScript Dashboard│
                │   Config • Charts • Reports  │
                └──────────────┬───────────────┘
                               │ HTTP API / SSE
                ┌──────────────▼───────────────┐
                │   Express API (server.ts)    │
                │  Test control & aggregation  │
                └──────────────┬───────────────┘
                               │ Cluster IPC
                ┌──────────────▼───────────────┐
                │    Node.js Worker Processes  │
                │  HTTP requests & measurements│
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │  YOUR AUTHORIZED TEST TARGET │
                └──────────────────────────────┘
```

**Useful source files**

| File | Responsibility |
|:--|:--|
| [`server.ts`](server.ts) | Express endpoints, cluster coordination, load execution, telemetry |
| [`server-recon.ts`](server-recon.ts) | Target response, TLS and fingerprint inspection |
| [`node-http3.ts`](node-http3.ts) | Experimental HTTP/3 wrapper for the full source edition |
| [`proxy-manager.ts`](proxy-manager.ts) | Proxy configuration and runtime management |
| [`src/App.tsx`](src/App.tsx) | Dashboard state and API integration |
| [`src/components/`](src/components) | Controls, diagnostics, live charts and exports |
| [`src/types.ts`](src/types.ts) | Shared frontend types |

<a id="dashboard"></a>
## 📈 Dashboard & Exports

Configure a permitted target and monitor request throughput, response codes, success/failure counts, latency percentiles and test progress. The app supports JSON/CSV export for offline analysis.

> [!TIP]
> For comparable benchmarks, test under consistent network conditions, use an isolated staging environment, and review the target's own CPU/memory/application logs alongside the client-side metrics. The displayed health score is an application heuristic, not an independent certification.

<a id="api"></a>
## 🔌 API Reference

| Method | Route | Purpose |
|:--|:--|:--|
| `GET` | `/api/health` | Server and cluster health |
| `GET` | `/api/presets` | Built-in target presets |
| `POST` | `/api/recon` | Inspect an authorized target |
| `GET` | `/api/test/status` | Current test summary |
| `GET` | `/api/test/stream` | SSE telemetry feed |
| `POST` | `/api/test/start` | Start a configured test |
| `POST` | `/api/test/stop` | Stop the active test |

**Security limitation:** These endpoints are not protected by built-in authentication or target ownership checks in the current source code. Keep instances local/private until those safeguards are added. Avoid using public third-party services as load-test targets without explicit permission.

<a id="troubleshooting"></a>
## 🧰 Troubleshooting

<details>
<summary><strong>❌ Cannot find module 'express'</strong></summary>

For the **source repository**, run `npm install` in the root folder. For an **iSH extracted release** that needs external Express, run `npm install express@4.21.2` in the release app directory.

```sh
npm install express@4.21.2
```

</details>

<details>
<summary><strong>❌ npm install fails on iSH</strong></summary>

Check `node --version` and `npm --version`. The Alpine version and 32-bit x86 emulation in iSH can make modern build tools or native modules incompatible. Prefer the dedicated iSH ZIP and avoid installing the full-source HTTP/3 runtime on mobile.

</details>

<details>
<summary><strong>🌐 Safari cannot open localhost:3000</strong></summary>

Keep iSH active and verify that the server printed a listening message. Make sure Safari is running **on the same iPhone/iPad**. If the launcher uses a different port, use the address and port shown in the terminal.

</details>

<details>
<summary><strong>📉 Metrics look unexpected</strong></summary>

Verify that the chosen protocol is supported and review server-side access logs. The current implementation has known areas for improvement around HTTP/3 response handling, rate pacing and some error accounting. Validate results before using them for production capacity decisions.

</details>

<a id="deployment"></a>
## ☁️ Deployment Notes

**Local development** and private lab environments are the intended starting points. For a Linux VM or a controlled Google Cloud environment, install project dependencies, build the app, and expose port `3000` only through an authenticated/restricted access path.

```bash
git clone https://github.com/Quincunx33/Stress-Tester.git
cd Stress-Tester
npm install
npm run build
npm run start
```

> [!WARNING]
> Do **not** deploy the current dashboard as a public, unauthenticated internet service. Implement authentication, target allowlisting / ownership verification, SSRF protections, strict rate and concurrency limits, and logging before any shared/cloud deployment. Platform-specific HTTP/3 compatibility also needs testing.

<a id="faq"></a>
## ❓ Frequently Asked Questions

**Do I need both Node.js and Express on iSH?**  
Node.js runs JavaScript, while Express is a separate npm module. `apk add nodejs npm` does not install Express. A truly self-contained release bundle may already include Express, so install it manually **only if that release needs it**.

**Do I need `npm install react` on my iPhone?**  
Not for a prebuilt dashboard bundled in the iSH ZIP. React's production assets are served by the release; rebuild from source on a compatible system if you need to change the UI.

**Does the iSH ZIP support HTTP/3?**  
The existing project documentation says native HTTP/3 is disabled in the mobile edition. The full source edition has experimental HTTP/3 support.

**Is this ready for public hosting?**  
Not without adding the safeguards mentioned above.

---

<p align="center">
  <a href="https://github.com/Quincunx33/Stress-Tester/releases"><strong>📦 Browse Releases</strong></a> &nbsp;•&nbsp;
  <a href="https://github.com/Quincunx33/Stress-Tester/issues"><strong>🐛 Report an Issue</strong></a> &nbsp;•&nbsp;
  <a href="#quick-start"><strong>⬆ Back to Quick Start</strong></a>
</p>

## 📜 License & Acknowledgments

Licensed under the [MIT License](LICENSE). Built with Node.js, Express, React, TypeScript, Vite and the wider open-source ecosystem. The project acknowledges assistance from multiple AI development tools in its original documentation.

<p align="center"><sub>Made for responsible infrastructure benchmarking · XIO Stress Tester © 2026</sub></p>