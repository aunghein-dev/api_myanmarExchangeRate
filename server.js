import express from 'express';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config({ path: '.env.local' });

const korToEng = {
  '미국': 'United States',
  '유럽연합': 'European Union',
  '일본 JPY': 'Japan',
  '중국': 'China',
  '홍콩': 'Hong Kong',
  '대만': 'Taiwan',
  '영국': 'United Kingdom',
  '오만': 'Oman',
  '캐나다': 'Canada',
  '스위스': 'Switzerland',
  '스웨덴': 'Sweden',
  '호주': 'Australia',
  '뉴질랜드': 'New Zealand',
  '체코': 'Czech Republic',
  '칠레': 'Chile',
  '튀르키예': 'Turkey',
  '몽골': 'Mongolia',
  '이스라엘': 'Israel',
  '덴마크': 'Denmark',
  '노르웨이': 'Norway',
  '사우디아라비아': 'Saudi Arabia',
  '쿠웨이트': 'Kuwait',
  '바레인': 'Bahrain',
  '아랍에미리트': 'United Arab Emirates',
  '요르단': 'Jordan',
  '이집트': 'Egypt',
  '태국': 'Thailand',
  '싱가포르': 'Singapore',
  '말레이시아': 'Malaysia',
  '인도네시아 IDR': 'Indonesia',
  '카타르': 'Qatar',
  '카자흐스탄': 'Kazakhstan',
  '브루나이': 'Brunei',
  '인도': 'India',
  '파키스탄': 'Pakistan',
  '방글라데시': 'Bangladesh',
  '필리핀': 'Philippines',
  '멕시코': 'Mexico',
  '브라질': 'Brazil',
  '베트남 VND': 'Vietnam',
  '남아프리카 공화국': 'South Africa',
  '러시아': 'Russia',
  '헝가리': 'Hungary',
  '폴란드': 'Poland',
  '스리랑카': 'Sri Lanka',
  '알제리': 'Algeria',
  '케냐': 'Kenya',
  '콜롬비아': 'Colombia',
  '탄자니아': 'Tanzania',
  '네팔': 'Nepal',
  '루마니아': 'Romania',
  '리비아': 'Libya',
  '마카오': 'Macau',
  '미얀마': 'Myanmar',
  '에티오피아': 'Ethiopia',
  '우즈베키스탄': 'Uzbekistan',
  '캄보디아': 'Cambodia',
  '피지': 'Fiji',
};

const app = express();
let exchangeData = [];
let isDataLoading = true;

const MM_URL = process.env.MM_URL;
const NAV_URL = process.env.NAV_URL;

const fetchExchangeRates = async () => {
  let browser;
  try {
    console.log('🚀 Starting scraping process...');
    isDataLoading = true;

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const [mmPage, naverPage] = await Promise.all([browser.newPage(), browser.newPage()]);

    console.log('🌍 Successfully opened two pages.');

    const [usdToMmkRate, naverRates] = await Promise.all([
      (async () => {
        console.log('Navigating to mmexchange.org...');
        await mmPage.goto(MM_URL, { waitUntil: 'domcontentloaded' });
        await mmPage.waitForSelector('#usdRate', { timeout: 60000 });
        return mmPage.evaluate(() => {
          const usdRateText = document.querySelector('#usdRate')?.textContent.trim();
          if (!usdRateText) return null;
          return parseFloat(usdRateText.replace(/,/g, '').replace(/\s*MMK/, ''));
        });
      })(),
      (async () => {
        console.log('Navigating to Naver Finance...');
        await naverPage.goto(NAV_URL, { waitUntil: 'domcontentloaded' });
        await naverPage.waitForSelector('tbody', { timeout: 60000 });
        return naverPage.evaluate((korToEng) => {
          const rows = Array.from(document.querySelectorAll('tbody > tr'));
          const usdToKrwRate = parseFloat(rows[0].querySelectorAll('td')[1].textContent.replace(/,/g, ''));
          return {
            usdToKrwRate,
            data: rows.map(row => {
              const tds = row.querySelectorAll('td');
              if (tds.length < 7) return null;
              const currencyText = tds[0].textContent.trim();
              const lastSpaceIndex = currencyText.lastIndexOf(' ');
              const countryKor = lastSpaceIndex === -1 ? currencyText : currencyText.slice(0, lastSpaceIndex).trim();
              let currencyCode = lastSpaceIndex === -1 ? '' : currencyText.slice(lastSpaceIndex + 1).trim();
              const countryEng = korToEng[countryKor] || countryKor;
              const parseNumber = (value) => {
                if (!value || typeof value !== 'string') return null;
                const cleaned = value.trim();
                if (cleaned === 'N/A' || cleaned === '-') return null;
                return cleaned.replace(/,/g, '');
              };
              let baseRateText = parseNumber(tds[1]?.textContent?.trim());
              let liveRate = parseFloat(baseRateText);
              if (['JPY', 'VND', 'IDR'].includes(currencyCode)) {
                liveRate /= 100;
                buyRate /= 100;
                sellRate /= 100;
              }
              if (countryEng === 'Japan') {
                currencyCode = 'JPY';
              } else if (countryEng === 'Vietnam') {
                currencyCode = 'VND';
              } else if (countryEng === 'Indonesia') {
                currencyCode = 'IDR';
              }
              return {
                country: countryEng,
                currencyCode,
                liveRate,
              };
            }).filter(Boolean),
          };
        }, korToEng);
      })(),
    ]);

    const usdToMmk = usdToMmkRate;
    const usdToKrw = naverRates.usdToKrwRate;
    const times = usdToMmk / usdToKrw;

    const convertedData = naverRates.data
      .map(item => ({
        ...item,
        liveRate: (item.liveRate * times).toFixed(4),
      }))
      .filter(item => item.currencyName !== 'Myanmar');

    exchangeData = convertedData;
    console.log('📊 Scraping finished and data updated.');
  } catch (error) {
    console.error('❌ An error occurred during scraping:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed.');
    }
    isDataLoading = false;
  }
};

fetchExchangeRates();
setInterval(fetchExchangeRates, 30 * 60 * 1000);

app.get('/', (req, res) => {
  if (isDataLoading) {
    res.status(503).json({
      message: 'Service is temporarily unavailable, fetching latest data. Please try again in a moment.',
      loading: true,
    });
  } else if (exchangeData.length === 0) {
    res.status(500).json({
      message: 'Failed to fetch exchange rate data. Please check logs for errors.',
      loading: false,
    });
  } else {
    res.json({
      rates: exchangeData,
      lastUpdated: new Date().toISOString(),
    });
  }
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
