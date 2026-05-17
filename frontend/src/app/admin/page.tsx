'use client';

/**
 * Panel de administración mínimo de Translate.
 *
 * RBAC:
 *  - Sin sesión → invita a iniciar sesión.
 *  - role !== 'admin'  → vista "Mi perfil" (RBAC viewer).
 *  - role === 'admin'  → además, listado de usuarios (PB) y sesiones.
 *
 * Aditivo: no rompe la herramienta de traducción. La gestión de usuarios
 * usa el SDK de PocketBase con el token del usuario autenticado (las
 * listRules de la colección aplican; el listado completo sólo funciona
 * para superusuarios/admin según reglas de PB — para staff real se
 * delega a PocketBase Admin UI).
 */

import { useEffect, useState } from 'react';
import { pb, getCurrentUser } from '@/services/pocketbase';

interface PbUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
    verified?: boolean;
    created: string;
}

export default function AdminPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [users, setUsers] = useState<PbUser[]>([]);
    const [usersError, setUsersError] = useState('');

    useEffect(() => {
        setMounted(true);
        setUser(getCurrentUser());
        const unsub = pb.authStore.onChange((_t, m) => setUser(m));
        return () => unsub();
    }, []);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!isAdmin) return;
        (async () => {
            try {
                const res = await pb.collection('users').getList(1, 100, { sort: '-created' });
                setUsers(res.items as unknown as PbUser[]);
            } catch (e) {
                setUsersError(
                    e instanceof Error
                        ? e.message
                        : 'No se pudo cargar la lista (requiere permisos de administrador).'
                );
            }
        })();
    }, [isAdmin]);

    if (!mounted) return null;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Panel de administración
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Necesitas iniciar sesión para acceder.
                    </p>
                    <a
                        href="/"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Ir al inicio
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Panel de administración
                    </h1>
                    <a href="/" className="text-sm text-blue-600 hover:underline">
                        ← Volver al traductor
                    </a>
                </div>

                {/* Mi perfil */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Mi perfil
                    </h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-gray-500">Nombre</dt>
                            <dd className="text-gray-900 dark:text-white">{user.name || '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Email</dt>
                            <dd className="text-gray-900 dark:text-white">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Rol</dt>
                            <dd className="text-gray-900 dark:text-white">
                                {isAdmin ? 'Administrador' : 'Usuario'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Sesión activa</dt>
                            <dd className="text-gray-900 dark:text-white">
                                {pb.authStore.isValid ? 'Sí' : 'No'}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Usuarios (solo admin) */}
                {isAdmin ? (
                    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Usuarios ({users.length})
                        </h2>
                        {usersError && (
                            <p className="text-sm text-amber-600 mb-3">{usersError}</p>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-2 pr-4">Email</th>
                                        <th className="py-2 pr-4">Nombre</th>
                                        <th className="py-2 pr-4">Rol</th>
                                        <th className="py-2 pr-4">Verificado</th>
                                        <th className="py-2">Creado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="border-b border-gray-100 dark:border-gray-800"
                                        >
                                            <td className="py-2 pr-4 text-gray-900 dark:text-white">
                                                {u.email}
                                            </td>
                                            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                                                {u.name || '—'}
                                            </td>
                                            <td className="py-2 pr-4">
                                                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[11px]">
                                                    {u.role === 'admin' ? 'admin' : 'viewer'}
                                                </span>
                                            </td>
                                            <td className="py-2 pr-4">
                                                {u.verified ? '✓' : '—'}
                                            </td>
                                            <td className="py-2 text-gray-500">
                                                {new Date(u.created).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-4 text-xs text-gray-400">
                            Gestión avanzada (CRUD completo, roles) vía PocketBase
                            Admin UI.
                        </p>
                    </section>
                ) : (
                    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tienes acceso de <strong>usuario</strong>. La gestión de
                            usuarios y sesiones está reservada a administradores.
                        </p>
                    </section>
                )}

                <p className="text-center text-[11px] text-gray-400">
                    TranslateGemma · en alianza con{' '}
                    <a href="https://cedula360.tech" className="hover:underline">
                        Cédula 360
                    </a>
                </p>
            </div>
        </div>
    );
}
