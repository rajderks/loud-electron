import { remote } from 'electron';

const BASE_URI =
  process.env.JEST_WORKER_ID === undefined
    ? remote.getGlobal('process').env.PORTABLE_EXECUTABLE_DIR ??
      process.env.REACT_APP_FS_BASE_URL ??
      './'
    : './src/util/__tests__/';

export { BASE_URI };
