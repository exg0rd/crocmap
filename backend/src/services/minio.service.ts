import { Client, BucketItemStat } from 'minio';
import * as stream from 'stream';

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

class MinioService {
  private client: Client | null = null;
  private config: MinioConfig | null = null;
  private initialized: boolean = false;

  initialize(config?: MinioConfig): void {
    const minioConfig = config || {
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucketName: process.env.MINIO_BUCKET_NAME || 'business-trips-photos',
    };

    this.config = minioConfig;
    this.client = new Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });

    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.client || !this.config) {
      throw new Error('Minio service not initialized. Call initialize() first.');
    }
  }

  async ensureBucketExists(): Promise<void> {
    this.ensureInitialized();
    
    try {
      const exists = await this.client!.bucketExists(this.config!.bucketName);
      if (!exists) {
        await this.client!.makeBucket(this.config!.bucketName);
        console.log(`Bucket ${this.config!.bucketName} created successfully`);
        
        // Устанавливаем политику публичного доступа для чтения (опционально)
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.config!.bucketName}/*`],
            },
          ],
        };
        await this.client!.setBucketPolicy(this.config!.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    objectName: string
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      await this.ensureBucketExists();

      const buffer = file.buffer;
      const streamData = new stream.PassThrough();
      streamData.end(buffer);

      await this.client!.putObject(
        this.config!.bucketName,
        objectName,
        streamData,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      const url = await this.client!.presignedGetObject(
        this.config!.bucketName,
        objectName,
        24 * 60 * 60 * 7 // URL действителен 7 дней
      );

      return url;
    } catch (error) {
      console.error('Error uploading file to Minio:', error);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.removeObject(this.config!.bucketName, objectName);
    } catch (error) {
      console.error('Error deleting file from Minio:', error);
      throw error;
    }
  }

  async getFileStats(objectName: string): Promise<BucketItemStat> {
    this.ensureInitialized();
    
    try {
      const stat = await this.client!.statObject(
        this.config!.bucketName,
        objectName
      );
      return stat;
    } catch (error) {
      console.error('Error getting file stats from Minio:', error);
      throw error;
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      await this.client!.statObject(this.config!.bucketName, objectName);
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  async getPresignedUrl(objectName: string, expirySeconds: number = 3600): Promise<string> {
    this.ensureInitialized();
    
    try {
      const url = await this.client!.presignedGetObject(
        this.config!.bucketName,
        objectName,
        expirySeconds
      );
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }
}

export const minioService = new MinioService();
