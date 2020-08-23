import * as core from '@actions/core';
import {exec} from '@actions/exec';
import * as io from '@actions/io';
import {Octokit} from '@octokit/rest';
import * as fs from 'fs';
import {join} from 'path';
import {satisfies} from 'semver';

async function run(): Promise<void> {
  try {
    const config = validateConfig();

    const release = await getSwaggerUIRelease(config);

    const tempDir = 'swagger-ui-action-temp';

    core.info(`Configuration:${config}`);
    core.info(`Swagger UI version: ${release.tag_name}`);

    await io.mkdirP(tempDir);
    await io.mkdirP(config.outputPath);

    await downloadSwaggerUI(tempDir, release.tarball_url, config);

    const swaggerConfig = await createSwaggerConfig(config);
    await createIndexHtml(config, swaggerConfig);

    await io.rmRF(tempDir);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getBasenameInArchive(archive: string): Promise<string> {
  let filesList = '';
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        filesList += data.toString();
      }
    }
  };
  await exec('tar', ['-tzf', archive], options);
  return filesList.split('\n')[0];
}

async function downloadSwaggerUI(
  tempDir: string,
  url: string,
  {outputPath}: Config
): Promise<void> {
  const swaggerUIArchivePath = join(tempDir, 'swagger-ui.tar.gz');
  await exec('curl', ['-o', swaggerUIArchivePath, url]);
  const basenameInArchive = await getBasenameInArchive(swaggerUIArchivePath);
  await exec('tar', [
    '-xzf',
    swaggerUIArchivePath,
    '--strip-components=1',
    join(basenameInArchive, 'dist')
  ]);

  const requiredFiles = [
    'swagger-ui-bundle.js',
    'swagger-ui-standalone-preset.js',
    'swagger-ui.css',
    'favicon-16x16.png',
    'favicon-32x32.png'
  ];
  await Promise.all(requiredFiles.map(async file => io.mv(file, outputPath)));
}

async function createIndexHtml(
  {outputPath}: Config,
  swaggerConfig: string
): Promise<void> {
  const outputFile = join(outputPath, 'index.html');
  await io.cp(`${__dirname}/../resources/index.html`, outputFile);
  await exec('sed', ['-i', `s|<swaggerConfig>|${swaggerConfig}|`, outputFile]);
}

async function createSwaggerConfig(config: Config): Promise<string> {
  switch (config.configMode) {
    case 'swaggerConfigFile':
      core.info('skip swagger config creation and use provided url');
      io.cp(
        config.swaggerConfigFile,
        join(config.outputPath, 'swagger-config')
      );
      return 'swagger-config';
    case 'swaggerConfigUrl':
      core.info('skip swagger config creation and use provided url');
      return config.swaggerConfigUrl;
    case 'specFile':
      await io.cp(config.specFile, join(config.outputPath, 'spec'));
      return await generateSwaggerConfig(config, 'spec');
    case 'specUrl':
      return await generateSwaggerConfig(config, config.specUrl);
  }
}

async function generateSwaggerConfig(
  config: Config,
  url: string
): Promise<string> {
  const swaggerUIConfig = JSON.parse(
    await fs.promises.readFile(
      `${__dirname}/../resources/swagger-config.json`,
      {encoding: 'utf8'}
    )
  );
  await fs.promises.writeFile(join(config.outputPath, 'swagger-config.json'), {
    ...swaggerUIConfig,
    url
  });
  return 'swagger-config.json';
}

function validateConfig(): Config {
  const outputPath = core.getInput('output');
  const swaggerUIVersion = core.getInput('version');
  const specFile = core.getInput('spec-file');
  const specUrl = core.getInput('spec-url');
  const swaggerConfigFile = core.getInput('swagger-config-file');
  const swaggerConfigUrl = core.getInput('swagger-config-file');
  const configMode = validateSwaggerUIConfig(
    specFile,
    specUrl,
    swaggerConfigFile,
    swaggerConfigUrl
  );

  return {
    configMode,
    specFile,
    specUrl,
    swaggerConfigFile,
    swaggerConfigUrl,
    swaggerUIVersion,
    outputPath
  };
}

export function validateSwaggerUIConfig(
  specFile: string,
  specUrl: string,
  swaggerConfigFile: string,
  swaggerConfigUrl: string
): ConfigMode {
  let configMode: ConfigMode | null = null;
  if (specFile) {
    if (configMode) {
      invalidSwaggerUiConfig(configMode, 'specFile');
    } else {
      configMode = 'specFile';
    }
  }
  if (specUrl) {
    if (configMode) {
      invalidSwaggerUiConfig(configMode, 'specUrl');
    } else {
      configMode = 'specUrl';
    }
  }
  if (swaggerConfigFile) {
    if (configMode) {
      invalidSwaggerUiConfig(configMode, 'swaggerConfigFile');
    } else {
      configMode = 'swaggerConfigFile';
    }
  }
  if (swaggerConfigUrl) {
    if (configMode) {
      invalidSwaggerUiConfig(configMode, 'swaggerConfigUrl');
    } else {
      configMode = 'swaggerConfigUrl';
    }
  }

  if (!configMode) {
    const message =
      'You must specify a configuration input to configure swagger-ui. e.g. a url to a swagger spec or a swagger-config.yaml';
    core.setFailed(message);
    throw message;
  } else {
    return configMode;
  }
}

function invalidSwaggerUiConfig(configMode: string, secondMode: string): never {
  const message =
    'Only one configuration input can be used to configure swagger-ui with this action.' +
    `You specified "${configMode}" and "${secondMode}" at the same time!`;
  core.setFailed(message);
  throw message;
}

async function getSwaggerUIRelease({
  swaggerUIVersion
}: Config): Promise<{tag_name: string; tarball_url: string}> {
  const octokit = new Octokit();
  const releases = await octokit.repos.listReleases({
    owner: 'swagger-api',
    repo: 'swagger-ui'
  });
  const matchingReleases = releases.data
    .filter(x => x.prerelease !== true)
    .filter(x => x.draft !== true)
    .filter(x => satisfies(x.tag_name, swaggerUIVersion));
  if (!matchingReleases.length) {
    const message = 'No valid Swagger UI releases found';
    core.setFailed(message);
    throw message;
  }
  return matchingReleases[0];
}

type ConfigMode =
  | 'specFile'
  | 'specUrl'
  | 'swaggerConfigFile'
  | 'swaggerConfigUrl';

interface Config {
  configMode: ConfigMode;
  specFile: string;
  specUrl: string;
  swaggerConfigFile: string;
  swaggerConfigUrl: string;
  swaggerUIVersion: string;
  outputPath: string;
}

run();
