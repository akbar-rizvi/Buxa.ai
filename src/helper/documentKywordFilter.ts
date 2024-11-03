export const  extractExcerptAndKeywords=async(input:any)=> {
  // Use regex to extract the excerpt and keywords
  const excerptMatch = input.match(/\*\*Excerpt\*\*:\s*([\s\S]*?)\n\n/);
  const keywordsMatch = input.match(/\*\*Keywords\*\*:\s*([\s\S]*)/);
  
  if (!excerptMatch || !keywordsMatch) {
      console.error("Error: Could not extract excerpt or keywords");
      return null;
  }

  const excerpt = excerptMatch[1].trim();
  const keywords = keywordsMatch[1].split(',').map((keyword:any) => keyword.trim());

  return {
      excerpt: excerpt,
      keywords: keywords
  };
}