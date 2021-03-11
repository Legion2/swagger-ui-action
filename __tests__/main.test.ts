import * as io from '@actions/io';
import {
  validateSwaggerUIConfig,
  createSwaggerConfig
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
