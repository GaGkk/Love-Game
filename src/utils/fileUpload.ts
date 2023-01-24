import { diskStorage, FileFilterCallback } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (
    file.mimetype == 'image/jpg' ||
    file.mimetype == 'image/jpeg' ||
    file.mimetype == 'image/png'
  ) {
    return callback(null, true);
  }
  callback(null, false);
  return callback(new BadRequestException('Only images allowed'));
};

const storage = diskStorage({
  destination: (_, file, callback) => {
    const p = path.join(process.cwd(), '/uploads', 'pictures');
    fs.mkdirSync(p, { recursive: true });
    callback(null, p);
  },
  filename: (_, file, callback) => {
    callback(
      null,
      `${crypto
        .createHash('md5')
        .update(`${Date.now()}-${file.originalname}-${file.mimetype}`, 'utf8')
        .digest('hex')}${path.extname(file.originalname)}`,
    );
  },
});

export const fileOptions: MulterOptions = {
  storage,
  //limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
  dest: './uploads/pictures',
};
