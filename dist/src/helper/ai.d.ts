interface ArticleGenerationResult {
    article: string;
    excerpt: string;
}
export declare const aiWriter: (Topic: string, Personality: string, Tone: string) => Promise<ArticleGenerationResult | null>;
export {};
//# sourceMappingURL=ai.d.ts.map