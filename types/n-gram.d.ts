declare module "n-gram" {
    function bigram(text: string): string[];
    function trigram(text: string): string[];
    export { bigram, trigram };
}
