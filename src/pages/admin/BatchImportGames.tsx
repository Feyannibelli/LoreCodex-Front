import { useState } from 'react';

import { Upload, FileJson, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import apiAuth from '../../services/apiAuth';
import axios from 'axios';

interface GameImportResult {
    title: string;
    success: boolean;
    message: string;
    gameId?: number;
}

interface BatchGameResponse {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    results: GameImportResult[];
}

const EXAMPLE_JSON = {
    "games": [
        {
            "title": "Portal 2",
            "description": "A first-person puzzle-platform video game",
            "genres": ["Puzzle"],
            "releaseDate": "2011-04-19",
            "coverImage": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg"
        },
        {
            "title": "Half-Life 2",
            "description": "A first-person shooter game",
            "genres": ["FPS"],
            "releaseDate": "2004-11-16",
            "coverImage": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg"
        }
    ]
};

const BatchImportGames: React.FC = () => {

    const [jsonContent, setJsonContent] = useState<string>('');
    const [isValidJson, setIsValidJson] = useState<boolean | null>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [importResult, setImportResult] = useState<BatchGameResponse | null>(null);

    const validateJson = (content: string) => {
        if (!content.trim()) {
            setIsValidJson(null);
            setValidationError('');
            return;
        }

        try {
            const parsed = JSON.parse(content);

            if (!parsed.games || !Array.isArray(parsed.games)) {
                setIsValidJson(false);
                setValidationError('El JSON debe contener un array "games"');
                return;
            }

            if (parsed.games.length === 0) {
                setIsValidJson(false);
                setValidationError('El array "games" no puede estar vacío');
                return;
            }

            for (let i = 0; i < parsed.games.length; i++) {
                const game = parsed.games[i];

                // Validar campos requeridos - ACTUALIZADO
                if (!game.title || !game.description || !game.releaseDate) {
                    setIsValidJson(false);
                    setValidationError(`Juego ${i + 1}: Faltan campos requeridos (title, description, releaseDate)`);
                    return;
                }

                // Validar que genres sea un array - NUEVO
                if (game.genres && !Array.isArray(game.genres)) {
                    setIsValidJson(false);
                    setValidationError(`Juego ${i + 1}: "genres" debe ser un array`);
                    return;
                }

                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(game.releaseDate)) {
                    setIsValidJson(false);
                    setValidationError(`Juego ${i + 1}: Formato de fecha inválido. Use YYYY-MM-DD`);
                    return;
                }
            }

            setIsValidJson(true);
            setValidationError('');
        } catch (e) {
            setIsValidJson(false);
            setValidationError('JSON inválido: ' + (e as Error).message);
        }
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const content = e.target.value;
        setJsonContent(content);
        validateJson(content);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert('Por favor selecciona un archivo .json');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande (máximo 5MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonContent(content);
            validateJson(content);
        };
        reader.onerror = () => {
            alert('Error al leer el archivo');
        };
        reader.readAsText(file);
    };

    const loadExample = () => {
        const exampleStr = JSON.stringify(EXAMPLE_JSON, null, 2);
        setJsonContent(exampleStr);
        validateJson(exampleStr);
    };

    const handleSubmit = async () => {
        if (!isValidJson) {
            alert('Por favor corrige los errores en el JSON antes de importar');
            return;
        }

        setIsSubmitting(true);
        setImportResult(null);

        try {
            const payload = JSON.parse(jsonContent);
            const response = await apiAuth.post('/games/batch/import', payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            const result: BatchGameResponse = response.data;
            setImportResult(result);

            if (result.failureCount === 0) {
                setTimeout(() => {
                    setJsonContent('');
                    setIsValidJson(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Error importing games:', error);
            const message = axios.isAxiosError(error)
                ? (typeof error.response?.data === 'string'
                    ? error.response.data
                    : (error.response?.data as { message?: string } | undefined)?.message) ?? error.message
                : error instanceof Error
                    ? error.message
                    : 'Error desconocido';
            alert('Error al importar juegos: ' + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setJsonContent('');
        setIsValidJson(null);
        setValidationError('');
        setImportResult(null);
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FileJson className="text-primary" size={32} />
                            <h1 className="text-3xl font-bold text-foreground">
                                Importación Masiva de Juegos
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Importa múltiples juegos a la vez usando un archivo JSON
                        </p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - JSON Input */}
                    <div className="space-y-6">
                        {/* Upload Card */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Upload size={20} />
                                1. Cargar JSON
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Subir archivo JSON
                                    </label>
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20 cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Máximo 5MB</p>
                                </div>

                                <div className="text-center">
                                    <span className="text-muted-foreground">o</span>
                                </div>

                                <button
                                    onClick={loadExample}
                                    className="w-full py-2 px-4 bg-secondary hover:bg-secondary/80
                    text-secondary-foreground rounded-lg transition-colors"
                                >
                                    Cargar Ejemplo
                                </button>
                            </div>
                        </div>

                        {/* Editor Card */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-foreground mb-4">2. Editar JSON</h2>

                            <div className="relative">
                                <textarea
                                    value={jsonContent}
                                    onChange={handleJsonChange}
                                    placeholder='{"games": [{"title": "..."}]}'
                                    className="w-full h-96 p-4 font-mono text-sm border border-input rounded-lg bg-secondary/50 text-foreground
                    focus:ring-2 focus:ring-ring focus:border-input resize-none placeholder:text-muted-foreground"
                                    spellCheck={false}
                                />

                                {isValidJson !== null && (
                                    <div className="absolute top-2 right-2">
                                        {isValidJson ? (
                                            <CheckCircle className="text-green-500" size={24} />
                                        ) : (
                                            <XCircle className="text-red-500" size={24} />
                                        )}
                                    </div>
                                )}
                            </div>

                            {validationError && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                                        <p className="text-sm text-red-800 dark:text-red-300">{validationError}</p>
                                    </div>
                                </div>
                            )}

                            {isValidJson && (
                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                                        <p className="text-sm text-green-800 dark:text-green-300">
                                            JSON válido - {JSON.parse(jsonContent).games.length} juego(s) listo(s) para importar
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={!isValidJson || isSubmitting}
                                className="flex-1 py-3 px-6 bg-primary hover:bg-primary/90
                  disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
                  text-primary-foreground font-semibold rounded-lg transition-colors
                  flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                                        Importando...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Importar Juegos
                                    </>
                                )}
                            </button>

                            <button
                                onClick={resetForm}
                                className="py-3 px-6 bg-secondary hover:bg-secondary/80
                  text-secondary-foreground font-semibold rounded-lg transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Guide & Results */}
                    <div className="space-y-6">
                        {/* Format Guide */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-foreground mb-4">📋 Formato del JSON</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-sm text-foreground mb-2">Campos Requeridos</h3>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">*</span>
                                            <code className="bg-muted px-1 rounded text-foreground">title</code>
                                            <span>- Título del juego</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">*</span>
                                            <code className="bg-muted px-1 rounded text-foreground">description</code>
                                            <span>- Descripción</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">*</span>
                                            <code className="bg-muted px-1 rounded text-foreground">releaseDate</code>
                                            <span>- Formato: YYYY-MM-DD</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-sm text-foreground mb-2">Campos Opcionales</h3>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <code className="bg-muted px-1 rounded text-foreground">genres</code>
                                            <span>- Array de géneros ["Action", "RPG"]</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <code className="bg-muted px-1 rounded text-foreground">coverImage</code>
                                            <span>- URL de la imagen</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                                    <p className="text-xs text-primary">
                                        💡 <strong>Tip:</strong> Los juegos duplicados (mismo título) serán rechazados automáticamente
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        {importResult && (
                            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">📊 Resultados de la Importación</h2>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-primary">{importResult!.totalProcessed}</div>
                                        <div className="text-xs text-primary">Total</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{importResult!.successCount}</div>
                                        <div className="text-xs text-green-800 dark:text-green-300">Exitosos</div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{importResult!.failureCount}</div>
                                        <div className="text-xs text-red-800 dark:text-red-300">Fallidos</div>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {importResult!.results.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg border ${result.success
                                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {result.success ? (
                                                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={18} />
                                                ) : (
                                                    <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={18} />
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-semibold text-sm text-foreground">{result.title}</div>
                                                    <div className={`text-xs ${result.success
                                                        ? 'text-green-700 dark:text-green-300'
                                                        : 'text-red-700 dark:text-red-300'
                                                        }`}>
                                                        {result.message}
                                                        {result.gameId && ` (ID: ${result.gameId})`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {importResult!.failureCount === 0 && (
                                    <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-900/50 rounded-lg">
                                        <p className="text-green-800 dark:text-green-300 font-semibold text-center">
                                            🎉 ¡Todos los juegos se importaron correctamente!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info */}
                        {!importResult && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-6">
                                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                                    <AlertCircle size={20} />
                                    Notas Importantes
                                </h3>
                                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
                                    <li>• Los juegos duplicados serán rechazados</li>
                                    <li>• Fecha: YYYY-MM-DD (ej: 2024-03-15)</li>
                                    <li>• Máximo 100 juegos por vez</li>
                                    <li>• Procesamiento individual</li>
                                    <li>• Usar "title" en lugar de "name"</li>
                                    <li>• "genres" debe ser un array</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchImportGames;
