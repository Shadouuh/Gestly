import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import { Play, BookOpen, ChevronRight, Video } from 'lucide-react';

const Guide = () => {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState(null);

  const tutorials = [
    {
      id: 'createProduct',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1', // Placeholder video (Rick Roll mainly because it's safe and always works for demo)
      color: 'blue'
    },
    {
      id: 'makeSale',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
      color: 'indigo'
    },
    {
      id: 'addStock',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
      color: 'fuchsia'
    }
  ];

  const handleVideoClick = (url) => {
    setActiveVideo(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">
              {t('guide.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('guide.subtitle')}
            </p>
          </div>

          {/* Random Video Section */}
          <div className="mb-24">
            <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl shadow-slate-900/20 group cursor-pointer" onClick={() => handleVideoClick('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1')}>
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Featured Video" 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Play size={40} className="ml-1 fill-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2 font-display">{t('guide.randomVideo')}</h2>
                <span className="text-slate-300 font-medium">{t('guide.watchNow')}</span>
              </div>
            </div>
          </div>

          {/* Tutorials List */}
          <div className="grid gap-8">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-${tutorial.color}-100 text-${tutorial.color}-700 uppercase tracking-wide`}>
                      <BookOpen size={16} />
                      Tutorial
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 font-display">
                      {t(`guide.tutorials.${tutorial.id}.title`)}
                    </h3>
                    
                    <div className="space-y-4">
                      {t(`guide.tutorials.${tutorial.id}.steps`, { returnObjects: true }).map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className={`w-8 h-8 rounded-full bg-white border-2 border-${tutorial.color}-100 text-${tutorial.color}-600 flex items-center justify-center font-bold text-sm shrink-0`}>
                            {index + 1}
                          </div>
                          <p className="text-slate-600 pt-1 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Thumbnail / Action */}
                  <div className="w-full md:w-1/3">
                    <button 
                      onClick={() => handleVideoClick(tutorial.videoUrl)}
                      className="w-full aspect-video bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <Video size={32} />
                      </div>
                      <span className="font-bold">Ver demostración</span>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      
      {/* Video Modal Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setActiveVideo(null)}>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative">
            <iframe 
              src={activeVideo} 
              title="Tutorial Video"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Guide;
