import { parse } from 'node-html-parser'

export async function ddgSearch({ query, offset = 0, freshness = 'noLimit' }) {
    const freshnessMap = {
        'oneDay': 'd',
        'oneWeek': 'w',
        'oneMonth': 'm',
        'oneYear': 'y',
        'noLimit': ''
    };
    const res = await fetch('https://html.duckduckgo.com/html/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html',
        },
        body: new URLSearchParams({
            q: query,
            df: freshnessMap[freshness] || '',
            kl: 'us-en',
            ...offset > 0 ? { 
                s: offset,
                api: 'd.js',
                dc: offset + 1,
                o: 'json',
                nextParams: '',
                v: 'l',
                vqd: '4-53750368248457412799668536346749770582',
            } : {}
        }),
    });
    if (!res.ok) {
        throw new Error(`Search request failed with status ${res.status}`);
    }

    
    const html = await res.text();
    const root = parse(html);
    if (root.querySelector('.no-results')) {
        return {
            count: 0,
            offset,
            results: []
        }
    }

    const results = root.querySelectorAll('.serp__results .result').map((el) => ({
        title: el.querySelector('.result__title')?.textContent.trim(),
        url: el.querySelector('.result__url')?.getAttribute('href'),
        text: el.querySelector('.result__snippet')?.textContent.trim()
    }));

    return {
        count: results.length,
        offset,
        results
    }
}