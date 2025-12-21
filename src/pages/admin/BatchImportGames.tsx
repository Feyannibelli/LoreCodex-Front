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
            "developersAndPublishers": ["Valve"],
            "releaseDate": "2011-04-19",
            "coverImage": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg"
        },
        {
            "title": "Half-Life 2",
            "description": "A first-person shooter game",
            "genres": ["FPS"],
            "developersAndPublishers": ["Valve"],
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
                setValidationError('JSON must contain a "games" array');
                return;
            }

            if (parsed.games.length === 0) {
                setIsValidJson(false);
                setValidationError('The "games" array cannot be empty');
                return;
            }

            for (let i = 0; i < parsed.games.length; i++) {
                const game = parsed.games[i];

                if (!game.title || !game.description || !game.releaseDate) {
                    setIsValidJson(false);
                    setValidationError(`Game ${i + 1}: Missing required fields (title, description, releaseDate)`);
                    return;
                }

                if (game.genres && !Array.isArray(game.genres)) {
                    setIsValidJson(false);
                    setValidationError(`Game ${i + 1}: "genres" must be an array`);
                    return;
                }

                if (game.developersAndPublishers && !Array.isArray(game.developersAndPublishers)) {
                    setIsValidJson(false);
                    setValidationError(`Game ${i + 1}: "developersAndPublishers" must be an array`);
                    return;
                }

                const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{4}|Unknown)$/;
                if (!dateRegex.test(game.releaseDate)) {
                    setIsValidJson(false);
                    setValidationError(`Game ${i + 1}: Invalid date format. Use YYYY-MM-DD, YYYY or "Unknown"`);
                    return;
                }
            }

            setIsValidJson(true);
            setValidationError('');
        } catch (e) {
            setIsValidJson(false);
            setValidationError('Invalid JSON: ' + (e as Error).message);
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
            alert('Please select a .json file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large (maximum 5MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonContent(content);
            validateJson(content);
        };
        reader.onerror = () => {
            alert('Error reading file');
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
            alert('Please fix JSON errors before importing');
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
                    : 'Unknown error';
            alert('Error importing games: ' + message);
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
                                Batch Game Import
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Import multiple games at once using a JSON file
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
                                1. Load JSON
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Upload JSON file
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
                                    <p className="text-xs text-muted-foreground mt-1">Maximum 5MB</p>
                                </div>

                                <div className="text-center">
                                    <span className="text-muted-foreground">or</span>
                                </div>

                                <button
                                    onClick={loadExample}
                                    className="w-full py-2 px-4 bg-secondary hover:bg-secondary/80
                    text-secondary-foreground rounded-lg transition-colors"
                                >
                                    Load Example
                                </button>
                            </div>
                        </div>

                        {/* Editor Card */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-foreground mb-4">2. Edit JSON</h2>

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
                                            Valid JSON - {JSON.parse(jsonContent).games.length} game(s) ready to import
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
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Import Games
                                    </>
                                )}
                            </button>

                            <button
                                onClick={resetForm}
                                className="py-3 px-6 bg-secondary hover:bg-secondary/80
                  text-secondary-foreground font-semibold rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Guide & Results */}
                    <div className="space-y-6">
                        {/* Format Guide */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-foreground mb-4">📋 JSON Format</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-sm text-foreground mb-2">Required Fields</h3>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">*</span>
                                            <code className="bg-muted px-1 rounded text-foreground">title</code>
                                            <span>- Game title</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">*</span>
                                            <code className="bg-muted px-1 rounded text-foreground">description</code>
                                            <span>- Description</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-destructive">*</span>
                                            <code className="bg-muted px-1 rounded text-foreground">releaseDate</code>
                                            <span>- Format: YYYY-MM-DD, YYYY or "Unknown"</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-sm text-foreground mb-2">Optional Fields</h3>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <code className="bg-muted px-1 rounded text-foreground">genres</code>
                                            <span>- Array of genres ["Action", "RPG"]</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <code className="bg-muted px-1 rounded text-foreground">developersAndPublishers</code>
                                            <span>- Array of developers ["Valve", "EA"]</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <code className="bg-muted px-1 rounded text-foreground">coverImage</code>
                                            <span>- Image URL</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                                    <p className="text-xs text-primary">
                                        💡 <strong>Tip:</strong> Duplicate games (same title) will be rejected automatically
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        {importResult && (
                            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">📊 Import Results</h2>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-primary">{importResult.totalProcessed}</div>
                                        <div className="text-xs text-primary">Total</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{importResult.successCount}</div>
                                        <div className="text-xs text-green-800 dark:text-green-300">Success</div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{importResult.failureCount}</div>
                                        <div className="text-xs text-red-800 dark:text-red-300">Failed</div>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {importResult.results.map((result, index) => (
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

                                {importResult.failureCount === 0 && (
                                    <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-900/50 rounded-lg">
                                        <p className="text-green-800 dark:text-green-300 font-semibold text-center">
                                            🎉 All games imported successfully!
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
                                    Important Notes
                                </h3>
                                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
                                    <li>• Duplicate games will be rejected</li>
                                    <li>• Date format: YYYY-MM-DD, YYYY or "Unknown"</li>
                                    <li>• Maximum 100 games per batch</li>
                                    <li>• Individual processing</li>
                                    <li>• Use "title" instead of "name"</li>
                                    <li>• "genres" and "developersAndPublishers" must be arrays</li>
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
