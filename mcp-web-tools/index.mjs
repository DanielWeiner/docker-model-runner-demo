#!/usr/bin/env node
import { URL } from 'url';

import { McpServer, createMcpHandler } from "@modelcontextprotocol/server"
import { toNodeHandler } from '@modelcontextprotocol/node';
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { z } from "zod/v4";
import { createMcpExpressApp } from '@modelcontextprotocol/express';
import { ddgSearch } from './ddg.mjs';
import { translateText } from './translate.mjs';

/**
 * Fetch content from a URL with basic error handling.
 */
async function webFetch(url) {
  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const res = await fetch(parsedUrl.toString());

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const rawContent = await res.text();
  const content = contentType.includes('text/html') ? NodeHtmlMarkdown.translate(rawContent) : rawContent;

  return {
    content: [
      {
        type: 'text',
        text: content
      }
    ]
  };
}

/**
 * Search the web using DuckDuckGo (free, no API key required).
 */
async function webSearch(inputQuery, inputOffset, freshness) {
  const { count, offset, results } = await ddgSearch({ query: inputQuery, offset: inputOffset, freshness });
  await new Promise(resolve => setTimeout(resolve, 2000)); // Delay to avoid rate limiting

  return {
    structuredContent: {
      count,
      offset,
      results
    }
  };
}


const handler = createMcpHandler(() => {
    const webToolsServer = new McpServer({
      name: 'web_tools',
      version: '1.0.0',
      description: 'Web Fetch, Search Tools, and translation tool for MCP'
    });

    webToolsServer.registerTool(
      'web_fetch', { 
        description:'Fetch content from a URL', 
        inputSchema: z.object({
          url: z.url().describe('URL to fetch content from')
        })
    }, async ({ url }) => {
      return await webFetch(url);
    });

    webToolsServer.registerTool('web_search', {
      title: 'Web Search',
      description: 'Search the web for results matching a query string using the DuckDuckGo search engine.',
      inputSchema: z.object({
        query: z.string().describe('Search query string'),
        offset: z.int().min(0).default(0).describe('Results offset for search results pagination'),
        freshness: z.enum([
          'oneDay', 
          'oneWeek', 
          'oneMonth', 
          'oneYear', 
          'noLimit'
        ]).default('noLimit').describe('Freshness of search results (oneDay, oneWeek, oneMonth, oneYear, noLimit)'),
      }),
      outputSchema: z.object({
        count: z.int().describe('Number of search results returned'),
        offset: z.int().describe('Offset used for search results pagination'),
        results: z.array(z.object({
          title: z.string().describe('Title of the search result'),
          url: z.url().describe('URL of the search result'),
          text: z.string().describe('Summary of the search result')
        })).describe('Array of search results')
      })
    }, async ({ query, offset, freshness}) => {
      const result = await webSearch(query, offset, freshness);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result.structuredContent, null, 2)
        }],
        ...result
      };      
    });

    webToolsServer.registerTool('translate_text', {
      title: 'Translate Text',
      description: 'Translate text to English using Google Cloud Translation API.',
      inputSchema: z.object({
        text: z.string().describe('Text to translate')
      }),
      outputSchema: z.object({
        translation: z.string().nullable().describe('Translated text in English'),
        detectedLanguage: z.string().nullable().describe('Detected language code of the input text')
      })
    }, async ({ text }) => {
      const { detectedLanguage, translation } = await translateText(text); 
      return {
        content: [{ 
          type: 'text', 
          text: translation 
        }],
        structuredContent: {
          translation,
          detectedLanguage,
        }
      };
    });

    return webToolsServer;
});

const app = createMcpExpressApp({ allowedHosts: ['localhost', 'mcp-web-tools', '127.0.0.1']});
const node = toNodeHandler(handler);
app.all('/mcp', (req, res) => void node(req, res, req.body));

/**
 * SSE Server for MCP protocol
 */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`MCP Web Tools Server ready at http://localhost:${PORT}`);
  console.log(`   - HTTP endpoint: GET http://localhost:${PORT}/mcp`);
  console.log(`   - Available tools:`);
  console.log(`     * web_fetch(url) - Fetch content from a URL`);
  console.log(`     * web_search(query, offset, freshness) - Search the web using the DuckDuckGo search engine`);
  console.log(`     * translate_text(text) - Translate text to English`);
  console.log(`   - Press Ctrl+C to stop`);
});
