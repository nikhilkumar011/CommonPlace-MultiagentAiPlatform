import '../config.js';
import { AIMessage } from '@langchain/core/messages';
import { AgentState, type AgentArtifact } from '../graph/state.js';

const IMAGE_MODEL =
  process.env.CLOUDFLARE_IMAGE_MODEL ??
  '@cf/black-forest-labs/flux-2-klein-4b';
const MAX_IMAGE_BASE64_LENGTH = 10_000_000;

export class CloudflareImageApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'CloudflareImageApiError';
  }
}

function getCloudflareCredentials(): { accountId: string; apiToken: string } {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error(
      'CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set in the backend .env file',
    );
  }
  return { accountId, apiToken };
}

async function generateImage(
  prompt: string,
  attachment?: { mimeType: string; data: string },
): Promise<{ data: string; mimeType: string }> {
  const { accountId, apiToken } = getCloudflareCredentials();
  const form = new FormData();
  form.set('prompt', prompt);
  if (attachment) {
    const imageBytes = Uint8Array.from(Buffer.from(attachment.data, 'base64'));
    form.set('image', new Blob([imageBytes], { type: attachment.mimeType }), 'input-image');
  }

  const modelPath = IMAGE_MODEL.split('/')
    .map((segment, index) =>
      index === 0 && segment.startsWith('@')
        ? segment
        : encodeURIComponent(segment),
    )
    .join('/');
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${modelPath}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}` },
      body: form,
      signal: AbortSignal.timeout(90_000),
    },
  );

  if (!response.ok) {
    const messages: Record<number, string> = {
      401: 'Cloudflare rejected the image-generation credentials. Verify CLOUDFLARE_API_TOKEN and that it has Workers AI Read and Edit permissions; also verify CLOUDFLARE_ACCOUNT_ID matches the authorized account.',
      403: 'Cloudflare denied access to image generation. Check the token permissions and Workers AI access for this account.',
      404: 'Cloudflare could not find the configured account or image model. Verify CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGE_MODEL.',
      429: 'Cloudflare Workers AI rate limit or quota was reached. Check the account’s Workers AI usage and limits.',
    };
    const message =
      messages[response.status] ??
      `Cloudflare image generation failed with HTTP ${response.status}`;
    throw new CloudflareImageApiError(response.status, message);
  }

  const contentType = response.headers.get('content-type')?.split(';')[0];
  if (contentType?.startsWith('image/')) {
    const data = Buffer.from(await response.arrayBuffer()).toString('base64');
    return { data, mimeType: contentType };
  }

  const payload: unknown = await response.json();
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('result' in payload) ||
    typeof payload.result !== 'object' ||
    payload.result === null ||
    !('image' in payload.result) ||
    typeof payload.result.image !== 'string'
  ) {
    throw new Error('Cloudflare returned no generated image');
  }

  return { data: payload.result.image, mimeType: 'image/jpeg' };
}

export async function runImageAgent(
  state: typeof AgentState.State,
): Promise<{ messages: AIMessage[]; artifact: AgentArtifact | null }> {
  const prompt = String(state.messages.at(-1)?.content ?? '').trim();
  if (!prompt) {
    throw new Error('Provide a prompt describing the image to generate or edit');
  }
  if (state.attachment && !state.attachment.mimeType.startsWith('image/')) {
    throw new Error('The image agent only accepts image attachments');
  }

  const generated = await generateImage(
    prompt,
    state.attachment
      ? {
          mimeType: state.attachment.mimeType,
          data: state.attachment.data,
        }
      : undefined,
  );
  if (
    !generated.data ||
    generated.data.length > MAX_IMAGE_BASE64_LENGTH ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      generated.data,
    )
  ) {
    throw new Error('Cloudflare returned an invalid or oversized generated image');
  }

  return {
    messages: [new AIMessage('Image generated with Cloudflare Workers AI.')],
    artifact: {
      kind: 'image',
      name: 'generated-image',
      mimeType: generated.mimeType,
      data: generated.data,
    },
  };
}
