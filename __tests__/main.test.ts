import {validateSwaggerUIConfig} from '../src/swagger-ui-action';

test('specFile config mode can be selected', async () => {
  const configMode = validateSwaggerUIConfig('openapi.json', '', '', '');
  await expect(configMode).toBe('specFile');
});

test('swaggerConfigFile config mode can be selected', async () => {
  const configMode = validateSwaggerUIConfig('', '', 'swagger-config.yaml', '');
  await expect(configMode).toBe('swaggerConfigFile');
});
