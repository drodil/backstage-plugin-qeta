import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export type ActionImage = {
  base64: string;
  mimeType: string;
};

export type ActionHeaderImage = string | ActionImage | undefined;

type UploadedImage = {
  id: number;
  locationUri: string;
};

export const uploadImages = async (
  api: QetaClient,
  images: ActionImage[] | undefined,
  token: string,
): Promise<UploadedImage[] | undefined> => {
  if (images === undefined) {
    return undefined;
  }

  const uploadedImages: UploadedImage[] = [];
  for (const image of images) {
    const base64 = image.base64.replace(/\s/g, '');
    const buffer = Buffer.from(base64, 'base64');
    if (
      base64.length === 0 ||
      buffer.length === 0 ||
      buffer.toString('base64').replace(/=+$/, '') !== base64.replace(/=+$/, '')
    ) {
      throw new Error('Invalid base64 image data');
    }

    const bytes = new Uint8Array(buffer.length);
    bytes.set(buffer);
    const attachment = await api.postAttachment(
      new Blob([bytes.buffer], { type: image.mimeType }),
      undefined,
      { token },
    );
    if ('errors' in attachment) {
      throw new Error(
        `Failed to upload image: ${JSON.stringify(attachment.errors)}`,
      );
    }
    uploadedImages.push({
      id: attachment.id,
      locationUri: attachment.locationUri,
    });
  }

  return uploadedImages;
};

export const uploadPostImages = async (
  api: QetaClient,
  images: ActionImage[] | undefined,
  headerImage: ActionHeaderImage,
  token: string,
): Promise<{ images?: number[]; headerImage?: string }> => {
  const [uploadedImages, uploadedHeaderImage] = await Promise.all([
    uploadImages(api, images, token),
    typeof headerImage === 'string' || headerImage === undefined
      ? undefined
      : uploadImages(api, [headerImage], token),
  ]);
  const headerAttachment = uploadedHeaderImage?.[0];
  const uploadedImageIds = [
    ...(uploadedImages?.map(image => image.id) ?? []),
    ...(headerAttachment ? [headerAttachment.id] : []),
  ];

  return {
    images:
      uploadedImages !== undefined || headerAttachment !== undefined
        ? uploadedImageIds
        : undefined,
    headerImage:
      typeof headerImage === 'string'
        ? headerImage
        : headerAttachment?.locationUri,
  };
};
