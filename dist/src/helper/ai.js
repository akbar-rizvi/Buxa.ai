"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiWriter = void 0;
const axios_1 = __importDefault(require("axios"));
const winston = __importStar(require("winston"));
const groq_1 = require("@langchain/groq");
const nextapi_1 = require("./nextapi");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize KeyManager with the path to your API keys file
const KEY_MANAGER = new nextapi_1.KeyManager('../../../groqAPIs.json');
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const GROQ_API_KEY1 = KEY_MANAGER.getNextKey();
const GROQ_API_KEY2 = KEY_MANAGER.getNextKey();
const GROQ_API_KEY3 = KEY_MANAGER.getNextKey();
// Setup logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `${timestamp} - ${level} - ${message}`)),
    transports: [
        new winston.transports.Console(),
    ],
});
// Placeholder classes for ChatGroq
// Initialize LLMs
const research_llm = new groq_1.ChatGroq({
    temperature: 0,
    modelName: "llama-3.1-70b-versatile",
    apiKey: GROQ_API_KEY1
});
const editor_llm = new groq_1.ChatGroq({
    temperature: 0,
    modelName: "llama-3.1-70b-versatile",
    apiKey: GROQ_API_KEY2
});
const writer_llm = new groq_1.ChatGroq({
    temperature: 0,
    modelName: "llama-3.1-70b-versatile",
    apiKey: GROQ_API_KEY3
});
// Placeholder for OpenAIEmbeddings
class OpenAIEmbeddings {
    constructor(options) {
        this.model = options.model;
    }
}
// Initialize embedding function
const embedding_function = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
// Function to perform initial search
function initialSearch(query) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Starting initial search for query: ${query}`);
        const url = "https://google.serper.dev/search";
        const payload = {
            q: query,
            num: 20
        };
        const headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        };
        try {
            const response = yield axios_1.default.post(url, payload, { headers });
            const results = response.data.organic;
            let snippets = "";
            for (const result of results) {
                if (result.snippet) {
                    snippets += `${result.snippet}\n`;
                }
            }
            logger.info(`Found ${results.length} results for query: ${query}`);
            return snippets;
        }
        catch (error) {
            logger.error(`Error during initial search: ${error}`);
            return "";
        }
    });
}
// Function to generate search queries
function generateSearchQueries(topic, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt_template = `
You are a seasoned journalist tasked with generating diverse search queries.
Generate 5 search queries to get all the news around the topic: {topic}.
Make sure that the search queries are diverse and cover all the news around the {topic}.
Use the following context about the topic to create diverse search queries to research about the all news: 
{context}

Follow these rules:
- The generated 5 search queries should be relevant to the {topic} and should be diverse to cover all the aspects around topic.
- The output should only contain a Python list with the queries and nothing else.
    `;
        const formatted_prompt = prompt_template.replace('{topic}', topic).replace('{context}', context);
        try {
            const response = yield research_llm.invoke(formatted_prompt);
            const queries = JSON.parse(response["content"]);
            return queries;
        }
        catch (error) {
            logger.error(`Error generating search queries: ${error}`);
            return [];
        }
    });
}
function fullSearch(queries) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Starting full search for ${queries.length} queries`);
        const pay = queries.map(query => ({ q: query, num: 100 }));
        const url = "https://google.serper.dev/search";
        const headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        };
        try {
            const response = yield axios_1.default.post(url, pay, { headers });
            const organic_results = response.data;
            const results = [];
            for (const search of organic_results) {
                for (const result of search.organic) {
                    if (result.title && result.link && result.snippet) {
                        results.push({
                            title: result.title,
                            link: result.link,
                            snippet: result.snippet
                        });
                    }
                }
            }
            // Count and sort links
            const linkCounter = {};
            for (const source of results) {
                linkCounter[source.link] = (linkCounter[source.link] || 0) + 1;
            }
            const sortedLinks = Object.entries(linkCounter)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(entry => entry[0]);
            const unique_articles = [];
            const seen_links = new Set();
            for (const source of results) {
                if (sortedLinks.includes(source.link) && !seen_links.has(source.link)) {
                    unique_articles.push(source);
                    seen_links.add(source.link);
                }
            }
            logger.info(`Retrieved ${results.length} relevant and diverse results`);
            return unique_articles;
        }
        catch (error) {
            logger.error(`Error during full search: ${error}`);
            return [];
        }
    });
}
// Research function
function research(topic) {
    return __awaiter(this, void 0, void 0, function* () {
        const topicContext = yield initialSearch(topic);
        const contextQueries = yield generateSearchQueries(topic, topicContext);
        const results = yield fullSearch(contextQueries);
        return results;
    });
}
// Placeholder for WebBaseLoader
class WebBaseLoader {
    constructor(link) {
        this.link = link;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement web page loading and content extraction here
            // This is a placeholder
            return [{ page_content: 'Content of the web page' }];
        });
    }
}
// Editor function
function editor(results) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Starting editing process for ${results.length} articles`);
        const prompt_template = `
You are an Editor-in-Chief of a prestigious news organization. 
Go through the news article provided below and include multiple paragraphs to each news article to capture all the information present in the news article.
Make the summaries as long as necessary to obtain all the key information in the news.
Following is the News article: {content} 
    `;
        for (const result of results) {
            try {
                logger.info(`Processing article: ${result.link}`);
                const loader = new WebBaseLoader(result.link);
                const docs = yield loader.load();
                if (docs.length === 0) {
                    logger.warn(`No content loaded for ${result.link}`);
                    continue;
                }
                const docContent = docs[0].page_content;
                const content = docContent.replace(/[\t\n\r\s]+/g, ' ').trim();
                const formatted_prompt = prompt_template.replace('{content}', content);
                const max_retries = 5;
                for (let attempt = 0; attempt < max_retries; attempt++) {
                    try {
                        const response = yield editor_llm.invoke(formatted_prompt);
                        result["summary"] = response.content;
                        logger.info(`Successfully processed article: ${result.link}`);
                        break;
                    }
                    catch (e) {
                        if (e.message.includes("Rate limit reached")) {
                            const wait_time = 60;
                            logger.warn(`Rate limit reached for ${result.link}. Waiting for ${wait_time} seconds before retrying...`);
                            yield new Promise(res => setTimeout(res, wait_time * 1000));
                        }
                        else {
                            logger.error(`Failed to process ${result.link}: ${e}`);
                            break;
                        }
                    }
                }
            }
            catch (error) {
                logger.error(`Failed to process ${result.link}: ${error}`);
            }
        }
        let full_content = "";
        for (const result of results) {
            const title = result.title || 'No title available';
            const link = result.link || 'No link available';
            const summary = result.summary || 'No summary available';
            const article_details = `Title: ${title}\nLink: ${link}\nSummary:\n${summary}\n`;
            full_content += article_details + "-------------------------------------------------------------------------\n";
        }
        logger.info("Editing process completed");
        return full_content;
    });
}
// Writer function
function writer(topic, personality, tone, full_content) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Starting to write article for topic: ${topic}`);
        const prompt_template = `
You are the Lead Article Writer at a prestigious news organization with a/an {personality} personality. Your responsibility is to take multiple news pieces provided below and weave them into a single comprehensive and engaging news article covering all relevant aspects of {topic}.
  - Ensure that there is one main title for the entire article that captures the core of the news in a captivating manner.
  - Create compelling sections covering all the relevant aspects of the news.
  - Each section should have one or more paragraphs that are engaging and informative.
  - For each section, turn the subheadings into engaging, question-form headlines that are optimized for search engines.
  - The sections created should not convey redundant messages.
  - Maintain a smooth flow between sections, ensuring that the article reads cohesively.
  - The tone of the article should be: {tone}

Following is the content required to produce a comprehensive news article:
{full_content}

**EXPECTED OUTPUT**
A markdown document containing a fully structured news article. The document should have:
  
  - A strong main title for the article
  - Engaging, well-written content for each section, combining the contents provided for all aspects of the topic.
  - A flow that ensures smooth transitions between sections
    `;
        const formatted_prompt = prompt_template
            .replace('{personality}', personality)
            .replace('{topic}', topic)
            .replace('{tone}', tone)
            .replace('{full_content}', full_content);
        try {
            const response = yield writer_llm.invoke(formatted_prompt);
            logger.info("Article writing completed");
            return response.content;
        }
        catch (error) {
            logger.error(`Error during article writing: ${error}`);
            return "";
        }
    });
}
// SEO function
function seo(article) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt_template = `
You are an SEO Expert with a sharp eye for the critical components of a news article that will perform well in search engines. You are responsible for generating a concise, engaging excerpt that summarizes the article in a single line, and for identifying the most important keywords that will optimize the article for search engine rankings.
Following is the news article:
{article}

**EXPECTED OUTPUT**
A markdown file containing:
1. **Excerpt**: A one-line SEO-friendly description (excerpt) of the article.
2. **Keywords**: A comma separated list of 8-10 important keywords from the article.

Only output the excerpt and keywords
    `;
        const formatted_prompt = prompt_template.replace('{article}', article);
        try {
            const response = yield writer_llm.invoke(formatted_prompt);
            return response.content;
        }
        catch (error) {
            logger.error(`Error during SEO processing: ${error}`);
            return "";
        }
    });
}
// Article generation orchestration
function articleGeneration(topic, personality, tone) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Starting article generation for topic: ${topic}`);
        const research_results = yield research(topic);
        const content = yield editor(research_results);
        const article = yield writer(topic, personality, tone, content);
        const excerpt = yield seo(article);
        return { article, excerpt };
    });
}
const aiWriter = (Topic, Personality, Tone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = Topic;
        const personality = Personality;
        const tone = Tone;
        const { article, excerpt } = yield articleGeneration(topic, personality, tone);
        // // console.log(article);
        return { article, excerpt };
    }
    catch (error) {
        logger.error(`Error in aiWriter: ${error.message || error}`);
        return null;
    }
});
exports.aiWriter = aiWriter;
//# sourceMappingURL=ai.js.map