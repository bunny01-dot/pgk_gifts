'use server';
/**
 * @fileOverview An AI agent that generates a preview of a personalized gift product.
 *
 * - giftProductPhotoPreview - A function that handles the generation of the gift product preview.
 * - GiftProductPhotoPreviewInput - The input type for the giftProductPhotoPreview function.
 * - GiftProductPhotoPreviewOutput - The return type for the giftProductPhotoPreview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GiftProductPhotoPreviewInputSchema = z.object({
  userPhotoDataUri: z
    .string()
    .describe(
      "A photo provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productTemplateDataUri: z
    .string()
    .describe(
      "A template image of the gift product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productType: z
    .string()
    .describe(
      "A description of the type of gift product (e.g., 'mug', 't-shirt', 'canvas print'), which helps the AI intelligently place the photo."
    ),
});
export type GiftProductPhotoPreviewInput = z.infer<
  typeof GiftProductPhotoPreviewInputSchema
>;

const GiftProductPhotoPreviewOutputSchema = z.object({
  previewPhotoDataUri: z
    .string()
    .describe(
      "The generated image with the user's photo placed on the product template, as a data URI." 
    ),
});
export type GiftProductPhotoPreviewOutput = z.infer<
  typeof GiftProductPhotoPreviewOutputSchema
>;

export async function giftProductPhotoPreview(
  input: GiftProductPhotoPreviewInput
): Promise<GiftProductPhotoPreviewOutput> {
  return giftProductPhotoPreviewFlow(input);
}

const giftProductPhotoPreviewFlow = ai.defineFlow(
  {
    name: 'giftProductPhotoPreviewFlow',
    inputSchema: GiftProductPhotoPreviewInputSchema,
    outputSchema: GiftProductPhotoPreviewOutputSchema,
  },
  async (input) => {
    const { userPhotoDataUri, productTemplateDataUri, productType } = input;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image'),
      prompt: [
        {
          media: {
            url: userPhotoDataUri,
          },
        },
        {
          media: {
            url: productTemplateDataUri,
          },
        },
        {
          text:
            `You are an expert graphic designer specializing in creating personalized gift product previews.` +
            `Your task is to integrate the provided user photo onto the given gift product template.` +
            `The first image is the user's photo. The second image is the gift product template.` +
            `The specific gift product is a ${productType}.` +
            `Intelligently resize, crop (if necessary), and position the user's photo onto the appropriate area of the ${productType} template.` +
            `Ensure the final composite image looks realistic, as if the user's photo is naturally printed or displayed on the ${productType}.` +
            `Pay close attention to perspective, lighting, and reflections to create a convincing preview.` +
            `The goal is to provide the customer with the best visual fit to visualize their personalized gift.`,
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No media was returned from the image generation.');
    }

    return { previewPhotoDataUri: media.url };
  }
);
