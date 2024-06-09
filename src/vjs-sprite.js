import fs from "fs";
import path from 'path';
import crypto from "crypto";
import svgo from 'svgo';
import svgSprite from 'svg-sprite';
import svgSpriterConfig from './svg-sprite.config.js';
import svgoConfig from './svgo.config.js';
import svgoCleanConfig from './svgo.clean.config.js';

/**
 * Generates an SVG sprite based on the configuration provided.
 *
 * @param {string} workingDir The directory where the sprite will be generated
 * @param {object} cliConfig Configuration options for generating the sprite
 */
export function generateSvgSprite(workingDir, cliConfig, options = {
  svgSpriterConfig,
  svgoConfig,
  svgoCleanConfig,
  debug: false
}) {
  if (cliConfig['output-dir']) {
    svgSpriterConfig.mode.symbol.dest = cliConfig['output-dir'];
  }

  // Create an instance of the SVG spriter
  /** @type {import('svg-sprite').SVGSpriter} */
  const svgSpriter = new svgSprite(svgSpriterConfig);

  // Define the temporary directory for intermediate files
  const tempDirPath = path.join(workingDir, `vjs-sprite-tmp_${crypto.randomUUID()}`);

  // Generate icon paths based on the provided configuration
  const iconPaths = generateIconPaths(workingDir, tempDirPath, cliConfig);

  // Create the temporary directory
  createTempDir(tempDirPath);

  // Optimize each icon and add it to the sprite
  iconPaths.forEach(({ iconPath, tempIconPath }) => {
    const optimizedIconSvg = optimizeTempIcon(iconPath, svgoConfig);

    storeIconInTempDir(tempIconPath, optimizedIconSvg);
    addTempFileToSprite(svgSpriter, tempIconPath);
  });

  // Compile the final sprite and save it to specified paths
  compileSprite(svgSpriter).forEach(({ contents, path: contentPath }) => {
    let finalContent = contents;

    // If it's the sprite file
    if (contentPath.endsWith('.svg')) {
      finalContent = optimizeSprite(contents, svgoCleanConfig);
    }

    // Persist the optimized content to the specified path
    persistSvgSpriteContent(contentPath, finalContent);
  });

  // Clean up the temporary directory
  deleteTempDir(tempDirPath);
}

/**
 * Generates an array of icon paths based on the provided configuration.
 *
 * @param {string} workingDir
 * @param {string} tempDir
 * @param {object} svgConfigFile
 *
 * @returns {Array<{iconPath: string, tempIconPath: string}>}
 */
export function generateIconPaths(workingDir, tempDir, svgConfigFile) {
  return Object.entries(svgConfigFile.icons).map(([name, file]) => {
    // Determine the icon file directory: use the 'root-dir' from the file object if available, otherwise use the 'root-dir' from the configuration
    const fileDir = typeof file === 'object' && file['root-dir'] ? file['root-dir'] : svgConfigFile['root-dir'];

    // Determine the icon file name: use the 'file' property from the file object if available, otherwise use the file itself
    const fileName = typeof file === 'object' && file['file'] ? file['file'] : file;

    // Define the path to the icon file to optimize
    const iconPath = path.join(workingDir, fileDir, fileName);

    // Define the temporary file name
    const tempIconPath = path.join(tempDir, `${name}.svg`);

    return {
      iconPath,
      tempIconPath
    }
  });
};

/**
 * Create a temporary directory containing the svg files to optimize.
 *
 * @param {string} tempDir
 */
export function createTempDir(tempDir) {
  if (fs.existsSync(tempDir)) return;

  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Optimizes a temporary icon by removing unnecessary attributes.
 *
 * @param {string} tempIconPath
 * @param {object} svgoConfig Configuration options for SVGO
 *
 * @returns {string} The optimized SVG data
 */
export function optimizeTempIcon(tempIconPath, svgoConfig) {
  const svgContent = fs.readFileSync(tempIconPath, 'utf8');
  const { data } = svgo.optimize(svgContent, svgoConfig);

  return data;
}

/**
 * Stores an icon in the temporary directory.
 *
 * @param {string} filePath The path where the icon data will be stored
 * @param {string} data The SVG data representing the icon
 */
export function storeIconInTempDir(filePath, data) {
  fs.writeFileSync(filePath, data);
}

/**
 * Adds a temporary file to the sprite.
 *
 * @param {import('svg-sprite').SVGSpriter} svgSpriter
 * @param {string} filePath The path to the temporary file.
 */
export function addTempFileToSprite(svgSpriter, filePath) {
  const svgContent = fs.readFileSync(filePath, 'utf-8');

  svgSpriter.add(filePath, null, svgContent);
}

/**
 * Compiles an SVG sprite using the provided sprite object.
 *
 * @param {import('svg-sprite').SVGSpriter} svgSpriter
 *
 * @returns {Array<object>} the SVG sprite and HTML page
 */
export function compileSprite(svgSpriter) {
  let content = {};

  svgSpriter.compile((error, result) => {
    if (error) {
      console.error('Sprite compilation failed', error);
      return;
    }

    const { symbol } = result;

    content = Object.values(symbol);
  });

  return content;
}

/**
 * Optimizes an SVG sprite buffer using SVGO.
 *
 * @param {Buffer} buffer The SVG sprite buffer
 * @param {object} config Configuration options for SVGO
 *
 * @returns {string} The optimized SVG data
 */
export function optimizeSprite(buffer, config) {
  const svgTextDecoder = new TextDecoder("utf-8");
  const svgContent = svgTextDecoder.decode(buffer);

  const { data } = svgo.optimize(svgContent, config);

  return data;
}

/**
 * Saves the generated SVG sprite and preview HTML page to a specified file path.
 *
 * @param {string} contentPath The path where the content will be saved
 * @param {string} content
 */
export function persistSvgSpriteContent(contentPath, content) {
  fs.mkdirSync(path.dirname(contentPath), { recursive: true });
  fs.writeFileSync(contentPath, content);
}

/**
 * Delete the temporary directory.
 *
 * @param {string} tempDir
 */
export function deleteTempDir(tempDir) {
  fs.rmSync(tempDir, { recursive: true });
}

/**
 * Parse the configuration file used to link an icon's name to its file.
 *
 * @param {string} fileName The path of configuration file to parse
 * @param {string} [encoding='utf8'] The encoding used to read the file. Defaults to 'utf8'
 *
 * @returns {Object|undefined} The parsed object from the configuration file or undefined if no fileName is provided
 */
export function parseConfigFile(fileName, encoding = 'utf8') {
  if (!fileName) return;

  const configFile = fs.readFileSync(fileName, encoding);

  return JSON.parse(configFile);
};
