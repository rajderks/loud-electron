import { remote } from 'electron';

const BASE_URI = process.env.REACT_APP_FS_BASE_URL ?? remote.app.getAppPath();

console.log('lolg', BASE_URI);

export { BASE_URI };
