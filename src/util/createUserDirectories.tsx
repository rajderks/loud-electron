import fs from 'fs';
import { BASE_URI } from '../constants';
import { logEntry } from './logger';

const createUserDirectories = () => {
  fs.stat(`${BASE_URI}/LOUD/usermaps`, (err) => {
    if (err) {
      fs.mkdir(`${BASE_URI}/LOUD/usermaps`, { recursive: true }, (errMkdir) => {
        if (errMkdir) {
          logEntry(
            `createUserDirectories:usermaps:mkDir:: ${errMkdir}`,
            'error'
          );
        } else {
          logEntry(
            `createUserDirectories:usermaps:mkDir:: created usermaps folder`,
            'log',
            ['log', 'file']
          );
        }
      });
    } else {
      fs.readdir(`${BASE_URI}/LOUD/usermaps`, (errReadDir, files) => {
        if (err) {
          logEntry(
            `createUserDirectories:usermaps:readdir:: ${errReadDir}`,
            'error'
          );
          return;
        }
        if (files.length) {
          logEntry(
            `*** Warning *** Files found in 'usermaps' directory and will be loaded as maps`
          );
        } else {
          logEntry(`'usermaps' directory exists`, 'log', ['log', 'file']);
        }
      });
    }
  });
  fs.stat(`${BASE_URI}/LOUD/usermods`, (err) => {
    if (err) {
      fs.mkdir(`${BASE_URI}/LOUD/usermods`, { recursive: true }, (errMkdir) => {
        if (errMkdir) {
          logEntry(
            `createUserDirectories:usermods:mkDir:: ${errMkdir}`,
            'error'
          );
        } else {
          logEntry(
            `createUserDirectories:usermods:mkDir:: created usermods folder`,
            'log',
            ['log', 'file']
          );
        }
      });
    } else {
      fs.readdir(`${BASE_URI}/LOUD/usermods`, (errReadDir, files) => {
        if (err) {
          logEntry(
            `createUserDirectories:usermods:readdir:: ${errReadDir}`,
            'error'
          );
          return;
        }
        if (files.length) {
          logEntry(
            `*** Warning *** Files found in 'usermods' directory and will be loaded as mods`,
            'log',
            ['log', 'file']
          );
        } else {
          logEntry(`'usermods' directory exists`, 'log', ['log', 'file']);
        }
      });
    }
  });
};

export default createUserDirectories;
