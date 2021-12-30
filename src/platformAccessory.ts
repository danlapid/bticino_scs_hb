import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { BticinoSCSHomebridge } from './platform';
import mqtt from 'mqtt';

export class BticinoLight {
  private service: Service;

  private StateOn = false;
  private mqtt_topic = '';
  private client = mqtt.connect();

  constructor(
    private readonly platform: BticinoSCSHomebridge,
    private readonly accessory: PlatformAccessory,
  ) {
    this.mqtt_topic = '/scsshield/device/' + this.accessory.context.deviceName + '/';
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Bticino')
      .setCharacteristic(this.platform.Characteristic.Model, 'Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Serial');
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.setCharacteristic(this.platform.Characteristic.Name, this.accessory.context.deviceName);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    this.client.on('connect', () => {
      this.client.subscribe(this.mqtt_topic + 'status');
      this.client.on('message', (topic, message) => {
        if (message.toString() === 'off') {
          this.StateOn = false;
        } else if (message.toString() === 'on') {
          this.StateOn = true;
        }
      });
    });
  }

  async setOn(value: CharacteristicValue) {
    let message = '0';
    if (value) {
      message = '1';
    }
    this.client.publish(this.mqtt_topic + 'switch',
      message, { qos: 0, retain: false }, (error) => {
        if (error) {
          this.platform.log.error(error.message);
        }
      });
    this.platform.log.debug('Set Characteristic On ->', value);
  }

  async getOn(): Promise<CharacteristicValue> {
    this.platform.log.debug('Get Characteristic On ->', this.StateOn);
    return this.StateOn;
  }

}
