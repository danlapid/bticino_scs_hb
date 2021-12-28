import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { BticinoLight } from './platformAccessory';

export class BticinoSCSHomebridge implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.debug('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    this.log.debug('Discovering SCS devices');

    for (const device of this.config['devices']) {
      this.log.debug('Searching for device: ' + device);
      const uuid = this.api.hap.uuid.generate(device);

      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.debug('Found: ' + device);
        this.log.debug('Restoring existing accessory from cache:', existingAccessory.displayName);
        new BticinoLight(this, existingAccessory);
      } else {
        this.log.debug('Adding: ' + device);

        const accessory = new this.api.platformAccessory(device, uuid);
        accessory.context.deviceName = device;

        new BticinoLight(this, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
