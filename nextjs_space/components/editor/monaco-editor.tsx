
'use client'

import dynamic from 'next/dynamic'

const Editor = dynamic(
  () => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading Editor...</p>
        </div>
      </div>
    )
  }
)

interface MonacoEditorWrapperProps {
  value: string
  language: string
  onChange: (value: string) => void
  theme?: string
  options?: any
}

export function MonacoEditor({ 
  value, 
  language, 
  onChange, 
  theme = 'vs-dark',
  options = {}
}: MonacoEditorWrapperProps) {
  const handleChange = (val: string | undefined) => {
    onChange(val || '')
  }

  return (
    <Editor
      height="100%"
      language={language}
      theme={theme}
      value={value}
      onChange={handleChange}
      options={{
        ...options,
        automaticLayout: true,
      }}
    />
  )
}
