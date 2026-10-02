import React, { useState } from 'react';
import { Github, ExternalLink, Copy, Check, Terminal, Shield, Sparkles } from 'lucide-react';

interface GitHubVercelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubVercelModal: React.FC<GitHubVercelModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `# 1. Initialize git and commit your project
git init
git add .
git commit -m "feat: Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi portal"

# 2. Add your GitHub remote and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/adasu-ustc-makurdi-portal.git
git push -u origin main`;

  const vercelBuildInstructions = `# Framework Preset: Vite
# Root Directory: ./
# Install Command: npm install --legacy-peer-deps
# Build Command: npm run build
# Output Directory: dist

# Note: vercel.json and .npmrc are already pre-configured in the project root!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                GitHub & Vercel Deployment Instructions
              </h3>
              <p className="text-xs text-stone-500">
                Steps to push to your repository and deploy live to Vercel
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 font-bold p-1">
            ✕
          </button>
        </div>

        <div className="space-y-5 mt-4 text-xs text-stone-700">
          {/* Step 1: Push to GitHub */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <strong className="text-stone-900 text-xs">Push Code to GitHub</strong>
              </div>
              <button
                onClick={() => copyText(gitCommands, 'git')}
                className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 font-medium"
              >
                {copiedSection === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'git' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-900 text-stone-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>

          {/* Step 2: Deploy on Vercel */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <strong className="text-stone-900 text-xs">Deploy on Vercel (vercel.com/new)</strong>
              </div>
              <button
                onClick={() => copyText(vercelBuildInstructions, 'vercel')}
                className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 font-medium"
              >
                {copiedSection === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'vercel' ? 'Copied' : 'Copy Specs'}</span>
              </button>
            </div>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              1. First, make sure you click <strong>Save / Sync to GitHub</strong> in AI Studio so your GitHub repository has the latest <code>package.json</code>, <code>.npmrc</code>, and <code>vercel.json</code>.<br />
              2. On <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">vercel.com/new</a>, open <strong>Build and Output Settings</strong>, toggle <strong>Install Command</strong> Override ON, and set it to: <code>npm install --legacy-peer-deps</code>.<br />
              3. Click <strong>Deploy</strong> — the Firestore client configuration is bundled so real-time sync works out of the box!
            </p>
          </div>

          {/* Step 3: Real-Time Verification Test */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <strong className="text-emerald-950 text-xs">Real-Time Demonstration Test</strong>
            </div>
            <p className="text-emerald-900 text-[11px] leading-relaxed">
              When demonstrating to evaluators or users, open the deployed Vercel link in two separate browser windows (or on mobile and desktop).
              When you add a student, update a staff profile, or publish a notice on one terminal, the other terminal immediately updates in real time without refreshing.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
