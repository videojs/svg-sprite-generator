#! /usr/bin/env node

import process from 'process';
import * as vjsSprite from './src/vjs-sprite.js';

// Config file
const svgIconsConfig = vjsSprite.parseConfigFile('svg-icons.json');

// Generate the sprite
vjsSprite.generateSvgSprite(process.cwd(), svgIconsConfig);
