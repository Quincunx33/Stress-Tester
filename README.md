# 🛡️ XIO Stress Tester & WAF Resilience Suite

<p align="center">
  <img src="public/og-image.jpg" alt="XIO Stress Tester Performance Dashboard Banner" width="100%" style="border-radius: 12px; max-width: 800px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=progressive-web-apps&logoColor=white" alt="PWA" />
</p>

---

## ⚡ What is XIO Stress Tester?

**XIO Stress Tester** is an ultra-fast, modern, cluster-driven HTTP load generator designed to benchmark servers, stress-test firewalls, and audit the threshold limits of **Web Application Firewalls (WAF)** and cloud security infrastructures.

By combining massive connection concurrency with multi-layered, evasive vulnerability payloads, this engine lets developers and security engineers test how their setups react under realistic stress conditions.

---

## 🚀 Key Highlights & Engine Capabilities

```
┌─────────────────────────────────────────────────────────────────┐
│                      XIO CORE ENGINE FLOW                       │
│                                                                 │
│  [HTTP/1.1 Pipelining] ──┐                                      │
│  [HTTP/2 Multiplexing] ──┼─► [Payloader Injector] ──► Target WAF │
│  [HTTP/3 UDP Stream]   ──┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 🎯 1. Advanced Traffic Engineering
*   **HTTP/1.1 Pipelining**: Sends multiple HTTP requests over a single socket connection without waiting for responses, exposing latency/TTLB issues.
*   **HTTP/2 Stream Multiplexing**: Utilizes multi-stream connection pooling to deliver massive concurrent requests with negligible system overhead.
*   **Dynamic Load Balancing**: Multi-threaded cluster setup that coordinates workload allocation for highly consistent, uniform load generation.

### 💉 2. Deep-Packet Security Injections
*   **SQL Injection (SQLi)**: Tautology bypasses, logical state transitions, union block examinations.
*   **Cross-Site Scripting (XSS)**: Active script vector injections, inline attribute escalations, and DOM traps.
*   **Command Injection (OS)**: Shell pipelines, chained system process executions, and echo checks.
*   **Path Traversal & SSTI**: Deep directory tree structures and server-side template manipulation tests.
*   **Protocol Starvation**: Implements Slowloris hold-patterns and oversized header flooding to verify connection state timeout configurations.

### 📊 3. High-Fidelity Diagnostics & Telemetry
*   **Live SSE (Server-Sent Events) Stream**: Beautifully synchronized real-time diagnostic charts illustrating Success Rate, CPU limits, and latency spikes.
*   **Interactive WAF Analysis**: Live breakdown of exactly what percentage of requests were caught, filtered, or passed through.
*   **PWA Standalone Mode**: Fully responsive, offline-ready Progressive Web App layout. Run diagnostics anywhere, anytime.

---

## ☁️ Running & Deploying on Google Cloud

Deploy and run XIO Stress Tester with minimal friction on **Google Cloud Console** using three flexible cloud deployment paradigms.

### 🐚 Option A: Running in Google Cloud Shell (Instant Setup)
Google Cloud Shell is a free browser-based VM with all development runtimes preloaded.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the **Activate Cloud Shell** button (terminal icon `>_` in the top right header).
3. Execute the commands below to pull, build, and launch the engine:
   ```bash
   # Clone the code suite
   git clone https://github.com/Quincunx33/Pipeline-Stress-Tester.git
   cd Pipeline-Stress-Tester

   # Install optimized node modules
   npm install

   # Transpile, bundle server-client layers, and launch
   npm run build
   npm run start
   ```
4. Click the **Web Preview** button in the Cloud Shell header and select **Preview on port 3000** to instantly launch the interactive UI in a new tab!

---

### 🚀 Option B: Serverless Deployment to Google Cloud Run (Highly Scalable)
Cloud Run allows serverless scaling of containerized engines with direct HTTPS access.

1. Configure your current GCP Project ID in your terminal session:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
2. Enable Cloud Run and Artifact Registry APIs:
   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com
   ```
3. Deploy directly from the root code directory:
   ```bash
   gcloud run deploy pipeline-stress-tester \
     --source . \
     --port 3000 \
     --allow-unauthenticated \
     --region us-central1
   ```
4. The terminal will output a secure live Service URL (e.g., `https://pipeline-stress-tester-xxx.run.app`). Share it and begin remote benchmarking!

---

### 🖥️ Option C: Dedicated Host on Google Compute Engine VM
For enterprise-grade throughput and uninterrupted high-volume network card benchmarks.

1. Spin up a fresh, optimized Debian-11 VM tagged with network access flags:
   ```bash
   gcloud compute instances create stress-tester-vm \
     --image-family=debian-11 \
     --image-project=debian-cloud \
     --machine-type=e2-medium \
     --tags=http-server,stress-tester-port \
     --metadata=startup-script="curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs git && npm install -g pm2"
   ```
2. Open target port 3000 in your VPC firewall rules:
   ```bash
   gcloud compute firewall-rules create allow-stress-tester \
     --allow=tcp:3000 \
     --target-tags=stress-tester-port
   ```
3. Establish an SSH connection to your instance:
   ```bash
   gcloud compute ssh stress-tester-vm
   ```
4. Clone, build, and run continuously in the background using PM2:
   ```bash
   git clone https://github.com/Quincunx33/Pipeline-Stress-Tester.git
   cd Pipeline-Stress-Tester
   npm install
   npm run build
   pm2 start dist/server.cjs --name stress-tester
   ```
5. Point your browser directly to `http://<YOUR_VM_EXTERNAL_IP>:3000`.

---

## 🛠️ Local Development

Get up and running locally in seconds.

```bash
# 1. Clone repository
git clone https://github.com/Quincunx33/Pipeline-Stress-Tester.git

# 2. Open directory and install dependencies
cd Pipeline-Stress-Tester
npm install

# 3. Boot dev environment (Vite hot-reloading + Express server)
npm run dev
```
Open `http://localhost:3000` to start tuning your load benchmarks.

---

## 🌟 Special Thanks & Core Attributions

We are immensely grateful to the following cutting-edge AI systems, advanced language models, and developer ecosystems for their exceptional design synthesis, code generation, and diagnostic assistance during the development of this engine:

*   **Gemini** (Google DeepMind)
*   **DeepSeek**
*   **ChatGPT** (OpenAI)
*   **Claude** (Anthropic)
*   **Grok** (xAI)
*   **Kimi** (Moonshot)
*   **Manus**
*   **GitHub Copilot**
*   **Codeium**
*   **Tabnine**
*   **StarCoder**
*   **CodeLlama**

---

*Developed with ❤️ to protect and fortify web infrastructures globally.*
