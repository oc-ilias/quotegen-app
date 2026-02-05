import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Minimize2,
  Download,
  Eye,
  EyeOff,
  Code,
} from 'lucide-react';
import type { Template, TemplateBlock, BlockStyle } from './VisualTemplateEditor';

// ==================== TYPES ====================
type DeviceType = 'desktop' | 'mobile' | 'tablet';
type ThemeType = 'light' | 'dark' | 'auto';

interface TemplatePreviewProps {
  template: Template;
  onRefresh?: () => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  showCodeToggle?: boolean;
}

interface PreviewBlock {
  id: string;
  type: string;
  content: string;
  style: Record<string, string>;
  altText?: string;
  linkUrl?: string;
}

// ==================== COMPONENT ====================
export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onRefresh,
  onFullscreenToggle,
  showCodeToggle = true,
}) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);

  // ==================== COMPUTED VALUES ====================
  const processedContent = useMemo(() => {
    return template.blocks.map((block) => ({
      ...block,
      content: processVariables(block.content),
    }));
  }, [template.blocks]);

  const generatedHTML = useMemo(() => {
    return generatePreviewHTML(template, processedContent, theme);
  }, [template, processedContent, theme]);

  const deviceWidths: Record<DeviceType, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const isDarkMode = theme === 'dark' || (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // ==================== HANDLERS ====================
  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(generatedHTML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name || 'template'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onRefresh?.();
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    onFullscreenToggle?.(newState);
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.25, Math.min(2, prev + delta)));
  };

  // ==================== RENDER ====================
  return (
    <div
      className={`flex flex-col bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full rounded-xl overflow-hidden'
      }`}
    >
      {/* ==================== TOOLBAR ==================== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        {/* Device Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <DeviceButton
            device="desktop"
            currentDevice={device}
            icon={Monitor}
            onClick={() => setDevice('desktop')}
            label="Desktop"
          />
          <DeviceButton
            device="tablet"
            currentDevice={device}
            icon={Monitor}
            onClick={() => setDevice('tablet')}
            label="Tablet"
            iconClass="w-4 h-4"
          />
          <DeviceButton
            device="mobile"
            currentDevice={device}
            icon={Smartphone}
            onClick={() => setDevice('mobile')}
            label="Mobile"
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-0.1)}
            className="px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            -
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            +
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <ThemeButton
              theme="light"
              currentTheme={theme}
              icon={Sun}
              onClick={() => setTheme('light')}
              label="Light"
            />
            <ThemeButton
              theme="dark"
              currentTheme={theme}
              icon={Moon}
              onClick={() => setTheme('dark')}
              label="Dark"
            />
            <ThemeButton
              theme="auto"
              currentTheme={theme}
              onClick={() => setTheme('auto')}
              label="Auto"
            />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />

          {/* Actions */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyHTML}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy HTML"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadHTML}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Download HTML"
          >
            <Download className="w-5 h-5" />
          </motion.button>

          {showCodeToggle && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCode(!showCode)}
              className={`p-2 rounded-lg transition-colors ${
                showCode
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle Code View"
            >
              <Code className="w-5 h-5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </motion.button>
        </div>
      </motion.div>

      {/* ==================== PREVIEW AREA ==================== */}
      <div className="flex-1 overflow-auto p-8 bg-gray-100 dark:bg-gray-900 relative">
        <AnimatePresence mode="wait">
          {showCode ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <CodeView html={generatedHTML} />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center items-start min-h-full"
            >
              {/* Device Frame */}
              <motion.div
                animate={{
                  width: deviceWidths[device],
                  scale,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
                style={{
                  transformOrigin: 'top center',
                }}
              >
                {/* Device Header (for mobile/tablet) */}
                {device !== 'desktop' && (
                  <div className="bg-gray-900 text-white p-2 flex items-center justify-center">
                    <div className="w-16 h-1 bg-gray-700 rounded-full" />
                  </div>
                )}

                {/* Preview Content */}
                <div
                  className={`${isDarkMode ? 'dark' : ''}`}
                  style={{
                    backgroundColor: template.globalStyles.backgroundColor,
                    fontFamily: template.globalStyles.fontFamily,
                    maxWidth: template.globalStyles.maxWidth,
                    margin: '0 auto',
                    minHeight: '500px',
                  }}
                >
                  {processedContent.map((block, index) => (
                    <PreviewBlockRenderer
                      key={block.id}
                      block={block}
                      index={index}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>

                {/* Device Footer (for mobile/tablet) */}
                {device !== 'desktop' && (
                  <div className="bg-gray-900 text-white p-3 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-700 rounded-full" />
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== INFO BAR ==================== */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <span>{template.blocks.length} blocks</span>
          <span>•</span>
          <span>{formatBytes(generatedHTML.length)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>Live Preview</span>
        </div>
      </div>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================
interface DeviceButtonProps {
  device: DeviceType;
  currentDevice: DeviceType;
  icon?: React.ElementType;
  onClick: () => void;
  label: string;
  iconClass?: string;
}

const DeviceButton: React.FC<DeviceButtonProps> = ({
  device,
  currentDevice,
  icon: Icon,
  onClick,
  label,
  iconClass = 'w-5 h-5',
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      currentDevice === device
        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
    title={label}
  >
    {Icon && <Icon className={iconClass} />}
    <span className="hidden sm:inline">{label}</span>
  </motion.button>
);

interface ThemeButtonProps {
  theme: ThemeType;
  currentTheme: ThemeType;
  icon?: React.ElementType;
  onClick: () => void;
  label: string;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  theme,
  currentTheme,
  icon: Icon,
  onClick,
  label,
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      currentTheme === theme
        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
    title={label}
  >
    {Icon && <Icon className="w-4 h-4" />}
    <span className="hidden sm:inline">{label}</span>
  </motion.button>
);

interface PreviewBlockRendererProps {
  block: PreviewBlock;
  index: number;
  isDarkMode: boolean;
}

const PreviewBlockRenderer: React.FC<PreviewBlockRendererProps> = ({
  block,
  index,
  isDarkMode,
}) => {
  const { type, content, style, altText, linkUrl } = block;

  const baseStyle: React.CSSProperties = {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.textColor,
    backgroundColor: style.backgroundColor,
    padding: style.padding,
    margin: style.margin,
    textAlign: style.textAlign as any,
    borderRadius: style.borderRadius,
    width: style.width,
    height: style.height,
    transition: 'all 0.2s ease',
  };

  // Apply dark mode adjustments
  if (isDarkMode) {
    if (type === 'text' || type === 'header') {
      baseStyle.color = style.textColor || '#e5e7eb';
    }
    if (type === 'divider') {
      baseStyle.borderColor = '#374151';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:ring-2 hover:ring-blue-500/30 transition-all"
    >
      {type === 'header' && (
        <h1 style={baseStyle} className="m-0">
          {content}
        </h1>
      )}

      {type === 'text' && (
        <p style={baseStyle} className="m-0 whitespace-pre-wrap">
          {content}
        </p>
      )}

      {type === 'image' && (
        <div style={{ ...baseStyle, textAlign: 'center' as any }}>
          <img
            src={content}
            alt={altText || 'Preview image'}
            className="max-w-full h-auto"
            style={{ borderRadius: style.borderRadius }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x300?text=Image+Not+Found';
            }}
          />
        </div>
      )}

      {type === 'button' && (
        <div style={{ textAlign: (style.textAlign as any) || 'center' }}>
          {linkUrl ? (
            <a
              href={linkUrl}
              style={{
                ...baseStyle,
                display: 'inline-block',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className="transition-transform hover:scale-105"
            >
              {content}
            </a>
          ) : (
            <button
              style={baseStyle}
              className="font-medium transition-transform hover:scale-105"
            >
              {content}
            </button>
          )}
        </div>
      )}

      {type === 'divider' && (
        <hr
          style={{
            ...baseStyle,
            border: 'none',
            borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          }}
        />
      )}

      {type === 'spacer' && (
        <div style={{ height: style.height || '30px' }} />
      )}
    </motion.div>
  );
};

interface CodeViewProps {
  html: string;
}

const CodeView: React.FC<CodeViewProps> = ({ html }) => {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);

  const lines = html.split('\n');
  const highlightedHTML = highlightHTML(html);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Code Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400">HTML Source</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`text-xs px-2 py-1 rounded ${
              showLineNumbers ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Line Numbers
          </button>
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`text-xs px-2 py-1 rounded ${
              wrapLines ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            Wrap
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm font-mono leading-relaxed">
          <code
            className="block"
            style={{ whiteSpace: wrapLines ? 'pre-wrap' : 'pre' }}
            dangerouslySetInnerHTML={{ __html: highlightedHTML }}
          />
        </pre>
      </div>
    </div>
  );
};

// ==================== UTILITIES ====================
function processVariables(content: string): string {
  const sampleData: Record<string, string> = {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerCompany: 'Acme Inc.',
    quoteNumber: 'QT-2024-001',
    quoteDate: new Date().toLocaleDateString(),
    quoteExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    quoteTotal: '$1,234.56',
    productName: 'Premium Widget',
    productSku: 'PW-001',
    storeName: 'My Store',
    storeUrl: 'https://example.com',
    supportEmail: 'support@example.com',
  };

  return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return sampleData[variable] || match;
  });
}

function generatePreviewHTML(
  template: Template,
  blocks: PreviewBlock[],
  theme: ThemeType
): string {
  const isDarkMode = theme === 'dark';
  
  const blocksHTML = blocks
    .map((block) => {
      const style = Object.entries(block.style)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join('; ');

      switch (block.type) {
        case 'header':
          return `    <h1 style="${style}">${block.content}</h1>`;
        case 'text':
          return `    <p style="${style}">${block.content}</p>`;
        case 'image':
          return `    <div style="${style}; text-align: center;">
      <img src="${block.content}" alt="${block.altText || ''}" style="max-width: 100%; height: auto;" />
    </div>`;
        case 'button':
          return `    <div style="${style}; text-align: center;">
      <a href="${block.linkUrl || '#'}" style="${style}; text-decoration: none; display: inline-block;">${block.content}</a>
    </div>`;
        case 'divider':
          return `    <hr style="border: none; border-top: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}; margin: 20px 0;" />`;
        case 'spacer':
          return `    <div style="height: ${block.style.height || '30px'};"></div>`;
        default:
          return '';
      }
    })
    .join('\n');

  return `<!DOCTYPE html>
<html${isDarkMode ? ' class="dark"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .dark body { background-color: #111827; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px; background-color: ${isDarkMode ? '#111827' : '#f3f4f6'};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: ${template.globalStyles.maxWidth}; background-color: ${isDarkMode ? '#1f2937' : template.globalStyles.backgroundColor}; font-family: ${template.globalStyles.fontFamily}; margin: 0 auto; color: ${isDarkMode ? '#e5e7eb' : 'inherit'};">
${blocksHTML}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function highlightHTML(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(&lt;\/?[\w-]+)/g, '<span class="text-pink-400">$1</span>')
    .replace(/(\s[\w-]+)=/g, '<span class="text-cyan-400">$1</span>=')
    .replace(/"([^"]*)"/g, '"<span class="text-green-400">$1</span>"')
    .replace(/(&lt;!--.*?--&gt;)/g, '<span class="text-gray-500">$1</span>');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default TemplatePreview;
