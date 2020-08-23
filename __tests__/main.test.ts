import {validateSwaggerUIConfig} from '../src/main';

test('throws invalid number', async () => {
  const configMode = validateSwaggerUIConfig('openapi.json', '', '', '');
  await expect(configMode).toBe('specFile');
});
