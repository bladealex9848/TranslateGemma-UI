// PocketBase client configuration
import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// Disable auto-cancellation for SSR compatibility
pb.autoCancellation(false);

// Types for collections
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    created: string;
    updated: string;
}

export interface Translation {
    id: string;
    user_id: string;
    source_lang: string;
    target_lang: string;
    original_text: string;
    translated_text: string;
    model_used?: string;
    is_favorite: boolean;
    created: string;
    updated: string;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return pb.authStore.isValid;
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
    return pb.authStore.model as User | null;
}

/**
 * Register a new user
 */
export async function register(email: string, password: string, name: string): Promise<User> {
    const user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name,
    });

    // Auto-login after registration
    await pb.collection('users').authWithPassword(email, password);

    return user as unknown as User;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<User> {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData.record as unknown as User;
}

/**
 * Logout current user
 */
export function logout(): void {
    pb.authStore.clear();
}

/**
 * Save a translation to history
 */
export async function saveTranslation(
    originalText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string,
    modelUsed?: string
): Promise<Translation> {
    if (!isAuthenticated()) {
        throw new Error('User must be authenticated to save translations');
    }

    const translation = await pb.collection('translations').create({
        user_id: getCurrentUser()?.id,
        source_lang: sourceLang,
        target_lang: targetLang,
        original_text: originalText,
        translated_text: translatedText,
        model_used: modelUsed,
        is_favorite: false,
    });

    return translation as unknown as Translation;
}

/**
 * Get user's translation history
 */
export async function getTranslationHistory(
    page = 1,
    perPage = 20
): Promise<{ items: Translation[]; totalPages: number }> {
    if (!isAuthenticated()) {
        return { items: [], totalPages: 0 };
    }

    const result = await pb.collection('translations').getList(page, perPage, {
        filter: `user_id = "${getCurrentUser()?.id}"`,
        sort: '-id',
    });

    return {
        items: result.items as unknown as Translation[],
        totalPages: result.totalPages,
    };
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(translationId: string, isFavorite: boolean): Promise<void> {
    await pb.collection('translations').update(translationId, {
        is_favorite: isFavorite,
    });
}

/**
 * Delete a translation
 */
export async function deleteTranslation(translationId: string): Promise<void> {
    await pb.collection('translations').delete(translationId);
}
