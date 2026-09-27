'use client';

import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, Key } from 'lucide-react';

interface ApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiModal: React.FC<ApiModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python'>('curl');

  if (!isOpen) return null;

  const apiKey = 'px_live_9f823a7b1c4e5d609823471a';

  const codeSnippets = {
    curl: `curl -X POST https://pixelforge.app/api/v1/compress \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "image=@/path/to/photo.jpg" \\
  -F "target_size=1mb" \\
  -F "format=webp"`,
    node: `const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('image', fs.createReadStream('./document.png'));
form.append('target_size', '500kb');

axios.post('https://pixelforge.app/api/v1/combine-cnic', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer ${apiKey}'
  }
}).then(res => console.log(res.data));`,
    python: `import requests

url = "https://pixelforge.app/api/v1/compress"
headers = {"Authorization": "Bearer ${apiKey}"}
files = {"image": open("passport.jpg", "rb")}
data = {"target_size": "1mb", "format": "webp"}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Developer REST API Playground</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Integrate automated image compression, CNIC combining & format conversion into your SaaS or App</p>
          </div>
        </div>

        {/* API Key Box */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-amber-500" /> API Secret Key
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">Active</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>{apiKey}</span>
            <span className="text-[10px] text-slate-400">Click code below to copy endpoint</span>
          </div>
        </div>

        {/* Endpoints Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="font-bold text-emerald-600">POST</span> /api/v1/compress
          </div>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="font-bold text-emerald-600">POST</span> /api/v1/combine-cnic
          </div>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="font-bold text-emerald-600">POST</span> /api/v1/resize
          </div>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="font-bold text-emerald-600">POST</span> /api/v1/convert
          </div>
        </div>

        {/* Code Snippet Tabs */}
        <div className="mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex space-x-2">
              {(['curl', 'node', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                    activeTab === lang
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 shadow-inner">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
