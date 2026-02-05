import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Layout,
  Trash2,
  Copy,
  GripVertical,
  Settings,
  Plus,
  Download,
  Upload,
  Save,
  Undo,
  Redo,
  Palette,
} from 'lucide-react';

// ==================== TYPES ====================
export type BlockType = 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer';

export interface BlockStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontFamily?: string;
  padding?: string;
  margin?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: string;
  width?: string;
  height?: string;
}

export interface TemplateBlock {
  id: string;
  type: BlockType;
  content: string;
  style: BlockStyle;
  altText?: string;
  linkUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  blocks: TemplateBlock[];
  globalStyles: {
    backgroundColor: string;
    fontFamily: string;
    maxWidth: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface VisualTemplateEditorProps {
  initialTemplate?: Template;
  onSave?: (template: Template) => void;
  onExport?: (format: 'json' | 'html', template: Template) => void;
  onImport?: (template: Template) => void;
  variables?: string[];
}

// ==================== DEFAULT STYLES ====================
const defaultBlockStyles: Record<BlockType, BlockStyle> = {
  header: {
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    textColor: '#1a1a1a',
    padding: '20px',
  },
  text: {
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'left',
    textColor: '#333333',
    padding: '15px',
  },
  image: {
    width: '100%',
    padding: '10px',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    textColor: '#ffffff',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    padding: '15px 30px',
    textAlign: 'center',
    borderRadius: '6px',
  },
  divider: {
    margin: '20px 0',
    padding: '10px',
  },
  spacer: {
    height: '30px',
    padding: '0',
  },
};

const defaultGlobalStyles = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  maxWidth: '600px',
};

// ==================== COMPONENT ====================
export const VisualTemplateEditor: React.FC<VisualTemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onExport,
  onImport,
  variables = [],
}) => {
  const [template, setTemplate] = useState<Template>(() =>
    initialTemplate || {
      id: crypto.randomUUID(),
      name: 'New Template',
      blocks: [],
      globalStyles: defaultGlobalStyles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);
  const [history, setHistory] = useState<Template[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== HISTORY MANAGEMENT ====================
  const addToHistory = useCallback((newTemplate: Template) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newTemplate);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTemplate(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTemplate(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // ==================== BLOCK OPERATIONS ====================
  const addBlock = useCallback((type: BlockType, index?: number) => {
    const newBlock: TemplateBlock = {
      id: crypto.randomUUID(),
      type,
      content: type === 'image' ? 'https://via.placeholder.com/600x300' : 
               type === 'button' ? 'Click Me' :
               type === 'header' ? 'Heading' :
               type === 'text' ? 'Enter your text here...' : '',
      style: { ...defaultBlockStyles[type] },
      linkUrl: type === 'button' ? '#' : undefined,
    };

    setTemplate((prev) => {
      const newBlocks = [...prev.blocks];
      const insertIndex = index !== undefined ? index : newBlocks.length;
      newBlocks.splice(insertIndex, 0, newBlock);
      const newTemplate = { ...prev, blocks: newBlocks, updatedAt: new Date().toISOString() };
      addToHistory(newTemplate);
      return newTemplate;
    });
    setSelectedBlockId(newBlock.id);
  }, [addToHistory]);

  const updateBlock = useCallback((blockId: string, updates: Partial<TemplateBlock>) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
        updatedAt: new Date().toISOString(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
  }, [addToHistory]);

  const updateBlockStyle = useCallback((blockId: string, styleUpdates: Partial<BlockStyle>) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, style: { ...b.style, ...styleUpdates } } : b
        ),
        updatedAt: new Date().toISOString(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
  }, [addToHistory]);

  const deleteBlock = useCallback((blockId: string) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== blockId),
        updatedAt: new Date().toISOString(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
    setSelectedBlockId(null);
  }, [addToHistory]);

  const duplicateBlock = useCallback((blockId: string) => {
    setTemplate((prev) => {
      const block = prev.blocks.find((b) => b.id === blockId);
      if (!block) return prev;
      
      const index = prev.blocks.findIndex((b) => b.id === blockId);
      const newBlock = { ...block, id: crypto.randomUUID() };
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      
      const newTemplate = { ...prev, blocks: newBlocks, updatedAt: new Date().toISOString() };
      addToHistory(newTemplate);
      return newTemplate;
    });
  }, [addToHistory]);

  const reorderBlocks = useCallback((newOrder: TemplateBlock[]) => {
    setTemplate((prev) => {
      const newTemplate = { ...prev, blocks: newOrder, updatedAt: new Date().toISOString() };
      addToHistory(newTemplate);
      return newTemplate;
    });
  }, [addToHistory]);

  // ==================== GLOBAL STYLES ====================
  const updateGlobalStyles = useCallback((updates: Partial<Template['globalStyles']>) => {
    setTemplate((prev) => {
      const newTemplate = {
        ...prev,
        globalStyles: { ...prev.globalStyles, ...updates },
        updatedAt: new Date().toISOString(),
      };
      addToHistory(newTemplate);
      return newTemplate;
    });
  }, [addToHistory]);

  // ==================== IMPORT/EXPORT ====================
  const handleExport = useCallback((format: 'json' | 'html') => {
    setIsLoading(true);
    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(template, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.name}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Generate HTML
        const html = generateHTML(template);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.name}.html`;
        link.click();
        URL.revokeObjectURL(url);
      }
      onExport?.(format, template);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  }, [template, onExport]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (validateTemplate(imported)) {
          setTemplate(imported);
          addToHistory(imported);
          onImport?.(imported);
        } else {
          setError('Invalid template format');
        }
      } catch (err) {
        setError('Failed to parse template file');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [addToHistory, onImport]);

  // ==================== DRAG AND DROP ====================
  const handleDragStart = (type: BlockType) => {
    setDraggedType(type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    if (draggedType) {
      addBlock(draggedType, index);
      setDraggedType(null);
    }
  };

  // ==================== HELPERS ====================
  const selectedBlock = template.blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* ==================== SIDEBAR: BLOCK PALETTE ==================== */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Blocks
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {[
              { type: 'header' as BlockType, icon: Type, label: 'Header', color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' },
              { type: 'text' as BlockType, icon: Type, label: 'Text', color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' },
              { type: 'image' as BlockType, icon: ImageIcon, label: 'Image', color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' },
              { type: 'button' as BlockType, icon: Square, label: 'Button', color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300' },
              { type: 'divider' as BlockType, icon: Minus, label: 'Divider', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
              { type: 'spacer' as BlockType, icon: GripVertical, label: 'Spacer', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' },
            ].map(({ type, icon: Icon, label, color }) => (
              <motion.button
                key={type}
                draggable
                onDragStart={() => handleDragStart(type)}
                onClick={() => addBlock(type)}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg ${color} cursor-move transition-all hover:shadow-md`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
                <Plus className="w-4 h-4 ml-auto" />
              </motion.button>
            ))}
          </div>

          {/* Variables Section */}
          {variables.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Variables
              </h3>
              <div className="space-y-2">
                {variables.map((variable) => (
                  <motion.button
                    key={variable}
                    whileHover={{ scale: 1.02 }}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      if (selectedBlock) {
                        updateBlock(selectedBlock.id, {
                          content: selectedBlock.content + `{{${variable}}}`,
                        });
                      }
                    }}
                  >
                    {'{{'}{variable}{'}}'}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Operations */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* ==================== MAIN CANVAS ==================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
              className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Template Name"
            />
            <span className="text-xs text-gray-400">
              {template.blocks.length} blocks
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-colors"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-colors"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </motion.button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              JSON
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('html')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              HTML
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave?.(template)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </motion.button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto">
            <motion.div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e)}
              style={{ backgroundColor: template.globalStyles.backgroundColor }}
              className="min-h-[600px] rounded-xl shadow-lg p-8 transition-all"
            >
              {template.blocks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <Layout className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Drag and drop blocks here<br />
                    or click blocks in the sidebar
                  </p>
                </motion.div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={template.blocks}
                  onReorder={reorderBlocks}
                  className="space-y-2"
                >
                  <AnimatePresence mode="popLayout">
                    {template.blocks.map((block, index) => (
                      <Reorder.Item
                        key={block.id}
                        value={block}
                        dragListener={false}
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setSelectedBlockId(block.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index + 1)}
                          className={`relative group cursor-pointer rounded-lg transition-all ${
                            selectedBlockId === block.id
                              ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
                              : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
                          }`}
                        >
                          {/* Block Actions */}
                          <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateBlock(block.id);
                              }}
                              className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md text-gray-600 dark:text-gray-300 hover:text-blue-600"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(block.id);
                              }}
                              className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md text-gray-600 dark:text-gray-300 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                            <motion.div
                              className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md text-gray-400 cursor-grab"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </motion.div>
                          </div>

                          {/* Block Content */}
                          <BlockRenderer
                            block={block}
                            isSelected={selectedBlockId === block.id}
                            onUpdate={(updates) => updateBlock(block.id, updates)}
                          />
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ==================== RIGHT PANEL: PROPERTIES ==================== */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Properties
              </h3>
              <button
                onClick={() => setSelectedBlockId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <BlockPropertiesPanel
                block={selectedBlock}
                onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
                onStyleUpdate={(updates) => updateBlockStyle(selectedBlock.id, updates)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== GLOBAL STYLES PANEL ==================== */}
      {!selectedBlock && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Global Styles
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={template.globalStyles.backgroundColor}
                  onChange={(e) => updateGlobalStyles({ backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={template.globalStyles.backgroundColor}
                  onChange={(e) => updateGlobalStyles({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Font Family
              </label>
              <select
                value={template.globalStyles.fontFamily}
                onChange={(e) => updateGlobalStyles({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Max Width
              </label>
              <select
                value={template.globalStyles.maxWidth}
                onChange={(e) => updateGlobalStyles({ maxWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="500px">500px (Narrow)</option>
                <option value="600px">600px (Standard)</option>
                <option value="700px">700px (Wide)</option>
                <option value="800px">800px (Extra Wide)</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==================== ERROR TOAST ==================== */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-red-100">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== LOADING OVERLAY ==================== */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== BLOCK RENDERER ====================
interface BlockRendererProps {
  block: TemplateBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<TemplateBlock>) => void;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, isSelected, onUpdate }) => {
  const { type, content, style, altText, linkUrl } = block;

  const commonStyle: React.CSSProperties = {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.textColor,
    backgroundColor: style.backgroundColor,
    padding: style.padding,
    margin: style.margin,
    textAlign: style.textAlign,
    borderRadius: style.borderRadius,
    width: style.width,
    height: style.height,
  };

  switch (type) {
    case 'header':
      return (
        <h1
          style={commonStyle}
          className="outline-none"
          contentEditable={isSelected}
          onBlur={(e) => onUpdate({ content: e.currentTarget.innerText })}
          suppressContentEditableWarning
        >
          {content}
        </h1>
      );

    case 'text':
      return (
        <p
          style={commonStyle}
          className="outline-none whitespace-pre-wrap"
          contentEditable={isSelected}
          onBlur={(e) => onUpdate({ content: e.currentTarget.innerText })}
          suppressContentEditableWarning
        >
          {content}
        </p>
      );

    case 'image':
      return (
        <div style={commonStyle} className="flex justify-center">
          <img
            src={content}
            alt={altText || 'Image'}
            className="max-w-full h-auto rounded"
            style={{ borderRadius: style.borderRadius }}
          />
        </div>
      );

    case 'button':
      const ButtonContent = (
        <button
          style={commonStyle}
          className="inline-block font-medium transition-transform hover:scale-105"
        >
          {content}
        </button>
      );
      return linkUrl ? (
        <a href={linkUrl} style={{ display: 'block', textAlign: style.textAlign || 'center', textDecoration: 'none' }}>
          {ButtonContent}
        </a>
      ) : (
        <div style={{ textAlign: style.textAlign || 'center' }}>{ButtonContent}</div>
      );

    case 'divider':
      return <hr style={{ ...commonStyle, border: 'none', borderTop: '1px solid #e5e7eb' }} />;

    case 'spacer':
      return <div style={{ height: style.height || '30px' }} />;

    default:
      return null;
  }
};

// ==================== PROPERTIES PANEL ====================
interface BlockPropertiesPanelProps {
  block: TemplateBlock;
  onUpdate: (updates: Partial<TemplateBlock>) => void;
  onStyleUpdate: (updates: Partial<BlockStyle>) => void;
}

const BlockPropertiesPanel: React.FC<BlockPropertiesPanelProps> = ({
  block,
  onUpdate,
  onStyleUpdate,
}) => {
  const { type, content, style, altText, linkUrl } = block;

  return (
    <div className="space-y-6">
      {/* Content */}
      {(type === 'header' || type === 'text' || type === 'button') && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
          />
        </div>
      )}

      {/* Image URL */}
      {type === 'image' && (
        <>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={altText || ''}
              onChange={(e) => onUpdate({ altText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </>
      )}

      {/* Link URL */}
      {type === 'button' && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Link URL
          </label>
          <input
            type="text"
            value={linkUrl || ''}
            onChange={(e) => onUpdate({ linkUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="https://..."
          />
        </div>
      )}

      {/* Spacer Height */}
      {type === 'spacer' && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Height
          </label>
          <input
            type="text"
            value={style.height || '30px'}
            onChange={(e) => onStyleUpdate({ height: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      )}

      {/* Font Size */}
      {(type === 'header' || type === 'text' || type === 'button') && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Font Size
          </label>
          <select
            value={style.fontSize}
            onChange={(e) => onStyleUpdate({ fontSize: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="36px">36px</option>
            <option value="48px">48px</option>
          </select>
        </div>
      )}

      {/* Text Align */}
      {(type === 'header' || type === 'text' || type === 'image' || type === 'button') && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Text Alignment
          </label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => onStyleUpdate({ textAlign: align })}
                className={`flex-1 py-2 rounded-lg border transition-colors ${
                  style.textAlign === align
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {type !== 'divider' && type !== 'spacer' && (
        <>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.textColor || '#000000'}
                onChange={(e) => onStyleUpdate({ textColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={style.textColor || ''}
                onChange={(e) => onStyleUpdate({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {type !== 'text' && type !== 'header' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.backgroundColor || '#ffffff'}
                  onChange={(e) => onStyleUpdate({ backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={style.backgroundColor || ''}
                  onChange={(e) => onStyleUpdate({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Padding */}
      {type !== 'spacer' && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Padding
          </label>
          <input
            type="text"
            value={style.padding || ''}
            onChange={(e) => onStyleUpdate({ padding: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="e.g., 20px or 10px 20px"
          />
        </div>
      )}

      {/* Border Radius */}
      {(type === 'button' || type === 'image') && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Border Radius
          </label>
          <input
            type="text"
            value={style.borderRadius || ''}
            onChange={(e) => onStyleUpdate({ borderRadius: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="e.g., 6px"
          />
        </div>
      )}
    </div>
  );
};

// ==================== UTILITIES ====================
function generateHTML(template: Template): string {
  const blocksHTML = template.blocks
    .map((block) => {
      const style = Object.entries(block.style)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join('; ');

      switch (block.type) {
        case 'header':
          return `<h1 style="${style}">${block.content}</h1>`;
        case 'text':
          return `<p style="${style}">${block.content}</p>`;
        case 'image':
          return `<div style="${style}; text-align: center;"><img src="${block.content}" alt="${block.altText || ''}" style="max-width: 100%; height: auto;" /></div>`;
        case 'button':
          return `<div style="${style}; text-align: center;"><a href="${block.linkUrl || '#'}" style="${style}; text-decoration: none; display: inline-block;">${block.content}</a></div>`;
        case 'divider':
          return `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />`;
        case 'spacer':
          return `<div style="height: ${block.style.height || '30px'};"></div>`;
        default:
          return '';
      }
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: ${template.globalStyles.maxWidth}; background-color: ${template.globalStyles.backgroundColor}; font-family: ${template.globalStyles.fontFamily}; margin: 0 auto;">
          ${blocksHTML}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function validateTemplate(data: unknown): data is Template {
  if (!data || typeof data !== 'object') return false;
  const t = data as Partial<Template>;
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    Array.isArray(t.blocks) &&
    t.blocks.every(
      (b) =>
        typeof b.id === 'string' &&
        ['header', 'text', 'image', 'button', 'divider', 'spacer'].includes(b.type) &&
        typeof b.content === 'string' &&
        typeof b.style === 'object'
    ) &&
    typeof t.globalStyles === 'object'
  );
}

export default VisualTemplateEditor;
