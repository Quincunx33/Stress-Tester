# 🛡️ XIO Stress Tester & WAF Resilience Suite

<p align="center">
  <img src="public/og-image.jpg" alt="XIO Stress Tester Performance Dashboard Banner" width="100%" style="border-radius: 12px; max-width: 800px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</p>

---

## ⚡ What is XIO Stress Tester?

**XIO Stress Tester** is an ultra-fast, modern, cluster-driven HTTP load generator designed to benchmark servers, stress-test firewalls, and audit the threshold limits of **Web Application Firewalls (WAF)** and cloud security infrastructures.

## 🚀 iSH & Mobile Optimized (NEW)

This version of XIO Stress Tester has been specially optimized for **iSH Shell** on iPad/iPhone. It includes:
- **Zero-Dependency Bundle**: A single `server.js` file that contains all necessary libraries. No `npm install` required on iSH!
- **x86 Emulation Fixes**: Optimized for the 32-bit x86 emulation layer in iSH.
- **AbortController Polyfill**: Full support for older Node.js versions (v14+).
- **HTTP/3 Disabled for Stability**: Removed native http3 bindings to prevent Segmentation Faults on mobile.

### 📱 How to use on iSH (iPad/iPhone)
1. Download the `Stress-Tester-iSH-ULTIMATE-v2.zip` from the [Releases](https://github.com/Quincunx33/Stress-Tester/releases) section.
2. Unzip the file in your iSH home directory.
3. Run the server using the provided script:
   ```bash
   sh start.sh
   ```
4. Access the dashboard at `http://localhost:3000`.

---

## ☁️ Running & Deploying on Google Cloud

### 🐚 Option A: Running in Google Cloud Shell
```bash
git clone https://github.com/Quincunx33/Stress-Tester.git
cd Stress-Tester
npm install
npm run build
npm run start
```

### 🖥️ Option B: Dedicated Host on Google Compute Engine VM
Point your browser directly to `http://<YOUR_VM_EXTERNAL_IP>:3000` after building.

---

## 🛠️ Local Development
```bash
npm install
npm run dev
```

---

## 🌟 Special Thanks
Special thanks to **Manus AI** for the mobile optimization and iSH compatibility fixes.

*Developed with ❤️ to protect and fortify web infrastructures globally.*
