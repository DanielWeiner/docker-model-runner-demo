import { TranslationServiceClient } from '@google-cloud/translate';
import { JWT } from 'google-auth-library';
import { decode } from 'html-entities';

const creds = JSON.parse(process.env.MCP_UTILS_CREDS);

const jwtClient = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-translation'],
});

export async function translateText(text) {
    const translationClient = new TranslationServiceClient({
        authClient: jwtClient
    });

    const [result] = await translationClient.translateText({
        contents: [text],
        targetLanguageCode: 'en-US',
        parent: translationClient.locationPath('mcp-utils', 'global'),
    });

    if (!result.translations || result.translations.length === 0) {
        return {
            translation: null,
            detectedLanguage: null
        }
    }

    return {
        translation: decode(result.translations[0].translatedText),
        detectedLanguage: result.translations[0].detectedLanguageCode
    };
}