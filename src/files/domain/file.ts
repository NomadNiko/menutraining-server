import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Transform } from 'class-transformer';
import fileConfig from '../config/file.config';
import { FileConfig, FileDriver } from '../config/file-config.type';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfig } from '../../config/app-config.type';
import appConfig from '../../config/app.config';

export class FileType {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @Allow()
  id: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/path/to/file.jpg',
  })
  @Transform(
    ({ value }) => {
      // Handle local files
      if ((fileConfig() as FileConfig).driver === FileDriver.LOCAL) {
        return (appConfig() as AppConfig).backendDomain + value;
      }
      // Handle S3 files with public access
      else if ((fileConfig() as FileConfig).driver === FileDriver.S3) {
        // If the bucket is configured for public access, return a direct S3 URL
        if ((fileConfig() as FileConfig).awsS3PublicAccess) {
          const bucketName =
            (fileConfig() as FileConfig).awsDefaultS3Bucket ?? '';
          const region = (fileConfig() as FileConfig).awsS3Region ?? '';
          return `https://${bucketName}.s3.${region}.amazonaws.com/${value}`;
        }

        // Otherwise, use presigned URLs as before
        const s3 = new S3Client({
          region: (fileConfig() as FileConfig).awsS3Region ?? '',
          credentials: {
            accessKeyId: (fileConfig() as FileConfig).accessKeyId ?? '',
            secretAccessKey: (fileConfig() as FileConfig).secretAccessKey ?? '',
          },
        });
        const command = new GetObjectCommand({
          Bucket: (fileConfig() as FileConfig).awsDefaultS3Bucket ?? '',
          Key: value,
        });
        return getSignedUrl(s3, command, { expiresIn: 3600 });
      }
      // Handle S3 presigned URLs
      else if (
        (fileConfig() as FileConfig).driver === FileDriver.S3_PRESIGNED
      ) {
        const s3 = new S3Client({
          region: (fileConfig() as FileConfig).awsS3Region ?? '',
          credentials: {
            accessKeyId: (fileConfig() as FileConfig).accessKeyId ?? '',
            secretAccessKey: (fileConfig() as FileConfig).secretAccessKey ?? '',
          },
        });
        const command = new GetObjectCommand({
          Bucket: (fileConfig() as FileConfig).awsDefaultS3Bucket ?? '',
          Key: value,
        });
        return getSignedUrl(s3, command, { expiresIn: 3600 });
      }
      return value;
    },
    {
      toPlainOnly: true,
    },
  )
  path: string;
}
