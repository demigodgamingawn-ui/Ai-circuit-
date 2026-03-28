import React, { useState, useEffect } from 'react';
import { auth, signIn, logout, db, Project } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateProject, GeneratedProject } from './lib/gemini';
import CircuitEditor from './components/CircuitEditor';
import CommunityFeed from './components/CommunityFeed';
import { 
  Cpu, 
  Layout, 
  Users, 
  Sparkles, 
  Code, 
  Terminal, 
  ChevronRight, 
  Github, 
  LogOut, 
  Smartphone,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'editor' | 'community'>('home');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [activeTab, setActiveTab] = useState<'circuit' | 'code'>('circuit');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateProject(prompt);
      setGeneratedProject(result);
      setView('editor');
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (circuit: any) => {
    if (!user || !generatedProject) return;
    try {
      await addDoc(collection(db, 'projects'), {
        title: generatedProject.title,
        description: generatedProject.description,
        circuit: circuit,
        code: generatedProject.arduinoCode,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        createdAt: serverTimestamp(),
        likes: 0
      });
      alert("Project shared with the community!");
      setView('community');
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <Cpu size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">CircuitAI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <button onClick={() => setView('home')} className={view === 'home' ? 'text-slate-900' : 'hover:text-slate-900'}>Builder</button>
            <button onClick={() => setView('community')} className={view === 'community' ? 'text-slate-900' : 'hover:text-slate-900'}>Community</button>
            <button className="hover:text-slate-900">PCB Export</button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.photoURL!} alt="Profile" className="w-8 h-8 rounded-full border" />
                <button onClick={logout} className="p-2 text-slate-400 hover:text-slate-900">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={signIn} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 py-20 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 mb-8 uppercase tracking-widest">
                <Sparkles size={14} className="text-amber-500" /> AI-Powered Hardware Design
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-none">
                Build the future <br /> 
                <span className="text-slate-400 italic font-serif">wire by wire.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
                Describe your project idea, and our AI will design the circuit, write the code, and help you share it with the world.
              </p>

              <div className="max-w-2xl mx-auto relative">
                <input
                  type="text"
                  placeholder="e.g., A smart plant watering system with Arduino..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg focus:outline-none focus:border-slate-900 transition-all pr-32"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt}
                  className="absolute right-3 top-3 bottom-3 px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? "Designing..." : "Generate"} <ChevronRight size={18} />
                </button>
              </div>

              <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-8 border rounded-3xl hover:border-slate-900 transition-colors group">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Layout size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Visual Editor</h3>
                  <p className="text-slate-500">Drag and drop components to build your custom circuit with real-time AI suggestions.</p>
                </div>
                <div className="p-8 border rounded-3xl hover:border-slate-900 transition-colors group">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Code size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Auto-Code</h3>
                  <p className="text-slate-500">Get production-ready Arduino code generated instantly based on your circuit design.</p>
                </div>
                <div className="p-8 border rounded-3xl hover:border-slate-900 transition-colors group">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Community</h3>
                  <p className="text-slate-500">Share your projects, learn from others, and export designs to PCB or Gerber files.</p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'editor' && generatedProject && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{generatedProject.title}</h2>
                  <p className="text-slate-500">{generatedProject.description}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab('circuit')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'circuit' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Circuit
                  </button>
                  <button 
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'code' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Code
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  {activeTab === 'circuit' ? (
                    <CircuitEditor onSave={handleShare} />
                  ) : (
                    <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-sm overflow-auto max-h-[600px]">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2">
                          <Terminal size={16} />
                          <span>arduino_project.ino</span>
                        </div>
                        <button className="text-xs hover:text-white">Copy Code</button>
                      </div>
                      <pre><code>{generatedProject.arduinoCode}</code></pre>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-amber-500" /> Bill of Materials
                    </h4>
                    <ul className="space-y-2">
                      {generatedProject.components.map((comp, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                          {comp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <h4 className="font-bold mb-2">Ready to build?</h4>
                    <p className="text-xs text-slate-400 mb-4">Export your design to PCB or download the Gerber files for manufacturing.</p>
                    <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors mb-2">
                      Export to PCB
                    </button>
                    <button className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
                      Download Gerber
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="px-6 py-12 text-center border-b">
                <h2 className="text-4xl font-bold tracking-tight mb-4">Community Projects</h2>
                <p className="text-slate-500">Explore and remix projects built by students and engineers worldwide.</p>
              </div>
              <CommunityFeed />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile App PWA Banner */}
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-80 bg-white border shadow-2xl rounded-2xl p-4 flex items-center gap-4 z-50">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
          <Smartphone size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold">CircuitAI Mobile</h4>
          <p className="text-xs text-slate-500">Install as PWA for mobile access</p>
        </div>
        <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold">
          Install
        </button>
      </div>
    </div>
  );
}
