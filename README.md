<!-- XIO Stress Tester • Beginner-friendly documentation -->

<p align="center">
  <img src="public/og-image.jpg" alt="XIO Stress Tester dashboard banner" width="100%">
</p>

<h1 align="center">🛡️ XIO STRESS TESTER</h1>
<p align="center"><strong>Learn it. Install it. Run it. Understand the results.</strong></p>
<p align="center">An open-source HTTP performance testing dashboard built with React, TypeScript, Node.js and Express.</p>

<p align="center">
  <a href="https://github.com/Quincunx33/Stress-Tester/releases/tag/v2.0.0-ish"><img src="https://img.shields.io/badge/iPhone%20%2F%20iPad-iSH%20Release-8b5cf6?style=for-the-badge&logo=apple&logoColor=white" alt="iSH release"></a>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node and Express">
  <img src="https://img.shields.io/badge/React-TypeScript-0ea5e9?style=for-the-badge&logo=react&logoColor=white" alt="React and TypeScript">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT license"></a>
</p>

<p align="center">
  <a href="#-start-here">Start Here</a> ·
  <a href="#-iphone--ipad-ish-shell">iPhone / iPad</a> ·
  <a href="#-computer-setup">Computer</a> ·
  <a href="#-express--dependencies-explained">Express Help</a> ·
  <a href="#-troubleshooting">Fix Errors</a>
</p>

---

> [!IMPORTANT]
> **Only test servers you own or have permission to test.** This version does **not** have built-in API authentication or target ownership verification. Keep the app local/private. Do not expose its control endpoints publicly or stress-test unrelated websites.

<a id="-start-here"></a>
## 👋 Start Here

**New to programming? That's okay.** Follow the steps below in order. You do **not** need to understand every library before your first local run.

### Which installation should you choose?

| Your device / goal | Choose this | Difficulty |
|:--|:--|:--|
| 📱 iPhone or iPad using **iSH Shell** | [Download the iSH Release ZIP](#-iphone--ipad-ish-shell) | ⭐ Beginner |
| 💻 Windows, macOS or Linux computer | [Clone the source repository](#-computer-setup) | ⭐ Beginner |
| 🧑‍💻 Want to edit the React interface or backend | [Source development](#-computer-setup) | ⭐⭐ Intermediate |
| ☁️ Want a server/VM deployment | [Private deployment notes](#-private-deployment-notes) | ⭐⭐⭐ Advanced |

### Five words you'll see in this guide

| Word | Plain-English meaning |
|:--|:--|
| **Terminal / Shell** | A text window where you type commands |
| **Node.js** | Runs JavaScript outside the browser (our server runtime) |
| **npm** | Installs JavaScript libraries and tools |
| **Express** | A Node.js library used by our backend to provide web APIs |
| **React** | Builds the interface you see in your browser |

> [!NOTE]
> **Very important:** <code>apk add nodejs npm</code> installs **Node.js and npm**, **not Express**. Express is installed using <code>npm install express</code> **when an unbundled project requires it**. The special iSH ZIP is described by its release author as a prebundled package, so start with the ZIP without manually installing Express unless an error shows it is needed.

---

## ✨ What Does XIO Do?

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>⚡ Controlled Load Tests</strong>
      <p>Send configurable HTTP requests to a server you are authorized to test. Explore response times, methods, concurrency and test patterns.</p>
    </td>
    <td width="50%" valign="top">
      <strong>📊 Live Dashboard</strong>
      <p>Follow requests per second, successes, failures, status codes and latency metrics using live server updates.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <strong>🔎 Server Inspection</strong>
      <p>Inspect headers, TLS information and server fingerprints for permitted targets.</p>
    </td>
    <td valign="top">
      <strong>📁 Export Results</strong>
      <p>Save test information as JSON or CSV to study results later.</p>
    </td>
  </tr>
</table>

**Technology:** React 19 · TypeScript · Vite · Tailwind CSS · Express 4 · Node.js Cluster · Server-Sent Events (SSE).

**Protocol note:** The source includes HTTP/1.1, HTTP/2 and experimental HTTP/3 paths. The **iSH release disables native HTTP/3** for compatibility. Performance metrics are diagnostic estimates, not a certified benchmark.

---

<a id="-iphone--ipad-ish-shell"></a>
## 🍏 iPhone & iPad — iSH Shell

<p align="center">
  <a href="https://github.com/Quincunx33/Stress-Tester/releases/download/v2.0.0-ish/Stress-Tester-iSH-ULTIMATE-v2.zip">
    <img src="https://img.shields.io/badge/⬇%20Download-iSH%20ULTIMATE%20v2-7c3aed?style=for-the-badge" alt="Download iSH release">
  </a>
</p>

**Use this method if you want to run XIO on your iPhone/iPad without building the whole React project.**

**Verified release information:**
- **Release:** [iSH ULTIMATE v2.0.0](https://github.com/Quincunx33/Stress-Tester/releases/tag/v2.0.0-ish)
- **File:** [Stress-Tester-iSH-ULTIMATE-v2.zip](https://github.com/Quincunx33/Stress-Tester/releases/download/v2.0.0-ish/Stress-Tester-iSH-ULTIMATE-v2.zip)
- **Release note:** Bundled server with an AbortController polyfill for iSH.
- **Compatibility:** Designed for the iSH / Alpine environment; performance and package support may vary by device and Alpine version.

> [!TIP]
> **Do not clone the full desktop source for this beginner iSH setup.** The release ZIP is the recommended route. The main source includes an experimental HTTP/3 dependency that might not work under iSH's x86 emulation.

### Step 1 — Install the iSH app

Install **iSH Shell** from the iOS App Store, then open it. iSH gives you a small Linux terminal on your iPhone or iPad.

### Step 2 — Update Alpine and install essentials

Copy **each command** into iSH and press **Return**.

~~~sh
apk update
apk add nodejs npm curl unzip ca-certificates
~~~

What the packages do:

| Package | Why you need it |
|:--|:--|
| <code>nodejs</code> | Runs the JavaScript server |
| <code>npm</code> | Installs missing Node.js packages if needed |
| <code>curl</code> | Downloads the ZIP from GitHub |
| <code>unzip</code> | Extracts the downloaded ZIP |
| <code>ca-certificates</code> | Helps HTTPS downloads verify certificates |

Now check that Node.js and npm are available:

~~~sh
node --version
npm --version
~~~

If each command prints a version number, proceed.

### Step 3 — Download the iSH Release

Copy and run:

~~~sh
mkdir -p ~/xio-ish
cd ~/xio-ish

curl -fL --retry 3 \
  -o Stress-Tester-iSH-ULTIMATE-v2.zip \
  "https://github.com/Quincunx33/Stress-Tester/releases/download/v2.0.0-ish/Stress-Tester-iSH-ULTIMATE-v2.zip"

unzip Stress-Tester-iSH-ULTIMATE-v2.zip
ls -la
~~~

**What just happened?** The terminal made a folder named <code>xio-ish</code>, downloaded the release and extracted it.

The ZIP's internal folder layout has not been independently inspected here. To find the program's files, run:

~~~sh
find . -name 'start.sh' -o -name 'server.js' -o -name 'package.json'
~~~

**If the files appear inside another folder**, use <code>cd FOLDER_NAME</code> to enter that folder before the next step. Replace <code>FOLDER_NAME</code> with the real folder name shown by <code>ls</code>.

### Step 4 — Do you need to install Express?

**Usually, no:** the release is described as a **zero-dependency bundled server**. If its <code>server.js</code> contains everything required, you don't need <code>npm install</code>.

But if the program reports <code>Cannot find module 'express'</code>, navigate to the folder containing the extracted server and run:

~~~sh
npm install express@4.21.2
~~~

Check Express:

~~~sh
node -e "console.log(require('express/package.json').version)"
~~~

**If the release includes its own <code>package.json</code> with dependencies**, use this **instead** of guessing missing packages:

~~~sh
npm install
~~~

> [!WARNING]
> Don't type <code>apk add express</code> to install Express.js. <code>apk</code> manages Alpine system packages; Express.js is a package installed using <code>npm</code>. Installing Express also will **not** solve native HTTP/3 incompatibility.

### Step 5 — Start XIO

In the folder that contains the launch files, use **one** of the following commands.

**Option A — If there is a <code>start.sh</code> file:**

~~~sh
sh start.sh
~~~

**Option B — If there is a standalone <code>server.js</code> file:**

~~~sh
node server.js
~~~

Do **not** run both at the same time. If your extracted ZIP uses a different launcher, follow the files included in that release.

### Step 6 — Open the dashboard in Safari

Open the following address **on the same device**:

**http://localhost:3000**

If the server announces a different port in iSH, use that port instead. Keep iSH running; iOS may pause apps in the background.

### ✅ iSH success checklist

- [ ] <code>node --version</code> displays a version
- [ ] The ZIP downloaded without an error
- [ ] You found <code>start.sh</code> or <code>server.js</code>
- [ ] The server starts without a missing-module error
- [ ] Safari opens the dashboard

---

<a id="-computer-setup"></a>
## 💻 Computer Setup — Windows, macOS & Linux

**This installs the complete source project:** the Express backend **and** React frontend.

### Step 1 — Install tools

You need:

1. **Node.js (supported LTS version)** from [nodejs.org](https://nodejs.org/)
2. **Git** from [git-scm.com](https://git-scm.com/)
3. A terminal: Terminal on macOS/Linux, or PowerShell / Git Bash on Windows

Check that your system can find them:

~~~sh
node --version
npm --version
git --version
~~~

### Step 2 — Copy the project to your computer

~~~sh
git clone https://github.com/Quincunx33/Stress-Tester.git
cd Stress-Tester
~~~

**Explanation:** <code>git clone</code> downloads the source. <code>cd Stress-Tester</code> opens the project folder in your terminal.

### Step 3 — Install the backend AND frontend

~~~sh
npm install
~~~

**Yes, just one command!** The project uses **one root <code>package.json</code>**. That single command installs both frontend and backend dependencies, including Express, React and development tools.

You do **not** need to run <code>npm install express</code> separately after a successful <code>npm install</code>.

### Step 4 — Run the app (development mode)

~~~sh
npm run dev
~~~

Then open **http://localhost:3000**.

### Step 5 — Build and run (optional)

Stop the running dev server with **Ctrl + C**, then:

~~~sh
npm run build
npm run start
~~~

The build creates frontend assets and a backend entry file. Keep the installed <code>node_modules</code> directory available: this build still relies on external packages.

### What do those npm commands mean?

| Command | Meaning |
|:--|:--|
| <code>npm install</code> | Downloads dependencies in <code>package.json</code> |
| <code>npm run dev</code> | Starts the developer version (React + Express) |
| <code>npm run build</code> | Prepares the application for running as a build |
| <code>npm run start</code> | Runs the built server |
| <code>npm run lint</code> | Checks TypeScript types |

---

<a id="-express--dependencies-explained"></a>
## 📦 Express & Dependencies Explained

### ❓ Is Node.js the same thing as Express?

**No.** Node.js is the runtime. Express is a library the server uses.

~~~text
Node.js  → runs JavaScript
npm      → installs packages
Express  → provides backend HTTP routes
React    → renders the frontend
Vite     → develops and builds the frontend
~~~

**On iSH, system tools are installed with:**

~~~sh
apk update
apk add nodejs npm curl unzip ca-certificates
~~~

**Express.js (only if it is missing from your extracted iSH release):**

~~~sh
npm install express@4.21.2
~~~

**Full repository (computer):**

~~~sh
npm install
~~~

That last command installs the dependencies from the repository's root <code>package.json</code>, so you don't have to install them individually.

<details>
<summary><strong>🧩 Show frontend and backend package names</strong></summary>

These commands are for **reference or repairing a custom source setup**. Do not run them after a successful <code>npm install</code> from the repository root.

**Backend runtime packages:**

~~~sh
npm install express dotenv http-proxy-agent https-proxy-agent socks-proxy-agent
~~~

**Frontend runtime packages:**

~~~sh
npm install react react-dom recharts lucide-react motion
~~~

**Source development/build tools:**

~~~sh
npm install -D vite @vitejs/plugin-react @tailwindcss/vite tailwindcss typescript tsx esbuild @types/node @types/express autoprefixer
~~~

**Other source dependencies:** <code>@google/genai</code> and experimental <code>@currentspace/http3</code> are declared by the project. For the complete source, use the checked-in <code>package.json</code>. Do **not** manually add native HTTP/3 packages to iSH.

</details>

<details>
<summary><strong>📱 Why doesn't the iSH release need React installation?</strong></summary>

A prebuilt dashboard can already contain the browser-ready React files. React and Vite are mainly needed when changing or rebuilding the frontend source. This is why the iSH release and the GitHub source installation are different workflows.

</details>

---

## 🧭 Your First Safe Test

After the dashboard is running:

1. Confirm the backend responds at **http://localhost:3000/api/health**.
2. In the UI, select or enter the local health-check target.
3. Choose a **short test** with the **lowest practical concurrency**, HTTP/1.1 and normal mode.
4. Start the test and watch the **status codes, latency and errors**.
5. Stop the test if the server struggles; export the results if needed.

> [!CAUTION]
> This is a learning example for your **own local application**. Never copy large load configurations onto someone else's site. Some pacing and protocol features are still experimental, so verify performance conclusions using server-side metrics.

---

## 🏗️ How the Project Works

~~~mermaid
flowchart TD
    A["Your browser · React dashboard"] -->|"HTTP requests"| B["Express API · server.ts"]
    B --> C["Node.js cluster workers"]
    C --> D["Your authorized test server"]
    C --> E["Metrics aggregator"]
    E -->|"SSE live updates"| A
    A --> F["JSON / CSV reports"]
~~~

<details>
<summary><strong>📂 Click to explore the important project files</strong></summary>

| File / folder | What a beginner should know |
|:--|:--|
| [<code>package.json</code>](package.json) | Lists the packages and startup commands |
| [<code>server.ts</code>](server.ts) | Main backend: APIs, workers, test coordination |
| [<code>server-recon.ts</code>](server-recon.ts) | Server inspection helper |
| [<code>node-http3.ts</code>](node-http3.ts) | Experimental desktop HTTP/3 module |
| [<code>proxy-manager.ts</code>](proxy-manager.ts) | Optional proxy management |
| [<code>src/App.tsx</code>](src/App.tsx) | Main React application |
| [<code>src/components/</code>](src/components) | Buttons, charts, controls, reports |
| [<code>src/types.ts</code>](src/types.ts) | TypeScript data shapes |
| [<code>public/</code>](public) | Static assets and PWA resources |
| [<code>.env.example</code>](.env.example) | Example environment-variable names |

</details>

---

## 📊 Understanding the Dashboard

| Metric | What it tells you |
|:--|:--|
| **RPS** | Requests counted per second |
| **Success rate** | Percentage of requests classified as successful |
| **HTTP status codes** | Whether responses were 2xx, 3xx, 4xx, 5xx, etc. |
| **P50 latency** | Approximate median response time |
| **P95 / P99 latency** | Slower-end response times |
| **Bytes sent / received** | Approximate network traffic statistics |
| **Health score** | The app's heuristic score, not a server certification |

Use the **JSON** or **CSV** export buttons to save a summary. For serious performance work, compare these numbers with logs and measurements collected on the server under test.

---

## 🔌 API Routes (for Developers)

| Method | Endpoint | Description |
|:--|:--|:--|
| <code>GET</code> | <code>/api/health</code> | Health and cluster information |
| <code>GET</code> | <code>/api/presets</code> | Built-in target presets |
| <code>POST</code> | <code>/api/recon</code> | Authorized target inspection |
| <code>GET</code> | <code>/api/test/status</code> | Current test information |
| <code>GET</code> | <code>/api/test/stream</code> | Server-Sent Events telemetry |
| <code>POST</code> | <code>/api/test/start</code> | Start a configured test |
| <code>POST</code> | <code>/api/test/stop</code> | Stop the test |

> [!WARNING]
> The current API **does not** verify users or target ownership. Restrict network access. Add authentication, an authorized-target allowlist, DNS/IP validation, request budgets and anti-SSRF protections before allowing anyone else to access it.

---

<a id="-troubleshooting"></a>
## 🧰 Troubleshooting — Common Errors

<details>
<summary><strong>❌ apk add express doesn't work</strong></summary>

That's expected: Express.js is an **npm package**, not a normal Alpine system package.

~~~sh
apk update
apk add nodejs npm
npm install express@4.21.2
~~~

Run the final command **inside the extracted app directory** only when the iSH bundle needs Express.

</details>

<details>
<summary><strong>❌ Cannot find module 'express'</strong></summary>

**Full source:** Open the <code>Stress-Tester</code> root folder and run <code>npm install</code>.

**iSH release:** Go into the directory containing its server files and run:

~~~sh
npm install express@4.21.2
~~~

If the ZIP has a <code>package.json</code>, run <code>npm install</code> in that folder instead to install its declared dependencies.

</details>

<details>
<summary><strong>❌ npm: command not found / node: not found</strong></summary>

On iSH:

~~~sh
apk update
apk add nodejs npm
node --version
npm --version
~~~

On computers, install Node.js from [nodejs.org](https://nodejs.org/) and reopen the terminal.

</details>

<details>
<summary><strong>❌ Can't open localhost:3000</strong></summary>

- Check whether the terminal shows the server running.
- On iPhone/iPad, open Safari **on the same device**.
- Keep iSH running. iOS may suspend it if you switch away.
- If the program prints another port, use that port.
- Do not launch two processes on the same port.

</details>

<details>
<summary><strong>❌ HTTP/3 or native module error on iSH</strong></summary>

The full source contains a platform-dependent HTTP/3 package. The dedicated iSH release is intended to run **without native HTTP/3**. Use that ZIP instead of trying to compile the full desktop project on iPhone/iPad.

</details>

<details>
<summary><strong>❌ npm install fails / unsupported Node version</strong></summary>

Check the Node.js version first. The iSH Alpine environment can provide an older Node runtime and may not support modern packages or native binaries. Use the latest compatible iSH environment available, or build the full source on a desktop/Linux system. Installing Express alone cannot fix an incompatible runtime.

</details>

<details>
<summary><strong>❌ Unexpected performance results</strong></summary>

HTTP/3 response accounting, request-rate pacing, some header handling and error counters need further validation in the current source. Treat the measurements as diagnostic information, and verify them against the target server's logs.

</details>

---

## ☁️ Private Deployment Notes

For **your own machine, private VM or controlled cloud lab**, the source installation is:

~~~sh
git clone https://github.com/Quincunx33/Stress-Tester.git
cd Stress-Tester
npm install
npm run build
npm run start
~~~

The default server listens on port **3000**. Keep that port restricted to trusted users or a private network.

**Do not deploy this version as a publicly accessible, unauthenticated stress-testing service.** Public hosting should wait until API authentication, verified targets, SSRF defenses, rate/concurrency limits, and audit logging are implemented.

---

## ❓ Quick FAQ

**Q: Do I need to install Node.js, npm and Express separately?**  
**A:** On iSH, install Node.js/npm with <code>apk</code>. Install Express with <code>npm</code> **only if the extracted release needs it**. On a computer, one <code>npm install</code> in the repo installs all declared packages.

**Q: Where is the frontend folder?**  
**A:** The React source is inside <code>src/</code>; the repository uses one root <code>package.json</code> for frontend and backend dependencies.

**Q: Should I install React on iSH?**  
**A:** Not for the prebuilt ZIP, assuming its frontend assets are included as described in the release. Build React from source on a compatible machine if you want to change the interface.

**Q: Is the iSH ZIP the same as the full source?**  
**A:** No. It is a separate mobile-focused release with compatibility changes, including HTTP/3 being disabled.

**Q: Can I test any website?**  
**A:** No. Only test systems you own or have explicit authorization to benchmark.

---

<p align="center">
  <a href="https://github.com/Quincunx33/Stress-Tester/releases"><strong>📦 Releases</strong></a>
  &nbsp; · &nbsp;
  <a href="https://github.com/Quincunx33/Stress-Tester/issues"><strong>🐛 Issues</strong></a>
  &nbsp; · &nbsp;
  <a href="#-start-here"><strong>⬆ Back to Start</strong></a>
</p>

## 📜 License & Credits

Distributed under the [MIT License](LICENSE). Built on the Node.js, Express, React, TypeScript and open-source ecosystem. Thanks to the maintainers, contributors and development tools acknowledged by the project.

<p align="center"><sub>XIO Stress Tester · Learn responsibly · Benchmark only authorized systems · © 2026</sub></p>
