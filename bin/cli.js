#! /usr/bin/env node

import process from 'process';
import path from 'path';
import fs from 'fs';
// meh https://github.com/yargs/yargs/issues/1854#issuecomment-787509517
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateSvgSprite, parseConfigFile } from '../src/vjs-sprite.js';
import svgConfigTemplate from "../template/svg.config.file.js";

yargs(hideBin(process.argv))
  .scriptName("vjs-svg-sprite")
  .usage('$0 <command> [argument]')

  .command({
    command: 'create [configFile]',
    describe: 'create a config file',
    builder: {
      configFile: {
        type: 'string',
        describe: 'the config file used to build the svg sprite',
        default: 'vjs-icons-config.json',
      },
    },
    handler: (argv) => {
      const configFile = path.join(process.cwd(), argv.configFile);
      const configTemplate = JSON.stringify(svgConfigTemplate, null, 2);
      fs.writeFileSync(configFile, configTemplate);
    }
  })

  .command({
    command: 'generate [configFile]',
    describe: 'generate the svg sprite',
    builder: {
      configFile: {
        type: 'string',
        demandOption: true,
        describe: 'the config file used build the svg sprite'
      },
      svgSpriteConfigFile: {
        type: 'string',
        describe: 'the config file that overrides the default svg-sprite configuration'
      },
      svgoConfigFile: {
        type: 'string',
        describe: 'the config file that overrides the default svgo configuration applied to each icon'
      },
      svgoCleanSpriteConfigFile: {
        type: 'string',
        describe: 'the config file that overrides the default svgo configuration applied to the sprite'
      },
      debug: {
        type: 'boolean',
        default: false,
        describe: 'activate the debug mode'
      },
    },
    handler: (argv) => {
      if (argv.svgSpriteConfigFile) {
        console.log('svgSpriteConfigFile is not implemented yet')
      }

      if (argv.svgoConfigFile) {
        console.log('svgoConfigFile is not implemented yet')
      }

      if (argv.svgoCleanSpriteConfigFile) {
        console.log('svgoCleanSpriteConfigFile is not implemented yet')
      }

      if (argv.debug) {
        console.log('debug is not implemented yet')
      }

      const configFile = path.join(process.cwd(), argv.configFile);
      const svgIconsConfig = parseConfigFile(configFile);

      generateSvgSprite(process.cwd(), svgIconsConfig);
    }
  })
  .help()
  .argv;
