import * as core from '@actions/core';
import * as io from '@actions/io';
import {
  createIndexHtml,
  createSwaggerConfig,
  downloadSwaggerUI,
  getSwaggerUIRelease,
  validateConfig
} from './swagger-ui-action';

async function run(): Promise<void> {
  try {
    const config = validateConfig();

    const release = await getSwaggerUIRelease(config);

    const tempDir = 'swagger-ui-action-temp';

    core.info(`Configuration: ${JSON.stringify(config, null, 2)}`);
    core.info(`Swagger UI version: ${release.tag_name}`);

    await io.mkdirP(tempDir);
    await io.mkdirP(config.outputPath);

    await downloadSwaggerUI(tempDir, release.tarball_url, config);

    const swaggerConfig = await createSwaggerConfig(config);
    await createIndexHtml(config, swaggerConfig);

    await io.rmRF(tempDir);
  } catch (error) {
    core.setFailed(error as Error);
  }
}

run();
