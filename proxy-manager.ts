// proxy-manager.ts - Enhanced Tor Circuit Management & Proxy Pool

import { ChildProcess, spawn } from 'child_process';
import net from 'net';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { EventEmitter } from 'events';

export type ProxyType = 'Tor' | 'SOCKS5' | 'HTTP';
export type RotationStrategy = 'round-robin' | 'random' | 'ip-rotation-every-n-requests' | 'sticky';
export type ProxyCountry = 'US' | 'CA' | 'GB' | 'DE' | 'FR' | 'JP' | 'AU' | 'NL' | 'SE' | 'CH' | 'ANY';

export interface ProxyConfig {
  enabled: boolean;
  proxyType: ProxyType;
  instanceCount: number;
  country: ProxyCountry;
  rotationStrategy: RotationStrategy;
  rotationCount: number;
  customProxyList?: string;
}

export interface ProxyStats {
  activeProxies: number;
  currentProxyInstance: string;
  totalRotations: number;
  failedProxies: number;
  circuitRenewals: number;
  countryDistribution: Record<string, number>;
}

export interface TorInstance {
  id: string;
  port: number;
  controlPort: number;
  country: string;
  process: ChildProcess | null;
  isRunning: boolean;
  requestsHandled: number;
  lastRotation: number;
  isHealthy: boolean;
  circuitRenewCount: number;
  totalRequestsThroughCircuit: number;
}

export class RealTorManager extends EventEmitter {
  private instances: Map<string, TorInstance> = new Map();
  private basePort = 9050;
  private torPath: string = 'tor';
  private isShuttingDown = false;
  private circuitRenewalInterval: NodeJS.Timeout | null = null;

  constructor(torPath?: string) {
    super();
    if (torPath) this.torPath = torPath;
    this.startAutoCircuitRenewal();
  }

  private startAutoCircuitRenewal() {
    this.circuitRenewalInterval = setInterval(() => {
      this.renewAllCircuits().catch(() => {});
    }, 60000);
  }

  async checkTorInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      const check = spawn(this.torPath, ['--version']);
      check.on('close', (code) => resolve(code === 0));
      check.on('error', () => resolve(false));
    });
  }

  async spawnTorInstance(country: string = 'ANY'): Promise<TorInstance> {
    const port = this.basePort + this.instances.size * 10;
    const controlPort = port + 1;
    const id = `tor_${this.instances.size + 1}`;

    let exitNodes = '';
    if (country !== 'ANY') {
      exitNodes = `--ExitNodes {${country}} --StrictNodes 1`;
    }

    const torProcess = spawn(this.torPath, [
      '--SocksPort', String(port),
      '--ControlPort', String(controlPort),
      '--DataDirectory', `/tmp/tor_data_${port}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      '--RunAsDaemon', '0',
      '--Log', 'notice',
      '--CircuitBuildTimeout', '30',
      '--NewCircuitPeriod', '60',
      '--MaxCircuitDirtiness', '60',
      '--NumEntryGuards', '8',
      '--NumDirectoryGuards', '8',
      '--FastFirstHopPK', '0',
      ...(exitNodes ? exitNodes.split(' ') : [])
    ]);

    const instance: TorInstance = {
      id,
      port,
      controlPort,
      country: country || 'ANY',
      process: torProcess,
      isRunning: false,
      requestsHandled: 0,
      lastRotation: Date.now(),
      isHealthy: false,
      circuitRenewCount: 0,
      totalRequestsThroughCircuit: 0
    };

    this.instances.set(id, instance);

    await this.waitForTor(port, 30000);

    instance.isRunning = true;
    instance.isHealthy = true;

    await this.renewCircuit(id);

    this.emit('tor-ready', { id, port, controlPort, country });

    return instance;
  }

  private waitForTor(port: number, timeout: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkConnection = () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Tor on port ${port} failed to start within ${timeout}ms`));
          return;
        }

        const socket = new net.Socket();

        socket.connect(port, '127.0.0.1', () => {
          socket.destroy();
          resolve();
        });

        socket.on('error', () => {
          socket.destroy();
          setTimeout(checkConnection, 500);
        });

        socket.setTimeout(1000);
        socket.on('timeout', () => {
          socket.destroy();
          setTimeout(checkConnection, 500);
        });
      };

      checkConnection();
    });
  }

  getProxyUrl(instanceId: string): string | null {
    const instance = this.instances.get(instanceId);
    if (!instance || !instance.isRunning || !instance.isHealthy) {
      return null;
    }
    return `socks5://127.0.0.1:${instance.port}`;
  }

  getAllProxyUrls(): string[] {
    const urls: string[] = [];
    for (const [id, instance] of this.instances) {
      if (instance.isRunning && instance.isHealthy) {
        urls.push(`socks5://127.0.0.1:${instance.port}`);
      }
    }
    return urls;
  }

  async renewCircuit(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (!instance || !instance.isRunning || !instance.isHealthy) {
      return false;
    }

    try {
      const client = net.createConnection(instance.controlPort, '127.0.0.1');

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.destroy();
          reject(new Error('Control connection timeout'));
        }, 5000);

        client.on('connect', () => {
          client.write('AUTHENTICATE ""\r\n');
          client.write('SIGNAL NEWNYM\r\n');
          client.write('QUIT\r\n');
          client.end();
          clearTimeout(timeout);
          resolve();
        });

        client.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      instance.lastRotation = Date.now();
      instance.requestsHandled = 0;
      instance.circuitRenewCount += 1;
      instance.totalRequestsThroughCircuit = 0;
      instance.isHealthy = true;

      this.emit('circuit-renewed', { instanceId, port: instance.port, renewCount: instance.circuitRenewCount });

      return true;
    } catch (error) {
      instance.isHealthy = false;
      this.emit('tor-failed', { instanceId, error });
      
      setTimeout(() => {
        this.restartInstance(instanceId).catch(() => {});
      }, 5000);
      
      return false;
    }
  }

  private async restartInstance(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;

    if (instance.process) {
      try {
        instance.process.kill('SIGKILL');
      } catch (e) {}
    }

    try {
      const newInstance = await this.spawnTorInstance(instance.country);
      const oldId = instanceId;
      this.instances.delete(oldId);
      this.instances.set(oldId, {
        ...newInstance,
        id: oldId,
        circuitRenewCount: instance.circuitRenewCount + 1
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async renewAllCircuits(): Promise<number> {
    let count = 0;
    for (const [id] of this.instances) {
      const success = await this.renewCircuit(id);
      if (success) count++;
    }
    return count;
  }

  async killInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.isRunning = false;
    instance.isHealthy = false;

    if (instance.process) {
      try {
        instance.process.kill('SIGTERM');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (instance.process) {
          instance.process.kill('SIGKILL');
        }
      } catch (e) {}
    }

    this.instances.delete(instanceId);
    this.emit('tor-killed', { instanceId });
  }

  async killAll(): Promise<void> {
    this.isShuttingDown = true;
    if (this.circuitRenewalInterval) {
      clearInterval(this.circuitRenewalInterval);
      this.circuitRenewalInterval = null;
    }
    const ids = Array.from(this.instances.keys());
    for (const id of ids) {
      await this.killInstance(id);
    }
    this.isShuttingDown = false;
  }

  getInstances(): TorInstance[] {
    return Array.from(this.instances.values());
  }

  getStats(): { total: number; running: number; healthy: number } {
    const all = Array.from(this.instances.values());
    return {
      total: all.length,
      running: all.filter(i => i.isRunning).length,
      healthy: all.filter(i => i.isHealthy).length
    };
  }
}

export class RealProxyPool {
  private torManager: RealTorManager;
  private config: ProxyConfig;
  private proxyList: string[] = [];
  private currentIndex = 0;
  private totalRotations = 0;
  private circuitRenewals = 0;
  private failedProxies = 0;
  private countryDistribution: Record<string, number> = {};
  private isInitialized = false;
  private rotationCounter = 0;

  constructor(config: ProxyConfig) {
    this.config = config;
    this.torManager = new RealTorManager();
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      this.isInitialized = true;
      return;
    }

    const torInstalled = await this.torManager.checkTorInstalled();

    if (this.config.proxyType === 'Tor') {
      if (!torInstalled) {
        console.warn('[Tor] Tor not installed.');
        this.isInitialized = true;
        return;
      }

      const count = Math.min(this.config.instanceCount || 3, 10);
      const countries: ProxyCountry[] = ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU', 'NL', 'SE', 'CH'];

      for (let i = 0; i < count; i++) {
        const country = this.config.country === 'ANY'
          ? countries[i % countries.length]
          : this.config.country;

        try {
          const instance = await this.torManager.spawnTorInstance(country);
          const url = this.torManager.getProxyUrl(instance.id);
          if (url) {
            this.proxyList.push(url);
            this.countryDistribution[country] = (this.countryDistribution[country] || 0) + 1;
          }
        } catch (error) {
          console.error(`[Tor] Failed to spawn instance ${i + 1}:`, error);
          this.failedProxies++;
        }
      }
    } else {
      const raw = this.config.customProxyList || '';
      const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

      if (lines.length > 0) {
        const protocol = this.config.proxyType === 'SOCKS5' ? 'socks5' : 'http';
        this.proxyList = lines.map(line => {
          if (line.includes('://')) return line;
          return `${protocol}://${line}`;
        });
      }

      if (this.proxyList.length === 0) {
        const fallback = this.config.proxyType === 'SOCKS5'
          ? 'socks5://127.0.0.1:1080'
          : 'http://127.0.0.1:8080';
        this.proxyList = [fallback];
      }
    }

    this.isInitialized = true;
  }

  getNextProxyUrl(): string | null {
    if (!this.config.enabled || this.proxyList.length === 0) {
      return null;
    }

    const strategy = this.config.rotationStrategy || 'ip-rotation-every-n-requests';
    const rotationCount = this.config.rotationCount || 5;

    let idx = 0;

    if (strategy === 'round-robin') {
      idx = this.currentIndex % this.proxyList.length;
      this.currentIndex++;
    } else if (strategy === 'random') {
      idx = Math.floor(Math.random() * this.proxyList.length);
    } else if (strategy === 'ip-rotation-every-n-requests') {
      idx = Math.floor(this.totalRotations / rotationCount) % this.proxyList.length;
      this.totalRotations++;
      this.rotationCounter++;
    } else if (strategy === 'sticky') {
      idx = this.currentIndex % this.proxyList.length;
    }

    const url = this.proxyList[idx] || this.proxyList[0];

    if (this.config.proxyType === 'Tor' && this.rotationCounter % 2 === 0) {
      this.torManager.renewAllCircuits().then(count => {
        this.circuitRenewals += count;
      }).catch(() => {});
    }

    return url;
  }

  createAgent(proxyUrl: string): any {
    try {
      if (proxyUrl.startsWith('socks')) {
        return new SocksProxyAgent(proxyUrl);
      } else if (proxyUrl.startsWith('https')) {
        return new HttpsProxyAgent(proxyUrl);
      } else {
        return new HttpProxyAgent(proxyUrl);
      }
    } catch (error) {
      this.failedProxies++;
      return null;
    }
  }

  getStats(): ProxyStats {
    return {
      activeProxies: this.proxyList.length,
      currentProxyInstance: this.proxyList[this.currentIndex % this.proxyList.length] || 'None',
      totalRotations: this.totalRotations,
      failedProxies: this.failedProxies,
      circuitRenewals: this.circuitRenewals,
      countryDistribution: this.countryDistribution
    };
  }

  async renewAllCircuits(): Promise<number> {
    if (this.config.proxyType === 'Tor') {
      return await this.torManager.renewAllCircuits();
    }
    return 0;
  }

  async shutdown(): Promise<void> {
    await this.torManager.killAll();
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
