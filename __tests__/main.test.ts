import * as io from '@actions/io';
import {
  validateSwaggerUIConfig,
  createSwaggerConfig,
  getSwaggerUIRelease,
  Config
} from '../src/swagger-ui-action';

test('specFile config mode can be selected', async () => {
  const configMode = validateSwaggerUIConfig('openapi.json', '', '', '');
  await expect(configMode).toBe('specFile');
});

test('swaggerConfigFile config mode can be selected', async () => {
  const configMode = validateSwaggerUIConfig('', '', 'swagger-config.yaml', '');
  await expect(configMode).toBe('swaggerConfigFile');
});

test('swaggerConfigFile gets copied correctly (#156)', async () => {
  const swaggerConfigFile = '__tests__/resources/swagger-config.yaml';
  const configMode = validateSwaggerUIConfig('', '', swaggerConfigFile, '');
  await expect(configMode).toBe('swaggerConfigFile');
  const swaggerConfig = createSwaggerConfig({
    configMode,
    specFile: '',
    specUrl: '',
    swaggerConfigFile,
    swaggerConfigUrl: '',
    swaggerUIVersion: '',
    outputPath: '/tmp'
  });
  await expect(await swaggerConfig).toBe('swagger-config.yaml');
  await io.rmRF('/tmp/swagger-config.yaml');
});

test('getSwaggerUIRelease returns without error for latest', async () => {
  const swaggerUIVersion = await getSwaggerUIRelease({
    swaggerUIVersion: '^3.0.0'
  } as Config);
  expect(swaggerUIVersion.tag_name).toMatch(/3.*/);
});

test('getSwaggerUIRelease returns specific version', async () => {
  const swaggerUIVersion = await getSwaggerUIRelease({
    swaggerUIVersion: '3.0.0'
  } as Config);
  expect(swaggerUIVersion).toMatchObject({
    tag_name: 'v3.0.0',
    tarball_url:
      'https://api.github.com/repos/swagger-api/swagger-ui/tarball/v3.0.0'
  });
});
