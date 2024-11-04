import os
import re
import time
import json
import requests
import logging
import argparse 

from collections import Counter


from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.embeddings import OpenAIEmbeddings


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

os.environ["SERPER_API_KEY"] = '142fbbd30b624515fa6a439eec6bf574f1d4ef5f'
os.environ['OPENAI_API_KEY'] = 'sk-proj-1FxkbjsHyNbcLeI27MZ7T3BlbkFJcZFMME5QHZu29GeeQixT'
# os.environ['NEWSAPI_KEY'] = '269080e7fc4248edaca5ea56ca975983'
# os.environ['GROQ_API_KEY'] = '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'
os.environ['GROQ_API_KEY1'] = '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'
os.environ['GROQ_API_KEY2'] = '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'
os.environ['GROQ_API_KEY3'] = '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'

research_llm=ChatGroq(temperature=0,
             model_name="llama-3.1-70b-versatile",
             api_key=os.getenv('GROQ_API_KEY1'))

editor_llm=ChatGroq(temperature=0,
             model_name="llama-3.1-70b-versatile",
             api_key=os.getenv('GROQ_API_KEY2'))

# writer_llm=ChatGroq(temperature=0,
#              model_name="llama-3.1-70b-versatile",
#              api_key=os.getenv('GROQ_API_KEY3'))

writer_llm = ChatOpenAI(model='gpt-4o-mini')

# embedding_function = OllamaEmbeddings(model='nomic-embed-text:latest')

# llm = ChatOpenAI(model='gpt-4o-mini')
embedding_function = OpenAIEmbeddings(model='text-embedding-3-small')


def initial_search(query):
    logging.info(f"Starting initial search for query: {query}")  
    url = "https://google.serper.dev/search"
    payload = json.dumps({"q": query, "num": 20})
    headers = {
        'X-API-KEY': os.environ['SERPER_API_KEY'],
        'content-type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    results = response.json()['organic']
    
    snippets = ""
    
    for result in results:
        if result.get('snippet'):
            snippets += f"{result['snippet']}\n"
    logging.info(f"Found {len(results)} results for query: {query}")  
    return snippets

def generate_search_queries(topic, context):
    prompt_template = """
You are a seasoned journalist tasked with generating diverse search queries.
Generate 5 search queries to get all the news around the topic: {topic}.
Make sure that the search queries are diverse and cover all the news around the {topic}.
Use the following context about the topic to create diverse search queries to research about the all news: 
{context}


Follow these rules:
- The generated 5 search queries should be relevant to the {topic} and should be diverse to cover all the aspects around topic.
- The output should only contain a Python list with the queries and nothing else.
"""
    formatted_prompt = prompt_template.format(topic=topic, context=context)
    
    response = research_llm.invoke(formatted_prompt)
    queries = eval(response.content)
    
    return queries

def full_search(queries):
    logging.info(f"Starting full search for {len(queries)} queries")  
    pay = [{"q": query, "num": 100} for query in queries]
    url = "https://google.serper.dev/search"
    results = []
    
    payload = json.dumps(pay)
    headers = {
        'X-API-KEY': os.environ['SERPER_API_KEY'],
        'content-type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    organic_results = response.json()
    # organic_results = response.json().get('organic', [])
    # print('Getting all the results for the querires')
    for search in organic_results:
        for result in search.get('organic'):
        
            if result.get('title') and result.get('link') and result.get('snippet'):
                results.append({
                    'title': result['title'],
                    'link': result['link'],
                    'snippet': result['snippet']
                })
    # print(results)
    # print('Sorting the top 10 articles for the Article generation')
    
    link_counter = Counter([source['link'] for source in results])

    sorted_links = link_counter.most_common(10)
    unique_articles = []
    seen_links = set()  

    for source in results:
        if source['link'] in dict(sorted_links) and source['link'] not in seen_links:
            unique_articles.append(source)
            seen_links.add(source['link'])

    logging.info(f"Retrieved {len(results)} relevant and diverse results") 
    return unique_articles

def research(topic):
    topicContext = initial_search(topic)
    contextQueries = generate_search_queries(topic, topicContext)
    results = full_search(contextQueries)

    return results


def editor(results):
    logging.info(f"Starting editing process for {len(results)} articles")  
    prompt_template = """
You are an Editor-in-Chief of a prestigious news organization. 
Go through the news article provided below and include multiple paragraphs to each news article to capture all the information present in the news article.
Make the summaries as long as necessary to obtain all the key information in the news.
Following is the News article: {content} 
"""
    for result in results:
        try:
            logging.info(f"Processing article: {result['link']}")
            loader = WebBaseLoader(result['link'])
            docs = loader.load()

            doc = docs[0] 
            content = re.sub(r'[\t\n\r\s]+', ' ', doc.page_content).strip()
            
            formatted_prompt = prompt_template.format(content=content)
            
            max_retries = 5
            for attempt in range(max_retries):
                try:
                    response = editor_llm.invoke(formatted_prompt)
                    result['summary'] = response.content
                    logging.info(f"Successfully processed article: {result['link']}")
                    break  
                except Exception as e:
                    if "Rate limit reached" in str(e):  
                        wait_time = 60  
                        logging.warning(f"Rate limit reached for {result['link']}. Waiting for {wait_time} seconds before retrying...")
                        time.sleep(wait_time)
                    else:
                        logging.error(f"Failed to process {result['link']}: {e}")
                        break 

        except Exception as e:
            logging.error(f"Failed to process {result['link']}: {e}")
    
    full_content = ""
    for result in results:
            title = result.get('title', 'No title available')
            link = result.get('link', 'No link available')
            summary = result.get('summary', 'No summary available')

            article_details = f"Title: {title}\nLink: {link}\nSummary:\n{summary}\n"

            full_content += article_details + "-------------------------------------------------------------------------\n"
    
    logging.info("Editing process completed") 
    return full_content


def writer(topic, personality, tone, full_content):
    logging.info(f"Starting to write article for topic: {topic}") 
    prompt_template = """
You are the Lead Article Writer at a prestigious news organization with a/an {personality} personality. Your responsibility is to take multiple news pieces provided below and weave them into a single comprehensive and engaging news article covering all relevant aspects of {topic}.
  - Ensure that there is one main title for the entire article that captures the core of the news in a captivating manner.
  - Create compelling sections covering all the relevant aspects of the news.
  - Each section should have one or more paragraphs that are engaging and informative.
  - For each section, turn the subheadings into engaging, question-form headlines that are optimized for search engines.
  - The sections created should not convey redundant messages.
  - Maintain a smooth flow between sections, ensuring that the article reads cohesively.
  - The tone of the article should be: {tone}

Following is the content required to produce a comprehensive news artilce:
{full_content}

**EXPECTED OUTPUT**
A markdown document containing a fully structured news article. The document should have:
  
  - A strong main title for the article
  - Engaging, well-written content for each section, combining the contents provided for all aspects of the topic.
  - A flow that ensures smooth transitions between sections
"""

    formatted_prompt = prompt_template.format(topic= topic, full_content=full_content, personality=personality, tone=tone)
    response = writer_llm.invoke(formatted_prompt)

    logging.info("Article writing completed")  
    return response.content


def seo(article):
    prompt_template = """
You are an SEO Expert with a sharp eye for the critical components of a news article that will perform well in search engines. You are responsible for generating a concise, engaging excerpt that summarizes the article in a single line, and for identifying the most important keywords that will optimize the article for search engine rankings.
Following is the news article:
{article}

**EXPECTED OUTPUT**
A markdown file containg :
1. **Excerpt**: A one-line SEO-friendly description (excerpt) of the article.
2. **Keywords**: A comma seperated list of 8-10 important keywords from the article.

Only output the excerpt and keywords
"""
    formatted_prompt = prompt_template.format(article=article)
    response = writer_llm.invoke(formatted_prompt)

    return response.content


# def article_generation(topic, personality, tone):
#     logging.info(f"Starting article generation for topic: {topic}")  
#     research_results = research(topic)
#     content = editor(research_results)
#     article = writer(topic, personality, tone, content)
#     excerpt = seo(article)

#     with open(f'output/genArticle3.md', 'w') as f: 
#         f.write(article) 

#     with open(f'output/excerptKey3.md', 'w') as f:
#         f.write(excerpt)

#     return article

    

# if __name__ == '__main__':
#     topic = 'CZ binance'
#     personality = 'informative and authoritative'
#     tone = 'neutral and professional'
#     news = article_generation(topic, personality=personality, tone=tone)
#     print(news)

def article_generation(topic, personality, tone):
    logging.info(f"Starting article generation for topic: {topic}")  
    research_results = research(topic)
    content = editor(research_results)
    article = writer(topic, personality, tone, content)
    excerpt = seo(article)

    return {"article": article, "excerpt": excerpt}  # Return a dictionary


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generate an article from the provided topic.")
    parser.add_argument('--topic', required=True, help="The main topic for the article.")
    parser.add_argument('--personality', required=True, help="The personality tone for the article.")
    parser.add_argument('--tone', required=True, help="The writing tone for the article.")
    
    args = parser.parse_args()
    
    # Generate the article
    result = article_generation(args.topic, args.personality, args.tone)
    
    # Print result as JSON
    print(json.dumps(result))