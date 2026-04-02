const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

const OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: true,
  debugProtection: true,
  debugProtectionInterval: 4000,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 3,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 5,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

const files = ['guard.js', 'script.js', 'database.js'];

files.forEach(file => {
  const src = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const result = JavaScriptObfuscator.obfuscate(src, OPTIONS);
  const outPath = path.join(distDir, file);
  fs.writeFileSync(outPath, result.getObfuscatedCode());
  const origSize = (src.length / 1024).toFixed(1);
  const newSize = (result.getObfuscatedCode().length / 1024).toFixed(1);
  console.log(`✅ ${file}: ${origSize}KB → ${newSize}KB (obfuscated)`);
});

console.log('\n🔒 Build concluído! Arquivos em /dist/');
