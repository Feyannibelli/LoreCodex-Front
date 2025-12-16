import React, { useState, useEffect } from 'react';
import { ChallengeFormData } from '../../services/challengeService';
import UnifiedContentEditor from '../UnifiedContentEditor';
import ProEditorLayout from '../layout/ProEditorLayout';
import ProInput from '../ui/ProInput';
import Button from '../Button';
import {
    Save,
    Plus,
    Trash2,
    Trophy,
    Swords,
    Target
} from 'lucide-react';

interface ChallengeFormProps {
    initialData?: ChallengeFormData;
    onSubmit: (data: ChallengeFormData) => Promise<void>;
    submitLabel?: string;
    pageTitle: string;
    breadcrumbs: { label: string; href?: string }[];
    isSubmitting?: boolean;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
    initialData,
    onSubmit,
    submitLabel = 'Save Challenge',
    pageTitle,
    breadcrumbs,
    isSubmitting = false
}) => {
    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    // difficulty removed
    const [items, setItems] = useState<string[]>(initialData?.items || ['']);



    // Layout Status
    const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');



    useEffect(() => {
        if (
            title !== (initialData?.title || '') ||
            description !== (initialData?.description || '') ||
            items !== (initialData?.items || [])
        ) {
            setStatus('unsaved');
        }
    }, [title, description, items, initialData]);

    const handleAddItem = () => {
        setItems([...items, '']);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };



    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            // Toast error?
            return;
        }

        setStatus('saving');
        await onSubmit({
            title,
            description,
            // difficulty removed
            // itemType: 'checklist', // Default - Removed as not in interface
            items: items.filter(i => i.trim() !== ''),
            // gameId: selectedGame?.id // If backend supports gameId direct link
            // targetGameId: selectedGame?.id
        });
        setStatus('saved');
    };

    const Actions = (
        <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="gap-2"
        >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
    );

    return (
        <ProEditorLayout
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            actions={Actions}
            status={isSubmitting ? 'saving' : status}
            className="pb-20"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-6 sticky top-24">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <Trophy className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Challenge Details</h3>
                        </div>

                        <ProInput
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="E.g. No Damage Run"
                            required
                            icon={Swords}
                        />



                        {/* Difficulty Input Removed */}


                    </div>
                </div>

                {/* Right Column: Description & Tasks */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <Target className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Description</h3>
                        </div>
                        <UnifiedContentEditor
                            value={description}
                            onChange={setDescription}
                            rows={8}
                            placeholder="Explain the rules of the challenge..."
                        />
                    </div>

                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Swords className="h-4 w-4" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">Objectives / Tasks</h3>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleAddItem} className="h-7 text-xs gap-1">
                                <Plus className="h-3 w-3" /> Add Task
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 group">
                                    <div className="flex h-10 w-8 items-center justify-center text-muted-foreground/30 font-mono text-xs">
                                        {index + 1}
                                    </div>
                                    <ProInput
                                        value={item}
                                        onChange={(e) => handleItemChange(index, e.target.value)}
                                        placeholder={`Task #${index + 1}`}
                                        className="flex-1"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveItem(index)}
                                        className="h-10 w-10 text-muted-foreground/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProEditorLayout>
    );
};

export default ChallengeForm;
