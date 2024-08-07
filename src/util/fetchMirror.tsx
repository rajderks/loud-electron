import fs, { WriteStream } from 'fs';
import {
  BASE_URI,
  URI_EU_MIRROR_7ZIP_DLL,
  URI_EU_MIRROR_7ZIP_EXE,
  URI_EU_MIRROR_LOUD,
} from '../constants';
import { logEntry } from './logger';

const verbose = false;

type ProgressCallback = (
  bytes: number,
  perc: number | null,
  done: boolean
) => void;

const fetchMirror = async (
  onProgress: ProgressCallback,
  onComplete?: () => void
) => {
  download(URI_EU_MIRROR_7ZIP_DLL, `${BASE_URI}/7z.dll`, (_, perc) => {
    if (verbose)
      logEntry(`${BASE_URI}/7z.dll: ${perc}/100 ${BASE_URI}`, 'log', [
        'log',
        'main',
      ]);
  });
  download(URI_EU_MIRROR_7ZIP_EXE, `${BASE_URI}/7z.exe`, (_, perc) => {
    if (verbose)
      logEntry(`${BASE_URI}/7z.exe: ${perc}/100 ${BASE_URI}`, 'log', [
        'log',
        'main',
      ]);
  });
  download(URI_EU_MIRROR_LOUD, `${BASE_URI}/LOUD.7z`, (bytes, perc, done) => {
    if (verbose)
      logEntry(`${BASE_URI}/LOUD.7z: ${perc}/100 ${BASE_URI}`, 'log', [
        'log',
        'main',
      ]);
    if (onProgress) {
      onProgress(bytes, perc, done);
    }
    if (done && onComplete) {
      onComplete();
    }
  });
};

async function download(
  sourceUrl: string,
  targetFile: string,
  progressCallback?: ProgressCallback,
  length?: number
) {
  const request = new Request(sourceUrl, {
    headers: new Headers({ 'Content-Type': 'application/octet-stream' }),
  });

  const response = await fetch(request);

  if (!response.ok) {
    throw Error(
      `Unable to download, server returned ${response.status} ${response.statusText} ${response.body}`
    );
  }

  const body = response.body;
  if (body == null) {
    throw Error('No response body');
  }

  const finalLength =
    length || parseInt(response.headers.get('Content-Length') || '0', 10);
  const reader = body.getReader();
  const writer = fs.createWriteStream(targetFile);

  writer.on('open', () => {
    streamWithProgress(finalLength, reader, writer, (bytes, perc, done) => {
      if (done) {
        writer.end();
      }
      if (progressCallback && !done) {
        progressCallback(bytes, perc, done);
      }
    });
  });
  writer.on('close', () => {
    if (progressCallback) {
      progressCallback(0, 100, true);
    }
  });
}

async function streamWithProgress(
  length: number,
  reader: ReadableStreamDefaultReader,
  writer: WriteStream,
  progressCallback?: ProgressCallback
) {
  let bytesDone = 0;
  let previousPercent = 0;

  while (true) {
    const result = await reader.read();
    if (result.done) {
      if (progressCallback != null) {
        progressCallback(length, 100, true);
      }
      return;
    }

    const chunk = result.value;
    if (chunk == null) {
      throw Error('Empty chunk received during download');
    } else {
      writer.write(Buffer.from(chunk));
      if (progressCallback != null) {
        bytesDone += chunk.byteLength;
        const percent =
          length === 0 ? 0 : Math.floor((bytesDone / length) * 100);
        if (percent !== previousPercent) {
          previousPercent = percent;
          progressCallback(bytesDone, percent, false);
        }
      }
    }
  }
}

export default fetchMirror;
