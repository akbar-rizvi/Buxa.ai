import axios from 'axios';
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { format } from 'date-fns';
import cheerio from 'cheerio';
import { envConfigs } from "../config/envConfig";

// Set environment variables (use dotenv for production)
const SERPER_API_KEY = envConfigs.serper_api_key_research;
const GROQ_API_KEY1 = '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';
const GROQ_API_KEY2 = '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';

const research_llm = new ChatGroq({
  temperature: 0,
  modelName: 'llama-3.1-70b-versatile',
  apiKey: GROQ_API_KEY1
});

const editor_llm = new ChatGroq({
  temperature: 0,
  modelName: 'llama-3.1-70b-versatile',
  apiKey: GROQ_API_KEY2
});

const writer_llm = new ChatOpenAI({
  model: 'gpt-4-turbo',
  openAIApiKey: envConfigs.openapikey,
});

// Log with date and time
function log(level, message) {
  console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${level}: ${message}`);
}

// Initial search function
async function initialSearch(query) {
  log('INFO', `Starting initial search for query: ${query}`);
  
  const url = 'https://google.serper.dev/search';
  const payload = { q: query, num: 20 };

  const response = await axios.post(url, payload, {
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  const results = response.data.organic;
  let snippets = '';

  results.forEach((result) => {
    if (result.snippet) snippets += `${result.snippet}\n`;
  });

  log('INFO', `Found ${results.length} results for query: ${query}`);
  return snippets;
}

// Generate search queries function
async function generateSearchQueries(topic, context) {
  const promptTemplate = `
    You are a seasoned journalist tasked with generating diverse search queries.
    Generate 5 search queries to get all the news around the topic: ${topic}.
    Use the following context to create diverse search queries:
    ${context}
  `;
  
  const formattedPrompt = promptTemplate.replace(/\s+/g, ' ').trim();
  let response = await research_llm.invoke(formattedPrompt);
  console.log("Response from research_llm:", response);
  try {
    const data = JSON.parse(JSON.stringify(response.content));
    const responseData = [];
    responseData.push(data);
    return responseData;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    console.error("Response content:", response.content);
    throw new Error("Invalid response format");
  }
}

// Full search function
async function fullSearch(queries) {
  log('INFO', `Starting full search for ${queries.length} queries`);
  const url = 'https://google.serper.dev/search';
  let results = [];

  for (const query of queries) {
    const payload = { q: query, num: 100 };
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const organicResults = response.data;
    let organicresult = [];
    organicresult.push(organicResults);
    organicresult.forEach((search) => {
      search.organic.forEach((result) => {
        if (!result.link.includes('washingtonpost.com') && result.title && result.link && result.snippet) {
          results.push({
            title: result.title,
            link: result.link,
            snippet: result.snippet
          });
        }
      });
    });
  }

  log('INFO', `Retrieved ${results.length} relevant and diverse results`);
  return results;
}

// Full search past week function
const fullSearchPastWeek = async (queries) => {
  log('INFO', `Starting full search for ${queries.length} queries for the past week`);
  const url = 'https://google.serper.dev/search';
  let results = [];

  for (const query of queries) {
    const payload = { q: query, num: 100, tbs: 'qdr:w' };
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const organicResults = response.data;
    organicResults.organic.forEach((result) => {
      if (!result.link.includes('washingtonpost.com') && result.title && result.link && result.snippet) {
        results.push({
          title: result.title,
          link: result.link,
          snippet: result.snippet
        });
      }
    });
  }

  log('INFO', `Retrieved ${results.length} relevant and diverse results`);
  return results;
};


const fullSearchPast24hrs = async (queries:any):Promise<any> => {
  console.log(typeof queries, 'queries');
  console.log(`Starting full search for ${queries.length} queries for the past 24 hours`);
  const pay = await queries.map((query:any) => ({ q: query, num: 50, tbs: "qdr:d" }));
  const url = "https://google.serper.dev/search";
  let results = [];

  try {
      const response = await axios.post(url, pay, {
          headers: {
              'X-API-KEY': SERPER_API_KEY,
              'Content-Type': 'application/json'
          }
      });
      
      const organicResults:any = response.data;
      
      for (const search of organicResults) {
          for (const result of search.organic) {
              if (result.link && !result.link.includes("washingtonpost.com")) {
                  if (result.title && result.link && result.snippet) {
                      results.push({
                          title: result.title,
                          link: result.link,
                          snippet: result.snippet
                      });
                  }
              }
          }
      }

      // Count and sort links
      const linkCounter = results.reduce((acc:any, source) => {
          acc[source.link] = (acc[source.link] || 0) + 1;
          return acc;
      }, {});

      const sortedLinks = Object.entries(linkCounter).sort((a:any, b:any) => b[1] - a[1]).slice(0, 10);
      const uniqueArticles:any[] = [];
      const seenLinks = new Set();

      results.forEach(source => {
          if (sortedLinks.some(link => link[0] === source.link) && !seenLinks.has(source.link)) {
              uniqueArticles.push(source);
              seenLinks.add(source.link);
          }
      });

      console.log(`Retrieved ${results.length} relevant and diverse results`);
      return uniqueArticles;
  } catch (error) {
      console.error("Error fetching results:", error);
      return [];
  }
};

const fullSearchLatest = async (queries:any):Promise<any> => {
  console.log(typeof queries, 'queries');
  console.log(`Starting full search for ${queries.length} queries for the past 12 hours`);
  const pay = await queries.map((query:any) => ({ q: query, num: 50, tbs: "qdr:h12" }));
  const url = "https://google.serper.dev/search";
  let results = [];

  try {
      const response = await axios.post(url, pay, {
          headers: {
              'X-API-KEY': SERPER_API_KEY,
              'Content-Type': 'application/json'
          }
      });
      
      const organicResults:any = response.data;
      
      for (const search of organicResults) {
          for (const result of search.organic) {
              if (result.link && !result.link.includes("washingtonpost.com")) {
                  if (result.title && result.link && result.snippet) {
                      results.push({
                          title: result.title,
                          link: result.link,
                          snippet: result.snippet
                      });
                  }
              }
          }
      }

      // Count and sort links
      const linkCounter = results.reduce((acc:any, source) => {
          acc[source.link] = (acc[source.link] || 0) + 1;
          return acc;
      }, {});

      const sortedLinks = Object.entries(linkCounter).sort((a:any, b:any) => b[1] - a[1]).slice(0, 10);
      const uniqueArticles:any[] = [];
      const seenLinks = new Set();

      results.forEach(source => {
          if (sortedLinks.some(link => link[0] === source.link) && !seenLinks.has(source.link)) {
              uniqueArticles.push(source);
              seenLinks.add(source.link);
          }
      });

      console.log(`Retrieved ${results.length} relevant and diverse results`);
      return uniqueArticles;
  } catch (error) {
      console.error("Error fetching results:", error);
      return [];
  }
};


const research = async (topic:any, timeRange = "anytime") => {
  const topicContext = await initialSearch(topic);
  const contextQueries = await generateSearchQueries(topic, topicContext);
  
  if (timeRange === "past_week") {
      return await fullSearchPastWeek(contextQueries);
  } else if (timeRange === "past_24hrs") {
      return await fullSearchPast24hrs(contextQueries);
  } else if (timeRange === "latest") {
      return await fullSearchLatest(contextQueries);
  } else {
      return await fullSearch(contextQueries);
  }
};

async function editor(results: string | any[]) {
  log('INFO', `Starting editing process for ${results.length} articles`);

  const promptTemplate = `
    You are an Editor-in-Chief. Process each news article and include multiple paragraphs to capture all information.
  `;

  for (const result of results) {
    try {
      log('INFO', `Processing article: ${result.link}`);
      
      // Use axios to fetch the HTML content
      const response = await axios.get(result.link);
      const html = response.data;

      // Parse the HTML content with cheerio
      const $ = cheerio.load(html);
      
      // Extract the main text content of the page
      let content = '';
      $('p').each((_, element) => {
        content += $(element).text() + ' ';
      });
      
      // Clean up the content by removing extra spaces and formatting
      content = content.replace(/[\t\n\r\s]+/g, ' ').trim();
      
      const formattedPrompt = promptTemplate.replace('{content}', content);

      let responses
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          responses = await editor_llm.invoke(formattedPrompt);
          result.summary = responses.content;
          log('INFO', `Successfully processed article: ${result.link}`);
          break;
        } catch (error) {
          log('ERROR', `Error processing ${result.link}: ${error}`);
        }
      }
    } catch (error) {
      log('ERROR', `Failed to process ${result.link}: ${error}`);
    }
  }
}

async function writer(topic:any, fullContent:any) {
    console.log(`Starting to write article for topic: ${topic}`);
    const promptTemplate = `
You are the Lead Article Writer at a prestigious news organization. Your responsibility is to take multiple news pieces provided below and weave them into a single comprehensive and engaging news article covering all relevant aspects of ${topic}.
  - Ensure that there is one main title for the entire article that captures the core of the news in a captivating manner.
  - Create compelling sections covering all the relevant aspects of the news.
  - Each section should have one or more paragraphs that are engaging and informative.
  - For each section, turn the subheadings into engaging, question-form headlines that are optimized for search engines.
  - The sections created should not convey redundant messages.
  - Maintain a smooth flow between sections, ensuring that the article reads cohesively.

Following is the content required to produce a comprehensive news article:
${fullContent}

**EXPECTED OUTPUT**
A markdown document containing a fully structured news article. The document should have:
  
  - A strong main title for the article
  - Engaging, well-written content for each section, combining the contents provided for all aspects of the topic.
  - A flow that ensures smooth transitions between sections
`;

    const response = await writer_llm.invoke(promptTemplate);
    return response.content;
}

async function seo(article:any) {
    const promptTemplate = `
You are an SEO Expert with a sharp eye for the critical components of a news article that will perform well in search engines. You are responsible for generating a concise, engaging excerpt that summarizes the article in a single line, and for identifying the most important keywords that will optimize the article for search engine rankings.
Following is the news article:
${article}

**EXPECTED OUTPUT**
A markdown file containing:
1. **Excerpt**: A one-line SEO-friendly description (excerpt) of the article.
2. **Keywords**: A comma-separated list of 8-10 important keywords from the article.
`;
    const response = await writer_llm.invoke(promptTemplate);
    return response.content;
}



async function articleGeneration(topics: any, timeRange: any, deepDive: boolean) {
  const timeRanges = deepDive ? ["anytime", "past_week", "past_24hrs"] : [timeRange];
  const allArticles = [];
  const articleContentArray: string[] = [];

  for (const topic of topics) {
      for (const tr of timeRanges) {
          console.log(`Starting article generation for topic: ${topic} with time range: ${tr}`);
          
          // Get research results and process the content
          const researchResults = await research(topic, tr);
          const content = await editor(researchResults);
          const article: any = await writer(topic, content);
          const seoData = await seo(article);

          // Store the article in `articleContentArray`
          articleContentArray.push(article);

          // Store topic and article in `allArticles` for JSON output
          allArticles.push({ topic, content: article });

          // If deepDive is false, exit the loop after one iteration
          if (!deepDive) {
              break;
          }
      }
  }

  console.log("Articles generated for all topics and time ranges.");
  
  // Return both the array of article content and the JSON data
  return { articleContentArray, allArticles };
}

// Exported function modified to use the new array-based output
export const researchArticle = async (topics: any, date_range: any, deepDive: any) => {
  const { articleContentArray, allArticles } = await articleGeneration(topics, date_range, deepDive);
  
  // These variables now contain the generated content and JSON
  console.log("Article Content Array:", articleContentArray);
  console.log("All Articles JSON Data:", JSON.stringify(allArticles, null, 4));

  // Return data if needed for further processing
  return { articleContentArray, allArticles };
};


// async function articleGeneration(topics, timeRange, deepDive) {
//   // Define time ranges based on deepDive flag
//   const timeRanges = deepDive ? ["anytime", "past_week", "past_24hrs"] : [timeRange];
//   const allArticles = [];

//   // Loop through each topic
//   for (const topic of topics) {
//     const contents = []; // Array to collect content for each time range when deepDive is true

//     for (const tr of timeRanges) {
//       console.log(`Starting article generation for topic: ${topic} with time range: ${tr}`);
      
//       // Fetch research results, edit, and write content for each time range
//       const researchResults = await research(topic, tr);
//       const content = await editor(researchResults);
//       const articleContent = await writer(topic, content);
      
//       // Add each article content to the contents array
//       contents.push({
//         timeRange: tr,            // Include time range to differentiate contents
//         content: articleContent   // The actual article content
//       });
      
//       // If deepDive is false, exit the loop after one iteration
//       if (!deepDive) {
//         break;
//       }
//     }

//     // Get SEO data for the combined content, if needed
//     const seoData = await seo(contents.map(c => c.content).join(' ')); // Join all content for SEO analysis

//     // Create a structured object for the topic
//     const articleObject = {
//       title: topic,           // Topic title
//       contents: contents,     // Array of contents with time range and content
//       seo: seoData            // SEO metadata for the combined article content
//     };

//     // Add the article object to the allArticles array
//     allArticles.push(articleObject);
//   }

//   console.log("Articles generated for all topics and time ranges.");

//   // Return structured data for further processing or storage
//   return allArticles;
// }

// // Modified exported function to use the updated structure
// export const researchArticle = async (topics, date_range, deepDive) => {
//   const allArticles = await articleGeneration(topics, date_range, deepDive);
  
//   // Log structured data for each topic
//   console.log("All Articles JSON Data:", JSON.stringify(allArticles, null, 4));

//   // Return structured data for further processing
//   return allArticles;
// };

