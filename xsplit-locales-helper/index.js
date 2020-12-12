const fs = require('fs/promises');
const path = require('path');

const [input, output, fileName] = parseArgv();

fs.readdir(input).then((subdirs) => {
  subdirs.forEach(async (subdir) => {
    try {
      const inputPath = path.join(input, subdir, fileName);
      const outputPath = path.join(output, subdir);
      await fs.access(inputPath)
      await fs.mkdir(outputPath, { recursive: true });
      await fs.copyFile(inputPath, path.join(outputPath, fileName));
    } catch (error) {
      // do nothing
    }
  });
});

function parseArgv() {
  if (process.argv.length < 4) {
    throw new Error('Missing arguments. Execute script with input and output paths.');
  }
  const [_node, _script, input, output, filename] = process.argv;
  return [input, output, filename];
}
