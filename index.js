import { readdir, rename } from 'fs/promises';
import { statSync } from 'fs';
import { join, parse } from 'path';
import sizeOf from 'image-size';
import { program } from 'commander';
import pkg from '@dev-syco/quick-math';
const { QuickMath } = pkg;

const popData = (img, imgPath) => {
  const path = join(imgPath, img);
  const size = sizeOf(path);
  return {
    path,
    ...size,
    pixels: size.width * size.height,
  };
};

const getImgInfo = async (imgPath) => {
  const dirContent = await readdir(imgPath);
  const rawImages = dirContent.filter((content) =>
    statSync(join(imgPath, content)).isFile(),
  );
  return rawImages.map((img) => popData(img, imgPath));
};

const renameLowQualityImages = ({ path, type, pixels }, pixelThreshold) => {
  if (pixels < pixelThreshold) {
    const pathInfo = parse(path);
    const newPath = join(pathInfo.dir, `LQIMG_${pathInfo.name}.${type}`);
    rename(path, newPath);
  }
};

const start = async ({ path, threshold }) => {
  const imgs = await getImgInfo(path);
  if (imgs.length !== 0) {
    imgs.forEach((img) => {
      renameLowQualityImages(img, QuickMath.calculate(threshold));
    });
  } else console.log('There is no images in the directory');
};

program
  .option('-p, --path <type>', 'Specify images path', './img/')
  .option(
    '-t, --threshold <type>',
    'Total pixel threshold (eg: 700*700 or 700x700)',
    700 * 700,
  );

const options = program.opts();
program.parse(process.argv);

start(options);
