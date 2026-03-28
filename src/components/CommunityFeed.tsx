import React, { useState, useEffect } from 'react';
import { db, Project } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Heart, User, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function CommunityFeed() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (id: string, currentLikes: number) => {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, { likes: currentLikes + 1 });
  };

  if (loading) return <div className="flex justify-center p-12">Loading community projects...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {projects.map((project, idx) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="h-40 bg-slate-100 flex items-center justify-center border-b">
            <div className="text-slate-400 flex flex-col items-center">
              <ExternalLink size={32} />
              <span className="text-xs mt-2 font-mono">Circuit Preview</span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{project.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">{project.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <img src={project.authorPhoto} alt={project.authorName} className="w-6 h-6 rounded-full" />
                <span className="text-xs font-medium text-slate-700">{project.authorName}</span>
              </div>
              <button 
                onClick={() => handleLike(project.id!, project.likes)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors"
              >
                <Heart size={16} fill={project.likes > 0 ? "currentColor" : "none"} />
                <span className="text-xs font-bold">{project.likes}</span>
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
