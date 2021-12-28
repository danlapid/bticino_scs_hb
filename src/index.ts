import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { BticinoSCSHomebridge } from './platform';

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, BticinoSCSHomebridge);
};
