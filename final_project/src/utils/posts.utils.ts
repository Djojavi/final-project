export function validatePostFields(title: string, content: string, authorId: number): boolean {
    if (!title || !content || !authorId) {
        return false;
    }
    return true;
}