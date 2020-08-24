import {validateSwaggerUIConfig} from '../src/swagger-ui-action';

test('throws invalid number', async () => {
  const configMode = validateSwaggerUIConfig('openapi.json', '', '', '');
  await expect(configMode).toBe('specFile');
});
